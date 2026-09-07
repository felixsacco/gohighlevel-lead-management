// =============================================================================
// Admin session cookie — stateless, HMAC-SHA256 signed (Web Crypto only)
// =============================================================================
// The /admin shell is gated by HTTP Basic (middleware.ts), but browser-side code
// must NEVER carry ADMIN_SECRET_KEY (it would ship in the client bundle). So the
// Basic-auth success path mints this short-lived session cookie, and the
// dashboard's admin-secret calls go through /api/admin/proxy/*, which validates
// the cookie here and injects the `Authorization: Bearer ADMIN_SECRET_KEY` header
// server-side.
//
// Token format (mirrors the shape of lib/auth/trade-session.ts, but Web Crypto so
// it runs identically in the Edge runtime used by middleware and in Node route
// handlers):
//
//   <base64url(JSON{role:"admin",iat,exp})>.<hex(HMAC-SHA256(payload, ADMIN_SECRET_KEY))>
//
// Security posture:
//   * ADMIN_SECRET_KEY is reused as the HMAC signing secret — no new env config,
//     and it is already >= 32 chars per lib/auth/admin-guard.
//   * Fail closed: while ADMIN_SECRET_KEY is unset or under 32 chars, mint()
//     returns null (no cookie is issued) and verify() returns null (proxy 401s),
//     so an unconfigured secret can never mint a valid session.
//   * Verification uses crypto.subtle.verify (constant-time) plus an exp check.
//   * Deliberately uses NO node:crypto / Buffer / timingSafeEqual so the module
//     is importable from Edge middleware.
// =============================================================================

export const ADMIN_SESSION_COOKIE = "admin_session";

// 12 hours — long enough that an admin re-opening the console stays signed in for
// a working day, short enough that a leaked cookie is not a standing credential.
// The stateless token re-signs on every Basic-authed /admin request, so activity
// within that window keeps a valid session fresh.
export const ADMIN_SESSION_TTL_SECONDS = 12 * 60 * 60;

const ADMIN_SESSION_MIN_SECRET_LENGTH = 32;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export interface AdminSessionPayload {
  role: "admin";
  iat: number; // seconds since epoch, issued at
  exp: number; // seconds since epoch, expires
}

/** ADMIN_SECRET_KEY when present and >= 32 chars, else null (fail closed). */
function adminSessionSecret(): string | null {
  const secret = process.env.ADMIN_SECRET_KEY;
  if (!secret || secret.length < ADMIN_SESSION_MIN_SECRET_LENGTH) {
    return null;
  }
  return secret;
}

function toBytes(text: string): Uint8Array {
  return textEncoder.encode(text);
}

// crypto.subtle wants a BufferSource backed by a real ArrayBuffer, but
// TextEncoder.encode types its result as Uint8Array<ArrayBufferLike>. Copy into
// a fresh ArrayBuffer so the subtle calls typecheck and behave identically
// across runtimes.
function toByteBuffer(text: string): ArrayBuffer {
  const encoded = textEncoder.encode(text);
  const buffer = new ArrayBuffer(encoded.byteLength);
  new Uint8Array(buffer).set(encoded);
  return buffer;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(input: string): Uint8Array {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToArrayBuffer(hex: string): ArrayBuffer {
  const buffer = new ArrayBuffer(hex.length / 2);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < view.length; i++) {
    view[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return buffer;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return globalThis.crypto.subtle.importKey(
    "raw",
    toByteBuffer(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/**
 * Mint a signed admin session token, or null when ADMIN_SECRET_KEY is unset or
 * under 32 chars (the middleware then simply does not issue a cookie).
 */
export async function mintAdminSession(
  nowSeconds: number = Math.floor(Date.now() / 1000),
): Promise<string | null> {
  const secret = adminSessionSecret();
  if (!secret) return null;

  const payload = JSON.stringify({
    role: "admin",
    iat: nowSeconds,
    exp: nowSeconds + ADMIN_SESSION_TTL_SECONDS,
  });
  const payloadB64Url = bytesToBase64Url(toBytes(payload));
  const key = await hmacKey(secret);
  const signature = await globalThis.crypto.subtle.sign(
    "HMAC",
    key,
    toByteBuffer(payloadB64Url),
  );
  return `${payloadB64Url}.${toHex(signature)}`;
}

/**
 * Verify an admin session token. Returns the payload on success, null on any
 * failure (malformed token, bad signature, wrong role, expired, or secret not
 * configured) — the proxy treats null as 401, so this fails closed.
 */
export async function verifyAdminSessionToken(
  token: string | null | undefined,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): Promise<AdminSessionPayload | null> {
  if (!token) return null;

  const secret = adminSessionSecret();
  if (!secret) return null;

  const dot = token.lastIndexOf(".");
  if (dot <= 0 || dot === token.length - 1) return null;

  const payloadB64Url = token.slice(0, dot);
  const signatureHex = token.slice(dot + 1);

  // Constant-time signature check. crypto.subtle.verify compares in constant
  // time; we additionally require a well-formed hex signature first so a
  // malformed token is rejected cleanly rather than parsed ambiguously.
  if (signatureHex.length % 2 !== 0 || !/^[0-9a-f]+$/.test(signatureHex)) {
    return null;
  }

  const key = await hmacKey(secret);
  let valid: boolean;
  try {
    valid = await globalThis.crypto.subtle.verify(
      "HMAC",
      key,
      hexToArrayBuffer(signatureHex),
      toByteBuffer(payloadB64Url),
    );
  } catch {
    return null;
  }
  if (!valid) return null;

  let payload: AdminSessionPayload;
  try {
    const decoded = textDecoder.decode(base64UrlToBytes(payloadB64Url));
    const parsed = JSON.parse(decoded);
    if (parsed?.role !== "admin") return null;
    if (typeof parsed.iat !== "number" || typeof parsed.exp !== "number") {
      return null;
    }
    payload = { role: "admin", iat: parsed.iat, exp: parsed.exp };
  } catch {
    return null;
  }

  if (payload.exp <= nowSeconds) return null;

  return payload;
}
