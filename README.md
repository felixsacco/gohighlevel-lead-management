# MyApproved™ — Identity-Checked Tradespeople Across the UK

A platform connecting homeowners with **identity-checked** local tradespeople across the UK. Rather than list unverified ratings, MyApproved runs each tradesperson through identity verification (photo ID, proof of trade, Companies House where applicable) so customers can hire with confidence.

## Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 13.5.7** (App Router) |
| UI | **React 18.2.0**, **TypeScript 5.9.2**, **Tailwind CSS 3.3.3** |
| Database / Auth | **Supabase** (PostgreSQL) |
| AI | **Google Gemini** (estimates & verification), **DeepSeek** (auxiliary) |
| CRM / Payments | **GoHighLevel** (LeadConnector API; Stripe-backed payments) |
| SMS | **GoHighLevel** (primary), **Twilio** (fallback) |
| Location / Search | **Google Places API v1**, **Google Maps JavaScript API** |
| Company verification | **Companies House API** (UK) |
| Bot protection | **Google reCAPTCHA Enterprise** |
| Scheduling | **Upstash QStash** |
| Email | **Nodemailer** (custom SMTP) |

## Key features

- **Identity checking** — tradespeople are verified (ID, trade proof, insurance) before they appear.
- **Smart search** — find tradespeople by trade + location/postcode.
- **Quotes & jobs** — post a job, receive quotes, auto-assign via round-robin.
- **CRM sync** — leads sync to GoHighLevel; payments via Stripe (through GHL).
- **Verification lifecycle** — status machine (`lib/verification/user-status-machine.ts`) governs approval.
- **SEO** — JSON-LD structured data (Organization, WebSite, Service, LocalBusiness, FAQPage, BreadcrumbList), dynamic sitemap, canonical/OG/Twitter metadata.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in values (see below)
npm run dev                  # runs `node scripts/run-next.js dev`
```

Open the printed local URL (default port 3000; auto-increments if in use).

Build for production:

```bash
npm run build
npm start
```

## Environment variables

All variables are documented in `.env.example` (committed as a template — the real values live in `.env.local` / `.env`, which are **never** committed). Key groups:

- **Supabase** — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **GoHighLevel** — `GHL_API_KEY`, `GHL_LOCATION_ID`, `GHL_WEBHOOK_SECRET` (plus `GOHIGHLEVEL_*` OAuth/legacy keys)
- **Google Gemini** — `GEMINI_API_KEY`
- **Google Places / Maps** — `GOOGLE_SERVER_API_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- **reCAPTCHA Enterprise** — `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`, `RECAPTCHA_PROJECT_ID`
- **Companies House** — `COMPANIES_HOUSE_API_KEY`
- **Email (SMTP)** — `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `ADMIN_EMAIL`, `NOTIFICATION_FROM_EMAIL`
- **Twilio (SMS fallback)** — `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
- **Scheduling / analytics / flags** — `CRON_SECRET`, `EMPIRE_WEBHOOK_SECRET`, `FLEET_INGEST_URL`, `FLEET_INGEST_SECRET`, `NEXT_PUBLIC_GA_ID`, `ENABLE_AUTO_ASSIGN_JOB`, and more.

Refer to `.env.example` for the complete, up-to-date list and inline guidance.

## Project structure

```
app/            Next.js App Router — pages (`app/*/page.tsx`) and API routes (`app/api/**/route.ts`)
components/     React components (incl. `components/ui/**` design-system primitives)
lib/            Server utilities: analytics, companies-house, CRM sync, geo, pricing,
                matching, notifications, qstash, Supabase clients, verification, SEO
public/         Static assets (favicons, manifest, images, badges)
scripts/        Build/dev runner (`run-next.js`) and data/ops scripts
```

## Scripts

```bash
npm run dev                # dev server
npm run build              # production build
npm run lint               # ESLint
npm run harvest:places     # harvest places data (Google Places)
npm run sync:ghl           # sync prospects to GoHighLevel
npm run verify:phase6      # phase-6 verification check
npm run backfill:geo       # backfill geocoding
```

## Deployment

Deployed on **Vercel** at [myapproved.com](https://myapproved.com). See `DEPLOYMENT.md` for environment-variable setup and deploy details.

---

**MyApproved™** — identity-checked tradespeople, across the UK.
