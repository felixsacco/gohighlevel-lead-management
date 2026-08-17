/**
 * Sync unsynced outreach_prospects to GoHighLevel CRM.
 * Reads all rows where ghl_contact_id IS NULL, creates contacts,
 * and writes back the returned contact IDs.
 *
 * Usage:
 *   npx dotenv -e .env.local -- npx tsx scripts/sync-prospects-to-ghl.ts
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { getSupabaseAdmin } from "../lib/supabase";
import { createGoHighLevelPrivateService, GoHighLevelService } from "../lib/gohighlevel-service";

interface ProspectRow {
  place_id: string;
  name: string;
  trade_slug: string;
  location: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  rating: number | null;
  review_count: number | null;
}

async function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function createContactWithBackoff(
  service: GoHighLevelService,
  prospect: ProspectRow,
  maxRetries = 3,
): Promise<string | null> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await service.createContact({
        firstName: prospect.name,
        lastName: "(Business)",
        email: `${prospect.place_id}@myapproved.local`,
        phone: prospect.phone ?? undefined,
        address1: prospect.address ?? undefined,
        tags: [
          "myapproved-prospect",
          prospect.trade_slug.toLowerCase(),
          prospect.location.toLowerCase(),
        ],
        customFields: [
          { id: "trade_slug", value: prospect.trade_slug },
          { id: "location", value: prospect.location },
          { id: "rating", value: prospect.rating?.toString() ?? "" },
          { id: "review_count", value: prospect.review_count?.toString() ?? "" },
          { id: "place_id", value: prospect.place_id },
          { id: "website", value: prospect.website ?? "" },
        ],
      });

      return result?.contact?.id ?? null;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const isRateLimited = msg.includes("429") || msg.includes("rate");

      if (isRateLimited && attempt < maxRetries) {
        const waitMs = 1000 * Math.pow(2, attempt);
        console.warn(`  Rate limited on ${prospect.name}, retrying in ${waitMs / 1000}s...`);
        await delay(waitMs);
        continue;
      }

      if (attempt < maxRetries && !isRateLimited) {
        console.warn(`  Failed ${prospect.name} (attempt ${attempt + 1}): ${msg}, retrying...`);
        await delay(1000);
        continue;
      }

      console.error(`  FAILED ${prospect.name}: ${msg}`);
      return null;
    }
  }
  return null;
}

async function main() {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!apiKey || !locationId) {
    console.error("Missing GHL_API_KEY or GHL_LOCATION_ID env vars");
    process.exit(1);
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error("Supabase admin client not available");
    process.exit(1);
  }

  // Fetch unsynced prospects
  const { data: prospects, error } = await supabase
    .from("outreach_prospects")
    .select("*")
    .is("ghl_contact_id", null)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Query error:", error.message);
    process.exit(1);
  }

  if (!prospects || prospects.length === 0) {
    console.log("No unsynced prospects found.");
    return;
  }

  console.log(`Found ${prospects.length} unsynced prospects\n`);

  const service = createGoHighLevelPrivateService(apiKey, locationId);

  let synced = 0;
  let failed = 0;

  for (let i = 0; i < prospects.length; i++) {
    const p = prospects[i] as ProspectRow;
    console.log(`[${i + 1}/${prospects.length}] ${p.name} (${p.trade_slug} in ${p.location})`);

    const contactId = await createContactWithBackoff(service, p);

    if (contactId) {
      const { error: updateErr } = await supabase
        .from("outreach_prospects")
        .update({ ghl_contact_id: contactId, synced_at: new Date().toISOString() })
        .eq("place_id", p.place_id);

      if (updateErr) {
        console.error(`  Wrote contact ${contactId} but failed to update DB: ${updateErr.message}`);
        failed++;
      } else {
        console.log(`  OK — contact ${contactId}`);
        synced++;
      }
    } else {
      failed++;
    }

    // Rate-limit: 100ms between requests
    if (i < prospects.length - 1) {
      await delay(100);
    }
  }

  console.log(`\nDone — ${synced} synced, ${failed} failed, ${prospects.length} total.`);
}

main().catch((e) => {
  console.error("sync-prospects-to-ghl failed:", e);
  process.exit(1);
});
