// app/api/auth/trade/login/route.ts — server-side tradesperson login.
//
// Replaces the client-side credential check that used to live in
// app/login/trade/page.tsx (plaintext compare against tradespeople.password_hash
// over the anon key). Moving the check here means:
//   1. The password never has to be shipped to the browser for comparison;
//   2. On success we mint a server-verified, HMAC-signed session token
//      (lib/auth/trade-session.ts) that protected routes such as
//      POST /api/leads/[id]/claim can trust to identify the caller;
//   3. Approval/verification/active gates run on the service-role client, so a
//      disabled or unapproved tradesperson cannot mint a usable token.
//
// NOTE: tradespeople.password_hash is a raw password in the current schema
// (see sql/master-consolidated.sql) — the known auth weakness is that column,
// not this route. This route does not make it worse: it verifies server-side
// and never returns the stored value. Migrating to Supabase Auth / bcrypt is a
// separate workstream; when that lands, only this route needs to change.

import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { issueTradeSessionToken } from "@/lib/auth/trade-session";

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email, password } = (body ?? {}) as {
    email?: unknown;
    password?: unknown;
  };

  if (typeof email !== "string" || email.trim().length === 0) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  if (typeof password !== "string" || password.length === 0) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    // Fail closed: no service-role client => cannot verify credentials safely.
    return NextResponse.json(
      { error: "Service unavailable" },
      { status: 503 },
    );
  }

  const { data: tradesperson, error: lookupError } = await admin
    .from("tradespeople")
    .select("id, email, first_name, is_approved, is_verified, is_active, password_hash")
    .eq("email", email.trim())
    .maybeSingle();

  if (lookupError) {
    console.error("Trade login lookup failed:", lookupError.message);
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  // Deliberately generic — do not reveal whether the account exists.
  if (
    !tradesperson ||
    typeof tradesperson.password_hash !== "string" ||
    !safeEqual(password, tradesperson.password_hash)
  ) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  if (!tradesperson.is_active) {
    return NextResponse.json(
      {
        error: "Account disabled",
        message:
          "Your account is currently disabled. Please contact support for assistance.",
      },
      { status: 403 },
    );
  }

  if (!tradesperson.is_verified) {
    return NextResponse.json(
      {
        error: "Not verified",
        message:
          "Your profile has not been verified by our admin team yet. Please wait for verification before logging in.",
      },
      { status: 403 },
    );
  }

  if (!tradesperson.is_approved) {
    return NextResponse.json(
      {
        error: "Not approved",
        message:
          "Your profile is currently under review by our admin team. You will receive an email notification once your profile is approved.",
      },
      { status: 403 },
    );
  }

  const token = issueTradeSessionToken({
    sub: tradesperson.id,
    email: tradesperson.email,
  });

  if (!token) {
    // TRADE_SESSION_SECRET not configured. Fail closed — the client must NOT
    // proceed to a "logged in" state it cannot back with a usable token.
    console.warn(
      "Trade login: TRADE_SESSION_SECRET is not configured; refusing to issue a session token.",
    );
    return NextResponse.json(
      { error: "Service unavailable" },
      { status: 503 },
    );
  }

  return NextResponse.json({
    token,
    user: {
      id: tradesperson.id,
      email: tradesperson.email,
      firstName: tradesperson.first_name,
      type: "tradesperson",
      isApproved: tradesperson.is_approved,
      isVerified: tradesperson.is_verified,
    },
  });
}
