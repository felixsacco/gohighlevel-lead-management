import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** Jobs a tradesperson may reference when reporting an issue (applied + in progress). */
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
    const jobsMap = new Map<
      string,
      { id: string; trade: string; postcode: string; application_status: string }
    >();

    const { data: apps } = await supabase
      .from("job_applications")
      .select(
        `
        job_id,
        jobs ( id, trade, postcode, application_status )
      `,
      )
      .eq("tradesperson_id", userId);

    for (const row of apps || []) {
      const embed = row.jobs as
        | {
            id: string;
            trade: string;
            postcode: string;
            application_status: string;
          }
        | {
            id: string;
            trade: string;
            postcode: string;
            application_status: string;
          }[]
        | null;
      const j =
        embed == null ? null : Array.isArray(embed) ? embed[0] ?? null : embed;
      if (j?.id) {
        jobsMap.set(j.id, {
          ...j,
          application_status: j.application_status || "",
        });
      }
    }

    const { data: assigned } = await supabase
      .from("jobs")
      .select("id, trade, postcode, application_status")
      .eq("assigned_tradesperson_id", userId);

    for (const j of assigned || []) {
      jobsMap.set(j.id, {
        id: j.id,
        trade: j.trade,
        postcode: j.postcode,
        application_status: j.application_status || "",
      });
    }

    return NextResponse.json({ jobs: Array.from(jobsMap.values()) });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 },
    );
  }
}
