# MyApproved — 100% Autonomy Pipeline Audit

**Date:** 2026-09-07 · **Scope:** read-only, live-code audit (route handlers + libs + SQL + `vercel.json`) · **Method:** four parallel domain traces (homeowner journey, tradesperson journey, notification matrix, monetization/RLS/PII loop), every claim cited `file:line`, high-severity claims re-verified by hand.
**Supersedes as baseline:** `BACKEND-AUDIT-REPORT.md` (2026-09-05), `AUDIT.md`, `system-audit-report.md` — all predate the master-schema rewrite, HMAC webhook hardening, and admin Bearer proxy. Treat those as historical.

---

## Executive verdict

The pipeline is **not close to 100% zero-touch**, and the gaps are concentrated, not diffuse. Roughly:

| Layer | State |
|---|---|
| Job intake (homeowner) | ✅ Live end-to-end (submit → geocode → lead → dispatch) but **the poster can never log in** and **photos are dropped** |
| AI estimate | ⚠️ Deterministic local pricing matrix (fine) — Gemini is **classification-only**, never persisted beyond a single `budget` number |
| Tradesperson vetting | ❌ **Single unconditional human click.** Docs are stored, never read. Companies House is structurally dead (no `company_number` column). |
| Tradesperson approval state machine | ❌ No automated decision; the state-machine libs that would encode one are imported by **zero** files |
| Job matching / dispatch | ✅ Live fan-out, but **not "3 nearest"** (unbounded union) and geo coordinates are never used for matching |
| Auto-assign | ⚠️ Flag-gated (`ENABLE_AUTO_ASSIGN_JOB`), lowest-bid only, fires only after an application exists |
| Notification matrix | ⚠️ Email real (Postmark); **SMS success is fabricated when unconfigured**; push is **fiction**; several alerts have **no recipient** and can never deliver |
| Lead payment loop | ⚠️ Webhook HMAC scheme is **self-invented and unverified**; **double-sale is reachable**; checkout double-click orphans invoices |
| Lead locking / PII | ❌ **`clients`/`tradespeople`/`lead_purchases`/`transactions` have NO RLS** → the anon key reads all PII, defeating the £4.99 unlock |
| Schedulers | ⚠️ Vercel crons declared; **none on Netlify** (`netlify.toml` has no crons) |

**The four hard walls to autonomy** (each independently blocks zero-touch):

1. **PII is public to the anon key** (no RLS on `clients`, `tradespeople`, `lead_purchases`, `transactions`; no `REVOKE` anywhere). The £4.99 phone-unlock is un-sellable until this is closed.
2. **Tradesperson approval = one human click** that ignores documents, Companies House, and AI risk. No code path reaches `approved` otherwise.
3. **The webhook signature scheme is unverified against GHL docs** (self-declared `x-ghl-signature` + plain HMAC). If wrong, every paid webhook 401s and leads never unlock — with live money.
4. **No single-sale enforcement** — sequential and concurrent double-charges for one lead are reachable, with no refund path.

Details and exact code to write are in Part 3.

---

# PART 1 — Master sequence maps

## 1.1 Homeowner (Client) journey — as-built

