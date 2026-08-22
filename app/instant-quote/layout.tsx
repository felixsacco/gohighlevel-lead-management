import type { Metadata } from 'next';
import { graphify } from '@/components/SchemaMarkup';

export const metadata: Metadata = {
  title: "Get Free Quotes from Verified Tradespeople | MyApproved UK",
  description: "Post your job and get free quotes from identity-checked, insured tradespeople in your area. They call you back, you compare prices, read reviews, and hire with confidence. Takes 2 minutes.",
  keywords: "free quotes tradespeople UK, instant tradesperson quote, compare trade quotes, get quotes plumber electrician builder UK",
  alternates: { canonical: "https://myapproved.com/instant-quote" },
  openGraph: {
    title: "Get Free Quotes from Verified Tradespeople | MyApproved",
    description: "Post your job free. Receive quotes from insured, identity-checked local tradespeople who call you back. Compare and hire - no obligation.",
    url: "https://myapproved.com/instant-quote",
    siteName: "MyApproved",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Get Free Quotes from Verified Tradespeople | MyApproved",
    description: "Compare quotes from insured local tradespeople. Free, fast, no obligation.",
  },
};

export default function InstantQuoteLayout({ children }: { children: React.ReactNode }) {
  const schema = graphify([
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://myapproved.com/#organization",
      "name": "MyApproved",
      "url": "https://myapproved.com",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://myapproved.com/instant-quote",
      "url": "https://myapproved.com/instant-quote",
      "name": "Get Free Quotes from Verified Tradespeople",
      "description": "Post your home improvement job and receive free quotes from identity-checked, insured local tradespeople across the UK.",
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://myapproved.com" },
          { "@type": "ListItem", "position": 2, "name": "Get Free Quotes", "item": "https://myapproved.com/instant-quote" }
        ]
      }
    },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema)
        }}
      />
      {children}
    </>
  );
}
