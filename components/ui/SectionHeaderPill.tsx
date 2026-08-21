import { useId } from "react";

interface SectionHeaderPillProps {
  children: React.ReactNode;
}

/**
 * Section-header overline pill — replicates the homepage hero "Register overline":
 * a transparent pill with a single amber stroke, flanked by gradient rules and
 * small slotted screw/nail icons. Accepts the uppercase tracked text as children.
 */
export default function SectionHeaderPill({ children }: SectionHeaderPillProps) {
  const uid = useId();
  const leftId = `screwL-${uid}`;
  const rightId = `screwR-${uid}`;

  return (
    <p className="inline-flex items-center gap-3 text-[0.72rem] sm:text-xs font-semibold tracking-[0.22em] uppercase text-brand-amber mb-8 sm:mb-12">
      <span className="h-px w-8 sm:w-10 bg-gradient-to-r from-transparent to-brand-amber/60" aria-hidden="true"></span>
      <span className="relative px-7 py-1.5 border border-brand-amber/60">
        <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" className="absolute left-2 top-1/2 -translate-y-1/2 shrink-0">
          <defs>
            <radialGradient id={leftId} cx="0.35" cy="0.3" r="1">
              <stop offset="0" stop-color="#FFB800"/>
              <stop offset="1" stop-color="#FFB800"/>
            </radialGradient>
          </defs>
          <circle cx="12" cy="12" r="11" fill={`url(#${leftId})`}/>
          <circle cx="12" cy="12" r="10.2" fill="none" stroke="#0A2463" stroke-opacity="0.22" stroke-width="1.6"/>
          <circle cx="12" cy="12" r="7.4" fill="none" stroke="#0A2463" stroke-opacity="0.15" stroke-width="1"/>
          <rect x="2.6" y="10.1" width="18.8" height="3.8" rx="1.9" fill="#0A2463" fill-opacity="0.8" transform="rotate(28 12 12)"/>
          <path d="M4.8 8.4A9 9 0 0 1 11.6 3.3" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        </svg>
        <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" className="absolute right-2 top-1/2 -translate-y-1/2 shrink-0">
          <defs>
            <radialGradient id={rightId} cx="0.35" cy="0.3" r="1">
              <stop offset="0" stop-color="#FFB800"/>
              <stop offset="1" stop-color="#FFB800"/>
            </radialGradient>
          </defs>
          <circle cx="12" cy="12" r="11" fill={`url(#${rightId})`}/>
          <circle cx="12" cy="12" r="10.2" fill="none" stroke="#0A2463" stroke-opacity="0.22" stroke-width="1.6"/>
          <circle cx="12" cy="12" r="7.4" fill="none" stroke="#0A2463" stroke-opacity="0.15" stroke-width="1"/>
          <rect x="2.6" y="10.1" width="18.8" height="3.8" rx="1.9" fill="#0A2463" fill-opacity="0.8" transform="rotate(71 12 12)"/>
          <path d="M4.8 8.4A9 9 0 0 1 11.6 3.3" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        </svg>
        <span className="relative z-10">{children}</span>
      </span>
      <span className="h-px w-8 sm:w-10 bg-gradient-to-l from-transparent to-brand-amber/60" aria-hidden="true"></span>
    </p>
  );
}
