import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { business_name, action_type, user_session_id, timestamp, metadata } =
      await req.json();

    await supabase.from("admin_activity_log").insert({
      action: action_type,
      entity_type: "google_place",
      entity_id: business_name ?? "unknown",
      details: {
        business_name,
        action_type,
        user_session_id,
        timestamp: timestamp ?? new Date().toISOString(),
        ...metadata,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    // Non-blocking — never surface tracking errors to the client
    console.error("places/track error:", err?.message);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
