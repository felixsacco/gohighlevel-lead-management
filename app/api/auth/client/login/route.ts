// app/api/auth/client/login/route.ts — server-side client (customer) login.
//
// Replaces the client-side credential check that used to live in
// app/login/client/page.tsx and app/login/page.tsx (plaintext compare against
// clients.password_hash over the anon key). Moving the check here means:
//   1. The password never has to be shipped to the browser for comparison;
//   2. The verify/upgrade gates run on the service-role client, so an
//      unverified client cannot mint a usable token.
//
// This mirrors app/api/auth/trade/login/route.ts for structure and error shape,
// with two deliberate differences:
//   - Clients have NO approval gate: only `is_verified` is checked (a client is
//     verified by the emailed code at /verify-captcha). Gate on is_verified only,
//     exactly like the old /login/client page did.
//   - The bearer token keeps the historical FORMAT `client_<id>_<timestamp>`
//     (what consumers already accept) but is now minted server-side, so a
//     browser cannot self-issue a "logged in" state it could not prove.
//
// Passwords are hashed with scrypt (lib/auth/password.ts) at registration and
// verified against the hash here, server-side, never returned to the browser.
// Any stored value that is not an scrypt hash is a legacy raw-password row
// (created before hashing landed) OR the 'ANONYMOUS_NOT_SET' walk-in sentinel.
// Legacy rows get a one-time, timing-safe plaintext comparison and are upgraded
// to a scrypt hash in place on first successful login. The sentinel NEVER
// matches a presented password and is never hashed, overwritten, or destroyed:
// a walk-in row simply falls through to the generic 401 below.

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  hashPassword,
  isScryptHash,
  safeEqualText,
  verifyPassword,
} from "@/lib/auth/password";

// Sentinel marking walk-in (no self-serve password) client rows. Must never be
// compared as a real credential, hashed, or overwritten.
const WALK_IN_SENTINEL = "ANONYMOUS_NOT_SET";

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

  const { data: client, error: lookupError } = await admin
    .from("clients")
    .select("id, email, first_name, is_verified, password_hash")
    .eq("email", email.trim())
    .maybeSingle();

  if (lookupError) {
    console.error("Client login lookup failed:", lookupError.message);
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  // Deliberately generic — do not reveal whether the account exists.
  const storedHash: string | null =
    client && typeof client.password_hash === "string"
      ? client.password_hash
      : null;

  // A stored value that is not an scrypt hash is a legacy raw-password row
  // (written before hashing landed) or the walk-in sentinel. Legacy rows get a
  // one-time, timing-safe plaintext comparison and are upgraded in place below
  // on success. The sentinel is never a valid credential — guard it so it can
  // never be matched (e.g. by the literal string) and thus never hashed.
  const isLegacyPlaintext =
    storedHash !== null &&
    storedHash !== WALK_IN_SENTINEL &&
    !isScryptHash(storedHash);

  let passwordMatches = false;
  if (storedHash !== null && storedHash !== WALK_IN_SENTINEL) {
    passwordMatches = isLegacyPlaintext
      ? safeEqualText(password, storedHash)
      : await verifyPassword(password, storedHash);
  }

  if (!client || !passwordMatches) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  // One-time legacy upgrade. The presented password was confirmed against a
  // raw-password row, so overwrite it with a scrypt hash to scrub the plaintext
  // from the DB. Non-fatal if the write fails (login still succeeds) but logged
  // loudly so it can be retried. The sentinel can never reach here (it never
  // matches), so we never risk hashing or overwriting it.
  if (isLegacyPlaintext) {
    try {
      const newHash = await hashPassword(password);
      const { error: upgradeError } = await admin
        .from("clients")
        .update({ password_hash: newHash })
        .eq("id", client.id);
      if (upgradeError) {
        console.warn(
          "Client login: legacy plaintext verified but hash write-back failed for",
          client.email,
          upgradeError.message,
        );
      } else {
        console.warn(
          "Client login: upgraded legacy plaintext password to scrypt hash for",
          client.email,
        );
      }
    } catch (hashError) {
      console.warn(
        "Client login: legacy password upgrade failed for",
        client.email,
        hashError instanceof Error ? hashError.message : String(hashError),
      );
    }
  }

  if (!client.is_verified) {
    // Preserves /login/client's current gate and message (the page maps this
    // 403 to its "check your inbox for the verification email" prompt).
    return NextResponse.json(
      {
        error: "Not verified",
        message:
          "Please verify your email address before logging in. Check your inbox for the verification email.",
      },
      { status: 403 },
    );
  }

  // Keep the historical client token FORMAT (consumers already validate it) but
  // mint it server-side: the caller could not have reached this point without a
  // correct password, so the token is now proof of a server-verified login.
  const token = `client_${client.id}_${Date.now()}`;

  return NextResponse.json({
    token,
    user: {
      id: client.id,
      email: client.email,
      firstName: client.first_name,
      type: "client",
      isVerified: client.is_verified,
    },
  });
}
