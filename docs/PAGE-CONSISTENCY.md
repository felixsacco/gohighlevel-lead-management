# Page Consistency Standard — MyApproved

> **Status:** authoritative checklist. Every public-facing page must conform to this document.
> **Compiled:** 2026-08-20.
>
> This is the single written standard for page content, tone and facts. It merges two sources of truth:
>
> 1. **`homepage-final-copy.md`** — the homepage copy, tone and the factual claims every page must stay consistent with.
> 2. **`docs/BRAND.md`** — the visual tokens (palette, font, type scale, logo rules).
>
> The homepage (`app/page.tsx`) is the **template every page replicates**. Where a page's wording, tone or facts drift from this document, the drift is a defect to fix.

---

## 0. Scope

This standard governs **marketing / public-facing pages**. The following are out of scope for the copy/tone rules (they are functional surfaces, not marketing copy) and only the brand tokens below still apply:

- Login / registration and password-recovery variants
- Dashboards (`dashboard/client`, `dashboard/tradesperson`, `admin/*`)
- Test / debug / API-test / dev-* pages and setup-crm-* pages
- Verification and compliance pages (`privacy`, `terms`, `cookies`) keep their legal text verbatim

---

## 1. Brand voice

The voice is **plain, specific, and low on hype**. Rules:

- **First person plural** "we" for the company, "you" for the reader (homeowner or tradesperson).
- **Concrete over slogans.** State the check, price, or mechanic rather than a vague superlative.
- **No fabricated numbers.** Never invent star ratings, review counts, "members", "cities covered", or "jobs matched". If a number appears, it must be real and verifiable.
- **British English** (`en-GB`): "licence", "programme", "postcode", "£".
- **No exclamation marks**, no "revolutionary", no "best-in-class", no "game-changer".

### Canonical tone phrases

These exact phrasings recur across the site and must not be lightly reworded:

- "vetted tradespeople across the UK"
- "checked before you ever see them" / "checked before they're listed"
- "a real three-person brief" / "three tradespeople per job"
- "no cold calling, no wasted trips"
- "pay as you go"

---

## 2. Canonical facts (do not contradict)

These are the load-bearing claims. Every page must agree with them.

| Fact | Canonical wording |
|---|---|
| Headline promise | **Hire a tradesperson you actually count on** |
| Sub-head promise | Every tradesperson is checked before you ever see them. |
| Tagline | **Free Quotes • No Obligation • Local Pros** |
| Trade coverage | **33 verified trades**, sampled across a scrolling carousel (Plumber, Electrician, Roofer, Painter & Decorator, Carpenter, Locksmith, Gas Engineer, Builder, Tiler, Gardener, Plasterer, Bathroom Fitter, Kitchen Fitter, Flooring, Window Fitter, Waste Removal) |
| Match volume | **Three tradespeople per job** — a real brief, not a broadcast |
| Lead pricing | **£4.99 a lead, pay as you go** — pay only when a lead is worth taking, nothing ongoing |
| Cost to post / quote | **Free** — "posting costs nothing, quoting costs nothing"; the homeowner never pays MyApproved for a quote |
| The four checks | 1. **Photo ID** 2. **Registered business** (Companies House) 3. **Insurance** (public liability, confirmed real + in date, monitored) 4. **Qualifications** |
| Support contact | support@myapproved.com |
| Copyright | © 2026 MyApproved |

### Security & compliance constraints (never break these)

- **No fabrication.** Aggregate star-ratings and "N reviews" figures are prohibited unless they derive from genuine, verifiable data (`docs/VERIFICATION.md` §9). This is a hard rule.
- **No live credentials** in any page, doc, or committed file. Integrations read `process.env` and degrade gracefully.
- **Payment model:** GoHighLevel handles payments; the copy must not describe a Stripe checkout.
- **AI:** estimates are powered by Google Gemini / DeepSeek in the **Go backend** — marketing copy must not claim an "OpenAI" model or an in-page AI engine.

---

## 3. Page structure (the replicate-this template)

The homepage sections, in order, are the canonical structure. A page that covers the same need should mirror this rhythm:

