import './globals.css';
import './hero-animations.css';
import { SchemaMarkup, organizationSchema, WebsiteSchema, ServiceSchema, LocalBusinessSchema, FAQSchema, BreadcrumbSchema } from '@/components/SchemaMarkup';
import type { Metadata } from 'next';
import EnhancedHeader from '@/components/EnhancedHeader';
import Footer from '@/components/Footer';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';
import { ReCaptchaProvider } from '@/components/ReCaptchaProvider';
import AIQuoteFormProvider from '@/components/AIQuoteFormProvider';

const baseUrl = 'https://myapproved.com';

export const metadata: Metadata = {
  metadataBase: new URL('https://myapproved.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-GB': '/en-gb',
    },
  },
  title: 'MyApproved - Find Verified & Approved Tradespeople Nationwide',
  description: 'Find verified, insured local tradespeople across the UK. Compare plumbers, electricians, roofers, builders & 24+ trades. Free quotes, real reviews, ID-checked professionals. No obligation.',
  applicationName: 'MyApproved',
  authors: [{ name: 'MyApproved', url: 'https://myapproved.com' }],
  category: 'Home Services',
  creator: 'MyApproved',
  publisher: 'MyApproved',
  formatDetection: {
    email: false,
    address: false,
    telephone: true,
  },
  openGraph: {
    title: 'MyApproved - Verified & Approved Tradespeople Nationwide',
    description: 'Find verified, insured tradespeople across the UK. Free quotes, real reviews, ID-checked professionals. Plumbers, electricians, roofers & 24+ trades.',
    url: baseUrl,
    siteName: 'MyApproved',
    locale: 'en_GB',
    type: 'website',
    images: [
      {
        url: `${baseUrl}/images/new-og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Transforming Homes with MyApproved',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyApproved - Verified & Approved Tradespeople Nationwide',
    description: 'Find verified, insured tradespeople across the UK. Free quotes, real reviews, ID-checked professionals.',
    images: [`${baseUrl}/images/twitter-image.jpg`],
    creator: '@myapproved',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'ferjstUZHhIE6kYLP1O8Jptch0hICiQHHLWXpmH7Vk8',
  },
  icons: {
    icon: '/logo-icon.svg',
    shortcut: '/logo-icon.svg',
    apple: '/logo-icon.svg',
  },
};
const fixedHeaderStyles = `
  :root {
    /* Nav bar + trust bar (see EnhancedHeader fixed stack) */
    --header-height: 120px;
  }

  @media (max-width: 768px) {
    :root {
      --header-height: 100px;
    }
  }

  body {
    padding-top: var(--header-height);
  }
`;

const schemas = [
  organizationSchema,
  WebsiteSchema,
  ServiceSchema,
  LocalBusinessSchema,
  FAQSchema,
  BreadcrumbSchema
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: fixedHeaderStyles }} />
        {schemas.map((schema, index) => (
          <SchemaMarkup key={index} schema={schema} />
        ))}
      </head>
      <body className="font-sans bg-gray-50 overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Skip-to-content - accessibility + crawl efficiency: bots skip nav DOM immediately */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[#002FA7] focus:text-white focus:rounded-md focus:text-sm focus:font-semibold"
        >
          Skip to main content
        </a>
        <AnalyticsProvider>
          <ReCaptchaProvider>
          <AIQuoteFormProvider />
          {/* Landmark: header - crawlers map nav and trust signals here, not in main */}
          <header role="banner">
            <EnhancedHeader />
          </header>
          {/* Landmark: main - primary indexable content zone, zero ambiguity for bots */}
          <main id="main-content" role="main">
            {children}
          </main>
          {/* Landmark: footer - crawlers treat this as low-priority supplementary content */}
          <footer role="contentinfo">
            <Footer />
          </footer>
          </ReCaptchaProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
