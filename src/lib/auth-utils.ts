import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { jwtVerify } from "jose";

/**
 * Centralized authentication helper for API routes.
 * Supports two auth methods:
 * 1. NextAuth session (web browser requests)
 * 2. Bearer JWT token (desktop Electron requests)
 *
 * Returns the authenticated user's ID or a 401 NextResponse.
 */

function getSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Decode and verify a NextAuth JWT Bearer token.
 * Returns the user ID from the token payload, or null if invalid.
 */
async function verifyBearerToken(token: string): Promise<string | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    // NextAuth JWT payload contains the user ID in `id` field
    const userId = payload.id as string | undefined;
    if (!userId) return null;

    return userId;
  } catch {
    // Token is invalid, expired, or malformed
    return null;
  }
}

/**
 * Extract Bearer token from Authorization header.
 */
function extractBearerToken(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;

  return parts[1];
}

/**
 * Get authenticated user ID from either session or Bearer token.
 * Use this in API routes that need to support both web and desktop clients.
 */
export async function getAuthUserId(
  request?: Request
): Promise<string | NextResponse> {
  // Try Bearer token first (desktop Electron requests)
  if (request) {
    const bearerToken = extractBearerToken(request);
    if (bearerToken) {
      const userId = await verifyBearerToken(bearerToken);
      if (userId) {
        return userId;
      }
      // Bearer token was provided but invalid
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  }

  // Fall back to NextAuth session (web browser requests)
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = session.user as Record<string, unknown>;
  return user.id as string;
}

/**
 * Type-safe helper: returns userId string or throws.
 * Use in routes where 401 is handled by middleware/caller.
 */
export async function requireAuthUserId(
  request?: Request
): Promise<string> {
  // Try Bearer token first (desktop Electron requests)
  if (request) {
    const bearerToken = extractBearerToken(request);
    if (bearerToken) {
      const userId = await verifyBearerToken(bearerToken);
      if (userId) {
        return userId;
      }
      throw new Error("Invalid Bearer token");
    }
  }

  // Fall back to NextAuth session
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  const user = session.user as Record<string, unknown>;
  return user.id as string;
}

/**
 * Check if a request comes from the desktop Electron app.
 * Desktop requests have an Authorization: Bearer header.
 */
export function isDesktopRequest(request: Request): boolean {
  return Boolean(extractBearerToken(request));
}
