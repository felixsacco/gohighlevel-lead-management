# MyApproved — Brand Source of Truth

> **Status:** canonical brand reference. Compiled 2026-08-18 from `BRAND-AUDIT.md` and `app/design-tokens.css`, revised 2026-08-19. This document defines the target brand; the audit records what is currently in the codebase. Where the two disagree, this file is the authority to converge toward.

---

## 1. Colours — final palette

These seven are the only brand colours. Every other hex in the codebase is deprecated (see §5).

The ambers form a defined three-step ramp: `#FFC933` light (hover), `#FFB800` primary, `#E0A100` dark (gradient shadow end).

| Role | Hex | RGB | CMYK | Pantone |
|---|---|---|---|---|
| Primary amber | `#FFB800` | `rgb(255, 184, 0)` | TO BE ADDED | TO BE ADDED |
| Amber light (hover) | `#FFC933` | `rgb(255, 201, 51)` | TO BE ADDED | TO BE ADDED |
| Amber dark (gradient shadow end) | `#E0A100` | `rgb(224, 161, 0)` | TO BE ADDED | TO BE ADDED |
| Primary navy | `#1A3A8A` | `rgb(26, 58, 138)` | TO BE ADDED | TO BE ADDED |
| Navy dark | `#0A2463` | `rgb(10, 36, 99)` | TO BE ADDED | TO BE ADDED |
| Near-black | `#111111` | `rgb(17, 17, 17)` | TO BE ADDED | TO BE ADDED |
| Off-white | `#F1F5F9` | `rgb(241, 245, 249)` | TO BE ADDED | TO BE ADDED |

> **CMYK and Pantone are the outstanding blocker on all print.** No card, sign or vehicle livery can be ordered until these are filled in. Do not accept a printer's automatic conversion: navy converts muddy and amber converts brown. Request a physical proof of `#FFB800` and `#0A2463` on the actual stock.

> **Logo colour restriction:** the logo uses `#FFB800` only. `#FFC933` and `#E0A100` are UI states — hover and gradient shadow — and must never appear in the mark, emblem, wordmark or badge. There is no gradient version of the logo.

> **Off-white selection note:** `#F1F5F9` is the most-used non-pure-white neutral in the audit (count 20, used as hero ground, scrollbar track, and email background). It is adopted here as the canonical light surface. Pure white `#FFFFFF` remains available as a neutral, not a brand colour.

### Semantic values (NOT brand colours)

Generic status colours, used only for success/error feedback. They are not part of the palette and are free to change independent of brand.

| Role | Hex | RGB | Notes |
|---|---|---|---|
| Success | `#16A34A` | `rgb(22, 163, 74)` | generic; **not** a brand colour |
| Error | `#DC2626` | `rgb(220, 38, 38)` | generic; **not** a brand colour |

### Neutrals (grey scale in use for text)

**Intentional, not deprecated.** These Tailwind grey classes render as the default grey ramp below and are kept as-is for neutral text; they are not brand colours and are not scheduled for consolidation.

| Tailwind class | Rendered hex | Used for |
|---|---|---|
| `text-gray-400` | `#9CA3AF` | muted placeholder text |
| `text-gray-500` | `#6B7280` | muted copy |
| `text-gray-600` | `#4B5563` | muted copy |
| `text-gray-700` | `#374151` | body copy |
| `text-gray-900` | `#111827` | heading / body text |

### On-navy tints (light blues on navy backgrounds)

**Intentional, not deprecated.** These light-blue classes render as the default blue tint ramp below and are kept as-is for text and borders sitting on navy surfaces; they are not brand colours and are not scheduled for consolidation.

| Tailwind class | Rendered hex | Used for |
|---|---|---|
| `text-blue-50` | `#EFF6FF` | search/hero tile ground |
| `text-blue-100` | `#DBEAFE` | muted brand text on navy |
| `text-blue-200` | `#BFDBFE` | muted text on navy |
| `text-blue-300` | `#93C5FD` | muted text on navy |
| `text-blue-400` | `#60A5FA` | muted text on navy |
| `border-blue-200` | `#BFDBFE` | divider / border on navy |

---

## 2. Fonts

**Inter is the single system face.** Logo, headings and body all run Inter. Archivo Black and Montserrat are retired and should not appear in any new work.

