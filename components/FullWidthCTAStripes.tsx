"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Users,
  Calculator,
  ArrowRight,
  Star,
  Shield,
  Clock,
  TrendingUp,
  Zap,
  Award,
  CheckCircle,
  Phone,
  Download,
  Sparkles,
} from 'lucide-react';
import { Button } from "@/components/ui/button";

const FullWidthCTAStripes = () => {
  const [visibleStripes, setVisibleStripes] = useState<number[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-stripe-index') || '0');
            setVisibleStripes(prev => [...prev, index]);
          }
        });
      },
      { threshold: 0.3 }
    );

    const stripes = document.querySelectorAll('[data-stripe-index]');
    stripes.forEach(stripe => observer.observe(stripe));

    return () => observer.disconnect();
  }, []);

  const stripes = [
    {
      id: 'customers',
      title: 'Need Work Done?',
      subtitle: 'Find Trusted Tradespeople in Minutes',
      description: 'Get instant quotes from verified, insured professionals. No more waiting weeks for callbacks or worrying about cowboy builders.',
      buttonText: 'Find Tradespeople',
      buttonAction: () => window.location.href = '/find-tradespeople',
      gradient: 'from-[#0056D2] via-blue-600 to-blue-800',
      hoverGradient: 'from-blue-800 via-blue-600 to-[#0056D2]',
      icon: Search,
      stats: [
        { value: '2,847', label: 'Jobs posted today' },
        { value: '3 min', label: 'Average response' },
        { value: '98%', label: 'Success rate' }
      ],
      features: [
        'Instant AI quotes',
        'Verified professionals only',
        'Full insurance guarantee',
        'No obligation quotes'
      ],
      illustration: 'customer'
    },
    {
      id: 'tradespeople',
      title: 'Are You a Tradesperson?',
      subtitle: 'Grow Your Business with Quality Leads',
      description: 'Join 10,000+ approved tradespeople earning more with our platform. Get matched with customers who need your skills.',
      buttonText: 'Join MyApproved',
      buttonAction: () => window.location.href = '/register/tradesperson',
      gradient: 'from-[#FDBD18] via-yellow-400 to-orange-400',
      hoverGradient: 'from-orange-400 via-yellow-400 to-[#FDBD18]',
      icon: Users,
      stats: [
        { value: '47', label: 'Avg leads/month' },
        { value: '73%', label: 'Conversion rate' },
        { value: '£2.4k', label: 'Avg monthly boost' }
      ],
      features: [
        'Quality leads only',
        'No upfront costs',
        'Instant notifications',
        'Professional profile'
      ],
      illustration: 'tradesperson'
    },
    {
      id: 'instant-quote',
      title: 'Get an Instant Quote',
      subtitle: 'AI-Powered Estimates in 60 Seconds',
      description: 'Our smart technology analyzes your job and provides accurate quotes instantly. Compare prices and book the best tradesperson.',
      buttonText: 'Get My Quote',
      buttonAction: () => document.getElementById('ai-quote-trigger')?.click(),
      gradient: 'from-emerald-500 via-green-500 to-teal-600',
      hoverGradient: 'from-teal-600 via-green-500 to-emerald-500',
      icon: Calculator,
      stats: [
        { value: '94%', label: 'Quote accuracy' },
        { value: '60s', label: 'Time to quote' },
        { value: 'Free', label: 'Always' }
      ],
      features: [
        'No obligation',
        'Instant estimates',
        'Compare options',
        'Smart matching'
      ],
      illustration: 'quote'
    }
  ];

  const getIllustration = (type: string) => {
    switch (type) {
      case 'customer':
        return (
          <div className="relative w-full h-64 bg-white/10 rounded-3xl backdrop-blur-sm border border-white/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white">
                <Search className="w-16 h-16 mx-auto mb-4 opacity-80" />
                <div className="text-lg font-bold">Find Your Perfect Match</div>
                <div className="text-sm opacity-80">Verified professionals ready to help</div>
              </div>
            </div>
            {/* Floating elements */}
            <div className="absolute top-4 right-4 bg-white/20 rounded-xl p-2 animate-bounce">
              <Star className="w-6 h-6 text-[#FDBD18]" />
            </div>
            <div className="absolute bottom-4 left-4 bg-white/20 rounded-xl p-2 animate-pulse">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
          </div>
        );
      case 'tradesperson':
        return (
          <div className="relative w-full h-64 bg-white/10 rounded-3xl backdrop-blur-sm border border-white/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-80" />
                <div className="text-lg font-bold">Grow Your Business</div>
                <div className="text-sm opacity-80">Quality leads, better earnings</div>
              </div>
            </div>
            {/* Floating elements */}
            <div className="absolute top-4 right-4 bg-white/20 rounded-xl p-2 animate-bounce" style={{animationDelay: '0.5s'}}>
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <div className="absolute bottom-4 left-4 bg-white/20 rounded-xl p-2 animate-pulse">
              <Award className="w-6 h-6 text-[#FDBD18]" />
            </div>
          </div>
        );
      case 'quote':
        return (
          <div className="relative w-full h-64 bg-white/10 rounded-3xl backdrop-blur-sm border border-white/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white">
                <Calculator className="w-16 h-16 mx-auto mb-4 opacity-80" />
                <div className="text-lg font-bold">Instant AI Quotes</div>
                <div className="text-sm opacity-80">Smart, accurate, fast</div>
              </div>
            </div>
            {/* Floating elements */}
            <div className="absolute top-4 right-4 bg-white/20 rounded-xl p-2 animate-bounce" style={{animationDelay: '1s'}}>
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="absolute bottom-4 left-4 bg-white/20 rounded-xl p-2 animate-pulse">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="py-0 space-y-0">
      {stripes.map((stripe, index) => {
        const IconComponent = stripe.icon;
        const isVisible = visibleStripes.includes(index);
        
        return (
          <div
            key={stripe.id}
            data-stripe-index={index}
            className={`relative py-20 overflow-hidden transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stripe.gradient}`}></div>
            
            {/* Animated background elements */}
            <div className="absolute inset-0">
              <div className="absolute top-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-20 right-20 w-80 h-80 bg-black/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-white/5 to-transparent rounded-full blur-3xl animate-spin" style={{animationDuration: '20s'}}></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Content */}
                <div className={`space-y-8 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  {/* Header */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-white/80 font-semibold text-sm uppercase tracking-wider">
                        {stripe.id.replace('-', ' ')}
                      </div>
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                      {stripe.title}
                    </h2>
                    
                    <h3 className="text-2xl md:text-3xl font-bold text-white/90 leading-relaxed">
                      {stripe.subtitle}
                    </h3>
                    
                    <p className="text-xl text-white/80 leading-relaxed max-w-2xl">
                      {stripe.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-6">
                    {stripe.stats.map((stat, i) => (
                      <div key={i} className="text-center">
                        <div className="text-3xl md:text-4xl font-black text-white mb-1">
                          {stat.value}
                        </div>
                        <div className="text-sm text-white/70 font-semibold">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-2 gap-3">
                    {stripe.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-white/80 flex-shrink-0" />
                        <span className="text-white/90 font-semibold">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <div className="pt-4">
                    <Button
                      onClick={stripe.buttonAction}
                      className={`group bg-white hover:bg-gray-100 text-gray-900 font-black px-8 py-4 rounded-2xl text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105`}
                    >
                      <span>{stripe.buttonText}</span>
                      <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                    
                    <div className="flex items-center gap-6 mt-4 text-white/70 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Free to start</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span>No obligation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Instant results</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual */}
                <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className={`transform transition-all duration-1000 ${
                    isVisible ? 'translate-x-0 opacity-100' : index % 2 === 0 ? 'translate-x-10 opacity-0' : '-translate-x-10 opacity-0'
                  }`}>
                    {getIllustration(stripe.illustration)}
                  </div>
                </div>
              </div>
            </div>

            {/* Hover effect overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stripe.hoverGradient} opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>
          </div>
        );
      })}
    </section>
  );
};

export default FullWidthCTAStripes;
