"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  CheckCircle,
  Shield,
  Zap,
  Clock,
  Star,
  Upload,
  MessageSquare,
  Users,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  ChevronDown,
  Droplets,
  Bolt,
  Hammer,
  Paintbrush,
  HomeIcon,
  Key,
  ShowerHead,
  Utensils,
  X as XIcon,
  Plus,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  Grid2X2,
  Square,
  AppWindow,
  Fence,
  Leaf,
  HardHat,
  ChefHat,
  Trash2,
  Car,
  TreePine,
  Flame,
  Bug,
  Camera,
  Construction,
  Waves,
  Wind,
  Thermometer,
  Sun,
  HousePlus,
  ArrowUpFromLine,
  Warehouse,
  VolumeX,
  ThermometerSnowflake,
  AlertTriangle,
  Siren,
  SprayCanIcon,
  ArrowUpDown,
  CircleDot,
  Mountain,
  Layers,
  SquareStack,
  PanelTop,
  CloudRain,
  Cloud,
  Building2,
  Satellite,
  Wifi,
  Cpu,
  BatteryCharging,
  Sofa,
  LayoutGrid,
  BrickWall,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { TrustBadge } from "@/components/TrustBadge";
import { ShieldCheck as ShieldCheckFill, SealCheck as SealCheckFill } from "@phosphor-icons/react";

const AIQuoteForm = dynamic(() => import("@/components/AIQuoteForm"), {
  ssr: false,
  loading: () => null,
});

// Typewriter hook for rotating placeholder
const useTypewriter = (words: string[], typingSpeed = 100, deletingSpeed = 50, pauseTime = 2000) => {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        setText(currentWord.substring(0, text.length + 1));
        if (text === currentWord) {
          setIsDeleting(true);
        }
      } else {
        // Deleting
        setText(currentWord.substring(0, text.length - 1));
        if (text === "") {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed);

    // Pause at end of word before deleting
    if (text === currentWord && !isDeleting) {
      const pauseTimeout = setTimeout(() => {
        setIsDeleting(true);
      }, pauseTime);
      return () => clearTimeout(pauseTimeout);
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseTime]);

  return text;
};

// Animated rotating text hook with fade transition
const useRotatingText = (words: string[], interval = 2600, paused = false) => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length);
        setVisible(true);
      }, 350);
    }, interval);
    return () => clearInterval(timer);
  }, [words, interval, paused]);

  return { word: words[index], visible };
};

