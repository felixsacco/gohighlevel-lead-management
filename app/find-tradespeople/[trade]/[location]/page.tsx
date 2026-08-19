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
import TrustEngineSection from "@/components/TrustEngineSection";
import TradeLocationLiveResults from "@/components/TradeLocationLiveResults";
import HeroSearchTrigger from "@/components/HeroSearchTrigger";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Shield,
  Star,
  CheckCircle,
  ArrowRight,
  BadgeCheck,
  MapPin,
  Clock,
  FileText,
  Search,
  MessageSquare,
  ThumbsUp,
  ChevronRight,
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

// ── Trade-specific cost breakdowns ────────────────────────────────────────────
const TRADE_COSTS: Record<string, Array<{ label: string; range: string }>> = {
  plumber: [
    { label: "Leaking tap repair", range: "£80–£150" },
    { label: "Blocked drain / toilet", range: "£100–£250" },
    { label: "Burst pipe repair", range: "£150–£400" },
    { label: "Boiler service", range: "£80–£120" },
    { label: "New boiler installation", range: "£1,500–£4,000" },
    { label: "Bathroom installation", range: "£2,000–£6,000" },
  ],
  electrician: [
    { label: "Fault finding / diagnosis", range: "£80–£150" },
    { label: "New socket installation", range: "£80–£150" },
    { label: "Consumer unit upgrade", range: "£400–£700" },
    { label: "EV charger installation", range: "£600–£900" },
    { label: "Full rewire (3-bed house)", range: "£3,000–£5,000" },
    { label: "EICR electrical report", range: "£150–£300" },
  ],
  "gas-engineer": [
    { label: "Boiler service", range: "£80–£120" },
    { label: "Boiler repair", range: "£150–£500" },
    { label: "Gas safety certificate (CP12)", range: "£60–£90" },
    { label: "New boiler installation", range: "£1,500–£4,000" },
    { label: "Radiator replacement", range: "£150–£350" },
    { label: "Gas leak detection / repair", range: "£100–£300" },
  ],
  "heating-engineer": [
    { label: "Boiler service", range: "£80–£120" },
    { label: "Central heating system flush", range: "£300–£600" },
    { label: "Radiator installation", range: "£150–£350" },
    { label: "New boiler installation", range: "£1,500–£4,000" },
    { label: "Underfloor heating", range: "£800–£2,500" },
    { label: "Heat pump installation", range: "£7,000–£15,000" },
  ],
  roofer: [
    { label: "Roof inspection", range: "£75–£150" },
    { label: "Tile replacement (per tile)", range: "£15–£40" },
    { label: "Ridge tile repointing", range: "£200–£500" },
    { label: "Flat roof repair", range: "£300–£700" },
    { label: "Full roof replacement (semi)", range: "£5,000–£8,000" },
    { label: "Guttering replacement", range: "£400–£900" },
  ],
  builder: [
    { label: "Single-storey extension (per m²)", range: "£1,500–£2,500" },
    { label: "Loft conversion", range: "£20,000–£55,000" },
    { label: "Garden wall rebuild", range: "£800–£2,000" },
    { label: "Structural repairs", range: "£500–£3,000" },
    { label: "Brickwork repointing", range: "£500–£1,500" },
    { label: "New driveway (standard)", range: "£2,000–£5,000" },
  ],
  carpenter: [
    { label: "Door hanging", range: "£100–£250" },
    { label: "Skirting board fitting", range: "£150–£400" },
    { label: "Fitted wardrobe", range: "£500–£1,500" },
    { label: "Staircase refurbishment", range: "£800–£2,500" },
    { label: "Decking installation", range: "£1,200–£3,500" },
    { label: "Loft hatch with ladder", range: "£300–£600" },
  ],
  "painter-decorator": [
    { label: "Room repaint (average)", range: "£250–£500" },
    { label: "Full house interior", range: "£1,500–£4,000" },
    { label: "Exterior repaint (semi)", range: "£800–£2,500" },
    { label: "Wallpaper hanging (per room)", range: "£200–£500" },
    { label: "Coving installation", range: "£300–£600" },
    { label: "Kitchen cabinet painting", range: "£400–£1,000" },
  ],
  plasterer: [
    { label: "Room skim (average)", range: "£350–£600" },
    { label: "Ceiling plaster repair", range: "£150–£350" },
    { label: "Full house replaster", range: "£2,500–£6,000" },
    { label: "Coving fitting (per metre)", range: "£15–£30" },
    { label: "Pebbledash removal", range: "£600–£2,000" },
    { label: "External render (per m²)", range: "£35–£70" },
  ],
  tiler: [
    { label: "Bathroom tiling (per m²)", range: "£30–£60" },
    { label: "Kitchen splashback", range: "£150–£400" },
    { label: "Full bathroom tiling", range: "£600–£1,800" },
    { label: "Floor tiling (per m²)", range: "£25–£50" },
    { label: "Grout repointing", range: "£100–£300" },
    { label: "Wet room installation", range: "£1,500–£4,000" },
  ],
  locksmith: [
    { label: "Lock-out / emergency entry", range: "£75–£150" },
    { label: "Lock change (per lock)", range: "£80–£200" },
    { label: "Deadlock installation", range: "£100–£200" },
    { label: "uPVC door lock repair", range: "£80–£200" },
    { label: "Safe opening", range: "£150–£400" },
    { label: "CCTV installation (basic kit)", range: "£300–£800" },
  ],
  landscaper: [
    { label: "Garden clearance (per day)", range: "£200–£400" },
    { label: "Lawn installation (per m²)", range: "£10–£25" },
    { label: "Patio installation (per m²)", range: "£60–£120" },
    { label: "Fencing (per panel)", range: "£80–£200" },
    { label: "Tree removal (small)", range: "£200–£600" },
    { label: "Full garden redesign", range: "£2,000–£10,000" },
  ],
  cleaner: [
    { label: "Regular clean (per hour)", range: "£12–£20" },
    { label: "End-of-tenancy clean", range: "£150–£350" },
    { label: "One-off deep clean", range: "£100–£300" },
    { label: "After-builders clean", range: "£200–£500" },
    { label: "Carpet cleaning (per room)", range: "£40–£80" },
    { label: "Oven cleaning", range: "£50–£80" },
  ],
  handyman: [
    { label: "First hour (call-out)", range: "£60–£100" },
    { label: "Half-day booking (4 hrs)", range: "£200–£350" },
    { label: "Full-day booking (8 hrs)", range: "£300–£600" },
    { label: "TV wall mounting", range: "£60–£120" },
    { label: "Flat-pack assembly", range: "£40–£100" },
    { label: "Minor repairs & fixes", range: "£60–£150" },
  ],
};

