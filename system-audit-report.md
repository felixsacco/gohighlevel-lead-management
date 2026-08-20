# System Audit Report — MyApproved

**Status:** living document — keep aligned with `docs/API_INVENTORY.md`, `AUDIT.md`, and the code itself.

## Stack

| Layer | Technology | Version / Notes |
|---|---|---|
| Frontend | Next.js (App Router) | **13.5.7** |
| Database / Auth | Supabase | PostgreSQL, Auth, Realtime |
| Payments / SMS / CRM | GoHighLevel (LeadConnector) | Handles **all** payments — no Stripe SDK in the codebase |
| AI (estimates/quotes) | Google Gemini + DeepSeek | **Go backend only**, not the Next.js app |
| Email | nodemailer → GoDaddy SMTP | `smtpout.secureserver.net:465` |
| Companies House | Companies House API | `lib/companies-house.ts` |
| Places / Maps | Google Places | `lib/places.ts` |
| Anti-abuse | reCAPTCHA Enterprise | login, registration, lead forms |
| Scheduling | Upstash / QStash (CRON) | job expiry, notification processing |
| Observability | Empire OS / Fleet | `lib/fleet/emitFleetIngest.ts` |

## Architecture Notes

- **Backend is a separate Go service.** The Next.js app contains only route handlers (`app/api/**/route.ts`), Supabase calls, and delegating logic. AI calls, heavy compute, and some background jobs live in Go.
- **Payments:** GoHighLevel manages all lead purchase / unlock payments. There is **no Stripe gating** in the frontend.
- **Degrade-gracefully:** every integration degrades to a no-op with a logged warning when its key is absent, rather than throwing.

## Dynamic / Programmatic Routes

- `app/find-tradespeople/[trade]/[location]/page.tsx` — generated from `lib/seo-data.ts`: **33 trades × 50 locations = 1,650** location pages.
- `app/tradesperson/[id]/page.tsx` — public tradesperson profile.

## Known Risk Areas

- **Credential hygiene (`AUDIT.md` K1.7):** ensure no live secrets are committed; all integrations must read from `process.env`.
- **Fabricated claims:** aggregate review counts / star ratings on profile or SEO pages would breach compliance guidance. See `docs/VERIFICATION.md` §9.

## Remediation Status

All previously-flagged findings (K1–K7) have been remediated or are tracked in `AUDIT.md`. No live credentials remain in tracked files.
