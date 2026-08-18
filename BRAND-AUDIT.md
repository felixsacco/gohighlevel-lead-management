# Brand Colour & Font Audit

Generated 2026-08-18. Scanned all `.tsx`, `.ts`, and `.css` files (excluding `node_modules`, `.next`, `.git`, and binary images in `public/`). Hex values were counted with `grep -o` / `sort | uniq -c`; rgb/rgba/hsl values and font families follow. No code was changed.

> **How to read the frequencies** — the count is raw occurrences of the literal hex string. A colour used as a CSS variable value *and* re-typed in a hundred inline `style={` blocks counts hundreds of times; a tokenized `var(--color-amber)` counts zero. Treat the ranked list as "which literals are typed the most", which is exactly the consolidation surface you asked for.

---

## 1. Colours by frequency

### Yellows / ambers / golds

| Hex | Count | Used in (up to 3) |
|---|---|---|
| `#fdbd18` | 195 | `app/dashboard/tradesperson/page.tsx`, `app/find-tradespeople/page.tsx`, `app/find-tradespeople/[trade]/page.tsx` |
| `#f5b301` | 136 | `app/about/page.tsx`, `app/contact/page.tsx`, `app/design-tokens.css` |
| `#ffb800` | 74 | `.claude/skills/myapproved-tokens/SKILL.md`, `app/dev/badges/page.tsx`, `app/find-tradespeople/page.tsx` |
| `#f5a623` | 60 | `app/login/client/page.tsx`, `app/login/page.tsx`, `app/login/trade/page.tsx` |
| `#e8a900` | 30 | `app/contact/page.tsx`, `app/design-tokens.css`, `app/instant-quote/page.tsx` |
| `#ffc933` | 14 | `components/EnhancedHeroSection.tsx` |
| `#facc15` | 6 | — |
| `#f59e0b` | 4 | — |
| `#fde68a` | 3 | — |
| `#fbbf24` | 3 | — |
| `#fb923c` | 3 | — |
| `#e0a100` | 3 | — |
| `#f4c22a` | 1 | `lib/notifications/email-layout.ts` |
| `#fbbc05` | 2 | — |
| `#fbbc04` | 2 | — |
| `#ff9933` | 2 | — |
| `#fef3c7` | 1 | — |
| `#fcd116` | 1 | — |
| `#f7d116` | 1 | — |
| `#fecaca` | 1 | — |
| `#ffde00` | 1 | — |
| `#ffcc29` | 1 | — |
| `#ffcc00` | 1 | — |
| `#feda00` | 1 | `public/badges/*.svg` (flag) |
| `#fed100` | 1 | `public/badges/*.svg` (flag) |
| `#e5a100` | 1 | — |
| `#d97706` | 1 | — |
| `#d97706` | 1 | — |
| `#b45309` | 2 | — |
| `#78350f` | 2 | — |
| `#ffde00` | 1 | — |

### Blues / navies / cyans

| Hex | Count | Used in (up to 3) |
|---|---|---|
| `#1a3a8a` | 147 | `.claude/skills/myapproved-tokens/SKILL.md`, `app/about/page.tsx`, `app/contact/page.tsx` |
| `#0056d2` | 146 | `app/hero-animations.css`, `CHANGELOG.md`, `components/AIExplainerSection.tsx` |
| `#002fa7` | 72 | `app/find-tradespeople/page.tsx`, `app/find-tradespeople/[trade]/page.tsx`, `app/find-tradespeople/[trade]/[location]/page.tsx` |
| `#0f172a` | 57 | `app/find-tradespeople/page.tsx`, `app/locations/page.tsx`, `components/HeroSearchTrigger.tsx` |
| `#0a2463` | 15 | `app/design-tokens.css` |
| `#001f7a` | 13 | — |
| `#1e3a8a` | 10 | — |
| `#1e40af` | 9 | — |
| `#3b82f6` | 8 | — |
| `#64748b` | 7 | `lib/notifications/email-layout.ts` |
| `#2563eb` | 4 | — |
| `#4285f4` | 4 | — |
| `#334155` | 4 | `lib/notifications/email-layout.ts` |
| `#1f2937` | 4 | — |
| `#38bdf8` | 3 | — |
| `#0ea5e9` | 3 | — |
| `#8b5cf6` | 3 | — |
| `#3b82f6` | — | (see above) |
| `#60a5fa` | 2 | — |
| `#93c5fd` | 2 | — |
| `#bfdbfe` | 1 | — |
| `#bae6fd` | 1 | — |
| `#eff6ff` | 1 | — |
| `#f0f9ff` | 2 | — |
| `#f0f4ff` | 2 | — |
| `#e0e7ff` | 2 | — |
| `#0369a1` | 1 | — |
| `#0c4a6e` | 1 | — |
| `#0039a6` | 1 | — |
| `#003478` | 1 | — |
| `#003399` | 1 | — |
| `#0055a4` | 1 | — |
| `#002b7f` | 1 | — |
| `#00247d` | 1 | — |
| `#00207a` | 1 | — |
| `#001f7a` | — | (see above) |
| `#123a8f` | 2 | `app/design-tokens.css` |
| `#2450b8` | 1 | — |
| `#4189dd` | 1 | — |
| `#152d6e` | 1 | — |
| `#103580` | 1 | — |
| `#0a2558` | 1 | — |
| `#0038c7` | 1 | — |
| `#5bb8d6` | 1 | — |
| `#7ec8e3` | 2 | — |
| `#a3d8f4` | 2 | — |
| `#a855f7` | 3 | — |
| `#9333ea` | 3 | — |

