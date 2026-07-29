import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";

/**
 * GET /api/desktop/auth/status
 * Desktop polls this to check if there's a pending pairing.
 * If no pairing, returns { status: "no_pairing" }.
 * If pairing available, returns { status: "pairing_available", pairingToken: "xxx" }.
 * If already paired, returns { status: "paired" } with device info.
 */
export async function GET(req: Request) {
  // This endpoint supports two auth modes:
  // 1. Session-based (web app checking status) — requires session cookie
  // 2. Device-based (desktop already paired checking status) — requires device token

  // Try device auth first (for already-paired desktop)
  const deviceToken = req.headers.get("x-device-token");
  if (deviceToken) {
    const { verifyRefreshToken } = await import("@/lib/auth-utils");
    const payload = verifyRefreshToken(deviceToken);
    if (payload) {
      const device = await db.device.findUnique({ where: { id: payload.deviceId } });
      if (device && device.isActive) {
        return NextResponse.json({
          status: "paired",
          deviceId: device.id,
          deviceName: device.deviceName,
          platform: device.platform,
          lastSyncAt: device.lastSyncAt?.toISOString(),
        });
      }
    }
  }

  // Try session-based auth (for unpaired desktop or web app)
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) {
    // If no session auth, check for anonymous pairing poll
    // Desktop app without session can pass userId from its stored data
    const url = new URL(req.url);
    const pollUserId = url.searchParams.get("userId");
    if (pollUserId) {
      return handlePollForPairing(pollUserId);
    }
    return userIdOr401;
  }
  const userId = userIdOr401;

  return handlePollForPairing(userId);
}

async function handlePollForPairing(userId: string): Promise<NextResponse> {
  try {
    // Check if user has any pending pairing
    const pendingDevice = await db.device.findFirst({
      where: {
        userId,
        pairingToken: { not: null },
        pairingExpiry: { gte: new Date() }, // still valid
      },
      orderBy: { createdAt: "desc" },
    });

    if (pendingDevice) {
      return NextResponse.json({
        status: "pairing_available",
        pairingToken: pendingDevice.pairingToken,
        deviceId: pendingDevice.id,
      });
    }

    // Check if user has any active paired devices
    const activeDevices = await db.device.findMany({
      where: { userId, isActive: true, pairingToken: null },
    });

    if (activeDevices.length > 0) {
      return NextResponse.json({
        status: "paired",
        devices: activeDevices.map(d => ({
          id: d.id,
          deviceName: d.deviceName,
          deviceType: d.deviceType,
          platform: d.platform,
          lastSyncAt: d.lastSyncAt?.toISOString(),
        })),
      });
    }

    // Clean up expired pairings
    await db.device.updateMany({
      where: { userId, pairingExpiry: { lt: new Date() } },
      data: { pairingToken: null, pairingExpiry: null },
    });

    // Update user pendingPairing flag
    await db.user.update({
      where: { id: userId },
      data: { pendingPairing: false },
    });

    return NextResponse.json({ status: "no_pairing" });
  } catch (e) {
    logError("device-auth-status", "Failed to check pairing status", e);
    return NextResponse.json({ error: "Failed to check pairing status" }, { status: 500 });
  }
}
