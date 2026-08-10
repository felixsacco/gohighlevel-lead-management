import { describe, it, expect } from "vitest";
import {
  truncate,
  SMS_MAX,
  clientSignupSms,
  tradespersonSignupSms,
  jobPostedConfirmationSms,
  jobLiveStatusSms,
  tradespersonAppliedAlertSms,
  applicationReminderSms,
  jobAssignedAlertSms,
  jobNotSelectedSms,
  jobInProgressClientSms,
  jobCompletedAlertSms,
  reviewReminderSms,
  jobProgressCheckinSms,
  applicationUnderReviewSms,
  tradespersonReviewWaitSms,
  reviewReceivedAlertSms,
  jobMatchTradespersonSms,
  buildNewLeadSms,
  invoiceReadySms,
  paymentReceivedSms,
  accountSuspendedSms,
  reactivationGuideSms,
  disputeOpenedSms,
  disputeUpdateSms,
  disputeResolvedSms,
  tradespersonNextStepsSms,
  profileLiveAlertSms,
  clientReengagementSms,
  tradespersonWinbackSms,
  genericUpdateSms,
  buildSmsBody,
} from "../sms";

const STOP = " Reply STOP to opt out.";
const BRAND = "myapproved.com";

// ── truncate ─────────────────────────────────────────────────────────────

describe("truncate", () => {
  it("returns string as-is when under max", () => {
    expect(truncate("short message", 100)).toBe("short message");
  });

  it("truncates on word boundary near 75% of max", () => {
    const input = "Hello world this is a test of the truncation system for messages";
    const result = truncate(input, 30);
    expect(result.length).toBeLessThanOrEqual(30);
    expect(result.endsWith("…")).toBe(true);
    // "Hello world this is a test" = 27 chars + "…" = 28 → fits in word-boundary cut
    expect(result).not.toContain("truncation");
  });

  it("hard-cuts when no space in the last 25%", () => {
    const longWord = "A".repeat(100);
    const input = `${longWord} no break`;
    const result = truncate(input, 80);
    expect(result.length).toBeLessThanOrEqual(80);
    expect(result.endsWith("…")).toBe(true);
  });

  it("preserves URLs at boundary", () => {
    const input = "Check this https://example.com/long/path/here for details";
    const result = truncate(input, 30);
    expect(result.length).toBeLessThanOrEqual(30);
    expect(result.endsWith("…")).toBe(true);
  });

  it("returns trimmed empty string for whitespace input", () => {
    const result = truncate("   ", 10);
    expect(result).toBe("");
  });
});

// ── STOP opt-out requirement ─────────────────────────────────────────────

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

// ── Per-template tests ───────────────────────────────────────────────────

describe("clientSignupSms", () => {
  it("produces expected output", () => {
    const result = clientSignupSms({});
    expect(result).toContain(`${BRAND}: your account is ready`);
    expect(result).toContain("Post your first job");
    expect(result.endsWith(STOP)).toBe(true);
  });

  it("is deterministic", () => {
    expect(clientSignupSms({})).toBe(clientSignupSms({}));
  });
});

describe("tradespersonSignupSms", () => {
  it("interpolates trade", () => {
    const result = tradespersonSignupSms({ trade: "Electrician" });
    expect(result).toContain("Electrician");
    expect(result).toContain("registration received");
    expect(result.endsWith(STOP)).toBe(true);
  });

  it("fallback when trade missing", () => {
    const result = tradespersonSignupSms({});
    expect(result).toContain("job");
  });
});

describe("jobPostedConfirmationSms", () => {
  it("interpolates trade, postcode, urgency", () => {
    const result = jobPostedConfirmationSms({
      trade: "Plumber",
      postcode: "SW1A 1AA",
      urgency: "emergency",
      jobId: "abc123def456ghi789",
      timeEstimate: "1-2 hours",
    });
    expect(result.startsWith(`${BRAND}: Your Plumber job (emergency) has been posted in SW1A 1AA.`)).toBe(true);
    expect(result).toContain("within 1-2 hours");
    expect(result.endsWith(STOP)).toBe(true);
  });

  it("omits area and urgency when absent", () => {
    const result = jobPostedConfirmationSms({
      trade: "Gardener",
      jobId: "abc123def456ghi789",
    });
    expect(result).toContain("Gardener");
    expect(result).not.toContain("(flexible)");
    expect(result).not.toContain(" in ");
  });
});

describe("jobLiveStatusSms", () => {
  it("interpolates trade and link", () => {
    const result = jobLiveStatusSms({
      trade: "Roofer",
      jobId: "abc123def456ghi789",
      link: "https://myapproved.com/jobs/123",
    });
    expect(result).toContain("Roofer job is now live");
    expect(result).toContain("https://myapproved.com/jobs/123");
    expect(result.endsWith(STOP)).toBe(true);
  });
});

