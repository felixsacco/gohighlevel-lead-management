// @ts-nocheck
"use client";

import { useState } from "react";

import { CheckCircle, Users, TrendingUp, Shield, Star, User, Info, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const benefits = [
  {
    icon: Shield,
    title: "£4.99/lead - no monthly contract",
    description:
      "Pay only when you accept a lead. No subscription, no 12-month lock-in. Checkatrade charges £300+/month regardless of lead volume.",
  },
  {
    icon: BadgeCheck,
    title: "Verified badge that converts",
    description:
      "MyApproved independently verifies your ID, insurance, and trade qualifications - not self-declared. Homeowners can see exactly what was checked.",
  },
  {
    icon: Users,
    title: "Exclusive leads - not shared",
    description:
      "Your lead is matched to you based on trade and location. MyBuilder sells the same lead to multiple competing trades. MyApproved does not.",
  },
];

const pricingPlans = [
  {
    name: "Pay Per Lead",
    subtitle: "Free to join",
    price: "£0",
    period: "per month",
    leadFeeLabel: "£4.99 per lead",
    leadFeeTooltip:
      "No monthly subscription. You only pay £4.99 each time you accept a lead from MyApproved.",
    features: [
      "Free to register and verify",
      "Browse and apply to any job",
      "Pay only £4.99 per accepted lead",
      "No monthly commitment - cancel anytime",
    ],
    popular: false,
  },
  {
    name: "Unlimited",
    subtitle: "Best value",
    price: "£1,000",
    period: "per month",
    leadFeeLabel: "Unlimited leads",
    leadFeeTooltip:
      "Unlimited leads for a flat £1,000 / month. No per-lead fees. Cancel anytime.",
    features: [
      "Unlimited leads every month",
      "No per-lead fees",
      "Priority placement in search results",
      "Featured profile + verified badge",
      "Email and SMS lead alerts",
      "CRM dashboard and lead tracking",
    ],
    popular: true,
  },
];

const testimonials = [
  {
    name: "Mike Johnson",
    trade: "Plumber",
    initials: "MJ",
    color: "bg-blue-700",
    quote:
      "MyApproved has transformed my business. I'm getting 3x more customers than before!",
    rating: 5,
  },
  {
    name: "Sarah Williams",
    trade: "Electrician",
    initials: "SW",
    color: "bg-indigo-700",
    quote:
      "The platform is so easy to use and the leads are high quality. Highly recommend!",
    rating: 5,
  },
  {
    name: "David Brown",
    trade: "Builder",
    initials: "DB",
    color: "bg-blue-800",
    quote:
      "Best investment I've made for my business. The support team is fantastic too.",
    rating: 5,
  },
];

export default function ForTradespeople() {
  const [jobsPerWeek, setJobsPerWeek] = useState<number>(10);
  const [closeRate, setCloseRate] = useState<number>(30); // %
  const [avgJobValue, setAvgJobValue] = useState<number>(150); // £
  const [leadCost, setLeadCost] = useState<number>(15); // £ per lead
  const [trade, setTrade] = useState<string>("plumber");

  const tradeDefaults: Record<string, { jobs: number; close: number; avg: number; lead: number }> = {
    plumber: { jobs: 12, close: 35, avg: 180, lead: 18 },
    electrician: { jobs: 10, close: 30, avg: 160, lead: 16 },
    roofer: { jobs: 6, close: 25, avg: 850, lead: 35 },
    builder: { jobs: 4, close: 20, avg: 1200, lead: 40 },
    handyman: { jobs: 14, close: 40, avg: 100, lead: 10 },
    painter: { jobs: 8, close: 28, avg: 300, lead: 20 },
    locksmith: { jobs: 15, close: 45, avg: 120, lead: 12 },
    gardener: { jobs: 10, close: 32, avg: 140, lead: 12 },
  };

  const applyTradeDefaults = (t: string) => {
    const d = tradeDefaults[t];
    if (!d) return;
    setJobsPerWeek(d.jobs);
    setCloseRate(d.close);
    setAvgJobValue(d.avg);
    setLeadCost(d.lead);
  };
  const projectedMonthly = Math.max(0, jobsPerWeek) * 4 * (Math.min(100, Math.max(0, closeRate)) / 100) * Math.max(0, avgJobValue);
  const leadsPerWeek = closeRate > 0 ? (jobsPerWeek / (closeRate / 100)) : 0;
  const monthlyLeadCost = leadsPerWeek * 4 * Math.max(0, leadCost);
  const netMonthly = Math.max(0, projectedMonthly - monthlyLeadCost);
  return (
    <div className="min-h-screen bg-white">
      {/* Header removed; global Header comes from app/layout.tsx */}

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950 text-white pb-20 pt-8 sm:pt-12">
        <Container size="wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-4">
                Grow Your Trade Business with <span className="text-[#fdbd18]">MyApproved</span>
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-5">
                Stop paying £300/month to Checkatrade for a subscription that runs regardless of how many leads you get.
                MyApproved charges <strong className="text-[#fdbd18]">£4.99 per accepted lead</strong> - no contract, no monthly minimum.
              </p>

              {/* Competitive comparison strip */}
              <div className="mb-6 rounded-xl bg-white/10 ring-1 ring-white/20 p-4 grid grid-cols-3 gap-3 text-center text-sm">
                <div>
                  <div className="font-extrabold text-[#fdbd18] text-xl">£4.99</div>
                  <div className="text-blue-100 text-xs">MyApproved / lead</div>
                </div>
                <div className="border-x border-white/20">
                  <div className="font-extrabold text-gray-300 text-xl line-through">£300+</div>
                  <div className="text-blue-200/70 text-xs">Checkatrade / month</div>
                </div>
                <div>
                  <div className="font-extrabold text-gray-300 text-xl line-through">£80</div>
                  <div className="text-blue-200/70 text-xs">MyBuilder / lead</div>
                </div>
              </div>

              {/* Trust strip */}
              <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full ring-1 ring-white/20">
                  <Shield className="w-4 h-4" /> Verified ID &amp; Insurance
                </span>
                <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full ring-1 ring-white/20">
                  <Star className="w-4 h-4 text-yellow-400" /> 50,000+ 5★ reviews
                </span>
                <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full ring-1 ring-white/20">
                  <Shield className="w-4 h-4" /> No monthly contract
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-[#fdbd18] hover:brightness-95 text-blue-900 font-bold"
                  asChild
                >
                  <Link href="/register/tradesperson">Get Started</Link>
                </Button>
                <Button
                  size="lg"
                  className="bg-white text-blue-900 hover:bg-blue-50 font-bold"
                  asChild
                >
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-xl shadow-2xl bg-gradient-to-br from-blue-700 to-blue-900 border border-blue-600 p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-200 text-sm font-semibold">This month's earnings</span>
                  <span className="bg-green-500/20 text-green-300 text-xs font-bold px-2 py-0.5 rounded-full">+34%</span>
                </div>
                <div className="text-4xl font-black text-white">£8,420</div>
                <div className="h-2 bg-blue-800 rounded-full overflow-hidden">
                  <div className="h-2 bg-[#fdbd18] rounded-full w-[72%]" />
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-xl font-bold text-white">47</div>
                    <div className="text-blue-300 text-xs">Leads</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-xl font-bold text-white">18</div>
                    <div className="text-blue-300 text-xs">Jobs won</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-xl font-bold text-[#fdbd18]">{process.env.NEXT_PUBLIC_AGGREGATE_RATING_VALUE || '4.9'}★</div>
                    <div className="text-blue-300 text-xs">Rating</div>
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#fdbd18] flex items-center justify-center text-blue-900 font-bold text-sm">MJ</div>
                  <div>
                    <div className="text-white text-sm font-semibold">New lead: Boiler service</div>
                    <div className="text-blue-300 text-xs">Manchester · 2 min ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Featured trade perks by plan */}
          <div className="mt-10 grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="font-extrabold text-blue-900 mb-1">Starter perks</div>
              <ul className="text-sm text-blue-900 space-y-1 list-disc pl-5">
                <li>Basic profile with verified badge</li>
                <li>Up to 10 targeted leads/month</li>
                <li>Email support</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
              <div className="font-extrabold text-blue-900 mb-1">Professional perks</div>
              <ul className="text-sm text-blue-900 space-y-1 list-disc pl-5">
                <li>Featured listing in search</li>
                <li>Priority customer matching</li>
                <li>Phone & email support</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
              <div className="font-extrabold text-blue-900 mb-1">Premium perks</div>
              <ul className="text-sm text-blue-900 space-y-1 list-disc pl-5">
                <li>Top of results + account manager</li>
                <li>Unlimited leads and advanced reporting</li>
                <li>Marketing assistance</li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur border-t border-blue-100 shadow-xl">
        <Container size="wide" className="py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-blue-900 text-sm sm:text-base font-semibold">
            Ready to get more jobs? Join MyApproved today.
          </div>
          <div className="flex items-center gap-2">
            <Button className="bg-[#fdbd18] text-blue-900 font-bold hover:brightness-95" asChild>
              <Link href="/register/tradesperson">Get Started Free</Link>
            </Button>
            <Button variant="outline" className="border-blue-200 text-blue-900 hover:bg-blue-50" asChild>
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </Container>
      </div>

      {/* How it works for trades */}
      <Section className="bg-white">
        <Container size="wide">
          <h2 className="text-2xl md:text-3xl font-extrabold text-blue-900 tracking-tight text-center mb-8">
            How it works for trades
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <div className="flex items-center gap-2 mb-2 text-blue-900 font-semibold">
                <User className="w-5 h-5" /> Apply
              </div>
              <p className="text-blue-800 text-sm">Create your profile and tell us the work you want.</p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <div className="flex items-center gap-2 mb-2 text-blue-900 font-semibold">
                <Shield className="w-5 h-5" /> Verify
              </div>
              <p className="text-blue-800 text-sm">Get ID and insurance verified to build trust fast.</p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <div className="flex items-center gap-2 mb-2 text-blue-900 font-semibold">
                <Users className="w-5 h-5" /> Get Leads
              </div>
              <p className="text-blue-800 text-sm">Receive quality local leads that match your trade.</p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <div className="flex items-center gap-2 mb-2 text-blue-900 font-semibold">
                <TrendingUp className="w-5 h-5" /> Grow
              </div>
              <p className="text-blue-800 text-sm">Win more work and grow your reputation with reviews.</p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Earnings calculator */}
      <Section className="bg-blue-50">
        <Container size="wide">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-blue-900 tracking-tight mb-2">Earnings calculator</h2>
              <p className="text-blue-800/90 mb-4">Estimate projected monthly revenue for your trade on MyApproved.</p>
              <div className="space-y-4 rounded-2xl border border-blue-100 bg-white p-5">
                <div>
                  <Label htmlFor="trade" className="text-blue-900">Trade</Label>
                  <Select value={trade} onValueChange={(v) => { setTrade(v); applyTradeDefaults(v); }}>
                    <SelectTrigger id="trade" className="mt-1">
                      <SelectValue placeholder="Select a trade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plumber">Plumber</SelectItem>
                      <SelectItem value="electrician">Electrician</SelectItem>
                      <SelectItem value="roofer">Roofer</SelectItem>
                      <SelectItem value="builder">Builder</SelectItem>
                      <SelectItem value="handyman">Handyman</SelectItem>
                      <SelectItem value="painter">Painter & Decorator</SelectItem>
                      <SelectItem value="locksmith">Locksmith</SelectItem>
                      <SelectItem value="gardener">Gardener</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="jobsPerWeek" className="text-blue-900">Jobs you can take per week</Label>
                  <Input id="jobsPerWeek" type="number" min={0} value={jobsPerWeek} onChange={(e) => setJobsPerWeek(Math.max(0, Number(e.target.value)))} />
                </div>
                <div>
                  <Label htmlFor="closeRate" className="text-blue-900">Close rate (%)</Label>
                  <Input id="closeRate" type="number" step="1" min={0} max={100} value={closeRate} onChange={(e) => setCloseRate(Math.min(100, Math.max(0, Number(e.target.value))))} />
                </div>
                <div>
                  <Label htmlFor="avgValue" className="text-blue-900">Average job value (£)</Label>
                  <Input id="avgValue" type="number" min={0} value={avgJobValue} onChange={(e) => setAvgJobValue(Math.max(0, Number(e.target.value)))} />
                </div>
                <div>
                  <Label htmlFor="leadCost" className="text-blue-900">Lead cost / fee (£ per lead)</Label>
                  <input
                    id="leadCost"
                    type="range"
                    min={0}
                    max={60}
                    step={1}
                    value={leadCost}
                    onChange={(e) => setLeadCost(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex items-center justify-between mt-1 text-sm text-blue-800">
                    <span>£0</span>
                    <span className="font-semibold">£{leadCost}</span>
                    <span>£60</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-white p-6">
              <h3 className="text-xl font-extrabold text-blue-900 mb-2">Projected monthly revenue</h3>
              <p className="text-4xl font-extrabold text-blue-900 mb-3">{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(projectedMonthly)}</p>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl bg-blue-50 p-3">
                  <div className="text-blue-900 font-semibold">Monthly lead cost</div>
                  <div className="text-blue-800">{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(monthlyLeadCost)}</div>
                  <div className="text-[12px] text-blue-700/70">~{Math.round(leadsPerWeek * 4)} leads/mo at £{leadCost}/lead</div>
                </div>
                <div className="rounded-xl bg-green-50 p-3">
                  <div className="text-green-800 font-semibold">Net monthly (after lead costs)</div>
                  <div className="text-green-700">{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(netMonthly)}</div>
                  <div className="text-[12px] text-green-700/70">Excludes materials and labour</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-blue-800/80">Assumes 4 weeks/month. Increase your close rate with verified profile and fast response times.</p>
            </div>
          </div>
          {/* Tips to increase close rate */}
          <div className="mt-8 rounded-2xl border border-blue-100 bg-white p-5">
            <h3 className="text-lg font-extrabold text-blue-900 mb-2">Top tips to increase close rate</h3>
            <ul className="list-disc pl-5 text-blue-900 space-y-1">
              <li><span className="font-semibold">Verify your ID and insurance:</span> get the verified badge to build instant trust.</li>
              <li><span className="font-semibold">Respond within minutes:</span> fast replies win more jobs - turn on notifications.</li>
              <li><span className="font-semibold">Add photos and reviews:</span> showcase recent work and invite clients to review.</li>
              <li><span className="font-semibold">Quote clearly:</span> outline scope, timelines, and what’s included to avoid back‑and‑forth.</li>
            </ul>
          </div>
        </Container>
      </Section>

      {/* Benefits Section */}
      <Section className="bg-gray-50">
        <Container size="wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Tradespeople Choose MyApproved
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to take your trade business to the next level
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-8">
                  <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                    <benefit.icon className="w-8 h-8 text-blue-700" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Pricing Section */}
      <Section className="bg-white">
        <Container size="wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, fair pricing</h2>
            <p className="text-lg text-gray-600">
              Pick how you want to pay for leads. No setup fees. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${
                  plan.popular ? "ring-2 ring-yellow-500 shadow-lg" : ""
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black">
                    Best Value
                  </Badge>
                )}
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                    {plan.subtitle && (
                      <div className="text-sm font-bold text-blue-900/80 mb-2">{plan.subtitle}</div>
                    )}
                    <div className="text-4xl font-bold text-blue-700 mb-2">
                      {plan.price}
                      <span className="text-lg text-gray-600 font-normal">
                        /{plan.period}
                      </span>
                    </div>
                    <TooltipProvider>
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-900 px-2 py-1 ring-1 ring-blue-100">
                          {plan.leadFeeLabel}
                        </span>
                        <Tooltip>
                          <TooltipTrigger aria-label="Plan info" className="text-blue-900/80 hover:text-blue-900">
                            <Info className="w-4 h-4" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs text-sm">
                            {plan.leadFeeTooltip}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                        : "bg-blue-700 hover:bg-blue-800"
                    }`}
                    asChild
                  >
                    <Link href="/register/tradesperson">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Plan comparison table */}
      <Section className="bg-white">
        <Container size="wide">
          <h3 className="text-2xl font-extrabold text-blue-900 tracking-tight mb-6 text-center">Compare plans</h3>
          <div className="overflow-x-auto max-w-3xl mx-auto">
            <table className="min-w-full border border-blue-100 rounded-2xl overflow-hidden">
              <thead className="bg-blue-50">
                <tr>
                  <th className="text-left text-blue-900 font-semibold p-3">Feature</th>
                  <th className="text-center text-blue-900 font-semibold p-3">Pay Per Lead</th>
                  <th className="text-center text-blue-900 font-semibold p-3">Unlimited</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                <tr>
                  <td className="p-3 text-blue-900">Monthly cost</td>
                  <td className="p-3 text-center text-blue-900">£0</td>
                  <td className="p-3 text-center text-blue-900">£1,000</td>
                </tr>
                <tr>
                  <td className="p-3 text-blue-900">Cost per lead</td>
                  <td className="p-3 text-center text-blue-900">£4.99</td>
                  <td className="p-3 text-center text-green-700">£0</td>
                </tr>
                <tr>
                  <td className="p-3 text-blue-900">Lead volume</td>
                  <td className="p-3 text-center text-blue-900">Pay as you go</td>
                  <td className="p-3 text-center text-green-700">Unlimited</td>
                </tr>
                <tr>
                  <td className="p-3 text-blue-900">Browse and apply to jobs</td>
                  <td className="p-3 text-center text-green-700">Included</td>
                  <td className="p-3 text-center text-green-700">Included</td>
                </tr>
                <tr>
                  <td className="p-3 text-blue-900">Email & SMS lead alerts</td>
                  <td className="p-3 text-center text-green-700">Included</td>
                  <td className="p-3 text-center text-green-700">Included</td>
                </tr>
                <tr>
                  <td className="p-3 text-blue-900">CRM dashboard</td>
                  <td className="p-3 text-center text-green-700">Included</td>
                  <td className="p-3 text-center text-green-700">Included</td>
                </tr>
                <tr>
                  <td className="p-3 text-blue-900">Featured profile</td>
                  <td className="p-3 text-center text-blue-900">-</td>
                  <td className="p-3 text-center text-green-700">Included</td>
                </tr>
                <tr>
                  <td className="p-3 text-blue-900">Priority placement in search</td>
                  <td className="p-3 text-center text-blue-900">-</td>
                  <td className="p-3 text-center text-green-700">Included</td>
                </tr>
                <tr>
                  <td className="p-3 text-blue-900">Cancel anytime</td>
                  <td className="p-3 text-center text-green-700">Yes</td>
                  <td className="p-3 text-center text-green-700">Yes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Container>
      </Section>

      {/* Tradesman Upsells (moved below Pricing) */}
      <Section className="bg-white">
        <Container size="wide">
          <h3 className="text-2xl font-extrabold text-blue-900 tracking-tight mb-4">Tradesman Upsells</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-blue-100 bg-white p-4">
              <div className="font-semibold text-blue-900">SEO / GMB boost</div>
              <div className="text-sm text-blue-800/80">Improve rankings and visibility</div>
              <div className="mt-1 font-extrabold text-blue-900">£199</div>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-white p-4">
              <div className="font-semibold text-blue-900">Facebook / Google ads mgmt</div>
              <div className="text-sm text-blue-800/80">Managed campaigns</div>
              <div className="mt-1 font-extrabold text-blue-900">£99/month</div>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-white p-4">
              <div className="font-semibold text-blue-900">Custom website</div>
              <div className="text-sm text-blue-800/80">Fast, branded site</div>
              <div className="mt-1 font-extrabold text-blue-900">£499</div>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-white p-4">
              <div className="font-semibold text-blue-900">Branded AI chatbot</div>
              <div className="text-sm text-blue-800/80">24/7 lead capture</div>
              <div className="mt-1 font-extrabold text-blue-900">£29/month</div>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-white p-4">
              <div className="font-semibold text-blue-900">Featured listing</div>
              <div className="text-sm text-blue-800/80">Boosted visibility</div>
              <div className="mt-1 font-extrabold text-blue-900">£25/week</div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Testimonials */}
      <Section className="py-16 bg-gradient-to-br from-blue-50 via-white to-blue-50/40">
        <Container size="wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-3">
              What Our Tradespeople Say
            </h2>
            <p className="text-blue-800/80">Real results from verified pros using MyApproved.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="bg-white border border-blue-100 hover:shadow-lg hover:border-blue-200 transition-all rounded-2xl"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-[#fdbd18] fill-[#fdbd18]" />
                    ))}
                    <span className="ml-1 text-sm text-blue-800/80">5.0</span>
                  </div>
                  <div className="text-blue-900 font-semibold mb-2">“{testimonial.quote}”</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-full mr-3 ring-2 ring-blue-100 flex items-center justify-center text-white font-bold text-base ${testimonial.color}`}>
                        {testimonial.initials}
                      </div>
                      <div>
                        <div className="font-extrabold text-blue-900 leading-tight">{testimonial.name}</div>
                        <div className="text-sm text-blue-800/80">{testimonial.trade}</div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-50 ring-1 ring-blue-100 text-blue-900">
                      <Shield className="w-3 h-3" /> Verified on MyApproved
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-700 to-blue-800 text-white">
        <Container size="narrow" className="text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Grow Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join MyApproved today and start connecting with more customers in
            your area.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
              asChild
            >
              <Link href="/register/tradesperson">Get Started</Link>
            </Button>
            <Button
              size="lg"
              className="bg-white text-blue-900 hover:bg-gray-100"
              asChild
            >
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* Footer removed; global Footer comes from app/layout.tsx */}
    </div>
  );
}
