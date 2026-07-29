'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Gift,
  Sparkles,
  Clock,
  Trophy,
  Calendar,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus,
  Flame,
  Target,
  BookOpen,
  Loader2,
  AlertCircle,
  Award,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedNumber } from '@/components/premium/animated-number';
import { useAppStore } from '@/stores/app-store';
import { cn, formatDuration } from '@/lib/utils';
import { fadeInUp } from '@/lib/animations';
import type { WeeklyWrapped } from '@/types';

const GRADE_STYLES: Record<string, { color: string; bg: string; ring: string; label: string }> = {
  A: { color: 'text-emerald-400', bg: 'from-emerald-500/15 to-teal-500/5', ring: 'ring-emerald-500/30', label: 'Outstanding' },
  B: { color: 'text-teal-400', bg: 'from-teal-500/15 to-emerald-500/5', ring: 'ring-teal-500/30', label: 'Strong' },
  C: { color: 'text-amber-400', bg: 'from-amber-500/15 to-yellow-500/5', ring: 'ring-amber-500/30', label: 'Solid' },
  D: { color: 'text-orange-400', bg: 'from-orange-500/15 to-amber-500/5', ring: 'ring-orange-500/30', label: 'Building' },
  F: { color: 'text-rose-400', bg: 'from-rose-500/15 to-red-500/5', ring: 'ring-rose-500/30', label: 'Getting started' },
};

const WoWArrow = React.memo(function WoWArrow({ value, suffix = '%' }: { value: number; suffix?: string }) {
  if (value > 0) return <div className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400"><ArrowUp className="h-2.5 w-2.5" aria-hidden="true" />+{value}{suffix}</div>;
  if (value < 0) return <div className="flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-400"><ArrowDown className="h-2.5 w-2.5" aria-hidden="true" />{value}{suffix}</div>;
  return <div className="flex items-center gap-1 rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-zinc-500"><Minus className="h-2.5 w-2.5" aria-hidden="true" />0{suffix}</div>;
});

const WrappedStatCard = React.memo(function WrappedStatCard({
  icon: Icon, label, value, subtitle, delay, accent,
}: { icon: LucideIcon; label: string; value: string; subtitle?: string; delay: number; accent: 'emerald' | 'amber' | 'purple' | 'sky' }) {
  const accentMap = { emerald: 'text-emerald-400 bg-emerald-500/[0.08]', amber: 'text-amber-400 bg-amber-500/[0.08]', purple: 'text-purple-400 bg-purple-500/[0.08]', sky: 'text-sky-400 bg-sky-500/[0.08]' };
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
      <div className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02] h-full">
        <div className="p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', accentMap[accent])} aria-hidden="true">
              <Icon className="h-4 w-4" />
            </div>
          </div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-50" aria-live="polite">{value}</p>
          {subtitle && <p className="mt-1 text-[11px] text-zinc-600">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );
});

