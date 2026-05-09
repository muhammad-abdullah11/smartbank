import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/transfer/:path*",
    "/transactions/:path*",
    "/profile/:path*",
    "/request-loan/:path*",
    "/loans/:path*",
    "/settings/:path*",
  ],
};
