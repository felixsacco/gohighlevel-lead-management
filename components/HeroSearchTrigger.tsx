"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

const DEFAULT_SUGGESTIONS = [
  "Leak Repairs",
  "Boiler Installation",
  "Bathroom Fitting",
  "Pipe Repairs",
  "Emergency Plumbing",
  "Central Heating",
  "Tap Installation",
  "Toilet Repairs",
  "Shower Installation",
  "Radiator Repairs",
];

export default function HeroSearchTrigger({
  suggestions = DEFAULT_SUGGESTIONS,
}: {
  suggestions?: readonly string[];
}) {
  const open = () => window.dispatchEvent(new CustomEvent("open-ai-quote"));

  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (suggestions.length === 0) return;

    const word = suggestions[wordIndex % suggestions.length];
    const typingSpeed = deleting ? 25 : 70;

    const timeout = setTimeout(() => {
      if (!deleting) {
        const next = word.slice(0, text.length + 1);
        setText(next);
        if (next === word) {
          setTimeout(() => setDeleting(true), 1400);
        }
      } else {
        const next = word.slice(0, text.length - 1);
        setText(next);
        if (next === "") {
          setDeleting(false);
          setWordIndex((i) => (i + 1) % suggestions.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [text, deleting, wordIndex, suggestions]);

  return (
    <div
      onClick={open}
      className="relative flex items-center bg-white rounded-full shadow-2xl border-4 border-white cursor-pointer hover:border-brand-amber transition-all duration-200 pl-3 pr-1 py-1.5 sm:pl-4 sm:pr-2 sm:py-2 gap-2 sm:gap-3 max-w-2xl mx-auto w-full"
    >
      <Search className="w-5 h-5 text-gray-400 flex-shrink-0 ml-1" />
      <input
        // size=1 + min-w-0 lets the input shrink inside the flex row so the
        // "Get Quotes" button is never clipped off the right edge on
        // narrow phones (e.g. iPhone SE).
        type="text"
        size={1}
        value={text}
        placeholder="What work do you need doing?"
        readOnly
        onClick={open}
        className="flex-1 min-w-0 text-gray-700 placeholder-gray-400 bg-transparent focus:outline-none text-sm sm:text-base font-medium cursor-pointer"
      />
      <span
        aria-hidden="true"
        className="w-px h-5 bg-brand-amber self-center"
      />
      <button
        onClick={(e) => { e.stopPropagation(); open(); }}
        className="bg-brand-amber hover:bg-brand-amberDark text-brand-navy font-bold px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm transition-all flex-shrink-0 whitespace-nowrap"
        style={{ fontWeight: 800 }}
      >
        Get Quotes
      </button>
    </div>
  );
}
