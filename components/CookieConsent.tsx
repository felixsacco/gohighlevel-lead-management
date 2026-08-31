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
    <div className="fixed inset-x-0 bottom-0 left-0 right-0 z-[9999] flex justify-center px-4 pb-4 animate-[slideup_220ms_ease-out]">
      <style jsx>{`
        @keyframes slideup { from { transform: translateY(8px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
      <div className="w-full max-w-md rounded-xl border border-brand-navy/10 bg-brand-navy/5 backdrop-blur-md shadow-2xl shadow-black/40 px-5 py-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-brand-navy">
            We use cookies to improve your experience. Read our
            {' '}<Link href="/privacy" className="underline underline-offset-4 decoration-brand-amber hover:text-brand-navyDark">Privacy</Link>
            {' '}and
            {' '}<Link href="/cookies" className="underline underline-offset-4 decoration-brand-amber hover:text-brand-navyDark">Cookies</Link>.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-9 flex-1 rounded-xl border-brand-amber bg-transparent text-brand-navy font-bold hover:bg-brand-amber/10 px-4 text-sm"
              onClick={rejectNonEssential}
            >
              Reject
            </Button>
            <Button
              className="h-9 flex-1 rounded-xl bg-brand-amber text-[#111111] font-bold hover:bg-brand-amber px-4 text-sm"
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
