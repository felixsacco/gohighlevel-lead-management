import type { SupabaseClient } from "@supabase/supabase-js";
import { isPostcodeWithinRange } from "@/lib/utils/postcode-matcher";
import { tradesMatch } from "@/lib/utils/trade-matcher";
import { maskUkPhoneNumber, normalizeUkPhone } from "@/lib/utils/phone-mask";
import { isRegulatedTrade, getRegulator } from "@/lib/matching/regulated-trades";
import { sendNotification } from "./index";
import type { NotificationEventType } from "./types";

type JobMatchFields = {
  id: string;
  trade: string | null;
  postcode: string | null;
  job_description?: string | null;
  budget?: number | string | null;
  budget_type?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  client_id?: string | null;
  urgency?: string | null;
};

const DEFAULT_LEAD_PRICE_PENCE = 499;
const PAY_PER_LEAD_PLAN = "pay_per_lead";

function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://myapproved.com"
  );
}

function formatBudget(value: unknown, type: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  const num =
    typeof value === "number" ? value : parseFloat(String(value));
  if (Number.isNaN(num)) return String(value);
  const formatted = `\u00a3${num.toLocaleString("en-GB", {
    maximumFractionDigits: 2,
  })}`;
  const suffix =
    type && String(type).toLowerCase().includes("hour")
      ? "/hr"
      : type && String(type).toLowerCase().includes("day")
        ? "/day"
        : "";
  return `${formatted}${suffix}`;
}

function formatBudgetRange(min: unknown, max: unknown): string {
  const minNum = typeof min === "number" ? min : parseFloat(String(min));
  const maxNum = typeof max === "number" ? max : parseFloat(String(max));
  if (Number.isNaN(minNum) || Number.isNaN(maxNum)) return "";
  return `\u00a3${minNum.toLocaleString("en-GB")} - \u00a3${maxNum.toLocaleString("en-GB")}`;
}

function formatLeadCost(pence: number): string {
  return `\u00a3${(pence / 100).toFixed(2)}`;
}

export type JobMatchNotifyPhase = "posted" | "live";

function normalizePc(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "");
}

function locationMatchesJob(jobPcRaw: string, tpPcRaw: string, tpCityRaw: string): boolean {
  const jobPc = String(jobPcRaw || "").trim();
  const tpPc = String(tpPcRaw || "").trim();
  const tpCity = String(tpCityRaw || "").trim();
  const tpLoc = `${tpPc} ${tpCity}`.trim();
  const jobLoc = jobPc;

  if (jobPc && tpPc && normalizePc(jobPc) === normalizePc(tpPc)) {
    return true;
  }
  if (jobLoc && tpPc) {
    try {
      if (isPostcodeWithinRange(jobLoc, tpPc, 50)) return true;
    } catch {
      // non-UK postcodes etc.
    }
  }
  if (!jobLoc || !tpLoc) return false;
  const jl = jobLoc.toLowerCase();
  const tl = tpLoc.toLowerCase();
  return jl.includes(tl) || tl.includes(jl);
}

function phaseConfig(phase: JobMatchNotifyPhase): {
  type: NotificationEventType;
  idempotencyPrefix: string;
} {
  if (phase === "posted") {
    return {
      type: "job_posted_tradesperson_match",
      idempotencyPrefix: "job_posted_tradesperson_match",
    };
  }
  return {
    type: "job_match_tradesperson",
    idempotencyPrefix: "job_match_tradesperson",
  };
}

/**
 * Email every verified tradesperson who matches the job on **trade or area** (union, deduped).
 * Must be awaited (not deferred) so serverless runtimes finish sending before the function exits.
 *
 * @param phase `posted` — job just submitted (pending admin). `live` — job approved and open for applications.
 */