```
LANDING / SEO
  /find-tradespeople/[trade]/[location]  (33 trades × 50 locations = 1650 pages, lib/seo-data.ts)
        │  CTA fires window event 'open-ai-quote'
        ▼
  AIQuoteForm wizard (components/AIQuoteForm.tsx)
    collects names/email/phone/trade/description/postcode/budget/urgency/preferredDate  (:398)
    collects + previews File[] photos  (:36,152,544,563)
        │
        ▼  POST /api/jobs/submit  (route.ts:401-421)   ← JSON; images sent as [] (photo step DEAD UI, :416)
  ────────────────────────────────────────────────────────────────
  Route handler (app/api/jobs/submit/route.ts)
  1. validate REQUIRED = trade,description,postcode,urgency non-empty  (:57-63, 89-100)   ← presence only; lib/utils/validation.ts unused
  2. upsert clients by email  → password_hash:'ANONYMOUS_NOT_SET'  (:69-79, 76)
        error → console.error, CONTINUE with client_id=null  (:81-82)        ← non-fatal, untracked
  3. insert jobs  status:'approved', is_approved:true, application_status:'open'  (:118-120)   ← auto-approved, no moderation state
        budget = single number only  (:104-112)                               ← budgetMin/Max/label/breakdown never persisted
  4. jobRef = reference_code || id  (:144)                                     ← UUID unless MA-###### trigger was applied (it wasn't, live)
  5. geocode postcode → jobs.latitude/longitude  (:146-160)                    ← coordinates written, NEVER read for matching
  6. insert leads {job_id, price_pence:499}  (:165-167)
        failure → console.error only, response still success:true  (:171-176)  ← revenue-critical row can be absent
  7. POST /api/crm/sync-job (QStash or direct)  (:180-216)                      ← GHL sync STUBs to 200 {success:false} if keys absent
  8. notifyMatchingTradespeopleForJob (awaited)  (:220-233)
  9. client confirmation job_posted_confirmation [email,sms]  (:244-284)
  10. admin alert job_posted_admin_alert [email]  (:287-336)                   ← dead if ADMIN_EMAIL unset
  ────────────────────────────────────────────────────────────────
        ▼  success card claims "You'll also receive email updates" (AIQuoteForm.tsx:733)
  THANK-YOU: app/thank-you/page.tsx is STATIC — nothing routes back to it
        ▼  ❌ BRICKED: owner cannot log in
  login/client gates is_verified (:144-155); login never matches the ANONYMOUS_NOT_SET
  sentinel (:39,92-102); register rejects the email as "already registered" (:123-138)
  → anonymous majority of submitters can NEVER reach the client dashboard
        ▼  ⚠️ UNLOCK LOOP IS INVISIBLE TO HOMEOWNER
  When a tradesperson pays to unlock (webhook), only the tradesperson is emailed
  (webhook/route.ts:182-203); clients row fetched (:176-180) only to supply phone.
  No 'your job was unlocked / interest received' event type exists (lib/notifications/types.ts:3-40).
```

**What is genuinely live for the homeowner:** posting a job (anonymous), receiving a deterministic local estimate, being emailed/SMS'd a confirmation, and — on a separate flow — registering, verifying by email code, logging in, and approving/rejecting tradesperson quotations on the client dashboard (`app/dashboard/client/page.tsx`).

**What is not:** the account-claim path, photo persistence, estimate persistence, server-side input validation, a consistent job state machine, and any homeowner-side unlock notification.

## 1.2 Tradesperson journey & state machine — as-built

```
SIGN-UP  app/register/tradesperson/page.tsx → POST /api/trades/register  (route.ts is the ONLY routed variant)
  1. validates + scrypt-hashes password
  2. inserts tradespeople  verification_status:'pending_documents', is_verified:false,
       is_approved:false, is_active:true  (:174-189)
  3. uploads 4 doc types to Supabase Storage 'documents' bucket as raw File  (:287-410)
       inserts documents rows status:'pending'  (:300-306,…)      ← never read back, no OCR/Vision/Document AI anywhere
  4. IF all uploads OK → verification_status:'pending_review'  (:444-452)
       comment (:438-443): approval granted ONLY by admin flow; old auto-approve removed
  5. admin alert tradesperson_signup_admin_alert  (:237-253)  [dead if ADMIN_EMAIL unset]
  6. confirmation tradesperson_signup_confirmation [email,PUSH]  (:467-475)   ← PUSH leg is fiction (index.ts:59-69)
        ▼
  STATE: pending_review
        ▼  (the ONLY transition to approved)
  ADMIN  /admin dashboard → handleVerifyTradesperson (app/admin/dashboard/page.tsx:847-871)
    → /api/client/admin-secret/verify-tradesperson  (cookie→Bearer proxy allowlist)
      1. Companies House cross-check runs ONLY if tradesperson.company_number  (:47)
            → tradespeople has NO company_number column → branch NEVER executes  (master-consolidated.sql:68-106)
      2. Gemini risk score aiVerifyTradesperson  → console.log only, not persisted, not gating  (:64-99)
      3. UNCONDITIONAL approve: is_approved:true, is_verified:true, is_active:true,
           verification_status:'approved'  (:102-110)
      4. 3 emails on one click: sendTransactionalEmail (direct, no notification_logs) +
           tradesperson_next_steps + profile_live_alert  (:120-159)
        ▼
  STATE: approved  → can log in (login gates is_verified/is_approved, :133-164)
        ▼
  DISPATCH (job posted elsewhere)
  notifyMatchingTradespeopleForJob  (lib/notifications/notify-tradespeople-job-match.ts)
    .eq('is_verified', true).not('email','is',null)  (:135-136)
    regulated trades += certification_verified && cert not expired  (:138-139)   ← hand-set flags, silent gate
    JS union: tradesMatch OR locationMatchesJob  (:185-195)
    NO top-N cap:
      unlimited subscriber → job_match [email]  (:272-296)
      pay-per-lead        → insert lead_purchases {status:'offered', 499p}  (:303-311)
                            + pay_per_lead_alert [email,sms] with unlock URL  (:336-362)
  PLUS hourly escalation cron /api/cron/escalate-jobs → round-robin.ts
    3 rounds × 24h × 10 trades/round; stops once any paid lead_purchases exists  (:81-98, 121-124, 186)
        ▼
  UNLOCK / APPLY  (see Part 1.3 for the money loop)
    /leads/[id]      owner-gated; full phone only when purchase.status='paid'  (page.tsx:75-83,223-234)
    /api/jobs/apply  session-gated; NOT purchase-gated  → free quotes/assignments possible (F6)
        ▼
  AUTO-ASSIGN (flag-gated, NOT the matching story)
  apply schedules application_auto_assign_due +48h IF ENABLE_AUTO_ASSIGN_JOB==='true' (apply:227-241)
  process-scheduled cron → runAutoAssignForJob → picks LOWEST quote → assignJobFromApplication
  (sets job in_progress, rejects losers, creates chat_room, emails)  (runAutoAssignForJob:42-70)
```

