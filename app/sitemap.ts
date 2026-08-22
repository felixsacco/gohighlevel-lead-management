import { MetadataRoute } from 'next'
import { TRADES, LOCATIONS, ALL_NEIGHBORHOOD_SLUGS } from '@/lib/seo-data'
import { BLOG_POSTS, getAllBlogPosts } from '@/lib/blog-data'

function toSlug(str: string): string {
  return str.toLowerCase().replace(/[\s]+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://myapproved.com'

  // A stable, truthful timestamp for template/static pages. These pages change
  // only when the site itself is redeployed, so we derive the timestamp from
  // the deploy identity rather than stamping `new Date()` (which would misreport
  // every URL as "just updated" on each build).
  const deployTimestamp = ((): Date => {
    const buildId =
      process.env.BUILD_ID ||
      process.env.VERCEL_GIT_COMMIT_SHA ||
      process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA

    if (buildId) {
      const match = /^build-(\d+)$/.exec(buildId)
      if (match) {
        return new Date(Number(match[1]))
      }
      // A git SHA is stable per deploy but carries no wall-clock time we can
      // trust, so fall back to the current build time — still more truthful than
      // per-URL `new Date()` because it is constant across the whole deploy.
      return new Date()
    }
    return new Date()
  })()

  // ── Static pages ─────────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl,                                  lastModified: deployTimestamp, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${baseUrl}/find-tradespeople`,           lastModified: deployTimestamp, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${baseUrl}/instant-quote`,               lastModified: deployTimestamp, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${baseUrl}/post-job`,                    lastModified: deployTimestamp, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${baseUrl}/for-tradespeople`,            lastModified: deployTimestamp, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/register/client`,             lastModified: deployTimestamp, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/register/tradesperson`,       lastModified: deployTimestamp, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/how-it-works`,                lastModified: deployTimestamp, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/blog`,                        lastModified: deployTimestamp, changeFrequency: 'daily',   priority: 0.7 },
    { url: `${baseUrl}/faq`,                         lastModified: deployTimestamp, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/locations`,                   lastModified: deployTimestamp, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/about`,                       lastModified: deployTimestamp, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact`,                     lastModified: deployTimestamp, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/verification`,                lastModified: deployTimestamp, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/help`,                        lastModified: deployTimestamp, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/sitemap`,                     lastModified: deployTimestamp, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/privacy`,                     lastModified: deployTimestamp, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${baseUrl}/terms`,                       lastModified: deployTimestamp, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${baseUrl}/cookies`,                     lastModified: deployTimestamp, changeFrequency: 'yearly',  priority: 0.3 },
  ]

  // ── All 50 UK city slugs ──────────────────────────────────────────────────────
  const allLocationSlugs = LOCATIONS.map(l => toSlug(l.name))

  // ── /find-tradespeople/[trade] - all trades ───────────────────────────────────
  const findTradespeopleTradePages: MetadataRoute.Sitemap = TRADES.map(trade => ({
    url: `${baseUrl}/find-tradespeople/${trade.slug}`,
    lastModified: deployTimestamp,
    changeFrequency: 'daily' as const,
    priority: trade.priority === 1 ? 0.9 : 0.8,
  }))

  // ── /find-tradespeople/[trade]/[location] - all trades × all UK locations ─────
  const findTradespeopleLocationPages: MetadataRoute.Sitemap = []
  for (const trade of TRADES) {
    for (const locationSlug of allLocationSlugs) {
      findTradespeopleLocationPages.push({
        url: `${baseUrl}/find-tradespeople/${trade.slug}/${locationSlug}`,
        lastModified: deployTimestamp,
        changeFrequency: 'weekly' as const,
        priority: trade.priority === 1 ? 0.85 : 0.75,
      })
    }
  }

  // ── /find-tradespeople/[trade]/[neighbourhood] - all trades × all neighbourhoods ──
  // Hyper-local "near me" landing pages. Child pages of the city-level URLs above,
  // mapped via `NEIGHBORHOODS` (parent city → neighbourhood + postal district).
  // Slightly lower priority than city pages to avoid competing with them in SERPs,
  // but still canonical to their own URL so no duplicate-content trap is created.
  const findTradespeopleNeighbourhoodPages: MetadataRoute.Sitemap = []
  for (const trade of TRADES) {
    for (const neighbourhoodSlug of ALL_NEIGHBORHOOD_SLUGS) {
      findTradespeopleNeighbourhoodPages.push({
        url: `${baseUrl}/find-tradespeople/${trade.slug}/${neighbourhoodSlug}`,
        lastModified: deployTimestamp,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })
    }
  }

  // ── Blog posts ────────────────────────────────────────────────────────────────
  // Sourced from the shared `BLOG_POSTS` engine so the sitemap, listing and
  // detail pages can never drift out of sync. Each post carries its real
  // published/updated date as `lastmod`, giving search engines truthful
  // freshness cues.
  const blogPages: MetadataRoute.Sitemap = getAllBlogPosts().map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.publishedDate),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Sanity assertion: every sitemap blog slug must have a real content entry.
  for (const slug of Object.keys(BLOG_POSTS)) {
    if (!BLOG_POSTS[slug]) {
      throw new Error(`Blog sitemap references missing content for slug: ${slug}`)
    }
  }

  return [
    ...staticPages,
    ...findTradespeopleTradePages,
    ...findTradespeopleLocationPages,
    ...findTradespeopleNeighbourhoodPages,
    ...blogPages,
  ]
}
