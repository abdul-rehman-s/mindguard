'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Laptop,
  Brain,
  Pause,
  Coffee,
  Zap,
  Target,
  Clock,
  Flame,
  Award,
  TrendingUp,
  Loader2,
  AlertCircle,
  Monitor,
  BarChart3,
  Activity,
  Eye,
  Wifi,
  WifiOff,
  AppWindow,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/stores/app-store';
import { StaggerContainer, StaggerItem } from '@/components/premium/stagger';
import { AnimatedNumber } from '@/components/premium/animated-number';
import { cn, formatDuration } from '@/lib/utils';
import { fadeInUp } from '@/lib/animations';
import type { LifeDashboardData } from '@/types';

// ---- Metric Card ----
const MetricCard = React.memo(function MetricCard({
  icon: Icon, label, value, unit, sub, color, delay = 0, progressVal,
}: {
  icon: typeof Laptop;
  label: string;
  value: number;
  unit?: string;
  sub?: string;
  color: string;
  delay?: number;
  progressVal?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <Card className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02] h-full">
        <CardContent className="p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', color)} aria-hidden="true">
              <Icon className="h-4 w-4" />
            </div>
            {sub && <span className="text-[10px] font-medium text-zinc-600">{sub}</span>}
          </div>
          <p className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
          <div className="mt-1 flex items-baseline gap-1" aria-live="polite">
            <AnimatedNumber value={value} className="text-xl sm:text-2xl font-bold tabular-nums text-zinc-50" />
            {unit && <span className="text-xs text-zinc-600">{unit}</span>}
          </div>
          {progressVal !== undefined && (
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressVal}%` }}
                transition={{ delay: delay + 0.3, duration: 0.8 }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-500/80 to-teal-400/60"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});

// ---- Tracker Status Banner ----
const TrackerBanner = React.memo(function TrackerBanner({
  connected,
  currentApp,
  currentWebsite,
}: {
  connected: boolean;
  currentApp: string | null;
  currentWebsite: string | null;
}) {
  return (
    <Card className={cn(
      "card-glow glass-card glass-glow-edge border-white/[0.06]",
      connected ? "bg-emerald-500/[0.03]" : "bg-white/[0.01]"
    )}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg shrink-0',
            connected ? 'bg-emerald-500/[0.08]' : 'bg-zinc-500/[0.06]'
          )} aria-hidden="true">
            {connected ? (
              <Wifi className="h-4 w-4 text-emerald-400" />
            ) : (
              <WifiOff className="h-4 w-4 text-zinc-500" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={cn(
                'text-xs font-medium',
                connected ? 'text-emerald-400' : 'text-zinc-400'
              )}>Desktop Tracker</span>
              <Badge variant="outline" className={cn(
                'text-[9px] h-4 px-1.5',
                connected
                  ? 'border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-400'
                  : 'border-zinc-500/20 bg-zinc-500/[0.06] text-zinc-500'
              )}>
                {connected ? 'Live' : 'Offline'}
              </Badge>
            </div>
            {connected && currentApp ? (
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <AppWindow className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span className="truncate font-medium text-zinc-300">{currentApp}</span>
                {currentWebsite && (
                  <span className="text-zinc-600 truncate">
                    · <Globe className="h-3 w-3 inline shrink-0" aria-hidden="true" /> {currentWebsite}
                  </span>
                )}
              </div>
            ) : !connected ? (
              <p className="text-xs text-zinc-600">Install MindGuard Desktop for real-time activity tracking</p>
            ) : null}
          </div>
          {!connected && (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 border-white/[0.08] text-zinc-300 hover:bg-white/[0.04] hover:text-zinc-100"
              onClick={() => window.open('https://github.com/abdul-rehman-s/mindguard/releases', '_blank')}
              aria-label="Download MindGuard Desktop"
            >
              Download
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

// ---- Hourly Chart ----
const HourlyChart = React.memo(function HourlyChart({ data }: { data: { hour: number; minutes: number }[] }) {
  const maxVal = useMemo(() => Math.max(...data.map((d) => d.minutes), 1), [data]);
  const currentHour = new Date().getHours();

  return (
    <div className="flex items-end gap-[2px] h-20" role="img" aria-label="Hourly focus distribution chart">
      {data.map((d) => {
        const h = Math.max(2, (d.minutes / maxVal) * 100);
        const isNow = d.hour === currentHour;
        return (
          <div key={d.hour} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: d.hour * 0.02, duration: 0.4 }}
              className={cn(
                'w-full rounded-sm min-h-[2px]',
                isNow
                  ? 'bg-gradient-to-t from-emerald-500 to-emerald-400'
                  : d.minutes > 0
                    ? 'bg-emerald-500/30'
                    : 'bg-white/[0.03]'
              )}
            />
            {d.hour % 3 === 0 && (
              <span className="text-[8px] text-zinc-700 tabular-nums">{d.hour}</span>
            )}
          </div>
        );
      })}
    </div>
  );
});

// ---- Category Breakdown ----
const CategoryBar = React.memo(function CategoryBar({ categories }: { categories: { category: string; minutes: number; color: string }[] }) {
  const total = categories.reduce((a, c) => a + c.minutes, 0) || 1;
  return (
    <div className="space-y-2.5">
      {categories.map((c, i) => (
        <motion.div
          key={c.category}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 + i * 0.06, duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-400 capitalize">{c.category}</span>
            <span className="text-xs tabular-nums text-zinc-500" aria-live="polite">{c.minutes}m</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(c.minutes / total) * 100}%` }}
              transition={{ delay: 0.7 + i * 0.06, duration: 0.6 }}
              className={cn('h-full rounded-full', c.color.replace('text-', 'bg-').replace('400', '500/60'))}
            />
          </div>
        </motion.div>
      ))}
      {categories.length === 0 && (
        <p className="text-xs text-zinc-600 py-4 text-center">No desktop activity tracked yet. Connect the desktop companion to see category breakdowns.</p>
      )}
    </div>
  );
});

