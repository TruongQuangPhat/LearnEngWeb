import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // 1. Completely bypass Auth Redirects for development UI building
  // 2. Automatically redirect root path to dashboard
  if (request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
