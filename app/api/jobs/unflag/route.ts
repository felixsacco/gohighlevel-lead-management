import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/auth/admin-session";

// Wall A (W1): admin moderation action — unflags a job and returns the job joined
// with client + tradesperson PII. jobs is anon-revoked and flagged jobs are not
// anon-visible post-REVOKE, so the service-role swap alone would WIDEN this from
// "no anon access" to a full PII read. It is gated on the HttpOnly admin_session
// cookie that /api/admin/proxy/* verifies; anonymous callers get 401 first. The
// body-supplied adminId remains only a display label for the moderation log — only
// an admin_session holder can reach this route at all.

export async function POST(request: NextRequest) {
  try {
    const { jobId, adminNotes, adminId } = await request.json();

    // Validate required fields
    if (!jobId) {
      return NextResponse.json(
        { success: false, message: "Job ID is required" },
        { status: 400 }
      );
    }

    // Admin-only action: require the HttpOnly admin_session cookie before any DB work.
    const session = await verifyAdminSessionToken(
      request.cookies.get(ADMIN_SESSION_COOKIE)?.value
    );
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { success: false, message: "Service unavailable" },
        { status: 503 }
      );
    }

    // Check if the job exists and is flagged
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id, is_flagged, flag_reason, trade, job_description, client_id")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 }
      );
    }

    // Check if job is flagged
    if (!job.is_flagged) {
      return NextResponse.json(
        { success: false, message: "This job is not flagged" },
        { status: 400 }
      );
    }

    // Unflag the job
    const { data: updatedJob, error: updateError } = await supabase
      .from("jobs")
      .update({
        is_flagged: false,
        admin_notes: adminNotes?.trim() || null,
        unflagged_by: adminId || "admin",
        unflagged_at: new Date().toISOString()
      })
      .eq("id", jobId)
      .select(`
        id,
        trade,
        job_description,
        postcode,
        budget,
        budget_type,
        is_flagged,
        flag_reason,
        flagged_at,
        admin_notes,
        unflagged_at,
        unflagged_by,
        created_at,
        clients:client_id (
          id,
          first_name,
          last_name,
          email
        ),
        tradespeople:assigned_tradesperson_id (
          id,
          first_name,
          last_name,
          trade,
          phone
        )
      `)
      .single();

    if (updateError) {
      console.error("Error unflagging job:", updateError);
      return NextResponse.json(
        { success: false, message: "Failed to unflag job. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Job unflagged successfully",
      job: updatedJob
    });

  } catch (error) {
    console.error("Error in unflag job API:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

