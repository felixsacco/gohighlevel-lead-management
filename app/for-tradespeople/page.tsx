// @ts-nocheck
"use client";

import { useState } from "react";

import { CheckCircle, Users, TrendingUp, Shield, User, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

const benefits = [
  {
    icon: Shield,
    title: "£4.99 a lead, pay as you go",
    description:
      "Pay only when a lead is worth taking. No subscription, no monthly fees, no lock-in.",
  },
  {
    icon: BadgeCheck,
    title: "Verified badge that converts",
    description:
      "MyApproved independently verifies your photo ID, business, insurance, and qualifications - not self-declared. Homeowners can see exactly what was checked.",
  },
  {
    icon: Users,
    title: "Three tradespeople per job",
    description:
      "Each job goes to a real three-person brief, matched by trade and location. No broadcast to dozens of competitors.",
  },
];

const pricingPlans = [
  {
    features: [
      "Free to register and verify",
      "Browse and apply to any job",
      "Pay only £4.99 per accepted lead",
      "No monthly commitment - cancel anytime",
    ],
  },
];

export default function ForTradespeople() {
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
    <div className="min-h-screen bg-white">
      {/* Header removed; global Header comes from app/layout.tsx */}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-brand-navyDark to-brand-navy text-white overflow-hidden min-h-[100vh] flex items-center -mt-[var(--header-height)]">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[160px] sm:pt-[176px] pb-24 md:pt-[224px] md:pb-40">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[0.72rem] sm:text-xs font-semibold tracking-[0.22em] uppercase text-brand-amber mb-8 sm:mb-12">
                For Tradespeople
              </p>
              <h1 className="text-[2rem] sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-[-0.02em] mb-12 sm:mb-16 px-2 sm:px-4" style={{fontWeight: 800}}>
                Grow Your Trade Business with <span className="text-brand-amber">MyApproved</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/75 mb-5">
                Pay only when a lead is worth taking. MyApproved charges{" "}
                <strong className="text-brand-amber">£4.99 per accepted lead</strong> - no contract, no monthly fees.
              </p>

              {/* Trust strip */}
              <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full ring-1 ring-white/20">
                  <Shield className="w-4 h-4" /> Verified ID &amp; Insurance
                </span>
                <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full ring-1 ring-white/20">
                  <BadgeCheck className="w-4 h-4 text-brand-amber" /> Identity checked &amp; business verified
                </span>
                <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full ring-1 ring-white/20">
                  <Shield className="w-4 h-4" /> No monthly contract
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-brand-amber hover:bg-brand-amberDark text-black font-semibold px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg shadow-lg"
                  style={{fontWeight: 700}}
                  asChild
                >
                  <Link href="/register/tradesperson">Get Started</Link>
                </Button>
                <Button
                  size="lg"
                  className="bg-white text-brand-navy hover:bg-gray-100 font-semibold"
                  asChild
                >
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-xl shadow-2xl bg-brand-navy/60 border border-brand-navy/40 p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-200 text-sm font-semibold">Your verified profile</span>
                  <span className="inline-flex items-center gap-1 bg-brand-amber/20 text-brand-amber text-xs font-bold px-2 py-0.5 rounded-full">
                    <Shield className="w-3 h-3" /> Verified
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-brand-amber/20 flex items-center justify-center">
                    <BadgeCheck className="w-8 h-8 text-brand-amber" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">Photo ID checked</div>
                    <div className="text-blue-300 text-sm">Business verified on Companies House</div>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-blue-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-amber" /> Insurance confirmed and monitored
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-amber" /> Qualifications reviewed
                  </li>
                </ul>
                <div className="rounded-xl bg-white/10 p-3 text-center text-blue-200 text-sm">
                  Three tradespeople per job, matched by trade and location
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works for trades */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-navy mb-4 sm:mb-6 px-4 tracking-tight text-center" style={{fontWeight: 800}}>
              How it works for trades
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="rounded-xl bg-brand-slate p-4 sm:p-5 border border-gray-100">
              <div className="flex items-center gap-2 mb-2 text-brand-navy font-semibold">
                <User className="w-5 h-5 text-brand-amber" /> Apply
              </div>
              <p className="text-slate-600 text-sm">Create your profile and tell us the work you want.</p>
            </div>
            <div className="rounded-xl bg-brand-slate p-4 sm:p-5 border border-gray-100">
              <div className="flex items-center gap-2 mb-2 text-brand-navy font-semibold">
                <Shield className="w-5 h-5 text-brand-amber" /> Verify
              </div>
              <p className="text-slate-600 text-sm">Pass the four checks - photo ID, business, insurance, qualifications.</p>
            </div>
            <div className="rounded-xl bg-brand-slate p-4 sm:p-5 border border-gray-100">
              <div className="flex items-center gap-2 mb-2 text-brand-navy font-semibold">
                <Users className="w-5 h-5 text-brand-amber" /> Get Leads
              </div>
              <p className="text-slate-600 text-sm">Receive three-person briefs that match your trade and location.</p>
            </div>
            <div className="rounded-xl bg-brand-slate p-4 sm:p-5 border border-gray-100">
              <div className="flex items-center gap-2 mb-2 text-brand-navy font-semibold">
                <TrendingUp className="w-5 h-5 text-brand-amber" /> Grow
              </div>
              <p className="text-slate-600 text-sm">Win more work and grow your reputation with verified reviews.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-brand-slate py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-navy mb-4 sm:mb-6 px-4" style={{fontWeight: 800}}>
              Why Tradespeople Choose MyApproved
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Everything you need to take your trade business to the next level
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-4 sm:p-5 md:p-6">
                  <div className="bg-brand-amber/10 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                    <benefit.icon className="w-8 h-8 text-brand-navy" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-brand-navy mb-4" style={{fontWeight: 800}}>
                    {benefit.title}
                  </h3>
                  <p className="text-slate-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-navy mb-4 sm:mb-6 px-4" style={{fontWeight: 800}}>Simple, fair pricing</h2>
            <p className="text-base sm:text-lg text-slate-600">
              Join for free and pay only for the leads you accept. No subscription, no monthly fees.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <Card className="relative ring-2 ring-brand-amber shadow-lg">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-extrabold text-brand-navy mb-1" style={{fontWeight: 800}}>Pay Per Lead</h3>
                  <div className="text-sm font-bold text-gray-500 mb-2">Free to join</div>
                  <div className="text-4xl font-bold text-brand-navy mb-2">
                    £4.99
                    <span className="text-lg text-gray-600 font-normal">/per lead</span>
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-brand-amber/10 text-brand-navy px-3 py-1 ring-1 ring-brand-amber/30 text-sm">
                    £4.99 per lead · no monthly subscription
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {pricingPlans[0].features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#16A34A] mr-3 flex-shrink-0" />
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button className="w-full bg-brand-amber hover:bg-brand-amberDark text-black font-semibold" asChild>
                  <Link href="/register/tradesperson">Join as a Tradesperson</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Email capture */}
      <section className="py-16 sm:py-20 bg-brand-slate">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-navy mb-3" style={{fontWeight: 800}}>
              New jobs near you, by email
            </h2>
            <p className="text-slate-600 mb-6">
              Get alerts when new jobs are posted in your area.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-brand-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-amber"
              />
              <Button
                type="submit"
                size="lg"
                disabled={status === 'loading'}
                className="w-full bg-brand-amber hover:bg-brand-amberDark text-black font-semibold"
              >
                {status === 'loading' ? 'Subscribing…' : 'Get job alerts'}
              </Button>
            </form>
            {message && (
              <p
                className={`mt-4 text-sm ${
                  status === 'success' ? 'text-[#16A34A]' : 'text-[#DC2626]'
                }`}
              >
                {message}
              </p>
            )}
            <p className="mt-4 text-xs text-gray-500">
              Subscribe to receive job alerts by email. Unsubscribe any time.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-brand-navyDark to-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6" style={{fontWeight: 800}}>
            Ready to Grow Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join MyApproved today and start connecting with more customers in
            your area.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-brand-amber hover:bg-brand-amberDark text-black font-semibold"
              asChild
            >
              <Link href="/register/tradesperson">Get Started</Link>
            </Button>
            <Button
              size="lg"
              className="bg-white text-brand-navy hover:bg-gray-100 font-semibold"
              asChild
            >
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer removed; global Footer comes from app/layout.tsx */}
    </div>
  );
}
