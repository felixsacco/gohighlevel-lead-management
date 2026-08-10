import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendNotification } from "@/lib/notifications";
import { clearProgressCheckinsForJob } from "@/lib/lifecycle/scheduleProgressCheckins";

/** DB column `jobs.completed_by` is VARCHAR(20) — store role tokens, not emails. */
function resolveCompletedBy(
  completedBy: unknown,
  reviewerType: unknown
): string {
  const t = String(reviewerType || "").toLowerCase().trim();
  if (t === "admin") return "admin";
  if (t === "tradesperson") return "tradesperson";
  if (t === "client") return "client";
  const c = String(completedBy || "").toLowerCase().trim();
  if (c === "admin" || c === "tradesperson" || c === "client") return c;
  if (c.length > 0 && c.length <= 20) return c;
  return "client";
}

export async function POST(request: NextRequest) {
  try {
    const { 
      jobId, 
      completedBy, 
      rating, 
      reviewText,
      reviewerType,
      reviewerId 
    } = await request.json();

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    if (!jobId) {
      return NextResponse.json(
        { error: 'Missing required field: jobId' },
        { status: 400 }
      );
    }

    const completedByDb = resolveCompletedBy(completedBy, reviewerType);
    const ratingNum =
      rating === undefined || rating === null || rating === ""
        ? undefined
        : Number(rating);
    if (
      ratingNum !== undefined &&
      (Number.isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5)
    ) {
      return NextResponse.json(
        { error: "Invalid rating; must be between 1 and 5." },
        { status: 400 }
      );
    }

    // Get job details
    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select(`
        *,
        clients (
          id,
          email,
          phone,
          first_name,
          last_name
        ),
        tradespeople (
          id,
          email,
          phone,
          first_name,
          last_name
        )
      `)
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if job is already completed
    if (job.is_completed) {
      return NextResponse.json(
        { error: 'Job is already completed' },
        { status: 400 }
      );
    }

    // Check if job is in progress
    if (job.application_status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Job must be in progress to be completed' },
        { status: 400 }
      );
    }

    // Update job to completed
    const updateData: any = {
      is_completed: true,
      application_status: 'closed', // Mark as closed so it doesn't appear as available
      completed_at: new Date().toISOString(),
      completed_by: completedByDb
    };

    // Add rating and review if provided
    if (ratingNum !== undefined && reviewText) {
      updateData.client_rating = ratingNum;
      updateData.client_review = reviewText;
      updateData.review_submitted_at = new Date().toISOString();
    }

    const { error: updateError } = await supabaseAdmin
      .from('jobs')
      .update(updateData)
      .eq('id', jobId);

    if (updateError) {
      console.error('Error updating job:', updateError);
      return NextResponse.json(
        {
          error: 'Failed to complete job',
          details: updateError.message,
        },
        { status: 500 }
      );
    }

    await clearProgressCheckinsForJob(supabaseAdmin, jobId);

    const assignedTradespersonId =
      (job as { assigned_tradesperson_id?: string | null })
        .assigned_tradesperson_id ??
      (job.tradespeople as { id?: string } | null | undefined)?.id ??
      null;

    // Add review to job_reviews table if rating and review provided
    if (ratingNum !== undefined && reviewText && reviewerType && reviewerId) {
      const { error: reviewError } = await supabaseAdmin
        .from('job_reviews')
        .insert({
          job_id: jobId,
          tradesperson_id: assignedTradespersonId,
          reviewer_type: reviewerType,
          reviewer_id: reviewerId,
          rating: ratingNum,
          review_text: reviewText,
          reviewed_at: new Date().toISOString(),
        });

      if (reviewError) {
        console.error('Error adding review:', reviewError);
        // Don't fail the completion if review fails
      } else if (job.tradespeople?.email) {
        try {
          await sendNotification({
            type: "review_received_alert",
            recipientId: String(job.tradespeople.id),
            recipientEmail: job.tradespeople.email,
            recipientPhone: job.tradespeople.phone,
            channels: ["email"],
            idempotencyKey: `review_received_alert:${jobId}:${job.tradespeople.id}:${reviewerId}`,
            data: {
              jobId,
              rating: ratingNum,
              review: reviewText,
              reviewerType,
            },
          });
        } catch (e) {
          console.error("review_received_alert on complete failed:", e);
        }
      }
    }

    try {
      const adminInbox = process.env.ADMIN_EMAIL;
      if (adminInbox) {
        await sendNotification({
          type: 'job_completed_alert',
          recipientId: 'admin',
          recipientEmail: adminInbox,
          channels: ['email'],
          idempotencyKey: `job_completed_alert:admin:${job.id}`,
          data: {
            jobId: job.id,
            trade: job.trade,
            completedBy: job.clients?.email || completedByDb,
            rating: ratingNum,
            reviewText,
          },
        });
      }

      if (job.tradespeople?.email) {
        await sendNotification({
          type: "job_completed_alert",
          recipientId: String(job.tradespeople.id),
          recipientEmail: job.tradespeople.email,
          recipientPhone: job.tradespeople.phone,
          channels: ["email"],
          idempotencyKey: `job_completed_alert:tradesperson:${job.id}`,
          data: {
            jobId: job.id,
            trade: job.trade,
            completedBy: job.clients?.email || completedByDb,
            rating: ratingNum,
            reviewText,
          },
        });
      }

      const invoiceNumber = `INV-${String(job.id).replace(/-/g, "").slice(0, 10).toUpperCase()}`;
      const amount = job.quotation_amount || job.budget || 0;
      const clientName = `${job.clients?.first_name || ""} ${job.clients?.last_name || ""}`.trim();
      const tpName = `${job.tradespeople?.first_name || ""} ${job.tradespeople?.last_name || ""}`.trim();

      if (job.clients?.email) {
        await sendNotification({
          type: "invoice_sent_client",
          recipientId: String(job.clients.id),
          recipientEmail: job.clients.email,
          recipientPhone: job.clients.phone,
          channels: ["email"],
          idempotencyKey: `invoice_sent_client:${job.id}`,
          data: {
            jobId: job.id,
            trade: job.trade,
            amount,
            invoiceNumber,
            billedToName: clientName || "Client",
            billedToEmail: job.clients.email,
            completedAt: new Date().toISOString(),
          },
        });
      }

      if (job.tradespeople?.email) {
        await sendNotification({
          type: "invoice_sent_tradesperson",
          recipientId: String(job.tradespeople.id),
          recipientEmail: job.tradespeople.email,
          recipientPhone: job.tradespeople.phone,
          channels: ["email"],
          idempotencyKey: `invoice_sent_tradesperson:${job.id}`,
          data: {
            jobId: job.id,
            trade: job.trade,
            amount,
            invoiceNumber,
            billedToName: tpName || "Tradesperson",
            billedToEmail: job.tradespeople.email,
            completedAt: new Date().toISOString(),
          },
        });
        await sendNotification({
          type: "payment_received",
          recipientId: String(job.tradespeople.id),
          recipientEmail: job.tradespeople.email,
          recipientPhone: job.tradespeople.phone,
          channels: ["email"],
          idempotencyKey: `payment_received:${job.id}`,
          data: {
            jobId: job.id,
            trade: job.trade,
            amount,
            invoiceNumber,
            billedToName: tpName || "Tradesperson",
            billedToEmail: job.tradespeople.email,
          },
        });
      }

      // Only nudge client to leave a review later if they did not already submit one on completion.
      if (!(ratingNum !== undefined && reviewText)) {
        const scheduledFor = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
        await supabaseAdmin.from("scheduled_notifications").upsert(
          {
            event_type: "review_request_delayed",
            recipient_id: job.clients.id,
            recipient_email: job.clients.email,
            recipient_phone: job.clients.phone,
            payload: { jobId: job.id, trade: job.trade },
            scheduled_for: scheduledFor,
            status: "pending",
            dedupe_key: `review_request_delayed:${job.id}`,
          },
          { onConflict: "dedupe_key" },
        );
      }

      if (job.tradespeople?.id && job.tradespeople?.email) {
        await supabaseAdmin.from("scheduled_notifications").upsert(
          {
            event_type: "tradesperson_review_wait_reminder",
            recipient_id: job.tradespeople.id,
            recipient_email: job.tradespeople.email,
            recipient_phone: job.tradespeople.phone,
            payload: { jobId: job.id, trade: job.trade },
            scheduled_for: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
            status: "pending",
            dedupe_key: `tradesperson_review_wait:${job.id}`,
          },
          { onConflict: "dedupe_key" },
        );
      }

      const reengagementRows: Record<string, unknown>[] = [
        {
          event_type: "client_reengagement_60d",
          recipient_id: job.clients.id,
          recipient_email: job.clients.email,
          recipient_phone: job.clients.phone,
          payload: { jobId: job.id, trade: job.trade },
          scheduled_for: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          status: "pending",
          dedupe_key: `client_reengagement_60d:${job.id}`,
        },
      ];
      if (job.tradespeople?.id && job.tradespeople?.email) {
        reengagementRows.push({
          event_type: "tradesperson_winback_60d",
          recipient_id: job.tradespeople.id,
          recipient_email: job.tradespeople.email,
          recipient_phone: job.tradespeople.phone,
          payload: { jobId: job.id, trade: job.trade },
          scheduled_for: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          status: "pending",
          dedupe_key: `tradesperson_winback_60d:${job.id}:${job.tradespeople.id}`,
        });
      }
      for (const row of reengagementRows) {
        await supabaseAdmin
          .from("scheduled_notifications")
          .upsert(row, { onConflict: "dedupe_key" });
      }
    } catch (notificationError) {
      console.error('Error sending/scheduling notifications:', notificationError);
      // Don't fail completion if notifications fail.
    }

    return NextResponse.json({
      success: true,
      message: 'Job completed successfully'
    });

  } catch (error) {
    console.error('Error in job completion API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 