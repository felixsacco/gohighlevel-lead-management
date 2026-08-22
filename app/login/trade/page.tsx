// @ts-nocheck
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Mail, Lock, User, Shield, Star, CheckCircle, Loader2, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import SectionHeaderPill from "@/components/ui/SectionHeaderPill";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase-client";
import { motion, AnimatePresence } from "framer-motion";

export default function TradespersonLoginPage() {
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState("");
  const [rememberMe, setRememberMe]   = useState(false);
  const [onlineCount, setOnlineCount] = useState(180);
  const [mapTooltip, setMapTooltip]   = useState<{
    x: number; y: number;
    trade: string; color: string; name: string;
    rating: number; reviews: number; city: string; responseTime: string;
  } | null>(null);

  const router           = useRouter();
  const mapContainerRef  = useRef<HTMLDivElement>(null);
  const mapInstanceRef   = useRef<any>(null);

  const tradeCategories = useMemo(() => [
    { name: "Plumber",      color: "#2563eb" },
    { name: "Electrician",  color: "#facc15" },
    { name: "Builder",      color: "#16a34a" },
    { name: "Cleaner",      color: "#9333ea" },
    { name: "Roofer",       color: "#ea580c" },
    { name: "Carpenter",    color: "#0ea5e9" },
  ], []);

  const ukCities = useMemo(() => [
    { name: "London",           lat: 51.5074, lon: -0.1278 },
    { name: "Manchester",       lat: 53.4808, lon: -2.2426 },
    { name: "Birmingham",       lat: 52.4862, lon: -1.8904 },
    { name: "Leeds",            lat: 53.8008, lon: -1.5491 },
    { name: "Liverpool",        lat: 53.4084, lon: -2.9916 },
    { name: "Newcastle",        lat: 54.9783, lon: -1.6178 },
    { name: "Sheffield",        lat: 53.3811, lon: -1.4701 },
    { name: "Bristol",          lat: 51.4545, lon: -2.5879 },
    { name: "Nottingham",       lat: 52.9548, lon: -1.1581 },
    { name: "Leicester",        lat: 52.6369, lon: -1.1398 },
    { name: "Coventry",         lat: 52.4068, lon: -1.5197 },
    { name: "Stoke-on-Trent",   lat: 53.0027, lon: -2.1794 },
    { name: "Wolverhampton",    lat: 52.5862, lon: -2.1288 },
    { name: "Plymouth",         lat: 50.3755, lon: -4.1427 },
    { name: "Exeter",           lat: 50.7184, lon: -3.5339 },
    { name: "Norwich",          lat: 52.6309, lon:  1.2974 },
    { name: "York",             lat: 53.9590, lon: -1.0815 },
    { name: "Brighton",         lat: 50.8225, lon: -0.1372 },
    { name: "Southampton",      lat: 50.9097, lon: -1.4043 },
    { name: "Portsmouth",       lat: 50.8198, lon: -1.0880 },
    { name: "Hull",             lat: 53.7457, lon: -0.3367 },
    { name: "Derby",            lat: 52.9225, lon: -1.4746 },
    { name: "Bournemouth",      lat: 50.7192, lon: -1.8808 },
    { name: "Reading",          lat: 51.4543, lon: -0.9781 },
    { name: "Milton Keynes",    lat: 52.0406, lon: -0.7594 },
    { name: "Oxford",           lat: 51.7520, lon: -1.2577 },
    { name: "Cambridge",        lat: 52.2053, lon:  0.1218 },
    { name: "Gloucester",       lat: 51.8642, lon: -2.2380 },
    { name: "Blackpool",        lat: 53.8175, lon: -3.0357 },
    { name: "Preston",          lat: 53.7632, lon: -2.7031 },
    { name: "Blackburn",        lat: 53.7480, lon: -2.4829 },
    { name: "Ipswich",          lat: 52.0567, lon:  1.1482 },
    { name: "Luton",            lat: 51.8787, lon: -0.4200 },
    { name: "Swindon",          lat: 51.5558, lon: -1.7797 },
    { name: "Peterborough",     lat: 52.5695, lon: -0.2525 },
    { name: "Warrington",       lat: 53.3927, lon: -2.5870 },
    { name: "Stockport",        lat: 53.4106, lon: -2.1575 },
    { name: "Bolton",           lat: 53.5769, lon: -2.4282 },
    { name: "Bradford",         lat: 53.7960, lon: -1.7594 },
    { name: "Huddersfield",     lat: 53.6458, lon: -1.7850 },
    { name: "Harrogate",        lat: 53.9919, lon: -1.5378 },
    { name: "Middlesbrough",    lat: 54.5764, lon: -1.2343 },
    { name: "Durham",           lat: 54.7753, lon: -1.5849 },
    { name: "Carlisle",         lat: 54.8951, lon: -2.9352 },
    { name: "Lancaster",        lat: 54.0464, lon: -2.8006 },
    { name: "Chester",          lat: 53.1896, lon: -2.8916 },
    { name: "Lincoln",          lat: 53.2307, lon: -0.5406 },
    { name: "Doncaster",        lat: 53.5228, lon: -1.1286 },
    { name: "Wakefield",        lat: 53.6830, lon: -1.4977 },
    { name: "Bath",             lat: 51.3751, lon: -2.3601 },
    { name: "Cheltenham",       lat: 51.8994, lon: -2.0783 },
    { name: "Worcester",        lat: 52.1938, lon: -2.2219 },
    { name: "Shrewsbury",       lat: 52.7077, lon: -2.7540 },
    { name: "Glasgow",          lat: 55.8642, lon: -4.2518 },
    { name: "Edinburgh",        lat: 55.9533, lon: -3.1883 },
    { name: "Aberdeen",         lat: 57.1497, lon: -2.0943 },
    { name: "Dundee",           lat: 56.4620, lon: -2.9707 },
    { name: "Inverness",        lat: 57.4778, lon: -4.2247 },
    { name: "Stirling",         lat: 56.1165, lon: -3.9369 },
    { name: "Perth",            lat: 56.3950, lon: -3.4306 },
    { name: "Motherwell",       lat: 55.7919, lon: -3.9895 },
    { name: "Paisley",          lat: 55.8457, lon: -4.4239 },
    { name: "Cardiff",          lat: 51.4816, lon: -3.1791 },
    { name: "Swansea",          lat: 51.6214, lon: -3.9436 },
    { name: "Newport",          lat: 51.5842, lon: -2.9977 },
    { name: "Wrexham",          lat: 53.0430, lon: -2.9925 },
    { name: "Merthyr Tydfil",   lat: 51.7430, lon: -3.3784 },
    { name: "Belfast",          lat: 54.5973, lon: -5.9301 },
    { name: "Derry",            lat: 54.9966, lon: -7.3084 },
    { name: "Lisburn",          lat: 54.5122, lon: -6.0311 },
    { name: "Armagh",           lat: 54.3503, lon: -6.6528 },
    { name: "Guildford",        lat: 51.2362, lon: -0.5704 },
    { name: "Basingstoke",      lat: 51.2667, lon: -1.0876 },
    { name: "Maidstone",        lat: 51.2720, lon:  0.5240 },
    { name: "Canterbury",       lat: 51.2802, lon:  1.0789 },
    { name: "Colchester",       lat: 51.8959, lon:  0.8919 },
    { name: "Northampton",      lat: 52.2405, lon: -0.9027 },
    { name: "Kettering",        lat: 52.3931, lon: -0.7239 },
    { name: "Rugby",            lat: 52.3702, lon: -1.2658 },
    { name: "Tamworth",         lat: 52.6330, lon: -1.6958 },
    { name: "Stafford",         lat: 52.8062, lon: -2.1218 },
    { name: "Walsall",          lat: 52.5858, lon: -1.9823 },
    { name: "Nuneaton",         lat: 52.5235, lon: -1.4652 },
    { name: "Loughborough",     lat: 52.7727, lon: -1.2058 },
    { name: "Grimsby",          lat: 53.5675, lon: -0.0804 },
    { name: "Barnsley",         lat: 53.5527, lon: -1.4797 },
    { name: "Rotherham",        lat: 53.4297, lon: -1.3563 },
    { name: "Scarborough",      lat: 54.2780, lon: -0.4040 },
    { name: "Darlington",       lat: 54.5239, lon: -1.5534 },
    { name: "Torquay",          lat: 50.4619, lon: -3.5251 },
    { name: "Taunton",          lat: 51.0132, lon: -3.1067 },
    { name: "Yeovil",           lat: 50.9435, lon: -2.6417 },
    { name: "Chelmsford",       lat: 51.7356, lon:  0.4685 },
    { name: "Watford",          lat: 51.6562, lon: -0.3904 },
    { name: "Slough",           lat: 51.5105, lon: -0.5950 },
    { name: "Eastbourne",       lat: 50.7680, lon:  0.2905 },
    { name: "Hastings",         lat: 50.8543, lon:  0.5720 },
    { name: "Basildon",         lat: 51.5724, lon:  0.4708 },
    { name: "Stevenage",        lat: 51.9038, lon: -0.2026 },
    { name: "St Albans",        lat: 51.7527, lon: -0.3395 },
    { name: "Crawley",          lat: 51.1091, lon: -0.1872 },
    { name: "Worthing",         lat: 50.8145, lon: -0.3719 },
    { name: "Southend-on-Sea",  lat: 51.5459, lon:  0.7077 },
    { name: "Bury",             lat: 53.5933, lon: -2.2967 },
    { name: "Oldham",           lat: 53.5417, lon: -2.1171 },
    { name: "Wigan",            lat: 53.5449, lon: -2.6311 },
    { name: "Crewe",            lat: 53.0987, lon: -2.4446 },
    { name: "Birkenhead",       lat: 53.3934, lon: -3.0141 },
    { name: "Southport",        lat: 53.6469, lon: -3.0101 },
    { name: "Kendal",           lat: 54.3280, lon: -2.7489 },
    { name: "Hartlepool",       lat: 54.6854, lon: -1.2148 },
    { name: "Stockton-on-Tees", lat: 54.5685, lon: -1.3162 },
    { name: "Croydon",          lat: 51.3762, lon: -0.0982 },
    { name: "Bromley",          lat: 51.4056, lon:  0.0143 },
    { name: "Ayr",              lat: 55.4586, lon: -4.6292 },
    { name: "Kilmarnock",       lat: 55.6125, lon: -4.4957 },
    { name: "Hamilton",         lat: 55.7790, lon: -4.0542 },
    { name: "Falkirk",          lat: 56.0010, lon: -3.7850 },
    { name: "Dunfermline",      lat: 56.0719, lon: -3.4392 },
    { name: "Rhyl",             lat: 53.3191, lon: -3.4916 },
    { name: "Bangor",           lat: 53.2270, lon: -4.1290 },
    { name: "Llandudno",        lat: 53.3240, lon: -3.8270 },
    { name: "Aberystwyth",      lat: 52.4153, lon: -4.0820 },
    { name: "Carmarthen",       lat: 51.8570, lon: -4.3120 },
    { name: "Llanelli",         lat: 51.6840, lon: -4.1630 },
    { name: "Bridgend",         lat: 51.5060, lon: -3.5780 },
    { name: "Newry",            lat: 54.1740, lon: -6.3370 },
    { name: "Coleraine",        lat: 55.1310, lon: -6.6740 },
    { name: "Fort William",     lat: 56.8198, lon: -5.1052 },
    { name: "Oban",             lat: 56.4152, lon: -5.4710 },
    { name: "Galashiels",       lat: 55.6140, lon: -2.8070 },
    { name: "Dumfries",         lat: 55.0709, lon: -3.6051 },
    { name: "Stranraer",        lat: 54.9015, lon: -5.0237 },
    { name: "Holyhead",         lat: 53.3094, lon: -4.6328 },
    { name: "Pwllheli",         lat: 52.8873, lon: -4.4183 },
    { name: "Fishguard",        lat: 51.9944, lon: -4.9767 },
    { name: "Tenby",            lat: 51.6720, lon: -4.7040 },
    { name: "Brecon",           lat: 51.9480, lon: -3.3910 },
    { name: "Enniskillen",      lat: 54.3460, lon: -7.6400 },
    { name: "Omagh",            lat: 54.5980, lon: -7.2980 },
    { name: "Ballymena",        lat: 54.8660, lon: -6.2820 },
    { name: "Bury St Edmunds",  lat: 52.2469, lon:  0.7100 },
    { name: "Kingston upon Hull", lat: 53.7680, lon: -0.3360 },
    { name: "Penzance",         lat: 50.1188, lon: -5.5370 },
    { name: "Truro",            lat: 50.2590, lon: -5.0510 },
    { name: "Barnstaple",       lat: 51.0780, lon: -4.0580 },
    { name: "St Austell",       lat: 50.3360, lon: -4.7960 },
  ], []);

  const handleMarkerClick = (trade: string, city: string) => {
    router.push(`/find-tradespeople?search=${encodeURIComponent(trade)}&location=${encodeURIComponent(city)}`);
  };

  // ── Leaflet map - identical to client page ──────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;
    let active = true;

    const TRADE_NAMES: Record<string, string[]> = {
      Plumber:     ["Elite Plumbing & Heating","FastFlow Plumbers","City Plumbing Co.","AquaTech Services","Premier Pipe Solutions"],
      Electrician: ["Bright Sparks Electrical","PowerPro Electric","Volt Masters","City Electrics","WattWise Solutions"],
      Builder:     ["Premium Build Group","City Builders Ltd","Heritage Construction","Pro Build Services","Structure Masters"],
      Cleaner:     ["Pristine Clean Co.","Crystal Clear Services","SparkleTeam","Elite Cleaning","Fresh Start Cleaners"],
      Roofer:      ["Apex Roofing","TopShield Roofers","SkyHigh Roofing","Premier Roof Care","ArrowHead Roofing"],
      Carpenter:   ["Master Craft Carpentry","OakWorks Joinery","Fine Woodcraft","Timber Pro","Heritage Joinery"],
    };
    const RESPONSE_TIMES = ["5 min","8 min","12 min","15 min","20 min","25 min"];

    const init = async () => {
      try {
        const L = (await import("leaflet")).default;
        const extraMarkers = await import("leaflet-extra-markers");
        if (!active || !mapContainerRef.current) return;

        if (!document.getElementById("leaflet-css")) {
          const link = document.createElement("link");
          link.id = "leaflet-css"; link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }
        if (!document.getElementById("leaflet-map-styles")) {
          const style = document.createElement("style");
          style.id = "leaflet-map-styles";
          style.textContent = `
            @keyframes dotPulse {
              0%   { transform:scale(1);   opacity:0.12; }
              70%  { transform:scale(1.45);opacity:0;    }
              100% { transform:scale(1.45);opacity:0;    }
            }
            .leaflet-control-zoom a {
              background:#1e3a8a !important; color:#fff !important;
              border-color:rgba(255,255,255,0.25) !important; font-weight:700 !important;
            }
            .leaflet-control-zoom a:hover { background:#1e40af !important; }
            .leaflet-control-attribution {
              background:rgba(10,10,15,0.75) !important;
              color:rgba(255,255,255,0.2) !important; font-size:8px !important;
            }
            .leaflet-control-attribution a { color:rgba(245,166,35,0.4) !important; }
          `;
          document.head.appendChild(style);
        }

        const map = L.map(mapContainerRef.current, {
          zoomControl: true, attributionControl: true,
          dragging: true, scrollWheelZoom: false,
          doubleClickZoom: true, touchZoom: false,
          boxZoom: false, keyboard: false,
          minZoom: 5, maxZoom: 10,
        });

        map.on("click",    () => map.scrollWheelZoom.enable());
        map.on("mouseout", () => map.scrollWheelZoom.disable());

        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
          subdomains: "abcd", maxZoom: 20,
          attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> &copy; <a href=\"https://carto.com/attributions\">CARTO</a>",
        }).addTo(map);

        map.setView([54.5, -3.2], 5);

        const makeMarker = (color: string) =>
          new extraMarkers.Icon({
            svg: extraMarkers.PinCircle,
            color,
            contentColor: "#ffffff",
            accentColor: "#ffffff",
            scale: 0.62,
            origin: "bottom",
            shadow: "cast",
          }) as unknown as L.Icon;

        const allMarkers: L.Marker[] = [];
        // Pick roughly one trade per sampled town, striding evenly through the
        // full (north-to-south) list rather than fanning six pins per town.
        ukCities.forEach((city, idx) => {
          // Sample one pin every 8th town; this keeps coverage nationwide
          // without a dense band clustering around central England.
          if (idx % 8 !== 0) return;

          // Deterministic-ish scatter so neighbouring pins aren't the same
          // trade or colour (mixes the six trades across the map).
          const tc = tradeCategories[(idx * 5 + 1) % tradeCategories.length];
          const names   = TRADE_NAMES[tc.name] ?? [`${city.name} ${tc.name}`];
          const bizName = names[(idx * 3) % names.length];
          const rating  = parseFloat((4.5 + ((idx * 7) % 5) * 0.1).toFixed(1));
          const reviews = 48 + ((idx * 17 + 5) % 290);
          const respTime = RESPONSE_TIMES[(idx * 5) % RESPONSE_TIMES.length];
          // No coordinate jitter — pin sits exactly on the town centre.
          const lat = city.lat;
          const lon = city.lon;
          const m = L.marker([lat, lon], { icon: makeMarker(tc.color) });
          m.on("mouseover", () => {
            const pt = map.latLngToContainerPoint([lat, lon]);
            setMapTooltip({ x: pt.x, y: pt.y, trade: tc.name, color: tc.color, name: bizName, rating, reviews, city: city.name, responseTime: respTime });
          });
          m.on("mouseout", () => setMapTooltip(null));
          m.on("click",    () => handleMarkerClick(tc.name, city.name));
          allMarkers.push(m);
        });

        // No clustering — every town's coloured pins are shown individually,
        // spread nationwide.
        allMarkers.forEach((m) => m.addTo(map));

        map.invalidateSize();
        mapInstanceRef.current = map;
      } catch (_) {}
    };

    init();
    return () => {
      active = false;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const saved = localStorage.getItem("tradeRememberEmail");
    if (saved) { setEmail(saved); setRememberMe(true); }
    setOnlineCount(Math.floor(Math.random() * 40) + 160);
  }, []);

  // ── Auth handler - logic unchanged ──────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data: tradesperson, error: userError } = await supabase
        .from("tradespeople")
        .select("id, email, first_name, is_approved, is_verified")
        .eq("email", email)
        .eq("password_hash", password)
        .maybeSingle();

      if (userError || !tradesperson) {
        setError("Invalid email or password");
        return;
      }

      if (!tradesperson.is_verified) {
        setError("Your profile has not been verified by our admin team yet. Please wait for verification before logging in.");
        return;
      }

      if (!tradesperson.is_approved) {
        setError("Your profile is currently under review by our admin team. You will receive an email notification once your profile is approved.");
        return;
      }

      localStorage.setItem("user", JSON.stringify({
        id: tradesperson.id,
        email: tradesperson.email,
        firstName: tradesperson.first_name,
        type: "tradesperson",
        isApproved: tradesperson.is_approved,
        isVerified: tradesperson.is_verified,
      }));

      if (rememberMe) {
        localStorage.setItem("tradeRememberEmail", email);
      } else {
        localStorage.removeItem("tradeRememberEmail");
      }

      router.push("/dashboard/tradesperson");
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-brand-slate flex flex-col items-center justify-center overflow-hidden -mt-[var(--header-height)] pt-[120px] sm:pt-[140px] pb-16">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #F5A623 1px, transparent 1px), linear-gradient(to bottom, #F5A623 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#F5A623] rounded-full blur-[150px] opacity-10" />

      <Section>
        <Container size="wide" className="grid md:grid-cols-2 gap-6 md:gap-8 items-start">

          {/* ── Left: Login card ── */}
          <div className="order-1 md:order-1 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/20 to-indigo-600/20 rounded-3xl blur-xl" />
            <Card className="relative w-full rounded-3xl bg-sky-50 border border-gray-100 shadow-xl">
              <CardHeader className="text-center pb-4 sm:pb-6">
                <div className="mx-auto mb-3 flex justify-center">
                  <SectionHeaderPill variant="navy">Approved Tradespeople Only</SectionHeaderPill>
                </div>
                <div className="flex items-center justify-center mb-3">
                  <div className="w-16 h-16 bg-gradient-to-r from-brand-navy to-brand-navy rounded-full flex items-center justify-center shadow-md">
                    <Image src="/logo-icon.svg" alt="MyApproved logo" width={40} height={40} className="w-10 h-10" />
                  </div>
                </div>
                <CardTitle className="text-[26px] sm:text-3xl font-bold tracking-tight text-brand-navy mb-1" style={{ fontWeight: 800 }}>
                  Tradesperson Login
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="email" className="flex items-center mb-2 text-sm font-semibold text-brand-navy">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="h-12 text-base bg-white border-2 border-gray-300 hover:border-brand-amber/50 focus:border-brand-amber focus:ring-2 focus:ring-brand-amber/20 transition-all duration-200 rounded-xl text-brand-navy placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password" className="flex items-center mb-2 text-sm font-semibold text-brand-navy">
                      <Lock className="w-4 h-4 mr-2" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="h-12 text-base bg-white border-2 border-gray-300 hover:border-brand-amber/50 focus:border-brand-amber focus:ring-2 focus:ring-brand-amber/20 transition-all duration-200 rounded-xl pr-10 text-brand-navy placeholder:text-gray-400"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-navy"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox id="remember" checked={rememberMe} onCheckedChange={(c) => setRememberMe(c === true)} />
                      <Label htmlFor="remember" className="text-sm text-brand-navy">Remember me</Label>
                    </div>
                    <Link href="/forgot-password?type=tradesperson" className="text-sm text-brand-navy hover:text-brand-navyDark hover:underline font-medium">
                      Forgot password?
                    </Link>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-2 text-brand-navy">Enter your details</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-brand-amber hover:bg-brand-amberDark text-black text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                    style={{ fontWeight: 800 }}
                  >
                    {isLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in...
                      </span>
                    ) : "Sign In"}
                  </Button>

                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-600">
                      Don&apos;t have an account?{" "}
                      <Link href="/register/tradesperson" className="text-brand-navy hover:text-brand-navyDark hover:underline font-medium">
                        Register here
                      </Link>
                    </p>
                    <p className="text-sm text-gray-600">
                      Are you a customer?{" "}
                      <Link href="/login/client" className="text-brand-navy hover:text-brand-navyDark hover:underline font-medium">
                        Login here
                      </Link>
                    </p>
                    <div className="pt-1">
                      <Link href="/contact" className="text-xs text-gray-400 hover:text-brand-navy underline">Need help? Contact support</Link>
                    </div>
                  </div>
              </form>
              </CardContent>
            </Card>
          </div>

          {/* ── Right: Map + Features ── */}
          <div className="order-2 md:order-2 flex flex-col gap-6 relative z-10">

            {/* Map card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-blue-400/20 rounded-3xl blur-xl" />
              <div className="relative rounded-3xl border border-white/20 bg-gradient-to-br from-brand-navy to-brand-navy backdrop-blur-md shadow-2xl overflow-hidden">

                {/* Leaflet map */}
                <div className="relative w-full h-[340px] md:h-[400px]">
                  <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />

                  {/* Live badge */}
                  <div className="absolute top-3 right-3 z-[999] bg-white rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg shadow-black/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    <span className="text-[10px] font-extrabold text-brand-navy tracking-wide">Live Coverage</span>
                  </div>

                  {/* Framer Motion tooltip */}
                  <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1000 }}>
                    <AnimatePresence>
                      {mapTooltip && (
                        <motion.div
                          key={`${mapTooltip.x}-${mapTooltip.y}`}
                          initial={{ opacity: 0, y: 8, scale: 0.94 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.94 }}
                          transition={{ duration: 0.14, ease: "easeOut" }}
                          className="absolute pointer-events-none"
                          style={{ left: mapTooltip.x, top: mapTooltip.y - 10, transform: "translate(-50%,-100%)" }}
                        >
                          <div className="bg-gradient-to-br from-brand-navy to-brand-navy border border-white/20 rounded-xl shadow-2xl p-3 min-w-[210px]">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: mapTooltip.color }} />
                                <span className="text-[9px] font-black uppercase tracking-[0.13em] text-white/50">{mapTooltip.trade}</span>
                              </div>
                              <span className="text-[8px] font-black text-brand-amber bg-brand-amber/10 border border-brand-amber/20 px-1.5 py-0.5 rounded-full">✓ VERIFIED</span>
                            </div>
                            <p className="text-xs font-bold text-white leading-snug mb-2">{mapTooltip.name}</p>
                            <div className="flex items-center gap-0.5 mb-2">
                              {[1,2,3,4,5].map(i => (
                                <Star key={i} className={`w-3 h-3 ${i <= Math.floor(mapTooltip.rating) ? "text-brand-amber fill-brand-amber" : "text-white/15"}`} />
                              ))}
                              <span className="text-xs font-black text-brand-amber ml-1">{mapTooltip.rating}</span>
                              <span className="text-[10px] text-white/30 ml-1">({mapTooltip.reviews})</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-white/40">
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-brand-amber/60" />{mapTooltip.city}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{mapTooltip.responseTime}</span>
                            </div>
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[99%]"
                              style={{ width:0, height:0, borderLeft:"6px solid transparent", borderRight:"6px solid transparent", borderTop:"6px solid #0A2463" }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Stats bar */}
                <div className="bg-sky-50 backdrop-blur-md p-4 border-t border-gray-100">
                  <div className="grid grid-cols-3 divide-x divide-brand-navy/10">
                    <div className="text-center px-3">
                      <div className="text-xl sm:text-2xl font-black text-brand-navy tabular-nums">{onlineCount}+</div>
                      <div className="text-[10px] text-brand-navy/60 font-medium mt-0.5">Online Now</div>
                    </div>
                    <div className="text-center px-3">
                      <div className="text-xl sm:text-2xl font-black text-brand-navy">✓</div>
                      <div className="text-[10px] text-brand-navy/60 font-medium mt-0.5">Identity checked</div>
                    </div>
                    <div className="text-center px-3">
                      <div className="text-xl sm:text-2xl font-black text-brand-navy">24/7</div>
                      <div className="text-[10px] text-brand-navy/60 font-medium mt-0.5">Support</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Choose card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/20 to-indigo-600/20 rounded-3xl blur-xl" />
              <div className="relative bg-sky-50 backdrop-blur-md rounded-3xl border border-gray-100 p-6 shadow-xl">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-amber to-brand-amberDark rounded-t-3xl" />
                <h2 className="text-xl font-extrabold text-brand-navy mb-4">Your Member Dashboard</h2>
                <ul className="space-y-4">
                  {[
                    { Icon: Shield,       title: "Keep Your Status Active",  body: "Your identity check and public liability insurance stay current on your profile." },
                    { Icon: Star,         title: "Manage Open Jobs",  body: "Review and respond to new customer requests from your dashboard." },
                    { Icon: CheckCircle,  title: "Update Your Availability",  body: "Keep your profile and service areas accurate so customers can reach you." },
                  ].map(({ Icon, title, body }) => (
                    <li key={title} className="flex items-start gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 shrink-0">
                        <Icon className="h-5 w-5 text-white" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-brand-navyDark">{title}</p>
                        <p className="text-sm text-brand-navy/80">{body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </Container>
      </Section>
    </div>
  );
}
