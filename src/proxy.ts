import { NextResponse } from "next/server";
import { auth } from "@/auth";

const protectedPrefixes = ["/app", "/onboarding"];
const authPages = ["/inloggen", "/registreren"];

export default auth((request) => {
  const { nextUrl } = request;
  const isLoggedIn = Boolean(request.auth?.user);
  const isProtectedRoute = protectedPrefixes.some((prefix) => nextUrl.pathname.startsWith(prefix));
  const isAuthPage = authPages.some((path) => nextUrl.pathname.startsWith(path));

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/inloggen", nextUrl);
    loginUrl.searchParams.set("redirectTo", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/app", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/app/:path*", "/onboarding", "/inloggen", "/registreren"],
};
