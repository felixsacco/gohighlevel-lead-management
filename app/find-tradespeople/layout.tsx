import type { Metadata } from 'next';
import { TRADES } from '@/lib/seo-data';
import { graphify } from '@/components/SchemaMarkup';

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
  const schema = graphify([
    {
      "@context": "https://schema.org",
      "@type": "SearchResultsPage",
      "@id": "https://myapproved.com/find-tradespeople",
      "url": "https://myapproved.com/find-tradespeople",
      "name": "Find Verified Tradespeople UK",
      "description": "Search and compare verified, insured local tradespeople across the UK. Filter by trade type and location.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://myapproved.com/find-tradespeople?search={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://myapproved.com" },
          { "@type": "ListItem", "position": 2, "name": "Find Tradespeople", "item": "https://myapproved.com/find-tradespeople" }
        ]
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "url": "https://myapproved.com/find-tradespeople",
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": ["h1", "h2", "[data-speakable]"]
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Verified Tradespeople by Trade Type - UK",
      "description": "Browse all 33 verified trade categories available on MyApproved across the United Kingdom.",
      "url": "https://myapproved.com/find-tradespeople",
      "numberOfItems": TRADES.length,
      "itemListElement": TRADES.map((trade, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "name": `Verified ${trade.plural} UK`,
        "description": trade.description,
        "url": `https://myapproved.com/find-tradespeople/${trade.slug}`
      }))
    }
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {children}
    </>
  );
}
