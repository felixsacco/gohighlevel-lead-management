import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  mintAdminSession,
} from "./lib/auth/admin-session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin", charset="UTF-8"',
      },
    });
  }

  const credentials = atob(authHeader.slice(6));
  const [user, pass] = credentials.split(":");

  const expectedUser = process.env.ADMIN_BASIC_USER;
  const expectedPass = process.env.ADMIN_BASIC_PASS;

  if (!expectedUser || !expectedPass) {
    return new NextResponse("Admin auth not configured", { status: 500 });
  }

  if (user !== expectedUser || pass !== expectedPass) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin", charset="UTF-8"',
      },
    });
  }

  // Basic auth succeeded. The browser cannot carry ADMIN_SECRET_KEY (it must
  // never ship in client code), so every admin-secret call is routed through
  // /api/admin/proxy/* instead. That proxy validates this cookie and injects the
  // Authorization: Bearer header server-side. Minting here means the HttpOnly
  // session cookie exists only after real Basic credentials were supplied.
  const sessionToken = await mintAdminSession();

  const response = NextResponse.next();
  if (sessionToken) {
    response.cookies.set(ADMIN_SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      path: "/",
      maxAge: ADMIN_SESSION_TTL_SECONDS,
    });
  }
  return response;
}

export const config = {
  // Basic-auth protects the /admin page shell only. Every /api/client/admin-secret/*
  // handler enforces its own Bearer ADMIN_SECRET_KEY gate (lib/auth/admin-guard),
  // so the API is intentionally NOT listed here — the browser reaches it through
  // /api/admin/proxy/*, which validates the admin_session cookie instead and is
  // therefore likewise excluded from Basic auth (a session, not Basic, is its gate).
  matcher: ["/admin/:path*"],
};
