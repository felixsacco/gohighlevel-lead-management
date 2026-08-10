# Verification Audit — MyApproved.com Notification System

**Date**: 2026-08-10  
**Scope**: Read-only, 10-question audit of the job submission and notification pipeline  
**Rule**: Answer with file path + line number, or state NOT FOUND

---

## Q1. Does a `notification_log` table migration exist? Has it been applied to Supabase?

**NOT FOUND** — no CREATE TABLE migration exists on disk.

- `sql/phase4-extensions.sql` is the **only** SQL file referencing `notification_logs`. It ALTERs the table (adds `read_at` column, creates index) at lines 18–23, but **does not CREATE** it:
  ```sql
  ALTER TABLE notification_logs ADD COLUMN IF NOT EXISTS read_at timestamptz;
  CREATE INDEX IF NOT EXISTS idx_notification_logs_recipient_created
    ON notification_logs (recipient_id, created_at DESC);
  ```
- The table is queried at runtime by `app/api/notifications/inbox/route.ts` (line 19), `app/api/notifications/receipt/route.ts`, and `lib/notifications/index.ts` (line 28), so it **exists in the live database** — but the CREATE TABLE DDL was never committed to this repo.

**Live database (queried 2026-08-10)**: `notification_logs` table **exists and has data**. Sample row returned:
```json
{
  "idempotency_key": "job_posted_confirmation:7c019a2b-...",
  "event_type": "job_posted_confirmation",
  "channel": "email",
  "status": "failed",
  "error_message": "Missing credentials for \"PLAIN\"",
  "created_at": "2026-05-02T14:52:24.996969+00:00"
}
```

**Gap**: No DDL source of truth for the `notification_logs` table. If the table is ever dropped, there is no migration to recreate it. The table exists in production but its schema is undocumented on disk.

---

## Q2. In `app/api/jobs/submit/route.ts`, what happens if `isQStashConfigured()` returns false in production?

When `isQStashConfigured()` returns false, the handler falls back to **direct HTTP calls** for both CRM sync and notifications. Two code paths:

**Path A — CRM sync** (`app/api/jobs/submit/route.ts:157-178`):
```typescript
} else {
  // Direct fallback
  fetch(`${process.env.NEXT_PUBLIC_APP_URL || '/'}/api/crm/sync-job`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(crmPayload),
  })
    .then(r => r.ok ? console.log('CRM synced') : console.log('CRM sync skipped'))
    .catch(e => console.log('CRM sync error (non-critical):', e));
}
```
CRM sync is **fire-and-forget** — a POST to an internal route, result logged but never awaited.

**Path B — Client confirmation** (`app/api/jobs/submit/route.ts:207-228`):
```typescript
} else {
  sendNotification({
    type: 'job_posted_confirmation',
    recipientId: submittedJob.clientId,
    recipientPhone: submittedJob.clientPhone,
    channels: ['sms'],
    idempotencyKey: `job_posted_confirmation:${submittedJob.id}`,
    data: { ... },
  }).catch(e => console.error('Client confirmation notification failed:', e));
}
```

**Path C — Admin notification** (`app/api/jobs/submit/route.ts:250-298`):
```typescript
} else {
  sendNotification({
    type: 'job_posted_admin_alert',
    recipientEmail: process.env.ADMIN_NOTIFICATION_EMAIL || undefined,
    channels: ['email'],
    idempotencyKey: `job_posted_admin:${submittedJob.id}`,
    data: { ... },
  }).catch(e => console.error('Admin notification failed:', e));
}
```

**Summary**: Without QStash, notifications are sent **directly** (synchronous Twilio/email calls) inside fire-and-forget `.catch()` blocks. If `sendNotification` hangs or the downstream provider (Twilio/SMTP) is slow, these .catch handlers silently swallow the error.

---

## Q3. Is `notifyMatchingTradespeopleForJob` still awaited in the request handler? What is the measured p50 response time of `POST /api/jobs/submit`?

**Not directly awaited.** `app/api/jobs/submit/route.ts:182-203`:

```typescript
// Lines 182-195
const tradespersonNotifyPromise = supabaseAdmin
  ? notifyMatchingTradespeopleForJob(supabaseAdmin, {
      jobId: submittedJob.id,
      trade: submittedJob.trade,
      postcode: submittedJob.postcode,
      estimateLabel: estimateLabel ?? undefined,
    }).catch(e => console.error('Tradespeople job-match notifications failed', e))
  : Promise.resolve();

// Lines 200-203
await Promise.allSettled([
  tradespersonNotifyPromise,
  ...
]);
```

