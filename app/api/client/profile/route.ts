import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const clientId = new URL(request.url).searchParams.get("clientId");
    if (!clientId?.trim()) {
      return NextResponse.json({ error: "clientId is required" }, { status: 400 });
    }
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
    const { data, error } = await supabase
      .from("clients")
      .select("id, profile_photo_url, first_name, last_name, email")
      .eq("id", clientId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ client: data });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { clientId, profilePhotoUrl } = await request.json() as {
      clientId?: string;
      profilePhotoUrl?: string | null;
    };

    if (!clientId?.trim()) {
      return NextResponse.json({ error: "clientId is required" }, { status: 400 });
    }

    const url =
      profilePhotoUrl == null || profilePhotoUrl === ""
        ? null
        : String(profilePhotoUrl).trim().slice(0, 2048);

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
    const { data, error } = await supabase
      .from("clients")
      .update({ profile_photo_url: url })
      .eq("id", clientId)
      .select("id, profile_photo_url")
      .single();

    if (error) {
      console.error("Client profile update:", error);
      return NextResponse.json(
        {
          error:
            "Could not update profile. If this persists, run sql/phase4-extensions.sql in Supabase.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, client: data });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 },
    );
  }
}
