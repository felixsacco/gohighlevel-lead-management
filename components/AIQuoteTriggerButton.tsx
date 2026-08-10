"use client";

import { ReactNode } from "react";

interface Props {
  label?: string;
  className?: string;
  children?: ReactNode;
}

export default function AIQuoteTriggerButton({
  label = "Get Free Quotes",
  className = "",
  children,
}: Props) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("open-ai-quote"))}
      className={className}
    >
      {children ?? label}
    </button>
  );
}
