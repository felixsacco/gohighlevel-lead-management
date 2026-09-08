import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Find Verified Tradespeople Near You | Search by Trade & Location | MyApproved",
  description: "Search for verified, insured tradespeople across the UK. Filter by trade type and location, compare profiles and reviews, and get free quotes from local professionals.",
  keywords: "find tradespeople UK, search tradespeople near me, verified local trades, compare tradespeople, plumbers electricians builders near me",
  alternates: { canonical: "https://myapproved.com/find-tradespeople" },
  openGraph: {
    title: "Find Verified Tradespeople Near You | MyApproved UK",
    description: "Search verified, insured local tradespeople across the UK. Compare profiles, read real reviews, and get free quotes - no obligation.",
    url: "https://myapproved.com/find-tradespeople",
    siteName: "MyApproved",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Find Verified Tradespeople Near You | MyApproved UK",
    description: "Search verified local tradespeople. Compare reviews, get free quotes.",
  },
};

export default function FindTradespeopleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
