import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Get the access token from cookies or headers
  const accessToken =
    request.cookies.get("access_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  const isAuth = !!accessToken;
  const isAuthPage = pathname.startsWith("/auth");
  const isPublicPage = ["/", "/products", "/about", "/contact"].includes(
    pathname
  );

  // Allow all requests for now - let the client-side auth handle protection
  // This prevents the middleware from interfering with our custom auth system
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
