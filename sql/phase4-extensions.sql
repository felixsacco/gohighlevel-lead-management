-- Phase 4 extensions — run once in Supabase SQL editor
--
-- Env (optional):
--   DISPUTE_SLA_ACK_HOURS          — server: first-response target for disputes (default 24)
--   NEXT_PUBLIC_DISPUTE_SLA_ACK_HOURS — shown on /report-issue (default 24)
--   CRON_SECRET + Vercel cron on /api/notifications/process-scheduled — due lifecycle emails

-- Client photo URL shown to assigned tradespeople (dashboard + job context)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS profile_photo_url text;

-- In-app notification centre: mark rows read (see /api/notifications/inbox PATCH)
ALTER TABLE notification_logs ADD COLUMN IF NOT EXISTS read_at timestamptz;

-- Dispute tickets: optional job link + category + SLA acknowledgement target
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS job_id uuid REFERENCES jobs(id) ON DELETE SET NULL;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS dispute_category text;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS sla_acknowledge_by timestamptz;

-- Optional: allow disputes without a chat room (if your DB was created with NOT NULL on chat_room_id, uncomment next line once)
-- ALTER TABLE support_tickets ALTER COLUMN chat_room_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notification_logs_recipient_created
  ON notification_logs (recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_tickets_job_id ON support_tickets(job_id);
