/**
 * Blog Content Engine
 * URL Pattern: /blog/{slug}
 * 
 * SEO Requirements:
 * - Long-tail keyword targeting
 * - 1000-1500 words minimum
 * - Clear H1, H2, H3 structure
 * - Internal links to trade/location pages
 * - FAQ section with schema markup
 * - Strong CTA
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { TRADES, LOCATIONS } from '@/lib/seo-data'
import { BLOG_POSTS } from '@/lib/blog-data'
import { Button } from '@/components/ui/button'
import { graphify } from '@/components/SchemaMarkup'
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Calendar,
  MessageSquare,
  ArrowRight,
  Share2,
  Bookmark
} from 'lucide-react'

export async function generateStaticParams() {
  return Object.keys(BLOG_POSTS).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = BLOG_POSTS[params.slug]
  
  if (!post) {
    return { title: 'Blog Post Not Found | MyApproved' }
  }
  
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    keywords: post.tags.join(', '),
    alternates: {
      canonical: `https://myapproved.com/blog/${post.slug}`
    },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url: `https://myapproved.com/blog/${post.slug}`,
      siteName: 'MyApproved',
      locale: 'en_GB',
      type: 'article',
      publishedTime: post.publishedDate,
      authors: [post.author]
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle,
      description: post.metaDescription
    }
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = BLOG_POSTS[params.slug]
  
  if (!post) {
    notFound()
  }
  
  // Find related trade and location data
  const relatedTradesData = post.relatedTrades
    .map(slug => TRADES.find(t => t.slug === slug))
    .filter(Boolean)
  
  const relatedLocationsData = post.relatedLocations
    .map(name => LOCATIONS.find(l => l.name === name))
    .filter(Boolean)
  
  const schema = graphify([
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.title,
      "description": post.metaDescription,
      "author": {
        "@type": "Organization",
        "@id": "https://myapproved.com/#organization",
        "name": "MyApproved Editorial Team",
        "url": "https://myapproved.com/about",
        "sameAs": "https://myapproved.com"
      },
      "publisher": {
        "@type": "Organization",
        "@id": "https://myapproved.com/#organization",
        "name": "MyApproved",
        "logo": {
          "@type": "ImageObject",
          "url": "https://myapproved.com/logo-icon.svg"
        }
      },
      "datePublished": post.publishedDate,
      "dateModified": post.updatedAt || post.publishedDate,
      "inLanguage": "en-GB",
      "keywords": post.tags.join(", "),
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://myapproved.com/blog/${post.slug}`
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://myapproved.com" },
          { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://myapproved.com/blog" },
          { "@type": "ListItem", "position": 3, "name": post.title, "item": `https://myapproved.com/blog/${post.slug}` }
        ]
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "url": `https://myapproved.com/blog/${post.slug}`,
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": ["h1", "h2", "[data-speakable]"]
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": post.content.faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    }
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <article className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link 
              href="/blog" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </div>
        </header>

        {/* Hero */}
        <div className="bg-gradient-to-br from-brand-navy to-brand-navy text-white pb-12 sm:pb-16 pt-8 sm:pt-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-yellow-500 text-blue-900 px-3 py-1 rounded-full text-sm font-bold">
                {post.category}
              </span>
              <span className="text-blue-200">|</span>
              <span className="text-blue-100">{post.readTime}</span>
            </div>
            
            <h1 className="text-[2rem] sm:text-4xl md:text-5xl font-extrabold mb-6 leading-[1.05] tracking-[-0.02em]" style={{ fontWeight: 800 }}>
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-blue-100">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{new Date(post.publishedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Introduction */}
          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 mb-8">
            <div className="prose prose-lg max-w-none text-gray-600 whitespace-pre-line">
              {post.content.introduction}
            </div>
          </div>

          {/* Sections */}
          {post.content.sections.map((section, index) => (
            <section key={index} className="bg-white rounded-xl shadow-sm p-6 sm:p-8 mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mb-4 leading-tight tracking-[-0.01em]" style={{ fontWeight: 800 }}>
                {section.heading}
              </h2>
              <div className="prose prose-lg max-w-none text-gray-600 whitespace-pre-line mb-6">
                {section.content}
              </div>
              
              {section.tips.length > 0 && (
                <div className="bg-yellow-50 rounded-xl p-6">
                  <h3 className="text-lg font-extrabold text-yellow-800 mb-3 flex items-center gap-2 tracking-tight" style={{ fontWeight: 800 }}>
                    <Clock className="w-5 h-5" />
                    Pro Tips
                  </h3>
                  <ul className="space-y-2">
                    {section.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-yellow-700">
                        <span className="text-yellow-500 mt-1">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          ))}

          {/* CTA Box */}
          <div className="bg-gradient-to-br from-brand-navy to-brand-navy rounded-xl p-6 sm:p-8 text-white mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-4 leading-tight tracking-[-0.01em]" style={{ fontWeight: 800 }}>
              Need a Professional? Get Free Quotes Now
            </h2>
            <p className="text-blue-100 mb-6">
              Connect with verified tradespeople in your area. Compare quotes, read reviews, 
              and hire with confidence.
            </p>
            <Button className="bg-brand-amber hover:bg-brand-amberDark text-black font-semibold px-8 py-6 rounded-xl transition-colors" style={{ fontWeight: 800 }} asChild>
              <Link href="/instant-quote">
                <MessageSquare className="mr-2 w-5 h-5" />
                Get Your Free Quote
              </Link>
            </Button>
          </div>

          {/* FAQs */}
          <section className="bg-white rounded-xl shadow-sm p-6 sm:p-8 mb-8" data-speakable>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mb-6 leading-tight tracking-[-0.01em]" style={{ fontWeight: 800 }}>
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {post.content.faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                  <h3 className="text-lg font-extrabold text-brand-navy mb-2 tracking-tight" style={{ fontWeight: 800 }}>{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Links */}
          {(relatedTradesData.length > 0 || relatedLocationsData.length > 0) && (
            <section className="bg-gray-100 rounded-xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-extrabold text-brand-navy mb-4 leading-tight tracking-[-0.01em]" style={{ fontWeight: 800 }}>Related Resources</h2>
              
              {relatedTradesData.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-extrabold text-brand-navy mb-2 tracking-tight" style={{ fontWeight: 800 }}>Related Trades:</h3>
                  <div className="flex flex-wrap gap-2">
                    {relatedTradesData.map(trade => (
                      <Link
                        key={trade!.slug}
                        href={`/find-tradespeople/${trade!.slug}`}
                        className="inline-flex items-center gap-1 bg-white px-3 py-2 rounded-xl text-brand-navy font-semibold hover:bg-brand-amber hover:text-black transition-colors" style={{ fontWeight: 700 }}
                      >
                        Find {trade!.plural}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {relatedLocationsData.length > 0 && (
                <div>
                  <h3 className="font-extrabold text-brand-navy mb-2 tracking-tight" style={{ fontWeight: 800 }}>Popular Locations:</h3>
                  <div className="flex flex-wrap gap-2">
                    {relatedLocationsData.map(location => {
                      const slug = location!.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                      return (
                        <Link
                          key={location!.name}
                          href={`/find-tradespeople?location=${slug}`}
                          className="inline-flex items-center gap-1 bg-white px-3 py-2 rounded-xl text-brand-navy font-semibold hover:bg-brand-amber hover:text-black transition-colors" style={{ fontWeight: 700 }}
                        >
                          Tradespeople in {location!.name}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </article>
    </>
  )
}
