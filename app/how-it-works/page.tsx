"use client";

import { Search, UserCheck, MessageSquare, Star, Shield, CheckCircle } from "lucide-react";


const schema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Find and Hire a Verified Tradesperson with MyApproved",
  "description": "Find and hire a trusted, verified tradesperson in the UK in 4 simple steps.",
  "totalTime": "PT10M",
  "step": [
    { "@type": "HowToStep", "position": 1, "name": "Search", "text": "Search by trade type and location. Every tradesperson shown has been verified." },
    { "@type": "HowToStep", "position": 2, "name": "Get Quotes", "text": "Post your job or contact tradespeople directly to receive competitive quotes." },
    { "@type": "HowToStep", "position": 3, "name": "Hire", "text": "Compare profiles, read real reviews, and hire the right professional for your job." },
    { "@type": "HowToStep", "position": 4, "name": "Review", "text": "After the job is done, leave a verified review to help other homeowners." },
  ],
};

const steps = [
  {
    icon: Search,
    step: "Step 1",
    title: "Search & Compare",
    body: "Search for tradespeople by trade type and your location. Every profile on MyApproved has been verified before listing — identity, insurance, and qualifications all checked.",
    visual: (
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 space-y-3">
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-gray-500 text-sm">Search by trade or location…</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {["Plumber", "Electrician", "Builder", "Roofer", "Gas Engineer", "Plasterer"].map((t, i) => (
            <span key={t} className={`px-3 py-1 rounded-full text-xs font-semibold border ${i === 0 ? "bg-[#1A3A8A] text-white border-[#1A3A8A]" : "bg-white text-gray-600 border-gray-200"}`}>{t}</span>
          ))}
        </div>
        <div className="space-y-2 pt-1">
          {[`James T. — Plumber · ★ ${process.env.NEXT_PUBLIC_AGGREGATE_RATING_VALUE || '4.9'} · Verified`, "Mark R. — Plumber · ★ 4.8 · Verified"].map((r) => (
            <div key={r} className="bg-white rounded-lg border border-gray-100 px-4 py-2.5 flex items-center justify-between shadow-sm">
              <span className="text-xs text-gray-700 font-medium">{r}</span>
              <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">Approved</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: MessageSquare,
    step: "Step 2",
    title: "Get Quotes",
    body: "Post your job for free or contact tradespeople directly. Describe what you need, your location, and your timeline. Tradespeople will respond with competitive quotes.",
    visual: (
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 space-y-3">
        <div className="bg-[#1A3A8A] rounded-xl p-4 text-white">
          <p className="text-xs font-bold text-[#FFB800] mb-1">Your Job Post</p>
          <p className="text-sm font-semibold">Boiler replacement needed</p>
          <p className="text-xs text-blue-200 mt-1">Manchester · ASAP · Budget open</p>
        </div>
        <p className="text-xs text-gray-400 font-medium px-1">3 quotes received</p>
        {[
          { name: "A. Davies Heating", price: "£1,850", eta: "Tomorrow" },
          { name: "ProBoiler NW", price: "£1,920", eta: "2 days" },
        ].map((q) => (
          <div key={q.name} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-semibold text-gray-800">{q.name}</p>
              <p className="text-[11px] text-gray-400">Available: {q.eta}</p>
            </div>
            <span className="text-sm font-bold text-[#1A3A8A]">{q.price}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: UserCheck,
    step: "Step 3",
    title: "Choose & Hire",
    body: "Compare profiles, read genuine reviews from real customers, and choose the tradesperson that's right for your job. Book directly through the platform.",
    visual: (
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-bold text-gray-900 text-sm">A. Davies Heating</p>
              <p className="text-xs text-gray-500">Gas Engineer · Manchester</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">Verified</span>
              <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">Gas Safe</span>
            </div>
          </div>
          <div className="flex items-center gap-1 mb-3">
            {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-[#FFB800] text-[#FFB800]" />)}
            <span className="text-xs text-gray-500 ml-1">{process.env.NEXT_PUBLIC_AGGREGATE_RATING_VALUE || '4.9'} · {process.env.NEXT_PUBLIC_AGGREGATE_REVIEW_COUNT || '47'} reviews</span>
          </div>
          <div className="space-y-1">
            {["ID Verified", "£2M Public Liability", "Gas Safe Registered"].map(b => (
              <div key={b} className="flex items-center gap-2 text-xs text-gray-600">
                <CheckCircle className="w-3 h-3 text-green-500" />{b}
              </div>
            ))}
          </div>
        </div>
        <button className="w-full bg-[#FFB800] text-black font-bold py-2.5 rounded-xl text-sm">Hire This Tradesperson</button>
      </div>
    ),
  },
  {
    icon: Star,
    step: "Step 4",
    title: "Leave a Review",
    body: "Once your job is complete, leave an honest review. Reviews are verified and help other homeowners make informed decisions — and reward quality tradespeople.",
    visual: (
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-sm font-bold text-gray-900 mb-1">Rate your experience</p>
          <p className="text-xs text-gray-500 mb-4">A. Davies Heating · Boiler replacement</p>
          <div className="flex items-center gap-2 mb-4">
            {[1,2,3,4,5].map(s => <Star key={s} className="w-7 h-7 fill-[#FFB800] text-[#FFB800]" />)}
          </div>
          <div className="bg-gray-50 rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-400 mb-4">
            Arrived on time, clean work, fair price…
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <CheckCircle className="w-3 h-3 text-green-500" />
            Review verified from a confirmed job
          </div>
        </div>
      </div>
    ),
  },
];

const benefits = [
  {
    icon: Shield,
    title: "ID & Insurance Verified",
    body: "Every tradesperson goes through identity checks and insurance verification before their profile is approved.",
  },
  {
    icon: Star,
    title: "Real Customer Reviews",
    body: "Reviews are from confirmed jobs only. Tradespeople cannot edit or remove them.",
  },
  {
    icon: CheckCircle,
    title: "Free for Homeowners",
    body: "Searching, comparing, and contacting tradespeople is completely free. You only pay the tradesperson for the work.",
  },
];

const faqs = [
  {
    q: "How are tradespeople verified?",
    a: "All tradespeople go through a 5-point verification process: identity check, public liability insurance, trade qualifications, business registration, and references where applicable.",
  },
  {
    q: "Is it free to use MyApproved?",
    a: "Yes, it's completely free for homeowners to search, compare, and contact tradespeople. You only pay the tradesperson directly for their work.",
  },
  {
    q: "Can I get multiple quotes?",
    a: "Yes. You can contact multiple tradespeople or post a job and let them come to you. We recommend getting at least two or three quotes before deciding.",
  },
  {
    q: "What if I'm not satisfied with the work?",
    a: "Contact our support team at support@myapproved.com and we'll work with you to help resolve the issue.",
  },
  {
    q: "How quickly can I find someone?",
    a: "Many tradespeople respond within a few hours. For urgent work, you can filter by availability when searching.",
  },
];

export default function HowItWorks() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* Hero */}
      <section className="bg-[#1A3A8A] text-white pb-16 sm:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#FFB800] text-black text-xs font-bold px-4 py-2 rounded-full mb-6">
            <CheckCircle className="w-3.5 h-3.5" />
            How It Works
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
            The Simple Way to Hire <span className="text-[#FFB800]">Trusted Tradespeople</span>
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Find, compare, and hire verified professionals in four straightforward steps. Free for homeowners.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
            {["Verified ID & Insurance", "Real Customer Reviews", "Free for Homeowners"].map((tag) => (
              <span key={tag} className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20 text-blue-100">
                <Shield className="w-3.5 h-3.5 text-[#FFB800]" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {steps.map((step, i) => (
            <div
              key={step.step}
              className={`grid lg:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? "lg:grid-flow-row-dense" : ""}`}
            >
              <div className={i % 2 === 1 ? "lg:col-start-2" : ""}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#1A3A8A] rounded-xl flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="bg-[#FFB800] text-black text-xs font-bold px-3 py-1 rounded-full">{step.step}</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h2>
                <p className="text-gray-600 leading-relaxed">{step.body}</p>
              </div>
              <div className={i % 2 === 1 ? "lg:col-start-1" : ""}>
                {step.visual}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Why Choose MyApproved?</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {benefits.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
                <div className="w-12 h-12 bg-[#1A3A8A] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Common Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="bg-gray-50 rounded-xl border border-gray-100 px-5 py-4 group">
                <summary className="cursor-pointer font-semibold text-gray-900 text-sm list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-[#1A3A8A] text-lg leading-none ml-4">+</span>
                </summary>
                <p className="mt-3 text-gray-600 text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1A3A8A] py-14 text-white text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-2">Ready to get your free quote?</h2>
          <p className="text-blue-200 text-sm mb-8">Tell us about your job and we'll connect you with verified tradespeople in your area. Takes two minutes.</p>
          <button
            onClick={() => window.dispatchEvent(new Event("open-ai-quote"))}
            className="bg-[#FFB800] hover:bg-[#FFC933] text-black font-extrabold px-8 py-3.5 rounded-xl text-sm transition-colors"
          >
            Get a Free Quote
          </button>
        </div>
      </section>
    </>
  );
}
