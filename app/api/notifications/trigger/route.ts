import { NextRequest, NextResponse } from "next/server";
import { sendNotification } from "@/lib/notifications";
import type { NotificationChannel, NotificationEventType } from "@/lib/notifications/types";

const VALID_CHANNELS: NotificationChannel[] = ["email", "sms", "push"];

const VALID_EVENTS: NotificationEventType[] = [
  "client_signup_confirmation",
  "tradesperson_signup_admin_alert",
  "job_posted_admin_alert",
  "job_posted_confirmation",
  "job_live_status",
  "job_match_tradesperson",
  "job_posted_tradesperson_match",
  "tradesperson_applied_alert",
  "application_reminder",
  "job_assigned_alert",
  "job_completed_alert",
  "review_request_delayed",
  "review_reminder_24h",
  "review_reminder_48h",
  "review_reminder_72h",
  "review_received_alert",
  "invoice_sent_client",
  "invoice_sent_tradesperson",
  "payment_received",
  "tradesperson_next_steps",
  "profile_live_alert",
  "dispute_opened",
  "dispute_update",
  "dispute_resolved",
  "account_suspended_notice",
  "reactivation_guide",
  "client_reengagement_60d",
  "tradesperson_winback_60d",
  "job_not_selected_notification",
  "job_in_progress_client_notice",
  "application_under_review_tradesperson",
  "tradesperson_review_wait_reminder",
  "job_progress_checkin",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const type = String(body.type || "") as NotificationEventType;
    const channels = Array.isArray(body.channels) ? body.channels : [];
    const recipientId = body.recipientId ? String(body.recipientId) : undefined;
    const recipientEmail = body.recipientEmail ? String(body.recipientEmail) : undefined;
    const recipientPhone = body.recipientPhone ? String(body.recipientPhone) : undefined;
    const idempotencyKey = body.idempotencyKey ? String(body.idempotencyKey) : "";
    const data =
      body.data && typeof body.data === "object" && !Array.isArray(body.data)
        ? (body.data as Record<string, unknown>)
        : {};

    if (!VALID_EVENTS.includes(type)) {
      return NextResponse.json({ error: "Invalid notification event type" }, { status: 400 });
    }
    if (!idempotencyKey.trim()) {
      return NextResponse.json({ error: "idempotencyKey is required" }, { status: 400 });
    }

    const normalizedChannels = channels
      .map((c: unknown) => String(c).toLowerCase())
      .filter((c: string): c is NotificationChannel =>
        VALID_CHANNELS.includes(c as NotificationChannel),
      );

    if (normalizedChannels.length === 0) {
      return NextResponse.json(
        { error: "At least one valid channel is required (email|sms|push)" },
        { status: 400 },
      );
    }

    if (normalizedChannels.includes("email") && !recipientEmail) {
      return NextResponse.json(
        { error: "recipientEmail is required when channel=email" },
        { status: 400 },
      );
    }
    if (normalizedChannels.includes("push") && !recipientId) {
      return NextResponse.json(
        { error: "recipientId is required when channel=push" },
        { status: 400 },
      );
    }

    const result = await sendNotification({
      type,
      recipientId,
      recipientEmail,
      recipientPhone,
      channels: normalizedChannels,
      idempotencyKey,
      data,
    });

    return NextResponse.json({ ok: result.ok, results: result.results });
  } catch (error) {
    console.error("notification trigger failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to trigger notification" },
      { status: 500 },
    );
  }
}
