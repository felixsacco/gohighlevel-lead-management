/**
 * Single source of truth for indicative (non-binding) job cost ranges shown in the product.
 * This is not a live market quote — actual quotes come from tradespeople after you post the job.
 */
const TRADE_URGENCY: Record<string, Record<string, [number, number]>> = {
  plumber: {
    emergency: [200, 350],
    urgent: [150, 250],
    normal: [100, 200],
    flexible: [80, 150],
  },
  electrician: {
    emergency: [300, 500],
    urgent: [200, 350],
    normal: [150, 250],
    flexible: [100, 200],
  },
  builder: {
    emergency: [500, 1000],
    urgent: [400, 800],
    normal: [300, 600],
    flexible: [200, 400],
  },
  carpenter: {
    emergency: [250, 400],
    urgent: [200, 300],
    normal: [150, 250],
    flexible: [100, 200],
  },
  painter: {
    emergency: [250, 400],
    urgent: [200, 300],
    normal: [150, 250],
    flexible: [100, 200],
  },
  handyman: {
    emergency: [150, 300],
    urgent: [120, 250],
    normal: [80, 200],
    flexible: [60, 150],
  },
  cleaner: {
    emergency: [80, 150],
    urgent: [60, 120],
    normal: [50, 100],
    flexible: [40, 80],
  },
};

const DEFAULT_URGENCY: Record<string, [number, number]> = {
  emergency: [200, 400],
  urgent: [150, 300],
  normal: [100, 250],
  flexible: [80, 200],
};

function postcodeMultiplier(postcode: string | undefined): number {
  if (!postcode?.trim()) return 1;
  const p = postcode.toLowerCase();
  if (/^(ec|wc|w1|sw1|nw1|n1|e1)/.test(p) || p.includes("london")) return 1.25;
  if (/^(m|b|ls|s1|eh|g1)/.test(p)) return 1.08;
  return 1;
}

function descriptionComplexityBonus(description: string): number {
  const len = description.trim().length;
  if (len > 400) return 1.12;
  if (len > 200) return 1.06;
  return 1;
}

export function buildIndicativeEstimate(input: {
  description: string;
  trade?: string;
  postcode?: string;
  urgency?: string;
}): { min: number; max: number; label: string } {
  const urgency = (input.urgency || "normal").toLowerCase();
  const tradeKey = (input.trade || "").toLowerCase().replace(/\s+/g, "");
  const table = TRADE_URGENCY[tradeKey] || null;
  const pair =
    (table && table[urgency]) ||
    (table && table.normal) ||
    DEFAULT_URGENCY[urgency] ||
    DEFAULT_URGENCY.normal;

  const mult = postcodeMultiplier(input.postcode) * descriptionComplexityBonus(input.description);
  const min = Math.round(pair[0] * mult);
  const max = Math.round(pair[1] * mult);
  return {
    min,
    max,
    label: `£${min}–£${max}`,
  };
}

export const INDICATIVE_PRICING_DISCLAIMER =
  "This range is indicative only (based on typical UK jobs). It is not a quote or a commitment. After you post your job, verified tradespeople submit their own prices.";
