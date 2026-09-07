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
// Passwords are hashed with scrypt (lib/auth/password.ts) at registration and
// verified against the hash here, server-side, never returned to the browser.
// Any stored value that is not an scrypt hash is a legacy raw-password row
// (created before hashing landed). Those get a one-time, timing-safe plaintext
// comparison and are upgraded to a scrypt hash in place on the first successful
// login, so plaintext does not linger in the database.

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  issueTradeSessionToken,
  TRADE_SESSION_COOKIE,
  TRADE_SESSION_TTL_SECONDS,
} from "@/lib/auth/trade-session";
import {
  hashPassword,
  isScryptHash,
  safeEqualText,
  verifyPassword,
} from "@/lib/auth/password";

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
  const storedHash: string | null =
    tradesperson && typeof tradesperson.password_hash === "string"
      ? tradesperson.password_hash
      : null;

  // A stored value that is not an scrypt hash is a legacy raw-password row
  // (written before hashing landed). It gets a one-time, timing-safe plaintext
  // comparison and is upgraded in place below on success.
  const isLegacyPlaintext = storedHash !== null && !isScryptHash(storedHash);

  let passwordMatches = false;
  if (storedHash !== null) {
    passwordMatches = isLegacyPlaintext
      ? safeEqualText(password, storedHash)
      : await verifyPassword(password, storedHash);
  }

  if (!tradesperson || !passwordMatches) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  // One-time legacy upgrade. The presented password was confirmed against a
  // raw-password row, so overwrite it with a scrypt hash to scrub the plaintext
  // from the DB. Runs before the account gates: even a pending (not-yet-
  // approved) account that proves its password must not leave plaintext on
  // disk. Non-fatal if the write fails (login still succeeds) but logged loudly
  // so it can be retried.
  if (isLegacyPlaintext) {
    try {
      const newHash = await hashPassword(password);
      const { error: upgradeError } = await admin
        .from("tradespeople")
        .update({ password_hash: newHash })
        .eq("id", tradesperson.id);
      if (upgradeError) {
        console.warn(
          "Trade login: legacy plaintext verified but hash write-back failed for",
          tradesperson.email,
          upgradeError.message,
        );
      } else {
        console.warn(
          "Trade login: upgraded legacy plaintext password to scrypt hash for",
          tradesperson.email,
        );
      }
    } catch (hashError) {
      console.warn(
        "Trade login: legacy password upgrade failed for",
        tradesperson.email,
        hashError instanceof Error ? hashError.message : String(hashError),
      );
    }
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

  const response = NextResponse.json({
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

  // Attach the session token as an HttpOnly cookie too, so server-rendered pages
  // (e.g. /leads/[id]) and the checkout route can authenticate without the client
  // sending the token. The login page keeps storing token/user in localStorage
  // for existing client-side calls; the cookie only *additionally* authenticates
  // the trade across server components. TTL is derived from the token lifetime,
  // so the cookie never outlives the token's 24h exp.
  response.cookies.set(TRADE_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
    maxAge: TRADE_SESSION_TTL_SECONDS,
  });

  return response;
}
