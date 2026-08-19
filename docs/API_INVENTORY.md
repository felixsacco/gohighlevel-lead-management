# MyApproved — API Inventory & Codebase Mapping (Current State)

**Date:** 2026-08-10
**Brief:** API Audit, Integration and Remediation Brief
**Status:** Updated post-remediation — reflects codebase as-is

---

## 1. Environment Variables — Full Catalogue

Every environment variable referenced in the codebase, its usage locations, and declaration status.

### 1.1 Present in `.env.local` with real values (dev only)

| Variable | References | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `lib/supabase.ts`, 15 API routes | Real value. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `lib/supabase.ts`, 6 API routes | Real value. |
| `SUPABASE_SERVICE_ROLE_KEY` | `lib/supabase.ts`, 15 API routes | Real value. **Must never be committed.** |
| `GHL_API_KEY` | `lib/gohighlevel-service.ts` | Real key. Primary payment & SMS provider. |
| `GHL_LOCATION_ID` | `lib/gohighlevel-service.ts` | Real value. |
| `GOHIGHLEVEL_API_KEY` | Legacy compatibility fallback | Duplicate of `GHL_API_KEY` |
| `GOHIGHLEVEL_LOCATION_ID` | Legacy compatibility fallback | Duplicate of `GHL_LOCATION_ID` |
| `GEMINI_API_KEY` | Not used in Next.js/TS app | Go backend only |
| `DEEPSEEK_API_KEY` | Not used in Next.js/TS app | Go backend only |
| `COMPANIES_HOUSE_API_KEY` | `lib/companies-house.ts` | Real key. Gold standard degradation pattern. |
| `GOOGLE_SERVER_API_KEY` | `app/api/places/route.ts`, `app/api/places/diagnose/route.ts` | Places API + reCAPTCHA fallback |
| `PORT` | Server listen | `8080` |
| `CRON_SECRET` | `app/api/notifications/process-scheduled/route.ts` | Real value. |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Client-side Maps | Real value. |
| `NEXT_PUBLIC_APP_URL` | Canonical URLs, email links | `https://myapproved.com` |
| `ADMIN_EMAIL` | `lib/notifications/admin-inbox.ts`, dispute routes | `khamareclarke@gmail.com` |
| `SUPPORT_EMAIL` | `lib/notifications/email-layout.ts` | `support@myapproved.com` |
| `SMTP_HOST/PORT/USER` | `lib/notifications/email.ts` | GoDaddy SMTP. `SMTP_PASS` empty in `.env.local`. |
| `FLEET_INGEST_URL` | `lib/fleet/emitFleetIngest.ts` | `https://www.khamareclarke.com/api/fleet/ingest` |
| `NEXT_PUBLIC_AGGREGATE_RATING_*` | `components/SchemaMarkup.tsx` | Configurable JSON-LD ratings |

### 1.2 Present in `.env` / `.env.example` but EMPTY (needs provisioning)

| Variable | References | What it does |
|---|---|---|
| `NEXT_PUBLIC_GA_ID` | `lib/analytics.ts` | **PLACEHOLDER** `G-XXXXXXXXXX` — not a valid GA4 ID. GA4 is the sole analytics provider. |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | `components/ReCaptchaProvider.tsx` | reCAPTCHA v3 frontend |
| `RECAPTCHA_SECRET_KEY` | Form verify endpoints | reCAPTCHA v3 backend |
| `RECAPTCHA_PROJECT_ID` | reCAPTCHA Enterprise | GCP project number |
| `GOHIGHLEVEL_ACCESS_TOKEN` | `app/api/crm/sync-job/route.ts` | CRM token |
| `GOHIGHLEVEL_CLIENT_ID/SECRET/REDIRECT_URI` | `app/api/crm/oauth/callback/route.ts` | OAuth flow |
| `EMPIRE_WEBHOOK_SECRET` | `app/api/empire-trigger/route.ts` | Empire OS HMAC secret |
| `FLEET_INGEST_SECRET` | `lib/fleet/emitFleetIngest.ts` | Fleet ingestion auth |
| `TWILIO_ACCOUNT_SID/AUTH_TOKEN/FROM_NUMBER/MESSAGING_SERVICE_SID` | `lib/notifications/sms.ts` | **Optional SMS fallback only** — GHL is primary SMS provider |
| `ENABLE_AUTO_ASSIGN_JOB` | `app/api/jobs/apply/route.ts` | Feature flag |

---

## 2. `.env` Hygiene — Current State

### 2.1 Clean template files

`.env` and `.env.example` are now proper templates — all values are empty placeholders. `.env.local` holds all real secrets and is `.gitignore`d. All three files are structurally identical (same variables, same order, same comments).

