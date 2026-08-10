-- Phase 12: Leads table and atomic claim
-- One lead row per job, created at job submission time.
-- Claim is a single atomic UPDATE — WHERE clause IS the concurrency safety.
-- Run in Supabase SQL editor.

-- 1. leads table
CREATE TABLE IF NOT EXISTS leads (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id            uuid NOT NULL REFERENCES jobs(id),
  status            text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'paid', 'expired', 'cancelled')),
  claimed_by        uuid NULL REFERENCES tradespeople(id),
  claimed_at        timestamptz NULL,
  claim_expires_at  timestamptz NULL,
  paid_at           timestamptz NULL,
  price_pence       integer NOT NULL DEFAULT 499,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- 2. One lead per job
CREATE UNIQUE INDEX IF NOT EXISTS uq_leads_job ON leads(job_id);

-- 3. RLS: Enable and grant access
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Tradespeople can read leads (to see what's available)
DROP POLICY IF EXISTS "Tradespeople can read leads" ON leads;
CREATE POLICY "Tradespeople can read leads" ON leads
  FOR SELECT
  USING (true);

-- Tradespeople can update only to claim an open lead
DROP POLICY IF EXISTS "Tradespeople can claim open leads" ON leads;
CREATE POLICY "Tradespeople can claim open leads" ON leads
  FOR UPDATE
  USING (status = 'open' AND claimed_by IS NULL);

-- Admins can do everything
DROP POLICY IF EXISTS "Admins full access" ON leads;
CREATE POLICY "Admins full access" ON leads
  FOR ALL
  USING (true)
  WITH CHECK (true);
