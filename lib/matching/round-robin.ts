import type { SupabaseClient } from "@supabase/supabase-js";
import { isPostcodeWithinRange } from "@/lib/utils/postcode-matcher";
import { tradesMatch } from "@/lib/utils/trade-matcher";
import { maskUkPhoneNumber } from "@/lib/utils/phone-mask";
import { sendNotification } from "@/lib/notifications";
import type { NotificationEventType } from "@/lib/notifications/types";
import { isRegulatedTrade, getRegulator } from "./regulated-trades";

const DEFAULT_LEAD_PRICE_PENCE = 499;
const PAY_PER_LEAD_PLAN = "pay_per_lead";
const ROUND_DURATION_HOURS = 24;
const MAX_ROUNDS = 3;
const TRADESPEOPLE_PER_ROUND = 10;

function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://myapproved.com"
  );
}

function formatBudget(value: unknown, type: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  const num = typeof value === "number" ? value : parseFloat(String(value));
  if (Number.isNaN(num)) return String(value);
  const formatted = `£${num.toLocaleString("en-GB", { maximumFractionDigits: 2 })}`;
  const suffix =
    type && String(type).toLowerCase().includes("hour")
      ? "/hr"
      : type && String(type).toLowerCase().includes("day")
        ? "/day"
        : "";
  return `${formatted}${suffix}`;
}

function formatLeadCost(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

function normalizePc(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "");
}

function locationMatchesJob(jobPcRaw: string, tpPcRaw: string, tpCityRaw: string): boolean {
  const jobPc = String(jobPcRaw || "").trim();
  const tpPc = String(tpPcRaw || "").trim();
  const tpCity = String(tpCityRaw || "").trim();

  if (jobPc && tpPc && normalizePc(jobPc) === normalizePc(tpPc)) return true;
  if (jobPc && tpPc) {
    try {
      if (isPostcodeWithinRange(jobPc, tpPc, 50)) return true;
    } catch { /* non-UK postcodes */ }
  }
  const jl = jobPc.toLowerCase();
  const tl = `${tpPc} ${tpCity}`.trim().toLowerCase();
  return jl.includes(tl) || tl.includes(jl);
}

