"use client";

import React from 'react';
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
  // Counter animations removed — prior fabricated counts (jobs/reviews/tradespeople)
  // had no supporting check in the spec and were removed for compliance.

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
    { icon: Shield, label: 'Insurance Confirmed' },
    { icon: CheckCircle, label: 'No Cowboy Builders' },
    { icon: Zap, label: '60s Quotes' },
    { icon: Clock, label: '3-Min Response' },
  ];

  return (
    <section className="relative min-h-screen flex items-center bg-[#1A3A8A] text-white overflow-hidden">
      {/* Flat navy ground with a hard two-tone split — no gradient wash */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-0 bottom-0 left-0 w-[28%] bg-[#111111]" />
        <div className="absolute top-0 bottom-0 left-[28%] right-0 bg-[#1A3A8A]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-white/15" />
        <div className="absolute bottom-0 left-[28%] right-0 h-px bg-white/10" />
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-12 gap-16 xl:gap-24 items-center">

          {/* ── Left Column (spans 7, asymmetric against image's 5) ── */}
          <motion.div
            className="lg:col-span-7 space-y-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Live status — flat, no pill, pushed off the left axis */}
            <motion.div variants={itemVariants} className="lg:-translate-x-6">
              <div className="inline-flex items-center gap-2.5 border-l-2 border-[#FFB800] pl-4 py-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFB800] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFB800]" />
                </span>
                <span className="text-sm font-semibold text-white/70 tabular-nums">
                  LIVE - new jobs posted today
                </span>
              </div>
            </motion.div>

            {/* Editorial headline — offset, not centered */}
            <motion.div variants={itemVariants} className="space-y-0 lg:-translate-x-6">
              <p className="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-[#FFB800] mb-3">
                UK Tradesperson Recommendation Platform
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

            <motion.p variants={itemVariants} className="text-base text-white/55 leading-relaxed max-w-[520px] lg:-translate-x-6">
              Hire identity-checked professionals near you. Fast, reliable, with public liability cover confirmed.
            </motion.p>

            {/* Feature pills — rectangle + single left hairline, not repeated rounded pills */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-x-5 gap-y-2">
              {trustFeatures.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/60 border-l border-[#FFB800]/60 pl-2.5 hover:text-white/80 transition-colors duration-200"
                >
                  <Icon className="w-3 h-3 text-[#FFB800]" />
                  <span>{label}</span>
                </div>
              ))}
            </motion.div>

            {/* Search card — rounded-2xl retained, input row goes square to vary radius */}
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
                    <SelectTrigger className="h-11 rounded-none border border-white/10 border-b-2 border-b-[#FFB800]/40 bg-[#232323] text-white text-sm focus:border-[#FFB800] focus:ring-0 [&>span]:text-white/40">
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
                    className="h-11 rounded-none border border-white/10 border-b-2 border-b-[#FFB800]/40 bg-[#232323] text-white placeholder:text-white/30 focus-visible:border-[#FFB800] focus-visible:ring-0 text-sm"
                  />
                </div>
              </div>

              <Button className="w-full h-12 bg-[#FFB800] text-[#111111] font-black text-sm rounded-none ring-2 ring-inset ring-[#1A3A8A] hover:bg-[#FFC933] transition-colors duration-200 group">
                <span>Get Started</span>
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform duration-200" />
              </Button>

              <p className="text-center text-[0.7rem] text-white/25">
                Free · No obligation · Takes 60 seconds
              </p>
            </motion.div>

            {/* Stats row — hard top hairline, no floating dividers */}
            <motion.div variants={itemVariants} className="grid grid-cols-3 border-t border-white/[0.08] pt-6">
              {[
                { value: '£2M', label: 'Public Liability Cover' },
                { value: 'Identity', label: 'Checked Professionals' },
                { value: 'Free', label: 'To Post a Job' },
              ].map((stat, i) => (
                <div key={stat.label} className={i > 0 ? 'border-l border-white/[0.08] pl-6' : 'pr-6'}>
                  <div className="text-2xl font-black text-white tabular-nums">{stat.value}</div>
                  <div className="text-xs text-white/35 mt-0.5 font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Featured on — three distinct treatments, not one repeated span */}
            <motion.div variants={itemVariants} className="pt-1">
              <p className="text-[0.6rem] font-bold tracking-[0.18em] uppercase text-white/20 mb-3">
                As featured on
              </p>
              <div className="flex items-center gap-6">
                <span className="text-white/25 font-light text-base tracking-tight cursor-default">BBC</span>
                <span className="text-white/30 font-semibold text-xs uppercase tracking-[0.08em] border border-white/15 px-2 py-1 cursor-default">TrustPilot</span>
                <span className="text-white/25 font-bold text-sm cursor-default">Google</span>
                <span className="text-white/30 italic font-serif text-sm cursor-default">Which?</span>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right Column (spans 5) ── */}
          <motion.div
            className="relative hidden lg:block lg:col-span-5"
            variants={imageVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] border border-white/10">
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
                    e.currentTarget.parentElement.style.background = '#1A1A1A';
                  }
                }}
              />

              {/* Play button — hard edge, no glow/shadow */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-16 h-16 bg-[#FFB800] rounded-none ring-2 ring-inset ring-[#111111]/40 flex items-center justify-center hover:bg-[#FFC933] transition-colors duration-200 group">
                  <Play className="w-6 h-6 text-[#111111] ml-0.5" />
                </button>
              </div>

              {/* Floating chip - jobs today (square, off-frame) */}
              <motion.div
                className="absolute -right-3 top-8 bg-[#1A1A1A] border border-white/10 px-3.5 py-2.5"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="text-xl font-black text-[#FFB800] tabular-nums leading-none">
                  New
                </div>
                <div className="text-[0.65rem] text-white/45 font-semibold mt-0.5">Jobs Today</div>
              </motion.div>

              {/* Floating chip - success rate (rounded, hard hairline) */}
              <motion.div
                className="absolute -bottom-4 -left-3 bg-[#1A1A1A] rounded-2xl border border-white/10 px-4 py-3 flex items-center gap-2.5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="w-7 h-7 bg-[#FFB800] flex items-center justify-center shrink-0 rounded-none">
                  <CheckCircle className="w-3.5 h-3.5 text-[#111111]" />
                </div>
                <div>
                  <div className="text-sm font-black text-white leading-none">Identity Checked</div>
                  <div className="text-[0.6rem] text-white/40 mt-0.5">Professionals</div>
                </div>
              </motion.div>

              {/* Floating chip - 3 quotes (hairline-only, left edge) */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 -left-3 border-l-2 border-l-[#FFB800] bg-[#1A1A1A] pl-3 py-2.5 pr-3"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex -space-x-1 mb-1.5">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-6 h-6 bg-[#FFB800] border border-[#111111] flex items-center justify-center text-[#111111] text-[0.6rem] font-black"
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
