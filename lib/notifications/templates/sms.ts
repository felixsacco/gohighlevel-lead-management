// ── Deterministic SMS templates ──────────────────────────────────────────
// Every exported builder is a pure function: same inputs → same output.
// No network calls, no randomness, no AI/LLM generation.
// ────────────────────────────────────────────────────────────────────────

import type { NotificationEventType } from "../types";

/** SMS character limit before truncation (leaves room for STOP opt-out). */
export const SMS_MAX = 1500;

const BRAND = "myapproved.com";
const STOP = " Reply STOP to opt out.";

/**
 * Truncate `body` to `max` characters on a word boundary when possible,
 * preserving full URLs. Appends `…` when truncated.
 */
export function truncate(body: string, max = SMS_MAX): string {
  const t = body.trim();
  if (t.length <= max) return t;

  // Try word-boundary cut
  const slice = t.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  if (lastSpace > max * 0.75) return `${slice.slice(0, lastSpace)}…`;

  // Hard cut with ellipsis
  return `${slice.slice(0, max - 1)}…`;
}

// ── Per-scenario pure builders ──────────────────────────────────────────

interface SmsContext {
  trade: string;
  jobRef: string;
  refSuffix: string;
  linkSuffix: string;
}

function ctx(data: Record<string, unknown>): SmsContext {
  const trade = String(data.trade || "job").trim() || "job";
  const jobRef = String(data.jobRef || "");
  const refSuffix = jobRef ? ` Ref ${jobRef}.` : "";
  const shortLink = String(data.link || data.url || "").trim();
  const linkSuffix = shortLink ? ` ${shortLink}` : "";
  return { trade, jobRef, refSuffix, linkSuffix };
}

export function clientSignupSms(_data: Record<string, unknown>): string {
  return truncate(`${BRAND}: your account is ready. Post your first job in minutes.${STOP}`);
}

export function tradespersonSignupSms(data: Record<string, unknown>): string {
  const trade = String(data.trade || "job").trim() || "job";
  return truncate(`${BRAND}: registration received for your ${trade} profile. We will update you after review.${STOP}`);
}

export function jobPostedConfirmationSms(data: Record<string, unknown>): string {
  const c = ctx(data);
  const confArea = String(data.postcode || "").trim();
  const confUrgency = String(data.urgency || "flexible").trim();
  const urgencyText = confUrgency !== "flexible" ? ` (${confUrgency})` : "";
  const areaText = confArea ? ` in ${confArea}` : "";
  const timeEstimate = String(data.timeEstimate || "").trim();
  const timeText = timeEstimate ? ` We aim to connect you within ${timeEstimate}.` : "";
  return truncate(
    `${BRAND}: Your ${c.trade} job${urgencyText} has been posted${areaText}.${timeText} A verified tradesperson will contact you shortly.${c.refSuffix}${STOP}`,
  );
}

export function jobLiveStatusSms(data: Record<string, unknown>): string {
  const c = ctx(data);
  return truncate(`${BRAND}: your ${c.trade} job is now live. Tradespeople can apply now.${c.refSuffix}${c.linkSuffix}${STOP}`);
}

export function tradespersonAppliedAlertSms(data: Record<string, unknown>): string {
  const c = ctx(data);
  return truncate(
    `${BRAND}: ${String(data.tradespersonName || "A tradesperson")} quoted £${String(data.quotationAmount || "")} on your ${c.trade} job.${c.refSuffix}${c.linkSuffix}${STOP}`,
  );
}

export function applicationReminderSms(data: Record<string, unknown>): string {
  const c = ctx(data);
  return truncate(
    `${BRAND}: reminder - quotes are waiting for your ${c.trade} job.${c.refSuffix} Please choose a tradesperson today.${c.linkSuffix}${STOP}`,
  );
}

export function jobAssignedAlertSms(data: Record<string, unknown>): string {
  const c = ctx(data);
  return truncate(
    `${BRAND}: assigned! You got the ${c.trade} job.${c.refSuffix} Customer: ${String(data.clientName || "client")}.${c.linkSuffix}${STOP}`,
  );
}

export function jobNotSelectedSms(data: Record<string, unknown>): string {
  const c = ctx(data);
  return truncate(
    `${BRAND}: update - another tradesperson was chosen for the ${c.trade} job.${c.refSuffix} New jobs are posted regularly.${STOP}`,
  );
}

