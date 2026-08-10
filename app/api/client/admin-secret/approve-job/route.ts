import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendNotification } from "@/lib/notifications";
import { notifyMatchingTradespeopleForJob } from "@/lib/notifications/notify-tradespeople-job-match";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
    const { jobId } = await request.json();

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Get job details with client information
    const { data: job, error: fetchError } = await supabaseAdmin
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
      `
      )
      .eq("id", jobId)
      .single();

    if (fetchError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Update job to approved
    const { error: updateError } = await supabaseAdmin
      .from("jobs")
      .update({
        is_approved: true,
        status: "approved",
        approved_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    if (updateError) {
      console.error("Error updating job:", updateError);
      return NextResponse.json(
        { error: "Failed to approve job" },
        { status: 500 }
      );
    }

    await sendNotification({
      type: "job_live_status",
      recipientId: String(job.clients.id),
      recipientEmail: job.clients.email,
      recipientPhone: job.clients.phone,
      channels: ["email"],
      idempotencyKey: `job_live_status:${job.id}`,
      data: { jobId: job.id, trade: job.trade, postcode: job.postcode },
    });

    try {
      await notifyMatchingTradespeopleForJob(supabaseAdmin, {
        id: job.id,
        trade: job.trade,
        postcode: job.postcode,
        job_description: job.job_description,
        budget: job.budget,
        budget_type: job.budget_type,
        client_id: job.client_id,
      });
    } catch (e) {
      console.error("Tradespeople job-match notifications failed", e);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Approve job error", e);
    return NextResponse.json(
      { error: "Failed to approve job" },
      { status: 500 }
    );
  }
}