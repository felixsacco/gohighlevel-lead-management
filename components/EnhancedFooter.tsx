"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Shield } from 'lucide-react';

const EnhancedFooter = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/crm/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setMessage("You're subscribed. Watch your inbox for new jobs.");
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <footer className="bg-[#1A3A8A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-4 group mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#F5B301] to-yellow-400 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-[#1A3A8A]" />
              </div>
              <span className="text-3xl font-bold text-white" style={{fontWeight: 800}}>MyApproved</span>
            </Link>
            <p className="text-gray-300 text-sm mb-4">
              Find verified and approved tradespeople across the UK. ID-checked, insured to £2M, and reviewed by real customers.
            </p>
            <p className="text-gray-300 text-sm">
              <a href="mailto:support@myapproved.com" className="hover:text-white flex items-center gap-2">
                <Mail className="w-4 h-4" />
                support@myapproved.com
              </a>
            </p>

            {/* Email capture */}
            <div className="mt-6 border-t border-blue-800 pt-6">
              <h5 className="text-sm font-semibold text-white mb-3" style={{fontWeight: 700}}>
                New jobs near you, by email
              </h5>
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-md bg-blue-900/50 border border-blue-800 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:border-[#F5B301]"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full rounded-md bg-[#F5B301] text-[#1A3A8A] text-sm font-semibold px-3 py-2 hover:bg-yellow-400 transition-colors disabled:opacity-60"
                >
                  {status === 'loading' ? 'Subscribing…' : 'Get job alerts'}
                </button>
              </form>
              {message && (
                <p className={`mt-2 text-xs ${status === 'error' ? 'text-red-300' : 'text-emerald-300'}`}>
                  {message}
                </p>
              )}
              <p className="mt-3 text-xs text-gray-400">
                Subscribe to receive job alerts by email. Unsubscribe any time.
              </p>
            </div>
          </div>

          {/* Homeowners Column */}
          <div>
            <h4 className="text-lg font-bold mb-4" style={{fontWeight: 700}}>Homeowners</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/find-tradespeople" className="hover:text-white transition-colors">Find a Tradesperson</Link></li>
              <li><Link href="/instant-quote" className="hover:text-white transition-colors">Get Free Quotes</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Our Verification Checks</Link></li>
              <li><Link href="/help" className="hover:text-white transition-colors">Help &amp; Support</Link></li>
            </ul>
          </div>

          {/* Tradespeople Column */}
          <div>
            <h4 className="text-lg font-bold mb-4" style={{fontWeight: 700}}>Tradespeople</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/register/tradesperson" className="hover:text-white transition-colors">Join MyApproved</Link></li>
              <li><Link href="/for-tradespeople" className="hover:text-white transition-colors">How It Works for Trades</Link></li>
              <li><Link href="/help" className="hover:text-white transition-colors">Tradesperson Help</Link></li>
            </ul>

            <h4 className="text-lg font-bold mt-6 mb-3" style={{fontWeight: 700}}>Find Tradespeople</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/find-tradespeople/plumber/birmingham" className="hover:text-white transition-colors">Trusted Plumbers in Birmingham</Link></li>
              <li><Link href="/find-tradespeople/electrician/manchester" className="hover:text-white transition-colors">Find Electricians in Manchester</Link></li>
              <li><Link href="/find-tradespeople/roofer/leeds" className="hover:text-white transition-colors">Reliable Roofer Services Leeds</Link></li>
              <li><Link href="/find-tradespeople/builder/liverpool" className="hover:text-white transition-colors">Verified Builders in Liverpool</Link></li>
              <li><Link href="/find-tradespeople/painter-decorator/bristol" className="hover:text-white transition-colors">Painters &amp; Decorators Bristol</Link></li>
              <li><Link href="/find-tradespeople/locksmith/sheffield" className="hover:text-white transition-colors">Emergency Locksmiths Sheffield</Link></li>
              <li><Link href="/find-tradespeople/gas-engineer/nottingham" className="hover:text-white transition-colors">Gas Safe Engineers Nottingham</Link></li>
              <li><Link href="/find-tradespeople/carpenter/newcastle" className="hover:text-white transition-colors">Local Carpenters Newcastle</Link></li>
              <li><Link href="/find-tradespeople/plumber/london" className="hover:text-white transition-colors">24-Hour Plumber London</Link></li>
              <li><Link href="/find-tradespeople" className="hover:text-white transition-colors font-semibold">View all locations →</Link></li>
            </ul>
          </div>

          {/* Locations Column */}
          <div>
            <h4 className="text-lg font-bold mb-4" style={{fontWeight: 700}}>Areas We Cover</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/find-tradespeople/plumber/london" className="hover:text-white transition-colors">London</Link></li>
              <li><Link href="/find-tradespeople/electrician/manchester" className="hover:text-white transition-colors">Manchester</Link></li>
              <li><Link href="/find-tradespeople/builder/birmingham" className="hover:text-white transition-colors">Birmingham</Link></li>
              <li><Link href="/find-tradespeople/roofer/leeds" className="hover:text-white transition-colors">Leeds</Link></li>
              <li><Link href="/find-tradespeople/plumber/sheffield" className="hover:text-white transition-colors">Sheffield</Link></li>
              <li><Link href="/find-tradespeople/painter-decorator/bristol" className="hover:text-white transition-colors">Bristol</Link></li>
              <li><Link href="/find-tradespeople/locksmith/glasgow" className="hover:text-white transition-colors">Glasgow</Link></li>
              <li><Link href="/find-tradespeople/plumber/edinburgh" className="hover:text-white transition-colors">Edinburgh</Link></li>
              <li><Link href="/find-tradespeople/gas-engineer/nottingham" className="hover:text-white transition-colors">Nottingham</Link></li>
              <li><Link href="/find-tradespeople/carpenter/leicester" className="hover:text-white transition-colors">Leicester</Link></li>
              <li><Link href="/locations" className="hover:text-white transition-colors font-semibold">View all locations →</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p className="mb-4 md:mb-0">Built in the UK &middot; Serving the UK</p>
          <p className="mb-4 md:mb-0">© {new Date().getFullYear()} MyApproved. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <span>·</span>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
            <span>·</span>
            <Link href="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default EnhancedFooter;