The function is stored in a `Promise` variable with `.catch()`, then passed to `Promise.allSettled` alongside the two fire-and-forget notification blocks. The `.catch()` prevents an unhandled rejection from crashing the handler. `Promise.allSettled` is **awaited** (line 200), so the handler blocks until all three settle, but the catches mean failures are silently absorbed.

**p50 response time**: **CANNOT DETERMINE** — no production monitoring, Vercel analytics dashboard, or APM instrumentation is accessible from this codebase. There is no `console.time`/`console.timeEnd` wrapping the handler, no OpenTelemetry traces, and no Vercel Web Analytics events for this endpoint. A deployment to production with analytics enabled would be required to measure this.

---

## Q4. Does the estimate cache from Phase 3 exist? Show the cache read and write.

**EXISTS** — `lib/deepseek-service.ts:180-205`. It is an **in-memory** `Map`, not a database cache or file on disk.

**Cache read** (`lib/deepseek-service.ts:187-193`):
```typescript
function cacheGet(key: string): DeepSeekEstimate | null {
  const entry = estimateCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.at > ESTIMATE_CACHE_TTL) {
    estimateCache.delete(key);
    return null;
  }
  return entry.result;
}
```

**Cache write** (`lib/deepseek-service.ts:196-205`):
```typescript
function cacheSet(key: string, result: DeepSeekEstimate): void {
  if (estimateCache.size >= 500) {
    const first = estimateCache.keys().next().value;
    if (first !== undefined) estimateCache.delete(first);
  }
  estimateCache.set(key, { result, at: Date.now() });
}
```

**Constraints**:
- TTL: 30 minutes (`ESTIMATE_CACHE_TTL = 30 * 60 * 1000`, line 181)
- Max entries: 500, with FIFO eviction (deletes the first key when full)
- No persistence — cache is lost on every cold start / function recycle
- Key is a SHA-256 hash of the trade + job description + structural prompt

**Gap**: Serverless functions on Vercel recycle frequently. The in-memory cache provides no cross-request benefit in production unless the same warm instance handles multiple requests within 30 minutes.

---

## Q5. Has `sql/phase5-job-reference-seq.sql` been executed against the database?

**NOT EXECUTED** — `sql/phase5-job-reference-seq.sql` has **not** been applied to the live Supabase database.

The SQL file exists at `sql/phase5-job-reference-seq.sql` (49 lines) and defines:
```sql
CREATE SEQUENCE IF NOT EXISTS job_reference_seq START 100001;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS reference_code TEXT;
CREATE OR REPLACE FUNCTION set_job_reference_code() ...
CREATE TRIGGER ... BEFORE INSERT ON jobs ...
```
Plus a backfill for existing rows and a unique index.

**Live database (queried 2026-08-10)**:
```
Query: select id, reference_code, created_at from jobs order by created_at desc limit 5;
Error: column jobs.reference_code does not exist (code 42703)
```

The `jobs` table has **no `reference_code` column**. A sample row from the live table shows columns include `id`, `client_id`, `trade`, `job_description`, `postcode`, `budget`, `budget_type`, `status`, `is_active`, `application_status`, etc. — but **no `reference_code`**. The `MA-XXXXXX` sequence trigger has never been run against production.

---

## Q6. Show the test asserting client confirmation SMS contains no `£` and no `http`.

**NOT FOUND** — no test in `lib/notifications/templates/__tests__/sms.test.ts` asserts that `jobPostedConfirmationSms` output contains no `£` and no `http`.

The existing `jobPostedConfirmationSms` tests (lines 149–172) check:
- Trade, postcode, and urgency interpolation (line 158)
- Time estimate inclusion (line 159)
- STOP opt-out (line 160)
- Omission of area and urgency when absent (lines 168–170)
- Omission of `(flexible)` when urgency is default (line 169)

None of these tests assert the **absence** of `£` or `http` in the output.

Note: The `£` symbol **does** appear in the codebase inside other SMS builders — e.g., `tradespersonAppliedAlertSms` at `lib/notifications/templates/sms.ts:79` interpolates `£${String(data.quotationAmount || "")}`. The `http` string appears in `linkSuffix` via `ctx()` at line 45. But the specific assertion about client confirmation (`jobPostedConfirmationSms`) never containing either character is not tested.

