"use client";

import React, { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import {
  Star,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Quote,
  Shield,
  CheckCircle,
  Users,
  TrendingUp,
  Award,
  Clock,
} from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  city: string;
  quote: string;
  rating: number;
  image?: string;
  jobType: string;
  completedDate: string;
  tradesperson: string;
  verified: boolean;
  projectValue?: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Thompson',
    city: 'London',
    quote: 'Absolutely fantastic service! The electrician arrived within 30 minutes of my emergency call. Professional, clean work, and very reasonably priced. The whole process through MyApproved was seamless.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
    jobType: 'Emergency Electrical Repair',
    completedDate: '2 days ago',
    tradesperson: 'Elite Electrical Services',
    verified: true,
    projectValue: '£280'
  },
  {
    id: '2',
    name: 'James Mitchell',
    city: 'Manchester',
    quote: 'I was skeptical about finding quality tradespeople online, but MyApproved exceeded all expectations. Got 3 quotes in minutes, chose the best one, and the work was completed perfectly.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/men/12.jpg',
    jobType: 'Bathroom Renovation',
    completedDate: '1 week ago',
    tradesperson: 'Manchester Bathroom Specialists',
    verified: true,
    projectValue: '£2,400'
  },
  {
    id: '3',
    name: 'Rebecca Lewis',
    city: 'Birmingham',
    quote: 'The verification process gave me complete confidence. The roofer was insured, experienced, and delivered exactly what was promised. Will definitely use MyApproved again.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/women/17.jpg',
    jobType: 'Roof Repair',
    completedDate: '3 days ago',
    tradesperson: 'Birmingham Roofing Co.',
    verified: true,
    projectValue: '£850'
  },
  {
    id: '4',
    name: 'Daniel Murphy',
    city: 'Leeds',
    quote: 'Super easy platform to use. Uploaded photos of my broken boiler, got instant estimates, and had it fixed the same day. The tradesperson was friendly and very professional.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/men/33.jpg',
    jobType: 'Boiler Repair',
    completedDate: '5 days ago',
    tradesperson: 'Leeds Heating Solutions',
    verified: true,
    projectValue: '£320'
  },
  {
    id: '5',
    name: 'Priya Singh',
    city: 'Liverpool',
    quote: 'Outstanding experience from start to finish. The identity-checking and customer reviews gave me peace of mind. The painter did an incredible job on our living room.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/women/25.jpg',
    jobType: 'Interior Painting',
    completedDate: '1 week ago',
    tradesperson: 'Liverpool Decorators Ltd',
    verified: true,
    projectValue: '£680'
  },
  {
    id: '6',
    name: 'Oliver Wright',
    city: 'Bristol',
    quote: 'Fast, reliable, and transparent pricing. No hidden costs, clear communication, and the work was completed ahead of schedule. Highly recommend MyApproved to anyone.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/men/7.jpg',
    jobType: 'Garden Landscaping',
    completedDate: '2 weeks ago',
    tradesperson: 'Bristol Garden Design',
    verified: true,
    projectValue: '£1,200'
  }
];

