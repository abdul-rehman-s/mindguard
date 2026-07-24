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

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateMissionInputValidated = z.infer<typeof createMissionSchema>;
export type UpdateMissionInputValidated = z.infer<typeof updateMissionSchema>;
export type CreateSessionInputValidated = z.infer<typeof createSessionSchema>;
export type CreateReflectionInputValidated = z.infer<typeof createReflectionSchema>;
export type UpdateSettingsInputValidated = z.infer<typeof updateSettingsSchema>;