**Account state machine actual transitions (all code reachable):**

| From | To | Writer | Gate |
|---|---|---|---|
| (insert) `pending_documents` | `pending_review` | `register/route.ts:444-452` | docs uploaded |
| `pending_review` | `approved` | `admin-secret/verify-tradesperson:102-110` | **human click; ignores docs/CH/AI** |
| `approved` | `is_active:false` (suspended) | `admin-secret/suspend-tradesperson` | human |
| `is_active:false` | `is_active:true` | `admin-secret/reactivate-tradesperson` | human |
| — | `rejected` | **unreachable** — no writer exists | — |

`verification_status` is an **unconstrained free-text column** (no CHECK), and the document statuses never advance past `'pending'` (no OCR, no review endpoint, no expiry check).

## 1.3 Monetization / lead-lock / PII-unmask loop — as-built

```
OFFER  (service-role)
  job submit/round-robin insert lead_purchases {status:'offered', price:499} per eligible PPL trade
  email/SMS pay_per_lead_alert with masked phone + unlockUrl /leads/{purchaseId}
        ▼
UNLOCK PAGE  app/leads/[id]/page.tsx  (server component)
  load purchase by id (:54-60); trade_session cookie → isOwner (sub === tradesperson_id) (:75-83)
  NON-owner → locked panel, no PII (:85-114)
  OWNER: client FULL NAME always shown (:217-221); PHONE only when status==='paid' (:132,223-234)
        ▼  unpaid → unlock button (unlock-button.tsx) → Bearer localStorage tradeToken
  CHECKOUT  POST /api/leads/[id]/checkout  (authorizeTradeSession :33-53)
    owner-binding 403 (:80-89); requires status==='offered' (:91-102)   ← paid→409, else 410
    gate reads purchase.status ONLY — never leads.status, never sibling paid rows  (→ double-sale, F1)
    GHL contact find-or-create (:143-164); createPaymentLink → /payments/invoices  (:176-181, GHL:255-284)
    amount in pence, redirectUrl = /leads/{id}?payment=success  (:173)   ← never read by the page (no searchParams)
    stores GHL invoice id into column MISNAMED stripe_checkout_session_id  (:191-194, NO error check, NO idempotency)
        ▼   browser → GHL-hosted Stripe invoice → pays → GHL POSTs webhook
  WEBHOOK  app/api/payments/webhook/route.ts
    HMAC-SHA256(x-ghl-signature) timingSafeEqual, fail-closed (:11-33)
       ⚠️ scheme self-invented — code comment :8-10 admits unverified against GHL docs
    invoiceId = body._id; acts only on status==='paid' (:48-59)
    lookup purchase by stripe_checkout_session_id==invoiceId (:62-66)
    isNewlyPaid = status!=='paid' (:78) →  mark purchase paid (:82-88)
       → update leads SET status='paid' where job_id (:107-110)  [NON-FATAL — if it fails lead stays open]
       → transactions ledger upsert onConflict stripe_payment_intent_id (:128-144)  [safe, idempotent]
    notify tradesperson pay_per_lead_alert with full client phone (:162-203)
       NOTIFY ONLY TRADESPERSON — homeowner never told
        ▼
  SALE DONE.  Sibling 'offered' purchases for the SAME job are NEVER expired/refunded →
  a second tradesperson can buy the same single lead (F1/F4). No 'refunded'/'expired' writers exist.
```

