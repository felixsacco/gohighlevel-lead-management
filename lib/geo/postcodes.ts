/**
 * Wrapper around postcodes.io — free, no key, UK only.
 * Caches results in the postcode_cache table so we never hit the API
 * for the same postcode twice.
 */
import { getSupabaseAdmin } from "../supabase";

const BASE = "https://api.postcodes.io/postcodes";

interface PostcodeResult {
  postcode: string;
  latitude: number;
  longitude: number;
}

/** Normalise a postcode for cache lookups: uppercase, strip whitespace. */
export function normalisePostcode(postcode: string): string {
  return postcode.toUpperCase().replace(/\s+/g, "");
}

/** Look up lat/lng from the local cache. */
async function cacheGet(
  postcode: string,
): Promise<{ latitude: number; longitude: number } | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;
  const { data } = await admin
    .from("postcode_cache")
    .select("latitude, longitude")
    .eq("postcode", normalisePostcode(postcode))
    .maybeSingle();
  return data ?? null;
}

/** Store lat/lng in the local cache (upsert). */
async function cacheSet(
  postcode: string,
  latitude: number,
  longitude: number,
): Promise<void> {
  const admin = getSupabaseAdmin();
  if (!admin) return;
  await admin
    .from("postcode_cache")
    .upsert(
      { postcode: normalisePostcode(postcode), latitude, longitude },
      { onConflict: "postcode" },
    );
}

/**
 * Geocode a UK postcode.
 * Returns { latitude, longitude } or null on failure.
 * Never throws — failures are logged and null is returned.
 */
export async function geocodePostcode(
  postcode: string,
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const normalised = normalisePostcode(postcode);
    if (!normalised) return null;

    // 1. Check cache first
    const cached = await cacheGet(normalised);
    if (cached) return cached;

    // 2. Hit postcodes.io
    const res = await fetch(`${BASE}/${encodeURIComponent(normalised)}`);
    if (!res.ok) {
      console.warn(
        `[geocode] postcodes.io returned ${res.status} for "${normalised}"`,
      );
      return null;
    }

    const body = (await res.json()) as {
      result?: { latitude: number; longitude: number; postcode: string };
    };

    const lat = body.result?.latitude;
    const lng = body.result?.longitude;

    if (lat == null || lng == null) {
      console.warn(`[geocode] No coordinates returned for "${normalised}"`);
      return null;
    }

    // 3. Persist in cache
    await cacheSet(normalised, lat, lng);

    return { latitude: lat, longitude: lng };
  } catch (err) {
    console.error(
      `[geocode] Failed for "${postcode}":`,
      err instanceof Error ? err.message : String(err),
    );
    return null;
  }
}
