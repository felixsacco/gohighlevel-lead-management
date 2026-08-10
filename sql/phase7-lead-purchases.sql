-- Phase 7: per-lead purchases for Pay-Per-Lead tradespeople.
--
-- When a job goes live, every pay-per-lead tradesperson that matches the
-- trade/area gets an offer row (status = 'offered') and an SMS containing
-- a masked customer phone number plus a link to pay £4.99 to unlock the
-- full contact details. When the Stripe one-time payment succeeds, the
-- webhook flips the row to status = 'paid' and stamps paid_at.
--
-- Unlimited (£1,000/month) subscribers are NOT charged per lead - the
-- lead_purchases table is only populated for pay-per-lead tradespeople.

CREATE TABLE IF NOT EXISTS lead_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL,
  tradesperson_id UUID NOT NULL,
  lead_price_pence INTEGER NOT NULL DEFAULT 499,
  status TEXT NOT NULL DEFAULT 'offered',
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  offered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT lead_purchases_status_check
    CHECK (status IN ('offered', 'paid', 'refunded', 'expired'))
);

-- One offer per tradesperson per job. Re-running the matcher should not
-- create duplicate offers (the matcher uses ON CONFLICT DO NOTHING).
CREATE UNIQUE INDEX IF NOT EXISTS idx_lead_purchases_job_tradesperson
  ON lead_purchases(job_id, tradesperson_id);

CREATE INDEX IF NOT EXISTS idx_lead_purchases_tradesperson
  ON lead_purchases(tradesperson_id);

CREATE INDEX IF NOT EXISTS idx_lead_purchases_status
  ON lead_purchases(status);

CREATE INDEX IF NOT EXISTS idx_lead_purchases_stripe_session
  ON lead_purchases(stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;