**Reservation system (separate, fully coded, UNWIRED):** `/api/leads/[id]/claim` is a correct atomic `open→claimed` update with 10-min expiry (`claim/route.ts:157-169`) and `/api/cron/release-expired-claims` frees them every minute — but **no UI/route ever POSTs to claim**, and checkout never consults `leads.status`/`claimed_by`. Reservation semantics and purchase semantics are two unconnected systems sharing only `job_id`.

---

# PART 2 — Notification trigger matrix

Transport truth (verified): **Email = nodemailer → Postmark SMTP** (`lib/notifications/email.ts:48-53`; no `@resend`; `instrumentation.ts:4` hard-gates prod boot on `POSTMARK_SERVER_TOKEN`). **SMS = GHL default, Twilio only if `SMS_PROVIDER=twilio`** (`sms.ts:55-59`); "auto" fallback is dead when GHL is configured but fails (`sms.ts:245-247`). **QStash** workers enqueue notifications + CRM sync; **`notification_logs` is a real sink** consumed by the inbox API. **`netlify.toml` declares no crons** → all scheduled work is Vercel-only.

### Trigger → path → delivery

Legend: ✅ delivered as declared · ⚠️ partial (silently droppable leg) · ❌ never delivered / fabricated. Channel codes `em/sms/ghl/in=notification_logs`.

| Trigger | Path | Recipient / channels | State | Failure mode if live |
|---|---|---|---|---|
| Job submitted → client confirm | `jobs/submit:244-284` | client `em,sms` | ⚠️ | SMS silently skipped without GHL/Twilio keys; success regardless (`index.ts:122-125`) |
| Job submitted → match dispatch | `jobs/submit:220-233` → `notify-tradespeople-job-match.ts` | ALL verified matches | ⚠️ | **Not capped at 3**; unbounded `lead_purchases` fan-out |
| Job submitted → admin alert | `submit:287-336` | admin `em` | ❌ if `ADMIN_EMAIL` unset | `getAdminEmail()`→`""` → `Missing recipientEmail` swallowed |
| No certified match (regulated) | `notify-…:208-227`, `round-robin.ts:162-183` | admin | ❌ **no recipient supplied at all** | guaranteed non-delivery, both engines |
| Unlimited subscriber match | `notify-…:272-296` | tp `em` | ✅ | per-tp try/catch |
| Pay-per-lead offer | `notify-…:298-362`, `round-robin:206-269` | tp `em,sms` | ⚠️ | SMS dies silently; escalation rounds give unlimited subs **nothing** (`round-robin:206-214 continue`) |
| Lead claim expired (cron, 1-min) | `release-expired-claims/route.ts:32-50` | — | ❌ **zero notifications** | claimant never told, pool never re-notified |
| Lead paid → tradesperson unlock | `webhook:162-203` | tp `em,sms` | ⚠️ | SMS leg silent; **homeowner never notified** (❌) |
| Trade signup → admin alert | `register:237-253` | admin `em` | ❌ if `ADMIN_EMAIL` unset | not even try/catch'd |
| Trade signup confirm | `register:467-475` | tp `em,push` | ⚠️ | push leg is fabricated success (`index.ts:59-69`) |
| Admin verifies trade | `verify-tradesperson:120-159` | tp | ⚠️ | **3 emails/click**; direct email bypasses `notification_logs` |
| Suspend / reactivate | `admin-secret/suspend…:43-66`, `reactivate…` | tp `em` | ✅ | |
| Job approved live | `admin-secret/approve-job:70-92` | client `em` + pool | ✅ | reject action sends **nothing** |
| Trade invited to job | `admin-secret/invite-tradespeople:120-153` | invited `em` | ✅ | |
| Job complete + review + invoice | `jobs/complete/route.ts:159-277` | client/tp/admin | ⚠️ | admin alert gated `if(ADMIN_EMAIL)` (:182) silently |
| Job assigned (all paths) | `assignJobFromApplication.ts:100-241` | client/tp/losers | ✅ | direct emails bypass logs |
| App submitted | `jobs/apply:152-241` | client + tp | ⚠️ | SMS needs keys |
| Quote request (directory ask) | `quotes/request:246-313` | client/admin/chosen tp | ✅ | targeted `job_match_tradesperson` |
| Rate tradesperson | `jobs/rate-tradesperson:102-118` | tp `em` | ✅ | no auth gate |
| Dispute submit / update | `disputes/submit:142-169`, `admin/disputes:142-179` | admin/user | ⚠️ | admin leg skipped when both env vars unset |
| CRM sync (job→GHL) | `workers/crm-sync` | GHL | ⚠️ | 200 `{success:false}` when GHL keys absent |
| Scheduled pump (15-min) | `notifications/process-scheduled:29-91` | — | ⚠️ | **email-only delivery**, Netlify = never fires |
| Chat AI assistant | `chat/ai-assistant` | — | ✅ inline | escalation → DB row, no staff alert |