1. **Header** — Find Tradespeople · How It Works · For Tradespeople · Get Quotes · Sign Up, with tagline **Free Quotes • No Obligation • Local Pros**
2. **Hero** — overline ("Checked tradespeople across the UK"), headline, one specific sub-head, search/CTA (button **Get Quotes**), trust chips (**IDENTITY CHECKED** · **INSURANCE VERIFIED**)
3. **Coverage / services** — "One Search. Every Trade." + trade carousel
4. **Why homeowners choose us** — four benefit cards
5. **Our Checks** — the four checks, four-up grid
6. **For tradespeople** — "Grow Your Trade Business" + five bullets (three per job, nearest match, calendar, £4.99, marketing handled) + **Join as a Tradesperson**
7. **Common Questions** — six-item FAQ accordion
8. **Local / navigation** — find tradespeople near you, popular jobs, find out more
9. **Footer** — signup ("Send me the checklist"), support@myapproved.com, quick links, ICO registration · Google Reviews · © 2026 MyApproved

### Shared button copy

- Homeowner CTAs: **Get Quotes**
- Tradesperson CTA: **Join as a Tradesperson**

---

## 4. The four checks — canonical wording

Use these exact labels and descriptions everywhere the checks appear:

1. **Photo ID** — We confirm the person behind the profile is who they say they are, with photo ID verified against a live selfie.
2. **Registered business** — We check the company exists on Companies House, the official UK register.
3. **Insurance** — We confirm the public liability cover is real and still in date, and monitor it so the listing is withdrawn if it lapses.
4. **Qualifications** — We review the trade qualifications and accreditations they list against named certificate schemes.

---

## 5. FAQ — canonical answers

Six questions with these answers (homeowners). Reproduce in substance, not necessarily verbatim, but never contradict:

1. **Is this just another directory anyone can pay to join?** — No. Payment does not bypass the checks; photo ID, Companies House, and insurance checks come first.
2. **How do you check tradespeople?** — Four checks (photo ID, registered business, insurance, qualifications) before anyone is listed.
3. **Will I get chased by dozens of companies?** — No. We send each job to three tradespeople, matched by need and location — a real three-person brief.
4. **How is the price worked out?** — A costed quote from the job description and location; the first number is based on the described work, not a salesperson.
5. **What happens if the job goes wrong?** — Talk to the tradesperson first; if unresolved, contact support@myapproved.com; public liability is confirmed and monitored.
6. **Do I have to pay before seeing quotes?** — No. Posting and viewing quotes are free; you only ever pay the tradesperson for work done.

---

## 6. Visual tokens (from `docs/BRAND.md`)

These are brief pointers; `docs/BRAND.md` is the complete authority.

### Palette — the only seven brand colours

| Role | Hex |
|---|---|
| Primary amber | `#FFB800` |
| Amber light (hover) | `#FFC933` |
| Amber dark (gradient shadow end) | `#E0A100` |
| Primary navy | `#1A3A8A` |
| Navy dark | `#0A2463` |
| Near-black | `#111111` |
| Off-white | `#F1F5F9` |

Status (NOT brand): success `#16A34A`, error `#DC2626`.

### Font

**Inter only** — one family. Weights 400 / 500 / 600 / 700. Archivo Black and Montserrat are retired → never use.

### Type scale (heading sizes actually used)

| Element | Size |
|---|---|
| Hero `h1` | 32px → 48px → 60px → 72px |
| Section `h2` | 30px → 36px → 48px → 60px |
| Card `h3` | 16px → 18px → 20px |

### Logo

Emblem is primary identity; mark is used below ~200px; badge is third-party only. Logo uses `#FFB800` only — no gradient.

### Deprecated colours

Anything not in the seven-colour palette above (plus the two semantic status colours and the intentional grey/blue neutrals documented in `docs/BRAND.md` §1) is **deprecated**. The retired set includes `#0056D2`, `#FDBD18`, `#F5B301`, `#123A8F`, Poppins, and the full list in `docs/BRAND.md` §5.

---

## 7. Pre-flight checklist (run against any page)

- [ ] Headline style matches the homepage (plain, specific promise, no hype)
- [ ] Agrees with the canonical facts table (§2) — 33 trades, three per job, £4.99 a lead, free to post/quote, four checks, support@myapproved.com
- [ ] Uses the four-check wording in §4
- [ ] FAQs do not contradict §5
- [ ] No fabricated rating / review / membership numbers
- [ ] No retired palette colours — only `#FFB800` / `#FFC933` / `#E0A100` / `#1A3A8A` / `#0A2463` / `#111111` / `#F1F5F9`
- [ ] Inter font only; no Archivo Black / Montserrat / Poppins
- [ ] Footer says "© 2026 MyApproved" and lists support@myapproved.com
- [ ] British English, no exclamation marks
