// lib/auth/admin-guard.ts — shared authorization gate for the administrative
// backend routes under /api/client/admin-secret/*.
//
// Until this guard landed, every one of those routes was reachable by ANY
// anonymous caller with a valid anon key: they performed privileged writes
// (approve/reject/suspend jobs & tradespeople, assign leads, invite trades) with
// no credential check whatsoever. The browser-side "admin dashboard" was a
// localStorage flag (`adminLoggedIn`) that the client set itself — not
// something a server can trust, and it protected no data anyway.
//
// The dashboard UI gates on that localStorage flag but NEVER sends a credential
// on its fetch calls; those calls go to the routes guarded here. See the
// admin-dashboard follow-up note in the Phase 3 report — the UI must present
// `Authorization: Bearer <ADMIN_SECRET_KEY>` on every admin-secret request (or
// be replaced by a real admin login that does).
//
// Design (mirrors lib/auth/trade-session.ts):
//   - No new dependencies: Node `crypto` timingSafeEqual.
//   - Secret: ADMIN_SECRET_KEY (env). While unset (or shorter than 32 chars)
//     the module is NOT configured and verifyAdminSecret fails closed, so no
//     admin route silently downgrades to unauthenticated behaviour.
//   - Credential: `Authorization: Bearer <ADMIN_SECRET_KEY>`. Compare is
//     constant-time and length-guarded.
//
// Use: call verifyAdminSecret(request) as the FIRST statement of an admin-secret
// route handler and return 401 when it is false, before any Supabase client is
// built or any DB work runs.

import crypto from "crypto";
import type { NextRequest } from "next/server";

const MIN_SECRET_LENGTH = 32;

/** True only when ADMIN_SECRET_KEY is set to a usable secret. */
export function isAdminSecretConfigured(): boolean {
  const secret = process.env.ADMIN_SECRET_KEY;
  return typeof secret === "string" && secret.length >= MIN_SECRET_LENGTH;
}

/** Constant-time compare; returns false (never throws) when lengths differ. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/**
 * Verify that a request presents the admin secret as a bearer credential:
 * `Authorization: Bearer <ADMIN_SECRET_KEY>`.
 *
 * Fails closed (returns false) when:
 *   - ADMIN_SECRET_KEY is unset or shorter than MIN_SECRET_LENGTH, or
 *   - the Authorization header is absent / not a well-formed Bearer token, or
 *   - the presented token does not match (constant-time compare).
 */
export function verifyAdminSecret(request: NextRequest): boolean {
  if (!isAdminSecretConfigured()) return false;
  const expected = process.env.ADMIN_SECRET_KEY as string;

  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (!match) return false;

  return safeEqual(match[1], expected);
}
