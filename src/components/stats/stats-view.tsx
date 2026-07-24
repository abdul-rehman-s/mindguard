'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Flame,
  Zap,
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
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
};

function MiniBarChart({ data }: { data: WeeklyData[] }) {
  const maxMinutes = Math.max(...data.map((d) => d.minutes), 1);

  return (
    <div className="flex h-44 items-end gap-2">
      {data.map((d, i) => (
        <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-[10px] font-medium tabular-nums text-zinc-500">
            {d.minutes > 0 ? `${d.minutes}m` : ''}
          </span>
          <div className="relative flex w-full justify-center">
            {/* Baseline */}
            <div className="absolute bottom-0 h-1 w-8 rounded-full bg-white/[0.03] sm:w-10" />
            {/* Bar */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max((d.minutes / maxMinutes) * 100, 0)}%` }}
              transition={{ duration: 0.7, delay: 0.15 + i * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
              className={cn(
                'w-8 rounded-t-lg sm:w-10',
                d.minutes > 0
                  ? 'bg-gradient-to-t from-emerald-500/70 to-emerald-400/40 shadow-sm shadow-emerald-500/10'
                  : ''
              )}
              style={d.minutes > 0 ? { minHeight: '6px' } : undefined}
            />
          </div>
          <span className={cn(
            'text-[10px] font-medium',
            i === data.length - 1 ? 'text-emerald-400/60' : 'text-zinc-600'
          )}>{d.day}</span>
        </div>
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, unit, sub, progressVal }: {
  icon: typeof Clock;
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  progressVal?: number;
}) {
  return (
    <motion.div whileHover={{ y: -2, transition: { duration: 0.2 } }}>
      <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-5">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/[0.08]">
            <Icon className="h-4 w-4 text-emerald-400/80" />
          </div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-semibold tabular-nums tracking-tight text-zinc-50">{value}</span>
            {unit && <span className="text-xs text-zinc-600">{unit}</span>}
          </div>
          {sub && <p className="mt-1 text-[11px] text-zinc-600">{sub}</p>}
          {progressVal !== undefined && (
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/[0.04]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressVal}%` }}
                transition={{ duration: 1.2, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-500/80 to-teal-400/60"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
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

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-zinc-600" /></div>;
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <AlertCircle className="h-8 w-8 text-red-400/60" />
        <p className="text-sm text-zinc-400">{error}</p>
        <Button variant="ghost" size="sm" onClick={fetchStats}>Try again</Button>
      </div>
    );
  }

  const s = stats;
  const totalWeekSessions = weeklyData.reduce((a, d) => a + d.sessions, 0);

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="app-grid-bg min-h-full -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <motion.div variants={item} className="mb-10 pt-2">
        <h2 className="text-[1.65rem] font-semibold tracking-[-0.02em] text-zinc-100">Statistics</h2>
        <p className="mt-1.5 text-sm text-zinc-500">Your focus patterns at a glance.</p>
      </motion.div>

      <motion.div variants={item} className="mb-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Clock} label="Today" value={s?.todayFocusMinutes || 0} unit="min" sub={`${s?.todaySessions || 0} sessions`} />
        <StatCard icon={TrendingUp} label="This Week" value={s?.weeklyFocusMinutes || 0} unit="min" sub={`${totalWeekSessions} sessions`} />
        <StatCard icon={Flame} label="Streak" value={s?.currentStreak || 0} unit="days" sub="consecutive" />
        <StatCard icon={Zap} label="Focus Score" value={s?.focusScore || 0} unit="/ 100" progressVal={s?.focusScore || 0} />
      </motion.div>

      <motion.div variants={item}>
        <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5 text-zinc-500" />
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">Weekly Overview</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            {weeklyData.length > 0 ? (
              <MiniBarChart data={weeklyData} />
            ) : (
              <div className="flex h-44 items-center justify-center">
                <p className="text-sm text-zinc-600">No data yet this week</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="mt-4">
        <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/[0.08]">
                  <Timer className="h-4 w-4 text-emerald-400/80" />
                </div>
                <span className="text-sm text-zinc-400">Total Sessions</span>
              </div>
              <span className="text-xl font-semibold tabular-nums text-zinc-100">{s?.totalSessions || 0}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}