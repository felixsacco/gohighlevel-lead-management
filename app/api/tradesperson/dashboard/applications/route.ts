import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// Wall A (W1): service-role mirror of loadAppliedJobs in
// app/dashboard/tradesperson/page.tsx. job_applications plus its embedded
// jobs/clients reads are anon-revoked, so the dashboard's anon browser client
// can no longer run this query. This route returns the RAW rows; the client-side
// synthesis is unchanged. The tradespersonId query param is caller-supplied
// (Phase-3 residue, same precedent as /api/tradesperson/dashboard-summary) — this
// is a READ scoped to the caller's own application rows.

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
    .from("job_applications")
    .select(
      `
      *,
      jobs (
        id,
        trade,
        job_description,
        postcode,
        budget,
        budget_type,
        preferred_date,
        images,
        clients (
          first_name,
          last_name,
          email,
          profile_photo_url
        )
      )
    `,
    )
    .eq("tradesperson_id", tradespersonId)
    .order("applied_at", { ascending: false });

  if (error) {
    console.error("[dashboard/applications] query failed:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, data: data || [] });
}
