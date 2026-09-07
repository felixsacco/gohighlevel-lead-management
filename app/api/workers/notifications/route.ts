import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { sendNotification } from "@/lib/notifications";
import type { NotificationPayload } from "@/lib/notifications/types";
import { executeWithResilience, recordDeadLetter } from "@/lib/workers/resilience";

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

    // Dispatch runs under the resilience wrapper: an unexpected throw during
    // sendNotification is recorded in the dead-letter queue (full payload kept
    // for re-drive) and surfaced as an explicit 500 — never a masked 2xx.
    // sendNotification already writes idempotency_key to notification_logs.
    const taskContext = {
      taskName: "notification-dispatch",
      payload: payload as unknown as Record<string, any>,
    };

    const res = await executeWithResilience(taskContext, () =>
      sendNotification(payload),
    );

    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 500 });
    }

    // Soft failures must not vanish into a masked 2xx: sendNotification RESOLVES
    // even when a channel drops (e.g. SMS fails while email fires), so a
    // resolved dispatch can still be an operational failure. Any channel with
    // success:false is recorded in the DLQ so the partial delivery is auditable
    // and re-driveable rather than silently acked.
    const results = res.data?.results ?? [];
    const failedChannels = results.filter((r) => !r.success);

    if (failedChannels.length > 0) {
      const dlqId = await recordDeadLetter(
        taskContext,
        `Notification channel failure(s): ${failedChannels
          .map((r) => `${r.channel}${r.error ? ` — ${r.error}` : ""}`)
          .join("; ")}`,
      );

      const allChannelsFailed =
        results.length > 0 && failedChannels.length === results.length;

      if (allChannelsFailed) {
        // Nothing was delivered anywhere — safe for QStash to retry, so surface
        // a hard failure (no duplicate-customer-message risk on retry).
        return NextResponse.json(
          {
            ok: false,
            error: "All notification channels failed",
            dlqId: dlqId ?? undefined,
          },
          { status: 500 },
        );
      }

      // Partial delivery: at least one channel succeeded. A 500 here would make
      // QStash re-run the whole payload and re-send the already-delivered
      // channels (sendNotification has no send-time dedupe), so acknowledge with
      // an explicit tracking payload instead — the DLQ row above is the durable
      // failure record and the operator's re-drive handle.
      return NextResponse.json({
        ok: false,
        error: "Partial delivery: one or more notification channels failed",
        dlqId: dlqId ?? undefined,
        failedChannels: failedChannels.map((r) => ({
          channel: r.channel,
          error: r.error ?? null,
        })),
      });
    }

    return NextResponse.json(res.data);
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
