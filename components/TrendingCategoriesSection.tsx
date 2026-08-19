"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import {
  Shield,
  Star,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

interface Category {
  name: string;
  jobs: number;
  emoji: string;
  price: string;
  responseTime: number;
}

const tradeCategories: Category[] = [
  { name: 'Emergency Plumbing', jobs: 1245, emoji: '🔧', price: '£99', responseTime: 30 },
  { name: 'Electrical Repairs', jobs: 982, emoji: '⚡', price: '£85', responseTime: 45 },
  { name: 'Painting & Decorating', jobs: 763, emoji: '🎨', price: '£120', responseTime: 60 },
  { name: 'Handyman Services', jobs: 1560, emoji: '🛠️', price: '£45', responseTime: 90 },
  { name: 'Gardening & Landscaping', jobs: 890, emoji: '🌿', price: '£75', responseTime: 60 },
  { name: 'Home Cleaning', jobs: 2100, emoji: '✨', price: '£25', responseTime: 30 },
];

const TrendingCategoriesSection = () => {
  // Embla carousel - logic unchanged
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isHovering, setIsHovering] = useState(false);
  const displayed = tradeCategories;

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    onSelect();
  }, [emblaApi]);

  // Auto-rotate (pause on hover) - logic unchanged
  useEffect(() => {
    if (!emblaApi) return;
    if (isHovering) return;
    const id = setInterval(() => {
      try { emblaApi.scrollNext(); } catch {}
    }, 3500);
    return () => clearInterval(id);
  }, [emblaApi, isHovering]);

  return (
    <motion.section
      className="py-16 bg-[#0F0F0F]"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="mb-10">
          <p className="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-[#F5B301] mb-3">
            Right Now
          </p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
            <span className="text-white">Most In-Demand</span>{' '}
            <span className="text-[#F5B301]">Services</span>
          </h2>
          <p className="text-white/40 mt-3 max-w-xl text-sm leading-relaxed">
            The services customers are booking right now. Trusted, approved, and ready to help.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative mt-2">
          <div
            className="overflow-hidden"
            ref={emblaRef}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="flex gap-4">
              {displayed.map((category) => {
                const bookedToday = Math.max(10, Math.floor(category.jobs / 30));
                return (
                  <Link
                    key={category.name}
                    href={`/find-tradespeople?trade=${encodeURIComponent(category.name)}`}
                    className="embla__slide group min-w-[280px] max-w-[300px]"
                    aria-label={`Browse ${category.name} tradespeople`}
                  >
                    <div className="relative rounded-2xl bg-[#1A1A1A] border border-white/[0.07] hover:border-[#F5B301]/25 transition-all duration-300 p-6 h-full overflow-hidden hover:-translate-y-1">

                      {/* Subtle ambient glow on hover */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5B301]/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Header */}
                      <div className="relative z-10 mb-5">
                        <div className="w-14 h-14 rounded-xl bg-white/[0.05] border border-white/[0.07] flex items-center justify-center mb-4">
                          <span className="text-2xl">{category.emoji}</span>
                        </div>

                        <div className="inline-flex items-center gap-1.5 bg-[#F5B301]/10 border border-[#F5B301]/20 text-[#F5B301] px-2.5 py-1 rounded-full text-[0.65rem] font-bold mb-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#F5B301]" />
                          In demand
                        </div>

                        <h3 className="text-base font-black text-white mb-1.5 leading-tight">
                          {category.name}
                        </h3>

                        <div className="text-xs text-white/35 font-medium">
                          {category.jobs.toLocaleString()} jobs
                        </div>
                      </div>

                      {/* Availability */}
                      <div className="relative z-10 space-y-2 mb-5">
                        <div className="flex items-center gap-2 text-xs">
                          <div className="relative shrink-0">
                            <div className="w-2 h-2 rounded-full bg-[#F5B301]" />
                            <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#F5B301] animate-ping opacity-60" />
                          </div>
                          <span className="font-semibold text-white/80">
                            {category.responseTime} min · Available now
                          </span>
                        </div>
                        <div className="text-xs text-white/35 pl-4">
                          {bookedToday}+ booked today
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="relative z-10 mb-5 p-3.5 bg-white/[0.03] rounded-xl border border-white/[0.05]">
                        <div className="text-[0.6rem] font-bold tracking-[0.1em] uppercase text-white/30 mb-1">
                          Starting from
                        </div>
                        <div className="text-2xl font-black text-white tabular-nums">
                          {category.price}
                        </div>
                      </div>

                      {/* CTA */}
                      <Button className="relative z-10 w-full h-11 bg-[#F5B301] hover:bg-[#E8A900] text-[#111111] font-black text-sm rounded-xl transition-all duration-200 hover:scale-[1.02]">
                        Get Quote
                      </Button>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Prev arrow */}
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
            <button
              onClick={() => emblaApi && emblaApi.scrollPrev()}
              className="pointer-events-auto -ml-2 sm:ml-0 h-10 w-10 sm:h-11 sm:w-11 rounded-full border border-white/10 bg-[#1A1A1A] text-[#F5B301] shadow-lg hover:bg-[#232323] hover:border-[#F5B301]/25 transition-all duration-200 focus:outline-none flex items-center justify-center"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Next arrow */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
            <button
              onClick={() => emblaApi && emblaApi.scrollNext()}
              className="pointer-events-auto -mr-2 sm:mr-0 h-10 w-10 sm:h-11 sm:w-11 rounded-full border border-white/10 bg-[#1A1A1A] text-[#F5B301] shadow-lg hover:bg-[#232323] hover:border-[#F5B301]/25 transition-all duration-200 focus:outline-none flex items-center justify-center"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Slide indicators */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {scrollSnaps.map((_, i) => (
              <span
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i === selectedIndex
                    ? 'bg-[#F5B301] w-4 h-2'
                    : 'bg-white/15 w-2 h-2'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Quick filter tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-10 mb-7">
          {['Plumber', 'Electrician', 'Builder', 'Painter', 'Roofer', 'Cleaner'].map((tag) => (
            <Link
              key={tag}
              href={`/find-tradespeople?trade=${encodeURIComponent(tag)}`}
              className="px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/55 text-xs font-medium hover:border-[#F5B301]/30 hover:text-white/85 transition-all duration-200"
            >
              {tag}
            </Link>
          ))}
        </div>

        {/* Trust strip */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-xs text-white/35">
          <span className="inline-flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#F5B301]" /> Identity checked
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#F5B301]" /> Insurance confirmed and monitored
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-[#F5B301]" /> Identity checked and business verified
          </span>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-8">
          <Link
            href="/find-tradespeople"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-[#F5B301] hover:bg-[#E8A900] text-[#111111] font-black text-sm transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-[#F5B301]/20"
          >
            Browse all categories
            <ChevronRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </motion.section>
  );
};

export default TrendingCategoriesSection;
