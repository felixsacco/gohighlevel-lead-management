/**
 * seoMetadataRouter - programmatic SEO metadata compiler.
 *
 * Generates hyper-local, conversion-intent Title Tags and Meta Descriptions
 * following the formula:
 *   [Verified/Approved] + [Specific Sub-Trade] + [Neighborhood/City] + [Postal District] | MyApproved
 *
 * Example output: "Verified Emergency Boiler Repair Engineer in Hanley ST1 | MyApproved"
 *
 * Usage in a Next.js App Router page:
 *   export async function generateMetadata({ params }) {
 *     const compiled = compileSEOMetadata({ tradeSlug: params.trade, city: params.location, ... });
 *     return toNextMetadata(compiled);
 *   }
 */

import type { Metadata } from "next";

// ── Sub-trade intent labels ──────────────────────────────────────────────────
// Five conversion-intent labels per trade, ordered from highest to lowest
// commercial intent. Index 0 is the default (most transactional).
const SUB_TRADE_LABELS: Record<string, string[]> = {
  plumber: [
    "Emergency Plumber",
    "Boiler Repair Plumber",
    "Leak Detection Plumber",
    "Bathroom Fitting Plumber",
    "Central Heating Plumber",
  ],
  electrician: [
    "Emergency Electrician",
    "Fuse Board Electrician",
    "Rewiring Electrician",
    "EV Charger Electrician",
    "Solar PV Electrician",
  ],
  "gas-engineer": [
    "Emergency Gas Safe Engineer",
    "Boiler Repair Gas Engineer",
    "Boiler Service Engineer",
    "Landlord Certificate Engineer",
    "Gas Leak Engineer",
  ],
  builder: [
    "House Extension Builder",
    "Loft Conversion Builder",
    "Renovation Builder",
    "Structural Builder",
    "Garage Conversion Builder",
  ],
  roofer: [
    "Emergency Roofer",
    "Flat Roof Specialist",
    "Re-Roofing Contractor",
    "Guttering Roofer",
    "Tile & Slate Roofer",
  ],
  carpenter: [
    "Bespoke Joiner",
    "Kitchen Fitting Carpenter",
    "Staircase Joiner",
    "Built-in Wardrobe Carpenter",
    "Decking Carpenter",
  ],
  cleaner: [
    "Deep Clean Specialist",
    "End of Tenancy Cleaner",
    "Regular Domestic Cleaner",
    "After Builders Cleaner",
    "Commercial Cleaner",
  ],
  plasterer: [
    "Skim Coat Plasterer",
    "External Render Plasterer",
    "Dry-Lining Plasterer",
    "Artex Removal Plasterer",
    "Patch Repair Plasterer",
  ],
  "painter-decorator": [
    "Interior Decorator",
    "Exterior Painter",
    "Wallpaper Hanging Decorator",
    "Commercial Painter",
    "Spray Paint Specialist",
  ],
  painter: [
    "Interior Decorator",
    "Exterior Painter",
    "Wallpaper Hanging Decorator",
    "Commercial Painter",
    "Spray Paint Specialist",
  ],
  handyman: [
    "Local Handyman",
    "Flat Pack Assembly Handyman",
    "General Repairs Handyman",
    "TV Mounting Handyman",
    "Odd Jobs Handyman",
  ],
  locksmith: [
    "Emergency Locksmith",
    "24-Hour Locksmith",
    "UPVC Lock Specialist",
    "Smart Lock Installer",
    "Security Locksmith",
  ],
  landscaper: [
    "Garden Design Landscaper",
    "Patio Landscaper",
    "Decking & Fencing Landscaper",
    "Driveway Landscaper",
    "Water Feature Landscaper",
  ],
  gardener: [
    "Garden Maintenance Gardener",
    "Lawn Care Gardener",
    "Hedge Trimming Gardener",
    "Tree Surgery Gardener",
    "Seasonal Garden Clearance",
  ],
  "window-fitter": [
    "Double Glazing Fitter",
    "UPVC Window Fitter",
    "Bi-Fold Door Fitter",
    "Composite Door Fitter",
    "Secondary Glazing Fitter",
  ],
  "heating-engineer": [
    "Central Heating Engineer",
    "Underfloor Heating Engineer",
    "Heat Pump Engineer",
    "Radiator Installation Engineer",
    "Smart Thermostat Engineer",
  ],
  "air-conditioning": [
    "Split System AC Installer",
    "Commercial AC Engineer",
    "Heat Pump Installer",
    "AC Service & Repair Engineer",
    "Domestic AC Installer",
  ],
  "kitchen-fitter": [
    "Complete Kitchen Fitter",
    "Kitchen Worktop Specialist",
    "Kitchen Cabinet Fitter",
    "Bespoke Kitchen Fitter",
    "Kitchen Refurb Specialist",
  ],
  "bathroom-fitter": [
    "Complete Bathroom Fitter",
    "En-Suite Fitter",
    "Wet Room Specialist",
    "Shower Installation Fitter",
    "Bathroom Refurb Specialist",
  ],
  tiler: [
    "Bathroom Tiler",
    "Floor Tiling Specialist",
    "Kitchen Tiler",
    "Natural Stone Tiler",
    "Large Format Tile Specialist",
  ],
  flooring: [
    "Hardwood Floor Fitter",
    "Laminate Floor Fitter",
    "Carpet Fitter",
    "Vinyl Floor Specialist",
    "Floor Sanding Specialist",
  ],
  "damp-specialist": [
    "Rising Damp Specialist",
    "Penetrating Damp Specialist",
    "Condensation Control Specialist",
    "Dry Rot Specialist",
    "Cellar Tanking Specialist",
  ],
  "loft-conversion": [
    "Dormer Loft Specialist",
    "Velux Loft Specialist",
    "Mansard Loft Builder",
    "Hip-to-Gable Loft Specialist",
    "Loft Storage Specialist",
  ],
  "driveway-specialist": [
    "Block Paving Specialist",
    "Tarmac Driveway Specialist",
    "Resin Bound Driveway Specialist",
    "Pattern Imprinted Concrete Specialist",
    "Gravel Driveway Specialist",
  ],
  "pest-control": [
    "Rat & Mouse Control Specialist",
    "Wasp Nest Removal Specialist",
    "Bed Bug Treatment Specialist",
    "Cockroach Control Specialist",
    "Flea Treatment Specialist",
  ],
  "security-installer": [
    "CCTV Installation Specialist",
    "Burglar Alarm Installer",
    "Access Control Specialist",
    "Smart Security Installer",
    "Intercom System Installer",
  ],
  "chimney-sweep": [
    "Traditional Chimney Sweep",
    "CCTV Chimney Survey Specialist",
    "Log Burner Chimney Sweep",
    "Commercial Chimney Sweep",
    "Bird Nest Removal Sweep",
  ],
  "solar-panel-installer": [
    "MCS Solar PV Installer",
    "Battery Storage Specialist",
    "Solar Thermal Installer",
    "EV Charger Solar Installer",
    "Commercial Solar Installer",
  ],
  "loft-insulation": [
    "Loft Insulation Installer",
    "Cavity Wall Insulation Specialist",
    "Solid Wall Insulation Specialist",
    "ECO Grant Insulation Installer",
    "Draught Proofing Specialist",
  ],
  scaffolder: [
    "Domestic Scaffolder",
    "Commercial Scaffolder",
    "Emergency Scaffolding Specialist",
    "Temporary Roof Scaffolder",
    "Access Tower Scaffolder",
  ],
  fencer: [
    "Close Board Fencer",
    "Panel Fencing Specialist",
    "Security Fencer",
    "Garden Gate Installer",
    "Acoustic Fencing Specialist",
  ],
  "waste-removal": [
    "House Clearance Specialist",
    "Garden Waste Removal",
    "Builders Waste Remover",
    "Loft Clearance Specialist",
    "Commercial Waste Removal",
  ],
  "carpet-cleaner": [
    "Steam Carpet Cleaner",
    "Dry Carpet Cleaning Specialist",
    "Stain Removal Specialist",
    "Rug Cleaning Specialist",
    "Commercial Carpet Cleaner",
  ],
};