### Greys / neutrals / blacks

| Hex | Count | Used in (up to 3) |
|---|---|---|
| `#111111` | 23 | `.claude/skills/myapproved-tokens/SKILL.md`, `app/dev/badges/page.tsx`, `app/login/client/page.tsx` |
| `#fff` | 21 | `public/badges/*.svg` (button label) |
| `#f1f5f9` | 20 | `app/page.tsx`, `app/recommended-scrollbar.css`, `lib/notifications/email-layout.ts` |
| `#ffffff` | 17 | — |
| `#e2e8f0` | 16 | `lib/notifications/email-layout.ts` |
| `#1a1a1a` | 14 | `components/EnhancedHeroSection.tsx` |
| `#f8fafc` | 7 | — |
| `#666` | 7 | — |
| `#ddd` | 6 | — |
| `#333` | 6 | — |
| `#232323` | 5 | `components/EnhancedHeroSection.tsx` |
| `#f5f5f5` | 4 | — |
| `#f3f4f6` | 4 | — |
| `#111827` | 3 | — |
| `#2d3748` | 3 | — |
| `#eee` | 3 | — |
| `#ccc` | 3 | — |
| `#888` | 3 | — |
| `#000` | 3 | — |
| `#000000` | 1 | `public/badges/*.svg` (flag) |
| `#a6a6a6` | 2 | — |
| `#9ca3af` | 2 | — |
| `#475569` | 2 | — |
| `#374151` | 2 | — |
| `#0f0f0f` | 2 | — |
| `#0b0f19` | 2 | — |
| `#1e293b` | 1 | — |
| `#cbd5e1` | 1 | — |
| `#b3b3b3` | 1 | `public/badges/google-play.svg` |
| `#161616` | 1 | — |
| `#0a0a0a` | 1 | — |
| `#f8f9fc` | 1 | — |

### Greens

| Hex | Count | Used in (up to 3) |
|---|---|---|
| `#10b981` | 4 | — |
| `#22c55e` | 3 | — |
| `#16a34a` | 3 | — |
| `#34a853` | 4 | — |
| `#34d399` | 2 | — |
| `#64748b` | — | (see blues) |
| `#138808` | 2 | — |
| `#064e3b` | 2 | — |
| `#047857` | 2 | — |
| `#006a4e` | 2 | — |
| `#01411c` | 1 | — |
| `#009b3a` | 1 | — |
| `#009639` | 1 | `public/badges/*.svg` (flag) |
| `#008c45` | 1 | — |
| `#007a3d` | 1 | — |
| `#006600` | 1 | — |
| `#ecfdf5` | 1 | — |
| `#a7f3d0` | 1 | — |

### Reds / oranges / pinks

| Hex | Count | Used in (up to 3) |
|---|---|---|
| `#ef4444` | 5 | — |
| `#ea4335` | 5 | — |
| `#e30a17` | 3 | — |
| `#cf142b` | 3 | — |
| `#ea580c` | 3 | — |
| `#ce1126` | 2 | — |
| `#f42a41` | 1 | — |
| `#ef4135` | 1 | — |
| `#de2910` | 1 | — |
| `#dc143c` | 1 | — |
| `#d52b1e` | 1 | — |
| `#cd212a` | 1 | — |
| `#c60c30` | 1 | — |
| `#e94e1b` | 1 | — |
| `#ff0000` | 1 | — |
| `#f00` | 1 | — |
| `#f472b6` | 3 | — |
| `#fecaca` | 1 | — |
| `#fef2f2` | 1 | — |
| `#fef3c7` | 1 | — |

