# MyApproved — Brand Source of Truth

> **Status:** canonical brand reference. Compiled 2026-08-18 from `BRAND-AUDIT.md` and `app/design-tokens.css`. This document defines the target brand; the audit records what is currently in the codebase. Where the two disagree, this file is the authority to converge toward.

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

> **Off-white selection note:** `#F1F5F9` is the most-used non-pure-white neutral in the audit (count 20, used as hero ground, scrollbar track, and email background). It is adopted here as the canonical light surface. Pure white `#FFFFFF` remains available as a neutral, not a brand colour.

### Semantic values (NOT brand colours)

Generic status colours, used only for success/error feedback. They are not part of the palette and are free to change independent of brand.

| Role | Hex | RGB | Notes |
|---|---|---|---|
| Success | `#16A34A` | `rgb(22, 163, 74)` | generic; **not** a brand colour |
| Error | `#DC2626` | `rgb(220, 38, 38)` | generic; **not** a brand colour |

---

## 2. Fonts

| Role | Brand target | In use today |
|---|---|---|
| Headlines | **Archivo Black** | ❌ not shipped — only *Inter* loads today |
| Body | **Montserrat** | ❌ not shipped — only *Inter* loads today |

- **Shipped today:** the only real web font is **Inter** (400/500/600/700, loaded via Google Fonts in `app/layout.tsx`). Email templates and standalone HTML reports use **Arial / system-ui**.
- **Brand intent:** **Archivo Black** for headlines and **Montserrat** for body. Neither is referenced in any shipped `.tsx`/`.css` — both appear only as aspirational copy in the redesign guide.
- **Action:** adopt Archivo Black + Montserrat as the two-font system and retire Inter as the site-wide face.

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

Placeholder section — **to be filled in by the brand owner.**

- **Minimum size:** TO BE ADDED
- **Clear space:** TO BE ADDED
- **File locations:** TO BE ADDED
  - Primary mark (full-colour): TO BE ADDED
  - Reverse (white on navy/amber): TO BE ADDED
  - Monochrome: TO BE ADDED
  - Favicon / app icon: TO BE ADDED

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
