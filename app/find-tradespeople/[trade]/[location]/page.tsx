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
// Pricing varies by job, region, and market conditions, so MyApproved does not
// publish fixed rate tables. Each verified professional issues a fixed, written
// quote before any work begins.
const getServiceCosts = (tradePlural: string) => [
  { label: "Written quote", range: "Always free, no obligation" },
  { label: "Cost of your job", range: `Compared from three written ${tradePlural.toLowerCase()} quotes` },
  { label: "Quote accuracy", range: "Fixed before work begins" },
  { label: "Hidden fees", range: "None — homeowners pay nothing" },
];

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
    description: `Find ID-checked, fully-insured ${trade.plural.toLowerCase()} in ${locationName}. Compare free quotes from verified local professionals. All checks confirmed on the public profile.`,
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
  const serviceCosts = getServiceCosts(trade.plural);

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
      a: `${trade.plural} in ${locationName} cost varies by job, region, and market conditions, so MyApproved does not publish fixed rate tables. Every ${trade.name.toLowerCase()} provides a fixed, written quote before work begins. No verbal estimates that change mid-job. Post your job free to get three comparable quotes from verified local professionals.`,
    },
    {
      q: `Are ${trade.plural.toLowerCase()} on MyApproved in ${locationName} insured?`,
      a: `Yes. Every ${trade.name.toLowerCase()} on MyApproved must hold public liability insurance that is confirmed as real and in date before listing. We monitor that cover throughout, so the listing is withdrawn if it lapses.`,
    },
    {
      q: `How does MyApproved verify ${trade.plural.toLowerCase()} in ${locationName}?`,
      a: `Every ${locationName} ${trade.name.toLowerCase()} passes four checks before they can appear: photo ID, registered business on Companies House, public liability insurance, and qualifications. We confirm the insurance is real and in date, and monitor it so the listing is withdrawn if it lapses.`,
    },
    {
      q: `How quickly can I get a ${trade.name.toLowerCase()} in ${locationName}?`,
      a: `Post your job free and most ${locationName} homeowners get their first quote within a few hours. For emergency work, ${trade.plural.toLowerCase()} can usually respond within 1–2 hours. All quotes are free with no obligation.`,
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
            description: `Find insured, ID-checked ${trade.plural.toLowerCase()} in ${locationName}. Compare verified profiles, read reviews from confirmed jobs, and get free quotes on MyApproved.`,
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
                name: "Receive verified quotes",
                text: `Three verified local ${trade.plural.toLowerCase()} send you fixed, written quotes.`,
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
                text: `Every ${trade.name.toLowerCase()} is ID-checked and their public liability insurance is confirmed real and in date, and monitored.`,
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
        <section className="bg-gradient-to-b from-brand-navyDark to-brand-navy text-white pb-14 sm:pb-20 pt-4 sm:pt-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <MapPin className="w-4 h-4 text-brand-amber" />
                {locationName} · {location?.region ?? "United Kingdom"}
              </div>

              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4"
                style={{ fontWeight: 800 }}
                data-speakable
              >
                Verified {trade.plural} in {locationName}
                <span className="block text-xl sm:text-2xl font-semibold text-brand-amber mt-3">
                  ID-Checked · Fully Insured · Verified Qualifications
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Every {trade.name.toLowerCase()} on MyApproved is identity-checked and
                insurance-confirmed before receiving a single lead in {locationName}.
                Compare free quotes from professionals whose checks are confirmed on
                their public profile, not self-declared.
              </p>

              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
                {[
                  { icon: BadgeCheck, label: "Government ID Verified", color: "text-[#16A34A]" },
                  { icon: Shield, label: "Insurance Confirmed & Monitored", color: "text-brand-amber" },
                  { icon: CheckCircle, label: "Qualifications Checked", color: "text-[#16A34A]" },
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
                  className="text-sm text-slate-300 hover:text-white underline underline-offset-2 transition-colors"
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
                { value: "4", label: "Checks Passed", sub: "before listing" },
                { value: "Insured", label: "Cover Confirmed", sub: "real, in date & monitored" },
                { value: "Free", label: "For Homeowners", sub: "no fees, ever" },
              ].map(({ value, label, sub }) => (
                <div key={label} className="py-4 sm:py-5 px-4 sm:px-6 text-center">
                  <div className="text-xl sm:text-2xl font-extrabold text-brand-navy">{value}</div>
                  <div className="text-xs sm:text-sm font-semibold text-brand-navy mt-0.5">{label}</div>
                  <div className="text-xs text-slate-600 hidden sm:block mt-0.5">{sub}</div>
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
              <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mb-2" style={{ fontWeight: 800 }}>
                How to Hire a Verified {trade.name} in {locationName}
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
                Four steps, free, and it takes under 2 minutes.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: "01",
                  icon: FileText,
                  title: "Post your job",
                  desc: `Describe the ${trade.name.toLowerCase()} work you need in ${locationName}. Set your budget and timeline. It is free and takes 2 minutes.`,
                  color: "bg-brand-slate text-brand-navy",
                },
                {
                  step: "02",
                  icon: MessageSquare,
                  title: "Receive verified quotes",
                  desc: `Three local ${trade.plural.toLowerCase()} respond with fixed, written quotes. No verbal estimates that change mid-job.`,
                  color: "bg-brand-slate text-brand-navy",
                },
                {
                  step: "03",
                  icon: Search,
                  title: "Compare & choose",
                  desc: "Review verified profiles, ratings from confirmed jobs, and itemised quotes. Message professionals directly, with no obligation.",
                  color: "bg-brand-slate text-brand-navy",
                },
                {
                  step: "04",
                  icon: ThumbsUp,
                  title: "Hire with confidence",
                  desc: `Every ${trade.name.toLowerCase()} is ID-checked and their public liability insurance is confirmed real and in date, and monitored before listing.`,
                  color: "bg-brand-slate text-brand-navy",
                },
              ].map(({ step, icon: Icon, title, desc, color }) => (
                <div key={step} className="relative">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="absolute top-0 right-0 text-5xl font-extrabold text-gray-100 leading-none select-none">
                    {step}
                  </div>
                  <h3 className="font-extrabold text-brand-navy mb-2">{title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <HeroSearchTrigger />
              <p className="text-xs text-slate-600 mt-3 text-center">
                Takes 2 minutes · Free · No obligation
              </p>
            </div>
          </div>
        </section>

        {/* ── Services ── */}
        <section className="py-12 sm:py-16 bg-brand-slate">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-brand-navy mb-2 text-center" style={{ fontWeight: 800 }}>
              {trade.name} Services in {locationName}
            </h2>
            <p className="text-sm text-slate-600 text-center mb-8 max-w-xl mx-auto">
              Post any of the following and receive free quotes from verified {locationName}{" "}
              {trade.plural.toLowerCase()}.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {trade.services.map((service, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-4 text-center border border-gray-100 hover:border-brand-navy hover:shadow-sm transition-all"
                >
                  <CheckCircle className="w-5 h-5 text-[#16A34A] mx-auto mb-2" />
                  <p className="text-sm font-semibold text-brand-navy leading-snug">
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
              <div className="bg-brand-slate rounded-xl border border-gray-100 p-6 sm:p-8">
                <h2 className="text-lg sm:text-xl font-extrabold text-brand-navy mb-1" style={{ fontWeight: 800 }}>
                  {trade.name} Costs in {locationName}
                </h2>
                <p className="text-xs text-slate-600 mb-5">
                  No fixed rate tables. Each verified professional issues a fixed, written quote before work begins.
                </p>
                <div className="divide-y divide-gray-100">
                  {serviceCosts.map((row) => (
                    <div
                      key={row.label}
                      className="flex justify-between items-center py-3 gap-4"
                    >
                      <span className="text-slate-600 text-sm">{row.label}</span>
                      <span className="font-bold text-brand-navy text-sm whitespace-nowrap">
                        {row.range}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 bg-brand-amber/10 border border-brand-amber/30 rounded-xl p-3">
                  <p className="text-xs text-brand-navy font-medium">
                    All MyApproved {trade.plural.toLowerCase()} provide a fixed, itemised written
                    quote before work starts. No verbal estimates that increase mid-job.
                  </p>
                </div>
              </div>

              {/* Coverage area */}
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-brand-navy mb-4" style={{ fontWeight: 800 }}>
                  {trade.plural} Covering {locationName} &amp; Nearby Areas
                </h2>

                {location?.postcodes && location.postcodes.length > 0 && (
                  <>
                    <p className="text-sm font-semibold text-slate-600 mb-3">
                      Postcode districts served:
                    </p>
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      {location.postcodes.map((pc) => (
                        <div
                          key={pc}
                          className="flex items-center gap-1.5 bg-brand-slate rounded-xl px-3 py-2.5 border border-gray-100"
                        >
                          <MapPin className="w-3 h-3 text-brand-amber flex-shrink-0" />
                          <span className="text-sm font-bold text-brand-navy">{pc}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {nearbyLocations.length > 0 && (
                  <>
                    <p className="text-sm font-semibold text-slate-600 mb-3">
                      Also serving nearby towns:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {nearbyLocations.map((nearby) => (
                        <Link
                          key={nearby.name}
                          href={`/find-tradespeople/${params.trade}/${toSlug(nearby.name)}`}
                          className="inline-flex items-center gap-1.5 bg-white border border-gray-100 hover:border-brand-navy hover:bg-gray-50 px-3 py-2 rounded-full text-sm text-brand-navy font-semibold transition-all"
                        >
                          {trade.plural} in {nearby.name}
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      ))}
                    </div>
                  </>
                )}

                <div className="mt-8 bg-gradient-to-b from-brand-navyDark to-brand-navy rounded-xl p-5 text-white">
                  <h3 className="font-extrabold mb-1 text-base">
                    Need a {trade.name} in {locationName} today?
                  </h3>
                  <p className="text-slate-300 text-sm mb-4">
                    Post your job free and receive three quotes from verified local{" "}
                    {trade.plural.toLowerCase()}. No obligation. Compare and hire at your own pace.
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
            <h2 className="text-xl sm:text-2xl font-extrabold text-brand-navy mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="bg-white rounded-xl border border-gray-100 px-5 data-[state=open]:bg-brand-slate data-[state=open]:border-gray-100 transition-colors"
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
                    <h3 className="font-extrabold text-brand-navy mb-1 group-hover:underline">
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
            </div>
          </section>
        )}

        {/* ── Final CTA ── */}
        <section className="py-16 sm:py-20 bg-gradient-to-b from-brand-navyDark to-brand-navy text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <BadgeCheck className="w-4 h-4 text-[#16A34A]" />
              Vetted local {trade.plural.toLowerCase()} in {locationName}
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4" style={{ fontWeight: 800 }}>
              Ready to Find a Verified {trade.name} in {locationName}?
            </h2>
            <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Post your job free. Get quotes from verified {trade.plural.toLowerCase()} in{" "}
              {locationName}. No obligation, no hidden fees, no waiting on hold.
            </p>

            <div className="mb-8">
              <HeroSearchTrigger />
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#16A34A]" /> Free to post
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#16A34A]" /> No obligation
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#16A34A]" /> Quotes within hours
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#16A34A]" /> All trades verified
              </span>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
