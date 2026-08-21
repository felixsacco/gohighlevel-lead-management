/**
 * Programmatic Trade Directory Page
 * Route: /find-tradespeople/[trade]
 * e.g.  /find-tradespeople/plumber, /find-tradespeople/roofer
 *
 * Server Component — no "use client".
 * Pre-renders priority-1 & priority-2 trades at build time via generateStaticParams.
 * Invalid trade slugs trigger notFound() — zero soft-404s.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TRADES, LOCATIONS } from "@/lib/seo-data";
import { TRADE_PRICING } from "@/lib/seoMetadataRouter";
import ProgrammaticSchema from "@/components/ProgrammaticSchema";
import AEOContentBlock from "@/components/AEOContentBlock";
import TrustEngineSection from "@/components/TrustEngineSection";
import HeroSearchTrigger from "@/components/HeroSearchTrigger";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  MapPin,
  Shield,
  Star,
  BadgeCheck,
  FileText,
  MessageSquare,
  Search,
  ThumbsUp,
  ChevronRight,
} from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────
function toSlug(str: string): string {
  return str.toLowerCase().replace(/[\s]+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// ── Static params — build top-priority trades at compile time ─────────────────
export async function generateStaticParams() {
  return TRADES.map((t) => ({ trade: t.slug }));
}

// ── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: { trade: string };
}): Promise<Metadata> {
  const trade = TRADES.find((t) => t.slug === params.trade);
  if (!trade) return { title: "Not Found | MyApproved", robots: { index: false } };

  return {
    title: `Identity-Checked ${trade.plural} Near You | Free Quotes UK | MyApproved`,
    description: `Find identity-checked ${trade.plural.toLowerCase()} across the UK. Compare local professionals, read customer reviews, and get free no-obligation quotes. All ID-checked and public liability insured.`,
    keywords: `${trade.plural.toLowerCase()} near me, identity-checked ${trade.plural.toLowerCase()} UK, find ${trade.name.toLowerCase()} quotes, local ${trade.name.toLowerCase()} free quotes`,
    alternates: { canonical: `https://myapproved.com/find-tradespeople/${params.trade}` },
    openGraph: {
      title: `Identity-Checked ${trade.plural} Near You | MyApproved UK`,
      description: `Compare identity-checked ${trade.plural.toLowerCase()} in your area. Free quotes, customer reviews, all tradespeople public liability insured.`,
      url: `https://myapproved.com/find-tradespeople/${params.trade}`,
      siteName: "MyApproved",
      locale: "en_GB",
      type: "website",
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `Verified ${trade.plural} Near You | MyApproved`,
      description: `Compare verified ${trade.plural.toLowerCase()} in your area. Free quotes, no obligation.`,
    },
  };
}

// ── Page component ────────────────────────────────────────────────────────────
export default function FindTradePage({ params }: { params: { trade: string } }) {
  const trade = TRADES.find((t) => t.slug === params.trade);
  if (!trade) notFound();

  const pricing = TRADE_PRICING[params.trade];

  // Related trades (same category, different slug)
  const relatedTrades = TRADES.filter(
    (t) => t.category === trade.category && t.slug !== trade.slug
  ).slice(0, 6);

  // Full UK city matrix — all 50 locations sorted by population for crawl coverage
  const ukCities = [...LOCATIONS].sort((a, b) => b.population - a.population);

  return (
    <>
      {/* ── 4-block JSON-LD structured data ── */}
      <ProgrammaticSchema
        tradeType={params.trade}
        city="United Kingdom"
        postalCode=""
        pageUrl={`https://myapproved.com/find-tradespeople/${params.trade}`}
      />

      <div className="min-h-screen bg-white">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <ol
              className="flex items-center gap-2 text-sm text-slate-600"
              itemScope
              itemType="https://schema.org/BreadcrumbList"
            >
              <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
                <Link href="/" className="hover:text-brand-navy" itemProp="item">
                  <span itemProp="name">Home</span>
                </Link>
                <meta itemProp="position" content="1" />
              </li>
              <li aria-hidden="true"><span className="text-gray-300">/</span></li>
              <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
                <Link href="/find-tradespeople" className="hover:text-brand-navy" itemProp="item">
                  <span itemProp="name">Find Tradespeople</span>
                </Link>
                <meta itemProp="position" content="2" />
              </li>
              <li aria-hidden="true"><span className="text-gray-300">/</span></li>
              <li
                className="text-brand-navy font-medium"
                itemScope
                itemType="https://schema.org/ListItem"
                itemProp="itemListElement"
              >
                <span itemProp="name">{trade.plural}</span>
                <meta itemProp="position" content="3" />
              </li>
            </ol>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative bg-gradient-to-b from-brand-navyDark to-brand-navy text-white overflow-hidden min-h-[100vh] flex items-center -mt-[var(--header-height)]">
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[160px] sm:pt-[176px] pb-24 md:pt-[224px] md:pb-40">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-[2rem] sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-[-0.02em] mb-12 sm:mb-16 px-2 sm:px-4" style={{fontWeight: 800}}>
                Find Verified {trade.plural} Near You
                <span className="block text-xl sm:text-2xl font-semibold text-brand-amber mt-2">
                  ID-Checked · Insured · Real Reviews
                </span>
              </h1>

              {pricing && (
                <p className="text-slate-300 text-base sm:text-lg mb-6">
                  Rates from{" "}
                  <strong className="text-white">
                    {pricing.low}–{pricing.high} {pricing.unit}
                  </strong>{" "}
                  · {pricing.typical}
                </p>
              )}

              <p className="text-lg text-slate-300 mb-8 max-w-3xl mx-auto">
                {trade.description}. Compare local {trade.plural.toLowerCase()} and get free
                no-obligation quotes on MyApproved.
              </p>

              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <span className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm font-medium">
                  <Shield className="w-4 h-4 text-green-400" /> ID Verified
                </span>
                <span className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm font-medium">
                  <CheckCircle className="w-4 h-4 text-brand-amber" /> £2M Insured
                </span>
                <span className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm font-medium">
                  <Clock className="w-4 h-4 text-blue-300" /> Quotes in Hours
                </span>
              </div>

              <HeroSearchTrigger />
              <div className="flex justify-center mt-4">
                <Link
                  href="/find-tradespeople"
                  className="text-sm text-slate-300 hover:text-white underline underline-offset-2 transition-colors"
                >
                  Browse all trades &amp; locations
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
                { value: "ID", label: "Identity Checked", sub: "before first lead" },
                { value: "£2M+", label: "Insurance Cover", sub: "independently confirmed" },
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

        {/* ── AEO Answer Block ── */}
        <AEOContentBlock
          tradeType={params.trade}
          city="the UK"
        />

        {/* ── How to Hire ── */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-navy mb-2" style={{fontWeight: 800}}>
                How to Hire a Verified {trade.name}
              </h2>
              <p className="text-sm text-slate-600 max-w-xl mx-auto">
                Four steps free of charge. It takes less than 2 minutes.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: "01",
                  icon: FileText,
                  title: "Post your job",
                  desc: `Say what ${trade.name.toLowerCase()} work you need and where you are. Free, and it takes 2 minutes.`,
                  color: "bg-brand-slate text-brand-navy",
                },
                {
                  step: "02",
                  icon: MessageSquare,
                  title: "Receive verified quotes",
                  desc: `Up to 3 local ${trade.plural.toLowerCase()} send you fixed, written quotes. No verbal estimates.`,
                  color: "bg-brand-slate text-brand-navy",
                },
                {
                  step: "03",
                  icon: Search,
                  title: "Compare & choose",
                  desc: "Look over their profiles and itemised quotes. Message them directly. No obligation.",
                  color: "bg-brand-slate text-brand-navy",
                },
                {
                  step: "04",
                  icon: ThumbsUp,
                  title: "Hire with confidence",
                  desc: `Every ${trade.name.toLowerCase()} is ID-checked, and their public liability cover of at least £2M is confirmed and monitored.`,
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
                  <h3 className="font-extrabold text-brand-navy mb-2" style={{fontWeight: 800}}>{title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-brand-slate" aria-labelledby="services-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2
                id="services-heading"
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-navy mb-3" style={{fontWeight: 800}}
              >
                {trade.name} Services Covered
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Our verified {trade.plural.toLowerCase()} handle all of the following. Ask for a
                free quote and state exactly what the job involves.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {trade.services.map((service, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-4 text-center hover:shadow-sm transition-shadow border border-gray-100"
                >
                  <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-brand-navy">{service}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* UK-wide location matrix — crawl compass for bots + UX for users */}
        <section className="py-12 sm:py-16 bg-brand-slate" aria-labelledby="locations-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2
                id="locations-heading"
                className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-navy mb-3"
                style={{fontWeight: 800}}
              >
                Find {trade.plural} by Location
              </h2>
              <p className="text-slate-600">
                Browse verified {trade.plural.toLowerCase()} in cities and towns across the UK.
              </p>
            </div>

            {/* Full UK cities — all 50 locations */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {ukCities.map((city) => (
                <Link
                  key={city.name}
                  href={`/find-tradespeople/${params.trade}/${toSlug(city.name)}`}
                  className="bg-white rounded-xl p-3 text-sm font-semibold text-brand-navy hover:shadow-md hover:bg-brand-navy hover:text-white transition-all text-center"
                  title={`Find ${trade.plural} in ${city.name}`}
                >
                  {city.name}
                  <span className="block text-xs font-normal text-slate-600">{city.region}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Engine — competitive verification detail */}
        <TrustEngineSection
          tradeName={trade.name.toLowerCase()}
          tradePlural={trade.plural.toLowerCase()}
        />

        {/* ── FAQ Accordion ── */}
        <section className="py-12 sm:py-16 bg-white" data-speakable>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-brand-navy mb-8 text-center" style={{fontWeight: 800}}>
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="space-y-3">
              {[
                {
                  q: `How much does a ${trade.name.toLowerCase()} cost in the UK?`,
                  a: `${trade.plural} in the UK typically charge ${trade.hourlyRate} per hour. The cost depends on your region, the size of the job, and the materials used. Every MyApproved ${trade.name.toLowerCase()} gives you a fixed, written quote before work starts. No verbal estimates that climb once the job begins. Post your job free to compare up to 3 quotes from verified local professionals.`,
                },
                {
                  q: `Are all ${trade.plural.toLowerCase()} on MyApproved verified?`,
                  a: `Yes. Every ${trade.name.toLowerCase()} on MyApproved is identity-checked and their public liability insurance is confirmed and monitored. Where the law requires a trade registration (such as Gas Safe or a competent person scheme), that registration is checked against the official register before they can list.`,
                },
                {
                  q: `Is MyApproved free for homeowners?`,
                  a: `Yes. Free. Posting a job, receiving quotes, comparing ${trade.plural.toLowerCase()}, and reading customer reviews costs you nothing. MyApproved charges £4.99 per lead to the tradespeople, not to homeowners.`,
                },
                {
                  q: `How quickly will I receive quotes from ${trade.plural.toLowerCase()}?`,
                  a: `Most homeowners receive their first quote within a few hours of posting. For emergency ${trade.name.toLowerCase()} work, local professionals typically respond within 1–2 hours. All quotes come with no obligation. You decide who to hire.`,
                },
              ].map((faq, i) => (
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

        {/* Related trades */}
        {relatedTrades.length > 0 && (
          <section className="py-12 sm:py-16 bg-brand-slate" aria-labelledby="related-heading">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2
                id="related-heading"
                className="text-2xl sm:text-3xl font-extrabold text-brand-navy mb-8 text-center"
                style={{fontWeight: 800}}
              >
                Related Trades You Might Need
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedTrades.map((rt) => (
                  <Link
                    key={rt.slug}
                    href={`/find-tradespeople/${rt.slug}`}
                    className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <h3 className="font-extrabold text-brand-navy mb-1 group-hover:text-brand-navy" style={{fontWeight: 800}}>
                      {rt.plural}
                    </h3>
                    <p className="text-sm text-slate-600 mb-3">{rt.description.slice(0, 80)}…</p>
                    <span className="text-brand-navy text-sm font-semibold inline-flex items-center">
                      Find {rt.plural} <ArrowRight className="ml-1 w-4 h-4" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16 sm:py-20 bg-gradient-to-b from-brand-navyDark to-brand-navy text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Shield className="w-4 h-4 text-green-400" />
              Identity checked and public liability insurance confirmed and monitored
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4" style={{fontWeight: 800}}>
              Ready to Find a Verified {trade.name}?
            </h2>
            <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Post your job free and get up to 3 quotes from verified{" "}
              {trade.plural.toLowerCase()} near you. No obligation and no hidden fees.
            </p>
            <div className="mb-8">
              <HeroSearchTrigger />
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-300">
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
