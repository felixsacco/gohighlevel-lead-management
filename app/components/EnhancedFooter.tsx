"use client";

import { useState } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Shield,
  ShieldCheck,
  Star,
  Lock,
  CheckCircle,
  ArrowRight,
  Users,
  Clock,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const EnhancedFooter = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Trust Badges Row */}
      <div className="border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6">
          <div className="flex items-center justify-center gap-8 flex-wrap text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <Lock className="w-4 h-4 text-green-400" />
              <span className="font-medium">SSL Secure</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="font-medium">Data Protected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Company Info & Newsletter */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  ApprovedWork
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed mb-6 max-w-md">
                The UK's trusted platform connecting homeowners with identity-checked tradespeople whose
                public liability insurance is confirmed and monitored.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xl font-bold text-yellow-400">✓</div>
                  <div className="text-xs text-slate-400">Identity checked</div>
                </div>
                <div className="text-center bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xl font-bold text-blue-400">✓</div>
                  <div className="text-xs text-slate-400">Business verified</div>
                </div>
                <div className="text-center bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xl font-bold text-green-400">✓</div>
                  <div className="text-xs text-slate-400">Insurance confirmed</div>
                </div>
              </div>
            </div>

            {/* Newsletter Subscription */}
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30">
              <h3 className="text-lg font-bold text-white mb-2">Subscribe for Homeowner Tips & Discounts</h3>
              <p className="text-slate-400 text-sm mb-4">Get weekly tips, exclusive offers, and the latest from our verified tradespeople.</p>
              
              {subscribed ? (
                <div className="flex items-center gap-2 text-green-400 font-medium">
                  <CheckCircle className="w-5 h-5" />
                  <span>Thanks for subscribing!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-3">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-400"
                    required
                  />
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-blue-900 font-bold px-6"
                  >
                    Subscribe
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { name: "Home", href: "/" },
                { name: "Instant Quote", href: "/instant-quote" },
                { name: "Post a Job", href: "/post-job" },
                { name: "Find Tradespeople", href: "/find-tradespeople" },
                { name: "Join as Tradesperson", href: "/register/tradesperson" },
                { name: "About Us", href: "/about" },
                { name: "Contact", href: "/contact" },
                { name: "FAQ", href: "/faq" }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span>{link.name}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Contact & Support</h3>
            
            {/* Contact Info */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-slate-400">
                <Phone className="w-4 h-4 text-green-400" />
                <div>
                  <div className="font-medium text-white">0800 123 4567</div>
                  <div className="text-xs">24/7 Customer Support</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <Mail className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="font-medium text-white">hello@approvedwork.co.uk</div>
                  <div className="text-xs">General Inquiries</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <MapPin className="w-4 h-4 text-red-400" />
                <div>
                  <div className="font-medium text-white">London, UK</div>
                  <div className="text-xs">Nationwide Coverage</div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Follow Us</h4>
              <div className="flex gap-3">
                {[
                  { icon: Facebook, href: "#", color: "hover:text-blue-500" },
                  { icon: Twitter, href: "#", color: "hover:text-sky-400" },
                  { icon: Instagram, href: "#", color: "hover:text-pink-500" },
                  { icon: Linkedin, href: "#", color: "hover:text-blue-600" }
                ].map((social, index) => (
                  <Link
                    key={index}
                    href={social.href}
                    className={`w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center text-slate-400 ${social.color} transition-all duration-200 hover:scale-110 hover:bg-slate-600/50`}
                  >
                    <social.icon className="w-4 h-4" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-slate-400 text-sm">
              © 2025 MyApproved. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-slate-400 hover:text-white transition-colors duration-200">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-slate-400 hover:text-white transition-colors duration-200">
                Cookie Policy
              </Link>
              <Link href="/sitemap.xml" className="text-slate-400 hover:text-white transition-colors duration-200">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default EnhancedFooter;
