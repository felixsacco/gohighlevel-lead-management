/**
 * Programmatic Trade + Location SEO Page
 * Generates optimised landing pages for every trade/location combination
 * URL Pattern: /{trade}/{location}  (e.g., /plumber/london, /electrician/manchester)
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TRADES, LOCATIONS, generateTradeLocationMetadata, generateTradeLocationSchema } from '@/lib/seo-data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import AEOContentBlock from '@/components/AEOContentBlock';
import AIQuoteTriggerButton from '@/components/AIQuoteTriggerButton';
import { 
  Star, 
  Shield, 
  MapPin, 
  CheckCircle, 
  Clock, 
  Phone, 
  ArrowRight,
  Award,
  BadgeCheck
} from 'lucide-react';

// Generate static paths for all trade/location combinations
export async function generateStaticParams() {
  const params: { trade: string; location: string }[] = [];
  
  for (const trade of TRADES) {
    for (const location of LOCATIONS) {
      const locationSlug = location.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      params.push({
        trade: trade.slug,
        location: locationSlug
      });
    }
  }
  
  return params;
}

// Generate dynamic metadata for each page
export async function generateMetadata({ 
  params 
}: { 
  params: { trade: string; location: string } 
}): Promise<Metadata> {
  const metadata = generateTradeLocationMetadata(params.trade, params.location);
  
  if (!metadata) {
    return {
      title: 'Page Not Found | MyApproved',
      robots: { index: false }
    };
  }
  
  return {
    title: metadata.title,
    description: metadata.description,
    alternates: {
      canonical: `https://myapproved.com/find-tradespeople/${params.trade}/${params.location}`
    },
    openGraph: {
      title: metadata.openGraph.title,
      description: metadata.openGraph.description,
      url: `https://myapproved.com/find-tradespeople/${params.trade}/${params.location}`,
      siteName: 'MyApproved',
      locale: 'en_GB',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description
    },
    robots: { index: false }
  };
}

export default function TradeLocationPage({ 
  params 
}: { 
  params: { trade: string; location: string } 
}) {
  // Find trade and location data
  const trade = TRADES.find(t => t.slug === params.trade);
  const location = LOCATIONS.find(l => 
    l.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === params.location
  );
  
  if (!trade || !location) {
    notFound();
  }
  
  const schema = generateTradeLocationSchema(params.trade, params.location);
  const relatedTrades = TRADES.filter(t => t.category === trade.category && t.slug !== trade.slug).slice(0, 4);
  const nearbyLocations = LOCATIONS.filter(l => 
    l.region === location.region && l.name !== location.name
  ).slice(0, 6);
  
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": `https://myapproved.com/${params.trade}/${params.location}`,
            name: `${trade.name}s in ${location.name} | Verified & Approved | MyApproved`,
            description: `Find insured, ID-checked ${trade.plural.toLowerCase()} in ${location.name}. Compare verified profiles, read real customer reviews, and get free no-obligation quotes on MyApproved.`,
            url: `https://myapproved.com/${params.trade}/${params.location}`,
            image: "https://myapproved.com/logo-icon.svg",
            logo: {
              "@type": "ImageObject",
              url: "https://myapproved.com/logo-icon.svg",
              width: 512,
              height: 512,
            },
            priceRange: `£${trade.hourlyRate}/hr`,
            currenciesAccepted: "GBP",
            paymentAccepted: "Cash, Credit Card, Bank Transfer",
            address: {
              "@type": "PostalAddress",
              addressLocality: location.name,
              addressRegion: location.region || "England",
              addressCountry: "GB",
            },
            areaServed: {
              "@type": "City",
              name: location.name,
              containedInPlace: {
                "@type": "AdministrativeArea",
                name: location.region || "England",
                containedInPlace: {
                  "@type": "Country",
                  name: "United Kingdom",
                },
              },
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://myapproved.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Find Tradespeople",
                item: "https://myapproved.com/find-tradespeople",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: trade.plural,
                item: `https://myapproved.com/find-tradespeople/${params.trade}`,
              },
              {
                "@type": "ListItem",
                position: 4,
                name: location.name,
                item: `https://myapproved.com/find-tradespeople/${params.trade}/${params.location}`,
              },
            ],
          }),
        }}
      />

      {/* FAQPage Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": `How much does a ${trade.name.toLowerCase()} cost in ${location.name}?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `${trade.name}s in ${location.name} typically charge ${trade.hourlyRate} per hour. Fixed-price quotes are available for larger jobs. Emergency call-outs may incur additional charges, especially evenings and weekends. Get free quotes from verified local ${trade.plural.toLowerCase()} to compare exact costs.`
                }
              },
              {
                "@type": "Question",
                "name": `Are MyApproved ${trade.plural.toLowerCase()} in ${location.name} insured?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `Yes. All ${trade.plural.toLowerCase()} on MyApproved carry minimum £2M public liability insurance. We verify insurance documents before any tradesperson can join or receive a quote request.`
                }
              },
              {
                "@type": "Question",
                "name": `How quickly can I get a ${trade.name.toLowerCase()} in ${location.name}?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `Many MyApproved ${trade.plural.toLowerCase()} in ${location.name} offer same-day or next-day service. For emergencies, post your job free and you'll typically receive quotes within a few hours.`
                }
              },
              {
                "@type": "Question",
                "name": `How do I choose the best ${trade.name.toLowerCase()} in ${location.name}?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `Compare ${trade.plural.toLowerCase()} based on verified reviews, qualifications, response time, and quotes. All MyApproved ${trade.plural.toLowerCase()} are ID-checked and insurance-verified, so you can focus on finding the right fit for your project.`
                }
              }
            ]
          })
        }}
      />

      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": trade.name,
                "item": `https://myapproved.com/find-tradespeople/${trade.slug}`
              },
              {
                "@type": "ListItem",
                "position": 4,
                "name": location.name,
                "item": `https://myapproved.com/find-tradespeople/${trade.slug}/${params.location}`
              }
            ]
          })
        }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* AEO Answer Block */}
        <AEOContentBlock
          tradeType={params.trade}
          city={location.name}
          averageRating={Number(process.env.NEXT_PUBLIC_AGGREGATE_RATING_VALUE) || 4.9}
          reviewCount={Number(process.env.NEXT_PUBLIC_AGGREGATE_REVIEW_COUNT) || 200}
        />

        {/* Breadcrumb Navigation */}
        <nav className="bg-white border-b border-gray-200" aria-label="Breadcrumb">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li><Link href="/" className="hover:text-blue-900">Home</Link></li>
              <li><span className="text-gray-400">/</span></li>
              <li><Link href="/find-tradespeople" className="hover:text-blue-900">Find Tradespeople</Link></li>
              <li><span className="text-gray-400">/</span></li>
              <li><Link href={`/find-tradespeople/${trade.slug}`} className="hover:text-blue-900">{trade.name}</Link></li>
              <li><span className="text-gray-400">/</span></li>
              <li className="text-blue-900 font-medium">{location.name}</li>
            </ol>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-900 to-blue-800 text-white pb-16 sm:pb-20 pt-8 sm:pt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                {trade.name}s in {location.name}
                <span className="block text-xl sm:text-2xl md:text-3xl font-semibold text-yellow-400 mt-2">
                  Verified, Insured & Ready to Help
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Find trusted {trade.name.toLowerCase()}s in {location.name}. Compare quotes from verified local professionals. 
                All {trade.plural.toLowerCase()} checked, insured, and rated by real customers.
              </p>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <span className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span className="font-medium">ID Verified</span>
                </span>
                <span className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <span className="font-medium">£2M Insured</span>
                </span>
                <span className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="font-medium">{process.env.NEXT_PUBLIC_AGGREGATE_RATING_VALUE || '4.9'}/5 Rated</span>
                </span>
              </div>
              
              {/* Primary CTA with Urgency */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <AIQuoteTriggerButton className="inline-flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold px-8 py-6 text-lg rounded-lg transition-colors animate-pulse">
                  Get Free Quotes
                  <ArrowRight className="ml-2 w-5 h-5" />
                </AIQuoteTriggerButton>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
                  asChild
                >
                  <Link href={`/find-tradespeople?trade=${trade.slug}&location=${location.name}`}>
                    Browse {trade.plural}
                  </Link>
                </Button>
              </div>
              
              {/* Response time */}
              <p className="mt-4 text-yellow-300 font-semibold flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                Free quotes from local, verified {trade.plural.toLowerCase()} in {location.name}
              </p>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 mb-4">
                {trade.name} Services in {location.name}
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our {location.name} {trade.plural.toLowerCase()} offer a wide range of professional services 
                to help with your home improvement projects.
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

        {/* Trust Signal Section (no fabricated reviews / counts) */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 sm:p-8">
              <div className="grid sm:grid-cols-3 gap-4 text-center">
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <BadgeCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-bold text-blue-900 mb-1">ID & Insurance Checked</h3>
                  <p className="text-sm text-gray-600">
                    Every {trade.name.toLowerCase()} on MyApproved is verified before they can quote.
                  </p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <h3 className="font-bold text-blue-900 mb-1">Real Reviews Only</h3>
                  <p className="text-sm text-gray-600">
                    Ratings come exclusively from homeowners who actually hired the tradesperson.
                  </p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-bold text-blue-900 mb-1">£2M Public Liability</h3>
                  <p className="text-sm text-gray-600">
                    All listed {trade.plural.toLowerCase()} carry valid public liability insurance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="py-12 sm:py-16 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 mb-6">
                  Why Choose MyApproved {trade.name}s in {location.name}?
                </h2>
                
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <BadgeCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-900 mb-1">Fully Verified</h3>
                      <p className="text-gray-600">
                        Every {trade.name.toLowerCase()} is ID checked, reference verified, and 
                        qualification confirmed before joining MyApproved.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-900 mb-1">£2M Insurance</h3>
                      <p className="text-gray-600">
                        All {trade.plural.toLowerCase()} carry minimum £2M public liability insurance 
                        for your peace of mind.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Star className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-900 mb-1">Real Reviews</h3>
                      <p className="text-gray-600">
                        Read genuine reviews from verified {location.name} customers who've 
                        hired our {trade.plural.toLowerCase()}.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-900 mb-1">Same Day Service</h3>
                      <p className="text-gray-600">
                        Many of our {location.name} {trade.plural.toLowerCase()} offer same-day or 
                        next-day appointments for urgent work.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <h3 className="text-xl font-bold text-blue-900 mb-6">
                  Average Costs in {location.name}
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Hourly Rate</span>
                    <span className="font-bold text-blue-900">{trade.hourlyRate}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Call-out Fee</span>
                    <span className="font-bold text-blue-900">£0-£60</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Emergency Rate</span>
                    <span className="font-bold text-blue-900">1.5x Standard</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600">Free Quotes</span>
                    <span className="font-bold text-green-600">Yes</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Prices vary based on job complexity, materials, and urgency. 
                    Get free quotes to compare exact costs for your project.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Areas Covered */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-8 text-center">
              {trade.name}s Covering All of {location.name} & Surrounding Areas
            </h2>
            
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {location.postcodes?.map((postcode, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-lg">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">{postcode}</span>
                </div>
              ))}
            </div>
            
            {nearbyLocations.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Also Serving Nearby Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {nearbyLocations.map(nearby => (
                    <Link
                      key={nearby.name}
                      href={`/${trade.slug}/${nearby.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                      className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full text-sm text-blue-700 transition-colors"
                    >
                      {nearby.name}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Related Trades */}
        {relatedTrades.length > 0 && (
          <section className="py-12 sm:py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-8 text-center">
                Related Trades in {location.name}
              </h2>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedTrades.map(relatedTrade => (
                  <Link
                    key={relatedTrade.slug}
                    href={`/${relatedTrade.slug}/${params.location}`}
                    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-bold text-blue-900 mb-2">{relatedTrade.name}s</h3>
                    <p className="text-sm text-gray-600 mb-4">{relatedTrade.description.slice(0, 60)}...</p>
                    <span className="text-blue-600 text-sm font-medium inline-flex items-center">
                      View {relatedTrade.name}s <ArrowRight className="ml-1 w-4 h-4" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ Section */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-8 text-center">
              Common Questions About Hiring a {trade.name} in {location.name}
            </h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold text-blue-900 mb-2">
                  How much does a {trade.name.toLowerCase()} cost in {location.name}?
                </h3>
                <p className="text-gray-600">
                  {trade.name}s in {location.name} typically charge {trade.hourlyRate} per hour. 
                  Fixed-price quotes are available for larger jobs. Emergency call-outs may incur 
                  additional charges, especially evenings and weekends.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold text-blue-900 mb-2">
                  Are MyApproved {trade.plural.toLowerCase()} in {location.name} insured?
                </h3>
                <p className="text-gray-600">
                  Yes, all {trade.plural.toLowerCase()} on MyApproved carry minimum £2M public liability 
                  insurance. We verify insurance documents before any tradesperson can join our platform.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold text-blue-900 mb-2">
                  How quickly can I get a {trade.name.toLowerCase()} in {location.name}?
                </h3>
                <p className="text-gray-600">
                  Many of our {location.name} {trade.plural.toLowerCase()} offer same-day or next-day service. 
                  For emergencies, we have {trade.plural.toLowerCase()} available 24/7. Post your job 
                  on MyApproved and you'll typically receive quotes within a few hours.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold text-blue-900 mb-2">
                  How do I choose the best {trade.name.toLowerCase()} in {location.name}?
                </h3>
                <p className="text-gray-600">
                  Compare {trade.plural.toLowerCase()} based on their verified reviews, qualifications, 
                  response time, and quotes. All MyApproved {trade.plural.toLowerCase()} have been ID-checked 
                  and verified, so you can hire with confidence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Ready to Find Your {trade.name} in {location.name}?
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              Get free quotes from up to 3 verified {trade.plural.toLowerCase()}. 
              Compare prices, read reviews, and choose with confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <AIQuoteTriggerButton className="inline-flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold px-10 py-6 text-lg rounded-lg transition-colors">
                <Phone className="mr-2 w-5 h-5" />
                Get Free Quotes Now
              </AIQuoteTriggerButton>
            </div>
            
            <p className="mt-6 text-sm text-blue-200">
              It only takes 2 minutes. No obligation, completely free.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
