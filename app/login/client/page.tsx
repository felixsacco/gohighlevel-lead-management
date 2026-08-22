// @ts-nocheck
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Mail, Lock, User, Shield, Star, CheckCircle, Loader2, MapPin, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import SectionHeaderPill from "@/components/ui/SectionHeaderPill";
import { Container } from "@/components/ui/Container";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase-client";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [onlineCount, setOnlineCount] = useState(175); // Fixed initial value to prevent hydration mismatch
  const [mapTooltip, setMapTooltip] = useState<{
    x: number; y: number;
    trade: string; color: string; name: string;
    rating: number; reviews: number; city: string; responseTime: string;
  } | null>(null);
  const router = useRouter();

  // Leaflet map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Generate dense placeholder markers across the UK using real city lat/lon projected to iframe bbox
  const tradeCategories = useMemo(
    () => [
      { name: "Plumber", color: "#2563eb" },
      { name: "Electrician", color: "#facc15" },
      { name: "Builder", color: "#16a34a" },
      { name: "Cleaner", color: "#9333ea" },
      { name: "Roofer", color: "#ea580c" },
      { name: "Carpenter", color: "#0ea5e9" },
    ],
    []
  );

  const ukCities = useMemo(
    () => [
      // ── Major English cities ──
      { name: "London", lat: 51.5074, lon: -0.1278 },
      { name: "Manchester", lat: 53.4808, lon: -2.2426 },
      { name: "Birmingham", lat: 52.4862, lon: -1.8904 },
      { name: "Leeds", lat: 53.8008, lon: -1.5491 },
      { name: "Liverpool", lat: 53.4084, lon: -2.9916 },
      { name: "Newcastle", lat: 54.9783, lon: -1.6178 },
      { name: "Sheffield", lat: 53.3811, lon: -1.4701 },
      { name: "Bristol", lat: 51.4545, lon: -2.5879 },
      { name: "Nottingham", lat: 52.9548, lon: -1.1581 },
      { name: "Leicester", lat: 52.6369, lon: -1.1398 },
      { name: "Coventry", lat: 52.4068, lon: -1.5197 },
      { name: "Stoke-on-Trent", lat: 53.0027, lon: -2.1794 },
      { name: "Wolverhampton", lat: 52.5862, lon: -2.1288 },
      { name: "Plymouth", lat: 50.3755, lon: -4.1427 },
      { name: "Exeter", lat: 50.7184, lon: -3.5339 },
      { name: "Norwich", lat: 52.6309, lon: 1.2974 },
      { name: "York", lat: 53.9590, lon: -1.0815 },
      { name: "Brighton", lat: 50.8225, lon: -0.1372 },
      { name: "Southampton", lat: 50.9097, lon: -1.4043 },
      { name: "Portsmouth", lat: 50.8198, lon: -1.0880 },
      { name: "Hull", lat: 53.7457, lon: -0.3367 },
      { name: "Derby", lat: 52.9225, lon: -1.4746 },
      { name: "Bournemouth", lat: 50.7192, lon: -1.8808 },
      { name: "Reading", lat: 51.4543, lon: -0.9781 },
      { name: "Milton Keynes", lat: 52.0406, lon: -0.7594 },
      { name: "Northampton", lat: 52.2405, lon: -0.9027 },
      { name: "Oxford", lat: 51.7520, lon: -1.2577 },
      { name: "Cambridge", lat: 52.2053, lon: 0.1218 },
      { name: "Gloucester", lat: 51.8642, lon: -2.2380 },
      { name: "Blackpool", lat: 53.8175, lon: -3.0357 },
      { name: "Preston", lat: 53.7632, lon: -2.7031 },
      { name: "Blackburn", lat: 53.7480, lon: -2.4829 },
      { name: "Ipswich", lat: 52.0567, lon: 1.1482 },
      { name: "Chelmsford", lat: 51.7356, lon: 0.4685 },
      { name: "Luton", lat: 51.8787, lon: -0.4200 },
      { name: "Swindon", lat: 51.5558, lon: -1.7797 },
      { name: "Peterborough", lat: 52.5695, lon: -0.2525 },
      { name: "Southend", lat: 51.5459, lon: 0.7077 },
      { name: "Warrington", lat: 53.3927, lon: -2.5870 },
      { name: "Stockport", lat: 53.4106, lon: -2.1575 },
      { name: "Bolton", lat: 53.5769, lon: -2.4282 },
      { name: "Oldham", lat: 53.5406, lon: -2.1183 },
      { name: "Rochdale", lat: 53.6097, lon: -2.1561 },
      { name: "Huddersfield", lat: 53.6458, lon: -1.7850 },
      { name: "Bradford", lat: 53.7960, lon: -1.7594 },
      // ── More England towns ──
      { name: "Guildford", lat: 51.2362, lon: -0.5704 },
      { name: "Woking", lat: 51.3168, lon: -0.5600 },
      { name: "Basingstoke", lat: 51.2667, lon: -1.0876 },
      { name: "Winchester", lat: 51.0632, lon: -1.3080 },
      { name: "Salisbury", lat: 51.0693, lon: -1.7957 },
      { name: "Maidstone", lat: 51.2720, lon: 0.5240 },
      { name: "Canterbury", lat: 51.2802, lon: 1.0789 },
      { name: "Folkestone", lat: 51.0824, lon: 1.1661 },
      { name: "Tunbridge Wells", lat: 51.1323, lon: 0.2635 },
      { name: "Colchester", lat: 51.8959, lon: 0.8919 },
      { name: "Bury St Edmunds", lat: 52.2461, lon: 0.7145 },
      { name: "King's Lynn", lat: 52.7543, lon: 0.3990 },
      { name: "Wisbech", lat: 52.6651, lon: 0.1602 },
      { name: "Ely", lat: 52.3984, lon: 0.2626 },
      { name: "Huntingdon", lat: 52.3311, lon: -0.1812 },
      { name: "Kettering", lat: 52.3931, lon: -0.7239 },
      { name: "Wellingborough", lat: 52.3016, lon: -0.6924 },
      { name: "Corby", lat: 52.4897, lon: -0.6942 },
      { name: "Rugby", lat: 52.3702, lon: -1.2658 },
      { name: "Leamington Spa", lat: 52.2914, lon: -1.5326 },
      { name: "Tamworth", lat: 52.6330, lon: -1.6958 },
      { name: "Lichfield", lat: 52.6823, lon: -1.8265 },
      { name: "Burton-upon-Trent", lat: 52.8017, lon: -1.6435 },
      { name: "Stafford", lat: 52.8062, lon: -2.1218 },
      { name: "Shrewsbury", lat: 52.7077, lon: -2.7540 },
      { name: "Telford", lat: 52.6766, lon: -2.4452 },
      { name: "Hereford", lat: 52.0567, lon: -2.7159 },
      { name: "Worcester", lat: 52.1938, lon: -2.2219 },
      { name: "Cheltenham", lat: 51.8994, lon: -2.0783 },
      { name: "Stroud", lat: 51.7456, lon: -2.2179 },
      { name: "Bath", lat: 51.3751, lon: -2.3601 },
      { name: "Yeovil", lat: 50.9435, lon: -2.6417 },
      { name: "Taunton", lat: 51.0132, lon: -3.1067 },
      { name: "Torquay", lat: 50.4619, lon: -3.5251 },
      { name: "Truro", lat: 50.2632, lon: -5.0510 },
      { name: "Barnstaple", lat: 51.0823, lon: -4.0581 },
      { name: "Weston-super-Mare", lat: 51.3462, lon: -2.9774 },
      { name: "Redditch", lat: 52.3079, lon: -1.9457 },
      { name: "Kidderminster", lat: 52.3879, lon: -2.2490 },
      { name: "Walsall", lat: 52.5858, lon: -1.9823 },
      { name: "West Bromwich", lat: 52.5190, lon: -1.9945 },
      { name: "Dudley", lat: 52.5126, lon: -2.0816 },
      { name: "Solihull", lat: 52.4120, lon: -1.7777 },
      { name: "Nuneaton", lat: 52.5235, lon: -1.4652 },
      { name: "Loughborough", lat: 52.7727, lon: -1.2058 },
      { name: "Grantham", lat: 52.9099, lon: -0.6397 },
      { name: "Lincoln", lat: 53.2307, lon: -0.5406 },
      { name: "Grimsby", lat: 53.5675, lon: -0.0804 },
      { name: "Scunthorpe", lat: 53.5906, lon: -0.6369 },
      { name: "Doncaster", lat: 53.5228, lon: -1.1286 },
      { name: "Rotherham", lat: 53.4297, lon: -1.3563 },
      { name: "Barnsley", lat: 53.5527, lon: -1.4797 },
      { name: "Wakefield", lat: 53.6830, lon: -1.4977 },
      { name: "Harrogate", lat: 53.9919, lon: -1.5378 },
      { name: "Scarborough", lat: 54.2780, lon: -0.4040 },
      { name: "Middlesbrough", lat: 54.5764, lon: -1.2343 },
      { name: "Stockton-on-Tees", lat: 54.5661, lon: -1.3181 },
      { name: "Darlington", lat: 54.5239, lon: -1.5534 },
      { name: "Durham", lat: 54.7753, lon: -1.5849 },
      { name: "Carlisle", lat: 54.8951, lon: -2.9352 },
      { name: "Kendal", lat: 54.3238, lon: -2.7446 },
      { name: "Penrith", lat: 54.6637, lon: -2.7561 },
      { name: "Lancaster", lat: 54.0464, lon: -2.8006 },
      { name: "Morecambe", lat: 54.0726, lon: -2.8688 },
      { name: "Wigan", lat: 53.5449, lon: -2.6338 },
      { name: "St Helens", lat: 53.4550, lon: -2.7362 },
      { name: "Runcorn", lat: 53.3414, lon: -2.7308 },
      { name: "Chester", lat: 53.1896, lon: -2.8916 },
      { name: "Crewe", lat: 53.0990, lon: -2.4405 },
      { name: "Macclesfield", lat: 53.2592, lon: -2.1280 },
      { name: "Altrincham", lat: 53.3838, lon: -2.3527 },
      { name: "Salford", lat: 53.4875, lon: -2.2901 },
      { name: "Bury", lat: 53.5934, lon: -2.2974 },
      { name: "Ashton-under-Lyne", lat: 53.4900, lon: -2.0960 },
      { name: "Gateshead", lat: 54.9631, lon: -1.6037 },
      { name: "Sunderland", lat: 54.9060, lon: -1.3815 },
      { name: "South Shields", lat: 55.0077, lon: -1.4323 },
      { name: "Hartlepool", lat: 54.6900, lon: -1.2130 },
      { name: "Whitby", lat: 54.4877, lon: -0.6160 },
      { name: "Ripon", lat: 54.1385, lon: -1.5240 },
      { name: "Skipton", lat: 53.9615, lon: -2.0174 },
      { name: "Halifax", lat: 53.7250, lon: -1.8631 },
      { name: "Dewsbury", lat: 53.6907, lon: -1.6296 },
      { name: "Pontefract", lat: 53.6914, lon: -1.3115 },
      { name: "Castleford", lat: 53.7253, lon: -1.3551 },
      { name: "Goole", lat: 53.7023, lon: -0.8676 },
      { name: "Beverley", lat: 53.8440, lon: -0.4315 },
      { name: "Cleethorpes", lat: 53.5543, lon: -0.0218 },
      { name: "Skegness", lat: 53.1435, lon: 0.3352 },
      { name: "Boston", lat: 52.9769, lon: -0.0260 },
      { name: "Spalding", lat: 52.7850, lon: -0.1524 },
      { name: "Peterborough", lat: 52.5695, lon: -0.2525 },
      { name: "Corby", lat: 52.4897, lon: -0.6942 },
      { name: "Daventry", lat: 52.2608, lon: -1.1630 },
      { name: "Banbury", lat: 52.0607, lon: -1.3401 },
      { name: "Bicester", lat: 51.9000, lon: -1.1530 },
      { name: "Aylesbury", lat: 51.8168, lon: -0.8085 },
      { name: "High Wycombe", lat: 51.6287, lon: -0.7482 },
      { name: "Slough", lat: 51.5105, lon: -0.5950 },
      { name: "Watford", lat: 51.6565, lon: -0.3957 },
      { name: "Stevenage", lat: 51.9021, lon: -0.2042 },
      { name: "Hemel Hempstead", lat: 51.7526, lon: -0.4692 },
      { name: "St Albans", lat: 51.7559, lon: -0.3368 },
      { name: "Harlow", lat: 51.7769, lon: 0.1358 },
      { name: "Basildon", lat: 51.5795, lon: 0.4884 },
      { name: "Braintree", lat: 51.8782, lon: 0.5499 },
      { name: "Thetford", lat: 52.4142, lon: 0.7473 },
      { name: "Lowestoft", lat: 52.4769, lon: 1.7522 },
      { name: "Great Yarmouth", lat: 52.6076, lon: 1.7310 },
      { name: "Cromer", lat: 52.9319, lon: 1.3018 },
      { name: "Hereford", lat: 52.0567, lon: -2.7159 },
      { name: "Leominster", lat: 52.2268, lon: -2.7391 },
      { name: "Ross-on-Wye", lat: 51.9126, lon: -2.5844 },
      { name: "Tewkesbury", lat: 51.9902, lon: -2.1588 },
      { name: "Cirencester", lat: 51.7190, lon: -1.9674 },
      { name: "Chippenham", lat: 51.4584, lon: -2.1157 },
      { name: "Trowbridge", lat: 51.3201, lon: -2.2082 },
      { name: "Devizes", lat: 51.3524, lon: -1.9946 },
      { name: "Andover", lat: 51.2081, lon: -1.4809 },
      { name: "Fareham", lat: 50.8518, lon: -1.1782 },
      { name: "Gosport", lat: 50.7947, lon: -1.1290 },
      { name: "Eastbourne", lat: 50.7686, lon: 0.2840 },
      { name: "Hastings", lat: 50.8544, lon: 0.5712 },
      { name: "Worthing", lat: 50.8179, lon: -0.3729 },
      { name: "Crawley", lat: 51.1091, lon: -0.1872 },
      { name: "Horsham", lat: 51.0624, lon: -0.3257 },
      // ── Scotland ──
      { name: "Glasgow", lat: 55.8642, lon: -4.2518 },
      { name: "Edinburgh", lat: 55.9533, lon: -3.1883 },
      { name: "Aberdeen", lat: 57.1497, lon: -2.0943 },
      { name: "Dundee", lat: 56.4620, lon: -2.9707 },
      { name: "Inverness", lat: 57.4778, lon: -4.2247 },
      { name: "Stirling", lat: 56.1165, lon: -3.9369 },
      { name: "Falkirk", lat: 56.0019, lon: -3.7839 },
      { name: "Perth", lat: 56.3950, lon: -3.4306 },
      { name: "Dunfermline", lat: 56.0719, lon: -3.4552 },
      { name: "Kirkcaldy", lat: 56.1132, lon: -3.1671 },
      { name: "Paisley", lat: 55.8457, lon: -4.4239 },
      { name: "Motherwell", lat: 55.7919, lon: -3.9895 },
      { name: "Hamilton", lat: 55.7765, lon: -4.0392 },
      { name: "Ayr", lat: 55.4659, lon: -4.6295 },
      { name: "Kilmarnock", lat: 55.6118, lon: -4.4977 },
      { name: "Dumfries", lat: 55.0709, lon: -3.6055 },
      { name: "St Andrews", lat: 56.3398, lon: -2.7963 },
      { name: "Fort William", lat: 56.8198, lon: -5.1052 },
      { name: "Oban", lat: 56.4154, lon: -5.4716 },
      { name: "Livingston", lat: 55.8843, lon: -3.5200 },
      { name: "Bathgate", lat: 55.9025, lon: -3.6434 },
      { name: "Glenrothes", lat: 56.1992, lon: -3.1785 },
      { name: "Cumbernauld", lat: 55.9453, lon: -3.9936 },
      { name: "Airdrie", lat: 55.8639, lon: -3.9657 },
      { name: "Greenock", lat: 55.9484, lon: -4.7680 },
      { name: "Coatbridge", lat: 55.8636, lon: -4.0249 },
      // ── Wales ──
      { name: "Cardiff", lat: 51.4816, lon: -3.1791 },
      { name: "Swansea", lat: 51.6214, lon: -3.9436 },
      { name: "Newport", lat: 51.5842, lon: -2.9977 },
      { name: "Wrexham", lat: 53.0430, lon: -2.9925 },
      { name: "Bangor", lat: 53.2274, lon: -4.1296 },
      { name: "Merthyr Tydfil", lat: 51.7430, lon: -3.3784 },
      { name: "Bridgend", lat: 51.5047, lon: -3.5763 },
      { name: "Llanelli", lat: 51.6843, lon: -4.1633 },
      { name: "Carmarthen", lat: 51.8575, lon: -4.3119 },
      { name: "Aberystwyth", lat: 52.4153, lon: -4.0829 },
      { name: "Llandudno", lat: 53.3248, lon: -3.8241 },
      { name: "Rhyl", lat: 53.3192, lon: -3.4910 },
      { name: "Caerphilly", lat: 51.5772, lon: -3.2190 },
      { name: "Neath", lat: 51.6617, lon: -3.8065 },
      { name: "Port Talbot", lat: 51.5936, lon: -3.7878 },
      { name: "Pontypool", lat: 51.7028, lon: -3.0418 },
      { name: "Cwmbran", lat: 51.6539, lon: -3.0166 },
      // ── Northern Ireland ──
      { name: "Belfast", lat: 54.5973, lon: -5.9301 },
      { name: "Derry", lat: 54.9966, lon: -7.3084 },
      { name: "Lisburn", lat: 54.5122, lon: -6.0311 },
      { name: "Newry", lat: 54.1754, lon: -6.3256 },
      { name: "Antrim", lat: 54.7180, lon: -6.2040 },
      { name: "Ballymena", lat: 54.8613, lon: -6.2776 },
      { name: "Bangor NI", lat: 54.6535, lon: -5.6696 },
      { name: "Omagh", lat: 54.6001, lon: -7.3091 },
      { name: "Armagh", lat: 54.3503, lon: -6.6528 },
      { name: "Coleraine", lat: 55.1327, lon: -6.6641 },
    ],
    []
  );

  // Handle marker click to redirect to find tradespeople page
  const handleMarkerClick = (trade: string, city: string) => {
    router.push(`/find-tradespeople?search=${encodeURIComponent(trade)}&location=${encodeURIComponent(city)}`);
  };

  // ── Leaflet real-map initialisation ──
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;
    let active = true;

    // Preset business names per trade type for rich tooltip cards
    const TRADE_NAMES: Record<string, string[]> = {
      Plumber:      ['Elite Plumbing & Heating','FastFlow Plumbers','City Plumbing Co.','AquaTech Services','Premier Pipe Solutions'],
      Electrician:  ['Bright Sparks Electrical','PowerPro Electric','Volt Masters','City Electrics','WattWise Solutions'],
      Builder:      ['Premium Build Group','City Builders Ltd','Heritage Construction','Pro Build Services','Structure Masters'],
      Cleaner:      ['Pristine Clean Co.','Crystal Clear Services','SparkleTeam','Elite Cleaning','Fresh Start Cleaners'],
      Roofer:       ['Apex Roofing','TopShield Roofers','SkyHigh Roofing','Premier Roof Care','ArrowHead Roofing'],
      Carpenter:    ['Master Craft Carpentry','OakWorks Joinery','Fine Woodcraft','Timber Pro','Heritage Joinery'],
    };
    const RESPONSE_TIMES = ['5 min','8 min','12 min','15 min','20 min','25 min'];

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
    // Prefill email if remembered
    const savedEmail = localStorage.getItem("clientRememberEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    // Update online count after hydration to avoid mismatch
    setOnlineCount(Math.floor(Math.random() * 50) + 150);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Check email and password directly in database
      const { data: userData, error: userError } = await supabase
        .from("clients")
        .select("id, email, first_name, is_verified")
        .eq("email", email)
        .eq("password_hash", password)
        .maybeSingle();

      if (userError || !userData) {
        setError("Invalid email or password. Please try again.");
        setIsLoading(false);
        return;
      }

      if (!userData.is_verified) {
        setError(
          "Please verify your email address before logging in. Check your inbox for the verification email."
        );
        setIsLoading(false);
        return;
      }

      setSuccess("Login successful! Redirecting...");

      // Store user info and token in localStorage
      const clientToken = `client_${userData.id}_${Date.now()}`;
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: userData.id,
          email: userData.email,
          firstName: userData.first_name,
          isVerified: userData.is_verified,
          type: "client",
        })
      );
      localStorage.setItem("clientToken", clientToken);

      // Remember email if opted in
      if (rememberMe) {
        localStorage.setItem("clientRememberEmail", email);
      } else {
        localStorage.removeItem("clientRememberEmail");
      }

      // Check if there's a redirect URL stored
      const redirectUrl = localStorage.getItem("redirectAfterLogin");

      // Redirect to stored URL or default dashboard
      setTimeout(() => {
        if (redirectUrl) {
          localStorage.removeItem("redirectAfterLogin"); // Clean up
          window.location.href = redirectUrl;
        } else {
          window.location.href = "/dashboard/client";
        }
      }, 1500);
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-brand-slate flex flex-col items-center justify-center overflow-hidden -mt-[var(--header-height)] pt-[120px] sm:pt-[140px] pb-16">
      {/* Background Grid Pattern - matching homepage */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #F5A623 1px, transparent 1px), linear-gradient(to bottom, #F5A623 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Radial Gold Glow - matching homepage */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#F5A623] rounded-full blur-[150px] opacity-10" />
      {/* Main Content */}
      <Section>
      <Container size="wide" className="grid md:grid-cols-2 gap-6 md:gap-8 items-start">
        {/* Left: Login card (moved left) */}
        <div className="order-1 md:order-1 relative">
          <div className="absolute inset-0 bg-brand-amber/20 rounded-3xl blur-xl" />
          <Card className="relative w-full rounded-3xl bg-sky-50 border border-gray-100 shadow-xl">
          <CardHeader className="text-center pb-4 sm:pb-6">
            {/* Trust badge - Matching Homepage */}
            <div className="mx-auto mb-3 flex justify-center">
              <SectionHeaderPill variant="navy">Approved Customers Only</SectionHeaderPill>
            </div>
            <div className="flex items-center justify-center mb-3">
              <div className="w-16 h-16 bg-gradient-to-r from-brand-navy to-brand-navy rounded-full flex items-center justify-center shadow-md">
                <Image src="/logo-icon.svg" alt="MyApproved logo" width={40} height={40} className="w-10 h-10" />
              </div>
            </div>
            <CardTitle className="text-[26px] sm:text-3xl font-bold tracking-tight text-brand-navy mb-1" style={{ fontWeight: 800 }}>
              Customer Login
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label
                  htmlFor="email"
                  className="flex items-center mb-2 text-sm font-semibold text-brand-navy"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Address
                </Label>
                <div className="relative">
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
              </div>

              <div>
                <Label
                  htmlFor="password"
                  className="flex items-center mb-2 text-sm font-semibold text-brand-navy"
                >
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
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-brand-navy"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" checked={rememberMe} onCheckedChange={(c) => setRememberMe(c === true)} />
                  <Label htmlFor="remember" className="text-sm text-gray-600">Remember me</Label>
                </div>
                <Link
                  href="/forgot-password?type=client"
                  className="text-sm text-brand-navy hover:text-brand-navyDark hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {error && (
                <Alert
                  variant="destructive"
                  className="border-red-200 bg-red-50"
                >
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              {/* Divider */}
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
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Do not have a client account?{" "}
                  <Link
                    href="/register/client"
                    className="text-brand-navy hover:text-brand-navyDark hover:underline font-medium"
                  >
                    Register here
                  </Link>
                </p>
                <p className="text-sm text-gray-600">
                  Are you a tradesperson?{" "}
                  <Link
                    href="/login/trade"
                    className="text-brand-navy hover:text-brand-navyDark hover:underline font-medium"
                  >
                    Login here
                  </Link>
                </p>
                <div className="pt-1">
                  <Link href="/contact" className="text-xs text-gray-500 hover:text-brand-navy underline">Need help? Contact support</Link>
                </div>
              </div>

            </form>
          </CardContent>
          </Card>
        </div>

        {/* Right: Professional Map & Stats Showcase */}
        <div className="order-2 md:order-2 flex flex-col gap-6 relative z-10">
          {/* UK Coverage Map Card - Professional Design */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-blue-400/20 rounded-3xl blur-xl" />
            <div className="relative rounded-3xl border border-white/20 bg-gradient-to-br from-brand-navy to-brand-navy backdrop-blur-md shadow-2xl overflow-hidden">
              {/* Real Leaflet Map */}
              <div className="relative w-full h-[340px] md:h-[400px]">
                {/* Leaflet renders into this div */}
                <div
                  ref={mapContainerRef}
                  className="absolute inset-0 w-full h-full"
                  style={{ zIndex: 0 }}
                />

                {/* Live indicator top-right */}
                <div className="absolute top-3 right-3 z-[999] bg-white rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg shadow-black/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  <span className="text-[10px] font-extrabold text-brand-navy tracking-wide">Live Coverage</span>
                </div>

                {/* ── Framer Motion hover tooltip ── */}
                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1000 }}>
                  <AnimatePresence>
                    {mapTooltip && (
                      <motion.div
                        key={`${mapTooltip.x}-${mapTooltip.y}`}
                        initial={{ opacity: 0, y: 8, scale: 0.94 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.94 }}
                        transition={{ duration: 0.14, ease: 'easeOut' }}
                        className="absolute pointer-events-none"
                        style={{ left: mapTooltip.x, top: mapTooltip.y - 10, transform: 'translate(-50%,-100%)' }}
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

              {/* Stats Bar at Bottom */}
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

          {/* Hero-style feature cards */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/20 to-indigo-600/20 rounded-3xl blur-xl" />
            <div className="relative bg-sky-50 backdrop-blur-md rounded-3xl border border-gray-100 p-6 shadow-xl">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-amber to-brand-amberDark rounded-t-3xl" />
              <h2 className="text-xl font-extrabold text-brand-navy mb-4">Your Customer Dashboard</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 shrink-0">
                    <Shield className="h-5 w-5 text-white" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-brand-navyDark">Keep Your Details Current</p>
                    <p className="text-sm text-brand-navy/80">Update your contact details and service area so pros can reach you.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 shrink-0">
                    <Star className="h-5 w-5 text-white" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-brand-navyDark">Track Your Bookings</p>
                    <p className="text-sm text-brand-navy/80">Review messages and manage your saved pros in one place.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 shrink-0">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-brand-navyDark">Leave Reviews</p>
                    <p className="text-sm text-brand-navy/80">Share your experience to help other customers choose with confidence.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
