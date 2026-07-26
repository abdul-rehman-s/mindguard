'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Timer,
  Flame,
  Zap,
  Clock,
  Play,
  Target,
  ChevronRight,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Sun,
  SunDim,
  Moon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/stores/app-store';
import { cn, formatDuration, timeAgo, getGreeting } from '@/lib/utils';
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/animations';
import { AnimatedNumber } from '@/components/premium/animated-number';
import type { DashboardStats } from '@/types';

import { playClick } from '@/lib/sounds';

import { Heatmap } from './heatmap';
import { AchievementsV2 } from './achievements-v2';
import { Timeline } from './timeline';
import { AiCoach } from './ai-coach';
import { AiInsights } from './ai-insights';

// ---- Greeting Config ----
function getGreetingConfig(hour: number) {
  if (hour < 12) return { greeting: 'morning', Icon: Sun, gradient: 'from-amber-500/20 to-orange-500/10', iconColor: 'text-amber-400' };
  if (hour < 18) return { greeting: 'afternoon', Icon: SunDim, gradient: 'from-amber-500/15 to-yellow-500/10', iconColor: 'text-amber-300/80' };
  return { greeting: 'evening', Icon: Moon, gradient: 'from-indigo-500/15 to-violet-500/10', iconColor: 'text-indigo-300/80' };
}

