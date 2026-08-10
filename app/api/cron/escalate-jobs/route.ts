import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { escalateJobs } from "@/lib/matching/round-robin";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 },
    );
  }

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (token !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Service unavailable" },
      { status: 503 },
    );
  }

  try {
    const result = await escalateJobs(supabase);

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error("Cron escalate-jobs failed:", error);
    return NextResponse.json(
      { error: "Escalation failed" },
      { status: 500 },
    );
  }
}
