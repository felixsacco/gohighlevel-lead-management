import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  authorizeTradeSession,
  TRADE_SESSION_COOKIE,
  verifyTradeSessionToken,
  type TradeSessionResult,
} from "@/lib/auth/trade-session";

// Resolve the caller from either credential the client may hold: the Bearer
// token in localStorage (what unlock-button.tsx sends) or the HttpOnly
// trade_session cookie (what the server-rendered /leads/[id] page itself is
// authenticated by).
function authorizeRequest(request: NextRequest): TradeSessionResult {
  const bearer = authorizeTradeSession(request);
  if (bearer.ok) return bearer;
  const cookieValue = request.cookies.get(TRADE_SESSION_COOKIE)?.value;
  if (!cookieValue) return bearer;
  return verifyTradeSessionToken(cookieValue);
}

// Owner-scoped payment-status probe used by the ?payment=success confirmation
// poller (payment-confirmation.tsx). Returns only { isPaid } for the caller's
// own purchase — never any other PII.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = authorizeRequest(request);
  if (auth.ok === false) {
    if (auth.reason === "not_configured") {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const tradespersonId = auth.claims.sub;

  const { id: purchaseId } = await params;
  if (!purchaseId) {
    return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const { data: purchase, error } = await supabase
    .from("lead_purchases")
    .select("tradesperson_id, status")
    .eq("id", purchaseId)
    .maybeSingle();

  if (error) {
    console.error("Lead status lookup error:", error);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
  if (!purchase) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  // Owner-scoped: never reveal another tradesperson's payment state.
  if (purchase.tradesperson_id !== tradespersonId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ isPaid: purchase.status === "paid" });
}
