import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { authorizeTradeSession } from "@/lib/auth/trade-session";

// Wall A (W1): service-role writer mirroring the onAvatarChange handler in
// app/dashboard/tradesperson/page.tsx. The original ran an anon-key upload to the
// private 'documents' bucket plus an anon UPDATE of tradespeople.profile_picture_url
// — both revoked under Wall A.
//
// The actor id comes exclusively from the signed session token (auth.claims.sub);
// the request body carries only the file. The DB UPDATE is scoped .eq("id", sub),
// so one tradesperson cannot overwrite another's profile picture.
//
// Storage note: 'documents' is a private bucket, so the stored public URL 404s for
// a bare <img> — that was already the case before this route. The dashboard client
// keeps its FileReader dataURL local-preview + localStorage fallback (it runs on
// every change regardless of this route's outcome), so display never regresses;
// this route exists to persist the upload durably rather than to serve it.

export async function POST(request: NextRequest) {
  const auth = authorizeTradeSession(request);
  // NB: compare with `=== false`, not `!auth.ok` — tsconfig strict:false does not
  // narrow a boolean-typed discriminant, so the explicit comparison is required
  // for `auth.reason` to type-check. Same idiom as /api/leads/[id]/claim.
  if (auth.ok === false) {
    if (auth.reason === "not_configured") {
      return NextResponse.json(
        {
          error: "Service unavailable",
          message:
            "Tradesperson sessions are not configured on the server, so updating your profile picture is unavailable.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      {
        error: "Unauthorized",
        message:
          "A valid tradesperson session is required. Please sign in to your account and try again.",
      },
      { status: 401 },
    );
  }

  const tradespersonId = auth.claims.sub;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid input", message: "Expected a multipart body." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json(
      { error: "Invalid input", message: "A profile image file is required." },
      { status: 400 },
    );
  }

  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `avatars/${tradespersonId}-${Date.now()}.${fileExt}`;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Service unavailable" },
      { status: 503 },
    );
  }

  // Vercel Functions accept request bodies up to 100 MB; supabase-js uploads
  // the File (a Blob) directly, matching the register-route upload idiom.
  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(path, file, { upsert: false });

  if (uploadError) {
    console.error("[dashboard/avatar] upload failed:", uploadError.message);
    return NextResponse.json(
      { error: uploadError.message },
      { status: 500 },
    );
  }

  // supabase-js v2 idiom: getPublicUrl returns { data: { publicUrl } }.
  const { data: pub } = supabase.storage.from("documents").getPublicUrl(path);
  const url = pub?.publicUrl || null;
  if (!url) {
    return NextResponse.json(
      { error: "Upload succeeded but no public URL was returned." },
      { status: 500 },
    );
  }

  const { error: updateError } = await supabase
    .from("tradespeople")
    .update({ profile_picture_url: url })
    .eq("id", tradespersonId);

  if (updateError) {
    console.error("[dashboard/avatar] profile update failed:", updateError.message);
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, url });
}
