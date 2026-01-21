import { withAuth } from "next-auth/middleware";

export default withAuth({
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
    ],
};
