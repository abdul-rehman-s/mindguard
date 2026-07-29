import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { userSettingsSchema } from '@/lib/validators';
import { logError, logInfo } from '@/lib/logger';

export interface UserSettingsData {
  language: string;
  timezone: string | null;
  theme: string;
  sidebarCollapsed: boolean;
  compactMode: boolean;
  defaultFocusDuration: number;
  focusGoalMinutes: number;
  autoStartTimer: boolean;
  showCelebration: boolean;
  ambientSound: string | null;
  desktopNotifications: boolean;
  breakReminders: boolean;
  missionReminders: boolean;
  streakReminders: boolean;
  achievementAlerts: boolean;
  idleAlerts: boolean;
  shareStats: boolean;
  publicProfile: boolean;
  customShortcuts: Record<string, string> | null;
  debugMode: boolean;
  dataExportEnabled: boolean;
  // AI Coach
  aiProvider: string;
  aiApiKey: string | null;
  aiModel: string | null;
  aiOllamaUrl: string | null;
  coachPersonality: string;
}

const DEFAULT_SETTINGS: UserSettingsData = {
  language: 'en',
  timezone: null,
  theme: 'dark',
  sidebarCollapsed: false,
  compactMode: false,
  defaultFocusDuration: 25,
  focusGoalMinutes: 120,
  autoStartTimer: false,
  showCelebration: true,
  ambientSound: null,
  desktopNotifications: true,
  breakReminders: true,
  missionReminders: true,
  streakReminders: true,
  achievementAlerts: true,
  idleAlerts: true,
  shareStats: false,
  publicProfile: false,
  customShortcuts: null,
  debugMode: false,
  dataExportEnabled: true,
  // AI Coach defaults
  aiProvider: 'z-ai',
  aiApiKey: null,
  aiModel: null,
  aiOllamaUrl: null,
  coachPersonality: 'friendly',
};

function parseSettings(raw: {
  language: string;
  timezone: string | null;
  theme: string;
  sidebarCollapsed: boolean;
  compactMode: boolean;
  defaultFocusDuration: number;
  focusGoalMinutes: number;
  autoStartTimer: boolean;
  showCelebration: boolean;
  ambientSound: string | null;
  desktopNotifications: boolean;
  breakReminders: boolean;
  missionReminders: boolean;
  streakReminders: boolean;
  achievementAlerts: boolean;
  idleAlerts: boolean;
  shareStats: boolean;
  publicProfile: boolean;
  customShortcuts: string | null;
  debugMode: boolean;
  dataExportEnabled: boolean;
  aiProvider: string;
  aiApiKey: string | null;
  aiModel: string | null;
  aiOllamaUrl: string | null;
  coachPersonality: string;
}): UserSettingsData {
  return {
    language: raw.language,
    timezone: raw.timezone,
    theme: raw.theme,
    sidebarCollapsed: raw.sidebarCollapsed,
    compactMode: raw.compactMode,
    defaultFocusDuration: raw.defaultFocusDuration,
    focusGoalMinutes: raw.focusGoalMinutes,
    autoStartTimer: raw.autoStartTimer,
    showCelebration: raw.showCelebration,
    ambientSound: raw.ambientSound,
    desktopNotifications: raw.desktopNotifications,
    breakReminders: raw.breakReminders,
    missionReminders: raw.missionReminders,
    streakReminders: raw.streakReminders,
    achievementAlerts: raw.achievementAlerts,
    idleAlerts: raw.idleAlerts,
    shareStats: raw.shareStats,
    publicProfile: raw.publicProfile,
    customShortcuts: (() => { try { return raw.customShortcuts ? JSON.parse(raw.customShortcuts) : null; } catch { return null; } })(),
    debugMode: raw.debugMode,
    dataExportEnabled: raw.dataExportEnabled,
    aiProvider: raw.aiProvider || 'z-ai',
    aiApiKey: raw.aiApiKey,
    aiModel: raw.aiModel,
    aiOllamaUrl: raw.aiOllamaUrl,
    coachPersonality: raw.coachPersonality || 'friendly',
  };
}

