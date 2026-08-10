/**
 * Harvest tradespeople from Google Places API and upsert into
 * outreach_prospects for later GHL sync.
 *
 * Usage:
 *   npx dotenv -e .env.local -- npx tsx scripts/harvest-places.ts \
 *     --trade plumber --location "Stoke-on-Trent" --limit 20
 */

import "dotenv/config";
import { getSupabaseAdmin } from "../lib/supabase";

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.rating",
  "places.userRatingCount",
  "places.websiteUri",
  "places.internationalPhoneNumber",
  "places.shortFormattedAddress",
  "places.location",
].join(",");

interface RawPlace {
  id: string;
  displayName?: { text: string };
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  internationalPhoneNumber?: string;
  shortFormattedAddress?: string;
  location?: { latitude: number; longitude: number };
}

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
      args[key] = val;
    }
  }
  return args;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function searchPlaces(
  apiKey: string,
  query: string,
  maxResults: number,
): Promise<RawPlace[]> {
  const url = "https://places.googleapis.com/v1/places:searchText";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery: query,
      maxResultCount: Math.min(maxResults, 20),
      languageCode: "en-GB",
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Places API error ${res.status}: ${body}`);
  }

  const json = await res.json();
  return (json.places ?? []) as RawPlace[];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const trade = args.trade;
  const location = args.location;
  const limit = parseInt(args.limit || "20", 10);

  if (!trade || !location) {
    console.error("Usage: npx tsx scripts/harvest-places.ts --trade <trade> --location <location> [--limit N]");
    process.exit(1);
  }

  const apiKey = process.env.GOOGLE_SERVER_API_KEY;
  if (!apiKey) {
    console.error("Missing GOOGLE_SERVER_API_KEY env var");
    process.exit(1);
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error("Supabase admin client not available — check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const query = `${trade} in ${location}`;
  console.log(`Searching: "${query}" (limit ${limit})`);

  const places = await searchPlaces(apiKey, query, limit);
  console.log(`Found ${places.length} results`);

  if (places.length === 0) {
    console.log("No results — nothing to do.");
    return;
  }

  const rows = places
    .filter((p) => p.id)
    .map((p) => ({
    place_id: p.id,
    name: p.displayName?.text ?? "Unknown",
    trade_slug: trade.toLowerCase(),
    location: location,
    address: p.shortFormattedAddress ?? null,
    phone: p.internationalPhoneNumber ?? null,
    website: p.websiteUri ?? null,
    rating: p.rating ?? null,
    review_count: p.userRatingCount ?? null,
  }));

  // Upsert: insert new, update existing only if not yet synced to GHL
  const { error } = await supabase.from("outreach_prospects").upsert(rows, {
    onConflict: "place_id",
    ignoreDuplicates: false,
  });

  if (error) {
    console.error("Upsert error:", error.message);
    process.exit(1);
  }

  // Log what was written
  for (const r of rows) {
    console.log(`  ${r.name}  |  ${r.phone ?? "no phone"}  |  ${r.rating ?? "-"}★ (${r.review_count ?? 0})`);
  }

  console.log(`\nDone — ${rows.length} prospects upserted into outreach_prospects.`);
  console.log('Run: npx dotenv -e .env.local -- npx tsx scripts/sync-prospects-to-ghl.ts');
}

main().catch((e) => {
  console.error("harvest-places failed:", e);
  process.exit(1);
});
