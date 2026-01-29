
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    if (pathname === "/") {
      if (req.nextauth.token) {
        const hasProfile = (req.nextauth.token as any).hasProfile;

        if (hasProfile) {
          return NextResponse.redirect(new URL("/discover", req.url));
        } else {
          return NextResponse.redirect(new URL("/profile/create", req.url));
        }
      }
      return NextResponse.next();
    }

    if (pathname.startsWith("/api")) {
      return NextResponse.next();
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname;

        if (pathname === "/") {
          return true;
        }

        if (pathname.startsWith("/admin")) {
          return token?.role === "ADMIN";
        }

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
    "/",
    "/dashboard/:path*",
    "/profile/:path*",
    "/discover/:path*",
    "/messages/:path*",
    "/proposals/:path*",
    "/family/:path*",
    "/admin/:path*",
  ],
};
