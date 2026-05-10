import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const authPages = [
  "/login",
  "/signup",
  "/verify-email",
  "/forgot-password",
];

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    if (
      token &&
      authPages.some((page) => pathname.startsWith(page))
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};