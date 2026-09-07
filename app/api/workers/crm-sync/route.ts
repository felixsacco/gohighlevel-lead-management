import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import {
  createGoHighLevelService,
  createGoHighLevelPrivateService,
} from "@/lib/gohighlevel-service";
import { executeWithResilience } from "@/lib/workers/resilience";

const GOHIGHLEVEL_ACCESS_TOKEN = process.env.GOHIGHLEVEL_ACCESS_TOKEN;
const GOHIGHLEVEL_API_KEY = process.env.GOHIGHLEVEL_API_KEY;
const GOHIGHLEVEL_LOCATION_ID = process.env.GOHIGHLEVEL_LOCATION_ID;

const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY?.trim();
const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY?.trim();

async function handler(request: NextRequest) {
  try {
    const hasOAuthToken = Boolean(GOHIGHLEVEL_ACCESS_TOKEN && GOHIGHLEVEL_LOCATION_ID);
    const hasPrivateToken = Boolean(GOHIGHLEVEL_API_KEY && GOHIGHLEVEL_LOCATION_ID);

    if (!hasOAuthToken && !hasPrivateToken) {
      return NextResponse.json({
        success: false,
        error: "GoHighLevel CRM not configured",
        message: "CRM sync disabled",
      });
    }

    const jobData = await request.json();

    const requiredFields = [
      "id", "clientName", "clientEmail", "trade",
      "jobDescription", "location", "status", "createdAt",
    ];
    const missingFields = requiredFields.filter((f) => !jobData[f]);
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(", ")}`,
      }, { status: 400 });
    }

    const goHighLevelService = hasPrivateToken
      ? createGoHighLevelPrivateService(GOHIGHLEVEL_API_KEY!, GOHIGHLEVEL_LOCATION_ID!)
      : createGoHighLevelService(GOHIGHLEVEL_ACCESS_TOKEN!, GOHIGHLEVEL_LOCATION_ID!);

    // CRM sync runs under the resilience wrapper: a network/API failure throws,
    // the full job payload is recorded in the dead-letter queue for re-drive,
    // and this worker responds with an explicit 500 instead of a masked 2xx.
    // Config (CRM disabled) and validation (missing fields) above deliberately
    // stay OUTSIDE the wrapper so permanent conditions don't pollute the DLQ.
    const res = await executeWithResilience(
      { taskName: "crm-sync", payload: jobData },
      () => goHighLevelService.syncJobSubmission(jobData),
    );

    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 500 });
    }

    return NextResponse.json(res.data);
  } catch (error) {
    console.error("[worker:crm-sync] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export const POST =
  currentSigningKey && nextSigningKey
    ? verifySignatureAppRouter(handler)
    : handler;
