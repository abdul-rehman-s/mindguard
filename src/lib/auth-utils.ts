import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "mindguard-secret-key-production-2025-a7f3e9b1c4d8";

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

// ─── Device Authentication ───

/**
 * Generate a short-lived pairing token for desktop auth.
 * Expires in 5 minutes. Used for the initial handshake between
 * web app and desktop app.
 */
export function generatePairingToken(userId: string): string {
  return jwt.sign(
    { type: "pairing", userId, ts: Date.now() },
    JWT_SECRET,
    { expiresIn: "5m" }
  );
}

/**
 * Generate a persistent refresh token for a paired device.
 * Expires in 90 days. Used by desktop to obtain new access tokens.
 */
export function generateRefreshToken(userId: string, deviceId: string): string {
  return jwt.sign(
    { type: "refresh", userId, deviceId, ts: Date.now() },
    JWT_SECRET,
    { expiresIn: "90d" }
  );
}

/**
 * Verify a refresh token. Returns the decoded payload or null.
 */
export function verifyRefreshToken(token: string): { userId: string; deviceId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
    if (decoded.type !== "refresh" || !decoded.userId || !decoded.deviceId) {
      return null;
    }
    return {
      userId: decoded.userId as string,
      deviceId: decoded.deviceId as string,
    };
  } catch {
    return null;
  }
}

/**
 * Verify a pairing token. Returns the decoded payload or null.
 */
export function verifyPairingToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
    if (decoded.type !== "pairing" || !decoded.userId) {
      return null;
    }
    return { userId: decoded.userId as string };
  } catch {
    return null;
  }
}

/**
 * Generate a short-lived device access token.
 * Expires in 1 hour. Used for authenticated API calls from desktop.
 */
export function generateDeviceAccessToken(userId: string, deviceId: string): string {
  return jwt.sign(
    { type: "device_access", userId, deviceId, ts: Date.now() },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
}

/**
 * Verify a device access token. Returns decoded payload or null.
 */
export function verifyDeviceAccessToken(token: string): { userId: string; deviceId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
    if (decoded.type !== "device_access" || !decoded.userId || !decoded.deviceId) {
      return null;
    }
    return {
      userId: decoded.userId as string,
      deviceId: decoded.deviceId as string,
    };
  } catch {
    return null;
  }
}

/**
 * Authenticate a device request using either device access token
 * (from Authorization header) or refresh token (from X-Device-Token header).
 * Returns userId + deviceId or a 401 NextResponse.
 */
export async function authenticateDevice(req: Request): Promise<
  { userId: string; deviceId: string } | NextResponse
> {
  // Try Authorization: Bearer <access_token>
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const accessToken = authHeader.slice(7);
    const payload = verifyDeviceAccessToken(accessToken);
    if (payload) {
      // Verify device is still active
      const device = await db.device.findUnique({ where: { id: payload.deviceId } });
      if (device && device.isActive && device.userId === payload.userId) {
        return payload;
      }
    }
  }

  // Try X-Device-Token: <refresh_token>
  const deviceToken = req.headers.get("x-device-token");
  if (deviceToken) {
    const payload = verifyRefreshToken(deviceToken);
    if (payload) {
      const device = await db.device.findUnique({ where: { id: payload.deviceId } });
      if (device && device.isActive && device.userId === payload.userId) {
        return payload;
      }
    }
  }

  return NextResponse.json({ error: "Unauthorized — invalid device token" }, { status: 401 });
}
