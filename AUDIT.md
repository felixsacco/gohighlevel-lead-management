# MyApproved — Security & Data Protection Audit

**Scope:** READ-ONLY audit of the MyApproved (myapproved.com) codebase across seven subsections (K1–K7). No code was modified.
**Assessment tiers:** BLOCKER (highest) > HIGH > MEDIUM > LOW.
**Baseline:** Single commit `6c301b0 "Initial commit"` — all source and committed secrets trace to this commit.

---

## K1 — Account Security

### K1.1 — MFA status on service accounts (UNABLE TO DETERMINE FROM CODE)

MFA is a control configured at the provider's account/console level, not in application code. It cannot be positively confirmed from this repository. The status of MFA on every service account is therefore **UNABLE TO DETERMINE FROM CODE** unless otherwise noted:

| Service account | MFA status |
|---|---|
| Supabase | UNABLE TO DETERMINE FROM CODE |
| Vercel | UNABLE TO DETERMINE FROM CODE |
| Stripe | UNABLE TO DETERMINE FROM CODE |
| Google Cloud | UNABLE TO DETERMINE FROM CODE |
| GoHighLevel | UNABLE TO DETERMINE FROM CODE |
| GitHub | UNABLE TO DETERMINE FROM CODE |
| Domain registrar | UNABLE TO DETERMINE FROM CODE |

**Remediation:** Enforce MFA on every account with access to personal data; in particular the Supabase and GoHighLevel owner accounts, which hold live keys and (via GHL) payment capability.

### K1.2 — Service role key placement — CLOSED (server-only)

`lib/supabase.ts:41` reads the service-role key inside `getSupabaseAdmin()` via `process.env.SUPABASE_SERVICE_ROLE_KEY`, an unprefixed env var. It is used only server-side in route handlers and API functions. **No service-role key reaches the browser bundle.** This finding is CLOSED — the key is correctly restricted to the server.

### K1.3 — BLOCKER — Live GHL Private Integration token hardcoded in a client component

`app/setup-crm-private/page.tsx` is a `"use client"` component that initialises React state with a **live GoHighLevel Private Integration token**:

```ts
const [apiKey, setApiKey] = useState("pit-78d8b711-5a97-40ee-889a-688bd30f17ce");
```

This token is compiled into the browser JS bundle and is retrievable by any visitor who loads the page. It grants programmatic access to the GoHighLevel account (CRM, SMS, and payment data). The page also exposes `handleCopyApiKey()` / `handleCopyEnvVars()` helpers that surface the key in the UI. **This is live personal data access exposed to the client — a BLOCKER per the audit instruction.** The token must be revoked/rotated immediately and the value moved to a server-side env var.

### K1.4 — BLOCKER — Live Supabase anon key (second project) hardcoded as a literal fallback

`app/api/admin/activity-log/route.ts:4-5` hardcodes a **live Supabase URL and anon key** as fallback literals:

```ts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jismdkfjkngwbpddhomx.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24i...';
```

The project ref `jismdkfjkngwbpddhomx` is **different** from the primary `zaheoihrevtsnzrcswhn` ref used across the rest of the codebase (and in the committed `supabase-credentials.txt`). `jismdkfjkngwbpddhomx` appears only in this one file; every other Supabase reference in the 41-file surface uses `zaheoihrevtsnzrcswhn`. This is therefore a **second, stale Supabase project** whose anon key — still live and valid until it is rotated/revoked — is committed literally in source. A stale project holding UK personal data with a leaked key is a live-data exposure risk. **BLOCKER.** The stale project should be identified in the Supabase dashboard, checked for residual PII, and its key rotated or the project deleted; the fallback literal removed from source.

### K1.5 — HIGH — GHL OAuth client secret prefixed `NEXT_PUBLIC_`

`app/setup-crm/page.tsx:33-34` reads the GHL OAuth client secret from a public-prefixed env var:

```ts
const clientSecret = process.env.NEXT_PUBLIC_GOHIGHLEVEL_CLIENT_SECRET || "";
```

Any env var prefixed `NEXT_PUBLIC_` is inlined into the client bundle at build time. If `NEXT_PUBLIC_GOHIGHLEVEL_CLIENT_SECRET` is ever set in the deployment environment, the OAuth client secret ships to every browser. **HIGH** — a secret-exposure vector that is only latent because the var currently appears unset. Remove the `NEXT_PUBLIC_` prefix and use a server-side variable.

### K1.6 — HIGH — Service-role key silently falls back to the anon key in several routes

Multiple route handlers use a fallback pattern like `app/api/client/quote-requests/route.ts:12`:

```ts
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey;
```