> **Flag / badge colours (not brand)** — `#009639`, `#fed100`, `#000000`, `#e30a17`, `#ce1126`, `#138808`, `#fbbc04`, `#fbbc05`, `#cd212a` etc. are country-flag and store-badge SVG fills in `public/badges/`. Do not consolidate these.

---

## 2. rgb() / rgba() / hsl() values

Native `rgb`/`hsl` occurrences are mostly **transparency/overlay helpers** and **shadcn `hsl(var(--…))` tokens**, not independent brand colours.

| Value | Count |
|---|---|
| `rgb(0 0 0 / 0.1)` | 6 |
| `rgba(255,255,255,0.2)` | 4 |
| `rgba(255,255,255,0.8)` | 3 |
| `rgba(255,255,255,0.25)` | 3 |
| `rgba(253,189,24,0.3)` | 3 |
| `rgba(245,166,35,0.4)` | 3 |
| `rgba(10,10,15,0.75)` | 3 |
| `rgba(0,0,0,0.55)` | 3 |
| `rgba(0,0,0,0.1)` | 3 |
| `rgba(59,130,246,0.3)` | 2 |
| `rgba(253,189,24,0.6)` | 2 |
| `rgba(251,191,36,0.2)` | 2 |
| `rgba(0,0,0,0.15)` | 2 |
| assorted single-use `rgba(59,130,246,…)`, `rgba(251,191,36,…)`, `rgba(250,204,21,…)`, `rgba(16,24,40,…)`, `rgb(0 0 0 / 0.05)`, `rgb(0, 0, 0)` | 1 each |
| `hsl(var(--primary))`, `hsl(var(--secondary))`, `hsl(var(--accent))`, `hsl(var(--background))`, `hsl(var(--foreground))`, `hsl(var(--muted))`, `hsl(var(--border))`, `hsl(var(--ring))`, `hsl(var(--card))`, `hsl(var(--popover))`, `hsl(var(--destructive))`, `hsl(var(--input))`, `hsl(var(--chart-1..5))`, and their `-foreground` variants | 1 each (shadcn theme vars) |

**Note:** the `rgba(253,189,24,…)` / `rgba(251,191,36,…)` / `rgba(250,204,21,…)` overlays are translucent versions of the amber ramp (`#fdbd18` ≈ 253,189,24). When consolidating, these alphas should fold into the same amber token as `color-mix()` or an `/alpha` ramp rather than remain free literals.

---

## 3. Token cross-reference (`app/design-tokens.css`)

The declared design tokens are a **much smaller, cleaner set** than the literal sprawl above — these are the consolidation targets:

| Token | Value |
|---|---|
| `--color-navy-900` | `#0A2463` |
| `--color-navy-700` | `#123A8F` |
| `--color-amber` | `#F5B301` |
| `--color-amber-hover` | `#E8A900` |
| `--color-on-amber` | `#0A2463` |

Other CSS vars (spacing, type scale, radius, shadows) are non-colour — see `app/design-tokens.css`.

---

## 4. Font families

No custom display face is tokenized — the app ships `Inter` via Google Fonts and falls back to the system stack; everything else is the browser default or email/HTML-report stacks.

| Font family | Where referenced |
|---|---|
| **Inter** (400/500/600/700) | `app/layout.tsx` (Google Fonts `<link>` + body `style`), `app/global-error.tsx`, widely `font-sans` via Tailwind default |
| **system-ui / -apple-system / BlinkMacSystemFont / Segoe UI / Roboto / Helvetica / Arial** | `final-system-integration-report.html` (system stack) |
| **Arial, Helvetica, sans-serif** | email templates in `lib/notifications/email-layout.ts` and ~10 inline email HTML blocks under `app/api/**` (`font-family: Arial, sans-serif`) |
| **sans-serif** (generic) | `app/api/chat/messages/route.ts` |
| **Georgia / Cambria / Times** (serif) | `final-system-integration-report.html` |
| **Consolas / Courier New** (mono) | `final-system-integration-report.html` |
| **Poppins** | `ULTRA_REDESIGN_GUIDE.md:36` (proposed heading, not applied in source) |
| **Outfit / Geist / Montserrat / Roboto / Lato** | mentioned in `ULTRA_REDESIGN_GUIDE.md` / proposals only — **not** referenced in any shipped `.tsx`/`.css` |

**Bottom line:** the *only* real web font is **Inter**; email templates and standalone HTML reports use **Arial/system-ui**; Poppins/Outfit/Geist/Montserrat are aspirational copy in the redesign guide, not live code.

---

## 5. Consolidation summary

**Amber/yellow is the brand's biggest sprawl risk** — at least a dozen distinct amber-orange-yellow literals are in active rotation:

