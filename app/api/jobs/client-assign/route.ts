import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendNotification } from "@/lib/notifications";
import { clearApplicationRelatedSchedules } from "@/lib/lifecycle/clearApplicationRelatedSchedules";
import { scheduleProgressCheckins } from "@/lib/lifecycle/scheduleProgressCheckins";

export async function POST(request: NextRequest) {
  try {
    const { jobId, tradespersonId, quotationAmount, quotationNotes, assignedBy } =
      await request.json();

    if (!jobId || !tradespersonId || !quotationAmount || !assignedBy) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: jobId, tradespersonId, quotationAmount, assignedBy",
        },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const { data: job, error: jobError } = await supabaseAdmin
      .from("jobs")
      .select(
        `
        *,
        clients (
          id,
          email,
          phone,
          first_name,
          last_name
        )
      `,
      )
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.application_status === "in_progress" && job.assigned_tradesperson_id) {
      return NextResponse.json(
        { error: "Job is already assigned to a tradesperson" },
        { status: 400 },
      );
    }

    const { data: tradesperson, error: tradespersonError } = await supabaseAdmin
      .from("tradespeople")
      .select("*")
      .eq("id", tradespersonId)
      .single();

    if (tradespersonError || !tradesperson) {
      return NextResponse.json({ error: "Tradesperson not found" }, { status: 404 });
    }

    const { data: existingApplication } = await supabaseAdmin
      .from("job_applications")
      .select("id")
      .eq("job_id", jobId)
      .eq("tradesperson_id", tradespersonId)
      .maybeSingle();

    if (existingApplication) {
      const { error: updateAppError } = await supabaseAdmin
        .from("job_applications")
        .update({
          status: "accepted",
          accepted_at: new Date().toISOString(),
        })
        .eq("id", existingApplication.id);

      if (updateAppError) {
        console.error("Error updating application:", updateAppError);
      }
    } else {
      const { error: createAppError } = await supabaseAdmin
        .from("job_applications")
        .insert({
          job_id: jobId,
          tradesperson_id: tradespersonId,
          quotation_amount: parseFloat(quotationAmount),
          quotation_notes: quotationNotes || "",
          status: "accepted",
          accepted_at: new Date().toISOString(),
        });

      if (createAppError) {
        console.error("Error creating application:", createAppError);
      }
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
      .eq("job_id", jobId)
      .neq("tradesperson_id", tradespersonId)
      .neq("status", "rejected");

    const { error: updateJobError } = await supabaseAdmin
      .from("jobs")
      .update({
        application_status: "in_progress",
        assigned_tradesperson_id: tradespersonId,
        quotation_amount: parseFloat(quotationAmount),
        quotation_notes: quotationNotes || "",
        applied_at: new Date().toISOString(),
        assigned_by: assignedBy,
      })
      .eq("id", jobId);

    if (updateJobError) {
      console.error("Error updating job:", updateJobError);
      return NextResponse.json({ error: "Failed to assign job" }, { status: 500 });
    }

    for (const app of otherApplications || []) {
      await supabaseAdmin
        .from("job_applications")
        .update({ status: "rejected" })
        .eq("id", app.id);

      const tpEmbed = app.tradespeople as
        | { id: string; email: string; phone?: string; first_name: string; last_name: string }
        | { id: string; email: string; phone?: string; first_name: string; last_name: string }[]
        | null;
      const loser =
        tpEmbed == null
          ? null
          : Array.isArray(tpEmbed)
            ? tpEmbed[0] ?? null
            : tpEmbed;
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
              selectedName: `${tradesperson.first_name} ${tradesperson.last_name}`,
            },
          });
        } catch (e) {
          console.error("Not-selected notification failed:", e);
        }
      }
    }

    await clearApplicationRelatedSchedules(supabaseAdmin, job.id);
    await scheduleProgressCheckins(supabaseAdmin, job, tradesperson);

    try {
      if (job.clients?.email) {
        await sendNotification({
          type: "job_in_progress_client_notice",
          recipientId: String(job.clients.id),
          recipientEmail: job.clients.email,
          recipientPhone: job.clients.phone,
          channels: ["email"],
          idempotencyKey: `job_in_progress_client:${job.id}`,
          data: {
            jobId: job.id,
            trade: job.trade,
            tradespersonName: `${tradesperson.first_name} ${tradesperson.last_name}`,
          },
        });
      }

      await sendNotification({
        type: "job_assigned_alert",
        recipientId: String(tradesperson.id),
        recipientEmail: tradesperson.email,
        recipientPhone: tradesperson.phone,
        channels: ["email"],
        idempotencyKey: `job_assigned_alert:${job.id}:${tradesperson.id}`,
        data: {
          jobId: job.id,
          trade: job.trade,
          job_description: job.job_description,
          postcode: job.postcode,
          quotationAmount,
          quotationNotes: quotationNotes || "",
          assignedBy,
          clientName: `${job.clients.first_name} ${job.clients.last_name}`,
        },
      });
    } catch (e) {
      console.error("Assignment notifications failed:", e);
    }

    return NextResponse.json({
      message: "Job assigned successfully!",
      job: {
        id: job.id,
        trade: job.trade,
        status: "in_progress",
        assignedTo: `${tradesperson.first_name} ${tradesperson.last_name}`,
      },
    });
  } catch (error) {
    console.error("Error in client assign job API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
