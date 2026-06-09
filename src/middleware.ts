import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const { token } = req.nextauth;

    // Proteger rutas administrativas — solo accesibles para rol "admin"
    if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard/admin")) {
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        const isAuthRoute =
          pathname.startsWith("/admin") ||
          pathname.startsWith("/dashboard/admin") ||
          pathname.startsWith("/profile");

        if (isAuthRoute) {
          return !!token;
        }
        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/dashboard/admin/:path*", "/profile/:path*"],
};
