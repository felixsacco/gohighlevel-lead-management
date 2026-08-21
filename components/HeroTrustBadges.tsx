"use client";

import { ShieldCheck as ShieldCheckFill, SealCheck as SealCheckFill } from "@phosphor-icons/react";

export default function HeroTrustBadges() {
  return (
    <div className="inline-flex flex-nowrap justify-center text-xs sm:text-sm md:text-base px-2 sm:px-4 mb-12 sm:mb-16">
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-1 sm:py-2 text-white/70 whitespace-nowrap">
        <span className="text-white/70 text-base sm:text-lg font-bold leading-none" aria-hidden="true">
          <ShieldCheckFill weight="fill" className="h-4 w-4 sm:h-5 sm:w-5 inline-block" aria-hidden="true" />
        </span>
        <span className="font-bold tracking-wide text-white/70 notranslate">IDENTITY CHECKED</span>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-1 sm:py-2 text-white/70 whitespace-nowrap border-l border-white/20">
        <span className="text-white/70 text-base sm:text-lg font-bold leading-none" aria-hidden="true">
          <SealCheckFill weight="fill" className="h-4 w-4 sm:h-5 sm:w-5 inline-block" aria-hidden="true" />
        </span>
        <span className="font-bold tracking-wide text-white/70 notranslate">INSURANCE VERIFIED</span>
      </div>
    </div>
  );
}
