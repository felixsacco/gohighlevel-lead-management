"use client";

import React, { useState, useEffect } from 'react';
import {
  Search,
  Zap,
  Users,
  CheckCircle,
  ArrowRight,
  Brain,
  Shield,
  Clock,
  Star,
  Target,
  MessageCircle,
  Sparkles,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import { Button } from "@/components/ui/button";

const AIExplainerSection = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps = [
    {
      id: 1,
      title: 'Describe Your Job',
      subtitle: 'AI analyzes your requirements',
      description: 'Tell us what you need in plain English. Our AI understands your job requirements, urgency, location, and budget to find the perfect matches.',
      icon: Search,
      color: 'from-blue-500 to-blue-700',
      features: [
        'Natural language processing',
        'Smart requirement extraction',
        'Instant job categorization',
        'Budget optimization'
      ],
      visual: {
        type: 'form',
        content: 'Emergency plumber needed for burst pipe in kitchen...'
      }
    },
    {
      id: 2,
      title: 'AI Finds Perfect Matches',
      subtitle: 'Smart matching in seconds',
      description: 'Our advanced AI instantly scans 10,000+ verified tradespeople, checking availability, location, ratings, and specializations to find your ideal matches.',
      icon: Brain,
      color: 'from-purple-500 to-purple-700',
      features: [
        'Real-time availability check',
        'Location-based matching',
        'Skill & rating analysis',
        'Insurance verification'
      ],
      visual: {
        type: 'matching',
        content: 'Analyzing 10,000+ tradespeople...'
      }
    },
    {
      id: 3,
      title: 'Get Instant Quotes',
      subtitle: 'Connect with top professionals',
      description: 'Receive multiple quotes from pre-screened professionals within minutes. Compare prices, reviews, and availability to make the best choice.',
      icon: Users,
      color: 'from-green-500 to-green-700',
      features: [
        'Multiple competitive quotes',
        'Verified professional profiles',
        'Instant messaging',
        'Booking confirmation'
      ],
      visual: {
        type: 'results',
        content: '3 quotes received in 2 minutes'
      }
    }
  ];

  // Auto-advance steps
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveStep((prev) => (prev + 1) % steps.length);
        setIsAnimating(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [steps.length]);

  const handleStepClick = (index: number) => {
    if (index !== activeStep) {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveStep(index);
        setIsAnimating(false);
      }, 300);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-[#0056D2] text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#FDBD18]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/5 to-transparent rounded-full blur-3xl animate-spin" style={{animationDuration: '30s'}}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold mb-4 border border-white/20">
            <Sparkles className="w-4 h-4 text-[#FDBD18]" />
            <span>AI-Powered Matching</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            How Our <span className="text-[#FDBD18]">AI</span> Finds Your
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">Perfect Tradesperson</span>
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Advanced artificial intelligence that understands your needs and connects you with the right professionals in <span className="font-bold text-[#FDBD18]">under 60 seconds</span>.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Steps Navigation */}
          <div className="space-y-6">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const isActive = index === activeStep;
              
              return (
                <div
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  className={`group cursor-pointer transition-all duration-500 ${
                    isActive ? 'scale-105' : 'hover:scale-102'
                  }`}
                >
                  <div className={`relative p-6 rounded-3xl border-2 transition-all duration-500 ${
                    isActive
                      ? 'bg-white/10 backdrop-blur-sm border-[#FDBD18] shadow-2xl shadow-[#FDBD18]/20'
                      : 'bg-white/5 backdrop-blur-sm border-white/20 hover:border-white/40 hover:bg-white/10'
                  }`}>
                    {/* Step number and icon */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 ${
                        isActive
                          ? `bg-gradient-to-br ${step.color} scale-110`
                          : 'bg-white/20 group-hover:bg-white/30'
                      }`}>
                        <IconComponent className="w-8 h-8 text-white" />
                        <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all duration-500 ${
                          isActive
                            ? 'bg-[#FDBD18] text-[#0056D2] scale-110'
                            : 'bg-white/30 text-white'
                        }`}>
                          {step.id}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className={`text-2xl font-black mb-1 transition-colors duration-300 ${
                          isActive ? 'text-[#FDBD18]' : 'text-white group-hover:text-[#FDBD18]'
                        }`}>
                          {step.title}
                        </h3>
                        <p className="text-blue-200 font-semibold">{step.subtitle}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-blue-100 leading-relaxed mb-4">
                      {step.description}
                    </p>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-2">
                      {step.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-blue-200">
                          <CheckCircle className={`w-4 h-4 transition-colors duration-300 ${
                            isActive ? 'text-[#FDBD18]' : 'text-green-400'
                          }`} />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#FDBD18]/10 to-transparent pointer-events-none"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Visual Demo */}
          <div className="relative">
            <div className={`transition-all duration-500 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              {/* Main visual container */}
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
                {activeStep === 0 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                        <Search className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">Describe Your Job</h4>
                      <p className="text-blue-200 text-sm">AI analyzes your requirements</p>
                    </div>
                    
                    {/* Mock form */}
                    <div className="space-y-4">
                      <div className="bg-white/20 rounded-2xl p-4 border border-white/30">
                        <div className="text-sm text-blue-200 mb-2">What do you need?</div>
                        <div className="text-white font-semibold">Emergency plumber needed for burst pipe in kitchen...</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/20 rounded-2xl p-4 border border-white/30">
                          <div className="text-sm text-blue-200 mb-2">Location</div>
                          <div className="text-white font-semibold">London, SW1</div>
                        </div>
                        <div className="bg-white/20 rounded-2xl p-4 border border-white/30">
                          <div className="text-sm text-blue-200 mb-2">Urgency</div>
                          <div className="text-red-400 font-semibold">🚨 URGENT</div>
                        </div>
                      </div>
                      
                      <div className="bg-[#FDBD18]/20 rounded-2xl p-4 border border-[#FDBD18]/30">
                        <div className="flex items-center gap-2 text-[#FDBD18] font-bold">
                          <img 
                            src="/logo-icon.svg" 
                            alt="MyApproved AI" 
                            className="w-4 h-4 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <Brain className="w-4 h-4 hidden" />
                          <span>AI analyzing requirements...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                        <img 
                          src="/logo-icon.svg" 
                          alt="MyApproved AI" 
                          className="w-10 h-10 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <Brain className="w-8 h-8 text-white hidden" />
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">AI Finding Matches</h4>
                      <p className="text-blue-200 text-sm">Smart matching in seconds</p>
                    </div>
                    
                    {/* Matching process */}
                    <div className="space-y-4">
                      <div className="bg-purple-500/20 rounded-2xl p-4 border border-purple-400/30">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white font-semibold">Scanning Database</span>
                          <span className="text-[#FDBD18] font-bold">10,000+ Tradespeople</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div className="bg-gradient-to-r from-[#FDBD18] to-yellow-400 h-2 rounded-full animate-pulse" style={{width: '85%'}}></div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-white font-semibold">Location Match</span>
                          </div>
                          <div className="text-green-400 font-bold">47 nearby</div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-white font-semibold">Available Now</span>
                          </div>
                          <div className="text-blue-400 font-bold">12 online</div>
                        </div>
                      </div>
                      
                      <div className="bg-green-500/20 rounded-2xl p-4 border border-green-400/30">
                        <div className="flex items-center gap-2 text-green-400 font-bold">
                          <Target className="w-4 h-4" />
                          <span>3 perfect matches found!</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">Get Instant Quotes</h4>
                      <p className="text-blue-200 text-sm">Connect with top professionals</p>
                    </div>
                    
                    {/* Results */}
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white/10 rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-colors duration-300">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#0056D2] to-blue-700 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                              {i}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-bold text-white">Elite Plumbing Services</div>
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-[#FDBD18] fill-current" />
                                  <span className="text-white font-bold">4.9</span>
                                </div>
                              </div>
                              <div className="text-blue-200 text-sm mb-2">Emergency specialist • 2 mins away</div>
                              <div className="flex items-center justify-between">
                                <div className="text-[#FDBD18] font-black text-lg">£180-250</div>
                                <div className="flex items-center gap-2">
                                  <MessageCircle className="w-4 h-4 text-green-400" />
                                  <span className="text-green-400 text-sm font-semibold">Available now</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="bg-[#FDBD18]/20 rounded-2xl p-4 border border-[#FDBD18]/30 text-center">
                        <div className="text-[#FDBD18] font-bold mb-2">🎉 All quotes received in 2 minutes!</div>
                        <Button className="bg-gradient-to-r from-[#FDBD18] to-yellow-400 hover:from-yellow-400 hover:to-[#FDBD18] text-[#0056D2] font-black px-6 py-2 rounded-xl">
                          Choose Your Tradesperson
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating stats */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 animate-bounce">
                <div className="text-center">
                  <div className="text-2xl font-black text-[#0056D2]">60s</div>
                  <div className="text-xs text-gray-600 font-bold">Average Time</div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-[#0056D2]">98% Success</div>
                    <div className="text-xs text-gray-600">Match Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Button
            onClick={() => document.getElementById('ai-quote-trigger')?.click()}
            className="bg-gradient-to-r from-[#FDBD18] to-yellow-400 hover:from-yellow-400 hover:to-[#FDBD18] text-[#0056D2] font-black px-8 py-4 rounded-2xl text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
          >
            <Sparkles className="w-5 h-5 mr-3" />
            <span>Try Our AI Matching Now</span>
            <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
          <p className="text-blue-200 text-sm mt-3">Free • No obligation • Results in 60 seconds</p>
        </div>
      </div>
    </section>
  );
};

export default AIExplainerSection;
