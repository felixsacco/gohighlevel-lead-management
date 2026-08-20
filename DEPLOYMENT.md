# MyApproved — Deployment Guide

The MyApproved platform deploys to **Vercel** at [https://myapproved.com](https://myapproved.com).

## How deploys happen

Vercel auto-deploys on every push to the `main` branch of the connected GitHub repository (project: **myapproved**). The `favicon`/icon/SEO and metadata assets are served from the App Router build (`app/layout.tsx` + `public/`).

## Environment variables

Set these in **Vercel → Project Settings → Environment Variables**. The authoritative list — with inline descriptions — is `.env.example` in this repo. Copy every key from there; never commit real values (they live only in `.env.local` / `.env`, which are gitignored).

### Critical groups

- **Supabase** — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (keep the service-role key secret)
- **GoHighLevel** (CRM + payments via Stripe) — `GHL_API_KEY`, `GHL_LOCATION_ID`, `GHL_WEBHOOK_SECRET`, plus `GOHIGHLEVEL_ACCESS_TOKEN` / `GOHIGHLEVEL_CLIENT_ID` / `GOHIGHLEVEL_CLIENT_SECRET` / `GOHIGHLEVEL_REDIRECT_URI` for OAuth
- **Google Gemini** — `GEMINI_API_KEY`
- **Google Places / Maps** — `GOOGLE_SERVER_API_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- **reCAPTCHA Enterprise** — `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`, `RECAPTCHA_PROJECT_ID`
- **Companies House** — `COMPANIES_HOUSE_API_KEY`
- **Email (SMTP)** — `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `ADMIN_EMAIL`, `NOTIFICATION_FROM_EMAIL`
- **Twilio (SMS fallback)** — `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
- **Scheduling** — `CRON_SECRET`, Upstash QStash credentials
- **Observability** — `EMPIRE_WEBHOOK_SECRET`, `FLEET_INGEST_URL`, `FLEET_INGEST_SECRET`
- **Analytics** — `NEXT_PUBLIC_GA_ID`
- **Optional** — social URLs (`NEXT_PUBLIC_FACEBOOK_URL`, etc.), `NEXT_PUBLIC_ICO_REGISTRATION_NUMBER` (trust badge shows only when set), aggregate-rating schema fields (leave blank to omit).

## Deploy steps

1. Ensure all variables from `.env.example` are present in Vercel.
2. Push to `main` → Vercel builds and deploys automatically.
3. Verify: open the site, confirm the favicon (gold cog-and-tick mark), OG image, and structured data render correctly.

## Build / scripts

- Build command: `npm run build` (runs `node scripts/run-next.js build` — the same custom runner used for `dev`).
- Next.js 13.5.7 App Router; runtime is standard Node.js (not edge).

## Support

For credentials: refer to your Supabase dashboard, GoHighLevel (Marketplace > API keys), Google Cloud console (Places/Maps/reCAPTCHA/Gemini), and your SMTP provider settings.
