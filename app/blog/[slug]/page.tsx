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
import { Button } from '@/components/ui/button'
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

// Blog post database - in production, fetch from CMS/database
const BLOG_POSTS: Record<string, BlogPost> = {
  "how-much-does-a-plumber-cost-london": {
    slug: "how-much-does-a-plumber-cost-london",
    title: "How Much Does a Plumber Cost in London? 2024 Price Guide",
    metaTitle: "How Much Does a Plumber Cost in London? | 2024 Price Guide",
    metaDescription: "Discover plumber costs in London. Hourly rates from £50-£100. Emergency call-outs, boiler repairs & installation prices. Get free quotes from verified plumbers.",
    author: "MyApproved Editorial Team",
    publishedDate: "2024-01-15",
    readTime: "8 min read",
    category: "Cost Guides",
    tags: ["plumber", "london", "pricing", "cost guide", "emergency plumbing"],
    featured: true,
    image: "/images/blog/plumber-cost-london.jpg",
    content: {
      introduction: `Hiring a plumber in London can feel overwhelming, especially when you're unsure about costs. Whether you need a quick tap repair or a complete bathroom installation, understanding London plumber pricing helps you budget effectively and avoid surprises.

In this comprehensive guide, we break down exactly how much plumbers charge in London, what affects pricing, and how to get the best value for your money. All prices are based on 2024 market rates from verified London plumbers on MyApproved.`,
      sections: [
        {
          heading: "Average Plumber Costs in London (2024)",
          content: `London plumber rates vary significantly based on location, experience, and job complexity. Here's what you can expect:

**Hourly Rates:**
- Standard plumbing work: £50-£80 per hour
- Emergency/out-of-hours: £80-£150 per hour
- Weekend rates: 1.5x standard rate
- Bank holidays: 2x standard rate

**Common Job Costs:**
- Fix leaking tap: £80-£150
- Unblock sink/toilet: £100-£200
- Repair burst pipe: £150-£400
- Install new toilet: £200-£500
- Replace radiator: £150-£350
- Boiler service: £80-£120
- Boiler repair: £150-£500
- New boiler installation: £1,500-£4,000
- Bathroom installation: £3,000-£8,000

**Call-Out Fees:**
Most London plumbers charge a call-out fee of £50-£100, which typically covers the first hour of work. Some plumbers waive this fee if you proceed with the recommended work.`,
          tips: [
            "Always ask for a breakdown of costs before work begins",
            "Get at least 3 quotes for larger jobs",
            "Emergency work costs significantly more - consider if it can wait"
          ]
        },
        {
          heading: "What Affects Plumber Prices in London?",
          content: `Several factors influence how much you'll pay for plumbing services in London:

**1. Location Within London**
Central London plumbers (Zone 1-2) typically charge 20-30% more than those in outer zones. Postcodes like SW1, W1, EC1 command premium rates due to higher operating costs and parking difficulties.

**2. Timing and Urgency**
Emergency call-outs between 6pm-8am and weekends cost significantly more. Same-day service often carries a 50% premium.

**3. Job Complexity**
Simple repairs take less time and cost less. Complex jobs requiring specialist equipment or multiple visits cost more.

**4. Materials Required**
The cost of parts, fixtures, and fittings is separate from labour. Quality brands cost more but last longer.

**5. Plumber's Experience**
Highly experienced Gas Safe registered engineers charge more but provide better quality work and safety assurance.`,
          tips: [
            "Book non-urgent work during weekdays to save money",
            "Consider combining multiple small jobs into one visit",
            "Ask if the plumber offers any guarantees on their work"
          ]
        },
        {
          heading: "Emergency Plumber Costs in London",
          content: `Plumbing emergencies demand immediate attention. Here's what to expect:

**Emergency Call-Out Rates:**
- Daytime (8am-6pm): £80-£120 per hour
- Evening (6pm-10pm): £100-£150 per hour
- Night (10pm-8am): £150-£250 per hour
- Weekends: 1.5x standard rates
- Bank holidays: 2x standard rates

**Common Emergency Repairs:**
- Burst pipe repair: £200-£500
- Major leak repair: £150-£400
- Blocked drain clearance: £150-£300
- Boiler breakdown (no heating/hot water): £150-£600
- Overflowing toilet: £100-£250

**Is it Really an Emergency?**
Consider whether the issue can wait until regular hours:
- ✅ Emergency: No heating in winter, no water, major leak, sewage backup
- ❌ Non-urgent: Dripping tap, slow drain, minor leak, routine maintenance

Emergency plumbers prioritise safety-critical issues. If you're unsure, describe the problem when calling - reputable plumbers will advise honestly whether it needs immediate attention.`,
          tips: [
            "Know where your stopcock is to minimise water damage",
            "Take photos of the issue before the plumber arrives",
            "Emergency plumbers may charge a minimum fee even for quick fixes"
          ]
        },
        {
          heading: "Boiler Repair and Installation Costs",
          content: `Boiler work represents some of the most significant plumbing expenses. Understanding costs helps you plan:

**Annual Boiler Service:**
- Standard service: £80-£120
- Full system check: £100-£150

**Boiler Repairs:**
- Ignition/pilot light issues: £100-£250
- Pressure problems: £80-£200
- Pump replacement: £200-£400
- Heat exchanger repair: £300-£600
- Control panel faults: £150-£350

**New Boiler Installation:**
- Combi boiler replacement: £1,500-£3,000
- System boiler installation: £2,000-£4,000
- Conventional to combi conversion: £2,500-£4,500
- Including radiators: Add £500-£1,500

**Factors Affecting Boiler Costs:**
- Boiler brand (Worcester Bosch, Vaillant, Ideal vary in price)
- Boiler size/output (kW rating)
- Complexity of installation
- Whether new pipework needed
- Location of boiler
- Warranty length (longer warranties cost more upfront)

**Money-Saving Tips:**
- Get your boiler serviced annually to prevent costly repairs
- Compare quotes from multiple Gas Safe registered engineers
- Consider boiler cover insurance for older systems
- Check if you're eligible for boiler grants (over 60s, low income)
- Summer installations are often cheaper than winter`,
          tips: [
            "Only use Gas Safe registered engineers for boiler work - it's the law",
            "Get a 5-10 year warranty on new boilers for peace of mind",
            "Ask about power flushing - it can improve efficiency by 30%"
          ]
        },
        {
          heading: "How to Get the Best Value From London Plumbers",
          content: `Maximise value while ensuring quality work:

**Getting Quotes:**
- Request detailed written quotes from 3+ plumbers
- Ensure quotes include all labour, materials, and VAT
- Ask about guarantees and warranty periods
- Check what's included in the price

**Vetting Plumbers:**
- Verify Gas Safe registration (for gas work)
- Check reviews on MyApproved and other platforms
- Ask for references from similar jobs
- Confirm insurance coverage (minimum £2M public liability)

**Reducing Costs:**
- Combine multiple small jobs in one visit
- Provide clear access to work areas
- Remove obstacles beforehand
- Purchase your own fixtures (if confident in choices)
- Schedule work during off-peak times

**Questions to Ask:**
- "What's included in your quote?"
- "How long will the job take?"
- "Do you offer a guarantee?"
- "Are you insured?"
- "When can you start?"
- "Will you issue a certificate if required?"

**Payment Structure:**
- Small jobs: Payment on completion
- Large jobs: 25% deposit, balance on completion
- Very large jobs: Staged payments

Avoid plumbers demanding full payment upfront. A reasonable deposit protects both parties.`,
          tips: [
            "The cheapest quote isn't always best - consider experience and reviews",
            "Get everything in writing before work starts",
            "Keep receipts and guarantees for future reference"
          ]
        }
      ],
      faqs: [
        {
          question: "Why are London plumbers more expensive than other UK cities?",
          answer: "London has higher operating costs including insurance, parking, fuel, and general living expenses. Additionally, demand is higher in the capital, and plumbers often need specialist equipment for working in older properties and high-rise buildings."
        },
        {
          question: "Do all London plumbers charge VAT?",
          answer: "Plumbers with turnover above £85,000 must charge VAT. Smaller operators may not be VAT registered, making their prices appear lower. Always confirm whether quotes include VAT."
        },
        {
          question: "How quickly can I get an emergency plumber in London?",
          answer: "Most emergency plumbers aim to arrive within 1-2 hours. Central London locations may be quicker due to higher plumber density. MyApproved plumbers display their typical response times on their profiles."
        },
        {
          question: "Should I use a big company or independent plumber?",
          answer: "Both have advantages. Big companies offer 24/7 support and guarantees but charge more. Independent plumbers often provide personal service at lower rates. Check reviews and credentials regardless of size."
        },
        {
          question: "What payment methods do London plumbers accept?",
          answer: "Most accept cash, bank transfer, and card payments. Larger companies accept credit cards. Some offer financing for major work. Always get a receipt and written guarantee."
        }
      ]
    },
    relatedTrades: ["electrician", "gas-engineer", "bathroom-fitter"],
    relatedLocations: ["London", "Manchester", "Birmingham"]
  },
  
  "best-electrician-manchester": {
    slug: "best-electrician-manchester",
    title: "How to Find the Best Electrician in Manchester",
    metaTitle: "Best Electrician Manchester | How to Find Trusted Local Electricians",
    metaDescription: "Looking for the best electrician in Manchester? Top-rated NICEIC-approved electricians. Compare quotes, read reviews, and hire with confidence. Free quotes available.",
    author: "MyApproved Editorial Team",
    publishedDate: "2024-01-12",
    readTime: "6 min read",
    category: "Hiring Guides",
    tags: ["electrician", "manchester", "hiring guide", "NICEIC", "electrical safety"],
    featured: false,
    image: "/images/blog/electrician-manchester.jpg",
    content: {
      introduction: `Finding a reliable electrician in Manchester is crucial for your safety and peace of mind. Whether you need a full house rewire, new socket installation, or emergency electrical repairs, choosing the right professional protects your home and family.

This guide explains how to find the best electricians in Manchester, what qualifications to look for, typical costs, and how MyApproved helps you hire with confidence.`,
      sections: [
        {
          heading: "Why Choosing the Right Electrician Matters",
          content: `Electrical work is not a DIY job. Poor electrical installations can cause:

- Fire hazards from faulty wiring
- Electric shock risks
- Invalidated home insurance
- Failed property sales (no electrical certificate)
- Expensive remedial work

Professional electricians ensure work meets BS 7671 standards and Building Regulations. This protects your family and investment.`,
          tips: [
            "Always use a qualified, registered electrician",
            "Never attempt DIY electrical work",
            "Get an Electrical Installation Certificate for all major work"
          ]
        },
        {
          heading: "Electrician Qualifications to Look For",
          content: `Reputable Manchester electricians should have:

**Essential Qualifications:**
- NICEIC or ELECSA registration (self-certification schemes)
- Part P competency (Building Regulations compliance)
- 18th Edition Wiring Regulations (BS 7671:2018)
- NVQ Level 3 in Electrical Installation

**Additional Credentials:**
- ECS (Electrical Certification Scheme) card
- City & Guilds 2365/2382
- Specific manufacturer certifications (for specialist work)

**How to Verify:**
- Check NICEIC/ELECSA website online registers
- Ask to see their registration card
- Request proof of qualifications
- Verify insurance certificates

**Red Flags:**
- Reluctance to show credentials
- Prices significantly below market rate
- Cash-only, no receipt offered
- No fixed address or business details
- Pressure to decide immediately`,
          tips: [
            "Verify NICEIC registration at niceic.com",
            "Check reviews across multiple platforms",
            "Ask for examples of similar completed work"
          ]
        },
        {
          heading: "Electrician Costs in Manchester",
          content: `Understanding typical costs helps you budget and spot unrealistic quotes:

**Hourly Rates:**
- Standard electrician: £45-£65 per hour
- Specialist/commercial: £65-£90 per hour
- Emergency/out-of-hours: £80-£150 per hour

**Common Job Prices:**
- Socket installation: £80-£150
- Light fitting replacement: £60-£120
- Consumer unit (fuse box) upgrade: £400-£800
- Full house rewire (3-bed): £3,000-£6,000
- EICR (Electrical Certificate): £150-£300
- Outdoor lighting installation: £200-£500
- EV charger installation: £800-£1,500

**Factors Affecting Cost:**
- Property age and existing wiring condition
- Ease of access (loft spaces, underfloor)
- Materials quality
- Urgency of work
- Size of property

**Money-Saving Tips:**
- Combine multiple small jobs into one visit
- Schedule during standard hours
- Clear access to work areas
- Get 3+ quotes for larger jobs
- Consider economy materials where appropriate`,
          tips: [
            "Get written quotes detailing all costs",
            "Check if VAT is included",
            "Ask about warranty periods on work"
          ]
        },
        {
          heading: "Where to Find Top Manchester Electricians",
          content: `Quality sources for finding electricians:

**MyApproved:**
- Verified qualifications and insurance
- Genuine customer reviews
- Transparent pricing
- Guaranteed work quality

**NICEIC/ELECSA Directories:**
- Search by postcode
- Filter by services offered
- Direct contact details

**Recommendations:**
- Friends and family referrals
- Neighbours who've had similar work
- Local Facebook community groups
- Nextdoor app recommendations

**What to Check:**
- Minimum 5+ genuine reviews
- Photos of completed work
- Clear pricing information
- Professional communication
- Reasonable response time
- Proper business setup (not 'cash in hand')

**Warning Signs:**
- No online presence or reviews
- Quotes without seeing the job
- Demands full payment upfront
- No written guarantee offered
- Can't provide registration details`,
          tips: [
            "Check electricians have £2M+ public liability insurance",
            "Ask about guarantee periods - reputable electricians offer 12 months+",
            "Verify they provide certificates for notifiable work"
          ]
        }
      ],
      faqs: [
        {
          question: "What's the difference between NICEIC and ELECSA?",
          answer: "Both are government-approved competent person schemes allowing electricians to self-certify work. NICEIC is larger and more widely recognised. ELECSA is equally valid. Both ensure electricians meet required standards."
        },
        {
          question: "Do I need an electrical certificate?",
          answer: "Yes, for all notifiable work including new circuits, consumer unit replacements, and major alterations. The certificate proves work meets safety standards and is essential when selling your property."
        },
        {
          question: "How long does a house rewire take?",
          answer: "A full rewire typically takes 5-10 days for a 3-bedroom house. Duration depends on property size, ease of access, and whether you're living there during work."
        },
        {
          question: "Can I stay in my house during a rewire?",
          answer: "It's possible but inconvenient. Electricity will be off for periods, and there's dust and disruption. Many homeowners stay elsewhere for part of the work."
        }
      ]
    },
    relatedTrades: ["plumber", "security-installer", "heating-engineer"],
    relatedLocations: ["Manchester", "Liverpool", "Leeds"]
  },
  
  "common-boiler-problems-winter": {
    slug: "common-boiler-problems-winter",
    title: "Common Boiler Problems in Winter: How to Fix & Prevent Them",
    metaTitle: "Common Boiler Problems Winter | How to Fix & Prevent Breakdowns",
    metaDescription: "Winter boiler problems? Frozen pipes, pressure issues, no heating? Learn common winter boiler faults, quick fixes, and when to call a Gas Safe engineer. Get help now.",
    author: "MyApproved Editorial Team",
    publishedDate: "2024-01-10",
    readTime: "7 min read",
    category: "Maintenance Guides",
    tags: ["boiler", "heating", "winter", "maintenance", "gas engineer"],
    featured: true,
    image: "/images/blog/boiler-winter.jpg",
    content: {
      introduction: `Winter puts maximum strain on your boiler. When temperatures drop, heating systems work harder and hidden problems emerge. Understanding common winter boiler issues helps you respond quickly, potentially saving expensive emergency call-outs.

This guide covers the most frequent winter boiler problems, DIY fixes you can try, and when you must call a Gas Safe registered engineer.`,
      sections: [
        {
          heading: "No Heating or Hot Water",
          content: `The most distressing winter boiler problem. Here's how to troubleshoot:

**Check the Basics First:**
- Is the boiler switched on at the wall?
- Is the programmer/timer set correctly?
- Is the thermostat set above room temperature?
- Are radiators turned on?

**Common Causes:**
- Frozen condensate pipe (most common in winter)
- Low boiler pressure
- Failed ignition
- Thermostat fault
- Pump failure
- Motorised valve stuck

**DIY Fixes to Try:**
1. **Reset the boiler** - Press the reset button and wait 5 minutes
2. **Check pressure** - Should be 1-1.5 bar when cold
3. **Thaw frozen pipe** - See condensate section below
4. **Bleed radiators** - Remove air locks

**When to Call an Engineer:**
- Boiler displays error code you don't recognise
- Reset doesn't solve the problem
- You smell gas (call emergency line immediately)
- Pressure keeps dropping after topping up
- Strange noises from boiler

**Emergency Numbers:**
- Gas Emergency: 0800 111 999
- MyApproved Emergency Plumbers: Available 24/7`,
          tips: [
            "Never attempt gas-related repairs yourself",
            "Keep your Gas Safe engineer's number handy",
            "Annual servicing prevents 80% of winter breakdowns"
          ]
        },
        {
          heading: "Frozen Condensate Pipe",
          content: `The #1 winter boiler problem. The condensate pipe carries acidic waste water outside. In freezing weather, it blocks with ice, shutting down your boiler.

**How to Identify:**
- Boiler displays error code (varies by manufacturer)
- Gurgling sound from boiler
- Boiler works then stops repeatedly
- Error mentions condensate or drainage

**Locate Your Condensate Pipe:**
- White plastic pipe (20-32mm diameter)
- Runs from boiler to external drain
- Often exits at ground level or just below

**How to Thaw It:**

**Method 1 - Warm Water:**
1. Fill a jug/kettle with warm (not boiling) water
2. Pour slowly over the frozen section
3. Work from the top down
4. Repeat until water flows freely

**Method 2 - Hot Water Bottle:**
1. Fill hot water bottle
2. Wrap around frozen pipe
3. Secure with towels
4. Wait 30-60 minutes

**Method 3 - Heat Pad:**
1. Apply electric heat pad to pipe
2. Set to low-medium heat
3. Check regularly

**DO NOT:**
- Use boiling water (can crack pipe)
- Apply direct flame
- Forcefully hit the pipe

**Prevent Future Freezing:**
- Lag (insulate) the pipe with foam insulation
- Increase pipe diameter (32mm better than 20mm)
- Reroute through warmer areas if possible
- Keep heating on low constantly during cold snaps
- Ask engineer about trace heating options`,
          tips: [
            "Keep heating on constant low (15°C) during severe cold",
            "Insulate condensate pipe before winter arrives",
            "Know where your stopcock is in case of leaks"
          ]
        },
        {
          heading: "Low Boiler Pressure",
          content: `Boiler pressure drops are common and often easily fixed. Understanding your system helps:

**Normal Pressure:**
- Cold boiler: 1.0 - 1.5 bar
- Hot boiler: 1.5 - 2.0 bar

**Checking Pressure:**
- Look at pressure gauge on boiler front
- Digital displays show pressure reading
- Some have separate pressure indicator

**How to Re-Pressurise (Combi Boilers):**

**Step 1:** Turn off boiler and let cool

**Step 2:** Find filling loop
- Usually silver/grey braided hose under boiler
- Has two valves (taps) at either end

**Step 3:** Open valves
- Turn both valves 90° to open
- You'll hear water flowing
- Watch pressure gauge rise

**Step 4:** Close at 1.5 bar
- Close both valves
- Pressure should stabilise

**Step 5:** Restart boiler
- Turn boiler back on
- Check pressure holds steady

**If Pressure Keeps Dropping:**
This indicates a leak somewhere in the system. Common causes:
- Leaking radiator valves
- Leaking pipework
- Faulty expansion vessel
- Pressure relief valve fault
- Heat exchanger leak (serious)

**Call an engineer if:**
- Pressure drops again within 24 hours
- You see water leaking anywhere
- Pressure relief valve discharges regularly
- Boiler makes strange noises when pressurising`,
          tips: [
            "Check pressure weekly during winter",
            "Don't over-pressurise - max 2.5 bar when cold",
            "Persistent pressure drops always need professional attention"
          ]
        },
        {
          heading: "Radiator Problems",
          content: `Cold radiators when the heating's on? Several causes:

**Radiator Cold at Top, Hot at Bottom:**
- **Cause:** Air trapped in radiator
- **Fix:** Bleed the radiator
  1. Turn off heating and let cool
  2. Find bleed valve (small square at top)
  3. Use radiator key or screwdriver
  4. Open slightly until water appears
  5. Close immediately
  6. Check boiler pressure (may need topping up)

**Radiator Cold at Bottom, Hot at Top:**
- **Cause:** Sludge/rust buildup blocking flow
- **Fix:** Needs power flushing by engineer
- **Temporary help:** Balance radiators

**One Radiator Cold, Others Hot:**
- **Cause:** Valve closed or radiator isolated
- **Fix:** Check both valves are open (turn anticlockwise)

**All Radiators Lukewarm:**
- **Cause:** System needs balancing or boiler fault
- **Check:** Is boiler reaching temperature?
- **Check:** Pump running properly?

**Noisy Radiators:**
- Ticking: Normal expansion/contraction
- Banging: Air in system or pump issue
- Gurgling: Air needing bleeding
- Humming: Pump speed too high

**Balancing Radiators:**
If some rooms are much hotter than others:
1. Turn all TRVs (thermostatic valves) to max
2. Turn heating on for 1 hour
3. Go to nearest radiator to boiler
4. Close lockshield valve, then open 1/4 turn
5. Move to next radiator, open 1/2 turn
6. Continue increasing for each radiator
7. This ensures even heat distribution

**When to Call Engineer:**
- Multiple radiators cold after bleeding
- Pressure repeatedly drops after bleeding
- Radiators leaking water
- System needs power flushing`,
          tips: [
            "Bleed radiators at start of each heating season",
            "Add inhibitor to system to prevent sludge",
            "Consider smart TRVs for room-by-room control"
          ]
        }
      ],
      faqs: [
        {
          question: "Should I turn my heating off when I go on holiday in winter?",
          answer: "No. Set it to frost protection (8-12°C) to prevent pipes freezing. The small cost is worth avoiding burst pipes and water damage."
        },
        {
          question: "Why does my boiler make loud noises when it starts?",
          answer: "Banging or kettling noises often indicate limescale buildup (in hard water areas) or sludge in the system. Both need professional attention."
        },
        {
          question: "How often should I service my boiler?",
          answer: "Annually, ideally in late summer before heavy use. This maintains efficiency, validates warranties, and prevents breakdowns."
        },
        {
          question: "Is it worth getting boiler cover insurance?",
          answer: "For boilers over 5 years old, yes. Newer boilers under warranty may not need it. Compare cover costs vs likely repair bills."
        },
        {
          question: "My pilot light keeps going out - what's wrong?",
          answer: "Could be a draught, faulty thermocouple, or gas pressure issue. Never attempt repairs yourself - always call a Gas Safe engineer."
        }
      ]
    },
    relatedTrades: ["plumber", "gas-engineer", "heating-engineer"],
    relatedLocations: ["London", "Manchester", "Birmingham"]
  }
}

interface BlogPost {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  author: string
  publishedDate: string
  readTime: string
  category: string
  tags: string[]
  featured: boolean
  image: string
  content: {
    introduction: string
    sections: {
      heading: string
      content: string
      tips: string[]
    }[]
    faqs: {
      question: string
      answer: string
    }[]
  }
  relatedTrades: string[]
  relatedLocations: string[]
}

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
  
  return (
    <>
      {/* Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
            "dateModified": post.publishedDate,
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
          })
        }}
      />
      {/* Speakable — voice search & AI assistant extraction */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "url": `https://myapproved.com/blog/${post.slug}`,
            "speakable": {
              "@type": "SpeakableSpecification",
              "cssSelector": ["h1", "h2", "[data-speakable]"]
            }
          })
        }}
      />
      
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
          })
        }}
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