When the service-role key is absent from the environment, these routes **silently downgrade to the anon key** for operations that assume admin/service-role privileges. This can (a) cause privileged operations to run unauthenticated on the anon role, or (b) fail closed only if RLS happens to block the anon role. Combined with the hardcoded anon-key fallback in K1.4, this weakens the isolation between the public anon key and the privileged service role. **HIGH** — the fallback should fail closed (return an error) rather than substitute `anonKey`.

### K1.7 — Committed secrets in git history

All of the following committed files trace to the single commit `6c301b0 "Initial commit"` (full history; no earlier commits exist). They contain live credentials:

| File | Sensitive contents |
|---|---|
| `supabase-credentials.txt` | Live Supabase project ref + keys, GoHighLevel API key, DeepSeek API key, reCAPTCHA secret, Companies House key, CRON secret |
| `GOHIGHLEVEL_SETUP.md` | Google client secret + Google Maps key |
| `docs/MANUAL_ACTIONS_REGISTER.md` | Google keys |

Because these are committed (not merely untracked), the values remain in git history even if the files are later removed. **Every key in these three files should be treated as compromised and rotated.** The files should be removed from the working tree and the history rewritten (or the repository made private) — noting that keys have already left the repo, so rotation is the primary mitigation.

The second Supabase project ref `jismdkfjkngwbpddhomx` appears in `.env.local` (correctly gitignored, untracked — see K1.4) — this is not committed, unlike the `zaheoihrevtsnzrcswhn` project whose keys ARE committed.

### K1.8 — Key rotation dates

**UNKNOWN.** No rotation dates, key metadata, or rotation policy are present in the codebase. Given the committed-secret exposure in K1.7, all keys should be assumed unrotated since creation and rotated as part of remediation.

---

## K2 — UK GDPR / Data Protection Act 2018

### K2.1 — Categories of personal data collected & stored

Based on the privacy policy and the data model visible in the query surface (K1.7, payment webhook, AI-verify):

- **Homeowners ("clients"):** name (first/last), email, phone, postcode, address, job descriptions, messages/quotes, device/browser/IP/location (via analytics).
- **Tradespeople:** name, email, phone, city, postcode, years of experience, company number, trade qualifications, insurance documents, identity documents (with doc number, status, expiry date), and a full Companies House profile (status, type, date of creation, SIC codes, registered address).
- **Transaction data:** quotes, messages, and payment records (via GHL/Stripe).

**Retention schedule — NO written schedule found in code or docs.** The privacy policy §8 contains ad-hoc retention statements (see K2.6), but no evidence of a documented, enforceable retention schedule per data category exists in the repository. **HIGH** (documentation gap, not a code defect).

### K2.2 — Lawful basis per purpose

The privacy policy does not articulate an explicit lawful-basis determination per processing purpose (consent / contract / legitimate interest / legal obligation). The identifiable purposes and their apparent bases:

| Purpose | Apparent basis | Basis documented? |
|---|---|---|
| Matching homeowners to tradespeople | Contract / legitimate interest | No |
| Processing payments | Contract | No |
| Sending marketing/outreach email & SMS | Consent (PECR) | No |
| Identity/qualification verification (Companies House) | Legitimate interest / legal | No |
| Analytics | Consent (via banner) | No |
| LLM classification/verification (DeepSeek/Gemini) | Not stated | No |

**MEDIUM** — no documented lawful-basis register; each purpose should be mapped to Art. 6(1) basis in the privacy policy.

### K2.3 — BLOCKER — PII disclosed to LLM providers without disclosure

`lib/verification/ai-verify.ts` POSTs **full tradesperson PII** to DeepSeek (`api.deepseek.com/v1/chat/completions`, `deepseek-chat`) via `buildVerifyPrompt()`, including name, email, phone, city, postcode, document numbers/status/expiry and the complete Companies House profile. There is **no opt-out, no minimisation**, and the privacy policy §4 does not name DeepSeek (or Gemini) as a recipient. A trade professional's identity and verification documents are therefore transferred to an LLM API that is not disclosed in the privacy policy. **This is an undisclosed transfer of live personal data — BLOCKER per the audit instruction.** (For the data-residency dimension of this same transfer see K3.)

### K2.4 — Third-party disclosure to tradespeople

Homeowner PII (name, contact details, job description, postcode) is passed to tradespeople when a lead is unlocked — see the payment webhook (`app/api/payments/webhook/route.ts`), which emails/SMSes the tradesperson the client's full phone number and job details. The privacy policy §4 discloses sharing "your name, contact details, and job description" with tradespeople, so this disclosure **is** described. However, the pay-per-lead flow means a homeowner's phone number is released to potentially multiple tradespeople on a pay-to-unlock basis, and the policy does not state how many tradespeople may receive it or whether the homeowner consents to that specific mechanism at the point of submission. **MEDIUM.**