| Role | Face | Weight |
|---|---|---|
| Logo / wordmark | Inter | 700 (outlined — see note) |
| Headings | Inter | 700 |
| Subheads | Inter | 600 |
| Body | Inter | 400 |
| Emphasis in body | Inter | 500 |
| Overline / eyebrow | Inter | 600, uppercase, tracking 0.16em–0.22em |

### Why Inter and not the previous target

The earlier target was Archivo Black for headlines and Montserrat for body. Neither was ever shipped; the only real web font in the codebase has always been Inter. Rather than run a migration to two faces that were never in place, the decision is to adopt what is already there.

Practical consequences, all favourable:

- One Google Fonts request rather than two
- One licence to check before print, and Inter's OFL licence covers commercial print and embroidery without further clearance
- The logo and the `h1` beneath it read as the same voice
- Nothing on the business cards can disagree with the site

Archivo Black was ruled out for the logo on its own merits as well. Its counters are almost closed, so the gear inside the "o" fought the letterforms either side of it. Inter's open counters give the gear room to sit.

### Logo type is outlined, not live

The wordmark, emblem and badge SVGs contain outlined paths, not text elements. They carry no font dependency and will render correctly if Inter fails to load, if a print RIP has no access to the font, or if a third party opens the file without Inter installed.

This means the logo is not editable as text. To change it, regenerate from `lockup.py` rather than retyping it. Never rebuild the logo by setting Inter in a design tool — the gear placement will not match.

### Loading

Weights actually needed: 400, 500, 600, 700. Do not load the full variable range or the whole static family; unused weights are wasted bytes on every page load.

Email templates and standalone HTML reports remain on Arial / system-ui. Web fonts are unreliable in email clients and there is no benefit in fighting it.

---

## 3. Type scale (headings in use today)

Read from the section headings in `app/page.tsx` only.

| Element | Class / size actually used |
|---|---|
| Hero `h1` | `text-[2rem]` → `sm:text-5xl` → `md:text-6xl` → `lg:text-7xl` (32px → 48px → 60px → 72px) |
| Hero overline | `text-[0.72rem]` → `sm:text-xs` (uppercase, tracking `0.22em`) |
| Section `h2` | `text-3xl` → `sm:text-4xl` → `md:text-5xl` → `lg:text-6xl` (30px → 36px → 48px → 60px) |
| Card `h3` | `text-base` → `sm:text-lg` → `md:text-xl` (16px → 18px → 20px) |
| Dropdown label (`summary`) | `text-lg` / `text-base` |

> The `app/design-tokens.css` type vars (`--font-size-h1/h2/h3`) are declared but not the source of these heading sizes — the hero marks up sizes inline with Tailwind utilities.

---

## 4. Logo

Four assets. Each has one job; using the wrong one is the most common way this identity gets degraded.

| Asset | What it is | Use when |
|---|---|---|
| **Mark** | Cog with tick, no type | Below ~200px wide. Favicon, app icon, avatars, single-colour processes |
| **Emblem** | "MyApproved", gear replacing the "o" | Primary identity. Default choice above 200px |
| **Wordmark** | "MyApproved" as plain type | The gear already appears elsewhere in the same lockup |
| **Badge** | Emblem plus "VERIFIED MEMBER" in a container | Trader sites, directories, third-party placement only |

The emblem is the primary identity. The plain wordmark is a utility asset, not an alternative logo — "MyApproved" set in Inter is the name typed out, not a mark, and it carries almost nothing distinctive to protect at trademark.

---

### 4.1 The mark

Generated parametrically. `build_mark.py` is the source of truth, not the SVG. Re-run it rather than editing path data.

| Parameter | Value |
|---|---|
| Canvas | 512 × 512 viewBox |
| Cog centre | 236, 268 |
| Ring outer / inner | 152 / 118 |
| Teeth | 8, width 60, root 140, tip 198 |
| Teeth rotation (phase) | 0.5° |
| Tick weight | 56 |
| Tooth tip chamfer | 13 (flat cut, not radiused) |
| Knockout gap | 11 at elbow → 18 at arm ends |

Three details are load-bearing and must survive any future edit:

1. **Chamfered tips, not radiused.** A uniform corner radius on every tooth is the machine default and reads as generated.
2. **Tapering knockout.** The gap tightens at the elbow and opens where the arms exit, as it would be cut by eye.
3. **0.5° phase.** At this rotation the two teeth sitting at the tick exits are consumed whole rather than half-clipped, giving six clean teeth and one centred at twelve o'clock. Changing the phase produces fragments.

