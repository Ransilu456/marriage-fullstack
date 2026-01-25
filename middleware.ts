import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // ✅ Allow API routes to pass without redirect
    if (pathname.startsWith("/api")) {
      return NextResponse.next();
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname;

        // ✅ Admin pages only
        if (pathname.startsWith("/admin")) {
          return token?.role === "ADMIN";
        }

        // ✅ Other protected pages
        return !!token;
      },
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/discover/:path*",
    "/messages/:path*",
    "/proposals/:path*",
    "/family/:path*",
    "/admin/:path*",
    // ❌ REMOVE API FROM MATCHER
    // "/api/admin/:path*",
  ],
};
