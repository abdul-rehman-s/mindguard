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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import type { DashboardStats, Mission, FocusSession } from '@/types';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
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
  accent,
}: {
  icon: typeof Timer;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <Card className="border-zinc-800/50 bg-zinc-900/30">
      <CardContent className="flex items-center gap-4 p-4">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            accent || 'bg-emerald-500/10'
          )}
        >
          <Icon className={cn('h-5 w-5', accent ? 'text-emerald-400' : 'text-emerald-400')} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-zinc-500">{label}</p>
          <p className="text-xl font-semibold text-zinc-100">{value}</p>
          {sub && <p className="text-xs text-zinc-500">{sub}</p>}
        </div>
      </CardContent>
    </Card>
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
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p className="text-sm text-zinc-400">{error}</p>
        <Button variant="ghost" size="sm" onClick={fetchDashboard}>
          Try again
        </Button>
      </div>
    );
  }

  const s = stats;
  const activeMission = useAppStore.getState().activeMission;
  const recentSessions = useAppStore.getState().recentSessions;

  return (
    <motion.div variants={container} initial="hidden" animate="visible">
      {/* Greeting */}
      <motion.div variants={item} className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          {activeMission
            ? `Working on: ${activeMission.title}`
            : 'Set a mission to start your focused day.'}
        </p>
      </motion.div>

      {/* Quick Start */}
      <motion.div variants={item} className="mb-6">
        <Button
          onClick={() => setView('timer')}
          className="group w-full bg-emerald-500 text-white hover:bg-emerald-600 sm:w-auto"
          size="lg"
        >
          <Play className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
          Start Focus Session
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Clock}
          label="Today's Focus"
          value={`${s?.todayFocusMinutes || 0}m`}
          sub={`${s?.todaySessions || 0} sessions`}
        />
        <StatCard
          icon={Timer}
          label="Weekly Focus"
          value={`${s?.weeklyFocusMinutes || 0}m`}
        />
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={`${s?.currentStreak || 0}d`}
          sub="consecutive days"
        />
        <StatCard
          icon={Zap}
          label="Focus Score"
          value={`${s?.focusScore || 0}`}
          sub="/ 100"
        />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Mission */}
        <motion.div variants={item}>
          <h3 className="mb-3 text-sm font-medium text-zinc-400">Current Mission</h3>
          {activeMission ? (
            <Card className="border-zinc-800/50 bg-zinc-900/30">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <Target className="h-4 w-4 text-emerald-400" />
                      <Badge
                        variant="outline"
                        className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      >
                        Active
                      </Badge>
                    </div>
                    <h4 className="mt-2 text-sm font-semibold text-zinc-100">
                      {activeMission.title}
                    </h4>
                    {activeMission.description && (
                      <p className="mt-1 text-xs text-zinc-500 line-clamp-2">
                        {activeMission.description}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-zinc-500">
                      {activeMission.focusSessions.length} focus sessions
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-zinc-500 hover:text-zinc-300"
                    onClick={() => setView('mission')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-zinc-800/50 bg-zinc-900/30">
              <CardContent className="flex flex-col items-center justify-center p-8">
                <Target className="mb-3 h-8 w-8 text-zinc-700" />
                <p className="mb-3 text-sm text-zinc-500">No active mission</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                  onClick={() => setView('mission')}
                >
                  Create Mission
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Recent Sessions */}
        <motion.div variants={item}>
          <h3 className="mb-3 text-sm font-medium text-zinc-400">Recent Sessions</h3>
          <Card className="border-zinc-800/50 bg-zinc-900/30">
            <CardContent className="p-0">
              {recentSessions && recentSessions.length > 0 ? (
                <div className="divide-y divide-zinc-800/50">
                  {recentSessions.slice(0, 5).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-zinc-200">
                          {session.mission?.title || 'Free Focus'}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {new Date(session.startedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-300">
                        <Timer className="h-3.5 w-3.5 text-zinc-500" />
                        {formatDuration(session.duration)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8">
                  <Clock className="mb-3 h-8 w-8 text-zinc-700" />
                  <p className="text-sm text-zinc-500">No sessions yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
