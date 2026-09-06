// app/api/auth/client/register/route.ts — server-side client (customer) signup.
//
// Replaces the client-side insert that used to live in
// app/register/client/page.tsx, which wrote `password_hash: formData.password`
// (the raw password) straight into the database over the anon key. Here the
// password is hashed with scrypt (lib/auth/password.ts) on the server before it
// ever reaches Supabase, and the write runs on the service-role client.
//
// After a successful insert the page continues to the existing
// /api/send-verification-email flow (emailed code captcha) unchanged — this
// route does not send email or grant verification. New clients start
// is_verified:false / is_active:false exactly as before; nothing is
// self-granted.

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { hashPassword } from "@/lib/auth/password";

// Server-side authority matching app/register/client/page.tsx's own rules: at
// least 8 chars with one lowercase, one uppercase and one digit. Short or weak
// passwords are cheap to brute-force against a stolen hash, so refuse them even
// if a cleared client form would have.
const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_COMPLEXITY = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    email,
    password,
    firstName,
    lastName,
    phone,
    postcode,
    address,
  } = (body ?? {}) as {
    email?: unknown;
    password?: unknown;
    firstName?: unknown;
    lastName?: unknown;
    phone?: unknown;
    postcode?: unknown;
    address?: unknown;
  };

  // ---- field validation (server-side authority; mirrors the page's rules) ----
  const emailValue =
    typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!emailValue || !emailValue.includes("@")) {
    return NextResponse.json(
      { error: "Please enter a valid email address" },
      { status: 400 },
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

  const firstNameValue =
    typeof firstName === "string" && firstName.trim().length >= 2
      ? firstName.trim()
      : null;
  if (!firstNameValue) {
    return NextResponse.json(
      { error: "Please enter your first name" },
      { status: 400 },
    );
  }

  const lastNameValue =
    typeof lastName === "string" ? lastName.trim() : "";
  const phoneValue = typeof phone === "string" ? phone.trim() : "";
  const postcodeValue =
    typeof postcode === "string" && postcode.trim().length >= 5
      ? postcode.trim()
      : "";
  const addressValue =
    typeof address === "string" && address.trim().length >= 10
      ? address.trim()
      : "";

  if (!postcodeValue) {
    return NextResponse.json(
      { error: "Please enter your postcode" },
      { status: 400 },
    );
  }
  if (!addressValue) {
    return NextResponse.json(
      { error: "Please enter your full address" },
      { status: 400 },
    );
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    // Fail closed: no service-role client => cannot hash-and-insert securely.
    return NextResponse.json(
      { error: "Service unavailable" },
      { status: 503 },
    );
  }

  // Duplicate-email guard (mirrors the page's current pre-check). A walk-in
  // sentinel row still blocks re-registration of that email — out of scope here.
  const { data: existing, error: checkError } = await admin
    .from("clients")
    .select("id")
    .eq("email", emailValue)
    .maybeSingle();

  if (checkError) {
    console.error("Client register: duplicate check failed:", checkError.message);
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
  if (existing) {
    return NextResponse.json(
      { error: "This email is already registered. Please sign in instead." },
      { status: 400 },
    );
  }

  let passwordHash: string;
  try {
    passwordHash = await hashPassword(password);
  } catch (hashError) {
    console.error("Client register: password hashing failed:", hashError);
    return NextResponse.json(
      { error: "Failed to secure your account. Please try again." },
      { status: 500 },
    );
  }

  const { error: insertError } = await admin.from("clients").insert({
    email: emailValue,
    password_hash: passwordHash,
    first_name: firstNameValue,
    last_name: lastNameValue,
    phone: phoneValue || null,
    postcode: postcodeValue,
    address: addressValue,
    is_verified: false,
    is_active: false,
  });

  if (insertError) {
    // A concurrent signup could still slip past the pre-check and hit the
    // unique-email constraint — surface the same duplicate message.
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: "This email is already registered. Please sign in instead." },
        { status: 400 },
      );
    }
    console.error("Client register: insert failed:", insertError.message);
    return NextResponse.json(
      { error: "Failed to create your account. Please try again." },
      { status: 500 },
    );
  }

  // The page then runs the existing email-code verification flow
  // (/api/send-verification-email) against this email — unchanged.
  return NextResponse.json({ success: true });
}
