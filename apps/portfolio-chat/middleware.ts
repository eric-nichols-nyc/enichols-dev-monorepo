import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ADMIN_AUTH_COOKIE_NAME,
  getBearerTokenFromRequest,
  isAdminFeatureEnabled,
  isValidAdminAuthToken,
} from "@/features/project-publisher/lib/verify-admin-secret";

export function middleware(request: NextRequest) {
  if (!isAdminFeatureEnabled()) {
    return new NextResponse(null, { status: 404 });
  }

  const { pathname } = request.nextUrl;

  if (pathname === "/api/admin/unlock" && request.method === "POST") {
    return NextResponse.next();
  }

  const bearerToken = getBearerTokenFromRequest(request);
  const cookieToken = request.cookies.get(ADMIN_AUTH_COOKIE_NAME)?.value;
  const token = bearerToken ?? cookieToken;

  if (isValidAdminAuthToken(token)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (pathname === "/admin/unlock") {
    return NextResponse.next();
  }

  const unlockUrl = request.nextUrl.clone();
  unlockUrl.pathname = "/admin/unlock";
  unlockUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(unlockUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
