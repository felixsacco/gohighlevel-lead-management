"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";

/**
 * A single postcode-district chip in the location page's coverage section.
 *
 * When an internal `href` is supplied the chip renders as a real anchor to that
 * page (a city page's district chip linking through to its child-neighbourhood
 * page), giving search crawlers an internal crawl path across the neighbourhood
 * matrix. Without an `href` the chip stays an interactive button that opens the
 * AI quote modal (same action as the Get Quotes button / Service tiles) via the
 * global `open-ai-quote` event handled by AIQuoteFormProvider.
 *
 * Both variants share the exact same styling so a coverage grid never looks
 * uneven, and both are keyboard accessible (the link natively; the button via
 * Enter/Space).
 */
const chipClasses =
  "flex items-center justify-center gap-1.5 bg-brand-slate rounded-xl px-3 py-2.5 border border-gray-100 cursor-pointer hover:border-brand-navy hover:shadow-sm transition-all";

export default function PostcodeChip({
  postcode,
  href,
}: {
  postcode: string;
  href?: string;
}) {
  const open = () => window.dispatchEvent(new CustomEvent("open-ai-quote"));

  if (href) {
    return (
      <Link
        href={href}
        aria-label={`View tradespeople near ${postcode}`}
        className={chipClasses}
      >
        <MapPin className="w-3 h-3 text-brand-amber flex-shrink-0" />
        <span className="text-sm font-bold text-brand-navy">{postcode}</span>
      </Link>
    );
  }

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
      className={chipClasses}
    >
      <MapPin className="w-3 h-3 text-brand-amber flex-shrink-0" />
      <span className="text-sm font-bold text-brand-navy">{postcode}</span>
    </div>
  );
}
