-- =============================================================================
-- phase15 — Phase 2 vetting: machine-verdict columns + status gate
-- -----------------------------------------------------------------------------
-- Phase 2 (zero-touch vetting) makes `approved` a deterministic machine verdict.
-- Two new tradespeople columns back that:
--
--   verification_reason text — records WHY a profile sits in its current state:
--     machine blocker codes from the verify route ('all_required_documents_valid',
--     'companies_house_not_active', 'ai_risk_score_above_threshold', ...) or a
--     human reviewer's reason from the review route. NULL until a decision runs.
--   company_number text     — optional Companies House number (UK). When present
--     the verdict consults CH 'active' status; when absent CH is not required.
--
-- verification_reason MUST exist before the Phase 2a route code deploys
-- (app/api/client/admin-secret/verify-tradesperson/route.ts and
-- review-tradesperson/route.ts both write it — see their header notes), or every
-- decision update will 500 on the unknown column.
--
-- This file also hardens verification_status (a phase5 column that master creates
-- as bare text with NO CHECK) with the four-state CHECK the spec assumes:
-- 'pending_documents' | 'pending_review' | 'approved' | 'rejected'. Legacy
-- out-of-set rows are normalised first so the constraint can be added safely.
-- The normalisation mirrors phase5's flag mapping and never touches an
-- already-valid row, so it cannot downgrade a profile the flags say is approved.
--
-- Idempotent: ADD COLUMN IF NOT EXISTS / CREATE INDEX IF NOT EXISTS / guarded
-- ADD CONSTRAINT (skipped when tradespeople_verification_status_check exists) /
-- scoped UPDATE (only NULL or out-of-set rows).
-- =============================================================================

ALTER TABLE public.tradespeople
  ADD COLUMN IF NOT EXISTS verification_reason text;

ALTER TABLE public.tradespeople
  ADD COLUMN IF NOT EXISTS company_number text;

CREATE INDEX IF NOT EXISTS idx_tradespeople_company_number
  ON public.tradespeople(company_number);

-- Normalise any legacy row outside the four states (phase5's ELSE could keep an
-- out-of-set value on a mixed-flag row, which would then block the CHECK below).
-- Flag mapping identical to phase5: both approval flags set => 'approved',
-- otherwise 'pending_review'. Rows already in the state set are untouched.
UPDATE public.tradespeople
   SET verification_status = CASE
         WHEN COALESCE(is_verified, false) = true
          AND COALESCE(is_approved, false) = true THEN 'approved'
         ELSE 'pending_review'
       END
 WHERE verification_status IS NULL
    OR verification_status NOT IN
         ('pending_documents', 'pending_review', 'approved', 'rejected');

-- Add the four-state CHECK only if no constraint of that name already exists
-- (PostgreSQL has no ADD CONSTRAINT IF NOT EXISTS). Guarded so this file stays
-- idempotent across environments.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conrelid = 'public.tradespeople'::regclass
       AND conname  = 'tradespeople_verification_status_check'
  ) THEN
    ALTER TABLE public.tradespeople
      ADD CONSTRAINT tradespeople_verification_status_check
      CHECK (verification_status IN
        ('pending_documents', 'pending_review', 'approved', 'rejected'));
  END IF;
END $$;
