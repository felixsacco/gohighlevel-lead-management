// app/api/auth/trade/logout/route.ts — clears the HttpOnly trade_session cookie.
//
// The login route mints the session token into an HttpOnly cookie so
// server-rendered pages can authenticate the trade. An HttpOnly cookie cannot be
// removed from the client, so logout must call this route: it overwrites the
// cookie with an empty value and maxAge 0, which the browser immediately expires.
// The client-side token in localStorage is cleared by the dashboard's
// handleLogout as before — this route only kills the server-side cookie.

import { NextRequest, NextResponse } from "next/server";
import { TRADE_SESSION_COOKIE } from "@/lib/auth/trade-session";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true });

  response.cookies.set(TRADE_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
    maxAge: 0,
  });

  return response;
}