### K2.5 — Privacy policy present / reachable / matches code

- Privacy policy exists (`app/privacy/page.tsx`, canonical `https://myapproved.com/privacy`) and a cookie policy exists (`app/cookies/page.tsx`). **Present and reachable — OK.**
- **Mismatch (MEDIUM):** Cookie policy describes a "Marketing" cookie category (Google Ads, retargeting, social media integration) and lists Facebook/Twitter/LinkedIn as third-party cookies, but the privacy policy §7 states "We do not use advertising cookies." The two policies contradict each other.
- **Mismatch (HIGH):** Privacy policy §4 names only Stripe and "service providers (hosting, email delivery)" as recipients. It does **not** name DeepSeek, Gemini, GoHighLevel, Postmark, Twilio, or Google as sub-processors — several of which are demonstrably used (see K3). Under UK GDPR, named processors receiving personal data must be disclosed.

### K2.6 — DSAR / erasure mechanisms

Privacy policy §6 lists Access / Rectification / Erasure / Portability / Restriction / Objection via `support@myapproved.com` with a 30-day response. **No code path** implements automated DSAR intake, identity verification, export, or erasure (unsubscribe of a user is not erasure). The mechanism is email-only and manual. **LOW** (from a data-protection perspective) — but no automated erasure route means erasure is a manual, unverifiable process.

### K2.7 — Breach detection (72-hour notification, logging)

No breach-detection, alerting, or 72-hour notification mechanism is present in the codebase. There is logging of the payment webhook and analytics events, but **no evidence of a security-incident logging/alerting pipeline** that would trigger the ICO's 72-hour breach-notification obligation. **HIGH** — this is a live compliance gap independent of code.

---

## K3 — Data Residency & Processors

### K3.1 — Supabase project region — UNVERIFIED (potential BLOCKER)

Two Supabase project refs exist in the codebase (see K1.4): the primary `zaheoihrevtsnzrcswhn` and a second, stale `jismdkfjkngwbpddhomx`. The **hosting region of neither project is determinable from code or committed docs**. The privacy policy §5 asserts Supabase is "hosted in the EU," but there is no evidence in the repository that confirms this — the region is set at Supabase console level, not in code.

**This is live UK-personal-data residency that cannot be verified.** If either Supabase project is hosted in a non-EU/UK region (e.g. `us-east-1`, `ap-southeast-1`), UK/EU personal data would be stored in a third country without an adequacy decision or appropriate safeguards, which is a **BLOCKER**. Must verify the region of BOTH projects in the Supabase dashboard and, if non-EU/UK, migrate or establish an appropriate transfer mechanism (UK IDTA / EU SCCs). Rated **UNVERIFIED-BLOCKER (pending region confirmation)**.

### K3.2 — BLOCKER (K2.3 resid. — undisclosed LLM transfer of UK personal data to DeepSeek)

`lib/verification/ai-verify.ts` sends **full tradesperson PII** — name, email, phone, city, postcode, years experience, company number, identity/insurance document numbers, statuses and expiry dates, and the complete Companies House profile — to **`api.deepseek.com/v1/chat/completions`**. DeepSeek is a **non-UK, non-EU** (PRC-based) model provider; UK personal data is therefore transferred to a third country that has **no UK adequacy decision and no IDTA/SCC in evidence**. There is no opt-out, no minimisation, no retention/deletion control, and the privacy policy does not name DeepSeek. **BLOCKER.**

### K3.3 — MEDIUM — Google Gemini classification data

A `gemini-2.5-flash` classification path exists (see `gemini.go` / AI-assistant route). If Gemini receives user-provided text (job descriptions, messages, trade details) for classification, that is a further processor transfer. Google offers BAA/DPA and can be configured for EU/UK residency and no-training, but **none of this is configured or evidenced in code**. OpenAI/Google training status is not addressed in the privacy policy. Rated **MEDIUM** until field-level scope and region/no-training configuration are confirmed.

### K3.4 — Sub-processor inventory & DPA status

No signed DPA/IDTA is evidenced anywhere in the repository, and the privacy policy §4 does not provide a sub-processor list. The processors demonstrably in use, and their third-country exposure:

