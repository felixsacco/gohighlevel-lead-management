import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

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
    const { error, count } = await supabase
      .from("places_cache")
      .delete({ count: "exact" })
      .lt("expires_at", new Date().toISOString());

    if (error) {
      console.error("purge-places-cache delete error:", error.message);
      return NextResponse.json(
        { error: "Purge failed" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, deleted: count ?? 0 });
  } catch (err) {
    console.error("Cron purge-places-cache failed:", err);
    return NextResponse.json(
      { error: "Purge failed" },
      { status: 500 },
    );
  }
}
