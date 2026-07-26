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
  | "settings"
  | "replay"
  | "wrapped";

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
  type:
    | "session"
    | "reflection"
    | "mission_completed"
    | "break"
    | "mission_created"
    | "achievement_unlocked";
  title: string;
  subtitle?: string;
  time: string;
  minutes?: number;
  group?: string;
}

// ─── MindGuard v3.1 new types ───

export interface CoachData {
  greeting: string;
  userName: string;
  todayMinutes: number;
  yesterdayMinutes: number;
  weekMinutes: number;
  bestHour: number | null;
  bestWeekday: string | null;
  streak: number;
  weekMissionsCompleted: number;
  weekReflections: number;
  recommendations: string[];
  summary: string;
}

export interface AchievementProgress {
  type: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  progressMax: number;
  progressPct: number;
  xpReward: number;
  unlockedAt: string | null;
  estimatedRemaining: string | null;
}

export interface Insight {
  type: "pattern" | "trend" | "achievement" | "suggestion";
  title: string;
  description: string;
  metric: string;
  value: string | number;
  icon: string;
}

export interface ReplayEvent {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  time: string;
  duration?: number;
  icon: string;
}

export interface ReplayData {
  date: string;
  events: ReplayEvent[];
  summary: {
    totalMinutes: number;
    sessionCount: number;
    missionsCompleted: number;
    reflectionWritten: boolean;
    longestSession: number;
    bestHour: number | null;
  };
}

export interface WeeklyWrapped {
  totalFocusHours: number;
  totalFocusMinutes?: number;
  sessionCount: number;
  deepestSession?: { duration: number; mission: string | null; date: string } | null;
  bestDay: { day: string; minutes: number; sessions: number } | null;
  mostProductiveHour: { hour: string; sessions: number; avgMinutes: number } | null;
  longestStreak: number;
  overallStreak?: number;
  missionCompletionRate: number;
  missionsCompleted?: number;
  missionsCreated?: number;
  reflectionRate: number;
  reflectionsWritten?: number;
  reflectionDaysPossible?: number;
  attentionScore?: number;
  attentionGrade: string;
  weekOverWeek: {
    focusChange: number;
    sessionChange: number;
    streakChange: number;
    missionRateChange?: number;
  };
  lastWeek?: {
    totalFocusHours: number;
    sessionCount: number;
    longestStreak: number;
    missionCompletionRate: number;
    reflectionCount: number;
  };
  weekRange?: { start: string; end: string };
}