### 2.2 `.env.txt` — RESOLVED

Deleted. Added to `.gitignore`.

### 2.3 Hardcoded Supabase credentials — RESOLVED

`lib/supabase.ts` no longer uses hardcoded fallback values. Missing env vars now cause graceful failure (logged warning, no throw).

### 2.4 Removed variables

The following variables were removed from `.env`/`.env.example` as their services have been decommissioned:

| Removed Variable | Former Service | Status |
|---|---|---|
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog | Removed — GA4 is sole analytics provider |
| `NEXT_PUBLIC_HOTJAR_ID` | Hotjar | Removed — GA4 is sole analytics provider |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry | Removed — GA4 is sole analytics provider |
| `SENTRY_AUTH_TOKEN` | Sentry | Removed |
| `SENTRY_ORG` | Sentry | Removed |
| `SENTRY_PROJECT` | Sentry | Removed |
| `STRIPE_SECRET_KEY` | Stripe SDK | Removed — GHL handles all payments |
| `STRIPE_WEBHOOK_SECRET` | Stripe SDK | Removed |
| `STRIPE_UNLIMITED_PRICE_ID` | Stripe SDK | Removed |

### 2.5 `formatDetection` status

`app/layout.tsx` has `formatDetection: { telephone: true }` — correctly set.

---

## 3. Outbound API Calls & Third-Party Dependencies

### 3.1 Supabase (Database + Auth + Realtime)

| Property | Value |
|---|---|
| SDK | `@supabase/supabase-js` |
| Target | `https://jismdkfjkngwbpddhomx.supabase.co` |
| Wired | **Fully** |
| Client init | `lib/supabase.ts` |
| Graceful degradation | **YES** — logs warning on missing env vars, no hardcoded fallbacks |

### 3.2 GoHighLevel (Payments + SMS + CRM)

| Property | Value |
|---|---|
| SDK | Native `fetch()` |
| Target | `https://services.leadconnectorhq.com` |
| Wired | **Partially** — OAuth and sync routes built |
| Key files | `lib/gohighlevel-service.ts`, `app/api/crm/sync-job/route.ts`, `app/api/crm/oauth/callback/route.ts` |
| Graceful degradation | **YES** — checks key presence before calls |
| Payment note | GHL uses Stripe as its backend processor. Customers see "Stripe" on statements. No direct Stripe SDK in the codebase. |

### 3.3 GoDaddy SMTP (Email)

| Property | Value |
|---|---|
| SDK | `nodemailer` |
| Target | `smtpout.secureserver.net:465` SSL |
| Wired | **Partially** |
| Key file | `lib/notifications/email.ts` |
| Graceful degradation | **YES** — logs warning on missing credentials |

### 3.4 Empire OS / Fleet Ingest (Observability)

| Property | Value |
|---|---|
| SDK | Native `fetch()` |
| Target | `https://www.khamareclarke.com/api/fleet/ingest` |
| Wired | **Active** |
| Key file | `lib/fleet/emitFleetIngest.ts` |
| Graceful degradation | **YES** (gold standard) — fire-and-forget, 4s timeout, never throws |

### 3.5 Google Places

| Property | Value |
|---|---|
| SDK | Native `fetch()` |
| Target | Google Places Text Search API |
| Wired | **Partially** — handler written, no UI integration |
| Key file | `app/api/places/route.ts` |
| Graceful degradation | **YES** — empty results on missing key |

### 3.6 Companies House

| Property | Value |
|---|---|
| SDK | Native `fetch()` with Basic auth |
| Target | `https://api.company-information.service.gov.uk` |
| Wired | **Partially** — search and profile endpoints built |
| Key file | `lib/companies-house.ts` |
| Graceful degradation | **YES** (gold standard) — returns `[]` or `null`, `console.warn` on missing key, never throws |

### 3.7 GA4 + Consent Mode v2

| Property | Value |
|---|---|
| SDK | gtag.js (inline script) |
| Target | `https://www.googletagmanager.com/gtag/js` |
| Wired | **Partially** — GA4 + Consent Mode v2 coded, GA ID is placeholder `G-XXXXXXXXXX` |
| Key file | `lib/analytics.ts` |
| Graceful degradation | **YES** — checks key before loading, defaults consent denied for GB/EU |
| Note | **Sole analytics provider.** PostHog, Hotjar, and Sentry have been removed. |

### 3.8 Twilio (SMS — Optional Fallback)

| Property | Value |
|---|---|
| SDK | `twilio` Node.js |
| Wired | **Fallback only** — GHL is the primary SMS provider |
| Key file | `lib/notifications/sms.ts` |
| Graceful degradation | **YES** — `isSmsConfigured()` returns false if neither provider configured |

