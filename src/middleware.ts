import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const USER_ROUTES = ["/account", "/orders", "/checkout"];
const ADMIN_ROUTES = ["/admin"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isAdminLogin = pathname === "/admin/login";
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  const isUserRoute = USER_ROUTES.some((r) => pathname.startsWith(r));

  // Admin login page: let unauthenticated through; redirect authenticated admins to dashboard
  if (isAdminLogin) {
    if (session?.user.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  if (isAdminRoute && !session) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isUserRoute && !session) {
    // RSC navigation requests (client-side Link clicks) break when middleware
    // redirects them — the raw RSC payload is shown as text. Let RSC navigations
    // through; the checkout/account pages handle unauthenticated state themselves.
    const isRSCNavigation = req.headers.get("rsc") === "1";
    if (isRSCNavigation) return NextResponse.next();

    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && session?.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/account/:path*", "/orders/:path*", "/checkout/:path*", "/admin/:path*"],
};