export function jobInProgressClientSms(data: Record<string, unknown>): string {
  const c = ctx(data);
  return truncate(
    `${BRAND}: your ${c.trade} job is now in progress with ${String(data.tradespersonName || "your tradesperson")}.${c.refSuffix}${STOP}`,
  );
}

export function jobCompletedAlertSms(data: Record<string, unknown>): string {
  const c = ctx(data);
  return truncate(
    `${BRAND}: ${c.trade} job marked complete.${c.refSuffix} If complete, please leave a quick review.${c.linkSuffix}${STOP}`,
  );
}

export function reviewReminderSms(data: Record<string, unknown>): string {
  const c = ctx(data);
  return truncate(
    `${BRAND}: how did your ${c.trade} job go?${c.refSuffix} Leave a quick review now.${c.linkSuffix}${STOP}`,
  );
}

export function jobProgressCheckinSms(data: Record<string, unknown>): string {
  const c = ctx(data);
  return truncate(
    `${BRAND}: progress check-in for your ${c.trade} job (${String(data.hoursLabel || "")}).${c.refSuffix}${c.linkSuffix}${STOP}`,
  );
}

export function applicationUnderReviewSms(data: Record<string, unknown>): string {
  const c = ctx(data);
  return truncate(
    `${BRAND}: your quote for the ${c.trade} job is still under review.${c.refSuffix} We will update you when decided.${STOP}`,
  );
}

export function tradespersonReviewWaitSms(data: Record<string, unknown>): string {
  const c = ctx(data);
  return truncate(
    `${BRAND}: review pending for your ${c.trade} job.${c.refSuffix} Keep your profile updated for more jobs.${STOP}`,
  );
}

export function reviewReceivedAlertSms(data: Record<string, unknown>): string {
  const c = ctx(data);
  return truncate(
    `${BRAND}: new review received - ${String(data.rating || "")}/5 stars.${c.refSuffix}${STOP}`,
  );
}

export function jobMatchTradespersonSms(data: Record<string, unknown>): string {
  const c = ctx(data);
  return truncate(
    `${BRAND}: new ${c.trade} job near you.${c.refSuffix} Apply now before slots fill.${c.linkSuffix}${STOP}`,
  );
}

export function buildNewLeadSms(data: Record<string, unknown>): string {
  const c = ctx(data);
  const area = String(data.postcode || data.area || "your area").trim() || "your area";
  const desc = String(data.job_description || "").trim();
  const shortDesc = desc ? (desc.length > 140 ? `${desc.slice(0, 137)}...` : desc) : "";
  const estimateLabel = String(data.estimateLabel || data.budgetLabel || data.budget || "").trim();
  const leadCost = String(data.leadCostLabel || "£4.99").trim();
  const maskedPhone = String(data.maskedPhone || "").trim();
  const link = String(data.unlockUrl || data.link || "").trim();
  const lines: string[] = [];
  lines.push(`${BRAND}: new ${c.trade} lead in ${area}.`);
  if (shortDesc) lines.push(`Job: ${shortDesc}`);
  if (estimateLabel) lines.push(`Estimate: ${estimateLabel}`);
  if (maskedPhone) lines.push(`Customer: ${maskedPhone}`);
  lines.push(`Lead cost: ${leadCost}.`);
  if (link) lines.push(`Unlock: ${link}`);
  return truncate(`${lines.join(" ")}${STOP}`);
}

export function invoiceReadySms(data: Record<string, unknown>): string {
  const c = ctx(data);
  return truncate(`${BRAND}: invoice ${String(data.invoiceNumber || "").trim() || ""} is ready.${c.refSuffix}${c.linkSuffix}${STOP}`);
}

export function paymentReceivedSms(data: Record<string, unknown>): string {
  const c = ctx(data);
  return truncate(`${BRAND}: payment recorded for your ${c.trade} job.${c.refSuffix} Receipt available now.${c.linkSuffix}${STOP}`);
}

export function accountSuspendedSms(data: Record<string, unknown>): string {
  return truncate(`${BRAND}: your account is temporarily suspended.${String(data.reason ? ` Reason: ${data.reason}.` : "")}${STOP}`);
}

