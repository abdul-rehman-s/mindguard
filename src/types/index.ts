import type { Mission, FocusSession, DailyReflection, User, Achievement, DesktopActivity, Notification, Device, Habit, HabitEntry } from "@prisma/client";

export type { Mission, FocusSession, DailyReflection, User, Achievement, DesktopActivity, Notification, Device, Habit, HabitEntry };

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
  | "wrapped"
  | "habits"
  | "monthly";

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
  // Trend / comparison data
  yesterdayFocusMinutes: number;
  lastWeekFocusMinutes: number;
  // Personalization data
  primaryUse: string | null;
  workSchedule: string | null;
  goals: string[];            // parsed from JSON
  focusGoalMinutes: number;
  biggestDistraction: string | null;
  // Distraction summary (from desktop tracker)
  todayDistractionMinutes: number;
  todayDistractionTopApps: { name: string; minutes: number }[];
  // Focus blocks suggestion data
  bestFocusHours: number[];
  // Smart Focus Score
  smartFocusScore: number;
  smartScoreColor: { bg: string; text: string; label: string };
  smartScoreTrend: number;  // positive = improving vs yesterday
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
  // Psychological profiling fields (Task 2-c)
  role?: string;
  workSchedule?: string;
  workHours?: number;
  wakeTime?: string;
  sleepTime?: string;
  chronotype?: string;
  focusStyle?: string;
  hasAdhd?: boolean;
  pomodoroPreference?: string;
  deepWorkDuration?: number;
  preferredSchedule?: string;
  coachPersonality?: string;
  motivationStyle?: string;
  biggestDistraction?: string;
  distractionsList?: string[];
  distractionRanking?: string[];
  goals?: string[];
  focusGoalMinutes?: number;
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
  habitCompleted?: number;  // how many habits completed that day
}

export interface HabitWithEntries extends Habit {
  entries: HabitEntry[];
}

export interface HabitStreak {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
}

export interface MonthlyReportData {
  totalFocusHours: number;
  averageDailyFocus: number;
  bestDay: { date: string; minutes: number } | null;
  worstDay: { date: string; minutes: number } | null;
  mostProductiveHour: number | null;
  habitCompletionRate: number;
  moodAverage: number | null;
  energyAverage: number | null;
  achievementCount: number;
  comparison: {
    focusChange: number;
    sessionChange: number;
    streakChange: number;
    moodChange: number | null;
  };
  dailyData: { date: string; minutes: number; sessions: number; mood: number | null; energy: number | null; habitCompleted: number }[];
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
  // AI-enhanced fields
  aiBriefing?: string | null;
  aiMorningPlan?: string | null;
  aiNightReview?: string | null;
  aiProvider?: string;
  aiModel?: string;
  coachPersonality?: string;
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

export type ActivityType = "focus" | "idle" | "distracted" | "break" | "deep_work" | "learning" | "coding" | "writing" | "meetings" | "browsing" | "entertainment" | "gaming" | "app_usage" | "website_usage";
export type ActivityCategory = "coding" | "design" | "communication" | "entertainment" | "research" | "writing" | "meetings" | "learning" | "other";

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

export interface BatchActivityInput {
  activities: CreateActivityInput[];
}

// ─── Desktop Agent types ───

export interface DesktopStatus {
  connected: boolean;
  trackingEnabled: boolean;
  currentApp: string | null;
  currentWebsite: string | null;
  currentActivityType: ActivityType | null;
  idleMinutes: number;
  lastActivityAt: string | null;
}

export interface DesktopTimelineEntry {
  id: string;
  time: string;
  endTime?: string;
  type: ActivityType;
  title: string;
  application?: string;
  website?: string;
  duration: number;
  category?: ActivityCategory;
}

export interface ProductivityMetrics {
  productiveMinutes: number;
  distractedMinutes: number;
  idleMinutes: number;
  deepWorkSessions: number;
  contextSwitches: number;
  longestFocusSession: number;
  focusRatio: number;
  bestHour: number | null;
  worstHour: number | null;
}

export interface DesktopSettingsData {
  autoStart: boolean;
  runInBackground: boolean;
  privacyMode: boolean;
  trackingEnabled: boolean;
  trackingExclusions: string[];
  blockedApps: string[];
  blockedWebsites: string[];
  notificationPrefs: {
    idleAlert: boolean;
    breakReminder: boolean;
    focusCelebration: boolean;
    missionReminder: boolean;
  };
  focusProtection: boolean;
  muteNotifications: boolean;
  trackerInterval: number;
}

export interface BehavioralCoachData {
  patterns: {
    excessiveContextSwitching: boolean;
    lateNightWork: boolean;
    burnoutRisk: boolean;
    distractionSpike: boolean;
    poorConsistency: boolean;
  };
  bestWorkingHours: number[];
  recommendations: string[];
  summary: string;
}

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

// ─── Device Pairing types ───

export interface DeviceInfo {
  id: string;
  deviceName: string | null;
  deviceType: string;
  platform: string | null;
  isActive: boolean;
  lastSyncAt: string | null;
  createdAt: string;
}

export interface PairingResponse {
  pairingToken: string;
  expiresIn: number;
  deviceId: string;
}

export interface PairingStatusResponse {
  status: "no_pairing" | "pairing_available" | "paired";
  pairingToken?: string;
}

export interface PairingCompleteResponse {
  refreshToken: string;
  accessToken: string;
  deviceId: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    displayName: string | null;
    onboarded: boolean;
  };
}

export interface TokenRefreshResponse {
  accessToken: string;
}

export interface DeviceSyncResponse {
  settings: UserSettingsData | null;
  desktopSettings: DesktopSettingsData | null;
  activeMissions: { id: string; title: string; description: string | null; status: string; priority: string }[];
  recentSessions: { id: string; missionId: string | null; duration: number; startedAt: string; quality: number | null }[];
  user: {
    id: string;
    email: string;
    displayName: string | null;
    focusGoalMinutes: number | null;
    preferredFocusDuration: number | null;
  };
}
