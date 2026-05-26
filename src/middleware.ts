import { auth } from "@/lib/auth";
import { REGISTRATION_ENABLED } from "@/lib/app-config";
import { safeCallbackUrl } from "@/lib/safe-callback-url";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");

  if (isDashboard && !isLoggedIn) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", safeCallbackUrl(req.nextUrl.pathname));
    return NextResponse.redirect(login);
  }

  if (req.nextUrl.pathname === "/register" && !REGISTRATION_ENABLED) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  if ((req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register") && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
