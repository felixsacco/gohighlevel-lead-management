// app/api/leads/[id]/claim/route.ts — reserve an open lead for an authenticated
// tradesperson.
//
// Previously this endpoint read `tradespersonId` from an unauthenticated body,
// which would let anyone claim any lead as any tradesperson or lock every open
// lead for the reservation window. It was therefore disabled behind a 503.
//
// Now the caller must present a server-verified tradesperson session token
// (minted by POST /api/auth/trade/login and verified by lib/auth/trade-session).
// The actor id is derived exclusively from the signed token payload, never from
// the request body, so an arbitrary-ID script cannot impersonate a tradesperson.
//
// Semantics (reservation only, matching the schema's own RLS policy
// "Tradespeople can claim open leads" and the release-expired-claims cron):
//   - The lead must be status 'open' with claimed_by NULL at update time; the
//     conditional UPDATE makes open -> claimed atomic (no lost races).
//   - The claim sets status='claimed' + claim_expires_at = now + 10 minutes.
//     The cron unwinds claimed rows whose claim_expires_at is in the past back
//     to 'open', so an abandoned reservation self-heals.
//   - NO contact detail is granted. A claim reserves the lead; a paid purchase
//     (POST /api/leads/[id]/checkout -> GHL webhook) is what unlocks client
//     details. This route never returns client PII.
//   - Account gates (active / approved / verified) are re-checked from the DB at
//     claim time, so a token does not outlive a disabled account.

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { authorizeTradeSession } from "@/lib/auth/trade-session";

const CLAIM_WINDOW_MS = 10 * 60 * 1000; // 10 minutes, matches release-expired-claims
const CLAIM_WINDOW_MINUTES = 10;

// Reservation projection only. Deliberately no client details: those are
// released on payment, not on claim.
const LEAD_PROJECTION =
  "id, job_id, status, claimed_by, claimed_at, claim_expires_at, price_pence";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = authorizeTradeSession(request);
  // NB: compare with `=== false`, not `!auth.ok`. This project runs tsconfig
  // strict:false, where truthiness narrowing of a boolean-typed discriminant
  // does NOT happen (neither `!auth.ok` nor an `else` on `if (auth.ok)`
  // narrows), so `auth.reason` below would not type-check. The explicit
  // comparison narrows the union to the { ok: false } member reliably.
  if (auth.ok === false) {
    if (auth.reason === "not_configured") {
      return NextResponse.json(
        {
          error: "Service unavailable",
          message:
            "Lead claiming is unavailable because tradesperson sessions are not configured on the server.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      {
        error: "Unauthorized",
        message:
          "A valid tradesperson session is required to claim a lead. Please sign in to your account and try again.",
      },
      { status: 401 },
    );
  }

  const tradespersonId = auth.claims.sub;
  const { id: leadId } = await params;

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  // Fresh account gate at claim time: the signed token identifies the caller,
  // but an account disabled after login must not keep claiming leads.
  const { data: tradesperson, error: accountError } = await admin
    .from("tradespeople")
    .select("id, is_active, is_approved, is_verified")
    .eq("id", tradespersonId)
    .maybeSingle();

  if (accountError) {
    console.error("Claim: account lookup failed:", accountError.message);
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  if (
    !tradesperson ||
    !tradesperson.is_active ||
    !tradesperson.is_approved ||
    !tradesperson.is_verified
  ) {
    return NextResponse.json(
      {
        error: "Forbidden",
        message:
          "Your account is not eligible to claim leads. Please contact support if you believe this is a mistake.",
      },
      { status: 403 },
    );
  }

  const { data: lead, error: leadError } = await admin
    .from("leads")
    .select(LEAD_PROJECTION)
    .eq("id", leadId)
    .maybeSingle();

  if (leadError) {
    console.error("Claim: lead lookup failed:", leadError.message);
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  if (!lead) {
    return NextResponse.json(
      { error: "Not found", message: "This lead does not exist." },
      { status: 404 },
    );
  }

  // Idempotent re-claim: the same caller reserving the same lead again is not
  // an error. Any other non-open state is a conflict.
  if (lead.status === "claimed" && lead.claimed_by === tradespersonId) {
    return NextResponse.json({
      lead,
      message: "You already hold this lead. It stays reserved until you check out or the reservation expires.",
    });
  }

  if (lead.status !== "open" || lead.claimed_by !== null) {
    const messageByStatus: Record<string, string> = {
      claimed: "This lead has already been claimed by another tradesperson.",
      paid: "This lead has already been purchased.",
      expired: "This lead has expired.",
      cancelled: "This lead has been cancelled.",
    };
    return NextResponse.json(
      {
        error: "Conflict",
        message:
          messageByStatus[lead.status] ??
          "This lead is no longer available to claim.",
      },
      { status: 409 },
    );
  }

  const now = new Date();
  const claimedAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + CLAIM_WINDOW_MS).toISOString();

  // Atomic open -> claimed. The status/claimed_by predicates are evaluated
  // under the row update, so two simultaneous claims cannot both succeed.
  const { data: claimed, error: updateError } = await admin
    .from("leads")
    .update({
      status: "claimed",
      claimed_by: tradespersonId,
      claimed_at: claimedAt,
      claim_expires_at: expiresAt,
    })
    .eq("id", leadId)
    .eq("status", "open")
    .eq("claimed_by", null)
    .select(LEAD_PROJECTION)
    .maybeSingle();

  if (updateError) {
    console.error("Claim: update failed:", updateError.message);
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  if (!claimed) {
    // Lost the race between our read and the atomic update.
    return NextResponse.json(
      {
        error: "Conflict",
        message:
          "This lead was just claimed by another tradesperson. Please try another lead.",
      },
      { status: 409 },
    );
  }

  return NextResponse.json({
    lead: claimed,
    message: `Lead reserved for ${CLAIM_WINDOW_MINUTES} minutes. Complete checkout before the reservation expires to receive the client's details.`,
  });
}
