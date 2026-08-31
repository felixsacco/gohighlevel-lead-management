"use client";

import { Wrench, FileText, MapPin, Calculator, Star, Shield, CheckCircle, ChevronDown, Search, Send } from "lucide-react";
import { ShieldCheck as ShieldCheckFill, SealCheck as SealCheckFill } from "@phosphor-icons/react";
import SectionHeaderPill from "@/components/ui/SectionHeaderPill";
import AIQuoteTriggerButton from "@/components/AIQuoteTriggerButton";
import { graphify } from "@/components/SchemaMarkup";


const schema = graphify([
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://myapproved.com/#organization",
    "name": "MyApproved",
    "url": "https://myapproved.com",
  },
  {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "@id": "https://myapproved.com/how-it-works",
  "url": "https://myapproved.com/how-it-works",
  "name": "How to Find and Hire a Verified Tradesperson with MyApproved",
  "description": "Find and hire a trusted, verified tradesperson in the UK in 4 simple steps.",
  "totalTime": "PT10M",
  "step": [
    { "@type": "HowToStep", "position": 1, "name": "Select Trade", "text": "Tell us what trade you need, from plumbers and electricians to builders and roofers." },
    { "@type": "HowToStep", "position": 2, "name": "Describe Job", "text": "Describe the job and how urgent it is. Your job is matched to verified tradespeople in your trade or postcode area." },
    { "@type": "HowToStep", "position": 3, "name": "Location & Timing", "text": "Give us your postcode and preferred availability so we can find tradespeople who cover your area." },
    { "@type": "HowToStep", "position": 4, "name": "Estimate & Submit", "text": "Review a costed price range, submit your job, and a verified tradesperson will call you to arrange the work." },
  ],
  },
]);

const trades = [
  "Plumber", "Electrician", "Builder", "Painter", "Roofer", "Gardener",
  "Tiler", "Carpenter", "Locksmith", "Cleaner", "Handyman", "Plasterer",
];