// ── Pricing data ─────────────────────────────────────────────────────────────
export const TRADE_PRICING: Record<
  string,
  { low: string; high: string; unit: string; typical: string }
> = {
  plumber:               { low: "£40",     high: "£70",     unit: "per hour",        typical: "£150–£400 for most jobs"              },
  electrician:           { low: "£45",     high: "£75",     unit: "per hour",        typical: "£200–£800 for most jobs"              },
  "gas-engineer":        { low: "£60",     high: "£100",    unit: "per hour",        typical: "£80–£120 for a boiler service"        },
  builder:               { low: "£35",     high: "£60",     unit: "per hour",        typical: "£20,000–£80,000 for extensions"       },
  roofer:                { low: "£35",     high: "£55",     unit: "per hour",        typical: "£150–£1,500 for repairs"              },
  carpenter:             { low: "£35",     high: "£55",     unit: "per hour",        typical: "£300–£2,000 for most jobs"            },
  cleaner:               { low: "£15",     high: "£25",     unit: "per hour",        typical: "£100–£300 for a deep clean"           },
  plasterer:             { low: "£30",     high: "£50",     unit: "per hour",        typical: "£200–£600 per room"                   },
  "painter-decorator":   { low: "£25",     high: "£45",     unit: "per hour",        typical: "£400–£1,200 per room"                 },
  painter:               { low: "£25",     high: "£45",     unit: "per hour",        typical: "£400–£1,200 per room"                 },
  handyman:              { low: "£25",     high: "£40",     unit: "per hour",        typical: "£50–£200 for most odd jobs"           },
  locksmith:             { low: "£60",     high: "£120",    unit: "per hour",        typical: "£75–£200 for most jobs"               },
  landscaper:            { low: "£30",     high: "£50",     unit: "per hour",        typical: "£1,500–£15,000 for garden design"     },
  gardener:              { low: "£25",     high: "£40",     unit: "per hour",        typical: "£50–£200 for regular maintenance"     },
  "window-fitter":       { low: "£35",     high: "£55",     unit: "per hour",        typical: "£400–£800 per window installed"       },
  "heating-engineer":    { low: "£50",     high: "£80",     unit: "per hour",        typical: "£150–£800 for most repairs"           },
  "air-conditioning":    { low: "£60",     high: "£100",    unit: "per hour",        typical: "£1,500–£5,000 for installation"       },
  "kitchen-fitter":      { low: "£35",     high: "£55",     unit: "per hour",        typical: "£1,000–£5,000 for fitting only"       },
  "bathroom-fitter":     { low: "£35",     high: "£55",     unit: "per hour",        typical: "£2,000–£8,000 for a full bathroom"    },
  tiler:                 { low: "£30",     high: "£50",     unit: "per hour",        typical: "£300–£800 per bathroom"               },
  flooring:              { low: "£25",     high: "£45",     unit: "per hour",        typical: "£300–£1,500 per room"                 },
  "damp-specialist":     { low: "£45",     high: "£75",     unit: "per hour",        typical: "£300–£2,500 for treatment"            },
  "pest-control":        { low: "£80",     high: "£200",    unit: "per visit",       typical: "£80–£300 per treatment"               },
  "security-installer":  { low: "£50",     high: "£80",     unit: "per hour",        typical: "£400–£2,500 for installation"         },
  "solar-panel-installer": { low: "£500", high: "£1,500",  unit: "per day",         typical: "£5,000–£15,000 for a full system"     },
  "loft-conversion":     { low: "£35,000", high: "£60,000", unit: "full project",   typical: "£35,000–£60,000 for a dormer"         },
  "driveway-specialist": { low: "£30",    high: "£50",     unit: "per hour",        typical: "£2,000–£8,000 for a full driveway"    },
  scaffolder:            { low: "£250",   high: "£800",    unit: "per week",        typical: "£500–£3,000 for most projects"        },
  "chimney-sweep":       { low: "£60",    high: "£120",    unit: "per visit",       typical: "£60–£120 per sweep"                   },
  "loft-insulation":     { low: "£400",   high: "£800",    unit: "full project",    typical: "£400–£800 for standard loft"          },
  fencer:                { low: "£25",    high: "£40",     unit: "per hour",        typical: "£500–£3,000 for a full garden fence"  },
  "waste-removal":       { low: "£150",   high: "£400",    unit: "per load",        typical: "£150–£600 per clearance"              },
  "carpet-cleaner":      { low: "£80",    high: "£200",    unit: "per room",        typical: "£80–£300 for a full house"            },
};

