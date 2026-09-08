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
  TRADE_PRICING,
  generateTradeLocationSchema,
  resolveLocation,
  ALL_NEIGHBORHOOD_SLUGS,
  NEIGHBORHOODS,
  toSlug,
} from "@/lib/seo-data";
import { graphify } from "@/components/SchemaMarkup";
import AEOContentBlock from "@/components/AEOContentBlock";
import TradeLocationLiveResults from "@/components/TradeLocationLiveResults";
import HeroSearchTrigger from "@/components/HeroSearchTrigger";
import GetQuotesButton from "@/components/GetQuotesButton";
import ServiceTile from "@/components/ServiceTile";
import PostcodeChip from "@/components/PostcodeChip";
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
  Bath,
  BatteryCharging,
  Bird,
  Boxes,
  Bug,
  Building2,
  CalendarCheck,
  Cctv,
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

  const allLocationSlugs = [
    ...LOCATIONS.map((l) => toSlug(l.name)),
    ...ALL_NEIGHBORHOOD_SLUGS,
  ];

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
  const location = resolveLocation(params.location);

  if (!trade || !location)
    return { title: "Not Found | MyApproved", robots: { index: false } };

  const locationName = location.name;

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
      images: [
        {
          url: `https://myapproved.com/og/${params.trade}/${params.location}`,
          width: 1200,
          height: 630,
          alt: `Verified ${trade.plural} in ${locationName} | MyApproved`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Verified ${trade.plural} in ${locationName} | MyApproved`,
      description: `Compare verified ${trade.plural.toLowerCase()} in ${locationName}. Free quotes, no obligation.`,
      images: [`https://myapproved.com/og/${params.trade}/${params.location}`],
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function FindTradeLocationPage({
  params,
}: {
  params: { trade: string; location: string };
}) {
  const trade = TRADES.find((t) => t.slug === params.trade);
  if (!trade) notFound();

  const location = resolveLocation(params.location);
  if (!location) notFound();
  const locationName = location.name;

  // F4 deep-crawl matrix. On a city page the coverage section becomes the
  // internal anchor into its child-neighbourhood pages: each postcode-district
  // chip that maps to a neighbourhood in `NEIGHBORHOODS[this city]` renders as a
  // link to that child page (first match wins for districts shared by more than
  // one neighbourhood), while districts without a mapping keep opening the quote
  // modal. Neighbourhood pages never map their own district chip (that would
  // self-link); instead they list sibling neighbourhoods under the same parent
  // so crawlers can keep moving and never dead-end on a leaf page.
  const isNeighbourhood = location.kind === "neighbourhood";
  const childNeighbourhoods = isNeighbourhood
    ? []
    : (NEIGHBORHOODS[params.location] ?? []);
  const siblingNeighbourhoods = isNeighbourhood
    ? (NEIGHBORHOODS[toSlug(location.parent)] ?? []).filter(
        (nb) => toSlug(nb.name) !== params.location
      )
    : [];
  const areaLinks = (isNeighbourhood ? siblingNeighbourhoods : childNeighbourhoods).map(
    (nb) => ({ name: nb.name, slug: toSlug(nb.name) })
  );
  const areaLinksHeading = isNeighbourhood
    ? `More ${trade.plural.toLowerCase()} areas near ${locationName}`
    : `${trade.plural} covering ${locationName} neighbourhoods`;
  const postcodeToChildHref = new Map<string, string>();
  for (const nb of childNeighbourhoods) {
    if (!postcodeToChildHref.has(nb.postalDistrict)) {
      postcodeToChildHref.set(
        nb.postalDistrict,
        `/find-tradespeople/${params.trade}/${toSlug(nb.name)}`
      );
    }
  }

  // Pricing copy derives from the single pricing dataset (TRADE_PRICING).
  // Hourly trades quote a rate per hour; fixed/lump-sum trades are quoted as
  // one whole-project price, so never append a fabricated "per hour" to them.
  const pricing = TRADE_PRICING[params.trade];
  const costAnswer = pricing
    ? pricing.unit === "per hour"
      ? `Most ${trade.plural.toLowerCase()} in ${locationName} charge between ${pricing.low} and ${pricing.high} per hour, with a typical job coming to ${pricing.typical}. The final cost depends on your region, the size of the job, and the materials used. Every MyApproved ${trade.name.toLowerCase()} gives you a fixed, written quote before work starts, so there are no surprises on cost. Post your job free and verified local professionals will call you back with quotes.`
      : `Most ${trade.plural.toLowerCase()} in ${locationName} quote a fixed price for the whole job, with a typical project coming to ${pricing.typical}. The final cost depends on your region, the size of the job, and the materials used. Every MyApproved ${trade.name.toLowerCase()} gives you a fixed, written quote before work starts, so there are no surprises on cost. Post your job free and verified local professionals will call you back with quotes.`
    : `Every MyApproved ${trade.name.toLowerCase()} gives you a fixed, written quote before work starts, so there are no surprises on cost. Post your job free and verified local professionals will call you back with quotes.`;

  const relatedTrades = TRADES.filter(
    (t) => t.category === trade.category && t.slug !== trade.slug
  ).slice(0, 4);

  const nearbyLocations = location
    ? LOCATIONS.filter(
        (l) => l.region === location.region && l.name !== location.name
      ).slice(0, 12)
    : [];

  // Carousel rows for the "Services" band — split the trade's service list
  // into two even/odd rows (mirroring the homepage dual marquee). Each item
  // keeps its original index so getServiceIcon maps the right icon.
  const serviceItems = trade.services.map((service, i) => ({ service, i }));
  const serviceRow1 = serviceItems.filter((_, i) => i % 2 === 0);
  const serviceRow2 = serviceItems.filter((_, i) => i % 2 === 1);

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
      a: costAnswer,
    },
    {
      q: `Are ${trade.plural.toLowerCase()} on MyApproved in ${locationName} insured?`,
      a: `Yes. Every professional must hold public liability insurance that is confirmed real and in date before they're listed, and we keep monitoring that cover so the listing is withdrawn if it lapses.`,
    },
    {
      q: `How does MyApproved verify ${trade.plural.toLowerCase()} in ${locationName}?`,
      a: `Before listing, each professional passes an identity check against photo ID, a business check through Companies House, and an insurance check. And that cover is monitored after they're listed.`,
    },
    {
      q: `How quickly can I get a ${trade.name.toLowerCase()} in ${locationName}?`,
      a: `Most homeowners get their first quote within a few hours. For urgent work, professionals can often respond within 1 to 2 hours.`,
    },
  ];

  const serviceSchema = generateTradeLocationSchema(
    params.trade,
    params.location
  );
  const schema = graphify([
    ...(serviceSchema ? [serviceSchema] : []),
    {
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
      priceRange: pricing
        ? `${pricing.low}–${pricing.high} ${pricing.unit}`
        : "££",
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
      hasCredential: {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "Platform Verification",
        identifier: {
          "@type": "PropertyValue",
          name: "MyApproved tradesperson verification",
          value: "verified & insured",
        },
        description: `Every ${trade.name.toLowerCase()} listed on MyApproved in ${locationName} has passed identity, business and public liability insurance checks, which are confirmed and monitored by MyApproved.`,
        recognizedBy: {
          "@type": "Organization",
          "@id": "https://myapproved.com/#organization",
          name: "MyApproved",
          url: "https://myapproved.com",
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    },
    {
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
    },
    {
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
    },
  ]);

  return (
    <>
      {/* ── Structured Data ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
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
                Compare verified, insured {trade.plural.toLowerCase()} in {locationName} and get free, no-obligation quotes.
              </p>

              <HeroSearchTrigger suggestions={trade.services} />

              {/* Trust indicators — flat register entries, separated by a hairline */}
              <HeroTrustBadges />
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

        {/* ── Services ── */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-navy mb-4 sm:mb-6 px-4" style={{ fontWeight: 800 }}>
                {trade.name} Services in {locationName}
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-brand-navy/80 max-w-3xl mx-auto font-semibold px-4">
                Post any of these jobs and receive free quotes from verified local pros.
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4 overflow-hidden">
              {/* Row 1 - scrolls left */}
              <div className="relative">
                <div className="flex gap-3 sm:gap-4 animate-scroll hover:pause-animation">
                  {serviceRow1.map(({ service, i }, idx) => {
                    const { Icon } = getServiceIcon(trade.slug, i);
                    return (
                      <ServiceTile key={`services-row1-${idx}`}>
                        <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5">
                          <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-brand-amber flex-shrink-0" strokeWidth={1.5} />
                          <p className="text-sm sm:text-base font-extrabold text-brand-navy leading-snug" style={{ fontWeight: 700 }}>
                            {service}
                          </p>
                        </div>
                      </ServiceTile>
                    );
                  })}
                  {serviceRow1.map(({ service, i }, idx) => {
                    const { Icon } = getServiceIcon(trade.slug, i);
                    return (
                      <ServiceTile key={`services-row1-dup-${idx}`} hidden>
                        <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5">
                          <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-brand-amber flex-shrink-0" strokeWidth={1.5} />
                          <p className="text-sm sm:text-base font-extrabold text-brand-navy leading-snug" style={{ fontWeight: 700 }}>
                            {service}
                          </p>
                        </div>
                      </ServiceTile>
                    );
                  })}
                </div>
              </div>
              {/* Row 2 - scrolls in sync */}
              <div className="relative">
                <div className="flex gap-3 sm:gap-4 animate-scroll hover:pause-animation">
                  {serviceRow2.map(({ service, i }, idx) => {
                    const { Icon } = getServiceIcon(trade.slug, i);
                    return (
                      <ServiceTile key={`services-row2-${idx}`}>
                        <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5">
                          <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-brand-amber flex-shrink-0" strokeWidth={1.5} />
                          <p className="text-sm sm:text-base font-extrabold text-brand-navy leading-snug" style={{ fontWeight: 700 }}>
                            {service}
                          </p>
                        </div>
                      </ServiceTile>
                    );
                  })}
                  {serviceRow2.map(({ service, i }, idx) => {
                    const { Icon } = getServiceIcon(trade.slug, i);
                    return (
                      <ServiceTile key={`services-row2-dup-${idx}`} hidden>
                        <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5">
                          <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-brand-amber flex-shrink-0" strokeWidth={1.5} />
                          <p className="text-sm sm:text-base font-extrabold text-brand-navy leading-snug" style={{ fontWeight: 700 }}>
                            {service}
                          </p>
                        </div>
                      </ServiceTile>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="text-center mt-10 sm:mt-12 px-4">
              <GetQuotesButton variant="hero" />
              <p className="mt-3 text-sm sm:text-base text-brand-navy/70">Free, no obligation.</p>
            </div>
          </div>
        </section>

        {/* ── Why Homeowners Choose MyApproved (homepage styling) ── */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-[#F1F5F9]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-navy mb-4 sm:mb-6 px-4" style={{ fontWeight: 800 }}>
                Why Homeowners Choose MyApproved
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              {/* Benefit 1 */}
              <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6">
                <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-brand-navy mb-1 sm:mb-2" style={{ fontWeight: 700 }}>Vetted before they&apos;re listed</h3>
                <p className="text-sm sm:text-base text-gray-600">Only tradespeople who pass qualification, business and insurance checks make the cut.</p>
              </div>

              {/* Benefit 2 */}
              <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6">
                <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-brand-navy mb-1 sm:mb-2" style={{ fontWeight: 700 }}>A price range up front</h3>
                <p className="text-sm sm:text-base text-gray-600">See what the job should cost before you speak to anyone.</p>
              </div>

              {/* Benefit 3 */}
              <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6">
                <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-brand-navy mb-1 sm:mb-2" style={{ fontWeight: 700 }}>Booked into a real slot</h3>
                <p className="text-sm sm:text-base text-gray-600">Your job lands in their diary, in a time slot that works for you.</p>
              </div>

              {/* Benefit 4 */}
              <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6">
                <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-brand-navy mb-1 sm:mb-2" style={{ fontWeight: 700 }}>Free, no obligation</h3>
                <p className="text-sm sm:text-base text-gray-600">No sign-up fee, no quote fees. You only ever pay the tradesperson.</p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center mt-8 sm:mt-10 md:mt-12 px-4">
              <GetQuotesButton variant="hero" />
              <p className="mt-3 text-sm sm:text-base text-brand-navy/70">Checked, priced, booked.</p>
            </div>
          </div>
        </section>

        {/* ── Our Checks (homepage styling) ── */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-navy mb-4 sm:mb-6 px-4" style={{ fontWeight: 800 }}>
                Our Checks
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-brand-navy max-w-3xl mx-auto font-semibold px-4">
                Every tradesperson on MyApproved passes qualification, business and insurance checks before they can take on work.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {/* Check 1 */}
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-brand-navy mb-1 sm:mb-2 notranslate" style={{ fontWeight: 700 }}>Photo ID</h3>
                <p className="text-sm sm:text-base text-gray-700 font-medium notranslate">Photo ID checked against a live selfie.</p>
              </div>

              {/* Check 2 */}
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2v8h8V4H6zm2 2h4v1H8V6zm0 2h4v1H8V8zm0 2h4v1H8v-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-brand-navy mb-1 sm:mb-2 notranslate" style={{ fontWeight: 700 }}>Registered business</h3>
                <p className="text-sm sm:text-base text-gray-700 font-medium notranslate">Registered on Companies House.</p>
              </div>

              {/* Check 3 */}
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-brand-navy mb-1 sm:mb-2 notranslate" style={{ fontWeight: 700 }}>Insurance</h3>
                <p className="text-sm sm:text-base text-gray-700 font-medium notranslate">Public liability cover, verified and monitored.</p>
              </div>

              {/* Check 4 */}
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-brand-navy mb-1 sm:mb-2 notranslate" style={{ fontWeight: 700 }}>Qualifications</h3>
                <p className="text-sm sm:text-base text-gray-700 font-medium notranslate">Qualifications checked against certificate schemes.</p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center mt-8 sm:mt-10 md:mt-12 px-4">
              <GetQuotesButton variant="hero" />
              <p className="mt-3 text-sm sm:text-base text-brand-navy/70 notranslate">Only MyApproved tradespeople get your job.</p>
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
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-navy mb-8 text-center" style={{ fontWeight: 800 }}>
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

        {/* ── Places Results ──
             Server component. Renders the population + live-count stats band and
             real providers; hides the whole section only on a genuine empty area
             (query ran clean, nothing found) and shows an availability note when
             live listings could not be checked. */}
        <TradeLocationLiveResults
          tradeSlug={params.trade}
          tradeName={trade.name}
          tradePlural={trade.plural}
          locationSlug={params.location}
          locationName={locationName}
          population={location.population}
          areaLabel={
            location.kind === "neighbourhood" ? location.parent : location.name
          }
        />

        {/* ── AEO Answer Block ── */}
        <AEOContentBlock
          tradeType={params.trade}
          city={locationName}
          className="rounded-none border-x-0"
        />

        {/* ── Coverage Area ── */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div>

              {/* Coverage area */}
              <div className="text-center">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-navy mb-4" style={{ fontWeight: 800 }}>
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
                              <PostcodeChip key={pc} postcode={pc} href={postcodeToChildHref.get(pc)} />
                            ))}
                          </div>
                          <AccordionContent>
                            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-2 mx-auto">
                              {location.postcodes.slice(postcodesVisibleCount).map((pc) => (
                                <PostcodeChip key={pc} postcode={pc} href={postcodeToChildHref.get(pc)} />
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
                          <PostcodeChip key={pc} postcode={pc} href={postcodeToChildHref.get(pc)} />
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

                {areaLinks.length > 0 && (
                  <>
                    <p className="text-sm font-semibold text-slate-600 mb-3">
                      {areaLinksHeading}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2.5 mx-auto">
                      {areaLinks.map((area) => (
                        <Link
                          key={area.slug}
                          href={`/find-tradespeople/${params.trade}/${area.slug}`}
                          className="inline-flex items-center justify-center gap-1.5 bg-white border border-gray-100 hover:border-brand-navy hover:bg-gray-50 px-3.5 py-2 rounded-full text-sm text-brand-navy font-semibold transition-all whitespace-nowrap"
                        >
                          {trade.plural} in {area.name}
                          <ArrowRight className="w-3 h-3 flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
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

        {/* ── Other UK Cities ── */}
        {otherCities.length > 0 && (
          <section className="py-12 sm:py-16 bg-brand-slate">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-navy mb-6 text-center" style={{ fontWeight: 800 }}>
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
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-navy mb-6 text-center" style={{ fontWeight: 800 }}>
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
