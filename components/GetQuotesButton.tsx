"use client";

export default function GetQuotesButton() {
  const open = () => window.dispatchEvent(new CustomEvent("open-ai-quote"));

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
