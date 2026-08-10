import type { SupabaseClient } from "@supabase/supabase-js";

type ClientRow = { id: string; email: string; phone?: string; first_name?: string; last_name?: string };
type JobRow = { id: string; trade: string; clients: ClientRow | null };
type TpRow = { id: string; email: string; phone?: string; first_name?: string; last_name?: string };

const CHECKIN_OFFSETS_MS = [24 * 60 * 60 * 1000, 72 * 60 * 60 * 1000];

/** After assign: gentle prompts for progress photos / check-in while job is in progress. */
export async function scheduleProgressCheckins(
  supabase: SupabaseClient,
  job: JobRow,
  tradesperson: TpRow,
): Promise<void> {
  const client = job.clients;
  if (!client?.email || !tradesperson?.email) return;

  for (const ms of CHECKIN_OFFSETS_MS) {
    const when = new Date(Date.now() + ms).toISOString();
    const hours = ms / 3600000;
    await supabase.from("scheduled_notifications").upsert(
      {
        event_type: "job_progress_checkin",
        recipient_id: client.id,
        recipient_email: client.email,
        recipient_phone: client.phone,
        payload: {
          jobId: job.id,
          trade: job.trade,
          role: "client",
          hoursLabel: `${hours}h`,
        },
        scheduled_for: when,
        status: "pending",
        dedupe_key: `job_progress_checkin:client:${job.id}:${hours}h`,
      },
      { onConflict: "dedupe_key" },
    );
    await supabase.from("scheduled_notifications").upsert(
      {
        event_type: "job_progress_checkin",
        recipient_id: tradesperson.id,
        recipient_email: tradesperson.email,
        recipient_phone: tradesperson.phone,
        payload: {
          jobId: job.id,
          trade: job.trade,
          role: "tradesperson",
          hoursLabel: `${hours}h`,
        },
        scheduled_for: when,
        status: "pending",
        dedupe_key: `job_progress_checkin:tp:${job.id}:${hours}h`,
      },
      { onConflict: "dedupe_key" },
    );
  }
}

export async function clearProgressCheckinsForJob(
  supabase: SupabaseClient,
  jobId: string,
): Promise<void> {
  await supabase
    .from("scheduled_notifications")
    .delete()
    .like("dedupe_key", `job_progress_checkin:%:${jobId}:%`);
}