| Processor | Function | Named in policy §4? | DPA evidenced? | Leaves UK? |
|---|---|---|---|---|
| Supabase (×2 projects) | Database, auth, storage, edge | Implied ("hosting") | No | Unknown (region UNVERIFIED — K3.1) |
| Vercel | Hosting/edge/CDN | Implied ("hosting") | No | Unknown (edge regions) |
| Stripe | Payments | **Yes** | No | Yes (US/EU; SCCs standard but not evidenced) |
| GoHighLevel (LeadConnector) | CRM, SMS, payments | **No** | No | Yes (US) |
| DeepSeek | LLM verification | **No** | No | **Yes (PRC) — BLOCKER** |
| Google (Gemini, Places, Maps, reCAPTCHA) | LLM, geocoding, bot protection | **No** | No | Yes (US/EU) |
| Postmark | Transactional email | Implied ("email delivery") | No | Yes (US) |
| Twilio | SMS (fallback) | **No** | No | Yes (US) |

**HIGH** — no documented DPA/IDTA/SCC for any processor, several unknown to the privacy policy, and at least one (DeepSeek) is a non-adequate third country.

---

## K4 — Cookies & Tracking (PECR)

### K4.1 — BLOCKER — GA4 gtag.js injected unconditionally before consent

`lib/analytics.ts:34-64` (`initGA4`) injects `<script src="https://www.googletagmanager.com/gtag/js?id=...">` into the document head **the moment `Analytics.init()` runs**, before any consent decision. The `gtag('consent', 'default', {... 'denied'})` call (lines 44-51) is set **only after** the script may have already loaded, and Consent Mode's `ad_storage`/`analytics_storage` "denied" still permits cookieless pings and is not the same as blocking the non-essential script. The non-essential GA4/GTM script therefore **fires before consent** — a PECR violation (non-essential cookies/tracking require prior consent). **BLOCKER.**

### K4.2 — HIGH — GA4 custom endpoint posts PII regardless of consent

`sendToCustomEndpoint()` (`lib/analytics.ts:206-224`) POSTs every event — including `navigator.userAgent` and `window.location.href` (page-level data, potentially a query-string or personalised URL) — to `/api/analytics`. This fetch is **not gated by any consent flag** and fires on `track()` for every event, including for users who rejected non-essential cookies. **HIGH.**

### K4.3 — HIGH — Cookie banner does not block scripts

`components/CookieConsent.tsx` stores a `cookie-consent-v1` value (`'accepted'|'rejected'|'unknown'`) in localStorage. Its `acceptAll()` / `rejectNonEssential()` methods **only write localStorage** — they do **not** call `analytics.grantConsent()`, do **not** call `gtag('consent','update',...)`, and do **not** block the GA4 injection or the custom-endpoint POST. The `grantConsent()` method in `lib/analytics.ts` is never invoked anywhere in the codebase. **Declining cookies does not actually prevent tracking** — the entire consent surface is decorative. **HIGH.**

### K4.4 — MEDIUM — Policy contradiction: GA4/GTM described inconsistently

The cookie policy (`app/cookies/page.tsx`) lists a "Marketing" category (Google Ads, retargeting, social media — Facebook/Twitter/LinkedIn) and GA4 analytics cookies, but the privacy policy §7 states "we do not use advertising cookies." The two policies are mutually contradictory about what tracking actually runs — an ICO/PECR readability issue. **MEDIUM** (also recorded at K2.5).

### K4.5 — Policy gap — cookie page omits Consent Mode detail

The cookie policy does not mention Google Consent Mode v2, does not list the locale category structure actually used, and does not reveal the custom `/api/analytics` collection endpoint. **LOW.**

---

## K5 — Outreach Compliance (PECR)

### K5.1 — Source of outreach emails — UNVERIFIED / no evidence of lawful basis

No cold-outreach contact-list source is present in the codebase. There is no evidence of (a) how prospect emails are obtained, (b) a claimed PECR soft-opt-in or consent basis, or (c) any legitimate-interest assessment for B2B outreach. Absent a documented source + lawful basis, the cold-email/SMS outreach pipeline cannot be shown PECR-compliant. **HIGH** — treat the outreach list provenance as unsubstantiated until documented.

### K5.2 — MEDIUM — Sender identity / unsubscribe present only in code, not confirmed live

Email is sent via Postmark with a fixed `defaultFrom = "noreply@mail.myapproved.com"` (a no-reply address). **No `List-Unsubscribe` header and no unsubscribe link are shown to be included** in the transactional/outreach templates within the codebase (`lib/notifications.ts` / email templates do not evidence a List-Unsubscribe header or an unsubscribe footer). A no-reply sender + missing unsubscribe on marketing/outreach mail is a PECR violation. **MEDIUM** (matters most for cold outreach rather than transactional emails).

### K5.3 — Suppression list — UNVERIFIED

