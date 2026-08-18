import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, ArrowRight, CheckCircle, Star, Shield } from "lucide-react";
import { TRADES, LOCATIONS } from "@/lib/seo-data";
import { TRADE_PRICING } from "@/lib/seoMetadataRouter";
import HeroSearchTrigger from "@/components/HeroSearchTrigger";

export const metadata: Metadata = {
  title: "Find Tradespeople by Location | All UK Cities & Towns | MyApproved",
  description:
    "Browse verified, insured tradespeople across every UK city and town. 33 trades - plumbers, electricians, roofers, builders and more. All ID-checked and insured. Free quotes in hours.",
  alternates: { canonical: "https://myapproved.com/locations" },
  openGraph: {
    title: "Find Tradespeople by Location | All UK Cities & Towns | MyApproved",
    description:
      "Browse verified tradespeople in every UK city and town. Free quotes from ID-checked, insured professionals.",
    url: "https://myapproved.com/locations",
    siteName: "MyApproved",
    locale: "en_GB",
    type: "website",
  },
};

function toSlug(str: string): string {
  return str.toLowerCase().replace(/[\s]+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function formatPricing(slug: string, fallback: string): string {
  const p = TRADE_PRICING[slug as keyof typeof TRADE_PRICING];
  if (!p) return fallback;
  const unitMap: Record<string, string> = {
    "per hour": "/hr",
    "per load": "/load",
    "per room": "/room",
    "per day": "/day",
    "per week": "/wk",
    "per visit": "/visit",
    "full project": " project",
  };
  const suffix = unitMap[p.unit] ?? ` ${p.unit}`;
  return `${p.low}–${p.high}${suffix}`;
}

const FEATURED_COMBOS = [
  { trade: "plumber",          tradeLabel: "Plumbers",             location: "london",       locationLabel: "London"       },
  { trade: "electrician",      tradeLabel: "Electricians",          location: "manchester",   locationLabel: "Manchester"   },
  { trade: "roofer",           tradeLabel: "Roofers",               location: "birmingham",   locationLabel: "Birmingham"   },
  { trade: "builder",          tradeLabel: "Builders",              location: "leeds",        locationLabel: "Leeds"        },
  { trade: "gas-engineer",     tradeLabel: "Gas Engineers",         location: "liverpool",    locationLabel: "Liverpool"    },
  { trade: "locksmith",        tradeLabel: "Locksmiths",            location: "sheffield",    locationLabel: "Sheffield"    },
  { trade: "carpenter",        tradeLabel: "Carpenters",            location: "bristol",      locationLabel: "Bristol"      },
  { trade: "painter-decorator",tradeLabel: "Painters & Decorators", location: "nottingham",   locationLabel: "Nottingham"   },
  { trade: "bathroom-fitter",  tradeLabel: "Bathroom Fitters",      location: "newcastle",    locationLabel: "Newcastle"    },
  { trade: "kitchen-fitter",   tradeLabel: "Kitchen Fitters",       location: "glasgow",      locationLabel: "Glasgow"      },
  { trade: "heating-engineer", tradeLabel: "Heating Engineers",     location: "edinburgh",    locationLabel: "Edinburgh"    },
  { trade: "plasterer",        tradeLabel: "Plasterers",            location: "cardiff",      locationLabel: "Cardiff"      },
];

const TRADE_GROUPS: Array<{ label: string; slugs: string[] }> = [
  {
    label: "Building & Construction",
    slugs: ["plumber", "electrician", "builder", "roofer", "carpenter", "loft-conversion", "conservatory"],
  },
  {
    label: "Home Improvement",
    slugs: ["painter-decorator", "kitchen-fitter", "bathroom-fitter", "tiler", "flooring", "plasterer", "handyman"],
  },
  {
    label: "Heating & Utilities",
    slugs: ["gas-engineer", "heating-engineer", "air-conditioning", "solar-panel-installer", "loft-insulation"],
  },
  {
    label: "Specialist Services",
    slugs: ["locksmith", "window-fitter", "damp-specialist", "pest-control", "chimney-sweep", "scaffolder", "security-installer"],
  },
  {
    label: "Outdoor & Garden",
    slugs: ["gardener", "landscaper", "fencer", "driveway-specialist"],
  },
  {
    label: "Cleaning & Removal",
    slugs: ["cleaner", "carpet-cleaner", "waste-removal"],
  },
];

const CITY_TOP_TRADES = ["plumber", "electrician", "roofer", "builder", "gas-engineer"];

const tier1 = LOCATIONS.filter((l) => l.priority === 1);
const tier2 = LOCATIONS.filter((l) => l.priority === 2);
const tier3 = LOCATIONS.filter((l) => l.priority === 3);

const FAQS = [
  {
    q: "How do I find a verified tradesperson near me?",
    a: "Use the location and trade grids below to browse verified professionals in your area. Every tradesperson on MyApproved is ID-verified, properly insured, and rated by genuine customers.",
  },
  {
    q: "How much does it cost to get quotes from tradespeople?",
    a: "Getting quotes is completely free for homeowners. Post your job, receive multiple quotes within hours, and only pay when you decide to hire. There are no hidden fees.",
  },
  {
    q: "Which UK cities and towns are covered by MyApproved?",
    a: "MyApproved covers all major UK cities including London, Manchester, Birmingham, Leeds, Glasgow, Liverpool, Sheffield, Bristol, Edinburgh, Cardiff, Belfast, and 40+ additional towns across England, Scotland, Wales, and Northern Ireland.",
  },
  {
    q: "What trades are available on MyApproved?",
    a: "We cover 33 trades including plumbers, electricians, gas engineers, roofers, builders, carpenters, painters & decorators, bathroom fitters, kitchen fitters, locksmiths, landscapers, heating engineers, solar panel installers, and many more.",
  },
  {
    q: "Are all tradespeople on MyApproved insured?",
    a: "Yes. Every tradesperson must provide proof of public liability insurance before joining MyApproved. We also carry out identity verification and check trade qualifications such as Gas Safe and NICEIC registration.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://myapproved.com/locations",
      url: "https://myapproved.com/locations",
      name: "Find Tradespeople by Location | All UK Cities & Towns | MyApproved",
      description:
        "Browse verified, insured tradespeople across every UK city and town. 33 trades, all ID-checked and insured.",
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://myapproved.com" },
          { "@type": "ListItem", position: 2, name: "Locations", item: "https://myapproved.com/locations" },
        ],
      },
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", ".speakable-intro"],
      },
    },
    {
      "@type": "ItemList",
      name: "UK Cities with Verified Tradespeople",
      description: "Major UK cities where MyApproved verified tradespeople are available.",
      itemListElement: tier1.map((city, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `Tradespeople in ${city.name}`,
        url: `https://myapproved.com/find-tradespeople/plumber/${toSlug(city.name)}`,
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
  ],
};

export default function LocationsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="bg-[#1A3A8A] text-white pt-8 sm:pt-12 pb-16 sm:pb-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden>
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#FFB800] blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-white blur-3xl translate-y-1/2 -translate-x-1/4" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-[#FFB800] text-[#0f172a] px-4 py-2 rounded-full text-sm font-bold mb-6">
              <MapPin className="w-4 h-4" /> 40+ UK Locations Covered
            </div>
            <h1
              className="text-3xl sm:text-5xl md:text-6xl font-extrabold mb-5 leading-tight"
              style={{ fontWeight: 800 }}
            >
              Find Verified Tradespeople
              <span className="block text-[#FFB800]">Anywhere in the UK</span>
            </h1>
            <p className="speakable-intro text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-8">
              ID-checked, insured professionals for every trade - in every city and town across
              England, Scotland, Wales, and Northern Ireland.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {[
                { icon: CheckCircle, text: "Every pro ID-verified" },
                { icon: Shield, text: "Fully insured" },
                { icon: Star, text: "Genuine customer reviews" },
              ].map(({ icon: Icon, text }) => (
                <span key={text} className="inline-flex items-center gap-1.5 text-sm text-blue-100 font-medium">
                  <Icon className="w-4 h-4 text-[#FFB800]" /> {text}
                </span>
              ))}
            </div>
            {/* Same search bar as homepage hero - opens AI Quote Form */}
            <HeroSearchTrigger />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">

          {/* ── Popular Searches ─────────────────────────────────────────────── */}
          <section>
            <h2
              className="text-2xl sm:text-3xl font-extrabold text-[#1A3A8A] mb-2"
              style={{ fontWeight: 800 }}
            >
              Popular Searches
            </h2>
            <p className="text-sm text-gray-500 mb-6">Most searched trade &amp; location combinations right now.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {FEATURED_COMBOS.map((c) => (
                <Link
                  key={`${c.trade}-${c.location}`}
                  href={`/find-tradespeople/${c.trade}/${c.location}`}
                  className="min-w-0 bg-white rounded-xl p-3 sm:p-4 border border-blue-100 hover:border-[#1A3A8A] hover:shadow-md transition-all group"
                >
                  <p
                    className="font-bold text-[#1A3A8A] text-sm leading-snug group-hover:underline break-words"
                    style={{ fontWeight: 700 }}
                  >
                    {c.tradeLabel} in {c.locationLabel}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs text-gray-400 mt-1 break-words">
                    <MapPin className="w-3 h-3 flex-shrink-0" /> {c.locationLabel}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* ── Browse by Trade ───────────────────────────────────────────────── */}
          <section>
            <h2
              className="text-2xl sm:text-3xl font-extrabold text-[#1A3A8A] mb-2"
              style={{ fontWeight: 800 }}
            >
              Browse by Trade
            </h2>
            <p className="text-sm text-gray-500 mb-8">
              Select a trade to find verified professionals near you.
            </p>
            <div className="space-y-8">
              {TRADE_GROUPS.map((group) => {
                const groupTrades = group.slugs
                  .map((slug) => TRADES.find((t) => t.slug === slug))
                  .filter(Boolean) as typeof TRADES[number][];
                if (!groupTrades.length) return null;
                return (
                  <div key={group.label}>
                    <h3
                      className="text-sm font-bold text-[#1A3A8A]/60 uppercase tracking-widest mb-3"
                      style={{ fontWeight: 700 }}
                    >
                      {group.label}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {groupTrades.map((trade) => (
                        <Link
                          key={trade.slug}
                          href={`/find-tradespeople/${trade.slug}`}
                          className="min-w-0 bg-white rounded-xl p-3 sm:p-4 border border-blue-50 hover:border-[#1A3A8A] hover:shadow-md transition-all group text-center"
                        >
                          <p
                            className="font-bold text-[#1A3A8A] text-sm group-hover:underline leading-snug break-words"
                            style={{ fontWeight: 700 }}
                          >
                            {trade.plural}
                          </p>
                          <p className="text-xs text-gray-400 mt-1 break-words">
                            {formatPricing(trade.slug, trade.hourlyRate)}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Major UK Cities (Tier 1) ──────────────────────────────────────── */}
          <section>
            <h2
              className="text-2xl sm:text-3xl font-extrabold text-[#1A3A8A] mb-2"
              style={{ fontWeight: 800 }}
            >
              Major UK Cities
            </h2>
            <p className="text-sm text-gray-500 mb-6">Find any trade in the UK&apos;s biggest cities.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {tier1.map((city) => (
                <div
                  key={city.name}
                  className="min-w-0 bg-white rounded-xl border border-blue-50 p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-[#FFB800] flex-shrink-0" />
                    <p className="font-bold text-[#1A3A8A] text-sm" style={{ fontWeight: 700 }}>
                      {city.name}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 mb-3 pl-5">{city.region}</p>
                  <div className="flex flex-col gap-1.5 pl-1">
                    {CITY_TOP_TRADES.map((tradeSlug) => {
                      const tradeData = TRADES.find((t) => t.slug === tradeSlug);
                      if (!tradeData) return null;
                      return (
                        <Link
                          key={tradeSlug}
                          href={`/find-tradespeople/${tradeSlug}/${toSlug(city.name)}`}
                          className="text-xs text-[#1A3A8A] hover:text-[#FFB800] hover:underline flex items-center gap-1 transition-colors"
                        >
                          <ArrowRight className="w-3 h-3 flex-shrink-0" />
                          {tradeData.plural} in {city.name}
                        </Link>
                      );
                    })}
                    <Link
                      href={`/find-tradespeople/plumber/${toSlug(city.name)}`}
                      className="text-xs text-gray-400 hover:text-[#1A3A8A] mt-0.5 transition-colors"
                    >
                      + all trades →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Large UK Towns (Tier 2) ───────────────────────────────────────── */}
          <section>
            <h2
              className="text-2xl sm:text-3xl font-extrabold text-[#1A3A8A] mb-2"
              style={{ fontWeight: 800 }}
            >
              Large UK Towns
            </h2>
            <p className="text-sm text-gray-500 mb-6">Verified tradespeople in major towns across the UK.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {tier2.map((city) => (
                <Link
                  key={city.name}
                  href={`/find-tradespeople/plumber/${toSlug(city.name)}`}
                  className="min-w-0 bg-white rounded-xl border border-blue-50 p-3 sm:p-4 hover:border-[#1A3A8A] hover:shadow-md transition-all group"
                >
                  <p
                    className="font-bold text-[#1A3A8A] text-sm group-hover:underline break-words"
                    style={{ fontWeight: 700 }}
                  >
                    {city.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 break-words">{city.region}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* ── More UK Towns (Tier 3) ────────────────────────────────────────── */}
          <section>
            <h2
              className="text-2xl sm:text-3xl font-extrabold text-[#1A3A8A] mb-2"
              style={{ fontWeight: 800 }}
            >
              More UK Towns &amp; Cities
            </h2>
            <p className="text-sm text-gray-500 mb-6">Coverage across every corner of the UK.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {tier3.map((city) => (
                <Link
                  key={city.name}
                  href={`/find-tradespeople/plumber/${toSlug(city.name)}`}
                  className="min-w-0 bg-white rounded-lg p-3 text-center border border-blue-50 hover:bg-[#1A3A8A] hover:text-white hover:border-[#1A3A8A] hover:shadow-md transition-all group"
                >
                  <p className="text-sm font-semibold text-[#1A3A8A] group-hover:text-white break-words" style={{ fontWeight: 600 }}>
                    {city.name}
                  </p>
                  <p className="text-xs text-gray-400 group-hover:text-blue-200 mt-0.5 break-words">
                    {city.region}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {/* ── FAQ / AEO Block ───────────────────────────────────────────────── */}
          <section>
            <h2
              className="text-2xl sm:text-3xl font-extrabold text-[#1A3A8A] mb-6"
              style={{ fontWeight: 800 }}
            >
              Frequently Asked Questions
            </h2>
            <div className="divide-y divide-gray-100 rounded-2xl border border-blue-50 overflow-hidden bg-white">
              {FAQS.map(({ q, a }) => (
                <details key={q} className="group">
                  <summary className="flex items-center justify-between gap-4 cursor-pointer px-6 py-5 hover:bg-sky-50 transition-colors list-none">
                    <span className="font-semibold text-[#1A3A8A] text-sm sm:text-base" style={{ fontWeight: 600 }}>
                      {q}
                    </span>
                    <span className="text-[#1A3A8A] flex-shrink-0 transition-transform group-open:rotate-45 text-xl font-light select-none">
                      +
                    </span>
                  </summary>
                  <div className="px-6 pb-5 pt-1 text-sm text-gray-600 leading-relaxed border-t border-blue-50">
                    {a}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* ── CTA ───────────────────────────────────────────────────────────── */}
          <section className="bg-[#1A3A8A] rounded-2xl p-8 sm:p-12 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden>
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#FFB800] blur-3xl -translate-y-1/3 translate-x-1/4" />
            </div>
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-3" style={{ fontWeight: 800 }}>
                Can&apos;t find your area?
              </h2>
              <p className="text-blue-100 mb-8 max-w-xl mx-auto text-sm sm:text-base">
                Post your job free and we&apos;ll match you with verified tradespeople covering your
                postcode - anywhere in the UK. Quotes in hours, not days.
              </p>
              <Link
                href="/instant-quote"
                className="inline-flex items-center gap-2 bg-[#FFB800] hover:bg-[#FFC933] text-[#0f172a] font-bold px-8 py-4 rounded-xl text-base transition-all shadow-lg"
                style={{ fontWeight: 800 }}
              >
                Get Free Quotes <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
