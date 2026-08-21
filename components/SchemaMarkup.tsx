import React from 'react';

interface SchemaMarkupProps {
  schema: any;
}

export const SchemaMarkup: React.FC<SchemaMarkupProps> = ({ schema }) => {
  const html =
    typeof schema === 'object' && schema !== null
      ? JSON.stringify(schema)
      : '';
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://myapproved.com/#organization",
  "name": "MyApproved",
  "legalName": "MyApproved Ltd",
  "url": "https://myapproved.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://myapproved.com/logo-icon.svg",
    "width": 512,
    "height": 512
  },
  "image": "https://myapproved.com/logo-icon.svg",
  "description": "MyApproved is a UK-wide tradespeople verification platform connecting homeowners nationwide with identity-checked local tradespeople whose public liability insurance is confirmed and monitored. No tradesperson is listed until identity, business and insurance checks have passed.",
  "foundingDate": "2024",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Stoke-on-Trent",
    "addressLocality": "Stoke-on-Trent",
    "addressRegion": "Staffordshire",
    "postalCode": "ST1",
    "addressCountry": "GB"
  },
  "areaServed": { "@type": "Country", "name": "United Kingdom" },
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "availableLanguage": ["English"],
      "areaServed": "GB",
      "url": "https://myapproved.com/contact"
    },
    {
      "@type": "ContactPoint",
      "contactType": "Technical Support",
      "availableLanguage": ["English"],
      "areaServed": "GB",
      "url": "https://myapproved.com/help"
    }
  ],
  "knowsAbout": [
    "Tradesperson Verification",
    "Home Improvement",
    "Plumbing Services UK",
    "Electrical Services UK",
    "Roofing Services UK",
    "Gas Safe Registered Engineers",
    "NICEIC Approved Electricians",
    "Building Services UK",
    "Tradesperson Insurance Verification",
    "Consumer Protection for Home Services"
  ],
  "hasCredential": {
    "@type": "EducationalOccupationalCredential",
    "credentialCategory": "Trade Verification Platform",
    "description": "MyApproved verifies tradesperson credentials against Gas Safe Register, NICEIC, NAPIT, FENSA, and MCS official registers"
  },
  "slogan": "Identity-checked Tradespeople. Free Quotes.",
  "sameAs": [
    process.env.NEXT_PUBLIC_TWITTER_URL,
    process.env.NEXT_PUBLIC_LINKEDIN_URL,
    process.env.NEXT_PUBLIC_FACEBOOK_URL,
    process.env.NEXT_PUBLIC_INSTAGRAM_URL
  ].filter(Boolean)
};

export const WebsiteSchema = () => {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://myapproved.com/#website",
    "name": "MyApproved",
    "alternateName": "My Approved",
    "url": "https://myapproved.com",
    "description": "Find identity-checked local tradespeople across the UK with public liability insurance confirmed and monitored. Compare free quotes and book trusted professionals - free for homeowners.",
    "inLanguage": "en-GB",
    "publisher": {
      "@id": "https://myapproved.com/#organization"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://myapproved.com/find-tradespeople?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return <SchemaMarkup schema={websiteSchema} />;
};

export const LocalBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://myapproved.com/#localbusiness",
  "name": "MyApproved",
  "image": "https://myapproved.com/logo-icon.svg",
  "url": "https://myapproved.com",
  "priceRange": "Free for homeowners",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Stoke-on-Trent",
    "addressRegion": "Staffordshire",
    "postalCode": "ST1",
    "addressCountry": "GB"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 53.0027,
    "longitude": -2.1794
  },
  "areaServed": { "@type": "Country", "name": "United Kingdom" },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
    "opens": "00:00",
    "closes": "23:59"
  },
  "sameAs": [
    process.env.NEXT_PUBLIC_FACEBOOK_URL,
    process.env.NEXT_PUBLIC_TWITTER_URL,
    process.env.NEXT_PUBLIC_LINKEDIN_URL,
    process.env.NEXT_PUBLIC_INSTAGRAM_URL
  ].filter(Boolean)
};

export const FAQSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I get a competitive, verified trade quote through MyApproved?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Post your job on MyApproved for free - takes under 2 minutes. You describe the work, set your location, and verified local tradespeople who match your job receive your enquiry. Each one has already passed MyApproved's checks: identity checked, business verified, and public liability insurance confirmed and monitored. They call you back with a fixed written quote - compare and hire with no obligation and no hidden fees. Most homeowners receive their first quote within a few hours."
      }
    },
    {
      "@type": "Question",
      "name": "Why does MyApproved verification protect homeowners better than Checkatrade or MyBuilder?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "MyApproved confirms each tradesperson's identity, verifies their business, and confirms and monitors their public liability insurance before they can receive a single quote request. No tradesperson is listed until these checks have passed. Cover is monitored and any lapse triggers immediate account suspension."
      }
    },
    {
      "@type": "Question",
      "name": "What are the benefits for independent tradespeople joining MyApproved instead of Checkatrade?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Checkatrade charges tradespeople £300+ per month on a 12-month contract regardless of lead volume. MyJobQuote charges £15–£80 per lead and sells the same lead to multiple competing trades. MyApproved charges £4.99 per accepted lead with no monthly subscription and no contract lock-in. Tradespeople only pay when they choose to accept a specific lead. The verified badge on MyApproved signals independently-confirmed credentials - not self-declaration - which converts at a higher rate with homeowners who are aware of rogue trader risks."
      }
    },
    {
      "@type": "Question",
      "name": "What is the step-by-step process for a tradesperson to get verified and start receiving leads on MyApproved?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Step 1: Register at myapproved.com/register/tradesperson - takes under 5 minutes. Step 2: Submit your government-issued photo ID for an identity check. Step 3: Provide your business details for business verification. Step 4: Upload your public liability insurance certificate - MyApproved confirms it with your insurer and monitors the cover. Once these checks pass, your profile goes live and you begin receiving matched lead enquiries at £4.99 per accepted lead."
      }
    },
    {
      "@type": "Question",
      "name": "Is MyApproved free for homeowners?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Posting a job, receiving quotes, and comparing tradesperson profiles on MyApproved is completely free for homeowners. You pay only the tradesperson for the work - MyApproved charges nothing to homeowners at any stage."
      }
    },
    {
      "@type": "Question",
      "name": "What trades are available on MyApproved across the UK?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "MyApproved covers 33 trades UK-wide including plumbers, electricians, roofers, gas engineers, builders, carpenters, painters and decorators, tilers, plasterers, locksmiths, bathroom fitters, kitchen fitters, landscapers, gardeners, handymen, window fitters, solar panel installers, heating engineers, loft conversion specialists, and driveway specialists. All are independently verified before listing."
      }
    }
  ]
};

export const BreadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://myapproved.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Find Tradespeople",
      "item": "https://myapproved.com/find-tradespeople"
    }
  ]
};

export const ServiceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://myapproved.com/#service",
  "name": "Verified Tradesperson Matching",
  "description": "MyApproved connects homeowners with identity-checked local tradespeople across the United Kingdom, with public liability insurance confirmed and monitored. Free quotes, no obligation.",
  "provider": {
    "@id": "https://myapproved.com/#organization"
  },
  "areaServed": { "@type": "Country", "name": "United Kingdom" },
  "serviceType": "Home Improvement Tradesperson Matching",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Trade Services",
    "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Emergency Plumber" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Electrician" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Roofer" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Gas Engineer" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Builder" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Carpenter" } }
    ]
  }
};
