# MyApproved — Manual Actions Register (Phase 4)

**Date:** 2026-08-09
**Purpose:** Step-by-step instructions for provisioning all third-party keys, enabling GCP APIs, and configuring Vercel environment variables.
**Owner:** Khamare Clarke

---

## Vercel Provisioning Status (35 vars total)

**Fully automated (35 vars):** Supabase (3), GHL CRM (7), SMTP (5 + host/port), Empire/Fleet (6), Cron (1), SLA (1), Companies House (1), AI (2), App URL (1), GCP (5 — Places, Maps, reCAPTCHA x3).

**Still needs manual (6 vars):**
- `SMTP_PASS` — GoDaddy email password (GoDaddy → Workspace Email)
- `GOHIGHLEVEL_ACCESS_TOKEN`, `GOHIGHLEVEL_CLIENT_ID`, `GOHIGHLEVEL_SECRET`, `GOHIGHLEVEL_REDIRECT_URI` — OAuth (only needed for OAuth login flow)
- All GCP API keys (Places, Maps, reCAPTCHA) — [x] Provisioned via gcloud CLI (2026-08-09)
- `NEXT_PUBLIC_GA_ID` — GA4 Measurement ID from https://analytics.google.com
- `EMPIRE_WEBHOOK_SECRET`, `EMPIRE_PROJECT_NAME`, `EMPIRE_ENV`, `EMPIRE_CRON_SECRET`, `FLEET_INGEST_SECRET` — Empire OS dashboard
- `ENABLE_AUTO_ASSIGN_JOB` — set to `true` when ready

---

## Pre-Flight

- [ ] **Delete `.env.txt`** — real Supabase credentials are exposed in this file at the project root
- [ ] Add `.env.txt` to `.gitignore`
- [ ] Verify `.env` is in `.gitignore` and has never been committed: `git log --all --full-history -- .env`
- [ ] After completing all steps below, delete ALL values from `.env` except non-secret blank templates

---

## 1. Vercel — Environment Variables (Production)

All values must be set in the Vercel dashboard at **Settings → Environment Variables** for the `production` environment. Variables prefixed `NEXT_PUBLIC_` must also be set for `preview`.

### 1.1 Supabase
| Variable | Source |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role key |

### 1.2 Payments

Payments are handled entirely by GoHighLevel (LeadConnector API). No separate payment provider (Stripe) is needed — GHL manages invoicing, payment links, and subscription billing for both the Unlimited (£1,000/month) and Pay-Per-Lead (£4.99/lead) plans.

| Variable | Source |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Set to `https://myapproved.com` |

### 1.3 Twilio (SMS — OPTIONAL FALLBACK)

**Skip this section.** SMS is handled by GoHighLevel (section 1.4) as the primary provider. Twilio is only used as a fallback in `auto` mode if GHL fails — no Twilio keys are required for SMS to work.

Only provision these if you want redundant SMS fallback:

| Variable | Source |
|---|---|
| `TWILIO_ACCOUNT_SID` | Twilio Console → Account SID (`AC...`) |
| `TWILIO_AUTH_TOKEN` | Twilio Console → Auth Token |
| `TWILIO_FROM_NUMBER` | Twilio Console → Phone Numbers → Active Numbers → select your number (E.164 format: `+44...`) |
| `TWILIO_MESSAGING_SERVICE_SID` | Twilio Console → Messaging → Services → create or select one → Service SID (`MG...`) |

### 1.4 GoHighLevel CRM

#### Already provisioned on Vercel (2026-08-09)
- [x] `GOHIGHLEVEL_API_KEY` — Private integration token (`pit-...`)
- [x] `GOHIGHLEVEL_LOCATION_ID` — Location ID
- [x] `GHL_LOCATION_ID` — Duplicate for compatibility
- [x] `GHL_API_KEY` — Go service compatibility key

#### Still needs manual OAuth setup (only if you want OAuth login flow)

| Variable | Source |
|---|---|
| `GOHIGHLEVEL_ACCESS_TOKEN` | After OAuth flow completes |
| `GOHIGHLEVEL_CLIENT_ID` | GoHighLevel Marketplace App → App Settings |
| `GOHIGHLEVEL_SECRET` | GoHighLevel Marketplace App → App Settings |
| `GOHIGHLEVEL_REDIRECT_URI` | Set to `https://myapproved.com/api/crm/oauth/callback` |

