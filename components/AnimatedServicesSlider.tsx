"use client";

import React, { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import AutoPlay from 'embla-carousel-autoplay';
import Link from 'next/link';
import {
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  Home as HomeIcon,
  Leaf,
  Sparkles,
  Shield,
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Users,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  icon: React.ElementType;
  jobs: number;
  avgPrice: string;
  responseTime: string;
  rating: number;
  description: string;
  isPopular?: boolean;
  gradient: string;
}

const AnimatedServicesSlider = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      align: 'start',
      slidesToScroll: 1,
      containScroll: 'trimSnaps'
    },
    [AutoPlay({ delay: 4000, stopOnInteraction: false })]
  );
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const services: Service[] = [
    {
      id: 'plumber',
      name: 'Plumbers',
      icon: Wrench,
      jobs: 1247,
      avgPrice: '£120-280',
      responseTime: '2 mins',
      rating: 4.9,
      description: 'Emergency repairs, installations, and maintenance',
      isPopular: true,
      gradient: 'from-blue-500 to-blue-700'
    },
    {
      id: 'electrician',
      name: 'Electricians',
      icon: Zap,
      jobs: 892,
      avgPrice: '£150-350',
      responseTime: '3 mins',
      rating: 4.8,
      description: 'Wiring, repairs, and electrical installations',
      isPopular: true,
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'builder',
      name: 'Builders',
      icon: Hammer,
      jobs: 634,
      avgPrice: '£200-500',
      responseTime: '5 mins',
      rating: 4.7,
      description: 'Extensions, renovations, and construction',
      gradient: 'from-gray-600 to-gray-800'
    },
    {
      id: 'painter',
      name: 'Painters',
      icon: Paintbrush,
      jobs: 523,
      avgPrice: '£180-400',
      responseTime: '4 mins',
      rating: 4.8,
      description: 'Interior and exterior painting services',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      id: 'roofer',
      name: 'Roofers',
      icon: HomeIcon,
      jobs: 387,
      avgPrice: '£300-800',
      responseTime: '6 mins',
      rating: 4.6,
      description: 'Roof repairs, replacements, and maintenance',
      gradient: 'from-red-500 to-red-700'
    },
    {
      id: 'gardener',
      name: 'Gardeners',
      icon: Leaf,
      jobs: 445,
      avgPrice: '£80-200',
      responseTime: '8 mins',
      rating: 4.7,
      description: 'Landscaping, maintenance, and garden design',
      gradient: 'from-green-400 to-green-600'
    },
    {
      id: 'cleaner',
      name: 'Cleaners',
      icon: Sparkles,
      jobs: 756,
      avgPrice: '£60-150',
      responseTime: '1 min',
      rating: 4.9,
      description: 'Regular cleaning and deep cleaning services',
      isPopular: true,
      gradient: 'from-purple-500 to-purple-700'
    }
  ];

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-64 h-64 bg-[#FDBD18]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#0056D2]/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#FDBD18]/10 text-[#0056D2] px-4 py-2 rounded-full text-sm font-bold mb-4">
            <TrendingUp className="w-4 h-4" />
            <span>Most In-Demand Right Now</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#0056D2] mb-4">
            Popular <span className="text-[#FDBD18]">Services</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            The services customers are booking most. <span className="font-bold text-[#0056D2]">Verified professionals</span>, 
            instant quotes, and <span className="font-bold text-[#FDBD18]">guaranteed quality</span>.
          </p>
          
          {/* Live stats */}
          <div className="flex items-center justify-center gap-8 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700">Live: <span className="font-bold text-[#0056D2]">2,847</span> jobs posted today</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#FDBD18]" />
              <span className="text-gray-700"><span className="font-bold text-[#0056D2]">1,247</span> tradespeople online</span>
            </div>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {services.map((service) => {
                const IconComponent = service.icon;
                
                return (
                  <div key={service.id} className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%] min-w-0">
                    <Link
                      href={`/find-tradespeople?trade=${encodeURIComponent(service.name.toLowerCase())}`}
                      className="group block h-full"
                    >
                      <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 h-full hover:-translate-y-3 hover:scale-[1.02] relative overflow-hidden">
                        {/* Background gradient on hover */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                        
                        {/* Popular badge */}
                        {service.isPopular && (
                          <div className="absolute top-4 right-4">
                            <div className="bg-gradient-to-r from-[#FDBD18] to-yellow-400 text-[#0056D2] px-3 py-1 rounded-full text-xs font-black shadow-lg animate-pulse">
                              🔥 HOT
                            </div>
                          </div>
                        )}

                        {/* Icon and header */}
                        <div className="relative z-10 mb-6">
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300 mb-4`}>
                            <IconComponent className="w-8 h-8 text-white" />
                          </div>
                          
                          <h3 className="text-2xl font-black text-[#0056D2] group-hover:text-[#FDBD18] transition-colors duration-300 mb-2">
                            {service.name}
                          </h3>
                          
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {service.description}
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="relative z-10 space-y-3 mb-6">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-green-500" />
                              <span className="font-bold text-gray-700">{service.jobs} active jobs</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-[#FDBD18] fill-current" />
                              <span className="font-bold text-gray-700">{service.rating}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-500" />
                              <span className="text-gray-600">Response: <span className="font-bold text-[#0056D2]">{service.responseTime}</span></span>
                            </div>
                            <div className="font-black text-[#0056D2] text-lg">
                              {service.avgPrice}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-gray-600 font-semibold">All verified & insured</span>
                          </div>
                        </div>

                        {/* CTA Button */}
                        <div className="relative z-10">
                          <div className="bg-gradient-to-r from-[#FDBD18] to-yellow-400 hover:from-yellow-400 hover:to-[#FDBD18] text-[#0056D2] font-black py-3 px-4 rounded-2xl text-center transition-all duration-300 hover:scale-105 shadow-lg group-hover:shadow-xl">
                            <div className="flex items-center justify-center gap-2">
                              <span>Get Instant Quote</span>
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                            </div>
                            <div className="text-xs mt-1 opacity-80">Free • No obligation</div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-xl border border-gray-200 flex items-center justify-center text-[#0056D2] hover:bg-white hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-xl border border-gray-200 flex items-center justify-center text-[#0056D2] hover:bg-white hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Slide indicators */}
        <div className="flex items-center justify-center gap-3 mt-8">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi && emblaApi.scrollTo(index)}
              className={`h-3 w-3 rounded-full transition-all duration-300 ${
                index === selectedIndex
                  ? 'bg-gradient-to-r from-[#FDBD18] to-yellow-400 scale-125 shadow-lg'
                  : 'bg-gray-300 hover:bg-gray-400 hover:scale-110'
              }`}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <Link
            href="/find-tradespeople"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#0056D2] to-blue-700 hover:from-blue-700 hover:to-[#0056D2] text-white font-black text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
          >
            <span>Browse All Services</span>
            <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
          <p className="text-gray-600 text-sm mt-3">Over 25 trade categories available nationwide</p>
        </div>
      </div>
    </section>
  );
};

export default AnimatedServicesSlider;
