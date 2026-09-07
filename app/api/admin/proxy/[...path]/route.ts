import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/auth/admin-session";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Server-side proxy for the admin dashboard.
//
// The /api/client/admin-secret/* handlers are gated by a Bearer ADMIN_SECRET_KEY
// header (lib/auth/admin-guard). The browser cannot supply that header — the
// secret must never ship in client code — so instead of calling those endpoints
// directly the dashboard calls this route, which:
//   1. validates the HttpOnly admin_session cookie that middleware mints only
//      after HTTP Basic auth succeeds (never a client-supplied credential),
//   2. allows only a known set of target paths,
//   3. injects `Authorization: Bearer ${ADMIN_SECRET_KEY}` server-side,
//   4. forwards method / body / query to the real endpoint and relays its reply.
// ---------------------------------------------------------------------------

// The one-segment admin-secret endpoints this proxy may forward to. A path that
// does not resolve to one of these is rejected before any network call.
const ONE_SEGMENT_ENDPOINTS = new Set([
  "approve-application",
  "approve-job",
  "assign-job",
  "invite-tradespeople",
  "job-applications",
  "jobs",
  "reactivate-tradesperson",
  "reject-application",
  "review-tradesperson",
  "suspend-tradesperson",
  "tradespeople",
  "verify-tradesperson",
]);

// The only two-segment shape is the tradesperson detail endpoint tradespeople/<id>.
const MAX_TWO_SEGMENT_ID_LENGTH = 200;

const METHODS_WITH_BODY = new Set(["POST", "PUT", "PATCH", "DELETE"]);

async function proxy(
  request: NextRequest,
  segments: string[],
): Promise<NextResponse> {
  // 1) Authorize via the admin session cookie only. A client that lacks it (no
  //    Basic-authed session) gets 401 regardless of any header it sends.
  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifyAdminSessionToken(sessionCookie);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2) Path allowlist. segments comes from the [...path] catch-all, so it never
  //    contains slashes; anything not matching a known endpoint is refused.
  if (segments.length < 1 || segments.length > 2) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const [first, second] = segments;
  if (!ONE_SEGMENT_ENDPOINTS.has(first)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (second !== undefined) {
    const detailEndpointAllowed =
      first === "tradespeople" &&
      second.length > 0 &&
      second.length <= MAX_TWO_SEGMENT_ID_LENGTH;
    if (!detailEndpointAllowed) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  const upstreamUrl = new URL(
    `${request.nextUrl.origin}/api/client/admin-secret/${segments.join("/")}`,
  );
  upstreamUrl.search = request.nextUrl.search;

  // 3) Forward method / body / query, never the caller's authorization, cookie,
  //    or host headers. The bearer secret is injected here, server-side only.
  const headers: Record<string, string> = {
    authorization: `Bearer ${process.env.ADMIN_SECRET_KEY ?? ""}`,
  };
  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers["content-type"] = contentType;
  }

  let body: string | undefined;
  if (METHODS_WITH_BODY.has(request.method)) {
    body = await request.text();
  }

  const upstream = await fetch(upstreamUrl.toString(), {
    method: request.method,
    headers,
    ...(body ? { body } : {}),
  });

  // 4) Relay the upstream status / body / content-type. Never cache — responses
  //    reflect live admin data and the route is force-dynamic.
  const responseHeaders = new Headers();
  responseHeaders.set("Cache-Control", "no-store");
  const upstreamContentType = upstream.headers.get("content-type");
  if (upstreamContentType) {
    responseHeaders.set("content-type", upstreamContentType);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

function unwrapPath(
  params: { path?: string[] | string },
): string[] {
  const path = params.path;
  if (Array.isArray(path)) return path;
  return path ? [path] : [];
}

export function GET(
  request: NextRequest,
  { params }: { params: { path?: string[] | string } },
) {
  return proxy(request, unwrapPath(params));
}

export function POST(
  request: NextRequest,
  { params }: { params: { path?: string[] | string } },
) {
  return proxy(request, unwrapPath(params));
}

export function PUT(
  request: NextRequest,
  { params }: { params: { path?: string[] | string } },
) {
  return proxy(request, unwrapPath(params));
}

export function PATCH(
  request: NextRequest,
  { params }: { params: { path?: string[] | string } },
) {
  return proxy(request, unwrapPath(params));
}

export function DELETE(
  request: NextRequest,
  { params }: { params: { path?: string[] | string } },
) {
  return proxy(request, unwrapPath(params));
}
