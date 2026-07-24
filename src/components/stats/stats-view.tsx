'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Flame,
  Zap,
  BarChart3,
  Timer,
  TrendingUp,
  Loader2,
  AlertCircle,
  CalendarDays,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import type { WeeklyData } from '@/types';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function MiniBarChart({ data }: { data: WeeklyData[] }) {
  const maxMinutes = Math.max(...data.map((d) => d.minutes), 1);

  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((d) => (
        <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="text-[10px] font-medium text-zinc-400">
            {d.minutes > 0 ? `${d.minutes}m` : '-'}
          </span>
          <div className="relative w-full flex justify-center">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max((d.minutes / maxMinutes) * 100, 4)}%` }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              className={cn(
                'w-8 sm:w-10 rounded-t-md',
                d.minutes > 0
                  ? 'bg-gradient-to-t from-emerald-500/80 to-emerald-400/60'
                  : 'bg-zinc-800/50'
              )}
            />
          </div>
          <span className="text-[10px] text-zinc-500">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

export function StatsView() {
  const { stats, setStats, weeklyData, setWeeklyData } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setStats({
        todayFocusMinutes: data.todayFocusMinutes,
        weeklyFocusMinutes: data.weeklyFocusMinutes,
        currentStreak: data.currentStreak,
        focusScore: data.focusScore,
        totalSessions: data.totalSessions,
        todaySessions: data.todaySessions,
      });
      setWeeklyData(data.weeklyData || []);
    } catch {
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  }, [setStats, setWeeklyData]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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
        <Button variant="ghost" size="sm" onClick={fetchStats}>Try again</Button>
      </div>
    );
  }

  const s = stats;
  const totalWeekSessions = weeklyData.reduce((a, d) => a + d.sessions, 0);

  return (
    <motion.div variants={container} initial="hidden" animate="visible">
      <motion.div variants={item} className="mb-8">
        <h2 className="text-lg font-semibold text-zinc-100">Statistics</h2>
        <p className="text-sm text-zinc-500">Your focus patterns at a glance.</p>
      </motion.div>

      {/* Main stat cards */}
      <motion.div variants={item} className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="border-zinc-800/50 bg-zinc-900/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-zinc-500">Today</span>
            </div>
            <p className="text-2xl font-bold text-zinc-100">{s?.todayFocusMinutes || 0}<span className="text-sm font-normal text-zinc-500 ml-1">min</span></p>
            <p className="mt-1 text-xs text-zinc-500">{s?.todaySessions || 0} sessions</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800/50 bg-zinc-900/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-zinc-500">This Week</span>
            </div>
            <p className="text-2xl font-bold text-zinc-100">{s?.weeklyFocusMinutes || 0}<span className="text-sm font-normal text-zinc-500 ml-1">min</span></p>
            <p className="mt-1 text-xs text-zinc-500">{totalWeekSessions} sessions</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800/50 bg-zinc-900/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-zinc-500">Streak</span>
            </div>
            <p className="text-2xl font-bold text-zinc-100">{s?.currentStreak || 0}<span className="text-sm font-normal text-zinc-500 ml-1">days</span></p>
            <p className="mt-1 text-xs text-zinc-500">Keep going!</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800/50 bg-zinc-900/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-zinc-500">Focus Score</span>
            </div>
            <p className="text-2xl font-bold text-zinc-100">{s?.focusScore || 0}<span className="text-sm font-normal text-zinc-500 ml-1">/ 100</span></p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${s?.focusScore || 0}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Chart */}
      <motion.div variants={item}>
        <Card className="border-zinc-800/50 bg-zinc-900/30">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-zinc-500" />
              <CardTitle className="text-sm font-medium text-zinc-300">Weekly Overview</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            {weeklyData.length > 0 ? (
              <MiniBarChart data={weeklyData} />
            ) : (
              <div className="flex h-40 items-center justify-center text-sm text-zinc-500">
                No data yet this week
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Sessions summary */}
      <motion.div variants={item} className="mt-6">
        <Card className="border-zinc-800/50 bg-zinc-900/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-zinc-500" />
                <span className="text-sm text-zinc-400">Total Sessions</span>
              </div>
              <span className="text-lg font-semibold text-zinc-100">{s?.totalSessions || 0}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
