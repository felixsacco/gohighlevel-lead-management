import { getSupabaseAdmin } from "@/lib/supabase";
import { assignJobFromApplication } from "@/lib/jobs/assignJobFromApplication";

/**
 * If the job is still open with pending applications, assign the lowest quoted pending application.
 * Guard with ENABLE_AUTO_ASSIGN_JOB=true in production.
 */
export async function runAutoAssignForJob(
  jobId: string,
): Promise<{ done: boolean; reason?: string; applicationId?: string }> {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    console.warn('Supabase admin not available, skipping auto-assign');
    return { done: false, reason: 'supabase_unavailable' };
  }

  const { data: job, error: jobError } = await supabaseAdmin
    .from("jobs")
    .select(
      `
        id,
        client_id,
        trade,
        job_description,
        postcode,
        application_status,
        assigned_tradesperson_id,
        clients ( id, first_name, last_name, email, phone )
      `,
    )
    .eq("id", jobId)
    .single();

  if (jobError || !job) {
    return { done: false, reason: "job_not_found" };
  }

  if (job.application_status !== "open" || job.assigned_tradesperson_id) {
    return { done: true, reason: "already_assigned_or_closed" };
  }

  const { data: apps, error: appsError } = await supabaseAdmin
    .from("job_applications")
    .select(
      `
        id,
        job_id,
        tradesperson_id,
        quotation_amount,
        quotation_notes,
        applied_at,
        status,
        tradespeople (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `,
    )
    .eq("job_id", jobId)
    .eq("status", "pending")
    .order("quotation_amount", { ascending: true, nullsFirst: false });

  if (appsError || !apps?.length) {
    return { done: true, reason: "no_pending_applications" };
  }

  const winner = apps[0];
  const tpEmbed = winner.tradespeople as
    | {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        phone?: string;
      }
    | {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        phone?: string;
      }[]
    | null;
  const tradeInfo =
    tpEmbed == null ? null : Array.isArray(tpEmbed) ? tpEmbed[0] ?? null : tpEmbed;
  const clientEmbed = job.clients as
    | { id: string; first_name: string; last_name: string; email: string; phone?: string }
    | { id: string; first_name: string; last_name: string; email: string; phone?: string }[]
    | null;
  const clientInfo =
    clientEmbed == null
      ? null
      : Array.isArray(clientEmbed)
        ? clientEmbed[0] ?? null
        : clientEmbed;

  if (!tradeInfo?.email || !clientInfo?.email) {
    return { done: false, reason: "missing_contact" };
  }

  const acceptedAt = new Date().toISOString();
  const { error: appUpdErr } = await supabaseAdmin
    .from("job_applications")
    .update({ status: "accepted", accepted_at: acceptedAt })
    .eq("id", winner.id);

  if (appUpdErr) {
    console.error("Auto-assign application update failed:", appUpdErr);
    return { done: false, reason: "application_update_failed" };
  }

  const assignResult = await assignJobFromApplication({
    supabaseAdmin,
    applicationId: winner.id,
    application: {
      job_id: winner.job_id,
      tradesperson_id: winner.tradesperson_id,
      quotation_amount: Number(winner.quotation_amount),
      quotation_notes: winner.quotation_notes,
      applied_at: winner.applied_at,
    },
    job: {
      id: job.id,
      client_id: job.client_id,
      trade: job.trade,
      job_description: job.job_description,
      postcode: job.postcode,
      application_status: job.application_status,
      assigned_tradesperson_id: job.assigned_tradesperson_id,
    },
    clientInfo,
    tradeInfo,
    assignedBy: "auto",
  });

  if (assignResult.ok === false) {
    return { done: false, reason: assignResult.error };
  }

  return { done: true, applicationId: winner.id };
}
