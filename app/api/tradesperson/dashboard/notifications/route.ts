import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// Wall A (W1): service-role aggregate mirror of loadNotifications in
// app/dashboard/tradesperson/page.tsx. The seven sub-queries there read
// chat_rooms / chat_messages / job_applications / jobs / job_notifications /
// job_reviews — all anon-revoked — so the dashboard's anon browser client can no
// longer run them. Each leg below reproduces the original select + filters
// verbatim and is individually fault-isolated (a failing leg returns [] exactly
// as the original's per-leg try/catch did), so the client-side synthesis in
// loadNotifications is unchanged: it destructures the returned arrays and runs
// the same combine/sort it always ran.
//
// The newJobs leg always applies .eq("trade", trade). The original ran
// .eq("trade", tradesperson?.trade), which was undefined on first load (the mount
// effect's closure) so supabase appended trade=eq.undefined and matched nothing —
// new jobs only ever appeared on bell-click refreshes from later renders where
// the trade was set. The client passes tradesperson?.trade ?? "" for the same
// param, so this route reproduces that behaviour faithfully: empty "" matches
// nothing on the auto-load; the real trade filters the refresh.
//
// tradespersonId + trade query params are caller-supplied (Phase-3 residue, same
// precedent as dashboard-summary) — reads scoped to the caller's own rows.

export const dynamic = "force-dynamic";

const DAY = 24 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tradespersonId = searchParams.get("tradespersonId");
  const trade = searchParams.get("trade") || "";

  if (!tradespersonId?.trim()) {
    return NextResponse.json(
      { success: false, error: "tradespersonId is required" },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: "Service unavailable" },
      { status: 503 },
    );
  }

  let chatMessages: any[] = [];

  // Unread chat messages: rooms first, then unread messages where the
  // tradesperson is not the sender.
  try {
    const { data: chatRooms, error: roomsError } = await supabase
      .from("chat_rooms")
      .select("id")
      .eq("tradesperson_id", tradespersonId);
    if (roomsError) {
      console.error("[dashboard/notifications] chat rooms:", roomsError.message);
    } else if (chatRooms && chatRooms.length > 0) {
      const roomIds = chatRooms.map((room) => room.id);
      const { data: messages, error: chatError } = await supabase
        .from("chat_messages")
        .select(
          `
          *,
          chat_rooms (
            jobs (
              trade,
              job_description
            )
          )
        `,
        )
        .in("chat_room_id", roomIds)
        .neq("sender_id", tradespersonId)
        .is("read_at", null);
      if (chatError) {
        console.error(
          "[dashboard/notifications] chat messages:",
          chatError.message,
        );
      } else {
        chatMessages = messages || [];
      }
    }
  } catch (error) {
    console.error("[dashboard/notifications] chat leg failed:", error);
  }

  // Job application status changes (recent, last 7 days).
  let applicationUpdates: any[] = [];
  try {
    const { data: apps, error: appError } = await supabase
      .from("job_applications")
      .select(
        `
        *,
        jobs (
          trade,
          job_description,
          postcode
        )
      `,
      )
      .eq("tradesperson_id", tradespersonId)
      .in("status", ["accepted", "rejected"])
      .gte("applied_at", new Date(Date.now() - 7 * DAY).toISOString());
    if (appError) {
      console.error(
        "[dashboard/notifications] application updates:",
        appError.message,
      );
    } else {
      applicationUpdates = apps || [];
    }
  } catch (error) {
    console.error("[dashboard/notifications] applications leg failed:", error);
  }

  // New job matches (approved jobs matching the tradesperson's trade, last 24h).
  let newJobs: any[] = [];
  try {
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("*")
      .eq("trade", trade)
      .eq("is_approved", true)
      .eq("status", "approved")
      .eq("application_status", "open")
      .gte("created_at", new Date(Date.now() - DAY).toISOString());
    if (jobsError) {
      console.error(
        "[dashboard/notifications] new jobs:",
        jobsError.message,
      );
    } else {
      newJobs = jobs || [];
    }
  } catch (error) {
    console.error("[dashboard/notifications] new-jobs leg failed:", error);
  }

  // In-app job notifications (instant job-posted alerts).
  let jobNotificationRows: any[] = [];
  try {
    const { data: rows, error: notifError } = await supabase
      .from("job_notifications")
      .select("id, job_id, title, message, created_at, jobs(id, trade, postcode, budget)")
      .eq("tradesperson_id", tradespersonId)
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(50);
    if (notifError) {
      console.error(
        "[dashboard/notifications] job_notifications:",
        notifError.message,
      );
    } else if (rows) {
      jobNotificationRows = rows;
    }
  } catch (error) {
    console.error("[dashboard/notifications] job_notifications leg failed:", error);
  }

  // Completed jobs where the tradesperson was assigned (last 7 days).
  let completedJobs: any[] = [];
  try {
    const { data: jobs, error: completedError } = await supabase
      .from("jobs")
      .select("*")
      .eq("assigned_tradesperson_id", tradespersonId)
      .not("completed_at", "is", null)
      .gte("completed_at", new Date(Date.now() - 7 * DAY).toISOString());
    if (completedError) {
      console.error(
        "[dashboard/notifications] completed jobs:",
        completedError.message,
      );
    } else {
      completedJobs = jobs || [];
    }
  } catch (error) {
    console.error("[dashboard/notifications] completed leg failed:", error);
  }

  // New reviews received (last 7 days).
  let newReviews: any[] = [];
  try {
    const { data: reviews, error: reviewsError } = await supabase
      .from("job_reviews")
      .select(
        `
        *,
        jobs (
          trade,
          job_description
        )
      `,
      )
      .eq("tradesperson_id", tradespersonId)
      .gte("reviewed_at", new Date(Date.now() - 7 * DAY).toISOString());
    if (reviewsError) {
      console.error(
        "[dashboard/notifications] reviews:",
        reviewsError.message,
      );
    } else {
      newReviews = reviews || [];
    }
  } catch (error) {
    console.error("[dashboard/notifications] reviews leg failed:", error);
  }

  // Job assignments (last 7 days).
  let jobAssignments: any[] = [];
  try {
    const { data: jobs, error: assignmentError } = await supabase
      .from("jobs")
      .select("*")
      .eq("assigned_tradesperson_id", tradespersonId)
      .not("assigned_tradesperson_id", "is", null)
      .gte("updated_at", new Date(Date.now() - 7 * DAY).toISOString());
    if (assignmentError) {
      console.error(
        "[dashboard/notifications] job assignments:",
        assignmentError.message,
      );
    } else {
      jobAssignments = jobs || [];
    }
  } catch (error) {
    console.error("[dashboard/notifications] assignments leg failed:", error);
  }

  return NextResponse.json({
    success: true,
    data: {
      chatMessages,
      applicationUpdates,
      newJobs,
      jobNotificationRows,
      completedJobs,
      newReviews,
      jobAssignments,
    },
  });
}
