'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Clock,
  Flame,
  Trophy,
  Zap,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  AlertCircle,
  Download,
  Smile,
  BatteryCharging,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { AnimatedNumber } from '@/components/premium/animated-number';
import type { MonthlyReportData } from '@/types';
import { format } from 'date-fns';

// ─── Metric Card ───
const MetricCard = React.memo(function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  sub,
  accent,
}: {
  icon: typeof Clock;
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <motion.div whileHover={{ y: -2, transition: { duration: 0.2 } }}>
      <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-4 sm:p-5">
          <div className={cn('mb-3 flex h-9 w-9 items-center justify-center rounded-lg', accent || 'bg-emerald-500/[0.08]')} aria-hidden="true">
            <Icon className={cn('h-4 w-4', accent ? 'text-emerald-400/80' : 'text-emerald-400/80')} />
          </div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
          <div className="mt-1 flex items-baseline gap-1" aria-live="polite">
            {typeof value === 'number' ? (
              <AnimatedNumber value={value} className="text-2xl font-semibold tabular-nums tracking-tight text-zinc-50" />
            ) : (
              <span className="text-2xl font-semibold tabular-nums tracking-tight text-zinc-50">{value}</span>
            )}
            {unit && <span className="text-xs text-zinc-600">{unit}</span>}
          </div>
          {sub && <p className="mt-1 text-[11px] text-zinc-600">{sub}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
});

// ─── Trend Badge ───
function TrendBadge({ value }: { value: number }) {
  if (value > 0) return (
    <span className="flex items-center gap-0.5 text-[10px] font-medium text-emerald-400">
      <TrendingUp className="h-3 w-3" /> +{value}%
    </span>
  );
  if (value < 0) return (
    <span className="flex items-center gap-0.5 text-[10px] font-medium text-red-400">
      <TrendingDown className="h-3 w-3" /> {Math.abs(value)}%
    </span>
  );
  return (
    <span className="flex items-center gap-0.5 text-[10px] font-medium text-zinc-500">
      <Minus className="h-3 w-3" /> 0%
    </span>
  );
}

