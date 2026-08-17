import React from "react";
import Link from "next/link";
import { Mail, ArrowRight, Facebook, Instagram, Linkedin } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";

const Footer = () => {
  const currentYear = new Date().getFullYear();

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
    <Section as="footer" className="py-16 bg-gradient-to-br from-blue-900 via-blue-950 to-blue-800 text-white">
      <Container size="wide">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand & Description */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <img 
                src="/logo-text.svg" 
                alt="MyApproved"
                className="h-10 sm:h-12 md:h-14 w-auto object-contain flex-shrink-0"
              />
            </div>
            <p className="text-blue-100 leading-relaxed text-sm sm:text-base">
              Find trusted, approved tradespeople near you. Get fast quotes, compare, and book with confidence.
            </p>
            <p className="text-blue-100 flex items-center gap-2 text-sm sm:text-base">
              <Mail className="w-4 h-4 text-yellow-400" />
              support@myapproved.com
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-blue-100 hover:text-yellow-400 transition-colors duration-200 flex items-center group"
                  >
                    <span className="w-1 h-1 rounded-full bg-yellow-400 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Find Tradespeople */}
          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-5">Find Tradespeople</h3>
            <ul className="space-y-3">
              {findTradespeople.map((location) => (
                <li key={location.name}>
                  <Link 
                    href={location.href}
                    className="text-blue-100 hover:text-yellow-400 transition-colors duration-200 flex items-center group"
                  >
                    <span className="w-1 h-1 rounded-full bg-yellow-400 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {location.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link 
              href="/locations" 
              className="inline-flex items-center gap-1 text-yellow-400 hover:text-yellow-300 mt-4 text-sm font-medium"
            >
              View all locations
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-5">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-blue-100 hover:text-yellow-400 transition-colors duration-200 flex items-center group"
                  >
                    <span className="w-1 h-1 rounded-full bg-yellow-400 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3 mb-6 text-sm text-blue-300">
          {/* Stripe — payment security */}
          <span className="flex items-center gap-2">
            Payments secured by Stripe
          </span>

          {/* Google — reviews */}
          <span className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="h-4 w-4 inline-block" aria-hidden="true">
              <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45c-.28 1.5-1.13 2.77-2.4 3.62l3.86 2.99c2.26-2.09 3.59-5.16 3.59-8.8z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.86-2.99c-1.07.72-2.44 1.14-4.08 1.14-3.14 0-5.8-2.12-6.75-4.97l-3.98 3.08C3.35 20.87 7.31 24 12 24z" />
              <path fill="#FBBC05" d="M5.25 14.27c-.24-.72-.38-1.48-.38-2.27s.14-1.55.38-2.27l-3.98-3.08C.46 8.13 0 9.99 0 12s.46 3.87 1.27 5.35l3.98-3.08z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.96 1.08 15.24 0 12 0 7.31 0 3.35 3.13 1.27 7.35l3.98 3.08C6.2 6.87 8.86 4.75 12 4.75z" />
            </svg>
            Reviews via Google
          </span>

          {/* ICO registration — renders only once a number is set */}
          {process.env.NEXT_PUBLIC_ICO_REGISTRATION_NUMBER && (
            <a
              href="https://ico.org.uk/ESDWebPages/Search"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-yellow-400 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 inline-block" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              ICO registered&nbsp;· {process.env.NEXT_PUBLIC_ICO_REGISTRATION_NUMBER}
            </a>
          )}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-blue-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-sm text-blue-300">
                &copy; {currentYear} MyApproved. All rights reserved.
              </p>
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center gap-4">
              {process.env.NEXT_PUBLIC_FACEBOOK_URL && (
                <a
                  href={process.env.NEXT_PUBLIC_FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-blue-800/50 flex items-center justify-center text-blue-100 hover:bg-yellow-400 hover:text-blue-900 transition-all duration-200"
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
                  className="w-10 h-10 rounded-full bg-blue-800/50 flex items-center justify-center text-blue-100 hover:bg-yellow-400 hover:text-blue-900 transition-all duration-200"
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
                  className="w-10 h-10 rounded-full bg-blue-800/50 flex items-center justify-center text-blue-100 hover:bg-yellow-400 hover:text-blue-900 transition-all duration-200"
                  aria-label="LinkedIn"
              >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-blue-400">
              <Link href="/privacy" className="hover:text-yellow-400 transition-colors">Privacy Policy</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-yellow-400 transition-colors">Terms of Service</Link>
              <span>•</span>
              <Link href="/cookies" className="hover:text-yellow-400 transition-colors">Cookie Policy</Link>
              <span>•</span>
              <Link href="/sitemap" className="hover:text-yellow-400 transition-colors">Sitemap</Link>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default Footer;
