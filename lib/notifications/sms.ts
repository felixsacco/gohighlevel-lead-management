import type { NotificationEventType } from "./types";
// SMS templates - pure functions from lib/notifications/templates/sms
import { buildSmsBody, truncate } from "./templates/sms";

// Re-export for consumers that import from here directly
export { buildSmsBody, truncate } from "./templates/sms";

/** E.164-ish number suitable for Twilio (UK-focused normalisation). */
export function normalizeUkPhoneForSms(input: string | null | undefined): string | null {
  if (!input) return null;
  const raw = String(input).trim().replace(/[\s()-]/g, "");
  if (!raw) return null;
  if (raw.startsWith("+")) {
    const digits = raw.slice(1).replace(/\D/g, "");
    return digits.length >= 10 ? `+${digits}` : null;
  }
  if (raw.startsWith("00")) {
    const digits = raw.slice(2).replace(/\D/g, "");
    return digits.length >= 10 ? `+${digits}` : null;
  }
  const digitsOnly = raw.replace(/\D/g, "");
  if (digitsOnly.startsWith("44") && digitsOnly.length >= 12) {
    return `+${digitsOnly}`;
  }
  if (digitsOnly.startsWith("0") && digitsOnly.length >= 10) {
    return `+44${digitsOnly.slice(1)}`;
  }
  if (digitsOnly.length >= 10 && digitsOnly.length <= 11 && !digitsOnly.startsWith("0")) {
    return `+44${digitsOnly}`;
  }
  return null;
}

export function isSmsConfigured(): boolean {
  const ghlToken = process.env.GOHIGHLEVEL_SMS_API_KEY?.trim() || process.env.GOHIGHLEVEL_API_KEY?.trim();
  const ghlLocationId = process.env.GOHIGHLEVEL_SMS_LOCATION_ID?.trim() || process.env.GOHIGHLEVEL_LOCATION_ID?.trim();
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_FROM_NUMBER?.trim();
  const msid = process.env.TWILIO_MESSAGING_SERVICE_SID?.trim();
  return Boolean((ghlToken && ghlLocationId) || (sid && token && (from || msid)));
}

/** When SMS is configured and the number normalises, include `sms` alongside `email`. */
export function emailPlusSmsChannels(phone?: string | null): Array<"email" | "sms"> {
  const channels: Array<"email" | "sms"> = ["email"];
  if (isSmsConfigured() && normalizeUkPhoneForSms(phone)) {
    channels.push("sms");
  }
  return channels;
}

export type SendSmsResult = { messageId: string; skipped?: boolean; error?: string };

function getSmsProviderPreference(): "auto" | "gohighlevel" | "twilio" {
  const value = (process.env.SMS_PROVIDER || "").trim().toLowerCase();
  if (value === "gohighlevel" || value === "twilio") return value;
  return "gohighlevel";
}

const GHL_API_VERSION = "2021-07-28";

async function upsertGhlContactByPhone(args: {
  token: string;
  baseUrl: string;
  locationId: string;
  phone: string;
}): Promise<{ contactId: string } | { error: string }> {
  const res = await fetch(`${args.baseUrl}/contacts/upsert`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${args.token}`,
      "Content-Type": "application/json",
      Version: GHL_API_VERSION,
    },
    body: JSON.stringify({
      locationId: args.locationId,
      phone: args.phone,
      name: "MyApproved",
    }),
  });

  const json = (await res.json().catch(() => ({}))) as {
    contact?: { id?: string };
    id?: string;
    message?: string;
  };

  if (!res.ok) {
    return { error: json.message || res.statusText || "GoHighLevel contact upsert failed" };
  }

  const contactId = json.contact?.id || json.id;
  if (!contactId) {
    return { error: "GoHighLevel upsert did not return a contact id" };
  }

  return { contactId };
}

/** Best-effort: GHL may still be `pending` / `queued` on first read; poll briefly. */
async function readGhlOutboundSmsStatus(args: {
  token: string;
  baseUrl: string;
  messageId: string;
}): Promise<{ status?: string; error?: string; raw?: string }> {
  const res = await fetch(`${args.baseUrl}/conversations/messages/${args.messageId}`, {
    headers: {
      Authorization: `Bearer ${args.token}`,
      Version: GHL_API_VERSION,
    },
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    const msg = data.message;
    const errStr =
      typeof msg === "string"
        ? msg
        : msg && typeof msg === "object" && "message" in (msg as object)
          ? String((msg as { message?: string }).message)
          : String(data.error || res.statusText);
    return { error: errStr };
  }

  const inner =
    data.message && typeof data.message === "object"
      ? (data.message as Record<string, unknown>)
      : data;
  const status = typeof inner.status === "string" ? inner.status : undefined;
  const error = typeof inner.error === "string" ? inner.error : undefined;
  return { status, error, raw: JSON.stringify(data).slice(0, 800) };
}

async function sendViaGoHighLevel(
  to: string,
  body: string,
): Promise<SendSmsResult | null> {
  const token = process.env.GOHIGHLEVEL_SMS_API_KEY?.trim() || process.env.GOHIGHLEVEL_API_KEY?.trim();
  const locationId = process.env.GOHIGHLEVEL_SMS_LOCATION_ID?.trim() || process.env.GOHIGHLEVEL_LOCATION_ID?.trim();
  const baseUrl = process.env.GOHIGHLEVEL_BASE_URL?.trim() || "https://services.leadconnectorhq.com";

  if (!token || !locationId) return null;

  const contact = await upsertGhlContactByPhone({ token, baseUrl, locationId, phone: to });
  if ("error" in contact) {
    return { messageId: "", error: contact.error };
  }

  const res = await fetch(`${baseUrl}/conversations/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Version: GHL_API_VERSION,
    },
    body: JSON.stringify({
      type: "SMS",
      locationId,
      contactId: contact.contactId,
      message: body,
    }),
  });

  const json = (await res.json().catch(() => ({}))) as {
    id?: string;
    messageId?: string;
    message?: string;
  };

  if (!res.ok) {
    const err = json.message || res.statusText || "GoHighLevel SMS request failed";
    return { messageId: "", error: err };
  }

  const messageId = json.id || json.messageId || "";
  if (!messageId) {
    return { messageId: "", error: "GoHighLevel accepted SMS but returned no message id" };
  }

  const debugSms = process.env.GHL_DEBUG_SMS === "1" || process.env.GHL_DEBUG_SMS === "true";
  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, 1500));
    }
    const st = await readGhlOutboundSmsStatus({ token, baseUrl, messageId });
    if (debugSms) {
      console.warn("[sms][ghl] message poll:", messageId, st.status, st.error || "", st.raw?.slice(0, 200));
    }
    const s = (st.status || "").toLowerCase();
    if (s === "failed" || s === "undelivered") {
      return {
        messageId,
        error:
          st.error ||
          `GoHighLevel reports SMS status "${st.status || "failed"}". Open Conversations in GHL for details.`,
      };
    }
    if (s === "delivered" || s === "sent" || s === "read") {
      break;
    }
  }

  return { messageId };
}

