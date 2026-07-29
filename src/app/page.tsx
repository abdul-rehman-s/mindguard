'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/stores/app-store';
import { MindGuardSplashLogo } from '@/components/branding/mindguard-logo';
import { Loader2 } from 'lucide-react';
import { useMounted } from '@/hooks/use-mounted';
import { AppShell } from '@/components/app/app-shell';
import { DashboardView } from '@/components/dashboard/dashboard-view';

// ─── Lazy-loaded heavy components ───
// Only loaded when the user navigates to these views, reducing initial bundle size

const LandingPage = dynamic(
  () => import('@/components/landing/landing-page').then(m => ({ default: m.LandingPage })),
  { ssr: false }
);

const OnboardingFlow = dynamic(
  () => import('@/components/onboarding/onboarding-flow').then(m => ({ default: m.OnboardingFlow })),
  { ssr: false }
);

const FocusMode = dynamic(
  () => import('@/components/timer/focus-mode').then(m => ({ default: m.FocusMode })),
  { ssr: false }
);

const LifeDashboard = dynamic(
  () => import('@/components/life/life-dashboard').then(m => ({ default: m.LifeDashboard })),
  { ssr: false }
);

const MissionView = dynamic(
  () => import('@/components/mission/mission-view').then(m => ({ default: m.MissionView })),
  { ssr: false }
);

const TimerView = dynamic(
  () => import('@/components/timer/timer-view').then(m => ({ default: m.TimerView })),
  { ssr: false }
);

const ReflectionView = dynamic(
  () => import('@/components/reflection/reflection-view').then(m => ({ default: m.ReflectionView })),
  { ssr: false }
);

const SessionHistoryView = dynamic(
  () => import('@/components/sessions/session-history-view').then(m => ({ default: m.SessionHistoryView })),
  { ssr: false }
);

const StatsView = dynamic(
  () => import('@/components/stats/stats-view').then(m => ({ default: m.StatsView })),
  { ssr: false }
);

const SettingsView = dynamic(
  () => import('@/components/settings/settings-view').then(m => ({ default: m.SettingsView })),
  { ssr: false }
);

const ReplayView = dynamic(
  () => import('@/components/replay/replay-view').then(m => ({ default: m.ReplayView })),
  { ssr: false }
);

const WrappedView = dynamic(
  () => import('@/components/wrapped/wrapped-view').then(m => ({ default: m.WrappedView })),
  { ssr: false }
);

const DailyReview = dynamic(
  () => import('@/components/review/daily-review').then(m => ({ default: m.DailyReview })),
  { ssr: false }
);

const HabitTrackerView = dynamic(
  () => import('@/components/habits/habit-tracker').then(m => ({ default: m.HabitTracker })),
  { ssr: false }
);

const MonthlyReportView = dynamic(
  () => import('@/components/stats/monthly-report').then(m => ({ default: m.MonthlyReport })),
  { ssr: false }
);

// ─── Suspense fallback ───

function ViewLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
    </div>
  );
}

// ─── Main Page ───

export default function HomePage() {
  const mounted = useMounted();
  const { data: session, status } = useSession();

  // Individual selectors to avoid Zustand over-rendering
  const currentView = useAppStore(s => s.currentView);
  const setUser = useAppStore(s => s.setUser);
  const setView = useAppStore(s => s.setView);
  const setLoading = useAppStore(s => s.setLoading);
  const focusMode = useAppStore(s => s.focusMode);
  const setFocusMode = useAppStore(s => s.setFocusMode);
  const activeMission = useAppStore(s => s.activeMission);
  const focusDuration = useAppStore(s => s.focusDuration);
  const user = useAppStore(s => s.user);

  const [forceOnboarded, setForceOnboarded] = useState(false);
  const [completedForUserId, setCompletedForUserId] = useState<string | null>(null);
  const [onboardingResult, setOnboardingResult] = useState<{ onboarded: boolean } | null>(null);
  const onboardingCheckedRef = useRef(false);

  // Async onboarding check — only needed if session doesn't have onboarded field
  useEffect(() => {
    if (status === 'authenticated' && !onboardingCheckedRef.current) {
      onboardingCheckedRef.current = true;
      const sessionUser = session?.user as Record<string, unknown> | undefined;
      if (sessionUser?.onboarded === undefined) {
        fetch('/api/onboarding')
          .then(r => {
            if (r.status === 401) return null;
            if (!r.ok) throw new Error(`Status ${r.status}`);
            return r.json();
          })
          .then(d => {
            if (d) setOnboardingResult(d);
          })
          .catch(() => {});
      }
    }
    if (status === 'unauthenticated') {
      onboardingCheckedRef.current = false;
    }
  }, [status, session]);

  // Derive onboarding state from session data
  // forceOnboarded only applies to the same user who completed onboarding
  const currentUserId = (session?.user as Record<string, unknown> | undefined)?.id as string | undefined;
  const sessionOnboarded = (session?.user as Record<string, unknown> | undefined)?.onboarded;
  const isForceOnboardedForCurrentUser = forceOnboarded && completedForUserId === currentUserId;
  const needsOnboarding = !isForceOnboardedForCurrentUser && status === 'authenticated' && (sessionOnboarded === false || (sessionOnboarded === undefined && onboardingResult?.onboarded === false));

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const sessionUser = session.user as Record<string, unknown>;
      setUser({
        id: (sessionUser.id as string) || '',
        email: (sessionUser.email as string) || '',
        name: (sessionUser.name as string) || null,
        onboarded: (sessionUser.onboarded as boolean) ?? (onboardingResult?.onboarded ?? true),
      });
      if (!needsOnboarding && currentView === 'landing') {
        setView('dashboard');
      }
    }
    setLoading(false);
  }, [status, session, setUser, setView, currentView, setLoading, needsOnboarding]);

  const handleOnboardingComplete = () => {
    setForceOnboarded(true);
    setCompletedForUserId(currentUserId ?? null);
    if (user) setUser({ ...user, onboarded: true });
    setView('dashboard');
  };

  const handleFocusExit = () => {
    setFocusMode('idle');
  };

  if (!mounted || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <MindGuardSplashLogo />
          <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
        </div>
      </div>
    );
  }

  if (currentView === 'landing' || status === 'unauthenticated') {
    return (
      <Suspense fallback={<ViewLoadingFallback />}>
        <LandingPage />
      </Suspense>
    );
  }

  if (needsOnboarding) {
    return (
      <Suspense fallback={<ViewLoadingFallback />}>
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </Suspense>
    );
  }

  if (focusMode === 'focus') {
    return (
      <Suspense fallback={<ViewLoadingFallback />}>
        <FocusMode
          duration={focusDuration}
          missionTitle={activeMission?.title || null}
          onExit={handleFocusExit}
        />
      </Suspense>
    );
  }

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
        >
          <Suspense fallback={<ViewLoadingFallback />}>
            {currentView === 'dashboard' && <DashboardView />}
            {currentView === 'life' && <LifeDashboard />}
            {currentView === 'mission' && <MissionView />}
            {currentView === 'timer' && <TimerView />}
            {currentView === 'reflection' && <ReflectionView />}
            {currentView === 'sessions' && <SessionHistoryView />}
            {currentView === 'stats' && <StatsView />}
            {currentView === 'replay' && <ReplayView />}
            {currentView === 'review' && <DailyReview />}
            {currentView === 'wrapped' && <WrappedView />}
            {currentView === 'settings' && <SettingsView />}
            {currentView === 'habits' && <HabitTrackerView />}
            {currentView === 'monthly' && <MonthlyReportView />}
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}
