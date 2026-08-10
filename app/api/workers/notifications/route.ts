import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { sendNotification } from "@/lib/notifications";
import type { NotificationPayload } from "@/lib/notifications/types";

const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY?.trim();
const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY?.trim();

async function handler(request: NextRequest) {
  try {
    const payload = (await request.json()) as NotificationPayload;

    if (!payload.type || !payload.idempotencyKey || !payload.channels?.length) {
      return NextResponse.json(
        { error: "Invalid notification payload" },
        { status: 400 },
      );
    }

    // sendNotification already writes idempotency_key to notification_logs
    const result = await sendNotification(payload);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[worker:notifications] error:", error);
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
