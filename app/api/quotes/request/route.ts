// app/api/quotes/request/route.ts — directory "Ask for a quote" producer.
//
// FUSED onto the live jobs model (sql/master-consolidated.sql). The legacy
// quote_requests table no longer exists, so this route no longer writes it and
// no longer parks requests in a 'pending_admin_approval' admin-inbox workflow.
//
// Semantics now (the two-sided flow):
//   - The signed-in client asks ONE chosen tradesperson (from the directory or
//     their profile) for a quote. We create a REAL, LIVE job row in that
//     tradesperson's trade, prefilled from the request modal:
//         status 'approved', is_approved true, application_status 'open',
//         approved_at now  → identical to POST /api/jobs/post.
//   - The chosen tradesperson is notified with a TARGETED single email
//     (type job_match_tradesperson). This is NOT the pay-per-lead broadcast
//     (notifyMatchingTradespeopleForJob) — that engine creates lead_purchases
//     'offered' rows charging £4.99, which is wrong when the client explicitly
//     asked this specific tradesperson for a free quote. They respond by
//     APPLYING via the existing POST /api/jobs/apply flow, and the client
//     approves via approve-quotation / client-assign, which opens the chat_room.
//   - The job is open to other approved tradespeople too: a directory ask is no
//     longer an exclusive first-refusal request. No schema change is required.
//
// Identity: the caller must present the client bearer token minted at client
// login (`client_<uuid>_<timestamp>`). The uuid is parsed out and the clients
// row is resolved server-side with the service-role client (mirrors the
// codebase trust model but resolves against the real DB instead of trusting a
// body-supplied client_id, as POST /api/jobs/post does).
//
// The tradesperson is resolved from the DB by tradespersonId — their profile
// trade and verified email come from the row, never from the request body.

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendNotification } from "@/lib/notifications";
import { getAdminEmail } from "@/lib/notifications/admin-inbox";
import { emitFleetIngest } from "@/lib/fleet/emitFleetIngest";

export const maxDuration = 60;

// The client modal only lets a logged-in client ask, and the client bearer
// token is `client_<uuid>_<timestamp>` (see app/login/client/page.tsx).
const CLIENT_TOKEN_RE = /^client_([0-9a-fA-F-]{36})_\d+$/;

// Budget tokens from the GetQuoteModal select map onto a single representative
// figure (the jobs table stores one numeric budget, no min/max columns) with
// budget_type 'estimate'. 'discuss' means the client has no figure yet → null.
const BUDGET_REPRESENTATIVE_PENCE: Record<string, number | null> = {
  "under-500": 350,
  "500-1000": 750,
  "1000-2500": 1750,
  "2500-5000": 3750,
  "over-5000": 6000,
  discuss: null,
};

// Timeframe tokens → human-readable free text stored in jobs.preferred_time.
const TIMEFRAME_LABEL: Record<string, string> = {
  asap: "ASAP",
  week: "Within a week",
  month: "Within a month",
  flexible: "Flexible",
};

