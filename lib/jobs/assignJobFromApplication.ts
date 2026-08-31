import type { SupabaseClient } from "@supabase/supabase-js";
import { sendTransactionalEmail } from "@/lib/notifications/email";
import {
  escapeHtml,
  jobReferenceRowHtml,
} from "@/lib/notifications/email-layout";
import { sendNotification } from "@/lib/notifications";
import { clearApplicationRelatedSchedules } from "@/lib/lifecycle/clearApplicationRelatedSchedules";
import { scheduleProgressCheckins } from "@/lib/lifecycle/scheduleProgressCheckins";

export type AssignJobFromApplicationInput = {
  supabaseAdmin: SupabaseClient;
  applicationId: string;
  application: {
    job_id: string;
    tradesperson_id: string;
    quotation_amount: number;
    quotation_notes: string | null;
    applied_at: string | null;
  };
  job: {
    id: string;
    client_id: string;
    trade: string;
    job_description: string;
    postcode: string;
    application_status?: string | null;
    assigned_tradesperson_id?: string | null;
    reference_code?: string | null;
  };
  clientInfo: { id: string; first_name: string; last_name: string; email: string; phone?: string };
  tradeInfo: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  assignedBy: string;
};

export async function assignJobFromApplication(
  input: AssignJobFromApplicationInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const {
    supabaseAdmin,
    applicationId,
    application,
    job,
    clientInfo,
    tradeInfo,
    assignedBy,
  } = input;

  if (job.application_status === "in_progress" && job.assigned_tradesperson_id) {
    return { ok: false, error: "Job is already assigned to a tradesperson" };
  }

  const acceptedAt = new Date().toISOString();
  const { error: jobUpdateError } = await supabaseAdmin
    .from("jobs")
    .update({
      application_status: "in_progress",
      assigned_tradesperson_id: application.tradesperson_id,
      quotation_amount: application.quotation_amount,
      quotation_notes: application.quotation_notes ?? null,
      applied_at: application.applied_at ?? acceptedAt,
      assigned_by: assignedBy,
      assigned_at: acceptedAt,
    })
    .eq("id", application.job_id);

  if (jobUpdateError) {
    console.error("Error updating job:", jobUpdateError);
    return { ok: false, error: "Failed to assign job" };
  }

  const { data: otherApplications } = await supabaseAdmin
    .from("job_applications")
    .select(
      `
        id,
        tradesperson_id,
        tradespeople ( id, email, phone, first_name, last_name )
      `,
    )
    .eq("job_id", application.job_id)
    .neq("id", applicationId)
    .neq("status", "rejected");

  for (const app of otherApplications || []) {
    await supabaseAdmin.from("job_applications").update({ status: "rejected" }).eq("id", app.id);

    const tpEmbed = app.tradespeople as
      | { id: string; email: string; phone?: string; first_name: string; last_name: string }
      | { id: string; email: string; phone?: string; first_name: string; last_name: string }[]
      | null;
    const loser =
      tpEmbed == null ? null : Array.isArray(tpEmbed) ? tpEmbed[0] ?? null : tpEmbed;
    if (loser?.email) {
      try {
        await sendNotification({
          type: "job_not_selected_notification",
          recipientId: String(loser.id),
          recipientEmail: loser.email,
          recipientPhone: loser.phone,
          channels: ["email"],
          idempotencyKey: `job_not_selected:${job.id}:${loser.id}`,
          data: {
            jobId: job.id,
            trade: job.trade,
            selectedName: `${tradeInfo.first_name} ${tradeInfo.last_name}`,
          },
        });
      } catch (e) {
        console.error("Not-selected notification failed:", e);
      }
    }
  }

  try {
    const { error: roomErr } = await supabaseAdmin.from("chat_rooms").insert({
      job_id: application.job_id,
      client_id: job.client_id,
      tradesperson_id: application.tradesperson_id,
      is_active: true,
    });
    if (roomErr && roomErr.code !== "23505") {
      console.error("Chat room create failed (non-fatal):", roomErr);
    }
  } catch (roomErr) {
    console.error("Chat room create failed (non-fatal):", roomErr);
  }

  const jobRefHtml = jobReferenceRowHtml(job.reference_code || "");

  if (clientInfo?.email) {
    try {
      await sendTransactionalEmail({
        to: clientInfo.email,
        subject: "Quote accepted: job assigned",
        html: `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Quote accepted: job assigned</h2>
              ${jobRefHtml}
              <p>Hello ${escapeHtml(`${clientInfo.first_name} ${clientInfo.last_name}`.trim())},</p>
              <p>You have accepted the quote from <strong>${escapeHtml(`${tradeInfo.first_name} ${tradeInfo.last_name}`.trim())}</strong>. The job is now assigned to them on MyApproved.</p>
              <div style="background-color:#f8fafc;padding:16px;border-radius:8px;margin:16px 0;border:1px solid #e2e8f0;">
                <h3 style="margin-top:0;font-size:15px;color:#0f172a;">Job summary</h3>
                <p><strong>Trade:</strong> ${escapeHtml(job.trade)}</p>
                <p><strong>Description:</strong> ${escapeHtml(job.job_description)}</p>
                <p><strong>Location:</strong> ${escapeHtml(job.postcode)}</p>
                <p><strong>Accepted quote (as agreed):</strong> £${escapeHtml(String(application.quotation_amount))}</p>
              </div>
              <p>You can message ${escapeHtml(tradeInfo.first_name)} via <strong>Chat with tradesperson</strong> in your MyApproved client dashboard. Only this tradesperson can proceed with the job.</p>`,
      });
    } catch (e) {
      console.error("Failed to send client confirmation email:", e);
    }
  }

  if (tradeInfo?.email) {
    try {
      await sendTransactionalEmail({
        to: tradeInfo.email,
        subject: "Your quote was accepted: job assigned to you",
        html: `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Quote accepted: assigned to you</h2>
              ${jobRefHtml}
              <p>Dear ${escapeHtml(`${tradeInfo.first_name} ${tradeInfo.last_name}`.trim())},</p>
              <p>The client has accepted your quote on MyApproved. This job is now assigned to you and locked for you only.</p>
              <div style="background-color:#f8fafc;padding:16px;border-radius:8px;margin:16px 0;border:1px solid #e2e8f0;">
                <h3 style="margin-top:0;font-size:15px;color:#0f172a;">Job details</h3>
                <p><strong>Trade:</strong> ${escapeHtml(job.trade)}</p>
                <p><strong>Description:</strong> ${escapeHtml(job.job_description)}</p>
                <p><strong>Location:</strong> ${escapeHtml(job.postcode)}</p>
                <p><strong>Your agreed quote:</strong> £${escapeHtml(String(application.quotation_amount))}</p>
              </div>
              <div style="background-color:#f0f9ff;padding:16px;border-radius:8px;margin:16px 0;border:1px solid #bae6fd;">
                <h3 style="margin-top:0;font-size:15px;color:#0c4a6e;">Client</h3>
                <p><strong>Name:</strong> ${escapeHtml(`${clientInfo?.first_name ?? ""} ${clientInfo?.last_name ?? ""}`.trim())}</p>
                <p><strong>Email:</strong> ${escapeHtml(String(clientInfo?.email || ""))}</p>
              </div>
              <p>Contact the client to arrange the work. The job appears under <strong>In progress</strong> on your MyApproved tradesperson dashboard. Dashboard chat is enabled.</p>`,
      });
    } catch (e) {
      console.error("Failed to send tradesperson quote-acceptance email:", e);
    }
  }

  try {
    if (clientInfo?.email) {
      await sendNotification({
        type: "job_in_progress_client_notice",
        recipientId: String(clientInfo.id),
        recipientEmail: clientInfo.email,
        recipientPhone: clientInfo.phone,
        channels: ["email"],
        idempotencyKey: `job_in_progress_client:${job.id}`,
        data: {
          jobId: job.id,
          trade: job.trade,
          tradespersonName: `${tradeInfo.first_name} ${tradeInfo.last_name}`,
        },
      });
    }

    await sendNotification({
      type: "job_assigned_alert",
      recipientId: String(tradeInfo.id),
      recipientEmail: tradeInfo.email,
      recipientPhone: tradeInfo.phone,
      channels: ["email"],
      idempotencyKey: `job_assigned_alert:${job.id}:${tradeInfo.id}`,
      data: {
        jobId: job.id,
        trade: job.trade,
        job_description: job.job_description,
        postcode: job.postcode,
        quotationAmount: String(application.quotation_amount),
        quotationNotes: application.quotation_notes ?? "",
        assignedBy,
        clientName: `${clientInfo.first_name} ${clientInfo.last_name}`,
      },
    });
  } catch (e) {
    console.error("Assignment notifications failed:", e);
  }

  try {
    await supabaseAdmin.from("admin_activity_log").insert({
      action: "quote_accepted",
      entity_type: "job",
      entity_id: application.job_id,
      details: {
        job_id: application.job_id,
        application_id: applicationId,
        tradesperson_id: application.tradesperson_id,
        tradesperson_name: `${tradeInfo?.first_name ?? ""} ${tradeInfo?.last_name ?? ""}`.trim(),
        assigned_by: assignedBy,
        accepted_at: acceptedAt,
        quotation_amount: application.quotation_amount,
      },
    });
  } catch (logErr) {
    console.error("Failed to write admin_activity_log:", logErr);
  }

  await clearApplicationRelatedSchedules(supabaseAdmin, job.id);
  await scheduleProgressCheckins(supabaseAdmin, { id: job.id, trade: job.trade, clients: clientInfo }, tradeInfo);

  return { ok: true };
}
