import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// The handler is exported for BOTH GET and POST. Vercel cron fires GET requests
// (vercel.json schedules this route every minute), and before the GET export
// existed a cron tick got a 405 and expired 10-minute claims stayed locked
// forever. POST is kept so the job can also be run manually/curl'd.
async function handle(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 },
    );
  }

  const token =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (token !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  try {
    const { data: released, error } = await supabase
      .from("leads")
      .update({
        status: "open",
        claimed_by: null,
        claimed_at: null,
        claim_expires_at: null,
      })
      .eq("status", "claimed")
      .lt("claim_expires_at", new Date().toISOString())
      .select("id");

    if (error) {
      console.error("[cron/release-expired-claims] Update failed:", error.message);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    const count = released?.length ?? 0;
    console.log(`[cron/release-expired-claims] Released ${count} expired claim(s)`);

    return NextResponse.json({ ok: true, released: count });
  } catch (e) {
    console.error(
      "[cron/release-expired-claims] Failed:",
      e instanceof Error ? e.message : String(e),
    );
    return NextResponse.json({ error: "Release failed" }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
