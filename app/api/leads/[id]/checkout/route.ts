import { NextRequest, NextResponse } from "next/server";
import { createGoHighLevelService, createGoHighLevelPrivateService } from "@/lib/gohighlevel-service";
import { getSupabaseAdmin } from "@/lib/supabase";

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
    .select("id, job_id, tradesperson_id, lead_price_pence, status")
    .eq("id", purchaseId)
    .maybeSingle();

  if (purchaseError || !purchase) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
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

  // Store the GHL invoice ID so the webhook can match it
  await supabase
    .from("lead_purchases")
    .update({ stripe_checkout_session_id: paymentLink.invoiceId })
    .eq("id", purchaseId);

  return NextResponse.json({ url: paymentLink.paymentUrl });
}
