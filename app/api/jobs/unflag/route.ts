import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";

export async function POST(request: NextRequest) {
  try {
    const { jobId, adminNotes, adminId } = await request.json();

    // Validate required fields
    if (!jobId) {
      return NextResponse.json(
        { success: false, message: "Job ID is required" },
        { status: 400 }
      );
    }

    // Check if the job exists and is flagged
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id, is_flagged, flag_reason, trade, job_description, client_id")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 }
      );
    }

    // Check if job is flagged
    if (!job.is_flagged) {
      return NextResponse.json(
        { success: false, message: "This job is not flagged" },
        { status: 400 }
      );
    }

    // Unflag the job
    const { data: updatedJob, error: updateError } = await supabase
      .from("jobs")
      .update({
        is_flagged: false,
        admin_notes: adminNotes?.trim() || null,
        unflagged_by: adminId || "admin",
        unflagged_at: new Date().toISOString()
      })
      .eq("id", jobId)
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
        unflagged_by,
        created_at,
        clients:client_id (
          id,
          first_name,
          last_name,
          email
        ),
        tradespeople:assigned_tradesperson_id (
          id,
          first_name,
          last_name,
          trade,
          phone
        )
      `)
      .single();

    if (updateError) {
      console.error("Error unflagging job:", updateError);
      return NextResponse.json(
        { success: false, message: "Failed to unflag job. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Job unflagged successfully",
      job: updatedJob
    });

  } catch (error) {
    console.error("Error in unflag job API:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