// ---- XP Level Ring ----
const LevelRing = React.memo(function LevelRing({ xp, level }: { xp: number; level: number }) {
  const xpForNext = level * 500;
  const prevXp = (level - 1) * 500;
  const progress = Math.min(100, ((xp - prevXp) / (xpForNext - prevXp)) * 100);
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
          <motion.circle
            cx="40" cy="40" r="36" fill="none"
            stroke="url(#xpGrad)" strokeWidth="4" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ delay: 0.5, duration: 1.2 }}
          />
          <defs><linearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="rgb(16,185,129)" /><stop offset="100%" stopColor="rgb(45,212,191)" /></linearGradient></defs>
        </svg>
        <div className="absolute flex flex-col items-center" aria-live="polite">
          <AnimatedNumber value={level} className="text-lg font-bold tabular-nums text-zinc-100" />
          <span className="text-[9px] text-zinc-500">LVL</span>
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-zinc-400">Experience Points</p>
        <p className="mt-0.5 text-xl font-bold tabular-nums text-zinc-100" aria-live="polite">
          <AnimatedNumber value={xp} className="text-xl font-bold tabular-nums text-emerald-400" />
          <span className="text-xs text-zinc-600 ml-1">/ {xpForNext} XP</span>
        </p>
        <p className="mt-1 text-[10px] text-zinc-600">{Math.round(xpForNext - xp)} XP to next level</p>
      </div>
    </div>
  );
});

// ---- Loading Skeleton ----
function LifeDashboardSkeleton() {
  return (
    <div className="app-grid-bg min-h-full -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="pt-2 mb-8">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-white/[0.03] animate-pulse" />
          <div>
            <div className="h-7 w-48 rounded bg-white/[0.03] animate-pulse" />
            <div className="mt-1 h-4 w-64 rounded bg-white/[0.02] animate-pulse" />
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-white/[0.02] animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 mb-6">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-white/[0.02] animate-pulse" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-48 rounded-xl bg-white/[0.02] animate-pulse" />
        <div className="h-48 rounded-xl bg-white/[0.02] animate-pulse" />
      </div>
    </div>
  );
}

