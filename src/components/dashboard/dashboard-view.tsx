'use client';

import { useEffect, useState, useCallback } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import type { DashboardStats, FocusSession } from '@/types';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
};

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  delay = 0,
}: {
  icon: typeof Timer;
  label: string;
  value: string | number;
  sub?: string;
  delay?: number;
}) {
  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/[0.08]">
              <Icon className="h-4 w-4 text-emerald-400/80" />
            </div>
          </div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold tabular-nums tracking-tight text-zinc-50">{value}</span>
          </div>
          {sub && <p className="mt-1 text-xs text-zinc-600">{sub}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function DashboardView() {
  const { setView, setStats, setActiveMission, setRecentSessions, stats } = useAppStore();
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
        currentStreak: data.currentStreak,
        focusScore: data.focusScore,
        totalSessions: data.totalSessions,
        todaySessions: data.todaySessions,
      });

      setActiveMission(data.activeMission);
      setRecentSessions(data.recentSessions);
    } catch {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [setStats, setActiveMission, setRecentSessions]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <AlertCircle className="h-8 w-8 text-red-400/60" />
        <p className="text-sm text-zinc-400">{error}</p>
        <Button variant="ghost" size="sm" onClick={fetchDashboard}>Try again</Button>
      </div>
    );
  }

  const s = stats;
  const activeMission = useAppStore.getState().activeMission;
  const recentSessions = useAppStore.getState().recentSessions;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="app-grid-bg min-h-full -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      {/* Greeting */}
      <motion.div variants={item} className="mb-10 pt-2">
        <h2 className="text-[1.65rem] font-semibold tracking-[-0.02em] text-zinc-100">
          Good {greeting}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
          {activeMission
            ? (<span>Working on <span className="font-medium text-zinc-300">{activeMission.title}</span></span>)
            : 'Set a mission to start your focused day.'}
        </p>
      </motion.div>

      {/* Quick Start CTA */}
      <motion.div variants={item} className="mb-10">
        <Button
          onClick={() => setView('timer')}
          className="btn-glow group h-11 w-full bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-emerald-500/30 sm:w-auto"
          size="lg"
        >
          <Play className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
          Start Focus Session
          <ArrowUpRight className="ml-1.5 h-3.5 w-3.5 opacity-0 transition-all duration-200 group-hover:opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="mb-12 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Clock} label="Today's Focus" value={`${s?.todayFocusMinutes || 0}m`} sub={`${s?.todaySessions || 0} sessions`} />
        <StatCard icon={Timer} label="Weekly Focus" value={`${s?.weeklyFocusMinutes || 0}m`} />
        <StatCard icon={Flame} label="Current Streak" value={`${s?.currentStreak || 0}d`} sub="consecutive days" />
        <StatCard icon={Zap} label="Focus Score" value={`${s?.focusScore || 0}`} sub="/ 100" />
      </motion.div>

      {/* Bottom section */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Active Mission */}
        <motion.div variants={item}>
          <div className="mb-3 flex items-center gap-2">
            <Target className="h-3.5 w-3.5 text-zinc-500" />
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Current Mission</h3>
          </div>
          {activeMission ? (
            <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <Badge variant="outline" className="mb-3 border-emerald-500/20 bg-emerald-500/[0.08] text-[10px] font-medium text-emerald-400">
                      Active
                    </Badge>
                    <h4 className="text-sm font-medium text-zinc-100">{activeMission.title}</h4>
                    {activeMission.description && (
                      <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 line-clamp-2">{activeMission.description}</p>
                    )}
                    <p className="mt-3 text-[11px] text-zinc-600">{activeMission.focusSessions.length} focus sessions</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.04]" onClick={() => setView('mission')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="card-glow border-dashed border-white/[0.06] bg-white/[0.01]">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03]">
                  <Target className="h-6 w-6 text-zinc-700" />
                </div>
                <p className="mb-1 text-sm font-medium text-zinc-400">No active mission</p>
                <p className="mb-4 text-xs text-zinc-600">Create one to start tracking your focus</p>
                <Button variant="outline" size="sm" className="border-white/[0.08] text-zinc-300 hover:bg-white/[0.04] hover:text-zinc-100" onClick={() => setView('mission')}>
                  Create Mission
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Recent Sessions */}
        <motion.div variants={item}>
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-zinc-500" />
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Recent Sessions</h3>
          </div>
          <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
            <CardContent className="p-0">
              {recentSessions && recentSessions.length > 0 ? (
                <div className="divide-y divide-white/[0.04]">
                  {recentSessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-white/[0.02]">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-zinc-200">{session.mission?.title || 'Free Focus'}</p>
                        <p className="mt-0.5 text-[11px] text-zinc-600">{new Date(session.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm font-medium tabular-nums text-zinc-400">
                        <Timer className="h-3 w-3" />
                        {formatDuration(session.duration)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03]">
                    <Clock className="h-6 w-6 text-zinc-700" />
                  </div>
                  <p className="mb-1 text-sm font-medium text-zinc-400">No sessions yet</p>
                  <p className="text-xs text-zinc-600">Complete your first focus session</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}