import { NextRequest, NextResponse } from "next/server";
import { createGoHighLevelService, createGoHighLevelPrivateService } from "@/lib/gohighlevel-service";
import { getSupabaseAdmin } from "@/lib/supabase";
import { authorizeTradeSession } from "@/lib/auth/trade-session";

const GOHIGHLEVEL_ACCESS_TOKEN = process.env.GOHIGHLEVEL_ACCESS_TOKEN;
const GOHIGHLEVEL_API_KEY = process.env.GOHIGHLEVEL_API_KEY;
const GOHIGHLEVEL_LOCATION_ID = process.env.GOHIGHLEVEL_LOCATION_ID;

function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://myapproved.com"
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: purchaseId } = await params;

  // Session gate first: a checkout link can only be created by the tradesperson
  // who owns this lead purchase. The actor id comes exclusively from the signed
  // trade_session token (Bearer header), never from the request body.
  //
  // NB: compare with `=== false`, not `!auth.ok`. This project runs tsconfig
  // strict:false, where truthiness narrowing of a boolean-typed discriminant
  // does NOT happen (neither `!auth.ok` nor an `else` on `if (auth.ok)`
  // narrows), so `auth.reason` below would not type-check. The explicit
  // comparison narrows the union to the { ok: false } member reliably.
  const auth = authorizeTradeSession(request);
  if (auth.ok === false) {
    if (auth.reason === "not_configured") {
      return NextResponse.json(
        {
          error: "Service unavailable",
          message:
            "Unlocking leads is unavailable because tradesperson sessions are not configured on the server.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      {
        error: "Unauthorized",
        message:
          "A valid tradesperson session is required to unlock a lead. Please sign in to your account and try again.",
      },
      { status: 401 },
    );
  }

  const tradespersonId = auth.claims.sub;

  if (!purchaseId) {
    return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  // Fetch the lead_purchases record with job + tradesperson details
  const { data: purchase, error: purchaseError } = await supabase
    .from("lead_purchases")
    .select(
      "id, job_id, tradesperson_id, lead_price_pence, status, stripe_checkout_session_id, payment_url"
    )
    .eq("id", purchaseId)
    .maybeSingle();

  if (purchaseError || !purchase) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  // Buyer-binding: only the tradesperson who owns this purchase row may create a
  // checkout link for it. Without this, any caller who learns an offered
  // purchase id could trigger a payment link for someone else's lead.
  if (tradespersonId !== purchase.tradesperson_id) {
    return NextResponse.json(
      {
        error: "Forbidden",
        message:
          "This lead belongs to a different tradesperson account. Sign in to the account that unlocked it.",
      },
      { status: 403 },
    );
  }

  if (purchase.status !== "offered") {
    if (purchase.status === "paid") {
      return NextResponse.json(
        { error: "This lead has already been purchased" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "This lead is no longer available" },
      { status: 410 },
    );
  }

  // Sibling-paid guard (P1#1): another tradesperson may already hold a paid
  // purchase for this same job — a concurrent sale the per-row status check
  // above cannot see. A sold lead must not stay purchasable through a stale
  // offered row, so look the whole job up explicitly before minting a link.
  const { data: siblingPaid } = await supabase
    .from("lead_purchases")
    .select("id")
    .eq("job_id", purchase.job_id)
    .eq("status", "paid")
    .maybeSingle();

  if (siblingPaid) {
    return NextResponse.json(
      { error: "This lead has already been purchased" },
      { status: 409 },
    );
  }

  // Checkout idempotency (P2#8): this purchase may already carry a live GHL
  // invoice from an earlier click on the same Unlock button. Minting a second
  // invoice would orphan the first — the webhook matches purchases by
  // stripe_checkout_session_id, so it could only ever see the last one written,
  // and a customer paying the earlier invoice would be charged with no unlock.
  if (purchase.stripe_checkout_session_id) {
    // Legacy rows predate the payment_url column and have no stored URL to hand
    // back. Refuse rather than risk a second invoice for an in-flight purchase.
    if (!purchase.payment_url) {
      return NextResponse.json(
        {
          error: "A payment has already been started for this lead",
          message:
            "Please use the payment link that was already sent to you, or contact support if you were interrupted before paying.",
        },
        { status: 409 },
      );
    }
    // Replay the original hosted payment link — same invoice, same charge.
    return NextResponse.json({ url: purchase.payment_url, reused: true });
  }

  // Fetch job details
  const { data: job } = await supabase
    .from("jobs")
    .select("id, trade, postcode, job_description")
    .eq("id", purchase.job_id)
    .maybeSingle();

  if (!job) {
    return NextResponse.json({ error: "Job no longer exists" }, { status: 404 });
  }

  // Fetch tradesperson details
  const { data: tradesperson } = await supabase
    .from("tradespeople")
    .select("id, first_name, last_name, email, phone")
    .eq("id", purchase.tradesperson_id)
    .maybeSingle();

  if (!tradesperson) {
    return NextResponse.json(
      { error: "Tradesperson not found" },
      { status: 404 },
    );
  }

  // Set up GHL service
  const hasPrivateToken = !!(GOHIGHLEVEL_API_KEY && GOHIGHLEVEL_LOCATION_ID);
  if (!hasPrivateToken && !(GOHIGHLEVEL_ACCESS_TOKEN && GOHIGHLEVEL_LOCATION_ID)) {
    return NextResponse.json(
      { error: "Payment processing is not configured" },
      { status: 503 },
    );
  }

  const ghlService = hasPrivateToken
    ? createGoHighLevelPrivateService(GOHIGHLEVEL_API_KEY!, GOHIGHLEVEL_LOCATION_ID!)
    : createGoHighLevelService(GOHIGHLEVEL_ACCESS_TOKEN!, GOHIGHLEVEL_LOCATION_ID!);

  // Find or create a GHL contact for the tradesperson
  let ghlContactId: string | null = null;
  try {
    const existing = await ghlService.findContactByEmail(tradesperson.email);
    if (existing?.id) {
      ghlContactId = existing.id;
    } else {
      const created = await ghlService.createContact({
        firstName: tradesperson.first_name || "",
        lastName: tradesperson.last_name || "",
        email: tradesperson.email,
        phone: tradesperson.phone || undefined,
        tags: ["tradesperson", "lead-buyer"],
      });
      ghlContactId = created?.id || null;
    }
  } catch (e) {
    console.error("Failed to find/create GHL contact for tradesperson:", e);
    return NextResponse.json(
      { error: "Could not set up payment contact" },
      { status: 502 },
    );
  }

  if (!ghlContactId) {
    return NextResponse.json(
      { error: "Could not create payment contact" },
      { status: 502 },
    );
  }

  const redirectUrl = `${getAppBaseUrl()}/leads/${purchaseId}?payment=success`;
  const description = `Unlock client contact details for ${job.trade || "trade"} job in ${job.postcode || "your area"}`;

  const paymentLink = await ghlService.createPaymentLink({
    contactId: ghlContactId,
    amount: purchase.lead_price_pence || 499,
    description,
    redirectUrl,
  });

  if (!paymentLink?.paymentUrl) {
    return NextResponse.json(
      { error: "Could not create payment link" },
      { status: 502 },
    );
  }

  // Conditional store (P2#8): write the invoice id only if this purchase does not
  // already hold one. Two requests racing past the reuse guard above (both read
  // the row before either wrote) must not orphan a live invoice — the webhook
  // matches purchases by stripe_checkout_session_id, so a second id written over
  // the first would make the customer's earlier payment unmatchable. Only the
  // first writer wins; the loser returns 409 so the client never presents the
  // freshly minted, orphaned link. `payment_url` is stored alongside so a later
  // replay can hand back the original hosted link instead of minting a new one.
  const { data: stored, error: storeError } = await supabase
    .from("lead_purchases")
    .update({
      stripe_checkout_session_id: paymentLink.invoiceId,
      payment_url: paymentLink.paymentUrl,
    })
    .eq("id", purchaseId)
    .is("stripe_checkout_session_id", null)
    .select("id");

  if (storeError) {
    console.error("Failed to record payment link:", storeError);
    return NextResponse.json(
      { error: "Could not record payment link" },
      { status: 500 },
    );
  }

  // Concurrent winner: another request wrote the invoice id between the guard at
  // the top of the handler and this update, so this request's freshly minted
  // invoice would be orphaned if returned. Refuse; the winner's link stands.
  if (!stored || stored.length === 0) {
    return NextResponse.json(
      {
        error: "A payment has already been started for this lead",
        message:
          "A payment link was already created for this lead. Refresh the page to use it.",
      },
      { status: 409 },
    );
  }

  return NextResponse.json({ url: paymentLink.paymentUrl });
}
