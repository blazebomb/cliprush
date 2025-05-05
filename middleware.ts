// middleware.ts

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// This function wraps your middleware with NextAuth logic (JWT, session, etc.)
export default withAuth(
  // Main middleware logic
  function middleware() {
    // You can add custom logic here if needed (e.g., logging, headers, etc.)
    return NextResponse.next(); // Allow the request to proceed
  },

  // Options object for withAuth
  {
    callbacks: {
      // This function determines if the user is authorized to access a page
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Example: allow requests to public routes without authentication
        if (
          pathname.startsWith("/login") ||
          pathname.startsWith("/register") ||
          pathname.startsWith("/api/auth")
        ) {
          return true;
        }

        //public routes
        if (pathname === "/" || pathname.startsWith("/api/videos")) {
          return true;
        }

        // Require authentication (token must exist) for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
    // Specify the paths where the middleware should run
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
        "/api/:path*",
    ],
}