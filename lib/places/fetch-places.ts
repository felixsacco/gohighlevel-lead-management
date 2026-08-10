import { getSupabaseAdmin } from "@/lib/supabase";

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

const SEARCH_RADIUS_METERS = 15_000;

export interface GooglePlace {
  id: string;
  displayName?: { text: string };
  rating?: number;
  userRatingCount?: number;
  editorialSummary?: { text: string };
  regularOpeningHours?: { openNow: boolean; weekdayDescriptions?: string[] };
  websiteUri?: string;
  internationalPhoneNumber?: string;
  shortFormattedAddress?: string;
  primaryTypeDisplayName?: { text: string };
  location?: { latitude: number; longitude: number };
}

interface CachedRow {
  place_id: string;
  trade_slug: string;
  data: GooglePlace;
}

export async function fetchPlaces(
  tradeName: string,
  locationName: string,
  tradeSlug: string,
  locationSlug: string,
): Promise<GooglePlace[]> {
  const apiKey = process.env.GOOGLE_SERVER_API_KEY;
  if (!apiKey) {
    console.warn("GOOGLE_SERVER_API_KEY not configured — skipping Places fetch");
    return [];
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.warn("Supabase admin not available — skipping Places cache");
    return [];
  }

  const searchQuery = `${tradeName} in ${locationName}`;

  // 1. Check cache: rows for this trade_slug & location_slug that haven't expired
  const { data: cached, error: cacheErr } = await supabase
    .from("places_cache")
    .select("place_id, trade_slug, data")
    .eq("trade_slug", tradeSlug)
    .eq("location_slug", locationSlug)
    .gt("expires_at", new Date().toISOString());

  if (cacheErr) {
    console.warn("places_cache query error:", cacheErr.message);
  }

  if (cached?.length) {
    return (cached as CachedRow[]).map((r) => ({ ...r.data, id: r.place_id }));
  }

  // 2. Cache miss — call Google Places API
  const url = `https://places.googleapis.com/v1/places:searchText`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify({
        textQuery: searchQuery,
        maxResultCount: 20,
        languageCode: "en-GB",
        locationBias: {
          circle: {
            center: { latitude: 54.0, longitude: -2.0 },
            radius: SEARCH_RADIUS_METERS,
          },
        },
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Google Places API error:", res.status, await res.text());
      return [];
    }

    const json = await res.json();
    const places: GooglePlace[] = (json.places ?? []).map(
      (p: Record<string, unknown>) => {
        let contextualContents: unknown[] = [];
        if (p.contextualContents && Array.isArray(p.contextualContents)) {
          contextualContents = p.contextualContents as unknown[];
        }
        const merged = { ...(p as Record<string, unknown>), contextualContents };
        return { ...merged, id: p.id as string } as unknown as GooglePlace;
      },
    );

    if (places.length === 0) return [];

    // 3. Write to cache
    const rows = places.map((p) => ({
      place_id: p.id,
      trade_slug: tradeSlug,
      location_slug: locationSlug,
      data: p,
      fetched_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }));

    const { error: insertErr } = await supabase
      .from("places_cache")
      .upsert(rows, { onConflict: "place_id, trade_slug" });

    if (insertErr) {
      console.warn("places_cache upsert error:", insertErr.message);
    }

    return places;
  } catch (err) {
    console.error("fetchPlaces failed:", err);
    return [];
  }
}