const TestimonialsSection = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps'
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  // Handle carousel state
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
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
    }, 6000);

    return () => clearInterval(interval);
  }, [emblaApi]);

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating 
            ? 'text-[#FDBD18] fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-20 bg-gradient-to-br from-white via-blue-50/30 to-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-64 h-64 bg-[#FDBD18]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#0056D2]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#FDBD18]/10 text-[#0056D2] px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Award className="w-4 h-4" />
            <span>Customer Success Stories</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#0056D2] mb-4">
            What Our <span className="text-[#FDBD18]">Customers</span> Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Real reviews from real customers across the UK. <span className="font-semibold text-[#0056D2]">Join thousands</span> who've found their perfect tradesperson.
          </p>
          
          {/* Trust stats */}
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-3xl font-black text-[#0056D2]">✓</div>
              <div className="flex items-center justify-center gap-1 mb-1">
                {renderStars(5)}
              </div>
              <div className="text-sm text-gray-600">Identity checked</div>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-3xl font-black text-[#0056D2]">✓</div>
              <div className="text-sm text-gray-600 mt-2">Business verified</div>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-3xl font-black text-[#0056D2]">✓</div>
              <div className="text-sm text-gray-600 mt-2">Insurance confirmed</div>
            </div>
          </div>
        </div>

        {/* Enhanced carousel */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0">
                  <div className="group bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 p-8 h-full hover:-translate-y-2 hover:border-[#FDBD18]/30 relative overflow-hidden">
                    {/* Background gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FDBD18]/5 to-[#0056D2]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Quote icon */}
                    <div className="relative z-10 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#FDBD18] to-yellow-400 rounded-2xl flex items-center justify-center shadow-lg">
                        <Quote className="w-6 h-6 text-[#0056D2]" />
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="relative z-10 flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        {renderStars(testimonial.rating)}
                      </div>
                      <span className="text-sm font-bold text-gray-700">({testimonial.rating}.0)</span>
                      {testimonial.verified && (
                        <div className="ml-auto">
                          <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                            <CheckCircle className="w-3 h-3" />
                            <span>Identity Checked</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Testimonial content */}
                    <div className="relative z-10 space-y-4">
                      <blockquote className="text-gray-700 leading-relaxed italic">
                        "{testimonial.quote}"
                      </blockquote>

                      {/* Customer info */}
                      <div className="flex items-start gap-4 pt-4 border-t border-gray-100">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#0056D2] to-blue-700 flex items-center justify-center text-white font-bold shadow-lg">
                          {testimonial.image ? (
                            <img 
                              src={testimonial.image} 
                              alt={testimonial.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = testimonial.name.split(' ').map(n => n[0]).join('');
                              }}
                            />
                          ) : (
                            testimonial.name.split(' ').map(n => n[0]).join('')
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-[#0056D2] text-lg">{testimonial.name}</div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <MapPin className="w-3 h-3" />
                            <span>{testimonial.city}</span>
                            <span>•</span>
                            <Clock className="w-3 h-3" />
                            <span>{testimonial.completedDate}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            <div className="font-semibold">{testimonial.jobType}</div>
                            <div>by {testimonial.tradesperson}</div>
                          </div>
                        </div>
                        {testimonial.projectValue && (
                          <div className="text-right">
                            <div className="font-bold text-[#0056D2]">{testimonial.projectValue}</div>
                            <div className="text-xs text-gray-500">Project Value</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Trust indicators */}
                    <div className="relative z-10 flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Shield className="w-3 h-3 text-green-500" />
                        <span>Insurance confirmed</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <CheckCircle className="w-3 h-3 text-blue-500" />
                        <span>Identity checked</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Award className="w-3 h-3 text-[#FDBD18]" />
                        <span>Business verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => emblaApi && emblaApi.scrollPrev()}
              className="h-12 w-12 rounded-full bg-white border-2 border-[#0056D2]/20 text-[#0056D2] shadow-xl hover:bg-[#0056D2] hover:text-white hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#FDBD18]/30 hover:scale-110"
              aria-label="Previous testimonials"
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
                      ? 'bg-gradient-to-r from-[#FDBD18] to-yellow-400 scale-125 shadow-lg' 
                      : 'bg-gray-300 hover:bg-gray-400 hover:scale-110'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => emblaApi && emblaApi.scrollNext()}
              className="h-12 w-12 rounded-full bg-white border-2 border-[#0056D2]/20 text-[#0056D2] shadow-xl hover:bg-[#0056D2] hover:text-white hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#FDBD18]/30 hover:scale-110"
              aria-label="Next testimonials"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Trust badges section */}
        <div className="mt-16 bg-gradient-to-r from-[#0056D2]/5 via-white to-[#FDBD18]/5 rounded-3xl p-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-black text-[#0056D2] mb-2">Trusted by Industry Leaders</h3>
            <p className="text-gray-600">Our platform is recognized and recommended by leading trade associations</p>
          </div>
          
          <div className="flex items-center justify-center gap-8 opacity-60">
            {/* Placeholder for company logos */}
            <div className="w-24 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500">
              Google
            </div>
            <div className="w-24 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500">
              Trustpilot
            </div>
            <div className="w-24 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500">
              Which?
            </div>
            <div className="w-24 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500">
              FMB
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
