"use client";

import { useState, useEffect, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { SchemaMarkup, organizationSchema, ServiceSchema } from '@/components/SchemaMarkup';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import dynamic from "next/dynamic";

// Dynamically import the InDemandServices component with SSR disabled
const InDemandServices = dynamic(
  () => import("./components/InDemandServices"),
  { ssr: false }
);
import {
  Search,
  MapPin,
  Star,
  Shield,
  UsersRound,
  TrendingUp,
  ChevronRight,
  Phone,
  Mail,
  ChevronLeft,
  Smartphone,
  Download,
  Bell,
  Calculator,
  Clock,
  Upload,
  X,
  User,
  Wrench,
  ChevronDown,
  CheckCircle,
  ShieldCheck,
  CircleDollarSign,
  Bolt,
  Hammer,
  Paintbrush,
  Home as HomeIcon,
  Leaf,
  Layout,
  Key,
  Sparkles,
  Layers,
  Square,
  Utensils,
  ShowerHead,
  Wind,
  Bug,
  Monitor,
  Thermometer,
  Brush,
  Fence,
  Droplets,
  Snowflake,
  ArrowRight,
  Users,
  UserPlus,
  MessageSquareText,
  MessageCircle
} from "lucide-react";
import "./recommended-scrollbar.css";
import SmartSearchBar from "../components/SmartSearchBar";
import TabsSection from "../components/TabsSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import InitialsAvatar from "@/components/InitialsAvatar";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
// import CookieConsent from "@/components/CookieConsent";
import FloatingAssistant from "@/components/FloatingAssistant";

 // Map trade to icon for Select menu (visual only)
 const tradeIconFor = (name: string) => {
   const n = name.toLowerCase();
   if (n.includes('plumb')) return <Droplets className="w-4 h-4 text-blue-600" />;
   if (n.includes('electric')) return <Bolt className="w-4 h-4 text-yellow-600" />;
   if (n.includes('builder')) return <Hammer className="w-4 h-4 text-gray-700" />;
   if (n.includes('paint')) return <Paintbrush className="w-4 h-4 text-rose-600" />;
   if (n.includes('roof')) return <HomeIcon className="w-4 h-4 text-amber-700" />;
   if (n.includes('garden')) return <Leaf className="w-4 h-4 text-green-700" />;
   if (n.includes('tiler') || n.includes('tile')) return <Layout className="w-4 h-4 text-slate-700" />;
   if (n.includes('carpenter')) return <Wrench className="w-4 h-4 text-amber-700" />;
   if (n.includes('lock')) return <Key className="w-4 h-4 text-slate-700" />;
   if (n.includes('clean')) return <Brush className="w-4 h-4 text-cyan-700" />;
   if (n.includes('fence')) return <Fence className="w-4 h-4 text-emerald-700" />;
   if (n.includes('hvac') || n.includes('air')) return <Wind className="w-4 h-4 text-sky-700" />;
   if (n.includes('bathroom')) return <ShowerHead className="w-4 h-4 text-sky-700" />;
   if (n.includes('kitchen')) return <Utensils className="w-4 h-4 text-amber-700" />;
   if (n.includes('appliance')) return <Monitor className="w-4 h-4 text-slate-700" />;
   if (n.includes('pest')) return <Bug className="w-4 h-4 text-rose-700" />;
   if (n.includes('insulation')) return <Thermometer className="w-4 h-4 text-orange-700" />;
   if (n.includes('gutter')) return <Droplets className="w-4 h-4 text-blue-600" />;
   return <Wrench className="w-4 h-4 text-slate-700" />;
 };

// Helper function to get trade icon with custom className for enhanced sections
const getTradeIcon = (tradeName: string, className: string = "w-6 h-6") => {
  const n = tradeName.toLowerCase();
  if (n.includes('plumb')) return <Droplets className={className} />;
  if (n.includes('electric')) return <Bolt className={className} />;
  if (n.includes('builder')) return <Hammer className={className} />;
  if (n.includes('paint')) return <Paintbrush className={className} />;
  if (n.includes('roof')) return <HomeIcon className={className} />;
  if (n.includes('garden')) return <Leaf className={className} />;
  if (n.includes('tiler') || n.includes('tile')) return <Layout className={className} />;
  if (n.includes('carpenter')) return <Wrench className={className} />;
  if (n.includes('lock')) return <Key className={className} />;
  if (n.includes('clean')) return <Sparkles className={className} />;
  if (n.includes('fence')) return <Fence className={className} />;
  if (n.includes('hvac') || n.includes('air')) return <Wind className={className} />;
  if (n.includes('bathroom')) return <ShowerHead className={className} />;
  if (n.includes('kitchen')) return <Utensils className={className} />;
  if (n.includes('appliance')) return <Monitor className={className} />;
  if (n.includes('pest')) return <Bug className={className} />;
  if (n.includes('insulation')) return <Thermometer className={className} />;
  if (n.includes('gutter')) return <Droplets className={className} />;
  return <Wrench className={className} />;
};

const tradeCategories = [
  { name: "Plumber", icon: "P", jobs: 1247 },
  { name: "Electrician", icon: "E", jobs: 892 },
  { name: "Builder", icon: "B", jobs: 1156 },
  { name: "Painter", icon: "P", jobs: 743 },
  { name: "Roofer", icon: "R", jobs: 567 },
  { name: "Gardener", icon: "G", jobs: 834 },
  { name: "Tiler", icon: "T", jobs: 445 },
  { name: "Carpenter", icon: "C", jobs: 678 },
  { name: "Locksmith", icon: "L", jobs: 324 },
  { name: "Cleaner", icon: "C", jobs: 956 },
  { name: "Handyman", icon: "H", jobs: 1089 },
  { name: "Plasterer", icon: "P", jobs: 387 },
  { name: "Flooring", icon: "F", jobs: 523 },
  { name: "Kitchen Fitter", icon: "K", jobs: 298 },
  { name: "Bathroom Fitter", icon: "B", jobs: 412 },
  { name: "Window Cleaner", icon: "W", jobs: 634 },
  { name: "Pest Control", icon: "P", jobs: 189 },
  { name: "Appliance Repair", icon: "A", jobs: 267 },
  { name: "HVAC", icon: "H", jobs: 345 },
  { name: "Decorator", icon: "D", jobs: 456 },
  { name: "Driveway", icon: "D", jobs: 234 },
  { name: "Fencing", icon: "F", jobs: 378 },
  { name: "Guttering", icon: "G", jobs: 289 },
  { name: "Insulation", icon: "I", jobs: 156 },
];

type FeaturedTP = {
  id: string;
  name: string;
  trade: string;
  rating: number;
  reviews: number;
  location: string;
  image: string | null;
  verified: boolean;
  yearsExperience: number;
};
// Will be populated from API
// const initialFeatured: FeaturedTP[] = [];

export default function Home() {

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    trade: "",
    description: "",
    postcode: "",
    urgency: "",
    availability: "",
    images: [] as File[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [estimate, setEstimate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [featured, setFeatured] = useState<FeaturedTP[]>([]);
  // Embla for Recommended Jobs (ensures full cards per view)
  const [recEmblaRef, recEmblaApi] = useEmblaCarousel({ loop: false, align: 'start', containScroll: 'trimSnaps' });
  // Testimonials carousel state
  const [testimonialsSlide, setTestimonialsSlide] = useState(0);
  // Hero testimonials carousel state
  const [heroTestimonialIndex, setHeroTestimonialIndex] = useState(0);
  // Embla carousel for Most Popular Services
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start", slidesToScroll: 1 });
  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      try { emblaApi.scrollNext(); } catch {}
    }, 3500);
    return () => clearInterval(interval);
  }, [emblaApi]);
  // Embla carousel for Customer Reviews
  const [testimonialsRef, testimonialsApi] = useEmblaCarousel({ loop: true, align: "start", slidesToScroll: 1 });
  useEffect(() => {
    if (!testimonialsApi) return;
    const interval = setInterval(() => {
      try { testimonialsApi.scrollNext(); } catch {}
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonialsApi]);
  // Hero testimonials data (for carousel in hero section)
  const heroTestimonials = [
    {
      quote: "The easiest way to find a reliable tradesperson. Highly recommended!",
      name: "Sarah M.",
      location: "London",
      rating: 5,
    },
    {
      quote: "Found an amazing electrician within minutes. Professional service!",
      name: "James P.",
      location: "Manchester",
      rating: 5,
    },
    {
      quote: "Quick, easy, and the quality of work was outstanding. Will use again!",
      name: "Emma T.",
      location: "Birmingham",
      rating: 5,
    },
    {
      quote: "Brilliant platform! Connected me with a trusted plumber same day.",
      name: "David R.",
      location: "Leeds",
      rating: 5,
    },
    {
      quote: "Best decision for home repairs. Verified pros and fair pricing!",
      name: "Lisa K.",
      location: "Bristol",
      rating: 5,
    },
  ];

  // Testimonials data and auto-rotate
  const testimonials = [
    {
      name: 'Sarah Thompson',
      city: 'London',
      quote:
        'I had an electrical fault late evening and got matched within minutes. The electrician arrived the next morning and fixed it quickly. The whole process felt safe and transparent.',
      image: 'https://randomuser.me/api/portraits/women/68.jpg',
    },
    {
      name: 'Imran Khan',
      city: 'Manchester',
      quote:
        'Instant quotes saved me so much time. I compared two options, read reviews, and booked in the same hour. The pro turned up on time and the work was spotless.',
      image: 'https://randomuser.me/api/portraits/men/12.jpg',
    },
    {
      name: 'Rebecca Lewis',
      city: 'Birmingham',
      quote:
        'The verified and insured badges gave me confidence. I chose a roofer with great ratings and the price matched the estimate. Would definitely use again.',
      image: 'https://randomuser.me/api/portraits/women/17.jpg',
    },
    {
      name: 'Daniel Murphy',
      city: 'Leeds',
      quote:
        'Super easy to use. I uploaded a couple of photos and got realistic estimates. The tradesman was friendly, tidy, and finished faster than expected.',
      image: 'https://randomuser.me/api/portraits/men/33.jpg',
    },
    {
      name: 'James Patel',
      city: 'Liverpool',
      quote:
        'Booked a plumber in minutes and the communication was brilliant. No hidden costs and the workmanship was excellent. Highly recommend.',
      image: 'https://randomuser.me/api/portraits/men/76.jpg',
    },
    {
      name: 'Priya Singh',
      city: 'Nottingham',
      quote:
        'The insurance guarantee gave me peace of mind. I loved being able to compare profiles and see genuine reviews before confirming.',
      image: 'https://randomuser.me/api/portraits/women/25.jpg',
    },
    {
      name: 'Oliver Wright',
      city: 'Bristol',
      quote:
        'Fast responses and fair pricing. I appreciated the clear timelines and follow-up. Great experience from start to finish.',
      image: 'https://randomuser.me/api/portraits/men/7.jpg',
    },
    {
      name: 'Amelia Clark',
      city: 'Edinburgh',
      quote:
        'I found an experienced decorator who matched my budget. The work was spotless and on schedule. I’ll be back for future projects.',
      image: 'https://randomuser.me/api/portraits/women/49.jpg',
    },
  ];
  const testimonialsPerSlide = 3;
  const testimonialSlides = Math.ceil(testimonials.length / testimonialsPerSlide);
  useEffect(() => {
    const id = setInterval(() => {
      setTestimonialsSlide((i) => (i + 1) % testimonialSlides);
    }, 4500);
    return () => clearInterval(id);
  }, [testimonialSlides]);
  // Hero testimonials auto-rotate
  useEffect(() => {
    const id = setInterval(() => {
      setHeroTestimonialIndex((i) => (i + 1) % heroTestimonials.length);
    }, 5000);
    return () => clearInterval(id);
  }, [heroTestimonials.length]);
  // Rotating hero search messages
  const typingPhrases = [
    "Search plumber in London...",
    "Find electrician in Manchester...",
    "Book roofer in Birmingham...",
    "Hire gardener in Leeds...",
  ];
  const [typed, setTyped] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const current = typingPhrases[phraseIndex];
    const speed = deleting ? 60 : 100;
    const id = setTimeout(() => {
      if (!deleting) {
        const next = current.slice(0, charIndex + 1);
        setTyped(next);
        setCharIndex(charIndex + 1);
        if (next === current) setDeleting(true);
      } else {
        const next = current.slice(0, Math.max(0, charIndex - 1));
        setTyped(next);
        setCharIndex(Math.max(0, charIndex - 1));
        if (next.length === 0) {
          setDeleting(false);
          setPhraseIndex((phraseIndex + 1) % typingPhrases.length);
        }
      }
    }, speed);
    return () => clearTimeout(id);
  }, [charIndex, deleting, phraseIndex, typingPhrases]);

  const itemsPerSlide = 8;
  const totalSlides = Math.ceil(tradeCategories.length / itemsPerSlide);

  const trades = [
    "Plumber",
    "Electrician",
    "Builder",
    "Painter",
    "Roofer",
    "Gardener",
    "Tiler",
    "Carpenter",
    "Locksmith",
    "Cleaner",
    "Handyman",
    "Plasterer",
    "Flooring",
    "Kitchen Fitter",
    "Bathroom Fitter",
    "Window Cleaner",
    "Pest Control",
    "Appliance Repair",
    "HVAC",
    "Decorator",
    "Driveway",
    "Fencing",
    "Guttering",
    "Insulation",
    "Other",
  ];

  const urgencyOptions = [
    { value: "emergency", label: "Emergency (Same day)", icon: "!" },
    { value: "urgent", label: "Urgent (Within 24 hours)", icon: "!" },
    { value: "normal", label: "Normal (Within a week)", icon: "•" },
    { value: "flexible", label: "Flexible (No rush)", icon: "~" },
  ];

  const steps = [
    { number: 1, title: "Select Trade", icon: "1" },
    { number: 2, title: "Describe Job", icon: "2" },
    { number: 3, title: "Location & Timing", icon: "3" },
    { number: 4, title: "Get Estimate", icon: "4" },
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4000);

    return () => clearInterval(interval);
  }, [totalSlides, isAutoPlaying]);

  // Load featured tradespeople from API (top 3)
  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const res = await fetch(
          "/api/tradespeopleeeee/list?page=1&limit=3&sortBy=rating",
          { cache: "no-store" } as RequestInit
        );
        const data = await res.json();
        if (data.success) {
          const mapped: FeaturedTP[] = (data.tradespeople || []).map(
            (p: any) => ({
              id: p.id,
              name: p.name,
              trade: p.trade,
              rating: p.rating,
              reviews: p.reviews,
              location: (p.location || "").toString().split(",")[0] || "",
              image: p.image || null,
              verified: p.verified || false,
              yearsExperience: p.yearsExperience || 0,
            })
          );
          setFeatured(mapped);
        }
      } catch {}
    };
    loadFeatured();
  }, []);


  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    setIsAutoPlaying(false);
  };

  const getCurrentSlideItems = () => {
    const startIndex = currentSlide * itemsPerSlide;
    return tradeCategories.slice(startIndex, startIndex + itemsPerSlide);
  };

  const handleInputChange = (field: string, value: string | File[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateEstimate = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Base pricing by trade and urgency
      const basePricing = {
        plumber: {
          emergency: { min: 200, max: 350 },
          urgent: { min: 150, max: 250 },
          normal: { min: 100, max: 200 },
          flexible: { min: 80, max: 150 },
        },
        electrician: {
          emergency: { min: 300, max: 500 },
          urgent: { min: 200, max: 350 },
          normal: { min: 150, max: 250 },
          flexible: { min: 100, max: 200 },
        },
        builder: {
          emergency: { min: 500, max: 1000 },
          urgent: { min: 400, max: 800 },
          normal: { min: 300, max: 600 },
          flexible: { min: 200, max: 400 },
        },
        painter: {
          emergency: { min: 250, max: 400 },
          urgent: { min: 200, max: 300 },
          normal: { min: 150, max: 250 },
          flexible: { min: 100, max: 200 },
        },
        roofer: {
          emergency: { min: 400, max: 700 },
          urgent: { min: 300, max: 500 },
          normal: { min: 250, max: 400 },
          flexible: { min: 200, max: 350 },
        },
        carpenter: {
          emergency: { min: 300, max: 500 },
          urgent: { min: 250, max: 400 },
          normal: { min: 200, max: 300 },
          flexible: { min: 150, max: 250 },
        },
        tiler: {
          emergency: { min: 350, max: 600 },
          urgent: { min: 300, max: 500 },
          normal: { min: 250, max: 400 },
          flexible: { min: 200, max: 350 },
        },
        handyman: {
          emergency: { min: 150, max: 300 },
          urgent: { min: 120, max: 250 },
          normal: { min: 100, max: 200 },
          flexible: { min: 80, max: 150 },
        },
        cleaner: {
          emergency: { min: 100, max: 200 },
          urgent: { min: 80, max: 150 },
          normal: { min: 60, max: 120 },
          flexible: { min: 50, max: 100 },
        },
        locksmith: {
          emergency: { min: 200, max: 400 },
          urgent: { min: 150, max: 300 },
          normal: { min: 100, max: 200 },
          flexible: { min: 80, max: 150 },
        },
        gardener: {
          emergency: { min: 120, max: 250 },
          urgent: { min: 100, max: 200 },
          normal: { min: 80, max: 150 },
          flexible: { min: 60, max: 120 },
        },
        plasterer: {
          emergency: { min: 250, max: 450 },
          urgent: { min: 200, max: 350 },
          normal: { min: 150, max: 250 },
          flexible: { min: 120, max: 200 },
        },
        flooring: {
          emergency: { min: 300, max: 600 },
          urgent: { min: 250, max: 500 },
          normal: { min: 200, max: 400 },
          flexible: { min: 150, max: 300 },
        },
        "kitchen fitter": {
          emergency: { min: 800, max: 1500 },
          urgent: { min: 600, max: 1200 },
          normal: { min: 500, max: 1000 },
          flexible: { min: 400, max: 800 },
        },
        "bathroom fitter": {
          emergency: { min: 600, max: 1200 },
          urgent: { min: 500, max: 1000 },
          normal: { min: 400, max: 800 },
          flexible: { min: 300, max: 600 },
        },
        "window cleaner": {
          emergency: { min: 80, max: 150 },
          urgent: { min: 60, max: 120 },
          normal: { min: 50, max: 100 },
          flexible: { min: 40, max: 80 },
        },
        "pest control": {
          emergency: { min: 150, max: 300 },
          urgent: { min: 120, max: 250 },
          normal: { min: 100, max: 200 },
          flexible: { min: 80, max: 150 },
        },
        "appliance repair": {
          emergency: { min: 200, max: 400 },
          urgent: { min: 150, max: 300 },
          normal: { min: 120, max: 250 },
          flexible: { min: 100, max: 200 },
        },
        hvac: {
          emergency: { min: 400, max: 700 },
          urgent: { min: 300, max: 500 },
          normal: { min: 250, max: 400 },
          flexible: { min: 200, max: 350 },
        },
        decorator: {
          emergency: { min: 200, max: 350 },
          urgent: { min: 150, max: 250 },
          normal: { min: 120, max: 200 },
          flexible: { min: 100, max: 180 },
        },
        driveway: {
          emergency: { min: 500, max: 1000 },
          urgent: { min: 400, max: 800 },
          normal: { min: 300, max: 600 },
          flexible: { min: 250, max: 500 },
        },
        fencing: {
          emergency: { min: 300, max: 600 },
          urgent: { min: 250, max: 500 },
          normal: { min: 200, max: 400 },
          flexible: { min: 150, max: 300 },
        },
        guttering: {
          emergency: { min: 200, max: 400 },
          urgent: { min: 150, max: 300 },
          normal: { min: 120, max: 250 },
          flexible: { min: 100, max: 200 },
        },
        insulation: {
          emergency: { min: 400, max: 800 },
          urgent: { min: 300, max: 600 },
          normal: { min: 250, max: 500 },
          flexible: { min: 200, max: 400 },
        },
      };

      // Location multipliers (based on UK regions)
      const locationMultipliers = {
        london: 1.4,
        manchester: 1.2,
        birmingham: 1.1,
        leeds: 1.1,
        liverpool: 1.0,
        sheffield: 1.0,
        edinburgh: 1.2,
        glasgow: 1.1,
        bristol: 1.2,
        cardiff: 1.1,
        newcastle: 1.0,
        belfast: 1.0,
        default: 1.0,
      };

      const tradeKey = formData.trade.toLowerCase();
      const urgencyKey = formData.urgency as keyof typeof basePricing.plumber;

      // Get base pricing for the trade and urgency
      const basePrice =
        basePricing[tradeKey as keyof typeof basePricing]?.[urgencyKey] ||
        basePricing.handyman[urgencyKey];

      // Determine location multiplier
      const postcode = formData.postcode.toLowerCase();
      let locationMultiplier = locationMultipliers.default;

      // Check for major cities in postcode
      for (const [city, multiplier] of Object.entries(locationMultipliers)) {
        if (postcode.includes(city)) {
          locationMultiplier = multiplier;
          break;
        }
      }

      // Apply location multiplier
      const adjustedMin = Math.round(basePrice.min * locationMultiplier);
      const adjustedMax = Math.round(basePrice.max * locationMultiplier);

      // Add some randomness to make it feel more realistic
      const randomVariation = 0.9 + Math.random() * 0.2; // ±10% variation
      const finalMin = Math.round(adjustedMin * randomVariation);
      const finalMax = Math.round(adjustedMax * randomVariation);

      const estimate = `£${finalMin}-${finalMax}`;
      setEstimate(estimate);
    } catch (error) {
      console.error("Error generating estimate:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitJob = async () => {
    // Simply redirect to login
    window.location.href = '/login/client';
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8 md:mb-10">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                What <span className="text-[#fdbd18]">service</span> do you need?
              </h3>
              <p className="text-gray-600 text-base md:text-lg">
                Select the type of <span className="text-[#fdbd18] font-semibold">trade</span> you are looking for
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <Sparkles className="w-4 h-4" /> AI will tailor questions for faster, accurate quotes
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent my-2 md:my-3" />

            <div className="max-w-2xl mx-auto bg-white/70 backdrop-blur-[2px] border border-blue-100 rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm">
              <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-4">
                Trade Category <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.trade}
                onValueChange={(value) => handleInputChange("trade", value)}
              >
                <SelectTrigger className="w-full h-14 rounded-xl border border-blue-200 bg-white/90 focus:ring-2 focus:ring-blue-400 focus:border-blue-300 transition-shadow shadow-sm hover:shadow">
                  <SelectValue placeholder="e.g. Plumber, Electrician, Builder" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {tradeCategories.map((option) => (
                    <SelectItem key={option.name} value={option.name.toLowerCase()}>
                      <div className="flex items-center gap-2">
                        {tradeIconFor(option.name)}
                        <span>{option.name}</span>
                        <span className="ml-auto text-[11px] text-slate-500">{option.jobs} jobs</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-800"><ShieldCheck className="w-3.5 h-3.5" /> Verified pros</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-1 text-yellow-800"><Star className="w-3.5 h-3.5" /> Top rated</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-green-800"><Clock className="w-3.5 h-3.5" /> Under 60s</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-800"><Shield className="w-3.5 h-3.5" /> Fully insured</span>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6 md:mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Tell us about your <span className="text-[#fdbd18]">job</span>
              </h3>
              <p className="text-gray-600 text-base md:text-lg">
                A few details help us get you an <span className="text-[#fdbd18] font-semibold">accurate</span> quote
              </p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <Sparkles className="w-3.5 h-3.5" /> AI highlights what pros need to know
              </div>
            </div>

            <div className="max-w-2xl mx-auto bg-white/70 backdrop-blur-[2px] border border-blue-100 rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                    Describe the work <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="E.g. Leak under kitchen sink, steady drip when tap runs…"
                    className="min-h-[120px] text-base bg-white border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Tip: mention size, access, materials, and any photos
                  </p>
                </div>

                <div>
                  <label className="block text-sm md:text-base font-semibold text-gray-700 mb-3">
                    Urgency <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.urgency}
                    onValueChange={(value) => handleInputChange("urgency", value)}
                  >
                    <SelectTrigger className="w-full h-12 rounded-xl border border-blue-200 bg-white/90 focus:ring-2 focus:ring-blue-400 focus:border-blue-300 transition-shadow shadow-sm hover:shadow">
                      <SelectValue placeholder="How urgent is it? (e.g. Emergency, Urgent, Normal)" />
                    </SelectTrigger>
                    <SelectContent>
                      {urgencyOptions.map((u) => (
                        <SelectItem key={u.value} value={u.value}>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-700" />
                            <span>{u.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm md:text-base font-semibold text-gray-700 mb-3">
                    Add photos (optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-11 rounded-xl bg-blue-700 hover:bg-blue-800 text-white"
                    >
                      <Upload className="w-4 h-4 mr-2" /> Upload images
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <span className="text-xs text-gray-500">JPG or PNG up to 10MB each</span>
                  </div>

                  {formData.images?.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {formData.images.map((file, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`upload-${idx}`}
                            className="h-24 w-full object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute -top-2 -right-2 bg-white/95 border border-gray-200 rounded-full p-1 shadow hover:shadow-md"
                            aria-label="Remove image"
                          >
                            <X className="w-3.5 h-3.5 text-gray-700" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-800"><ShieldCheck className="w-3.5 h-3.5" /> Verified pros</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-800"><Shield className="w-3.5 h-3.5" /> Fully insured</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Location & Availability
              </h3>
              <p className="text-gray-600">
                Where and when do you need the work done?
              </p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <MapPin className="w-3.5 h-3.5" /> AI suggests nearby verified pros based on your area
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Where? <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  value={formData.postcode}
                  onChange={(e) =>
                    handleInputChange("postcode", e.target.value.toUpperCase())
                  }
                  placeholder="Enter your postcode or town"
                  className="pl-10 h-12 text-base text-gray-900 bg-white border-gray-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preferred Availability
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["Morning", "Afternoon", "Evening", "Flexible"].map((time) => (
                  <Button
                    key={time}
                    variant={
                      formData.availability === time ? "default" : "outline"
                    }
                    onClick={() => handleInputChange("availability", time)}
                    className={`h-14 text-sm md:text-base font-medium transition-all duration-200 ${
                      formData.availability === time
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg"
                        : "bg-white text-gray-900 border-2 border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Your AI Estimate
              </h3>
              <p className="text-gray-600">
                Based on your job details and location
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
                <p className="text-gray-600">Generating your estimate...</p>
              </div>
            ) : estimate ? (
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 shadow-xl">
                <CardContent className="p-8 md:p-10 text-center">
                  <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
                    {estimate}
                  </div>
                  <p className="text-gray-700 mb-6 text-lg">
                    Estimated cost for your {formData.trade.toLowerCase()} job
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base text-gray-700 bg-white/50 rounded-lg p-4 mb-6">
                    <div>
                      <strong>Trade:</strong> {formData.trade}
                    </div>
                    <div>
                      <strong>Location:</strong> {formData.postcode}
                    </div>
                    <div>
                      <strong>Urgency:</strong>{" "}
                      {
                        urgencyOptions.find((u) => u.value === formData.urgency)
                          ?.label
                      }
                    </div>
                    <div>
                      <strong>Availability:</strong>{" "}
                      {formData.availability || "Flexible"}
                    </div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 font-medium">
                      ⚠️ This is an AI-generated quote. Your selected tradesman
                      may quote differently.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center">
                <Button
                  onClick={generateEstimate}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black text-lg font-medium py-4 px-8 rounded-lg font-semibold"
                >
                  Generate Estimate
                </Button>
              </div>
            )}

            {estimate && (
              <div className="text-center space-y-4">
                <div className="space-y-3">
                  <Button
                    onClick={submitJob}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base md:text-lg font-medium py-3 sm:py-4 px-4 sm:px-6 md:px-8 rounded-lg w-full font-semibold"
                  >
                    Submit Job for Approval
                  </Button>
                  
                <Button
                  asChild
                    variant="outline"
                    className="bg-blue-700 hover:bg-blue-800 text-white text-sm sm:text-base md:text-lg font-medium py-3 sm:py-4 px-4 sm:px-6 md:px-8 rounded-lg w-full font-semibold"
                >
                  <Link href="/find-tradespeople">
                      Browse Tradespeople Instead
                  </Link>
                </Button>
                </div>
                
                {submitResult && (
                  <div className={`p-4 rounded-lg ${
                    submitResult.success 
                      ? 'bg-green-50 border border-green-200 text-green-800' 
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}>
                    <p className="font-semibold">{submitResult.message}</p>
                    {submitResult.data?.jobId && (
                      <p className="text-sm mt-1">Job ID: {submitResult.data.jobId}</p>
                    )}
                  </div>
                )}
                
                <p className="text-sm text-gray-700">
                  Submit your job for admin approval, or browse available tradespeople
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Add Font Awesome CSS for icons (client-only, in effect to avoid hydration issues)
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css";
    link.rel = "stylesheet";
    link.crossOrigin = "anonymous";
    link.referrerPolicy = "no-referrer";
    document.head.appendChild(link);
    return () => {
      try {
        document.head.removeChild(link);
      } catch {}
    };
  }, []);

  return (
    <>
      {/* SEO Schema Markup */}
      <SchemaMarkup schema={organizationSchema} />
      <SchemaMarkup schema={ServiceSchema} />
      {/* World-Class Mobile-First Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-950 to-indigo-900 text-white overflow-hidden min-h-[52vh] md:min-h-[44vh] lg:min-h-[42vh]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/80 via-blue-800/70 to-indigo-800/60"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.3),transparent_50%)] animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(251,191,36,0.2),transparent_50%)] animate-pulse" style={{animationDelay: '1s'}}></div>
        
        {/* Floating Elements - Hidden on mobile for better performance */}
        <div className="hidden sm:block absolute top-20 left-10 w-20 h-20 bg-yellow-400/20 rounded-full blur-xl animate-bounce" style={{animationDelay: '0.5s'}}></div>
        <div className="hidden sm:block absolute top-40 right-20 w-16 h-16 bg-blue-400/20 rounded-full blur-xl animate-bounce" style={{animationDelay: '1.5s'}}></div>
        <div className="hidden sm:block absolute bottom-32 left-20 w-12 h-12 bg-white/10 rounded-full blur-lg animate-bounce" style={{animationDelay: '2s'}}></div>
        {/* Mobile-First Container */}
        <div className="relative z-10 min-h-[52vh] md:min-h-[44vh] lg:min-h-[42vh] flex flex-col justify-center px-4 py-6 md:py-0 md:pt-6 lg:py-0 lg:pt-8 sm:px-6 md:px-8 lg:px-10 xl:px-12">
          <div className="max-w-4xl lg:max-w-7xl mx-auto w-full h-full flex flex-col md:grid md:grid-cols-2 items-center md:items-center md:place-items-center gap-6 md:gap-5 lg:gap-6">
            {/* Mobile-First Content */}
            <div className="flex-1 z-10 flex flex-col items-center text-center md:items-start md:text-left md:justify-center lg:items-start lg:text-left lg:justify-center md:self-center lg:self-center md:max-w-2xl lg:max-w-2xl w-full">
              {/* Premium Badge - Mobile Optimized */}
              <div className="flex justify-center lg:justify-start mb-6 sm:mb-8 lg:mb-3">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400/90 to-yellow-500/90 backdrop-blur-sm px-4 py-2 lg:px-5 lg:py-2.5 rounded-full border border-yellow-300/50 shadow-lg lg:self-start">
                  <div className="relative">
                    <Star className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-900 animate-pulse" />
                    <div className="absolute -inset-1 bg-yellow-300/40 rounded-full blur-sm animate-ping"></div>
                  </div>
                  <span className="text-sm lg:text-base font-bold text-yellow-900">Rated #1 Tradesperson Platform</span>
                </div>
              </div>

              {/* Hero Title - World-Class Mobile Typography */}
              <div className="text-center lg:text-left mb-8 sm:mb-10 lg:mb-2">
                <h1 className="text-4xl sm:text-5xl md:text-3xl lg:text-4xl xl:text-5xl font-black leading-[1.05] tracking-tight mb-5 sm:mb-7 md:mb-1 lg:mb-1">
                  <span className="block">
                    <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">Find</span>
                    <span className="text-white"> Trusted</span>
                  </span>
                  <span className="block">
                    <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">Local</span>
                    <span className="text-white"> Tradespeople</span>
                  </span>
                </h1>
                
                <p className="text-lg sm:text-xl md:text-base lg:text-lg xl:text-xl text-blue-50/95 leading-relaxed md:leading-relaxed max-w-lg md:max-w-lg lg:max-w-xl mx-auto md:mx-0 lg:mx-0 font-normal tracking-normal md:mt-3 lg:mt-4">
                  Hire vetted professionals near you. Fast, reliable, and backed by verified reviews.
                </p>
              </div>
            
              {/* Premium Statistics - Mobile Optimized */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 mb-8 sm:mb-10 lg:mb-5 lg:hidden">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 shadow-lg">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-sm font-semibold text-white">5K+ Trades</span>
                </div>
              </div>
            <div className="w-full max-w-sm sm:max-w-lg md:max-w-md lg:max-w-lg animate-slide-up" style={{animationDelay: '0.6s'}}>
              <Dialog>
                <DialogTrigger asChild>
                  <div id="ai-quote-trigger" className="relative group cursor-pointer">
                    {/* Enhanced Glow Effect with Gold Accent */}
                    <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl opacity-30 group-hover:opacity-50 transition duration-2000 group-hover:duration-500 animate-pulse"></div>
                    <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-yellow-400/40 via-white/20 to-yellow-400/40 rounded-xl sm:rounded-2xl blur-md sm:blur-lg opacity-20 group-hover:opacity-30 transition duration-1500"></div>
                    
                    <div className="relative flex items-center bg-white backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-2 sm:p-4 md:p-4 lg:p-4 border-2 border-yellow-400/60 group-hover:border-yellow-400 transition-all duration-300">
                      <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-9 md:h-9 lg:w-9 lg:h-9 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg sm:rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
                        <Search className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4 lg:w-4 lg:h-4 text-white" />
                      </div>
                      <input
                        type="text"
                        placeholder={typed || typingPhrases[phraseIndex]}
                        className="flex-1 py-2 sm:py-3 md:py-2 lg:py-2 px-2 sm:px-4 md:px-3 lg:px-3 rounded-lg sm:rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none text-sm sm:text-base md:text-sm lg:text-sm font-medium bg-transparent cursor-pointer"
                        readOnly
                      />
                      <Button
                        type="button"
                        className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 hover:from-yellow-500 hover:via-yellow-600 hover:to-amber-600 text-gray-900 font-semibold rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-5 lg:px-6 py-2.5 sm:py-3.5 md:py-2.5 lg:py-3 text-sm sm:text-base md:text-sm lg:text-base shadow-xl hover:shadow-2xl transition-all duration-300 flex-shrink-0 hover:scale-105"
                      >
                        <span className="hidden sm:inline">Get Started</span>
                        <span className="sm:hidden">Go</span>
                        <ArrowRight className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 ml-1.5 sm:ml-2" />
                      </Button>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-lg sm:max-w-2xl w-full p-0 bg-white max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                  <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                    {/* 4-Step AI Quote Form (Stepper) - Mobile Responsive */}
                    <div className="flex items-center justify-between mb-6 sm:mb-8 md:mb-10">
                      {steps.map((step, index) => (
                        <div key={step.number} className="flex items-center flex-1">
                          <div
                            className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full text-xs sm:text-sm md:text-base font-semibold transition-all duration-300 ${
                              currentStep >= step.number
                                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-110"
                                : "bg-gray-100 text-gray-500 border-2 border-gray-200"
                            }`}
                          >
                            {currentStep > step.number ? (
                              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                            ) : (
                              step.number
                            )}
                          </div>
                          {index < steps.length - 1 && (
                            <div
                              className={`flex-1 h-1 mx-1 sm:mx-2 md:mx-4 rounded-full transition-all duration-300 ${
                                currentStep > step.number
                                  ? "bg-gradient-to-r from-blue-600 to-blue-700"
                                  : "bg-gray-200"
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="min-h-[300px] sm:min-h-[350px] md:min-h-[400px]">{renderStep()}</div>
                    <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mt-6 sm:mt-8 md:mt-10">
                      <Button
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="flex items-center justify-center bg-white text-gray-900 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium"
                      >
                        <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Previous
                      </Button>
                      {currentStep < 4 && (
                        <Button
                          onClick={nextStep}
                          disabled={
                            (currentStep === 1 && !formData.trade) ||
                            (currentStep === 2 && (!formData.description || !formData.urgency)) ||
                            (currentStep === 3 && !formData.postcode)
                          }
                          className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 hover:from-yellow-500 hover:via-yellow-600 hover:to-amber-600 text-gray-900 font-semibold px-8 sm:px-10 py-3 sm:py-3.5 text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl hover:scale-105"
                        >
                          Next
                        </Button>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              {/* Enhanced Trust badges - Exact Badge Style */}
              <div className="mt-4 sm:mt-6 lg:mt-4 flex flex-wrap justify-center gap-1.5 sm:gap-2 animate-slide-up" style={{animationDelay: '0.8s'}}>
                <div className="flex items-center gap-1 bg-teal-600 px-2 py-1 rounded-full border border-teal-500/30 shadow-sm">
                  <ShieldCheck className="w-3 h-3 text-white" />
                  <span className="text-xs font-semibold text-white">Verified</span>
                </div>
                <div className="flex items-center gap-1 bg-blue-600 px-2 py-1 rounded-full border border-blue-500/30 shadow-sm">
                  <Shield className="w-3 h-3 text-white" />
                  <span className="text-xs font-semibold text-white">Insured</span>
                </div>
                <div className="flex items-center gap-1 bg-yellow-400 px-2 py-1 rounded-full border border-yellow-300/30 shadow-sm">
                  <Star className="w-3 h-3 text-yellow-800 fill-current" />
                  <span className="text-xs font-semibold text-yellow-900">4.9★</span>
                </div>
              </div>
            </div>
            {/* Hero Testimonials Carousel */}
            <div className="mt-4 sm:mt-5 md:mt-4 lg:mt-6">
              <div className="relative overflow-hidden max-w-md mx-auto">
                <div 
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${heroTestimonialIndex * 100}%)` }}
                >
                  {heroTestimonials.map((testimonial, idx) => (
                    <div key={idx} className="min-w-full flex-shrink-0">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] text-blue-50/90 leading-tight font-light px-4 max-w-[300px] mx-auto">
                            "{testimonial.quote}"
                          </p>
                          <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 mt-2 sm:mt-3">
                            <div className="flex items-center gap-0.5 sm:gap-1">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-400 fill-yellow-400" />
                              ))}
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-yellow-300 font-semibold text-sm">{testimonial.name}</span>
                              <span className="text-blue-200/80">•</span>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-yellow-300" />
                                <span className="text-blue-100/80 text-sm">{testimonial.location}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Right Column: Enlarged Hero Visual - Hidden on Mobile */}
          <div className="hidden md:flex lg:flex flex-1 z-10 items-center justify-end self-stretch h-full relative animate-slide-up mt-2 md:mt-0 lg:mt-0" style={{animationDelay: '0.4s'}}>
            <div className="relative w-full max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl md:h-full lg:h-full">
              <div className="absolute inset-0 pointer-events-none hidden md:block">
                <div className="absolute right-6 bottom-10 w-72 h-72 lg:w-80 lg:h-80 rounded-full blur-3xl opacity-40" style={{background: 'radial-gradient(closest-side, rgba(251,191,36,0.25), rgba(59,130,246,0.12), transparent)'}}></div>
              </div>
              <div className="relative h-full flex items-start mt-6 md:mt-10 lg:mt-12">
                <img
                  src="/hero.png"
                  alt="Trusted Tradespeople"
                  className="w-full h-[420px] sm:h-[520px] md:h-auto lg:h-auto xl:h-auto max-h-[72vh] md:max-h-[70vh] lg:max-h-[74vh] object-contain md:object-right lg:object-right object-top transition-transform duration-700 sm:rounded-none drop-shadow-2xl md:contrast-110 md:saturate-110 md:brightness-105 scale-[1.08] md:scale-[1.16] lg:scale-[1.2]"
                  style={{ objectFit: 'contain', objectPosition: 'right top' }}
                />
                
                {/* Trust Badges Container - Mobile Responsive */}
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Most In-Demand Services Carousel - Premium Design */}
      <section className="relative py-8 sm:py-12 md:py-16 my-0 bg-white text-gray-900 overflow-hidden">
        {/* Premium Background Elements - Matching testimonials section */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(251,191,36,0.06),transparent_60%)]"></div>
        
        <Container size="wide" className="relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-4xl mx-auto mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-700 to-blue-800 px-4 py-2 rounded-full mb-4 shadow-sm">
              <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span className="text-sm font-semibold text-white">Most In-Demand</span>
            </div>
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4 text-blue-950">
              Most In-Demand Services
            </h2>
            <p className="text-slate-600 text-base xs:text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed font-light">
              Discover our most popular services trusted by thousands of homeowners.
            </p>
          </div>

          {/* Services Carousel */}
          <div className="relative mb-12 sm:mb-16">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-3 sm:gap-4" style={{touchAction: 'pan-x'}}>
                {[
                  { title: 'Emergency Plumbing', jobs: '1,245', responseTime: '30 min', bookedToday: '42+', price: '£99', icon: '🚰' },
                  { title: 'Electrical Repairs', jobs: '982', responseTime: '45 min', bookedToday: '35+', price: '£85', icon: '💡' },
                  { title: 'Painting & Decorating', jobs: '763', responseTime: '60 min', bookedToday: '28+', price: '£120', icon: '🖌️' },
                  { title: 'Handyman Services', jobs: '1,560', responseTime: '90 min', bookedToday: '67+', price: '£45', icon: '🔨' },
                  { title: 'Gardening & Landscaping', jobs: '890', responseTime: '60 min', bookedToday: '45+', price: '£75', icon: '⛏️' },
                  { title: 'Home Cleaning', jobs: '2,100', responseTime: '30 min', bookedToday: '92+', price: '£25', icon: '🧹' },
                  { title: 'Roofing & Gutters', jobs: '678', responseTime: '60 min', bookedToday: '19+', price: '£150', icon: '🏠' },
                  { title: 'Carpentry & Joinery', jobs: '542', responseTime: '90 min', bookedToday: '15+', price: '£110', icon: '🪚' },
                  { title: 'Locksmith', jobs: '1,890', responseTime: '15 min', bookedToday: '55+', price: '£65', icon: '🔐' },
                  { title: 'Gas & Boiler', jobs: '1,120', responseTime: '45 min', bookedToday: '38+', price: '£90', icon: '🔥' },
                  { title: 'Tiling & Flooring', jobs: '620', responseTime: '60 min', bookedToday: '22+', price: '£80', icon: '🧱' },
                  { title: 'Plastering', jobs: '480', responseTime: '90 min', bookedToday: '14+', price: '£95', icon: '🏗️' },
                  { title: 'Bathroom Fitting', jobs: '710', responseTime: '60 min', bookedToday: '20+', price: '£200', icon: '🚿' },
                  { title: 'Kitchen Fitting', jobs: '530', responseTime: '90 min', bookedToday: '12+', price: '£250', icon: '🍳' },
                  { title: 'Window & Door Fitting', jobs: '390', responseTime: '60 min', bookedToday: '11+', price: '£180', icon: '🪟' },
                  { title: 'Driveway & Paving', jobs: '340', responseTime: '90 min', bookedToday: '9+', price: '£300', icon: '🛤️' },
                  { title: 'Fencing', jobs: '560', responseTime: '60 min', bookedToday: '18+', price: '£130', icon: '🏡' },
                  { title: 'Pest Control', jobs: '870', responseTime: '30 min', bookedToday: '31+', price: '£55', icon: '🐜' },
                  { title: 'CCTV & Security', jobs: '420', responseTime: '60 min', bookedToday: '13+', price: '£140', icon: '📹' },
                  { title: 'Heating & Radiators', jobs: '650', responseTime: '45 min', bookedToday: '21+', price: '£75', icon: '🌡️' },
                  { title: 'Appliance Repairs', jobs: '780', responseTime: '45 min', bookedToday: '25+', price: '£60', icon: '🔌' },
                  { title: 'Removal & Man with Van', jobs: '1,340', responseTime: '30 min', bookedToday: '48+', price: '£50', icon: '🚚' },
                  { title: 'Scaffolding', jobs: '280', responseTime: '90 min', bookedToday: '8+', price: '£200', icon: '🪜' },
                  { title: 'Aerial & Satellite', jobs: '310', responseTime: '60 min', bookedToday: '10+', price: '£70', icon: '📡' },
                ].map((service, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-[85%] xs:w-[75%] sm:w-[48%] lg:w-[31%] group bg-white rounded-2xl p-3 sm:p-4 border-2 border-gray-200 hover:border-yellow-400 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/0 to-blue-50/0 group-hover:from-yellow-50/40 group-hover:to-blue-50/20 transition-all duration-500 rounded-2xl pointer-events-none" />

                    <div className="relative z-10 flex items-center gap-3 sm:gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl sm:text-2xl">
                        {service.icon}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate">{service.title}</h3>
                          <span className="hidden xs:inline-flex items-center gap-1 bg-orange-50 text-orange-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-orange-200 flex-shrink-0">
                            <span className="w-1 h-1 rounded-full bg-orange-500 animate-pulse"></span>
                            Hot
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-gray-400 mb-0.5 sm:mb-1">{service.jobs} jobs · {service.bookedToday} booked today</p>
                        <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-gray-600">
                          <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                          </span>
                          <span className="font-medium">{service.responseTime} · Available now</span>
                        </div>
                      </div>

                      {/* Price + CTA */}
                      <div className="flex-shrink-0 flex flex-col items-end gap-1 sm:gap-1.5">
                        <div className="text-right">
                          <p className="text-[8px] sm:text-[9px] text-gray-400 uppercase tracking-widest leading-none">From</p>
                          <p className="text-base sm:text-lg font-extrabold text-gray-900 leading-tight">{service.price}</p>
                        </div>
                        <button className="inline-flex items-center gap-1 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-1.5 px-2.5 sm:px-3.5 rounded-lg text-[10px] sm:text-[11px] transition-colors duration-200 whitespace-nowrap shadow-sm">
                          Get Quote
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto mb-8 sm:mb-12">
            {[
              { icon: '✓', label: 'All Trades Verified' },
              { icon: '🛡️', label: 'Insurance Guaranteed' },
              { icon: '⭐', label: 'Rated 5.0 by 50,000+' },
              { icon: '🕐', label: '24/7 Support' }
            ].map((badge, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-gray-200 text-center shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-3xl mb-2">{badge.icon}</div>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{badge.label}</p>
              </div>
            ))}
          </div>

          {/* View All Services Button */}
          <div className="text-center">
            <Link 
              href="/find-tradespeople"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 hover:from-yellow-500 hover:via-yellow-600 hover:to-amber-600 text-gray-900 font-semibold rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl group text-base sm:text-lg hover:scale-105"
            >
              <span>View All Services</span>
              <ArrowRight className="ml-2 sm:ml-3 w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </Container>
      </section>

      {/* Customer Reviews Section */}
      <section className="relative py-16 sm:py-20 md:py-24 bg-white text-gray-900 overflow-hidden">
        <Container size="wide" className="relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-700 to-blue-800 px-4 py-2 rounded-full mb-5 shadow-sm">
              <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span className="text-sm font-semibold text-white">Customer Reviews</span>
            </div>
            <h2 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6 text-blue-950">
              What Customers Say
            </h2>
            <p className="text-slate-600 text-lg xs:text-xl sm:text-2xl max-w-3xl mx-auto leading-relaxed font-light">
              Real reviews from thousands of satisfied customers across the UK
            </p>
          </div>

          {/* Testimonials Carousel */}
          <div className="relative mb-8 sm:mb-10">
            <div className="overflow-hidden" ref={testimonialsRef}>
              <div className="flex gap-4 sm:gap-6" style={{touchAction: 'pan-x'}}>
                {[
                  {
                    name: "Sarah Thompson",
                    city: "London",
                    initials: "ST",
                    quote: "I had an electrical fault late evening and got matched within minutes. The electrician arrived the next morning and fixed it quickly. The whole process felt safe and transparent."
                  },
                  {
                    name: "Imran Khan", 
                    city: "Manchester",
                    initials: "IK",
                    quote: "Instant quotes saved me so much time. I compared two options, read reviews, and booked in the same hour. The pro turned up on time and the work was spotless."
                  },
                  {
                    name: "Rebecca Lewis",
                    city: "Birmingham", 
                    initials: "RL",
                    quote: "The verified and insured badges gave me confidence. I chose a roofer with great ratings and the price matched the estimate. Would definitely use again."
                  },
                  {
                    name: "Daniel Murphy",
                    city: "Leeds",
                    initials: "DM",
                    quote: "Super easy to use. I uploaded a couple of photos and got realistic estimates. The tradesman was friendly, tidy, and finished faster than expected."
                  },
                  {
                    name: "James Patel",
                    city: "Liverpool",
                    initials: "JP",
                    quote: "Booked a plumber in minutes and the communication was brilliant. No hidden costs and the workmanship was excellent. Highly recommend."
                  },
                  {
                    name: "Priya Singh",
                    city: "Nottingham",
                    initials: "PS",
                    quote: "The insurance guarantee gave me peace of mind. I loved being able to compare profiles and see genuine reviews before confirming."
                  }
                ].map((testimonial, index) => (
                  <div 
                    key={index}
                    className="flex-shrink-0 w-[85%] xs:w-[75%] sm:w-[60%] lg:w-[38%] group bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-yellow-400 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="relative z-10">
                      {/* Customer Info */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center font-extrabold text-white text-lg flex-shrink-0">
                          {testimonial.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-gray-900 text-sm mb-0.5">{testimonial.name}</h4>
                          <div className="flex items-center gap-1 text-gray-500 text-xs">
                            <MapPin className="w-3 h-3 text-blue-500 flex-shrink-0" />
                            <span>{testimonial.city}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-yellow-400 fill-current flex-shrink-0" />
                            ))}
                          </div>
                          <p className="text-xs font-semibold text-gray-500 mt-0.5">5.0</p>
                        </div>
                      </div>

                      {/* Quote */}
                      <blockquote className="text-gray-700 text-sm leading-relaxed">
                        "{testimonial.quote}"
                      </blockquote>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mb-16 sm:mb-20">
            <Link 
              href="/find-tradespeople"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 hover:from-yellow-500 hover:via-yellow-600 hover:to-amber-600 text-gray-900 font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl group text-lg hover:scale-105"
            >
              <span>Book TradesPerson</span>
              <ArrowRight className="ml-3 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Trust Stats Bar */}
          <div className="bg-blue-700 rounded-2xl p-6 sm:p-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { value: '4.9/5', label: 'Average Rating' },
                { value: '50,000+', label: 'Happy Customers' },
                { value: '98%', label: 'Would Recommend' },
                { value: '24/7', label: 'Customer Support' },
              ].map((stat, i) => (
                <div key={i} className="text-center sm:border-r sm:last:border-r-0 border-blue-500/40">
                  <div className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">{stat.value}</div>
                  <p className="text-blue-200 text-xs sm:text-sm font-medium mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      

      

      

      {/* Get Started Section - Premium Multi-Million Pound Design */}
      <section className="relative py-12 sm:py-16 md:py-20 my-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        {/* Premium Animated Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.2),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(251,191,36,0.15),transparent_60%)]"></div>
        
        <Container size="wide" className="relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400/30 to-blue-400/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-yellow-300/50 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span className="text-xs font-medium text-yellow-100">Get Started Today</span>
            </div>
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4">
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">Choose Your</span>{' '}
              <span className="text-white">Path</span>
            </h2>
            <p className="text-blue-100 text-base xs:text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed font-light">
              Whether you need a service or provide one, we've got you covered
            </p>
          </div>

          {/* Action Cards Grid - Premium Design */}
          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {/* Hire a tradesperson */}
            <Link href="/find-tradespeople" className="h-full flex flex-col bg-white rounded-3xl overflow-hidden border-2 border-gray-200 hover:border-yellow-400 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 shadow-lg group relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 via-transparent to-blue-50/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1500"></div>
              
              <div className="relative z-10 flex flex-col h-full">
                {/* Hero Image - Mobile Responsive */}
                <div className="relative h-64 sm:h-72 md:h-80 overflow-hidden">
                  <img 
                    src="/hire-tradesperson.jpg" 
                    alt="Professional tradesperson at work"
                    className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium">
                      Popular
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  {/* Service Header */}
                  <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                      <div className="text-blue-600 group-hover:text-blue-700 transition-colors duration-300">
                        <Search className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300 leading-tight">
                        Hire a tradesperson
                      </h3>
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="flex-1 space-y-3 mb-4 sm:mb-5">
                    <p className="text-gray-600 text-lg sm:text-xl leading-relaxed font-light">
                      Find your local pro and get quotes in minutes.
                    </p>
                    
                    <div className="flex items-center justify-between text-sm sm:text-base text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Instant quotes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Local pros</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="mt-auto">
                    <div className="w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 hover:from-yellow-500 hover:via-yellow-600 hover:to-amber-600 text-gray-900 font-semibold py-4 sm:py-5 px-4 sm:px-5 rounded-xl text-center transition-all duration-300 shadow-xl hover:shadow-2xl text-base sm:text-lg hover:scale-105">
                      Hire now
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Tradesperson sign up */}
            <Link href="/register/tradesperson" className="h-full flex flex-col bg-white rounded-3xl overflow-hidden border-2 border-gray-200 hover:border-yellow-400 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 shadow-lg group relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 via-transparent to-blue-50/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1500"></div>
              
              <div className="relative z-10 flex flex-col h-full">
                {/* Hero Image - Mobile Responsive */}
                <div className="relative h-64 sm:h-72 md:h-80 overflow-hidden">
                  <img 
                    src="/tradesperson-signup.jpg" 
                    alt="Successful tradesperson growing business"
                    className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                      Business
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  {/* Service Header */}
                  <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-green-50 to-green-100 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                      <div className="text-green-600 group-hover:text-green-700 transition-colors duration-300">
                        <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors duration-300 leading-tight">
                        Tradesperson sign up
                      </h3>
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="flex-1 space-y-3 mb-4 sm:mb-5">
                    <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                      Join 10,000+ approved tradespeople and grow your business.
                    </p>
                    
                    <div className="flex items-center justify-between text-sm sm:text-base text-gray-500">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Verified</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>10k+ members</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="mt-auto">
                    <div className="w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 hover:from-yellow-500 hover:via-yellow-600 hover:to-amber-600 text-gray-900 font-semibold py-4 sm:py-5 px-4 sm:px-5 rounded-xl text-center transition-all duration-300 shadow-xl hover:shadow-2xl text-base sm:text-lg hover:scale-105">
                      Join today
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Request a quote */}
            <button onClick={() => document.getElementById('ai-quote-trigger')?.click()} className="h-full flex flex-col bg-white rounded-3xl overflow-hidden border-2 border-gray-200 hover:border-yellow-400 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 shadow-lg group relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 via-transparent to-blue-50/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1500"></div>
              
              <div className="relative z-10 flex flex-col h-full">
                {/* Hero Image - Mobile Responsive */}
                <div className="relative h-64 sm:h-72 md:h-80 overflow-hidden">
                  <img 
                    src="/request-quote.jpg" 
                    alt="Customer requesting quotes from tradespeople"
                    className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                      Instant
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  {/* Service Header */}
                  <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                      <div className="text-blue-700 group-hover:text-blue-800 transition-colors duration-300">
                        <MessageSquareText className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-blue-800 transition-colors duration-300 leading-tight">
                        Request a quote
                      </h3>
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="flex-1 space-y-3 mb-4 sm:mb-5">
                    <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                      Tell us your job and we'll match you instantly with 3 vetted tradespeople.
                    </p>
                    
                    <div className="flex items-center justify-between text-sm sm:text-base text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Instant match</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>3 vetted pros</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="mt-auto">
                    <div className="w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 hover:from-yellow-500 hover:via-yellow-600 hover:to-amber-600 text-gray-900 font-semibold py-4 sm:py-5 px-4 sm:px-5 rounded-xl text-center transition-all duration-300 shadow-xl hover:shadow-2xl text-base sm:text-lg hover:scale-105">
                      Request a quote
                    </div>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </Container>
      </section>

      {/* FAQ Section - Ultra Premium Design */}
      <section className="relative py-12 sm:py-16 md:py-20 my-0 bg-white text-gray-900 overflow-hidden">
        {/* Ultra Premium Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(251,191,36,0.08),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" style={{maskImage: 'radial-gradient(ellipse 80% 50% at 50% 50%,black,transparent)'}}></div>
        
        <Container size="wide" className="relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-700 px-4 py-2 rounded-full mb-5 shadow-sm">
              <Star className="w-4 h-4 text-white fill-white" />
              <span className="text-sm font-semibold text-white">Frequently Asked Questions</span>
            </div>
            <h2 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
              <span className="text-black">Got</span>{' '}
              <span className="text-yellow-500">Questions?</span>
            </h2>
            <p className="text-gray-600 text-lg xs:text-xl sm:text-2xl max-w-3xl mx-auto leading-relaxed font-light">
              Everything you need to know about finding trusted tradespeople
            </p>
          </div>

          {/* FAQ Items - Ultra Premium */}
          <div className="space-y-4 sm:space-y-5 max-w-4xl mx-auto mb-16 sm:mb-20">
            {[
              {
                icon: <ShieldCheck className="w-5 h-5" />,
                question: "How do I know a tradesperson is approved?",
                answer: "All tradespeople are identity‑checked and verified. We conduct thorough background checks, verify qualifications, and ensure they have valid insurance before they can join our platform.",
                link: { text: "How We Verify Tradespeople", href: "/blog/how-we-verify-tradespeople" }
              },
              {
                icon: <Clock className="w-5 h-5" />,
                question: "Can I get instant quotes in my area?",
                answer: "Yes! Use our AI-powered quote tool for instant estimates and availability near you. Our smart matching system connects you with local professionals in minutes.",
                link: { text: "How Instant Quotes Work", href: "/blog/instant-quotes-near-you" }
              },
              {
                icon: <Shield className="w-5 h-5" />,
                question: "Are tradespeople insured?",
                answer: "We check for valid public liability insurance to protect your job. Every tradesperson must provide proof of comprehensive insurance coverage before joining our platform.",
                link: { text: "Why Hiring an Insured Tradesperson Matters", href: "/blog/insured-tradespeople" }
              },
              {
                icon: <ArrowRight className="w-5 h-5" />,
                question: "How quickly can I book?",
                answer: "Same‑day bookings are often available and most pros reply within minutes. Our streamlined booking process gets you connected with qualified tradespeople fast.",
                link: { text: "How to Book a Tradesperson Fast", href: "/blog/book-a-tradesperson-fast" }
              }
            ].map((faq, index) => (
              <div 
                key={index}
                className="bg-white rounded-3xl border-2 border-gray-200 hover:border-yellow-400 transition-all duration-700 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] hover:-translate-y-2 shadow-lg group relative overflow-hidden"
              >
                {/* Ultra Premium glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 via-transparent to-blue-50/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                {/* Shimmer effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value={`faq-${index + 1}`} className="border-none">
                    <AccordionTrigger className="relative px-5 sm:px-7 py-5 sm:py-6 text-left hover:no-underline group/trigger">
                      <div className="flex items-center gap-4 sm:gap-5 w-full">
                        <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 group-hover/trigger:scale-110 transition-transform duration-500 shadow-md flex-shrink-0 ring-2 ring-blue-50">
                          <div className="text-blue-600 group-hover/trigger:text-blue-700 transition-colors duration-300">
                            <div className="w-5 h-5 sm:w-6 sm:h-6">{faq.icon}</div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 group-hover/trigger:text-blue-700 transition-colors duration-300 leading-tight">
                            {faq.question}
                          </h3>
                        </div>
                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-100 group-hover/trigger:bg-yellow-100 transition-all duration-300 flex-shrink-0 shadow-sm">
                          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 group-hover/trigger:text-yellow-600 transition-transform duration-300 group-data-[state=open]/trigger:rotate-180" />
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 sm:px-7 pb-5 sm:pb-6">
                      <div className="ml-14 sm:ml-[4.5rem] space-y-3 sm:space-y-4">
                        <p className="text-gray-700 leading-relaxed text-base sm:text-lg font-normal">
                          {faq.answer}
                        </p>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Link 
                            href={faq.link.href}
                            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 rounded-xl border-2 border-yellow-200 hover:border-yellow-300 text-yellow-700 hover:text-yellow-800 transition-all duration-300 group/link text-sm sm:text-base font-semibold shadow-sm hover:shadow-md"
                          >
                            <span>{faq.link.text}</span>
                            <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 transform group-hover/link:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            ))}
          </div>

          {/* Call to Action - Ultra Premium */}
          <div className="text-center">
            <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-3xl p-10 sm:p-12 border-2 border-blue-200 max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/40 to-blue-50/40 opacity-60"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.1),transparent_70%)]"></div>
              <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 sm:mb-4">
                Still have questions?
              </h3>
              <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg font-light">
                Our support team is here to help you find the perfect tradesperson
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link 
                  href="/find-tradespeople"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 hover:from-yellow-500 hover:via-yellow-600 hover:to-amber-600 text-gray-900 font-semibold rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl group text-base sm:text-lg hover:scale-105"
                >
                  <span>Get Your Free Quote</span>
                  <ArrowRight className="ml-2 sm:ml-3 w-5 h-5 sm:w-5 sm:h-5 transform group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-xl transition-all duration-300 font-semibold text-base sm:text-lg shadow-md hover:shadow-lg"
                >
                  Contact Support
                </Link>
              </div>
              </div>
            </div>
          </div>
          {/* JSON-LD: FAQPage schema for SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "How do I know a tradesperson is approved?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text:
                        "All tradespeople are identity‑checked and verified. Learn more in our guide: https://myapproved.com/blog/how-we-verify-tradespeople",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Can I get instant quotes in my area?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text:
                        "Yes! Use our quote tool for instant estimates and availability near you. Read more: https://myapproved.com/blog/instant-quotes-near-you",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Are tradespeople insured?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text:
                        "We check for valid public liability insurance to protect your job. Learn why this matters: https://myapproved.com/blog/insured-tradespeople",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "How quickly can I book?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text:
                        "Same‑day bookings are often available and most pros reply within minutes. Tips to book faster: https://myapproved.com/blog/book-a-tradesperson-fast",
                    },
                  },
                ],
              }),
            }}
          />
        </Container>
      </section>

      {/* Floating Assistant Chat */}
      <FloatingAssistant mode="home" />

      {/* JSON-LD: Organization schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "MyApproved",
            url: "https://myapproved.com",
            logo: "https://myapproved.com/logo.svg",
            description: "The UK's most trusted platform for finding verified, insured tradespeople. Connect with quality professionals in your area.",
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+44-800-123-4567",
              contactType: "Customer Service",
              areaServed: "GB",
              availableLanguage: "English"
            },
            sameAs: [
              "https://facebook.com/myapproved",
              "https://twitter.com/myapproved",
              "https://instagram.com/myapproved",
              "https://linkedin.com/company/myapproved"
            ],
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              reviewCount: "50000"
            }
          }),
        }}
      />

      {/* JSON-LD: LocalBusiness schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "MyApproved",
            image: "https://myapproved.com/logo.svg",
            "@id": "https://myapproved.com",
            url: "https://myapproved.com",
            telephone: "+44-800-123-4567",
            priceRange: "££",
            address: {
              "@type": "PostalAddress",
              streetAddress: "123 Business Street",
              addressLocality: "London",
              postalCode: "SW1A 1AA",
              addressCountry: "GB"
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: 51.5074,
              longitude: -0.1278
            },
            openingHoursSpecification: {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
              ],
              opens: "00:00",
              closes: "23:59"
            },
            sameAs: [
              "https://facebook.com/myapproved",
              "https://twitter.com/myapproved",
              "https://instagram.com/myapproved"
            ]
          }),
        }}
      />

      {/* JSON-LD: WebSite schema with SearchAction */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "MyApproved",
            url: "https://myapproved.com",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: "https://myapproved.com/find-tradespeople?q={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          }),
        }}
      />

      {/* JSON-LD: BreadcrumbList schema */}
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
                item: "https://myapproved.com"
              }
            ]
          }),
        }}
      />

      {/* JSON-LD: Service schemas for tradesperson categories */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Service",
              serviceType: "Emergency Plumbing Services",
              provider: {
                "@type": "Organization",
                name: "MyApproved"
              },
              areaServed: {
                "@type": "Country",
                name: "United Kingdom"
              },
              description: "24/7 emergency plumbing services. Connect with verified, insured plumbers in your area. Average response time: 30 minutes.",
              offers: {
                "@type": "Offer",
                price: "99",
                priceCurrency: "GBP",
                priceSpecification: {
                  "@type": "PriceSpecification",
                  price: "99",
                  priceCurrency: "GBP",
                  description: "Starting from"
                }
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                reviewCount: "1245"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "Service",
              serviceType: "Electrical Repairs",
              provider: {
                "@type": "Organization",
                name: "MyApproved"
              },
              areaServed: {
                "@type": "Country",
                name: "United Kingdom"
              },
              description: "Professional electrical repair services. Find certified electricians for all your electrical needs. Average response time: 45 minutes.",
              offers: {
                "@type": "Offer",
                price: "85",
                priceCurrency: "GBP",
                priceSpecification: {
                  "@type": "PriceSpecification",
                  price: "85",
                  priceCurrency: "GBP",
                  description: "Starting from"
                }
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                reviewCount: "982"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "Service",
              serviceType: "Painting and Decorating",
              provider: {
                "@type": "Organization",
                name: "MyApproved"
              },
              areaServed: {
                "@type": "Country",
                name: "United Kingdom"
              },
              description: "Expert painting and decorating services. Connect with professional painters for interior and exterior work. Average response time: 60 minutes.",
              offers: {
                "@type": "Offer",
                price: "120",
                priceCurrency: "GBP",
                priceSpecification: {
                  "@type": "PriceSpecification",
                  price: "120",
                  priceCurrency: "GBP",
                  description: "Starting from"
                }
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                reviewCount: "763"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "Service",
              serviceType: "Handyman Services",
              provider: {
                "@type": "Organization",
                name: "MyApproved"
              },
              areaServed: {
                "@type": "Country",
                name: "United Kingdom"
              },
              description: "Reliable handyman services for all home repairs and maintenance. Find skilled handymen in your area. Average response time: 90 minutes.",
              offers: {
                "@type": "Offer",
                price: "45",
                priceCurrency: "GBP",
                priceSpecification: {
                  "@type": "PriceSpecification",
                  price: "45",
                  priceCurrency: "GBP",
                  description: "Starting from"
                }
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                reviewCount: "1560"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "Service",
              serviceType: "Gardening and Landscaping",
              provider: {
                "@type": "Organization",
                name: "MyApproved"
              },
              areaServed: {
                "@type": "Country",
                name: "United Kingdom"
              },
              description: "Professional gardening and landscaping services. Transform your outdoor space with expert gardeners. Average response time: 120 minutes.",
              offers: {
                "@type": "Offer",
                price: "55",
                priceCurrency: "GBP",
                priceSpecification: {
                  "@type": "PriceSpecification",
                  price: "55",
                  priceCurrency: "GBP",
                  description: "Starting from"
                }
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                reviewCount: "890"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "Service",
              serviceType: "Home Cleaning Services",
              provider: {
                "@type": "Organization",
                name: "MyApproved"
              },
              areaServed: {
                "@type": "Country",
                name: "United Kingdom"
              },
              description: "Professional home cleaning services. Book trusted cleaners for regular or one-time deep cleaning. Average response time: 30 minutes.",
              offers: {
                "@type": "Offer",
                price: "25",
                priceCurrency: "GBP",
                priceSpecification: {
                  "@type": "PriceSpecification",
                  price: "25",
                  priceCurrency: "GBP",
                  description: "Starting from"
                }
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                reviewCount: "2100"
              }
            }
          ]),
        }}
      />
    </>
  );
}

