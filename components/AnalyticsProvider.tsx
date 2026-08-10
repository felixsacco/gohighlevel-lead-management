"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { analytics } from '@/lib/analytics';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize analytics
    analytics.init();
  }, []);

  useEffect(() => {
    // Track page views on route changes
    if (pathname) {
      analytics.trackPageView(pathname);
    }
  }, [pathname]);

  return <>{children}</>;
}