// ---- Main Component ----
export function LifeDashboard() {
  const setLifeData = useAppStore(s => s.setLifeData);
  const lifeData = useAppStore(s => s.lifeData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Desktop tracker state
  const [trackerConnected, setTrackerConnected] = useState(false);
  const [currentApp, setCurrentApp] = useState<string | null>(null);
  const [currentWebsite, setCurrentWebsite] = useState<string | null>(null);

  const fetchLife = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch life dashboard data
      const res = await fetch('/api/life-dashboard');
      if (!res.ok) throw new Error('Failed');
      const data = (await res.json()) as LifeDashboardData;
      setLifeData(data);
      setTrackerConnected(data.trackerConnected ?? false);

      // Also fetch desktop status for current app/website
      const statusRes = await fetch('/api/desktop/status');
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setTrackerConnected(statusData.connected);
        setCurrentApp(statusData.currentApp);
        setCurrentWebsite(statusData.currentWebsite);
      }
    } catch {
      setError('Failed to load life dashboard');
    } finally {
      setLoading(false);
    }
  }, [setLifeData]);

  useEffect(() => { fetchLife(); }, [fetchLife]);

  // Poll desktop status every 30s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/desktop/status');
        if (res.ok) {
          const data = await res.json();
          setTrackerConnected(data.connected);
          setCurrentApp(data.currentApp);
          setCurrentWebsite(data.currentWebsite);
        }
      } catch { /* silent fail */ }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <LifeDashboardSkeleton />;
  }

  if (error || !lifeData) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3" role="alert" aria-live="polite">
        <AlertCircle className="h-8 w-8 text-red-400/60" aria-hidden="true" />
        <p className="text-sm text-zinc-400">{error || 'No data available'}</p>
        <Button variant="ghost" size="sm" onClick={fetchLife} aria-label="Retry loading life dashboard">Try again</Button>
      </div>
    );
  }

  const d = lifeData;

  return (
    <StaggerContainer className="app-grid-bg min-h-full -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      {/* Header */}
      <StaggerItem className="mb-6 pt-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/10" aria-hidden="true">
              <Monitor className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="heading-lg text-[1.65rem] font-semibold tracking-[-0.02em] text-zinc-100">
                Life Dashboard
              </h2>
              <p className="mt-0.5 text-sm leading-relaxed text-zinc-500">
                Your complete daily activity overview
              </p>
            </div>
          </div>
        </div>
      </StaggerItem>

      {/* Tracker Status Banner */}
      <StaggerItem className="mb-6">
        <TrackerBanner connected={trackerConnected} currentApp={currentApp} currentWebsite={currentWebsite} />
      </StaggerItem>

      {/* Hero row: XP Level Ring + Attention Score + Streak */}
      <StaggerItem className="mb-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02]">
            <CardContent className="p-4 sm:p-5">
              <LevelRing xp={d.xp} level={d.level} />
            </CardContent>
          </Card>

          <motion.div variants={fadeInUp} initial="hidden" animate="visible">
            <Card className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02] h-full flex flex-col items-center justify-center p-4 sm:p-6">
              <div className="mb-2 flex items-center gap-2">
                <Brain className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Attention Score</span>
              </div>
              <div className="relative flex h-24 w-24 items-center justify-center">
                <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96" aria-hidden="true">
                  <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="5" />
                  <motion.circle
                    cx="48" cy="48" r="42" fill="none"
                    stroke={d.attentionScore >= 70 ? 'rgb(16,185,129)' : d.attentionScore >= 40 ? 'rgb(245,158,11)' : 'rgb(244,63,94)'}
                    strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 42}
                    initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - d.attentionScore / 100) }}
                    transition={{ delay: 0.4, duration: 1.2 }}
                  />
                </svg>
                <span className="absolute text-3xl font-bold tabular-nums text-zinc-50" aria-live="polite">
                  <AnimatedNumber value={d.attentionScore} />
                </span>
              </div>
              <p className="mt-2 text-[10px] text-zinc-600">Composite score based on focus, consistency & streak</p>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp} initial="hidden" animate="visible">
            <Card className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02] h-full flex flex-col items-center justify-center p-4 sm:p-6">
              <div className="mb-2 flex items-center gap-2">
                <Flame className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Current Streak</span>
              </div>
              <span className="text-5xl font-bold tabular-nums text-zinc-50" aria-live="polite">
                <AnimatedNumber value={d.currentStreak} />
              </span>
              <p className="mt-1 text-xs text-zinc-600">consecutive days</p>
              <div className="mt-3 flex gap-1" aria-hidden="true">
                {Array.from({ length: Math.min(d.currentStreak, 7) }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 400, damping: 20 }}
                    className="h-2 w-2 rounded-full bg-gradient-to-b from-amber-400 to-orange-500"
                  />
                ))}
                {d.currentStreak === 0 && <span className="text-[10px] text-zinc-700">No streak yet</span>}
              </div>
            </Card>
          </motion.div>
        </div>
      </StaggerItem>

      {/* Time Metrics Grid - 8 cards */}
      <StaggerItem className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Time Metrics</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <MetricCard icon={Laptop} label="Laptop Time" value={d.totalLaptopMinutes} unit="min" color="bg-emerald-500/[0.08] text-emerald-400" delay={0.05} />
          <MetricCard icon={Brain} label="Productive" value={d.productiveMinutes} unit="min" color="bg-teal-500/[0.08] text-teal-400" delay={0.08} />
          <MetricCard icon={Eye} label="Distracted" value={d.distractedMinutes} unit="min" color="bg-rose-500/[0.08] text-rose-400" delay={0.11} />
          <MetricCard icon={Coffee} label="Idle" value={d.idleMinutes} unit="min" color="bg-amber-500/[0.08] text-amber-400" delay={0.14} />
          <MetricCard icon={Zap} label="Deep Work" value={d.deepWorkMinutes} unit="min" color="bg-purple-500/[0.08] text-purple-400" delay={0.17} />
          <MetricCard icon={Target} label="Focus Sessions" value={d.focusSessions} sub="today" color="bg-sky-500/[0.08] text-sky-400" delay={0.2} />
          <MetricCard icon={Monitor} label="Screen Time" value={d.screenTimeMinutes} unit="min" color="bg-orange-500/[0.08] text-orange-400" delay={0.23} />
          <MetricCard icon={TrendingUp} label="Mission Rate" value={d.missionCompletionRate} unit="%" color="bg-pink-500/[0.08] text-pink-400" delay={0.26} progressVal={d.missionCompletionRate} />
        </div>
      </StaggerItem>

      {/* Bottom row: Hourly Chart + Category Breakdown */}
      <StaggerItem>
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Hourly Focus Chart */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible">
            <Card className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02]">
              <CardContent className="p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-2">
                  <BarChart3 className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
                  <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Hourly Focus</h3>
                  <span className="ml-auto text-[10px] text-zinc-600" aria-live="polite">{d.todayFocusMinutes}m today</span>
                </div>
                <HourlyChart data={d.hourlyDistribution} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Breakdown */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible">
            <Card className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02]">
              <CardContent className="p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
                  <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Activity Categories</h3>
                </div>
                <CategoryBar categories={d.categoryBreakdown} />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </StaggerItem>

      {/* Desktop companion note */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="text-[11px] text-zinc-700">
          {trackerConnected
            ? 'Desktop tracker is connected — activity data is updated in real-time.'
            : 'Connect the MindGuard Desktop Companion for real-time screen time, app tracking, and website usage data.'
          }
        </p>
      </motion.div>
    </StaggerContainer>
  );
}
