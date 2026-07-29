import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth-utils";
import { generatePairingToken } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { logError, logInfo } from "@/lib/logger";
import { devicePairSchema } from "@/lib/validators";

/**
 * POST /api/desktop/auth/pair
 * Web app calls this after user login to create a pairing token
 * for the desktop app to automatically authenticate.
 */
export async function POST(req: Request) {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const raw = await req.json();
    const validated = devicePairSchema.parse(raw);

    // Invalidate any existing pending pairing tokens for this user
    await db.device.updateMany({
      where: { userId, pairingToken: { not: null } },
      data: { pairingToken: null, pairingExpiry: null },
    });

    // Create a new device record with pairing token
    const pairingToken = generatePairingToken(userId);
    const pairingExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const device = await db.device.create({
      data: {
        userId,
        deviceName: validated.deviceName || null,
        deviceType: validated.deviceType,
        platform: validated.platform || null,
        pairingToken,
        pairingExpiry,
        isActive: true,
      },
    });

    // Mark user as having pending pairing
    await db.user.update({
      where: { id: userId },
      data: { pendingPairing: true },
    });

    logInfo("device-pair", `Created pairing for user ${userId}, device ${device.id}`);

    return NextResponse.json({
      pairingToken,
      expiresIn: 300, // 5 minutes in seconds
      deviceId: device.id,
    }, { status: 201 });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "issues" in e) {
      return NextResponse.json(
        { error: "Validation failed", details: (e as { issues: Array<{ message: string }> }).issues },
        { status: 400 }
      );
    }
    logError("device-pair", "Failed to create pairing", e);
    return NextResponse.json({ error: "Failed to create pairing" }, { status: 500 });
  }
}
