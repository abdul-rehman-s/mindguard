import type { Mission, FocusSession, DailyReflection, User, Achievement, DesktopActivity, Notification } from "@prisma/client";

export type { Mission, FocusSession, DailyReflection, User, Achievement, DesktopActivity, Notification };

export type MissionWithSessions = Mission & {
  focusSessions: FocusSession[];
};

export type AppView =
  | "landing"
  | "dashboard"
  | "life"
  | "mission"
  | "timer"
  | "reflection"
  | "sessions"
  | "stats"
  | "settings"
  | "replay"
  | "review"
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

// ─── MindGuard v3.1 types ───

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

// ─── Phase 4: Desktop Intelligence Engine types ───

export interface LifeDashboardData {
  totalLaptopMinutes: number;
  productiveMinutes: number;
  distractedMinutes: number;
  idleMinutes: number;
  deepWorkMinutes: number;
  focusSessions: number;
  screenTimeMinutes: number;
  missionCompletionRate: number;
  attentionScore: number;
  xp: number;
  level: number;
  currentStreak: number;
  todayFocusMinutes: number;
  weeklyFocusMinutes: number;
  hourlyDistribution: { hour: number; minutes: number }[];
  categoryBreakdown: { category: string; minutes: number; color: string }[];
  recentActivity: {
    id: string;
    type: string;
    title: string;
    startedAt: string;
    duration: number;
  }[];
}

export interface DailyReviewData {
  date: string;
  focusSummary: {
    totalMinutes: number;
    sessionCount: number;
    longestSession: number;
    avgSessionLength: number;
    deepWorkSessions: number;
  };
  missionSummary: {
    completed: number;
    created: number;
    active: number;
  };
  reflection: {
    written: boolean;
    mood: number | null;
    energy: number | null;
    distraction: string | null;
    wentWell: string | null;
  };
  laptopSummary: {
    totalMinutes: number;
    productiveMinutes: number;
    distractedMinutes: number;
    idleMinutes: number;
  };
  distractionSummary: {
    totalDistractedMinutes: number;
    topDistractions: { title: string; minutes: number }[];
    peakDistractionHour: number | null;
  };
  xpGained: number;
  achievementsUnlocked: { type: string; title: string; icon: string }[];
  timeline: {
    time: string;
    event: string;
    type: string;
    duration?: number;
  }[];
  aiRecommendation: string;
  hourlyChart: { hour: number; minutes: number }[];
  weekComparison: {
    todayMinutes: number;
    weekAvgMinutes: number;
    change: number;
  };
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export type ActivityType = "focus" | "idle" | "distracted" | "break" | "deep_work" | "app_usage" | "website_usage";
export type ActivityCategory = "coding" | "design" | "communication" | "entertainment" | "research" | "other";

export interface CreateActivityInput {
  type: ActivityType;
  title?: string;
  category?: ActivityCategory;
  duration: number;
  startedAt: string;
  endedAt?: string;
  application?: string;
  website?: string;
  metadata?: string;
}