export async function escalateJobs(supabase: SupabaseClient): Promise<{
  processed: number;
  escalated: number;
  details: Array<{ jobId: string; round: number; recipientsCount: number }>;
}> {
  const result = { processed: 0, escalated: 0, details: [] as any[] };

  // Find jobs that are "approved"/open with no paid lead yet
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, trade, postcode, job_description, budget, budget_type, client_id, created_at")
    .eq("status", "approved")
    .eq("application_status", "open");

  if (!jobs?.length) return result;

  for (const job of jobs) {
    result.processed++;

    // Check if anyone has paid for this job already
    const { data: paidPurchase } = await supabase
      .from("lead_purchases")
      .select("id")
      .eq("job_id", job.id)
      .eq("status", "paid")
      .maybeSingle();

    if (paidPurchase) continue; // Already won

    // Count existing offers for this job
    const { count: offeredCount } = await supabase
      .from("lead_purchases")
      .select("id", { count: "exact", head: true })
      .eq("job_id", job.id);

    const currentRound = Math.floor((offeredCount || 0) / TRADESPEOPLE_PER_ROUND) + 1;

    if (currentRound > MAX_ROUNDS) continue; // Exhausted all rounds

    // Check if enough time has passed since the LAST offer of the PREVIOUS round
    // For round 1, check against job.created_at
    let lastOfferTime: Date | null = null;

    if (currentRound === 1) {
      // Round 1 starts from job creation
      lastOfferTime = new Date(job.created_at);
    } else {
      // Find the last offer from the previous round
      const { data: lastOffer } = await supabase
        .from("lead_purchases")
        .select("offered_at")
        .eq("job_id", job.id)
        .order("offered_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      lastOfferTime = lastOffer?.offered_at ? new Date(lastOffer.offered_at) : null;
    }

    if (!lastOfferTime) continue;

    const hoursSinceLastOffer =
      (Date.now() - lastOfferTime.getTime()) / (1000 * 60 * 60);

    if (hoursSinceLastOffer < ROUND_DURATION_HOURS) continue;

    // Time to escalate: fetch matching tradespeople
    const jobTrade = String(job.trade || "");
    const jobPc = String(job.postcode || "").trim();

    let tpQuery = supabase
      .from("tradespeople")
      .select("id, first_name, last_name, email, phone, trade, postcode, city, is_verified, subscription_plan, subscription_status")
      .eq("is_verified", true)
      .not("email", "is", null);

    if (isRegulatedTrade(jobTrade)) {
      tpQuery = tpQuery.eq("certification_verified", true).gt("certification_expires_at", "now()");
    }

    const { data: tradespeople } = await tpQuery;

    if (!tradespeople?.length) continue;

    // Get IDs already offered for this job
    const { data: existingOffers } = await supabase
      .from("lead_purchases")
      .select("tradesperson_id")
      .eq("job_id", job.id);

    const alreadyOffered = new Set(
      (existingOffers || []).map((o: any) => o.tradesperson_id),
    );

    // Find new matches (not already offered)
    const newMatches = tradespeople.filter((tp) => {
      if (alreadyOffered.has(tp.id)) return false;
      const tradeOk = tradesMatch(jobTrade, String(tp.trade || ""));
      const areaOk = locationMatchesJob(jobPc, String(tp.postcode || ""), String(tp.city || ""));
      return tradeOk || areaOk;
    });

    if (newMatches.length === 0) {
      if (isRegulatedTrade(jobTrade)) {
        const regulator = getRegulator(jobTrade) || "UK regulatory body";
        try {
          await sendNotification({
            type: "regulated_trade_no_certified_match",
            channels: ["email"],
            idempotencyKey: `regulated_trade_no_certified_match:${job.id}:round-robin`,
            data: {
              jobId: job.id,
              trade: jobTrade,
              regulator,
              postcode: job.postcode,
              job_description: job.job_description,
            },
          });
        } catch (e) {
          console.error("Round-robin: admin alert failed", e);
        }
      }
      continue;
    }

    // Take up to TRADESPEOPLE_PER_ROUND
    const batch = newMatches.slice(0, TRADESPEOPLE_PER_ROUND);

    // Load client phone
    let customerPhone = "";
    if (job.client_id) {
      try {
        const { data: client } = await supabase
          .from("clients")
          .select("phone")
          .eq("id", job.client_id)
          .maybeSingle();
        customerPhone = String(client?.phone || "").trim();
      } catch { /* ignore */ }
    }

    const baseUrl = getAppBaseUrl();
    const budgetLabel = formatBudget(job.budget, job.budget_type);
    const leadCostLabel = formatLeadCost(DEFAULT_LEAD_PRICE_PENCE);
    const maskedPhone = maskUkPhoneNumber(customerPhone);

    for (const tp of batch) {
      // Skip unlimited subscribers (they get the basic job match alert instead)
      const plan = String((tp as any).subscription_plan || PAY_PER_LEAD_PLAN);
      const subStatus = String((tp as any).subscription_status || "");
      const isUnlimitedActive =
        plan === "unlimited_monthly" &&
        (subStatus === "active" || subStatus === "trialing");

      if (isUnlimitedActive) continue;

      let purchaseId: string | null = null;
      try {
        const insertRes = await supabase
          .from("lead_purchases")
          .insert({
            job_id: job.id,
            tradesperson_id: tp.id,
            lead_price_pence: DEFAULT_LEAD_PRICE_PENCE,
            status: "offered",
          })
          .select("id")
          .maybeSingle();

        if (insertRes.error) {
          const lookup = await supabase
            .from("lead_purchases")
            .select("id")
            .eq("job_id", job.id)
            .eq("tradesperson_id", tp.id)
            .maybeSingle();
          purchaseId = (lookup.data?.id as string) || null;
        } else {
          purchaseId = (insertRes.data?.id as string) || null;
        }
      } catch (e) {
        console.warn("Round-robin: lead_purchases insert failed", e);
      }

      const unlockUrl = purchaseId ? `${baseUrl}/leads/${purchaseId}` : "";

      try {
        await sendNotification({
          type: "pay_per_lead_alert",
          recipientId: String(tp.id),
          recipientEmail: tp.email,
          recipientPhone: tp.phone,
          channels: ["email", "sms"],
          idempotencyKey: `pay_per_lead_alert:${job.id}:${tp.id}`,
          data: {
            jobId: job.id,
            purchaseId,
            trade: job.trade,
            postcode: job.postcode,
            area: tp.city || job.postcode,
            job_description: job.job_description,
            budget: job.budget,
            budget_type: job.budget_type,
            budgetLabel,
            leadCostLabel,
            maskedPhone,
            unlockUrl,
            link: unlockUrl,
          },
        });
      } catch (e) {
        console.error("Round-robin: notification failed", tp.email, e);
      }
    }

    result.escalated++;
    result.details.push({
      jobId: job.id,
      round: currentRound,
      recipientsCount: batch.length,
    });
  }

  return result;
}
