import nodemailer from "nodemailer";
import type { NotificationEventType } from "./types";
import { buildInvoicePdfBuffer } from "./invoice-pdf";
import {
  escapeHtml,
  injectEmailLogoSrc,
  jobReferenceRowHtml,
  wrapBrandedEmailHtml,
} from "./email-layout";

interface EmailContent {
  subject: string;
  html: string;
}

const defaultFrom =
  process.env.POSTMARK_FROM_EMAIL ||
  process.env.NOTIFICATION_FROM_EMAIL ||
  "noreply@mail.myapproved.com";

function wrap(inner: string): string {
  return wrapBrandedEmailHtml(inner);
}

/** True when Postmark server token is set (local dev often omits this). */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.POSTMARK_SERVER_TOKEN?.trim());
}

function skippedMailResult(to: string): nodemailer.SentMessageInfo {
  return {
    messageId: "<skipped-no-smtp>",
    accepted: [to],
    rejected: [],
    pending: [],
    response: "Skipped: POSTMARK_SERVER_TOKEN not set",
  } as nodemailer.SentMessageInfo;
}

export function createMailer() {
  const token = process.env.POSTMARK_SERVER_TOKEN?.trim();

  if (!token) {
    console.warn('POSTMARK_SERVER_TOKEN not set — email disabled');
    return null;
  }

  return nodemailer.createTransport({
    host: "smtp.postmarkapp.com",
    port: 587,
    secure: false,
    auth: { user: token, pass: token },
  });
}

/** One-off HTML emails (not tied to NotificationEventType). Uses Postmark via POSTMARK_SERVER_TOKEN. */
export async function sendTransactionalEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  if (!isEmailConfigured()) {
    console.warn(
      "[email] Postmark not configured — add POSTMARK_SERVER_TOKEN to .env.local (skipped send):",
      opts.subject,
      "→",
      opts.to,
    );
    return skippedMailResult(opts.to);
  }
  const transporter = createMailer();
  const subj = opts.subject.trim().startsWith("MyApproved")
    ? opts.subject.trim()
    : `MyApproved — ${opts.subject.trim()}`;
  return transporter.sendMail({
    from: `MyApproved <${defaultFrom}>`,
    to: opts.to,
    subject: subj,
    html: injectEmailLogoSrc(wrapBrandedEmailHtml(opts.html), "https://myapproved.com/logo-icon.svg"),
    text: opts.text,
    headers: { "X-PM-MESSAGE-STREAM": "outbound" },
  });
}

