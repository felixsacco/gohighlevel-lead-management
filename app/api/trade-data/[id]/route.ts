import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { buildProfileSchema, looksLikePlaceholder } from "@/lib/tradesperson-schema";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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
        certification_verified,
        certification_expires_at,
        verification_status,
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
    if (looksLikePlaceholder(tradesperson)) {
      return NextResponse.json(
        { success: false, error: "Tradesperson not found" },
        { status: 404 }
      );
    }

    // Generate initials for profile picture
    const firstName = (tradesperson.first_name || "").trim();
    const lastName = (tradesperson.last_name || "").trim();
    const fullName = `${firstName} ${lastName}`.trim();
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
    const description = `${tradesperson.trade}${
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

    // Build JSON-LD from real data only — no fabricated ratings, reviews, or
    // compliance claims. The credential block is emitted only when an admin
    // has manually set certification_verified = true.
    const profileJsonLd = buildProfileSchema(tradesperson);

    const transformedTradesperson = {
      id: tradesperson.id,
      name: fullName,
      trade: tradesperson.trade || "",
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
      jsonLd: profileJsonLd,
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
