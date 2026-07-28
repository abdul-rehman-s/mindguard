// MindGuard — NextAuth Middleware
// Protects all routes except auth endpoints and static assets.
// Redirects unauthenticated users to the landing page.

import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/",
  },
});

export const config = {
  matcher: [
    // Match all API routes except auth
    "/api/((?!auth).*)",
    // Match all pages except the root (landing page)
    "/((?!$|_next|favicon.ico|icons|audio|logo).*)",
  ],
};
