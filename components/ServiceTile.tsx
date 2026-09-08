"use client";

import type { ReactNode } from "react";

/**
 * A single service tile in the location-page services marquee. Clicking any
 * tile opens the AI quote modal (same action as the Get Quotes button) via the
 * global `open-ai-quote` event handled by AIQuoteFormProvider.
 *
 * Marquee duplicate copies (the ones that fill out the infinite scroll loop)
 * are passed `hidden` so they stay out of the tab order and accessibility tree
 * while remaining visually identical and still clickable by pointer.
 */
export default function ServiceTile({
  children,
  hidden = false,
}: {
  children: ReactNode;
  hidden?: boolean;
}) {
  const open = () => window.dispatchEvent(new CustomEvent("open-ai-quote"));

  return (
    <div
      role={hidden ? undefined : "button"}
      tabIndex={hidden ? -1 : 0}
      aria-hidden={hidden ? "true" : undefined}
      onClick={open}
      onKeyDown={(e) => {
        if (!hidden && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          open();
        }
      }}
      className="flex-shrink-0 w-[260px] sm:w-[280px] md:w-[300px] bg-sky-50 rounded-xl hover:shadow-lg transition-shadow duration-200 cursor-pointer"
    >
      {children}
    </div>
  );
}
