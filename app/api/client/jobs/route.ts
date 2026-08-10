import { NextRequest, NextResponse } from "next/server";
import { createClient, getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // Validate userId if provided
    if (userId && (userId === "undefined" || userId === "null" || !userId.trim())) {
      return NextResponse.json(
        { error: "Invalid user ID provided" },
        { status: 400 }
      );
    }

    // Service role so nested job_applications are returned (anon RLS often hides them).
    const supabase = userId ? getSupabaseAdmin() : createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const jobsTable = supabase.from("jobs");
    const withUserFilter = userId
      ? jobsTable
          .select(
            `
        *,
        tradespeople (
          id,
          first_name,
          last_name,
          trade,
          years_experience,
          hourly_rate,
          phone,
          email
        ),
        job_applications (
          id,
          status,
          quotation_amount,
          quotation_notes,
          applied_at,
          accepted_at,
          tradespeople (
            id,
            first_name,
            last_name,
            trade,
            phone,
            email,
            years_experience,
            hourly_rate
          )
        ),
        job_reviews (
          id,
          tradesperson_id,
          reviewer_type,
          reviewer_id,
          rating,
          review_text,
          reviewed_at
        )
      `
          )
          .eq("client_id", userId)
      : jobsTable.select(
          `
        *,
         clients (
          id,
          email,
          first_name,
          last_name
        ),
        job_reviews (
          id,
          tradesperson_id,
          reviewer_type,
          reviewer_id,
          rating,
          review_text,
          reviewed_at
        )
      `
        );

    const { data: jobs, error } = await withUserFilter.order(
      "created_at",
      { ascending: false }
    );
    if (error) {
      console.error("Error fetching client jobs:", error);
      
      // Provide more specific error messages
      if (error.code === '22P02') {
        return NextResponse.json(
          { error: "Invalid user ID format. Please log in again." },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: "Failed to fetch jobs" },
        { status: 500 }
      );
    }

    return NextResponse.json({ jobs: jobs || [] });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
