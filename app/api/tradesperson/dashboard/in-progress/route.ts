import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// Wall A (W1): service-role mirror of loadInProgressJobs in
// app/dashboard/tradesperson/page.tsx. jobs + its embedded clients read is
// anon-revoked, so the dashboard's anon browser client can no longer run this
// query. This route returns the RAW rows; the client-side rendering is
// unchanged. The tradespersonId query param is caller-supplied (Phase-3 residue,
// same precedent as /api/tradesperson/dashboard-summary) — a READ scoped to the
// caller's own assigned jobs.

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
        first_name,
        last_name,
        email,
        profile_photo_url
      )
    `,
    )
    .eq("assigned_tradesperson_id", tradespersonId)
    .eq("application_status", "in_progress")
    .is("completed_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[dashboard/in-progress] query failed:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, data: data || [] });
}