function getServiceCosts(tradeSlug: string, hourlyRate: string) {
  return (
    TRADE_COSTS[tradeSlug] ?? [
      { label: "Standard hourly rate", range: hourlyRate },
      { label: "Half-day booking (4 hrs)", range: "4 × hourly rate" },
      { label: "Full-day booking (8 hrs)", range: "8 × hourly rate" },
      { label: "Emergency / out-of-hours", range: "1.5× standard rate" },
      { label: "Written quote", range: "Free — required" },
      { label: "Call-out fee", range: "£0–£60" },
    ]
  );
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
    description: `Find ID-checked, £2M-insured ${trade.plural.toLowerCase()} in ${locationName}. Compare free quotes from verified local professionals. All independently verified — not self-declared.`,
    alternates: {
      canonical: `https://myapproved.com/find-tradespeople/${params.trade}/${params.location}`,
    },
    openGraph: {
      title: `Verified ${trade.plural} in ${locationName} | MyApproved`,
      description: `Compare verified ${trade.plural.toLowerCase()} in ${locationName}. Free quotes, real reviews, all insured to £2M.`,
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
  const serviceCosts = getServiceCosts(params.trade, trade.hourlyRate);

  const relatedTrades = TRADES.filter(
    (t) => t.category === trade.category && t.slug !== trade.slug
  ).slice(0, 4);

  const nearbyLocations = location
    ? LOCATIONS.filter(
        (l) => l.region === location.region && l.name !== location.name
      ).slice(0, 6)
    : [];

  const otherCities = LOCATIONS.filter(
    (l) => l.priority <= 2 && l.name !== locationName
  ).slice(0, 12);

  const faqs = [
    {
      q: `How much does a ${trade.name.toLowerCase()} cost in ${locationName}?`,
      a: `${trade.plural} in ${locationName} typically charge ${trade.hourlyRate} per hour. Every MyApproved ${trade.name.toLowerCase()} provides a fixed, written quote before work begins — no verbal estimates that change mid-job. Post your job free to get up to 3 comparable quotes from verified local professionals.`,
    },
    {
      q: `Are ${trade.plural.toLowerCase()} on MyApproved in ${locationName} insured?`,
      a: `Yes. Every ${trade.name.toLowerCase()} on MyApproved carries a minimum of £2M public liability insurance, independently confirmed with their insurer — not self-declared. Certificates are verified at onboarding and re-checked annually. Lapsed insurance triggers immediate suspension.`,
    },
    {
      q: `How does MyApproved verify ${trade.plural.toLowerCase()} in ${locationName}?`,
      a: `Every ${locationName} ${trade.name.toLowerCase()} passes 4 independent checks before receiving any leads: (1) government-issued ID verification, (2) £2M public liability insurance confirmed directly with the insurer, (3) regulated trade qualification check against the live official register (Gas Safe, NICEIC, FENSA, or relevant body where applicable), (4) customer references contacted independently. All checks renew annually.`,
    },
    {
      q: `How quickly can I get a ${trade.name.toLowerCase()} in ${locationName}?`,
      a: `Post your job free and most ${locationName} homeowners receive their first quote within a few hours. For emergency work, ${trade.plural.toLowerCase()} can typically respond within 1–2 hours. All quotes are obligation-free.`,
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
            description: `Find insured, ID-checked ${trade.plural.toLowerCase()} in ${locationName}. Compare verified profiles, read real customer reviews, and get free no-obligation quotes on MyApproved.`,
            url: `https://myapproved.com/find-tradespeople/${params.trade}/${params.location}`,
            image: "https://myapproved.com/logo-icon.svg",
            logo: {
              "@type": "ImageObject",
              url: "https://myapproved.com/logo-icon.svg",
              width: 512,
              height: 512,
            },
            priceRange: trade.hourlyRate ? `${trade.hourlyRate}/hr` : "££/hr",
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
            description: `Step-by-step guide to finding and hiring a verified, insured ${trade.name.toLowerCase()} in ${locationName} through MyApproved.`,
            step: [
              {
                "@type": "HowToStep",
                position: 1,
                name: "Post your job",
                text: `Describe the ${trade.name.toLowerCase()} work you need in ${locationName}. Takes under 2 minutes. Completely free.`,
              },
              {
                "@type": "HowToStep",
                position: 2,
                name: "Receive verified quotes",
                text: `Up to 3 verified local ${trade.plural.toLowerCase()} send you fixed, written quotes. No verbal estimates.`,
              },
              {
                "@type": "HowToStep",
                position: 3,
                name: "Compare profiles and choose",
                text: "Review each professional's verified credentials, customer ratings, and quote. Message them directly — no obligation.",
              },
              {
                "@type": "HowToStep",
                position: 4,
                name: "Hire with confidence",
                text: `Every ${trade.name.toLowerCase()} is government ID-checked and their public liability cover of at least £2M is confirmed and monitored.`,
              },
            ],
          }),
        }}
      />

      <div className="min-h-screen bg-gray-50">

        {/* ── Breadcrumb ── */}
        <nav aria-label="Breadcrumb" className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <ol
              className="flex items-center gap-2 text-sm text-gray-500 flex-wrap"
              itemScope
              itemType="https://schema.org/BreadcrumbList"
            >
              <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
                <Link href="/" className="hover:text-[#002FA7] transition-colors" itemProp="item">
                  <span itemProp="name">Home</span>
                </Link>
                <meta itemProp="position" content="1" />
              </li>
              <li aria-hidden="true"><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
              <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
                <Link href="/find-tradespeople" className="hover:text-[#002FA7] transition-colors" itemProp="item">
                  <span itemProp="name">Find Tradespeople</span>
                </Link>
                <meta itemProp="position" content="2" />
              </li>
              <li aria-hidden="true"><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
              <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
                <Link href={`/find-tradespeople/${params.trade}`} className="hover:text-[#002FA7] transition-colors" itemProp="item">
                  <span itemProp="name">{trade.plural}</span>
                </Link>
                <meta itemProp="position" content="3" />
              </li>
              <li aria-hidden="true"><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></li>
              <li
                className="text-[#002FA7] font-semibold"
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
        <section className="bg-gradient-to-br from-[#002FA7] via-[#0038c7] to-[#001f7a] text-white pb-14 sm:pb-20 pt-4 sm:pt-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <MapPin className="w-4 h-4 text-[#fdbd18]" />
                {locationName} · {location?.region ?? "United Kingdom"}
              </div>

              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4"
                data-speakable
              >
                Verified {trade.plural} in {locationName}
                <span className="block text-xl sm:text-2xl font-semibold text-[#fdbd18] mt-3">
                  ID-Checked · £2M Insured · Real Reviews
                </span>
              </h1>

              <p className="text-base sm:text-lg text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                Every {trade.name.toLowerCase()} on MyApproved is identity-checked and
                insurance-confirmed before receiving a single lead in {locationName}.
                Compare free quotes from professionals whose checks are confirmed on
                their public profile — not self-declared.
              </p>

              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
                {[
                  { icon: BadgeCheck, label: "Government ID Verified", color: "text-green-400" },
                  { icon: Shield, label: "£2M Insurance Confirmed", color: "text-[#fdbd18]" },
                  { icon: CheckCircle, label: "Trade Registry Checked", color: "text-green-400" },
                  { icon: Clock, label: "Quotes Within Hours", color: "text-blue-300" },
                ].map(({ icon: Icon, label, color }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 sm:px-4 py-2 rounded-full text-sm font-medium"
                  >
                    <Icon className={`w-4 h-4 ${color}`} />
                    {label}
                  </span>
                ))}
              </div>

              <HeroSearchTrigger />
              <div className="flex justify-center mt-4">
                <Link
                  href={`/find-tradespeople/${params.trade}`}
                  className="text-sm text-blue-200 hover:text-white underline underline-offset-2 transition-colors"
                >
                  Browse all {trade.plural} across the UK
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats bar ── */}
        <div className="bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
              {[
                { value: "ID", label: "Identity Checked", sub: "against official records" },
                { value: "£2M+", label: "Insurance Confirmed", sub: "and monitored" },
                { value: "£2M+", label: "Insurance Cover", sub: "independently confirmed" },
                { value: "Free", label: "For Homeowners", sub: "no fees, ever" },
              ].map(({ value, label, sub }) => (
                <div key={label} className="py-4 sm:py-5 px-4 sm:px-6 text-center">
                  <div className="text-xl sm:text-2xl font-extrabold text-[#002FA7]">{value}</div>
                  <div className="text-xs sm:text-sm font-semibold text-gray-800 mt-0.5">{label}</div>
                  <div className="text-xs text-gray-400 hidden sm:block mt-0.5">{sub}</div>
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

        {/* ── AEO Answer Block ── */}
        <AEOContentBlock
          tradeType={params.trade}
          city={locationName}
          className="rounded-none border-x-0"
        />

        {/* ── How to Hire ── */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002FA7] mb-2">
                How to Hire a Verified {trade.name} in {locationName}
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base">
                Four steps, completely free, takes under 2 minutes.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: "01",
                  icon: FileText,
                  title: "Post your job",
                  desc: `Describe the ${trade.name.toLowerCase()} work you need in ${locationName}. Set your budget and timeline. Free — takes 2 minutes.`,
                  color: "bg-blue-50 text-[#002FA7]",
                },
                {
                  step: "02",
                  icon: MessageSquare,
                  title: "Receive verified quotes",
                  desc: `Up to 3 local ${trade.plural.toLowerCase()} respond with fixed, written quotes. No verbal estimates that change mid-job.`,
                  color: "bg-yellow-50 text-yellow-700",
                },
                {
                  step: "03",
                  icon: Search,
                  title: "Compare & choose",
                  desc: "Review verified profiles, real customer ratings, and itemised quotes. Message professionals directly — no obligation.",
                  color: "bg-green-50 text-green-700",
                },
                {
                  step: "04",
                  icon: ThumbsUp,
                  title: "Hire with confidence",
                  desc: `Every ${trade.name.toLowerCase()} is government ID-checked and their public liability cover of at least £2M is confirmed and monitored before listing.`,
                  color: "bg-purple-50 text-purple-700",
                },
              ].map(({ step, icon: Icon, title, desc, color }) => (
                <div key={step} className="relative">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="absolute top-0 right-0 text-5xl font-extrabold text-gray-100 leading-none select-none">
                    {step}
                  </div>
                  <h3 className="font-extrabold text-[#002FA7] mb-2">{title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <HeroSearchTrigger />
              <p className="text-xs text-gray-400 mt-3 text-center">
                Takes 2 minutes · Completely free · No obligation
              </p>
            </div>
          </div>
        </section>

        {/* ── Services ── */}
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#002FA7] mb-2 text-center">
              {trade.name} Services in {locationName}
            </h2>
            <p className="text-sm text-gray-500 text-center mb-8 max-w-xl mx-auto">
              Post any of the following and receive free quotes from verified {locationName}{" "}
              {trade.plural.toLowerCase()}.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {trade.services.map((service, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-4 text-center border border-blue-50 hover:border-blue-200 hover:shadow-sm transition-all"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[#002FA7] leading-snug">
                    {service}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing + Areas ── */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-10 items-start">

              {/* Pricing table */}
              <div className="bg-gray-50 rounded-2xl border border-blue-100 p-6 sm:p-8">
                <h2 className="text-lg sm:text-xl font-extrabold text-[#002FA7] mb-1">
                  {trade.name} Costs in {locationName}
                </h2>
                <p className="text-xs text-gray-500 mb-5">
                  Typical {new Date().getFullYear()}–{new Date().getFullYear() + 1} rates. Exact costs vary — get 3 free written quotes to compare.
                </p>
                <div className="divide-y divide-blue-50">
                  {serviceCosts.map((row) => (
                    <div
                      key={row.label}
                      className="flex justify-between items-center py-3 gap-4"
                    >
                      <span className="text-gray-700 text-sm">{row.label}</span>
                      <span className="font-bold text-[#002FA7] text-sm whitespace-nowrap">
                        {row.range}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-3 gap-4">
                    <span className="text-gray-700 text-sm">Written quote</span>
                    <span className="font-bold text-green-600 text-sm">Free — required</span>
                  </div>
                </div>
                <div className="mt-5 bg-[#fdbd18]/10 border border-[#fdbd18]/30 rounded-lg p-3">
                  <p className="text-xs text-yellow-800 font-medium">
                    All MyApproved {trade.plural.toLowerCase()} provide a fixed, itemised written
                    quote before work starts — no verbal estimates that increase mid-job.
                  </p>
                </div>
              </div>

              {/* Coverage area */}
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#002FA7] mb-4">
                  {trade.plural} Covering {locationName} &amp; Nearby Areas
                </h2>

                {location?.postcodes && location.postcodes.length > 0 && (
                  <>
                    <p className="text-sm font-semibold text-gray-600 mb-3">
                      Postcode districts served:
                    </p>
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      {location.postcodes.map((pc) => (
                        <div
                          key={pc}
                          className="flex items-center gap-1.5 bg-blue-50 rounded-lg px-3 py-2.5 border border-blue-100"
                        >
                          <MapPin className="w-3 h-3 text-[#fdbd18] flex-shrink-0" />
                          <span className="text-sm font-bold text-[#002FA7]">{pc}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {nearbyLocations.length > 0 && (
                  <>
                    <p className="text-sm font-semibold text-gray-600 mb-3">
                      Also serving nearby towns:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {nearbyLocations.map((nearby) => (
                        <Link
                          key={nearby.name}
                          href={`/find-tradespeople/${params.trade}/${toSlug(nearby.name)}`}
                          className="inline-flex items-center gap-1.5 bg-white border border-blue-100 hover:border-[#002FA7] hover:bg-blue-50 px-3 py-2 rounded-full text-sm text-[#002FA7] font-semibold transition-all"
                        >
                          {trade.plural} in {nearby.name}
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      ))}
                    </div>
                  </>
                )}

                <div className="mt-8 bg-gradient-to-br from-[#002FA7] to-[#001f7a] rounded-xl p-5 text-white">
                  <h3 className="font-extrabold mb-1 text-base">
                    Need a {trade.name} in {locationName} today?
                  </h3>
                  <p className="text-blue-100 text-sm mb-4">
                    Post your job free and receive up to 3 quotes from verified local{" "}
                    {trade.plural.toLowerCase()}. No obligation — compare and hire at your own pace.
                  </p>
                  <HeroSearchTrigger />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust Engine ── */}
        <TrustEngineSection
          tradeName={trade.name.toLowerCase()}
          tradePlural={trade.plural.toLowerCase()}
        />

        {/* ── FAQ Accordion ── */}
        <section className="py-12 sm:py-16 bg-white" data-speakable>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#002FA7] mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="bg-gray-50 rounded-xl border border-blue-100 px-5 data-[state=open]:bg-blue-50 data-[state=open]:border-blue-200 transition-colors"
                >
                  <AccordionTrigger className="text-left font-bold text-[#002FA7] py-4 hover:no-underline text-sm sm:text-base">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-sm leading-relaxed pb-4">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ── Other UK Cities ── */}
        {otherCities.length > 0 && (
          <section className="py-12 sm:py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#002FA7] mb-6 text-center">
                Find {trade.plural} in Other UK Cities
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {otherCities.map((city) => (
                  <Link
                    key={city.name}
                    href={`/find-tradespeople/${params.trade}/${toSlug(city.name)}`}
                    className="bg-white rounded-xl p-3 text-sm font-semibold text-[#002FA7] hover:shadow-md hover:bg-[#002FA7] hover:text-white transition-all text-center border border-blue-50 hover:border-[#002FA7]"
                  >
                    {city.name}
                    <span className="block text-xs font-normal opacity-60 mt-0.5">
                      {city.region}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Related Trades ── */}
        {relatedTrades.length > 0 && (
          <section className="py-12 sm:py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#002FA7] mb-6 text-center">
                Related Trades in {locationName}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedTrades.map((rt) => (
                  <Link
                    key={rt.slug}
                    href={`/find-tradespeople/${rt.slug}/${params.location}`}
                    className="bg-gray-50 rounded-xl p-5 border border-blue-50 hover:border-blue-200 hover:shadow-md transition-all group"
                  >
                    <h3 className="font-extrabold text-[#002FA7] mb-1 group-hover:underline">
                      {rt.plural} in {locationName}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                      {rt.description}
                    </p>
                    <span className="text-[#002FA7] text-sm font-semibold inline-flex items-center gap-1">
                      View {rt.plural} <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Final CTA ── */}
        <section className="py-16 sm:py-20 bg-gradient-to-br from-[#002FA7] to-[#001f7a] text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <BadgeCheck className="w-4 h-4 text-green-400" />
              Vetted local {trade.plural.toLowerCase()} in {locationName}
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">
              Ready to Find a Verified {trade.name} in {locationName}?
            </h2>
            <p className="text-base sm:text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Post your job free. Quotes from verified {trade.plural.toLowerCase()} in{" "}
              {locationName} — no obligation, no hidden fees, no waiting on hold.
            </p>

            <div className="mb-8">
              <HeroSearchTrigger />
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-400" /> Free to post
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-400" /> No obligation
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-400" /> Quotes within hours
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-400" /> All trades verified
              </span>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
