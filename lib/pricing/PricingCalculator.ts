import pricingMatrix from "./PricingMatrix.json";

type Urgency = "emergency" | "urgent" | "normal" | "flexible";

const URGENCY_FALLBACK: Urgency = "normal";

function normalizeTrade(trade?: string): string {
  const t = String(trade || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  if (!t) return "other";
  if (t.includes("electric")) return "electrician";
  if (t.includes("plumb")) return "plumber";
  if (t.includes("bathroom")) return "bathroom fitter";
  if (t.includes("kitchen")) return "kitchen fitter";
  if (t.includes("gas")) return "gas-engineer";
  if (t.includes("window cleaner")) return "window cleaner";
  if (t.includes("window")) return "window-fitter";
  if (t.includes("solar")) return "solar-panel-installer";
  return t;
}

function normalizeUrgency(urgency?: string): Urgency {
  const u = String(urgency || "").trim().toLowerCase();
  if (u === "emergency" || u === "urgent" || u === "normal" || u === "flexible") {
    return u;
  }
  return URGENCY_FALLBACK;
}

function resolveRegion(postcode?: string): { name: string; multiplier: number } {
  const raw = String(postcode || "").trim().toUpperCase();
  for (const region of pricingMatrix.regionMultipliers) {
    if (!region.prefixes.length) continue;
    if (region.prefixes.some((p) => raw.startsWith(p))) {
      return { name: region.name, multiplier: region.multiplier };
    }
  }
  const fallback = pricingMatrix.regionMultipliers.find((r) => r.name === "National Baseline");
  return { name: fallback?.name || "National Baseline", multiplier: fallback?.multiplier || 1 };
}

function scoreComplexity(description: string): {
  level: "Low" | "Medium" | "High";
  multiplier: number;
  score: number;
} {
  const text = String(description || "").toLowerCase();
  let score = 0;

  for (const keyword of pricingMatrix.complexityRules.highKeywords) {
    if (text.includes(keyword)) score += 2;
  }
  for (const keyword of pricingMatrix.complexityRules.mediumKeywords) {
    if (text.includes(keyword)) score += 1;
  }

  const length = text.trim().length;
  if (length > 350) score += 2;
  else if (length > 180) score += 1;

  const numbers = (text.match(/\d+/g) || []).length;
  if (numbers >= 3) score += 1;

  const threshold = pricingMatrix.complexityRules.thresholds.find((t) => score <= t.maxScore) ||
    pricingMatrix.complexityRules.thresholds[pricingMatrix.complexityRules.thresholds.length - 1];

  return {
    level: threshold.name as "Low" | "Medium" | "High",
    multiplier: threshold.multiplier,
    score,
  };
}

function roundCurrency(n: number): number {
  return Math.round(n / 5) * 5;
}

export interface LivePriceInput {
  trade?: string;
  urgency?: string;
  postcode?: string;
  description: string;
  accessDifficulty?: "easy" | "moderate" | "hard";
}

export interface LivePriceResult {
  exactPrice: number;
  min: number;
  max: number;
  estimateLabel: string;
  jobReferenceStyle: string;
  trade: string;
  urgency: Urgency;
  region: { name: string; multiplier: number };
  complexity: { level: "Low" | "Medium" | "High"; multiplier: number; score: number };
  basePrice: number;
}

export function calculateLivePrice(input: LivePriceInput): LivePriceResult {
  const trade = normalizeTrade(input.trade);
  const urgency = normalizeUrgency(input.urgency);

  const tradeTable =
    pricingMatrix.basePrices[trade as keyof typeof pricingMatrix.basePrices] ||
    pricingMatrix.basePrices.other;

  const basePrice = Number(tradeTable[urgency]);
  const region = resolveRegion(input.postcode);
  const complexity = scoreComplexity(input.description);

  const accessMultiplier = input.accessDifficulty === "hard" ? 1.15 : input.accessDifficulty === "moderate" ? 1.07 : 1.0;

  const exactPrice = roundCurrency(basePrice * region.multiplier * complexity.multiplier * accessMultiplier);
  const min = roundCurrency(exactPrice * 0.80);
  const max = roundCurrency(exactPrice * 1.20);

  return {
    exactPrice,
    min,
    max,
    estimateLabel: `£${exactPrice}`,
    jobReferenceStyle: "MA-UK-XXXX-XXXX",
    trade,
    urgency,
    region,
    complexity,
    basePrice,
  };
}

export const LIVE_PRICING_DISCLAIMER =
  "Live estimate based on selected trade, urgency, postcode region and job complexity. Final price is confirmed by the tradesperson quote and job scope.";
