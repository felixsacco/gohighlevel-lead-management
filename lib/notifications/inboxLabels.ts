import type { NotificationEventType } from "@/lib/notifications/types";

const TITLES: Partial<Record<NotificationEventType, string>> = {
  job_posted_confirmation: "Job submitted",
  job_live_status: "Your job is live",
  tradesperson_applied_alert: "New application on your job",
  application_reminder: "Reminder: review applications",
  application_under_review_tradesperson: "Customer reviewing your application",
  job_assigned_alert: "You were assigned a job",
  job_not_selected_notification: "Job update",
  job_in_progress_client_notice: "Job in progress",
  job_completed_alert: "Job completed",
  review_request_delayed: "Leave a review",
  review_reminder_24h: "Review reminder",
  review_reminder_48h: "Final review reminder",
  review_reminder_72h: "Last review notice",
  invoice_sent_client: "Invoice",
  invoice_sent_tradesperson: "Invoice",
  payment_received: "Payment receipt",
  dispute_opened: "Dispute logged",
  dispute_update: "Dispute update",
  dispute_resolved: "Dispute resolved",
  client_reengagement_60d: "We would love to help again",
  tradesperson_winback_60d: "New jobs near you",
  job_progress_checkin: "Job check-in",
};

export function inboxTitleForEvent(eventType: string): string {
  return TITLES[eventType as NotificationEventType] || eventType.replace(/_/g, " ");
}
