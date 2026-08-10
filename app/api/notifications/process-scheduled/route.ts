import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendNotification } from "@/lib/notifications";
import { runAutoAssignForJob } from "@/lib/jobs/runAutoAssignForJob";
import type { NotificationEventType } from "@/lib/notifications/types";

function authorizeCron(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.warn('[process-scheduled] CRON_SECRET is not configured — denying unauthenticated access.');
    return false;
  }
  return authHeader === `Bearer ${cronSecret}`;
}

async function handleProcessScheduled(request: NextRequest) {
  try {
    if (!authorizeCron(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
    const nowIso = new Date().toISOString();

    const { data: due, error } = await supabase
      .from("scheduled_notifications")
      .select("*")
      .lte("scheduled_for", nowIso)
      .eq("status", "pending")
      .limit(100);

    if (error) {
      return NextResponse.json(
        { error: "Failed to load scheduled notifications", details: error.message },
        { status: 500 },
      );
    }

    let processed = 0;
    for (const item of due || []) {
      if (item.event_type === "application_auto_assign_due") {
        const payload = (item.payload || {}) as { jobId?: string };
        if (process.env.ENABLE_AUTO_ASSIGN_JOB !== "true") {
          await supabase.from("scheduled_notifications").delete().eq("id", item.id);
        } else if (!payload.jobId) {
          await supabase
            .from("scheduled_notifications")
            .update({
              status: "failed",
              error_message: "Missing jobId in payload",
            })
            .eq("id", item.id);
        } else {
          await runAutoAssignForJob(payload.jobId);
          await supabase
            .from("scheduled_notifications")
            .update({ status: "sent", sent_at: new Date().toISOString() })
            .eq("id", item.id);
        }
        processed += 1;
        continue;
      }

      const sendResult = await sendNotification({
        type: item.event_type as NotificationEventType,
        recipientId: item.recipient_id || undefined,
        recipientEmail: item.recipient_email || undefined,
        recipientPhone: item.recipient_phone || undefined,
        channels: ["email"],
        idempotencyKey: `${item.event_type}:${item.id}`,
        data: item.payload || {},
      });

      if (sendResult.ok) {
        await supabase
          .from("scheduled_notifications")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", item.id);
      } else {
        await supabase
          .from("scheduled_notifications")
          .update({
            status: "failed",
            error_message: sendResult.results.map((r) => r.error).filter(Boolean).join(" | "),
          })
          .eq("id", item.id);
      }

      const payload = (item.payload || {}) as { jobId?: string; trade?: string };
      const chainJobId = payload.jobId;

      if (sendResult.ok && item.event_type === "review_request_delayed" && chainJobId) {
        await supabase.from("scheduled_notifications").upsert(
          {
            event_type: "review_reminder_24h",
            recipient_id: item.recipient_id,
            recipient_email: item.recipient_email,
            recipient_phone: item.recipient_phone,
            payload: item.payload,
            scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            status: "pending",
            dedupe_key: `review_reminder_24h:${chainJobId}`,
          },
          { onConflict: "dedupe_key" },
        );
      }

      if (sendResult.ok && item.event_type === "review_reminder_24h" && chainJobId) {
        await supabase.from("scheduled_notifications").upsert(
          {
            event_type: "review_reminder_48h",
            recipient_id: item.recipient_id,
            recipient_email: item.recipient_email,
            recipient_phone: item.recipient_phone,
            payload: item.payload,
            scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            status: "pending",
            dedupe_key: `review_reminder_48h:${chainJobId}`,
          },
          { onConflict: "dedupe_key" },
        );
      }

      if (sendResult.ok && item.event_type === "review_reminder_48h" && chainJobId) {
        await supabase.from("scheduled_notifications").upsert(
          {
            event_type: "review_reminder_72h",
            recipient_id: item.recipient_id,
            recipient_email: item.recipient_email,
            recipient_phone: item.recipient_phone,
            payload: item.payload,
            scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            status: "pending",
            dedupe_key: `review_reminder_72h:${chainJobId}`,
          },
          { onConflict: "dedupe_key" },
        );
      }

      processed += 1;
    }

    return NextResponse.json({ success: true, processed });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unexpected error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return handleProcessScheduled(request);
}

export async function POST(request: NextRequest) {
  return handleProcessScheduled(request);
}
