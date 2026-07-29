import { NextResponse } from "next/server";
import { authenticateDevice } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { logError, logInfo } from "@/lib/logger";

/**
 * GET /api/desktop/sync
 * Desktop calls this to sync settings, missions, focus sessions.
 * Requires device authentication (Bearer token or X-Device-Token).
 * Returns all data the desktop needs to operate.
 */
export async function GET(req: Request) {
  const authResult = await authenticateDevice(req);
  if (authResult instanceof NextResponse) return authResult;

  const { userId, deviceId } = authResult;

  try {
    // Update last sync timestamp
    await db.device.update({
      where: { id: deviceId },
      data: { lastSyncAt: new Date() },
    });

    // Fetch user settings
    const userSettings = await db.userSettings.findUnique({
      where: { userId },
    });

    // Fetch desktop settings
    const desktopSettings = await db.desktopSettings.findUnique({
      where: { userId },
    });

    // Fetch active missions
    const activeMissions = await db.mission.findMany({
      where: { userId, status: "active" },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch recent focus sessions (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSessions = await db.focusSession.findMany({
      where: { userId, startedAt: { gte: sevenDaysAgo } },
      select: {
        id: true,
        missionId: true,
        duration: true,
        startedAt: true,
        quality: true,
      },
      orderBy: { startedAt: "desc" },
      take: 50,
    });

    // Fetch user profile data
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        focusGoalMinutes: true,
        preferredFocusDuration: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    logInfo("device-sync", `Synced data for device ${deviceId}, user ${userId}`);

    // Format settings for desktop consumption
    const formattedUserSettings = userSettings ? {
      language: userSettings.language,
      timezone: userSettings.timezone,
      theme: userSettings.theme,
      sidebarCollapsed: userSettings.sidebarCollapsed,
      compactMode: userSettings.compactMode,
      defaultFocusDuration: userSettings.defaultFocusDuration,
      focusGoalMinutes: userSettings.focusGoalMinutes,
      autoStartTimer: userSettings.autoStartTimer,
      showCelebration: userSettings.showCelebration,
      ambientSound: userSettings.ambientSound,
      desktopNotifications: userSettings.desktopNotifications,
      breakReminders: userSettings.breakReminders,
      missionReminders: userSettings.missionReminders,
      streakReminders: userSettings.streakReminders,
      achievementAlerts: userSettings.achievementAlerts,
      idleAlerts: userSettings.idleAlerts,
      shareStats: userSettings.shareStats,
      publicProfile: userSettings.publicProfile,
      customShortcuts: (() => { try { return userSettings.customShortcuts ? JSON.parse(userSettings.customShortcuts) : null; } catch { return null; } })(),
      debugMode: userSettings.debugMode,
      dataExportEnabled: userSettings.dataExportEnabled,
      aiProvider: userSettings.aiProvider,
      aiApiKey: userSettings.aiApiKey,
      aiModel: userSettings.aiModel,
      aiOllamaUrl: userSettings.aiOllamaUrl,
      coachPersonality: userSettings.coachPersonality,
    } : null;

    const formattedDesktopSettings = desktopSettings ? {
      autoStart: desktopSettings.autoStart,
      runInBackground: desktopSettings.runInBackground,
      privacyMode: desktopSettings.privacyMode,
      trackingEnabled: desktopSettings.trackingEnabled,
      trackingExclusions: (() => { try { return desktopSettings.trackingExclusions ? JSON.parse(desktopSettings.trackingExclusions) : []; } catch { return []; } })(),
      blockedApps: (() => { try { return desktopSettings.blockedApps ? JSON.parse(desktopSettings.blockedApps) : []; } catch { return []; } })(),
      blockedWebsites: (() => { try { return desktopSettings.blockedWebsites ? JSON.parse(desktopSettings.blockedWebsites) : []; } catch { return []; } })(),
      notificationPrefs: (() => { try { return desktopSettings.notificationPrefs ? JSON.parse(desktopSettings.notificationPrefs) : { idleAlert: true, breakReminder: true, focusCelebration: true, missionReminder: true }; } catch { return { idleAlert: true, breakReminder: true, focusCelebration: true, missionReminder: true }; } })(),
      focusProtection: desktopSettings.focusProtection,
      muteNotifications: desktopSettings.muteNotifications,
      trackerInterval: desktopSettings.trackerInterval,
    } : null;

    return NextResponse.json({
      settings: formattedUserSettings,
      desktopSettings: formattedDesktopSettings,
      activeMissions,
      recentSessions: recentSessions.map(s => ({
        ...s,
        startedAt: s.startedAt.toISOString(),
      })),
      user,
    });
  } catch (e) {
    logError("device-sync", "Failed to sync data", e);
    return NextResponse.json({ error: "Failed to sync data" }, { status: 500 });
  }
}
