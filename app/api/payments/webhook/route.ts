import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendNotification } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  // --- Webhook signature verification (fail-open bridge until reconciled) ---
  // GoHighLevel's signing scheme has not yet been confirmed against a live GHL
  // delivery. Until GHL_WEBHOOK_SECRET is set AND a genuine GHL-signed sample has
  // been captured, signature verification is a *configuration* that fails open:
  //
  //   * If GHL_WEBHOOK_SECRET is set  -> enforced. A delivery without a matching
  //     signature is rejected (401). Header is read from
  //     GHL_WEBHOOK_SIGNATURE_HEADER (default "x-ghl-signature"), with
  //     "x-leadconnector-signature" accepted as a fallback so the real GHL header
  //     name does not require an env change to align.
  //   * If GHL_WEBHOOK_SECRET is unset -> the delivery is processed anyway and a
  //     loud warning is logged. This is the bridge that lets real GHL deliveries
  //     through so the actual payload shape / identifier can be observed before
  //     the secret is pinned. Set the secret to switch enforcement on.
  const secret = process.env.GHL_WEBHOOK_SECRET;

  const rawBody = await request.text();

  if (!secret) {
    console.warn(
      "Payments webhook: GHL_WEBHOOK_SECRET not set — signature verification SKIPPED " +
        "(fail-open bridge). Set GHL_WEBHOOK_SECRET to enforce."
    );
  } else {
    const signatureHeaderName =
      process.env.GHL_WEBHOOK_SIGNATURE_HEADER?.trim() || "x-ghl-signature";

    let signature = request.headers.get(signatureHeaderName);
    // Tolerate the alternative GHL header name without an env change.
    if (!signature && signatureHeaderName !== "x-leadconnector-signature") {
      signature = request.headers.get("x-leadconnector-signature");
    }
    if (!signature && signatureHeaderName !== "x-ghl-signature") {
      signature = request.headers.get("x-ghl-signature");
    }

    if (!signature) {
      console.error("Payments webhook: missing signature header", { signatureHeaderName });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
    const prefix = process.env.GHL_WEBHOOK_SIGNATURE_PREFIX || "";
    const received = prefix && signature.startsWith(prefix)
      ? signature.slice(prefix.length)
      : signature;
    const expectedBuffer = Buffer.from(expected, "utf8");
    const receivedBuffer = Buffer.from(received, "utf8");
    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      console.error("Payments webhook: signature mismatch", { signatureHeaderName });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error("Payments webhook: Supabase admin not available");
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Normalize the envelope: GHL wraps some events under `payload`, while direct
  // invoice/order triggers put the fields at the top level. Resolve the inner
  // object so every field read below works for either shape.
  const payload =
    body && typeof body.payload === "object" && body.payload !== null ? body.payload : body;

  const invoiceId = payload._id || payload.invoiceId || body._id || body.invoiceId;
  const eventStatus = payload.status || body.status;
  const eventType = payload.type || body.type;

  // Accept the signals GHL uses for a settled payment: a top-level status of
  // "paid", or an invoice/order success event type. Anything else is a
  // non-payment or pre-payment trigger and is ignored.
  const isPaid =
    eventStatus === "paid" ||
    (typeof eventType === "string" &&
      ["InvoicePaid", "invoice.paid", "order.success", "payment.success"].includes(eventType));

  console.log("Payments webhook received:", { invoiceId, eventStatus, eventType, isPaid });

  if (!invoiceId) {
    return NextResponse.json({ error: "Missing invoice id" }, { status: 400 });
  }

  if (!isPaid) {
    return NextResponse.json({ received: true, action: "ignored", reason: "status not paid" });
  }

  // Find the lead_purchases row by EITHER stored identifier. stripe_checkout_session_id
  // is the legacy column (it has held the GHL invoice id since the pre-GHL Stripe
  // integration); ghl_invoice_id is the dedicated column added by the phase16
  // migration and backfilled from the legacy one. A real GHL delivery may carry an
  // id that maps to only one of them, so both are tried. NOTE: this query
  // references ghl_invoice_id, so the phase16 migration MUST be applied to Supabase
  // before this handler deploys, or every delivery fails with "column does not exist".
  const { data: purchase, error: lookupError } = await supabase
    .from("lead_purchases")
    .select("id, job_id, tradesperson_id, status, lead_price_pence")
    .or(`stripe_checkout_session_id.eq.${invoiceId},ghl_invoice_id.eq.${invoiceId}`)
    .maybeSingle();

  if (lookupError) {
    console.error("Payments webhook: error looking up purchase", lookupError);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }

  if (!purchase) {
    // Loud, structured capture of the unmatched delivery so the true identifier
    // GHL sends can be reconciled against the stored columns on first delivery.
    const idCandidateKeys = Object.keys(body).filter((k) =>
      /_?id|invoice|payment|order|charge|_id/i.test(k)
    );
    console.warn("Payments webhook: no purchase found for invoice", {
      invoiceId,
      eventStatus,
      eventType,
      matchedColumns: ["stripe_checkout_session_id", "ghl_invoice_id"],
      deliveryIdFields: idCandidateKeys.map((k) => ({ field: k, value: body[k] })),
    });
    return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  }

  // W2: delivery-id idempotency, independent of the stale purchase.status pre-
  // read that the old code used. If this invoice has already been handled, a
  // concurrent or replayed delivery short-circuits HERE — before the single-sale
  // RPC and before any notification leg — so nothing fires twice.
  const { data: alreadyProcessed } = await supabase
    .from("processed_webhooks")
    .select("invoice_id")
    .eq("invoice_id", invoiceId)
    .maybeSingle();

  if (alreadyProcessed) {
    console.log("Payments webhook: invoice already processed", { invoiceId });
    return NextResponse.json({
      received: true,
      action: "ignored",
      reason: "already_processed",
    });
  }

  // P1#1: atomic single-sale. mark_lead_purchase_paid is a compare-and-set RPC
  // that, in one transaction, (a) marks the winning offer 'paid', (b) expires
  // every sibling offer on the same job, and (c) flips the lead itself to 'paid'
  // and clears any reservation claim. It returns false when the purchase is
  // already paid/expired/refunded — a replay, or a concurrent delivery that won
  // the race — and the duplicate is then ignored.
  const { data: didMarkPaid, error: rpcError } = await supabase.rpc(
    "mark_lead_purchase_paid",
    {
      p_purchase_id: purchase.id,
      p_invoice_id: invoiceId,
    }
  );

  if (rpcError) {
    console.error("Payments webhook: single-sale RPC failed", rpcError);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  if (didMarkPaid === false) {
    console.log("Payments webhook: purchase already paid; ignoring duplicate", {
      invoiceId,
      purchaseId: purchase.id,
    });
    return NextResponse.json({
      received: true,
      action: "ignored",
      reason: "already_paid",
    });
  }

  console.log("Payments webhook: lead purchase marked as paid", {
    purchaseId: purchase.id,
    jobId: purchase.job_id,
    tradespersonId: purchase.tradesperson_id,
  });

  // Record the invoice id as processed. Only reached by the RPC winner (the
  // delivery whose compare-and-set returned true), so this row is the audit
  // record of which invoices actually completed — not a pre-claim reservation.
  const { error: processedError } = await supabase
    .from("processed_webhooks")
    .insert({
      invoice_id: invoiceId,
      purchase_id: purchase.id,
      event_status: "paid",
    });

  if (processedError) {
    // Non-fatal: the purchase and lead are already paid and the RPC remains the
    // correctness backstop against double-charge. Log for reconciliation.
    console.error("Payments webhook: error recording processed_webhooks", processedError);
  }

  // Money-audit ledger write (audit G2 / Phase C.9): one `transactions` row per
  // paid invoice, giving the DB a reconcilable record of every payment (there is
  // no other writer for `transactions` today). The column is UNIQUE, so this
  // upsert with ignoreDuplicates is idempotent: a replayed webhook — including a
  // retry that arrives after the paid-update above but before a ledger insert
  // from a previous attempt — never double-logs. In this GHL invoice-based flow
  // the external payment id is the invoice id (stored on the purchase), so it is
  // used as the stable idempotency key.
  const amountPence = purchase.lead_price_pence ?? 499;
  const { error: ledgerError } = await supabase
    .from("transactions")
    .upsert(
      {
        stripe_payment_intent_id: invoiceId,
        amount_pence: amountPence,
        currency: "gbp",
        status: "succeeded",
        kind: "lead_purchase",
        reference_type: "lead_purchase",
        reference_id: purchase.id,
        tradesperson_id: purchase.tradesperson_id,
        job_id: purchase.job_id,
        metadata: { source: "ghl_invoice", invoice_id: invoiceId },
      },
      { onConflict: "stripe_payment_intent_id", ignoreDuplicates: true }
    );

  if (ledgerError) {
    // Do not fail the request: the purchase is already marked paid, and a 5xx
    // would make GHL retry indefinitely. Log loudly for manual reconciliation.
    console.error("Payments webhook: error writing transactions ledger", ledgerError);
  } else {
    console.log("Payments webhook: transactions ledger row written", {
      invoiceId,
      purchaseId: purchase.id,
      amountPence,
    });
  }

  // This point is only reached by the RPC winner (mark_lead_purchase_paid returned
  // true), so the notification leg below fires exactly once per invoice — a
  // replayed or concurrent delivery already returned at the processed_webhooks
  // guard or the RPC `false` path above.

  // Send notification to tradesperson that their lead is unlocked
  try {
    const { data: tradesperson } = await supabase
      .from("tradespeople")
      .select("id, first_name, last_name, email, phone")
      .eq("id", purchase.tradesperson_id)
      .single();

    const { data: job } = await supabase
      .from("jobs")
      .select("id, trade, job_description, postcode, client_id")
      .eq("id", purchase.job_id)
      .single();

    const { data: client } = await supabase
      .from("clients")
      .select("phone, first_name, last_name")
      .eq("id", job?.client_id)
      .maybeSingle();

    if (tradesperson) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://myapproved.com";
      const leadUrl = `${baseUrl}/leads/${purchase.id}`;

      await sendNotification({
        type: "pay_per_lead_alert",
        recipientId: String(tradesperson.id),
        recipientEmail: tradesperson.email,
        recipientPhone: tradesperson.phone,
        channels: ["email", "sms"],
        idempotencyKey: `lead_paid_notify:${purchase.id}`,
        data: {
          trade: job?.trade || "",
          postcode: job?.postcode || "",
          job_description: job?.job_description || "",
          fullPhone: client?.phone || "",
          unlockUrl: leadUrl,
          leadCostLabel: "£4.99",
        },
      });
      console.log("Payments webhook: lead unlock notification sent to tradesperson", tradesperson.id);
    }
  } catch (notifyError) {
    console.error("Payments webhook: failed to send unlock notification", notifyError);
  }

  return NextResponse.json({ received: true, action: "marked_paid", purchaseId: purchase.id });
}
