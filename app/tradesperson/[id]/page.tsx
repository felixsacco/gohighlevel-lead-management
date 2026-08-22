import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  buildProfileSchema,
  looksLikePlaceholder,
} from "@/lib/tradesperson-schema";
import TradespersonProfileClient from "./TradespersonProfileClient";

type Props = {
  params: { id: string };
};

type ReviewRow = {
  id: string;
  rating: number;
  review_text: string;
  reviewer_type: string;
  reviewed_at: string;
};

type TradespersonRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  trade: string | null;
  city: string | null;
  postcode: string | null;
  phone: string | null;
  email: string | null;
  profile_picture_url: string | null;
  years_experience: number | null;
  hourly_rate: string | number | null;
  is_verified: boolean | null;
  certification_verified: boolean | null;
  certification_expires_at: string | null;
  verification_status: string | null;
  job_reviews: ReviewRow[] | null;
};

export function generateStaticParams(): { id: string }[] {
  // Static params are intentionally empty: profiles are dynamic. The server
  // still renders the JSON-LD into initial HTML on every request.
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const admin = getSupabaseAdmin();
  if (!admin) return {};

  const { data } = await admin
    .from("tradespeople")
    .select("id, first_name, last_name, trade, city")
    .eq("id", params.id)
    .eq("is_active", true)
    .eq("is_approved", true)
    .single();

  if (!data || looksLikePlaceholder(data)) return {};

  const name = `${(data.first_name || "").trim()} ${(data.last_name || "").trim()}`.trim();
  const title = `${name} — ${data.trade} in ${data.city} | MyApproved`;
  const description = `Verified ${data.trade} in ${data.city}. Identity-checked, insurance-confirmed local tradesperson on MyApproved.`;

  return {
    title,
    description,
    alternates: { canonical: `https://myapproved.com/tradesperson/${params.id}` },
    openGraph: {
      title,
      description,
      url: `https://myapproved.com/tradesperson/${params.id}`,
      siteName: "MyApproved",
      locale: "en_GB",
      type: "profile",
    },
  };
}

export default async function TradespersonProfilePage({ params }: Props) {
  const { id } = params;
  const admin = getSupabaseAdmin();

  if (!admin) {
    notFound();
  }

  const { data: tradesperson, error } = await admin!
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
    .eq("id", id)
    .eq("is_active", true)
    .eq("is_approved", true)
    .single();

  if (error || !tradesperson || looksLikePlaceholder(tradesperson)) {
    notFound();
  }

  const fullName = `${(tradesperson.first_name || "").trim()} ${(tradesperson.last_name || "").trim()}`.trim();
  const initials =
    fullName.split(" ").filter(Boolean).length >= 2
      ? fullName
          .split(" ")
          .filter(Boolean)
          .slice(0, 1)
          .concat(fullName.split(" ").filter(Boolean).slice(-1))
          .map((p) => p[0])
          .join("")
          .toUpperCase()
      : (fullName.substring(0, 2) || "NA").toUpperCase();

  const reviews = (tradesperson as TradespersonRow).job_reviews || [];
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  let hourlyRate = "";
  const hr = (tradesperson as TradespersonRow).hourly_rate;
  if (hr !== null && hr !== undefined && hr !== "") {
    const num = typeof hr === "number" ? hr : parseFloat(String(hr));
    if (!isNaN(num) && num > 0) hourlyRate = `£${num.toFixed(2)}/hr`;
  }

  const description = `${(tradesperson as TradespersonRow).trade}${
    (tradesperson as TradespersonRow).city
      ? ` based in ${(tradesperson as TradespersonRow).city}`
      : ""
  }.`;

  const profileSchema = buildProfileSchema(
    tradesperson as unknown as Parameters<typeof buildProfileSchema>[0]
  );

  const data = {
    id: (tradesperson as TradespersonRow).id,
    name: fullName,
    trade: (tradesperson as TradespersonRow).trade || "",
    rating: parseFloat(averageRating.toFixed(1)) || 0,
    reviews: totalReviews,
    reviewsData: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      text: r.review_text,
      reviewerType: r.reviewer_type,
      reviewedAt: r.reviewed_at,
    })),
    location: [(tradesperson as TradespersonRow).city, (tradesperson as TradespersonRow).postcode]
      .filter(Boolean)
      .join(", "),
    city: (tradesperson as TradespersonRow).city || "",
    postcode: (tradesperson as TradespersonRow).postcode || "",
    distance: "",
    image: (tradesperson as TradespersonRow).profile_picture_url || null,
    initials,
    verified: (tradesperson as TradespersonRow).is_verified || false,
    yearsExperience:
      typeof (tradesperson as TradespersonRow).years_experience === "number"
        ? ((tradesperson as TradespersonRow).years_experience as number)
        : 0,
    description,
    hourlyRate,
    responseTime: "",
    phone: (tradesperson as TradespersonRow).phone || "",
    email: (tradesperson as TradespersonRow).email || "",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileSchema) }}
      />
      <TradespersonProfileClient data={data} />
    </>
  );
}
