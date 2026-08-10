import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendNotification } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error("Payments webhook: Supabase admin not available");
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  let body: any;
  try {
    body = await request.json();
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
    .select("id, job_id, tradesperson_id, status")
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

  if (purchase.status === "paid") {
    return NextResponse.json({ received: true, action: "ignored", reason: "already paid" });
  }

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