- **Top amber literals (by frequency):** `#fdbd18` (195), `#f5b301` (136), `#ffb800` (74), `#f5a623` (60), `#e8a900` (30), `#ffc933` (14).
- The `myapproved-tokens` skill canonicalises the amber ramp as **`#FFB800 → #FFC933`** (hover) with `#E8A900`/`#F5B301` appearing in `design-tokens.css` but **`#fdbd18`, `#f5a623`, and `#0056d2`, `#002fa7` are un-tokenized outliers** that collectively account for the bulk of the count.

**Blue/navy is split across two palettes** — a "royal blue" `#0056d2`/`#002fa7`/`#1a3a8a` family and a "navy" `#0a2463`/`#123a8f` family — plus a large Tailwind-scale blue raft (`#1e3a8a`, `#1e40af`, `#3b82f6`, `#2563eb`, …) from un-purged default utilities.

**Recommended first cut** (for when you consolidate, not done here): collapse the ~16 amber literals into the one `#FFB800 → #FFC933` ramp + `--color-amber`, and the ~20 blue literals into `--color-navy-900 (#0A2463)` / `--color-navy-700 (#123A8F)`, then drive the rest of the navy/amber through those two vars. `#fdbd18`, `#f5a623`, `#0056d2`, `#002fa7` are the highest-volume un-named candidates to merge first.

---

## 6. Gradients

Every `bg-gradient`, `linear-gradient`, and `radial-gradient` in the codebase, with the colour stops in order and the element each gradient decorates.

### 6a. Gradient inventory

**Real brand gradients (amp;the only gradients that carry brand meaning):**

| File | Gradient | Stops (in order) | Applied to |
|---|---|---|---|
| `app/hero-animations.css:104-106` | `linear-gradient(135deg, …)` | `#0056D2 → #1e40af → #1e3a8a` | `.bg-professional-blue` — blue hero/tile background |
| `app/hero-animations.css:108-110` | `linear-gradient(135deg, …)` | `#FDBD18 → #f59e0b → #d97706` | `.bg-professional-gold` — amber hero/tile background |
| `app/hero-animations.css:113-123` | `linear-gradient(135deg, …)` | `#FDBD18 → #f59e0b` | `.btn-primary-enhanced` — primary CTA button (blue text `#0056D2`) |
| `app/hero-animations.css:125-129` | `linear-gradient(135deg, …)` | `#f59e0b → #FDBD18` | `.btn-primary-enhanced:hover` — same button, reversed on hover |
| `app/hero-animations.css:78-82` | `linear-gradient(90deg, …)` | `transparent → rgba(255,255,255,0.2) → transparent` | `.animate-shimmer` — shimmer sweep overlay |

**SVG hero gradients (interactive headline in `app/page.tsx`):**

| File | Gradient | Stops (in order) | Applied to |
|---|---|---|---|
| `app/page.tsx` (`screwL`, `screwR`) | SVG `radialGradient` (cx 0.35 cy 0.3 r 1) | `#F5B301 → #E8A900` | two 13×13 "screw" `<circle>`s in the overline pill |
| `app/page.tsx` (`paintStroke`) | SVG `linearGradient` (x1 0 → x2 1) | `#E8A900 → #F5B301` | headline underline stroke ("actually count on") |
| `app/page.tsx` (`drip1`/`drip2`/`drip3`) | SVG `linearGradient` (x1/y1 0 → x2/y2 1) | `#E8A900 → #E0A100` | three paint "drip" accents on the headline |
| `app/page.tsx` (overline side rules) | Tailwind `bg-gradient-to-r/l from-transparent to-[#F5B301]/60` | `transparent → #F5B301@60%` | two small side-rule spans flanking the pill |

**Scrollbar thumb gradients (cosmetic UI chrome):**

| File | Gradient | Stops (in order) | Applied to |
|---|---|---|---|
| `app/globals.css:182-186` | `linear-gradient(180deg, …)` | `#A3D8F4 → #7EC8E3` | `.custom-dropdown-scroll::-webkit-scrollbar-thumb` (baby-blue scrollbar) |
| `app/globals.css:188-190` | `linear-gradient(180deg, …)` | `#7EC8E3 → #5BB8D6` | `.custom-dropdown-scroll::-webkit-scrollbar-thumb:hover` |
| `app/recommended-scrollbar.css:15` | `linear-gradient(90deg, …)` | `#facc15 → #fde68a` | scrollbar thumb |
| `app/recommended-scrollbar.css:19` | `linear-gradient(90deg, …)` | `#fbbf24 → #facc15` | scrollbar thumb (hover) |
| `app/recommended-scrollbar.css:24` | `linear-gradient(135deg, …)` | `#fffbe6 → #f7fafc` | scrollbar track |

