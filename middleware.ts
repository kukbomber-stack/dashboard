import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const authed = req.cookies.get("ppr_auth")?.value === "ok";
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/cabinet") && !authed) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (pathname === "/login" && authed) {
    return NextResponse.redirect(new URL("/cabinet", req.url));
  }
  return NextResponse.next();
}
export const config = { matcher: ["/cabinet/:path*", "/login"] };
