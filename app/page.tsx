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
  User,
  Wrench,
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
const useRotatingText = (words: string[], interval = 2600) => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length);
        setVisible(true);
      }, 350);
    }, interval);
    return () => clearInterval(timer);
  }, [words, interval]);

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

  // Rotating trade for headline
  const trades = [
    "Plumber",
    "Electrician",
    "Roofer",
    "Gas Engineer",
    "Carpenter",
    "Painter & Decorator",
    "Builder",
    "Plasterer",
    "Tiler",
    "Locksmith",
    "Kitchen Fitter",
    "Bathroom Fitter",
    "Gardener",
    "Window Fitter",
    "Flooring Specialist",
    "Handyman",
  ];

  const { word: currentTrade, visible: tradeVisible } = useRotatingText(trades, 2600);

  // Search placeholder
  const searchPlaceholder = "What work do you need doing?";

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

      {/* HERO SECTION - Premium, Trust-Focused */}
      <section className="relative bg-[#1A3A8A] text-white overflow-hidden min-h-[100vh] flex items-center -mt-[var(--header-height)]">
        {/* Animated Background Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, #F5A623 1px, transparent 1px), linear-gradient(to bottom, #F5A623 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Radial Gold Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#F5A623] rounded-full blur-[150px] opacity-10" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[140px] sm:pt-[160px] pb-20 md:pt-[200px] md:pb-32">
          <div className="max-w-5xl mx-auto">
            {/* Hero Content - Centered */}
            <div className="text-center">
              {/* Launch Badge - Green dot + location */}
              <div className="inline-flex items-center gap-2 bg-[#FFB800] px-3 sm:px-5 py-2 sm:py-3 rounded-full border-2 border-[#FFB800] mb-6 sm:mb-10">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-xs sm:text-sm font-extrabold text-black" style={{fontWeight: 800}}>Now Available Nationwide</span>
              </div>

              {/* Headline — H1 stable for crawlers, animated span for visual rotation */}
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.1] mb-6 sm:mb-8 px-2 sm:px-4" style={{fontWeight: 800}}>
                <span className="block text-white">Get Your Job Done Right.</span>
                <span className="block text-[#FFB800] whitespace-nowrap overflow-hidden text-ellipsis">
                  Find an Approved Tradesperson
                  <span
                    className="inline transition-opacity duration-300"
                    style={{ opacity: tradeVisible ? 1 : 0 }}
                    aria-hidden="true"
                  >
                    {" "}&mdash; e.g. {currentTrade}
                  </span>
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white leading-relaxed mb-6 sm:mb-10 max-w-3xl mx-auto font-medium px-4">
                Only verified and approved local tradespeople. Book with confidence.
              </p>

              {/* Search Bar CTA */}
              <div className="relative max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
                <div
                  className="relative flex flex-col sm:flex-row items-center bg-white rounded-2xl sm:rounded-full shadow-2xl p-3 sm:p-3 border-4 border-white cursor-pointer gap-3 sm:gap-0"
                  onClick={() => setShowAIModal(true)}
                >
                  <Search className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400 sm:ml-5 flex-shrink-0" />
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder={searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAIModal(true);
                      }}
                      className="w-full px-4 sm:px-6 py-3 sm:py-5 text-gray-900 placeholder-gray-400 focus:outline-none text-base sm:text-lg font-medium bg-transparent relative z-10 cursor-pointer text-center sm:text-left"
                      readOnly
                    />
                  </div>
                  <Button
                    className="bg-[#FFB800] hover:bg-[#FFC933] text-black font-bold px-6 sm:px-10 py-4 sm:py-6 rounded-full text-base sm:text-lg shadow-lg w-full sm:w-auto" style={{fontWeight: 800}}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAIModal(true);
                    }}
                  >
                    Get Quotes
                  </Button>
                </div>
              </div>

              {/* Trust Indicators - Industry Standard Professional Badges */}
              <div className="flex flex-nowrap justify-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm md:text-base px-2 sm:px-4 overflow-x-auto">
                {/* Badge 1 - ID Verified */}
                <div className="group flex items-center gap-1.5 sm:gap-3 px-2.5 sm:px-5 py-2 sm:py-3 bg-white rounded-full shadow-lg border-2 border-emerald-100 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 flex-shrink-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-100 rounded-full flex items-center justify-center border border-emerald-200 group-hover:bg-emerald-200 transition-colors flex-shrink-0">
                    <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-gray-900 font-bold text-[9px] sm:text-xs tracking-wide whitespace-nowrap">ID VERIFIED</span>
                </div>
                {/* Badge 2 - Insured */}
                <div className="group flex items-center gap-1.5 sm:gap-3 px-2.5 sm:px-5 py-2 sm:py-3 bg-white rounded-full shadow-lg border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 flex-shrink-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center border border-blue-200 group-hover:bg-blue-200 transition-colors flex-shrink-0">
                    <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="text-gray-900 font-bold text-[9px] sm:text-xs tracking-wide whitespace-nowrap">£2M INSURED</span>
                </div>
                {/* Badge 3 - Google Reviews */}
                <div className="group flex items-center gap-1.5 sm:gap-3 px-2.5 sm:px-5 py-2 sm:py-3 bg-white rounded-full shadow-lg border-2 border-gray-100 hover:border-gray-300 hover:shadow-xl transition-all duration-300 flex-shrink-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center border border-gray-200 flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </div>
                  <span className="text-gray-900 font-bold text-[9px] sm:text-xs tracking-wide whitespace-nowrap">GOOGLE REVIEWS</span>
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
              Every Trade. One Platform.
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
              className="bg-[#FFB800] hover:bg-[#FFC933] text-black font-bold border-2 border-[#FFB800] px-8 sm:px-10 md:px-12 py-5 sm:py-6 md:py-7 text-base sm:text-lg md:text-xl shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
              style={{fontWeight: 800}}
              asChild
            >
              <Link href="/find-tradespeople">
                Find Your Tradesperson
                <ArrowRight className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
            </Button>
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
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#1A3A8A] mb-1 sm:mb-2" style={{fontWeight: 700}}>Every tradesperson is checked</h3>
              <p className="text-sm sm:text-base text-gray-600">ID verified, insurance confirmed, and qualifications reviewed before they're listed.</p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#1A3A8A] mb-1 sm:mb-2" style={{fontWeight: 700}}>Real reviews from real customers</h3>
              <p className="text-sm sm:text-base text-gray-600">Every review is from a verified homeowner who actually hired the tradesperson.</p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#1A3A8A] mb-1 sm:mb-2" style={{fontWeight: 700}}>You're covered</h3>
              <p className="text-sm sm:text-base text-gray-600">All tradespeople carry public liability insurance. If something goes wrong, you're protected.</p>
            </div>

            {/* Benefit 4 */}
            <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#1A3A8A] mb-1 sm:mb-2" style={{fontWeight: 700}}>Quotes in hours, not days</h3>
              <p className="text-sm sm:text-base text-gray-600">Post your job and hear back from available tradespeople quickly. No chasing.</p>
            </div>

            {/* Benefit 5 */}
            <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#1A3A8A] mb-1 sm:mb-2" style={{fontWeight: 700}}>Local tradespeople who know your area</h3>
              <p className="text-sm sm:text-base text-gray-600">Matched with tradespeople near you who understand local conditions.</p>
            </div>

            {/* Benefit 6 */}
            <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#1A3A8A] mb-1 sm:mb-2" style={{fontWeight: 700}}>Free for homeowners. Always</h3>
              <p className="text-sm sm:text-base text-gray-600">You'll never pay to post a job or get quotes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* DUAL CTA SECTION */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-[#1A3A8A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {/* For Homeowners */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[#F5A623]">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#1A3A8A] mb-3 sm:mb-4" style={{fontWeight: 800}}>Need a Tradesperson?</h3>
              <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6 leading-relaxed font-medium">
                Post your job for free and get quotes from checked, local tradespeople.
              </p>
              <Button
                size="lg"
                className="w-full bg-[#FFB800] hover:bg-[#FFC933] text-black font-bold text-base sm:text-lg py-4 sm:py-6" style={{fontWeight: 800}}
                onClick={() => setShowAIModal(true)}
              >
                Post a Job - It's Free
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>

            {/* For Tradespeople */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[#F5A223]">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <Wrench className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#1A3A8A] mb-3 sm:mb-4" style={{fontWeight: 800}}>Are You a Tradesperson?</h3>
              <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6 leading-relaxed font-medium">
                Get quality leads from homeowners in your area. No listing fees while we launch.
              </p>
              <Button
                size="lg"
                className="w-full bg-[#15803d] hover:bg-[#166534] text-white font-bold text-base sm:text-lg py-4 sm:py-6" style={{fontWeight: 800}}
                asChild
              >
                <Link href="/register/tradesperson">
                  Join as a Tradesperson
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </Button>
              <p className="text-xs sm:text-sm text-emerald-600 font-semibold mt-3 sm:mt-4 text-center">
                No listing fees while we launch
              </p>
            </div>
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
              Every tradesperson on MyApproved passes these checks before they can take on work
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {/* Check 1 */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#1A3A8A] mb-1 sm:mb-2" style={{fontWeight: 700}}>Identity verified</h3>
              <p className="text-sm sm:text-base text-gray-700 font-medium">Photo ID checked and confirmed against official records</p>
            </div>

            {/* Check 2 */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#1A3A8A] mb-1 sm:mb-2" style={{fontWeight: 700}}>Insurance confirmed</h3>
              <p className="text-sm sm:text-base text-gray-700 font-medium">Public liability insurance verified. Minimum £2M coverage</p>
            </div>

            {/* Check 3 */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#1A3A8A] mb-1 sm:mb-2" style={{fontWeight: 700}}>Qualifications checked</h3>
              <p className="text-sm sm:text-base text-gray-700 font-medium">Trade qualifications and accreditations reviewed</p>
            </div>

            {/* Check 4 */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center border-2 border-gray-100">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#1A3A8A] mb-1 sm:mb-2" style={{fontWeight: 700}}>Google Reviews</h3>
              <p className="text-sm sm:text-base text-gray-700 font-medium">Customer feedback collected and monitored after every job</p>
            </div>
          </div>
        </div>
      </section>

      {/* READY TO GET STARTED SECTION */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-[#F1F5F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1A3A8A] mb-4 sm:mb-6 px-4" style={{fontWeight: 800}}>
              Ready to get your job done?
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#1A3A8A] max-w-3xl mx-auto font-semibold px-4">
              Post your job for free and get quotes from checked, local tradespeople
            </p>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Button
              size="lg"
              className="bg-[#FFB800] hover:bg-[#FFC933] text-black font-bold border-2 border-[#FFB800] px-8 sm:px-12 py-5 sm:py-7 text-lg sm:text-xl shadow-lg hover:shadow-xl transition-all"
              style={{fontWeight: 800}}
              onClick={() => setShowAIModal(true)}
            >
              Post a Job - It's Free
              <ArrowRight className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
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
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFB800] flex-shrink-0" />
                  <span>Get matched with jobs in your area</span>
                </li>
                <li className="flex items-center gap-3 text-white text-sm sm:text-base">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFB800] flex-shrink-0" />
                  <span>Only pay for leads you want</span>
                </li>
                <li className="flex items-center gap-3 text-white text-sm sm:text-base">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFB800] flex-shrink-0" />
                  <span>No subscription fees during launch</span>
                </li>
                <li className="flex items-center gap-3 text-white text-sm sm:text-base">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFB800] flex-shrink-0" />
                  <span>Build your reputation with verified reviews</span>
                </li>
              </ul>
              <Button
                size="lg"
                className="bg-[#FFB800] hover:bg-[#FFC933] text-black font-bold px-6 sm:px-10 py-4 sm:py-6 text-base sm:text-lg shadow-lg"
                style={{fontWeight: 800}}
                asChild
              >
                <Link href="/register/tradesperson">
                  Join as a Tradesperson
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </Button>
              <p className="text-xs sm:text-sm text-gray-300 mt-3 sm:mt-4">
                No listing fees while we launch
              </p>
            </div>

            {/* Right Column - Benefits Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-[#1A3A8A] mb-4 sm:mb-6" style={{fontWeight: 700}}>What you get</h3>
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-[#1A3A8A]" style={{fontWeight: 700}}>Quality leads</h4>
                  <p className="text-sm sm:text-base text-gray-600">Connect with homeowners actively looking to hire</p>
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-[#1A3A8A]" style={{fontWeight: 700}}>Your own profile</h4>
                  <p className="text-sm sm:text-base text-gray-600">Showcase your work and qualifications</p>
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-[#1A3A8A]" style={{fontWeight: 700}}>Review collection</h4>
                  <p className="text-sm sm:text-base text-gray-600">Build trust with verified customer feedback</p>
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-[#1A3A8A]" style={{fontWeight: 700}}>Fair pricing</h4>
                  <p className="text-sm sm:text-base text-gray-600">Only pay for leads you choose to quote on</p>
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
              <AccordionTrigger className="text-base sm:text-lg font-bold text-[#1A3A8A] hover:text-[#FFB800] py-4 sm:py-6" style={{fontWeight: 700}}>
                Is MyApproved free for homeowners?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed text-sm sm:text-base pb-4 sm:pb-6">
                Yes, always. Posting a job and getting quotes is completely free. You only pay the tradesperson for the work they do.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-white rounded-xl border-2 border-gray-200 px-4 sm:px-6">
              <AccordionTrigger className="text-base sm:text-lg font-bold text-[#1A3A8A] hover:text-[#FFB800] py-4 sm:py-6" style={{fontWeight: 700}}>
                How do you check tradespeople?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed text-sm sm:text-base pb-4 sm:pb-6">
                Every tradesperson provides photo ID, proof of public liability insurance (minimum £2M), and evidence of their trade qualifications. We review all of this before they can appear on the platform.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-white rounded-xl border-2 border-gray-200 px-4 sm:px-6">
              <AccordionTrigger className="text-base sm:text-lg font-bold text-[#1A3A8A] hover:text-[#FFB800] py-4 sm:py-6" style={{fontWeight: 700}}>
                What areas do you cover?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed text-sm sm:text-base pb-4 sm:pb-6">
                We operate nationwide across the UK, connecting homeowners with verified tradespeople in every region.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-white rounded-xl border-2 border-gray-200 px-4 sm:px-6">
              <AccordionTrigger className="text-base sm:text-lg font-bold text-[#1A3A8A] hover:text-[#FFB800] py-4 sm:py-6" style={{fontWeight: 700}}>
                How quickly will I get quotes?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed text-sm sm:text-base pb-4 sm:pb-6">
                Most homeowners receive their first quote within a few hours of posting a job.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="bg-white rounded-xl border-2 border-gray-200 px-4 sm:px-6">
              <AccordionTrigger className="text-base sm:text-lg font-bold text-[#1A3A8A] hover:text-[#FFB800] py-4 sm:py-6" style={{fontWeight: 700}}>
                What if the work isn't done properly?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed text-sm sm:text-base pb-4 sm:pb-6">
                All tradespeople on MyApproved carry public liability insurance. Contact us within 48 hours and we'll help resolve it.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="bg-white rounded-xl border-2 border-gray-200 px-4 sm:px-6">
              <AccordionTrigger className="text-base sm:text-lg font-bold text-[#1A3A8A] hover:text-[#FFB800] py-4 sm:py-6" style={{fontWeight: 700}}>
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
              className="bg-[#FFB800] hover:bg-[#FFC933] text-black font-bold border-2 border-[#FFB800] px-8 sm:px-12 py-5 sm:py-7 text-lg sm:text-xl shadow-lg hover:shadow-xl transition-all"
              style={{fontWeight: 800}}
              onClick={() => setShowAIModal(true)}
            >
              Post a Job - It's Free
              <ArrowRight className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
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
