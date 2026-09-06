// app/api/auth/reset/request/route.ts — the ONLY place a password-reset email
// is sent. Replaces the old forgot-password flow, which did an anon-key account
// lookup in the browser (account enumeration) and never emailed anything.
//
// Behaviour (all security-critical):
//   - ALWAYS returns 200 { success: true } whether or not an account exists, so
//     a caller cannot learn which emails are registered (no enumeration). The
//     only observable difference is whether an email is actually sent.
//   - Only a VERIFIED account receives a reset link (matches the old
//     forgot-password behaviour, which refused unverified accounts). Unverified
//     accounts — including walk-in 'ANONYMOUS_NOT_SET' rows, which are never
//     verified — get the generic success response and no email.
//   - The link contains a short-lived HMAC reset token (lib/auth/reset-token.ts)
//     carrying the account id; /api/auth/reset/confirm redeems it and hashes the
//     new password by that id. The email address typed here never drives the
//     password update.

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  issueResetToken,
  type ResetTokenAccountType,
} from "@/lib/auth/reset-token";
import { sendTransactionalEmail } from "@/lib/notifications/email";

// Canonical absolute origin for the emailed reset link. Never use
// request.nextUrl.origin directly: it is derived from the Host header and an
// attacker who can influence that header could mint a reset link pointing at a
// domain they control. Prefer the configured app URL / site URL, falling back
// to the Vercel deployment URL, then the public default.
function resetLinkOrigin(): string {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
  }
  return "https://myapproved.com";
}

function tableFor(type: ResetTokenAccountType): "clients" | "tradespeople" {
  return type === "tradesperson" ? "tradespeople" : "clients";
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    // Keep this a success response too — a malformed body must not reveal state.
    return NextResponse.json({ success: true });
  }

  const { userType, email } = (body ?? {}) as {
    userType?: unknown;
    email?: unknown;
  };

  // Reject unknown account types loudly (they are a client bug), but still
  // return the generic shape so nothing about accounts leaks.
  if (userType !== "client" && userType !== "tradesperson") {
    return NextResponse.json({ success: true });
  }
  if (typeof email !== "string") {
    return NextResponse.json({ success: true });
  }
  const emailValue = email.trim().toLowerCase();
  if (!emailValue) {
    return NextResponse.json({ success: true });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    // Fail closed: cannot look up safely without the service-role client. The
    // request looks identical to the outside, but no email is sent.
    console.warn("[reset/request] Supabase admin unconfigured — no reset email sent");
    return NextResponse.json({ success: true });
  }

  const table = tableFor(userType);

  // Look up the account. NOTE: no email is logged here — only a generic
  // "request received" path is taken regardless of the outcome.
  const { data: account, error: lookupError } = await admin
    .from(table)
    .select("id, email, first_name, is_verified")
    .eq("email", emailValue)
    .maybeSingle();

  if (lookupError) {
    console.error(`[reset/request] lookup failed on ${table}:`, lookupError.message);
    return NextResponse.json({ success: true });
  }

  // Send a reset link ONLY for a real, verified account. Everything else —
  // no account, unverified account, walk-in sentinel — falls through to the
  // generic success response below with no email.
  if (account && account.is_verified) {
    const token = issueResetToken({
      type: userType,
      sub: account.id,
      email: account.email,
    });

    if (token === null) {
      // Signing secret not configured. Never emit an unauthenticated reset
      // link; behave exactly as if no account existed.
      console.error("[reset/request] reset token not configured — cannot send reset link");
      return NextResponse.json({ success: true });
    }

    const firstName = typeof account.first_name === "string"
      ? account.first_name
      : "there";

    const resetUrl = `${resetLinkOrigin()}/reset-password?token=${encodeURIComponent(token)}`;

    try {
      await sendTransactionalEmail({
        to: account.email,
        subject: "Reset your MyApproved password",
        html: `
          <h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Reset your password</h2>
          <p>Hi ${firstName.replace(/[<>&]/g, "")},</p>
          <p>We received a request to reset the password for your MyApproved account. If that was you, click the button below to choose a new password. This link is valid for <strong>15 minutes</strong> and can only be used once.</p>
          <p style="margin:24px 0;">
            <a href="${resetUrl}" style="background:#0f172a;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">Reset my password</a>
          </p>
          <p style="color:#64748b;font-size:13px;">If the button does not work, copy and paste this link into your browser:<br/>${resetUrl}</p>
          <p style="color:#64748b;font-size:13px;">If you did not request a password reset, you can safely ignore this email — your password will not change.</p>
        `,
        text: `Reset your MyApproved password\n\nHi ${firstName},\n\nWe received a request to reset the password for your MyApproved account. If that was you, open the link below to choose a new password. It is valid for 15 minutes and can only be used once.\n\n${resetUrl}\n\nIf you did not request a password reset, you can safely ignore this email — your password will not change.`,
      });
    } catch (emailError) {
      console.error(
        "[reset/request] failed to send reset email (non-fatal to response):",
        emailError,
      );
    }
  }

  // Generic success in every branch — never reveal whether an account exists.
  return NextResponse.json({
    success: true,
    message:
      "If an account with that email exists and is verified, we've sent a link to reset your password. Please check your inbox (and spam folder).",
  });
}