export async function notifyMatchingTradespeopleForJob(
  supabase: SupabaseClient,
  job: JobMatchFields,
  phase: JobMatchNotifyPhase = "live",
): Promise<void> {
  const { type, idempotencyPrefix } = phaseConfig(phase);

  // We pull subscription_plan / subscription_status so we can route each
  // tradesperson to the right alert (pay-per-lead SMS vs unlimited email).
  // The fallback selector handles environments where the phase6 migration
  // has not been applied yet - we just treat everyone as pay-per-lead so
  // nobody silently misses a lead.
  let tradespeople: any[] | null = null;
  let tpError: any = null;
  {
    const jobTrade = String(job.trade || "");
    const regulated = isRegulatedTrade(jobTrade);

    let enrichedSelect = supabase
      .from("tradespeople")
      .select(
        "id, first_name, last_name, email, phone, trade, postcode, city, is_verified, subscription_plan, subscription_status",
      )
      .eq("is_verified", true)
      .not("email", "is", null);

    if (regulated) {
      enrichedSelect = enrichedSelect.eq("certification_verified", true).gt("certification_expires_at", "now()");
    }

    const enrichedSelectResult = await enrichedSelect;
    if (enrichedSelectResult.error) {
      // Retry without the new columns (migration not applied yet).
      console.warn(
        "notifyMatchingTradespeopleForJob: subscription columns unavailable, falling back",
        enrichedSelectResult.error.message,
      );
      let fallback = supabase
        .from("tradespeople")
        .select(
          "id, first_name, last_name, email, phone, trade, postcode, city, is_verified",
        )
        .eq("is_verified", true)
        .not("email", "is", null);

      if (regulated) {
        fallback = fallback.eq("certification_verified", true).gt("certification_expires_at", "now()");
      }

      const fallbackResult = await fallback;
      tradespeople = fallbackResult.data || [];
      tpError = fallbackResult.error;
    } else {
      tradespeople = enrichedSelectResult.data;
    }
  }

  if (tpError) {
    console.error("notifyMatchingTradespeopleForJob: fetch error", tpError);
    return;
  }

  const jobTrade = String(job.trade || "");
  const jobPc = String(job.postcode || "").trim();

  const list = tradespeople || [];
  console.log("notifyMatchingTradespeopleForJob: candidates", {
    jobId: job.id,
    phase,
    count: list.length,
  });
  const byId = new Map<string, (typeof list)[number]>();

  for (const tp of list) {
    const tradeOk = tradesMatch(jobTrade, String(tp.trade || ""));
    const areaOk = locationMatchesJob(
      jobPc,
      String(tp.postcode || ""),
      String(tp.city || ""),
    );
    if (tradeOk || areaOk) {
      byId.set(String(tp.id), tp);
    }
  }

  const recipients = Array.from(byId.values());

  if (recipients.length === 0) {
    console.log("notifyMatchingTradespeopleForJob: no trade/area matches", {
      jobId: job.id,
      phase,
      trade: jobTrade,
      postcode: jobPc,
      candidateCount: list.length,
    });

    if (isRegulatedTrade(jobTrade)) {
      const regulator = getRegulator(jobTrade) || "UK regulatory body";
      try {
        await sendNotification({
          type: "regulated_trade_no_certified_match",
          channels: ["email"],
          idempotencyKey: `regulated_trade_no_certified_match:${job.id}:${phase}`,
          data: {
            jobId: job.id,
            trade: jobTrade,
            regulator,
            postcode: job.postcode,
            job_description: job.job_description,
          },
        });
      } catch (e) {
        console.error("notifyMatchingTradespeopleForJob: admin alert failed", e);
      }
    }
    return;
  }

  console.log(
    `notifyMatchingTradespeopleForJob: dispatching to ${recipients.length} recipient(s)`,
    { jobId: job.id, phase },
  );

  // Look up the customer's phone once - pay-per-lead tradespeople need the
  // masked version in their alert. If the column / record is missing we
  // simply omit the customer phone (the alert still has all the other lead
  // details + a payment link).
  let customerPhone = "";
  if (job.client_id) {
    try {
      const { data: client } = await supabase
        .from("clients")
        .select("phone")
        .eq("id", job.client_id)
        .maybeSingle();
      customerPhone = String(client?.phone || "").trim();
    } catch (e) {
      console.warn(
        "notifyMatchingTradespeopleForJob: could not load client phone for job",
        job.id,
        e,
      );
    }
  }

  const baseUrl = getAppBaseUrl();
  const rangeLabel = formatBudgetRange(job.budget_min, job.budget_max);
  const budgetLabel = rangeLabel || formatBudget(job.budget, job.budget_type);
  const leadCostLabel = formatLeadCost(DEFAULT_LEAD_PRICE_PENCE);
  const maskedPhone = maskUkPhoneNumber(customerPhone);

  for (const tp of recipients) {
    const plan = String((tp as any).subscription_plan || PAY_PER_LEAD_PLAN);
    const subStatus = String((tp as any).subscription_status || "");
    const isUnlimitedActive =
      plan === "unlimited_monthly" &&
      (subStatus === "active" || subStatus === "trialing");

    // Unlimited subscribers continue to get the existing email-only
    // "new job match" notification with no extra lead-purchase step.
    if (isUnlimitedActive) {
      try {
        await sendNotification({
          type,
          recipientId: String(tp.id),
          recipientEmail: tp.email,
          recipientPhone: normalizeUkPhone(tp.phone) || tp.phone,
          channels: ["email"],
          idempotencyKey: `${idempotencyPrefix}:${job.id}:${tp.id}`,
          data: {
            jobId: job.id,
            trade: job.trade,
            postcode: job.postcode,
            job_description: job.job_description,
          },
        });
      } catch (e) {
        console.error(
          "notifyMatchingTradespeopleForJob: unlimited send failed",
          tp.email,
          e,
        );
      }
      continue;
    }

    // Pay-per-lead path: create (or fetch) an offer row, then SMS+email
    // the tradesperson with a link to unlock the customer's number for
    // £4.99 via Stripe.
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
        // Unique constraint -> the offer already exists, look it up.
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
      console.warn(
        "notifyMatchingTradespeopleForJob: lead_purchases insert/lookup failed (run phase7 migration?). Continuing without unlock link.",
        e,
      );
    }

    const unlockUrl = purchaseId ? `${baseUrl}/leads/${purchaseId}` : "";

    try {
      await sendNotification({
        type: "pay_per_lead_alert",
        recipientId: String(tp.id),
        recipientEmail: tp.email,
        recipientPhone: normalizeUkPhone(tp.phone) || tp.phone,
        // Explicitly request both channels so the tradesperson always
        // sees the masked-number SMS even if they normally only opt in
        // to email.
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
          urgency: job.urgency || "flexible",
          leadCostLabel,
          maskedPhone,
          unlockUrl,
          link: unlockUrl,
        },
      });
    } catch (e) {
      console.error(
        "notifyMatchingTradespeopleForJob: pay-per-lead send failed",
        tp.email,
        e,
      );
    }
  }
}
