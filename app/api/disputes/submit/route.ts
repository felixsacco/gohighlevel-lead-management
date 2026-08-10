import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendNotification } from "@/lib/notifications";

const DEFAULT_SLA_HOURS = 24;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      userType,
      disputeDetails,
      userEmail,
      userPhone,
      fullMessage,
      jobId,
      disputeCategory,
    } = body as {
      userId?: string;
      userType?: string;
      disputeDetails?: string;
      userEmail?: string;
      userPhone?: string;
      fullMessage?: string;
      jobId?: string | null;
      disputeCategory?: string | null;
    };

    if (!userId || !userType || !disputeDetails) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (userType !== "client" && userType !== "tradesperson") {
      return NextResponse.json({ error: "Invalid userType" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    let chatRoomId: string | null = null;
    if (jobId && typeof jobId === "string") {
      const { data: room } = await supabaseAdmin
        .from("chat_rooms")
        .select("id")
        .eq("job_id", jobId)
        .maybeSingle();
      if (room?.id) chatRoomId = room.id;
    }

    const slaHours = Number(process.env.DISPUTE_SLA_ACK_HOURS || DEFAULT_SLA_HOURS);
    const slaAcknowledgeBy = new Date(
      Date.now() + Math.max(1, slaHours) * 60 * 60 * 1000,
    ).toISOString();

    const category = (disputeCategory || "dispute").slice(0, 50);
    const insertRow: Record<string, unknown> = {
      user_id: userId,
      user_type: userType,
      chat_room_id: chatRoomId,
      original_message: disputeDetails,
      ai_response:
        fullMessage ||
        `Contact: ${userEmail || ""} | ${userPhone || ""}\nCategory: ${category}\nDispute: ${disputeDetails}`,
      category: "dispute",
      priority: "high",
      status: "open",
      dispute_category: category,
      sla_acknowledge_by: slaAcknowledgeBy,
    };

    if (jobId && typeof jobId === "string") {
      insertRow.job_id = jobId;
    }

    const { data: ticket, error } = await supabaseAdmin
      .from("support_tickets")
      .insert(insertRow)
      .select()
      .single();

    if (error) {
      const withoutExtras = { ...insertRow };
      delete withoutExtras.job_id;
      delete withoutExtras.dispute_category;
      delete withoutExtras.sla_acknowledge_by;
      const { data: ticket2, error: err2 } = await supabaseAdmin
        .from("support_tickets")
        .insert(withoutExtras)
        .select()
        .single();
      if (err2) {
        console.error("Error creating dispute ticket:", error, err2);
        return NextResponse.json(
          { error: "Failed to create dispute ticket" },
          { status: 500 },
        );
      }
      return finishDisputeResponse(
        ticket2,
        userId,
        userEmail,
        userPhone,
        userType,
        disputeDetails,
        slaAcknowledgeBy,
      );
    }

    return finishDisputeResponse(
      ticket,
      userId,
      userEmail,
      userPhone,
      userType,
      disputeDetails,
      slaAcknowledgeBy,
    );
  } catch (error) {
    console.error("Error in dispute submission API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function finishDisputeResponse(
  ticket: { id: string },
  userId: string,
  userEmail: string | undefined,
  userPhone: string | undefined,
  userType: string,
  disputeDetails: string,
  slaAcknowledgeBy: string,
) {
  const adminInbox = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
  if (adminInbox) {
    await sendNotification({
      type: "dispute_opened",
      recipientId: "admin",
      recipientEmail: adminInbox,
      channels: ["email"],
      idempotencyKey: `dispute_opened:admin:${ticket.id}`,
      data: {
        ticketId: ticket.id,
        userType,
        disputeDetails,
        slaAcknowledgeBy,
      },
    });
  }

  if (userEmail) {
    await sendNotification({
      type: "dispute_opened",
      recipientId: String(userId),
      recipientEmail: userEmail,
      recipientPhone: userPhone,
      channels: ["email"],
      idempotencyKey: `dispute_opened:user:${ticket.id}`,
      data: { ticketId: ticket.id, slaAcknowledgeBy },
    });
  }

  return NextResponse.json({
    success: true,
    ticket,
    ticketId: ticket.id,
    slaAcknowledgeBy,
  });
}
