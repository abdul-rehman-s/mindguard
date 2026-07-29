import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";

/**
 * GET /api/devices
 * List all devices connected to the current user's account.
 */
export async function GET() {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const devices = await db.device.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const formatted = devices.map(d => ({
      id: d.id,
      deviceName: d.deviceName,
      deviceType: d.deviceType,
      platform: d.platform,
      isActive: d.isActive,
      lastSyncAt: d.lastSyncAt?.toISOString() || null,
      createdAt: d.createdAt.toISOString(),
      hasPairing: d.pairingToken !== null,
    }));

    return NextResponse.json({ devices: formatted });
  } catch (e) {
    logError("devices-list", "Failed to list devices", e);
    return NextResponse.json({ error: "Failed to list devices" }, { status: 500 });
  }
}

/**
 * DELETE /api/devices
 * Disconnect a specific device (deactivate it).
 * Body: { deviceId: string }
 */
export async function DELETE(req: Request) {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const { deviceId } = await req.json() as { deviceId: string };

    if (!deviceId) {
      return NextResponse.json({ error: "deviceId is required" }, { status: 400 });
    }

    const device = await db.device.findUnique({ where: { id: deviceId } });

    if (!device || device.userId !== userId) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    // Deactivate the device (soft delete)
    await db.device.update({
      where: { id: deviceId },
      data: {
        isActive: false,
        refreshToken: null,
        pairingToken: null,
        pairingExpiry: null,
      },
    });

    return NextResponse.json({ success: true, deviceId });
  } catch (e) {
    logError("devices-delete", "Failed to disconnect device", e);
    return NextResponse.json({ error: "Failed to disconnect device" }, { status: 500 });
  }
}
