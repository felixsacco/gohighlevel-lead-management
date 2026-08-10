# MyApproved SEO Audit & Transformation Plan

## Executive Summary
Current State: Basic Next.js platform with minimal SEO optimisation
Target: Scale to 10,000+ pages ranking for trade + location keywords across the UK

---

## PHASE 1: FULL SEO AUDIT

### Current URL Structure Analysis

**Existing Pages (13 total - CRITICALLY LOW):**
1. `/` - Homepage (generic, not optimised for specific keywords)
2. `/find-tradespeople` - Search page (single page, no location targeting)
3. `/about` - Basic about page
4. `/contact` - Basic contact page
5. `/faq` - FAQ page (minimal content)
6. `/how-it-works` - Process page
7. `/instant-quote` - Lead gen page
8. `/register/tradesperson` - Registration
9. `/login/*` - Multiple login variants
10. `/join` - Join page
11. `/privacy`, `/terms`, `/cookies` - Legal pages
12. `/sitemap` - HTML sitemap
13. `/tradesperson/:id` - Individual profiles (minimal SEO)

**CRITICAL WEAKNESS:** No trade-specific pages, no location-specific pages, no combination pages
**MISSING OPPORTUNITY:** 0 pages targeting "{trade} in {location}" queries

### Current Metadata Audit

**Homepage (`app/page.tsx`):**
- ❌ NO metadata export found - Using layout defaults only
- ❌ Generic title: "MyApproved - Enhanced Home Improvement Solutions"
- ❌ Weak description: "Find trusted contractors and solutions..."
- ❌ Missing H1 structure optimisation
- ❌ No location targeting

**Find Tradespeople (`app/find-tradespeople/page.tsx`):**
- ❌ "use client" - Cannot export metadata
- ❌ NO server-side metadata
- ❌ Dynamic content not reflected in meta tags
- ❌ No trade/location specific titles

**Layout (`app/layout.tsx`):**
- ✅ Basic metadata present
- ⚠️ Generic keywords: "home improvement, contractors, renovations..."
- ⚠️ No dynamic metadata generation
- ✅ Schema markup implemented but generic

### Schema Markup Audit

**Current Implementation (`components/SchemaMarkup.tsx`):**
- ✅ Organization schema present
- ✅ LocalBusiness schema present (but generic address)
- ✅ Service schema present
- ✅ Review schema (AggregateRating 4.9 - unverified)
- ✅ FAQ schema present (3 generic questions)
- ✅ Breadcrumb schema (basic)
- ❌ NO individual Service schema per trade
- ❌ NO location-specific LocalBusiness schemas
- ❌ NO dynamic schema generation
- ❌ Missing WebSite schema with Sitelinks Searchbox

### Content Audit

**Homepage Content:**
- ❌ Thin content - Not reaching 800+ words
- ❌ No location-specific content
- ❌ No trade-specific deep content
- ❌ Missing "About Us" section with keywords
- ❌ No customer testimonials/reviews section
- ⚠️ Basic trust indicators present

**Service Coverage:**
- ✅ Lists 16+ trades in carousel
- ❌ NO individual trade landing pages
- ❌ NO service area pages
- ❌ No content explaining each trade

### Technical SEO Issues

**URL Structure:**
- ❌ No hierarchy (`/plumber/london` missing)
- ❌ Dynamic routes not optimised for SEO
- ❌ Tradesperson IDs in URLs not keyword-rich

**Internal Linking:**
- ❌ No breadcrumb navigation on pages
- ❌ No related trades/services links
- ❌ Footer links minimal
- ❌ No pillar/cluster content structure

**Performance:**
- ⚠️ Client-side heavy components ("use client")
- ⚠️ No image optimisation strategy visible
- ⚠️ No lazy loading implementation

**Mobile:**
- ✅ Responsive design present
- ⚠️ Core Web Vitals unknown

### Missing Pages Analysis

**Critical Missing Pages (High Priority):**
- Trade pages: `/plumber`, `/electrician`, `/builder`, etc. (40+ trades)
- Location pages: `/london`, `/manchester`, `/birmingham`, etc. (100+ cities)
- Trade+Location: `/plumber/london` (4,000+ combinations)
- Service pages: `/emergency-plumber`, `/boiler-repair`, etc.
- Blog content: `/blog/how-much-does-a-plumber-cost`

**Opportunity Size:**
- UK towns/cities: ~1,500 locations
- Trade types: ~40 major trades
- Service types: ~200 services
- **Total addressable pages: 60,000+**
- **Realistic Phase 1 target: 1,000 pages**
- **Realistic Phase 2 target: 10,000 pages**

### Competitor Gap Analysis

**Checkatrade:**
- ✅ Trade-specific landing pages
- ✅ Location-specific pages
- ✅ Rich content (1,000+ words per page)
- ✅ Strong internal linking
- ✅ Review integration

**MyBuilder:**
- ✅ Geographic targeting
- ✅ Trade category pages
- ✅ Cost guides and blog content

**Rated People:**
- ✅ Service area pages
- ✅ Trade comparison content
- ✅ Strong brand presence

**MyApproved Current Position:**
- ❌ No competitive landing pages
- ❌ No geographic targeting
- ❌ Minimal content depth
- ❌ Weak internal linking

---

## AUDIT FINDINGS SUMMARY

### Critical Issues (Must Fix)
1. **ZERO trade-specific landing pages** - Missing 40+ high-value pages
2. **ZERO location-specific pages** - Missing 1,500+ local SEO opportunities
3. **Generic metadata on all pages** - No keyword targeting
4. **Thin content** - All pages below 800 words
5. **No programmatic SEO infrastructure** - Cannot scale

### High Priority Issues
6. Missing breadcrumb navigation
7. No internal linking strategy
8. Schema markup not optimised per page
9. No blog/content marketing engine
10. Tradesperson profiles not SEO-optimised

### Medium Priority Issues
11. Images not optimised
12. No XML sitemap automation
13. robots.txt not optimised
14. No canonical strategy for duplicate content
15. Core Web Vitals not monitored

---

## NEXT: PHASE 2-11 IMPLEMENTATION

See implementation files:
- `SEO_IMPLEMENTATION_PLAN.md` - Detailed technical specs
- `app/[trade]/[location]/page.tsx` - Programmatic route template
- `lib/seo-data.ts` - Centralised SEO data configuration
- `scripts/generate-seo-pages.ts` - Page generation automation

