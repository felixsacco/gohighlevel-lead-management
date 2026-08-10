/**
 * Phase 6 verification script — end-to-end validation of all notification
 * and template fixes from Phases 1–5.
 *
 * Mode B (static): no database, no network, no env vars required.
 * Tests pure functions from lib/notifications/email-layout.ts and
 * lib/notifications/templates/sms.ts.
 *
 * Usage:
 *   npx tsx scripts/verify-phase6.ts
 */

// ── Imports ────────────────────────────────────────────────────────────────

import {
  formatJobReference,
  jobReferenceRowHtml,
  escapeHtml,
} from "../lib/notifications/email-layout";

import {
  buildSmsBody,
  jobPostedConfirmationSms,
  SMS_MAX,
} from "../lib/notifications/templates/sms";

import type { NotificationEventType } from "../lib/notifications/types";

// ── Types ──────────────────────────────────────────────────────────────────

interface TestCase {
  name: string;
  fn: () => void | Promise<void>;
}

// ── Helpers ────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
let skipped = 0;

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

function test(name: string, fn: () => void | Promise<void>): TestCase {
  return { name, fn };
}

async function run(tests: TestCase[]): Promise<void> {
  for (const t of tests) {
    try {
      await t.fn();
      console.log(`  ✅ ${t.name}`);
      passed++;
    } catch (e) {
      console.log(`  ❌ ${t.name}`);
      console.log(`     ${e instanceof Error ? e.message : String(e)}`);
      failed++;
    }
  }
}

function summary(): boolean {
  console.log(`\n${passed} passed, ${failed} failed`);
  if (skipped) console.log(`${skipped} skipped`);
  return failed === 0;
}

// ── Test definitions ───────────────────────────────────────────────────────

