import type { Mission, FocusSession, DailyReflection, User, Achievement } from "@prisma/client";

export type { Mission, FocusSession, DailyReflection, User, Achievement };

export type MissionWithSessions = Mission & {
  focusSessions: FocusSession[];
};

export type SafeUser = Omit<User, "password">;

export type AppView =
  | "landing"
  | "dashboard"
  | "mission"
  | "timer"
  | "reflection"
  | "sessions"
  | "stats"
  | "settings";

export type MissionStatus = "active" | "completed" | "deleted";
export type MissionPriority = "low" | "medium" | "high";

export interface CreateMissionInput {
  title: string;
  description?: string;
  priority?: MissionPriority;
}

export interface UpdateMissionInput {
  title?: string;
  description?: string;
  status?: MissionStatus;
  priority?: MissionPriority;
}

export interface CreateSessionInput {
  missionId?: string;
  duration: number;
  startedAt: string;
  endedAt: string;
}

export interface CreateReflectionInput {
  distraction: string;
  wentWell: string;
  tomorrowMission: string;
}

export interface DashboardStats {
  todayFocusMinutes: number;
  weeklyFocusMinutes: number;
  totalFocusMinutes: number;
  currentStreak: number;
  focusScore: number;
  totalSessions: number;
  todaySessions: number;
  avgSessionMinutes: number;
  bestDay: { day: string; minutes: number; sessions: number } | null;
}

export interface WeeklyData {
  day: string;
  minutes: number;
  sessions: number;
}

export type TimerState = "idle" | "running" | "paused";

export type FocusModeState = "idle" | "launch" | "countdown" | "focus" | "celebration";

export interface OnboardingData {
  primaryUse: string;
  firstMission: string;
  estimatedDuration: number;
}

export interface AchievementDef {
  type: string;
  icon: string;
  title: string;
  description: string;
  check: (stats: { totalSessions: number; totalFocusMinutes: number; currentStreak: number; focusScore: number; todayReflection: boolean }) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { type: "first_focus", icon: "🎯", title: "First Focus", description: "Complete your first focus session", check: (s) => s.totalSessions >= 1 },
  { type: "streak_7", icon: "🔥", title: "7 Day Streak", description: "Maintain a 7-day focus streak", check: (s) => s.currentStreak >= 7 },
  { type: "streak_30", icon: "⚡", title: "30 Day Streak", description: "Maintain a 30-day focus streak", check: (s) => s.currentStreak >= 30 },
  { type: "hours_100", icon: "💎", title: "100 Hours", description: "Accumulate 100 hours of focus time", check: (s) => s.totalFocusMinutes >= 6000 },
  { type: "night_owl", icon: "🦉", title: "Night Owl", description: "Complete a session after midnight", check: () => false },
  { type: "early_bird", icon: "🐦", title: "Early Bird", description: "Complete a session before 7 AM", check: () => false },
  { type: "deep_worker", icon: "🧠", title: "Deep Worker", description: "Complete a 90-minute session", check: () => false },
  { type: "mission_master", icon: "👑", title: "Mission Master", description: "Complete 10 missions", check: (s) => s.totalSessions >= 10 },
];

export interface HeatmapDay {
  date: string;
  minutes: number;
  sessions: number;
  mission?: string;
}

export interface TimelineEvent {
  id: string;
  type: "session" | "reflection" | "mission_completed";
  title: string;
  time: string;
  minutes?: number;
}
