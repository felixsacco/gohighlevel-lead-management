# MyApproved — Backend Architecture Audit & UK Rebuild Blueprint

**Prepared:** 2026-09-05
**Scope:** Read-only structural audit of the `myapproved.com-main` Next.js codebase.
**Purpose:** Map the full backend surface so the Supabase layer can be rebuilt from scratch on a fresh UK-hosted instance and driven to 100% production-ready execution.

> **Read-me-first caveats** — the four items below materially change what "rebuild from scratch" means, and recur throughout this report:
> 1. **Base schema migrations (phases 1–3) are absent from the repo.** The `sql/` directory contains only phases 4–12. The `CREATE TABLE` statements for the core tables — `jobs`, `clients`, `tradespeople`, `leads` (phase 12 exists), `chat_rooms`, `chats`, `job_applications`, `notification_logs`, `admin_activity_log`, `support_tickets` — are **not on disk**. Phase 4+ are all `ALTER TABLE`, which means the foundational DDL must be reverse-engineered and re-authored before any other step.
> 2. **Four tables the platform spec names do not exist** under those names: `profiles`, `tradespeople_metadata`, `lead_dispatches`, `transactions`. The platform uses `clients` + `tradespeople` (as separate role tables) instead of a unified `profiles`; `lead_purchases` instead of `lead_dispatches`; and **no local money ledger** (`transactions`) — billing is delegated to GoHighLevel/Stripe.
> 3. **The autonomous acceptance loop is incomplete.** The atomic claim endpoint (`app/api/leads/[id]/claim/route.ts`) is **disabled** (returns 503) and the underlying payment→unlock flow is a **pay-per-lead** model (first to pay), not a first-to-claim lock. There is **no server-side session** for clients or tradespeople.
> 4. **Regulated-trade certification is manual-only.** The "independent register verification" marketing claim is not backed by any Gas Safe/NICEIC/FENSA/OFTEC/MCS API; `certification_verified` is set by an admin by hand.

---

## Part 1 — Complete Inventory

### 1.0 Stack & runtime

| Area | Value |
|---|---|
| Framework | Next.js 13.5.7 (App Router, Route Handlers) |
| React | 18.2.0 |
| TypeScript | 5.9.2 |
| Database | Supabase PostgreSQL (`@supabase/supabase-js` ^2.50.0) |
| Auth (DB) | Supabase Auth client (anon + service-role) — **no server-side session wired in app code** |
| CRM / Payments / SMS | GoHighLevel (LeadConnector) — OAuth + Private Integration (`pit-` token); Stripe-backed invoices |
| AI | Google Gemini `gemini-2.5-flash` (module `deepseek-service.ts`; env `GEMINI_API_KEY`, misleading `DEEPSEEK_API_KEY` also present) |
| Email | Postmark (SMTP `smtp.postmarkapp.com`, `POSTMARK_SERVER_TOKEN`) — env.example's SMTP_* vars are vestigial |
| SMS | GoHighLevel primary, Twilio fallback (`SMS_PROVIDER`) |
| Geocoding | postcodes.io (free, cached); Google Places API v1; Google Maps JS (client) |
| Company verification | Companies House API (Basic auth) |
| Bot protection | Google reCAPTCHA Enterprise |
| Queues | Upstash QStash |
| Observability | Empire/Fleet ingest (webhook) |
| Deploy | Vercel; `CRON_SECRET` Bearer-guarded cron routes |
| CLI scripts | `npx tsx` + `pg` (direct Postgres) for migrations/harvest |

### 1.1 Supabase client initialisation points

