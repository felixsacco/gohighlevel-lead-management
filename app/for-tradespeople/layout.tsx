import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Join MyApproved - Grow Your Trade Business | Get More Customers UK",
  description: "Join thousands of verified UK tradespeople on MyApproved. Get quality local leads, build your reputation with real reviews, and grow your trade business. Free to register.",
  keywords: "join tradespeople directory UK, grow trade business, tradesperson leads, verified tradesman platform, MyApproved for trades",
  alternates: { canonical: "https://myapproved.com/for-tradespeople" },
  openGraph: {
    title: "Grow Your Trade Business with MyApproved | UK Tradespeople Platform",
    description: "Get quality local leads, build your reputation, and grow your business. Join the UK's fastest-growing tradespeople verification platform - free to register.",
    url: "https://myapproved.com/for-tradespeople",
    siteName: "MyApproved",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grow Your Trade Business with MyApproved",
    description: "Quality leads, real reviews, verified profile. Join the UK's fastest-growing tradespeople platform.",
  },
};

export default function ForTradespeopleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "@id": "https://myapproved.com/for-tradespeople",
            "name": "MyApproved Tradesperson Membership",
            "description": "Lead generation and verification platform for UK tradespeople. Get quality local leads, build verified reputation, and grow your trade business.",
            "provider": {
              "@type": "Organization",
              "@id": "https://myapproved.com/#organization",
              "name": "MyApproved"
            },
            "areaServed": { "@type": "Country", "name": "United Kingdom" },
            "audience": {
              "@type": "Audience",
              "audienceType": "Tradespeople, Contractors, Trade Professionals"
            },
            "offers": [
              {
                "@type": "Offer",
                "name": "Pay Per Lead",
                "price": "4.99",
                "priceCurrency": "GBP",
                "description": "Pay £4.99 per accepted lead. No monthly commitment."
              },
              {
                "@type": "Offer",
                "name": "Unlimited Monthly",
                "price": "1000",
                "priceCurrency": "GBP",
                "description": "Unlimited leads for £1,000 per month. No per-lead fees."
              }
            ]
          })
        }}
      />
      {children}
    </>
  );
}
