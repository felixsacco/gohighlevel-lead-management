import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";

export async function POST(request: NextRequest) {
  try {
    const { jobId, flagReason, userId, userType } = await request.json();

    // Validate required fields
    if (!jobId || !flagReason || !userId) {
      return NextResponse.json(
        { success: false, message: "Job ID, flag reason, and user ID are required" },
        { status: 400 }
      );
    }

    // Validate flag reason length
    if (flagReason.trim().length < 10) {
      return NextResponse.json(
        { success: false, message: "Flag reason must be at least 10 characters long" },
        { status: 400 }
      );
    }

    // Check if the job exists
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id, client_id, is_flagged, trade, job_description")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 }
      );
    }

    // Check if job is already flagged
    if (job.is_flagged) {
      return NextResponse.json(
        { success: false, message: "This job is already flagged" },
        { status: 400 }
      );
    }

    // Flag the job
    const { data: updatedJob, error: updateError } = await supabase
      .from("jobs")
      .update({
        is_flagged: true,
        flag_reason: flagReason.trim(),
        flagged_by: userId,
        flagged_at: new Date().toISOString(),
        flagged_by_type: userType || 'unknown' // Track who flagged it
      })
      .eq("id", jobId)
      .select()
      .single();

    if (updateError) {
      console.error("Error flagging job:", updateError);
      return NextResponse.json(
        { success: false, message: "Failed to flag job. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Job flagged successfully. Admin will review your concern.",
      job: updatedJob
    });

  } catch (error) {
    console.error("Error in flag job API:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json(
        { success: false, message: "Client ID is required" },
        { status: 400 }
      );
    }

    // Get flagged jobs for the client
    const { data: flaggedJobs, error } = await supabase
      .from("jobs")
      .select(`
        id,
        trade,
        job_description,
        postcode,
        budget,
        budget_type,
        is_flagged,
        flag_reason,
        flagged_at,
        admin_notes,
        unflagged_at,
        created_at,
        tradespeople:assigned_tradesperson_id (
          id,
          first_name,
          last_name,
          trade,
          phone
        )
      `)
      .eq("client_id", clientId)
      .eq("is_flagged", true)
      .order("flagged_at", { ascending: false });

    if (error) {
      console.error("Error fetching flagged jobs:", error);
      return NextResponse.json(
        { success: false, message: "Failed to fetch flagged jobs" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      flaggedJobs: flaggedJobs || []
    });

  } catch (error) {
    console.error("Error in get flagged jobs API:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