**Minimum size:** 32px / 10mm. Below ~24px use the tick-only cut (`BrandMarkCompact`); the cog is unreadable at any weight.

**Clear space:** equal to the tick weight — 56 units at 512, i.e. 11% of mark width. Nothing enters it.

---

### 4.2 The emblem

The gear occupies the exact footprint of the Inter 700 "o" it replaces: outer width matched, and the same overshoot below the baseline. This is what makes it sit in the word rather than on it.

| Parameter | Value |
|---|---|
| Type | Inter 700, outlined |
| Gear fit | ring outer scaled to the "o" outer width; teeth overshoot |
| Gap before "v" | 0.06 × type size (12 units at 200) — **ratio, not fixed** |

The gap is the one that breaks. It must scale with type size; holding it fixed while shrinking the type roughly triples it proportionally and the gear drifts away from the "v".

**Minimum size:** 200px wide. Below that the teeth close up and the word takes a blob in the middle — use the mark instead.

**Never:** stretch non-proportionally, rebuild by setting Inter in a design tool, recolour the gear separately from the word, or place anything in the clear space.

---

### 4.3 The wordmark

Plain type, normal "o". Use only when the gear already appears in the same lockup — a header with the mark on the left, or the badge. Repeating the gear twice reads as an error.

Also use for embroidery, vinyl, etching and any single-colour process where the teeth and knockout will not survive. Mono cuts exist for exactly this.

---

### 4.4 The badge

Third-party use only. Never use the badge as your own logo on your own site.

Container radius 18, padding 52, strapline centred beneath the wordmark at Inter 600 / tracking 0.16em. Copy is **"VERIFIED MEMBER"** — not "approved member", which repeats the brand name and weakens the claim.

**Minimum size:** 220px wide.

---

### 4.5 Colour rules

| Ground | Treatment |
|---|---|
| Navy `#0A2463` / `#1A3A8A` | Amber `#FFB800` gear and "My", off-white `#F1F5F9` "Approved" |
| Near-black `#111111` | As navy |
| Off-white `#F1F5F9` | Amber gear and "My", navy "Approved", amber rule on badges |
| Amber `#FFB800` | Navy — never white |

Amber **text** on off-white fails contrast and must not be used. The amber rule on light badges exists so the brand colour is present without being load-bearing for legibility.

---

### 4.6 File locations

| Use | File |
|---|---|
| Web / in-app mark | `components/BrandMark.tsx` (`currentColor`) |
| Mark, external | `myapproved-mark-gold.svg`, `-white`, `-black` |
| Emblem | `wordmark-navy.svg`, `-light`, `-dark`, `-transparent` |
| Wordmark | `wordmark-text-navy.svg`, `-light`, `-dark`, `-transparent`, `-mono-light`, `-mono-dark` |
| Badge | `badge-navy.svg`, `-light`, `-dark`, `-compact-navy`, `-compact-light`, plus `@2x` PNGs |
| Favicon | `app/favicon.ico` (16/32 tick-only, 48 full mark) |
| Apple touch | `app/apple-icon.png` (180 × 180) |
| Social | `app/og-image.png` (1200 × 630) |
| Raster | `myapproved-mark-gold-512.png`, `-1024.png` |

Generators: `build_mark.py` (mark), `lockup.py` (emblem, wordmark, badge).

---

### 4.7 Outstanding

- **CMYK and Pantone for all seven palette colours** (§1) — blocks all print
- Maskable PWA icon with padded safe area, if the app is installable
- Badge embed snippet linking to the trader's MyApproved profile
- Badge usage terms covering removal when a trader leaves or is delisted
-e 
---

## 5. Deprecated colours

Every hex found in the audit that is **not** in the final palette above, listed so the consolidation sweep knows exactly what to retire. Includes the Tailwind default literals.

### Ambers / yellows (retiring — collapse to `#FFB800` / `#FFC933`)

`#fdbd18`, `#f5b301`, `#f5a623`, `#e8a900`, `#facc15`, `#f59e0b`, `#fde68a`, `#fbbf24`, `#fb923c`, `#f4c22a`, `#fbbc05`, `#fbbc04`, `#ff9933`, `#fef3c7`, `#fcd116`, `#f7d116`, `#fecaca`, `#ffde00`, `#ffcc29`, `#ffcc00`, `#feda00`, `#fed100`, `#e5a100`, `#d97706`, `#b45309`, `#78350f`

