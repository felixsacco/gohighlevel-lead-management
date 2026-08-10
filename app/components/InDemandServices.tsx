"use client";

import { useState, useCallback, useEffect } from "react";
import { Star, Clock, MapPin, TrendingUp, ArrowRight, ShieldCheck, Shield, Sparkles, Leaf, Home as HomeIcon, Hammer, Bolt, Droplets, Paintbrush, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

interface ServiceCardProps {
  title: string;
  jobs: number;
  responseTime: number;
  jobsToday: number;
  popular?: boolean;
  priceFrom: string;
  icon: React.ReactNode;
  animationDelay?: number;
}

const ServiceCard = ({
  title,
  jobs,
  responseTime,
  jobsToday,
  popular = false,
  priceFrom,
  icon,
  animationDelay = 0.3,
}: ServiceCardProps) => {
  return (
    <div 
      className="h-full flex flex-col bg-white rounded-2xl p-5 border border-gray-100 hover:border-yellow-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden shadow-sm group relative"
      style={{animationDelay: `${animationDelay}s`}}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-blue-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Service Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 group-hover:scale-110 transition-transform duration-300 shadow-sm">
            <div className="text-blue-600 group-hover:text-blue-700 transition-colors duration-300">
              {icon}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300 leading-tight">
              {title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium">
                In demand
              </span>
              <span className="text-gray-500 text-xs">• {jobs.toLocaleString()} jobs</span>
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="space-y-2 mb-4 flex-grow">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Clock className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
            <span className="font-medium text-green-600 text-xs">{responseTime} min • Available now</span>
          </div>
          <div className="text-xs text-gray-600">
            • Typically replies within {responseTime} min
          </div>
          <div className="text-xs text-gray-600">
            • {jobsToday}+ jobs booked today near you
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="text-yellow-600 font-bold text-base">Starting from {priceFrom}</div>
        </div>

        {/* CTA Button */}
        <div className="mt-auto">
          <button 
            onClick={() => document.getElementById('ai-quote-trigger')?.click()}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-blue-900 font-medium py-2.5 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] group/button text-sm"
          >
            <span className="flex items-center justify-center gap-2">
              Get My Free Quote Now
              <ArrowRight className="w-3.5 h-3.5 transform group-hover/button:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

const InDemandServices = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [
    Autoplay({ delay: 5000, stopOnInteraction: false })
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);
  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const services = [
    {
      title: "Emergency Plumbing",
      jobs: 1245,
      responseTime: 30,
      jobsToday: 42,
      popular: true,
      priceFrom: "£99",
      icon: <Droplets className="w-6 h-6" />,
    },
    {
      title: "Electrical Repairs",
      jobs: 982,
      responseTime: 45,
      jobsToday: 35,
      priceFrom: "£85",
      icon: <Bolt className="w-6 h-6" />,
    },
    {
      title: "Painting & Decorating",
      jobs: 763,
      responseTime: 60,
      jobsToday: 28,
      priceFrom: "£120",
      icon: <Paintbrush className="w-6 h-6" />,
    },
    {
      title: "Handyman Services",
      jobs: 1560,
      responseTime: 90,
      jobsToday: 67,
      priceFrom: "£45",
      icon: <Hammer className="w-6 h-6" />,
    },
    {
      title: "Gardening & Landscaping",
      jobs: 890,
      responseTime: 60,
      jobsToday: 45,
      priceFrom: "£75",
      icon: <Leaf className="w-6 h-6" />,
    },
    {
      title: "Home Cleaning",
      jobs: 2100,
      responseTime: 30,
      jobsToday: 92,
      priceFrom: "£25",
      icon: <Sparkles className="w-6 h-6" />,
    },
  ];

  return (
    <section className="relative py-8 md:py-12 mt-0 bg-white text-gray-900 overflow-hidden">
      {/* Animated Background Elements - More subtle */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 via-blue-50 to-indigo-50"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent_50%)]"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400/20 to-blue-400/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-blue-100 mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-yellow-600" />
            <span className="text-xs font-medium text-blue-800">Most In-Demand</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-tight mb-3">
            <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">Most In-Demand</span>{' '}
            <span className="text-gray-900">Services</span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
            Discover our most popular services trusted by thousands of homeowners.
          </p>
        </div>

        {/* Services Carousel */}
        <div className="relative -mx-2">
          {/* Navigation Buttons */}
          <button
            onClick={scrollPrev}
            className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-md items-center justify-center text-blue-900 hover:bg-blue-50 transition-all duration-200 border border-gray-100 hover:border-yellow-300"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="overflow-hidden px-2" ref={emblaRef}>
            <div className="flex">
              {services.map((service, index) => (
                <div key={index} className="flex-[0_0_100%] sm:flex-[0_0_calc(50%-0.5rem)] lg:flex-[0_0_calc(33.333%-0.75rem)] px-2">
                  <ServiceCard {...service} />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={scrollNext}
            className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-md items-center justify-center text-blue-900 hover:bg-blue-50 transition-all duration-200 border border-gray-100 hover:border-yellow-300"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Dots Navigation */}
        <div className="flex justify-center gap-1.5 mt-6">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === selectedIndex ? 'bg-yellow-500 w-5' : 'bg-gray-200'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto">
          <div className="bg-white p-3 rounded-xl border border-gray-100 hover:border-yellow-300 transition-colors duration-300 shadow-sm hover:shadow-md">
            <div className="w-10 h-10 mx-auto bg-blue-50 rounded-xl flex items-center justify-center mb-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="text-gray-800 font-medium text-xs text-center">All Trades Verified</h4>
          </div>
          <div className="bg-white p-3 rounded-xl border border-gray-100 hover:border-yellow-300 transition-colors duration-300 shadow-sm hover:shadow-md">
            <div className="w-10 h-10 mx-auto bg-yellow-50 rounded-xl flex items-center justify-center mb-2">
              <Shield className="w-5 h-5 text-yellow-500" />
            </div>
            <h4 className="text-gray-800 font-medium text-xs text-center">Insurance Guaranteed</h4>
          </div>
          <div className="bg-white p-3 rounded-xl border border-gray-100 hover:border-yellow-300 transition-colors duration-300 shadow-sm hover:shadow-md">
            <div className="w-10 h-10 mx-auto bg-green-50 rounded-xl flex items-center justify-center mb-2">
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <h4 className="text-gray-800 font-medium text-xs text-center">Rated 5.0 by 50,000+</h4>
          </div>
          <div className="bg-white p-3 rounded-xl border border-gray-100 hover:border-yellow-300 transition-colors duration-300 shadow-sm hover:shadow-md">
            <div className="w-10 h-10 mx-auto bg-indigo-50 rounded-xl flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-indigo-600" />
            </div>
            <h4 className="text-gray-800 font-medium text-xs text-center">24/7 Support</h4>
          </div>
        </div>

        {/* View All CTA */}
        <div className="mt-10 text-center">
          <a
            href="/find-tradespeople"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-blue-900 font-semibold text-sm py-2.5 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02]"
          >
            View All Services
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default InDemandServices;