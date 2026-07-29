import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createMissionSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title is too long"),
  description: z.string().max(2000).optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

export const updateMissionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(["active", "completed", "deleted"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

export const createSessionSchema = z.object({
  missionId: z.string().optional(),
  duration: z.number().int().min(1),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime(),
});

export const createReflectionSchema = z.object({
  distraction: z.string().min(1, "This field is required").max(2000),
  wentWell: z.string().min(1, "This field is required").max(2000),
  tomorrowMission: z
    .string()
    .min(1, "This field is required")
    .max(500),
  mood: z.number().int().min(1).max(5).optional(),
  energy: z.number().int().min(1).max(5).optional(),
});

export const updateSettingsSchema = z.object({
  displayName: z.string().max(50).optional(),
});

export const batchActivitiesSchema = z.object({
  activities: z.array(z.object({
    type: z.enum(["focus", "idle", "distracted", "break", "deep_work", "learning", "coding", "writing", "meetings", "browsing", "entertainment", "gaming", "app_usage", "website_usage"]),
    title: z.string().max(500).optional(),
    category: z.enum(["coding", "design", "communication", "entertainment", "research", "writing", "meetings", "learning", "other"]).optional(),
    duration: z.number().int().min(1),
    startedAt: z.string(),
    endedAt: z.string().optional(),
    application: z.string().max(200).optional(),
    website: z.string().max(500).optional(),
    metadata: z.string().max(5000).optional(),
  })).min(1).max(100),
});

export const desktopSettingsSchema = z.object({
  autoStart: z.boolean().optional(),
  runInBackground: z.boolean().optional(),
  privacyMode: z.boolean().optional(),
  trackingEnabled: z.boolean().optional(),
  trackingExclusions: z.array(z.string()).max(50).optional(),
  blockedApps: z.array(z.string()).max(50).optional(),
  blockedWebsites: z.array(z.string()).max(100).optional(),
  notificationPrefs: z.object({
    idleAlert: z.boolean().optional(),
    breakReminder: z.boolean().optional(),
    focusCelebration: z.boolean().optional(),
    missionReminder: z.boolean().optional(),
  }).optional(),
  focusProtection: z.boolean().optional(),
  muteNotifications: z.boolean().optional(),
  trackerInterval: z.number().int().min(5).max(120).optional(),
});

export const userSettingsSchema = z.object({
  language: z.string().max(10).optional(),
  timezone: z.string().max(50).nullable().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  sidebarCollapsed: z.boolean().optional(),
  compactMode: z.boolean().optional(),
  defaultFocusDuration: z.number().int().min(5).max(120).optional(),
  focusGoalMinutes: z.number().int().min(5).max(720).optional(),
  autoStartTimer: z.boolean().optional(),
  showCelebration: z.boolean().optional(),
  ambientSound: z.enum(["rain", "classical", "deep_focus", "white_noise", "nature"]).nullable().optional(),
  desktopNotifications: z.boolean().optional(),
  breakReminders: z.boolean().optional(),
  missionReminders: z.boolean().optional(),
  streakReminders: z.boolean().optional(),
  achievementAlerts: z.boolean().optional(),
  idleAlerts: z.boolean().optional(),
  shareStats: z.boolean().optional(),
  publicProfile: z.boolean().optional(),
  customShortcuts: z.record(z.string(), z.string()).nullable().optional(),
  debugMode: z.boolean().optional(),
  dataExportEnabled: z.boolean().optional(),
  // AI Coach
  aiProvider: z.enum(["z-ai", "openai", "deepseek", "openrouter", "gemini", "anthropic", "ollama"]).optional(),
  aiApiKey: z.string().max(500).nullable().optional(),
  aiModel: z.string().max(100).nullable().optional(),
  aiOllamaUrl: z.string().max(200).nullable().optional(),
  coachPersonality: z.enum(["strict", "friendly", "data_nerd"]).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateMissionInputValidated = z.infer<typeof createMissionSchema>;
export type UpdateMissionInputValidated = z.infer<typeof updateMissionSchema>;
export type CreateSessionInputValidated = z.infer<typeof createSessionSchema>;
export type CreateReflectionInputValidated = z.infer<typeof createReflectionSchema>;
export type UpdateSettingsInputValidated = z.infer<typeof updateSettingsSchema>;
export type BatchActivitiesInputValidated = z.infer<typeof batchActivitiesSchema>;
export type DesktopSettingsInputValidated = z.infer<typeof desktopSettingsSchema>;
export type UserSettingsInputValidated = z.infer<typeof userSettingsSchema>;

// ─── Device Pairing & Auth ───

export const devicePairSchema = z.object({
  deviceName: z.string().max(100).optional(),
  deviceType: z.enum(["desktop", "mobile", "web"]).default("desktop"),
  platform: z.enum(["mac", "win", "linux"]).optional(),
});

export const devicePairCompleteSchema = z.object({
  pairingToken: z.string().min(1, "Pairing token is required"),
  deviceName: z.string().max(100).optional(),
  platform: z.enum(["mac", "win", "linux"]).optional(),
});

export const deviceRefreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type DevicePairInputValidated = z.infer<typeof devicePairSchema>;
export type DevicePairCompleteInputValidated = z.infer<typeof devicePairCompleteSchema>;
export type DeviceRefreshInputValidated = z.infer<typeof deviceRefreshSchema>;
