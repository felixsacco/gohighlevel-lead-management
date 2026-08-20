# API Routes

This directory contains the Next.js App Router route handlers for MyApproved. Each group is defined by a `route.ts` file inside a `app/api/...` folder.

## Environment Variables

Required for the API to function:

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase public key (client-side / low-privilege)
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service-role key (admin routes only)

AI estimate/quote routes are powered by the **Go backend** (Gemini/DeepSeek), not by an OpenAI key. There is no `OPENAI_API_KEY` in this codebase.

## Key Route Groups

| Group | Purpose |
|---|---|
| `app/api/trades/**` | Tradesperson registration (`service_role` access) |
| `app/api/leads/**` | Lead submission, purchase, unlock |
| `app/api/jobs/**` | Job submission, apply, auto-assign |
| `app/api/crm/**` | GoHighLevel sync + OAuth callback |
| `app/api/notifications/**` | Scheduled notification processing (QStash/CRON) |
| `app/api/places/**` | Google Places search + diagnosis |
| `app/api/empire-trigger/**` | Empire OS observability webhook |

For the authoritative, up-to-date route inventory and integration matrix, see `docs/API_INVENTORY.md`.

## Graceful Degradation

All routes follow a **degrade-gracefully** pattern: missing keys produce a logged warning and an empty/no-op result — they never throw at build time or runtime. Reference implementations: `lib/companies-house.ts`, `lib/fleet/emitFleetIngest.ts`.

## Error Handling

Routes return consistent JSON error bodies:

```json
{
  "error": "string",
  "message": "string"
}
```

## Rate Limiting

Rate limiting and abuse prevention are handled at the platform level (Vercel). reCAPTCHA Enterprise is used on login/registration and lead forms rather than a per-route rate limiter.
