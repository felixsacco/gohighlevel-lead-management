import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { authorizeTradeSession } from "@/lib/auth/trade-session";

// Wall A (W1): service-role writer mirroring the updateSearchRadius handler in
// app/dashboard/tradesperson/page.tsx. tradespeople is anon-revoked, so the
// dashboard's anon browser client can no longer UPDATE the caller's own row.
//
// The actor id comes exclusively from the signed session token (auth.claims.sub)
// — never from the request body, which carries only the radius value. Scoping
// the UPDATE to .eq("id", sub) means one tradesperson cannot rewrite another's
// search radius.

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
            "Tradesperson sessions are not configured on the server, so updating your profile is unavailable.",
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

  let radius: unknown;
  try {
    const body = await request.json();
    radius = (body as Record<string, unknown>).radius;
  } catch {
    return NextResponse.json(
      { error: "Invalid input", message: "Expected a JSON body." },
      { status: 400 },
    );
  }

  if (typeof radius !== "number" || !Number.isFinite(radius) || radius < 0) {
    return NextResponse.json(
      {
        error: "Invalid input",
        message: "search radius must be a non-negative number.",
      },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Service unavailable" },
      { status: 503 },
    );
  }

  const { error } = await supabase
    .from("tradespeople")
    .update({ search_radius_km: radius })
    .eq("id", tradespersonId);

  if (error) {
    console.error("[dashboard/radius] update failed:", error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
