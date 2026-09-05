import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendNotification } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  // --- Webhook signature verification (fail closed) ---
  // NOTE: GoHighLevel's webhook signing scheme could not be confirmed from this
  // repo. The header name and HMAC construction below must be reconciled against
  // GHL's webhook documentation before this goes live.
  const secret = process.env.GHL_WEBHOOK_SECRET;
  if (!secret) {
    console.error("Payments webhook: GHL_WEBHOOK_SECRET not set — rejecting request");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const signature = request.headers.get("x-ghl-signature");
  if (!signature) {
    console.error("Payments webhook: missing signature header");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await request.text();
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(signature, "utf8");
  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    console.error("Payments webhook: signature mismatch");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const invoiceId = body._id;
  const status = body.status;

  console.log("Payments webhook received:", { invoiceId, status });

  if (!invoiceId) {
    return NextResponse.json({ error: "Missing invoice _id" }, { status: 400 });
  }

  if (status !== "paid") {
    return NextResponse.json({ received: true, action: "ignored", reason: "status not paid" });
  }

  // Find the lead_purchases row by GHL invoice ID
  const { data: purchase, error: lookupError } = await supabase
    .from("lead_purchases")
    .select("id, job_id, tradesperson_id, status, lead_price_pence")
    .eq("stripe_checkout_session_id", invoiceId)
    .maybeSingle();

  if (lookupError) {
    console.error("Payments webhook: error looking up purchase", lookupError);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }

  if (!purchase) {
    console.warn("Payments webhook: no purchase found for invoice", invoiceId);
    return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  }

  const isNewlyPaid = purchase.status !== "paid";

  if (isNewlyPaid) {
    // Mark as paid
    const { error: updateError } = await supabase
      .from("lead_purchases")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", purchase.id);

    if (updateError) {
      console.error("Payments webhook: error updating purchase", updateError);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    console.log("Payments webhook: lead purchase marked as paid", {
      purchaseId: purchase.id,
      jobId: purchase.job_id,
      tradespersonId: purchase.tradesperson_id,
    });
  }

  // Money-audit ledger write (audit G2 / Phase C.9): one `transactions` row per
  // paid invoice, giving the DB a reconcilable record of every payment (there is
  // no other writer for `transactions` today). The column is UNIQUE, so this
  // upsert with ignoreDuplicates is idempotent: a replayed webhook — including a
  // retry that arrives after the paid-update above but before a ledger insert
  // from a previous attempt — never double-logs. In this GHL invoice-based flow
  // the external payment id is the invoice _id (stored on the purchase as
  // stripe_checkout_session_id), so it is used as the stable idempotency key.
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

  if (!isNewlyPaid) {
    return NextResponse.json({ received: true, action: "ignored", reason: "already paid" });
  }

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
