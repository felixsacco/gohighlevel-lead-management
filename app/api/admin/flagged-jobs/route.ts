import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/auth/admin-session";

// Wall A (W1): admin moderation views over flagged/resolved jobs joined with client
// and tradesperson PII. jobs is anon-revoked and flagged jobs are not anon-visible
// post-REVOKE, so the service-role swap alone would WIDEN this from "no anon access"
// to a full PII read. Both handlers are gated on the HttpOnly admin_session cookie
// that /api/admin/proxy/* verifies; anonymous callers get 401 before any DB work.

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "all"; // all, flagged, resolved

    const offset = (page - 1) * limit;

    // Admin-only view: require the HttpOnly admin_session cookie before any DB work.
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

    let query = supabase
      .from("jobs")
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
          email,
          phone
        ),
        tradespeople:assigned_tradesperson_id (
          id,
          first_name,
          last_name,
          trade,
          phone,
          email
        )
      `)
      .order("flagged_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply status filter
    if (status === "flagged") {
      query = query.eq("is_flagged", true);
    } else if (status === "resolved") {
      query = query.eq("is_flagged", false).not("unflagged_at", "is", null);
    } else {
      // For "all", show jobs that are currently flagged OR have been unflagged (have unflagged_at)
      query = query.or("is_flagged.eq.true,unflagged_at.not.is.null");
    }

    const { data: jobs, error } = await query;

    if (error) {
      console.error("Error fetching flagged jobs:", error);
      return NextResponse.json(
        { success: false, message: "Failed to fetch flagged jobs" },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from("jobs")
      .select("id", { count: "exact", head: true });

    if (status === "flagged") {
      countQuery = countQuery.eq("is_flagged", true);
    } else if (status === "resolved") {
      countQuery = countQuery.eq("is_flagged", false).not("unflagged_at", "is", null);
    } else {
      countQuery = countQuery.or("is_flagged.eq.true,unflagged_at.not.is.null");
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error("Error counting flagged jobs:", countError);
    }

    const totalJobs = count || 0;
    const totalPages = Math.ceil(totalJobs / limit);

    return NextResponse.json({
      success: true,
      data: {
        jobs: jobs || [],
        pagination: {
          currentPage: page,
          totalPages,
          totalJobs,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error("Error in flagged jobs API:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET specific flagged job details
export async function POST(request: NextRequest) {
  try {
    const { jobId } = await request.json();

    if (!jobId) {
      return NextResponse.json(
        { success: false, message: "Job ID is required" },
        { status: 400 }
      );
    }

    // Admin-only view: require the HttpOnly admin_session cookie before any DB work.
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

    const { data: job, error } = await supabase
      .from("jobs")
      .select(`
        id,
        trade,
        job_description,
        postcode,
        budget,
        budget_type,
        preferred_date,
        preferred_time,
        images,
        is_flagged,
        flag_reason,
        flagged_at,
        admin_notes,
        unflagged_at,
        unflagged_by,
        created_at,
        application_status,
        quotation_amount,
        quotation_notes,
        clients:client_id (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        tradespeople:assigned_tradesperson_id (
          id,
          first_name,
          last_name,
          trade,
          phone,
          email,
          years_experience,
          hourly_rate
        )
      `)
      .eq("id", jobId)
      .single();

    if (error || !job) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      job
    });

  } catch (error) {
    console.error("Error fetching job details:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

