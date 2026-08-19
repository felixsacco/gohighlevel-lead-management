"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Wrench,
  UsersRound,
  Calculator,
  ChevronRight,
  Star,
  Shield,
  Clock,
  Award,
  Target,
} from 'lucide-react';

interface CTACard {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  href?: string;
  onClick?: () => void;
  icon: React.ElementType;
  image: string;
  badge?: string;
  variant: 'primary' | 'outline';
  stats?: {
    label: string;
    value: string;
  }[];
  features?: string[];
}

const CTACardsSection = () => {
  const ctaCards: CTACard[] = [
    {
      id: 'hire',
      title: 'Hire a Tradesperson',
      description: 'Find identity-checked, business-verified tradespeople in your area. Get instant quotes and book with confidence.',
      buttonText: 'Find Tradespeople',
      href: '/find-tradespeople',
      icon: Wrench,
      image: '/background.jpg',
      badge: 'Most Popular',
      variant: 'primary',
      stats: [
        { label: 'Average Response', value: '3 mins' },
        { label: 'Success Rate', value: '98%' }
      ],
      features: ['Instant quotes', 'Identity-checked tradespeople', 'Insurance cover confirmed']
    },
    {
      id: 'join',
      title: 'Join as Tradesperson',
      description: 'Grow your business with quality leads. Join thousands of verified tradespeople earning more.',
      buttonText: 'Start Earning Today',
      href: '/register/tradesperson',
      icon: UsersRound,
      image: '/hero.png',
      badge: 'High Demand',
      variant: 'outline',
      stats: [
        { label: 'Avg. Monthly Leads', value: '47' },
        { label: 'Conversion Rate', value: '73%' }
      ],
      features: ['Quality leads only', 'No upfront costs', 'Instant notifications']
    },
    {
      id: 'quote',
      title: 'Get Instant Quote',
      description: 'AI-powered quotes in 60 seconds. Compare prices and book the best tradesperson for your job.',
      buttonText: 'Get My Quote',
      onClick: () => document.getElementById('ai-quote-trigger')?.click(),
      icon: Calculator,
      image: '/background.jpg',
      badge: 'AI Powered',
      variant: 'primary',
      stats: [
        { label: 'Quote Accuracy', value: '94%' },
        { label: 'Time to Quote', value: '60s' }
      ],
      features: ['No obligation', 'Instant estimates', 'Compare options']
    }
  ];

  return (
    <section className="py-20 bg-[#0A0A0A] relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#F5B301]/4 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#F5B301]/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-2 bg-[#F5B301]/10 border border-[#F5B301]/20 text-[#F5B301] px-4 py-2 rounded-full text-xs font-bold mb-5">
            <Target className="w-3.5 h-3.5" />
            <span className="tracking-[0.08em] uppercase">Choose Your Path</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            Ready to Get{' '}
            <span className="text-[#F5B301]">Started?</span>
          </h2>
          <p className="text-lg text-white/45 max-w-2xl leading-relaxed">
            Whether you need work done or want to grow your business, we&apos;ve got you covered.{' '}
            <span className="text-[#F5B301] font-semibold">Join thousands</span> who trust MyApproved.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ctaCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <motion.div
                key={card.id}
                className="group relative bg-[#161616] rounded-2xl border border-white/[0.06] hover:border-[#F5B301]/20 overflow-hidden transition-all duration-400"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
              >
                {/* Image header */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-40"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0F0F0F]/80 to-[#1A1A1A]/60" />

                  {/* Badge */}
                  {card.badge && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-[#F5B301]/15 backdrop-blur-sm text-[#F5B301] px-2.5 py-1 rounded-full text-[0.65rem] font-black border border-[#F5B301]/25 tracking-wide">
                        {card.badge}
                      </div>
                    </div>
                  )}

                  {/* Icon */}
                  <div className="absolute top-4 left-4">
                    <div className="w-11 h-11 bg-[#F5B301]/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-[#F5B301]/25 group-hover:bg-[#F5B301]/25 transition-colors duration-300">
                      <IconComponent className="w-5 h-5 text-[#F5B301]" />
                    </div>
                  </div>

                  {/* Stats overlay */}
                  {card.stats && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center justify-between">
                        {card.stats.map((stat, i) => (
                          <div key={i} className="text-center">
                            <div className="text-white font-black text-lg tabular-nums leading-none">{stat.value}</div>
                            <div className="text-white/45 text-[0.65rem] mt-0.5">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-xl font-black text-white mb-2 group-hover:text-[#F5B301] transition-colors duration-300">
                      {card.title}
                    </h3>
                    <p className="text-sm text-white/45 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  {/* Features */}
                  {card.features && (
                    <div className="space-y-1.5">
                      {card.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-white/40">
                          <div className="w-1.5 h-1.5 bg-[#F5B301] rounded-full shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA Button */}
                  <div className="pt-1">
                    {card.href ? (
                      <Link
                        href={card.href}
                        className={`group/btn w-full inline-flex items-center justify-center px-5 py-3.5 rounded-xl font-black text-sm transition-all duration-200 hover:scale-[1.02] ${
                          card.variant === 'primary'
                            ? 'bg-[#F5B301] hover:bg-[#E8A900] text-[#111111] shadow-lg shadow-[#F5B301]/15'
                            : 'bg-transparent border border-[#F5B301]/40 text-[#F5B301] hover:bg-[#F5B301] hover:text-[#111111] hover:border-[#F5B301]'
                        }`}
                      >
                        <span>{card.buttonText}</span>
                        <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
                      </Link>
                    ) : (
                      <button
                        onClick={card.onClick}
                        className={`group/btn w-full inline-flex items-center justify-center px-5 py-3.5 rounded-xl font-black text-sm transition-all duration-200 hover:scale-[1.02] ${
                          card.variant === 'primary'
                            ? 'bg-[#F5B301] hover:bg-[#E8A900] text-[#111111] shadow-lg shadow-[#F5B301]/15'
                            : 'bg-transparent border border-[#F5B301]/40 text-[#F5B301] hover:bg-[#F5B301] hover:text-[#111111] hover:border-[#F5B301]'
                        }`}
                      >
                        <span>{card.buttonText}</span>
                        <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Gold edge glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#F5B301]/4 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
              </motion.div>
            );
          })}
        </div>

        {/* Trust strip */}
        <motion.div
          className="mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8">
            <p className="text-[0.65rem] font-bold tracking-[0.18em] uppercase text-white/25 text-center mb-6">
              Why Choose MyApproved?
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Shield, value: 'Identity Checked', label: 'Business verified' },
                { icon: Clock, value: 'Instant Quotes', label: 'AI-powered estimates' },
                { icon: Star, value: '4.9★ Rating', label: 'From verified jobs' },
                { icon: Award, value: 'Re-checked', label: 'Time-limited checks' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={value} className="text-center">
                  <div className="w-11 h-11 bg-[#F5B301]/10 border border-[#F5B301]/15 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-[#F5B301]" />
                  </div>
                  <div className="font-bold text-white text-sm">{value}</div>
                  <div className="text-[0.7rem] text-white/35 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTACardsSection;
