import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { desktopSettingsSchema } from "@/lib/validators";
import { logError, logInfo } from "@/lib/logger";
import type { DesktopSettingsData } from "@/types";

const DEFAULT_SETTINGS: DesktopSettingsData = {
  autoStart: false,
  runInBackground: true,
  privacyMode: false,
  trackingEnabled: true,
  trackingExclusions: [],
  blockedApps: [],
  blockedWebsites: [],
  notificationPrefs: {
    idleAlert: true,
    breakReminder: true,
    focusCelebration: true,
    missionReminder: true,
  },
  focusProtection: false,
  muteNotifications: false,
  trackerInterval: 30,
};

function parseSettings(raw: {
  autoStart: boolean;
  runInBackground: boolean;
  privacyMode: boolean;
  trackingEnabled: boolean;
  trackingExclusions: string | null;
  blockedApps: string | null;
  blockedWebsites: string | null;
  notificationPrefs: string | null;
  focusProtection: boolean;
  muteNotifications: boolean;
  trackerInterval: number;
}): DesktopSettingsData {
  return {
    autoStart: raw.autoStart,
    runInBackground: raw.runInBackground,
    privacyMode: raw.privacyMode,
    trackingEnabled: raw.trackingEnabled,
    trackingExclusions: raw.trackingExclusions ? JSON.parse(raw.trackingExclusions) : [],
    blockedApps: raw.blockedApps ? JSON.parse(raw.blockedApps) : [],
    blockedWebsites: raw.blockedWebsites ? JSON.parse(raw.blockedWebsites) : [],
    notificationPrefs: raw.notificationPrefs ? JSON.parse(raw.notificationPrefs) : DEFAULT_SETTINGS.notificationPrefs,
    focusProtection: raw.focusProtection,
    muteNotifications: raw.muteNotifications,
    trackerInterval: raw.trackerInterval,
  };
}

/** GET — Desktop settings */
export async function GET(request: Request) {
  const userIdOr401 = await getAuthUserId(request);
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const raw = await db.desktopSettings.findUnique({ where: { userId } });

    if (!raw) {
      // Return defaults if no settings exist yet
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    return NextResponse.json(parseSettings(raw));
  } catch (e) {
    logError("desktop-settings", "Failed to fetch settings", e);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

/** PUT — Update desktop settings */
export async function PUT(req: Request) {
  const userIdOr401 = await getAuthUserId(req);
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const body = await req.json();
    const validated = desktopSettingsSchema.parse(body);

    // Convert arrays/objects to JSON strings for SQLite storage
    const data: Record<string, unknown> = {};
    if (validated.autoStart !== undefined) data.autoStart = validated.autoStart;
    if (validated.runInBackground !== undefined) data.runInBackground = validated.runInBackground;
    if (validated.privacyMode !== undefined) data.privacyMode = validated.privacyMode;
    if (validated.trackingEnabled !== undefined) data.trackingEnabled = validated.trackingEnabled;
    if (validated.trackingExclusions !== undefined) data.trackingExclusions = JSON.stringify(validated.trackingExclusions);
    if (validated.blockedApps !== undefined) data.blockedApps = JSON.stringify(validated.blockedApps);
    if (validated.blockedWebsites !== undefined) data.blockedWebsites = JSON.stringify(validated.blockedWebsites);
    if (validated.notificationPrefs !== undefined) data.notificationPrefs = JSON.stringify(validated.notificationPrefs);
    if (validated.focusProtection !== undefined) data.focusProtection = validated.focusProtection;
    if (validated.muteNotifications !== undefined) data.muteNotifications = validated.muteNotifications;
    if (validated.trackerInterval !== undefined) data.trackerInterval = validated.trackerInterval;

    // Upsert: create if not exists, update if exists
    const updated = await db.desktopSettings.upsert({
      where: { userId },
      create: {
        userId,
        autoStart: validated.autoStart ?? DEFAULT_SETTINGS.autoStart,
        runInBackground: validated.runInBackground ?? DEFAULT_SETTINGS.runInBackground,
        privacyMode: validated.privacyMode ?? DEFAULT_SETTINGS.privacyMode,
        trackingEnabled: validated.trackingEnabled ?? DEFAULT_SETTINGS.trackingEnabled,
        trackingExclusions: JSON.stringify(validated.trackingExclusions ?? DEFAULT_SETTINGS.trackingExclusions),
        blockedApps: JSON.stringify(validated.blockedApps ?? DEFAULT_SETTINGS.blockedApps),
        blockedWebsites: JSON.stringify(validated.blockedWebsites ?? DEFAULT_SETTINGS.blockedWebsites),
        notificationPrefs: JSON.stringify(validated.notificationPrefs ?? DEFAULT_SETTINGS.notificationPrefs),
        focusProtection: validated.focusProtection ?? DEFAULT_SETTINGS.focusProtection,
        muteNotifications: validated.muteNotifications ?? DEFAULT_SETTINGS.muteNotifications,
        trackerInterval: validated.trackerInterval ?? DEFAULT_SETTINGS.trackerInterval,
      },
      update: data,
    });

    logInfo("desktop-settings", `Updated settings for user ${userId}`);
    return NextResponse.json(parseSettings(updated));
  } catch (e: unknown) {
    if (e && typeof e === "object" && "issues" in e) {
      return NextResponse.json(
        { error: "Validation failed", details: (e as { issues: Array<{ message: string }> }).issues },
        { status: 400 }
      );
    }
    logError("desktop-settings", "Failed to update settings", e);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