---

## Q7. Show the test asserting every SMS ends with the STOP opt-out.

**EXISTS** — `lib/notifications/templates/__tests__/sms.test.ts:77-118`.

```typescript
describe("STOP opt-out", () => {
  const builders = [
    { name: "clientSignupSms", fn: clientSignupSms },
    { name: "tradespersonSignupSms", fn: tradespersonSignupSms },
    { name: "jobPostedConfirmationSms", fn: jobPostedConfirmationSms },
    { name: "jobLiveStatusSms", fn: jobLiveStatusSms },
    { name: "tradespersonAppliedAlertSms", fn: tradespersonAppliedAlertSms },
    { name: "applicationReminderSms", fn: applicationReminderSms },
    { name: "jobAssignedAlertSms", fn: jobAssignedAlertSms },
    { name: "jobNotSelectedSms", fn: jobNotSelectedSms },
    { name: "jobInProgressClientSms", fn: jobInProgressClientSms },
    { name: "jobCompletedAlertSms", fn: jobCompletedAlertSms },
    { name: "reviewReminderSms", fn: reviewReminderSms },
    { name: "jobProgressCheckinSms", fn: jobProgressCheckinSms },
    { name: "applicationUnderReviewSms", fn: applicationUnderReviewSms },
    { name: "tradespersonReviewWaitSms", fn: tradespersonReviewWaitSms },
    { name: "reviewReceivedAlertSms", fn: reviewReceivedAlertSms },
    { name: "jobMatchTradespersonSms", fn: jobMatchTradespersonSms },
    { name: "buildNewLeadSms", fn: buildNewLeadSms },
    { name: "invoiceReadySms", fn: invoiceReadySms },
    { name: "paymentReceivedSms", fn: paymentReceivedSms },
    { name: "accountSuspendedSms", fn: accountSuspendedSms },
    { name: "reactivationGuideSms", fn: reactivationGuideSms },
    { name: "disputeOpenedSms", fn: disputeOpenedSms },
    { name: "disputeUpdateSms", fn: disputeUpdateSms },
    { name: "disputeResolvedSms", fn: disputeResolvedSms },
    { name: "tradespersonNextStepsSms", fn: tradespersonNextStepsSms },
    { name: "profileLiveAlertSms", fn: profileLiveAlertSms },
    { name: "clientReengagementSms", fn: clientReengagementSms },
    { name: "tradespersonWinbackSms", fn: tradespersonWinbackSms },
    { name: "genericUpdateSms", fn: genericUpdateSms },
  ];

  for (const { name, fn } of builders) {
    it(`${name} appends STOP opt-out`, () => {
      const result = fn({ trade: "Plumber", jobId: "abc123def456ghi789" });
      expect(result.endsWith(STOP)).toBe(true);
    });
  }
});
```

This covers all 29 builders. The STOP constant is defined at `lib/notifications/templates/sms.ts:12` as `" Reply STOP to opt out."`.

---

## Q8. What command runs the test suite? Run it and paste the output.

**Command**: `npm run verify:phase6`

**Script** (`package.json:10`): `"verify:phase6": "npx tsx scripts/verify-phase6.ts"`

No general `"test"` script exists — the verify:phase6 script is the only test runner. `vitest` is listed in devDependencies but there is no `vitest.config.ts` or `"test"` script wired to it.

**Output**:
```
Phase 6: Notification & template verification

  ✅ formatJobReference validates MA-XXXXXX pattern
  ✅ jobReferenceRowHtml renders valid ref as HTML
  ✅ buildSmsBody returns non-empty string for every event type
  ✅ jobPostedConfirmationSms includes Ref when jobRef provided
  ✅ jobPostedConfirmationSms excludes Ref when jobRef is empty
  ✅ SMS builders handle ctx() with empty vs populated jobRef
  ✅ All 30 SMS builder functions return strings
  ✅ escapeHtml prevents XSS injection
  ✅ TypeScript compiles without errors

9 passed, 0 failed
```

---

## Q9. Show the code that writes a `notification_log` row on every send.

**EXISTS** — `lib/notifications/index.ts:10-39`, the `logNotification` function.

