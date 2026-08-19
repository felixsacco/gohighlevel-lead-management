// @ts-nocheck
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Mail, Lock, User, Shield, Star, CheckCircle, Loader2, MapPin, Clock, Wrench } from "lucide-react";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
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

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          subdomains: "abc", maxZoom: 19, attribution: "© OpenStreetMap contributors",
        }).addTo(map);

        map.setView([54.2, -3.5], 5);

        const makeDot = (color: string, sz: number) =>
          L.divIcon({
            html: `<div style="width:${sz}px;height:${sz}px;background:${color};border-radius:50%;border:1.5px solid rgba(255,255,255,0.8);box-shadow:0 1px 4px rgba(0,0,0,0.55),0 0 7px ${color}70;cursor:pointer;"></div>`,
            className: "", iconSize: [sz, sz], iconAnchor: [sz / 2, sz / 2],
          });

        const allMarkers: { m: any; minZ: number }[] = [];

        const z5 = [[0,0],[0.12,0.07],[-0.09,0.13],[0.14,-0.07],[-0.13,-0.08],[0.04,0.15]];
        const z6 = [[0.06,0.04],[-0.05,0.07],[0.07,-0.04]];
        const z7 = [[-0.07,0.04],[0.04,-0.06],[-0.03,-0.07]];

        ukCities.forEach((city, idx) => {
          tradeCategories.forEach((tc, tcIdx) => {
            const [dlat, dlon] = z5[tcIdx];
            const lat = city.lat + dlat, lon = city.lon + dlon;
            const names   = TRADE_NAMES[tc.name] ?? [`${city.name} ${tc.name}`];
            const bizName = names[(idx + tcIdx) % names.length];
            const rating  = parseFloat((4.5 + ((idx + tcIdx) % 5) * 0.1).toFixed(1));
            const reviews = 48 + ((idx * 17 + tcIdx * 11) % 290);
            const respTime = RESPONSE_TIMES[(idx + tcIdx) % RESPONSE_TIMES.length];
            const m = L.marker([lat, lon], { icon: makeDot(tc.color, 9) });
            m.on("mouseover", () => {
              const pt = map.latLngToContainerPoint([lat, lon]);
              setMapTooltip({ x: pt.x, y: pt.y, trade: tc.name, color: tc.color, name: bizName, rating, reviews, city: city.name, responseTime: respTime });
            });
            m.on("mouseout", () => setMapTooltip(null));
            m.on("click",    () => handleMarkerClick(tc.name, city.name));
            allMarkers.push({ m, minZ: 5 });
            m.addTo(map);
          });
        });

        ukCities.forEach((city, idx) => {
          z6.forEach(([dlat, dlon], oi) => {
            const tc = tradeCategories[(idx + oi + 1) % tradeCategories.length];
            const lat = city.lat + dlat, lon = city.lon + dlon;
            const names   = TRADE_NAMES[tc.name] ?? [`${city.name} ${tc.name}`];
            const bizName = names[(idx + oi) % names.length];
            const rating  = parseFloat((4.5 + ((idx + oi) % 5) * 0.1).toFixed(1));
            const reviews = 48 + ((idx * 13 + oi * 9) % 290);
            const respTime = RESPONSE_TIMES[(idx + oi) % RESPONSE_TIMES.length];
            const m = L.marker([lat, lon], { icon: makeDot(tc.color, 8) });
            m.on("mouseover", () => {
              const pt = map.latLngToContainerPoint([lat, lon]);
              setMapTooltip({ x: pt.x, y: pt.y, trade: tc.name, color: tc.color, name: bizName, rating, reviews, city: city.name, responseTime: respTime });
            });
            m.on("mouseout", () => setMapTooltip(null));
            m.on("click",    () => handleMarkerClick(tc.name, city.name));
            allMarkers.push({ m, minZ: 6 });
          });
        });

        ukCities.forEach((city, idx) => {
          z7.forEach(([dlat, dlon], oi) => {
            const tc = tradeCategories[(idx + oi + 4) % tradeCategories.length];
            const lat = city.lat + dlat, lon = city.lon + dlon;
            const names   = TRADE_NAMES[tc.name] ?? [`${city.name} ${tc.name}`];
            const bizName = names[(idx + oi + 2) % names.length];
            const rating  = parseFloat((4.5 + ((idx + oi + 2) % 5) * 0.1).toFixed(1));
            const reviews = 48 + ((idx * 11 + oi * 7) % 290);
            const respTime = RESPONSE_TIMES[(idx + oi + 2) % RESPONSE_TIMES.length];
            const m = L.marker([lat, lon], { icon: makeDot(tc.color, 7) });
            m.on("mouseover", () => {
              const pt = map.latLngToContainerPoint([lat, lon]);
              setMapTooltip({ x: pt.x, y: pt.y, trade: tc.name, color: tc.color, name: bizName, rating, reviews, city: city.name, responseTime: respTime });
            });
            m.on("mouseout", () => setMapTooltip(null));
            m.on("click",    () => handleMarkerClick(tc.name, city.name));
            allMarkers.push({ m, minZ: 7 });
          });
        });

        map.on("zoomend", () => {
          const z = map.getZoom();
          allMarkers.forEach(({ m, minZ }) => {
            if (z >= minZ) { if (!map.hasLayer(m)) m.addTo(map); }
            else           { if (map.hasLayer(m))  m.removeFrom(map); }
          });
        });

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
    <div className="relative min-h-screen bg-[#1A3A8A] flex flex-col items-center justify-center overflow-hidden -mt-[var(--header-height)] pt-[120px] sm:pt-[140px] pb-16">
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
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-3xl blur-xl" />
            <Card className="relative w-full rounded-3xl shadow-2xl border border-white/20 bg-gradient-to-br from-blue-900 to-blue-800 backdrop-blur-md">
              <CardHeader className="text-center pb-4 sm:pb-6">
                <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full bg-[#FFB800] px-3 py-1.5 text-xs font-extrabold text-black border-2 border-[#FFB800]">
                  <Star className="h-3.5 w-3.5 fill-yellow-600 text-yellow-700" />
                  Join Trusted Tradespeople
                </div>
                <div className="flex items-center justify-center mb-3">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-md">
                    <Wrench className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-[26px] sm:text-3xl font-bold text-[#FFB800] mb-1">
                  Tradesperson Login
                </CardTitle>
                <p className="text-blue-100 text-sm sm:text-base">Access your dashboard, jobs, and earnings.</p>
              </CardHeader>

              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="email" className="flex items-center mb-2 text-sm font-semibold text-blue-100">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="h-12 text-base bg-gradient-to-br from-blue-900 to-blue-800 border-2 border-white/20 hover:border-yellow-400/50 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200 rounded-lg text-white placeholder:text-blue-200"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password" className="flex items-center mb-2 text-sm font-semibold text-blue-100">
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
                        className="h-12 text-base bg-gradient-to-br from-blue-900 to-blue-800 border-2 border-white/20 hover:border-yellow-400/50 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200 rounded-lg pr-10 text-white placeholder:text-blue-200"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox id="remember" checked={rememberMe} onCheckedChange={(c) => setRememberMe(c === true)} />
                      <Label htmlFor="remember" className="text-sm text-blue-100">Remember me</Label>
                    </div>
                    <Link href="/forgot-password?type=tradesperson" className="text-sm text-yellow-400 hover:text-yellow-300 hover:underline font-medium">
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
                      <span className="bg-blue-900/80 px-2 text-yellow-400">Enter your details</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-blue-900 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    {isLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in...
                      </span>
                    ) : "Sign In"}
                  </Button>

                  <div className="text-center space-y-2">
                    <p className="text-sm text-blue-100">
                      Don&apos;t have an account?{" "}
                      <Link href="/register/tradesperson" className="text-yellow-400 hover:text-yellow-300 hover:underline font-medium">
                        Register here
                      </Link>
                    </p>
                    <p className="text-sm text-blue-100">
                      Are you a customer?{" "}
                      <Link href="/login/client" className="text-yellow-400 hover:text-yellow-300 hover:underline font-medium">
                        Login here
                      </Link>
                    </p>
                    <div className="pt-1">
                      <Link href="/contact" className="text-xs text-blue-200 hover:text-white underline">Need help? Contact support</Link>
                    </div>
                  </div>

                  <ul className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
                    <li className="flex items-center gap-2 text-xs text-blue-100 bg-white/10 border border-white/20 rounded-md px-2 py-1 backdrop-blur-sm">
                      <CheckCircle className="h-4 w-4 text-green-400" /> No hidden fees
                    </li>
                    <li className="flex items-center gap-2 text-xs text-blue-100 bg-white/10 border border-white/20 rounded-md px-2 py-1 backdrop-blur-sm">
                      <Shield className="h-4 w-4 text-blue-400" /> Secure login
                    </li>
                    <li className="flex items-center gap-2 text-xs text-blue-100 bg-white/10 border border-white/20 rounded-md px-2 py-1 backdrop-blur-sm">
                      <Star className="h-4 w-4 text-yellow-400" /> Top-rated pros
                    </li>
                  </ul>

                  <Link
                    href="/register/tradesperson"
                    className="inline-flex items-center justify-center w-full h-11 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 text-sm font-semibold shadow hover:from-yellow-500 hover:to-yellow-600 hover:scale-105 transition-all duration-200"
                  >
                    Create a free account
                  </Link>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* ── Right: Map + Features ── */}
          <div className="order-2 md:order-2 flex flex-col gap-6 relative z-10">

            {/* Map card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-blue-400/20 rounded-3xl blur-xl" />
              <div className="relative rounded-3xl border border-white/20 bg-gradient-to-br from-blue-900 to-blue-800 backdrop-blur-md shadow-2xl overflow-hidden">

                {/* Leaflet map */}
                <div className="relative w-full h-[340px] md:h-[400px]">
                  <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />

                  {/* Available Now panel */}
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-[999]">
                    <div className="bg-gradient-to-br from-blue-900 to-blue-800 backdrop-blur-md border border-white/20 rounded-xl p-2.5 shadow-2xl min-w-[130px]">
                      <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#F5A623] mb-2 px-0.5">
                        Available Now
                      </p>
                      {[
                        { color: "#3b82f6", label: "Plumbers",      count: 247 },
                        { color: "#F5A623", label: "Electricians",  count: 189 },
                        { color: "#22c55e", label: "Builders",      count: 156 },
                        { color: "#a855f7", label: "Cleaners",      count: 210 },
                        { color: "#ef4444", label: "Roofers",       count: 98  },
                        { color: "#38bdf8", label: "Carpenters",    count: 112 },
                        { color: "#fb923c", label: "Painters",      count: 134 },
                        { color: "#10b981", label: "Gas Engineers", count: 143 },
                        { color: "#f472b6", label: "Handymen",      count: 178 },
                        { color: "#8b5cf6", label: "Tilers",        count: 89  },
                      ].map((t) => (
                        <div key={t.label} className="flex items-center gap-1.5 py-[3px]">
                          <div className="w-2 h-2 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: t.color }} />
                          <span className="text-[10px] text-white/70 font-medium flex-1 leading-none">{t.label}</span>
                          <span className="text-[10px] font-black text-[#F5A623] pl-1">{t.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Live badge */}
                  <div className="absolute top-3 right-3 z-[999] bg-white rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg shadow-black/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    <span className="text-[10px] font-extrabold text-[#111111] tracking-wide">Live Coverage</span>
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
                          <div className="bg-gradient-to-br from-blue-900 to-blue-800 border border-white/20 rounded-xl shadow-2xl p-3 min-w-[210px]">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: mapTooltip.color }} />
                                <span className="text-[9px] font-black uppercase tracking-[0.13em] text-white/50">{mapTooltip.trade}</span>
                              </div>
                              <span className="text-[8px] font-black text-[#F5A623] bg-[#F5A623]/10 border border-[#F5A623]/20 px-1.5 py-0.5 rounded-full">✓ VERIFIED</span>
                            </div>
                            <p className="text-xs font-bold text-white leading-snug mb-2">{mapTooltip.name}</p>
                            <div className="flex items-center gap-0.5 mb-2">
                              {[1,2,3,4,5].map(i => (
                                <Star key={i} className={`w-3 h-3 ${i <= Math.floor(mapTooltip.rating) ? "text-[#F5A623] fill-[#F5A623]" : "text-white/15"}`} />
                              ))}
                              <span className="text-xs font-black text-[#F5A623] ml-1">{mapTooltip.rating}</span>
                              <span className="text-[10px] text-white/30 ml-1">({mapTooltip.reviews})</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-white/40">
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#F5A623]/60" />{mapTooltip.city}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{mapTooltip.responseTime}</span>
                            </div>
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[99%]"
                              style={{ width:0, height:0, borderLeft:"6px solid transparent", borderRight:"6px solid transparent", borderTop:"6px solid #1e3a8a" }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Stats bar */}
                <div className="bg-gradient-to-r from-blue-900/95 to-blue-800/95 backdrop-blur-md p-4 border-t border-white/10">
                  <div className="grid grid-cols-3 divide-x divide-white/[0.08]">
                    <div className="text-center px-3">
                      <div className="text-xl sm:text-2xl font-black text-[#F5A623] tabular-nums">{onlineCount}+</div>
                      <div className="text-[10px] text-white/40 font-medium mt-0.5">Online Now</div>
                    </div>
                    <div className="text-center px-3">
                      <div className="text-xl sm:text-2xl font-black text-[#F5A623]">✓</div>
                      <div className="text-[10px] text-white/40 font-medium mt-0.5">Identity checked</div>
                    </div>
                    <div className="text-center px-3">
                      <div className="text-xl sm:text-2xl font-black text-[#F5A623]">24/7</div>
                      <div className="text-[10px] text-white/40 font-medium mt-0.5">Support</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Choose card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-3xl blur-xl" />
              <div className="relative bg-gradient-to-br from-blue-900 to-blue-800 backdrop-blur-md rounded-3xl border border-white/20 p-6 shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-t-3xl" />
                <h2 className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-4">Why Join MyApproved</h2>
                <ul className="space-y-4">
                  {[
                    { Icon: Shield,       color: "blue",   title: "Identity Checked Badge",  body: "Show customers you are ID-checked and your public liability insurance is confirmed." },
                    { Icon: Star,         color: "yellow", title: "Quality Leads Only",  body: "Receive genuine job requests from real customers in your area." },
                    { Icon: CheckCircle,  color: "green",  title: "Grow Your Business",  body: "Receive genuine job requests from real customers in your area." },
                  ].map(({ Icon, color, title, body }) => (
                    <li key={title} className="flex items-start gap-3">
                      <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full bg-${color}-500/20 border border-${color}-400/30 backdrop-blur-sm shrink-0`}>
                        <Icon className={`h-5 w-5 text-${color}-400`} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">{title}</p>
                        <p className="text-sm text-blue-200">{body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Trust strip */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-blue-400/20 rounded-2xl blur-xl" />
              <div className="relative bg-gradient-to-br from-blue-900 to-blue-800 backdrop-blur-md rounded-2xl border border-white/20 p-4 shadow-xl">
                <div className="flex items-center justify-center gap-2 text-center">
                  <Shield className="h-5 w-5 text-green-400" />
                  <span className="text-lg font-bold text-white">Identity checked</span>
                  <span className="text-blue-200">public liability insurance confirmed and monitored</span>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </Section>
    </div>
  );
}