export async function sendSmsNotification(args: {
  to: string;
  type: NotificationEventType;
  data: Record<string, unknown>;
}): Promise<SendSmsResult> {
  const to = normalizeUkPhoneForSms(args.to);
  if (!to) {
    return { messageId: "", error: "Invalid or missing phone number" };
  }

  if (!isSmsConfigured()) {
    console.warn(
      "[sms] SMS provider not configured — set GOHIGHLEVEL_API_KEY + GOHIGHLEVEL_LOCATION_ID or Twilio vars. Skipped:",
      args.type,
      "→",
      to,
    );
    return { messageId: "<skipped-no-sms-provider>", skipped: true };
  }

  const body = buildSmsBody(args.type, args.data);
  const provider = getSmsProviderPreference();
  const ghlConfigured = Boolean(
    (process.env.GOHIGHLEVEL_SMS_API_KEY?.trim() || process.env.GOHIGHLEVEL_API_KEY?.trim()) &&
      (process.env.GOHIGHLEVEL_SMS_LOCATION_ID?.trim() || process.env.GOHIGHLEVEL_LOCATION_ID?.trim()),
  );

  if (provider === "gohighlevel" || provider === "auto") {
    const ghlResult = await sendViaGoHighLevel(to, body);
    if (ghlResult) {
      if (provider === "gohighlevel") return ghlResult;
      if (!ghlResult.error) return ghlResult;
      // In auto mode only, fallback to Twilio when GHL is configured but request fails.
    } else if (provider === "gohighlevel") {
      return { messageId: "", error: "GoHighLevel SMS is selected but GOHIGHLEVEL_API_KEY/GOHIGHLEVEL_LOCATION_ID are missing" };
    }
  }

  if (provider === "auto" && ghlConfigured) {
    return { messageId: "", error: "GoHighLevel SMS failed and Twilio fallback is disabled while GHL is configured" };
  }

  if (provider === "twilio" || provider === "auto") {
    const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
    const token = process.env.TWILIO_AUTH_TOKEN?.trim();
    if (!sid || !token) {
      return { messageId: "", error: "Twilio is selected but TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN are missing" };
    }

    const from = process.env.TWILIO_FROM_NUMBER?.trim();
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID?.trim();

    const params = new URLSearchParams();
    params.set("To", to);
    params.set("Body", body);
    if (messagingServiceSid) {
      params.set("MessagingServiceSid", messagingServiceSid);
    } else if (from) {
      params.set("From", from);
    } else {
      return { messageId: "", error: "Twilio From not configured" };
    }

    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const json = (await res.json().catch(() => ({}))) as {
      sid?: string;
      message?: string;
      code?: number;
      more_info?: string;
    };

    if (!res.ok) {
      const err = json.message || res.statusText || "Twilio request failed";
      console.error("[sms] Twilio error:", err, json);
      return { messageId: "", error: err };
    }

    return { messageId: json.sid || "twilio" };
  }

  return { messageId: "", error: "Unsupported SMS provider configuration" };
}
