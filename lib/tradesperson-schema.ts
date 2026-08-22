import { graphify } from "@/components/SchemaMarkup";

// Shared server-side build of per-tradesperson LocalBusiness JSON-LD.
// Used by both the API route (`/api/trade-data/[id]`) and the server-rendered
// profile page so the behaviour stays in sync and the honest-data rules
// (no fabricated ratings or compliance claims) live in a single place.

const PLACEHOLDER_NAME_PATTERN =
  /\b(test|tester|testing|demo|sample|placeholder|mock|fake|dummy|example|asdf|qwerty|kill|asdas|abcd|xxxx|aaaa)\b/i;

function placeholderEmail(email: string | null | undefined): boolean {
  const e = (email || "").toLowerCase();
  if (!e) return false;
  return (
    e.includes("test@") ||
    e.includes("+test") ||
    e.endsWith("@test.com") ||
    e.endsWith("@example.com") ||
    e.endsWith("@example.co.uk") ||
    e.endsWith("@mailinator.com")
  );
}

export function looksLikePlaceholder(tradesperson: {
  first_name?: string | null;
  last_name?: string | null;
  trade?: string | null;
  city?: string | null;
  email?: string | null;
}): boolean {
  const firstName = (tradesperson.first_name || "").trim();
  const lastName = (tradesperson.last_name || "").trim();
  const trade = (tradesperson.trade || "").trim();
  const fullName = `${firstName} ${lastName}`.trim();

  return (
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
    placeholderEmail(tradesperson.email)
  );
}

type Review = {
  id?: string;
  rating?: number | null;
  review_text?: string | null;
  reviewer_type?: string | null;
  reviewed_at?: string | null;
};

export function buildProfileSchema(tradesperson: {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  trade?: string | null;
  city?: string | null;
  postcode?: string | null;
  hourly_rate?: string | number | null;
  is_verified?: boolean | null;
  certification_verified?: boolean | null;
  certification_expires_at?: string | null;
  verification_status?: string | null;
  job_reviews?: Review[] | null;
}): Record<string, any> {
  const fullName = `${(tradesperson.first_name || "").trim()} ${(tradesperson.last_name || "").trim()}`.trim();
  const trade = (tradesperson.trade || "").trim();
  const description = `${trade}${tradesperson.city ? ` based in ${tradesperson.city}` : ""}.`;

  let priceRange: string | undefined;
  if (
    tradesperson.hourly_rate !== null &&
    tradesperson.hourly_rate !== undefined &&
    tradesperson.hourly_rate !== ""
  ) {
    const num =
      typeof tradesperson.hourly_rate === "number"
        ? tradesperson.hourly_rate
        : parseFloat(String(tradesperson.hourly_rate));
    if (!isNaN(num) && num > 0) {
      priceRange = `£${num.toFixed(2)}/hr`;
    }
  }

  const profileUrl = `https://myapproved.com/tradesperson/${tradesperson.id}`;

  const profileJsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${profileUrl}#localbusiness`,
    name: fullName,
    url: profileUrl,
    description,
    priceRange,
    address: {
      "@type": "PostalAddress",
      addressLocality: tradesperson.city || undefined,
      postalCode: tradesperson.postcode || undefined,
      addressCountry: "GB",
    },
    areaServed: tradesperson.city || undefined,
  };

  if (tradesperson.is_verified) {
    profileJsonLd["identifier"] = {
      "@type": "PropertyValue",
      name: "MyApproved identity verification",
      value: "verified",
    };
  }

  if (tradesperson.certification_verified === true) {
    profileJsonLd["hasCredential"] = {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "Trade Professional Certification",
      description:
        "Certification independently verified by a MyApproved administrator against the relevant UK trade register or scheme.",
      recognizedBy: {
        "@type": "Organization",
        "@id": "https://myapproved.com/#organization",
        name: "MyApproved",
        url: "https://myapproved.com",
      },
    };
    if (tradesperson.verification_status) {
      profileJsonLd["hasCredential"]["credentialStatus"] =
        tradesperson.verification_status;
    }
    if (tradesperson.certification_expires_at) {
      profileJsonLd["hasCredential"]["validThrough"] =
        tradesperson.certification_expires_at;
    }
  }

  // Real ratings/reviews only — never fabricated. aggregateRating is emitted
  // only when there is at least one real review carrying a positive rating.
  const reviews = (tradesperson.job_reviews || []).filter(
    (r) => r.rating && r.rating > 0
  );
  const totalReviews = reviews.length;

  if (totalReviews > 0) {
    const averageRating =
      reviews.reduce((sum, r) => sum + (r.rating as number), 0) / totalReviews;

    profileJsonLd["aggregateRating"] = {
      "@type": "AggregateRating",
      ratingValue: parseFloat(averageRating.toFixed(2)),
      reviewCount: totalReviews,
      bestRating: 5,
      worstRating: 1,
    };

    profileJsonLd["review"] = reviews
      .map((r) => ({
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: r.rating as number,
          bestRating: 5,
          worstRating: 1,
        },
        author: { "@type": "Person", name: "Verified Customer" },
        reviewBody: (r.review_text || "").trim(),
        datePublished: r.reviewed_at || undefined,
      }))
      .filter((r) => r.reviewBody || r.datePublished);
  }

  return profileJsonLd;
}

export function buildProfileGraph(tradesperson: Parameters<typeof buildProfileSchema>[0]): any {
  return graphify([buildProfileSchema(tradesperson)]);
}