// ── Stoke-on-Trent hyper-local neighborhood matrix ───────────────────────────
export const STOKE_NEIGHBORHOODS = [
  { name: "Hanley",        postalDistrict: "ST1",  city: "Stoke-on-Trent", county: "Staffordshire" },
  { name: "Longton",       postalDistrict: "ST3",  city: "Stoke-on-Trent", county: "Staffordshire" },
  { name: "Burslem",       postalDistrict: "ST6",  city: "Stoke-on-Trent", county: "Staffordshire" },
  { name: "Fenton",        postalDistrict: "ST4",  city: "Stoke-on-Trent", county: "Staffordshire" },
  { name: "Tunstall",      postalDistrict: "ST6",  city: "Stoke-on-Trent", county: "Staffordshire" },
  { name: "Stoke",         postalDistrict: "ST4",  city: "Stoke-on-Trent", county: "Staffordshire" },
  { name: "Meir",          postalDistrict: "ST3",  city: "Stoke-on-Trent", county: "Staffordshire" },
  { name: "Blurton",       postalDistrict: "ST3",  city: "Stoke-on-Trent", county: "Staffordshire" },
  { name: "Bentilee",      postalDistrict: "ST2",  city: "Stoke-on-Trent", county: "Staffordshire" },
  { name: "Abbey Hulton",  postalDistrict: "ST2",  city: "Stoke-on-Trent", county: "Staffordshire" },
  { name: "Trentham",      postalDistrict: "ST4",  city: "Stoke-on-Trent", county: "Staffordshire" },
  { name: "Trent Vale",    postalDistrict: "ST4",  city: "Stoke-on-Trent", county: "Staffordshire" },
  { name: "Basford",       postalDistrict: "ST4",  city: "Stoke-on-Trent", county: "Staffordshire" },
  { name: "Northwood",     postalDistrict: "ST1",  city: "Stoke-on-Trent", county: "Staffordshire" },
  { name: "Shelton",       postalDistrict: "ST1",  city: "Stoke-on-Trent", county: "Staffordshire" },
  { name: "Smallthorne",   postalDistrict: "ST6",  city: "Stoke-on-Trent", county: "Staffordshire" },
  { name: "Cobridge",      postalDistrict: "ST6",  city: "Stoke-on-Trent", county: "Staffordshire" },
  { name: "Penkhull",      postalDistrict: "ST4",  city: "Stoke-on-Trent", county: "Staffordshire" },
  { name: "Weston Coyney", postalDistrict: "ST3",  city: "Stoke-on-Trent", county: "Staffordshire" },
  { name: "Dresden",       postalDistrict: "ST3",  city: "Stoke-on-Trent", county: "Staffordshire" },
] as const;

