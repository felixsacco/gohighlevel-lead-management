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

    const { data: pendingApps, error: appsError } = await supabase
      .from("job_applications")
      .select(
        `
        id,
        jobs (
          application_status,
          is_approved,
          is_completed
        )
      `,
      )
      .eq("tradesperson_id", userId)
      .eq("status", "pending");

    if (appsError) {
      return NextResponse.json({ error: appsError.message }, { status: 500 });
    }

    let pendingAwaitingCustomer = 0;
    for (const row of pendingApps || []) {
      const j = row.jobs as {
        application_status?: string | null;
        is_approved?: boolean | null;
        is_completed?: boolean | null;
      } | null;
      if (!j) continue;
      if (
        j.application_status === "open" &&
        j.is_approved === true &&
        !j.is_completed
      ) {
        pendingAwaitingCustomer += 1;
      }
    }

    const { count: inProgressCount, error: ipError } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("assigned_tradesperson_id", userId)
      .eq("application_status", "in_progress")
      .eq("is_completed", false);

    if (ipError) {
      return NextResponse.json({ error: ipError.message }, { status: 500 });
    }

    return NextResponse.json({
      pendingAwaitingCustomer,
      inProgressJobs: inProgressCount ?? 0,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 },
    );
  }
}