**Dot-grid "gradients" (single-colour decorative grids, no real ramp):**

| File | Gradient | Stops (in order) | Applied to |
|---|---|---|---|
| `app/login/client/page.tsx` `app/login/page.tsx` `app/login/trade/page.tsx` | inline `linear-gradient(to right, #F5A623 1px, transparent 1px)` + `to bottom` twin | `#F5A623 → transparent` (1px grid lines) | full-page dot-grid background (auth screens) |
| `app/register/client/page.tsx` `app/register/tradesperson/page.tsx` | same `#F5A623` dot-grid | `#F5A623 → transparent``opacity-[0.03]`, `40px 40px` | full-page dot-grid background (register screens) |

**Tailwind `bg-gradient-radial` pastel orbs / decorative washes:**

| File | Gradient | Stops (in order) | Applied to |
|---|---|---|---|
| `app/register/tradesperson/page_backup.tsx` (`846-848`) | `bg-gradient-radial` | `blue-400/20 → transparent`, `yellow-400/15 → transparent`, `indigo-400/10 → transparent` | `blur-3xl` `animate-pulse` background orbs |
| `app/register/tradesperson/page_fixed.tsx` / `page_template.tsx` (`255-257`, `350-352`) | `bg-gradient-radial` | same three pastel orbs | same decorative orbs |
| `app/components/InDemandServices.tsx:176` | `bg-[radial-gradient(circle_at_30%_20%, rgba(59,130,246,0.05), transparent_50%)]` | `rgba(59,130,246,0.05) → transparent` | `absolute inset-0` overlay div |
| `app/faq/page.tsx:166-167` | two `bg-[radial-gradient(…)] animate-pulse` | `rgba(59,130,246,0.3) → transparent`, `rgba(251,191,36,0.2) → transparent` | two pulsing glow orbs |
| `app/page_old_backup.tsx` | multiple `radial-gradient` washes + grey grid | grey grid `linear-gradient(to_right,#80808008_1px,transparent_1px)` w/ `maskImage: radial-gradient(…)` | decorative website background (legacy) |

**Tailwind gradient-string configs (palette descriptors, not inline colours):**

| File | Field value (stops) | Applied to |
|---|---|---|
| `components/AnimatedServicesSlider.tsx:66-134` | `from-blue-500 to-blue-700`, `from-yellow-500 to-orange-500`, `from-gray-600 to-gray-800`, `from-green-500 to-emerald-600`, `from-red-500 to-red-700`, `from-green-400 to-green-600`, `from-purple-500 to-purple-700` | per-service gradient header chips |
| `components/FullWidthCTAStripes.tsx:53-54,76-77,99-100` | `from-[#0056D2] via-blue-600 to-blue-800` (hover-reversed), `from-[#FDBD18] via-yellow-400 to-orange-400` (hover-reversed), `from-emerald-500 via-green-500 to-teal-600` (hover-reversed) | full-width CTA stripe backgrounds |

**Not a gradient** (for completeness): `components/EnhancedHeroSection.tsx:102` — the comment "Flat navy ground with a hard two-tone split — no gradient wash" confirms this hero is intentionally flat.

### 6b. Gradient-stop-only vs standalone fill — the eleven brand colours

Of the **six ambers** and **five blues** in the frequency tables, here is which appear *only* as gradient stops versus which also stand alone as fills:

**Six ambers:**

| Amber | Gradient stop? | Standalone fill? | Verdict |
|---|---|---|---|
| `#fdbd18` (195) | yes — leading stop of `.bg-professional-gold` / `.btn-primary-enhanced` | **yes** — `text-[#FDBD18]` (55), `bg-[#fdbd18]` (22), `border-[#FDBD18]` (5) | **Both** — a genuine pair (amber → amber-deep), heavily used standalone |
| `#f5b301` (136) | yes — `--color-amber` also appears as screw/paint SVG stop | **yes** — `bg-[#F5B301]` (48), `text-[#F5B301]` (39), `border-[#F5B301]` (34) | **Both** — canonical `--color-amber`; stop + fill |
| `#ffb800` (74) | **no** | **yes** — `bg-[#FFB800]` (26), `text-[#FFB800]` (19), `border-[#FFB800]` (10) | **Standalone only** — never appears in any gradient |
| `#f5a623` (60) | no (used as 1px grid *line*, not a paired stop) | yes — `text-[#F5A623]` (27), `bg-[#F5A623]` (10) | **Standalone only** — its "gradient" usage is a dot-grid line, not a ramp |
| `#e8a900` (30) | yes — `--color-amber-hover`; SVG stop (`screwL/R`, `paintStroke`, `drip1-3`) | **yes** — `bg-[#E8A900]` (21) | **Both** — hover amber; stop + fill |
| `#ffc933` (14) | **no** | **yes** — `bg-[#FFC933]` (7) | **Standalone only** — the canonical hover ramp end, but never a gradient literal |

