import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const userId = new URL(request.url).searchParams.get("userId");
    if (!userId?.trim()) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
    const { data: jobs, error } = await supabase
      .from("jobs")
      .select(
        `
        id,
        is_approved,
        is_completed,
        application_status,
        job_applications ( id, status )
      `,
      )
      .eq("client_id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let pendingApplications = 0;
    let openLiveJobs = 0;
    for (const j of jobs || []) {
      const open =
        j.is_approved === true &&
        !j.is_completed &&
        j.application_status === "open";
      if (open) openLiveJobs += 1;
      if (!open) continue;
      const apps = (j.job_applications || []) as { status: string }[];
      pendingApplications += apps.filter((a) => a.status === "pending").length;
    }

    return NextResponse.json({
      pendingApplications,
      openLiveJobs,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 },
    );
  }
}
