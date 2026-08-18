"use client";

import { Search } from "lucide-react";

export default function HeroSearchTrigger() {
  const open = () => window.dispatchEvent(new CustomEvent("open-ai-quote"));

  return (
    <div
      onClick={open}
      className="relative flex items-center bg-white rounded-full shadow-2xl border-4 border-white cursor-pointer hover:border-[#F5B301] transition-all duration-200 pl-3 pr-1 py-1.5 sm:pl-4 sm:pr-2 sm:py-2 gap-2 sm:gap-3 max-w-2xl mx-auto w-full"
    >
      <Search className="w-5 h-5 text-gray-400 flex-shrink-0 ml-1" />
      <input
        // size=1 + min-w-0 lets the input shrink inside the flex row so the
        // "Get Quotes" button is never clipped off the right edge on
        // narrow phones (e.g. iPhone SE).
        type="text"
        size={1}
        placeholder="What work do you need doing?"
        readOnly
        onClick={open}
        className="flex-1 min-w-0 text-gray-700 placeholder-gray-400 bg-transparent focus:outline-none text-sm sm:text-base font-medium cursor-pointer"
      />
      <button
        onClick={(e) => { e.stopPropagation(); open(); }}
        className="bg-[#F5B301] hover:bg-[#E8A900] text-[#0f172a] font-bold px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm transition-all flex-shrink-0 whitespace-nowrap"
        style={{ fontWeight: 800 }}
      >
        Get Quotes
      </button>
    </div>
  );
}
