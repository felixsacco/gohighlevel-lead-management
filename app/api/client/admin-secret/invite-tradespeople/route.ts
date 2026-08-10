import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendNotification } from "@/lib/notifications";

export const maxDuration = 60;

const MAX_EMAILS = 20;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://myapproved.com"
  );
}

function formatBudget(value: unknown, type: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  const num =
    typeof value === "number" ? value : parseFloat(String(value));
  if (Number.isNaN(num)) return String(value);
  const formatted = `£${num.toLocaleString("en-GB", {
    maximumFractionDigits: 2,
  })}`;
  const t = String(type || "").trim().toLowerCase();
  if (!t) return formatted;
  return `${formatted} (${t})`;
}

function normalizeEmails(raw: unknown): string[] {
  const list: string[] = [];
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (typeof item === "string") list.push(item);
    }
  } else if (typeof raw === "string") {
    list.push(
      ...raw
        .split(/[\s,;]+/)
        .map((s) => s.trim())
        .filter(Boolean),
    );
  }

  const seen = new Set<string>();
  const out: string[] = [];
  for (const entry of list) {
    const email = entry.trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email) || seen.has(email)) continue;
    seen.add(email);
    out.push(email);
    if (out.length >= MAX_EMAILS) break;
  }
  return out;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const jobId = typeof body?.jobId === "string" ? body.jobId.trim() : "";
    const emails = normalizeEmails(body?.emails);

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }
    if (emails.length === 0) {
      return NextResponse.json(
        { error: "At least one valid email is required" },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
    const { data: job, error: fetchError } = await supabaseAdmin
      .from("jobs")
      .select(
        "id, trade, job_description, postcode, budget, budget_type, status, is_approved, application_status, is_completed, assigned_tradesperson_id",
      )
      .eq("id", jobId)
      .single();

    if (fetchError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const isOpen =
      job.is_approved === true &&
      (job.status === "approved" || !job.status) &&
      job.is_completed !== true &&
      !job.assigned_tradesperson_id &&
      (job.application_status === "open" ||
        job.application_status == null ||
        job.application_status === "");

    if (!isOpen) {
      return NextResponse.json(
        { error: "Job is not open for invites" },
        { status: 400 },
      );
    }

    const dayKey = new Date().toISOString().slice(0, 10);
    const registerUrl = `${getAppBaseUrl()}/register/tradesperson`;
    const budgetLabel = formatBudget(job.budget, job.budget_type);

    const sent: string[] = [];
    const failed: { email: string; error: string }[] = [];

    for (const email of emails) {
      try {
        const result = await sendNotification({
          type: "tradesperson_job_invite",
          recipientEmail: email,
          channels: ["email"],
          idempotencyKey: `job_invite:${job.id}:${email}:${dayKey}`,
          data: {
            jobId: job.id,
            trade: job.trade,
            postcode: job.postcode,
            job_description: job.job_description,
            budget: job.budget,
            budget_type: job.budget_type,
            budgetLabel,
            registerUrl,
            link: registerUrl,
          },
        });

        if (result.ok) {
          sent.push(email);
        } else {
          const err =
            result.results.find((r) => r.error)?.error || "Failed to send";
          failed.push({ email, error: err });
        }
      } catch (e) {
        failed.push({
          email,
          error: e instanceof Error ? e.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: failed.length === 0,
      sent,
      failed,
      sentCount: sent.length,
      failedCount: failed.length,
    });
  } catch (e) {
    console.error("Invite tradespeople error", e);
    return NextResponse.json(
      { error: "Failed to send invites" },
      { status: 500 },
    );
  }
}
