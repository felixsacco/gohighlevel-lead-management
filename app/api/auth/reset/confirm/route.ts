// app/api/auth/reset/confirm/route.ts — redeems an emailed reset token and
// hashes a new password. Replaces the three old reset-password pages, which let
// anyone who knew a verified account's email overwrite password_hash in
// plaintext over the anon key with zero proof of ownership.
//
// Security invariants:
//   - The token is verified server-side (lib/auth/reset-token.ts): HMAC-signed,
//     15-minute TTL, purpose-locked to password-reset. A null verification
//     returns a generic 401 — invalid, expired, wrong-purpose (including a trade
//     session token) or tampered links all look the same.
//   - The row is loaded by payload.sub (the id signed into the token) in the
//     payload.type table. The caller's email NEVER drives the update, so a token
//     minted for account A cannot be used against account B.
//   - The new password is scrypt-hashed here, server-side, before the write.
//   - The 'ANONYMOUS_NOT_SET' walk-in sentinel is refused: it is never hashed or
//     overwritten. (Not reachable via the legit path — sentinel rows are never
//     verified so reset/request never emails them — but cheap insurance that
//     mirrors the scrub script's rule.)

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyResetToken, type ResetTokenAccountType } from "@/lib/auth/reset-token";
import { hashPassword } from "@/lib/auth/password";

// Sentinel marking walk-in (no self-serve password) client rows. Must never be
// hashed or overwritten.
const WALK_IN_SENTINEL = "ANONYMOUS_NOT_SET";

const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_COMPLEXITY = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

function tableFor(type: ResetTokenAccountType): "clients" | "tradespeople" {
  return type === "tradesperson" ? "tradespeople" : "clients";
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { token, password } = (body ?? {}) as {
    token?: unknown;
    password?: unknown;
  };

  if (typeof token !== "string" || token.length === 0) {
    return NextResponse.json(
      { error: "Invalid or expired reset link" },
      { status: 401 },
    );
  }
  if (
    typeof password !== "string" ||
    password.length < MIN_PASSWORD_LENGTH ||
    !PASSWORD_COMPLEXITY.test(password)
  ) {
    return NextResponse.json(
      {
        error:
          "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter and a number",
      },
      { status: 400 },
    );
  }

  const claims = verifyResetToken(token);
  if (claims === null) {
    // Generic — expired, tampered, wrong purpose or unconfigured secret all
    // land here and must not reveal which.
    return NextResponse.json(
      { error: "Invalid or expired reset link" },
      { status: 401 },
    );
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    // Fail closed: cannot write the hash without the service-role client.
    return NextResponse.json(
      { error: "Service unavailable" },
      { status: 503 },
    );
  }

  const table = tableFor(claims.type);

  // Load by the SIGNED id, never by caller-supplied email.
  const { data: account, error: lookupError } = await admin
    .from(table)
    .select("id, email, password_hash")
    .eq("id", claims.sub)
    .maybeSingle();

  if (lookupError) {
    console.error(`[reset/confirm] lookup failed on ${table}:`, lookupError.message);
    return NextResponse.json(
      { error: "Service unavailable" },
      { status: 503 },
    );
  }

  // Token can be valid yet reference a deleted row — indistinguishable on purpose.
  if (!account) {
    return NextResponse.json(
      { error: "Invalid or expired reset link" },
      { status: 401 },
    );
  }

  // Defensive guard: never hash or overwrite the walk-in sentinel. Even though
  // reset/request only emails verified accounts, refuse loudly if this ever
  // fires so it cannot silently destroy the sentinel.
  if (
    typeof account.password_hash === "string" &&
    account.password_hash === WALK_IN_SENTINEL
  ) {
    console.error(
      "[reset/confirm] refused to overwrite ANONYMOUS_NOT_SET sentinel for",
      account.email,
    );
    return NextResponse.json(
      { error: "Invalid or expired reset link" },
      { status: 401 },
    );
  }

  let newHash: string;
  try {
    newHash = await hashPassword(password);
  } catch (hashError) {
    console.error("[reset/confirm] password hashing failed:", hashError);
    return NextResponse.json(
      { error: "Failed to secure your account. Please try again." },
      { status: 500 },
    );
  }

  // Update by the SIGNED id. Log email only, never the password or hash.
  const { error: updateError } = await admin
    .from(table)
    .update({ password_hash: newHash })
    .eq("id", claims.sub);

  if (updateError) {
    console.error("[reset/confirm] update failed:", updateError.message);
    return NextResponse.json(
      { error: "Failed to update your password. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    message: "Your password has been reset. Please sign in with your new password.",
  });
}
