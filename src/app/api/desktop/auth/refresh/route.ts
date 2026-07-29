import { NextResponse } from "next/server";
import { verifyRefreshToken, generateDeviceAccessToken, generateRefreshToken } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { logError, logInfo } from "@/lib/logger";
import { deviceRefreshSchema } from "@/lib/validators";

/**
 * POST /api/desktop/auth/refresh
 * Desktop calls this to refresh its access token using refresh token.
 * Also rotates the refresh token for better security.
 * Returns new accessToken and refreshToken.
 */
export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const validated = deviceRefreshSchema.parse(raw);

    const payload = verifyRefreshToken(validated.refreshToken);
    if (!payload) {
      return NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 401 });
    }

    const { userId, deviceId } = payload;

    // Verify device is still active and belongs to the user
    const device = await db.device.findUnique({
      where: { id: deviceId },
    });

    if (!device || !device.isActive || device.userId !== userId) {
      return NextResponse.json({ error: "Device not found or inactive" }, { status: 401 });
    }

    // Generate new tokens
    const accessToken = generateDeviceAccessToken(userId, deviceId);
    const newRefreshToken = generateRefreshToken(userId, deviceId);

    // Update device with new refresh token and sync timestamp
    await db.device.update({
      where: { id: deviceId },
      data: {
        refreshToken: newRefreshToken,
        lastSyncAt: new Date(),
      },
    });

    logInfo("device-refresh", `Refreshed token for device ${deviceId}, user ${userId}`);

    return NextResponse.json({
      accessToken,
      refreshToken: newRefreshToken,
    }, { status: 200 });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "issues" in e) {
      return NextResponse.json(
        { error: "Validation failed", details: (e as { issues: Array<{ message: string }> }).issues },
        { status: 400 }
      );
    }
    logError("device-refresh", "Failed to refresh token", e);
    return NextResponse.json({ error: "Failed to refresh token" }, { status: 500 });
  }
}