const PROJECT_TYPE_LABEL: Record<string, string> = {
  emergency: "Emergency",
  installation: "Installation",
  maintenance: "Maintenance",
  renovation: "Renovation",
  inspection: "Inspection",
  consultation: "Consultation",
};

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    // 1. Client identity: parse the signed-in client out of the bearer token and
    //    resolve the account against the DB.
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "").trim()
      : "";
    const match = token ? CLIENT_TOKEN_RE.exec(token) : null;

    if (!match) {
      return NextResponse.json(
        {
          success: false,
          error: "Please log in as a client to ask a tradesperson for a quote.",
          requiresAuth: true,
        },
        { status: 401 },
      );
    }

    const [, clientId] = match;
    const { data: client, error: clientError } = await supabaseAdmin
      .from("clients")
      .select("id, first_name, last_name, email, phone")
      .eq("id", clientId)
      .maybeSingle();

    if (clientError) {
      console.error("Quote request: client lookup failed:", clientError.message);
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }
    if (!client) {
      // Well-formed token but no such account — stale session.
      return NextResponse.json(
        {
          success: false,
          error: "Your session is no longer valid. Please log in again.",
          requiresAuth: true,
        },
        { status: 401 },
      );
    }

    // 2. Parse + validate the request body.
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 },
      );
    }

    const projectDescription =
      typeof body.projectDescription === "string" ? body.projectDescription.trim() : "";
    const location = typeof body.location === "string" ? body.location.trim() : "";
    const tradespersonId =
      typeof body.tradespersonId === "string" ? body.tradespersonId.trim() : "";
    const projectType =
      typeof body.projectType === "string" ? (body.projectType as string) : "";
    const timeframe =
      typeof body.timeframe === "string" ? (body.timeframe as string) : "";
    const budget =
      typeof body.budget === "string" ? (body.budget as string) : "";

    if (!projectDescription || !location || !tradespersonId) {
      return NextResponse.json(
        {
          success: false,
          error: "A project description, location and tradesperson are required.",
        },
        { status: 400 },
      );
    }

    // 3. Resolve the chosen tradesperson from the DB (never trust the body for
    //    trade / name / email).
    const { data: tradesperson, error: tradespersonError } = await supabaseAdmin
      .from("tradespeople")
      .select("id, first_name, last_name, email, trade")
      .eq("id", tradespersonId)
      .maybeSingle();

    if (tradespersonError) {
      console.error("Quote request: tradesperson lookup failed:", tradespersonError.message);
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }
    if (!tradesperson) {
      return NextResponse.json(
        {
          success: false,
          error: "That tradesperson is no longer available. Please pick another.",
        },
        { status: 400 },
      );
    }

    // 4. Map modal tokens onto the jobs columns.
    const projectTypeLabel = PROJECT_TYPE_LABEL[projectType];
    const jobDescription = projectTypeLabel
      ? `${projectTypeLabel}: ${projectDescription}`
      : projectDescription;
    const representativeBudget =
      budget && budget in BUDGET_REPRESENTATIVE_PENCE
        ? BUDGET_REPRESENTATIVE_PENCE[budget] ?? null
        : null;
    const preferredTime =
      TIMEFRAME_LABEL[timeframe] || (timeframe ? timeframe : "any");
    const urgency = projectType === "emergency" ? "urgent" : null;

    // 5. Insert the LIVE job in the tradesperson's trade.
    const { data: job, error: insertError } = await supabaseAdmin
      .from("jobs")
      .insert({
        client_id: client.id,
        trade: tradesperson.trade,
        job_description: jobDescription,
        postcode: location,
        budget: representativeBudget,
        budget_type: "estimate",
        preferred_time: preferredTime,
        urgency,
        images: [],
        status: "approved",
        is_approved: true,
        application_status: "open",
        approved_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Quote request: job insert failed:", insertError);
      return NextResponse.json(
        {
          success: false,
          error: "We could not post your job. Please try again.",
          details: insertError.message,
        },
        { status: 500 },
      );
    }

    // 6. Observability ingest, mirroring jobs/post.
    void emitFleetIngest({
      event_type: "job",
      summary: `Directory quote request → live job: ${tradesperson.trade} in ${location} (${client.email}) targeted at ${tradesperson.email}`,
      payload: {
        id: job.id,
        trade: tradesperson.trade,
        postcode: location,
        client_id: client.id,
        requested_tradesperson_id: tradesperson.id,
        budget: representativeBudget,
        budget_type: "estimate",
      },
    });

    // 7. Notifications. Each is best-effort: a mail failure must not undo the
    //    live job. Data keys mirror the templates used by jobs/post.
    const clientName = [client.first_name, client.last_name]
      .filter(Boolean)
      .join(" ");

    try {
      if (client.email) {
        await sendNotification({
          type: "job_posted_confirmation",
          recipientId: String(client.id),
          recipientEmail: client.email,
          recipientPhone: client.phone,
          channels: ["email"],
          idempotencyKey: `job_posted_confirmation:${job.id}`,
          data: {
            trade: tradesperson.trade,
            job_description: jobDescription,
            postcode: location,
            budget: representativeBudget,
            budget_type: "estimate",
            preferred_time: preferredTime,
            jobId: job.id,
          },
        });
      }
    } catch (e) {
      console.error("Quote request: client confirmation email failed", e);
    }

    try {
      await sendNotification({
        type: "job_posted_admin_alert",
        recipientId: "admin",
        recipientEmail: getAdminEmail(),
        channels: ["email"],
        idempotencyKey: `job_posted_admin_alert:${job.id}`,
        data: {
          jobId: job.id,
          trade: tradesperson.trade,
          job_description: jobDescription,
          postcode: location,
          budget: representativeBudget,
          budget_type: "estimate",
          preferred_time: preferredTime,
          clientName,
          clientEmail: client.email,
          clientPhone: client.phone,
        },
      });
    } catch (e) {
      console.error("Quote request: admin alert email failed", e);
    }

    // Targeted single-tradesperson notification — deliberately NOT the
    // pay-per-lead broadcast (see the header comment). The tradesperson applies
    // through the normal job flow at no charge.
    try {
      if (tradesperson.email) {
        await sendNotification({
          type: "job_match_tradesperson",
          recipientId: tradesperson.id,
          recipientEmail: tradesperson.email,
          channels: ["email"],
          idempotencyKey: `job_match_tradesperson:${job.id}:${tradesperson.id}`,
          data: {
            jobId: job.id,
            trade: tradesperson.trade,
            postcode: location,
            job_description: jobDescription,
          },
        });
      }
    } catch (e) {
      console.error("Quote request: targeted tradesperson email failed", e);
    }

    return NextResponse.json({
      success: true,
      message: `Your job is now live. ${tradesperson.first_name || "The tradesperson"} has been notified and can apply directly.`,
      jobId: job.id,
      status: "approved",
    });
  } catch (error) {
    console.error("Error in quote request API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