describe("tradespersonAppliedAlertSms", () => {
  it("interpolates name and quote", () => {
    const result = tradespersonAppliedAlertSms({
      trade: "Carpenter",
      jobId: "abc123def456ghi789",
      tradespersonName: "John Smith",
      quotationAmount: "350",
    });
    expect(result).toContain("John Smith quoted £350");
    expect(result).toContain("Carpenter job");
    expect(result.endsWith(STOP)).toBe(true);
  });

  it("falls back with no name", () => {
    const result = tradespersonAppliedAlertSms({
      trade: "Carpenter",
      jobId: "abc123def456ghi789",
      quotationAmount: "200",
    });
    expect(result).toContain("A tradesperson quoted £200");
  });
});

describe("applicationReminderSms", () => {
  it("includes reminder text and link", () => {
    const result = applicationReminderSms({
      trade: "Plumber",
      jobId: "abc123def456ghi789",
      link: "https://myapproved.com/quotes",
    });
    expect(result).toContain("quotes are waiting");
    expect(result).toContain("choose a tradesperson");
    expect(result).toContain("https://myapproved.com/quotes");
    expect(result.endsWith(STOP)).toBe(true);
  });
});

describe("jobAssignedAlertSms", () => {
  it("includes trade, client name, and link", () => {
    const result = jobAssignedAlertSms({
      trade: "Plumber",
      jobId: "abc123def456ghi789",
      clientName: "Alice",
      link: "https://myapproved.com/jobs/123",
    });
    expect(result).toContain("assigned!");
    expect(result).toContain("Plumber job");
    expect(result).toContain("Customer: Alice");
    expect(result.endsWith(STOP)).toBe(true);
  });
});

describe("jobNotSelectedSms", () => {
  it("mentions someone else was chosen", () => {
    const result = jobNotSelectedSms({
      trade: "Electrician",
      jobId: "abc123def456ghi789",
    });
    expect(result).toContain("another tradesperson was chosen");
    expect(result).toContain("Electrician job");
    expect(result.endsWith(STOP)).toBe(true);
  });
});

describe("jobInProgressClientSms", () => {
  it("interpolates tradesperson name", () => {
    const result = jobInProgressClientSms({
      trade: "Plasterer",
      jobId: "abc123def456ghi789",
      tradespersonName: "Bob the Builder",
    });
    expect(result).toContain("in progress with Bob the Builder");
    expect(result.endsWith(STOP)).toBe(true);
  });

  it("falls back when name missing", () => {
    const result = jobInProgressClientSms({
      trade: "Plasterer",
      jobId: "abc123def456ghi789",
    });
    expect(result).toContain("in progress with your tradesperson");
  });
});

describe("jobCompletedAlertSms", () => {
  it("asks for review", () => {
    const result = jobCompletedAlertSms({
      trade: "Builder",
      jobId: "abc123def456ghi789",
      link: "https://myapproved.com/review",
    });
    expect(result).toContain("marked complete");
    expect(result).toContain("leave a quick review");
    expect(result.endsWith(STOP)).toBe(true);
  });
});

describe("reviewReminderSms", () => {
  it("asks how the job went", () => {
    const result = reviewReminderSms({
      trade: "Cleaner",
      jobId: "abc123def456ghi789",
      link: "https://myapproved.com/review",
    });
    expect(result).toContain("how did your Cleaner job go");
    expect(result).toContain("Leave a quick review");
    expect(result.endsWith(STOP)).toBe(true);
  });
});

describe("jobProgressCheckinSms", () => {
  it("interpolates hours label", () => {
    const result = jobProgressCheckinSms({
      trade: "Painter",
      jobId: "abc123def456ghi789",
      hoursLabel: "4 hours into the job",
      link: "https://myapproved.com/checkin",
    });
    expect(result).toContain("progress check-in");
    expect(result).toContain("4 hours into the job");
    expect(result.endsWith(STOP)).toBe(true);
  });
});

describe("applicationUnderReviewSms", () => {
  it("mentions under review status", () => {
    const result = applicationUnderReviewSms({
      trade: "Tiler",
      jobId: "abc123def456ghi789",
    });
    expect(result).toContain("still under review");
    expect(result).toContain("update you when decided");
    expect(result.endsWith(STOP)).toBe(true);
  });
});

describe("tradespersonReviewWaitSms", () => {
  it("mentions review pending", () => {
    const result = tradespersonReviewWaitSms({
      trade: "Carpenter",
      jobId: "abc123def456ghi789",
    });
    expect(result).toContain("review pending");
    expect(result).toContain("Keep your profile updated");
    expect(result.endsWith(STOP)).toBe(true);
  });
});

