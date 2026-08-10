"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Star,
  Clock,
  Users,
  Shield,
  Zap,
  Flame,
  CheckCircle,
  TrendingUp,
  Timer,
  AlertCircle,
  ArrowRight,
  Eye,
  MessageCircle,
} from 'lucide-react';
import { Button } from "@/components/ui/button";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  postcode: string;
  urgency: 'urgent' | 'hot' | 'available' | 'local';
  budget: string;
  timeframe: string;
  postedTime: string;
  views: number;
  responses: number;
  clientRating: number;
  isVerified: boolean;
  isAIMatched: boolean;
  category: string;
  requirements: string[];
  size: 'small' | 'medium' | 'large';
}

const MasonryJobsSection = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [visibleJobs, setVisibleJobs] = useState(6);

  const sampleJobs: Job[] = [
    {
      id: '1',
      title: 'Emergency Boiler Repair',
      description: 'Boiler has completely stopped working. No hot water or heating. Need urgent repair as we have young children in the house.',
      location: 'Kensington, London',
      postcode: 'SW7',
      urgency: 'urgent',
      budget: '£200-400',
      timeframe: 'ASAP',
      postedTime: '12 minutes ago',
      views: 47,
      responses: 8,
      clientRating: 4.8,
      isVerified: true,
      isAIMatched: true,
      category: 'Plumbing',
      requirements: ['Gas Safe certified', 'Emergency callout', 'Same day service'],
      size: 'large'
    },
    {
      id: '2',
      title: 'Kitchen Electrical Work',
      description: 'Need additional sockets installed in kitchen and under-cabinet lighting fitted.',
      location: 'Manchester',
      postcode: 'M1',
      urgency: 'available',
      budget: '£300-500',
      timeframe: 'Within 2 weeks',
      postedTime: '1 hour ago',
      views: 23,
      responses: 5,
      clientRating: 4.9,
      isVerified: true,
      isAIMatched: false,
      category: 'Electrical',
      requirements: ['Part P certified', 'Portfolio required'],
      size: 'medium'
    },
    {
      id: '3',
      title: 'Bathroom Tile Repair',
      description: 'Several tiles have come loose in shower area. Quick repair needed.',
      location: 'Birmingham',
      postcode: 'B1',
      urgency: 'hot',
      budget: '£150-250',
      timeframe: 'This week',
      postedTime: '3 hours ago',
      views: 31,
      responses: 12,
      clientRating: 4.7,
      isVerified: true,
      isAIMatched: true,
      category: 'Tiling',
      requirements: ['Experience with bathroom work'],
      size: 'small'
    },
    {
      id: '4',
      title: 'Garden Landscaping Project',
      description: 'Complete garden makeover including new lawn, flower beds, patio area, and garden path. Large project requiring experienced landscaper.',
      location: 'Leeds',
      postcode: 'LS1',
      urgency: 'available',
      budget: '£2000-4000',
      timeframe: 'Next month',
      postedTime: '5 hours ago',
      views: 89,
      responses: 15,
      clientRating: 4.6,
      isVerified: true,
      isAIMatched: true,
      category: 'Landscaping',
      requirements: ['Portfolio required', 'References needed', 'Insurance essential'],
      size: 'large'
    },
    {
      id: '5',
      title: 'Roof Leak Repair',
      description: 'Water coming through ceiling after recent storms. Need urgent inspection and repair.',
      location: 'Liverpool',
      postcode: 'L1',
      urgency: 'urgent',
      budget: '£400-800',
      timeframe: 'Today',
      postedTime: '30 minutes ago',
      views: 56,
      responses: 9,
      clientRating: 4.8,
      isVerified: true,
      isAIMatched: false,
      category: 'Roofing',
      requirements: ['Emergency callout', 'Fully insured', 'Safety certified'],
      size: 'medium'
    },
    {
      id: '6',
      title: 'Interior Painting',
      description: 'Living room and hallway need repainting. High quality finish required.',
      location: 'Bristol',
      postcode: 'BS1',
      urgency: 'local',
      budget: '£600-900',
      timeframe: '2-3 weeks',
      postedTime: '2 hours ago',
      views: 18,
      responses: 4,
      clientRating: 4.9,
      isVerified: true,
      isAIMatched: true,
      category: 'Painting',
      requirements: ['Portfolio required', 'Quality finish essential'],
      size: 'medium'
    }
  ];

  useEffect(() => {
    setJobs(sampleJobs);
  }, []);

  const getUrgencyConfig = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return {
          badge: '🚨 URGENT',
          bgColor: 'bg-red-500',
          textColor: 'text-red-700',
          borderColor: 'border-red-200',
          bgLight: 'bg-red-50',
          icon: Timer,
          pulse: true
        };
      case 'hot':
        return {
          badge: '🔥 HOT',
          bgColor: 'bg-orange-500',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200',
          bgLight: 'bg-orange-50',
          icon: Flame,
          pulse: false
        };
      case 'available':
        return {
          badge: '✅ AVAILABLE',
          bgColor: 'bg-green-500',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          bgLight: 'bg-green-50',
          icon: CheckCircle,
          pulse: false
        };
      case 'local':
        return {
          badge: '📍 LOCAL',
          bgColor: 'bg-blue-500',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
          bgLight: 'bg-blue-50',
          icon: MapPin,
          pulse: false
        };
      default:
        return {
          badge: '⚡ INSTANT',
          bgColor: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-200',
          bgLight: 'bg-yellow-50',
          icon: Zap,
          pulse: false
        };
    }
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case 'large':
        return 'md:col-span-2 md:row-span-2';
      case 'medium':
        return 'md:col-span-2 md:row-span-1';
      case 'small':
      default:
        return 'md:col-span-1 md:row-span-1';
    }
  };

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-[#FDBD18]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#0056D2]/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#0056D2]/10 text-[#0056D2] px-4 py-2 rounded-full text-sm font-bold mb-4">
            <TrendingUp className="w-4 h-4" />
            <span>Live Job Requests</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#0056D2] mb-4">
            Jobs Available <span className="text-[#FDBD18]">Right Now</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Real customers posting jobs in your area. <span className="font-bold text-[#0056D2]">Get matched instantly</span> and start earning today.
          </p>
          
          {/* Live activity */}
          <div className="flex items-center justify-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700">Live: <span className="font-bold text-[#0056D2]">47</span> new jobs in last hour</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#FDBD18]" />
              <span className="text-gray-700"><span className="font-bold text-[#0056D2]">1,247</span> tradespeople online</span>
            </div>
          </div>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-min">
          {jobs.slice(0, visibleJobs).map((job) => {
            const urgencyConfig = getUrgencyConfig(job.urgency);
            const IconComponent = urgencyConfig.icon;
            
            return (
              <div
                key={job.id}
                className={`group bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 p-6 hover:-translate-y-2 hover:scale-[1.02] relative overflow-hidden ${getSizeClass(job.size)}`}
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#FDBD18]/5 to-[#0056D2]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Header with badges */}
                <div className="relative z-10 flex items-start justify-between mb-4">
                  <div className="space-y-2">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black ${urgencyConfig.textColor} ${urgencyConfig.bgLight} border ${urgencyConfig.borderColor} shadow-sm ${urgencyConfig.pulse ? 'animate-pulse' : ''}`}>
                      <IconComponent className="w-3 h-3" />
                      <span>{urgencyConfig.badge}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {job.isAIMatched && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200">
                          <Zap className="w-3 h-3" />
                          <span>AI Matched</span>
                        </div>
                      )}
                      {job.isVerified && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold text-green-700 bg-green-50 border border-green-200">
                          <Shield className="w-3 h-3" />
                          <span>Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 font-semibold">
                    {job.postedTime}
                  </div>
                </div>

                {/* Job content */}
                <div className="relative z-10 space-y-4">
                  <div>
                    <h3 className="text-xl font-black text-[#0056D2] group-hover:text-[#FDBD18] transition-colors duration-300 mb-2">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                      {job.description}
                    </p>
                  </div>

                  {/* Location and budget */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-[#0056D2]" />
                      <span className="font-semibold text-gray-700">{job.location}</span>
                      <span className="text-gray-500">({job.postcode})</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600">{job.timeframe}</span>
                      </div>
                      <div className="font-black text-[#0056D2] text-lg">
                        {job.budget}
                      </div>
                    </div>
                  </div>

                  {/* Requirements */}
                  {job.requirements.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-gray-700">Requirements:</div>
                      <div className="flex flex-wrap gap-1">
                        {job.requirements.slice(0, 2).map((req, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {req}
                          </span>
                        ))}
                        {job.requirements.length > 2 && (
                          <span className="text-xs text-gray-500">+{job.requirements.length - 2} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{job.views} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{job.responses} responses</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-[#FDBD18] fill-current" />
                      <span className="font-semibold">{job.clientRating}</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-2">
                    <Button className="w-full bg-gradient-to-r from-[#FDBD18] to-yellow-400 hover:from-yellow-400 hover:to-[#FDBD18] text-[#0056D2] font-black py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group-hover:shadow-[#FDBD18]/30">
                      <span>Apply for This Job</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load more button */}
        {visibleJobs < jobs.length && (
          <div className="text-center mt-12">
            <Button
              onClick={() => setVisibleJobs(prev => prev + 6)}
              className="bg-gradient-to-r from-[#0056D2] to-blue-700 hover:from-blue-700 hover:to-[#0056D2] text-white font-black px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
            >
              <span>Load More Jobs</span>
              <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>
        )}

        {/* Bottom stats */}
        <div className="mt-16 bg-gradient-to-r from-[#0056D2]/5 via-white to-[#FDBD18]/5 rounded-3xl p-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-black text-[#0056D2] mb-2">Why Tradespeople Choose Us</h3>
            <p className="text-gray-600">Join thousands earning more with quality leads</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-black text-[#0056D2] mb-1">47</div>
              <div className="text-sm text-gray-600">Avg. leads per month</div>
            </div>
            <div>
              <div className="text-3xl font-black text-[#0056D2] mb-1">73%</div>
              <div className="text-sm text-gray-600">Conversion rate</div>
            </div>
            <div>
              <div className="text-3xl font-black text-[#0056D2] mb-1">3min</div>
              <div className="text-sm text-gray-600">Avg. response time</div>
            </div>
            <div>
              <div className="text-3xl font-black text-[#0056D2] mb-1">£2.4k</div>
              <div className="text-sm text-gray-600">Avg. monthly earnings</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MasonryJobsSection;