// Faithful replica of the AIQuoteForm modal's navy header + gold progress indicator
const ModalChrome = ({ current }: { current: number }) => {
  const labels = ["Select Trade", "Describe Job", "Location & Timing", "Estimate + Submit"];
  return (
    <div className="bg-brand-navy px-4 sm:px-6 pt-4 pb-5">
      <div className="relative flex items-center justify-center mb-4">
        <span className="text-white font-extrabold text-lg">myapproved</span>
        <span className="absolute right-0 text-white/70 text-lg leading-none">×</span>
      </div>
      <div className="flex items-center justify-between">
        {labels.map((label, i) => {
          const n = i + 1;
          const done = current > n;
          const active = current === n;
          const filled = active || (current > n);
          return (
            <div key={label} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-full text-xs sm:text-sm font-extrabold ${
                    filled ? "bg-brand-amber text-black" : "bg-white/20 text-white/60"
                  }`}
                  style={{ fontWeight: 800 }}
                >
                  {n}
                </div>
                <span className={`text-[9px] sm:text-[11px] mt-1.5 font-medium text-center leading-tight ${filled ? "text-brand-amber" : "text-white/60"}`}>
                  {label}
                </span>
              </div>
              {i < labels.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 rounded-full ${done ? "bg-brand-amber" : "bg-white/20"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ModalFooter = () => (
  <div className="bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-3 flex justify-between items-center">
    <span className="flex items-center border-2 border-gray-300 rounded-md px-3 py-2 text-xs font-bold text-gray-500">
      ← Previous
    </span>
    <span className="flex items-center bg-brand-amber text-black font-extrabold px-4 py-2 rounded-md text-xs">
      Next Step →
    </span>
  </div>
);

const steps = [
  {
    icon: Wrench,
    step: "Step 1",
    title: "Select Trade",
    body: "Choose the trade you need from the list: plumber, electrician, builder and more. You pick one trade per job, so your request goes to the right people.",
    visual: (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <ModalChrome current={1} />
        <div className="p-4 sm:p-6 space-y-4">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-extrabold text-brand-navy" style={{ fontWeight: 800 }}>What service do you need?</p>
            <p className="text-sm text-gray-600 mt-1">Select the type of <span className="text-brand-navy font-bold">trade</span> you are looking for</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-brand-navy mb-2" style={{ fontWeight: 700 }}>Trade Category <span className="text-red-500">*</span></label>
            <div className="w-full h-12 border-2 border-gray-300 rounded-xl flex items-center justify-between px-4">
              <span className="text-sm text-gray-400">e.g. Plumber, Electrician, Builder</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {[
                { icon: Shield, label: "Identity-checked pros" },
                { icon: Star, label: "Customer reviewed" },
                { icon: Wrench, label: "Under 60s" },
                { icon: Shield, label: "Public liability insured" },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-2.5">
                  <b.icon className="w-4 h-4 text-brand-navy shrink-0" />
                  <span className="text-xs font-semibold text-gray-900">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <ModalFooter />
      </div>
    ),
  },
  {
    icon: FileText,
    step: "Step 2",
    title: "Describe Job",
    body: "Describe the job in your own words, say how urgent it is, and attach photos if you like. This becomes the brief that's matched to verified tradespeople in your trade or postcode area.",
    visual: (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <ModalChrome current={2} />
        <div className="p-4 sm:p-6 space-y-4">
          <div className="text-center">
            <p className="text-lg sm:text-xl font-extrabold text-brand-navy" style={{ fontWeight: 800 }}>Describe your job</p>
            <p className="text-sm text-gray-600 mt-1">Tell us what you need done in detail</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-brand-navy mb-2" style={{ fontWeight: 700 }}>Job Description <span className="text-red-500">*</span></label>
            <div className="border-2 border-gray-300 rounded-xl px-3 py-3 h-24">
              <span className="text-sm text-gray-400">Describe the work you need done in detail...</span>
            </div>
            <p className="text-xs text-green-600 mt-2">10/10 words</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-brand-navy mb-2" style={{ fontWeight: 700 }}>Upload Images (Optional)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
              <svg className="w-6 h-6 text-gray-400 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.6-4.6a2 2 0 012.8 0L17 17m-3-3l2-2a2 2 0 012.8 0L23 16M4 20h16a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12z" />
              </svg>
              <p className="text-xs text-gray-600">Click to upload images or drag and drop</p>
              <span className="inline-block mt-2 border border-gray-300 rounded-md px-3 py-1.5 text-xs font-semibold text-gray-700">Choose Files</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-brand-navy mb-2" style={{ fontWeight: 700 }}>Urgency Level <span className="text-red-500">*</span></label>
            <div className="w-full h-12 border-2 border-gray-300 rounded-xl flex items-center justify-between px-4">
              <span className="text-sm text-gray-400">Select urgency level...</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </div>
        <ModalFooter />
      </div>
    ),
  },
  {
    icon: MapPin,
    step: "Step 3",
    title: "Location & Timing",
    body: "Enter your postcode and pick your preferred availability. We match to verified tradespeople who cover your postcode within 50 miles, so you hear from people who can actually reach you.",
    visual: (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <ModalChrome current={3} />
        <div className="p-4 sm:p-6 space-y-5">
          <div className="text-center">
            <p className="text-lg sm:text-xl font-extrabold text-brand-navy" style={{ fontWeight: 800 }}>Location & <span className="text-brand-amber">Availability</span></p>
            <p className="text-sm text-gray-600 mt-1">Where and when do you need the work done?</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-brand-navy mb-2" style={{ fontWeight: 700 }}>Postcode <span className="text-red-500">*</span></label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <div className="pl-10 h-12 border-2 border-gray-300 rounded-xl flex items-center">
                <span className="text-sm text-gray-400">Enter your postcode</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-brand-navy mb-2" style={{ fontWeight: 700 }}>Preferred Availability</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Morning", active: true },
                { label: "Afternoon", active: false },
                { label: "Evening", active: false },
                { label: "Flexible", active: false },
              ].map((o) => (
                <span key={o.label} className={`h-11 flex items-center justify-center rounded-xl border-2 text-sm font-bold ${o.active ? "bg-brand-amber text-black border-brand-amber" : "border-gray-300 text-gray-600"}`} style={{ fontWeight: 700 }}>{o.label}</span>
              ))}
            </div>
          </div>
        </div>
        <ModalFooter />
      </div>
    ),
  },
  {
    icon: Calculator,
    step: "Step 4",
    title: "Estimate & Submit",
    body: "Review a costed price range for your job, add your contact details, and submit. A verified tradesperson will call you by phone to discuss the job and agree the final price. You never pay MyApproved for a quote.",
    visual: (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <ModalChrome current={4} />
        <div className="p-4 sm:p-6 space-y-4">
          <div className="border-2 border-gray-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 mb-3">Job Summary</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <span className="text-gray-500">Trade</span><span className="font-bold text-gray-900">Plumber</span>
              <span className="text-gray-500">Urgency</span><span className="font-bold text-gray-900">Urgent (Within 24 hours)</span>
              <span className="text-gray-500">Postcode</span><span className="font-bold text-gray-900">M1 1AE</span>
              <span className="text-gray-500">Availability</span><span className="font-bold text-gray-900">Morning</span>
            </div>
            <div className="border-t border-gray-200 mt-3 pt-3">
              <span className="text-xs text-gray-500">Job Description</span>
              <p className="text-xs text-gray-900 mt-1">Boiler is leaking and the pressure keeps dropping. Need someone to look at it as soon as possible.</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-extrabold text-brand-navy" style={{ fontWeight: 800 }}>Your <span className="text-brand-amber">Estimate</span></p>
            <p className="text-xs text-gray-600 mt-0.5">Based on your job details and location</p>
          </div>
          <div className="border-2 border-brand-amber bg-gradient-to-br from-brand-amber/10 to-brand-amberDark/10 rounded-xl p-5 text-center">
            <p className="text-2xl font-extrabold text-brand-navy" style={{ fontWeight: 800 }}>£220</p>
            <p className="text-xs text-gray-700 font-semibold mt-1">Estimated cost for your plumber job</p>
            <p className="text-xs text-gray-600 mt-1">Typical range: £180 to £260</p>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-extrabold text-brand-navy" style={{ fontWeight: 800 }}>Your Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-10 border-2 border-gray-300 rounded-xl flex items-center px-3"><span className="text-xs text-gray-400">First name</span></div>
              <div className="h-10 border-2 border-gray-300 rounded-xl flex items-center px-3"><span className="text-xs text-gray-400">Last name</span></div>
            </div>
            <div className="h-10 border-2 border-gray-300 rounded-xl flex items-center px-3"><span className="text-xs text-gray-400">you@example.com</span></div>
            <div className="h-10 border-2 border-gray-300 rounded-xl flex items-center px-3"><span className="text-xs text-gray-400">+44 7000 000000</span></div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="text-[11px] text-gray-600">By submitting, you agree to be contacted by verified tradespeople regarding your job.</p>
            </div>
            <span className="flex items-center justify-center gap-2 bg-brand-navy text-white font-extrabold py-2.5 rounded-md text-sm w-full">
              Send
              Submit Job
            </span>
          </div>
        </div>
      </div>
    ),
  },
];

const benefits = [
  {
    icon: "identity",
    title: "IDENTITY CHECKED",
    body: "Every profile passes a photo ID check, verified against a live selfie, before it's listed.",
  },
  {
    icon: "insurance",
    title: "INSURANCE VERIFIED",
    body: "We confirm their public liability insurance is genuine and in date, before it's approved.",
  },
  {
    icon: "free",
    title: "Free for homeowners",
    body: "Searching, comparing, and contacting is free. You pay only the tradesperson for the work.",
  },
];

const faqs = [
  {
    q: "How does verification work?",
    a: "Every tradesperson passes identity, business and insurance checks before listing: photo ID verified against a live selfie, a business registered on Companies House, and public liability insurance confirmed genuine and in date. We monitor the insurance and withdraw the listing if it lapses.",
  },
  {
    q: "Is it free to use?",
    a: "Yes, free for homeowners to search, compare, and contact. You only pay the tradesperson directly for their work.",
  },
  {
    q: "Who gets my job?",
    a: "Only tradespeople who have passed verification (identity, business and insurance checks) and who match your trade, or who cover your postcode within 50 miles. They contact you by phone to discuss the job.",
  },
  {
    q: "How do tradespeople contact me?",
    a: "By phone. After you submit your job, matched tradespeople call the number you provide to discuss the work and agree a price. You never pay MyApproved for a quote.",
  },
  {
    q: "What if I'm not happy with the work?",
    a: "Talk to the tradesperson first. If it isn't resolved, email support@myapproved.com and we'll help you work it out.",
  },
  {
    q: "How quickly can I find someone?",
    a: "When you mark the job urgent, matched tradespeople are notified straight away and usually call within a few hours.",
  },
];

export default function HowItWorks() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-brand-navyDark to-brand-navy text-white overflow-hidden min-h-[100vh] flex items-center -mt-[var(--header-height)]">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[160px] sm:pt-[176px] pb-24 md:pt-[224px] md:pb-40">
          <div className="text-center max-w-4xl mx-auto">
            <SectionHeaderPill>How It Works</SectionHeaderPill>
            <h1 className="text-[2rem] sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-[-0.02em] text-white mb-12 sm:mb-16 px-2 sm:px-4" style={{fontWeight: 800}}>
              The Simple Way to Hire <span className="text-brand-amber">Trusted Tradespeople</span>
            </h1>
            <p className="text-white/75 text-base sm:text-lg max-w-2xl mx-auto">
              Describe your job in four steps, submit it, and you'll get a phone call back from a verified tradesperson who wants the job. Free for homeowners.
            </p>
          </div>
        </div>
      </section>

      {/* Search bar — exact replica of the homepage hero entry point */}
      <section className="bg-brand-navy py-10 sm:py-14 px-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-white/70 text-sm sm:text-base mb-6">
            Start here. This is the same search bar you'll see on the homepage.
          </p>
          <div className="relative max-w-3xl mx-auto">
            <div className="relative flex flex-col sm:flex-row items-center bg-white rounded-full shadow-xl shadow-black/20 border border-white/40 cursor-pointer gap-0 sm:pl-1.5 sm:pr-1.5 sm:py-1.5 overflow-hidden">
              <div className="flex-1 relative flex items-center w-full sm:w-auto">
                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 ml-4 sm:ml-4 flex-shrink-0" />
                <span className="w-full px-4 py-4 sm:py-5 text-gray-900 placeholder-gray-500 focus:outline-none rounded-full text-base sm:text-lg font-medium bg-transparent text-center sm:text-left">
                  What service do you need?
                </span>
              </div>
              <AIQuoteTriggerButton
                label="Get Quotes"
                className="rounded-full bg-brand-amber hover:bg-brand-amber text-brand-navyDark font-bold px-6 sm:px-8 py-4 sm:py-5 text-base sm:text-lg w-auto sm:w-auto self-stretch sm:self-auto m-2 sm:m-0 transition-all duration-150 hover:-translate-y-px hover:shadow-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-white py-12 sm:py-16 md:py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {steps.map((step, i) => (
            <div
              key={step.step}
              className={`grid lg:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? "lg:grid-flow-row-dense" : ""}`}
            >
              <div className={i % 2 === 1 ? "lg:col-start-2" : ""}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-brand-navy rounded-xl flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="bg-brand-amber text-black text-xs font-bold px-3 py-1 rounded-full">{step.step}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-brand-navy mb-3" style={{fontWeight: 800}}>{step.title}</h2>
                <p className="text-gray-600 leading-relaxed">{step.body}</p>
                {i === 1 && (
                  <div className="mt-6">
                    <AIQuoteTriggerButton label="Try the quote form" className="inline-flex items-center justify-center gap-2 bg-brand-navy hover:bg-brand-navyDark text-white font-bold px-6 py-3 rounded-xl text-sm" />
                  </div>
                )}
              </div>
              <div className={i % 2 === 1 ? "lg:col-start-1" : ""}>
                {step.visual}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-[#F1F5F9] py-12 sm:py-16 md:py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-brand-navy" style={{fontWeight: 800}}>Why Choose MyApproved?</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {benefits.map(({ icon, title, body }) => (
              <div key={title} className="bg-white rounded-xl p-4 sm:p-5 md:p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  {icon === "identity" ? (
                    <ShieldCheckFill weight="fill" className="w-6 h-6 text-white" />
                  ) : icon === "insurance" ? (
                    <SealCheckFill weight="fill" className="w-6 h-6 text-white" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-white" />
                  )}
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-brand-navy mb-2 notranslate" style={{fontWeight: 800}}>{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-12 sm:py-16 md:py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-brand-navy" style={{fontWeight: 800}}>Common Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="bg-white rounded-xl border border-gray-200 px-5 py-4 group">
                <summary className="cursor-pointer font-semibold text-gray-900 text-sm list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-brand-navy text-lg leading-none ml-4">+</span>
                </summary>
                <p className="mt-3 text-gray-600 text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-navy py-12 sm:py-16 md:py-20 lg:py-28 text-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-2" style={{fontWeight: 800}}>Ready to post your job?</h2>
          <p className="text-blue-100 text-sm mb-8">Tell us what you need and submit it, then a verified tradesperson will call you back to arrange the work.</p>
          <button
            onClick={() => window.dispatchEvent(new Event("open-ai-quote"))}
            className="bg-brand-amber hover:bg-brand-amberDark text-black font-semibold border-2 border-brand-amber px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg shadow-lg rounded-xl transition-colors" style={{fontWeight: 800}}
          >
            Get a Free Quote
          </button>
        </div>
      </section>
    </>
  );
}
