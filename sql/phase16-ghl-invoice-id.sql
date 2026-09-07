-- =============================================================================
-- phase16 — dual-identifier purchase lookup (audit: GHL invoice id column)
-- -----------------------------------------------------------------------------
-- The payments webhook matches an incoming GoHighLevel delivery to a single
-- lead_purchases row. Historically the GHL invoice id was stored in the
-- Stripe-named column stripe_checkout_session_id (a legacy of the pre-GHL Stripe
-- integration; the checkout route writes paymentLink.invoiceId there today).
--
-- GHL can carry several identifiers across its webhook event types (invoice
-- _id, order / payment id, ...) and there is no guarantee a live delivery's id
-- equals the id stored at checkout. This migration adds a dedicated,
-- honestly-named ghl_invoice_id column so the webhook can match a purchase
-- against EITHER stored identifier, and backfills it from the legacy column so
-- existing rows participate immediately.
--
-- Run this in the Supabase dashboard BEFORE the updated webhook route deploys:
-- the route references ghl_invoice_id in its lookup, and a live deployment that
-- queries a column that does not exist yet returns "column does not exist" for
-- every delivery.
--
-- Idempotent — safe to re-run against Supabase.
-- =============================================================================

ALTER TABLE public.lead_purchases
  ADD COLUMN IF NOT EXISTS ghl_invoice_id text;

-- Partial index mirrors idx_lead_purchases_stripe_session from phase7: only rows
-- that actually carry an id. Supports the `.or(stripe_checkout_session_id.eq.?,
-- ghl_invoice_id.eq.?)` lookup in the webhook.
CREATE INDEX IF NOT EXISTS idx_lead_purchases_ghl_invoice_id
  ON public.lead_purchases(ghl_invoice_id)
  WHERE ghl_invoice_id IS NOT NULL;

-- Legacy rows already store the GHL invoice id under the Stripe-named column.
-- Backfill so pre-existing purchases are reachable by the new identifier the
-- moment the column lands.
UPDATE public.lead_purchases
   SET ghl_invoice_id = stripe_checkout_session_id
 WHERE ghl_invoice_id IS NULL
   AND stripe_checkout_session_id IS NOT NULL;
