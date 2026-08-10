import { getSupabaseAdmin } from "@/lib/supabase";
import { sendEmailNotification } from "./email";
import { isSmsConfigured, sendSmsNotification } from "./sms";
import {
  NotificationChannel,
  NotificationPayload,
  NotificationResult,
} from "./types";

async function logNotification(
  payload: NotificationPayload,
  result: NotificationResult,
) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      console.warn('Supabase admin not available, skipping notification log');
      return;
    }
    await supabase.from("notification_logs").insert({
      idempotency_key: payload.idempotencyKey,
      event_type: payload.type,
      channel: result.channel,
      recipient_id: payload.recipientId || null,
      recipient_contact:
        result.channel === "email"
          ? payload.recipientEmail || null
          : result.channel === "sms"
            ? payload.recipientPhone || null
            : payload.recipientId || null,
      status: result.success ? "sent" : "failed",
      provider_message_id: result.messageId || null,
      error_message: result.error || null,
      payload: payload.data,
    });
  } catch {
    // Keep business flow non-blocking if logs table is not ready yet.
  }
}

async function sendChannel(
  payload: NotificationPayload,
  channel: NotificationChannel,
): Promise<NotificationResult> {
  try {
    if (channel === "email") {
      if (!payload.recipientEmail) {
        return { channel, success: false, error: "Missing recipientEmail" };
      }
      const response = await sendEmailNotification({
        to: payload.recipientEmail,
        type: payload.type,
        data: payload.data,
      });
      const skipped = response.messageId === "<skipped-no-smtp>";
      return { channel, success: !skipped, messageId: response.messageId };
    }

    if (channel === "push") {
      // Current implementation routes push as in-app notification center delivery.
      if (!payload.recipientId) {
        return { channel, success: false, error: "Missing recipientId for push channel" };
      }
      return {
        channel,
        success: true,
        messageId: `in-app:${payload.idempotencyKey}`,
      };
    }

    if (channel === "sms") {
      if (!payload.recipientPhone) {
        console.warn("[sms] sendChannel: missing recipientPhone for payload type", payload.type);
        return { channel, success: false, error: "Missing recipientPhone" };
      }
      console.log("[sms] sendChannel: attempting SMS via sendSmsNotification to", payload.recipientPhone, "type", payload.type);
      const response = await sendSmsNotification({
        to: payload.recipientPhone,
        type: payload.type,
        data: payload.data,
      });
      console.log("[sms] sendChannel: sendSmsNotification result", JSON.stringify(response));
      if (response.error) {
        return { channel, success: false, error: response.error };
      }
      return { channel, success: true, messageId: response.messageId };
    }

    return { channel, success: false, error: "Unsupported notification channel" };
  } catch (error) {
    return {
      channel,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function sendNotification(payload: NotificationPayload) {
  const channels = payload.channels.filter((c) =>
    c === "email" || c === "push" || c === "sms",
  );
  const shouldMirrorEmailToSms =
    channels.includes("email") &&
    !channels.includes("sms") &&
    Boolean(payload.recipientPhone) &&
    isSmsConfigured();
  if (shouldMirrorEmailToSms) {
    channels.push("sms");
  }
  if (channels.length === 0) {
    return { ok: false, results: [] as NotificationResult[] };
  }
  const results = await Promise.all(
    channels.map(async (channel) => {
      const result = await sendChannel(payload, channel);
      await logNotification(payload, result);
      return result;
    }),
  );

  return {
    ok: results.some((r) => r.success),
    results,
  };
}

export * from "./types";