### Channel classification

- **Email (Postmark):** working; weak spots are unset `ADMIN_EMAIL` (silent no-op) and direct `sendTransactionalEmail` calls that bypass `notification_logs`.
- **SMS (GHL):** config-dependent; a missing provider returns `success:true` masking a dead leg (`sms.ts:224` skipped → `index.ts:86` success → `.ok` via `some`).
- **SMS (Twilio):** only reachable with `SMS_PROVIDER=twilio`; auto-fallback is dead code.
- **GHL CRM:** stubs to silent 2xx when keys absent.
- **Push:** **fiction** — returns success, writes nothing, delivers nothing (`index.ts:59-69`).
- **Scheduled:** works on Vercel; email-only; dedupe/review-chain 24→48→72h live (`process-scheduled:96-142`).
- **`notification_logs`:** consumed (inbox API). **`dead_letter_queue`:** written on worker failures but **no re-drive consumer exists** — audit-only today.

---

# PART 3 — Prioritized gap analysis (exact code to write for 100% autonomy)

Ranked by (dependency first, then autonomy-block). Each gap names the file to change and what to add.

## P0 — the two walls that make every downstream effort moot

**W1. Close the anon-key PII hole (Domain 4 · F7/F8).**
`clients`, `tradespeople`, `lead_purchases`, `transactions`, `notification_logs`, `chat_*`, `job_reviews`, `job_applications` — no RLS / no `REVOKE` (`master-consolidated.sql:612-617`); the app ships browser code that reads/writes `clients` with the anon key (`verify-captcha/page.tsx:57-84`, `dashboard/tradesperson/page.tsx:748-772`). Run:
```sql
REVOKE ALL ON public.clients, public.tradespeople, public.lead_purchases,
  public.transactions, public.notification_logs, public.chat_rooms, public.chat_messages,
  public.job_reviews, public.scheduled_notifications, public.job_applications,
  public.jobs, public.leads, public.dead_letter_queue FROM anon, authenticated;
GRANT SELECT ON public.jobs TO anon;  -- only if the public marketplace truly needs anon reads
```
Then move every anon-key read/write of those tables behind service-role route handlers (the pattern `leads` already uses), and replace `app/api/client/jobs/route.ts` (attacker-supplied `userId` query param, returns nested tradesperson phone/email — `:25-90`) with an owner-scoped authenticated handler. Also gate the unauthenticated writers: `jobs/client-assign`, `client/approve-quotation` (spoofable body `clientId`), `rate-tradesperson`, `jobs/approve`.

**W2. Unverified GHL webhook signature (Domain 4 · Partial 1 / E).**
`app/api/payments/webhook/route.ts:8-33` self-invents `x-ghl-signature` + plain HMAC. **Reconcile against GHL/LeadConnector webhook docs before live money.** Then add delivery-id idempotency (`processed_webhooks(invoice_id PRIMARY KEY)`) so a concurrent duplicate can't double-notify, independent of the stale `isNewlyPaid` read at `:78`.

