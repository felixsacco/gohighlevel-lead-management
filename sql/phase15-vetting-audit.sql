-- =============================================================================
-- phase15 — Phase 2: audit tables for the vetting trail (docs/VERIFICATION.md §16)
-- -----------------------------------------------------------------------------
-- Two tables back the zero-touch verdict with an auditable trail:
--
-- verification_checks — one row per check performed on a tradesperson (identity
--   A*, scheme B*, Companies House C*, insurance E*, ... — the catalogue in
--   docs/VERIFICATION.md §4 that §8 requires be re-run on expiry). APPEND-ONLY:
--   a row is written once and never updated; a re-check INSERTs a new row so the
--   table *is* the history ("never update a row, insert a new one"). The doc's
--   §16 model keys rows off a verification_profiles table that does NOT exist
--   live; the live schema keys every profile off tradespeople(id), so the FK
--   here is tradesperson_id -> tradespeople(id). DELETE is left open to
--   service_role for legitimate erasure/retention (§15); a BEFORE UPDATE trigger
--   blocks history rewrites for every role.
--
-- banned_identities — the anti-phoenixing (B7) denylist consulted at
--   registration, before any other vetting processing. company_numbers,
--   addresses, phones, emails are stored as supplied identifiers (these are
--   already-identified bad actors); bank_account_hashes and identity_hash are
--   stored hashed.
--
-- SECURITY: both tables are PII-adjacent and must never be reachable with the
-- anon key. Supabase's default privileges grant anon/authenticated ALL on newly
-- created tables, so those grants are revoked; only service_role is granted.
-- The trigger function is likewise revoked from PUBLIC/anon/authenticated.
--
-- Idempotent: CREATE TABLE IF NOT EXISTS / CREATE OR REPLACE FUNCTION /
-- DROP TRIGGER IF EXISTS + CREATE TRIGGER / CREATE INDEX IF NOT EXISTS /
-- REVOKE/GRANT (no-op when already applied).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.verification_checks (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tradesperson_id     uuid NOT NULL REFERENCES tradespeople(id) ON DELETE CASCADE,
  check_code          text NOT NULL,                 -- spec code: A1, B7, C1, E1, ... (docs/VERIFICATION.md §4)
  status              text NOT NULL,                 -- 'pass' | 'fail' | 'indeterminate'
  method              text NOT NULL,                 -- 'automated' | 'manual' | 'self_declared'
  source              text,                          -- 'companies_house' | 'gemini_ocr' | 'human_review' | ...
  evidence_ref        text,                          -- link to the evidence (e.g. a documents.id) that satisfied the check
  result_payload      jsonb,                         -- machine-readable result (CH status, OCR fields, AI score, ...)
  registration_number text,                          -- CH number / scheme registration number that was checked
  scheme_name         text,                          -- e.g. 'Gas Safe Register' when the check is scheme-based
  checked_at          timestamptz NOT NULL DEFAULT now(),
  expires_at          timestamptz,                   -- when this result must be re-checked (the §8 re-verification cron scans it)
  checked_by          text NOT NULL DEFAULT 'system' -- 'system' | admin identity for manual decisions
);

-- Append-only: never rewrite history; a re-check is a new row.
CREATE OR REPLACE FUNCTION public.prevent_verification_checks_update()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION
    'verification_checks is append-only: insert a new row rather than updating history (docs/VERIFICATION.md §16)';
END $$;

DROP TRIGGER IF EXISTS verification_checks_append_only ON public.verification_checks;
CREATE TRIGGER verification_checks_append_only
  BEFORE UPDATE ON public.verification_checks
  FOR EACH ROW EXECUTE FUNCTION public.prevent_verification_checks_update();

-- The re-verification cadence (§8) scans for expiring checks, so expires_at is
-- indexed; tradesperson_id backs the FK lookups and cascading deletes.
CREATE INDEX IF NOT EXISTS idx_verification_checks_expires_at
  ON public.verification_checks(expires_at);
CREATE INDEX IF NOT EXISTS idx_verification_checks_tradesperson
  ON public.verification_checks(tradesperson_id);

REVOKE ALL ON public.verification_checks FROM anon, authenticated;
GRANT ALL ON public.verification_checks TO service_role;

REVOKE ALL ON FUNCTION public.prevent_verification_checks_update()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prevent_verification_checks_update()
  TO service_role;

-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.banned_identities (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_hash       text,                          -- deterministic hash of the natural person (B7 join key); NULL when only a company is banned
  company_numbers     text[] NOT NULL DEFAULT '{}',  -- Companies House numbers to match against
  addresses           text[] NOT NULL DEFAULT '{}',
  phones              text[] NOT NULL DEFAULT '{}',
  emails              text[] NOT NULL DEFAULT '{}',
  bank_account_hashes text[] NOT NULL DEFAULT '{}',
  reason              text NOT NULL,                 -- why banned (falsified documents, failed blocking re-check, ...)
  banned_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_banned_identities_identity_hash
  ON public.banned_identities(identity_hash);

REVOKE ALL ON public.banned_identities FROM anon, authenticated;
GRANT ALL ON public.banned_identities TO service_role;
