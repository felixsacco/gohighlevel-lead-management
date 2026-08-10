import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseUrl = "https://jismdkfjkngwbpddhomx.supabase.co";
    const supabaseKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A";

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { searchParams } = new URL(request.url);

    console.log("Fetching tradesperson details for ID:", params.id);

    // Get tradesperson with reviews
    const { data: tradesperson, error } = await supabase
      .from("tradespeople")
      .select(
        `
        id,
        first_name,
        last_name,
        trade,
        city,
        postcode,
        phone,
        email,
        profile_picture_url,
        years_experience,
        hourly_rate,
        is_verified,
        is_active,
        is_approved,
        created_at,
        job_reviews!job_reviews_tradesperson_id_fkey (
          id,
          rating,
          review_text,
          reviewer_type,
          reviewer_id,
          reviewed_at
        )
      `
      )
      .eq("id", params.id)
      .eq("is_active", true)
      .eq("is_approved", true)
      .single();

    if (error) {
      console.error("Error fetching tradesperson:", error);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch tradesperson: ${error.message}`,
        },
        { status: 500 }
      );
    }

    if (!tradesperson) {
      return NextResponse.json(
        { success: false, error: "Tradesperson not found" },
        { status: 404 }
      );
    }

    // Hard server-side guard so placeholder / test profiles never appear,
    // even if they accidentally have is_active = is_approved = true.
    const firstName = (tradesperson.first_name || "").trim();
    const lastName = (tradesperson.last_name || "").trim();
    const trade = (tradesperson.trade || "").trim();
    const fullName = `${firstName} ${lastName}`.trim();
    const PLACEHOLDER_NAME_PATTERN =
      /\b(test|tester|testing|demo|sample|placeholder|mock|fake|dummy|example|asdf|qwerty|kill|asdas|abcd|xxxx|aaaa)\b/i;
    const placeholderEmail = (() => {
      const e = (tradesperson.email || "").toLowerCase();
      if (!e) return false;
      return (
        e.includes("test@") ||
        e.includes("+test") ||
        e.endsWith("@test.com") ||
        e.endsWith("@example.com") ||
        e.endsWith("@example.co.uk") ||
        e.endsWith("@mailinator.com")
      );
    })();

    const looksLikePlaceholder =
      !firstName ||
      !lastName ||
      !trade ||
      !tradesperson.city ||
      firstName.replace(/[^a-z]/gi, "").length < 2 ||
      lastName.replace(/[^a-z]/gi, "").length < 2 ||
      PLACEHOLDER_NAME_PATTERN.test(firstName) ||
      PLACEHOLDER_NAME_PATTERN.test(lastName) ||
      PLACEHOLDER_NAME_PATTERN.test(fullName) ||
      PLACEHOLDER_NAME_PATTERN.test(trade) ||
      placeholderEmail;

    if (looksLikePlaceholder) {
      return NextResponse.json(
        { success: false, error: "Tradesperson not found" },
        { status: 404 }
      );
    }

    // Generate initials for profile picture
    const nameParts = fullName.split(" ").filter((part) => part.length > 0);
    const initials =
      nameParts.length >= 2
        ? `${nameParts[0][0]}${
            nameParts[nameParts.length - 1][0]
          }`.toUpperCase()
        : (fullName.substring(0, 2) || "NA").toUpperCase();

    // Calculate real ratings and reviews from job_reviews
    const reviews = tradesperson.job_reviews || [];
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) /
          totalReviews
        : 0;

    // Honest description (no random numbers, no fabricated experience)
    const description = `${trade}${
      tradesperson.city ? ` based in ${tradesperson.city}` : ""
    }.`;

    // Hourly rate only when actually present
    let hourlyRate = "";
    if (
      tradesperson.hourly_rate !== null &&
      tradesperson.hourly_rate !== undefined &&
      tradesperson.hourly_rate !== ""
    ) {
      const num =
        typeof tradesperson.hourly_rate === "number"
          ? tradesperson.hourly_rate
          : parseFloat(tradesperson.hourly_rate);
      if (!isNaN(num) && num > 0) {
        hourlyRate = `£${num.toFixed(2)}/hr`;
      }
    }

    const transformedTradesperson = {
      id: tradesperson.id,
      name: fullName,
      trade,
      rating: parseFloat(averageRating.toFixed(1)) || 0,
      reviews: totalReviews,
      reviewsData: reviews.map((review: any) => ({
        id: review.id,
        rating: review.rating,
        text: review.review_text,
        reviewerType: review.reviewer_type,
        reviewedAt: review.reviewed_at,
      })),
      location: [tradesperson.city, tradesperson.postcode].filter(Boolean).join(", "),
      city: tradesperson.city || "",
      postcode: tradesperson.postcode || "",
      distance: "",
      image: tradesperson.profile_picture_url || null,
      initials,
      verified: tradesperson.is_verified || false,
      yearsExperience:
        typeof tradesperson.years_experience === "number"
          ? tradesperson.years_experience
          : 0,
      description,
      hourlyRate,
      responseTime: "",
      phone: tradesperson.phone || "",
      email: tradesperson.email || "",
    };

    return NextResponse.json({
      success: true,
      tradesperson: transformedTradesperson,
    });
  } catch (error: any) {
    console.error("Error in tradesperson details API:", error);
    return NextResponse.json(
      { success: false, error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
