/**
 * Backfill latitude / longitude for existing jobs and tradespeople.
 *
 * Usage:
 *   npx dotenv -e .env.local -- npx tsx scripts/backfill-geocoding.ts
 */
import "dotenv/config";
import { getSupabaseAdmin } from "../lib/supabase";
import { geocodePostcode, normalisePostcode } from "../lib/geo/postcodes";

async function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function backfillTable(
  table: "jobs" | "tradespeople",
  batchSize = 50,
  delayMs = 110, // postcodes.io rate-limit: 10 req/s burst, < 1 req/s sustained
) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    console.error("Supabase admin client not available");
    return { total: 0, filled: 0, failed: 0 };
  }

  // Get distinct postcodes from rows missing lat/lng
  const { data: rows, error } = await admin
    .from(table)
    .select("id, postcode")
    .is("latitude", null)
    .not("postcode", "is", null);

  if (error) {
    console.error(`[${table}] Query error:`, error.message);
    return { total: 0, filled: 0, failed: 0 };
  }

  if (!rows?.length) {
    console.log(`[${table}] No rows to backfill.`);
    return { total: 0, filled: 0, failed: 0 };
  }

  // Deduplicate by normalised postcode to minimise API calls
  const seen = new Set<string>();
  const unique: { postcode: string; ids: string[] }[] = [];
  for (const r of rows as { id: string; postcode: string }[]) {
    const key = normalisePostcode(r.postcode);
    if (!key) continue;
    const existing = unique.find((u) => u.postcode === key);
    if (existing) {
      existing.ids.push(r.id);
    } else {
      unique.push({ postcode: key, ids: [r.id] });
    }
  }

  console.log(
    `[${table}] Backfilling ${rows.length} rows (${unique.length} unique postcodes)...`,
  );

  let filled = 0;
  let failed = 0;

  for (let i = 0; i < unique.length; i++) {
    const group = unique[i];
    const coords = await geocodePostcode(group.postcode);

    if (coords) {
      // Update all rows with this postcode
      const { error: updateErr } = await admin
        .from(table)
        .update({ latitude: coords.latitude, longitude: coords.longitude })
        .in("id", group.ids);

      if (updateErr) {
        console.error(
          `[${table}] Update error for ${group.postcode}: ${updateErr.message}`,
        );
        failed += group.ids.length;
      } else {
        filled += group.ids.length;
      }
    } else {
      failed += group.ids.length;
    }

    if ((i + 1) % 10 === 0) {
      console.log(`[${table}] ${i + 1}/${unique.length} postcodes processed...`);
    }

    // Respect postcodes.io rate limits
    if (i < unique.length - 1) {
      await delay(delayMs);
    }
  }

  console.log(
    `[${table}] Done — ${filled} rows filled, ${failed} failed, ${rows.length} total.`,
  );
  return { total: rows.length, filled, failed };
}

async function main() {
  console.log("Starting geocoding backfill...\n");
  await backfillTable("jobs");
  console.log("");
  await backfillTable("tradespeople");
  console.log("\nBackfill complete.");
}

main().catch((e) => {
  console.error("backfill-geocoding failed:", e);
  process.exit(1);
});
