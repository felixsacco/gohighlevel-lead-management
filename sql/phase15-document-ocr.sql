-- =============================================================================
-- phase15 — Phase 2b: document OCR / parse metadata columns (audit P2#10)
-- -----------------------------------------------------------------------------
-- `documents` today records only the raw upload (file_path, upload_date) plus a
-- single `status` (default 'pending'); nothing ever reads the file. Phase 2b
-- adds a machine-parse leg at ingest (lib/verification/document-ocr.ts, reusing
-- the Gemini REST pattern from lib/verification/ai-verify.ts): the file is sent
-- to Gemini, which returns structured JSON
--   { docType, issuer, docNumber, expiryDate, confidence, flags }.
-- These columns persist that parse on the documents row:
--
--   parse_status  text        — NULL (not attempted) | 'parsed' |
--                               'low_confidence' | 'failed'
--                               (the vocabulary document-ocr.ts writes).
--   parse_payload jsonb       — the full Gemini JSON result, source of truth for
--                               the extraction. doc_number / expiry_date below are
--                               denormalised copies kept for the status machine.
--   parsed_at     timestamptz — when the parse ran.
--
-- A successful, high-confidence parse may promote documents.status to 'approved'
-- and populate the existing expiry_date / doc_number columns; a failed or
-- low-confidence parse leaves the doc 'pending' so the profile lands in
-- pending_review — never a silent pass. This migration only creates the storage;
-- document-ocr.ts and the ingest path are the writers.
--
-- Idempotent: all ADD COLUMN IF NOT EXISTS.
-- =============================================================================

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS parse_status text;

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS parse_payload jsonb;

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS parsed_at timestamptz;
