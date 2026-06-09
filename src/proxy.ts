import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Get the JWT token (works with next-auth's JWT strategy)
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Routes that require authentication
  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/dashboard/admin");
  const isProtectedRoute = isAdminRoute || pathname.startsWith("/profile");

  // If not logged in and trying to access a protected route → redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If logged in but not admin and trying to access admin routes → redirect home
  if (isAdminRoute && token?.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If admin needs password change, force redirect to /admin/change-password (unless already there)
  if (token && token.role === "admin" && token.needspasswordchange) {
    if (isAdminRoute && !pathname.startsWith("/admin/change-password")) {
      return NextResponse.redirect(new URL("/admin/change-password", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/admin/:path*", "/profile/:path*"],
};
