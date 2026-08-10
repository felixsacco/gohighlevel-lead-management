// @ts-nocheck
"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, MapPin, Star, Shield, CheckCircle, ChevronRight, Phone, Globe, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import InitialsAvatar from "@/components/InitialsAvatar";
import { Textarea } from "@/components/ui/textarea";
import GetQuoteModal from "@/components/GetQuoteModal";
import Link from "next/link";
import Image from "next/image";
import ProgrammaticSchema from "@/components/ProgrammaticSchema";
import AEOContentBlock from "@/components/AEOContentBlock";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import styles from "./page.module.css";
// (Header dropdown imports removed; Header is rendered globally in layout)

interface Tradesperson {
  id: string;
  name: string;
  trade: string;
  rating: number;
  reviews: number;
  location: string;
  distance: string;
  image: string | null;
  initials: string;
  verified: boolean;
  yearsExperience: number;
  description: string;
  hourlyRate: string;
  responseTime: string;
  phone: string;
  email: string;
}

interface GooglePlace {
  displayName?: { text: string };
  rating?: number;
  userRatingCount?: number;
  editorialSummary?: { text: string };
  regularOpeningHours?: {
    openNow: boolean;
    weekdayDescriptions?: string[];
  };
  websiteUri?: string;
  internationalPhoneNumber?: string;
  shortFormattedAddress?: string;
  addressComponents?: Array<{ longText: string; shortText: string; types: string[] }>;
  primaryTypeDisplayName?: { text: string };
  location?: { latitude: number; longitude: number };
  contextualContents?: Array<{
    reviews?: Array<{ text?: { text: string } }>;
  }>;
}

const TRADE_OPTIONS = [
  "Plumber", "Electrician", "Gas Engineer", "Builder",
  "Roofer", "Carpenter", "Cleaner", "Plasterer", "Painter", "Handyman",
];