### 3.9 Gemini / DeepSeek

Both exist only in the Go backend. Not referenced by the Next.js/TS application.

---

## 4. Integration Status Matrix

| Integration | Status | Graceful Degradation | Notes |
|---|---|---|---|
| **Supabase** | Fully Wired | Yes | Auth + DB + realtime. Hardcoded fallbacks removed. |
| **GoHighLevel** | Partially Wired | Yes | Handles ALL payments (via Stripe backend) + primary SMS + CRM. |
| **GoDaddy SMTP** | Partially Wired | Yes | Email delivery. |
| **Google Places** | Partially Wired | Yes | API route built, no UI integration. |
| **GA4 + Consent Mode** | Partially Wired | Yes | Sole analytics provider. Code ready, GA ID needs real value. |
| **Companies House** | Partially Wired | Yes (gold standard) | Search + profile endpoints. |
| **Empire / Fleet** | Active | Yes | Observability ingest. |
| **Twilio SMS** | Optional Fallback | Yes | Only used if GHL unavailable. Credentials empty. |
| **reCAPTCHA** | Scaffolded | Yes | Provider component exists, keys provisioned. |
| **Gemini** | Go backend only | N/A | NOT in Next.js/TS app. |
| **DeepSeek** | Go backend only | N/A | NOT in Next.js/TS app. |
| **Google Maps JS** | Active | Yes | Client-side Maps API. |
| **PostHog** | REMOVED | N/A | GA4 is sole analytics provider. |
| **Hotjar** | REMOVED | N/A | GA4 is sole analytics provider. |
| **Sentry** | REMOVED | N/A | `instrumentation.ts` is a clean no-op. |
| **Stripe SDK** | REMOVED | N/A | GHL handles all payments via its LeadConnector API. Public-facing text still says "Stripe" since GHL uses Stripe internally. |
| **Google Tag Manager** | Absent | N/A | GA4 loaded directly, no GTM. |
| **WhatsApp Business** | Absent | N/A | Not implemented. |
| **GoCardless** | Absent | N/A | No Direct Debit. |
| **Google Calendar** | Absent | N/A | No calendar sync. |
| **Firebase Cloud Messaging** | Absent | N/A | No push notifications. |
| **Geocoding** | Absent | N/A | No Google Geocoding API calls. |
| **Address Validation** | Absent | N/A | No Address Validation API. |
| **Document AI** | Absent | N/A | No document processing. |
| **Vision** | Absent | N/A | No image analysis. |
| **Search Console** | Absent | N/A | No API integration. |

---

## 5. Metadata & SEO Defects (from Phase 0)

### 5.1 Root Layout (`app/layout.tsx`)

| Defect | Severity | Status |
|---|---|---|
| Relative OG image URL | High | **FIXED** — now absolute |
| Relative Twitter image | High | **FIXED** — now absolute |
| Duplicate `<meta>` tags in `<head>` | High | **FIXED** — removed from `<head>` |
| Duplicate Google verification | Medium | **FIXED** |
| ReviewSchema in root layout | Low | **FIXED** — removed from layout, now only on relevant pages |
| `metadataBase` dynamic URL | Medium | Open — uses `VERCEL_URL` |

### 5.2 Duplicate Route (`app/[trade]/[location]/page.tsx`)

| Property | Status |
|---|---|
| robots | Correct: `index: false` |
| canonical | Correct: points to `/find-tradespeople/` |
| Breadcrumb internal links | **FIXED** — now point to `/find-tradespeople/` |
| Ratings | **FIXED** — uses env-configured values |
| JSON-LD | Inline |

### 5.3 Primary Route (`app/find-tradespeople/[trade]/[location]/page.tsx`)

| Property | Status |
|---|---|
| SEO | Clean — dynamic canonicals, proper internal links |
| Ratings | **FIXED** — uses env-configured values |
| JSON-LD | Comprehensive |

---

## 6. Hardcoded Trust Claims (from Phase 0)

### 6.1 Star Ratings & Review Counts — RESOLVED

Ratings previously came from `NEXT_PUBLIC_AGGREGATE_RATING_VALUE`, `NEXT_PUBLIC_AGGREGATE_RATING_COUNT`, and `NEXT_PUBLIC_AGGREGATE_REVIEW_COUNT` environment variables. These are no longer consumed in source and are left empty to suppress fabricated aggregate ratings.

### 6.2 Competitive Claims

Still present in `components/TrustEngineSection.tsx` — hardcoded marketing copy:
- "Checkatrade charges £300+ per month on a 12-month contract"
- "Checkatrade accepts self-reported credentials"
- "MyBuilder/MyJobQuote charges £15–£80 per lead"
- "Annual re-verification — not a one-time check"

