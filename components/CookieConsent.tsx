'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
  };

  const rejectNonEssential = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'rejected');
      setConsent('rejected');
    } catch {}
  };

  if (consent !== 'unknown') return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 animate-[slideup_220ms_ease-out]">
      <style jsx>{`
        @keyframes slideup { from { transform: translateY(8px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pb-3">
        <div className="rounded-xl border border-blue-100 bg-white/95 backdrop-blur shadow-lg px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-blue-900/90">
              We use cookies to improve your experience. Read our
              {' '}<Link href="/privacy" className="underline underline-offset-4 decoration-yellow-400 hover:text-blue-700">Privacy</Link>
              {' '}and
              {' '}<Link href="/cookies" className="underline underline-offset-4 decoration-yellow-400 hover:text-blue-700">Cookies</Link>.
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="h-9 rounded-lg border-blue-200 text-blue-900 hover:bg-blue-50 px-3 text-sm"
                onClick={rejectNonEssential}
              >
                Reject
              </Button>
              <Button
                className="h-9 rounded-lg bg-[#fdbd18] text-blue-900 font-bold hover:brightness-95 px-4 text-sm"
                onClick={acceptAll}
              >
                Accept
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
