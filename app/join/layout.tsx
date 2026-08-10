import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Join MyApproved | Find Verified Tradespeople or Grow Your Trade Business",
  description: "Join MyApproved as a homeowner to find trusted local tradespeople, or as a tradesperson to get quality leads across the UK. Free to register for homeowners.",
  keywords: "join MyApproved, register tradesperson UK, find tradespeople, homeowner registration, trade leads UK",
  alternates: { canonical: "https://myapproved.com/join" },
  openGraph: {
    title: "Join MyApproved | UK's Verified Tradespeople Platform",
    description: "Homeowners: find verified local tradespeople free. Tradespeople: get quality leads and grow your business across the UK.",
    url: "https://myapproved.com/join",
    siteName: "MyApproved",
    locale: "en_GB",
    type: "website",
  },
};

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
