import { Client } from "@upstash/qstash";

let _client: Client | null = null;

function getClient(): Client | null {
  if (_client) return _client;
  const token = process.env.QSTASH_TOKEN?.trim();
  if (!token) return null;
  _client = new Client({ token });
  return _client;
}

export function isQStashConfigured(): boolean {
  return Boolean(process.env.QSTASH_TOKEN?.trim());
}

export async function enqueueNotification(payload: {
  type: string;
  recipientId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  channels: string[];
  idempotencyKey: string;
  data: Record<string, unknown>;
}): Promise<{ messageId?: string; error?: string }> {
  const client = getClient();
  if (!client) {
    return { error: "QStash not configured" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.VERCEL_URL?.trim();
  if (!baseUrl) {
    return { error: "NEXT_PUBLIC_APP_URL not set" };
  }

  const url = `${baseUrl.replace(/\/$/, "")}/api/workers/notifications`;

  try {
    const { messageId } = await client.publishJSON({
      url,
      body: payload,
      contentBasedDeduplication: true,
      retries: 3,
    });
    return { messageId };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "QStash publish failed",
    };
  }
}

export async function enqueueCrmSync(payload: {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  trade: string;
  jobDescription: string;
  location: string;
  budget: unknown;
  budgetType: string;
  preferredDate: string;
  status: string;
  createdAt: string;
}): Promise<{ messageId?: string; error?: string }> {
  const client = getClient();
  if (!client) {
    return { error: "QStash not configured" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.VERCEL_URL?.trim();
  if (!baseUrl) {
    return { error: "NEXT_PUBLIC_APP_URL not set" };
  }

  const url = `${baseUrl.replace(/\/$/, "")}/api/workers/crm-sync`;

  try {
    const { messageId } = await client.publishJSON({
      url,
      body: payload,
      contentBasedDeduplication: true,
      retries: 3,
    });
    return { messageId };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "QStash publish failed",
    };
  }
}
