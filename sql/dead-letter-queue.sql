-- Dead-letter queue: central audit table for failed asynchronous operations.
-- Any background worker hop (notification dispatch, CRM sync, etc.) that throws
-- is recorded here with its full payload and error trace so it can be re-driven
-- safely without ever dropping the original work item.
-- Run in Supabase SQL editor. Idempotent — safe to re-run.

-- 1. dead_letter_queue table
CREATE TABLE IF NOT EXISTS public.dead_letter_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_name TEXT NOT NULL,
    payload JSONB NOT NULL,
    error_message TEXT NOT NULL,
    retry_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'failed', -- 'failed', 'retrying', 'resolved'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Status + task lookup for re-drive sweeps
CREATE INDEX IF NOT EXISTS idx_dlq_status_task ON public.dead_letter_queue(status, task_name);

-- 3. RLS: enable with ZERO policies. Payloads carry customer PII (names, emails,
-- phones, job descriptions), so the table must be service-role-only — no anon or
-- authenticated client reads/writes. The resilience wrapper writes through the
-- service-role client (getSupabaseAdmin), which bypasses RLS.
ALTER TABLE public.dead_letter_queue ENABLE ROW LEVEL SECURITY;

-- 4. Keep updated_at fresh on every change so re-drive tracking (status flips to
-- 'retrying' / 'resolved') reflects when the row last moved.
CREATE OR REPLACE FUNCTION public.touch_dlq_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_dlq_touch_updated_at ON public.dead_letter_queue;
CREATE TRIGGER trg_dlq_touch_updated_at
  BEFORE UPDATE ON public.dead_letter_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_dlq_updated_at();