describe("reviewReceivedAlertSms", () => {
  it("interpolates rating stars", () => {
    const result = reviewReceivedAlertSms({
      trade: "Handyman",
      jobId: "abc123def456ghi789",
      rating: "4.5",
    });
    expect(result).toContain("4.5/5 stars");
    expect(result).toContain("new review received");
    expect(result.endsWith(STOP)).toBe(true);
  });
});

describe("jobMatchTradespersonSms", () => {
  it("matches tradesperson to job", () => {
    const result = jobMatchTradespersonSms({
      trade: "Electrician",
      jobId: "abc123def456ghi789",
      link: "https://myapproved.com/apply",
    });
    expect(result).toContain("new Electrician job near you");
    expect(result).toContain("Apply now");
    expect(result.endsWith(STOP)).toBe(true);
  });
});

describe("buildNewLeadSms", () => {
  it("renders full lead details", () => {
    const result = buildNewLeadSms({
      trade: "Plumber",
      jobId: "abc123def456ghi789",
      postcode: "M1 1AA",
      job_description: "Leaky tap in kitchen, needs fixing ASAP",
      budgetLabel: "£100-£200",
      leadCostLabel: "£4.99",
      maskedPhone: "07XXX XXX123",
      unlockUrl: "https://myapproved.com/unlock/1",
    });
    expect(result).toContain("new Plumber lead in M1 1AA");
    expect(result).toContain("Leaky tap in kitchen");
    expect(result).toContain("£100-£200");
    expect(result).toContain("£4.99");
    expect(result).toContain("07XXX XXX123");
    expect(result).toContain("https://myapproved.com/unlock/1");
    expect(result.endsWith(STOP)).toBe(true);
  });

  it("omits optional fields gracefully", () => {
    const result = buildNewLeadSms({
      trade: "Plumber",
      jobId: "abc123def456ghi789",
      postcode: "M1 1AA",
      leadCostLabel: "£4.99",
    });
    expect(result).toContain("new Plumber lead in M1 1AA");
    expect(result).not.toContain("Job:");
    expect(result).not.toContain("Estimate:");
    expect(result).not.toContain("Customer:");
    expect(result).not.toContain("Unlock:");
    expect(result.endsWith(STOP)).toBe(true);
  });
});

describe("invoiceReadySms", () => {
  it("includes invoice number", () => {
    const result = invoiceReadySms({
      trade: "Builder",
      jobId: "abc123def456ghi789",
      invoiceNumber: "INV-001",
      link: "https://myapproved.com/invoice/1",
    });
    expect(result).toContain("invoice INV-001 is ready");
    expect(result.endsWith(STOP)).toBe(true);
  });
});

describe("paymentReceivedSms", () => {
  it("confirms payment", () => {
    const result = paymentReceivedSms({
      trade: "Roofer",
      jobId: "abc123def456ghi789",
      link: "https://myapproved.com/receipt",
    });
    expect(result).toContain("payment recorded");
    expect(result).toContain("Roofer job");
    expect(result).toContain("Receipt available");
    expect(result.endsWith(STOP)).toBe(true);
  });
});

describe("accountSuspendedSms", () => {
  it("includes reason when provided", () => {
    const result = accountSuspendedSms({
      reason: "payment failure",
    });
    expect(result).toContain("temporarily suspended");
    expect(result).toContain("Reason: payment failure");
    expect(result.endsWith(STOP)).toBe(true);
  });

  it("omits reason when not provided", () => {
    const result = accountSuspendedSms({});
    expect(result).toContain("temporarily suspended");
    expect(result).not.toContain("Reason:");
  });
});

describe("reactivationGuideSms", () => {
  it("references email for steps", () => {
    const result = reactivationGuideSms({});
    expect(result).toContain("reactivation steps");
    expect(result).toContain("email");
    expect(result.endsWith(STOP)).toBe(true);
  });
});

describe("disputeOpenedSms", () => {
  it("includes ticket ID when provided", () => {
    const result = disputeOpenedSms({ ticketId: "TK-12345" });
    expect(result).toContain("Ticket TK-12345");
    expect(result).toContain("dispute ticket opened");
    expect(result.endsWith(STOP)).toBe(true);
  });

  it("omits ticket when absent", () => {
    const result = disputeOpenedSms({});
    expect(result).not.toContain("Ticket");
    expect(result.endsWith(STOP)).toBe(true);
  });
});

describe("disputeUpdateSms", () => {
  it("includes status", () => {
    const result = disputeUpdateSms({ status: "in review" });
    expect(result).toContain("Status: in review");
    expect(result.endsWith(STOP)).toBe(true);
  });
});

describe("disputeResolvedSms", () => {
  it("confirms resolution", () => {
    const result = disputeResolvedSms({});
    expect(result).toContain("resolved");
    expect(result.endsWith(STOP)).toBe(true);
  });
});

