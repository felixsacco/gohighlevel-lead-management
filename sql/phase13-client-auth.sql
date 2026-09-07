-- =============================================================================
-- Phase 13 — clients table: align DDL with the server-side auth routes
-- =============================================================================
-- The hardened client sign-up / sign-in / reset routes (written server-side
-- with the service-role client in commit 4841a08) reference columns that the
-- `clients` table never received:
--
--   app/api/auth/client/register   inserts is_verified / is_active / address
--   app/api/auth/client/login      selects and gates on is_verified
--   app/api/auth/reset/request     selects is_verified (client branch)
--   /api/send-verification-email   writes verification_token / verification_sent_at / captcha_code
--   app/verify-captcha             reads captcha_code, sets is_verified
--
-- Without these columns the writes/reads raise PGRST204 (column does not exist)
-- → 500 on sign-up, 503 on sign-in, and a silent no-email on password reset.
-- This migration adds them so the table matches the code. The same columns are
-- folded into the `clients` CREATE TABLE in master-consolidated.sql so a FRESH
-- provisioning carries them from birth; this file patches databases that were
-- provisioned before that fold.
--
-- Column types mirror `tradespeople` (lines 71-72) and the register/verify
-- routes: is_verified/is_active booleans, address/verification_token/captcha_code
-- text, verification_sent_at timestamptz (NULL until the first verification
-- email is sent). DEFAULTs are safe because register always inserts
-- is_verified:false and is_active:false explicitly — an explicit insert wins
-- over the DEFAULT.
--
-- NOTE on existing rows: ADD COLUMN backfills is_verified=false for every
-- pre-existing client account (is_active gets its DEFAULT true). The login gate
-- then treats all of them as unverified ("check your inbox for the verification
-- email"). Tradespeople are unaffected (their table already has these columns).
--
-- Backfill: the UPDATE at the bottom of this file marks those pre-existing
-- rows verified so they are not locked out of an account they opened before the
-- email-verification gate existed. It runs ONLY against legacy rows, so it is
-- safe to run repeatedly and safe to run against a FRESH provision (no rows
-- match the legacy guard). New signups register with is_active=false and stay
-- unverified until they complete the emailed-code loop.
--
-- Idempotency: every statement is IF NOT EXISTS guarded and the backfill is
-- scoped to rows that already existed before this gate, so this file is safe
-- to run repeatedly and safe to re-run after master-consolidated.sql.
-- =============================================================================

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS is_verified          boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active            boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS address              text,
  ADD COLUMN IF NOT EXISTS verification_token   text,
  ADD COLUMN IF NOT EXISTS verification_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS captcha_code         text;

-- Explicit lookup index on the email used by every auth query. The UNIQUE
-- constraint on clients.email already backs these lookups; this is an explicit,
-- named index so auth does not depend on that implicit index's name and the two
-- schema paths (migration vs. fresh provision) stay identical.
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- =============================================================================
-- Backfill: un-lock pre-existing client accounts (email-verification gate)
-- =============================================================================
-- The ADD COLUMNs above backfill is_verified=false AND is_active=true for every
-- client row that already existed when this file first ran. The login gate then
-- refuses all of them ("verify your email") even though they registered before
-- the emailed-code loop existed and never received a code. This UPDATE is the
-- remediation for exactly that case.
--
-- The user's requested form is a blanket `WHERE is_verified = FALSE`, which
-- is correct as a one-shot but NOT safe to re-run: this migration file is
-- idempotent and may be run more than once (see header), and any signup that
-- registers *after* it has run is is_verified=false AND is_active=false until
-- the emailed code flips both on. Re-running a blanket UPDATE would silently
-- auto-verify those still-pending signups, defeating the email-verification
-- gate for them. Narrowing to `AND is_active = TRUE` selects only the rows the
-- ADD COLUMN backfilled (legacy accounts / walk-ins that predate the gate);
-- new register-route signups always insert is_active=false, so they are
-- excluded and must verify normally. Walk-in sentinel rows caught by this are
-- harmless: their password_hash is 'ANONYMOUS_NOT_SET', which login never
-- treats as a valid credential.
--
-- On a FRESH provision (master-consolidated.sql) there are zero rows, so this
-- is a no-op. Safe to run repeatedly against any database.
UPDATE public.clients
   SET is_verified = TRUE
 WHERE is_verified = FALSE
   AND is_active = TRUE;
