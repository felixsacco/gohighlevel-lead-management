# 🔍 MyApproved.com - Comprehensive System Audit & Mapping

This document provides a deep structural and architectural analysis of the MyApproved.com platform, mapping out the entrypoints, data layers, integration vulnerabilities, notification systems, and monetization workflows.

---

## 1. Entrypoint & Routing Architecture

### Frontend & API Router
The platform is built as a modern **Next.js 14** application utilizing the **App Router** paradigm. All routing is handled within the `/app` directory:
- **Client Pages**: User-facing pages are rendered via layouts and page files (e.g., `app/page.tsx`, `app/about/page.tsx`, `app/[trade]/page.tsx`).
- **Route Handlers (Next.js API)**: Backend logic is handled using Next.js Route Handlers under the `app/api/` folder structure. Each route is defined inside a `route.ts` file (e.g., `app/api/jobs/submit/route.ts`).
- **Server Orchestration**: Development and production environments run using Next.js runtime configurations, served over port `3000` or `3001` (managed via `scripts/run-next.js` and `start-server.bat`).

### Middleware & Configuration
- **Caching**: The webpack configuration (`next.config.js`) restricts persistent cache on development to manage memory on lower-tier host instances.
- **Routing Rules**: Dynamic routing is heavily utilized for programmatic SEO (such as `app/[trade]/[location]/page.tsx`) to render tailored SEO-optimized landing pages.

---

## 2. Data Models & Database Schema

### Schema Definitions (`lib/db-schema.ts`)
The core domain entities are designed as highly structured TypeScript interfaces ready for mapping to PostgreSQL tables:
1. **Trade**: Represents service categories (e.g., Plumber, Roofer) withPlural names, descriptions, priority ratings, keywords, and typical hourly rates.
2. **Location**: Models UK geographical regions mapping back to postcode prefix areas (e.g., `ST` for Stoke-on-Trent, `SW` for London) and populations.
3. **TradespersonProfile**: Extensive profile schema containing business name, trade associations, certifications, liability insurance verification status, reviews, subscription tier (`free`, `basic`, `pro`, `premium`), and geographical postcodes covered.
4. **JobLead / Lead**: Stores details of customer service requests (postcode, service type, description, urgency, preferred timing, status).
5. **Review / Portfolio**: Tracks ratings and visual completed projects for trust scores.

### Database Connection
- **Provider**: **Supabase** serves as the relational backend.
- **Access**: Applications authenticate using the Supabase Service Role key (`SUPABASE_SERVICE_ROLE_KEY`) for elevated admin operations or the anonymous public key for standard frontend access.

---

## 3. Form Submission & GoHighLevel (GHL) Sync Audit

### Request Lifecycle
1. A client completes a job request via `components/AIQuoteForm.tsx` or `components/JobPostForm.tsx`.
2. The payload is sent to `app/api/jobs/submit/route.ts`, which validates fields and creates a record in the Supabase database under the `jobs` table.
3. Once written, the route handler fires an internal API request to `/api/crm/sync-job`.
4. `/api/crm/sync-job` invokes `lib/gohighlevel-service.ts` to push the lead details to GoHighLevel CRM.

### Why Sync is Failing (Root Causes)
- **Environment Variable Mismatch**: The `.env` template defines `GHL_API_KEY` and `GHL_LOCATION_ID`, but the API route handler (`app/api/crm/sync-job/route.ts`) checks for `GOHIGHLEVEL_API_KEY` and `GOHIGHLEVEL_LOCATION_ID`. Consequently, the service fails with a `"CRM sync disabled"` configuration error.
- **Bearer Token Resolution**: The header authorization expects a standard bearer configuration but is mismatched across Private Integration tokens ("pit-") vs standard OAuth tokens.
- **Payload Schema Mismatches**: GHL's Newer V2 endpoints (`/contacts/` and `/opportunities/`) require exact schemas that fail to register if custom fields are not explicitly configured or mapped on the target location profile.

---

## 4. Notification & Geo-Matching Architecture