describe("tradespersonNextStepsSms", () => {
  it("mentions profile and alerts", () => {
    const result = tradespersonNextStepsSms({
      trade: "Electrician",
      jobId: "abc123def456ghi789",
      link: "https://myapproved.com/profile",
    });
    expect(result).toContain("you are approved");
    expect(result).toContain("Complete your profile");
    expect(result).toContain("job alerts");
    expect(result.endsWith(STOP)).toBe(true);
  });
});

describe("profileLiveAlertSms", () => {
  it("confirms profile is live", () => {
    const result = profileLiveAlertSms({});
    expect(result).toContain("profile is now live");
    expect(result).toContain("discoverable");
    expect(result.endsWith(STOP)).toBe(true);
  });
});

describe("clientReengagementSms", () => {
  it("entices client to post again", () => {
    const result = clientReengagementSms({
      trade: "Plumber",
      jobId: "abc123def456ghi789",
      link: "https://myapproved.com/post",
    });
    expect(result).toContain("need another Plumber job");
    expect(result).toContain("Post in minutes");
    expect(result.endsWith(STOP)).toBe(true);
  });
});

describe("tradespersonWinbackSms", () => {
  it("mentions new jobs available", () => {
    const result = tradespersonWinbackSms({
      trade: "Gardener",
      jobId: "abc123def456ghi789",
      link: "https://myapproved.com/jobs",
    });
    expect(result).toContain("new Gardener jobs are available");
    expect(result).toContain("Check and apply");
    expect(result.endsWith(STOP)).toBe(true);
  });
});

describe("genericUpdateSms", () => {
  it("provides generic update with trade", () => {
    const result = genericUpdateSms({
      trade: "Handyman",
      jobId: "abc123def456ghi789",
    });
    expect(result).toContain("update available");
    expect(result.endsWith(STOP)).toBe(true);
  });
});

// ── buildSmsBody router ──────────────────────────────────────────────────

describe("buildSmsBody", () => {
  it("routes to the correct builder by event type", () => {
    const result = buildSmsBody("client_signup_confirmation", {});
    expect(result).toBe(clientSignupSms({}));
  });

  it("routes review_reminder_24h to reviewReminderSms", () => {
    const data = { trade: "Plumber", jobId: "abc123def456ghi789" };
    expect(buildSmsBody("review_reminder_24h", data)).toBe(reviewReminderSms(data));
  });

  it("routes review_reminder_48h to reviewReminderSms", () => {
    const data = { trade: "Plumber", jobId: "abc123def456ghi789" };
    expect(buildSmsBody("review_reminder_48h", data)).toBe(reviewReminderSms(data));
  });

  it("routes review_reminder_72h to reviewReminderSms", () => {
    const data = { trade: "Plumber", jobId: "abc123def456ghi789" };
    expect(buildSmsBody("review_reminder_72h", data)).toBe(reviewReminderSms(data));
  });

  it("falls back to genericUpdateSms for unknown types", () => {
    const result = buildSmsBody("tradesperson_job_invite" as any, {
      trade: "Plumber",
      jobId: "abc123def456ghi789",
    });
    expect(result).toBe(genericUpdateSms({ trade: "Plumber", jobId: "abc123def456ghi789" }));
  });

  it("is deterministic (same inputs = same output)", () => {
    const data = { trade: "Electrician", jobId: "abc123def456ghi789", link: "https://example.com" };
    const a = buildSmsBody("job_live_status", data);
    const b = buildSmsBody("job_live_status", data);
    expect(a).toBe(b);
  });
});

// ── All messages under SMS_MAX ───────────────────────────────────────────

describe("length limits", () => {
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
    it(`${name} stays under SMS_MAX (${SMS_MAX})`, () => {
      const longData = {
        trade: "Kitchen Fitter",
        jobId: "a".repeat(64),
        link: "https://myapproved.com/very/long/path/for/testing",
        postcode: "SW1A 1AA",
        urgency: "emergency",
        timeEstimate: "2-3 days",
        tradespersonName: "Jane Very-Long-Surname",
        quotationAmount: "12345",
        clientName: "Alice B. Customer",
        invoiceNumber: "INV-2024-00001",
        rating: "5.0",
        budgetLabel: "£500-£1000",
        leadCostLabel: "£12.99",
        job_description: "Complete kitchen renovation with new cabinets, tiling, plumbing, and electrical work plus painting throughout",
        maskedPhone: "07XXX XXX999",
        unlockUrl: "https://myapproved.com/unlock/very-long-path",
        hoursLabel: "8 hours into a 3-day project",
        status: "pending review",
        ticketId: "TK-2024-00001",
        reason: "multiple policy violations detected",
      };
      const result = fn(longData);
      expect(result.length).toBeLessThanOrEqual(SMS_MAX);
    });
  }
});
