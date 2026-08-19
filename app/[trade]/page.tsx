/**
 * Trade-Specific SEO Landing Page
 * URL Pattern: /{trade} (e.g., /plumber, /electrician)
 * Targets: Trade-specific searches without location
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TRADES, LOCATIONS, generateTradeLocationMetadata } from '@/lib/seo-data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import AEOContentBlock from '@/components/AEOContentBlock';
import AIQuoteTriggerButton from '@/components/AIQuoteTriggerButton';
import {
  Star,
  Shield,
  MapPin,
  CheckCircle,
  ArrowRight,
  Award,
  BadgeCheck,
  Search
} from 'lucide-react';

export async function generateStaticParams() {
  return TRADES.map(trade => ({
    trade: trade.slug
  }));
}

export async function generateMetadata({ 
  params 
}: { 
  params: { trade: string } 
}): Promise<Metadata> {
  const trade = TRADES.find(t => t.slug === params.trade);
  
  if (!trade) {
    return {
      title: 'Page Not Found | MyApproved',
      robots: { index: false }
    };
  }
  
  const title = `Find ${trade.plural} Near You | Business-verified ${trade.name}s UK - Get Free Quotes | MyApproved`;
  const description = `Find business-verified ${trade.plural.toLowerCase()} near you. Compare ${trade.plural.toLowerCase()}, read reviews, and get free quotes from local professionals. All ${trade.name.toLowerCase()}s identity checked, public liability insurance confirmed, and rated. Book today.`;
  
  return {
    title,
    description,
    keywords: [
      trade.name.toLowerCase(),
      trade.plural.toLowerCase(),
      `find ${trade.name.toLowerCase()}`,
      `local ${trade.name.toLowerCase()}`,
      `business-verified ${trade.name.toLowerCase()}`,
      `hire ${trade.name.toLowerCase()}`,
      `${trade.name.toLowerCase()} near me`,
      `${trade.name.toLowerCase()} quotes`,
      ...trade.services.map(s => s.toLowerCase()),
      ...trade.keywords
    ].join(', '),
    alternates: {
      canonical: `https://myapproved.com/find-tradespeople/${params.trade}`
    },
    robots: { index: false },
    openGraph: {
      title: `${trade.plural} Near You | Business-verified ${trade.name}s - Free Quotes`,
      description: `Connect with business-verified ${trade.plural.toLowerCase()} in your area. Free quotes, verified reviews, same-day service available.`,
      url: `https://myapproved.com/find-tradespeople/${params.trade}`,
      siteName: 'MyApproved',
      locale: 'en_GB',
      type: 'website'
    }
  };
}

export default function TradePage({ 
  params 
}: { 
  params: { trade: string } 
}) {
  const trade = TRADES.find(t => t.slug === params.trade);
  
  if (!trade) {
    notFound();
  }
  
  // Get priority locations for this trade
  const priorityLocations = LOCATIONS
    .filter(l => l.priority <= 2)
    .sort((a, b) => b.population - a.population)
    .slice(0, 24);
  
  const relatedTrades = TRADES
    .filter(t => t.category === trade.category && t.slug !== trade.slug)
    .slice(0, 6);
  
  return (
    <>
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "@id": `https://myapproved.com/${trade.slug}#service`,
            "name": `${trade.name} Services`,
            "description": `Find business-verified ${trade.plural.toLowerCase()} with confirmed public liability cover across the UK. Identity-checked professionals, real customer reviews, free no-obligation quotes.`,
            "provider": {
              "@type": "Organization",
              "@id": "https://myapproved.com/#organization",
              "name": "MyApproved",
              "url": "https://myapproved.com"
            },
            "serviceType": trade.name,
            "areaServed": { "@type": "Country", "name": "United Kingdom" },
            "url": `https://myapproved.com/${trade.slug}`,
            "offers": {
              "@type": "Offer",
              "description": `Free no-obligation quotes from business-verified ${trade.plural.toLowerCase()} in your area`,
              "price": "0",
              "priceCurrency": "GBP",
              "availability": "https://schema.org/InStock"
            }
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": `How much does a ${trade.name.toLowerCase()} cost near me?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `${trade.name} costs in the UK vary by region and job complexity. Most ${trade.plural.toLowerCase()} charge an hourly rate plus materials. Use MyApproved to get up to 3 free quotes from business-verified local ${trade.plural.toLowerCase()} and compare exact costs for your project.`
                }
              },
              {
                "@type": "Question",
                "name": `How do I find a business-verified ${trade.name.toLowerCase()} in my area?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `Use MyApproved to find business-verified ${trade.plural.toLowerCase()} near you. Every ${trade.name.toLowerCase()} on our platform is identity checked, public liability insurance confirmed (minimum £2M), and reviewed by real local customers. Post your job free and receive quotes within hours.`
                }
              },
              {
                "@type": "Question",
                "name": `Is public liability insurance on MyApproved ${trade.plural.toLowerCase()} confirmed?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `Yes. All ${trade.plural.toLowerCase()} on MyApproved hold public liability cover of at least £2m, confirmed and monitored before they can list on the platform. Cover is monitored and the listing is withdrawn if it lapses.`
                }
              },
              {
                "@type": "Question",
                "name": `What is the cheapest way to find a reliable ${trade.name.toLowerCase()}?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `Post your job for free on MyApproved and receive up to 3 competitive quotes from business-verified local ${trade.plural.toLowerCase()}. Comparing quotes is the fastest way to get the best price — and all ${trade.plural.toLowerCase()} have passed identity, business and insurance checks so you don't need to sacrifice quality for cost.`
                }
              }
            ]
          })
        }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* AEO Answer Block */}
        <AEOContentBlock
          tradeType={params.trade}
          city="the UK"
          averageRating={Number(process.env.NEXT_PUBLIC_AGGREGATE_RATING_VALUE) || 4.9}
          reviewCount={Number(process.env.NEXT_PUBLIC_AGGREGATE_REVIEW_COUNT) || 850}
        />

        {/* Breadcrumb */}
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li><Link href="/" className="hover:text-blue-900">Home</Link></li>
              <li><span className="text-gray-400">/</span></li>
              <li className="text-blue-900 font-medium">{trade.name}s</li>
            </ol>
          </div>
        </nav>

        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-900 to-blue-800 text-white pb-16 sm:pb-20 pt-8 sm:pt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
                Find {trade.plural} Near You
                <span className="block text-xl sm:text-2xl md:text-3xl font-semibold text-yellow-400 mt-2">
                  Business-verified, Rated & Ready to Quote
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Find trusted {trade.plural.toLowerCase()} across the UK. Compare local professionals, 
                read verified reviews, and get free quotes for your project.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <span className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span className="font-medium">Identity checked</span>
                </span>
                <span className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <span className="font-medium">£2M Public liability cover</span>
                </span>
                <span className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="font-medium">{process.env.NEXT_PUBLIC_AGGREGATE_RATING_VALUE || '4.9'}/5 Rated</span>
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <AIQuoteTriggerButton className="inline-flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold px-8 py-6 text-lg rounded-lg transition-colors">
                  Get Free Quotes
                  <ArrowRight className="ml-2 w-5 h-5" />
                </AIQuoteTriggerButton>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
                  asChild
                >
                  <Link href={`/find-tradespeople?trade=${trade.slug}`}>
                    <Search className="mr-2 w-5 h-5" />
                    Browse {trade.plural}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 mb-4">
                {trade.name} Services We Offer
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our business-verified {trade.plural.toLowerCase()} provide comprehensive services
                for your home and business.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {trade.services.map((service, index) => (
                <div 
                  key={index}
                  className="bg-gray-50 rounded-xl p-4 text-center hover:shadow-md transition-shadow"
                >
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-blue-900">{service}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Locations Grid */}
        <section className="py-12 sm:py-16 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 mb-4">
                Find {trade.plural} by Location
              </h2>
              <p className="text-lg text-gray-600">
                Browse {trade.plural.toLowerCase()} in major towns and cities across the UK.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {priorityLocations.map(location => {
                const locationSlug = location.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                return (
                  <Link
                    key={location.name}
                    href={`/find-tradespeople/${trade.slug}/${locationSlug}`}
                    className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-blue-900 group-hover:text-blue-700">
                          {trade.name}s in {location.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{location.region}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-blue-300 group-hover:text-blue-600" />
                    </div>
                  </Link>
                );
              })}
            </div>
            
            <div className="text-center mt-8">
              <Button variant="outline" className="border-blue-600 text-blue-600" asChild>
                <Link href="/find-tradespeople">
                  View All Locations
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Why Choose */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 mb-12 text-center">
              Why Hire {trade.name}s Through MyApproved?
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BadgeCheck className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-blue-900 mb-2">Business verified</h3>
                <p className="text-gray-600 text-sm">
                  Every {trade.name.toLowerCase()} is identity checked and business verified before joining.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-blue-900 mb-2">£2M Public liability cover</h3>
                <p className="text-gray-600 text-sm">
                  All {trade.plural.toLowerCase()} hold public liability cover of at least £2m, confirmed and monitored.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="font-bold text-blue-900 mb-2">Real Reviews</h3>
                <p className="text-gray-600 text-sm">
                  Read genuine reviews from verified customers who hired our {trade.plural.toLowerCase()}.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-bold text-blue-900 mb-2">Free Quotes</h3>
                <p className="text-gray-600 text-sm">
                  Get up to 3 free quotes from {trade.plural.toLowerCase()} with no obligation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Related Trades */}
        {relatedTrades.length > 0 && (
          <section className="py-12 sm:py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-8 text-center">
                Related Trades You Might Need
              </h2>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedTrades.map(relatedTrade => (
                  <Link
                    key={relatedTrade.slug}
                    href={`/find-tradespeople/${relatedTrade.slug}`}
                    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-bold text-blue-900 mb-2">{relatedTrade.name}s</h3>
                    <p className="text-sm text-gray-600 mb-4">{relatedTrade.description.slice(0, 80)}...</p>
                    <span className="text-blue-600 text-sm font-medium inline-flex items-center">
                      Find {relatedTrade.plural} <ArrowRight className="ml-1 w-4 h-4" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Ready to Find Your {trade.name}?
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              Get free quotes from business-verified {trade.plural.toLowerCase()} in your area.
              Compare prices, read reviews, and hire with confidence.
            </p>
            
            <AIQuoteTriggerButton className="inline-flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold px-10 py-6 text-lg rounded-lg transition-colors">
              Get Free Quotes Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </AIQuoteTriggerButton>
          </div>
        </section>
      </div>
    </>
  );
}
