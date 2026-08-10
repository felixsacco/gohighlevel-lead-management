import type { SupabaseClient } from "@supabase/supabase-js";

/** Remove scheduled client/tradesperson nudges once a job is assigned or closed. */
export async function clearApplicationRelatedSchedules(
  supabase: SupabaseClient,
  jobId: string,
): Promise<void> {
  await supabase
    .from("scheduled_notifications")
    .delete()
    .eq("dedupe_key", `application_reminder:${jobId}`);
  await supabase
    .from("scheduled_notifications")
    .delete()
    .eq("dedupe_key", `application_reminder_24h:${jobId}`);
  await supabase
    .from("scheduled_notifications")
    .delete()
    .eq("dedupe_key", `application_auto_assign_due:${jobId}`);
  await supabase
    .from("scheduled_notifications")
    .delete()
    .like("dedupe_key", `application_under_review:${jobId}:%`);
}
