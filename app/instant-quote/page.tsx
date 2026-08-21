"use client";

import { useEffect } from "react";
import { Zap } from "lucide-react";

export default function InstantQuotePage() {
  useEffect(() => {
    window.dispatchEvent(new Event("open-ai-quote"));
  }, []);

  return (
    <section className="bg-brand-navy min-h-[60vh] flex flex-col items-start justify-start pt-8 sm:pt-12 text-center px-4 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-start">
      <div className="inline-flex items-center gap-2 bg-brand-amber text-black text-xs font-bold px-4 py-2 rounded-full mb-6">
        <Zap className="w-3.5 h-3.5" />
        Instant Quote
      </div>
      <h1 className="text-[2rem] sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-[-0.02em] text-white mb-12 sm:mb-16 px-2 sm:px-4" style={{ fontWeight: 800 }}>Get Your Free Quote</h1>
      <p className="text-white/75 text-base mb-8 max-w-md">
        Tell us about your job and we'll match you with verified, approved tradespeople in your area.
      </p>
      <button
        onClick={() => window.dispatchEvent(new Event("open-ai-quote"))}
        className="bg-brand-amber hover:bg-brand-amberDark text-black font-semibold px-8 py-3.5 rounded-xl text-sm transition-colors"
        style={{ fontWeight: 800 }}
      >
        Start My Quote
      </button>
      </div>
    </section>
  );
}
