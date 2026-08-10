import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { buildInvoicePdfBuffer } from "@/lib/notifications/invoice-pdf";
import type { NotificationEventType } from "@/lib/notifications/types";

export const dynamic = "force-dynamic";

const PDF_EVENTS: NotificationEventType[] = [
  "invoice_sent_client",
  "invoice_sent_tradesperson",
  "payment_received",
];

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")?.trim();
    const logId = request.nextUrl.searchParams.get("logId")?.trim();
    if (!userId || !logId) {
      return NextResponse.json(
        { error: "userId and logId are required" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
    const { data: row, error } = await supabase
      .from("notification_logs")
      .select("id, event_type, payload, recipient_id, created_at")
      .eq("id", logId)
      .single();

    if (error || !row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (String(row.recipient_id) !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!PDF_EVENTS.includes(row.event_type as NotificationEventType)) {
      return NextResponse.json(
        { error: "This notification does not include a downloadable receipt" },
        { status: 400 },
      );
    }

    const payload = (row.payload || {}) as Record<string, unknown>;
    const invoiceNumber = String(
      payload.invoiceNumber ||
        `INV-${String(payload.jobId || "JOB").replace(/-/g, "").slice(0, 10)}`,
    );
    const amountRaw = payload.amount ?? "0";
    const issueDate = new Date(
      (row.created_at as string) || Date.now(),
    ).toLocaleDateString("en-GB");
    const billedToName = String(payload.billedToName || "Customer");
    const billedToEmail = String(
      payload.billedToEmail || payload.email || "",
    );
    const jobRefPdf = payload.jobRef || "";
    const description = `${String(payload.trade || "Job")} — MyApproved job ref ${jobRefPdf || String(payload.jobId || "").slice(0, 8)}`;

    const pdfBuffer = await buildInvoicePdfBuffer({
      invoiceNumber,
      issueDate,
      billedToName,
      billedToEmail: billedToEmail || "—",
      description,
      amountLabel: `£${String(amountRaw)}`,
      footerNote:
        row.event_type === "payment_received"
          ? "This receipt records completion on the MyApproved platform. It is not a substitute for your tradesperson's own VAT invoice where one is required for your accounts."
          : undefined,
    });

    const safeName = `${invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, "_")}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    console.error("receipt PDF error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not generate receipt" },
      { status: 500 },
    );
  }
}
