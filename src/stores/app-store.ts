import { create } from "zustand";
import type { AppView, DashboardStats, WeeklyData, FocusModeState, OnboardingData } from "@/types";
import type { Mission, FocusSession, DailyReflection, Achievement } from "@prisma/client";

type SafeUser = {
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

  focusMode: FocusModeState;
  setFocusMode: (mode: FocusModeState) => void;

  achievements: Achievement[];
  setAchievements: (a: Achievement[]) => void;

  lastSessionResult: { duration: number; missionTitle: string | null } | null;
  setLastSessionResult: (r: { duration: number; missionTitle: string | null } | null) => void;
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

  focusMode: "idle",
  setFocusMode: (focusMode) => set({ focusMode }),

  achievements: [],
  setAchievements: (achievements) => set({ achievements }),

  lastSessionResult: null,
  setLastSessionResult: (lastSessionResult) => set({ lastSessionResult }),

}));

