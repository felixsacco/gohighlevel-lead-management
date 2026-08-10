-- Phase 6: tradesperson subscription plans
-- Two plans offered at signup:
--   * 'pay_per_lead'      : free to join, £4.99 charged per accepted lead
--   * 'unlimited_monthly' : £1,000 / month, unlimited leads
--
-- The actual billing integration lives outside the DB. This migration just
-- records the choice the tradesperson made and gives us a stable column to
-- gate access on.

ALTER TABLE tradespeople
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'pay_per_lead';

ALTER TABLE tradespeople
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'pending';

ALTER TABLE tradespeople
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ;

ALTER TABLE tradespeople
ADD COLUMN IF NOT EXISTS subscription_renews_at TIMESTAMPTZ;

-- Stripe linkage (only populated for tradespeople on the £1,000/month
-- unlimited plan; pay-per-lead tradespeople don't have a subscription).
ALTER TABLE tradespeople
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

ALTER TABLE tradespeople
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

ALTER TABLE tradespeople
ADD COLUMN IF NOT EXISTS stripe_subscription_current_period_end TIMESTAMPTZ;

-- Per-plan pricing snapshot. Stored in pence so we never lose precision.
-- Defaults reflect the launch prices; existing records get the launch defaults.
ALTER TABLE tradespeople
ADD COLUMN IF NOT EXISTS pay_per_lead_price_pence INTEGER DEFAULT 499;

ALTER TABLE tradespeople
ADD COLUMN IF NOT EXISTS unlimited_monthly_price_pence INTEGER DEFAULT 100000;

-- Backfill any existing rows to the free default so nobody is silently on the
-- £1,000/month plan because of a NULL.
UPDATE tradespeople
SET subscription_plan = 'pay_per_lead'
WHERE subscription_plan IS NULL
   OR subscription_plan NOT IN ('pay_per_lead', 'unlimited_monthly');

UPDATE tradespeople
SET subscription_status = 'pending'
WHERE subscription_status IS NULL
   OR subscription_status NOT IN ('pending', 'active', 'past_due', 'cancelled');

-- Constrain the values going forward.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'tradespeople_subscription_plan_check'
  ) THEN
    ALTER TABLE tradespeople
      ADD CONSTRAINT tradespeople_subscription_plan_check
      CHECK (subscription_plan IN ('pay_per_lead', 'unlimited_monthly'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'tradespeople_subscription_status_check'
  ) THEN
    ALTER TABLE tradespeople
      ADD CONSTRAINT tradespeople_subscription_status_check
      CHECK (subscription_status IN ('pending', 'active', 'past_due', 'cancelled'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tradespeople_subscription_plan
  ON tradespeople(subscription_plan);

CREATE INDEX IF NOT EXISTS idx_tradespeople_subscription_status
  ON tradespeople(subscription_status);

-- Webhook handlers look up tradespeople by their Stripe identifiers. Keep
-- those indexes ready so it stays fast as the table grows.
CREATE UNIQUE INDEX IF NOT EXISTS idx_tradespeople_stripe_customer_id
  ON tradespeople(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tradespeople_stripe_subscription_id
  ON tradespeople(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;
