import { Metadata } from 'next';

const baseUrl = 'https://myapproved.com';
const siteName = 'MyApproved';
const defaultImage = '/og-default.jpg';

interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
  structuredData?: any;
}

const defaultSEO: SEOConfig = {
  title: 'MyApproved - Find Trusted Local Tradespeople | UK\'s #1 Platform',
  description: 'Find verified, reliable tradespeople in your area. Connect with approved plumbers, electricians, builders, and more.',
  keywords: ['tradespeople', 'plumber', 'electrician', 'builder', 'handyman', 'home improvement'],
  ogImage: defaultImage,
  canonical: baseUrl
};

const seoPages: Record<string, SEOConfig> = {
  home: {
    title: 'MyApproved - Find Trusted Local Tradespeople | UK\'s #1 Platform',
    description: 'Find verified, reliable tradespeople in your area. Connect with approved plumbers, electricians, builders, and more. Get instant quotes, compare services, and hire with confidence on MyApproved.',
    keywords: ['tradespeople', 'plumber', 'electrician', 'builder', 'handyman', 'home improvement', 'local trades', 'verified professionals', 'quotes', 'UK', 'trusted', 'reliable', 'approved', 'certified'],
    ogImage: '/og-home.jpg',
    canonical: baseUrl,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "MyApproved",
      "url": baseUrl,
      "logo": `${baseUrl}/logo.png`,
      "description": "UK's #1 platform for finding trusted local tradespeople"
    }
  },
  
  findTradespeople: {
    title: 'Find Local Tradespeople Near You | MyApproved',
    description: 'Search and find verified local tradespeople in your area. Browse profiles, read reviews, and get instant quotes from trusted professionals.',
    keywords: ['find tradespeople', 'local trades', 'search professionals', 'verified tradesmen'],
    canonical: `${baseUrl}/find-tradespeople`
  },

  registerClient: {
    title: 'Register as Client | Get Free Quotes from Tradespeople | MyApproved',
    description: 'Join thousands of satisfied customers. Register for free and get instant quotes from verified tradespeople in your area.',
    keywords: ['register client', 'customer signup', 'free quotes', 'join MyApproved'],
    canonical: `${baseUrl}/register/client`
  },

  registerTradesperson: {
    title: 'Join as Tradesperson | Grow Your Business | MyApproved',
    description: 'Join the UK\'s leading platform for tradespeople. Connect with customers, grow your business, and get verified today.',
    keywords: ['join tradespeople', 'tradesman signup', 'grow business', 'verified professional'],
    canonical: `${baseUrl}/register/tradesperson`
  },

  instantQuote: {
    title: 'Get Instant Quote | MyApproved - Free Tradesperson Quotes in Minutes',
    description: 'Get instant quotes from verified tradespeople near you. Compare prices, read reviews, and hire the best professional for your project in minutes.',
    keywords: ['instant quote', 'tradesperson quotes', 'free quotes', 'compare prices', 'hire tradespeople'],
    canonical: `${baseUrl}/instant-quote`
  },

  postJob: {
    title: 'Post a Job | MyApproved - Find Tradespeople for Your Project',
    description: 'Post your job and get quotes from verified tradespeople. Free to post, easy to manage, and find the perfect professional for your project.',
    keywords: ['post job', 'hire tradespeople', 'find professionals', 'job posting', 'tradesperson hiring'],
    canonical: `${baseUrl}/post-job`
  },

  about: {
    title: 'About Us | MyApproved - UK\'s Trusted Tradesperson Platform',
    description: 'Learn about MyApproved\'s mission to connect homeowners with trusted, verified tradespeople across the UK. Our story, values, and commitment to quality.',
    keywords: ['about MyApproved', 'company story', 'mission', 'trusted tradespeople', 'UK platform'],
    canonical: `${baseUrl}/about`
  },

  contact: {
    title: 'Contact Us | MyApproved - Get in Touch with Our Support Team',
    description: 'Contact MyApproved for support, questions, or feedback. Multiple ways to reach us including phone, email, and live chat.',
    keywords: ['contact MyApproved', 'customer support', 'help', 'get in touch', 'support team'],
    canonical: `${baseUrl}/contact`
  },

  faq: {
    title: 'FAQ - Frequently Asked Questions | MyApproved',
    description: 'Find answers to common questions about MyApproved. Learn how to find tradespeople, post jobs, get quotes, and more.',
    keywords: ['FAQ', 'frequently asked questions', 'help', 'support', 'how to use MyApproved'],
    canonical: `${baseUrl}/faq`
  },

  sitemap: {
    title: 'Sitemap | MyApproved - All Pages and Sections',
    description: 'Complete sitemap of MyApproved website. Find all pages, services, and sections easily.',
    keywords: ['sitemap', 'site navigation', 'all pages', 'website structure', 'MyApproved pages'],
    canonical: `${baseUrl}/sitemap`
  }
};

export function generateMetadata(pageKey: string, customSEO?: Partial<SEOConfig>): Metadata {
  const seo = { ...defaultSEO, ...seoPages[pageKey], ...customSEO };
  
  return {
    metadataBase: new URL('https://myapproved.com'),
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords.join(', '),
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    robots: seo.noIndex ? 'noindex,nofollow' : 'index,follow',
    
    // Canonical URL
    alternates: seo.canonical ? {
      canonical: seo.canonical
    } : undefined,
    
    // Open Graph
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.canonical || baseUrl,
      siteName: siteName,
      images: [{
        url: seo.ogImage || defaultImage,
        width: 1200,
        height: 630,
        alt: seo.title
      }],
      locale: 'en_GB',
      type: 'website'
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: [seo.ogImage || defaultImage],
      creator: '@MyApproved'
    },
    
    // Additional meta tags
    other: {
      'application-name': siteName,
      'apple-mobile-web-app-title': siteName,
      'format-detection': 'telephone=no',
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'theme-color': '#1e3a8a',
      'color-scheme': 'light'
    }
  };
}

export function generateSchema(pageKey: string): string | null {
  const seo = seoPages[pageKey];
  return seo?.structuredData ? JSON.stringify(seo.structuredData) : null;
}
