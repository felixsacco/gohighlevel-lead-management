import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// Wall A (W1): service-role mirror of the filterOutAppliedJobs preamble in
// app/dashboard/tradesperson/page.tsx. job_applications is anon-revoked, so the
// dashboard's anon browser client can no longer read the caller's applied job ids.
// This route returns the RAW { job_id } rows; the client-side exclusion logic that
// consumes them is unchanged. tradespersonId is caller-supplied (Phase-3 residue,
// same precedent as dashboard-summary) — a READ scoped to the caller's own rows.

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
    .select("job_id")
    .eq("tradesperson_id", tradespersonId);

  if (error) {
    console.error("[dashboard/applied-job-ids] query failed:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, data: data || [] });
}
