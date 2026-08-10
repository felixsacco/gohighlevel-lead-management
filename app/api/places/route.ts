import { NextRequest, NextResponse } from "next/server";

const FIELD_MASK = [
  "places.displayName",
  "places.rating",
  "places.userRatingCount",
  "places.editorialSummary",
  "places.regularOpeningHours",
  "places.websiteUri",
  "places.internationalPhoneNumber",
  "places.shortFormattedAddress",
  "places.addressComponents",
  "places.primaryTypeDisplayName",
  "places.location",
  "contextualContents",
].join(",");

export async function POST(req: NextRequest) {
  try {
    const { lat, lng, trade, radiusMeters } = await req.json();

    const apiKey = process.env.GOOGLE_SERVER_API_KEY;
    if (!apiKey) {
      console.warn("[places] GOOGLE_SERVER_API_KEY is not configured — returning empty results.");
      return NextResponse.json({ places: [] });
    }

    const body: Record<string, unknown> = {
      textQuery: `${trade} near me`,
      maxResultCount: 20,
      languageCode: "en-GB",
    };

    if (lat != null && lng != null) {
      body.locationBias = {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: radiusMeters ?? 16093, // default 10 miles
        },
      };
    }

    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { error: "Google Places API error", detail },
        { status: res.status }
      );
    }

    const data = await res.json();

    // contextualContents is a top-level array parallel to places — merge by index
    const places: unknown[] = data.places ?? [];
    const contextual: unknown[] = data.contextualContents ?? [];
    const merged = places.map((place: any, i: number) => ({
      ...place,
      contextualContents: contextual[i] ? [contextual[i]] : [],
    }));

    return NextResponse.json({ places: merged });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unexpected server error" },
      { status: 500 }
    );
  }
}
