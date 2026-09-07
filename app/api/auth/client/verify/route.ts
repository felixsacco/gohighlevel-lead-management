// app/api/auth/client/verify/route.ts — server-side email-code verification.
//
// Wall A (W1) + P1#6: verify-captcha/page.tsx used to do an anon-key
// SELECT+compare+self-UPDATE against clients (a revoked, no-RLS PII table): any
// browser client could read captcha_code off the wire and flip is_verified on
// any known email. That comparison now happens here, on the service-role client,
// so the emailed code is verified on the server and never re-read by the caller.
//
// This route is deliberately pre-session: it runs the moment an anonymous
// homeowner clicks the emailed link, before any account session exists, so the
// account is addressed by its verified email (which the register route already
// stores lowercased). Verification grants nothing the user could not do with the
// code they were emailed; it only flips is_verified/is_active.

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, reason: "invalid_input", error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { email, code } = (body ?? {}) as { email?: unknown; code?: unknown };

  const emailValue =
    typeof email === "string" ? email.trim().toLowerCase() : "";
  const codeValue = typeof code === "string" ? code.trim() : "";

  if (!emailValue || !EMAIL_RE.test(emailValue)) {
    return NextResponse.json(
      {
        success: false,
        reason: "invalid_input",
        error: "Please enter a valid email address",
      },
      { status: 400 },
    );
  }
  if (!/^\d{3}$/.test(codeValue)) {
    return NextResponse.json(
      {
        success: false,
        reason: "invalid_input",
        error: "Enter the 3-digit code from your email",
      },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { success: false, reason: "service_error", error: "Service unavailable" },
      { status: 503 },
    );
  }

  // Registrations store email lowercased (see auth/client/register), so the
  // lowercased lookup matches both the emailed link and manual typing.
  const { data: client, error: fetchError } = await supabase
    .from("clients")
    .select("id, captcha_code, is_verified")
    .eq("email", emailValue)
    .maybeSingle();

  if (fetchError) {
    console.error("[auth/client/verify] lookup failed:", fetchError.message);
    return NextResponse.json(
      {
        success: false,
        reason: "service_error",
        error: "Verification failed. Please try again.",
      },
      { status: 500 },
    );
  }

  if (!client) {
    // No row for this email yet — the register step may not have completed.
    return NextResponse.json({
      success: false,
      reason: "email_not_found",
      error: "Email not found. Please check your email address.",
    });
  }

  if (client.is_verified) {
    // Already verified — treat as success so a re-clicked link lands on the
    // verified screen instead of an error.
    return NextResponse.json({ success: true, alreadyVerified: true });
  }

  if (!client.captcha_code || String(client.captcha_code) !== codeValue) {
    return NextResponse.json({
      success: false,
      reason: "invalid_code",
      error: "Invalid verification code. Please check your email and try again.",
    });
  }

  const { error: updateError } = await supabase
    .from("clients")
    .update({
      is_verified: true,
      is_active: true,
      email_verified_at: new Date().toISOString(),
      captcha_code: null, // Clear the code after successful verification
    })
    .eq("id", client.id);

  if (updateError) {
    console.error("[auth/client/verify] update failed:", updateError.message);
    return NextResponse.json(
      {
        success: false,
        reason: "service_error",
        error: "Verification failed. Please try again.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
