import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendTransactionalEmail } from "@/lib/notifications/email";
import { assignJobFromApplication } from "@/lib/jobs/assignJobFromApplication";

export async function POST(request: NextRequest) {
  try {
    const { applicationId, action, clientId } = await request.json() as {
      applicationId?: string;
      action?: string;
      clientId?: string;
    };

    if (!applicationId || !action) {
      return NextResponse.json(
        { error: "Missing required fields: applicationId, action" },
        { status: 400 },
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Use "approve" or "reject".' },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const { data: application, error: fetchError } = await supabaseAdmin
      .from("job_applications")
      .select(
        `
        *,
        jobs (
          id,
          client_id,
          trade,
          job_description,
          postcode,
          budget,
          budget_type,
          application_status,
          assigned_tradesperson_id,
          clients (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        ),
        tradespeople (
          id,
          first_name,
          last_name,
          email,
          trade,
          years_experience,
          hourly_rate,
          phone
        )
      `,
      )
      .eq("id", applicationId)
      .single();

    if (fetchError || !application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const job = application.jobs as {
      id: string;
      client_id: string;
      trade: string;
      job_description: string;
      postcode: string;
      budget?: number;
      budget_type?: string;
      application_status?: string;
      assigned_tradesperson_id?: string | null;
      clients: { id: string; first_name: string; last_name: string; email: string; phone?: string };
    };

    if (clientId != null && String(clientId).trim() !== "") {
      if (String(job.client_id) !== String(clientId)) {
        return NextResponse.json(
          { error: "You can only decide on applications for your own jobs." },
          { status: 403 },
        );
      }
    }

    const clientInfo = job?.clients;
    const tradeInfo = application.tradespeople as {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      trade: string;
      phone?: string;
    };
    const assignedBy = clientId != null && String(clientId).trim() !== "" ? "client" : "admin";

    const newStatus = action === "approve" ? "accepted" : "rejected";
    const acceptedAt = action === "approve" ? new Date().toISOString() : null;
    const { error: updateError } = await supabaseAdmin
      .from("job_applications")
      .update({
        status: newStatus,
        accepted_at: acceptedAt,
      })
      .eq("id", applicationId);

    if (updateError) {
      console.error("Error updating application:", updateError);
      return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
    }

    if (action === "approve" && job) {
      const assignResult = await assignJobFromApplication({
        supabaseAdmin,
        applicationId,
        application: {
          job_id: application.job_id,
          tradesperson_id: application.tradesperson_id,
          quotation_amount: application.quotation_amount,
          quotation_notes: application.quotation_notes ?? null,
          applied_at: application.applied_at,
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
        assignedBy,
      });
      if (assignResult.ok === false) {
        return NextResponse.json({ error: assignResult.error }, { status: 400 });
      }
    }

    if (action === "reject" && tradeInfo?.email) {
      try {
        await sendTransactionalEmail({
          to: tradeInfo.email,
          subject: "Quotation Update - My Approved",
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:8px;">
            <h2 style="color:#2d3748;">Quotation not accepted</h2>
            <p>Dear ${tradeInfo.first_name} ${tradeInfo.last_name},</p>
            <p>Your quotation for the ${job?.trade ?? "job"} in ${job?.postcode ?? ""} was not accepted by the client.</p>
            <p>You can continue to browse and apply for other jobs.</p>
            <p style="color:#888;font-size:0.9em;">&copy; My Approved</p>
          </div>`,
        });
      } catch (e) {
        console.error("Failed to send rejection email:", e);
      }
    }

    return NextResponse.json({
      message:
        action === "approve"
          ? "Quote accepted. Job assigned to " +
            (tradeInfo?.first_name ?? "") +
            " " +
            (tradeInfo?.last_name ?? "") +
            ". You and the tradesperson have been notified."
          : "Quotation rejected.",
      application: {
        id: application.id,
        status: newStatus,
        tradespersonEmail: tradeInfo?.email,
      },
      jobAssigned: action === "approve",
    });
  } catch (error) {
    console.error("Error in approve quotation API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
