"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  Menu,
  X,
  ChevronDown,
  Search,
  Phone,
  Shield,
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
  Globe,
  HelpCircle,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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
    { href: "/find-tradespeople", label: "Find Tradespeople", icon: Search,      description: "Browse all 33 verified trades" },
    { href: "/how-it-works",      label: "How It Works",      icon: HelpCircle,  description: "Our verification process explained" },
    { href: "/for-tradespeople",  label: "For Tradespeople",  icon: Wrench,      description: "Grow your business with MyApproved" },
  ];

  return (
    <>
      {/* Single fixed stack: promo bar + main nav + trust row (avoids overlap and eases body offset) */}
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col shadow-xl">
      <header
        className="shrink-0 bg-[#0A2463] backdrop-blur-sm py-1 sm:py-2"
      >
        <div className="max-w-7xl mx-auto px-1 sm:px-2 lg:px-4">
          <div className="flex items-center justify-between">
            {/* Logo - Mobile Responsive */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group -ml-1 sm:-ml-2 whitespace-nowrap">
              {/* Logo Icon - Mobile Only */}
              <div className="w-12 h-12 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 md:hidden">
                <img 
                  src="/logo-icon.svg" 
                  alt="MyApproved Logo Icon"
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    // Fallback to Shield icon if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <Shield className="w-7 h-7 text-white hidden" />
              </div>
              {/* Logo Text/Image - Mobile Responsive */}
              <div className="flex items-center">
                <img 
                  src="/logo-text.svg" 
                  alt="MyApproved Logo"
                  className="h-9 sm:h-10 md:h-12 lg:h-14 xl:h-16 object-contain"
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
                  <div className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-[#F5B301] to-[#E8A900] bg-clip-text text-transparent tracking-wider">TRUSTED TRADESPEOPLE</div>
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
                    className={`group relative flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-300 font-medium text-sm hover:scale-105 ${
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
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#F5B301] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Language Translator */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-1.5 text-white hover:text-white transition-colors font-medium px-3 py-2 rounded-lg hover:bg-white/10 text-sm"
                  >
                    <div className="w-6 h-4 rounded-sm border border-gray-300 relative overflow-hidden bg-blue-800">
                      {/* Union Jack Pattern */}
                      {/* White diagonal lines (Saint Andrew's Cross) */}
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 16">
                        <defs>
                          <clipPath id="flag">
                            <rect width="24" height="16"/>
                          </clipPath>
                        </defs>
                        <rect width="24" height="16" fill="#012169"/>
                        {/* White diagonals */}
                        <path d="M0,0 L24,16 M24,0 L0,16" stroke="white" strokeWidth="2.5" clipPath="url(#flag)"/>
                        {/* Red diagonals (offset) */}
                        <path d="M0,0 L24,16" stroke="#C8102E" strokeWidth="1.5" strokeDasharray="0,2.5" strokeDashoffset="1.25" clipPath="url(#flag)"/>
                        <path d="M24,0 L0,16" stroke="#C8102E" strokeWidth="1.5" strokeDasharray="0,2.5" strokeDashoffset="1.25" clipPath="url(#flag)"/>
                        {/* White cross */}
                        <path d="M12,0 L12,16 M0,8 L24,8" stroke="white" strokeWidth="3" clipPath="url(#flag)"/>
                        {/* Red cross */}
                        <path d="M12,0 L12,16 M0,8 L24,8" stroke="#C8102E" strokeWidth="2" clipPath="url(#flag)"/>
                      </svg>
                    </div>
                    <span className="hidden xl:inline">English</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-52 bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl rounded-xl p-2">
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                    <div className="w-6 h-4 rounded-sm border border-gray-300 relative overflow-hidden bg-blue-800">
                      {/* Union Jack Pattern */}
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 16">
                        <defs>
                          <clipPath id="flag-dropdown">
                            <rect width="24" height="16"/>
                          </clipPath>
                        </defs>
                        <rect width="24" height="16" fill="#012169"/>
                        {/* White diagonals */}
                        <path d="M0,0 L24,16 M24,0 L0,16" stroke="white" strokeWidth="2.5" clipPath="url(#flag-dropdown)"/>
                        {/* Red diagonals (offset) */}
                        <path d="M0,0 L24,16" stroke="#C8102E" strokeWidth="1.5" strokeDasharray="0,2.5" strokeDashoffset="1.25" clipPath="url(#flag-dropdown)"/>
                        <path d="M24,0 L0,16" stroke="#C8102E" strokeWidth="1.5" strokeDasharray="0,2.5" strokeDashoffset="1.25" clipPath="url(#flag-dropdown)"/>
                        {/* White cross */}
                        <path d="M12,0 L12,16 M0,8 L24,8" stroke="white" strokeWidth="3" clipPath="url(#flag-dropdown)"/>
                        {/* Red cross */}
                        <path d="M12,0 L12,16 M0,8 L24,8" stroke="#C8102E" strokeWidth="2" clipPath="url(#flag-dropdown)"/>
                      </svg>
                    </div>
                    <span className="font-medium text-gray-700">English</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                    <div className="w-6 h-4 rounded-sm border border-gray-300 relative overflow-hidden">
                      <div className="absolute inset-0 bg-white"></div>
                      <div className="absolute bottom-0 w-full h-1/2 bg-red-600"></div>
                    </div>
                    <span className="font-medium text-gray-700">Polski</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                    <div className="w-6 h-4 rounded-sm border border-gray-300 relative overflow-hidden">
                      <div className="absolute inset-0 bg-green-600"></div>
                      <div className="absolute top-0 w-full h-1/2 bg-white"></div>
                    </div>
                    <span className="font-medium text-gray-700">اردو</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                    <div className="w-6 h-4 rounded-sm border border-gray-300 relative overflow-hidden">
                      <div className="absolute top-0 w-full h-1/3 bg-orange-500"></div>
                      <div className="absolute top-1/3 w-full h-1/3 bg-white"></div>
                      <div className="absolute bottom-0 w-full h-1/3 bg-green-600"></div>
                    </div>
                    <span className="font-medium text-gray-700">हिन्दी</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                    <div className="w-6 h-4 rounded-sm border border-gray-300 relative overflow-hidden">
                      <div className="absolute inset-0 bg-green-600"></div>
                      <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-red-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                    <span className="font-medium text-gray-700">বাংলা</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                    <div className="w-6 h-4 rounded-sm border border-gray-300 relative overflow-hidden">
                      <div className="absolute left-0 w-1/3 h-full bg-blue-600"></div>
                      <div className="absolute left-1/3 w-1/3 h-full bg-white"></div>
                      <div className="absolute right-0 w-1/3 h-full bg-red-600"></div>
                    </div>
                    <span className="font-medium text-gray-700">Français</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                    <div className="w-6 h-4 rounded-sm border border-gray-300 relative overflow-hidden">
                      <div className="absolute top-0 w-full h-1/3 bg-black"></div>
                      <div className="absolute top-1/3 w-full h-1/3 bg-red-600"></div>
                      <div className="absolute bottom-0 w-full h-1/3 bg-yellow-400"></div>
                    </div>
                    <span className="font-medium text-gray-700">Deutsch</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                    <div className="w-6 h-4 rounded-sm border border-gray-300 relative overflow-hidden">
                      <div className="absolute top-0 w-full h-1/4 bg-red-600"></div>
                      <div className="absolute top-1/4 w-full h-1/2 bg-yellow-400"></div>
                      <div className="absolute bottom-0 w-full h-1/4 bg-red-600"></div>
                    </div>
                    <span className="font-medium text-gray-700">Español</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                    <div className="w-6 h-4 rounded-sm border border-gray-300 relative overflow-hidden">
                      <div className="absolute left-0 w-1/3 h-full bg-green-600"></div>
                      <div className="absolute left-1/3 w-1/3 h-full bg-white"></div>
                      <div className="absolute right-0 w-1/3 h-full bg-red-600"></div>
                    </div>
                    <span className="font-medium text-gray-700">Italiano</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                    <div className="w-6 h-4 rounded-sm border border-gray-300 relative overflow-hidden">
                      <div className="absolute top-0 w-full h-1/3 bg-blue-600"></div>
                      <div className="absolute top-1/3 w-full h-1/3 bg-yellow-400"></div>
                      <div className="absolute bottom-0 w-full h-1/3 bg-red-600"></div>
                    </div>
                    <span className="font-medium text-gray-700">Română</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                    <div className="w-6 h-4 rounded-sm border border-gray-300 relative overflow-hidden bg-green-600">
                      {/* Jamaican Flag Pattern */}
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 16">
                        <defs>
                          <clipPath id="jamaica-flag">
                            <rect width="24" height="16"/>
                          </clipPath>
                        </defs>
                        {/* Green background */}
                        <rect width="24" height="16" fill="#009639"/>
                        {/* Yellow diagonal cross */}
                        <path d="M0,0 L24,16 M24,0 L0,16" stroke="#FED100" strokeWidth="2" clipPath="url(#jamaica-flag)"/>
                        {/* Black triangles */}
                        <polygon points="0,0 12,8 0,16" fill="#000000" clipPath="url(#jamaica-flag)"/>
                        <polygon points="24,0 12,8 24,16" fill="#000000" clipPath="url(#jamaica-flag)"/>
                      </svg>
                    </div>
                    <span className="font-medium text-gray-700">Jamaican Patois</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <div className="flex flex-col items-center">
                <Button
                  className="bg-[#F5B301] hover:bg-[#E8A900] text-black font-bold px-5 py-2 rounded-lg shadow-md hover:shadow-lg transition-all border-2 border-[#F5B301]"
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
              className="lg:hidden p-2 sm:p-3 rounded-lg hover:bg-white/10 transition-colors duration-200 text-white"
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
        <div className="bg-[#0A2463] backdrop-blur-sm py-1.5 sm:py-2 shadow-lg">
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
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-blue-900 to-blue-800">
                <div className="flex items-center gap-4 sm:gap-5">
                  {/* Mobile Logo Icon */}
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl flex items-center justify-center overflow-hidden">
                    <img 
                      src="/logo-icon.svg" 
                      alt="MyApproved Logo Icon"
                      className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                      onError={(e) => {
                        // Fallback to Shield icon if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-white hidden" />
                  </div>
                  {/* Mobile Logo Text */}
                  <div>
                    <img 
                      src="/logo-text.svg" 
                      alt="MyApproved Logo"
                      className="h-16 sm:h-18 object-contain"
                      onError={(e) => {
                        // Fallback to text if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden flex flex-col">
                      <div className="font-bold text-white text-2xl sm:text-3xl">MyApproved</div>
                      <div className="text-base sm:text-lg text-yellow-300 font-semibold tracking-wide uppercase">Trusted Tradespeople</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors text-white"
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
                          className="w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 hover:bg-gray-50 text-gray-700 hover:text-blue-600 border border-transparent"
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
                            ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100'
                            : 'hover:bg-gray-50 text-gray-700 hover:text-blue-600 border border-transparent'
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
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Account Access</h3>
                  <Link
                    href="/login/client"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium text-sm">Customer Login</span>
                  </Link>
                  <Link
                    href="/login/trade"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <Wrench className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium text-sm">Tradesperson Login</span>
                  </Link>
                </div>

                {/* Sign Up Options */}
                <div className="mt-6 space-y-2">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Create Account</h3>
                  <Link
                    href="/register/client"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium text-sm">Register as Customer</span>
                  </Link>
                  <Link
                    href="/register/tradesperson"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <Wrench className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium text-sm">Register as Tradesperson</span>
                  </Link>
                </div>

                {/* Contact */}
                <div className="mt-6 p-3 bg-gradient-to-r from-blue-50 to-yellow-50 rounded-xl border border-blue-100">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">Need Help?</h3>
                  <Link
                    href="tel:08001234567"
                    className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors text-sm"
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
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
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