### Geolocation & Distance Calculations
Geographical mapping is handled using postcodes in `/lib/utils/postcode-matcher.ts`:
- **Postcode Regions**: Postcodes are mapped to UK regions via their area prefix (e.g., `E` → London, `ST` → West Midlands).
- **Proximity Calculations**: Proximity score (0-100) is evaluated using prefix matchers. Proximity score `>= 100` signifies a same-postcode/area match, `>= 75` signifies same-region, and `>= 50` covers adjacent regions (e.g. London to South East).
- **Radius Thresholding**: `isPostcodeWithinRange(jobPc, tpPc, threshold)` filters matches within specified miles or proximity weights (typically utilizing 50 as adjacent/regional match baseline).

### Alert Dispatcher (`notifyMatchingTradespeopleForJob`)
- When a job moves to `live`, the system queries the `tradespeople` table in Supabase.
- It filters candidates using `tradesMatch()` for category matching and `locationMatchesJob()` for geographical proximity.
- It differentiates between:
  1. **Unlimited Subscriptions**: Receives immediate email alerts containing unmasked project information.
  2. **Pay-Per-Lead (Free/Basic)**: Receives both Email and SMS alerts. The customer's phone number is securely masked using `maskUkPhoneNumber()` (e.g., `077XXXX`), and they are provided a link to pay the lead fee via Stripe.

---

## 5. Payment & Lead Monetization Webhooks

### Lead Gating
Leads are strictly gated using the `lead_purchases` schema:
- When matching tradespeople are alerted, a record is written into `lead_purchases` with `status: 'offered'`.
- Customer phone numbers are masked on the tradesperson’s lead view page (`/leads/[id]`).
- Clicking "Unlock Details" hits `app/api/leads/[id]/checkout/route.ts` which spawns a Stripe Checkout session.

### Integrating GHL Native Payments & Webhooks
To bypass or complement Stripe, we can listen for **GoHighLevel native payment completions**:
- **GHL Trigger**: When a payment link is processed in GHL, GHL triggers a webhook to our server.
- **Go Backend Webhook Handler**: We create `/api/webhooks/ghl-payment` to parse GHL's payload, identify the `lead_purchase_id` in the webhook meta/custom data, and update the matching `lead_purchases` record status in Supabase to `paid`. This immediately unlocks the full contact detail for the paying tradesperson.

---

## 6. Homepage AI Calculator Analysis

### Current Implementation
- The homepage form (`components/AIQuoteForm.tsx`) queries the `/api/estimate` route.
- `/api/estimate` returns a calculated estimate based on `lib/pricing/PricingCalculator.ts`.
- **The Issue**: The current calculator is deterministic and matrix-based, looking up standard static rates in `PricingMatrix.json`. It does not use Generative AI, so users describing unique, complex, or multi-skilled requirements do not receive realistic, nuanced pricing.
- **The Fix**: Create a dedicated Go endpoint `/api/calculate-quote` using the **official Google Generative AI Go SDK (`google.genai`)** with `GEMINI_API_KEY` to parse the description, postcode, and urgency to return a structured JSON quote breakdown.

---

## 🛠️ Unified Go Backend Platform Architecture

As GoLang is selected as the primary backend API server for these critical pathways, we will build a dedicated, compile-safe Go API application in the workspace root. It will expose the following routes and coordinate with Supabase and CRM endpoints:

```
                  ┌────────────────────────────────────────┐
                  │          Next.js Frontend              │
                  └──────────────────┬─────────────────────┘
                                     │
                                     ▼ (HTTP API Calls)
                  ┌────────────────────────────────────────┐
                  │           Go Backend Server            │
                  │              (Port 8080)               │
                  └────┬─────────────┬─────────────┬───────┘
                       │             │             │
                       ▼             ▼             ▼
              ┌──────────────┐┌──────────────┐┌──────────────┐
              │  GHL Sync &  ││ Postcode Geo ││ Gemini AI   │
              │  Webhooks    ││ Matching    ││ Estimator    │
              └──────────────┘└──────────────┘└──────────────┘
```

This ensures maximum speed, type safety, and clean separation of concerns for lead distribution, payments, and AI operations.
