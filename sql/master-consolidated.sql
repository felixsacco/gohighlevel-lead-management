-- =============================================================================
-- MyApproved — Master Consolidated Idempotent Schema Provisioning
-- =============================================================================
-- Drop this file into a FRESH UK-hosted Supabase SQL editor and run it whole.
-- It re-authors the missing base tables (phases 1–3) that were lost when the
-- original Supabase instance was deleted, and folds in every column/constraint
-- from the surviving phases 4–12 migrations plus the new direct-Stripe
-- `transactions` ledger.
--
-- Idempotency: every statement uses IF NOT EXISTS / IF EXISTS guards, so the
-- file is safe to run repeatedly. Re-running produces no errors and no dupes.
--
-- Canonical money unit is PENCE. Lead fee = £4.99 = 499. Unlimited/mo = £1,000 = 100000.
--
-- Order of operations:
--   1. Extensions (pgcrypto for gen_random_uuid(), cube + earthdistance for haversine)
--   2. Base tables (clients, tradespeople, documents, jobs, leads, lead_purchases,
--      job_applications, chat_rooms, chat_messages, notification_logs,
--      scheduled_notifications, support_tickets, admin_activity_log, postcode_cache,
--      places_cache, outreach_prospects, transactions)
--   3. Phase 4–12 column folds + indexes + constraints (as ADDs on those tables)
--   4. job_reference_seq + trigger (MA-######)
--   5. RLS enablement + policies
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;      -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS cube;           -- earthdistance dependency
CREATE EXTENSION IF NOT EXISTS earthdistance;  -- haversine / <@> operator

-- =============================================================================
-- 2. BASE TABLES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- clients — client (homeowner) account. Anonymous job submissions upsert on a
-- unique email with a sentinel password_hash ('ANONYMOUS_NOT_SET'). Role tables
-- are separate from Supabase Auth. `auth.uid()` is NOT used for ownership.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email            text NOT NULL UNIQUE,
  first_name       text,
  last_name        text,
  phone            text,
  postcode         text,
  password_hash    text,                              -- 'ANONYMOUS_NOT_SET' sentinel for walk-in clients
  profile_photo_url text,                            -- phase4
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- tradespeople — tradesperson account + full profile. Single flat table carries
-- verification/certification/subscription columns (phases 5/6/8/11).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tradespeople (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email                 text NOT NULL UNIQUE,
  password_hash         text,                          -- NOTE: raw password in current code (known auth weakness; migrate to Supabase Auth later)
  first_name            text,
  last_name             text,
  phone                 text,
  trade                 text,
  city                  text,
  postcode              text,
  years_experience      integer,
  -- status / approval flags
  is_verified           boolean NOT NULL DEFAULT false,
  is_active             boolean NOT NULL DEFAULT true,
  is_approved           boolean NOT NULL DEFAULT false,
  verification_status   text NOT NULL DEFAULT 'pending_documents',      -- phase5: pending_documents → … → approved/rejected
  -- certification gate (phase8)
  certification_verified boolean NOT NULL DEFAULT false,                -- REQUIRED by phase8 partial index; never ADDed by any migration
  certification_expires_at timestamptz,                                 -- phase8
  -- subscription (phase6)
  subscription_plan     text NOT NULL DEFAULT 'pay_per_lead'
      CONSTRAINT tradespeople_subscription_plan_check
      CHECK (subscription_plan IN ('pay_per_lead', 'unlimited_monthly')),
  subscription_status   text NOT NULL DEFAULT 'pending'
      CONSTRAINT tradespeople_subscription_status_check
      CHECK (subscription_status IN ('pending', 'active', 'past_due', 'cancelled')),
  subscription_started_at timestamptz,
  subscription_renews_at  timestamptz,
  stripe_customer_id    text,
  stripe_subscription_id text,
  stripe_subscription_current_period_end timestamptz,
  pay_per_lead_price_pence  integer NOT NULL DEFAULT 499,               -- £4.99
  unlimited_monthly_price_pence integer NOT NULL DEFAULT 100000,        -- £1,000
  -- geocoding (phase11)
  latitude              numeric,
  longitude             numeric,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- documents — tradesperson ID / insurance / qualification / trade-card files.
-- FK column is `trade_id` (per trades/register route, NOT `t_id`).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id      uuid NOT NULL REFERENCES tradespeople(id) ON DELETE CASCADE,
  doc_type      text NOT NULL CHECK (doc_type IN ('id', 'insurance', 'qualification', 'trade_card')),
  file_path     text NOT NULL,
  upload_date   timestamptz NOT NULL DEFAULT now(),
  expiry_date   date,
  doc_number    text,
  status        text NOT NULL DEFAULT 'pending',
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_trade_id ON documents(trade_id);

-- ---------------------------------------------------------------------------
-- jobs — core job record. Note: `job_description` is the DB column name even
-- though the public submit route reads a `description` field and maps it.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jobs (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code        text UNIQUE,                                  -- MA-###### (phase5 seq + trigger)
  client_id             uuid REFERENCES clients(id) ON DELETE SET NULL,
  trade                 text NOT NULL,
  job_description       text,
  postcode              text,
  budget                numeric,
  budget_type           text NOT NULL DEFAULT 'fixed' CHECK (budget_type IN ('fixed', 'range', 'estimate')),
  preferred_date        text,
  preferred_time        text NOT NULL DEFAULT 'any',
  urgency               text,
  images                jsonb NOT NULL DEFAULT '[]'::jsonb,
  status                text NOT NULL DEFAULT 'pending'
      CONSTRAINT jobs_status_check
      CHECK (status IN ('pending', 'approved', 'open', 'in_progress', 'completed', 'cancelled', 'rejected')),
  is_approved           boolean NOT NULL DEFAULT false,
  application_status    text NOT NULL DEFAULT 'open'
      CONSTRAINT jobs_application_status_check
      CHECK (application_status IN ('open', 'in_progress', 'completed', 'cancelled')),
  approved_at           timestamptz,
  -- assignment columns (copied from winning job_applications row at assignment time)
  assigned_tradesperson_id uuid REFERENCES tradespeople(id) ON DELETE SET NULL,
  quotation_amount      numeric,
  quotation_notes       text,
  applied_at            timestamptz,
  assigned_by           text,
  assigned_at           timestamptz,
  -- geocoding (phase11)
  latitude              numeric,
  longitude             numeric,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_trade ON jobs(trade);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_application_status ON jobs(application_status);
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_tradesperson ON jobs(assigned_tradesperson_id);

-- ---------------------------------------------------------------------------
-- leads — one open lead per job (phase12). Atomic claim via
-- `UPDATE ... WHERE status='open' AND claimed_by IS NULL` returning row.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id           uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status           text NOT NULL DEFAULT 'open'
      CONSTRAINT leads_status_check
      CHECK (status IN ('open', 'claimed', 'paid', 'expired', 'cancelled')),
  claimed_by       uuid REFERENCES tradespeople(id) ON DELETE SET NULL,
  claimed_at       timestamptz,
  claim_expires_at timestamptz,
  paid_at          timestamptz,
  price_pence      integer NOT NULL DEFAULT 499,                        -- £4.99
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_leads_job ON leads(job_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_claimed_by ON leads(claimed_by);

-- ---------------------------------------------------------------------------
-- lead_purchases — pay-per-lead offer/purchase rows (phase7). Already carries
-- stripe_checkout_session_id + stripe_payment_intent_id for direct Stripe.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lead_purchases (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id                      uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  tradesperson_id             uuid NOT NULL REFERENCES tradespeople(id) ON DELETE CASCADE,
  lead_price_pence            integer NOT NULL DEFAULT 499,            -- £4.99
  status                      text NOT NULL DEFAULT 'offered'
      CONSTRAINT lead_purchases_status_check
      CHECK (status IN ('offered', 'paid', 'refunded', 'expired')),
  stripe_checkout_session_id  text,
  stripe_payment_intent_id    text,
  offered_at                  timestamptz NOT NULL DEFAULT now(),
  paid_at                     timestamptz,
  refunded_at                 timestamptz,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_lead_purchases_job_tradesperson
  ON lead_purchases(job_id, tradesperson_id);
CREATE INDEX IF NOT EXISTS idx_lead_purchases_stripe_checkout
  ON lead_purchases(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_lead_purchases_stripe_payment_intent
  ON lead_purchases(stripe_payment_intent_id);

-- ---------------------------------------------------------------------------
-- job_applications — tradesperson quotes on a job. Lowest quote wins on
-- auto-assign (ORDER BY quotation_amount ASC NULLS LAST).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS job_applications (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id            uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  tradesperson_id   uuid NOT NULL REFERENCES tradespeople(id) ON DELETE CASCADE,
  quotation_amount  numeric,
  quotation_notes   text,
  applied_at        timestamptz NOT NULL DEFAULT now(),
  status            text NOT NULL DEFAULT 'pending'
      CONSTRAINT job_applications_status_check
      CHECK (status IN ('pending', 'accepted', 'rejected')),
  accepted_at       timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_tradesperson_id ON job_applications(tradesperson_id);

-- ---------------------------------------------------------------------------
-- chat_rooms — one per job assignment (client ↔ tradesperson). Unique on
-- (job_id) tolerated by assignment code (handles 23505 as no-op).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_rooms (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  client_id       uuid REFERENCES clients(id) ON DELETE SET NULL,
  tradesperson_id uuid REFERENCES tradespeople(id) ON DELETE SET NULL,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_chat_rooms_job ON chat_rooms(job_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_client ON chat_rooms(client_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_tradesperson ON chat_rooms(tradesperson_id);

-- ---------------------------------------------------------------------------
-- chat_messages — messages in a room. (Audit report notes an earlier 'chats'
-- name; current code uses `chat_messages`.)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_messages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_room_id uuid NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id    uuid NOT NULL,
  sender_type  text NOT NULL CHECK (sender_type IN ('client', 'tradesperson', 'admin')),
  message_text text NOT NULL,
  read_at      timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(chat_room_id);

-- ---------------------------------------------------------------------------
-- notification_logs — outbound notification records. `idempotency_key` unique
-- prevents duplicate sends.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification_logs (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key    text UNIQUE,
  event_type         text,
  channel            text CHECK (channel IN ('email', 'sms', 'push')),
  recipient_id       text,
  recipient_contact  text,
  status             text NOT NULL DEFAULT 'sent'
      CONSTRAINT notification_logs_status_check
      CHECK (status IN ('sent', 'failed', 'skipped')),
  provider_message_id text,
  error_message      text,
  payload            jsonb,
  read_at            timestamptz,                        -- phase4
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_recipient_created
  ON notification_logs(recipient_id, created_at);

-- ---------------------------------------------------------------------------
-- scheduled_notifications — deferred notification queue (upserted via dedupe_key).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type       text NOT NULL,
  recipient_id     text,
  recipient_email  text,
  recipient_phone  text,
  payload          jsonb,
  scheduled_for    timestamptz NOT NULL,
  status           text NOT NULL DEFAULT 'pending'
      CONSTRAINT scheduled_notifications_status_check
      CHECK (status IN ('pending', 'sent', 'failed')),
  error_message    text,
  sent_at          timestamptz,
  dedupe_key       text UNIQUE,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_scheduled_for
  ON scheduled_notifications(scheduled_for)
  WHERE status = 'pending';

-- ---------------------------------------------------------------------------
-- support_tickets — admin support / dispute tickets.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS support_tickets (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid,
  user_type           text CHECK (user_type IN ('client', 'tradesperson')),
  chat_room_id        uuid REFERENCES chat_rooms(id) ON DELETE SET NULL,
  job_id              uuid REFERENCES jobs(id) ON DELETE SET NULL,      -- phase4
  original_message    text,
  ai_response         text,
  category            text NOT NULL DEFAULT 'general',
  dispute_category    text,                                             -- phase4
  priority            text NOT NULL DEFAULT 'normal'
      CONSTRAINT support_tickets_priority_check
      CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status              text NOT NULL DEFAULT 'open'
      CONSTRAINT support_tickets_status_check
      CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to         text,
  admin_notes         text,
  resolution_notes    text,
  sla_acknowledge_by  timestamptz,                                      -- phase4
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_job_id ON support_tickets(job_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_chat_room_id ON support_tickets(chat_room_id);

-- ---------------------------------------------------------------------------
-- admin_activity_log — admin audit trail.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action      text NOT NULL,
  entity_type text NOT NULL,
  entity_id   text,
  details     jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created ON admin_activity_log(created_at DESC);

-- ---------------------------------------------------------------------------
-- postcode_cache — geocoding cache (phase11).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS postcode_cache (
  postcode    text PRIMARY KEY,
  latitude    numeric,
  longitude   numeric,
  fetched_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz
);

-- ---------------------------------------------------------------------------
-- places_cache — Google Places API v1 cache (phase9). PK (place_id, trade_slug).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS places_cache (
  place_id      text NOT NULL,
  trade_slug    text NOT NULL,
  location_slug text,
  data          jsonb,
  fetched_at    timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  PRIMARY KEY (place_id, trade_slug)
);

CREATE INDEX IF NOT EXISTS idx_places_cache_expires_at ON places_cache(expires_at);

-- ---------------------------------------------------------------------------
-- outreach_prospects — Places-harvested leads for GHL outreach (phase10).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS outreach_prospects (
  place_id        text PRIMARY KEY,
  name            text,
  trade_slug      text,
  location        text,
  address         text,
  phone           text,
  website         text,
  rating          numeric(2, 1),
  review_count    integer,
  ghl_contact_id  text,
  synced_at       timestamptz,
  status          text NOT NULL DEFAULT 'new',
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- transactions — NEW direct-Stripe money ledger (keyed to Stripe payment intent,
-- idempotent). Complements (does not replace) lead_purchases' Stripe columns.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_payment_intent_id  text UNIQUE,     -- idempotency: one ledger row per PI
  stripe_charge_id          text,
  stripe_customer_id        text,
  amount_pence              integer NOT NULL CHECK (amount_pence > 0),
  currency                  text NOT NULL DEFAULT 'gbp',
  status                    text NOT NULL DEFAULT 'succeeded'
      CONSTRAINT transactions_status_check
      CHECK (status IN ('succeeded', 'refunded', 'failed', 'requires_payment_method')),
  kind                      text NOT NULL DEFAULT 'lead_purchase'
      CONSTRAINT transactions_kind_check
      CHECK (kind IN ('lead_purchase', 'subscription', 'refund', 'adjustment')),
  reference_type            text,
  reference_id              uuid,           -- e.g. lead_purchases.id / tradespeople.id
  tradesperson_id           uuid REFERENCES tradespeople(id) ON DELETE SET NULL,
  job_id                    uuid REFERENCES jobs(id) ON DELETE SET NULL,
  metadata                  jsonb,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_tradesperson ON transactions(tradesperson_id);
CREATE INDEX IF NOT EXISTS idx_transactions_job ON transactions(job_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- =============================================================================
-- 3. PHASE 4–12 COLUMN FOLDS (idempotent; no-ops on a fresh rebuild above)
-- =============================================================================

-- phase4 — clients.profile_photo_url, notification_logs.read_at already in base;
--          support_tickets.job_id/category/sla columns already in base.
-- (Columns are defined inline above; nothing further to ADD.)

-- phase5 — tradespeople.verification_status (inline above).
CREATE INDEX IF NOT EXISTS idx_tradespeople_verification_status
  ON tradespeople(verification_status);

-- phase6 — subscription columns/constraints inline above.
CREATE UNIQUE INDEX IF NOT EXISTS idx_tradespeople_stripe_customer_id
  ON tradespeople(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_tradespeople_stripe_subscription_id
  ON tradespeople(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

-- phase8 — certification expiry + gate index.
CREATE INDEX IF NOT EXISTS idx_tradespeople_certification_gate
  ON tradespeople(certification_verified, certification_expires_at)
  WHERE certification_verified = true AND certification_expires_at IS NOT NULL;

-- phase9/10/11 — places_cache / outreach_prospects / postcode_cache / haversine
-- (tables above).

-- =============================================================================
-- 4. SEQUENCE + TRIGGER — sequential MA-###### job reference codes (phase5)
-- =============================================================================
CREATE SEQUENCE IF NOT EXISTS job_reference_seq START 1;

CREATE OR REPLACE FUNCTION set_job_reference_code()
RETURNS trigger AS $$
BEGIN
  NEW.reference_code := 'MA-' || LPAD(nextval('job_reference_seq')::text, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_job_reference_code ON jobs;
CREATE TRIGGER trg_set_job_reference_code
  BEFORE INSERT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION set_job_reference_code();

-- =============================================================================
-- 5. HAVERSINE FUNCTION (phase11 — metres between two lat/lng pairs)
-- =============================================================================
CREATE OR REPLACE FUNCTION haversine_distance(
  lat1 numeric, lon1 numeric, lat2 numeric, lon2 numeric
) RETURNS numeric AS $$
  SELECT earth_distance(
    ll_to_earth(lat1::float8, lon1::float8),
    ll_to_earth(lat2::float8, lon2::float8)
  )::numeric;
$$ LANGUAGE sql IMMUTABLE;

-- =============================================================================
-- 6. ROW-LEVEL SECURITY
-- =============================================================================
-- The application currently mixes anon client + service-role admin access;
-- most writes go through service-role (bypasses RLS). We enable RLS and add the
-- permissive policies the code already relies on for the anon/client paths,
-- mirroring the surviving phase12 leads policy. Admins operate via service-role
-- (SUPABASE_SERVICE_ROLE_KEY), which bypasses RLS entirely.

-- ---- leads (authoritative — phase12) ----
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tradespeople can read leads" ON leads;
CREATE POLICY "Tradespeople can read leads"
  ON leads FOR SELECT USING (true);
DROP POLICY IF EXISTS "Tradespeople can claim open leads" ON leads;
CREATE POLICY "Tradespeople can claim open leads"
  ON leads FOR UPDATE
  USING (status = 'open' AND claimed_by IS NULL);
DROP POLICY IF EXISTS "Admins full access" ON leads;
CREATE POLICY "Admins full access"
  ON leads FOR ALL USING (true);

-- ---- jobs (public read of approved/open; service-role writes) ----
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read approved jobs" ON jobs;
CREATE POLICY "Public read approved jobs"
  ON jobs FOR SELECT USING (is_approved = true OR status IN ('approved', 'open'));

-- ---- job_applications ----
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read applications per job" ON job_applications;
CREATE POLICY "Public read applications per job"
  ON job_applications FOR SELECT USING (true);

-- ---- clients / tradespeople / chat_rooms / chat_messages / notification_logs ----
-- No RLS enabled: these are accessed via anon + service-role clients in the
-- current code. Enable selectively in a later hardening pass once auth is
-- migrated to Supabase Auth with app_metadata.role; see BACKEND-AUDIT-REPORT.md §2.4.

-- =============================================================================
-- DONE. Verify with:
--   SELECT table_name FROM information_schema.tables WHERE table_schema='public';
-- =============================================================================
