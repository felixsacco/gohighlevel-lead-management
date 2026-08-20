"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  Menu,
  X,
  Search,
  Phone,
  Star,
  Users,
  Zap,
  ArrowRight,
  Clock,
  Award,
  CheckCircle,
  User,
  Wrench,
  Building2,
  HelpCircle,
} from 'lucide-react';
import { Button } from "@/components/ui/button";

const EnhancedHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navigationItems = [
    { href: "/find-tradespeople", label: "Find Tradespeople", icon: Search,      description: <span className="notranslate">Browse all 33 verified trades</span> },
    { href: "/how-it-works",      label: "How It Works",      icon: HelpCircle,  description: "Our verification process explained" },
    { href: "/for-tradespeople",  label: "For Tradespeople",  icon: Wrench,      description: "Grow your business with MyApproved" },
  ];

  return (
    <>
      {/* Single fixed stack: promo bar + main nav + trust row (avoids overlap and eases body offset) */}
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col shadow-xl">
      <header
        className="shrink-0 bg-brand-navyDark backdrop-blur-sm py-1 sm:py-2"
      >
        <div className="max-w-7xl mx-auto px-1 sm:px-2 lg:px-4">
          <div className="flex items-center justify-between">
            {/* Logo - Mobile Responsive */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group -ml-1 sm:-ml-2 whitespace-nowrap">
              {/* Logo Lockup */}
              <div className="flex items-center">
                <img
                  src="/logo-text.svg"
                  alt="MyApproved Logo"
                  className="h-9 sm:h-10 md:h-12 lg:h-14 xl:h-16 w-auto object-contain"
                  onError={(e) => {
                    // Fallback to text if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden flex flex-col">
                  <div className="text-sm sm:text-lg md:text-xl lg:text-2xl font-extrabold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    MyApproved
                  </div>
                  <div className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-brand-amber to-brand-amber bg-clip-text text-transparent tracking-wider">TRUSTED TRADESPEOPLE</div>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-0.5">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = pathname === item.href;
                
                // Regular link handling for all navigation items including Instant Quote
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 font-medium text-sm hover:scale-105 ${
                      isActive
                        ? 'bg-white/10 text-white shadow-lg backdrop-blur-md'
                        : 'text-blue-100 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={(e) => {
                      console.log(`Navigating to: ${item.href}`);
                      // Force navigation if Next.js Link fails
                      setTimeout(() => {
                        if (window.location.pathname === pathname) {
                          window.location.href = item.href;
                        }
                      }, 100);
                    }}
                  >
                    <IconComponent className="w-3 h-3" />
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-brand-amber rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="flex flex-col items-center">
                <Button
                  className="bg-brand-amber hover:bg-brand-amber text-black font-bold px-5 py-2 rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-brand-amber"
                  style={{fontWeight: 800}}
                  onClick={() => window.dispatchEvent(new Event("open-ai-quote"))}
                >
                  Get Quotes
                </Button>
                <span className="mt-1 text-[11px] leading-tight text-gray-200 whitespace-nowrap">Free &amp; no obligation</span>
              </div>
            </div>

            {/* Mobile Menu Button - Mobile Responsive */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 sm:p-3 rounded-xl hover:bg-white/10 transition-colors duration-200 text-white"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* Trust Bar - Simple Text */}
        <div className="bg-brand-navyDark backdrop-blur-sm py-1.5 sm:py-2 shadow-lg">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
            <p className="text-center text-xs sm:text-sm text-gray-300">
              Free Quotes • No Obligation • Local Pros
            </p>
          </div>
        </div>

      </header>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[9999] lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu Panel - Mobile Responsive */}
              <div className="fixed top-0 right-0 h-full w-full max-w-xs sm:max-w-sm bg-white shadow-2xl border-l border-gray-100 transform transition-transform duration-300 ease-in-out z-[10000]">
            <div className="flex flex-col h-full">
              {/* Header - Mobile Responsive */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 bg-brand-navyDark">
                <div className="flex items-center gap-4 sm:gap-5">
                  {/* Mobile Logo Lockup */}
                  <div>
                    <img
                      src="/logo-text.svg"
                      alt="MyApproved Logo"
                      className="h-12 sm:h-14 w-auto object-contain"
                      onError={(e) => {
                        // Fallback to text if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden flex flex-col">
                      <div className="font-bold text-white text-2xl sm:text-3xl">MyApproved</div>
                      <div className="text-base sm:text-lg text-brand-amber font-semibold tracking-wide uppercase">Trusted Tradespeople</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/20 transition-colors text-white"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Navigation - Mobile Responsive */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                <div className="space-y-2">
                  {navigationItems.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = pathname === item.href;
                    
                    // Special handling for Instant Quote to trigger dialog
                    if (item.label === 'Instant Quote') {
                      return (
                        <button
                          key={item.href}
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setTimeout(() => {
                              document.getElementById('ai-quote-trigger')?.click();
                            }, 100);
                          }}
                          className="w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 hover:bg-gray-50 text-gray-700 hover:text-brand-navy border border-transparent"
                        >
                          <IconComponent className="w-5 h-5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-left text-base">{item.label}</div>
                            <div className="text-sm text-gray-500 text-left">{item.description}</div>
                          </div>
                        </button>
                      );
                    }
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={(e) => {
                          console.log(`Mobile navigating to: ${item.href}`);
                          setIsMobileMenuOpen(false);
                          // Force navigation if Next.js Link fails
                          setTimeout(() => {
                            if (window.location.pathname === pathname) {
                              window.location.href = item.href;
                            }
                          }, 100);
                        }}
                        className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-50 text-brand-navy shadow-sm border border-blue-100'
                            : 'hover:bg-gray-50 text-gray-700 hover:text-brand-navy border border-transparent'
                        }`}
                      >
                        <IconComponent className="w-5 h-5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-base">{item.label}</div>
                          <div className="text-sm text-gray-500">{item.description}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Login Options */}
                <div className="mt-6 space-y-2">
                  <h3 className="font-extrabold text-brand-navy mb-3 text-sm">Account Access</h3>
                  <Link
                    href="/login/client"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-brand-navy transition-colors"
                  >
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium text-sm">Customer Login</span>
                  </Link>
                  <Link
                    href="/login/trade"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-brand-navy transition-colors"
                  >
                    <Wrench className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium text-sm">Tradesperson Login</span>
                  </Link>
                </div>

                {/* Sign Up Options */}
                <div className="mt-6 space-y-2">
                  <h3 className="font-extrabold text-brand-navy mb-3 text-sm">Create Account</h3>
                  <Link
                    href="/register/client"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-brand-navy transition-colors"
                  >
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium text-sm">Register as Customer</span>
                  </Link>
                  <Link
                    href="/register/tradesperson"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-brand-navy transition-colors"
                  >
                    <Wrench className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium text-sm">Register as Tradesperson</span>
                  </Link>
                </div>

                {/* Contact */}
                <div className="mt-6 p-3 bg-gradient-to-r from-blue-50 to-yellow-50 rounded-xl border border-blue-100">
                  <h3 className="font-extrabold text-brand-navy mb-2 text-sm">Need Help?</h3>
                  <Link
                    href="tel:08001234567"
                    className="flex items-center gap-2 text-brand-navy font-semibold hover:text-brand-navyDark transition-colors text-sm"
                  >
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>0800 123 4567</span>
                  </Link>
                  <div className="text-xs text-gray-600 mt-1">Available 24/7</div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                <Button
                  asChild
                  className="w-full bg-brand-amber hover:bg-brand-amber text-gray-900 font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Link href="/instant-quote" onClick={() => setIsMobileMenuOpen(false)}>
                    <span>Get Free Quote</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}


    </>
  );
};

export default EnhancedHeader;