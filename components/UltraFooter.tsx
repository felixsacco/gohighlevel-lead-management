"use client";

import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  Star,
  Shield,
  Award,
  Users,
  ChevronRight,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Apple,
  Smartphone,
  CreditCard,
  Lock,
  CheckCircle,
  Clock,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';

const UltraFooter = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'For Customers',
      links: [
        { name: 'Find Tradespeople', href: '/find-tradespeople', popular: true },
        { name: 'Get Instant Quote', href: '/instant-quote', popular: true },
        { name: 'How It Works', href: '/how-it-works' },
        { name: 'Emergency Services', href: '/emergency' },
        { name: 'Price Guide', href: '/pricing-guide' },
        { name: 'Customer Reviews', href: '/find-tradespeople' },
        { name: 'Help & Support', href: '/help' }
      ]
    },
    {
      title: 'For Tradespeople',
      links: [
        { name: 'Join MyApproved', href: '/register/tradesperson', popular: true },
        { name: 'Tradesperson Login', href: '/login/tradesperson' },
        { name: 'Lead Generation', href: '/leads' },
        { name: 'Success Stories', href: '/success-stories' },
        { name: 'Training & Resources', href: '/training' },
        { name: 'Pricing Plans', href: '/tradesperson-pricing' },
        { name: 'Partner Program', href: '/partners' }
      ]
    },
    {
      title: 'Trade Categories',
      links: [
        { name: 'Plumbers', href: '/find-tradespeople?trade=plumber' },
        { name: 'Electricians', href: '/find-tradespeople?trade=electrician' },
        { name: 'Builders', href: '/find-tradespeople?trade=builder' },
        { name: 'Painters & Decorators', href: '/find-tradespeople?trade=painter' },
        { name: 'Roofers', href: '/find-tradespeople?trade=roofer' },
        { name: 'Gardeners & Landscapers', href: '/find-tradespeople?trade=gardener' },
        { name: 'View All Trades', href: '/trades', popular: true }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About MyApproved', href: '/about' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'Careers', href: '/careers' },
        { name: 'Press & Media', href: '/press' },
        { name: 'Blog & Insights', href: '/blog' },
        { name: 'Investor Relations', href: '/investors' },
        { name: 'Affiliate Program', href: '/affiliates' }
      ]
    }
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: process.env.NEXT_PUBLIC_FACEBOOK_URL, color: 'hover:bg-blue-600' },
    { name: 'Twitter', icon: Twitter, href: process.env.NEXT_PUBLIC_TWITTER_URL, color: 'hover:bg-sky-500' },
    { name: 'Instagram', icon: Instagram, href: process.env.NEXT_PUBLIC_INSTAGRAM_URL, color: 'hover:bg-pink-600' },
    { name: 'LinkedIn', icon: Linkedin, href: process.env.NEXT_PUBLIC_LINKEDIN_URL, color: 'hover:bg-blue-700' },
    { name: 'YouTube', icon: Youtube, href: process.env.NEXT_PUBLIC_YOUTUBE_URL, color: 'hover:bg-red-600' }
  ].filter(link => link.href);

  const trustBadges = [
    { name: 'Identity Vetted', rating: 'ID Checked', reviews: 'Official Records', color: 'text-green-400' },
    { name: 'Public Liability', rating: '£2M Cover', reviews: 'Confirmed Active', color: 'text-blue-400' },
    { name: 'Qualifications', rating: 'Certified', reviews: 'Official Registers', color: 'text-[#FDBD18]' },
    { name: 'Homeowners', rating: 'Free Use', reviews: 'No hidden fees', color: 'text-orange-400' }
  ];

  const paymentMethods = [
    { name: 'Visa', logo: '💳' },
    { name: 'Mastercard', logo: '💳' },
    { name: 'PayPal', logo: '🅿️' },
    { name: 'Apple Pay', logo: '🍎' },
    { name: 'Google Pay', logo: '🔵' }
  ];

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-[#0056D2] to-blue-900 text-white overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#FDBD18]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/5 to-transparent rounded-full blur-3xl animate-spin" style={{animationDuration: '30s'}}></div>
      </div>

      <div className="relative">
        {/* Main footer content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Brand section */}
            <div className="lg:col-span-4 space-y-8">
              {/* Logo and tagline */}
              <div>
                <Link href="/" className="inline-flex items-center gap-4 group mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#FDBD18] to-yellow-400 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-9 h-9 text-[#0056D2]" />
                  </div>
                  <div>
                    <div className="text-3xl font-black text-white">MyApproved</div>
                    <div className="text-lg text-blue-200 font-semibold">Trusted Tradespeople</div>
                  </div>
                </Link>
                
                <p className="text-blue-100 leading-relaxed text-lg max-w-md">
                  The UK's most trusted platform for finding verified, insured tradespeople. 
                  Connect with quality professionals and get the job done right, every time.
                </p>
              </div>

              {/* Trust statistics */}
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
                <h4 className="font-black text-white text-lg mb-4">Trusted by Thousands</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-black text-[#FDBD18]">50,000+</div>
                    <div className="text-sm text-blue-200">Happy Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-[#FDBD18]">10,000+</div>
                    <div className="text-sm text-blue-200">Verified Trades</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-[#FDBD18]">4.9★</div>
                    <div className="text-sm text-blue-200">Average Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-[#FDBD18]">98%</div>
                    <div className="text-sm text-blue-200">Success Rate</div>
                  </div>
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-4">
                <h4 className="font-black text-white text-lg">Get in Touch</h4>
                <div className="space-y-3">
                  <Link href="tel:08001234567" className="flex items-center gap-4 text-blue-200 hover:text-[#FDBD18] transition-colors duration-300 group">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-[#FDBD18]/20 transition-colors duration-300">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-white">0800 123 4567</div>
                      <div className="text-sm">24/7 Customer Support</div>
                    </div>
                  </Link>
                  
                  <Link href="mailto:hello@myapproved.com" className="flex items-center gap-4 text-blue-200 hover:text-[#FDBD18] transition-colors duration-300 group">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-[#FDBD18]/20 transition-colors duration-300">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-white">hello@myapproved.com</div>
                      <div className="text-sm">General Enquiries</div>
                    </div>
                  </Link>
                  
                  <div className="flex items-center gap-4 text-blue-200">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-white">London, United Kingdom</div>
                      <div className="text-sm">Serving all of the UK</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation sections */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {footerSections.map((section, i) => (
                  <div key={i} className="space-y-6">
                    <h3 className="font-black text-white text-xl">{section.title}</h3>
                    <ul className="space-y-3">
                      {section.links.map((link, j) => (
                        <li key={j}>
                          {link.href === '#' ? (
                            <button
                              className="text-blue-200 hover:text-[#FDBD18] transition-colors duration-300 text-base group flex items-center gap-2"
                            >
                              <span className="font-semibold">{link.name}</span>
                              {link.popular && (
                                <span className="bg-[#FDBD18] text-[#0056D2] text-xs font-black px-2 py-1 rounded-full">HOT</span>
                              )}
                              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                            </button>
                          ) : (
                            <Link
                              href={link.href}
                              className="text-blue-200 hover:text-[#FDBD18] transition-colors duration-300 text-base group flex items-center gap-2"
                            >
                              <span className="font-semibold">{link.name}</span>
                              {link.popular && (
                                <span className="bg-[#FDBD18] text-[#0056D2] text-xs font-black px-2 py-1 rounded-full">HOT</span>
                              )}
                              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* App download section */}
        <div className="border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left">
                <h3 className="font-black text-white text-2xl mb-3">Download Our Mobile App</h3>
                <p className="text-blue-200 text-lg">Get instant quotes and manage jobs on the go. Available on iOS and Android.</p>
                <div className="flex items-center gap-4 mt-4 text-sm text-blue-200">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#FDBD18]" />
                    <span>4.9★ App Store Rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-400" />
                    <span>100k+ Downloads</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Link
                  href="#"
                  className="group flex items-center gap-4 bg-black hover:bg-gray-900 rounded-3xl px-6 py-4 transition-all duration-300 hover:scale-105 shadow-xl"
                >
                  <Apple className="w-10 h-10 text-white" />
                  <div className="text-left">
                    <div className="text-xs text-gray-400">Download on the</div>
                    <div className="text-lg font-bold text-white">App Store</div>
                  </div>
                </Link>
                
                <Link
                  href="#"
                  className="group flex items-center gap-4 bg-black hover:bg-gray-900 rounded-3xl px-6 py-4 transition-all duration-300 hover:scale-105 shadow-xl"
                >
                  <Smartphone className="w-10 h-10 text-white" />
                  <div className="text-left">
                    <div className="text-xs text-gray-400">Get it on</div>
                    <div className="text-lg font-bold text-white">Google Play</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Trust badges and social */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Trust badges */}
            <div className="mb-12">
              <h4 className="font-black text-white text-xl text-center mb-8">Trusted & Verified</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {trustBadges.map((badge, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:bg-white/15 transition-colors duration-300">
                    <div className={`text-2xl font-black ${badge.color} mb-2`}>{badge.rating}</div>
                    <div className="text-white font-bold text-sm">{badge.name}</div>
                    <div className="text-blue-200 text-xs">{badge.reviews}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social and payment */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Social links */}
              <div className="flex items-center gap-2">
                <span className="text-blue-200 font-bold mr-4">Follow us:</span>
                {socialLinks.map((social, i) => {
                  const IconComponent = social.icon;
                  return (
                    <Link
                      key={i}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-12 h-12 bg-white/10 hover:bg-white/20 ${social.color} rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 text-white border border-white/20`}
                      aria-label={social.name}
                    >
                      <IconComponent className="w-6 h-6" />
                    </Link>
                  );
                })}
              </div>

              {/* Payment methods */}
              <div className="flex items-center gap-4">
                <span className="text-blue-200 font-bold">We accept:</span>
                <div className="flex items-center gap-2">
                  {paymentMethods.map((method, i) => (
                    <div key={i} className="w-12 h-8 bg-white rounded-lg flex items-center justify-center text-lg shadow-lg">
                      {method.logo}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-white/10 bg-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Legal links */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-blue-200">
                <Link href="/privacy" className="hover:text-[#FDBD18] transition-colors duration-300 font-semibold">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-[#FDBD18] transition-colors duration-300 font-semibold">
                  Terms of Service
                </Link>
                <Link href="/cookies" className="hover:text-[#FDBD18] transition-colors duration-300 font-semibold">
                  Cookie Policy
                </Link>
                <Link href="/accessibility" className="hover:text-[#FDBD18] transition-colors duration-300 font-semibold">
                  Accessibility
                </Link>
                <Link href="/sitemap" className="hover:text-[#FDBD18] transition-colors duration-300 font-semibold">
                  Sitemap
                </Link>
              </div>

              {/* Certifications */}
              <div className="flex items-center gap-4 text-xs text-blue-300">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#FDBD18]" />
                  <span className="font-semibold">FCA Regulated</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#FDBD18]" />
                  <span className="font-semibold">SSL Secured</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#FDBD18]" />
                  <span className="font-semibold">ISO 27001</span>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="mt-8 pt-8 border-t border-white/10 text-center">
              <p className="text-blue-200 text-base">
                © {currentYear} MyApproved Ltd. All rights reserved. 
                <span className="mx-3">•</span>
                Registered in England & Wales (Company No. 12345678)
                <span className="mx-3">•</span>
                VAT Registration No. GB123456789
              </p>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm text-blue-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>GDPR Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>Data Protected</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#FDBD18]" />
                  <span>Industry Leading</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default UltraFooter;