export function buildEmailContent(
  type: NotificationEventType,
  data: Record<string, unknown>,
): EmailContent {
  const tradeRaw = String(data.trade || "Your job");
  const trade = escapeHtml(tradeRaw);
  const postcode = escapeHtml(String(data.postcode || ""));
  const desc = escapeHtml(String(data.job_description || data.description || "").slice(0, 500));
  const jobRef = String(data.jobRef || "");
  const refRow = jobRef ? jobReferenceRowHtml(jobRef) : "";
  const locBlock = postcode
    ? `<p style="margin:0 0 14px;font-size:14px;color:#475569;"><strong>Location:</strong> ${postcode}</p>`
    : "";

  switch (type) {
    case "client_signup_confirmation":
      return {
        subject: "Welcome to MyApproved",
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Welcome to MyApproved</h2>
          <p>Your account is ready. You can post a job from your client dashboard whenever you need a checked, approved tradesperson.</p>`,
        ),
      };
    case "tradesperson_signup_confirmation":
      return {
        subject: "Welcome to MyApproved - your registration is received",
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Thanks for joining MyApproved</h2>
          <p>Hi ${escapeHtml(String(data.firstName || "there"))}, your tradesperson registration has been received and is now in review.</p>
          <p>Here is what happens next:</p>
          <ol style="margin:0 0 14px;padding-left:20px;color:#334155;">
            <li style="margin-bottom:8px;">Our admin team checks your documents and profile details.</li>
            <li style="margin-bottom:8px;">Once approved, your profile becomes visible to customers in your area.</li>
            <li>You can then apply to matching jobs from your tradesperson dashboard.</li>
          </ol>
          <p style="margin:0 0 6px;"><strong>Onboarding checklist:</strong></p>
          <ul style="margin:0;padding-left:20px;color:#334155;">
            <li style="margin-bottom:6px;">Keep your trade, city and postcode accurate.</li>
            <li style="margin-bottom:6px;">Make sure insurance and qualification documents are up to date.</li>
            <li>Add profile photos and a clear service description after approval.</li>
          </ul>`,
        ),
      };
    case "tradesperson_signup_admin_alert":
      return {
        subject: "Admin: new tradesperson registration",
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">New tradesperson registration</h2>
          <p><strong>Name:</strong> ${escapeHtml(String(data.fullName || ""))}</p>
          <p><strong>Email:</strong> ${escapeHtml(String(data.email || ""))}</p>
          <p><strong>Phone:</strong> ${escapeHtml(String(data.phone || ""))}</p>
          <p><strong>Trade:</strong> ${trade}</p>
          <p>Please review in the admin dashboard.</p>`,
        ),
      };
    case "job_posted_admin_alert": {
      const clientName = escapeHtml(
        String(data.clientName || data.fullName || "Unknown client"),
      );
      const clientEmail = escapeHtml(String(data.clientEmail || ""));
      const clientPhone = escapeHtml(String(data.clientPhone || ""));
      const budget = escapeHtml(String(data.budget || ""));
      const budgetType = escapeHtml(String(data.budget_type || data.budgetType || ""));
      const budgetLine =
        budget && budget !== "null"
          ? `<p><strong>Budget:</strong> £${budget}${budgetType ? ` (${budgetType})` : ""}</p>`
          : "";
      return {
        subject: `Admin: new ${tradeRaw} job${postcode ? ` — ${String(data.postcode || "")}` : ""}${jobRef ? ` · ${jobRef}` : ""}`,
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">New job posted</h2>
          ${refRow}
          <p><strong>Trade:</strong> ${trade}</p>
          ${locBlock}
          ${budgetLine}
          <p style="background:#f1f5f9;padding:14px;border-radius:8px;border:1px solid #e2e8f0;">${desc || "<em>No description provided.</em>"}</p>
          <p><strong>Client:</strong> ${clientName}</p>
          ${clientEmail ? `<p><strong>Email:</strong> ${clientEmail}</p>` : ""}
          ${clientPhone ? `<p><strong>Phone:</strong> ${clientPhone}</p>` : ""}
          <p style="margin-top:18px;"><a href="https://myapproved.com/admin/dashboard" style="display:inline-block;padding:12px 20px;background:#fdbd18;color:#0f172a;font-weight:bold;border-radius:8px;text-decoration:none;">Open admin dashboard</a></p>`,
        ),
      };
    }
    case "job_posted_confirmation": {
      const timeEstimate = String(data.timeEstimate || "").trim();
      const timeRow = timeEstimate ? `<p><strong>Estimated response time:</strong> ${escapeHtml(timeEstimate)}</p>` : "";
      return {
        subject: `Job submitted — ${trade}${jobRef ? ` · ${jobRef}` : ""}`,
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Your job was submitted</h2>
          ${refRow}
          <p>We received your <strong>${trade}</strong> job${postcode ? ` in <strong>${postcode}</strong>` : ""}.</p>
          <p style="background:#f1f5f9;padding:14px;border-radius:8px;border:1px solid #e2e8f0;">${desc || "<em>No description provided.</em>"}</p>
          <p>Your job is <strong>live now</strong> — verified tradespeople in your area can see it and apply.</p>
          ${timeRow}`,
        ),
      };
    }
    case "job_live_status":
      return {
        subject: `Your job is live — ${trade}${jobRef ? ` (${jobRef})` : ""}`,
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Your job is now live</h2>
          ${refRow}
          <p>Verified tradespeople can see and apply to your <strong>${trade}</strong> job${postcode ? ` in <strong>${postcode}</strong>` : ""}.</p>
          <p>Open your client dashboard to review applications as they arrive.</p>`,
        ),
      };
    case "job_match_tradesperson":
      return {
        subject: `New ${trade} job${postcode ? ` — ${postcode}` : ""}${jobRef ? ` · ${jobRef}` : ""}`,
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">New job that matches your profile</h2>
          ${refRow}
          <p>A verified client has posted a <strong>${trade}</strong> job${postcode ? ` in <strong>${postcode}</strong>` : ""}.</p>
          ${desc ? `<p style="background:#f1f5f9;padding:14px;border-radius:8px;border:1px solid #e2e8f0;margin:14px 0;">${desc}</p>` : ""}
          <p>Log in to your MyApproved tradesperson dashboard to view details and apply.</p>`,
        ),
      };
    case "job_posted_tradesperson_match":
      return {
        subject: `New ${trade} job near you${postcode ? ` — ${postcode}` : ""}${jobRef ? ` · ${jobRef}` : ""}`,
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">A client just posted a job that fits you</h2>
          ${refRow}
          <p>There is a new <strong>${trade}</strong> job${postcode ? ` in <strong>${postcode}</strong>` : ""}. It is waiting for admin approval before applications open.</p>
          ${desc ? `<p style="background:#f1f5f9;padding:14px;border-radius:8px;border:1px solid #e2e8f0;margin:14px 0;">${desc}</p>` : ""}
          <p>You will get another email when the job goes live. Until then, you can check your MyApproved tradesperson dashboard for updates.</p>`,
        ),
      };
    case "pay_per_lead_alert": {
      const budget = String(data.budgetLabel || data.budget || "").trim();
      const leadCost = String(data.leadCostLabel || "£4.99").trim();
      const maskedPhone = String(data.maskedPhone || "").trim();
      const link = String(data.unlockUrl || data.link || "").trim();
      return {
        subject: `New ${trade} lead near you${postcode ? ` — ${postcode}` : ""}${jobRef ? ` · ${jobRef}` : ""}`,
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">A new lead is waiting for you</h2>
          ${refRow}
          <p>A verified client has posted a <strong>${trade}</strong> job${postcode ? ` in <strong>${postcode}</strong>` : ""}.</p>
          ${desc ? `<p style="background:#f1f5f9;padding:14px;border-radius:8px;border:1px solid #e2e8f0;margin:14px 0;">${desc}</p>` : ""}
          ${budget ? `<p><strong>Customer's quote / budget:</strong> ${escapeHtml(budget)}</p>` : ""}
          ${maskedPhone ? `<p><strong>Customer's number:</strong> ${escapeHtml(maskedPhone)} <span style="color:#64748b;">(hidden until you unlock the lead)</span></p>` : ""}
          <p><strong>Lead cost:</strong> ${escapeHtml(leadCost)}. Pay once and the customer's full number is yours.</p>
          ${link ? `<p style="margin:24px 0;"><a href="${escapeHtml(link)}" style="display:inline-block;padding:12px 20px;background:#fdbd18;color:#0f172a;font-weight:bold;border-radius:8px;text-decoration:none;">Unlock this lead — ${escapeHtml(leadCost)}</a></p>` : ""}
          <p style="color:#64748b;font-size:13px;">You are on the Pay-Per-Lead plan. To stop paying per lead and switch to unlimited leads for £1,000 / month, upgrade from your dashboard.</p>`,
        ),
      };
    }
    case "tradesperson_applied_alert":
      return {
        subject: `New application — ${trade}${jobRef ? ` · ${jobRef}` : ""}`,
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">New application received</h2>
          ${refRow}
          <p><strong>${escapeHtml(String(data.tradespersonName || "A tradesperson"))}</strong> has applied to your <strong>${trade}</strong> job.</p>
          <p><strong>Quoted amount (excl. VAT unless stated):</strong> £${escapeHtml(String(data.quotationAmount ?? ""))}</p>
          <p>Review applications in your MyApproved client dashboard and assign someone when you are ready.</p>`,
        ),
      };
    case "application_reminder":
      return {
        subject: `Reminder — applications waiting · ${trade}`,
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Applications need your review</h2>
          ${refRow}
          <p>Your <strong>${trade}</strong> job has pending applications.</p>
          <p>${escapeHtml(String(data.message || "Please open your MyApproved dashboard and assign a tradesperson to keep the job moving."))}</p>`,
        ),
      };
    case "application_under_review_tradesperson":
      return {
        subject: `Application update — ${trade}${jobRef ? ` · ${jobRef}` : ""}`,
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">The customer is reviewing applications</h2>
          ${refRow}
          <p>Your application for the <strong>${trade}</strong> job remains active. The customer may take a little time to decide.</p>
          <p>We will email you again from <strong>MyApproved</strong> if you are selected or if the job is assigned to someone else.</p>`,
        ),
      };
    case "job_progress_checkin": {
      const role = String(data.role || "");
      const hoursLabel = escapeHtml(String(data.hoursLabel || ""));
      const isClient = role === "client";
      return {
        subject: isClient
          ? `Quick check-in — ${trade} job`
          : `Progress check — ${trade} job`,
        html: wrap(
          isClient
            ? `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">How is the work going?</h2>
          ${refRow}
          <p>Your <strong>${trade}</strong> job has been in progress for about <strong>${hoursLabel}</strong>.</p>
          <p>If anything is off track, message your tradesperson from your MyApproved dashboard. If things are going well, you can ignore this email.</p>`
            : `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Share a quick update</h2>
          ${refRow}
          <p>The <strong>${trade}</strong> job has been active for about <strong>${hoursLabel}</strong>.</p>
          <p>If you have started work or have progress photos, send a short update through MyApproved dashboard chat so the customer stays confident.</p>`,
        ),
      };
    }
    case "job_assigned_alert":
      return {
        subject: `You have been assigned — ${trade}${jobRef ? ` · ${jobRef}` : ""}`,
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Congratulations — you have been assigned</h2>
          ${refRow}
          <p>You were chosen for a <strong>${trade}</strong> job on MyApproved.</p>
          <p><strong>Client:</strong> ${escapeHtml(String(data.clientName || ""))}</p>
          <p><strong>Agreed quote (as submitted):</strong> £${escapeHtml(String(data.quotationAmount ?? ""))}</p>
          <p>Contact the client through your MyApproved dashboard chat to arrange the visit and confirm scope.</p>`,
        ),
      };
    case "job_not_selected_notification":
      return {
        subject: `Job update — ${trade}${jobRef ? ` · ${jobRef}` : ""}`,
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Another tradesperson was selected</h2>
          ${refRow}
          <p>The customer has assigned <strong>${escapeHtml(String(data.selectedName || "another tradesperson"))}</strong> for the <strong>${trade}</strong> job.</p>
          <p>Thank you for applying through MyApproved — new jobs are posted regularly that match your trade.</p>`,
        ),
      };
    case "job_in_progress_client_notice":
      return {
        subject: `Work is booked — ${trade}${jobRef ? ` · ${jobRef}` : ""}`,
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Your job is in progress</h2>
          ${refRow}
          <p><strong>${escapeHtml(String(data.tradespersonName || "Your tradesperson"))}</strong> has been assigned and should contact you shortly via MyApproved chat or by phone if they have shared their number.</p>
          <p>If anything changes or you need support, use dashboard chat or the support links in your MyApproved client dashboard.</p>`,
        ),
      };
    case "job_completed_alert":
      return {
        subject: `Job completed — ${trade}${jobRef ? ` · ${jobRef}` : ""}`,
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Job marked complete</h2>
          ${refRow}
          <p>The <strong>${trade}</strong> job has been marked complete on MyApproved.</p>
          ${data.rating ? `<p><strong>Customer rating (if provided):</strong> ${escapeHtml(String(data.rating))}/5</p>` : ""}
          <p>Your invoice summary or receipt may be sent in a separate email where applicable.</p>`,
        ),
      };
    case "review_request_delayed":
      return {
        subject: `How did the job go? · ${trade}`,
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Time to leave a review</h2>
          ${refRow}
          <p>Your <strong>${trade}</strong> job should be finished by now. Honest reviews help other homeowners and reward great tradespeople.</p>
          <p>Open your MyApproved client dashboard to rate and review.</p>`,
        ),
      };
    case "review_reminder_24h":
      return {
        subject: `Reminder — please leave your review · ${trade}`,
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Gentle reminder</h2>
          ${refRow}
          <p>Please leave a short review for your <strong>${trade}</strong> job when you have a moment.</p>`,
        ),
      };
    case "review_reminder_48h":
      return {
        subject: `Final reminder — your review · ${trade}`,
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Last reminder</h2>
          ${refRow}
          <p>We are still missing your review for the <strong>${trade}</strong> job. Even a few words make a big difference.</p>`,
        ),
      };
    case "review_reminder_72h":
      return {
        subject: `Final notice — please leave your review · ${trade}`,
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Review still pending</h2>
          ${refRow}
          <p>This is our final follow-up for your <strong>${trade}</strong> job review.</p>
          <p>Please leave a quick rating and comment in your MyApproved dashboard to close the job feedback loop.</p>`,
        ),
      };
    case "tradesperson_review_wait_reminder":
      return {
        subject: `Review pending — ${trade}${jobRef ? ` · ${jobRef}` : ""}`,
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Review pending</h2>
          ${refRow}
          <p>The <strong>${trade}</strong> job is complete. The customer has not left a review yet — this is normal.</p>
          <p>Great work on MyApproved often gets rated within a few days.</p>`,
        ),
      };
    case "review_received_alert":
      return {
        subject: `New review on your profile${jobRef ? ` · ${jobRef}` : ""}`,
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">New review on your MyApproved profile</h2>
          ${refRow}
          <p><strong>Rating:</strong> ${escapeHtml(String(data.rating ?? ""))}/5</p>
          ${data.review ? `<p style="background:#f8fafc;padding:12px;border-radius:8px;border:1px solid #e2e8f0;">${escapeHtml(String(data.review))}</p>` : ""}`,
        ),
      };
    case "invoice_sent_client":
    case "invoice_sent_tradesperson":
      return {
        subject: `Invoice ${String(data.invoiceNumber || "").trim() || "summary"} — ${tradeRaw}`,
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Invoice / summary document</h2>
          ${refRow}
          <p><strong>Document no.:</strong> ${escapeHtml(String(data.invoiceNumber || ""))}</p>
          <p><strong>Job (trade):</strong> ${trade}</p>
          <p><strong>Amount shown:</strong> £${escapeHtml(String(data.amount ?? ""))} <span style="font-size:12px;color:#64748b;">(platform record — confirm VAT and final pricing with the other party where relevant)</span></p>
          <p>A PDF copy is attached for your records. Please retain it for your accounts.</p>`,
        ),
      };
    case "payment_received":
      return {
        subject: `Payment confirmation — ${String(data.invoiceNumber || "").trim() || tradeRaw}`,
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Payment / completion record</h2>
          ${refRow}
          <p>We have generated a receipt for the <strong>${trade}</strong> job on MyApproved.</p>
          <p><strong>Document no.:</strong> ${escapeHtml(String(data.invoiceNumber || ""))}</p>
          <p>See the attached PDF for your records.</p>`,
        ),
      };
    case "tradesperson_next_steps":
      return {
        subject: "You are approved — next steps on MyApproved",
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Welcome aboard</h2>
          <ol style="margin:0;padding-left:20px;color:#334155;">
            <li style="margin-bottom:8px;">Keep your profile complete (photos, insurance, qualifications).</li>
            <li style="margin-bottom:8px;">Turn on job alerts in your MyApproved tradesperson dashboard.</li>
            <li>Apply quickly with clear, itemised quotes — speed and clarity win jobs.</li>
          </ol>`,
        ),
      };
    case "profile_live_alert":
      return {
        subject: "Your MyApproved profile is now discoverable",
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Profile live</h2>
          <p>${escapeHtml(String(data.message || "Customers can now find you on MyApproved when they search your trade and area."))}</p>`,
        ),
      };
    case "dispute_opened":
      return {
        subject: `Dispute logged — ticket ${String(data.ticketId || "").slice(0, 12) || "ref on file"}`,
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">We have logged your dispute</h2>
          ${refRow}
          <p><strong>Ticket reference:</strong> ${escapeHtml(String(data.ticketId || ""))}</p>
          ${
            data.slaAcknowledgeBy
              ? `<p><strong>Target first response:</strong> by ${escapeHtml(String(data.slaAcknowledgeBy)).slice(0, 16)}… (business hours)</p>`
              : ""
          }
          <p>Our team will follow up by email. You can reply to this thread with more detail if needed.</p>`,
        ),
      };
    case "dispute_update":
      return {
        subject: `Dispute update — ticket ${String(data.ticketId || "").slice(0, 12) || "MyApproved"}`,
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Update on your ticket</h2>
          <p><strong>Status:</strong> ${escapeHtml(String(data.status || ""))}</p>
          ${data.resolutionNotes ? `<p>${escapeHtml(String(data.resolutionNotes))}</p>` : ""}`,
        ),
      };
    case "dispute_resolved":
      return {
        subject: "Dispute resolved — MyApproved",
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Your dispute is closed</h2>
          <p>${escapeHtml(String(data.resolutionNotes || "This ticket has been marked resolved."))}</p>`,
        ),
      };
    case "account_suspended_notice":
      return {
        subject: "Important: your MyApproved account is suspended",
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Your account is suspended</h2>
          <p><strong>Reason:</strong> ${escapeHtml(String(data.reason || "Policy review"))}</p>
          <p>You will not receive new job matches until your account is reactivated.</p>`,
        ),
      };
    case "reactivation_guide":
      return {
        subject: "MyApproved account — reactivation steps",
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Next steps</h2>
          <p>${escapeHtml(String(data.message || "Contact support with any evidence requested, or wait for admin review if you already submitted an appeal."))}</p>
          <p><strong>Support:</strong> ${escapeHtml(String(data.supportEmail || "support@myapproved.com"))}</p>`,
        ),
      };
    case "client_reengagement_60d":
      return {
        subject: `Need another ${tradeRaw} job? — MyApproved`,
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">We would love to help again</h2>
          <p>It has been a while since your last <strong>${trade}</strong> job on MyApproved.</p>
          <p>Post a new job in minutes — verified tradespeople are ready in your area.</p>`,
        ),
      };
    case "tradesperson_winback_60d":
      return {
        subject: `New ${tradeRaw} jobs on MyApproved`,
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">We miss you</h2>
          <p>New <strong>${trade}</strong> opportunities have been posted. Log in and apply to stay visible to customers.</p>`,
        ),
      };
    case "regulated_trade_no_certified_match": {
      const regulator = escapeHtml(String(data.regulator || "UK regulatory body"));
      const jobTrade = escapeHtml(String(data.trade || "regulated trade"));
      const adminDashboard = String(data.adminDashboardUrl || "https://myapproved.com/admin/dashboard");
      return {
        subject: `Admin: no certified ${jobTrade} match — manual review needed`,
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#ef4444;">No certified tradesperson matched</h2>
          ${refRow}
          <p>A <strong>${jobTrade}</strong> job was posted (regulated by <strong>${regulator}</strong>), but <strong>no tradespeople with verified, unexpired certification</strong> matched in the area.</p>
          ${locBlock}
          <p style="background:#fef2f2;padding:14px;border-radius:8px;border:1px solid #fecaca;margin:14px 0;">${desc || "<em>No description provided.</em>"}</p>
          <p>The job is <strong>paused</strong> until a certified tradesperson is available or an admin manually reviews it.</p>
          <p style="margin-top:18px;"><a href="${escapeHtml(adminDashboard)}" style="display:inline-block;padding:12px 20px;background:#ef4444;color:#fff;font-weight:bold;border-radius:8px;text-decoration:none;">Review in admin dashboard</a></p>`,
        ),
      };
    }
    case "tradesperson_job_invite": {
      const budgetLabel = escapeHtml(
        String(data.budgetLabel || data.budget || "").trim(),
      );
      const registerUrl = escapeHtml(
        String(
          data.registerUrl ||
            data.link ||
            "https://myapproved.com/register/tradesperson",
        ).trim(),
      );
      return {
        subject: `${tradeRaw} job available${postcode ? ` — ${String(data.postcode || "")}` : ""}${jobRef ? ` · ${jobRef}` : ""}`,
        html: wrap(
          `<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">A client needs a ${trade} tradesperson</h2>
          ${refRow}
          ${locBlock}
          <p>We have a live <strong>${trade}</strong> job on MyApproved${postcode ? ` near <strong>${postcode}</strong>` : ""} and thought it might suit you.</p>
          ${desc ? `<p style="background:#f1f5f9;padding:14px;border-radius:8px;border:1px solid #e2e8f0;margin:14px 0;">${desc}</p>` : ""}
          ${budgetLabel ? `<p><strong>Budget:</strong> ${budgetLabel}</p>` : ""}
          <p>Create a free tradesperson account to view full details and apply from your dashboard.</p>
          <p style="margin:24px 0;"><a href="${registerUrl}" style="display:inline-block;padding:12px 20px;background:#fdbd18;color:#0f172a;font-weight:bold;border-radius:8px;text-decoration:none;">Join MyApproved and apply</a></p>
          <p style="color:#64748b;font-size:13px;">Already registered? Log in to your tradesperson dashboard to find open jobs and submit a quote.</p>`,
        ),
      };
    }
    default:
      return {
        subject: "MyApproved notification",
        html: wrap(`<p>You have a new notification.</p>`),
      };
  }
}

