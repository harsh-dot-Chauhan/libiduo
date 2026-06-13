import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const USER_ROUTES = ["/account", "/orders", "/checkout"];
const ADMIN_ROUTES = ["/admin"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  const isUserRoute = USER_ROUTES.some((r) => pathname.startsWith(r));

  if ((isAdminRoute || isUserRoute) && !session) {
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
