import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie, getCookieCache } from "better-auth/cookies";

const ADMIN_PREFIX = "/admin";
const STUDENT_PREFIXES = ["/dashboard", "/learn"];
const AUTH_PAGES = ["/login", "/signup"];

const ADMIN_AREA_ROLES = new Set(["admin", "trainer"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const needsAdmin = pathname.startsWith(ADMIN_PREFIX);
  const needsAuth =
    needsAdmin || STUDENT_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.includes(pathname);

  const sessionCookie = getSessionCookie(request);

  if (needsAuth && !sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (needsAdmin && sessionCookie) {
    const cache = await getCookieCache(request, {
      secret: process.env.BETTER_AUTH_SECRET,
    });
    // Only redirect when we have a decoded cache AND role is unambiguously
    // non-privileged. When cache is missing/expired, let the request through
    // and rely on server-side `requireAdmin` / `requireAdminOrTrainer` to
    // enforce with a DB lookup. This avoids the 307 loop after cookie-cache
    // expiry on a still-valid session.
    if (cache) {
      const role = (cache.user as { role?: string } | undefined)?.role;
      if (role && !ADMIN_AREA_ROLES.has(role)) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    }
  }

  if (isAuthPage && sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