## P1 — autonomy-blocking gaps

**1. Single-sale enforcement (Domain 4 · F1/F3/F4).** Sequential and concurrent double-charges for one lead are reachable; losers are never expired/refunded. Add the constraint, then make the webhook transition atomic via a function:
```sql
CREATE UNIQUE INDEX IF NOT EXISTS uq_lead_purchases_one_paid_per_job
  ON public.lead_purchases(job_id) WHERE status = 'paid';

CREATE OR REPLACE FUNCTION public.mark_lead_purchase_paid(p_purchase_id uuid, p_invoice_id text)
RETURNS boolean LANGUAGE plpgsql VOLATILE AS $$
DECLARE v_job uuid;
BEGIN
  UPDATE lead_purchases SET status='paid', paid_at=now(), stripe_payment_intent_id=p_invoice_id
   WHERE id=p_purchase_id AND status='offered' RETURNING job_id INTO v_job;
  IF v_job IS NULL THEN RETURN false; END IF;
  UPDATE lead_purchases SET status='expired', updated_at=now()
   WHERE job_id=v_job AND status='offered' AND id<>p_purchase_id;  -- refund candidates
  UPDATE leads SET status='paid', paid_at=now(), claimed_by=NULL WHERE job_id=v_job;
  RETURN true;
END; $$;
```
Call it from the webhook (replacing the two non-atomic updates at `:82-88` and `:107-110`); add a checkout-time pre-pay guard (`SELECT 1 … WHERE job_id=… AND status='paid'` → 409) and a refund sweep for `'expired'` offers.

**2. Purchase-gate job application (Domain 4 · F6).** `app/api/jobs/apply/route.ts:129-139` lets any approved tradesperson quote and win a job without paying. Before the insert, require a `paid` `lead_purchases` row for `jobId` (or an unlimited entitlement).

**3. Replace the human approve-click with a deterministic state machine (Domain 2).** The pieces exist but are dead: `lib/verification/spec.ts` (1272 lines, per-document automatable flags) and `lib/verification/user-status-machine.ts` (auto-approve when docs approved, `:77-83`) are imported by **zero** files. Wire them: documents `pending→approved/rejected` per doc, then when all required docs approved + Companies House active + risk score under threshold → `approved`; otherwise `pending_review` / notify admin with the reason. Add a reject-tradesperson writer (no `'rejected'` writer exists today) and a CHECK constraint on `verification_status`.

