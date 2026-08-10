import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { inboxTitleForEvent } from "@/lib/notifications/inboxLabels";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const userId = new URL(request.url).searchParams.get("userId");
    if (!userId?.trim()) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
    const { data: rows, error } = await supabase
      .from("notification_logs")
      .select("id, event_type, payload, created_at, read_at, idempotency_key, status")
      .eq("recipient_id", userId)
      .eq("channel", "email")
      .order("created_at", { ascending: false })
      .limit(120);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const seen = new Set<string>();
    const items: {
      id: string;
      title: string;
      event_type: string;
      created_at: string;
      read_at: string | null;
      preview: string;
    }[] = [];

    for (const r of rows || []) {
      const key = r.idempotency_key as string;
      if (seen.has(key)) continue;
      seen.add(key);
      const payload = (r.payload as Record<string, unknown> | null) || {};
      const trade = payload.trade;
      const inv = payload.invoiceNumber;
      const invoiceEvents = [
        "invoice_sent_client",
        "invoice_sent_tradesperson",
        "payment_received",
      ];
      let preview: string;
      if (invoiceEvents.includes(r.event_type) && typeof inv === "string" && inv) {
        preview =
          typeof trade === "string" && trade
            ? `${inboxTitleForEvent(r.event_type)} · ${inv} — ${trade}`
            : `${inboxTitleForEvent(r.event_type)} · ${inv}`;
      } else if (typeof trade === "string" && trade) {
        preview = `${inboxTitleForEvent(r.event_type)} — ${trade}`;
      } else {
        preview = inboxTitleForEvent(r.event_type);
      }
      items.push({
        id: r.id,
        title: inboxTitleForEvent(r.event_type),
        event_type: r.event_type,
        created_at: r.created_at,
        read_at: (r as { read_at?: string | null }).read_at ?? null,
        preview,
      });
    }

    return NextResponse.json({ items });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const ids = body.ids as string[] | undefined;
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids array required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("notification_logs")
      .update({ read_at: now })
      .in("id", ids.slice(0, 50));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 },
    );
  }
}
