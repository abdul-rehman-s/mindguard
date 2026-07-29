import { NextResponse } from "next/server";
import { verifyPairingToken, generateRefreshToken, generateDeviceAccessToken } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { logError, logInfo } from "@/lib/logger";
import { devicePairCompleteSchema } from "@/lib/validators";

/**
 * POST /api/desktop/auth/complete
 * Desktop calls this to complete pairing using the pairing token.
 * Returns refresh token, access token, and user info.
 */
export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const validated = devicePairCompleteSchema.parse(raw);

    // Verify the pairing token
    const payload = verifyPairingToken(validated.pairingToken);
    if (!payload) {
      return NextResponse.json({ error: "Invalid or expired pairing token" }, { status: 401 });
    }

    const userId = payload.userId;

    // Find the device associated with this pairing token
    const device = await db.device.findUnique({
      where: { pairingToken: validated.pairingToken },
    });

    if (!device) {
      return NextResponse.json({ error: "No device found for this pairing token" }, { status: 404 });
    }

    // Check if pairing has expired
    if (device.pairingExpiry && new Date() > device.pairingExpiry) {
      // Clean up expired pairing
      await db.device.update({
        where: { id: device.id },
        data: { pairingToken: null, pairingExpiry: null },
      });
      return NextResponse.json({ error: "Pairing token has expired" }, { status: 401 });
    }

    // Generate refresh token and access token
    const refreshToken = generateRefreshToken(userId, device.id);
    const accessToken = generateDeviceAccessToken(userId, device.id);

    // Update device: clear pairing token, store refresh token, update metadata
    await db.device.update({
      where: { id: device.id },
      data: {
        pairingToken: null,
        pairingExpiry: null,
        refreshToken,
        deviceName: validated.deviceName || device.deviceName,
        platform: validated.platform || device.platform,
        lastSyncAt: new Date(),
      },
    });

    // Update user: no more pending pairing
    await db.user.update({
      where: { id: userId },
      data: { pendingPairing: false },
    });

    // Get user info for desktop
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        displayName: true,
        onboarded: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    logInfo("device-complete", `Completed pairing for device ${device.id}, user ${userId}`);

    return NextResponse.json({
      refreshToken,
      accessToken,
      deviceId: device.id,
      user,
    }, { status: 200 });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "issues" in e) {
      return NextResponse.json(
        { error: "Validation failed", details: (e as { issues: Array<{ message: string }> }).issues },
        { status: 400 }
      );
    }
    logError("device-complete", "Failed to complete pairing", e);
    return NextResponse.json({ error: "Failed to complete pairing" }, { status: 500 });
  }
}
