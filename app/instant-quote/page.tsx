"use client";

import { useEffect } from "react";
import { Zap } from "lucide-react";

export default function InstantQuotePage() {
  useEffect(() => {
    window.dispatchEvent(new Event("open-ai-quote"));
  }, []);

  return (
    <section className="bg-[#1A3A8A] min-h-[60vh] flex flex-col items-start justify-start pt-8 sm:pt-12 text-center px-4 py-20">
      <div className="inline-flex items-center gap-2 bg-[#F5B301] text-black text-xs font-bold px-4 py-2 rounded-full mb-6">
        <Zap className="w-3.5 h-3.5" />
        Instant Quote
      </div>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Get Your Free Quote</h1>
      <p className="text-blue-200 text-base mb-8 max-w-md">
        Tell us about your job and we'll match you with verified, approved tradespeople in your area.
      </p>
      <button
        onClick={() => window.dispatchEvent(new Event("open-ai-quote"))}
        className="bg-[#F5B301] hover:bg-[#E8A900] text-black font-extrabold px-8 py-3.5 rounded-xl text-sm transition-colors"
      >
        Start My Quote
      </button>
    </section>
  );
}
