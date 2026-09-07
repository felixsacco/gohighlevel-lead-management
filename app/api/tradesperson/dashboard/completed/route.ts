import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// Wall A (W1): service-role mirror of loadCompletedJobs in
// app/dashboard/tradesperson/page.tsx. jobs + its embedded clients/job_reviews
// reads are anon-revoked, so the dashboard's anon browser client can no longer
// run this query. This route returns the RAW rows; the review-scope filtering and
// from-job-row review synthesis stay client-side (they depend on client_rating /
// client_review columns read from the rows). tradespersonId is caller-supplied
// (Phase-3 residue, same precedent as dashboard-summary) — a READ scoped to the
// caller's own completed jobs.

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const tradespersonId = new URL(request.url).searchParams.get("tradespersonId");
  if (!tradespersonId?.trim()) {
    return NextResponse.json(
      { success: false, error: "tradespersonId is required" },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: "Service unavailable" },
      { status: 503 },
    );
  }

  const { data, error } = await supabase
    .from("jobs")
    .select(
      `
      *,
      clients (
        id,
        first_name,
        last_name,
        email,
        profile_photo_url
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
    `,
    )
    .eq("assigned_tradesperson_id", tradespersonId)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  if (error) {
    console.error("[dashboard/completed] query failed:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, data: data || [] });
}
