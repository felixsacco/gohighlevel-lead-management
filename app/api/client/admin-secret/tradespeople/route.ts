import { NextRequest, NextResponse } from "next/server";
// import { createClient } from '@supabase/supabase-js';
import { createClient } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

// const supabaseAdmin = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get all tradespeople ordered by creation date (newest first)
    const supabaseAdmin = createClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const { data: tradespeople, error } = await supabaseAdmin
      .from("tradespeople")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tradespeople:", error);
      return NextResponse.json(
        { error: "Failed to fetch tradespeople" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      tradespeople: tradespeople || [],
    });
  } catch (error) {
    console.error("Error in admin tradespeople API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