**4. Give the anonymous homeowner a way back in (Domain 1 · #1 blocker).** Sentinel `password_hash:'ANONYMOUS_NOT_SET'` (`jobs/submit:76`) never matches login (`login:92-102`) and blocks re-registration (`register:123-138`). Add `POST /api/auth/client/claim` (magic link / one-time code → set real password + `is_verified:true`) and make register's duplicate guard treat sentinel rows as claimable.

**5. Homeowner unlock notification (Domain 3 · G3).** Add a client event type and, in `webhook/route.ts` after the purchase is paid, notify the `clients` row already fetched at `:176-180` that a tradesperson unlocked their job.

**6. Server-side verification API (Domain 1).** Move `verify-captcha/page.tsx:57-92` (anon-key SELECT+compare+self-UPDATE of `clients.is_verified`) into a service-role `POST /api/auth/client/verify`; store/compare the code server-side.

## P2 — correctness / integrity gaps

**7. Atomicity + persistence of job submit (Domain 1).** Wrap client-upsert + job-insert + lead-insert in a transaction/RPC; fail the response if the `leads` insert throws instead of `console.error`. Persist `budget_min/max`, `estimate_label`, `breakdown_time` (currently reach the handler but are dropped); apply `reference_code`/`MA-######` DDL so `jobRef` isn't a UUID; accept multipart/signed-upload for `images` (or delete the photo step in `AIQuoteForm.tsx`, which currently sends `[]`).

**8. Checkout idempotency (Domain 4 · F9).** `checkout/route.ts:191-194` overwrites the GHL invoice id on every click and ignores the result — a second click can orphan a first paid invoice. Only write if NULL; return the stored payment URL on repeat; check the update result. Handle `?payment=success` (page takes no `searchParams` today).

**9. Real geo "nearest" matching (Domain 2).** Coordinates are written (`register:480-494`, `submit:146-160`) but never read; matching is an unbounded union. Implement top-N-nearest using the populated `latitude/longitude`/`postcode_cache` (phase11 `haversine_distance`) or drop the "3 nearest" marketing claim. Decide and document the actual cap (dispatch today = every verified match; escalation = 10/round × 3 rounds).

**10. Document intake pipeline (Domain 2 · #2).** Uploads are opaque `File`s with `status:'pending'` never read back — no OCR/Document AI/Vision package exists anywhere. Add a parsing step (or honest manual-review UI that flips `documents.status`), an expiry check against `expiry_date`, and surface doc status in the admin decision UI.

**11. Companies House wiring (Domain 2 · #3).** Add `tradespeople.company_number` column + registration UI capture so the CH cross-check at `verify-tradesperson:47` can execute; the two standalone CH routes have no UI caller.

**12. SMS honesty + real fallback (Domain 3 · G5).** Treat `skipped:true` as a visible failure in `index.ts:83-86` (it is currently `success:true`, and `.ok = some()` lets email mask a dead SMS leg); make `SMS_PROVIDER=auto` fall through to Twilio at `sms.ts:245-247` instead of hard-failing.

**13. Recipient-less admin alerts (Domain 3 · G2, G4, G7).** Add `recipientEmail: getAdminEmail()` to `regulated_trade_no_certified_match` in both engines; centralise an `ADMIN_EMAIL` guard that `console.error`s instead of silently returning; remove the explicit env-gates at `jobs/complete:182` and `disputes/submit:142`; kill the fake push channel (`index.ts:59-69`) — either write an inbox row or drop `['push']` from payloads.

**14. Release-expiry notifications (Domain 3 · G1).** `release-expired-claims` flips status and logs; add notification to the prior claimant (+ optional pool re-notify) that their reservation lapsed.

**15. Scheduled deliveries are email-only (Domain 3 · G6 + G9).** `process-scheduled:68-76` hard-codes `channels:["email"]`; honor the recipient phone when an SMS provider is configured. Declare the 4 crons in `netlify.toml` (currently Vercel-only) or document Netlify as unsupported for scheduled work.

**16. DLQ is audit-only (Domain 3 · recap).** `dead_letter_queue` is written but has no re-drive consumer; add a reader/redelivery pass.

## P3 — hygiene / hardening

**17. Wire or delete the claim flow (Domain 4 · G).** Claim + 1-min release cron are fully coded but unreachable, and checkout ignores claim state. Either connect a "Reserve this lead" action and make checkout require `leads.claimed_by == tradesperson_id`, or remove the claim/cron/`claimed` states from the live path (F3/F5 hinge on this).

**18. Consolidate the triple approval email** (`verify-tradesperson:120-159`) into one audited event; route all sends through `notification_logs`.

**19. Reduce localStorage token exposure (Domain 4 · F10).** Unlock/quote calls read `tradeToken` from `localStorage` as a Bearer header while the same token is in an HttpOnly cookie; move state-changing trade calls to cookie-only once stable.

**20. Dead code removal** (reduces confusion + audit surface): `app/api/trades/register/route.ts.new`, `route-simple.ts`; `lib/verification/spec.ts` / `user-status-machine.ts` (until wired); AI-filename mismatch `lib/deepseek-service.ts` (Gemini keys) — rename or align env names; legacy `stripe_checkout_session_id`/`stripe_payment_intent_id` naming carrying GHL invoice ids + "Charged via Stripe" UI copy (`leads/[id]/page.tsx:258`).

---

## Appendix — cross-domain confirmation

- **Immediate `is_approved:true` on submit** (`jobs/submit:118-120`) means the client dashboard's pending-review rendering is unreachable for those jobs (Domain 1 #8).
- **`certification_verified`/`certification_expires_at` are hand-set only** with no regulator API, yet hard-gate regulated-trade matching (`notify…:138-139`, `round-robin:136-138`) — regulated jobs can get zero matches whenever no admin has flipped the flag (Domain 2 #5).
- **Two prior audit docs' headline claims were re-verified stale/false:** claim route is no longer a 503 stub — it is a live, atomic, correct implementation that is simply **unwired**; the webhook *is* HMAC-hardened (older `AUDIT.md` K6.1 "unauthenticated webhook" is closed) but the **scheme is unverified**, which is the current live-money risk.
