"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HelpSearchBar() {
  const openMatcher = () => {
    window.dispatchEvent(new CustomEvent("open-ai-quote"));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
        <input
          type="text"
          placeholder="What trade do you need help with? e.g. plumber, electrician..."
          className="w-full pl-12 pr-36 py-4 text-gray-900 rounded-xl border-0 shadow-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none cursor-pointer"
          onClick={openMatcher}
          readOnly
        />
        <Button
          onClick={openMatcher}
          className="absolute right-2 top-2 bg-[#F5B301] hover:bg-[#E8A900] text-black font-bold"
        >
          Get Quotes
        </Button>
      </div>
    </div>
  );
}
