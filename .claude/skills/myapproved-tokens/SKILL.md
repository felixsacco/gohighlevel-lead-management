---
name: myapproved-tokens
description: Concrete design tokens for MyApproved — exact hex values, type scale, spacing, and component conventions currently in the codebase. A factual lookup table, not design guidance.
when_to_use: Load alongside frontend-design before any copy, CRO, or UI change to this repo. Never invent a value — every token below traces to a real source line; when a value is missing or conflicts, re-read the source rather than generalize.
---

# MyApproved Design Tokens

Factual lookup only. Sources: `app/design-tokens.css`, `app/globals.css`, `tailwind.config.ts`, `components/EnhancedHeroSection.tsx`, `components/EnhancedHeader.tsx`, `components/EnhancedFooter.tsx`, `components/ui/button.tsx`, `components/ui/badge.tsx`. For *how* to design, load `frontend-design`; this file only supplies the *which values*.

## Brand colors (exact hex, from source)

| Role | Hex | Where |
|---|---|---|
| Navy ground | `#1A3A8A` | `EnhancedHeader.tsx:77`, `EnhancedFooter.tsx:9` |
| Amber action (primary CTA) | `#FFB800` | `EnhancedHeroSection.tsx:198`, `EnhancedHeader.tsx:334` |
| Amber hover | `#FFC933` | `EnhancedHeroSection.tsx:198`, `globals.css:164` |
| Near-black hero ground | `#111111` | `EnhancedHeroSection.tsx:101` |
| Near-black surfaces (cards/inputs) | `#1A1A1A` / `#232323` | `EnhancedHeroSection.tsx:166,174` |

Note: the hero section uses a **near-black** `#111111` ground, *not* the navy `#1A3A8A` used in header/footer. Two distinct grounds coexist — match the section you're editing, don't assume one brand ground. Hero accent hover `#FFB800 → #FFC933` is the one real amber ramp; no separate "gold" token exists in source.

Decorative-only hexes (not brand — country flags in `EnhancedHeader.tsx`, Jamaica flag `#009639/#FED100/#000000` on line 319–324): do not treat as brand colors.

## Type scale (`app/design-tokens.css:16–30`)

| Role | Size | Weight | Line-height | Tracking |
|---|---|---|---|---|
| H1 | `clamp(1.875rem,4vw,3.75rem)` | 800 | 1.1 | `-0.02em` |
| H2 | `clamp(1.5rem,3vw,3rem)` | 800 | 1.2 | `-0.02em` |
| H3 | `clamp(1.25rem,2vw,1.5rem)` | 700 | 1.3 | — |
| Body | `1rem` | 400 | 1.6 | — |
| Body-sm | `0.875rem` | 400 | 1.6 | — |

Hero-specific headline overrides (`EnhancedHeroSection.tsx:134`): `clamp(3.25rem,7.5vw,5.5rem)`, `line-height 0.9`, `font-black` (900), `tracking-tight`.

## Label / overline pattern (real and consistent)

Mono-uppercase overline with wide tracking is used throughout — two distinct recipes, don't conflate:

- `.label-overline` (`globals.css:201`): `0.65rem`, `700`, `letter-spacing 0.18em`, uppercase.
- Hero eyebrow (`EnhancedHeroSection.tsx:131`): `0.65rem`, `font-bold`, `tracking-[0.2em]`, uppercase, color `#FFB800`.
- Search-card field labels (`EnhancedHeroSection.tsx:170,188`): `0.65rem`, `font-bold`, `tracking-[0.12em]`, uppercase, `text-white/35`.

Uppercase labels weight **700**; the mono-ish sans is the system font stack (no unique display/body font is declared in source — typography is size/weight/tracking only).

## Spacing rhythm (`app/design-tokens.css:7–13,32–34`)

- Space scale: `8 / 16 / 24 / 32 / 48 / 64 px` (`--space-1` … `--space-6`).
- Section vertical padding: `--section-padding-y` = 64px; `--section-padding-y-lg` = 80px.
- Header/footer use `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`; footer padding `py-16` (`EnhancedFooter.tsx:10`); hero `px-6 lg:px-8 py-24`.
- Container widths: main `1200px`, wide `1400px`, narrow `896px`, content `768px` (`design-tokens.css:48–51`).

## Component conventions (from source)

- **Corner radius**: token defaults `12px` (`--radius-default`), `16px` `lg`, `20px` `xl` (`design-tokens.css:37–39`). Hero search card `rounded-2xl` (16px); search inputs/buttons `rounded-xl` (12px); floating chips `rounded-xl`. shadcn `--radius: 0.5rem` (8px) underlies `rounded-md`/`sm`/`lg` in `ui/*` primitives.
- **Button** (`ui/button.tsx`): default `rounded-md text-sm font-medium`; sizes `h-10` default / `h-9 sm` / `h-11 lg`. Note the *primary CTA in practice* ignores `bg-primary` (near-black) — the brand amber CTA is applied ad hoc: `bg-[#FFB800] hover:bg-[#FFC933] text-[#111111] font-black` (`EnhancedHeroSection.tsx:198`) resp. `... text-black font-bold ... border-2 border-[#FFB800]` (`EnhancedHeader.tsx:334`).
- **Pill / badge**: `rounded-full border px-2.5 py-0.5 text-xs font-semibold` (`ui/badge.tsx:7`). Hero feature pills use `rounded-full border-white/[0.08] px-3 py-1.5 text-xs font-medium` (`EnhancedHeroSection.tsx:155`); "live" pill `rounded-full bg-white/[0.06] border-white/10 px-4 py-2` (`:118`).
- **Border on dark surfaces**: white alpha, not solid — `border-white/10`, `border-white/[0.07]`, `border-white/[0.08]`; section dividers `border-white/[0.08]` (`EnhancedHeroSection.tsx:166,174,215`).
- **Destructive** (shadcn token): `--destructive: 0 84.2% 60.2%` (≈ red) (`globals.css:51`).

## Uncertain / flagged (not verifiable from source)

- **Font families**: no `--font-*` or explicit typeface is declared — the tailwind default + system font stack applies. Any choice of display face would be an addition, not a token override.
- **"Gold accent"**: no separate gold token exists in source — the only amber ramp is `#FFB800 → #FFC933`. Do not introduce a second `gold` value.
- **`font-black`(900)/`font-extrabold`(800)** are used inline on headlines and logos but are not tokenized; treat 800 as the H1/H2 token (per `--font-weight-h1/h2`) and 900 as a hero-only flair.
