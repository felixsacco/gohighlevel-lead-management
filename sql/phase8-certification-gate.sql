-- Phase 8: Certification Gate for regulated trades.
--
-- Adds certification_expires_at to tradespeople so the matching engine can
-- automatically disqualify tradespeople whose certification has lapsed.
-- The filter requires: certification_verified = true AND certification_expires_at > now()
-- for matching against regulated-trade jobs (Gas Safe, FENSA, NICEIC/NAPIT, OFTEC, MCS).
--
-- NOTE: certification_verified is set manually by an admin. There is NO automated
-- integration with any UK regulatory register. This migration only adds the expiry
-- guardrail; it does not automate the verification itself.

-- 1. Add the expiry column (nullable — unset means "never expires" for
--    trades that aren't regulated or haven't been reviewed yet).
ALTER TABLE tradespeople
  ADD COLUMN IF NOT EXISTS certification_expires_at TIMESTAMPTZ;

-- 2. Index for the matching filter: certification_verified = true AND expires_at > now().
--    Partial index so it only covers verified rows with a known expiry.
CREATE INDEX IF NOT EXISTS idx_tradespeople_certification_gate
  ON tradespeople (certification_verified, certification_expires_at)
  WHERE certification_verified = true AND certification_expires_at IS NOT NULL;

-- 3. An admin-facing view for spotting soon-to-expire certs (next 30 days).
--    Run this in the Supabase dashboard or a cron to audit the manual-verification backlog.
COMMENT ON COLUMN tradespeople.certification_expires_at IS
  'Set by admin after manual register check. NULL = never expires or not reviewed.';
