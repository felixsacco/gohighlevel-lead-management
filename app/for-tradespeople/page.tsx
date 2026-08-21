// @ts-nocheck
"use client";

import { useState } from "react";

import { CheckCircle, Users, TrendingUp, Shield, User, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import SectionHeaderPill from "@/components/ui/SectionHeaderPill";

const benefits = [
  {
    icon: Shield,
    title: "Only pay for leads you want",
    description:
      "You're never charged unless a lead is worth taking. No subscription, no monthly fees, no lock-in.",
  },
  {
    icon: BadgeCheck,
    title: "A badge that closes jobs",
    description:
      "MyApproved verifies your identity, business and insurance before you appear. Homeowners see exactly what was checked.",
  },
  {
    icon: Users,
    title: "Matched jobs, not a broadcast",
    description:
      "Each job is matched by trade and location, so you only see work worth taking. No broadcast to dozens of competitors.",
  },
];

const pricingPlans = [
  {
    features: [
      "Free to register and verify",
      "Browse and apply to any job",
      "Pay only for the leads you accept",
      "Cancel any time, no contract",
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
          <div className="max-w-4xl mx-auto text-center">
            <div>
              <SectionHeaderPill>For Tradespeople</SectionHeaderPill>
              <h1 className="text-[2rem] sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-[-0.02em] mb-12 sm:mb-16" style={{fontWeight: 800}}>
                Grow Your Trade Business with <span className="text-brand-amber">MyApproved</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/75 mb-5">
                Pay only when a lead is worth taking.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-brand-amber hover:bg-brand-amberDark text-black font-semibold px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg shadow-lg"
                  style={{fontWeight: 700}}
                  asChild
                >
                  <Link href="/register/tradesperson">Sign Up</Link>
                </Button>
                <Button
                  size="lg"
                  className="bg-white text-brand-navy hover:bg-gray-100 font-semibold"
                  asChild
                >
                  <Link href="/login/trade">Log In</Link>
                </Button>
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
              <p className="text-slate-600 text-sm">Pass identity, business and insurance checks before you go live.</p>
            </div>
            <div className="rounded-xl bg-brand-slate p-4 sm:p-5 border border-gray-100">
              <div className="flex items-center gap-2 mb-2 text-brand-navy font-semibold">
                <Users className="w-5 h-5 text-brand-amber" /> Get Leads
              </div>
              <p className="text-slate-600 text-sm">Receive job briefs that match your trade and location.</p>
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

      {/* Verification & Declination Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-[#F1F5F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-navy mb-4 sm:mb-6 px-4" style={{fontWeight: 800}}>
              What we check before you're approved
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-brand-navy max-w-3xl mx-auto font-semibold px-4">
              Every tradesperson passes the same checks before they're listed.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
            {/* Identity */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-brand-navy mb-1 sm:mb-2 notranslate" style={{fontWeight: 700}}>Identity checked</h3>
              <p className="text-sm sm:text-base text-gray-700 font-medium notranslate">Your photo ID is checked against a live selfie.</p>
            </div>

            {/* Business */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                  <BadgeCheck className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-brand-navy mb-1 sm:mb-2 notranslate" style={{fontWeight: 700}}>Business verified</h3>
              <p className="text-sm sm:text-base text-gray-700 font-medium notranslate">Your company is confirmed on Companies House.</p>
            </div>

            {/* Insurance */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-brand-navy mb-1 sm:mb-2 notranslate" style={{fontWeight: 700}}>Insurance confirmed and monitored</h3>
              <p className="text-sm sm:text-base text-gray-700 font-medium notranslate">Your public liability cover is checked and monitored.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Declination Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-navy mb-4 sm:mb-6 px-4" style={{fontWeight: 800}}>
              Why we decline you
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-brand-navy max-w-3xl mx-auto font-semibold px-4">
              These are the reasons an application won't be approved.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <ul className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {[
                "You can't legally do the work, such as gas work without a current Gas Safe registration.",
                "A required check fails: photo ID, registered business or insurance.",
                "Your documents don't hold up or appear falsified.",
                "You're matched on UK sanctions or PEP screening lists.",
                "You have a director disqualification, an undischarged bankruptcy or an IVA.",
                "You were removed from MyApproved before and are re-applying under a new name or details.",
                "Your insurance has lapsed or your certification has been withdrawn, and hasn't been replaced.",
                "Your profile will be removed if the above isn't put right in time.",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3 bg-brand-slate rounded-xl border border-gray-100 p-4 sm:p-5">
                  <div className="bg-white rounded-full p-1.5 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-[#DC2626]" />
                  </div>
                  <span className="text-slate-600 text-sm sm:text-base leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>

            <p className="text-center text-xs text-gray-500 mt-10">
              Verification is not a guarantee of workmanship. For full details of what is and isn't checked, see{" "}
              <Link href="/verification" className="text-brand-navy underline hover:text-brand-amber transition-colors">
                how we verify tradespeople
              </Link>
              .
            </p>
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
              Join for free and pay only for the leads you accept.
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
                    No monthly subscription
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
              <Link href="/register/tradesperson">Sign Up</Link>
            </Button>
            <Button
              size="lg"
              className="bg-white text-brand-navy hover:bg-gray-100 font-semibold"
              asChild
            >
              <Link href="/login/trade">Log In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer removed; global Footer comes from app/layout.tsx */}
    </div>
  );
}
