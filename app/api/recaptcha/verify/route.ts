import { NextRequest, NextResponse } from "next/server";

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_PROJECT_ID = process.env.RECAPTCHA_PROJECT_ID;

export async function POST(req: NextRequest) {
  try {
    if (!RECAPTCHA_SECRET) {
      return NextResponse.json(
        { success: false, error: "reCAPTCHA not configured on server" },
        { status: 500 }
      );
    }

    const { token } = await req.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing reCAPTCHA token" },
        { status: 400 }
      );
    }

    // Google reCAPTCHA v3 / Enterprise assessment endpoint
    const url = RECAPTCHA_PROJECT_ID
      ? `https://recaptchaenterprise.googleapis.com/v1/projects/${RECAPTCHA_PROJECT_ID}/assessments?key=${RECAPTCHA_SECRET}`
      : `https://www.google.com/recaptcha/api/siteverify`;

    const body = RECAPTCHA_PROJECT_ID
      ? JSON.stringify({
          event: {
            token,
            siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
          },
        })
      : new URLSearchParams({
          secret: RECAPTCHA_SECRET,
          response: token,
        }).toString();

    const isEnterprise = !!RECAPTCHA_PROJECT_ID;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": isEnterprise ? "application/json" : "application/x-www-form-urlencoded" },
      body,
    });

    const data = await res.json();

    if (isEnterprise) {
      const score = data?.tokenProperties?.valid ? data?.riskAnalysis?.score ?? 0 : 0;
      return NextResponse.json({ success: score >= 0.3, score });
    }

    return NextResponse.json({
      success: data.success === true,
      score: data.score,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Verification failed" },
      { status: 500 }
    );
  }
}