const WrappedProgressCard = React.memo(function WrappedProgressCard({
  icon: Icon, label, value, suffix, subtitle, delay, accent, wowValue, wowSuffix,
}: { icon: LucideIcon; label: string; value: number; suffix?: string; subtitle?: string; delay: number; accent: 'emerald' | 'amber' | 'purple' | 'sky'; wowValue?: number; wowSuffix?: string }) {
  const accentConfig = {
    emerald: { iconBg: 'bg-emerald-500/[0.08] text-emerald-400', bar: 'from-emerald-500/80 to-teal-400/60' },
    amber: { iconBg: 'bg-amber-500/[0.08] text-amber-400', bar: 'from-amber-500/80 to-orange-400/60' },
    purple: { iconBg: 'bg-purple-500/[0.08] text-purple-400', bar: 'from-purple-500/80 to-fuchsia-400/60' },
    sky: { iconBg: 'bg-sky-500/[0.08] text-sky-400', bar: 'from-sky-500/80 to-cyan-400/60' },
  };
  const cfg = accentConfig[accent];
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
      <div className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02] h-full">
        <div className="p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', cfg.iconBg)} aria-hidden="true">
              <Icon className="h-4 w-4" />
            </div>
            {wowValue !== undefined && <WoWArrow value={wowValue} suffix={wowSuffix} />}
          </div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
          <div className="mt-1 flex items-baseline gap-1" aria-live="polite">
            <AnimatedNumber value={value} className="text-2xl font-bold tabular-nums text-zinc-50" />
            {suffix && <span className="text-xs text-zinc-600">{suffix}</span>}
          </div>
          {subtitle && <p className="mt-1 text-[11px] text-zinc-600">{subtitle}</p>}
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={`${label}: ${value}%`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${value}%` }}
              transition={{ delay: delay + 0.2, duration: 0.8 }}
              className={cn('h-full rounded-full bg-gradient-to-r', cfg.bar)}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
});

const WoWCard = React.memo(function WoWCard({ label, change, thisValue, lastValue }: { label: string; change: number; thisValue: string; lastValue: string }) {
  return (
    <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[9px] font-medium uppercase tracking-wider text-zinc-600">{label}</span>
        <WoWArrow value={change} suffix="" />
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <p className="text-[9px] text-zinc-700">This week</p>
          <p className="text-sm font-semibold tabular-nums text-zinc-100" aria-live="polite">{thisValue}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-zinc-700">Last week</p>
          <p className="text-sm font-semibold tabular-nums text-zinc-500">{lastValue}</p>
        </div>
      </div>
    </div>
  );
});

function WrappedSkeleton() {
  return (
    <div className="app-grid-bg min-h-full -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="pt-2 mb-8 flex flex-col items-center text-center">
        <div className="h-14 w-14 rounded-2xl bg-white/[0.03] animate-pulse mb-4" />
        <div className="h-10 w-48 rounded bg-white/[0.03] animate-pulse" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3 mb-4">
        <div className="h-48 rounded-xl bg-white/[0.02] animate-pulse lg:col-span-2" />
        <div className="h-48 rounded-xl bg-white/[0.02] animate-pulse" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-4">
        {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-32 rounded-xl bg-white/[0.02] animate-pulse" />)}
      </div>
    </div>
  );
}

export function WrappedView() {
  const wrapped = useAppStore(s => s.wrapped);
  const setWrapped = useAppStore(s => s.setWrapped);
  const setView = useAppStore(s => s.setView);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchWrapped = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/weekly-wrapped');
      if (!res.ok) throw new Error('Failed');
      const data = (await res.json()) as WeeklyWrapped;
      setWrapped(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [setWrapped]);

  useEffect(() => { fetchWrapped(); }, [fetchWrapped]);

  if (loading) {
    return <WrappedSkeleton />;
  }

  if (error || !wrapped) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3" role="alert" aria-live="polite">
        <AlertCircle className="h-8 w-8 text-red-400/60" aria-hidden="true" />
        <p className="text-sm text-zinc-400">Couldn&apos;t load your weekly wrapped.</p>
        <Button variant="ghost" size="sm" onClick={fetchWrapped} aria-label="Retry loading weekly wrapped">
          Try again
        </Button>
      </div>
    );
  }

  const gradeStyle = GRADE_STYLES[wrapped.attentionGrade] || GRADE_STYLES.F;
  const isEmpty = wrapped.totalFocusHours === 0 && wrapped.sessionCount === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="app-grid-bg min-h-full -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex flex-col items-center pt-2 text-center"
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/10" aria-hidden="true">
          <Gift className="h-7 w-7 text-emerald-400" />
        </div>
        <h1 className="heading-xl text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
          Your <span className="gradient-text">Weekly Wrapped</span>
        </h1>
        <p className="mt-2 max-w-md text-sm text-zinc-500">
          {wrapped.weekRange
            ? `${new Date(wrapped.weekRange.start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${new Date(wrapped.weekRange.end).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
            : 'A look back at your focus week.'}
        </p>
      </motion.div>

      {isEmpty ? (
        <div className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02] mx-auto max-w-md flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03]" aria-hidden="true">
            <Sparkles className="h-7 w-7 text-zinc-700" />
          </div>
          <p className="mb-1 text-base font-medium text-zinc-300">No focus data this week</p>
          <p className="mb-4 text-sm text-zinc-500">
            Start a few focus sessions and come back to see your weekly wrapped.
          </p>
          <Button
            onClick={() => setView('timer')}
            aria-label="Start a focus session"
            className="btn-glow bg-gradient-to-b from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500"
          >
            Start a session
          </Button>
        </div>
      ) : (
        <>
          {/* Top row: hero cards */}
          <div className="mb-4 grid gap-4 lg:grid-cols-3">
            {/* Total focus hours - hero card */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="lg:col-span-2">
              <div className="card-glow glass-card glass-glow-edge border-white/[0.06] relative h-full overflow-hidden bg-gradient-to-br from-emerald-500/[0.06] via-white/[0.02] to-transparent">
                <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-emerald-500/[0.08] blur-3xl" aria-hidden="true" />
                <div className="relative p-4 sm:p-6 lg:p-8">
                  <div className="mb-2 flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-emerald-400/70" aria-hidden="true" />
                    <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-400/80">Total Focus Time</span>
                  </div>
                  <div className="flex items-baseline gap-2" aria-live="polite">
                    <AnimatedNumber value={wrapped.totalFocusHours} decimals={1} className="bg-gradient-to-br from-zinc-50 to-emerald-200 bg-clip-text text-4xl font-bold tabular-nums text-transparent sm:text-5xl lg:text-6xl" />
                    <span className="text-xl font-medium text-zinc-500">hrs</span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">{wrapped.sessionCount} session{wrapped.sessionCount === 1 ? '' : 's'} this week</p>
                  <div className="mt-4"><WoWArrow value={wrapped.weekOverWeek.focusChange} /></div>
                </div>
              </div>
            </motion.div>

            {/* Attention grade */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
              <div className={cn('card-glow glass-card glass-glow-edge border-white/[0.06] relative h-full overflow-hidden bg-gradient-to-br', gradeStyle.bg)}>
                <div className="relative flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
                  <div className="mb-2 flex items-center gap-2">
                    <Award className={cn('h-3.5 w-3.5', gradeStyle.color)} aria-hidden="true" />
                    <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Attention Grade</span>
                  </div>
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.4, duration: 0.6, type: 'spring' }}
                    className={cn('flex h-24 w-24 items-center justify-center rounded-2xl ring-2', gradeStyle.ring)}
                    aria-live="polite"
                  >
                    <span className={cn('text-5xl font-bold', gradeStyle.color)}>{wrapped.attentionGrade}</span>
                  </motion.div>
                  <p className={cn('mt-3 text-xs font-medium', gradeStyle.color)}>{gradeStyle.label}</p>
                  {wrapped.attentionScore !== undefined && (
                    <p className="mt-0.5 text-[10px] tabular-nums text-zinc-600">{wrapped.attentionScore}/100 composite score</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats grid */}
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <WrappedStatCard delay={0.3} icon={Trophy} label="Deepest Session" value={wrapped.deepestSession ? `${wrapped.deepestSession.duration}m` : '—'} subtitle={wrapped.deepestSession?.mission || 'No session this week'} accent="purple" />
            <WrappedStatCard delay={0.36} icon={Calendar} label="Best Day" value={wrapped.bestDay ? `${wrapped.bestDay.minutes}m` : '—'} subtitle={wrapped.bestDay ? `${wrapped.bestDay.day} · ${wrapped.bestDay.sessions} session${wrapped.bestDay.sessions === 1 ? '' : 's'}` : 'No data'} accent="emerald" />
            <WrappedStatCard delay={0.42} icon={Clock} label="Peak Hour" value={wrapped.mostProductiveHour?.hour || '—'} subtitle={wrapped.mostProductiveHour ? `${wrapped.mostProductiveHour.sessions} session${wrapped.mostProductiveHour.sessions === 1 ? '' : 's'} · avg ${wrapped.mostProductiveHour.avgMinutes}m` : 'No sessions logged'} accent="amber" />
            <WrappedStatCard delay={0.48} icon={Flame} label="Longest Streak" value={`${wrapped.longestStreak}d`} subtitle={wrapped.weekOverWeek.streakChange === 0 ? 'Same as last week' : `${wrapped.weekOverWeek.streakChange > 0 ? '+' : ''}${wrapped.weekOverWeek.streakChange} vs last week`} accent="emerald" />
            <WrappedProgressCard delay={0.54} icon={Target} label="Mission Completion" value={wrapped.missionCompletionRate} suffix="%" subtitle={wrapped.missionsCompleted !== undefined && wrapped.missionsCreated !== undefined ? `${wrapped.missionsCompleted}/${wrapped.missionsCreated} missions completed` : undefined} accent="purple" wowValue={wrapped.weekOverWeek.missionRateChange} wowSuffix="pp" />
            <WrappedProgressCard delay={0.6} icon={BookOpen} label="Reflection Rate" value={wrapped.reflectionRate} suffix="%" subtitle={wrapped.reflectionsWritten !== undefined && wrapped.reflectionDaysPossible ? `${wrapped.reflectionsWritten}/${wrapped.reflectionDaysPossible} days` : undefined} accent="sky" />
          </div>

          {/* Week-over-Week comparison */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.66, duration: 0.5 }}>
            <div className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02]">
              <div className="p-4 sm:p-5 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
                  <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Week-over-Week Comparison</h3>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 px-4 sm:px-5 pb-5">
                <WoWCard label="Focus Time" change={wrapped.weekOverWeek.focusChange} thisValue={`${wrapped.totalFocusHours}h`} lastValue={wrapped.lastWeek ? `${wrapped.lastWeek.totalFocusHours}h` : '—'} />
                <WoWCard label="Sessions" change={wrapped.weekOverWeek.sessionChange} thisValue={wrapped.sessionCount.toString()} lastValue={wrapped.lastWeek ? wrapped.lastWeek.sessionCount.toString() : '—'} />
                <WoWCard label="Streak" change={wrapped.weekOverWeek.streakChange} thisValue={`${wrapped.longestStreak}d`} lastValue={wrapped.lastWeek ? `${wrapped.lastWeek.longestStreak}d` : '—'} />
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.5 }} className="mt-8 text-center">
            <p className="text-[11px] text-zinc-600">Generated from {wrapped.sessionCount} real focus session{wrapped.sessionCount === 1 ? '' : 's'} this week.</p>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