// ── Staffordshire broader geographic matrix ──────────────────────────────────
export const STAFFORDSHIRE_LOCATIONS = [
  { name: "Stafford",             postalDistrict: "ST16", county: "Staffordshire" },
  { name: "Lichfield",            postalDistrict: "WS13", county: "Staffordshire" },
  { name: "Tamworth",             postalDistrict: "B77",  county: "Staffordshire" },
  { name: "Cannock",              postalDistrict: "WS11", county: "Staffordshire" },
  { name: "Burton upon Trent",    postalDistrict: "DE14", county: "Staffordshire" },
  { name: "Newcastle-under-Lyme", postalDistrict: "ST5",  county: "Staffordshire" },
  { name: "Stone",                postalDistrict: "ST15", county: "Staffordshire" },
  { name: "Rugeley",              postalDistrict: "WS15", county: "Staffordshire" },
  { name: "Uttoxeter",            postalDistrict: "ST14", county: "Staffordshire" },
  { name: "Leek",                 postalDistrict: "ST13", county: "Staffordshire" },
  { name: "Kidsgrove",            postalDistrict: "ST7",  county: "Staffordshire" },
  { name: "Cheadle",              postalDistrict: "ST10", county: "Staffordshire" },
  { name: "Burntwood",            postalDistrict: "WS7",  county: "Staffordshire" },
  { name: "Biddulph",             postalDistrict: "ST8",  county: "Staffordshire" },
] as const;

