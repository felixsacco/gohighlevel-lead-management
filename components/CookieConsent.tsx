'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { analytics } from '@/lib/analytics';

const STORAGE_KEY = 'cookie-consent-v1';

type ConsentState = 'unknown' | 'accepted' | 'rejected';

export default function CookieConsent() {
  const [consent, setConsent] = useState<ConsentState>('unknown');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ConsentState | null;
      if (saved === 'accepted' || saved === 'rejected') {
        setConsent(saved);
      }
    } catch {}
  }, []);

  const acceptAll = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted');
      setConsent('accepted');
    } catch {}
    analytics.grantConsent();
  };

  const rejectNonEssential = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'rejected');
      setConsent('rejected');
    } catch {}
  };

  if (consent !== 'unknown') return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] w-full animate-[slideup_220ms_ease-out]">
      <style jsx>{`
        @keyframes slideup { from { transform: translateY(8px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
      {/*
        Full-width bar spanning the entire viewport width,
        filled with the brand light blue used on the One Search.
        Every Trade. cards (bg-sky-50).
      */}
      <div className="w-full border-t border-sky-200 bg-sky-50 shadow-[0_-8px_30px_rgba(15,23,42,0.10)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 sm:py-4 lg:px-8">
          <p className="text-sm leading-snug text-brand-navy">
            We use cookies to improve your experience. Read our
            {' '}<Link href="/privacy" className="underline underline-offset-4 decoration-brand-amber hover:text-brand-navyDark">Privacy</Link>
            {' '}and
            {' '}<Link href="/cookies" className="underline underline-offset-4 decoration-brand-amber hover:text-brand-navyDark">Cookies</Link>.
          </p>
          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
            <Button
              variant="outline"
              className="h-10 w-full rounded-xl border-brand-amber bg-transparent text-brand-navy font-bold hover:bg-brand-amber/10 px-5 text-sm sm:w-auto"
              onClick={rejectNonEssential}
            >
              Reject
            </Button>
            <Button
              className="h-10 w-full rounded-xl bg-brand-amber text-[#111111] font-bold hover:bg-brand-amber px-5 text-sm sm:w-auto"
              onClick={acceptAll}
            >
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
