-- =============================================================================
-- phase14 — Wall B: single-sale enforcement (audit P1#1)
-- -----------------------------------------------------------------------------
-- Turns "exactly one paid purchase per job" into a database invariant and makes
-- the three transitions that fire when a GHL invoice is paid a single atomic
-- RPC, so a replayed or concurrent webhook can neither double-charge nor
-- partially apply a sale:
--   1. mark the winning offer  'offered' -> 'paid'
--   2. expire every sibling offer on the same job (refund / release candidates)
--   3. flip the lead itself out of the purchasable set (claimed_by dropped)
--
-- The partial unique index is the backstop: a second 'paid' row for a job_id is
-- physically impossible. The RPC is the atomic compare-and-set the webhook calls.
--
-- Idempotent (CREATE UNIQUE INDEX IF NOT EXISTS / CREATE OR REPLACE FUNCTION) —
-- safe to run repeatedly against Supabase.
--
-- SECURITY: the function is SECURITY INVOKER and would otherwise inherit the
-- public default EXECUTE grant, letting an anonymous caller mark any offered
-- purchase 'paid' (the anon key can see lead_purchases today). EXECUTE is
-- restricted to service_role, which is exactly the client the webhook uses
-- (getSupabaseAdmin). Run AFTER the phase14-rls-revoke migration for the grants
-- to be meaningful end-to-end.
-- =============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS uq_lead_purchases_one_paid_per_job
  ON public.lead_purchases(job_id) WHERE status = 'paid';

CREATE OR REPLACE FUNCTION public.mark_lead_purchase_paid(
  p_purchase_id uuid,
  p_invoice_id  text
) RETURNS boolean
LANGUAGE plpgsql VOLATILE AS $$
DECLARE
  v_job uuid;
BEGIN
  -- Compare-and-set: only an 'offered' row can be marked paid. No row is
  -- returned when the purchase is already paid / expired / refunded — i.e. a
  -- duplicate or replayed invoice — and the caller then returns false to ignore
  -- the delivery without touching the lead or the sibling offers.
  UPDATE public.lead_purchases
     SET status                 = 'paid',
         paid_at                = now(),
         stripe_payment_intent_id = p_invoice_id,
         updated_at             = now()
   WHERE id   = p_purchase_id
     AND status = 'offered'
   RETURNING job_id INTO v_job;

  IF v_job IS NULL THEN
    RETURN false;
  END IF;

  -- Expire every sibling offer on the same job so a lead that is already sold
  -- cannot still be bought by another tradesperson. These rows are refund /
  -- release candidates for the (manual or API) GHL reversal sweep.
  UPDATE public.lead_purchases
     SET status = 'expired', updated_at = now()
   WHERE job_id   = v_job
     AND status   = 'offered'
     AND id      <> p_purchase_id;

  -- Flip the lead out of the purchasable inventory. leads.job_id is UNIQUE so
  -- exactly one row matches. Clearing claimed_by keeps the sold-lead invariant
  -- compatible with either side of the claim wire-or-delete decision (P3#17).
  UPDATE public.leads
     SET status = 'paid', paid_at = now(), claimed_by = NULL
   WHERE job_id = v_job;

  RETURN true;
END; $$;

REVOKE ALL ON FUNCTION public.mark_lead_purchase_paid(uuid, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_lead_purchase_paid(uuid, text)
  TO service_role;
