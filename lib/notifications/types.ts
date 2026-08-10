export type NotificationChannel = "email" | "sms" | "push";

export type NotificationEventType =
  | "client_signup_confirmation"
  | "tradesperson_signup_confirmation"
  | "tradesperson_signup_admin_alert"
  | "job_posted_admin_alert"
  | "job_posted_confirmation"
  | "job_live_status"
  | "job_match_tradesperson"
  | "job_posted_tradesperson_match"
  | "pay_per_lead_alert"
  | "tradesperson_applied_alert"
  | "application_reminder"
  | "job_assigned_alert"
  | "job_completed_alert"
  | "review_request_delayed"
  | "review_reminder_24h"
  | "review_reminder_48h"
  | "review_reminder_72h"
  | "review_received_alert"
  | "invoice_sent_client"
  | "invoice_sent_tradesperson"
  | "payment_received"
  | "tradesperson_next_steps"
  | "profile_live_alert"
  | "dispute_opened"
  | "dispute_update"
  | "dispute_resolved"
  | "account_suspended_notice"
  | "reactivation_guide"
  | "client_reengagement_60d"
  | "tradesperson_winback_60d"
  | "job_not_selected_notification"
  | "job_in_progress_client_notice"
  | "application_under_review_tradesperson"
  | "tradesperson_review_wait_reminder"
  | "job_progress_checkin"
  | "tradesperson_job_invite"
  | "regulated_trade_no_certified_match";

export interface NotificationPayload {
  type: NotificationEventType;
  recipientId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  channels: NotificationChannel[];
  idempotencyKey: string;
  data: Record<string, unknown>;
}

export interface NotificationResult {
  channel: NotificationChannel;
  success: boolean;
  error?: string;
  messageId?: string;
}
