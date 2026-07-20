import { NextResponse } from "next/server";

const COOKIE_NAME = "shop_token";
const PUBLIC_ADMIN_PATHS = ["/login"];

// Admin route group (admin) has no URL prefix, so its pages live at
// /login, /dashboard, /products, /categories. This middleware gates all of
// those except /login. It only checks cookie *presence* -- verifying the
// JWT signature would require pulling in a JWT library; the FastAPI backend
// is the real enforcement layer for every actual data call.
const PROTECTED_PREFIXES = ["/dashboard", "/products", "/categories"];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ADMIN_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/products/:path*", "/categories/:path*", "/login"],
};
