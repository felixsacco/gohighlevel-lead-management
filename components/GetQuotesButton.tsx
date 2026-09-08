"use client";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GetQuotesButton({
  variant = "default",
}: {
  variant?: "default" | "hero";
}) {
  const open = () => window.dispatchEvent(new CustomEvent("open-ai-quote"));

  if (variant === "hero") {
    // Mirror the homepage's big amber CTA exactly (app/page.tsx services band)
    // so the location-page button under the carousel is visually identical.
    return (
      <Button
        type="button"
        size="lg"
        onClick={open}
        className="bg-brand-amber hover:bg-brand-amber text-black font-bold border-2 border-brand-amber px-8 sm:px-10 md:px-12 py-5 sm:py-6 md:py-7 text-base sm:text-lg md:text-xl shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
        style={{ fontWeight: 800 }}
      >
        Get Quotes
        <ArrowRight className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6" />
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={open}
      className="bg-brand-amber hover:bg-brand-amberDark text-brand-navy font-bold px-8 py-3 rounded-full text-base transition-all whitespace-nowrap"
      style={{ fontWeight: 800 }}
    >
      Get Quotes
    </button>
  );
}
