// lib/auth/password.ts — scrypt password hashing for tradesperson accounts.
//
// tradespeople.password_hash previously held the raw password (see
// sql/master-consolidated.sql for the historical note). This module is the
// single place that turns a password into a stored value and back, so the DB
// never needs to hold a recoverable credential again.
//
// Why scrypt (node:crypto) rather than a pure-JS bcrypt package:
//   - node:crypto is a built-in — no new dependency, no native-build surface,
//     and it is available on the default Node serverless runtime (these route
//     handlers do not opt in to edge, so crypto.scrypt is present).
//   - Cost parameters are stored in the hash string itself, so they can be
//     raised in the future without invalidating previously stored hashes.
//
// Parameters: N=16384, r=8, p=1 (Node's defaults). Memory use is
// 128 * N * r = 16 MiB, which fits comfortably under Node's default maxmem of
// 32 MiB and is appropriate for serverless function memory. Do NOT raise N to
// 2^17 (OWASP's recommendation for beefy hardware) without also raising
// maxmem — 128 * 131072 * 8 = 128 MiB exceeds the default and every derive
// would throw.
//
// Stored format (self-describing): scrypt$<N>$<r>$<p>$<saltHex>$<hashHex>
//
// NOTE: this util is intentionally scrypt-strict. The one-time migration path
// for legacy plaintext rows (accounts created before hashing landed) lives in
// the login route, not here — see app/api/auth/trade/login/route.ts.

import crypto from "crypto";

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64; // 512-bit derived key
const SALT_BYTES = 16;
const PREFIX = "scrypt";
const PARTS = 6; // prefix, N, r, p, saltHex, hashHex

function scryptAsync(
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number },
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // crypto.scrypt has an overload where options is optional; wrapping it in a
    // Promise avoids the promisify typing gymnastics under tsconfig strict:false.
    crypto.scrypt(password, salt, keylen, options, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

export function isScryptHash(stored: string): boolean {
  return stored.startsWith(`${PREFIX}$`) && stored.split("$").length === PARTS;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_BYTES);
  const derivedKey = await scryptAsync(password, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });
  return [
    PREFIX,
    String(SCRYPT_N),
    String(SCRYPT_R),
    String(SCRYPT_P),
    salt.toString("hex"),
    derivedKey.toString("hex"),
  ].join("$");
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  // Strictly scrypt. Anything that does not parse as one of our hashes is
  // rejected here — legacy-plaintext handling is the login route's job.
  if (!isScryptHash(stored)) return false;

  const parts = stored.split("$");
  const [, nStr, rStr, pStr, saltHex, hashHex] = parts;

  const N = Number(nStr);
  const r = Number(rStr);
  const p = Number(pStr);
  if (
    !Number.isInteger(N) ||
    !Number.isInteger(r) ||
    !Number.isInteger(p) ||
    N <= 0 ||
    r <= 0 ||
    p <= 0
  ) {
    return false;
  }

  // Bound the attacker-supplied cost parameters that we are about to feed back
  // into scrypt: never let a stored hash force a huge memory allocation on our
  // servers. 128 * N * r bytes must stay under Node's maxmem (32 MiB default).
  if (N > 262144 || r > 32 || p > 8 || 128 * N * r > 32 * 1024 * 1024) {
    return false;
  }

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  if (salt.length === 0 || expected.length === 0) return false;

  const derived = await scryptAsync(password, salt, expected.length, {
    N,
    r,
    p,
  });
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

// Constant-time equality for plaintext comparison. Only used for the one-time
// legacy-plaintext upgrade in the login route — never as the primary path.
export function safeEqualText(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}
