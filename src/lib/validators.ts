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

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateMissionInputValidated = z.infer<typeof createMissionSchema>;
export type UpdateMissionInputValidated = z.infer<typeof updateMissionSchema>;
export type CreateSessionInputValidated = z.infer<typeof createSessionSchema>;
export type CreateReflectionInputValidated = z.infer<typeof createReflectionSchema>;
export type UpdateSettingsInputValidated = z.infer<typeof updateSettingsSchema>;
export type BatchActivitiesInputValidated = z.infer<typeof batchActivitiesSchema>;
export type DesktopSettingsInputValidated = z.infer<typeof desktopSettingsSchema>;

export const chatMessageSchema = z.object({
  message: z.string().min(1, "Message is required").max(2000, "Message is too long"),
  sessionId: z.string().optional(),
});

export const createMemorySchema = z.object({
  type: z.enum(['habit', 'pattern', 'preference', 'insight', 'summary', 'conversation', 'weekly_report', 'streak', 'distraction_pattern', 'best_hours', 'work_preference', 'manual']).optional(),
  content: z.string().min(1, "Content is required").max(2000, "Content is too long"),
  importance: z.number().int().min(1).max(10).optional(),
});

export type ChatMessageInputValidated = z.infer<typeof chatMessageSchema>;
export type CreateMemoryInputValidated = z.infer<typeof createMemorySchema>;
