'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Flame,
  Zap,
  Timer,
  TrendingUp,
  AlertCircle,
  CalendarDays,
  Activity,
  Trophy,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedNumber } from '@/components/premium/animated-number';
import { useAppStore } from '@/stores/app-store';
import { cn, formatDuration } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/animations';
import type { WeeklyData } from '@/types';

// ---- Stat Card ----
const StatCard = React.memo(function StatCard({ icon: Icon, label, value, unit, sub, progressVal }: {
  icon: typeof Clock;
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  progressVal?: number;
}) {
  const isNumber = typeof value === 'number';
  return (
    <motion.div whileHover={{ y: -2, transition: { duration: 0.2 } }}>
      <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-4 sm:p-5">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/[0.08]" aria-hidden="true">
            <Icon className="h-4 w-4 text-emerald-400/80" />
          </div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
          <div className="mt-1 flex items-baseline gap-1" aria-live="polite">
            {isNumber ? (
              <AnimatedNumber value={value} className="text-2xl font-semibold tabular-nums tracking-tight text-zinc-50" />
            ) : (
              <span className="text-2xl font-semibold tabular-nums tracking-tight text-zinc-50">{value}</span>
            )}
            {unit && <span className="text-xs text-zinc-600">{unit}</span>}
          </div>
          {sub && <p className="mt-1 text-[11px] text-zinc-600">{sub}</p>}
          {progressVal !== undefined && (
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/[0.04]" role="progressbar" aria-valuenow={progressVal} aria-valuemin={0} aria-valuemax={100} aria-label={`${label} progress`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressVal}%` }}
                transition={{ duration: 1.2, delay: 0.4 }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-500/80 to-teal-400/60"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});

// ---- Enhanced Bar Chart ----
const MiniBarChart = React.memo(function MiniBarChart({ data, today }: { data: WeeklyData[]; today: string }) {
  const maxMinutes = Math.max(...data.map((d) => d.minutes), 1);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="flex h-52 items-end gap-2 sm:gap-3" role="img" aria-label="Weekly focus bar chart">
      {data.map((d, i) => {
        const isToday = d.day === today;
        const barHeight = Math.max((d.minutes / maxMinutes) * 100, 0);
        const isHovered = hoveredIdx === i;

        return (
          <div
            key={d.day}
            className="relative flex flex-1 flex-col items-center gap-2"
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            aria-label={`${d.day}: ${d.minutes} minutes`}
          >
            {/* Value tooltip on hover */}
            <motion.div
              initial={false}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 4 }}
              className="mb-1 rounded-md bg-white/[0.06] px-2 py-1 text-[10px] font-medium tabular-nums text-zinc-300"
              aria-hidden="true"
            >
              {d.minutes}m
            </motion.div>

            <div className="relative flex w-full justify-center">
              {/* Baseline */}
              <div className="absolute bottom-0 h-1 w-8 rounded-full bg-white/[0.03] sm:w-10" aria-hidden="true" />
              {/* Bar */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${barHeight}%` }}
                transition={{ duration: 0.7, delay: 0.15 + i * 0.06 }}
                className={cn(
                  'w-8 rounded-t-lg sm:w-10 transition-all duration-200',
                  d.minutes > 0
                    ? isToday
                      ? 'bg-gradient-to-t from-emerald-500 to-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-gradient-to-t from-emerald-500/70 to-emerald-400/40 shadow-sm shadow-emerald-500/10'
                    : '',
                  isHovered && d.minutes > 0 && 'brightness-125'
                )}
                style={d.minutes > 0 ? { minHeight: '6px' } : undefined}
              />
              {/* Today indicator dot */}
              {isToday && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="absolute -bottom-3 h-1.5 w-1.5 rounded-full bg-emerald-400"
                  aria-hidden="true"
                />
              )}
            </div>
            <span className={cn(
              'text-[10px] font-medium',
              isToday ? 'text-emerald-400/80' : 'text-zinc-600'
            )}>{d.day}</span>
          </div>
        );
      })}
    </div>
  );
});

// ---- Loading Skeleton ----
function StatsSkeleton() {
  return (
    <div className="app-grid-bg min-h-full -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mb-10 pt-2">
        <div className="h-8 w-24 rounded bg-white/[0.03] animate-pulse" />
        <div className="mt-1 h-4 w-48 rounded bg-white/[0.02] animate-pulse" />
      </div>
      <div className="mb-10 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-white/[0.02] animate-pulse" />
        ))}
      </div>
      <div className="h-48 rounded-xl bg-white/[0.02] animate-pulse" />
    </div>
  );
}

export function StatsView() {
  const stats = useAppStore(s => s.stats);
  const setStats = useAppStore(s => s.setStats);
  const weeklyData = useAppStore(s => s.weeklyData);
  const setWeeklyData = useAppStore(s => s.setWeeklyData);
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
        totalFocusMinutes: data.totalFocusMinutes || 0,
        currentStreak: data.currentStreak,
        focusScore: data.focusScore,
        totalSessions: data.totalSessions,
        todaySessions: data.todaySessions,
        avgSessionMinutes: data.avgSessionMinutes || 0,
        bestDay: data.bestDay || null,
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
    return <StatsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3" role="alert" aria-live="polite">
        <AlertCircle className="h-8 w-8 text-red-400/60" aria-hidden="true" />
        <p className="text-sm text-zinc-400">{error}</p>
        <Button variant="ghost" size="sm" onClick={fetchStats} aria-label="Retry loading statistics">Try again</Button>
      </div>
    );
  }

  const s = stats;
  const totalWeekSessions = weeklyData.reduce((a, d) => a + d.sessions, 0);
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'short' });
  const bestDay = s?.bestDay;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="app-grid-bg min-h-full -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <motion.div variants={staggerItem} className="mb-10 pt-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/[0.08]" aria-hidden="true">
            <BarChart3 className="h-5 w-5 text-emerald-400/80" />
          </div>
          <div>
            <h2 className="text-[1.65rem] font-semibold tracking-[-0.02em] text-zinc-100">Statistics</h2>
            <p className="mt-0.5 text-sm text-zinc-500">Your focus patterns at a glance.</p>
          </div>
        </div>
      </motion.div>

      {/* 6 Stat Cards */}
      <motion.div variants={staggerItem} className="mb-10 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard icon={Clock} label="Today" value={s?.todayFocusMinutes || 0} unit="min" sub={`${s?.todaySessions || 0} sessions`} />
        <StatCard icon={TrendingUp} label="This Week" value={s?.weeklyFocusMinutes || 0} unit="min" sub={`${totalWeekSessions} sessions`} />
        <StatCard icon={Activity} label="All Time" value={s?.totalFocusMinutes || 0} unit="min" sub={`${s?.totalSessions || 0} sessions`} />
        <StatCard icon={Timer} label="Avg Session" value={s?.avgSessionMinutes || 0} unit="min" sub="per session" />
        <StatCard icon={Flame} label="Streak" value={s?.currentStreak || 0} unit="days" sub="consecutive" />
        <StatCard icon={Zap} label="Focus Score" value={s?.focusScore || 0} unit="/ 100" progressVal={s?.focusScore || 0} />
      </motion.div>

      {/* Weekly Chart */}
      <motion.div variants={staggerItem}>
        <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">Weekly Overview</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-8 relative">
            {weeklyData.length > 0 ? (
              <MiniBarChart data={weeklyData} today={todayName} />
            ) : (
              <div className="flex h-52 items-center justify-center">
                <p className="text-sm text-zinc-600">No data yet this week</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Row: Best Day + All-time Summary */}
      <motion.div variants={staggerItem} className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Best Day Card */}
        <Card className={cn(
          'card-glow overflow-hidden',
          bestDay && bestDay.minutes > 0 ? 'border-emerald-500/15' : 'border-white/[0.06]'
        )}>
          {bestDay && bestDay.minutes > 0 && (
            <div className="absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-emerald-400/60 to-emerald-500/20" aria-hidden="true" />
          )}
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl',
                bestDay && bestDay.minutes > 0 ? 'bg-emerald-500/10' : 'bg-white/[0.03]'
              )} aria-hidden="true">
                <Trophy className={cn(
                  'h-5 w-5',
                  bestDay && bestDay.minutes > 0 ? 'text-emerald-400' : 'text-zinc-700'
                )} />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Best Day This Week</p>
                {bestDay && bestDay.minutes > 0 ? (
                  <div className="mt-1 flex items-baseline gap-2" aria-live="polite">
                    <span className="text-xl font-semibold tabular-nums text-zinc-50">{bestDay.minutes}m</span>
                    <span className="text-xs text-zinc-500">on {bestDay.day}</span>
                    <span className="text-xs text-zinc-600">· {bestDay.sessions} session{bestDay.sessions !== 1 ? 's' : ''}</span>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-zinc-600">No data yet</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All-time Summary */}
        <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/[0.08]" aria-hidden="true">
                  <Timer className="h-5 w-5 text-emerald-400/80" />
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Total Sessions</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums text-zinc-50" aria-live="polite">{s?.totalSessions || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="text-right">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Total Time</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums text-zinc-50" aria-live="polite">
                    {formatDuration(s?.totalFocusMinutes || 0)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
