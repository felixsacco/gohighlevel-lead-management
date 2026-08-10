import { NextResponse } from "next/server";

/**
 * Tells you exactly why /api/places is failing — without leaking the API key.
 *
 * Visit /api/places/diagnose in your browser. The response will say one of:
 *
 *   {ok:false, reason:"missing_env"}
 *     -> GOOGLE_SERVER_API_KEY is not set on Vercel for this environment.
 *
 *   {ok:false, reason:"google_rejected", httpStatus:403, error:{status:"PERMISSION_DENIED",
 *     message:"Places API (New) has not been used in project..."}}
 *     -> The "Places API (New)" service is not enabled, the key is paused,
 *        the project has no billing, or referrer/IP restrictions block
 *        server-side use of the key.
 *
 *   {ok:false, reason:"google_rejected", httpStatus:400, ...}
 *     -> Usually a malformed request or quota.
 *
 *   {ok:true, sample:{...}} -> Working. Probably a UI issue, not the key.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.GOOGLE_SERVER_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        reason: "missing_env",
        message:
          "GOOGLE_SERVER_API_KEY is not set in this Vercel environment. Add it under Project Settings → Environment Variables (Production) and redeploy.",
      },
      { status: 200 }
    );
  }

  // Tiny probe call. Costs basically nothing because we restrict the field
  // mask to just displayName.
  let res: Response;
  try {
    res = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "places.displayName",
        },
        body: JSON.stringify({
          textQuery: "plumber near me",
          maxResultCount: 1,
          languageCode: "en-GB",
        }),
        cache: "no-store",
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        reason: "network_error",
        message: err?.message || "Could not reach Google Places servers.",
      },
      { status: 200 }
    );
  }

  const bodyText = await res.text();
  let parsed: any = null;
  try {
    parsed = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    parsed = null;
  }

  if (!res.ok) {
    return NextResponse.json(
      {
        ok: false,
        reason: "google_rejected",
        httpStatus: res.status,
        keyHint: `…${apiKey.slice(-4)}`,
        error: parsed?.error ?? null,
        rawSnippet: bodyText.slice(0, 500),
      },
      { status: 200 }
    );
  }

  const sample = parsed?.places?.[0]?.displayName?.text || null;
  return NextResponse.json(
    {
      ok: true,
      keyHint: `…${apiKey.slice(-4)}`,
      sample,
      message:
        sample === null
          ? "Google responded successfully but returned zero places. The key works; check the textQuery/locationBias on /api/places."
          : `Google Places (New) is working. First result: ${sample}`,
    },
    { status: 200 }
  );
}
