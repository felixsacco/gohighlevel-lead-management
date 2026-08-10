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
