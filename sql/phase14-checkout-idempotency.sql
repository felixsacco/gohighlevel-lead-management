-- =============================================================================
-- phase14 — Wall B: checkout idempotency (audit P2#8)
-- -----------------------------------------------------------------------------
-- Adds a column that lets a repeat checkout click return the ORIGINAL GHL
-- payment link instead of minting a second invoice. Without it the webhook —
-- which matches purchases by stripe_checkout_session_id — can only ever see the
-- last invoice written, so every earlier invoice a user opened is silently
-- orphaned: if the customer paid one of those, the money is taken but the lead
-- is never unlocked.
--
-- `payment_url` stores the GoHighLevel hosted payment URL beside the invoice id.
-- The checkout handler writes both in a single conditional update (only when
-- stripe_checkout_session_id is still NULL) and replays the stored URL on later
-- clicks.
--
-- Idempotent. The column holds no PII; the table is already restricted to the
-- service role by the phase14-rls-revoke migration.
-- =============================================================================

ALTER TABLE public.lead_purchases
  ADD COLUMN IF NOT EXISTS payment_url text;
