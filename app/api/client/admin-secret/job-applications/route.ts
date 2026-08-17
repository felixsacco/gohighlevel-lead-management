import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request: NextRequest) {
  try {
    // Get all job applications with job and tradesperson details
    const { searchParams } = new URL(request.url);

    const { data: applications, error } = await supabaseAdmin
      .from("job_applications")
      .select(
        `
        *,
        jobs (
          id,
          trade,
          job_description,
          postcode,
          budget,
          budget_type,
          clients (
            id,
            first_name,
            last_name,
            email
          )
        ),
        tradespeople (
          id,
          first_name,
          last_name,
          email,
          trade,
          years_experience,
          hourly_rate,
          phone
        )
      `
      )
      .order("applied_at", { ascending: false });

    if (error) {
      console.error("Error fetching job applications:", error);
      return NextResponse.json(
        { error: "Failed to fetch job applications" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      applications: applications || [],
    });
  } catch (error) {
    console.error("Error in admin job applications API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