export function MonthlyReport() {
  const [data, setData] = useState<MonthlyReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const now = new Date();
      const month = format(now, 'yyyy-MM');
      const res = await fetch(`/api/monthly-report?month=${month}`);
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      setData(json);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDownload = () => {
    if (!data) return;
    const now = new Date();
    const monthLabel = format(now, 'MMMM yyyy');
    const lines = [
      `═══════════════════════════════════════`,
      `  MindGuard Monthly Report — ${monthLabel}`,
      `═══════════════════════════════════════`,
      '',
      `Total Focus Hours:     ${data.totalFocusHours}h`,
      `Avg Daily Focus:       ${data.averageDailyFocus} min`,
      `Best Day:              ${data.bestDay?.date || 'N/A'} (${data.bestDay?.minutes || 0} min)`,
      `Worst Day:             ${data.worstDay?.date || 'N/A'} (${data.worstDay?.minutes || 0} min)`,
      `Most Productive Hour:  ${data.mostProductiveHour !== null ? `${data.mostProductiveHour}:00` : 'N/A'}`,
      `Habit Completion Rate: ${data.habitCompletionRate}%`,
      `Avg Mood:              ${data.moodAverage !== null ? data.moodAverage.toFixed(1) + '/5' : 'N/A'}`,
      `Avg Energy:            ${data.energyAverage !== null ? data.energyAverage.toFixed(1) + '/5' : 'N/A'}`,
      `Achievements Unlocked: ${data.achievementCount}`,
      '',
      `vs Previous Month:`,
      `  Focus Change:    ${data.comparison.focusChange}%`,
      `  Sessions Change:  ${data.comparison.sessionChange}%`,
      `  Streak Change:    ${data.comparison.streakChange > 0 ? '+' : ''}${data.comparison.streakChange}`,
      `  Mood Change:      ${data.comparison.moodChange !== null ? (data.comparison.moodChange > 0 ? '+' : '') + data.comparison.moodChange.toFixed(1) : 'N/A'}`,
      '',
      `Generated by MindGuard AI — ${format(now, 'yyyy-MM-dd HH:mm')}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindguard-report-${format(now, 'yyyy-MM')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="app-grid-bg min-h-full -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mb-8 pt-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/[0.08]" aria-hidden="true">
              <BarChart3 className="h-5 w-5 text-emerald-400/80" />
            </div>
            <div>
              <h2 className="text-[1.65rem] font-semibold tracking-[-0.02em] text-zinc-100">Monthly Report</h2>
              <p className="mt-0.5 text-sm text-zinc-500">Your monthly productivity insights.</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-32 rounded-xl bg-white/[0.02] animate-pulse" />
          ))}
        </div>
      </motion.div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3" role="alert" aria-live="polite">
        <AlertCircle className="h-8 w-8 text-red-400/60" aria-hidden="true" />
        <p className="text-sm text-zinc-400">Failed to load monthly report</p>
        <Button variant="ghost" size="sm" onClick={fetchData} aria-label="Retry loading monthly report">Try again</Button>
      </div>
    );
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="app-grid-bg min-h-full -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <motion.div variants={staggerItem} className="mb-8 pt-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/[0.08]" aria-hidden="true">
            <BarChart3 className="h-5 w-5 text-emerald-400/80" />
          </div>
          <div>
            <h2 className="text-[1.65rem] font-semibold tracking-[-0.02em] text-zinc-100">Monthly Report</h2>
            <p className="mt-0.5 text-sm text-zinc-500">
              {format(new Date(), 'MMMM yyyy')} — your productivity at a glance.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics Row */}
      <motion.div variants={staggerItem} className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard icon={Clock} label="Total Focus" value={data.totalFocusHours} unit="hrs" sub="this month" />
        <MetricCard icon={Zap} label="Daily Avg" value={data.averageDailyFocus} unit="min" sub="per day" />
        <MetricCard icon={Trophy} label="Best Day" value={data.bestDay?.minutes || 0} unit="min" sub={data.bestDay?.date || '—'} />
        <MetricCard icon={Flame} label="Streak" value={data.comparison.streakChange > 0 ? `+${data.comparison.streakChange}` : `${data.comparison.streakChange}`} sub="vs last month" accent="bg-amber-500/[0.08]" />
      </motion.div>

      {/* Secondary Metrics */}
      <motion.div variants={staggerItem} className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard icon={BatteryCharging} label="Habit Rate" value={data.habitCompletionRate} unit="%" sub="completion" />
        <MetricCard icon={Smile} label="Avg Mood" value={data.moodAverage !== null ? data.moodAverage.toFixed(1) : '—'} unit="/5" sub="this month" />
        <MetricCard icon={Calendar} label="Peak Hour" value={data.mostProductiveHour !== null ? `${data.mostProductiveHour}:00` : '—'} sub="most focused" />
        <MetricCard icon={Trophy} label="Achievements" value={data.achievementCount} sub="unlocked" />
      </motion.div>

      {/* Comparison Section */}
      <motion.div variants={staggerItem}>
        <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">vs Previous Month</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="text-xs text-emerald-400/70 hover:text-emerald-400 cursor-pointer"
                aria-label="Download report"
              >
                <Download className="mr-1 h-3 w-3" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-zinc-600">Focus Time</span>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-semibold tabular-nums text-zinc-100">
                    {data.comparison.focusChange > 0 ? '+' : ''}{data.comparison.focusChange}%
                  </span>
                  <TrendBadge value={data.comparison.focusChange} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-zinc-600">Sessions</span>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-semibold tabular-nums text-zinc-100">
                    {data.comparison.sessionChange > 0 ? '+' : ''}{data.comparison.sessionChange}%
                  </span>
                  <TrendBadge value={data.comparison.sessionChange} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-zinc-600">Streak</span>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-semibold tabular-nums text-zinc-100">
                    {data.comparison.streakChange > 0 ? '+' : ''}{data.comparison.streakChange}
                  </span>
                  <TrendBadge value={data.comparison.streakChange} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-zinc-600">Mood</span>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-semibold tabular-nums text-zinc-100">
                    {data.comparison.moodChange !== null ? `${data.comparison.moodChange > 0 ? '+' : ''}${data.comparison.moodChange.toFixed(1)}` : 'N/A'}
                  </span>
                  {data.comparison.moodChange !== null && <TrendBadge value={data.comparison.moodChange} />}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Daily Chart */}
      {data.dailyData.length > 0 && (
        <motion.div variants={staggerItem} className="mt-4">
          <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">Daily Focus Distribution</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="flex h-40 items-end gap-1" role="img" aria-label="Daily focus distribution chart">
                {data.dailyData.map((day, i) => {
                  const maxMin = Math.max(...data.dailyData.map(d => d.minutes), 1);
                  const height = Math.max((day.minutes / maxMin) * 100, 0);
                  return (
                    <div key={day.date} className="flex flex-1 flex-col items-center gap-0.5">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 0.5, delay: i * 0.02 }}
                        className={cn(
                          'w-full rounded-t-sm min-h-[2px]',
                          day.minutes > 0 ? 'bg-emerald-500/40' : 'bg-white/[0.02]'
                        )}
                      />
                      <span className="text-[8px] text-zinc-600 hidden lg:block">
                        {format(new Date(day.date), 'd')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