export default function FindTradespeople() {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [tradespeople, setTradespeople] = useState<Tradesperson[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [retrying, setRetrying] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedTradesperson, setSelectedTradesperson] =
    useState<Tradesperson | null>(null);
  // Smart filters toggles
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyAvailableToday, setOnlyAvailableToday] = useState(false); // responseMins < 15
  const [minRating, setMinRating] = useState<number | null>(null); // e.g. 4.8
  // AI shortlist
  const [aiShortlist, setAiShortlist] = useState(false);
  // Compare selection (max 3)
  const [compareSet, setCompareSet] = useState<Set<string>>(new Set());
  const [showCompareModal, setShowCompareModal] = useState(false);
  // Post a Job modal
  const [showPostJob, setShowPostJob] = useState(false);
  const [jobForm, setJobForm] = useState({ trade: "", description: "", postcode: "" });
  // Additional filter toggles
  const [minYearsFlag, setMinYearsFlag] = useState(false); // 5+ years
  const [minReviews100Flag, setMinReviews100Flag] = useState(false); // 100+ reviews

  // ── Google Places live data ──
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<string>("Plumber");
  const [googlePlaces, setGooglePlaces] = useState<GooglePlace[]>([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesError, setPlacesError] = useState("");
  const [placesSortBy, setPlacesSortBy] = useState<"rating" | "reviews" | "closest">("reviews");
  const [radiusMiles, setRadiusMiles] = useState<number>(10);
  const [recommendedPlace, setRecommendedPlace] = useState<GooglePlace | null>(null);
  const [sessionId] = useState<string>(() =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`
  );

  // Client-side sort of the live Places array
  const sortedGooglePlaces = useMemo(() => {
    const arr = [...googlePlaces];
    if (placesSortBy === "rating") arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    else if (placesSortBy === "reviews") arr.sort((a, b) => (b.userRatingCount ?? 0) - (a.userRatingCount ?? 0));
    // "closest" keeps the original Google proximity order
    return arr;
  }, [googlePlaces, placesSortBy]);

  // Parse next opening time from weekday descriptions (e.g. "Opens 8:30 am Mon")
  const getNextOpenTime = (hours: GooglePlace["regularOpeningHours"]): string | null => {
    if (!hours || hours.openNow || !hours.weekdayDescriptions) return null;
    const jsDay = new Date().getDay(); // 0=Sun
    const gDay = jsDay === 0 ? 6 : jsDay - 1; // Google: Mon=0 … Sun=6
    const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    for (let i = 0; i < 7; i++) {
      const idx = (gDay + i) % 7;
      const desc = hours.weekdayDescriptions[idx] ?? "";
      if (desc.toLowerCase().includes("closed")) continue;
      const match = desc.match(/:\s*(\d{1,2}:\d{2}\s*[ap]m)/i);
      if (match) {
        return i === 0 ? `today ${match[1].toLowerCase()}` : `${DAY_LABELS[idx]} ${match[1].toLowerCase()}`;
      }
    }
    return null;
  };

  // Fire-and-forget telemetry - writes to admin_activity_log via /api/places/track
  const trackInteraction = (businessName: string, actionType: string) => {
    fetch("/api/places/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        business_name: businessName,
        action_type: actionType,
        user_session_id: sessionId,
        timestamp: new Date().toISOString(),
        metadata: { selected_trade: selectedTrade, has_location: !!userCoords },
      }),
    }).catch(() => {});
  };

  const clearAllFilters = () => {
    setOnlyVerified(false);
    setOnlyAvailableToday(false);
    setMinRating(null);
    setAiShortlist(false);
    setMinYearsFlag(false);
    setMinReviews100Flag(false);
  };

  const fetchTradespeople = async (page = 1, append = false, retryCount = 0) => {
    try {
      if (!append) {
        setLoading(true);
        setTradespeople([]);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (location) params.append("location", location);
      if (sortBy) params.append("sortBy", sortBy);
      params.append("page", page.toString());
      params.append("limit", pagination.limit.toString());
      
      console.log("Fetching with params:", { page, limit: pagination.limit, searchTerm, location, sortBy });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`/api/tradespeopleeeee/list?${params}`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log("Frontend received data:", data);

      if (data.success) {
        if (append) {
          setTradespeople((prev) => [...prev, ...data.tradespeople]);
        } else {
          setTradespeople(data.tradespeople);
        }
        setPagination(data.pagination);
        setError(""); // Clear any previous errors
      } else {
        setError(data.error || "Failed to fetch tradespeople");
      }
    } catch (err) {
      console.error("Error fetching tradespeople:", err);
      
      // Retry logic for network errors
      if (retryCount < 2 && (err.name === 'AbortError' || err.message.includes('fetch failed'))) {
        console.log(`Retrying fetch (attempt ${retryCount + 1}/3)...`);
        setRetrying(true);
        setTimeout(() => {
          fetchTradespeople(page, append, retryCount + 1);
        }, 1000 * (retryCount + 1)); // Exponential backoff
        return;
      }
      
      setError("Failed to fetch tradespeople. Please check your connection and try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRetrying(false);
    }
  };

  const handleLoadMore = () => {
    if (pagination.hasMore && !loadingMore) {
      fetchTradespeople(pagination.page + 1, true);
    }
  };

  const toggleCompare = (id: string) => {
    setCompareSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= 3) return next; // limit to 3
        next.add(id);
      }
      return next;
    });
  };

  // Build a derived, filtered and optionally shortlisted list.
  // The server already strips placeholder / test accounts; this is a
  // defence-in-depth client-side guard so they can never appear if a stale
  // record sneaks through caching.
  const PLACEHOLDER_NAME_PATTERN =
    /\b(test|tester|testing|demo|sample|placeholder|mock|fake|dummy|example|asdf|qwerty|kill|asdas|abcd|xxxx|aaaa)\b/i;
  const isPlaceholderProfile = (p: Tradesperson) => {
    const name = (p.name || "").trim();
    if (!name) return true;
    if (PLACEHOLDER_NAME_PATTERN.test(name)) return true;
    const parts = name.split(/\s+/);
    if (parts.length < 2) return true; // Single-word names look like test accounts
    if (parts.some((part) => part.replace(/[^a-z]/gi, "").length < 2)) return true;
    if (PLACEHOLDER_NAME_PATTERN.test(p.trade || "")) return true;
    return false;
  };

  const derivedList = useMemo(() => {
    const base = [...tradespeople];
    const filtered = base.filter((p) => {
      if (isPlaceholderProfile(p)) return false;
      if (onlyVerified && !p.verified) return false;
      if (minRating !== null && (p.rating || 0) < minRating) return false;
      if (minYearsFlag && (p.yearsExperience || 0) < 5) return false;
      if (minReviews100Flag && (p.reviews || 0) < 100) return false;
      // `onlyAvailableToday` filter currently has no backing data, so it is
      // intentionally a no-op until a real availability field is added.
      return true;
    });
    if (!aiShortlist) return filtered;
    const parseMiles = (d?: string) => {
      if (!d) return Number.POSITIVE_INFINITY;
      const m = parseFloat(d.replace(/[^0-9.]/g, ""));
      return isNaN(m) ? Number.POSITIVE_INFINITY : m;
    };
    filtered.sort((a, b) => {
      const r = (b.rating || 0) - (a.rating || 0);
      if (r !== 0) return r;
      return parseMiles(a.distance) - parseMiles(b.distance);
    });
    return filtered.slice(0, 3);
  }, [tradespeople, onlyVerified, onlyAvailableToday, minRating, aiShortlist, minYearsFlag, minReviews100Flag]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchTradespeople(1, false);
  }, [searchTerm, location, sortBy]);

  const handleSearch = () => {
    fetchTradespeople();
  };

  const handleGetQuote = (tradesperson: Tradesperson) => {
    setSelectedTradesperson(tradesperson);
    setShowQuoteModal(true);
  };

  // ── Google Places fetcher ──
  const fetchGooglePlaces = async (trade: string, coords: { lat: number; lng: number } | null, radiusMeters: number) => {
    setPlacesLoading(true);
    setPlacesError("");
    try {
      const res = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trade, lat: coords?.lat ?? null, lng: coords?.lng ?? null, radiusMeters }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setPlacesError(data.error ?? "Could not load Google Business results.");
        setGooglePlaces([]);
      } else {
        setGooglePlaces(data.places ?? []);
      }
    } catch {
      setPlacesError("Network error fetching Google Business results.");
      setGooglePlaces([]);
    } finally {
      setPlacesLoading(false);
    }
  };

  // Capture user geolocation once on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserCoords(null), // silently fall back to no-coords query
      { timeout: 8000 }
    );
  }, []);

  // Re-fetch whenever selected trade, location, or radius changes
  useEffect(() => {
    fetchGooglePlaces(selectedTrade, userCoords, radiusMiles * 1609);
  }, [selectedTrade, userCoords, radiusMiles]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch live GMB data for Upgrade Roofs whenever Roofer is selected
  useEffect(() => {
    if (selectedTrade !== "Roofer") { setRecommendedPlace(null); return; }
    fetch("/api/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trade: "Upgrade Roofs Sandbach", lat: 53.1467, lng: -2.3641, radiusMeters: 5000 }),
    })
      .then((r) => r.json())
      .then((d) => {
        const match = (d.places ?? []).find((p: GooglePlace) =>
          p.displayName?.text?.toLowerCase().includes("upgrade roofs")
        );
        if (match) setRecommendedPlace(match);
      })
      .catch(() => {});
  }, [selectedTrade]); // eslint-disable-line react-hooks/exhaustive-deps

  // Convert display trade name → URL slug for SEO components
  const tradeSlug = selectedTrade.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* JSON-LD structured data - trade-aware, updates as user switches trade chips */}
      <ProgrammaticSchema
        tradeType={tradeSlug}
        city="United Kingdom"
        averageRating={
          sortedGooglePlaces.length > 0
            ? parseFloat(
                (
                  sortedGooglePlaces.reduce((s, p) => s + (p.rating ?? 0), 0) /
                  sortedGooglePlaces.length
                ).toFixed(1)
              )
            : Number(process.env.NEXT_PUBLIC_AGGREGATE_RATING_VALUE) || 4.9
        }
        reviewCount={
          sortedGooglePlaces.reduce((s, p) => s + (p.userRatingCount ?? 0), 0) || Number(process.env.NEXT_PUBLIC_AGGREGATE_REVIEW_COUNT) || 200
        }
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Trust strip */}
        <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm text-blue-900">
          <span className="inline-flex items-center gap-1.5 sm:gap-2 bg-blue-50 px-2 sm:px-3 py-1 rounded-full ring-1 ring-blue-100">
            <Shield className="w-3 h-3 sm:w-4 sm:h-4" /> 
            <span className="hidden xs:inline">All Trades Verified</span>
            <span className="xs:hidden">Verified</span>
          </span>
          <span className="inline-flex items-center gap-1.5 sm:gap-2 bg-blue-50 px-2 sm:px-3 py-1 rounded-full ring-1 ring-blue-100">
            <Shield className="w-3 h-3 sm:w-4 sm:h-4" /> 
            <span className="hidden xs:inline">Insurance Guaranteed</span>
            <span className="xs:hidden">Insured</span>
          </span>
          <span className="inline-flex items-center gap-1.5 sm:gap-2 bg-blue-50 px-2 sm:px-3 py-1 rounded-full ring-1 ring-blue-100">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" /> 
            <span className="hidden xs:inline">Rated 5.0 by 50,000+ Customers</span>
            <span className="xs:hidden">5.0★ 50K+</span>
          </span>
        </div>
        {/* Search and Filters */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-blue-100 p-4 sm:p-6 mb-6 sm:mb-8">
          {/* Search Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {/* Trade/Service Search */}
            <div className="md:col-span-2">
              <Input
                placeholder="Search by trade or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 sm:h-12 text-sm sm:text-base w-full"
              />
            </div>
            
            {/* Postcode/Location Search */}
            <div>
              <Input
                placeholder="Enter postcode or area"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-11 sm:h-12 text-sm sm:text-base w-full"
              />
            </div>
            
            {/* Search Button - opens AI matcher */}
            <div>
              <Button
                className="h-11 sm:h-12 bg-[#FFB800] hover:bg-[#FFC933] text-[#0f172a] font-bold text-sm sm:text-base w-full"
                onClick={() => window.dispatchEvent(new CustomEvent("open-ai-quote"))}
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span>Get Matched</span>
              </Button>
            </div>
          </div>

          {/* Sort control */}
          <div className="flex items-center gap-3">
            <Select value={placesSortBy} onValueChange={(v) => setPlacesSortBy(v as typeof placesSortBy)}>
              <SelectTrigger className="w-48 h-10 text-sm border-gray-200">
                <SelectValue placeholder="Sort results" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="reviews">Most Reviewed</SelectItem>
                <SelectItem value="closest">Closest to Me</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Live Google Business Profiles ── */}
        <div className="mb-6 sm:mb-8">
          {/* Trade selector chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex-shrink-0 pr-1">
              Near You:
            </span>
            {TRADE_OPTIONS.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTrade(t)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all ring-1 ${
                  selectedTrade === t
                    ? "bg-[#002FA7] text-white ring-[#002FA7]"
                    : "bg-white text-blue-900 ring-blue-100 hover:ring-blue-300"
                }`}
              >
                {t}s
              </button>
            ))}
          </div>

          {/* Radius toggle */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex-shrink-0 pr-1">
              Radius:
            </span>
            {[5, 10, 25, 50].map((miles) => (
              <button
                key={miles}
                onClick={() => setRadiusMiles(miles)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all ring-1 ${
                  radiusMiles === miles
                    ? "bg-[#002FA7] text-white ring-[#002FA7]"
                    : "bg-white text-blue-900 ring-blue-100 hover:ring-blue-300"
                }`}
              >
                {miles} mi
              </button>
            ))}
          </div>

          {placesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-2/3 mb-4" />
                  <div className="h-12 bg-gray-100 rounded mb-4" />
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-8 bg-gray-100 rounded" />
                    <div className="h-8 bg-gray-100 rounded" />
                    <div className="h-8 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : placesError ? (
            // Don't disappear silently when Google rejects the request -
            // show a soft fallback so the user still has a clear next step.
            <div className="rounded-2xl border border-blue-100 bg-white p-6 sm:p-8 text-center">
              <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-2">
                Live results are temporarily unavailable
              </h3>
              <p className="text-sm text-blue-900/70 max-w-md mx-auto mb-5">
                We could not load real-time business listings right now. Post your job
                free and verified MyApproved tradespeople will come to you with quotes.
              </p>
              <a
                href="/post-job"
                className="inline-flex items-center gap-2 bg-[#fdbd18] hover:bg-yellow-400 text-blue-900 font-bold px-5 py-2.5 rounded-full text-sm sm:text-base transition-all"
              >
                Post a job — it&apos;s free
              </a>
            </div>
          ) : sortedGooglePlaces.length > 0 ? (
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {userCoords && <span className="text-xs text-gray-400">Based on your location</span>}
                <span className="text-xs text-gray-400 ml-auto">{sortedGooglePlaces.length} results</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {/* Recommended card - live GMB data for Upgrade Roofs, pinned top on Roofer searches */}
                {selectedTrade === "Roofer" && (() => {
                  const rp = recommendedPlace;
                  const rpName       = rp?.displayName?.text ?? "Upgrade Roofs";
                  const rpRating     = rp?.rating ?? 5.0;
                  const rpReviews    = rp?.userRatingCount ?? 104;
                  const rpPhone      = rp?.internationalPhoneNumber ?? "+44 1270 897606";
                  const rpWebsite    = rp?.websiteUri;
                  const rpAddress    = rp?.shortFormattedAddress ?? "20 Crewe Rd, Sandbach CW11 4NE";
                  const rpPostcode   = rp?.addressComponents?.find((c: any) => c.types?.includes("postal_code"))?.longText ?? "CW11 4NE";
                  const rpIsOpen     = rp?.regularOpeningHours?.openNow;
                  const rpNextOpen   = rp ? getNextOpenTime(rp.regularOpeningHours) : null;
                  const rpLat        = rp?.location?.latitude ?? 53.1467;
                  const rpLng        = rp?.location?.longitude ?? -2.3641;
                  const rpFilledStars = Math.round(rpRating);
                  const rpDirections = `https://www.google.com/maps/dir/?api=1&destination=${rpLat},${rpLng}`;
                  const rpFullAddress = [rpAddress, rpPostcode].filter(Boolean).join(", ");

                  return (
                    <div className="rounded-xl border-2 border-[#002FA7] bg-white shadow-md p-4 flex flex-col relative overflow-hidden">
                      {/* Recommended pill */}
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#002FA7] text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                        <Image src="/logo-icon.svg" alt="myapproved" width={10} height={10} />
                        Recommended
                      </div>

                      {/* Business name */}
                      <h4 className="text-[15px] font-bold text-[#0f172a] leading-snug mb-1 pr-28">
                        {rpName}
                      </h4>

                      {/* Stars + review count + type */}
                      <div className="flex items-center flex-wrap gap-1 text-sm mb-1">
                        <span className="font-semibold text-gray-900">{rpRating.toFixed(1)}</span>
                        <span className="text-yellow-400 text-xs tracking-tight">
                          {"★".repeat(rpFilledStars)}{"☆".repeat(Math.max(0, 5 - rpFilledStars))}
                        </span>
                        <span className="text-gray-500 text-xs">({rpReviews.toLocaleString()})</span>
                        <span className="text-gray-300 text-xs">·</span>
                        <span className="text-gray-500 text-xs">{rp?.primaryTypeDisplayName?.text ?? "Roofing service"}</span>
                      </div>

                      {/* Address */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                        <MapPin className="w-3 h-3 flex-shrink-0 text-gray-400" />
                        <span>{rpFullAddress}</span>
                      </div>

                      {/* Open status */}
                      <div className="flex items-center gap-1 text-xs mb-3">
                        {rpIsOpen != null ? (
                          <span className={rpIsOpen ? "font-semibold text-green-600" : "text-gray-500"}>
                            {rpIsOpen ? "Open" : "Closed"}
                          </span>
                        ) : (
                          <span className="font-semibold text-green-600">Open</span>
                        )}
                        {!rpIsOpen && rpNextOpen && (
                          <>
                            <span className="text-gray-300">·</span>
                            <span className="text-gray-500">Opens {rpNextOpen}</span>
                          </>
                        )}
                        {rpPhone && (
                          <>
                            <span className="text-gray-300">·</span>
                            <span className="text-gray-500">{rpPhone}</span>
                          </>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">
                        {rp?.editorialSummary?.text ?? "Local roofing specialists in Sandbach - repairs, replacements, and guttering across Cheshire."}
                      </p>

                      <div className="h-px bg-gray-100 mb-3" />

                      {/* Action strip */}
                      <div className="grid grid-cols-3 gap-1.5">
                        <a
                          href={`tel:${rpPhone.replace(/\s/g, "")}`}
                          onClick={() => trackInteraction(rpName, "call_click")}
                          className="inline-flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg bg-[#fdbd18] text-[#0f172a] text-[11px] font-semibold hover:brightness-95 transition-all"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Call
                        </a>
                        <a
                          href={rpWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackInteraction(rpName, "website_click")}
                          className={`inline-flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg bg-[#002FA7] text-white text-[11px] font-semibold hover:bg-[#001f7a] transition-colors ${!rpWebsite ? "opacity-40 pointer-events-none" : ""}`}
                        >
                          <Globe className="w-3.5 h-3.5" />
                          Website
                        </a>
                        <a
                          href={rpDirections}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackInteraction(rpName, "directions_click")}
                          className="inline-flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg bg-[#002FA7] text-white text-[11px] font-semibold hover:bg-[#001f7a] transition-colors"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          Directions
                        </a>
                      </div>
                    </div>
                  );
                })()}

                {sortedGooglePlaces.map((place, idx) => {
                  const name            = place.displayName?.text ?? "Unknown Business";
                  const rating          = place.rating;
                  const reviewCount     = place.userRatingCount;
                  const primaryType     = place.primaryTypeDisplayName?.text;
                  const address         = place.shortFormattedAddress;
                  const postcode        = place.addressComponents?.find(c => c.types?.includes("postal_code"))?.longText;
                  const isOpen          = place.regularOpeningHours?.openNow;
                  const nextOpen        = getNextOpenTime(place.regularOpeningHours);
                  const phone           = place.internationalPhoneNumber;
                  const website         = place.websiteUri;
                  const summary         = place.editorialSummary?.text;
                  const reviewText      = place.contextualContents?.[0]?.reviews?.[0]?.text?.text;
                  const filledStars     = rating ? Math.round(rating) : 0;
                  const lat             = place.location?.latitude;
                  const lng             = place.location?.longitude;
                  const directionsUrl   = lat && lng
                    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
                    : address
                    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
                    : null;

                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                      onClick={() => trackInteraction(name, "view_profile")}
                    >
                      {/* Row 1 - Business name */}
                      <h4 className="text-[15px] font-bold text-[#0f172a] leading-snug mb-1">
                        {name}
                      </h4>

                      {/* Row 2 - Rating · Type */}
                      <div className="flex items-center flex-wrap gap-1 text-sm mb-1">
                        {rating != null && (
                          <>
                            <span className="font-semibold text-gray-900">{rating.toFixed(1)}</span>
                            <span className="text-yellow-400 leading-none tracking-tight text-xs">
                              {"★".repeat(filledStars)}{"☆".repeat(Math.max(0, 5 - filledStars))}
                            </span>
                            {reviewCount != null && (
                              <span className="text-gray-500 text-xs">({reviewCount.toLocaleString()})</span>
                            )}
                          </>
                        )}
                        {primaryType && (
                          <>
                            <span className="text-gray-300 text-xs">·</span>
                            <span className="text-gray-500 text-xs">{primaryType}</span>
                          </>
                        )}
                      </div>

                      {/* Row 3 - Address + Postcode */}
                      {(address || postcode) && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1 flex-wrap">
                          <MapPin className="w-3 h-3 flex-shrink-0 text-gray-400" />
                          <span>
                            {[address, postcode].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      )}

                      {/* Row 4 - Open status · Next open time · Phone */}
                      <div className="flex items-center flex-wrap gap-1 text-xs mb-3">
                        {isOpen != null && (
                          <span className={isOpen ? "font-semibold text-green-600" : "text-gray-500"}>
                            {isOpen ? "Open" : "Closed"}
                          </span>
                        )}
                        {!isOpen && nextOpen && (
                          <>
                            <span className="text-gray-300">·</span>
                            <span className="text-gray-500">Opens {nextOpen}</span>
                          </>
                        )}
                        {phone && (
                          <>
                            <span className="text-gray-300">·</span>
                            <a
                              href={`tel:${phone.replace(/\s/g, "")}`}
                              className="text-gray-500 hover:text-[#002FA7] transition-colors"
                              onClick={(e) => { e.stopPropagation(); trackInteraction(name, "call_click"); }}
                            >
                              {phone}
                            </a>
                          </>
                        )}
                      </div>

                      {/* Row 5 - Editorial summary or review snippet */}
                      {(summary || reviewText) && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">
                          {summary ?? `"${reviewText}"`}
                        </p>
                      )}

                      {/* Divider */}
                      <div className="h-px bg-gray-100 mb-3" />

                      {/* 3-column action strip */}
                      <div className="grid grid-cols-3 gap-1.5">
                        <a
                          href={phone ? `tel:${phone.replace(/\s/g, "")}` : undefined}
                          onClick={(e) => { e.stopPropagation(); trackInteraction(name, "call_click"); }}
                          className={`inline-flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg bg-[#fdbd18] text-[#0f172a] text-[11px] font-semibold hover:brightness-95 transition-all ${!phone ? "opacity-40 pointer-events-none" : ""}`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Call
                        </a>
                        <a
                          href={website ?? undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => { e.stopPropagation(); trackInteraction(name, "website_click"); }}
                          className={`inline-flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg bg-[#002FA7] text-white text-[11px] font-semibold hover:bg-[#001f7a] transition-colors ${!website ? "opacity-40 pointer-events-none" : ""}`}
                        >
                          <Globe className="w-3.5 h-3.5" />
                          Website
                        </a>
                        <a
                          href={directionsUrl ?? undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => { e.stopPropagation(); trackInteraction(name, "directions_click"); }}
                          className={`inline-flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg bg-[#002FA7] text-white text-[11px] font-semibold hover:bg-[#001f7a] transition-colors ${!directionsUrl ? "opacity-40 pointer-events-none" : ""}`}
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          Directions
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        {/* AEO answer block - appears after search results, before sidebar listings */}
        <AEOContentBlock
          tradeType={tradeSlug}
          city="the UK"
          reviewCount={sortedGooglePlaces.reduce((s, p) => s + (p.userRatingCount ?? 0), 0) || 850}
          className="rounded-xl sm:rounded-2xl border-blue-100 shadow-sm mb-6 sm:mb-8"
        />

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Tradespeople Listings */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {loading ? (
              <div className="grid gap-6">
                {retrying && (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center gap-2 text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      Retrying connection...
                    </div>
                  </div>
                )}
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-blue-100 bg-white shadow-sm p-6 animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-xl bg-blue-100" />
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-blue-100 rounded w-1/3" />
                        <div className="h-4 bg-blue-50 rounded w-1/2" />
                        <div className="h-3 bg-blue-50 rounded w-3/4" />
                        <div className="h-10 bg-blue-50 rounded w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => fetchTradespeople(1, false)} className="bg-[#002FA7] hover:bg-[#00207a]">
                    Try Again
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setError("");
                      setSearchTerm("");
                      setLocation("");
                      fetchTradespeople(1, false);
                    }}
                  >
                    Clear Filters & Retry
                  </Button>
                </div>
              </div>
            ) : tradespeople.length === 0 ? (
              null
            ) : derivedList.length === 0 ? (
              null
            ) : (
              (() => {
                return derivedList.map((person) => {
                  const ratingText = person.reviews > 0
                    ? `${person.rating.toFixed(1)}`
                    : "New on MyApproved";
                  return (
                    <Card
                      key={person.id}
                      className="rounded-xl sm:rounded-2xl border border-blue-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <CardContent className="p-3 sm:p-4 lg:p-6">
                        <div className="flex items-start gap-3 sm:gap-4">
                          {/* Compare checkbox */}
                          <div className="pt-1">
                            <input
                              type="checkbox"
                              checked={compareSet.has(person.id)}
                              onChange={() => toggleCompare(person.id)}
                              aria-label={`Select ${person.name} for comparison`}
                              className="w-4 h-4 accent-blue-600"
                            />
                          </div>
                          {person.image ? (
                            <img
                              src={person.image}
                              alt={person.name}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl object-cover ring-1 ring-blue-100"
                            />
                          ) : (
                            <InitialsAvatar
                              initials={person.initials}
                              size="lg"
                              className="w-16 h-16 sm:w-20 sm:h-20"
                            />
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg sm:text-xl font-extrabold text-blue-900 flex items-center gap-2">
                                  <span className="truncate">{person.name}</span>
                                  {person.verified && (
                                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: '#fdbd18' }} />
                                  )}
                                </h3>
                                {person.verified && (
                                  <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 ring-2 ring-white flex-shrink-0">
                                    <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                                  </span>
                                )}
                              </div>
                              <div className="text-left sm:text-right">
                                {person.hourlyRate && (
                                  <div className="text-base sm:text-lg font-bold text-blue-900">
                                    {person.hourlyRate}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 text-xs sm:text-sm">
                              <span className="bg-blue-50 px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1 text-blue-900">
                                {ratingText}
                                {person.reviews > 0 && (
                                  <Star className="inline w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                                )}
                                {person.reviews > 0 && (
                                  <>
                                    <span className="text-blue-700/70 hidden xs:inline">({person.reviews} reviews)</span>
                                    <span className="text-blue-700/70 xs:hidden">({person.reviews})</span>
                                  </>
                                )}
                              </span>
                              <span className="bg-yellow-50 px-2 sm:px-3 py-1 rounded-full font-semibold inline-flex items-center gap-1 text-blue-900">
                                {person.trade}
                              </span>
                              <span className="bg-gray-100 px-2 sm:px-3 py-1 rounded-full font-semibold inline-flex items-center gap-1 text-blue-900">
                                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" /> 
                                <span className="hidden xs:inline">{person.location}</span>
                                <span className="xs:hidden truncate max-w-20">{person.location}</span>
                              </span>
                              {person.yearsExperience > 0 && (
                                <span className="text-blue-800/80 font-medium">
                                  <span className="hidden sm:inline">{person.yearsExperience} years experience</span>
                                  <span className="sm:hidden">{person.yearsExperience}y exp</span>
                                </span>
                              )}
                            </div>

                            {person.description && (
                              <p className="text-blue-900/90 mb-3 sm:mb-4 text-sm sm:text-base line-clamp-2">
                                {person.description}
                              </p>
                            )}

                            <div className="w-full h-px bg-blue-50 my-2 sm:my-3" />

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 sm:mt-4 gap-3">
                              <div className="flex flex-col sm:flex-row gap-2">
                                <Button variant="outline" size="sm" className="border-blue-200 text-blue-900 hover:bg-blue-50 text-xs sm:text-sm" asChild>
                                  <Link href={`/tradesperson/${person.id}`}>
                                    <span className="hidden sm:inline">View Profile</span>
                                    <span className="sm:hidden">View Profile</span>
                                  </Link>
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-[#fdbd18] hover:brightness-95 text-blue-900 font-bold inline-flex items-center text-xs sm:text-sm"
                                  onClick={() => handleGetQuote(person)}
                                >
                                  <span className="hidden sm:inline">Get My Free Quote</span>
                                  <span className="sm:hidden">Get Quote</span>
                                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                });
              })()
            )}

            {/* Load More */}
            {tradespeople.length > 0 && (
              <div className="text-center">
                {pagination.hasMore ? (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="w-full sm:w-auto"
                  >
                    {loadingMore ? "Loading..." : "Load More Results"}
                  </Button>
                ) : (
                  <p className="text-gray-500 text-sm">No more results to load</p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Featured CTA */}
            <Card className="bg-gradient-to-br from-blue-900 to-blue-700 text-white border-0">
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-extrabold text-lg sm:text-xl mb-1">Need Help Choosing?</h3>
                <p className="text-blue-100 mb-3 sm:mb-4 text-xs sm:text-sm">Post your job for free and let verified tradespeople come to you with quotes.</p>
                <Button className="w-full bg-[#fdbd18] hover:brightness-95 text-blue-900 font-bold text-sm sm:text-base" asChild>
                  <Link href="/login/client">Post a Job</Link>
                </Button>
                <span className="block mt-2 text-[10px] sm:text-[12px] text-blue-100">Same‑day responses from local pros</span>
              </CardContent>
            </Card>
          </div>
        </div>

      {/* Get Quote Modal */}
      {selectedTradesperson && (
        <GetQuoteModal
          isOpen={showQuoteModal}
          onClose={() => {
            setShowQuoteModal(false);
            setSelectedTradesperson(null);
          }}
          tradesperson={{
            id: selectedTradesperson.id,
            name: selectedTradesperson.name,
            trade: selectedTradesperson.trade,
          }}
        />
      )}

      {/* Post a Job Modal */}
      <Dialog open={showPostJob} onOpenChange={setShowPostJob}>
        <DialogContent className="max-w-sm sm:max-w-lg mx-4">
          <h3 className="text-lg sm:text-xl font-extrabold text-blue-900 mb-1">Post a Job</h3>
          <p className="text-xs sm:text-sm text-blue-800/80 mb-3 sm:mb-4">Tell us what you need and get up to 3 free quotes.</p>
          <div className="space-y-3">
            <Input
              placeholder="Trade (e.g., Electrician, Plumber)"
              value={jobForm.trade}
              onChange={(e) => setJobForm({ ...jobForm, trade: e.target.value })}
              className="text-sm sm:text-base"
            />
            <Input
              placeholder="Postcode (e.g., SW1A 1AA)"
              value={jobForm.postcode}
              onChange={(e) => setJobForm({ ...jobForm, postcode: e.target.value })}
              className="text-sm sm:text-base"
            />
            <Textarea
              placeholder="Briefly describe the job"
              value={jobForm.description}
              onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
              className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
            />
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowPostJob(false)} className="w-full sm:w-auto text-sm">Cancel</Button>
            <Button
              className="bg-[#fdbd18] text-blue-900 font-bold hover:brightness-95 w-full sm:w-auto text-sm"
              onClick={() => {
                // TODO: submit to API
                setShowPostJob(false);
              }}
            >
              Get 3 Free Quotes
            </Button>
          </div>
          <span className="block mt-2 text-[10px] sm:text-[12px] text-blue-800/80">Same‑day responses from local pros</span>
        </DialogContent>
      </Dialog>

      {/* Compare Modal */}
      <Dialog open={showCompareModal} onOpenChange={setShowCompareModal}>
        <DialogContent className="max-w-sm sm:max-w-4xl lg:max-w-6xl max-h-[90vh] overflow-y-auto mx-4">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-blue-900 mb-3 sm:mb-4">Compare Tradespeople</h3>
          <p className="text-xs sm:text-sm text-blue-800/80 mb-4 sm:mb-6">Compare the selected tradespeople side by side to make the best choice.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {tradespeople.filter(p => compareSet.has(p.id)).map((person) => {
              const ratingText = person.reviews > 0
                ? `${person.rating.toFixed(1)}`
                : "New on MyApproved";
              
              return (
                <Card key={person.id} className="border border-blue-100 bg-white shadow-sm">
                  <CardContent className="p-4 sm:p-6">
                    <div className="text-center mb-3 sm:mb-4">
                      {person.image ? (
                        <img
                          src={person.image}
                          alt={person.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl object-cover ring-1 ring-blue-100 mx-auto mb-2 sm:mb-3"
                        />
                      ) : (
                        <InitialsAvatar
                          initials={person.initials}
                          size="lg"
                          className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 sm:mb-3"
                        />
                      )}
                      <h4 className="text-lg sm:text-xl font-extrabold text-blue-900 flex items-center justify-center gap-2">
                        <span className="truncate">{person.name}</span>
                        {person.verified && (
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: '#fdbd18' }} />
                        )}
                      </h4>
                      <p className="text-blue-800/80 font-medium text-sm sm:text-base">{person.trade}</p>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm font-medium text-blue-900">Rating</span>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-blue-900 text-xs sm:text-sm">{ratingText}</span>
                          {person.reviews > 0 && <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />}
                          {person.reviews > 0 && (
                            <span className="text-xs sm:text-sm text-blue-700/70">({person.reviews})</span>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm font-medium text-blue-900">Experience</span>
                        <span className="text-xs sm:text-sm text-blue-800">{person.yearsExperience}y</span>
                      </div>

                      {person.hourlyRate && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm font-medium text-blue-900">Hourly Rate</span>
                          <span className="text-xs sm:text-sm font-bold text-blue-900">{person.hourlyRate}</span>
                        </div>
                      )}

                      {person.location && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm font-medium text-blue-900">Location</span>
                          <span className="text-xs sm:text-sm text-blue-800 flex items-center gap-1">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="truncate max-w-20 sm:max-w-none">{person.location}</span>
                          </span>
                        </div>
                      )}

                      <div className="pt-2 sm:pt-3 border-t border-blue-50">
                        <p className="text-xs sm:text-sm text-blue-900/90 mb-2 sm:mb-3 line-clamp-2">{person.description}</p>
                        
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 border-blue-200 text-blue-900 hover:bg-blue-50 text-xs sm:text-sm"
                            asChild
                          >
                            <Link href={`/tradesperson/${person.id}`}>
                              View Profile
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 bg-[#fdbd18] hover:brightness-95 text-blue-900 font-bold text-xs sm:text-sm"
                            onClick={() => {
                              setSelectedTradesperson(person);
                              setShowQuoteModal(true);
                              setShowCompareModal(false);
                            }}
                          >
                            Get Quote
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCompareModal(false)} className="w-full sm:w-auto text-sm">
              Close
            </Button>
            <Button 
              className="bg-[#fdbd18] text-blue-900 font-bold hover:brightness-95 w-full sm:w-auto text-sm"
              onClick={() => {
                setShowCompareModal(false);
                setCompareSet(new Set());
              }}
            >
              Clear Selection
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom Compare Strip */}
      {compareSet.size > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-blue-100 shadow-2xl z-50">
          <Container size="wide" className="py-2 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto w-full sm:w-auto">
              <span className="text-xs sm:text-sm font-semibold text-blue-900 flex-shrink-0">Selected ({compareSet.size}/3):</span>
              {tradespeople.filter(p => compareSet.has(p.id)).map(p => (
                <span key={p.id} className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full bg-blue-50 ring-1 ring-blue-100 text-blue-900 text-xs sm:text-sm flex-shrink-0">
                  <span className="truncate max-w-20 sm:max-w-none">{p.name}</span>
                  <button className="text-blue-700 hover:text-blue-900 flex-shrink-0" onClick={() => toggleCompare(p.id)} aria-label={`Remove ${p.name}`}>×</button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" className="border-blue-200 text-blue-900 flex-1 sm:flex-none text-xs sm:text-sm" onClick={() => setCompareSet(new Set())}>Clear</Button>
              <Button className="bg-[#fdbd18] text-blue-900 font-bold hover:brightness-95 flex-1 sm:flex-none text-xs sm:text-sm" onClick={() => setShowCompareModal(true)}>Compare</Button>
            </div>
          </Container>
        </div>
      )}
    </div>
    </div>
  );
}