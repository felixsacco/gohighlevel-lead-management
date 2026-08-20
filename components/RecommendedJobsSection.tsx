"use client";

import React, { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import {
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  Zap,
  TrendingUp,
  Users,
  Shield,
  CheckCircle,
  Flame,
  Timer,
} from 'lucide-react';
import { Button } from "@/components/ui/button";

interface Job {
  id: string;
  title: string;
  description: string;
  urgency: 'urgent' | 'hot' | 'available' | 'local';
  city: string;
  requestsToday: number;
  estimatedPrice?: string;
  responseTime?: string;
  category: string;
}

const recommendedJobs: Job[] = [
  {
    id: '1',
    title: 'Emergency Electrician',
    description: 'Power outage repair needed urgently. Licensed electrician required for residential property.',
    urgency: 'urgent',
    city: 'London',
    requestsToday: 12,
    estimatedPrice: '£150-300',
    responseTime: '2 mins',
    category: 'Electrical'
  },
  {
    id: '2',
    title: 'Bathroom Leak Repair',
    description: 'Urgent plumbing repair needed. Leak under bathroom sink causing water damage.',
    urgency: 'hot',
    city: 'Manchester',
    requestsToday: 8,
    estimatedPrice: '£120-250',
    responseTime: '5 mins',
    category: 'Plumbing'
  },
  {
    id: '3',
    title: 'Roof Tile Replacement',
    description: 'Storm damage repair. Several tiles need replacing before next rainfall.',
    urgency: 'urgent',
    city: 'Birmingham',
    requestsToday: 15,
    estimatedPrice: '£200-400',
    responseTime: '3 mins',
    category: 'Roofing'
  },
  {
    id: '4',
    title: 'Garden Landscaping',
    description: 'Complete garden makeover including lawn, plants, and patio installation.',
    urgency: 'available',
    city: 'Leeds',
    requestsToday: 6,
    estimatedPrice: '£800-1500',
    responseTime: '10 mins',
    category: 'Gardening'
  },
  {
    id: '5',
    title: 'Kitchen Appliance Repair',
    description: 'Dishwasher not draining properly. Need experienced appliance technician.',
    urgency: 'local',
    city: 'Liverpool',
    requestsToday: 4,
    estimatedPrice: '£80-150',
    responseTime: '15 mins',
    category: 'Appliance Repair'
  },
  {
    id: '6',
    title: 'House Painting Interior',
    description: 'Full interior painting for 3-bedroom house. Quality finish required.',
    urgency: 'available',
    city: 'Bristol',
    requestsToday: 9,
    estimatedPrice: '£1200-2000',
    responseTime: '8 mins',
    category: 'Painting'
  }
];

const RecommendedJobsSection = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps'
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Handle carousel state
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

  // Auto-scroll
  useEffect(() => {
    if (!emblaApi) return;
    
    const interval = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [emblaApi]);

  const getUrgencyConfig = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return {
          badge: '🚨 URGENT',
          bgColor: 'bg-red-500',
          textColor: 'text-red-700',
          borderColor: 'border-red-200',
          icon: Timer
        };
      case 'hot':
        return {
          badge: '🔥 HOT',
          bgColor: 'bg-orange-500',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200',
          icon: Flame
        };
      case 'available':
        return {
          badge: '✅ AVAILABLE',
          bgColor: 'bg-green-500',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          icon: CheckCircle
        };
      case 'local':
        return {
          badge: '📍 LOCAL',
          bgColor: 'bg-blue-500',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
          icon: MapPin
        };
      default:
        return {
          badge: '⚡ INSTANT',
          bgColor: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-200',
          icon: Zap
        };
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-yellow-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-brand-amber/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-navy/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-brand-navy/10 text-brand-navy px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <TrendingUp className="w-4 h-4" />
            <span>Live Job Requests</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-brand-navy mb-4">
            Jobs Available <span className="text-brand-amber">Right Now</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Real customers posting jobs in your area. <span className="font-semibold text-brand-navy">Get matched instantly</span> and start earning today.
          </p>
          
          {/* Live activity indicator */}
          <div className="flex items-center justify-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700">Live: <span className="font-bold text-brand-navy">new</span> jobs in your area</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-amber" />
              <span className="text-gray-700"><span className="font-bold text-brand-navy">tradespeople</span> online now</span>
            </div>
          </div>
        </div>

        {/* Enhanced carousel */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {recommendedJobs.map((job) => {
                const urgencyConfig = getUrgencyConfig(job.urgency);
                const IconComponent = urgencyConfig.icon;
                
                return (
                  <div key={job.id} className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0">
                    <div className="group bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 p-6 h-full hover:-translate-y-2 hover:border-brand-amber/30 relative overflow-hidden">
                      {/* Background gradient on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-amber/5 to-brand-navy/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Urgency badge */}
                      <div className="relative z-10 flex items-center justify-between mb-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black ${urgencyConfig.textColor} bg-white border-2 ${urgencyConfig.borderColor} shadow-lg`}>
                          <IconComponent className="w-3 h-3" />
                          <span>{urgencyConfig.badge}</span>
                        </div>
                        <div className="text-xs text-gray-500 font-semibold">
                          {job.requestsToday}+ requests today
                        </div>
                      </div>

                      {/* Job content */}
                      <div className="relative z-10 space-y-4">
                        <div>
                          <h3 className="text-xl font-black text-brand-navy mb-2 group-hover:text-brand-amber transition-colors duration-300">
                            {job.title}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                            {job.description}
                          </p>
                        </div>

                        {/* Job details */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="w-4 h-4 text-brand-navy" />
                              <span className="font-semibold">{job.city}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-green-500" />
                              <span className="text-gray-600">Response: <span className="font-bold text-brand-navy">{job.responseTime}</span></span>
                            </div>
                            {job.estimatedPrice && (
                              <div className="font-bold text-brand-navy text-lg">
                                {job.estimatedPrice}
                              </div>
                            )}
                          </div>

                          {/* Category tag */}
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-navy/10 text-brand-navy">
                              {job.category}
                            </span>
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                              <Shield className="w-3 h-3" />
                              <span>Identity checked</span>
                            </span>
                          </div>
                        </div>

                        {/* CTA Button */}
                        <div className="pt-2">
                          <Button className="w-full bg-gradient-to-r from-brand-amber to-yellow-400 hover:from-yellow-400 hover:to-brand-amber text-brand-navy font-black py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group-hover:shadow-brand-amber/30">
                            <span>Apply for This Job</span>
                            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                          </Button>
                          <p className="text-xs text-gray-500 text-center mt-2">Free to apply • Instant matching</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enhanced navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => emblaApi && emblaApi.scrollPrev()}
              disabled={!canScrollPrev}
              className="h-12 w-12 rounded-full bg-white border-2 border-brand-navy/20 text-brand-navy shadow-xl hover:bg-brand-navy hover:text-white hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-brand-amber/30 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
              aria-label="Previous jobs"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Slide indicators */}
            <div className="flex items-center gap-3">
              {scrollSnaps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => emblaApi && emblaApi.scrollTo(i)}
                  className={`h-3 w-3 rounded-full transition-all duration-300 ${
                    i === selectedIndex 
                      ? 'bg-gradient-to-r from-brand-amber to-yellow-400 scale-125 shadow-lg' 
                      : 'bg-gray-300 hover:bg-gray-400 hover:scale-110'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => emblaApi && emblaApi.scrollNext()}
              disabled={!canScrollNext}
              className="h-12 w-12 rounded-full bg-white border-2 border-brand-navy/20 text-brand-navy shadow-xl hover:bg-brand-navy hover:text-white hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-brand-amber/30 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
              aria-label="Next jobs"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <Button className="bg-gradient-to-r from-brand-navy to-brand-navy hover:from-brand-navy hover:to-brand-navy text-white font-black px-8 py-4 rounded-xl text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            View All Available Jobs
            <ChevronRight className="w-5 h-5 ml-3" />
          </Button>
          <p className="text-gray-600 text-sm mt-3">Join trusted tradespeople earning with MyApproved</p>
        </div>
      </div>
    </section>
  );
};

export default RecommendedJobsSection;