export async function sendEmailNotification(args: {
  to: string;
  type: NotificationEventType;
  data: Record<string, unknown>;
}) {
  if (!isEmailConfigured()) {
    console.warn(
      "[email] Postmark not configured — skipped notification:",
      args.type,
      "→",
      args.to,
    );
    return skippedMailResult(args.to);
  }
  const transporter = createMailer();
  const content = buildEmailContent(args.type, args.data);
  const subjectLine = /^MyApproved\b/i.test(content.subject.trim())
    ? content.subject.trim()
    : `MyApproved — ${content.subject.trim()}`;

  const mail: nodemailer.SendMailOptions = {
    from: `MyApproved <${defaultFrom}>`,
    to: args.to,
    subject: subjectLine,
    html: injectEmailLogoSrc(content.html, "https://myapproved.com/logo-icon.svg"),
    headers: { "X-PM-MESSAGE-STREAM": "outbound" },
  };

  const pdfTypes: NotificationEventType[] = [
    "invoice_sent_client",
    "invoice_sent_tradesperson",
    "payment_received",
  ];
  if (pdfTypes.includes(args.type)) {
    try {
      const invoiceNumber = String(
        args.data.invoiceNumber || `INV-${String(args.data.jobId || "JOB").slice(0, 8)}`,
      );
      const amountLabel = String(args.data.amount ?? "0");
      const issueDate = new Date().toLocaleDateString("en-GB");
      const billedToName = String(args.data.billedToName || "Customer");
      const billedToEmail = String(args.data.billedToEmail || args.to);
      const jobRefPdf = args.data.jobRef || "";
      const description = `${String(args.data.trade || "Job")} — MyApproved job ref ${jobRefPdf || String(args.data.jobId || "").slice(0, 8)}`;

      const pdfBuffer = await buildInvoicePdfBuffer({
        invoiceNumber,
        issueDate,
        billedToName,
        billedToEmail,
        description,
        amountLabel: `£${amountLabel}`,
        footerNote:
          args.type === "payment_received"
            ? "This receipt records completion on the MyApproved platform. It is not a substitute for your tradesperson's own VAT invoice where one is required for your accounts."
            : undefined,
      });

      mail.attachments = [
        ...(mail.attachments || []),
        {
          filename: `${invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, "_")}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ];
    } catch (e) {
      console.error("Invoice PDF attachment skipped:", e);
    }
  }

  return transporter.sendMail(mail);
}