| File | Client | Key | Notes |
|---|---|---|---|
| `lib/supabase.ts` | `createSupabaseClient` (anon, cached singleton) | `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | also exports `getSupabaseAdmin()` (service-role, `persistSession:false`) and `createClient()` |
| `lib/supabase-client.ts` | anon, realtime disabled | same anon env | used by browser-facing client code |
| `lib/db-schema.ts` | n/a | n/a | TypeScript interfaces + mock data only — **not** the real schema |
| Inline service-role | several route/script files build their own `createClient(url, SERVICE_ROLE_KEY)` | `SUPABASE_SERVICE_ROLE_KEY` | e.g. legacy `app/api/leads/route.ts` |

### 1.2 API route surface (84 `route.ts` handlers)

Grouped by function. Full paths resolve under `app/api/<group>/<...>`.

**Admin & admin-secret** (`admin/`, `admin-secret/`)
- Admin dashboard read/write for jobs, tradespeople, leads, disputes, notifications.
- `admin-secret/` routes are **Basic-auth guarded** (not Supabase-session guarded).

**Auth / roles**
- Client signup/login (superseded in practice by anonymous + localStorage flows; see §2.5).
- Tradesperson registration → verification → onboarding.

**Chat** (`chat/`)
- `chat_rooms`, messages, mark-read. Realtime channel.

**Client** (`client/`, `clients/`)
- Job posting, application review/assign, invoices, re-engagement.

**Companies House** (`companies-house/`)
- UK company number lookup → verification data.

**CRM** (`crm/sync-job`, `workers/crm-sync`)
- QStash queue worker + direct-HTTP fallback → GoHighLevel contact + opportunity upsert.

**Cron** (`cron/`)
- `escalate-jobs` (round-robin), `release-expired-claims`, `process-scheduled` (notifications), geocoding backfill, places-cache purge. All `CRON_SECRET` Bearer-guarded.

**Disputes** (`disputes/`, `support/`)
- Ticket create/update/resolve; SLA acknowledgement.

**Jobs** (`jobs/`)
- `submit/` (main entry: authenticate-or-anonymous, QStash enqueue, notify matcher, geocode)
- apply, applications, assign (incl. `runAutoAssignForJob`), status transitions, invoices.

**Leads** (`leads/`)
- `route.ts` — legacy create (inserts into `leads`, status `'new'` — **outside** phase-12 enum `open/claimed/paid/expired/cancelled`).
- `[id]/claim/` — **disabled, returns 503** (insecure body-based `tradespersonId`).

**Notifications** (`notifications/`, `workers/notifications`)
- `sendNotification` dispatch; QStash worker; `process-scheduled`; inbox PATCH (mark read).

**Payments** (`payments/`)
- `webhook/` — GHL/Stripe invoice-update webhook (HMAC `GHL_WEBHOOK_SECRET`, `timingSafeEqual`). **Signing scheme unverified** (see §2.7).
- `stripe/` — subscription webhooks (unlimited plan).

**Places** (`places/`)
- Google Places API v1 proxy → `places_cache`.

**Quotes** (`quotes/`, `pricing/`)
- Indicative estimate, live price calculation (`PricingCalculator`).

**Trades / tradesperson / workers / test / debug**
- Trade catalog, tradesperson profile CRUD, fleet ingest emitter, verification spec, QStash workers.

### 1.3 Server actions / DB-touching modules (non-route)

| Module | Responsibility |
|---|---|
| `lib/matching/round-robin.ts` | `escalateJobs()` — find approved/open jobs with no paid lead, compute round, insert `lead_purchases` offers, send `pay_per_lead_alert` |
| `lib/matching/regulated-trades.ts` | `REGULATED_TRADES` map + certification gate check |
| `lib/notifications/notify-tradespeople-job-match.ts` | fetch verified tradespeople, filter by trade OR location, regulated gate, fire match notifications |
| `lib/notifications/index.ts` | central `sendNotification()` (email/sms/push) + `notification_logs` write |
| `lib/notifications/email.ts` | Postmark transport + ~37 email templates + PDF invoice attach |
| `lib/notifications/sms.ts` | GHL primary + Twilio fallback + UK number normalisation |
| `lib/notifications/types.ts` | `NotificationEventType` (~37) + `NotificationChannel` |
| `lib/geo/postcodes.ts` | `geocodePostcode()` — normalise → cache → postcodes.io |
| `lib/pricing/PricingCalculator.ts` | live price + min/max + region + complexity + access multipliers |
| `lib/verification/user-status-machine.ts` | `evaluateVerificationState()` → `pending_documents`/`pending_review`/`approved` |
| `lib/verification/ai-verify.ts` | Gemini risk scoring on submitted docs |
| `lib/verification/spec.ts` | document checklist per trade |
| `lib/jobs/runAutoAssignForJob.ts` / `assignJobFromApplication.ts` | auto-assign lowest quote; assign → chat_room + notifications |
| `lib/lifecycle/*` | schedule/clear progress-checkin QStash jobs |
| `lib/qstash.ts` | `enqueueNotification` / `enqueueCrmSync` |
| `lib/gohighlevel-service.ts` / `gohighlevel-oauth.ts` | GHL contact/opportunity/invoice/SMS |
| `lib/companies-house.ts` | Companies House lookup |
| `lib/fleet/emitFleetIngest.ts` | fire-and-forget observability POST |
| `lib/utils/trade-matcher.ts`, `postcode-matcher.ts` | matching + proximity heuristics |

### 1.4 Scripts (`scripts/`)

| Script | Purpose |
|---|---|
| `run-migration.mjs` | apply a SQL file via `pg` |
| `backfill-geocoding.ts` | lat/lng backfill for jobs/tradespeople |
| `harvest-places.ts` | Google Places → `outreach_prospects` |
| `sync-prospects-to-ghl.ts` | `outreach_prospects` → GHL contacts |
| `verify-phase6.ts`, `verify-sweep.ts`, `verify-canonicals.ts` | DB/SEO integrity checks |
| `build_mark.py` | content build |

---

## Part 2 — SQL Schema & Migration Blueprint (fresh UK Supabase)

### 2.1 The critical gap: missing base schema

Phases 1–3 (base `CREATE TABLE`s) are **not committed**. The tables below must be **re-authored** — they are referenced everywhere by phases 4–12 but have no DDL on disk. Column names below are reverse-engineered from `ALTER` statements, `SELECT`/`INSERT` calls, and mock interfaces.

**`jobs`** — core job record.
- `id uuid PK`, `reference_code text UNIQUE` (seq `job_reference_seq`, `MA-######`), `client_id uuid`, `trade text`, `postcode text`, `description text`, `estimate numeric`, `budget numeric`, `budget_type text`, `status text` (`pending/approved/open/in_progress/completed/cancelled/rejected`), `application_status text`, `assigned_tradesperson_id uuid`, `latitude numeric`, `longitude numeric`, timestamps.
- Source: `phase5-job-reference-seq.sql`, `phase11-geocoding.sql`, `assignJobFromApplication.ts`, `round-robin.ts`.

**`clients`** — client account.
- `id uuid PK`, `email text UNIQUE`, `name text`, `phone text`, `postcode text`, `password_hash text` (`'ANONYMOUS_NOT_SET'` sentinel), `profile_photo_url text` (phase4). `auth.uid()` not used for ownership in RLS (role tables, separate from Supabase Auth).

**`tradespeople`** — tradesperson account + full profile.
- `id uuid PK`, `email`, `phone`, `trade text`, `postcode text`, `latitude/longitude` (phase11), `is_verified bool`, `is_approved bool`, `certification_verified bool`, `certification_expires_at timestamptz` (phase8), verification/insurance/qualification doc refs, `verification_status text` (phase5), subscription fields (phase6): `subscription_plan`, `subscription_status`, `subscription_started_at/renews_at`, `stripe_customer_id`, `stripe_subscription_id`, `stripe_subscription_current_period_end`, `pay_per_lead_price_pence int DEFAULT 499`, `unlimited_monthly_price_pence int DEFAULT 100000`.

**`chat_rooms`** — one per job assignment (client↔tradesperson). `id uuid PK`, `job_id`, `client_id`, `tradesperson_id`, timestamps. (Unique constraint to tolerate `23505` on dup insert.)

**`chats`** — messages. `id uuid PK`, `chat_room_id`, `sender_id`, `sender_role`, `body text`, `read_at`, timestamps.

**`job_applications`** — tradesperson quotes. `id uuid PK`, `job_id`, `tradesperson_id`, `quotation_amount numeric`, `status text` (`pending/accepted/rejected`), timestamps.

**`notification_logs`** — `id idempotency_key UNIQUE`, `event_type`, `channel`, `recipient_id`, `recipient_contact`, `status`, `provider_message_id`, `error_message`, `payload jsonb`, `read_at timestamptz` (phase4), timestamps.

**`admin_activity_log`** — admin audit trail.

**`support_tickets`** — `id`, `chat_room_id`, `job_id` (phase4), `dispute_category`, `sla_acknowledge_by` (phase4), status, notes, timestamps.

### 2.2 Tables created by phases 4–12 (present on disk → reusable as-is)

| Table | Phase | Purpose |
|---|---|---|
| *(ALTER only)* | 4 | extensions + clients.profile_photo_url, notification_logs.read_at, support_tickets disputes |
| *(ALTER only)* | 5 | tradespeople.verification_status state machine |
| `job_reference_seq` + trigger | 5 | sequential `MA-######` codes |
| *(ALTER only)* | 6 | subscription plan columns + check constraints + stripe indexes |
| `lead_purchases` | 7 | pay-per-lead offer/purchase rows (the de-facto `lead_dispatches` + payment ledger hybrid) |
| *(ALTER only)* | 8 | certification expiry + gate index |
| `places_cache` | 9 | Google Places cache (PK `(place_id, trade_slug)`) |
| `outreach_prospects` | 10 | Places-harvested leads for GHL outreach |
| `postcode_cache` + `haversine_distance()` + `cube`/`earthdistance` | 11 | geocoding cache + distance |
| `leads` + claim policies | 12 | one-lead-per-job + RLS + atomic-claim shape |

### 2.3 Missing tables the spec names (decide whether to add)

| Spec name | Actual | Recommendation |
|---|---|---|
| `profiles` | `clients` + `tradespeople` | Either keep two-role design **or** introduce a `profiles` superset with FKs. Recommend keeping two tables (matches code) and treating `profiles` as a view for admin. |
| `tradespeople_metadata` | columns on `tradespeople` | Only needed if data must be normalised out (certifications, doc statuses). Recommend a nullable extension table if doc/verification history is required. |
| `lead_dispatches` | `lead_purchases` | Rename/re-map. `lead_purchases` carries `offered/paid` status + Stripe session; it *is* the dispatch record. Consider adding an explicit `lead_dispatches` view over it. |
| `transactions` | *(none)* | **Gap to close.** Money currently lives in GHL/Stripe only. Add a `transactions` ledger (idempotent on Stripe/PaymentIntent id) for audit + refunds + reconciliation. High priority for production. |

### 2.4 RLS policy blueprint

Current RLS is **partial and spotty**. Only `leads` (phase12), Storage `documents` bucket, and `admin-secret` Basic-auth exist. For a production rebuild, standardise:

- **Two-role model** via `auth.jwt()` role claim (set `role` = `'client' | 'tradesperson' | 'admin'` in Supabase Auth `app_metadata`).
- `clients`: owner `id = auth.uid()` (or `email = auth.email()`), admin all.
- `tradespeople`: owner read/write own row; `SELECT` on verified-subsets for matching.
- `jobs`: client-owner read; tradespeople read `open`/`approved`; admin all.
- `job_applications`: tradesperson-owner write; job-owner read; admin all.
- `chat_rooms`/`chats`: participants read/write; admin read.
- `lead_purchases`: tradesperson-owner read own offers; webhook uses service-role (bypass RLS).
- `notification_logs`: recipient read/mark-read; system (service-role) write.
- `leads`: extend phase12 with an **atomic claim** policy (`USING (status='open' AND claimed_by IS NULL)` on a guarded RPC, not an open UPDATE).

> Because several route handlers use the **service-role** client inline, many bypass RLS today. A production rebuild should route those through RLS-guarded policies with `SUPABASE_SERVICE_ROLE_KEY` kept server-only.

### 2.5 Storage buckets

- `documents` (private) — tradesperson ID / qualification / insurance files. RLS: `auth.uid() = (storage.foldername(name))[1]::uuid` per-tradesperson folder; admin full. **Trade-card** required for plumber/electrician/aircon (see `verification/spec.ts`).
- `avatars` / `profile-photos` (optional public/private) — client `profile_photo_url` + tradesperson photos.
- `chat-attachments` (optional) — if image sharing is required.
- **CORS + UK-region**: bucket + project must be in `eu-west` (or `eu-central`) for UK data residency.

---

## Part 3 — Integration & Env Blueprint

### 3.1 Required Supabase instance (fresh UK)

1. Create project in **EU-West** region.
2. Apply phases **1–3 first** (re-authored base DDL), then phases 4–12 in order (idempotent, `IF NOT EXISTS`).
3. Enable extensions: `cube`, `earthdistance`, `gen_random_uuid` (pgcrypto — ensure `gen_random_uuid()` is available; Supabase enables it by default but verify).
4. Configure Auth: email + password (or magic link). Attach `app_metadata.role`.
5. Storage buckets + RLS as §2.5.
6. Create `transactions` ledger (new — §2.3).
7. Set up realtime for `chat_rooms`/`chats` (currently **disabled** in `supabase-client.ts` — decide whether to re-enable for live chat).

### 3.2 Environment variables (from `.env.example` + code usage)

**Supabase (server + client)**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY      # server-only
```

**GoHighLevel / payments / SMS**
```
GHL_API_KEY                    # Private Integration (pit-...) or OAuth token
GHL_LOCATION_ID
GHL_WEBHOOK_SECRET             # HMAC for /api/payments/webhook
GOHIGHLEVEL_API_KEY            # fallback legacy
GOHIGHLEVEL_LOCATION_ID
GOHIGHLEVEL_SMS_API_KEY        # optional dedicated SMS key
GOHIGHLEVEL_SMS_LOCATION_ID
GOHIGHLEVEL_BASE_URL           # default service.leadconnectorhq.com
GHL_DEBUG_SMS                  # 1/true to log SMS polling
GOHIGHLEVEL_ACCESS_TOKEN       # OAuth
GOHIGHLEVEL_CLIENT_ID / _SECRET / _REDIRECT_URI
```

**AI**
```
GEMINI_API_KEY                 # used by ai-verify + job classification
DEEPSEEK_API_KEY               # vestigial/misleading — Gemini is actually used
```

**Google**
```
GOOGLE_SERVER_API_KEY          # Places API v1 (server)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY # Maps JS (client)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY
RECAPTCHA_SECRET_KEY
RECAPTCHA_PROJECT_ID
```

**Email (Postmark — authoritative; env.example SMTP_* vars are leftover)**
```
POSTMARK_SERVER_TOKEN
NOTIFICATION_FROM_EMAIL        # fallback sender
```

**SMS fallback**
```
TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER / TWILIO_MESSAGING_SERVICE_SID
SMS_PROVIDER                   # auto | gohighlevel | twilio
```

**Companies House**
```
COMPANIES_HOUSE_API_KEY
```

**Queue / observability / cron**
```
QSTASH_TOKEN
FLEET_INGEST_URL / FLEET_INGEST_SECRET
EMPIRE_WEBHOOK_SECRET
CRON_SECRET
```

**Feature / app**
```
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_ICO_REGISTRATION_NUMBER   # hides footer badge if unset
ADMIN_EMAIL / SUPPORT_EMAIL
ENABLE_AUTO_ASSIGN_JOB
NEXT_PUBLIC_DISPUTE_SLA_ACK_HOURS
PORT
```

### 3.3 External API wiring (what must be provisioned on the fresh instance)

| Integration | Steps |
|---|---|
| **Postmark** | Create server → copy `POSTMARK_SERVER_TOKEN`; verify `noreply@mail.myapproved.com` sender signature; create `outbound` message stream (email.ts hard-codes `X-PM-MESSAGE-STREAM: outbound`). |
| **GoHighLevel** | Market place OAuth (`contacts.write opportunities.write locations.read`) **or** Private Integration. Record `GHL_LOCATION_ID`. Configure Stripe inside GHL for the £4.99 invoices + £1,000/mo subscription. |
| **GHL webhook signature** | **Unverified** — confirm GHL's actual signing header/algorithm and align `payments/webhook/route.ts` (see §2.7 / gap G5). |
| **Stripe subscription** | For unlimited plan, wire `stripe_customer_id`/`stripe_subscription_id`, listen to `payment/` webhook. |
| **Google Places** | Enable Places API v1 + Maps JS + Geocoding; create **two** keys (restricted server + browser). |
| **Gemini** | Create API key in AI Studio; enable `gemini-2.5-flash`. |
| **postcodes.io** | No key (free); relies on `postcode_cache` for throttling. |
| **Companies House** | Register for developer key. |
| **reCAPTCHA Enterprise** | Create project + key. |
| **QStash** | Obtain token; confirm `NEXT_PUBLIC_APP_URL` so worker callback URL resolves. |

---

## Part 4 — Execution Roadmap

### Phase A — Foundations (blocking)
1. **Re-author base schema (phases 1–3)** for `jobs`, `clients`, `tradespeople`, `chat_rooms`, `chats`, `job_applications`, `notification_logs`, `admin_activity_log`, `support_tickets` — matching every column referenced by phases 4–12 and route handlers. **This is the single highest-priority item.**
2. Create the `transactions` ledger (money audit — absent today).
3. Decide the `profiles` vs two-role + `lead_dispatches` mapping (recommend: two-role tables, views for admin, keep `lead_purchases` as the dispatch record).
4. Provision EU-West Supabase; run phases 1→12; enable extensions; configure Auth + `app_metadata.role`.

### Phase B — Auth & RLS hardening
5. Replace anonymous/localStorage auth with Supabase Auth sessions; wire `auth.uid()`/`email` ownership into RLS (currently most writes go through service-role, bypassing RLS).
6. Standardise RLS policies (clients/tradespeople/jobs/applications/chat/notifications/leads).
7. Re-enable + secure the **atomic claim** flow (§2.7 G3) at the DB level (single `UPDATE ... WHERE status='open' AND claimed_by IS NULL`) and reinstate the endpoint.

### Phase C — Payments & dispatch completion
8. Verify GHL webhook signature scheme; make `payments/webhook` reject unsigned/invalid requests.
9. Implement idempotent `transactions` write on every `lead_purchases.status='paid'`.
10. Wire unlimited-plan Stripe subscription lifecycle (create/cancel/webhook).
11. Confirm round-robin `escalateJobs` cadence (cron) + `release-expired-claims` (cron) are live.

### Phase D — External integration bring-up
12. Provision Postmark, GHL, Google, Gemini, Companies House, reCAPTCHA, QStash keys; validate each with a smoke call.
13. Seed geocoding (`backfill-geocoding`) + Places harvest + GHL outreach sync.
14. Configure Vercel crons with `CRON_SECRET`.

### Phase E — Verification & compliance
15. **Close the misrepresentation gap**: either ship real Gas Safe/NICEIC/FENSA/OFTEC/MCS register lookups or **soften the "independent verification" claim** until automation exists.
16. Add regulated-trade certification expiry re-check (cron) + `certification_expires_at` backfill.
17. Keep ICO number unset until issued (footer badge hides itself).

### Phase F — Observability & hardening
18. Point `FLEET_INGEST_URL` at the observability hub; verify ingest on lead/job/quote events.
19. Add reconciliation report over `transactions` vs GHL/Stripe payouts.
20. Security review of `admin-secret` Basic-auth routes; move to Supabase Auth roles.

---

## Appendix — Critical Gaps (consolidated)

- **G1. Missing base migrations (phases 1–3).** No `CREATE TABLE` for core tables. Must be re-authored. *Part 4 Phase A.1.*
- **G2. No `transactions` ledger.** All money is external to the DB → no reconciliation/audit. *Phase A.2.*
- **G3. Autonomous acceptance loop disabled.** Claim endpoint returns 503; no server-side session; body-based `tradespersonId` was insecure. *Phase B.6.*
- **G4. Service-role everywhere.** Many handlers use admin client inline, bypassing RLS. *Phase B.4–5.*
- **G5. Unverified GHL webhook signing.** HMAC scheme could not be confirmed from the repo. *Phase C.8.*
- **G6. Manual-only regulated-trade certification.** Public "register verification" claim not automated. *Phase E.15.*
- **G7. `leads` legacy status `'new'` diverges** from phase-12 enum (`open/claimed/paid/expired/cancelled`). *Phase A/B alignment.*
- **G8. Email transport mismatch.** Code uses Postmark; env.example lists SMTP_* vars. *Phase D.12.*
- **G9. Realtime disabled in anon client** — live chat requires re-enabling if wanted. *Phase A.7.*

---

### Key facts to remember for the rebuild

- Lead fee = **£4.99** (`pay_per_lead_price_pence` / `lead_purchases.lead_price_pence` / `leads.price_pence` default **499**).
- Unlimited plan = **£1,000/month** (`unlimited_monthly_price_pence` 100000).
- Round-robin: **10 tradespeople/round, 3 rounds, 24h/round** (`TRADESPEOPLE_PER_ROUND=10`, `MAX_ROUNDS=3`, `ROUND_DURATION_HOURS=24`).
- Matching = trade-synonym union location-proximity (`TRADE_VARIATIONS`, `POSTCODE_REGIONS` 0–100 heuristic).
- Regulated trades → `certification_verified AND certification_expires_at > now()`.
- Job reference format `MA-######` via `job_reference_seq`.