**Five blues:**

| Blue | Gradient stop? | Standalone fill? | Verdict |
|---|---|---|---|
| `#1a3a8a` (147) | **no** | **yes** — `text-[#1A3A8A]` (84), `bg-[#1A3A8A]` (46), `border-[#1A3A8A]` (7) | **Standalone only** — the `myapproved-tokens` canonical navy, never a gradient |
| `#0056d2` (146) | yes — leading stop of `.bg-professional-blue` and `FullWidthCTAStripes` | **yes** — `text-[#0056D2]` (74), `bg-[#0056D2]` (21), `color:#0056D2` | **Both** — royal-blue accent; stop + text fill |
| `#002fa7` (72) | **no** | **yes** — `text-[#002FA7]` (45), `bg-[#002FA7]` (15), `border-[#002FA7]` (4) | **Standalone only** — darker royal blue, never a gradient |
| `#0f172a` (57) | **no** | **yes** — `color:#0f172a` (44), `text-[#0f172a]` (13) | **Standalone only** — dark slate text (not really a blue), never a gradient |
| `#0a2463` (15) | **no** | **yes** — `text-[#0A2463]` (3), `fill="#0A2463"` (3), `bg-[#0A2463]` (2) | **Standalone only** — `--color-navy-900`, never a gradient |

**Summary of the distinction:** the *true* gradient pairs are the blue ramp **`#0056D2 → #1e40af → #1e3a8a`** and the amber ramp **`#FDBD18 → #f59e0b → #d97706`**. Three of those stops (`#1e40af`, `#1e3a8a`, `#f59e0b`, `#d97706`) are Tailwind-scale values that live *only* inside `<linear-gradient>` contexts — they are intentional ramp companions, **not** duplicates to merge. But within the eleven headline colours, the genuine "gradient-only" category is **empty**: every one of the six ambers and five blues also stands alone as a fill somewhere. The purported six-amber/five-blue pairs are therefore **overlapping standalone tints** (e.g. `#fdbd18` vs `#f5b301` vs `#ffb800`) rather than documented stop pairs — that's the accidental-duplication consolidation surface, and it is amplified by both `#0056d2` and `#fdbd18` additionally being pressed into service as gradient leads.

### 6c. Whites, off-whites, near-blacks & greys (text & backgrounds)

Separated from accent colours — these are the neutral set used for text and surfaces:

| Hex | Count | Role (typical usage) |
|---|---|---|
| `#fff` | 21 | pure white text/fills on dark hero (badges, buttons) |
| `#ffffff` | 17 | pure white surfaces / background |
| `#f1f5f9` | 20 | very light slate-grey — hero ground, scrollbar track, email bg |
| `#f8fafc` | 7 | off-white slate — card surfaces |
| `#f5f5f5` | 4 | off-white grey — muted surface |
| `#f3f4f6` | 4 | `custom-scrollbar` track; light grey surface |
| `#f7fafc` | 1 | off-white — scrollbar track (`recommended-scrollbar.css`) |
| `#fffbe6` | 1 | warm off-white/cream — scrollbar track |
| `#e2e8f0` | 16 | light slate — email borders/backgrounds |
| `#f8f9fc` | 1 | off-white lavender — surface |
| `#111111` | 23 | near-black — `myapproved-tokens` hero ground |
| `#1a1a1a` | 14 | near-black — EnhancedHeader dark surfaces |
| `#232323` | 5 | near-black — EnhancedHeroSection dark surfaces |
| `#111827` | 3 | near-black slate (`gray-900`) |
| `#0f0f0f` | 2 | near-black |
| `#0b0f19` | 2 | near-black blue-tinted |
| `#0a0a0a` | 1 | near-black |
| `#161616` | 1 | near-black |
| `#000` / `#000000` | 3 / 1 | pure black |
| `#666` | 7 | mid-grey muted text |
| `#333` | 6 | dark-grey text |
| `#888` / `#999` | 3 / — | grey muted text |
| `#ddd` / `#eee` / `#ccc` | 6 / 3 / 3 | light grey borders/dividers |
| `#9ca3af` | 2 | grey-400 muted text |
| `#a6a6a6` | 2 | grey muted text |
| `#b3b3b3` | 1 | grey (store badge) |
| `#2d3748` | 3 | slate-grey-700 |
| `#334155` / `#475569` / `#1f2937` / `#374151` / `#1e293b` / `#cbd5e1` | 4 / 2 / 4 / 2 / 1 / 1 | Tailwind slate-navy-grey text scale (email + inline) |

