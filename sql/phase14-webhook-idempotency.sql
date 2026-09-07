-- =============================================================================
-- phase14 — Wall B/W2: webhook delivery idempotency (audit W2)
-- -----------------------------------------------------------------------------
-- `processed_webhooks` records every GHL invoice _id whose paid event has been
-- handled. It gives the webhook a durable, queryable "already processed" guard
-- that is independent of the stale `purchase.status` pre-read, so a concurrent
-- or replayed delivery short-circuits before the single-sale RPC and before any
-- notification leg fires twice.
--
-- The write happens only after `mark_lead_purchase_paid` returns true (the RPC's
-- compare-and-set is the real concurrency barrier); this table makes replays
-- cheap and provides the audit trail of which invoices actually completed.
--
-- Idempotent. SECURITY: revoke the default public/anon grants — an anonymous
-- caller must not be able to insert rows that would make the webhook skip a
-- genuine later payment for that invoice.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.processed_webhooks (
  invoice_id   text PRIMARY KEY,               -- GHL invoice _id
  purchase_id  uuid,                           -- lead_purchases.id that was marked paid
  event_status text NOT NULL DEFAULT 'paid',
  received_at  timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON public.processed_webhooks FROM anon, authenticated;
GRANT ALL ON public.processed_webhooks TO service_role;
