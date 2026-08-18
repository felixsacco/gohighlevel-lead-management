"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, Facebook, Instagram, Linkedin, Phone } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";

const ICO_REGISTRATION_NUMBER = "ZA000000"; // Placeholder — drop in the real ICO number once registration completes.
const SUPPORT_PHONE_NUMBER = "0800 000 0000"; // Placeholder — drop in the real support phone number once available.
const TRADING_NAME = "MyApproved"; // Drop in the registered trading name.
const REGISTERED_NAME = ""; // Drop in the registered company name.
const REGISTERED_ADDRESS = ""; // Drop in the registered business address.

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/crm/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
        setMessage("You're in. Your monthly checklist is on its way.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Find a tradesperson", href: "/find-tradespeople" },
    { name: "How it works", href: "/how-it-works" },
    { name: "Customer reviews", href: "/find-tradespeople" },
    { name: "Help centre", href: "/help" },
  ];

  const findTradespeople = [
    { name: "Plumbers in Birmingham", href: "/find-tradespeople/plumber/birmingham" },
    { name: "Electricians in Manchester", href: "/find-tradespeople/electrician/manchester" },
    { name: "Roofers in Leeds", href: "/find-tradespeople/roofer/leeds" },
    { name: "Builders in Liverpool", href: "/find-tradespeople/builder/liverpool" },
    { name: "Painters in Bristol", href: "/find-tradespeople/painter-decorator/bristol" },
    { name: "Locksmiths in Sheffield", href: "/find-tradespeople/locksmith/sheffield" },
    { name: "Gas Engineers in Nottingham", href: "/find-tradespeople/gas-engineer/nottingham" },
    { name: "Carpenters in Newcastle", href: "/find-tradespeople/carpenter/newcastle" },
  ];

  const companyLinks = [
    { name: "About us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Privacy policy", href: "/privacy" },
    { name: "Terms of service", href: "/terms" },
    { name: "Sitemap", href: "/sitemap.xml" },
  ];

  return (
    <Section as="footer" className="py-16 bg-[#0A2463] text-white">
      <Container size="wide">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand & Description */}
          <div className="space-y-8">
            {/* Block 1 — Logo + strapline + email signup */}
            <div className="space-y-4">
              <img
                src="/logo-text.svg"
                alt="MyApproved"
                className="h-10 sm:h-12 md:h-14 w-auto object-contain flex-shrink-0"
              />
              <p className="text-blue-100 leading-relaxed text-sm sm:text-base">
                The jobs your house quietly needs before the weather turns.
              </p>
              <form onSubmit={handleSubscribe} className="space-y-2 pt-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm text-[#0A2463] placeholder-blue-400 focus:border-[#FFB800] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full rounded-xl bg-[#FFB800] px-4 py-2.5 text-sm font-bold text-[#0A2463] transition-colors hover:bg-[#FFB800] disabled:opacity-60"
                >
                  {status === "loading" ? "Sending…" : "Send me the checklist"}
                </button>
              </form>
              {message && (
                <p
                  className={`text-xs ${status === "success" ? "text-blue-200" : "text-red-400"}`}
                >
                  {message}
                </p>
              )}
              <p className="text-xs text-blue-300/70 leading-relaxed">
                Just the jobs worth doing. Once a month, no noise.
              </p>
            </div>

            {/* Block 2 — Contact details */}
            <div className="space-y-2">
              <p className="text-blue-100 flex items-center gap-2 text-sm sm:text-base">
                <Mail className="w-4 h-4 text-[#FFB800]" />
                support@myapproved.com
              </p>
              <p className="text-blue-300 flex items-center gap-2 text-xs">
                <Phone className="w-3.5 h-3.5 text-blue-300" />
                {SUPPORT_PHONE_NUMBER}
              </p>
            </div>

            {/* Block 3 — Legitimacy: ICO line + Google reviews */}
            <div className="space-y-2 text-xs text-blue-300">
              <p className="flex items-center gap-2 notranslate">
                <svg viewBox="0 0 24 24" className="h-4 w-4 inline-block flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                ICO registration number {ICO_REGISTRATION_NUMBER}
              </p>
              <p className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-4 w-4 inline-block flex-shrink-0" aria-hidden="true">
                  <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45c-.28 1.5-1.13 2.77-2.4 3.62l3.86 2.99c2.26-2.09 3.59-5.16 3.59-8.8z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.86-2.99c-1.07.72-2.44 1.14-4.08 1.14-3.14 0-5.8-2.12-6.75-4.97l-3.98 3.08C3.35 20.87 7.31 24 12 24z" />
                  <path fill="#FBBC05" d="M5.25 14.27c-.24-.72-.38-1.48-.38-2.27s.14-1.55.38-2.27l-3.98-3.08C.46 8.13 0 9.99 0 12s.46 3.87 1.27 5.35l3.98-3.08z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.96 1.08 15.24 0 12 0 7.31 0 3.35 3.13 1.27 7.35l3.98 3.08C6.2 6.87 8.86 4.75 12 4.75z" />
                </svg>
                Reviews via Google
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-[#FFB800] mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-blue-100 hover:text-[#FFB800] transition-colors duration-200 flex items-center group"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#FFB800] mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Find Tradespeople */}
          <div>
            <h3 className="text-lg font-semibold text-[#FFB800] mb-5">Find Tradespeople</h3>
            <ul className="space-y-3">
              {findTradespeople.map((location) => (
                <li key={location.name}>
                  <Link 
                    href={location.href}
                    className="text-blue-100 hover:text-[#FFB800] transition-colors duration-200 flex items-center group"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#FFB800] mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {location.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link 
              href="/locations" 
              className="inline-flex items-center gap-1 text-[#FFB800] hover:text-[#FFB800] mt-4 text-sm font-medium"
            >
              View all locations
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold text-[#FFB800] mb-5">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-blue-100 hover:text-[#FFB800] transition-colors duration-200 flex items-center group"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#FFB800] mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#0A2463] pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright + business details */}
            <div className="text-center md:text-left">
              <p className="text-sm text-blue-300">
                &copy; {currentYear} MyApproved. All rights reserved.
              </p>
              {(REGISTERED_NAME || REGISTERED_ADDRESS) && (
                <p className="text-xs text-blue-300 mt-1">
                  {REGISTERED_NAME}, trading as {TRADING_NAME}. Registered address: {REGISTERED_ADDRESS}.
                </p>
              )}
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center gap-4">
              {process.env.NEXT_PUBLIC_FACEBOOK_URL && (
                <a
                  href={process.env.NEXT_PUBLIC_FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#0A2463]/50 flex items-center justify-center text-blue-100 hover:bg-[#FFB800] hover:text-[#0A2463] transition-all duration-200"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {process.env.NEXT_PUBLIC_INSTAGRAM_URL && (
                <a
                  href={process.env.NEXT_PUBLIC_INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#0A2463]/50 flex items-center justify-center text-blue-100 hover:bg-[#FFB800] hover:text-[#0A2463] transition-all duration-200"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {process.env.NEXT_PUBLIC_LINKEDIN_URL && (
                <a
                  href={process.env.NEXT_PUBLIC_LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#0A2463]/50 flex items-center justify-center text-blue-100 hover:bg-[#FFB800] hover:text-[#0A2463] transition-all duration-200"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {process.env.NEXT_PUBLIC_TIKTOK_URL && (
                <a
                  href={process.env.NEXT_PUBLIC_TIKTOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#0A2463]/50 flex items-center justify-center text-blue-100 hover:bg-[#FFB800] hover:text-[#0A2463] transition-all duration-200"
                  aria-label="TikTok"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.3 0 .58.05.85.13V9.4a6.33 6.33 0 0 0-.85-.06 6.34 6.34 0 1 0 6.34 6.34V8.58a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.01z"/>
                  </svg>
                </a>
              )}
              {process.env.NEXT_PUBLIC_GOOGLE_BUSINESS_PROFILE_URL && (
                <a
                  href={process.env.NEXT_PUBLIC_GOOGLE_BUSINESS_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#0A2463]/50 flex items-center justify-center text-blue-100 hover:bg-[#FFB800] hover:text-[#0A2463] transition-all duration-200"
                  aria-label="Google Business Profile"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                    <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45c-.28 1.5-1.13 2.77-2.4 3.62l3.86 2.99c2.26-2.09 3.59-5.16 3.59-8.8z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.86-2.99c-1.07.72-2.44 1.14-4.08 1.14-3.14 0-5.8-2.12-6.75-4.97l-3.98 3.08C3.35 20.87 7.31 24 12 24z" />
                    <path fill="#FBBC05" d="M5.25 14.27c-.24-.72-.38-1.48-.38-2.27s.14-1.55.38-2.27l-3.98-3.08C.46 8.13 0 9.99 0 12s.46 3.87 1.27 5.35l3.98-3.08z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.96 1.08 15.24 0 12 0 7.31 0 3.35 3.13 1.27 7.35l3.98 3.08C6.2 6.87 8.86 4.75 12 4.75z" />
                  </svg>
                </a>
              )}
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-blue-400">
              <Link href="/privacy" className="hover:text-[#FFB800] transition-colors">Privacy Policy</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-[#FFB800] transition-colors">Terms of Service</Link>
              <span>•</span>
              <Link href="/cookies" className="hover:text-[#FFB800] transition-colors">Cookie Policy</Link>
              <span>•</span>
              <Link href="/sitemap" className="hover:text-[#FFB800] transition-colors">Sitemap</Link>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default Footer;
