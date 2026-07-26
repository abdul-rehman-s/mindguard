import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Centralized authentication helper for API routes.
 * Returns the authenticated user's ID or a 401 NextResponse.
 * Replaces the duplicated getUserId() function across 15+ route files.
 */
export async function getAuthUserId(): Promise<string | NextResponse> {
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
export async function requireAuthUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  const user = session.user as Record<string, unknown>;
  return user.id as string;
}
