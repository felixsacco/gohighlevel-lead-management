/**
 * Programmatic Trade + Location SEO Page (primary URL structure)
 * Route: /find-tradespeople/[trade]/[location]
 * e.g.  /find-tradespeople/plumber/birmingham
 *
 * Server Component — exports generateStaticParams + generateMetadata.
 * Places results fetched server-side via TradeLocationLiveResults.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  TRADES,
  LOCATIONS,
  generateTradeLocationSchema,
} from "@/lib/seo-data";
import AEOContentBlock from "@/components/AEOContentBlock";
import TradeLocationLiveResults from "@/components/TradeLocationLiveResults";
import HeroSearchTrigger from "@/components/HeroSearchTrigger";
import GetQuotesButton from "@/components/GetQuotesButton";
import HeroTrustBadges from "@/components/HeroTrustBadges";
import { Button } from "@/components/ui/button";
import SectionHeaderPill from "@/components/ui/SectionHeaderPill";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AirVent,
  Archive,
  Armchair,
  ArrowRight,
  BadgeCheck,
  Bath,
  BatteryCharging,
  Bird,
  Boxes,
  Bug,
  Building2,
  CalendarCheck,
  Cctv,
  CheckCircle,
  ChevronRight,
  Cog,
  CookingPot,
  DoorClosed,
  DoorOpen,
  Droplet,
  Droplets,
  Fan,
  Fence,
  FileCheck,
  Flame,
  Flower2,
  Frame,
  Gauge,
  Grid2x2,
  Grid3x3,
  Hammer,
  HardHat,
  Home,
  House,
  Key,
  KeyRound,
  Lamp,
  LandPlot,
  Layers,
  LayoutPanelTop,
  Leaf,
  Lightbulb,
  Lock,
  MapPin,
  Monitor,
  Mountain,
  PaintRoller,
  Paintbrush,
  Palette,
  PencilRuler,
  Plug,
  PlugZap,
  Radar,
  RefreshCw,
  Ruler,
  Search,
  Shield,
  ShieldCheck,
  ShowerHead,
  Siren,
  Sparkles,
  SprayCan,
  Sprout,
  Stethoscope,
  Sun,
  Thermometer,
  Tractor,
  Trash2,
  TreePine,
  Tv,
  Warehouse,
  Waves,
  Wifi,
  Wind,
  Wrench,
  Zap,
} from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────
function toSlug(str: string): string {
  return str.toLowerCase().replace(/[\s]+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function fromSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ── Service icon mapping ───────────────────────────────────────────────────────
// Each trade maps its `services` (in order) to an explicit, distinct icon so no
// two cards in a row share a glyph and every icon is a precise visual match for
// the service it labels. Fall back to the trade's first icon, then Wrench.
type ServiceIcon = {
  Icon: typeof Wrench;
};

const TRADE_SERVICE_ICONS: Record<string, (typeof Wrench)[]> = {
  plumber: [Droplets, Flame, Bath, Wrench, Zap, Thermometer, ShowerHead, Droplet, Sparkles, Gauge],
  electrician: [Zap, Plug, Grid3x3, Lightbulb, Zap, Stethoscope, Lamp, PlugZap, Search, Cctv],
  builder: [House, Building2, Warehouse, Hammer, HardHat, Home, TreePine, DoorOpen, Sun, LandPlot],
  roofer: [Hammer, House, Layers, Grid3x3, Droplets, Home, Ruler, Layers, Zap, Search],
  carpenter: [Armchair, CookingPot, DoorOpen, Layers, Boxes, Ruler, Frame, Fence, Grid3x3, Archive],
  "painter-decorator": [Paintbrush, Sun, PaintRoller, Ruler, Layers, SprayCan, Layers, Fence, Trash2, Palette],
  "kitchen-fitter": [CookingPot, Grid3x3, Plug, Droplets, Zap, Grid2x2, Archive, PencilRuler, RefreshCw, Wrench],
  "bathroom-fitter": [Bath, Waves, ShowerHead, Droplets, Bath, Grid2x2, Droplet, Thermometer, PencilRuler, Wrench],
  tiler: [Grid3x3, LayoutPanelTop, Bath, CookingPot, Grid2x2, Mountain, Thermometer, Wrench, Droplets, PaintRoller],
  flooring: [Layers, Grid3x3, Layers, Layers, Grid2x2, Sparkles, Wrench, Ruler, Boxes, Building2],
  "gas-engineer": [Flame, Cog, Flame, ShieldCheck, Thermometer, Droplets, CookingPot, Flame, FileCheck, Zap],
  plasterer: [PaintRoller, Layers, PaintRoller, Layers, Ruler, Hammer, Sun, Layers, Wrench, Shield],
  locksmith: [DoorOpen, Lock, KeyRound, Lock, KeyRound, Key, Search, Shield, Lock, Key],
  "window-fitter": [Frame, DoorOpen, Layers, Layers, Grid2x2, DoorClosed, DoorOpen, DoorOpen, Sun, Wrench],
  "heating-engineer": [Thermometer, Flame, Gauge, Thermometer, Fan, Thermometer, Waves, Cog, Zap, CalendarCheck],
  gardener: [TreePine, Sprout, Leaf, Flower2, LandPlot, Sparkles, Sprout, PencilRuler, Bug, Trash2],
  landscaper: [PencilRuler, LandPlot, Fence, Fence, LandPlot, Leaf, Waves, Lightbulb, Grid3x3, Home],
  fencer: [Fence, Wrench, DoorOpen, Grid2x2, Grid2x2, Grid2x2, Shield, DoorOpen, PaintRoller, Hammer],
  "driveway-specialist": [Grid3x3, LandPlot, Droplets, Mountain, Layers, Grid3x3, Wrench, Sparkles, PaintRoller, Ruler],
  cleaner: [Sparkles, Sparkles, DoorOpen, Building2, Layers, Armchair, Frame, CookingPot, HardHat, CalendarCheck],
  "waste-removal": [Trash2, TreePine, HardHat, Armchair, Trash2, Tractor, Trash2, Boxes, Building2, RefreshCw],
  "carpet-cleaner": [Layers, Sparkles, Armchair, Droplets, Wind, Shield, Building2, Wind, Wind, Layers],
  "security-installer": [Cctv, Siren, Lock, Wifi, Shield, Radar, DoorOpen, Lightbulb, Lock, Cog],
  "pest-control": [Bug, Bug, Bug, Bug, Bug, Bug, Bug, Bug, Bird, Shield],
  "damp-specialist": [Search, Droplets, Droplets, Wind, Droplets, Wrench, Bug, Bug, Grid3x3, Wrench],
  scaffolder: [Grid3x3, Layers, Home, Building2, Grid3x3, HardHat, ShieldCheck, PencilRuler, Trash2, Zap],
  "chimney-sweep": [Wind, Search, Cctv, Bird, HardHat, Wind, FileCheck, Flame, Wrench, Cog],
  "loft-insulation": [Thermometer, Layers, Layers, Wind, Search, Trash2, Grid3x3, Boxes, FileCheck, Shield],
  "air-conditioning": [AirVent, Wrench, Cog, Thermometer, Grid3x3, Building2, Home, Wrench, Droplets, Search],
  "solar-panel-installer": [Sun, Thermometer, BatteryCharging, Plug, PlugZap, ShieldCheck, Wrench, Wrench, Cog, Monitor],
  handyman: [Wrench, Hammer, Ruler, Grid3x3, DoorOpen, Tv, Droplets, Zap, TreePine, Cog],
  "loft-conversion": [House, House, Hammer, Sun, HardHat, Boxes, Thermometer, Frame, FileCheck, Ruler],
  conservatory: [Home, Sun, Layers, Wrench, HardHat, Thermometer, Lightbulb, FileCheck, Layers, PencilRuler],
};

function getServiceIcon(tradeSlug: string, index: number): ServiceIcon {
  const icons = TRADE_SERVICE_ICONS[tradeSlug];
  if (icons && icons[index]) return { Icon: icons[index] };
  if (icons && icons[0]) return { Icon: icons[0] };
  return { Icon: Wrench };
}

// ── Static params ─────────────────────────────────────────────────────────────
export async function generateStaticParams() {
  const params: { trade: string; location: string }[] = [];

  const allLocationSlugs = LOCATIONS.map((l) => toSlug(l.name));

  for (const trade of TRADES) {
    for (const locationSlug of allLocationSlugs) {
      params.push({ trade: trade.slug, location: locationSlug });
    }
  }

  return params;
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: { trade: string; location: string };
}): Promise<Metadata> {
  const trade = TRADES.find((t) => t.slug === params.trade);
  const location = LOCATIONS.find((l) => toSlug(l.name) === params.location);
  const locationName = location?.name ?? fromSlug(params.location);

  if (!trade)
    return { title: "Not Found | MyApproved", robots: { index: false } };

  return {
    title: `Verified ${trade.plural} in ${locationName} | Free Quotes | MyApproved`,
    description: `Find verified ${trade.plural.toLowerCase()} in ${locationName}. Every professional passes identity, business and insurance checks before listing, with each check confirmed on their public profile.`,
    alternates: {
      canonical: `https://myapproved.com/find-tradespeople/${params.trade}/${params.location}`,
    },
    openGraph: {
      title: `Verified ${trade.plural} in ${locationName} | MyApproved`,
      description: `Compare verified ${trade.plural.toLowerCase()} in ${locationName}. Free quotes and real reviews. Every listing insured and monitored.`,
      url: `https://myapproved.com/find-tradespeople/${params.trade}/${params.location}`,
      siteName: "MyApproved",
      locale: "en_GB",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Verified ${trade.plural} in ${locationName} | MyApproved`,
      description: `Compare verified ${trade.plural.toLowerCase()} in ${locationName}. Free quotes, no obligation.`,
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function FindTradeLocationPage({
  params,
}: {
  params: { trade: string; location: string };
}) {
  const trade = TRADES.find((t) => t.slug === params.trade);
  if (!trade) notFound();

  const location = LOCATIONS.find((l) => toSlug(l.name) === params.location);
  const locationName = location?.name ?? fromSlug(params.location);

  const schema = generateTradeLocationSchema(params.trade, params.location);

  const relatedTrades = TRADES.filter(
    (t) => t.category === trade.category && t.slug !== trade.slug
  ).slice(0, 4);

  const nearbyLocations = location
    ? LOCATIONS.filter(
        (l) => l.region === location.region && l.name !== location.name
      ).slice(0, 12)
    : [];

  // Coverage-section layout constants. "Rows" are defined against a fixed
  // column count so the initial view is deterministic regardless of trade or
  // location. Postcodes render on a 6-column grid (lg) and nearby towns on a
  // 3-column grid, so exactly ROWS × COLUMNS items show before expanding.
  const POSTCODE_COLUMNS = 6;
  const POSTCODE_INITIAL_ROWS = 3;
  const postcodesVisibleCount = POSTCODE_COLUMNS * POSTCODE_INITIAL_ROWS; // 18

  const NEARBY_COLUMNS = 3;
  const NEARBY_INITIAL_ROWS = 2;
  const nearbyVisibleCount = NEARBY_COLUMNS * NEARBY_INITIAL_ROWS; // 6

  const otherCities = LOCATIONS.filter(
    (l) => l.priority <= 2 && l.name !== locationName
  ).slice(0, 12);

  const faqs = [
    {
      q: `How much does a ${trade.name.toLowerCase()} cost in ${locationName}?`,
      a: `${trade.plural} in ${locationName} typically charge ${trade.hourlyRate} per hour. Exact prices depend on the job itself, but you'll get a fixed, written quote before any work starts — so there are no surprises.`,
    },
    {
      q: `Are ${trade.plural.toLowerCase()} on MyApproved in ${locationName} insured?`,
      a: `Yes. Every professional must hold public liability insurance that is confirmed real and in date before they're listed, and we keep monitoring that cover so the listing is withdrawn if it lapses.`,
    },
    {
      q: `How does MyApproved verify ${trade.plural.toLowerCase()} in ${locationName}?`,
      a: `Before listing, each professional passes an identity check against photo ID, a business check through Companies House, and an insurance check — and that cover is monitored after they're listed.`,
    },
    {
      q: `How quickly can I get a ${trade.name.toLowerCase()} in ${locationName}?`,
      a: `Most homeowners get their first quote within a few hours. For urgent work, professionals can often respond within 1–2 hours.`,
    },
  ];

  return (
    <>
      {/* ── Structured Data ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": `https://myapproved.com/find-tradespeople/${params.trade}/${params.location}`,
            name: `${trade.name}s in ${locationName} | Verified & Approved | MyApproved`,
            description: `Find verified ${trade.plural.toLowerCase()} in ${locationName}. Compare profiles, read reviews from confirmed jobs, and get free quotes on MyApproved. Every ${trade.name.toLowerCase()} passes identity, business and insurance checks before listing.`,
            url: `https://myapproved.com/find-tradespeople/${params.trade}/${params.location}`,
            image: "https://myapproved.com/logo-icon.svg",
            logo: {
              "@type": "ImageObject",
              url: "https://myapproved.com/logo-icon.svg",
              width: 512,
              height: 512,
            },
            priceRange: "££",
            currenciesAccepted: "GBP",
            paymentAccepted: "Cash, Credit Card, Bank Transfer",
            address: {
              "@type": "PostalAddress",
              addressLocality: locationName,
              addressRegion: location?.region || "England",
              addressCountry: "GB",
            },
            areaServed: {
              "@type": "City",
              name: locationName,
              containedInPlace: {
                "@type": "AdministrativeArea",
                name: location?.region || "England",
                containedInPlace: {
                  "@type": "Country",
                  name: "United Kingdom",
                },
              },
            },
            openingHoursSpecification: [
              { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "07:00", closes: "21:00" },
              { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday"], opens: "07:00", closes: "20:00" },
              { "@type": "OpeningHoursSpecification", dayOfWeek: ["Sunday"], opens: "08:00", closes: "18:00" },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: { "@type": "Answer", text: faq.a },
            })),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://myapproved.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Find Tradespeople",
                item: "https://myapproved.com/find-tradespeople",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: trade.plural,
                item: `https://myapproved.com/find-tradespeople/${params.trade}`,
              },
              {
                "@type": "ListItem",
                position: 4,
                name: locationName,
                item: `https://myapproved.com/find-tradespeople/${params.trade}/${params.location}`,
              },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: `How to hire a verified ${trade.name.toLowerCase()} in ${locationName}`,
            description: `How to find and hire a verified, insured ${trade.name.toLowerCase()} in ${locationName} through MyApproved.`,
            step: [
              {
                "@type": "HowToStep",
                position: 1,
                name: "Post your job",
                text: `Describe the ${trade.name.toLowerCase()} work you need in ${locationName}. It takes under 2 minutes and costs nothing.`,
              },
              {
                "@type": "HowToStep",
                position: 2,
                name: "Verified tradespeople call you back",
                text: `Verified local ${trade.plural.toLowerCase()} contact you directly to discuss the job and provide a fixed, written quote.`,
              },
              {
                "@type": "HowToStep",
                position: 3,
                name: "Compare profiles and choose",
                text: "Review each professional's verified credentials, ratings from confirmed jobs, and quote. Message them directly, with no obligation.",
              },
              {
                "@type": "HowToStep",
                position: 4,
                name: "Hire with confidence",
                text: `Every ${trade.name.toLowerCase()} passes identity, business and insurance checks before listing, and their public liability insurance is monitored.`,
              },
            ],
          }),
        }}
      />

      <div className="min-h-screen bg-white">

        {/* ── Breadcrumb ── */}
        <nav aria-label="Breadcrumb" className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <ol
              className="flex items-center gap-2 text-sm text-slate-600 flex-wrap"
              itemScope
              itemType="https://schema.org/BreadcrumbList"
            >
              <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
                <Link href="/" className="hover:text-brand-navy transition-colors" itemProp="item">
                  <span itemProp="name">Home</span>
                </Link>
                <meta itemProp="position" content="1" />
              </li>
              <li aria-hidden="true"><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
              <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
                <Link href="/find-tradespeople" className="hover:text-brand-navy transition-colors" itemProp="item">
                  <span itemProp="name">Find Tradespeople</span>
                </Link>
                <meta itemProp="position" content="2" />
              </li>
              <li aria-hidden="true"><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
              <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
                <Link href={`/find-tradespeople/${params.trade}`} className="hover:text-brand-navy transition-colors" itemProp="item">
                  <span itemProp="name">{trade.plural}</span>
                </Link>
                <meta itemProp="position" content="3" />
              </li>
              <li aria-hidden="true"><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
              <li
                className="text-brand-navy font-semibold"
                itemScope
                itemType="https://schema.org/ListItem"
                itemProp="itemListElement"
              >
                <span itemProp="name">{locationName}</span>
                <meta itemProp="position" content="4" />
              </li>
            </ol>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="relative bg-gradient-to-b from-brand-navyDark to-brand-navy text-white overflow-hidden min-h-[100vh] flex items-center -mt-[var(--header-height)]">
          {/* Brand background accents — subtle radial glow + amber grain */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute -top-32 -left-32 h-[40rem] w-[40rem] rounded-full bg-brand-navy/35 blur-3xl" />
            <div className="absolute -bottom-40 -right-24 h-[36rem] w-[36rem] rounded-full bg-brand-amber/10 blur-3xl" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-16 md:pt-28 md:pb-24">
            <div className="max-w-5xl mx-auto text-center">
              <SectionHeaderPill>Verified {trade.plural} · {locationName}</SectionHeaderPill>

              <h1
                className="text-[2rem] sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-[-0.02em] mb-12 sm:mb-16 px-2 sm:px-4"
                style={{ fontWeight: 800 }}
                data-speakable
              >
                Verified {trade.plural} in{" "}
                <span className="relative inline-block whitespace-nowrap">
                  <span className="text-white relative z-10">{locationName}</span>
                  <svg viewBox="0 0 400 46" width="100%" aria-hidden="true" className="absolute inset-x-0 -bottom-[0.85em] w-full overflow-visible pointer-events-none z-0">
                    <defs>
                      <linearGradient id="paintStroke" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0" stop-color="#FFB800"/>
                        <stop offset="1" stop-color="#FFB800"/>
                      </linearGradient>
                      <linearGradient id="drip1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stop-color="#FFB800"/>
                        <stop offset="1" stop-color="#E0A100"/>
                      </linearGradient>
                      <linearGradient id="drip2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stop-color="#FFB800"/>
                        <stop offset="1" stop-color="#E0A100"/>
                      </linearGradient>
                      <linearGradient id="drip3" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stop-color="#FFB800"/>
                        <stop offset="1" stop-color="#E0A100"/>
                      </linearGradient>
                    </defs>
                    <path d="M2 13c48-4 96-6 144-5s96 4 144 3 76-4 108-5v11c-32 2-72 5-108 6s-96-2-144-3-96 1-144 5z" fill="#0A2463" opacity="0.08" transform="translate(0 2)"/>
                    <path d="M2 13c48-4 96-6 144-5s96 4 144 3 76-4 108-5v11c-32 2-72 5-108 6s-96-2-144-3-96 1-144 5z" fill="url(#paintStroke)"/>
                    <path d="M88 18c-1 7-3 11-2 15 .6 3.6 3 4.4 5 4 2.4-.5 3.6-3.4 3-7-.7-4.4-2-8-2-12z" fill="url(#drip1)"/>
                    <path d="M214 19c-1.4 10-3.4 16-2.4 21 .8 4.4 3.6 5.4 5.8 4.8 2.8-.8 4-4.4 3.2-9-1-5.6-2.6-11-2.6-16.8z" fill="url(#drip2)"/>
                    <path d="M312 21c-.8 5-2 8-1.4 11 .5 2.6 2.2 3.2 3.8 2.9 1.8-.4 2.6-2.5 2.2-5-.5-3.2-1.6-6-1.6-8.9z" fill="url(#drip3)"/>
                  </svg>
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/75 leading-relaxed mb-12 sm:mb-16 max-w-[34rem] mx-auto font-normal px-4">
                Compare identity-checked, insured {trade.plural.toLowerCase()} in {locationName} and get free, no-obligation quotes.
              </p>

              {/* Trust indicators — flat register entries, separated by a hairline */}
              <HeroTrustBadges />

              <HeroSearchTrigger suggestions={trade.services} />
              <div className="flex justify-center mt-4">
                <Link
                  href={`/find-tradespeople/${params.trade}`}
                  className="text-sm text-slate-300 hover:text-white underline underline-offset-2 transition-colors"
                >
                  Browse all {trade.plural} across the UK
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust checks ── */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              {[
                { title: "Identity checked", icon: BadgeCheck },
                { title: "Registered business", icon: CheckCircle },
                { title: "Insurance monitored", icon: Shield },
              ].map(({ title, icon: Icon }) => (
                <div
                  key={title}
                  className="flex flex-col items-center justify-center gap-3 text-center bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6"
                >
                  <div className="w-11 h-11 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm sm:text-base font-extrabold text-brand-navy" style={{ fontWeight: 700 }}>
                    {title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Places Results ──
             Rendered as a server component; renders nothing when empty. */}
        <TradeLocationLiveResults
          tradeSlug={params.trade}
          tradeName={trade.name}
          tradePlural={trade.plural}
          locationSlug={params.location}
          locationName={locationName}
        />

        {/* CTA — follow the results list */}
        <div className="bg-white py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <GetQuotesButton />
            <p className="text-sm text-slate-500 mt-3">
              Free · No obligation · 2-minute job post
            </p>
          </div>
        </div>

        {/* ── AEO Answer Block ── */}
        <AEOContentBlock
          tradeType={params.trade}
          city={locationName}
          className="rounded-none border-x-0"
        />

        {/* ── Services ── */}
        <section className="py-16 sm:py-24 bg-brand-slate">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-brand-navy mb-2 text-center" style={{ fontWeight: 800 }}>
              {trade.name} Services in {locationName}
            </h2>
            <p className="text-sm text-slate-600 text-center mb-8 max-w-xl mx-auto">
              Post any of these jobs and receive free quotes from verified local pros.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {trade.services.map((service, i) => {
                const { Icon } = getServiceIcon(trade.slug, i);
                return (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-4 text-center border border-gray-100 hover:border-brand-navy hover:shadow-sm transition-all"
                  >
                    <div className="w-10 h-10 bg-brand-slate rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Icon className="w-5 h-5 text-brand-amber" />
                    </div>
                    <p className="text-sm font-semibold text-brand-navy leading-snug">
                      {service}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="mt-10 text-center">
              <GetQuotesButton />
              <p className="text-sm text-slate-500 mt-3">
                Free · No obligation · 2-minute job post
              </p>
            </div>
          </div>
        </section>

        {/* ── Coverage Area ── */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div>

              {/* Coverage area */}
              <div className="text-center">
                <h2 className="text-lg sm:text-xl font-extrabold text-brand-navy mb-4" style={{ fontWeight: 800 }}>
                  {trade.plural} Covering {locationName} &amp; Nearby Areas
                </h2>

                {location?.postcodes && location.postcodes.length > 0 && (
                  <>
                    <p className="text-sm font-semibold text-slate-600 mb-3">
                      Postcode districts served:
                    </p>
                    {location.postcodes.length > postcodesVisibleCount ? (
                      <Accordion type="single" collapsible className="mb-6">
                        <AccordionItem value="postcodes">
                          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 mx-auto">
                            {location.postcodes.slice(0, postcodesVisibleCount).map((pc) => (
                              <div
                                key={pc}
                                className="flex items-center gap-1.5 bg-brand-slate rounded-xl px-3 py-2.5 border border-gray-100 justify-center"
                              >
                                <MapPin className="w-3 h-3 text-brand-amber flex-shrink-0" />
                                <span className="text-sm font-bold text-brand-navy">{pc}</span>
                              </div>
                            ))}
                          </div>
                          <AccordionContent>
                            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-2 mx-auto">
                              {location.postcodes.slice(postcodesVisibleCount).map((pc) => (
                                <div
                                  key={pc}
                                  className="flex items-center gap-1.5 bg-brand-slate rounded-xl px-3 py-2.5 border border-gray-100"
                                >
                                  <MapPin className="w-3 h-3 text-brand-amber flex-shrink-0" />
                                  <span className="text-sm font-bold text-brand-navy">{pc}</span>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                          <AccordionTrigger className="mt-2 text-sm font-semibold text-brand-navy">
                            Show {location.postcodes.length - postcodesVisibleCount} more postcodes
                          </AccordionTrigger>
                        </AccordionItem>
                      </Accordion>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 mb-6 mx-auto">
                        {location.postcodes.map((pc) => (
                          <div
                            key={pc}
                            className="flex items-center gap-1.5 bg-brand-slate rounded-xl px-3 py-2.5 border border-gray-100 justify-center"
                          >
                            <MapPin className="w-3 h-3 text-brand-amber flex-shrink-0" />
                            <span className="text-sm font-bold text-brand-navy">{pc}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {nearbyLocations.length > 0 && (
                  <>
                    <p className="text-sm font-semibold text-slate-600 mb-3">
                      Also serving nearby towns:
                    </p>
                    {nearbyLocations.length > nearbyVisibleCount ? (
                      <Accordion type="single" collapsible>
                        <AccordionItem value="nearby">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mx-auto">
                            {nearbyLocations.slice(0, nearbyVisibleCount).map((nearby) => (
                              <Link
                                key={nearby.name}
                                href={`/find-tradespeople/${params.trade}/${toSlug(nearby.name)}`}
                                className="inline-flex items-center justify-center gap-1.5 bg-white border border-gray-100 hover:border-brand-navy hover:bg-gray-50 px-3.5 py-2 rounded-full text-sm text-brand-navy font-semibold transition-all whitespace-nowrap"
                              >
                                {trade.plural} in {nearby.name}
                                <ArrowRight className="w-3 h-3 flex-shrink-0" />
                              </Link>
                            ))}
                          </div>
                          <AccordionContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2 mx-auto">
                              {nearbyLocations.slice(nearbyVisibleCount).map((nearby) => (
                                <Link
                                  key={nearby.name}
                                  href={`/find-tradespeople/${params.trade}/${toSlug(nearby.name)}`}
                                  className="inline-flex items-center justify-center gap-1.5 bg-white border border-gray-100 hover:border-brand-navy hover:bg-gray-50 px-3.5 py-2 rounded-full text-sm text-brand-navy font-semibold transition-all whitespace-nowrap"
                                >
                                  {trade.plural} in {nearby.name}
                                  <ArrowRight className="w-3 h-3 flex-shrink-0" />
                                </Link>
                              ))}
                            </div>
                          </AccordionContent>
                          <AccordionTrigger className="mt-2 text-sm font-semibold text-brand-navy">
                            Show {nearbyLocations.length - nearbyVisibleCount} more nearby towns
                          </AccordionTrigger>
                        </AccordionItem>
                      </Accordion>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mx-auto">
                        {nearbyLocations.map((nearby) => (
                          <Link
                            key={nearby.name}
                            href={`/find-tradespeople/${params.trade}/${toSlug(nearby.name)}`}
                            className="inline-flex items-center justify-center gap-1.5 bg-white border border-gray-100 hover:border-brand-navy hover:bg-gray-50 px-3.5 py-2 rounded-full text-sm text-brand-navy font-semibold transition-all whitespace-nowrap"
                          >
                            {trade.plural} in {nearby.name}
                            <ArrowRight className="w-3 h-3 flex-shrink-0" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}

                <div className="mt-10">
                  <GetQuotesButton />
                  <p className="text-sm text-slate-500 mt-3">
                    Free · No obligation · 2-minute job post
                  </p>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ── Standalone CTA ── */}
        <section className="py-16 sm:py-24 bg-gradient-to-b from-brand-navyDark to-brand-navy">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-6" style={{ fontWeight: 800 }}>
              Need a {trade.name} in {locationName} today?
            </h2>
            <GetQuotesButton />
            <p className="text-sm text-slate-300 mt-3">
              Free · No obligation · 2-minute job post
            </p>
          </div>
        </section>

        {/* ── FAQ Accordion ── */}
        <section className="py-12 sm:py-16 bg-white" data-speakable>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-brand-navy mb-8 text-center" style={{ fontWeight: 800 }}>
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="bg-white rounded-xl border-2 border-gray-200 px-4 sm:px-6 data-[state=open]:bg-brand-slate data-[state=open]:border-gray-200 transition-colors"
                >
                  <AccordionTrigger className="text-left font-semibold text-brand-navy py-4 hover:no-underline text-sm sm:text-base">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 text-sm leading-relaxed pb-4">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="mt-12 text-center">
              <GetQuotesButton />
              <p className="text-sm text-slate-500 mt-3">
                Free · No obligation · 2-minute job post
              </p>
            </div>
          </div>
        </section>

        {/* ── Other UK Cities ── */}
        {otherCities.length > 0 && (
          <section className="py-12 sm:py-16 bg-brand-slate">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl sm:text-2xl font-extrabold text-brand-navy mb-6 text-center" style={{ fontWeight: 800 }}>
                Find {trade.plural} in Other UK Cities
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {otherCities.map((city) => (
                  <Link
                    key={city.name}
                    href={`/find-tradespeople/${params.trade}/${toSlug(city.name)}`}
                    className="bg-white rounded-xl p-3 text-sm font-semibold text-brand-navy hover:shadow-md hover:bg-brand-navy hover:text-white transition-all text-center border border-gray-100 hover:border-brand-navy"
                  >
                    {city.name}
                    <span className="block text-xs font-normal opacity-60 mt-0.5">
                      {city.region}
                    </span>
                  </Link>
                ))}
              </div>
              <div className="mt-10 text-center">
                <GetQuotesButton />
                <p className="text-sm text-slate-500 mt-3">
                  Free · No obligation · 2-minute job post
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ── Related Trades ── */}
        {relatedTrades.length > 0 && (
          <section className="py-12 sm:py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl sm:text-2xl font-extrabold text-brand-navy mb-6 text-center" style={{ fontWeight: 800 }}>
                Related Trades in {locationName}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedTrades.map((rt) => (
                  <Link
                    key={rt.slug}
                    href={`/find-tradespeople/${rt.slug}/${params.location}`}
                    className="bg-brand-slate rounded-xl p-5 border border-gray-100 hover:border-brand-navy hover:shadow-md transition-all group"
                  >
                    <h3 className="font-extrabold text-brand-navy mb-1 group-hover:underline" style={{ fontWeight: 800 }}>
                      {rt.plural} in {locationName}
                    </h3>
                    <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                      {rt.description}
                    </p>
                    <span className="text-brand-navy text-sm font-semibold inline-flex items-center gap-1">
                      View {rt.plural} <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                ))}
              </div>
              <div className="mt-10 text-center">
                <GetQuotesButton />
                <p className="text-sm text-slate-500 mt-3">
                  Free · No obligation · 2-minute job post
                </p>
              </div>
            </div>
          </section>
        )}

      </div>
    </>
  );
}