// ---- Stat Card Component (React.memo) ----
const StatCard = React.memo(function StatCard({ icon: Icon, label, value, sub, progressVal }: {
  icon: typeof Timer;
  label: string;
  value: string | number;
  sub?: string;
  progressVal?: number;
}) {
  const isNumber = typeof value === 'number';
  return (
    <motion.div whileHover={{ y: -2, transition: { duration: 0.2 } }}>
      <Card className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/[0.08]">
              <Icon className="h-4 w-4 text-emerald-400/80" aria-hidden="true" />
            </div>
          </div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
          <div className="mt-1 flex items-baseline gap-1.5">
            {isNumber ? (
              <AnimatedNumber value={value as number} className="text-2xl font-semibold tabular-nums tracking-tight text-zinc-50" />
            ) : (
              <span className="text-2xl font-semibold tabular-nums tracking-tight text-zinc-50">{value}</span>
            )}
          </div>
          {sub && <p className="mt-1 text-[11px] text-zinc-600">{sub}</p>}
          {progressVal !== undefined && (
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/[0.04]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressVal}%` }}
                transition={{ duration: 1.2, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-500/80 to-teal-400/60"
                aria-hidden="true"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});

// ---- Active Mission Card (React.memo) ----
const ActiveMissionCard = React.memo(function ActiveMissionCard({
  activeMission,
  onNavigate,
}: {
  activeMission: { title: string; description?: string; priority?: string; focusSessions: { length: number }[] } | null;
  onNavigate: (view: 'timer' | 'mission') => void;
}) {
  if (activeMission) {
    return (
      <Card className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02] overflow-hidden relative">
        <div className="absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-emerald-400/60 to-emerald-500/20" aria-hidden="true" />
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/[0.08] text-[10px] font-medium text-emerald-400">
                  Active
                </Badge>
                <Badge variant="outline" className={cn(
                  'text-[10px] capitalize',
                  activeMission.priority === 'high' ? 'border-red-500/20 bg-red-500/[0.08] text-red-400' :
                  activeMission.priority === 'medium' ? 'border-amber-500/20 bg-amber-500/[0.08] text-amber-400' :
                  'border-zinc-500/20 bg-zinc-500/[0.08] text-zinc-400'
                )}>
                  {activeMission.priority || 'medium'}
                </Badge>
              </div>
              <h4 className="text-sm font-medium text-zinc-100">{activeMission.title}</h4>
              {activeMission.description && (
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 line-clamp-2">{activeMission.description}</p>
              )}
              <div className="mt-3 flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[11px] text-zinc-600">
                  <Timer className="h-3 w-3" aria-hidden="true" />
                  {activeMission.focusSessions.length} session{activeMission.focusSessions.length !== 1 ? 's' : ''}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 text-emerald-400/80 hover:text-emerald-300 hover:bg-emerald-500/[0.06]"
                  onClick={() => onNavigate('timer')}
                  aria-label="Start focus session for this mission"
                >
                  <Play className="h-3 w-3" aria-hidden="true" />
                  Start Focus
                </Button>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.04]" onClick={() => onNavigate('mission')} aria-label="Go to missions">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-glow glass-card glass-glow-edge border-dashed border-white/[0.06] bg-white/[0.01]">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03]" aria-hidden="true">
          <Target className="h-6 w-6 text-zinc-700" />
        </div>
        <p className="mb-1 text-sm font-medium text-zinc-400">No active mission</p>
        <p className="mb-4 text-xs text-zinc-600">Create one to start tracking your focus</p>
        <Button variant="outline" size="sm" className="border-white/[0.08] text-zinc-300 hover:bg-white/[0.04] hover:text-zinc-100" onClick={() => onNavigate('mission')} aria-label="Create a mission">
          Create Mission
        </Button>
      </CardContent>
    </Card>
  );
});

// ---- Skeleton Loading ----
function DashboardSkeleton() {
  return (
    <div className="app-grid-bg min-h-full -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mb-10 pt-2">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 animate-pulse rounded-xl bg-white/[0.04]" />
          <div>
            <div className="h-6 w-40 animate-pulse rounded bg-white/[0.04]" />
            <div className="mt-1 h-4 w-60 animate-pulse rounded bg-white/[0.04]" />
          </div>
        </div>
      </div>
      <div className="mb-10">
        <div className="h-11 w-48 animate-pulse rounded-lg bg-white/[0.04]" />
      </div>
      <div className="mb-10 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-white/[0.04]" />
        ))}
      </div>
    </div>
  );
}

// ---- Main Component ----
export function DashboardView() {
  const setView = useAppStore(s => s.setView);
  const setStats = useAppStore(s => s.setStats);
  const setActiveMission = useAppStore(s => s.setActiveMission);
  const setRecentSessions = useAppStore(s => s.setRecentSessions);
  const stats = useAppStore(s => s.stats);
  const activeMission = useAppStore(s => s.activeMission);
  const recentSessions = useAppStore(s => s.recentSessions);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error('Failed to load dashboard');
      const data = await res.json();
      setStats({
        todayFocusMinutes: data.todayFocusMinutes,
        weeklyFocusMinutes: data.weeklyFocusMinutes,
        totalFocusMinutes: data.totalFocusMinutes || 0,
        currentStreak: data.currentStreak,
        focusScore: data.focusScore,
        totalSessions: data.totalSessions,
        todaySessions: data.todaySessions,
        avgSessionMinutes: data.avgSessionMinutes || 0,
        bestDay: data.bestDay || null,
      });
      setActiveMission(data.activeMission);
      setRecentSessions(data.recentSessions);
    } catch {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [setStats, setActiveMission, setRecentSessions]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3" role="alert" aria-live="polite">
        <AlertCircle className="h-8 w-8 text-red-400/60" />
        <p className="text-sm text-zinc-400">{error}</p>
        <Button variant="ghost" size="sm" onClick={fetchDashboard} aria-label="Try loading dashboard again">Try again</Button>
      </div>
    );
  }

  const s = stats;
  const hour = new Date().getHours();
  const { greeting, Icon: GreetingIcon, gradient, iconColor } = getGreetingConfig(hour);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="app-grid-bg min-h-full -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
    >
      {/* Greeting */}
      <motion.div variants={staggerItem} className="mb-10 pt-2">
        <div className="flex items-center gap-3.5">
          <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br', gradient)} aria-hidden="true">
            <GreetingIcon className={cn('h-5 w-5', iconColor)} />
          </div>
          <div>
            <h2 className="heading-lg text-[1.65rem] font-semibold tracking-[-0.02em] text-zinc-100">
              Good {greeting}
            </h2>
            <p className="mt-0.5 text-sm leading-relaxed text-zinc-500">
              {activeMission
                ? (<span>Working on <span className="font-medium text-zinc-300">{activeMission.title}</span></span>)
                : 'Set a mission to start your focused day.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick Start CTA */}
      <motion.div variants={staggerItem} className="mb-10">
        <Button
          onClick={() => { playClick(); setView('timer'); }}
          className="btn-glow group h-11 w-full bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-emerald-500/30 sm:w-auto"
          size="lg"
          aria-label="Start a focus session"
        >
          <Play className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
          Start Focus Session
          <ArrowUpRight className="ml-1.5 h-3.5 w-3.5 opacity-0 transition-all duration-200 group-hover:opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </Button>
      </motion.div>

      {/* Stats Grid - 6 cards */}
      <motion.div variants={staggerItem} className="mb-10 grid grid-cols-2 gap-3 lg:grid-cols-3" aria-label="Focus statistics">
        <StatCard icon={Clock} label="Today's Focus" value={s?.todayFocusMinutes || 0} sub={`${s?.todaySessions || 0} sessions`} />
        <StatCard icon={Timer} label="Weekly Focus" value={s?.weeklyFocusMinutes || 0} sub="this week" />
        <StatCard icon={TrendingUp} label="Total Focus" value={s?.totalFocusMinutes || 0} sub="all time" />
        <StatCard icon={Activity} label="Avg Session" value={s?.avgSessionMinutes || 0} sub="per session" />
        <StatCard icon={Flame} label="Current Streak" value={s?.currentStreak || 0} sub="consecutive days" />
        <StatCard icon={Zap} label="Focus Score" value={s?.focusScore || 0} sub="/ 100" progressVal={s?.focusScore || 0} />
      </motion.div>

      {/* Bottom section — Active Mission + Recent Sessions */}
      <motion.div variants={staggerItem} className="grid gap-4 lg:grid-cols-2">
        {/* Active Mission */}
        <motion.div variants={fadeInUp}>
          <div className="mb-3 flex items-center gap-2">
            <Target className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Current Mission</h3>
          </div>
          <ActiveMissionCard activeMission={activeMission} onNavigate={setView} />
        </motion.div>

        {/* Recent Sessions */}
        <motion.div variants={fadeInUp}>
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Recent Sessions</h3>
          </div>
          <Card className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02]">
            <CardContent className="p-0">
              {recentSessions && recentSessions.length > 0 ? (
                <div className="divide-y divide-white/[0.04] max-h-96 overflow-y-auto" aria-label="Recent sessions list">
                  {recentSessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="group flex items-center justify-between px-4 sm:px-5 py-3.5 transition-colors hover:bg-white/[0.02]">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className={cn(
                          'h-1.5 w-1.5 shrink-0 rounded-full',
                          session.mission ? 'bg-emerald-400/60' : 'bg-zinc-700'
                        )} aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="truncate text-sm text-zinc-200">{session.mission?.title || 'Free Focus'}</p>
                          <p className="mt-0.5 text-[11px] text-zinc-600" aria-live="polite">{timeAgo(session.startedAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm font-medium tabular-nums text-emerald-400/70">
                        <Timer className="h-3 w-3" aria-hidden="true" />
                        {formatDuration(session.duration)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12" aria-label="No recent sessions">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03]" aria-hidden="true">
                    <Clock className="h-6 w-6 text-zinc-700" />
                  </div>
                  <p className="mb-1 text-sm font-medium text-zinc-400">No sessions yet</p>
                  <p className="text-xs text-zinc-600">Complete your first focus session</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Bottom widgets row — 3-col x 2-row grid */}
      <motion.div variants={staggerItem} className="mt-4">
        <div className="grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
          {/* Left column: AI Coach (full height — spans both rows) */}
          <div className="lg:row-span-2 flex">
            <div className="flex w-full">
              <AiCoach />
            </div>
          </div>

          {/* Middle column: Timeline (top) */}
          <Timeline />

          {/* Right column: Heatmap (top) */}
          <Heatmap />

          {/* Middle column: AI Insights (bottom) */}
          <AiInsights />

          {/* Right column: Achievements V2 (bottom) */}
          <AchievementsV2 />
        </div>
      </motion.div>
    </motion.div>
  );
}