No suppression/do-not-contact list is evidenced in the codebase. GHL (CRM) may provide one, but no code path reads or honours a suppression list before sending SMS or email. **MEDIUM** — must confirm a suppression list exists and is enforced pre-send.

### K5.4 — Sole traders / partnerships vs limited companies — NOT DISTINGUISHED

Tradespeople register with a `companyNumber` (Companies House), implying limited-company status, but the code does not evidence a distinction between sole traders/partnerships and limited companies for the purposes of PECR consent (which applies more strictly to sole traders/partnerships). **LOW** — the platform should determine each contact's legal status before applying the corporate-subscriber PECR exemption.

---

## K6 — Payments & Consumer Law

### K6.1 — BLOCKER — Payment (GHL) webhook is unauthenticated / spoofable

`app/api/payments/webhook/route.ts` accepts an arbitrary POST body, reads `body._id` (GHL invoice id) and `body.status`, and **marks a `lead_purchases` row as `"paid"` and then releases the lead to a tradesperson — including emailing/ SMS-ing the tradesperson the client's full phone number** — with **no signature, HMAC, or shared-secret verification**. Anyone who learns (or guesses) a GHL invoice `_id` can flip a purchase to `paid`, obtain the lead, and trigger a PII disclosure to a tradesperson, without paying. **BLOCKER** (physical data release + financial bypass via an unsigned endpoint).

### K6.2 — HIGH — Stripe integration / PCI status

Payments are routed through GoHighLevel's Stripe-backed invoicing; the direct Stripe surface is limited to this webhook (no direct card handling in this codebase). If the product uses GHL's hosted checkout, the merchant is likely eligible for **PCI SAQ-A** (no card data touches their systems). This cannot be confirmed from code and must be verified with GHL/Stripe's SAQ-A attestation. **HIGH** — PCI scope is unverified while live payments flow via a partner that also receives full PII (see K3.4).

### K6.3 — MEDIUM — Tradesperson ToS: lead quality, refunds, disputes

No tradesperson terms of service, lead-quality/refund policy, or dispute-resolution text is present in the codebase (no terms page/route identified). The pay-per-lead model charges £4.99 per lead; the absence of a published ToS covering lead quality, refunds, and disputes leaves tradespeople without a contractual baseline and violates consumer-law clarity expectations. **MEDIUM.**

### K6.4 — LOW — Pre-payment clarity

At the point of purchasing a lead, the product must present the price (£4.99, surfaced only as `leadCostLabel` in the notification) and what the buyer receives. No pre-purchase disclosure UI is evidenced in code; price/receipt is only shown post-purchase in the unlock notification. **LOW** (depends on checkout UI, which is hosted by GHL and not in this repo).

---

## K7 — ICO Registration

### K7.1 — UNVERIFIED — No ICO registration reference found

No ICO registration number (format `ZBxxxxxx` / `Zxxxxxxx`) appears anywhere in the codebase, footer, privacy policy, cookie policy, terms, or any committed documentation (this was checked across committed files and the two policy pages). As a UK data controller for a lead-generation platform processing personal data and conducting live marketing outreach, MyApproved **is required to be registered with the ICO**.

**UNVERIFIED** — this is not evidence of non-registration (the reference could live outside the repo — e.g. in a footer deployed separately, or the company may be registered under a legal entity name not present in code). Treat as requiring confirmation.

**Remediation steps:**
1. Search the ICO's public register (https://ico.org.uk/ESDWebPages/Search) for "MyApproved" and any associated legal entity name.
2. Confirm the registration is current and the fee tier is correct (a commercial lead-generation platform processing citizen personal data is normally **Tier 2/3**, not exempt).
3. Publish the registration number in the privacy policy footer and site footer as required by transparency obligations.
4. If not registered, register immediately; operating as a controller without registration is a civil offence under the Data Protection (Charges and Information) Regulations 2018.

---

## Summary of BLOCKER findings (Section K)

1. **K1.3** — Live GHL Private Integration token hardcoded in a client component (`app/setup-crm-private/page.tsx`).
2. **K1.4** — Live Supabase anon key (second, stale project `jismdkfjkngwbpddhomx`) hardcoded as a literal fallback.
3. **K2.3 / K3.2** — Full tradesperson PII (incl. identity documents + Companies House profile) sent to DeepSeek undisclosed/unmitigated.
4. **K3.1** — Supabase hosting region unverified (potential non-EU/UK residency of UK PII).
5. **K4.1** — GA4/GTM gtag.js injected before consent.
6. **K6.1** — Payment webhook unauthenticated/spoofable → lead released + PII disclosed without payment.

---

*End of Section K. All findings are read-only observations; no code was modified.*
