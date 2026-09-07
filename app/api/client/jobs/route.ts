import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/auth/admin-session";

// Wall A (W1): this route reads jobs joined with clients, job_applications and
// tradespeople — PII, all anon-revoked — so it runs entirely on the service-role
// client (no more anon fallback). Authorization:
//   - userId supplied: the caller's own-jobs view (client dashboard /
//     report-issue). It was already service-role; the caller-supplied userId has
//     no session binding because there is no server-side client-session verifier
//     yet — full owner-scoping lands with the Phase-3 client-session work.
//   - no userId: an administrative all-jobs view. It previously rode on the anon
//     key (RLS silently limited it to approved jobs); with the anon grants
//     revoked it must be gated explicitly, so it now requires the same HttpOnly
//     admin_session cookie that /api/admin/proxy/* verifies. Anonymous callers
//     get 401 instead of a PII dump.

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // Validate userId if provided
    if (userId && (userId === "undefined" || userId === "null" || !userId.trim())) {
      return NextResponse.json(
        { error: "Invalid user ID provided" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    // Admin all-jobs branch (no userId): gate on the admin session cookie before
    // any DB work, so the unfiltered jobs+clients read is no longer open.
    if (!userId) {
      const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
      const session = await verifyAdminSessionToken(sessionCookie);
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const jobsTable = supabase.from("jobs");
    const withUserFilter = userId
      ? jobsTable
          .select(
            `
        *,
        tradespeople (
          id,
          first_name,
          last_name,
          trade,
          years_experience,
          hourly_rate,
          phone,
          email
        ),
        job_applications (
          id,
          status,
          quotation_amount,
          quotation_notes,
          applied_at,
          accepted_at,
          tradespeople (
            id,
            first_name,
            last_name,
            trade,
            phone,
            email,
            years_experience,
            hourly_rate
          )
        ),
        job_reviews (
          id,
          tradesperson_id,
          reviewer_type,
          reviewer_id,
          rating,
          review_text,
          reviewed_at
        )
      `
          )
          .eq("client_id", userId)
      : jobsTable.select(
          `
        *,
         clients (
          id,
          email,
          first_name,
          last_name
        ),
        job_reviews (
          id,
          tradesperson_id,
          reviewer_type,
          reviewer_id,
          rating,
          review_text,
          reviewed_at
        )
      `
        );

    const { data: jobs, error } = await withUserFilter.order(
      "created_at",
      { ascending: false }
    );
    if (error) {
      console.error("Error fetching client jobs:", error);
      
      // Provide more specific error messages
      if (error.code === '22P02') {
        return NextResponse.json(
          { error: "Invalid user ID format. Please log in again." },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: "Failed to fetch jobs" },
        { status: 500 }
      );
    }

    return NextResponse.json({ jobs: jobs || [] });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
