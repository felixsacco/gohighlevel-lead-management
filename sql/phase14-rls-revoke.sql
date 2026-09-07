-- =============================================================================
-- phase14 — Wall A: close the anon-key PII hole (audit W1)
-- -----------------------------------------------------------------------------
-- Removes every table-level grant the Supabase default privileges gave the anon
-- and authenticated roles over the PII / money / internal tables. After this
-- runs, the anon key (and the `authenticated` role, currently unused) can no
-- longer SELECT or WRITE any of these tables, even where no RLS policy blocks
-- them — table-level grants gate everything, RLS included.
--
-- The public marketplace needs to read approved jobs, so the existing "Public
-- read approved jobs" RLS policy (jobs is RLS-enabled in master-consolidated.sql)
-- is paired with a targeted GRANT SELECT back to anon. Every other anon-key
-- reader/writer in the code must be migrated to the service-role client or a
-- session-gated route handler IN THE SAME change as this migration — run this
-- file only when that code is deployed.
--
-- Idempotent: REVOKE/GRANT emit a notice (not an error) when there is nothing
-- to change, so the file can be re-run.
-- =============================================================================

REVOKE ALL ON public.clients, public.tradespeople, public.lead_purchases,
  public.transactions, public.notification_logs, public.chat_rooms, public.chat_messages,
  public.job_reviews, public.scheduled_notifications, public.job_applications,
  public.jobs, public.leads, public.dead_letter_queue
  FROM anon, authenticated;

-- Public marketplace reads of approved jobs only.
GRANT SELECT ON public.jobs TO anon;