/** GET — User settings */
export async function GET() {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const raw = await db.userSettings.findUnique({ where: { userId } });

    if (!raw) {
      // Create default settings if not exists
      const created = await db.userSettings.create({
        data: { userId },
      });
      logInfo('user-settings', `Created default settings for user ${userId}`);
      return NextResponse.json(parseSettings(created));
    }

    return NextResponse.json(parseSettings(raw));
  } catch (e) {
    logError('user-settings', 'Failed to fetch settings', e);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

/** PUT — Update user settings */
export async function PUT(request: NextRequest) {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const body = await request.json();
    const validated = userSettingsSchema.parse(body);

    // Convert customShortcuts to JSON string if provided
    const data: Record<string, unknown> = {};
    if (validated.language !== undefined) data.language = validated.language;
    if (validated.timezone !== undefined) data.timezone = validated.timezone;
    if (validated.theme !== undefined) data.theme = validated.theme;
    if (validated.sidebarCollapsed !== undefined) data.sidebarCollapsed = validated.sidebarCollapsed;
    if (validated.compactMode !== undefined) data.compactMode = validated.compactMode;
    if (validated.defaultFocusDuration !== undefined) data.defaultFocusDuration = validated.defaultFocusDuration;
    if (validated.focusGoalMinutes !== undefined) data.focusGoalMinutes = validated.focusGoalMinutes;
    if (validated.autoStartTimer !== undefined) data.autoStartTimer = validated.autoStartTimer;
    if (validated.showCelebration !== undefined) data.showCelebration = validated.showCelebration;
    if (validated.ambientSound !== undefined) data.ambientSound = validated.ambientSound;
    if (validated.desktopNotifications !== undefined) data.desktopNotifications = validated.desktopNotifications;
    if (validated.breakReminders !== undefined) data.breakReminders = validated.breakReminders;
    if (validated.missionReminders !== undefined) data.missionReminders = validated.missionReminders;
    if (validated.streakReminders !== undefined) data.streakReminders = validated.streakReminders;
    if (validated.achievementAlerts !== undefined) data.achievementAlerts = validated.achievementAlerts;
    if (validated.idleAlerts !== undefined) data.idleAlerts = validated.idleAlerts;
    if (validated.shareStats !== undefined) data.shareStats = validated.shareStats;
    if (validated.publicProfile !== undefined) data.publicProfile = validated.publicProfile;
    if (validated.customShortcuts !== undefined) data.customShortcuts = JSON.stringify(validated.customShortcuts);
    if (validated.debugMode !== undefined) data.debugMode = validated.debugMode;
    if (validated.dataExportEnabled !== undefined) data.dataExportEnabled = validated.dataExportEnabled;
    // AI Coach settings
    if (validated.aiProvider !== undefined) data.aiProvider = validated.aiProvider;
    if (validated.aiApiKey !== undefined) data.aiApiKey = validated.aiApiKey;
    if (validated.aiModel !== undefined) data.aiModel = validated.aiModel;
    if (validated.aiOllamaUrl !== undefined) data.aiOllamaUrl = validated.aiOllamaUrl;
    if (validated.coachPersonality !== undefined) data.coachPersonality = validated.coachPersonality;

    // Upsert: create if not exists, update if exists
    const updated = await db.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        language: validated.language ?? DEFAULT_SETTINGS.language,
        timezone: validated.timezone ?? DEFAULT_SETTINGS.timezone,
        theme: validated.theme ?? DEFAULT_SETTINGS.theme,
        sidebarCollapsed: validated.sidebarCollapsed ?? DEFAULT_SETTINGS.sidebarCollapsed,
        compactMode: validated.compactMode ?? DEFAULT_SETTINGS.compactMode,
        defaultFocusDuration: validated.defaultFocusDuration ?? DEFAULT_SETTINGS.defaultFocusDuration,
        focusGoalMinutes: validated.focusGoalMinutes ?? DEFAULT_SETTINGS.focusGoalMinutes,
        autoStartTimer: validated.autoStartTimer ?? DEFAULT_SETTINGS.autoStartTimer,
        showCelebration: validated.showCelebration ?? DEFAULT_SETTINGS.showCelebration,
        ambientSound: validated.ambientSound ?? DEFAULT_SETTINGS.ambientSound,
        desktopNotifications: validated.desktopNotifications ?? DEFAULT_SETTINGS.desktopNotifications,
        breakReminders: validated.breakReminders ?? DEFAULT_SETTINGS.breakReminders,
        missionReminders: validated.missionReminders ?? DEFAULT_SETTINGS.missionReminders,
        streakReminders: validated.streakReminders ?? DEFAULT_SETTINGS.streakReminders,
        achievementAlerts: validated.achievementAlerts ?? DEFAULT_SETTINGS.achievementAlerts,
        idleAlerts: validated.idleAlerts ?? DEFAULT_SETTINGS.idleAlerts,
        shareStats: validated.shareStats ?? DEFAULT_SETTINGS.shareStats,
        publicProfile: validated.publicProfile ?? DEFAULT_SETTINGS.publicProfile,
        customShortcuts: validated.customShortcuts ? JSON.stringify(validated.customShortcuts) : null,
        debugMode: validated.debugMode ?? DEFAULT_SETTINGS.debugMode,
        dataExportEnabled: validated.dataExportEnabled ?? DEFAULT_SETTINGS.dataExportEnabled,
        aiProvider: validated.aiProvider ?? DEFAULT_SETTINGS.aiProvider,
        aiApiKey: validated.aiApiKey ?? DEFAULT_SETTINGS.aiApiKey,
        aiModel: validated.aiModel ?? DEFAULT_SETTINGS.aiModel,
        aiOllamaUrl: validated.aiOllamaUrl ?? DEFAULT_SETTINGS.aiOllamaUrl,
        coachPersonality: validated.coachPersonality ?? DEFAULT_SETTINGS.coachPersonality,
      },
      update: data,
    });

    logInfo('user-settings', `Updated settings for user ${userId}`);
    return NextResponse.json(parseSettings(updated));
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'issues' in e) {
      return NextResponse.json(
        { error: 'Validation failed', details: (e as { issues: Array<{ message: string }> }).issues },
        { status: 400 }
      );
    }
    logError('user-settings', 'Failed to update settings', e);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
