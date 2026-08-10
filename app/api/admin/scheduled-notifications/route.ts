import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** Admin: upcoming scheduled notification rows (lifecycle / campaigns). */
export async function GET(request: NextRequest) {
  try {
    const status = new URL(request.url).searchParams.get("status") || "pending";
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    let q = supabase
      .from("scheduled_notifications")
      .select("*")
      .order("scheduled_for", { ascending: true })
      .limit(200);

    if (status !== "all") {
      q = q.eq("status", status);
    }

    const { data, error } = await q;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data || [] });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 },
    );
  }
}
