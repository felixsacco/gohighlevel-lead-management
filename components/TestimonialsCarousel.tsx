"use client";

import React, { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import AutoPlay from 'embla-carousel-autoplay';
import {
  Star,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Quote,
  Shield,
  CheckCircle,
  Award,
  Clock,
  Users,
} from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar: string;
  quote: string;
  rating: number;
  jobType: string;
  completedDate: string;
  tradesperson: string;
  projectValue: string;
  platform: 'google' | 'trustpilot' | 'facebook' | 'myapproved';
  verified: boolean;
  featured: boolean;
}

const TestimonialsCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      align: 'start',
      slidesToScroll: 1,
      containScroll: 'trimSnaps'
    },
    [AutoPlay({ delay: 5000, stopOnInteraction: false })]
  );
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Sarah Thompson',
      location: 'Kensington, London',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      quote: 'Absolutely incredible service! The electrician arrived within 30 minutes of my emergency call. Professional, clean work, and very reasonably priced. The whole process through MyApproved was seamless from start to finish.',
      rating: 5,
      jobType: 'Emergency Electrical Repair',
      completedDate: '2 days ago',
      tradesperson: 'Elite Electrical Services',
      projectValue: '£280',
      platform: 'google',
      verified: true,
      featured: true
    },
    {
      id: '2',
      name: 'James Mitchell',
      location: 'Manchester City Centre',
      avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
      quote: 'I was skeptical about finding quality tradespeople online, but MyApproved exceeded all my expectations. Got 3 detailed quotes in minutes, chose the best one, and the bathroom renovation was completed perfectly on time and budget.',
      rating: 5,
      jobType: 'Complete Bathroom Renovation',
      completedDate: '1 week ago',
      tradesperson: 'Manchester Bathroom Specialists',
      projectValue: '£2,400',
      platform: 'trustpilot',
      verified: true,
      featured: false
    },
    {
      id: '3',
      name: 'Rebecca Lewis',
      location: 'Birmingham',
      avatar: 'https://randomuser.me/api/portraits/women/17.jpg',
      quote: 'The verification process gave me complete confidence in choosing a roofer. Fully insured, experienced, and delivered exactly what was promised. The platform made everything so transparent and trustworthy.',
      rating: 5,
      jobType: 'Roof Repair & Maintenance',
      completedDate: '3 days ago',
      tradesperson: 'Birmingham Roofing Co.',
      projectValue: '£850',
      platform: 'google',
      verified: true,
      featured: true
    },
    {
      id: '4',
      name: 'Daniel Murphy',
      location: 'Leeds',
      avatar: 'https://randomuser.me/api/portraits/men/33.jpg',
      quote: 'Super easy platform to use. Uploaded photos of my broken boiler, got instant AI estimates, and had it fixed the same day. The heating engineer was friendly, professional, and solved the problem quickly.',
      rating: 5,
      jobType: 'Boiler Repair & Service',
      completedDate: '5 days ago',
      tradesperson: 'Leeds Heating Solutions',
      projectValue: '£320',
      platform: 'myapproved',
      verified: true,
      featured: false
    },
    {
      id: '5',
      name: 'Priya Singh',
      location: 'Liverpool',
      avatar: 'https://randomuser.me/api/portraits/women/25.jpg',
      quote: 'Outstanding experience from start to finish. The insurance guarantee and verified reviews gave me complete peace of mind. The decorator did an incredible job on our living room - looks absolutely stunning!',
      rating: 5,
      jobType: 'Interior Painting & Decorating',
      completedDate: '1 week ago',
      tradesperson: 'Liverpool Decorators Ltd',
      projectValue: '£680',
      platform: 'facebook',
      verified: true,
      featured: true
    },
    {
      id: '6',
      name: 'Oliver Wright',
      location: 'Bristol',
      avatar: 'https://randomuser.me/api/portraits/men/7.jpg',
      quote: 'Fast, reliable, and completely transparent pricing. No hidden costs, clear communication throughout, and the landscaping work was completed ahead of schedule. Highly recommend MyApproved to anyone needing trades.',
      rating: 5,
      jobType: 'Garden Landscaping',
      completedDate: '2 weeks ago',
      tradesperson: 'Bristol Garden Design',
      projectValue: '£1,200',
      platform: 'trustpilot',
      verified: true,
      featured: false
    }
  ];

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

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

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

  const getPlatformLogo = (platform: string) => {
    switch (platform) {
      case 'google':
        return (
          <div className="flex items-center gap-1 text-xs font-bold text-blue-600">
            <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">G</div>
            <span>Google</span>
          </div>
        );
      case 'trustpilot':
        return (
          <div className="flex items-center gap-1 text-xs font-bold text-green-600">
            <div className="w-4 h-4 bg-green-600 rounded flex items-center justify-center text-white text-xs">T</div>
            <span>Trustpilot</span>
          </div>
        );
      case 'facebook':
        return (
          <div className="flex items-center gap-1 text-xs font-bold text-blue-700">
            <div className="w-4 h-4 bg-blue-700 rounded flex items-center justify-center text-white text-xs">f</div>
            <span>Facebook</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 text-xs font-bold text-[#0056D2]">
            <Shield className="w-4 h-4" />
            <span>MyApproved</span>
          </div>
        );
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50/30 via-white to-yellow-50/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-64 h-64 bg-[#FDBD18]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#0056D2]/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#FDBD18]/10 text-[#0056D2] px-4 py-2 rounded-full text-sm font-bold mb-4">
            <Award className="w-4 h-4" />
            <span>Customer Success Stories</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#0056D2] mb-4">
            What Our <span className="text-[#FDBD18]">Customers</span> Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Real reviews from real customers across the UK. <span className="font-bold text-[#0056D2]">Join thousands</span> who've found their perfect tradesperson.
          </p>
          
          {/* Trust stats */}
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-3xl font-black text-[#0056D2]">4.9</div>
              <div className="flex items-center justify-center gap-1 mb-1">
                {renderStars(5)}
              </div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-3xl font-black text-[#0056D2]">50,000+</div>
              <div className="text-sm text-gray-600 mt-2">Happy Customers</div>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-3xl font-black text-[#0056D2]">98%</div>
              <div className="text-sm text-gray-600 mt-2">Would Recommend</div>
            </div>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0">
                  <div className="group bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 p-8 h-full hover:-translate-y-3 hover:scale-[1.02] relative overflow-hidden">
                    {/* Background gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FDBD18]/5 to-[#0056D2]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Featured badge */}
                    {testimonial.featured && (
                      <div className="absolute top-4 right-4">
                        <div className="bg-gradient-to-r from-[#FDBD18] to-yellow-400 text-[#0056D2] px-3 py-1 rounded-full text-xs font-black shadow-lg">
                          ⭐ Featured
                        </div>
                      </div>
                    )}

                    {/* Quote icon */}
                    <div className="relative z-10 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#FDBD18] to-yellow-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Quote className="w-6 h-6 text-[#0056D2]" />
                      </div>
                    </div>

                    {/* Rating and platform */}
                    <div className="relative z-10 flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        {renderStars(testimonial.rating)}
                      </div>
                      <div className="flex items-center gap-2">
                        {getPlatformLogo(testimonial.platform)}
                        {testimonial.verified && (
                          <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                            <CheckCircle className="w-3 h-3" />
                            <span>Verified</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Testimonial content */}
                    <div className="relative z-10 space-y-6">
                      <blockquote className="text-gray-700 leading-relaxed italic text-lg">
                        "{testimonial.quote}"
                      </blockquote>

                      {/* Customer info */}
                      <div className="flex items-start gap-4 pt-4 border-t border-gray-100">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-[#0056D2] to-blue-700 flex items-center justify-center text-white font-bold shadow-lg">
                            <img 
                              src={testimonial.avatar} 
                              alt={testimonial.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = testimonial.name.split(' ').map(n => n[0]).join('');
                              }}
                            />
                          </div>
                          {/* Online indicator */}
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-black text-[#0056D2] text-lg">{testimonial.name}</div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <MapPin className="w-3 h-3" />
                            <span>{testimonial.location}</span>
                            <span>•</span>
                            <Clock className="w-3 h-3" />
                            <span>{testimonial.completedDate}</span>
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div className="font-semibold text-[#0056D2]">{testimonial.jobType}</div>
                            <div>by {testimonial.tradesperson}</div>
                            <div className="font-bold text-green-600">{testimonial.projectValue} project value</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Trust indicators */}
                    <div className="relative z-10 flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Shield className="w-3 h-3 text-green-500" />
                          <span>Insured</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-blue-500" />
                          <span>Verified</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="w-3 h-3 text-[#FDBD18]" />
                          <span>Top Rated</span>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-[#0056D2]">
                        5.0★ Rating
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={scrollPrev}
              className="w-12 h-12 rounded-full bg-white border-2 border-[#0056D2]/20 text-[#0056D2] shadow-xl hover:bg-[#0056D2] hover:text-white hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Slide indicators */}
            <div className="flex items-center gap-3">
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

            <button
              onClick={scrollNext}
              className="w-12 h-12 rounded-full bg-white border-2 border-[#0056D2]/20 text-[#0056D2] shadow-xl hover:bg-[#0056D2] hover:text-white hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-16 bg-gradient-to-r from-[#0056D2]/5 via-white to-[#FDBD18]/5 rounded-3xl p-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-black text-[#0056D2] mb-2">Trusted Across All Platforms</h3>
            <p className="text-gray-600">Our customers share their experiences everywhere</p>
          </div>
          
          <div className="flex items-center justify-center gap-8 opacity-80">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-2 mx-auto">G</div>
              <div className="text-sm font-bold text-gray-700">Google Reviews</div>
              <div className="text-xs text-gray-500">4.9★ (25k+ reviews)</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-2 mx-auto">T</div>
              <div className="text-sm font-bold text-gray-700">Trustpilot</div>
              <div className="text-xs text-gray-500">4.8★ (15k+ reviews)</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-2 mx-auto">f</div>
              <div className="text-sm font-bold text-gray-700">Facebook</div>
              <div className="text-xs text-gray-500">4.7★ (8k+ reviews)</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#0056D2] rounded-2xl flex items-center justify-center text-white mb-2 mx-auto">
                <Shield className="w-8 h-8" />
              </div>
              <div className="text-sm font-bold text-gray-700">MyApproved</div>
              <div className="text-xs text-gray-500">4.9★ (50k+ reviews)</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