// ── Cheshire geographic matrix ───────────────────────────────────────────────
export const CHESHIRE_LOCATIONS = [
  { name: "Sandbach",        postalDistrict: "CW11", county: "Cheshire East"              },
  { name: "Crewe",           postalDistrict: "CW1",  county: "Cheshire East"              },
  { name: "Congleton",       postalDistrict: "CW12", county: "Cheshire East"              },
  { name: "Macclesfield",    postalDistrict: "SK10", county: "Cheshire East"              },
  { name: "Wilmslow",        postalDistrict: "SK9",  county: "Cheshire East"              },
  { name: "Nantwich",        postalDistrict: "CW5",  county: "Cheshire East"              },
  { name: "Knutsford",       postalDistrict: "WA16", county: "Cheshire East"              },
  { name: "Middlewich",      postalDistrict: "CW10", county: "Cheshire East"              },
  { name: "Alsager",         postalDistrict: "ST7",  county: "Cheshire East"              },
  { name: "Holmes Chapel",   postalDistrict: "CW4",  county: "Cheshire East"              },
  { name: "Northwich",       postalDistrict: "CW8",  county: "Cheshire West and Chester"  },
  { name: "Chester",         postalDistrict: "CH1",  county: "Cheshire West and Chester"  },
  { name: "Ellesmere Port",  postalDistrict: "CH65", county: "Cheshire West and Chester"  },
  { name: "Winsford",        postalDistrict: "CW7",  county: "Cheshire West and Chester"  },
] as const;

// ── Core types ───────────────────────────────────────────────────────────────
export interface SEOMetadataInput {
  tradeSlug: string;
  city: string;
  neighborhood?: string;
  postalDistrict?: string;
  county?: string;
  modifier?: "Verified" | "Approved" | "Emergency" | "Local" | "Trusted";
  subTradeIndex?: number;
}

export interface CompiledSEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  openGraph: { title: string; description: string; url: string };
  canonical: string;
  pricingSnippet: { low: string; high: string; unit: string; typical: string } | null;
}