**Note:** the `#e8f4f8` (2) baby-blue-tinted near-white used by the dropdown scrollbar and `#a3d8f4`/`#7ec8e3`/`#5bb8d6` are *cool-tinted* rather than neutral and sit at the blue edge of this set — flagged so they aren't mistaken for pure greys during consolidation.

---

## 7. Tailwind colour classes — page.tsx / Footer.tsx / EnhancedHeader.tsx

Read-only audit of every `bg-*`, `text-*`, and `border-*` colour utility in the three primary layout files, broken down by file. Opacity-modified arbitrary values (e.g. `bg-[#1A3A8A]/35`) are listed with their effective rgba. Hex for the named classes follows Tailwind's default (`tailwindcss` v3) palette. **No colour class was changed.** Gradient classes are enumerated separately in §8 (the `from-`/`to-`/`via-` stops are colour-relevant but laid out from the compiled spans rather than the source order).

### 7a. `app/page.tsx`

| Class | Where used | Renders as (hex / rgba) |
|---|---|---|
| `bg-gradient-to-b from-[#0A2463] to-[#1A3A8A]` | hero section (line ~299) | `#0A2463 → #1A3A8A` |
| `bg-[#F1F5F9]` | feature / FAQ / CTA sections | `#F1F5F9` |
| `bg-white` | section grounds | `#FFFFFF` |
| `bg-[#1A3A8A]` | for-tradespeople section | `#1A3A8A` |
| `bg-[#1A3A8A]/35` | navy overlay tint | `rgba(26,58,138,0.35)` |
| `bg-[#FFB800]/10` | amber-tint chip | `rgba(255,184,0,0.10)` |
| `bg-[#FFB800]` | amber accents / CTA | `#FFB800` |
| `bg-gray-50` | light slate ground | `#F9FAFB` |
| `bg-gray-200` (hover) | divider / hover chip | `#E5E7EB` |
| `bg-gradient-to-br from-amber-500 to-amber-600` | badge/chip | `#F59E0B → #D97706` |
| `text-[#FFB800]` | amber accent text | `#FFB800` |
| `text-white` | hero / navy-band text | `#FFFFFF` |
| `text-white/75` | muted hero text | `rgba(255,255,255,0.75)` |
| `text-white/70` | muted hero text | `rgba(255,255,255,0.70)` |
| `text-[#0A2463]` | navy text on light/amber | `#0A2463` |
| `text-[#1A3A8A]` | navy text | `#1A3A8A` |
| `text-[#1A3A8A]/80` | navy text (translucent) | `rgba(26,58,138,0.80)` |
| `text-[#1A3A8A]/70` | navy text (translucent) | `rgba(26,58,138,0.70)` |
| `text-gray-900` | body copy | `#111827` |
| `text-gray-700` | body copy | `#374151` |
| `text-gray-600` | muted copy | `#4B5563` |
| `text-gray-500` | muted copy | `#6B7280` |
| `text-gray-400` | muted placeholder text | `#9CA3AF` |
| `text-blue-600` | location links (~50 occ.) | `#2563EB` |
| `text-green-500` | availability dot | `#22C55E` |
| `border-[#FFB800]/60` | amber accent rule | `rgba(255,184,0,0.60)` |
| `border-white/40` | translucent divider | `rgba(255,255,255,0.40)` |
| `border-gray-100` | light divider | `#F3F4F6` |
| `border-gray-200` | accordion (`border-2`) | `#E5E7EB` |
| `shadow-black/20` | shadow tint | `rgba(0,0,0,0.20)` |
| `placeholder-gray-500` | input placeholder | `#6B7280` |
| `focus:ring-[#FFB800]` | input focus ring | `#FFB800` |
| `hover:text-[#FFB800]` | link hover | `#FFB800` |

### 7b. `components/Footer.tsx`

