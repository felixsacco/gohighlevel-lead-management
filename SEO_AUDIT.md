# SEO Audit — MyApproved

## Scope

This audit covers the current site structure and its programmatic SEO surface. The implementation lives in `lib/seo-data.ts` and the `app/find-tradespeople/[trade]/[location]/` and `app/find-tradespeople/[trade]/` routes.

## Current SEO Surface

| Area | Status |
|---|---|
| Trade landing pages | `app/find-tradespeople/[trade]/page.tsx` — one page per trade in `lib/seo-data.ts` |
| Location pages | `app/find-tradespeople/[trade]/[location]/page.tsx` — **33 trades × 50 locations = 1,650** pages |
| Trade + location index | `app/find-tradespeople/page.tsx` |
| Tradesperson profiles | `app/tradesperson/[id]/page.tsx` (dynamic, `[id]`) |
| Static marketing pages | Home, About, How It Works, For Tradespeople, FAQ, Contact, Blog, Locations, and the compliance pages (Privacy / Terms / Cookies) |

## Data Layers

- **Source of truth:** `lib/seo-data.ts` (trades, locations, metadata).
- **Generated metadata:** trade/location pages derive `title`, `description`, `canonical`, and structured data from this single source.
- **Breadcrumbs / structured data:** `components/Breadcrumbs.tsx` and per-page JSON-LD.

## Compliance Constraints

- Do **not** publish fabricated aggregate ratings or review counts. Per `docs/VERIFICATION.md` §9, aggregate stars and "N reviews" figures must reflect genuine, verifiable data.
- Tradesperson claims (e.g. "Gas Safe registered") must map to a real Tier A–G verification check.

## Known Gaps

- ~~"No trade-specific pages"~~ — resolved: trade and location pages now exist.
- ~~"No location pages"~~ — resolved: 1,650 location pages generated.
- **Canonical / dedup:** verify `[trade]/[location]` pages set self-referencing canonicals to avoid thin-content duplicate risk across the index.

## Next Steps

1. Confirm `lib/seo-data.ts` still lists the full 33-trade × 50-location matrix and the pages render.
2. Add a sitemap generator entry that enumerates the 1,650 location URLs.
3. Audit that no location page emits a fabricated "X reviews" claim.
