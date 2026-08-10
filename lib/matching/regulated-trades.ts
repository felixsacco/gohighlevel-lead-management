/**
 * IMPORTANT — certification_verified is currently set MANUALLY by an admin
 * (via the Supabase dashboard or an internal admin tool). It is NOT an
 * automated check against the Gas Safe, FENSA, NICEIC, NAPIT, MCS or OFTEC
 * registers. There is no API integration with any of these bodies today.
 *
 * The public-facing site (homepage, location pages, marketing materials)
 * claims that MyApproved performs independent register verification on
 * regulated tradespeople. That claim is not yet backed by automated
 * verification. This gap must be closed before launch — the assertion is
 * misleading and unsubstantiated without programmatic register lookups.
 *
 * In the interim, the matching filter requires both:
 *   certification_verified = true AND certification_expires_at > now()
 * to gate regulated-trade job matching behind whatever manual checks
 * the admin team has performed. An expired certification disqualifies
 * a tradesperson automatically (no manual review needed for expiry).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export interface RegulatedTradeDef {
  /** The canonical trade slug used in the TRADES array (seo-data.ts). */
  tradeSlug: string;
  /** UK regulatory body. */
  regulator: string;
  /** Human-readable name for notifications / admin alerts. */
  label: string;
}

/**
 * Every regulated trade on the MyApproved platform.
 *
 * These trades require certification from a UK statutory or
 * competent-person scheme before a tradesperson can work on them.
 * Homeowners are legally required to use registered professionals
 * for gas, electrical, and certain building work.
 */
export const REGULATED_TRADES: RegulatedTradeDef[] = [
  {
    tradeSlug: "gas-engineer",
    regulator: "Gas Safe Register",
    label: "Gas Engineer",
  },
  {
    tradeSlug: "electrician",
    regulator: "NICEIC / NAPIT",
    label: "Electrician",
  },
  {
    tradeSlug: "window-fitter",
    regulator: "FENSA",
    label: "Window Fitter",
  },
  {
    tradeSlug: "heating-engineer",
    regulator: "OFTEC",
    label: "Heating Engineer",
  },
  {
    tradeSlug: "solar-panel-installer",
    regulator: "MCS",
    label: "Solar Panel Installer",
  },
];

const REGULATED_SLUGS = new Set(
  REGULATED_TRADES.map((r) => r.tradeSlug),
);

/** Check whether a trade slug refers to a regulated trade. */
export function isRegulatedTrade(tradeSlug: string): boolean {
  return REGULATED_SLUGS.has(tradeSlug.toLowerCase().trim());
}

/**
 * Return the regulatory-body name for a trade, or null if unregulated.
 */
export function getRegulator(tradeSlug: string): string | null {
  const entry = REGULATED_TRADES.find(
    (r) => r.tradeSlug === tradeSlug.toLowerCase().trim(),
  );
  return entry?.regulator ?? null;
}

/**
 * SQL fragment that must be AND-ed into a tradespeople query when the
 * job trade is regulated.  Use it in the `.filter()` chain:
 *
 *   if (isRegulatedTrade(jobTrade)) {
 *     query = query
 *       .eq("certification_verified", true)
 *       .gt("certification_expires_at", "now()");
 *   }
 *
 * Callers that build raw SQL strings can interpolate or adapt the
 * WHERE clause equivalents instead.
 */
export const CERTIFICATION_GATE_SQL = {
  eq: { certification_verified: true },
  gt: { certification_expires_at: "now()" },
} as const;