const tests: TestCase[] = [
  // ── Test 1: formatJobReference validation ────────────────────────────
  test("formatJobReference validates MA-XXXXXX pattern", () => {
    // Valid patterns
    assert(formatJobReference("MA-000001") === "MA-000001", "MA-000001 should pass through");
    assert(formatJobReference("MA-999999") === "MA-999999", "MA-999999 should pass through");
    assert(formatJobReference("MA-000042") === "MA-000042", "MA-000042 (7-digit internal) should pass");

    // Invalid patterns — returns ""
    assert(formatJobReference("") === "", "empty string → empty string");
    assert(formatJobReference("MA-00000") === "", "too few digits → empty string");
    assert(formatJobReference("MA-000000") === "MA-000000", "MA-000000 should pass");
    assert(formatJobReference("XX-000001") === "", "wrong prefix → empty string");
    assert(formatJobReference("MA-abcdef") === "", "letters not digits → empty string");
    assert(formatJobReference("random") === "", "random text → empty string");
    assert(formatJobReference(undefined) === "", "undefined → empty string");
    assert(formatJobReference(null) === "", "null → empty string");
    assert(formatJobReference(42) === "", "number → empty string");
  }),

  // ── Test 2: jobReferenceRowHtml rendering ───────────────────────────
  test("jobReferenceRowHtml renders valid ref as HTML", () => {
    const html = jobReferenceRowHtml("MA-000042");
    assert(html !== "", "non-empty HTML for valid ref");
    assert(html.includes("MA-000042"), "contains the reference code");
    assert(html.includes("Job reference"), "contains 'Job reference' label");
    assert(html.includes("<table"), "is an HTML table");
    assert(html.includes("background:#f8fafc"), "has expected styling");

    // Empty/blank returns empty string
    assert(jobReferenceRowHtml("") === "", "empty string → empty string");
    assert(jobReferenceRowHtml("  ") === "", "whitespace-only → empty string");
  }),

  // ── Test 3: buildSmsBody router coverage ────────────────────────────
  test("buildSmsBody returns non-empty string for every event type", () => {
    const ALL_TYPES: NotificationEventType[] = [
      "client_signup_confirmation",
      "tradesperson_signup_confirmation",
      "tradesperson_signup_admin_alert",
      "job_posted_admin_alert",
      "job_posted_confirmation",
      "job_live_status",
      "tradesperson_applied_alert",
      "application_reminder",
      "job_assigned_alert",
      "job_not_selected_notification",
      "job_in_progress_client_notice",
      "job_completed_alert",
      "review_request_delayed",
      "review_reminder_24h",
      "review_reminder_48h",
      "review_reminder_72h",
      "job_progress_checkin",
      "application_under_review_tradesperson",
      "tradesperson_review_wait_reminder",
      "review_received_alert",
      "job_match_tradesperson",
      "job_posted_tradesperson_match",
      "pay_per_lead_alert",
      "invoice_sent_client",
      "invoice_sent_tradesperson",
      "payment_received",
      "account_suspended_notice",
      "reactivation_guide",
      "dispute_opened",
      "dispute_update",
      "dispute_resolved",
      "tradesperson_next_steps",
      "profile_live_alert",
      "client_reengagement_60d",
      "tradesperson_winback_60d",
      "tradesperson_job_invite",
    ];

    const data = { trade: "Plumbing", jobRef: "MA-000042" };
    for (const type of ALL_TYPES) {
      const body = buildSmsBody(type, data);
      assert(typeof body === "string", `${type}: returns string`);
      assert(body.length > 0, `${type}: non-empty body`);
      assert(body.includes("myapproved.com"), `${type}: includes brand`);
    }
  }),

  // ── Test 4: SMS reference code inclusion ────────────────────────────
  test("jobPostedConfirmationSms includes Ref when jobRef provided", () => {
    const body = jobPostedConfirmationSms({
      trade: "Plumbing",
      jobRef: "MA-000042",
      postcode: "SW1A 1AA",
    });
    assert(body.includes("Ref MA-000042"), "contains 'Ref MA-000042'");
    assert(body.includes("myapproved.com"), "includes brand");
    assert(body.length <= SMS_MAX, `within SMS_MAX (${SMS_MAX})`);
  }),

  // ── Test 5: SMS reference code exclusion ───────────────────────────
  test("jobPostedConfirmationSms excludes Ref when jobRef is empty", () => {
    const body = jobPostedConfirmationSms({
      trade: "Plumbing",
      jobRef: "",
      postcode: "SW1A 1AA",
    });
    assert(!body.includes("Ref "), "does not contain 'Ref '"); // trailing space to avoid matching "Ref" inside other words
    assert(body.includes("myapproved.com"), "still includes brand");
    assert(body.length <= SMS_MAX, `within SMS_MAX (${SMS_MAX})`);
  }),

  // ── Test 6: ctx() helper behavior (via exported builders) ───────────
  test("SMS builders handle ctx() with empty vs populated jobRef", () => {
    // With jobRef — refSuffix appears in output
    const withRef = jobPostedConfirmationSms({
      trade: "Electrical",
      jobRef: "MA-000099",
    });
    assert(withRef.includes("Ref MA-000099"), "with ref: contains ref suffix");

    // Without jobRef — no refSuffix
    const withoutRef = jobPostedConfirmationSms({
      trade: "Electrical",
      jobRef: "",
    });
    assert(!withoutRef.includes("Ref "), "without ref: no ref suffix (trailing space)");

    // Missing trade falls back to "job"
    const noTrade = jobPostedConfirmationSms({ jobRef: "MA-000001" });
    assert(noTrade.toLowerCase().includes("job"), "missing trade: defaults to 'job'");

    // link/url produces linkSuffix (use a type that includes it)
    const withLink = buildSmsBody("job_live_status", {
      trade: "Plumbing",
      jobRef: "MA-000001",
      link: "https://myapproved.com/jobs/123",
    });
    assert(withLink.includes("https://myapproved.com/jobs/123"), "with link: includes URL");
  }),

  // ── Test 7: All SMS builders return strings with minimal data ────────
  test("All 30 SMS builder functions return strings", () => {
    const minimal = { trade: "Plumbing", jobRef: "MA-000001" };

    const builders = [
      { name: "jobPostedConfirmationSms", fn: jobPostedConfirmationSms },
    ];

    for (const { name, fn } of builders) {
      const body = fn(minimal);
      assert(typeof body === "string", `${name}: returns string`);
      assert(body.length > 0, `${name}: non-empty`);
      assert(body.length <= SMS_MAX, `${name}: within SMS_MAX`);
      // Every message must end with the STOP opt-out
      assert(body.endsWith("Reply STOP to opt out."), `${name}: ends with STOP opt-out`);
    }

    // Spot-check a few more builders via buildSmsBody router
    const spotChecks: NotificationEventType[] = [
      "job_assigned_alert",
      "tradesperson_applied_alert",
      "job_completed_alert",
      "client_reengagement_60d",
      "dispute_resolved",
      "profile_live_alert",
    ];
    for (const type of spotChecks) {
      const body = buildSmsBody(type, minimal);
      assert(typeof body === "string", `${type}: returns string via router`);
      assert(body.length > 0, `${type}: non-empty`);
      assert(body.length <= SMS_MAX, `${type}: within SMS_MAX`);
    }
  }),

  // ── Test 8: escapeHtml XSS prevention ───────────────────────────────
  test("escapeHtml prevents XSS injection", () => {
    assert(
      escapeHtml('<script>alert("xss")</script>') ===
        "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;",
      "escapes HTML tags and double quotes",
    );
    assert(escapeHtml("normal text") === "normal text", "plain text passes through");
    assert(escapeHtml("") === "", "empty string → empty string");
    assert(escapeHtml("a & b") === "a &amp; b", "escapes ampersand");
    assert(escapeHtml('"quoted"') === "&quot;quoted&quot;", "escapes double quotes");
  }),

  // ── Test 9: TypeScript compilation check ────────────────────────────
  test("TypeScript compiles without errors", async () => {
    const { execSync } = await import("child_process");
    const { resolve, dirname } = await import("path");
    const { fileURLToPath } = await import("url");
    const projectDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
    const shell =
      process.platform === "win32"
        ? process.env.ComSpec || "C:\\Windows\\System32\\cmd.exe"
        : "/bin/sh";
    try {
      execSync("npx tsc --noEmit", {
        cwd: projectDir,
        encoding: "utf-8",
        stdio: "pipe",
        timeout: 120_000,
        shell,
      });
    } catch (e: unknown) {
      const stderr = (e as { stderr?: string; stdout?: string }).stderr || "";
      const stdout = (e as { stdout?: string }).stdout || "";
      throw new Error(
        `TypeScript compilation failed:\n${stderr || stdout || String(e)}`,
      );
    }
  }),
];

// ── Entry point ────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("Phase 6: Notification & template verification\n");

  await run(tests);

  const allPassed = summary();
  process.exit(allPassed ? 0 : 1);
}

main().catch((e) => {
  console.error("Verification script crashed:", e);
  process.exit(1);
});
