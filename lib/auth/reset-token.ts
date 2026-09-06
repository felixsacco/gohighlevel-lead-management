// lib/auth/reset-token.ts — short-lived, single-purpose password-reset tokens.
//
// The reset-password pages used to accept an email + new password and overwrite
// `password_hash` straight from the browser over the anon key, with zero proof
// that the caller owned the account email (anyone who knew a verified email
// could seize the account). This module mints a reset token at a server route
// (POST /api/auth/reset/request) that is emailed to the account holder, and a
// second server route (POST /api/auth/reset/confirm) verifies it before hashing
// the new password in by `id`.
//
// Encoding deliberately mirrors lib/auth/trade-session.ts so the two modules
// agree on one scheme: `base64url(json).hex_hmac`, HMAC-SHA256 over the payload
// with a constant-time compare, and the SAME secret env var (TRADE_SESSION_SECRET)
// — no new env var is introduced. The payload carries a `purpose` claim, so a
// trade session token (a different purpose) is rejected here and a reset token
// is rejected by verifyTradeSessionToken: the two verify functions are not
// interchangeable even though they share a secret.
//
// Design:
//   - No new dependencies: Node `crypto` createHmac + timingSafeEqual.
//   - Secret: TRADE_SESSION_SECRET (env). While unset (or shorter than 32 chars)
//     the module is NOT configured: issue/verify both fail closed so a route
//     never silently downgrades to "no proof required".
//   - Token shape: `base64url(json{purpose,type,sub,email,iat,exp}).hex_hmac`.
//     Payload is readable (no secrets inside — just the reset identity), the
//     signature is what authenticates it.
//   - Expiry: fixed 15-minute lifetime (RESET_TTL_MS overridable for tests).
//     A reset link is a credential for changing a password, so it must be far
//     shorter-lived than a session.

import crypto from "crypto";

const PURPOSE = "password-reset";
const RESET_TTL_MS = 15 * 60 * 1000; // 15 minutes
const MIN_SECRET_LENGTH = 32;

export type ResetTokenAccountType = "client" | "tradesperson";

export interface ResetTokenClaims {
  /** Single purpose — this token may only be redeemed as a password reset. */
  purpose: typeof PURPOSE;
  /** Which table `sub` identifies: `clients` or `tradespeople`. */
  type: ResetTokenAccountType;
  /** Row id (uuid) in that table — the identity the reset update targets. */
  sub: string;
  /** Email the reset link was mailed to (display/defensive only). */
  email: string;
  /** Issued-at, ms epoch. */
  iat: number;
  /** Expiry, ms epoch. */
  exp: number;
}

/** True when the shared signing secret is configured. */
export function isResetTokenConfigured(): boolean {
  const secret = process.env.TRADE_SESSION_SECRET;
  return typeof secret === "string" && secret.length >= MIN_SECRET_LENGTH;
}

function secretOrNull(): string | null {
  if (!isResetTokenConfigured()) return null;
  return process.env.TRADE_SESSION_SECRET as string;
}

function base64url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function sign(payloadB64: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payloadB64).digest("hex");
}

/** Constant-time compare; returns false (never throws) when lengths differ. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/**
 * Mint a signed, single-use-URL password-reset token for the account identified
 * by { type, sub, email }. Returns null when the signing secret is not
 * configured (fail closed — never emit a reset link we cannot authenticate).
 */
export function issueResetToken(args: {
  type: ResetTokenAccountType;
  sub: string;
  email: string;
}): string | null {
  const secret = secretOrNull();
  if (!secret) return null;

  const now = Date.now();
  const claims: ResetTokenClaims = {
    purpose: PURPOSE,
    type: args.type,
    sub: args.sub,
    email: args.email,
    iat: now,
    exp: now + RESET_TTL_MS,
  };

  const payload = base64url(JSON.stringify(claims));
  return `${payload}.${sign(payload, secret)}`;
}

/**
 * Verify a raw reset token and return its claims, or null on any failure.
 * Fails closed: unset secret, malformed payload, wrong purpose (including a
 * trade session token), bad signature, or expiry all return null.
 */
export function verifyResetToken(token: string): ResetTokenClaims | null {
  if (!isResetTokenConfigured()) {
    return null;
  }
  const secret = process.env.TRADE_SESSION_SECRET as string;

  const dot = token.indexOf(".");
  if (dot <= 0 || dot === token.length - 1) {
    return null;
  }
  const payloadB64 = token.slice(0, dot);
  const signature = token.slice(dot + 1);

  const expected = sign(payloadB64, secret);
  if (!safeEqual(signature, expected)) {
    return null;
  }

  let claims: ResetTokenClaims;
  try {
    const parsed = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      parsed.purpose !== PURPOSE ||
      (parsed.type !== "client" && parsed.type !== "tradesperson") ||
      typeof parsed.sub !== "string" ||
      parsed.sub.length === 0 ||
      typeof parsed.email !== "string" ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }
    claims = parsed as ResetTokenClaims;
  } catch {
    return null;
  }

  if (claims.exp <= Date.now()) {
    return null;
  }

  return claims;
}