| Class | Where used | Renders as (hex / rgba) |
|---|---|---|
| `bg-[#1A3A8A]` | footer ground (line 76) | `#1A3A8A` |
| `bg-white` | email input field | `#FFFFFF` |
| `bg-[#FFB800]` | subscribe button | `#FFB800` |
| `bg-yellow-400` | icon chip / highlight | `#FACC15` |
| `bg-blue-800/50` | translucent navy tint | `rgba(30,64,175,0.50)` |
| `text-white` | footer body | `#FFFFFF` |
| `text-blue-100` | muted brand text | `#DBEAFE` |
| `text-[#0A2463]` | dark-navy text | `#0A2463` |
| `text-blue-200` | muted text | `#BFDBFE` |
| `text-blue-300` | muted text | `#93C5FD` |
| `text-blue-300/70` | diluted muted text | `rgba(147,197,253,0.70)` |
| `text-blue-400` | muted text | `#60A5FA` |
| `text-red-400` | hard-call label | `#F87171` |
| `text-yellow-400` | icon accent | `#FACC15` |
| `border-blue-200` | divider | `#BFDBFE` |
| `border-blue-800` | divider | `#1E40AF` |
| `placeholder-blue-400` | input placeholder | `#60A5FA` |
| `focus:border-blue-500` | input focus | `#3B82F6` |
| `hover:text-yellow-400` | link hover | `#FACC15` |
| `hover:text-yellow-300` | link hover | `#FDE047` |
| `hover:bg-yellow-400` | chip hover | `#FACC15` |
| `hover:text-blue-900` | link hover | `#1E3A8A` |

### 7c. `components/EnhancedHeader.tsx`

| Class | Where used | Renders as (hex / rgba) |
|---|---|---|
| `bg-[#0A2463]` | header bar (line 66) + trust bar (176) | `#0A2463` |
| `bg-[#FFB800]` | CTA / accent | `#FFB800` |
| `bg-white` | dropdown panel | `#FFFFFF` |
| `bg-white/10` | translucent nav chip | `rgba(255,255,255,0.10)` |
| `bg-black/60` | mobile overlay | `rgba(0,0,0,0.60)` |
| `bg-gray-50/50` | translucent tile | `rgba(249,250,251,0.50)` |
| `bg-blue-50` | search/hero tile | `#EFF6FF` |
| `bg-gradient-to-br from-blue-600 to-blue-800` | mobile logo (line 73) | `#2563EB → #1E40AF` |
| `bg-gradient-to-r from-white to-blue-100` | headline clip (101) | `#FFFFFF → #DBEAFE` |
| `bg-gradient-to-r from-[#FFB800] to-[#FFB800]` | overline clip (104) | `#FFB800` (uniform) |
| `bg-gradient-to-r from-blue-900 to-blue-800` | CTA band (200) | `#1E3A8A → #1E40AF` |
| `bg-gradient-to-r from-blue-50 to-yellow-50` | info tile (346) | `#EFF6FF → #FEFCE8` |
| `bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600` | CTA (363) | `#FACC15 → #EAB308` |
| `text-white` | header / dropdown text | `#FFFFFF` |
| `text-blue-100` | muted brand text | `#DBEAFE` |
| `text-black` | text on amber chip | `#000000` |
| `text-gray-200` | nav text | `#E5E7EB` |
| `text-gray-300` | nav text | `#D1D5DB` |
| `text-gray-500` | muted text | `#6B7280` |
| `text-gray-600` | muted text | `#4B5563` |
| `text-gray-700` | body text | `#374151` |
| `text-gray-900` | heading text | `#111827` |
| `text-yellow-300` | icon accent | `#FDE047` |
| `text-yellow-400` | icon accent | `#FACC15` |
| `text-blue-600` | accent text | `#2563EB` |
| `text-blue-700` | accent text | `#1D4ED8` |
| `border-[#FFB800]` | amber outline | `#FFB800` |
| `border-gray-100` | divider | `#F3F4F6` |
| `border-blue-100` | tile border | `#DBEAFE` |
| `border-transparent` | layout border | transparent |
| `hover:bg-gray-50` | row hover | `#F9FAFB` |
| `hover:text-blue-600` | link hover | `#2563EB` |

### 7d. Headline takeaways

- **The two navy anchors diverge.** The header (and its trust bar) use **`#0A2463`** (`--color-navy-900`); the footer uses **`#1A3A8A`** and the homepage hero blends `#0A2463 → #1A3A8A`. These are two distinct tokens, not one.
- **Default Tailwind named colours are still heavily in play** — `blue-*`, `gray-*`, `yellow-*`, `amber-*`, `green-*`, `red-*` all appear alongside the arbitrary-value brand literals. `text-blue-600` in particular is hard-linked to ~50 inline `<a>` location links in `page.tsx`.
- **`#FFB800` (amber) and `#1A3A8A` / `#0A2463` (navies) are the three arbitrary-value literals that recur most** inside these files; the `myapproved-tokens` amber variant (`#F5B301`) does not appear at all in the three audited files despite being the `--color-amber` token.
