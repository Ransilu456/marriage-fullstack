import { withAuth } from "next-auth/middleware";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/src/lib/auth';

export default withAuth({
  callbacks: {
    authorized: async ({ req, token }) => {
      if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/api/admin')) {
        return token?.role === 'ADMIN';
      }
      return !!token;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/discover/:path*",
    "/messages/:path*",
    "/proposals/:path*",
    "/family/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
