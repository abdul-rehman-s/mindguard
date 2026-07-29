import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { applyRateLimit, AUTH_RATE_LIMITS } from "@/lib/rate-limiter";

const handler = NextAuth(authOptions);

// Wrap the POST handler (signin/signout) with rate limiting: max 10 per 15 min per IP
// Must pass context (including params) to NextAuth handler for proper route parsing
const rateLimitedPost = async (request: Request, context: { params: Promise<{ nextauth: string[] }> }) => {
  const rateLimitResponse = applyRateLimit(request, AUTH_RATE_LIMITS.signin);
  if (rateLimitResponse) return rateLimitResponse;
  return handler(request, context);
};

export { handler as GET, rateLimitedPost as POST };
