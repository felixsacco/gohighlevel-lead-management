"use client";

import { MapPin } from "lucide-react";

/**
 * A single postcode-district chip in the location page's coverage section.
 * Clicking any district chip opens the AI quote modal (same action as the
 * Get Quotes button / Service tiles) via the global `open-ai-quote` event
 * handled by AIQuoteFormProvider.
 *
 * Chips render as interactive buttons so keyboard users can open the quote
 * form with Enter/Space just like pointer users can with a click.
 */
export default function PostcodeChip({ postcode }: { postcode: string }) {
  const open = () => window.dispatchEvent(new CustomEvent("open-ai-quote"));

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Get quotes for ${postcode}`}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      className="flex items-center justify-center gap-1.5 bg-brand-slate rounded-xl px-3 py-2.5 border border-gray-100 cursor-pointer hover:border-brand-navy hover:shadow-sm transition-all"
    >
      <MapPin className="w-3 h-3 text-brand-amber flex-shrink-0" />
      <span className="text-sm font-bold text-brand-navy">{postcode}</span>
    </div>
  );
}
