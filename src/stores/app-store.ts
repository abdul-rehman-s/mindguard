import { create } from "zustand";
import type { AppView, DashboardStats, WeeklyData, FocusModeState, OnboardingData, CoachData, WeeklyWrapped, LifeDashboardData, DailyReviewData, NotificationItem, DesktopStatus, DesktopSettingsData, ProductivityMetrics, BehavioralCoachData, DesktopTimelineEntry } from "@/types";
import type { Mission, FocusSession, DailyReflection, Achievement } from "@prisma/client";

export type SafeUser = {
  id: string;
  email: string;
  name?: string | null;
  onboarded?: boolean;
};

interface AppState {
  currentView: AppView;
  setView: (view: AppView) => void;

  user: SafeUser | null;
  setUser: (user: SafeUser | null) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  activeMission: (Mission & { focusSessions: FocusSession[] }) | null;
  setActiveMission: (mission: (Mission & { focusSessions: FocusSession[] }) | null) => void;

  stats: DashboardStats | null;
  setStats: (stats: DashboardStats) => void;

  weeklyData: WeeklyData[];
  setWeeklyData: (data: WeeklyData[]) => void;

  recentSessions: (FocusSession & { mission: { id: string; title: string } | null })[];
  setRecentSessions: (sessions: (FocusSession & { mission: { id: string; title: string } | null })[]) => void;

  missions: (Mission & { focusSessions: FocusSession[] })[];
  setMissions: (missions: (Mission & { focusSessions: FocusSession[] })[]) => void;

  todayReflection: DailyReflection | null;
  setTodayReflection: (reflection: DailyReflection | null) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  focusMode: FocusModeState;
  setFocusMode: (mode: FocusModeState) => void;

  achievements: Achievement[];
  setAchievements: (a: Achievement[]) => void;

  lastSessionResult: { duration: number; missionTitle: string | null } | null;
  setLastSessionResult: (r: { duration: number; missionTitle: string | null } | null) => void;

  focusDuration: number;
  setFocusDuration: (d: number) => void;

  coach: CoachData | null;
  setCoach: (c: CoachData | null) => void;

  wrapped: WeeklyWrapped | null;
  setWrapped: (w: WeeklyWrapped | null) => void;

  lifeData: LifeDashboardData | null;
  setLifeData: (d: LifeDashboardData | null) => void;

  reviewData: DailyReviewData | null;
  setReviewData: (d: DailyReviewData | null) => void;

  notifications: NotificationItem[];
  setNotifications: (n: NotificationItem[]) => void;
  unreadCount: number;
  setUnreadCount: (c: number) => void;

  // Desktop Agent state
  desktopStatus: DesktopStatus | null;
  setDesktopStatus: (s: DesktopStatus | null) => void;
  desktopSettings: DesktopSettingsData | null;
  setDesktopSettings: (s: DesktopSettingsData | null) => void;
  desktopTimeline: DesktopTimelineEntry[];
  setDesktopTimeline: (t: DesktopTimelineEntry[]) => void;
  productivityMetrics: ProductivityMetrics | null;
  setProductivityMetrics: (m: ProductivityMetrics | null) => void;
  behavioralCoach: BehavioralCoachData | null;
  setBehavioralCoach: (c: BehavioralCoachData | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: "landing",
  setView: (view) => set({ currentView: view }),

  user: null,
  setUser: (user) => set({ user }),
  isLoading: true,
  setLoading: (isLoading) => set({ isLoading }),

  activeMission: null,
  setActiveMission: (activeMission) => set({ activeMission }),

  stats: null,
  setStats: (stats) => set({ stats }),

  weeklyData: [],
  setWeeklyData: (weeklyData) => set({ weeklyData }),

  recentSessions: [],
  setRecentSessions: (recentSessions) => set({ recentSessions }),

  missions: [],
  setMissions: (missions) => set({ missions }),

  todayReflection: null,
  setTodayReflection: (todayReflection) => set({ todayReflection }),

  sidebarOpen: true,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  sidebarCollapsed: false,
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

  focusMode: "idle",
  setFocusMode: (focusMode) => set({ focusMode }),

  achievements: [],
  setAchievements: (achievements) => set({ achievements }),

  lastSessionResult: null,
  setLastSessionResult: (lastSessionResult) => set({ lastSessionResult }),

  focusDuration: 1500,
  setFocusDuration: (focusDuration) => set({ focusDuration }),

  coach: null,
  setCoach: (coach) => set({ coach }),

  wrapped: null,
  setWrapped: (wrapped) => set({ wrapped }),

  lifeData: null,
  setLifeData: (lifeData) => set({ lifeData }),

  reviewData: null,
  setReviewData: (reviewData) => set({ reviewData }),

  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  unreadCount: 0,
  setUnreadCount: (unreadCount) => set({ unreadCount }),

  desktopStatus: null,
  setDesktopStatus: (desktopStatus) => set({ desktopStatus }),
  desktopSettings: null,
  setDesktopSettings: (desktopSettings) => set({ desktopSettings }),
  desktopTimeline: [],
  setDesktopTimeline: (desktopTimeline) => set({ desktopTimeline }),
  productivityMetrics: null,
  setProductivityMetrics: (productivityMetrics) => set({ productivityMetrics }),
  behavioralCoach: null,
  setBehavioralCoach: (behavioralCoach) => set({ behavioralCoach }),

}));