// ── Helper ───────────────────────────────────────────────────────────────────
function capitalize(slug: string): string {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function toSlug(str: string): string {
  return str.toLowerCase().replace(/[\s]+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// ── Main compiler ────────────────────────────────────────────────────────────
export function compileSEOMetadata(input: SEOMetadataInput): CompiledSEOMetadata {
  const {
    tradeSlug,
    city,
    neighborhood,
    postalDistrict,
    county,
    modifier = "Verified",
    subTradeIndex = 0,
  } = input;

  const subTrades    = SUB_TRADE_LABELS[tradeSlug] ?? [capitalize(tradeSlug)];
  const subLabel     = subTrades[subTradeIndex % subTrades.length];
  const locationLabel = neighborhood ? `${neighborhood}, ${city}` : city;
  const postalSuffix  = postalDistrict ? ` ${postalDistrict}` : "";
  const tradeName     = capitalize(tradeSlug);
  const pricing       = TRADE_PRICING[tradeSlug] ?? null;

  // Title: conversion matrix - local intent + postal district avoids duplicate penalties
  const title = `${modifier} ${subLabel} in ${locationLabel}${postalSuffix} | MyApproved`;

  // Description: price signal + trust signal + CTA - hard cap at 158 chars
  const priceClause = pricing
    ? ` Rates from ${pricing.low}–${pricing.high} ${pricing.unit}.`
    : "";
  const rawDescription =
    `Find a ${modifier.toLowerCase()} ${subLabel.toLowerCase()} in ${locationLabel}${postalSuffix}.` +
    `${priceClause}` +
    ` All ${tradeName.toLowerCase()}s are insured, ID-checked, and reviewed by real customers. Free quotes - no obligation.`;
  const description = rawDescription.length > 158
    ? rawDescription.slice(0, 155) + "..."
    : rawDescription;

  const canonical = `https://myapproved.com/find-tradespeople/${tradeSlug}/${toSlug(neighborhood ?? city)}`;

  const ogTitle       = `${modifier} ${subLabel} Near ${locationLabel}${postalSuffix} - Free Quotes | MyApproved`;
  const ogDescription = `Compare verified ${subLabel.toLowerCase()}s in ${locationLabel}. Read real reviews, check qualifications, and get free no-obligation quotes on MyApproved.`;

  const keywords = [
    `${tradeName.toLowerCase()} ${locationLabel.toLowerCase()}`,
    `${subLabel.toLowerCase()} ${locationLabel.toLowerCase()}`,
    `${modifier.toLowerCase()} ${tradeName.toLowerCase()} ${city.toLowerCase()}`,
    `local ${tradeName.toLowerCase()} ${city.toLowerCase()}`,
    `best ${tradeName.toLowerCase()} ${city.toLowerCase()}`,
    `${tradeName.toLowerCase()} near me`,
    `emergency ${tradeName.toLowerCase()} ${city.toLowerCase()}`,
    `${tradeName.toLowerCase()} quotes ${city.toLowerCase()}`,
    `${tradeName.toLowerCase()} cost ${city.toLowerCase()}`,
    `cheap ${tradeName.toLowerCase()} ${city.toLowerCase()}`,
  ];

  if (county) keywords.push(`${tradeName.toLowerCase()} ${county.toLowerCase()}`);
  if (postalDistrict) {
    keywords.push(`${tradeName.toLowerCase()} ${postalDistrict}`);
    keywords.push(`${subLabel.toLowerCase()} ${postalDistrict}`);
  }
  if (neighborhood) {
    keywords.push(`${tradeName.toLowerCase()} ${neighborhood.toLowerCase()}`);
    keywords.push(`${subLabel.toLowerCase()} ${neighborhood.toLowerCase()}`);
  }

  return {
    title,
    description,
    keywords,
    openGraph: { title: ogTitle, description: ogDescription, url: canonical },
    canonical,
    pricingSnippet: pricing,
  };
}

// ── Next.js Metadata adapter ─────────────────────────────────────────────────
export function toNextMetadata(compiled: CompiledSEOMetadata): Metadata {
  return {
    metadataBase: new URL('https://myapproved.com'),
    title: compiled.title,
    description: compiled.description,
    keywords: compiled.keywords.join(", "),
    alternates: { canonical: compiled.canonical },
    openGraph: {
      title: compiled.openGraph.title,
      description: compiled.openGraph.description,
      url: compiled.openGraph.url,
      siteName: "MyApproved",
      locale: "en_GB",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: compiled.openGraph.title,
      description: compiled.openGraph.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
  };
}

// ── Bulk generator - Staffordshire + Cheshire coverage ───────────────────────
// Use in sitemap.ts to generate all location × trade URL entries with rich metadata.
export function generateAllRegionalMetadata(tradeSlug: string): CompiledSEOMetadata[] {
  const results: CompiledSEOMetadata[] = [];

  // Stoke-on-Trent city level
  results.push(compileSEOMetadata({ tradeSlug, city: "Stoke-on-Trent", postalDistrict: "ST1", county: "Staffordshire" }));

  // Each Stoke neighborhood
  for (const hood of STOKE_NEIGHBORHOODS) {
    results.push(compileSEOMetadata({
      tradeSlug,
      city: hood.city,
      neighborhood: hood.name,
      postalDistrict: hood.postalDistrict,
      county: hood.county,
    }));
  }

  // Staffordshire towns
  for (const town of STAFFORDSHIRE_LOCATIONS) {
    results.push(compileSEOMetadata({
      tradeSlug,
      city: town.name,
      postalDistrict: town.postalDistrict,
      county: town.county,
    }));
  }

  // Cheshire towns
  for (const town of CHESHIRE_LOCATIONS) {
    results.push(compileSEOMetadata({
      tradeSlug,
      city: town.name,
      postalDistrict: town.postalDistrict,
      county: town.county,
    }));
  }

  return results;
}

// ── Utility: all sub-trade variants for a given location (long-tail sweep) ───
export function generateSubTradeVariants(
  tradeSlug: string,
  city: string,
  postalDistrict?: string,
  county?: string
): CompiledSEOMetadata[] {
  const subTrades = SUB_TRADE_LABELS[tradeSlug] ?? [];
  return subTrades.map((_, i) =>
    compileSEOMetadata({ tradeSlug, city, postalDistrict, county, subTradeIndex: i })
  );
}
