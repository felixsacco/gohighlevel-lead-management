import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyAdminSecret } from "@/lib/auth/admin-guard";

// Wall A (W1): already gated by verifyAdminSecret above, but the DB work ran on
// the anon key against jobs joined with clients/job_reviews (PII, anon-revoked)
// — the REVOKE would break it. Run on the service-role client instead.

export async function GET(request: NextRequest) {
  // Admin bearer gate (lib/auth/admin-guard): fail closed with 401 before any
  // Supabase/DB work when ADMIN_SECRET_KEY is absent or the token is wrong.
  if (!verifyAdminSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    // Get jobs for the client
    let query: any = supabase.from("jobs");

    query = query.select(
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

    query = query.order("created_at", { ascending: false });
    const { data: jobs, error } = await query;
    if (error) {
      console.error("Error fetching client jobs:", error);
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