### 6.3 Social Media Links

**FIXED** — now configurable via `NEXT_PUBLIC_FACEBOOK_URL`, `NEXT_PUBLIC_TWITTER_URL`, `NEXT_PUBLIC_INSTAGRAM_URL`, `NEXT_PUBLIC_LINKEDIN_URL`, `NEXT_PUBLIC_YOUTUBE_URL` env vars. Pages silently omit any whose value is absent.

---

## 7. Structural Issues

### 7.1 Duplicate Route Pattern

URL Pattern B (`/[trade]/[location]`) duplicates Pattern A (`/find-tradespeople/[trade]/[location]`). Pattern B correctly uses `robots: { index: false }` and canonical to Pattern A. Breadcrumb links are now fixed.

**Scale:** 33 trades × 64 locations = 2,112 pages per pattern.

### 7.2 CSP — Report-Only Mode

`next.config.js` sets `Content-Security-Policy-Report-Only`. Not yet graduated to enforcing. Policy is clean — only GA4, Supabase, and LeadConnector domains allowed.

### 7.3 Security Headers

| Header | Status |
|---|---|
| `X-Content-Type-Options: nosniff` | Enforcing |
| `X-Frame-Options: SAMEORIGIN` | Enforcing |
| `Referrer-Policy: strict-origin-when-cross-origin` | Enforcing |
| `Strict-Transport-Security` (2yr, subdomains, preload) | Enforcing |
| `X-XSS-Protection` | Added |
| `Permissions-Policy` | Added |
| `Content-Security-Policy` | Report-Only (monitoring) |

---

## 8. Structured Data Audit

### 8.1 Schemas

- `OrganizationSchema` — root layout. `sameAs` URLs now env-configured.
- `WebsiteSchema` (+ SearchAction) — root layout.
- `LocalBusinessSchema` — root layout. `sameAs` now env-configured.
- `ReviewSchema` — **REMOVED** from root layout. Now only on pages that actually display reviews.
- `FAQSchema`, `ServiceSchema`, `BreadcrumbSchema` — still in root layout.

---

## 9. Graceful Degradation Audit

### Gold Standard: `lib/companies-house.ts`
Checks API key on every call, returns `[]` or `null` on missing key, `console.warn` — never `throw`. 404 handled as `null`. Safe at build time and runtime.

### Gold Standard: `lib/fleet/emitFleetIngest.ts`
Fire-and-forget with 4s timeout. Checks `FLEET_INGEST_SECRET`, silently returns if missing. Never throws.

### Good: `lib/analytics.ts`
GA4 is the sole provider. Checks key before loading. Consent Mode v2 defaults denied for GB/EU. Errors caught and logged.

### Good: `lib/notifications/sms.ts`
`isSmsConfigured()` returns false if neither GHL nor Twilio configured. No throw, log and skip.

### Good: `lib/supabase.ts`
Hardcoded fallback values removed. Missing env vars cause graceful failure with logged warnings.

### Good: `lib/gohighlevel-service.ts`
All calls guard on API key presence. Returns null/empty on missing config.

---

## 10. API Route Inventory Summary

All Stripe-related API routes (`app/api/stripe/**`) have been removed. GHL handles payments via its LeadConnector API.

Routes with Supabase admin access: `trades/register`, `leads/*`, `tradesperson/*`, `client/admin-secret/*`, `places/track`, `notifications/*`. All have null-guard wrappers.

---

## 11. Google Cloud API Readiness

| API | Status | Key Location |
|---|---|---|
| Places API | Code exists, key provisioned | `GOOGLE_SERVER_API_KEY` |
| Maps JavaScript | Active, key provisioned | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` |
| reCAPTCHA Enterprise | Provider scaffolded, key provisioned | `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY` |
| Geocoding API | Not implemented | — |
| Address Validation | Not implemented | — |
| Document AI | Not implemented | — |
| Vision API | Not implemented | — |
| Gemini | Go backend only | `GEMINI_API_KEY` |

---

## 12. Key Architectural Decisions

1. **GHL handles ALL payments.** No Stripe SDK in the codebase. Public-facing text says "Stripe" since GHL uses Stripe internally.
2. **GA4 is the ONLY analytics provider.** PostHog, Hotjar, and Sentry fully removed.
3. **Twilio is optional SMS fallback only.** GHL is the primary SMS provider.
4. **Every integration degrades gracefully.** Missing keys → logged warning → feature disabled. No build-time throws, no user-facing errors.
5. **All secrets in `.env.local` and Vercel env vars.** `.env` and `.env.example` are clean templates with empty values only.

---

*End of current-state inventory.*
