import type { Mission, FocusSession, DailyReflection, User } from "@prisma/client";

export type { Mission, FocusSession, DailyReflection, User };

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
  currentStreak: number;
  focusScore: number;
  totalSessions: number;
  todaySessions: number;
}

export interface WeeklyData {
  day: string;
  minutes: number;
  sessions: number;
}

export type TimerState = "idle" | "running" | "paused";