### Blues / navies (retiring — collapse to `#1A3A8A` / `#0A2463`)

`#0056d2`, `#002fa7`, `#0f172a`, `#001f7a`, `#1e3a8a`, `#1e40af`, `#3b82f6`, `#64748b`, `#2563eb`, `#4285f4`, `#334155`, `#1f2937`, `#38bdf8`, `#0ea5e9`, `#8b5cf6`, `#60a5fa`, `#93c5fd`, `#bfdbfe`, `#bae6fd`, `#eff6ff`, `#f0f9ff`, `#f0f4ff`, `#e0e7ff`, `#0369a1`, `#0c4a6e`, `#0039a6`, `#003478`, `#003399`, `#0055a4`, `#002b7f`, `#00247d`, `#00207a`, `#123a8f`, `#4189dd`, `#152d6e`, `#103580`, `#0a2558`, `#0038c7`, `#5bb8d6`, `#7ec8e3`, `#a3d8f4`, `#a855f7`, `#9333ea`

### Tailwind default literals (called out explicitly)

`#1e40af`, `#1e3a8a`, `#f59e0b`, `#d97706`

### Greys / neutrals / blacks (retiring — collapse to `#111111` / `#F1F5F9`)

`#fff`, `#ffffff`, `#e2e8f0`, `#1a1a1a`, `#f8fafc`, `#666`, `#ddd`, `#333`, `#232323`, `#f5f5f5`, `#f3f4f6`, `#111827`, `#2d3748`, `#eee`, `#ccc`, `#888`, `#000`, `#000000`, `#a6a6a6`, `#9ca3af`, `#475569`, `#374151`, `#0f0f0f`, `#0b0f19`, `#1e293b`, `#cbd5e1`, `#b3b3b3`, `#161616`, `#0a0a0a`, `#f8f9fc`

### Greens (retiring — replace with success `#16A34A`)

`#10b981`, `#22c55e`, `#34a853`, `#34d399`, `#138808`, `#064e3b`, `#047857`, `#006a4e`, `#01411c`, `#009b3a`, `#009639`, `#008c45`, `#007a3d`, `#006600`, `#ecfdf5`, `#a7f3d0`

### Reds / oranges / pinks (retiring — replace with error `#DC2626`)

`#ef4444`, `#ea4335`, `#e30a17`, `#cf142b`, `#ea580c`, `#ce1126`, `#f42a41`, `#ef4135`, `#de2910`, `#dc143c`, `#d52b1e`, `#cd212a`, `#c60c30`, `#e94e1b`, `#ff0000`, `#f00`, `#f472b6`, `#fecaca`, `#fef2f2`

> **Flag / store-badge colours:** `#009639`, `#fed100`, `#000000`, `#e30a17`, `#ce1126`, `#138808`, `#fbbc04`, `#fbbc05`, `#cd212a` are country-flag and Google Play / App Store SVG fills in `public/badges/`. **Do not consolidate these** — they are third-party identity assets, not brand colours.

---

## 6. Change log

- **2026-08-18** — Initial version. Final palette, fonts, type scale, and deprecated-colour list compiled from `BRAND-AUDIT.md`; CMYK/Pantone and logo assets left as "TO BE ADDED".
- **2026-08-18** — Adopted amber-dark `#E0A100` (gradient shadow end) as the palette's third amber, completing the ramp `#FFC933` light / `#FFB800` primary / `#E0A100` dark. Removed `#e0a100` from the deprecated list.
- **2026-08-19** — §2 rewritten. **Inter adopted as the single system face** across logo, headings and body; Archivo Black and Montserrat retired. This reverses the previous action, which was to retire Inter. Rationale recorded in §2: neither target face was ever shipped, and Archivo Black's closed counters conflicted with the gear inside the emblem's "o".
- **2026-08-19** — §4 completed, replacing the placeholder. Mark, emblem, wordmark and badge specified with locked construction values, minimum sizes, clear space, colour rules, file locations and generators. Load-bearing details flagged: chamfered tooth tips, tapering knockout, 0.5° tooth phase, and the emblem's gear-to-"v" gap as a ratio rather than a fixed value.
- **2026-08-19** — §1 annotated. Added the logo colour restriction (`#FFB800` only; no gradient logo) and an explicit note that CMYK/Pantone blocks all print and must come from a physical proof rather than automatic conversion.
