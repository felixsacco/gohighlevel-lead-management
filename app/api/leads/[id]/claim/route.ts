// DISABLED PENDING AUTHENTICATION — This endpoint reads tradespersonId
// from an unauthenticated request body, which would let anyone claim any
// lead as any tradesperson, or lock every open lead for ten minutes.
// Tradesperson auth (login API route, JWT/session handling, middleware)
// must be built before this endpoint can be re-enabled.
// See: app/login/trade/page.tsx — login is purely client-side
// (localStorage + plaintext password comparison). No server-side session
// exists for tradespeople yet.

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Service unavailable",
      message:
        "Lead claiming is temporarily disabled. Tradesperson authentication " +
        "is under development. Check back soon.",
    },
    { status: 503 },
  );
}
