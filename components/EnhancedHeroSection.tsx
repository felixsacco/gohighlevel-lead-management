"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  Shield,
  CheckCircle,
  Zap,
  Clock,
  Play,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const imageVariants = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.25 },
  },
};

const EnhancedHeroSection = () => {
  const [jobsCount, setJobsCount] = useState(2000);
  const [reviewsCount, setReviewsCount] = useState(45000);
  const [tradespeopleCount, setTradespeopleCount] = useState(8000);

  // Animated counters - logic unchanged
  useEffect(() => {
    const animateCounter = (target: number, setter: (value: number) => void, duration: number = 2000) => {
      const start = target * 0.7;
      const increment = (target - start) / (duration / 16);
      let current = start;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(Math.floor(current));
        }
      }, 16);
    };

    const timer = setTimeout(() => {
      animateCounter(2847, setJobsCount);
      animateCounter(50000, setReviewsCount);
      animateCounter(10000, setTradespeopleCount);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const popularServices = [
    'Plumber', 'Electrician', 'Builder', 'Painter', 'Roofer',
    'Cleaner', 'Gardener', 'Handyman', 'Carpenter', 'Tiler'
  ];

  const trustBadges = [
    { name: 'BBC' },
    { name: 'TrustPilot' },
    { name: 'Google' },
    { name: 'Which?' },
  ];

  const trustFeatures = [
    { icon: Shield, label: 'Insured & Verified' },
    { icon: CheckCircle, label: 'No Cowboy Builders' },
    { icon: Zap, label: '60s Quotes' },
    { icon: Clock, label: '3-Min Response' },
  ];

  return (
    <section className="relative min-h-screen flex items-center bg-[#111111] text-white overflow-hidden">
      {/* Ambient glow blobs */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-[#FFB800]/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FFB800]/3 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">

          {/* ── Left Column ── */}
          <motion.div
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Live pill */}
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2.5 bg-white/[0.06] border border-white/10 px-4 py-2 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFB800] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFB800]" />
                </span>
                <span className="text-sm font-semibold text-white/70 tabular-nums">
                  LIVE - {jobsCount.toLocaleString()} jobs posted today
                </span>
              </div>
            </motion.div>

            {/* Editorial headline */}
            <motion.div variants={itemVariants} className="space-y-0">
              <p className="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-[#FFB800] mb-3">
                Rated #1 Tradesperson Platform
              </p>
              <h1 className="text-[clamp(3.25rem,7.5vw,5.5rem)] font-black leading-[0.9] tracking-tight">
                <span className="block text-white">Find Trusted</span>
                <span className="block text-[#FFB800]">Local</span>
                <span
                  className="block text-transparent select-none"
                  style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.12)' }}
                >
                  Tradespeople
                </span>
              </h1>
            </motion.div>

            <motion.p variants={itemVariants} className="text-base text-white/55 leading-relaxed max-w-[420px]">
              Hire vetted professionals near you. Fast, reliable, and backed by verified reviews.
            </motion.p>

            {/* Feature pills */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
              {trustFeatures.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-white/50 border border-white/[0.08] px-3 py-1.5 rounded-full hover:border-[#FFB800]/30 hover:text-white/75 transition-colors duration-200"
                >
                  <Icon className="w-3 h-3 text-[#FFB800]" />
                  <span>{label}</span>
                </div>
              ))}
            </motion.div>

            {/* Search card */}
            <motion.div
              variants={itemVariants}
              className="bg-[#1A1A1A] border border-white/[0.07] rounded-2xl p-5 space-y-3.5"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[0.65rem] font-bold tracking-[0.12em] uppercase text-white/35">
                    What do you need?
                  </label>
                  <Select>
                    <SelectTrigger className="h-11 rounded-xl border border-white/10 bg-[#232323] text-white text-sm focus:border-[#FFB800] focus:ring-0 [&>span]:text-white/40">
                      <SelectValue placeholder="Choose a service..." />
                    </SelectTrigger>
                    <SelectContent>
                      {popularServices.map((service) => (
                        <SelectItem key={service} value={service.toLowerCase()}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[0.65rem] font-bold tracking-[0.12em] uppercase text-white/35">
                    Where are you?
                  </label>
                  <Input
                    placeholder="Enter postcode or city"
                    className="h-11 rounded-xl border border-white/10 bg-[#232323] text-white placeholder:text-white/30 focus-visible:border-[#FFB800] focus-visible:ring-0 text-sm"
                  />
                </div>
              </div>

              <Button className="w-full h-12 bg-[#FFB800] hover:bg-[#FFC933] text-[#111111] font-black text-sm rounded-xl transition-all duration-200 hover:scale-[1.01] group">
                <span>Get Started</span>
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform duration-200" />
              </Button>

              <p className="text-center text-[0.7rem] text-white/25">
                Free · No obligation · Takes 60 seconds
              </p>
            </motion.div>

            {/* Stats row */}
            <motion.div variants={itemVariants} className="grid grid-cols-3">
              {[
                { value: `${(tradespeopleCount / 1000).toFixed(0)}k+`, label: 'Tradespeople' },
                { value: `${(reviewsCount / 1000).toFixed(0)}k+`, label: 'Reviews' },
                { value: '98%', label: 'Success Rate' },
              ].map((stat, i) => (
                <div key={stat.label} className={i > 0 ? 'border-l border-white/[0.08] pl-6' : ''}>
                  <div className="text-2xl font-black text-white tabular-nums">{stat.value}</div>
                  <div className="text-xs text-white/35 mt-0.5 font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Featured on */}
            <motion.div variants={itemVariants} className="pt-1">
              <p className="text-[0.6rem] font-bold tracking-[0.18em] uppercase text-white/20 mb-2">
                As featured on
              </p>
              <div className="flex items-center gap-5">
                {trustBadges.map((badge) => (
                  <span
                    key={badge.name}
                    className="text-white/20 font-bold text-sm hover:text-white/45 transition-colors cursor-default"
                  >
                    {badge.name}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right Column ── */}
          <motion.div
            className="relative hidden lg:block"
            variants={imageVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
              <Image
                src="/hero.png"
                alt="Professional tradesperson at work"
                width={1200}
                height={600}
                quality={90}
                priority
                className="w-full h-full object-cover opacity-75"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.parentElement) {
                    e.currentTarget.parentElement.style.background =
                      'linear-gradient(160deg, #1A1A1A 0%, #252525 50%, #1E1E1E 100%)';
                  }
                }}
              />
              {/* Vignettes */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/70 via-transparent to-[#111111]/25" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#111111]/15 to-transparent" />

              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-16 h-16 bg-[#FFB800] rounded-full flex items-center justify-center hover:bg-[#FFC933] hover:scale-105 transition-all duration-200 group shadow-2xl shadow-[#FFB800]/30">
                  <Play className="w-6 h-6 text-[#111111] ml-0.5 group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>

              {/* Floating chip - jobs today */}
              <motion.div
                className="absolute top-5 right-5 bg-[#111111]/85 backdrop-blur-md border border-white/[0.08] rounded-xl px-3.5 py-2.5"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="text-xl font-black text-[#FFB800] tabular-nums leading-none">
                  {jobsCount.toLocaleString()}
                </div>
                <div className="text-[0.65rem] text-white/45 font-semibold mt-0.5">Jobs Today</div>
              </motion.div>

              {/* Floating chip - success rate */}
              <motion.div
                className="absolute bottom-5 left-5 bg-[#111111]/85 backdrop-blur-md border border-white/[0.08] rounded-xl px-3.5 py-2.5 flex items-center gap-2.5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="w-7 h-7 bg-[#FFB800]/15 border border-[#FFB800]/25 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 text-[#FFB800]" />
                </div>
                <div>
                  <div className="text-sm font-black text-white leading-none">98% Success</div>
                  <div className="text-[0.6rem] text-white/40 mt-0.5">Job Completion</div>
                </div>
              </motion.div>

              {/* Floating chip - 3 quotes */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 left-5 bg-[#111111]/85 backdrop-blur-md border border-white/[0.08] rounded-xl px-3.5 py-2.5"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex -space-x-1 mb-1.5">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-6 h-6 bg-[#FFB800]/20 border border-[#FFB800]/40 rounded-full flex items-center justify-center text-[#FFB800] text-[0.6rem] font-black"
                    >
                      {i}
                    </div>
                  ))}
                </div>
                <div className="text-sm font-black text-white leading-none">3 Quotes</div>
                <div className="text-[0.6rem] text-white/40 mt-0.5">In 2 minutes</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EnhancedHeroSection;
