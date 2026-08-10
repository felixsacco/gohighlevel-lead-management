"use client";

import React, { useState, useEffect } from 'react';
import {
  Search,
  Phone,
  MessageCircle,
  Star,
  ChevronUp,
  X,
  Zap,
  Shield,
  Clock,
} from 'lucide-react';
import { Button } from "@/components/ui/button";

const MobileStickyFooter = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky footer after scrolling 200px
      setIsVisible(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Only show on mobile devices
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (!isMobile || !isVisible) return null;

  return (
    <>
      {/* Backdrop when expanded */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Sticky Footer */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 md:hidden transition-all duration-300 ${
        isExpanded ? 'bg-white shadow-2xl' : 'bg-white/95 backdrop-blur-sm shadow-xl'
      }`}>
        {/* Expanded Content */}
        {isExpanded && (
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-[#0056D2]">Get Started Now</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-xs font-bold text-gray-700">All Verified</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-xs font-bold text-gray-700">3min Response</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Star className="w-6 h-6 text-[#FDBD18]" />
                </div>
                <div className="text-xs font-bold text-gray-700">4.9★ Rating</div>
              </div>
            </div>

            {/* Main CTA */}
            <Button
              onClick={() => {
                setIsExpanded(false);
                document.getElementById('ai-quote-trigger')?.click();
              }}
              className="w-full bg-gradient-to-r from-[#FDBD18] to-yellow-400 hover:from-yellow-400 hover:to-[#FDBD18] text-[#0056D2] font-black py-4 rounded-2xl text-lg shadow-lg mb-3"
            >
              <Zap className="w-5 h-5 mr-2" />
              <span>Get Instant Quote</span>
            </Button>

            {/* Secondary actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => {
                  setIsExpanded(false);
                  window.location.href = '/find-tradespeople';
                }}
                className="bg-[#0056D2] hover:bg-blue-700 text-white font-bold py-3 rounded-xl"
              >
                <Search className="w-4 h-4 mr-2" />
                <span>Browse</span>
              </Button>
              <Button
                onClick={() => {
                  setIsExpanded(false);
                  window.location.href = 'tel:08001234567';
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl"
              >
                <Phone className="w-4 h-4 mr-2" />
                <span>Call Now</span>
              </Button>
            </div>

            <div className="text-center mt-3 text-xs text-gray-500">
              Free • No obligation • Takes 60 seconds
            </div>
          </div>
        )}

        {/* Main Footer Bar */}
        <div className="flex items-center justify-between p-4">
          {/* Left: Quick actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => document.getElementById('ai-quote-trigger')?.click()}
              className="flex items-center gap-2 bg-gradient-to-r from-[#FDBD18] to-yellow-400 text-[#0056D2] font-black px-4 py-2 rounded-xl shadow-lg"
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm">Quote</span>
            </button>
            
            <a
              href="tel:08001234567"
              className="flex items-center gap-2 bg-green-600 text-white font-bold px-4 py-2 rounded-xl shadow-lg"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm">Call</span>
            </a>
          </div>

          {/* Center: Live indicator */}
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-bold text-gray-700">2,847 jobs today</span>
          </div>

          {/* Right: Expand button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-10 h-10 bg-[#0056D2] text-white rounded-full flex items-center justify-center shadow-lg"
          >
            <ChevronUp className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Bottom safe area for devices with home indicators */}
        <div className="h-safe-area-inset-bottom bg-white"></div>
      </div>
    </>
  );
};

export default MobileStickyFooter;
