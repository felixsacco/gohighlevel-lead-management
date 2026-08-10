-- Phase 5: auto-verification state machine support
-- Adds an explicit verification lifecycle state for tradespeople.

ALTER TABLE tradespeople
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending_documents';

-- Normalize existing records to a consistent status.
UPDATE tradespeople
SET verification_status = CASE
  WHEN COALESCE(is_verified, false) = true AND COALESCE(is_approved, false) = true THEN 'approved'
  WHEN COALESCE(is_verified, false) = false AND COALESCE(is_approved, false) = false THEN 'pending_review'
  ELSE COALESCE(verification_status, 'pending_review')
END
WHERE verification_status IS NULL
   OR verification_status NOT IN ('pending_documents', 'pending_review', 'approved', 'rejected');

CREATE INDEX IF NOT EXISTS idx_tradespeople_verification_status
  ON tradespeople(verification_status);

