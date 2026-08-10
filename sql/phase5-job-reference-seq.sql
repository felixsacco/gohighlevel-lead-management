-- Phase 5: sequential job reference codes (MA-XXXXXX)
-- Replaces the UUID-chunking approach in formatJobReference() with a
-- proper Postgres sequence, so every job gets a stable, sequential code.

-- 1. Sequence
CREATE SEQUENCE IF NOT EXISTS job_reference_seq START 1;

-- 2. Column
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS reference_code TEXT;
ALTER TABLE jobs ADD CONSTRAINT jobs_reference_code_unique UNIQUE (reference_code);

-- 3. Trigger: auto-populate reference_code on insert when NULL
CREATE OR REPLACE FUNCTION set_job_reference_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference_code IS NULL THEN
    NEW.reference_code := 'MA-' || LPAD(nextval('job_reference_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_job_reference_code ON jobs;
CREATE TRIGGER trg_set_job_reference_code
  BEFORE INSERT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION set_job_reference_code();

-- 4. Backfill existing rows (ordered by creation time so earliest → MA-000001)
DO $$
DECLARE
  r RECORD;
  seq INT := 0;
BEGIN
  FOR r IN
    SELECT id FROM jobs
    WHERE reference_code IS NULL
    ORDER BY created_at ASC, id ASC
  LOOP
    seq := seq + 1;
    UPDATE jobs SET reference_code = 'MA-' || LPAD(seq::TEXT, 6, '0') WHERE id = r.id;
  END LOOP;

  -- Advance the sequence past the backfilled values
  PERFORM setval('job_reference_seq', seq);
END $$;

CREATE INDEX IF NOT EXISTS idx_jobs_reference_code ON jobs(reference_code);