### 1.5 GoDaddy SMTP (Email)

| Variable | Value | Status |
|---|---|---|
| `SMTP_HOST` | `smtpout.secureserver.net` | [x] On Vercel |
| `SMTP_PORT` | `465` | (set in code default) |
| `SMTP_USER` | `noreply@myapproved.com` | [x] On Vercel |
| `SMTP_PASS` | GoDaddy → Workspace Email → noreply@myapproved.com → password | [ ] Manual |
| `NOTIFICATION_FROM_EMAIL` | `noreply@myapproved.com` | [x] On Vercel |
| `ADMIN_EMAIL` | `khamareclarke@gmail.com` | [x] On Vercel |
| `SUPPORT_EMAIL` | `support@myapproved.com` | [x] On Vercel |

### 1.6 Empire / Fleet Observability

| Variable | Source |
|---|---|
| `EMPIRE_WEBHOOK_SECRET` | Empire OS dashboard → Webhook secret |
| `FLEET_INGEST_URL` | `https://www.khamareclarke.com/api/fleet/ingest` |
| `FLEET_INGEST_SECRET` | Empire OS dashboard → Fleet ingest secret |
| `EMPIRE_PROJECT_NAME` | Set to `MyApproved` |
| `EMPIRE_ENV` | `production` |
| `EMPIRE_CRON_SECRET` | Generate: `openssl rand -hex 32` |

### 1.7 Cron & Feature Flags

| Variable | Source | Status |
|---|---|---|
| `CRON_SECRET` | Auto-provisioned on Vercel — generated via CLI | [x] Done |
| `ENABLE_AUTO_ASSIGN_JOB` | Set to `true` when the auto-assign queue is ready | [ ] Manual |

### 1.8 SLA & Config

| Variable | Value | Status |
|---|---|---|
| `NEXT_PUBLIC_DISPUTE_SLA_ACK_HOURS` | `24` — Auto-provisioned on Vercel (Production + Preview) | [x] Done |

### 1.9 Social Media URLs

All of these are marked `NEXT_PUBLIC_` and must be set for both production and preview. Replace the placeholder values with real URLs.

| Variable | Current Placeholder |
|---|---|
| `NEXT_PUBLIC_FACEBOOK_URL` | `https://facebook.com/myapproved` |
| `NEXT_PUBLIC_TWITTER_URL` | `https://twitter.com/myapproved` |
| `NEXT_PUBLIC_INSTAGRAM_URL` | `https://instagram.com/myapproved` |
| `NEXT_PUBLIC_LINKEDIN_URL` | `https://linkedin.com/company/myapproved` |
| `NEXT_PUBLIC_YOUTUBE_URL` | `https://youtube.com/@myapproved` |

### 1.10 Aggregate Ratings

Only set these if you have real data to back them up. See Section 6 — the current hardcoded values should ideally be replaced with a database-backed source.

| Variable | Placeholder Value |
|---|---|
| `NEXT_PUBLIC_AGGREGATE_RATING_VALUE` | `4.9` |
| `NEXT_PUBLIC_AGGREGATE_RATING_COUNT` | `250` |
| `NEXT_PUBLIC_AGGREGATE_REVIEW_COUNT` | `1200` |

---

## 2. Google Cloud Platform — Enable APIs & Create Keys

**[x] All GCP APIs enabled and keys provisioned (2026-08-09) via gcloud CLI.** Keys are on Vercel (Production + Preview) and in `.env`.

### 2.1 Places API (New) — [x] Done

- **API:** Enabled — `places.googleapis.com`
- **Key:** `GOOGLE_SERVER_API_KEY` — restricted to `places.googleapis.com` + `recaptchaenterprise.googleapis.com`
- **On Vercel:** Production + Preview

| Variable | Value |
|---|---|
| `GOOGLE_SERVER_API_KEY` | `AIzaSyCF1cOkDX7XR_oR21r-P7Yys7pgapPJL4c` |

### 2.2 Google Maps JavaScript API — [x] Done

- **API:** Enabled — `maps-backend.googleapis.com`
- **Key:** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — restricted to `maps-backend.googleapis.com`
- **On Vercel:** Production + Preview

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | `AIzaSyDNptytS45ChY7pO1zqXOoDlmEvgNW4cI4` |