export function reactivationGuideSms(_data: Record<string, unknown>): string {
  return truncate(`${BRAND}: account support update. Follow reactivation steps sent to your email.${STOP}`);
}

export function disputeOpenedSms(data: Record<string, unknown>): string {
  return truncate(`${BRAND}: dispute ticket opened.${String(data.ticketId ? ` Ticket ${data.ticketId}.` : "")} Support will respond soon.${STOP}`);
}

export function disputeUpdateSms(data: Record<string, unknown>): string {
  return truncate(`${BRAND}: dispute update.${String(data.status ? ` Status: ${data.status}.` : "")}${STOP}`);
}

export function disputeResolvedSms(_data: Record<string, unknown>): string {
  return truncate(`${BRAND}: your dispute ticket is resolved.${STOP}`);
}

export function tradespersonNextStepsSms(data: Record<string, unknown>): string {
  const c = ctx(data);
  return truncate(`${BRAND}: you are approved. Complete your profile and turn on job alerts.${c.linkSuffix}${STOP}`);
}

export function profileLiveAlertSms(_data: Record<string, unknown>): string {
  return truncate(`${BRAND}: your profile is now live and discoverable by customers.${STOP}`);
}

export function clientReengagementSms(data: Record<string, unknown>): string {
  const c = ctx(data);
  return truncate(`${BRAND}: need another ${c.trade} job? Post in minutes and get new quotes.${c.linkSuffix}${STOP}`);
}

export function tradespersonWinbackSms(data: Record<string, unknown>): string {
  const c = ctx(data);
  return truncate(`${BRAND}: new ${c.trade} jobs are available near you. Check and apply today.${c.linkSuffix}${STOP}`);
}

export function genericUpdateSms(data: Record<string, unknown>): string {
  const c = ctx(data);
  return truncate(`${BRAND}: ${c.trade} update available.${c.refSuffix}${c.linkSuffix}${STOP}`);
}

// ── Router: maps NotificationEventType → pure builder ──────────────────

const BUILDER_MAP: Partial<Record<NotificationEventType, (data: Record<string, unknown>) => string>> = {
  client_signup_confirmation: clientSignupSms,
  tradesperson_signup_confirmation: tradespersonSignupSms,
  job_posted_confirmation: jobPostedConfirmationSms,
  job_live_status: jobLiveStatusSms,
  tradesperson_applied_alert: tradespersonAppliedAlertSms,
  application_reminder: applicationReminderSms,
  job_assigned_alert: jobAssignedAlertSms,
  job_not_selected_notification: jobNotSelectedSms,
  job_in_progress_client_notice: jobInProgressClientSms,
  job_completed_alert: jobCompletedAlertSms,
  review_request_delayed: reviewReminderSms,
  review_reminder_24h: reviewReminderSms,
  review_reminder_48h: reviewReminderSms,
  review_reminder_72h: reviewReminderSms,
  job_progress_checkin: jobProgressCheckinSms,
  application_under_review_tradesperson: applicationUnderReviewSms,
  tradesperson_review_wait_reminder: tradespersonReviewWaitSms,
  review_received_alert: reviewReceivedAlertSms,
  job_match_tradesperson: jobMatchTradespersonSms,
  job_posted_tradesperson_match: jobMatchTradespersonSms,
  pay_per_lead_alert: buildNewLeadSms,
  invoice_sent_client: invoiceReadySms,
  invoice_sent_tradesperson: invoiceReadySms,
  payment_received: paymentReceivedSms,
  account_suspended_notice: accountSuspendedSms,
  reactivation_guide: reactivationGuideSms,
  dispute_opened: disputeOpenedSms,
  dispute_update: disputeUpdateSms,
  dispute_resolved: disputeResolvedSms,
  tradesperson_next_steps: tradespersonNextStepsSms,
  profile_live_alert: profileLiveAlertSms,
  client_reengagement_60d: clientReengagementSms,
  tradesperson_winback_60d: tradespersonWinbackSms,
};

/**
 * Pure function: maps `type` + `data` → SMS body string.
 * Same interface as the old `buildSmsBody` for drop-in compatibility.
 */
export function buildSmsBody(
  type: NotificationEventType,
  data: Record<string, unknown>,
): string {
  const builder = BUILDER_MAP[type];
  return builder ? builder(data) : genericUpdateSms(data);
}