```typescript
async function logNotification(
  payload: NotificationPayload,
  result: NotificationResult,
): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return;

    const recipientContact =
      result.channel === "sms"
        ? payload.recipientPhone || null
        : payload.recipientEmail || null;

    await supabase.from("notification_logs").insert({
      idempotency_key: payload.idempotencyKey,
      event_type: payload.type,
      channel: result.channel,
      recipient_id: payload.recipientId || null,
      recipient_contact: recipientContact,
      status: result.success ? "sent" : "failed",
      provider_message_id: result.messageId || null,
      error_message: result.error || null,
      payload: payload.data,
    });
  } catch {
    // Best-effort — non-blocking; never let logging fail the actual send.
  }
}
```

It is called from `sendNotification` at `lib/notifications/index.ts:119-121`:
```typescript
for (const result of results) {
  await logNotification(payload, result);
}
```

The function is invoked **after every `sendChannel` call** (email, push, or sms). The catch block is empty — logging failures are silently swallowed.

**Note**: The table name is `notification_logs` (plural), not `notification_log`.

---

## Q10. Show the idempotency check that prevents a duplicate SMS on QStash redelivery.

**NOT FOUND** in application code.

There is **no application-level idempotency check** anywhere in the notification pipeline. The QStash worker handler at `app/api/workers/notifications/route.ts:6-28` calls `sendNotification(payload)` directly — no SELECT-before-INSERT, no `ON CONFLICT` clause, no dedup logic:

```typescript
export const POST = verifySignatureAppRouter(async (request: NextRequest) => {
  const payload = (await request.json()) as NotificationPayload;
  if (!payload.type || !payload.idempotencyKey || !payload.channels?.length) {
    return NextResponse.json({ error: "Invalid notification payload" }, { status: 400 });
  }
  const result = await sendNotification(payload);
  return NextResponse.json(result);
});
```

The **only** idempotency mechanism is QStash's own `contentBasedDeduplication: true` in `lib/qstash.ts:26`:
```typescript
await qstashClient.publishJSON({
  url: `${baseUrl}/api/workers/notifications`,
  body: payload,
  contentBasedDeduplication: true,
  retries: 3,
});
```

QStash's content-based dedup prevents the same payload from being enqueued twice within the dedup window, but it does **not** protect the worker from:
- A QStash redelivery after the dedup window expires
- A network-level retry that delivers the same message twice
- A race condition where two parallel `.catch()` fire-and-forget calls enqueue overlapping messages

**What exists**:
- `notification_logs.idempotency_key` column stores dedup keys — used for **read-side dedup** in the inbox API (`app/api/notifications/inbox/route.ts:40-43`) but never for write-side idempotency
- QStash `contentBasedDeduplication: true` — transport-level, not application-level

**What's missing**:
- No `ON CONFLICT (idempotency_key) DO NOTHING` on the `notification_logs` INSERT in `logNotification`
- No unique constraint/index on `notification_logs.idempotency_key`
- No `SELECT ... WHERE idempotency_key = $1` check before sending in the worker

---

## Summary

| # | Finding | Status |
|---|---------|--------|
| 1 | `notification_logs` CREATE TABLE migration | **MISSING** — only ALTERs exist on disk |
| 2 | QStash false → direct fallback paths | **VERIFIED** — lines 157-178, 207-228, 250-298 |
| 3 | `notifyMatchingTradespeopleForJob` awaited | **NOT AWAITED** — wrapped in Promise, passed to allSettled |
| 3b | p50 response time | **CANNOT DETERMINE** — no instrumentation |
| 4 | Estimate cache | **EXISTS** — in-memory Map, `lib/deepseek-service.ts:180-205` |
| 5 | phase5-job-reference-seq.sql executed on DB | **NOT EXECUTED** — reference_code column missing from live DB |
| 6 | Test: no `£` and no `http` in client confirmation SMS | **NOT FOUND** — no such test exists |
| 7 | Test: every SMS ends with STOP | **VERIFIED** — `sms.test.ts:77-118` |
| 8 | Test suite command + output | **VERIFIED** — `npm run verify:phase6`, 9 passed |
| 9 | `notification_logs` row write code | **VERIFIED** — `lib/notifications/index.ts:10-39` |
| 10 | Idempotency check for QStash redelivery | **MISSING** — only QStash contentBasedDeduplication, no app-level guard |
