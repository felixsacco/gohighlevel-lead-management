// lib/auth/trade-session.ts — server-only session tokens for tradespeople.
//
// The tradesperson login used to be entirely client-side: the browser compared
// a plaintext password against `tradespeople.password_hash` via the Supabase
// anon key and forged a localStorage identity blob. Nothing about that is a
// credential a server route can trust, so any route that gates on the caller
// being a *specific* tradesperson (e.g. POST /api/leads/[id]/claim) must not
// accept a client-supplied id.
//
// This module issues a minimal HMAC-SHA256 signed token at a server-side login
// (app/api/auth/trade/login/route.ts) and verifies it here. The identity is
// carried inside the signed payload, so a route can derive `sub` from the token
// alone — never from an unauthenticated request body.
//
// Design:
//   - No new dependencies: Node `crypto` createHmac + timingSafeEqual.
//   - Secret: TRADE_SESSION_SECRET (env). While unset (or shorter than 32
//     chars) the module is NOT configured: issue/verify both fail closed so no
//     route silently downgrades to unauthenticated behaviour.
//   - Token shape: `base64url(json{role,sub,email,iat,exp}).hex_hmac`.
//     Payload is readable (no secrets inside — just the actor identity), the
//     signature is what authenticates it.
//   - Expiry: fixed 24h lifetime (TRADE_SESSION_TTL_MS overridable for tests).

import crypto from "crypto";
import type { NextRequest } from "next/server";

const ROLE = "tradesperson";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MIN_SECRET_LENGTH = 32;

export interface TradeSessionClaims {
  /** tradespeople.id (uuid) — the actor identity for authorising routes. */
  sub: string;
  /** Denormalised so the token carries the friendly role check cheaply. */
  role: "tradesperson";
  /** Login email, for display only — never authoritative. */
  email: string;
  /** Issued-at, ms epoch. */
  iat: number;
  /** Expiry, ms epoch. */
  exp: number;
}

export type TradeSessionResult =
  | { ok: true; claims: TradeSessionClaims }
  | { ok: false; reason: "not_configured" | "malformed" | "bad_signature" | "expired" };

export function isTradeSessionConfigured(): boolean {
  const secret = process.env.TRADE_SESSION_SECRET;
  return typeof secret === "string" && secret.length >= MIN_SECRET_LENGTH;
}

function secretOrNull(): string | null {
  if (!isTradeSessionConfigured()) return null;
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
 * Mint a signed session token for a verified, approved, active tradesperson.
 * Returns null when TRADE_SESSION_SECRET is not configured (fail closed).
 */
export function issueTradeSessionToken(
  args: { sub: string; email: string },
): string | null {
  const secret = secretOrNull();
  if (!secret) return null;

  const now = Date.now();
  const claims: TradeSessionClaims = {
    role: ROLE,
    sub: args.sub,
    email: args.email,
    iat: now,
    exp: now + SESSION_TTL_MS,
  };

  const payload = base64url(JSON.stringify(claims));
  return `${payload}.${sign(payload, secret)}`;
}

/**
 * Verify a raw token string. Fails closed: null/unset secret, malformed
 * payload, bad signature, or expiry all return { ok: false }.
 */
export function verifyTradeSessionToken(token: string): TradeSessionResult {
  if (!isTradeSessionConfigured()) {
    return { ok: false, reason: "not_configured" };
  }
  const secret = process.env.TRADE_SESSION_SECRET as string;

  const dot = token.indexOf(".");
  if (dot <= 0 || dot === token.length - 1) {
    return { ok: false, reason: "malformed" };
  }
  const payloadB64 = token.slice(0, dot);
  const signature = token.slice(dot + 1);

  const expected = sign(payloadB64, secret);
  if (!safeEqual(signature, expected)) {
    return { ok: false, reason: "bad_signature" };
  }

  let claims: TradeSessionClaims;
  try {
    const parsed = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof parsed.sub !== "string" ||
      parsed.role !== ROLE ||
      typeof parsed.exp !== "number"
    ) {
      return { ok: false, reason: "malformed" };
    }
    claims = parsed as TradeSessionClaims;
  } catch {
    return { ok: false, reason: "malformed" };
  }

  if (claims.exp <= Date.now()) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true, claims };
}

/**
 * Extract and verify a trade session token from a request's Authorization
 * header (`Bearer <token>`). Convenience for route handlers.
 */
export function authorizeTradeSession(
  request: NextRequest,
): TradeSessionResult {
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (!match) {
    return { ok: false, reason: "malformed" };
  }
  return verifyTradeSessionToken(match[1]);
}
