"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const AIQuoteForm = dynamic(() => import("./AIQuoteForm"), {
  ssr: false,
  loading: () => null,
});

export default function AIQuoteFormProvider() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener("open-ai-quote", handler);
    return () => window.removeEventListener("open-ai-quote", handler);
  }, []);

  return (
    <>
      {/* Hidden trigger for components that use document.getElementById('ai-quote-trigger').click() */}
      <button
        id="ai-quote-trigger"
        onClick={() => setIsOpen(true)}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />
      <AIQuoteForm isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