// Trades Dual Row Carousel Component
const TradesCarousel = () => {
  const trades = [
    { name: 'Plumber', icon: Droplets, desc: 'Leaks, taps, bathrooms, boilers' },
    { name: 'Electrician', icon: Bolt, desc: 'Wiring, faults, installations' },
    { name: 'Roofer', icon: HomeIcon, desc: 'Repairs, tiles, guttering' },
    { name: 'Painter & Decorator', icon: Paintbrush, desc: 'Interior & exterior work' },
    { name: 'Carpenter', icon: Hammer, desc: 'Custom woodwork & repairs' },
    { name: 'Locksmith', icon: Key, desc: 'Emergency & installations' },
    { name: 'Gas Engineer', icon: Flame, desc: 'Boilers, servicing, repairs' },
    { name: 'Builder', icon: BrickWall, desc: 'Extensions, renovations, repairs' },
    { name: 'Tiler', icon: Grid3X3, desc: 'Floor & wall tiling' },
    { name: 'Gardener', icon: Leaf, desc: 'Garden maintenance & landscaping' },
    { name: 'Plasterer', icon: HardHat, desc: 'Plastering & rendering' },
    { name: 'Bathroom Fitter', icon: Droplets, desc: 'Bathroom installation' },
    { name: 'Kitchen Fitter', icon: ChefHat, desc: 'Kitchen installation' },
    { name: 'Flooring', icon: Grid2X2, desc: 'Hardwood, laminate & carpet' },
    { name: 'Window Fitter', icon: Square, desc: 'Windows & doors' },
    { name: 'Waste Removal', icon: Trash2, desc: 'Rubbish clearance' },
  ];

  // Split into 2 rows
  const row1 = trades.filter((_, i) => i % 2 === 0);
  const row2 = trades.filter((_, i) => i % 2 === 1);

  const TradeCard = ({ trade, ariaHidden }: { trade: typeof trades[0]; ariaHidden?: boolean }) => {
    const Icon = trade.icon;
    return (
      <Link
        href={`/find-tradespeople?trade=${trade.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
        className="group flex-shrink-0 w-[260px] sm:w-[280px] md:w-[300px] bg-sky-50 rounded-xl hover:shadow-lg transition-shadow duration-200"
        aria-hidden={ariaHidden}
        tabIndex={ariaHidden ? -1 : undefined}
      >
        <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5">
          <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-900 flex-shrink-0" strokeWidth={1.5} />
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900" style={{fontWeight: 500}}>{trade.name}</h3>
            <p className="text-xs sm:text-sm text-gray-600">{trade.desc}</p>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="space-y-3 sm:space-y-4 overflow-hidden">
      {/* Row 1 - scrolls left */}
      <div className="relative">
        <div className="flex gap-3 sm:gap-4 animate-scroll hover:pause-animation">
          {row1.map((trade, idx) => (
            <TradeCard key={`row1-${idx}`} trade={trade} />
          ))}
          {row1.map((trade, idx) => (
            <TradeCard key={`row1-dup-${idx}`} trade={trade} ariaHidden />
          ))}
        </div>
      </div>
      {/* Row 2 - scrolls in sync */}
      <div className="relative">
        <div className="flex gap-3 sm:gap-4 animate-scroll hover:pause-animation">
          {row2.map((trade, idx) => (
            <TradeCard key={`row2-${idx}`} trade={trade} />
          ))}
          {row2.map((trade, idx) => (
            <TradeCard key={`row2-dup-${idx}`} trade={trade} ariaHidden />
          ))}
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAIModal, setShowAIModal] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const { word: searchPlaceholder } = useRotatingText(
    [
      "Find a plumber in Manchester",
      "Find an electrician in Leeds",
      "Find a roofer in Birmingham",
      "Find a painter in Glasgow",
      "Find a gas engineer in Bristol",
      "Find a builder in Liverpool",
      "Find a carpenter in Sheffield",
      "Find a bathroom fitter in London",
    ],
    2600,
    reduceMotion || searchFocused
  );

  return (
    <>
      {/* WebSite JSON-LD - enables Google Sitelinks search box */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": "https://myapproved.com/#website",
        "url": "https://myapproved.com",
        "name": "MyApproved",
        "description": "Find verified, insured local tradespeople across the UK. Free quotes, real reviews, ID-checked professionals.",
        "inLanguage": "en-GB",
        "potentialAction": { "@type": "SearchAction", "target": { "@type": "EntryPoint", "urlTemplate": "https://myapproved.com/find-tradespeople?search={search_term_string}" }, "query-input": "required name=search_term_string" }
      }) }} />
      {/* Organization JSON-LD - entity establishment for AI knowledge graphs */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": "https://myapproved.com/#organization",
        "name": "MyApproved",
        "url": "https://myapproved.com",
        "logo": { "@type": "ImageObject", "url": "https://myapproved.com/logo-icon.svg", "width": 512, "height": 512 },
        "description": "MyApproved is a UK-wide tradespeople verification platform connecting homeowners nationwide with ID-checked, insured, and reviewed local tradespeople.",
        "areaServed": { "@type": "Country", "name": "United Kingdom" },
        "sameAs": [
          process.env.NEXT_PUBLIC_TWITTER_URL,
          process.env.NEXT_PUBLIC_FACEBOOK_URL,
          process.env.NEXT_PUBLIC_LINKEDIN_URL,
          process.env.NEXT_PUBLIC_INSTAGRAM_URL
        ].filter(Boolean)
      }) }} />
      {/* Speakable - voice search / AI assistant extraction targets */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": "https://myapproved.com/#webpage",
        "url": "https://myapproved.com",
        "name": "MyApproved - Verified Tradespeople UK",
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": ["h1", "[data-speakable]"]
        },
        "about": {
          "@id": "https://myapproved.com/#organization"
        }
      }) }} />

      {/* HERO SECTION — a public register for vetted tradespeople, not a marketing banner */}
      <section className="relative bg-gradient-to-b from-[#0A2463] to-[#123A8F] text-white overflow-hidden min-h-[100vh] flex items-center -mt-[var(--header-height)]">
        {/* Brand background accents — subtle radial glow + amber grain */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -top-32 -left-32 h-[40rem] w-[40rem] rounded-full bg-[#2450B8]/35 blur-3xl" />
          <div className="absolute -bottom-40 -right-24 h-[36rem] w-[36rem] rounded-full bg-[#F5B301]/10 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[160px] sm:pt-[176px] pb-24 md:pt-[224px] md:pb-40">
          <div className="max-w-5xl mx-auto">
            {/* Hero Content - Centered */}
            <div className="text-center">
              {/* Register overline — a transparent pill with a single amber stroke */}
              <p className="inline-flex items-center gap-3 text-[0.72rem] sm:text-xs font-semibold tracking-[0.22em] uppercase text-[#F5B301] mb-8 sm:mb-12">
                <span className="h-px w-8 sm:w-10 bg-gradient-to-r from-transparent to-[#F5B301]/60" aria-hidden="true"></span>
                <span className="relative px-7 py-1.5 border border-[#F5B301]/60">
                  <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" className="absolute left-2 top-1/2 -translate-y-1/2 shrink-0">
                    <defs>
                      <radialGradient id="screwL" cx="0.35" cy="0.3" r="1">
                        <stop offset="0" stop-color="#F5B301"/>
                        <stop offset="1" stop-color="#E8A900"/>
                      </radialGradient>
                    </defs>
                    <circle cx="12" cy="12" r="11" fill="url(#screwL)"/>
                    <circle cx="12" cy="12" r="10.2" fill="none" stroke="#0A2463" stroke-opacity="0.22" stroke-width="1.6"/>
                    <circle cx="12" cy="12" r="7.4" fill="none" stroke="#0A2463" stroke-opacity="0.15" stroke-width="1"/>
                    <rect x="2.6" y="10.1" width="18.8" height="3.8" rx="1.9" fill="#0A2463" fill-opacity="0.8" transform="rotate(28 12 12)"/>
                    <path d="M4.8 8.4A9 9 0 0 1 11.6 3.3" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                  </svg>
                  <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" className="absolute right-2 top-1/2 -translate-y-1/2 shrink-0">
                    <defs>
                      <radialGradient id="screwR" cx="0.35" cy="0.3" r="1">
                        <stop offset="0" stop-color="#F5B301"/>
                        <stop offset="1" stop-color="#E8A900"/>
                      </radialGradient>
                    </defs>
                    <circle cx="12" cy="12" r="11" fill="url(#screwR)"/>
                    <circle cx="12" cy="12" r="10.2" fill="none" stroke="#0A2463" stroke-opacity="0.22" stroke-width="1.6"/>
                    <circle cx="12" cy="12" r="7.4" fill="none" stroke="#0A2463" stroke-opacity="0.15" stroke-width="1"/>
                    <rect x="2.6" y="10.1" width="18.8" height="3.8" rx="1.9" fill="#0A2463" fill-opacity="0.8" transform="rotate(71 12 12)"/>
                    <path d="M4.8 8.4A9 9 0 0 1 11.6 3.3" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                  </svg>
                  <span className="relative z-10">Vetted tradespeople across the UK</span>
                </span>
                <span className="h-px w-8 sm:w-10 bg-gradient-to-l from-transparent to-[#F5B301]/60" aria-hidden="true"></span>
              </p>

              {/* Headline — all white, underscored by a thin amber rule below the descender */}
              <h1 className="text-[2rem] sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-[-0.02em] mb-12 sm:mb-16 px-2 sm:px-4" style={{fontWeight: 800}}>
                Hire a tradesperson you{" "}
                <span className="relative inline-block whitespace-nowrap">
                  <span className="text-white relative z-10">actually count on</span>
                  <svg viewBox="0 0 400 46" width="100%" aria-hidden="true" className="absolute inset-x-0 -bottom-[0.85em] w-full overflow-visible pointer-events-none z-0">
                    <defs>
                      <linearGradient id="paintStroke" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0" stop-color="#E8A900"/>
                        <stop offset="1" stop-color="#F5B301"/>
                      </linearGradient>
                      <linearGradient id="drip1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stop-color="#E8A900"/>
                        <stop offset="1" stop-color="#E0A100"/>
                      </linearGradient>
                      <linearGradient id="drip2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stop-color="#E8A900"/>
                        <stop offset="1" stop-color="#E0A100"/>
                      </linearGradient>
                      <linearGradient id="drip3" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stop-color="#E8A900"/>
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

              {/* Subheadline — one specific promise */}
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/75 leading-relaxed mb-12 sm:mb-16 max-w-[34rem] mx-auto font-normal px-4">
                We check their ID, insurance and reviews before you see them.
              </p>

              {/* Search Bar — a raised, rounded clickable target on navy */}
              <div className="relative max-w-3xl mx-auto mb-12 sm:mb-16 px-4">
                <div
                  className="relative flex flex-col sm:flex-row items-center bg-white rounded-full shadow-xl shadow-black/20 border border-white/40 cursor-pointer gap-0 sm:pl-1.5 sm:pr-1.5 sm:py-1.5 overflow-hidden"
                  onClick={() => setShowAIModal(true)}
                >
                  <div className="flex-1 relative flex items-center w-full sm:w-auto">
                    <Search className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 ml-4 sm:ml-4 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder={searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAIModal(true);
                      }}
                      className="w-full px-4 py-4 sm:py-5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F5B301] focus:ring-offset-0 rounded-full text-base sm:text-lg font-medium bg-transparent cursor-pointer text-center sm:text-left"
                      readOnly
                    />
                  </div>
                  <Button
                    className="rounded-full bg-[#F5B301] hover:bg-[#E8A900] text-[#0A2463] font-bold px-6 sm:px-8 py-4 sm:py-5 text-base sm:text-lg w-auto sm:w-auto self-stretch sm:self-auto m-2 sm:m-0 transition-all duration-150 hover:-translate-y-px hover:shadow-md" style={{fontWeight: 800}}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAIModal(true);
                    }}
                  >
                    Get Quotes
                  </Button>
                </div>
              </div>

              {/* Trust indicators — two flat register entries, separated by a hairline */}
              <div className="inline-flex flex-nowrap justify-center text-xs sm:text-sm md:text-base px-2 sm:px-4">
                <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-1 sm:py-2 text-white/70 whitespace-nowrap">
                  <span className="text-white/70 text-base sm:text-lg font-bold leading-none" aria-hidden="true">
                    <ShieldCheckFill
                      weight="fill"
                      className="h-4 w-4 sm:h-5 sm:w-5 inline-block"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="font-bold tracking-wide text-white/70">INSURANCE CERTIFICATE VERIFIED</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-1 sm:py-2 text-white/70 whitespace-nowrap border-l border-white/20">
                  <span className="text-white/70 text-base sm:text-lg font-bold leading-none" aria-hidden="true">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 inline-block" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2v8h8V4H6zm2 2h4v1H8V6zm0 2h4v1H8V8zm0 2h4v1H8v-1z" />
                    </svg>
                  </span>
                  <span className="font-bold tracking-wide text-white/70">COMPANIES HOUSE CHECKED</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SERVICES SECTION - White Background with Auto-Scrolling Infinite Carousel */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1A3A8A] mb-4 sm:mb-6 px-4" style={{fontWeight: 800}}>
              One Search. Every Trade.
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#1A3A8A]/80 max-w-3xl mx-auto font-semibold px-4">
              Find trusted, local tradespeople for any job around your home
            </p>
          </div>

          {/* Trades Carousel - 2 scrolling rows */}
          <TradesCarousel />

          {/* CTA Button */}
          <div className="text-center mt-8 sm:mt-10 md:mt-12 px-4">
            <Button
              size="lg"
              className="bg-[#F5B301] hover:bg-[#E8A900] text-black font-bold border-2 border-[#F5B301] px-8 sm:px-10 md:px-12 py-5 sm:py-6 md:py-7 text-base sm:text-lg md:text-xl shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
              style={{fontWeight: 800}}
              asChild
            >
              <Link href="/find-tradespeople">
                Get Quotes
                <ArrowRight className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
            </Button>
            <p className="mt-3 text-sm sm:text-base text-[#1A3A8A]/70">Get an instant quote based on your job description and location.</p>
          </div>
        </div>
      </section>

      {/* WHY HOMEOWNERS CHOOSE MYAPPROVED SECTION */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-[#F1F5F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1A3A8A] mb-4 sm:mb-6 px-4" style={{fontWeight: 800}}>
              Why Homeowners Choose MyApproved
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {/* Benefit 1 */}
            <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#1A3A8A] mb-1 sm:mb-2" style={{fontWeight: 700}}>Checked before they're listed</h3>
              <p className="text-sm sm:text-base text-gray-600">No tradesperson gets on the platform without passing our checks.</p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#1A3A8A] mb-1 sm:mb-2" style={{fontWeight: 700}}>See the price before anyone calls</h3>
              <p className="text-sm sm:text-base text-gray-600">Get a costed quote from your job description, so no one has to talk you into a figure.</p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#1A3A8A] mb-1 sm:mb-2" style={{fontWeight: 700}}>The closest tradesperson</h3>
              <p className="text-sm sm:text-base text-gray-600">Matched to who can actually get to you first.</p>
            </div>

            {/* Benefit 4 */}
            <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#1A3A8A] mb-1 sm:mb-2" style={{fontWeight: 700}}>Booked into a real slot</h3>
              <p className="text-sm sm:text-base text-gray-600">Your job goes into their diary, not a pile of callbacks.</p>
            </div>

            {/* Benefit 5 */}
            <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#1A3A8A] mb-1 sm:mb-2" style={{fontWeight: 700}}>Free, no obligation</h3>
              <p className="text-sm sm:text-base text-gray-600">Posting costs nothing. Quoting costs nothing.</p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-8 sm:mt-10 md:mt-12 px-4">
            <Button
              size="lg"
              className="bg-[#F5B301] hover:bg-[#E8A900] text-black font-bold border-2 border-[#F5B301] px-8 sm:px-10 md:px-12 py-5 sm:py-6 md:py-7 text-base sm:text-lg md:text-xl shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
              style={{fontWeight: 800}}
              asChild
            >
              <Link href="/find-tradespeople">
                Get Quotes
                <ArrowRight className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
            </Button>
            <p className="mt-3 text-sm sm:text-base text-[#1A3A8A]/70">Post once. We do the chasing.</p>
          </div>
        </div>
      </section>

      {/* OUR CHECKS SECTION */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1A3A8A] mb-4 sm:mb-6 px-4" style={{fontWeight: 800}}>
              Our Checks
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#1A3A8A] max-w-3xl mx-auto font-semibold px-4">
              Every tradesperson on MyApproved passes these checks before they can take on work.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {/* Check 1 */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#1A3A8A] mb-1 sm:mb-2" style={{fontWeight: 700}}>Photo ID</h3>
              <p className="text-sm sm:text-base text-gray-700 font-medium">We confirm the person behind the profile is who they say they are.</p>
            </div>

            {/* Check 2 */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2v8h8V4H6zm2 2h4v1H8V6zm0 2h4v1H8V8zm0 2h4v1H8v-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#1A3A8A] mb-1 sm:mb-2" style={{fontWeight: 700}}>Registered business</h3>
              <p className="text-sm sm:text-base text-gray-700 font-medium">We check the company exists on Companies House, the official UK register.</p>
            </div>

            {/* Check 3 */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#1A3A8A] mb-1 sm:mb-2" style={{fontWeight: 700}}>Insurance</h3>
              <p className="text-sm sm:text-base text-gray-700 font-medium">We confirm the public liability certificate is real and still in date.</p>
            </div>

            {/* Check 4 */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#1A3A8A] mb-1 sm:mb-2" style={{fontWeight: 700}}>Qualifications</h3>
              <p className="text-sm sm:text-base text-gray-700 font-medium">We review the trade qualifications and accreditations they list.</p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-8 sm:mt-10 md:mt-12 px-4">
            <Button
              size="lg"
              className="bg-[#F5B301] hover:bg-[#E8A900] text-black font-bold border-2 border-[#F5B301] px-8 sm:px-10 md:px-12 py-5 sm:py-6 md:py-7 text-base sm:text-lg md:text-xl shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
              style={{fontWeight: 800}}
              asChild
            >
              <Link href="/find-tradespeople">
                Get Quotes
                <ArrowRight className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
            </Button>
            <p className="mt-3 text-sm sm:text-base text-[#1A3A8A]/70">Only people who've passed our checks can quote.</p>
          </div>
        </div>
      </section>

      {/* FOR TRADESPEOPLE SECTION */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-[#1A3A8A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            {/* Left Column */}
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 sm:mb-6" style={{fontWeight: 800}}>
                Grow Your Trade Business
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-white leading-relaxed mb-6 sm:mb-8">
                Get quality leads from homeowners in your area who are ready to hire. No cold calling, no wasted trips. Just real jobs from people who need your skills.
              </p>
              <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <li className="flex items-center gap-3 text-white text-sm sm:text-base">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#F5B301] flex-shrink-0" />
                  <span><strong className="font-bold" style={{fontWeight: 700}}>Three tradespeople per job.</strong> You're quoting a real brief, not fighting a crowd for it.</span>
                </li>
                <li className="flex items-center gap-3 text-white text-sm sm:text-base">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#F5B301] flex-shrink-0" />
                  <span><strong className="font-bold" style={{fontWeight: 700}}>Jobs go to the nearest.</strong> Matched by distance, so travel never eats your day.</span>
                </li>
                <li className="flex items-center gap-3 text-white text-sm sm:text-base">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#F5B301] flex-shrink-0" />
                  <span><strong className="font-bold" style={{fontWeight: 700}}>Jobs drop into your calendar.</strong> Slots fill themselves, so jobs never clash.</span>
                </li>
                <li className="flex items-center gap-3 text-white text-sm sm:text-base">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#F5B301] flex-shrink-0" />
                  <span><strong className="font-bold" style={{fontWeight: 700}}>£4.99 a lead, pay as you go.</strong> Pay only when a lead is worth taking. Nothing ongoing.</span>
                </li>
                <li className="flex items-center gap-3 text-white text-sm sm:text-base">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#F5B301] flex-shrink-0" />
                  <span><strong className="font-bold" style={{fontWeight: 700}}>Your marketing, handled.</strong> Website, SEO, paid ads, social, outreach, and reviews, taken off your plate.</span>
                </li>
              </ul>
              <Button
                size="lg"
                className="bg-[#F5B301] hover:bg-[#E8A900] text-black font-bold px-6 sm:px-10 py-4 sm:py-6 text-base sm:text-lg shadow-lg"
                style={{fontWeight: 800}}
                asChild
              >
                <Link href="/register/tradesperson">
                  Join as a Tradesperson
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </Button>
              <p className="mt-3 text-sm sm:text-base text-white/70">Create your profile and start receiving leads.</p>
            </div>

            {/* Right Column — job notification mockup */}
            <div>
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-3 shadow-xl">
                {/* Notification header */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">New job match · 2 min ago</span>
                  <span className="w-5 h-5 rounded-full bg-[#F5B301] flex items-center justify-center text-[10px] font-bold text-black">1</span>
                </div>

                {/* Notification card */}
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-[#1A3A8A] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">Plumber</span>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="w-3.5 h-3.5" /> Leeds · LS4
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 leading-snug mb-3">Leaking pipe under the kitchen sink, needs fixing this week.</p>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" /> 2 others in this area
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" /> Slots into your calendar
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-semibold text-gray-400">Your quote</p>
                      <p className="text-lg font-bold text-[#1A3A8A]" style={{fontWeight: 800}}>£165</p>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">Quote it and it's in your diary</span>
                  <span className="text-xs font-bold text-[#1A3A8A]">Quote in a tap →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-[#F1F5F9]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1A3A8A] mb-4 sm:mb-6 px-4" style={{fontWeight: 800}}>
              Common Questions
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#1A3A8A] font-semibold px-4">
              Answers to the things homeowners ask us most
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
            <AccordionItem value="item-1" className="bg-white rounded-xl border-2 border-gray-200 px-4 sm:px-6">
              <AccordionTrigger className="text-base sm:text-lg font-bold text-[#1A3A8A] hover:text-[#F5B301] py-4 sm:py-6" style={{fontWeight: 700}}>
                Is MyApproved free for homeowners?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed text-sm sm:text-base pb-4 sm:pb-6">
                Yes, always. Posting a job and getting quotes is completely free. You only pay the tradesperson for the work they do.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-white rounded-xl border-2 border-gray-200 px-4 sm:px-6">
              <AccordionTrigger className="text-base sm:text-lg font-bold text-[#1A3A8A] hover:text-[#F5B301] py-4 sm:py-6" style={{fontWeight: 700}}>
                How do you check tradespeople?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed text-sm sm:text-base pb-4 sm:pb-6">
                Every tradesperson provides photo ID, proof of public liability insurance (minimum £2M), and evidence of their trade qualifications. We review all of this before they can appear on the platform.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-white rounded-xl border-2 border-gray-200 px-4 sm:px-6">
              <AccordionTrigger className="text-base sm:text-lg font-bold text-[#1A3A8A] hover:text-[#F5B301] py-4 sm:py-6" style={{fontWeight: 700}}>
                What areas do you cover?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed text-sm sm:text-base pb-4 sm:pb-6">
                We operate nationwide across the UK, connecting homeowners with verified tradespeople in every region.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-white rounded-xl border-2 border-gray-200 px-4 sm:px-6">
              <AccordionTrigger className="text-base sm:text-lg font-bold text-[#1A3A8A] hover:text-[#F5B301] py-4 sm:py-6" style={{fontWeight: 700}}>
                How quickly will I get quotes?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed text-sm sm:text-base pb-4 sm:pb-6">
                Most homeowners receive their first quote within a few hours of posting a job.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="bg-white rounded-xl border-2 border-gray-200 px-4 sm:px-6">
              <AccordionTrigger className="text-base sm:text-lg font-bold text-[#1A3A8A] hover:text-[#F5B301] py-4 sm:py-6" style={{fontWeight: 700}}>
                What if the work isn't done properly?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed text-sm sm:text-base pb-4 sm:pb-6">
                All tradespeople on MyApproved carry public liability insurance. Contact us within 48 hours and we'll help resolve it.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="bg-white rounded-xl border-2 border-gray-200 px-4 sm:px-6">
              <AccordionTrigger className="text-base sm:text-lg font-bold text-[#1A3A8A] hover:text-[#F5B301] py-4 sm:py-6" style={{fontWeight: 700}}>
                How do tradespeople join?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed text-sm sm:text-base pb-4 sm:pb-6">
                Tradespeople apply online and provide their ID, insurance, and qualifications. We verify everything before they can quote on jobs.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* CTA Button */}
          <div className="text-center mt-8 sm:mt-12">
            <Button
              size="lg"
              className="bg-[#F5B301] hover:bg-[#E8A900] text-black font-bold border-2 border-[#F5B301] px-8 sm:px-12 py-5 sm:py-7 text-lg sm:text-xl shadow-lg hover:shadow-xl transition-all"
              style={{fontWeight: 800}}
              onClick={() => setShowAIModal(true)}
            >
              Get Quotes
              <ArrowRight className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
            <p className="mt-3 text-sm sm:text-base text-[#1A3A8A]/70">You've had your questions answered. Now find someone for the job.</p>
          </div>
        </div>
      </section>

      {/* LOCAL TRADESPEOPLE FOOTER SECTION */}
      <section className="py-16 bg-[#F1F5F9]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* View local tradespeople in your area - Dropdown */}
          <div className="mb-8">
            <div className="rounded-lg overflow-hidden">
              <details className="group">
                <summary className="flex items-center justify-between px-4 py-3 bg-[#F1F5F9] cursor-pointer list-none hover:bg-gray-200 transition-colors">
                  <span className="text-lg font-bold text-[#1A3A8A]" style={{fontWeight: 700}}>View local tradespeople in your area</span>
                  <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-4 py-4 bg-[#F1F5F9]">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-6 gap-y-2">
                    <Link href="/find-tradespeople/plumber/bristol" className="text-sm text-blue-600 hover:underline">Bristol</Link>
                    <Link href="/find-tradespeople/plumber/chelmsford" className="text-sm text-blue-600 hover:underline">Essex</Link>
                    <Link href="/find-tradespeople/plumber/southampton" className="text-sm text-blue-600 hover:underline">Hampshire</Link>
                    <Link href="/find-tradespeople/plumber/maidstone" className="text-sm text-blue-600 hover:underline">Kent</Link>
                    <Link href="/find-tradespeople/plumber/manchester" className="text-sm text-blue-600 hover:underline">Lancashire</Link>
                    <Link href="/find-tradespeople/plumber/leicester" className="text-sm text-blue-600 hover:underline">Leicestershire</Link>
                    <Link href="/find-tradespeople/plumber/london" className="text-sm text-blue-600 hover:underline">Middlesex</Link>
                    <Link href="/find-tradespeople/plumber/norwich" className="text-sm text-blue-600 hover:underline">Norfolk</Link>
                    <Link href="/find-tradespeople/plumber/nottingham" className="text-sm text-blue-600 hover:underline">Nottinghamshire</Link>
                    <Link href="/find-tradespeople/plumber/oxford" className="text-sm text-blue-600 hover:underline">Oxfordshire</Link>
                    <Link href="/find-tradespeople/plumber/guildford" className="text-sm text-blue-600 hover:underline">Surrey</Link>
                    <Link href="/find-tradespeople/plumber/brighton" className="text-sm text-blue-600 hover:underline">Sussex</Link>
                    <Link href="/find-tradespeople/plumber/coventry" className="text-sm text-blue-600 hover:underline">Warwickshire</Link>
                    <Link href="/find-tradespeople/plumber/worcester" className="text-sm text-blue-600 hover:underline">Worcestershire</Link>
                    <Link href="/find-tradespeople/plumber/leeds" className="text-sm text-blue-600 hover:underline">Yorkshire</Link>
                  </div>
                </div>
              </details>
            </div>
          </div>

          {/* Three Dropdown Menus */}
          <div className="pt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Popular Jobs Dropdown */}
              <div className="rounded-lg overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between px-4 py-3 bg-[#F1F5F9] cursor-pointer list-none hover:bg-gray-200 transition-colors">
                    <span className="text-base font-bold text-[#1A3A8A]" style={{fontWeight: 700}}>Popular Jobs</span>
                    <ChevronDown className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-4 py-3 bg-[#F1F5F9]">
                    <ul className="space-y-2">
                      <li><Link href="/find-tradespeople/electrician/london" className="text-sm text-blue-600 hover:underline">Electricians in London</Link></li>
                      <li><Link href="/find-tradespeople/roofer/edinburgh" className="text-sm text-blue-600 hover:underline">Roofers in Edinburgh</Link></li>
                      <li><Link href="/find-tradespeople/gardener/wolverhampton" className="text-sm text-blue-600 hover:underline">Gardeners in Wolverhampton</Link></li>
                      <li><Link href="/find-tradespeople/electrician/cardiff" className="text-sm text-blue-600 hover:underline">Electricians in Cardiff</Link></li>
                      <li><Link href="/find-tradespeople/plumber/liverpool" className="text-sm text-blue-600 hover:underline">Plumbers in Liverpool</Link></li>
                      <li><Link href="/find-tradespeople/plumber/london" className="text-sm text-blue-600 hover:underline">Plumbers in Croydon</Link></li>
                      <li><Link href="/find-tradespeople/roofer/plymouth" className="text-sm text-blue-600 hover:underline">Roofers in Plymouth</Link></li>
                      <li><Link href="/find-tradespeople/plumber/norwich" className="text-sm text-blue-600 hover:underline">Plumbers in Norwich</Link></li>
                      <li><Link href="/find-tradespeople/gardener/luton" className="text-sm text-blue-600 hover:underline">Gardeners in Luton</Link></li>
                      <li><Link href="/find-tradespeople/plumber/birmingham" className="text-sm text-blue-600 hover:underline">Plumbers in Birmingham</Link></li>
                      <li><Link href="/find-tradespeople/roofer/belfast" className="text-sm text-blue-600 hover:underline">Roofers in Belfast</Link></li>
                      <li><Link href="/find-tradespeople/roofer/manchester" className="text-sm text-blue-600 hover:underline">Roofers in Manchester</Link></li>
                    </ul>
                  </div>
                </details>
              </div>

              {/* Find Tradespeople Dropdown */}
              <div className="rounded-lg overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between px-4 py-3 bg-[#F1F5F9] cursor-pointer list-none hover:bg-gray-200 transition-colors">
                    <span className="text-base font-bold text-[#1A3A8A]" style={{fontWeight: 700}}>Find Tradespeople</span>
                    <ChevronDown className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-4 py-3 bg-[#F1F5F9]">
                    <ul className="space-y-2">
                      <li><Link href="/find-tradespeople/electrician" className="text-sm text-blue-600 hover:underline">Electrician</Link></li>
                      <li><Link href="/find-tradespeople/plumber" className="text-sm text-blue-600 hover:underline">Plumber</Link></li>
                      <li><Link href="/find-tradespeople/roofer" className="text-sm text-blue-600 hover:underline">Roofer</Link></li>
                      <li><Link href="/find-tradespeople/painter-decorator" className="text-sm text-blue-600 hover:underline">Painter</Link></li>
                      <li><Link href="/find-tradespeople/carpenter" className="text-sm text-blue-600 hover:underline">Carpenter</Link></li>
                      <li><Link href="/find-tradespeople/tiler" className="text-sm text-blue-600 hover:underline">Tiler</Link></li>
                      <li><Link href="/find-tradespeople/plasterer" className="text-sm text-blue-600 hover:underline">Plasterer</Link></li>
                      <li><Link href="/find-tradespeople/handyman" className="text-sm text-blue-600 hover:underline">Handyman</Link></li>
                      <li><Link href="/find-tradespeople/locksmith" className="text-sm text-blue-600 hover:underline">Locksmith</Link></li>
                      <li><Link href="/find-tradespeople/builder" className="text-sm text-blue-600 hover:underline">Builder</Link></li>
                      <li><Link href="/find-tradespeople/gardener" className="text-sm text-blue-600 hover:underline">Gardener</Link></li>
                      <li><Link href="/find-tradespeople/window-fitter" className="text-sm text-blue-600 hover:underline">Window Fitter</Link></li>
                    </ul>
                  </div>
                </details>
              </div>

              {/* Find Out More Dropdown */}
              <div className="rounded-lg overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between px-4 py-3 bg-[#F1F5F9] cursor-pointer list-none hover:bg-gray-200 transition-colors">
                    <span className="text-base font-bold text-[#1A3A8A]" style={{fontWeight: 700}}>Find Out More</span>
                    <ChevronDown className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-4 py-3 bg-[#F1F5F9]">
                    <ul className="space-y-2">
                      <li><Link href="/about" className="text-sm text-blue-600 hover:underline">About Us</Link></li>
                      <li><Link href="/how-it-works" className="text-sm text-blue-600 hover:underline">How It Works</Link></li>
                      <li><Link href="/for-tradespeople" className="text-sm text-blue-600 hover:underline">For Tradespeople</Link></li>
                      <li><Link href="/find-tradespeople" className="text-sm text-blue-600 hover:underline">Reviews</Link></li>
                      <li><Link href="/help" className="text-sm text-blue-600 hover:underline">Help & Support</Link></li>
                      <li><Link href="/contact" className="text-sm text-blue-600 hover:underline">Contact Us</Link></li>
                      <li><Link href="/privacy" className="text-sm text-blue-600 hover:underline">Privacy Policy</Link></li>
                      <li><Link href="/terms" className="text-sm text-blue-600 hover:underline">Terms of Service</Link></li>
                      <li><Link href="/cookies" className="text-sm text-blue-600 hover:underline">Cookie Policy</Link></li>
                      <li><Link href="/sitemap" className="text-sm text-blue-600 hover:underline">Sitemap</Link></li>
                    </ul>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI QUOTE FORM MODAL */}
      <AIQuoteForm
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
      />
    </>
  );
}
