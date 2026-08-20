# Changelog — MyApproved

## Current State (2026)

The platform is a **Next.js 13.5.7** (App Router) application backed by Supabase, with GoHighLevel handling all payments/SMS/CRM and a Go backend for AI (Gemini/DeepSeek). Canonical brand palette: amber `#FFB800` + navy `#1A3A8A` (dark `#0A2463`), single font family Inter. See `docs/BRAND.md` and `docs/API_INVENTORY.md` for the authoritative current state.

> Note: an earlier "100/100 SEO" changelog entry (dated December 10, 2025) referenced a retired `#0056D2`/blue-800 palette, removed `EnhancedHeader`/`EnhancedFooter` components, and fabricated review-count metrics (4.9★ / 1,245 reviews). Those claims do **not** reflect the current codebase and have been superseded.

## Recent Work

- **Brand consolidation** — moved to the canonical amber `#FFB800` / navy `#1A3A8A` palette; single Inter font; legacy Royal Blue `#0056D2` + Gold `#FDBD18` + Poppins retired.
- **Credential hygiene** — removed all hardcoded/committed live credentials; Supabase and every integration now wired via `process.env` with graceful degradation (`docs/API_INVENTORY.md`).
- **Security & Data Protection Audit** — `AUDIT.md` documents findings K1–K7 and their remediation status.
- **Verification spec v2** — `docs/VERIFICATION.md` is the source of truth for identity-checked tradesperson verification (Tier A–G checks, permitted claims, badge, re-verification).
- **Programmatic SEO** — `find-tradespeople/[trade]/[location]` dynamic routes generated from `lib/seo-data.ts` (33 trades × 50 locations).

## Historical (superseded — informational only)

The retired December 2025 changelog described UI polish (reviews/FAQ/carousel sections) and SEO scaffolding under the old palette. The specific Tailwind classes (`from-[#0056D2] via-blue-800 to-blue-900`), the fabricated "SEO Score 100/100" metric, and the fabricated per-service review counts are **no longer valid** and are not carried forward.