### 2.3 reCAPTCHA Enterprise — [x] Done

- **API:** Enabled — `recaptchaenterprise.googleapis.com`
- **Site Key:** `6Le2vH0tAAAAAGHhmnTPIky0sn6QBYaojkmiXaoO` (Website, score integration)
- **Secret Key:** Same as server key (`AIzaSyCF1cOkDX7XR_oR21r-P7Yys7pgapPJL4c`) — restricted to `recaptchaenterprise.googleapis.com`
- **On Vercel:** Production + Preview

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | `6Le2vH0tAAAAAGHhmnTPIky0sn6QBYaojkmiXaoO` |
| `RECAPTCHA_SECRET_KEY` | `AIzaSyCF1cOkDX7XR_oR21r-P7Yys7pgapPJL4c` |
| `RECAPTCHA_PROJECT_ID` | `myapproved` |

### 2.4 Google Analytics 4

1. Go to https://analytics.google.com
2. Create or select the MyApproved property
3. Go to Admin → Data Streams → select web stream
4. Copy the **Measurement ID** (starts with `G-`)

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_GA_ID` | `G-XXXXXXXXXX` (real ID from GA4) |

---

## 3. Analytics

All analytics are handled by Google Analytics 4 (GA4) with Consent Mode v2 for UK GDPR compliance. PostHog, Hotjar, and Sentry have been removed.

### 3.1 Google Analytics 4

Already documented in section 2.4. Set `NEXT_PUBLIC_GA_ID` to your GA4 Measurement ID.

---

## 4. AI APIs (Optional)

### 4.1 Google Gemini

| Variable | Status |
|---|---|
| `GEMINI_API_KEY` | [x] On Vercel Production |

### 4.2 DeepSeek

| Variable | Status |
|---|---|
| `DEEPSEEK_API_KEY` | [x] On Vercel (Production + Preview) |

---

## 5. Companies House API

| Variable | Status |
|---|---|
| `COMPANIES_HOUSE_API_KEY` | [x] On Vercel (Production + Preview) |

---

## 6. Post-Provisioning Checks

After all variables are set in Vercel, run through this checklist:

- [ ] Deploy a new production build
- [ ] Visit `/api/places/diagnose` to confirm Places API returns results
- [ ] Send a test SMS via GoHighLevel (primary SMS provider)
- [ ] Check GA4 real-time reports for visitor activity
- [ ] Verify reCAPTCHA appears on login/registration forms
- [ ] Test email delivery (trigger a notification email)
- [ ] Test GoHighLevel CRM sync
- [ ] Test GHL payment flow for lead unlocks and subscriptions
- [ ] Test Companies House search on the tradesperson registration flow

---

## 7. Long-Term Improvements

These aren't blocking but should be scheduled:

1. **Replace hardcoded ratings with a database-backed system.** Currently 4 files contain hardcoded `4.9` rating and `200`/`1200` review counts. The `NEXT_PUBLIC_AGGREGATE_*` env vars are a temporary bridge.

2. **Replace placeholder social media URLs.** Every location in `SchemaMarkup.tsx` and `Footer.tsx` uses placeholder profile URLs.

3. **Graduate CSP from Report-Only to enforcing.** In `next.config.js`, change `Content-Security-Policy-Report-Only` to `Content-Security-Policy` after the current policy has been monitored for violations.

4. **Add missing security headers:** `X-XSS-Protection`, `Permissions-Policy`, and `Cross-Origin-*` headers to `next.config.js`.

5. ~~Replace hardcoded Supabase fallbacks in `lib/supabase.ts`~~ — **DONE (2026-08-09).** Removed all hardcoded fallbacks; now returns `null` when vars are absent.

6. ~~Fix relative OG/Twitter image URLs in `app/layout.tsx`~~ — **DONE (2026-08-09).** Now uses `${baseUrl}/images/new-og-image.jpg`.

7. ~~Fix breadcrumb internal links in `app/[trade]/[location]/page.tsx`~~ — **DONE (2026-08-09).** All now use `/find-tradespeople/` prefix.

---

*End of Manual Actions Register. All non-automatable provisioning steps are documented above. The `.env.example` template and `.env` file have been updated with all variable entries (blanks where values are secret).*
