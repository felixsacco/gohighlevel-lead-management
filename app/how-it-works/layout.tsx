import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How MyApproved Works - Find & Hire Verified Tradespeople in the UK",
  description: "Find, compare, and hire verified tradespeople in 4 simple steps. Post your job free, get quotes from insured professionals, and book with confidence.",
  alternates: { canonical: "https://myapproved.com/how-it-works" },
  openGraph: {
    title: "How MyApproved Works | Find Verified Tradespeople UK",
    description: "Post your job free. Get quotes from ID-checked, insured tradespeople. Compare and hire with confidence.",
    url: "https://myapproved.com/how-it-works",
    siteName: "MyApproved",
    locale: "en_GB",
    type: "website",
  },
};

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
