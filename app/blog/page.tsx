/**
 * Blog Listing Page
 * SEO: Targets content discovery and topical authority
 * Shows all blog posts with filtering and categorisation
 */

import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { getAllBlogPosts } from '@/lib/blog-data'
import { Clock, ArrowRight, User, Calendar } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Trades Blog | Home Improvement Tips, Cost Guides & Advice | MyApproved',
  description: 'Expert advice on hiring tradespeople, cost guides, home improvement tips, and maintenance guides. Read our blog to make informed decisions about your projects.',
  alternates: {
    canonical: 'https://myapproved.com/blog'
  },
  openGraph: {
    title: 'Trades Blog | MyApproved',
    description: 'Expert advice on hiring tradespeople, cost guides, and home improvement tips.',
    url: 'https://myapproved.com/blog',
    siteName: 'MyApproved',
    locale: 'en_GB',
    type: 'website'
  }
}

const BLOG_POSTS = getAllBlogPosts()

const CATEGORIES = [
  "All",
  ...Array.from(new Set(getAllBlogPosts().map(post => post.category)))
]

export default function BlogPage() {
  const featuredPosts = BLOG_POSTS.filter(post => post.featured)
  const regularPosts = BLOG_POSTS.filter(post => !post.featured)
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-navy to-brand-navy text-white pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6">
              Trades Blog & Advice Centre
            </h1>
            <p className="text-lg sm:text-xl text-blue-100">
              Expert guides on hiring tradespeople, cost breakdowns, maintenance tips, 
              and home improvement advice. Make informed decisions with MyApproved.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-12">
          {CATEGORIES.map((category, index) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                index === 0 
                  ? 'bg-brand-navy text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-extrabold text-brand-navy mb-6">Featured Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredPosts.map(post => (
                <Link 
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-video bg-gray-200 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-navy to-brand-navy flex items-center justify-center">
                      <span className="text-white text-lg font-medium">{post.category}</span>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-yellow-500 text-blue-900 px-3 py-1 rounded-full text-sm font-bold">
                        Featured
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <span className="text-blue-600 font-medium">{post.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </span>
                    </div>
                    <h3 className="text-xl font-extrabold text-brand-navy mb-3 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {post.metaDescription}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <User className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                      <span className="text-blue-600 font-medium inline-flex items-center gap-1">
                        Read More <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All Posts Grid */}
        <section>
          <h2 className="text-2xl font-extrabold text-brand-navy mb-6">All Articles</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...featuredPosts, ...regularPosts].map(post => (
              <Link 
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="aspect-video bg-gray-200 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-sm font-medium">{post.category}</span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span className="text-blue-600 font-medium">{post.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-brand-navy mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                    {post.metaDescription}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto pt-4 border-t border-gray-100">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(post.publishedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-16 bg-gradient-to-br from-brand-navy to-brand-navy rounded-xl p-8 sm:p-12 text-white text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Find verified tradespeople for any job. Compare quotes, read reviews, 
            and hire with confidence.
          </p>
          <Button className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold px-8 py-6 text-lg" asChild>
            <Link href="/instant-quote">
              Get Free Quotes Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </section>
      </div>
    </div>
  )
}
