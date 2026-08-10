/**
 * Blog Listing Page
 * SEO: Targets content discovery and topical authority
 * Shows all blog posts with filtering and categorisation
 */

import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
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

const BLOG_POSTS = [
  {
    slug: "how-much-does-a-plumber-cost-london",
    title: "How Much Does a Plumber Cost in London? 2024 Price Guide",
    excerpt: "Discover plumber costs in London. Hourly rates from £50-£100. Emergency call-outs, boiler repairs & installation prices. Get free quotes from verified plumbers.",
    category: "Cost Guides",
    author: "MyApproved Editorial Team",
    date: "2024-01-15",
    readTime: "8 min read",
    featured: true,
    image: "/images/blog/plumber-cost-london.jpg"
  },
  {
    slug: "best-electrician-manchester",
    title: "How to Find the Best Electrician in Manchester",
    excerpt: "Looking for the best electrician in Manchester? Top-rated NICEIC-approved electricians. Compare quotes, read reviews, and hire with confidence.",
    category: "Hiring Guides",
    author: "MyApproved Editorial Team",
    date: "2024-01-12",
    readTime: "6 min read",
    featured: false,
    image: "/images/blog/electrician-manchester.jpg"
  },
  {
    slug: "common-boiler-problems-winter",
    title: "Common Boiler Problems in Winter: How to Fix & Prevent Them",
    excerpt: "Winter boiler problems? Frozen pipes, pressure issues, no heating? Learn common winter boiler faults, quick fixes, and when to call a Gas Safe engineer.",
    category: "Maintenance Guides",
    author: "MyApproved Editorial Team",
    date: "2024-01-10",
    readTime: "7 min read",
    featured: true,
    image: "/images/blog/boiler-winter.jpg"
  },
  {
    slug: "roofer-vs-diy-when-to-hire",
    title: "Roofer vs DIY: When to Hire a Professional",
    excerpt: "Should you fix your roof yourself or hire a professional? Learn the risks of DIY roofing and when it's essential to call a qualified roofer.",
    category: "Advice",
    author: "MyApproved Editorial Team",
    date: "2024-01-08",
    readTime: "5 min read",
    featured: false,
    image: "/images/blog/roofer-diy.jpg"
  },
  {
    slug: "kitchen-renovation-cost-guide-2024",
    title: "Kitchen Renovation Cost Guide 2024: Budget to Luxury",
    excerpt: "Planning a kitchen renovation? From budget refreshes to luxury transformations, discover real costs for kitchen renovations in 2024.",
    category: "Cost Guides",
    author: "MyApproved Editorial Team",
    date: "2024-01-05",
    readTime: "10 min read",
    featured: false,
    image: "/images/blog/kitchen-renovation.jpg"
  },
  {
    slug: "emergency-plumber-what-to-do",
    title: "Emergency Plumber: What to Do When Pipes Burst",
    excerpt: "Burst pipe emergency? Follow these immediate steps to minimise damage, then find an emergency plumber fast with MyApproved.",
    category: "Emergency Guides",
    author: "MyApproved Editorial Team",
    date: "2024-01-03",
    readTime: "4 min read",
    featured: false,
    image: "/images/blog/emergency-plumber.jpg"
  },
  {
    slug: "gas-safety-certificate-explained",
    title: "Gas Safety Certificate Explained: Landlord & Homeowner Guide",
    excerpt: "What is a Gas Safety Certificate? Who needs one? How much do they cost? Everything you need to know about CP12 certificates for landlords and homeowners.",
    category: "Legal & Safety",
    author: "MyApproved Editorial Team",
    date: "2023-12-28",
    readTime: "6 min read",
    featured: false,
    image: "/images/blog/gas-safety.jpg"
  },
  {
    slug: "loft-conversion-planning-permission",
    title: "Loft Conversion Planning Permission: Do You Need It?",
    excerpt: "Planning a loft conversion? Learn when you need planning permission, when permitted development applies, and how to navigate building regulations.",
    category: "Planning & Permissions",
    author: "MyApproved Editorial Team",
    date: "2023-12-20",
    readTime: "8 min read",
    featured: false,
    image: "/images/blog/loft-conversion.jpg"
  },
  {
    slug: "bathroom-renovation-timeline",
    title: "Bathroom Renovation Timeline: How Long Does It Really Take?",
    excerpt: "How long does a bathroom renovation take? From planning to completion, understand realistic timelines for your bathroom project.",
    category: "Planning & Timelines",
    author: "MyApproved Editorial Team",
    date: "2023-12-15",
    readTime: "5 min read",
    featured: false,
    image: "/images/blog/bathroom-timeline.jpg"
  },
  {
    slug: "finding-trusted-tradespeople",
    title: "How to Find Trusted Tradespeople: Complete Checklist",
    excerpt: "Don't risk cowboys. Learn how to verify tradespeople, check qualifications, read reviews properly, and protect yourself from rogue traders.",
    category: "Hiring Guides",
    author: "MyApproved Editorial Team",
    date: "2023-12-10",
    readTime: "7 min read",
    featured: true,
    image: "/images/blog/trusted-tradespeople.jpg"
  }
]

const CATEGORIES = [
  "All",
  "Cost Guides",
  "Hiring Guides",
  "Maintenance Guides",
  "Advice",
  "Emergency Guides",
  "Legal & Safety",
  "Planning & Permissions"
]

export default function BlogPage() {
  const featuredPosts = BLOG_POSTS.filter(post => post.featured)
  const regularPosts = BLOG_POSTS.filter(post => !post.featured)
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-800 text-white pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
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
                  ? 'bg-blue-600 text-white' 
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
            <h2 className="text-2xl font-bold text-blue-900 mb-6">Featured Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredPosts.map(post => (
                <Link 
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-video bg-gray-200 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
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
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {post.excerpt}
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
          <h2 className="text-2xl font-bold text-blue-900 mb-6">All Articles</h2>
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
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto pt-4 border-t border-gray-100">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-16 bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-8 sm:p-12 text-white text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
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
