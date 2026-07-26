'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/stores/app-store';
import { LandingPage } from '@/components/landing/landing-page';
import { AppShell } from '@/components/app/app-shell';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import { LifeDashboard } from '@/components/life/life-dashboard';
import { MissionView } from '@/components/mission/mission-view';
import { TimerView } from '@/components/timer/timer-view';
import { ReflectionView } from '@/components/reflection/reflection-view';
import { SessionHistoryView } from '@/components/sessions/session-history-view';
import { StatsView } from '@/components/stats/stats-view';
import { SettingsView } from '@/components/settings/settings-view';
import { ReplayView } from '@/components/replay/replay-view';
import { WrappedView } from '@/components/wrapped/wrapped-view';
import { DailyReview } from '@/components/review/daily-review';
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { FocusMode } from '@/components/timer/focus-mode';
import { Loader2 } from 'lucide-react';
import { useMounted } from '@/hooks/use-mounted';

export default function HomePage() {
  const mounted = useMounted();
  const { data: session, status } = useSession();
  const { currentView, setUser, setView, setLoading, focusMode, setFocusMode, activeMission, focusDuration } = useAppStore();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const onboardingCheckedRef = useRef(false);

  useEffect(() => {
    if (status === 'authenticated' && !onboardingCheckedRef.current) {
      onboardingCheckedRef.current = true;
      const user = session?.user as Record<string, unknown> | undefined;
      if (!user?.onboarded) {
        fetch('/api/onboarding').then(r => r.json()).then(d => {
          if (!d.onboarded) setShowOnboarding(true);
        }).catch(() => {});
      }
    }
  }, [status, session]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user && !showOnboarding) {
      const user = session.user as Record<string, unknown>;
      setUser({
        id: (user.id as string) || '',
        email: (user.email as string) || '',
        name: (user.name as string) || null,
        onboarded: (user.onboarded as boolean) ?? true,
      });
      if (currentView === 'landing') {
        setView('dashboard');
      }
    } else if (status === 'unauthenticated') {
      setUser(null);
      setView('landing');
    }
    setLoading(false);
  }, [status, session, setUser, setView, currentView, setLoading, showOnboarding]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    const user = session?.user as Record<string, unknown>;
    if (user) setUser({ ...useAppStore.getState().user!, onboarded: true });
    setView('dashboard');
  };

  const handleFocusExit = () => {
    setFocusMode('idle');
  };

  if (!mounted || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
            <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
        </div>
      </div>
    );
  }

  if (currentView === 'landing' || status === 'unauthenticated') {
    return <LandingPage />;
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (focusMode === 'focus') {
    return (
      <FocusMode
        duration={focusDuration}
        missionTitle={activeMission?.title || null}
        onExit={handleFocusExit}
      />
    );
  }

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -8, filter: 'blur(2px)' }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        >
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
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}
