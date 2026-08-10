import { MetadataRoute } from 'next'
import { TRADES, LOCATIONS } from '@/lib/seo-data'

const MOCK_BLOG_POSTS = [
  { slug: "how-much-does-a-plumber-cost-london" },
  { slug: "best-electrician-manchester" },
  { slug: "common-boiler-problems-winter" },
]

function toSlug(str: string): string {
  return str.toLowerCase().replace(/[\s]+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://myapproved.com'
  const lastMod = new Date()

  // ── Static pages ─────────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl,                                  lastModified: lastMod, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${baseUrl}/find-tradespeople`,           lastModified: lastMod, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${baseUrl}/instant-quote`,               lastModified: lastMod, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${baseUrl}/post-job`,                    lastModified: lastMod, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${baseUrl}/for-tradespeople`,            lastModified: lastMod, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/register/client`,             lastModified: lastMod, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/register/tradesperson`,       lastModified: lastMod, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/how-it-works`,                lastModified: lastMod, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/blog`,                        lastModified: lastMod, changeFrequency: 'daily',   priority: 0.7 },
    { url: `${baseUrl}/faq`,                         lastModified: lastMod, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/locations`,                   lastModified: lastMod, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/about`,                       lastModified: lastMod, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact`,                     lastModified: lastMod, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/verification`,                lastModified: lastMod, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/help`,                        lastModified: lastMod, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/sitemap`,                     lastModified: lastMod, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/privacy`,                     lastModified: lastMod, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${baseUrl}/terms`,                       lastModified: lastMod, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${baseUrl}/cookies`,                     lastModified: lastMod, changeFrequency: 'yearly',  priority: 0.3 },
  ]

  // ── All 50 UK city slugs ──────────────────────────────────────────────────────
  const allLocationSlugs = LOCATIONS.map(l => toSlug(l.name))

  // ── /find-tradespeople/[trade] - all trades ───────────────────────────────────
  const findTradespeopleTradePages: MetadataRoute.Sitemap = TRADES.map(trade => ({
    url: `${baseUrl}/find-tradespeople/${trade.slug}`,
    lastModified: lastMod,
    changeFrequency: 'daily' as const,
    priority: trade.priority === 1 ? 0.9 : 0.8,
  }))

  // ── /find-tradespeople/[trade]/[location] - all trades × all UK locations ─────
  const findTradespeopleLocationPages: MetadataRoute.Sitemap = []
  for (const trade of TRADES) {
    for (const locationSlug of allLocationSlugs) {
      findTradespeopleLocationPages.push({
        url: `${baseUrl}/find-tradespeople/${trade.slug}/${locationSlug}`,
        lastModified: lastMod,
        changeFrequency: 'weekly' as const,
        priority: trade.priority === 1 ? 0.85 : 0.75,
      })
    }
  }

  // ── Legacy trade pages (e.g. /plumber, /electrician) ─────────────────────────
  const legacyTradePages: MetadataRoute.Sitemap = TRADES.map(trade => ({
    url: `${baseUrl}/${trade.slug}`,
    lastModified: lastMod,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // ── Legacy trade + location pages - all trades × all 50 UK cities ────────────
  const legacyTradeLocationPages: MetadataRoute.Sitemap = []
  for (const trade of TRADES) {
    for (const location of LOCATIONS) {
      const locationSlug = toSlug(location.name)
      legacyTradeLocationPages.push({
        url: `${baseUrl}/${trade.slug}/${locationSlug}`,
        lastModified: lastMod,
        changeFrequency: 'weekly' as const,
        priority: 0.55,
      })
    }
  }

  // ── Blog posts ────────────────────────────────────────────────────────────────
  const blogPages: MetadataRoute.Sitemap = MOCK_BLOG_POSTS.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: lastMod,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    ...staticPages,
    ...findTradespeopleTradePages,
    ...findTradespeopleLocationPages,
    ...legacyTradePages,
    ...legacyTradeLocationPages,
    ...blogPages,
  ]
}
