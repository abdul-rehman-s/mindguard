'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  TrendingDown,
  Minus,
  Activity,
  Sun,
  SunDim,
  Moon,
  Monitor,
  Wifi,
  WifiOff,
  AppWindow,
  Lightbulb,
  CalendarClock,
  ShieldAlert,
  BarChart3,
  Brain,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/stores/app-store';
import { cn, formatDuration, formatDurationCompact, timeAgo, getGreeting } from '@/lib/utils';
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/animations';
import { AnimatedNumber } from '@/components/premium/animated-number';
import type { DashboardStats } from '@/types';

import { playClick } from '@/lib/sounds';

import { Heatmap } from './heatmap';
import { AchievementsV2 } from './achievements-v2';
import { Timeline } from './timeline';
import { AiCoach } from './ai-coach';
import { AiInsights } from './ai-insights';
import { HabitTracker } from '@/components/habits/habit-tracker';

// ─── Personalized Greeting Logic ───

function getGreetingConfig(hour: number) {
  if (hour < 12) return { greeting: 'morning', Icon: Sun, gradient: 'from-amber-500/20 to-orange-500/10', iconColor: 'text-amber-400' };
  if (hour < 18) return { greeting: 'afternoon', Icon: SunDim, gradient: 'from-amber-500/15 to-yellow-500/10', iconColor: 'text-amber-300/80' };
  return { greeting: 'evening', Icon: Moon, gradient: 'from-indigo-500/15 to-violet-500/10', iconColor: 'text-indigo-300/80' };
}

function getPersonalizedMessage(
  stats: DashboardStats | null,
  activeMission: { title: string } | null,
  primaryUse: string | null,
  hour: number
): string {
  if (!stats) return 'Ready to start your focused day?';

  const streak = stats.currentStreak;
  const todayMin = stats.todayFocusMinutes;
  const goalMin = stats.focusGoalMinutes;
  const goalProgress = goalMin > 0 ? Math.round((todayMin / goalMin) * 100) : 0;

  // Streak-based motivation
  if (streak >= 7) return `🔥 ${streak}-day streak! You're unstoppable — keep the momentum going.`;
  if (streak >= 3) return `Nice! ${streak}-day streak in progress. Today is day ${streak + 1}.`;

  // Goal progress-based
  if (goalProgress >= 100) return 'Goal achieved today! 🎉 Consider extra deep work or wrap up early.';
  if (goalProgress >= 50) return `You're halfway to your ${formatDurationCompact(goalMin * 60)} goal — keep pushing.`;
  if (goalProgress > 0) return `${formatDurationCompact(todayMin * 60)} done so far. ${formatDurationCompact((goalMin - todayMin) * 60)} left to hit your goal.`;

  // Primary use-based
  if (primaryUse === 'Coding') return 'Time to write some great code. Start a focused session and ship.';
  if (primaryUse === 'Studying') return 'Deep learning starts with deep focus. Let\'s get studying.';
  if (primaryUse === 'Writing') return 'Your best writing happens in flow. Start a session and create.';
  if (primaryUse === 'Business') return 'Strategic work needs focused time. Let\'s tackle the important stuff.';
  if (primaryUse === 'Reading') return 'Focused reading beats skimming. Set a session and absorb more.';

  // Mission-based
  if (activeMission) return `Focus on "${activeMission.title}" — one session at a time.`;

  // Time-based fallback
  if (hour < 12) return 'The morning is your best chance for deep work. Make it count.';
  if (hour < 18) return 'Afternoon focus is a superpower. Start a session now.';
  return 'Evening sessions can be surprisingly productive. Give it a try.';
}

function getDailyCoachTip(stats: DashboardStats | null, primaryUse: string | null, biggestDistraction: string | null, hour: number): { tip: string; icon: typeof Lightbulb; accent: string } {
  if (!stats) return { tip: 'Start your first session to unlock personalized tips.', icon: Lightbulb, accent: 'text-amber-400' };

  const streak = stats.currentStreak;
  const todayMin = stats.todayFocusMinutes;
  const goalMin = stats.focusGoalMinutes;
  const score = stats.focusScore;
  const distractions = stats.todayDistractionMinutes;

  // Distraction-aware tip
  if (distractions > 30 && biggestDistraction) {
    return {
      tip: `${formatDurationCompact(distractions * 60)} on distractions today, especially ${biggestDistraction}. Try blocking it during focus.`,
      icon: ShieldAlert,
      accent: 'text-red-400',
    };
  }

  // Low focus score tip
  if (score < 40) {
    return {
      tip: 'Your focus score needs a boost. Even a 25-minute session can lift it significantly.',
      icon: TrendingUp,
      accent: 'text-amber-400',
    };
  }

  // Streak encouragement
  if (streak === 0) {
    return {
      tip: 'No streak yet. Complete one session today to start building consistency.',
      icon: Flame,
      accent: 'text-emerald-400',
    };
  }

  // Goal-based tip
  if (goalMin > 0 && todayMin < goalMin * 0.3 && hour >= 14) {
    return {
      tip: `Only ${formatDurationCompact(todayMin * 60)} toward your ${formatDurationCompact(goalMin * 60)} goal. Try a focus block now.`,
      icon: Target,
      accent: 'text-emerald-400',
    };
  }

  // Primary use tips
  if (primaryUse === 'Coding') {
    return { tip: 'Try a 90-minute deep work block for complex coding tasks. Context switching kills productivity.', icon: Brain, accent: 'text-emerald-400' };
  }
  if (primaryUse === 'Studying') {
    return { tip: 'Active recall beats passive reading. Use focus sessions to study, then test yourself.', icon: Brain, accent: 'text-emerald-400' };
  }

  // Generic productive tip
  return { tip: 'Your best work happens in uninterrupted blocks. Protect your focus time.', icon: Lightbulb, accent: 'text-emerald-400' };
}

function getFocusBlockSuggestions(workSchedule: string | null, bestFocusHours: number[]): { label: string; time: string; hour: number }[] {
  const blocks: { label: string; time: string; hour: number }[] = [];

  // Use best focus hours from data if available
  if (bestFocusHours.length > 0) {
    for (const h of bestFocusHours) {
      const timeStr = h < 12 ? `${h}:00 AM` : h === 12 ? '12:00 PM' : `${h - 12}:00 PM`;
      blocks.push({
        label: h < 12 ? 'Morning Deep Work' : h < 17 ? 'Afternoon Focus' : 'Evening Session',
        time: timeStr,
        hour: h,
      });
    }
    return blocks.slice(0, 3);
  }

  // Fallback based on work schedule preference
  if (workSchedule === 'morning') {
    return [
      { label: 'Morning Deep Work', time: '9:00 AM', hour: 9 },
      { label: 'Late Morning Block', time: '11:00 AM', hour: 11 },
    ];
  }
  if (workSchedule === 'evening') {
    return [
      { label: 'Afternoon Focus', time: '2:00 PM', hour: 14 },
      { label: 'Late Afternoon Block', time: '4:00 PM', hour: 16 },
    ];
  }
  if (workSchedule === 'night') {
    return [
      { label: 'Evening Session', time: '8:00 PM', hour: 20 },
      { label: 'Night Focus', time: '10:00 PM', hour: 22 },
    ];
  }

  // Default balanced schedule
  return [
    { label: 'Morning Deep Work', time: '9:00 AM', hour: 9 },
    { label: 'Afternoon Focus', time: '2:00 PM', hour: 14 },
  ];
}

// ─── Section Header ───

function SectionHeader({ title, icon: Icon }: { title: string; icon: typeof BarChart3 }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="h-3.5 w-3.5 text-emerald-400/60" aria-hidden="true" />
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{title}</h3>
      <div className="flex-1 h-px bg-white/[0.04]" aria-hidden="true" />
    </div>
  );
}

// ─── Stat Card Component ───

interface StatCardProps {
  icon: typeof Timer;
  label: string;
  value: string | number;
  sub?: string;
  progressVal?: number;
  trend?: 'up' | 'down' | 'flat' | null;
  trendLabel?: string;
}

const StatCard = React.memo(function StatCard({ icon: Icon, label, value, sub, progressVal, trend, trendLabel }: StatCardProps) {
  const isNumber = typeof value === 'number';
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400/70' : 'text-zinc-500';

  return (
    <motion.div whileHover={{ y: -2, transition: { duration: 0.2 } }}>
      <Card className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/[0.08]">
              <Icon className="h-4 w-4 text-emerald-400/80" aria-hidden="true" />
            </div>
            {trend && (
              <div className={cn('flex items-center gap-1', trendColor)} aria-label={trendLabel || `Trend: ${trend}`}>
                <TrendIcon className="h-3 w-3" aria-hidden="true" />
                {trendLabel && <span className="text-[10px] font-medium">{trendLabel}</span>}
              </div>
            )}
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

// ─── Desktop Tracker Status Badge ───

const TrackerStatusBadge = React.memo(function TrackerStatusBadge({ connected, currentApp }: { connected: boolean; currentApp: string | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.4 }}
    >
      <Card className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg',
              connected ? 'bg-emerald-500/[0.08]' : 'bg-zinc-500/[0.06]'
            )} aria-hidden="true">
              {connected ? (
                <Wifi className="h-4 w-4 text-emerald-400" />
              ) : (
                <WifiOff className="h-4 w-4 text-zinc-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-[11px] font-medium uppercase tracking-wider',
                  connected ? 'text-emerald-400' : 'text-zinc-500'
                )}>
                  Desktop Tracker
                </span>
                <Badge variant="outline" className={cn(
                  'text-[9px] h-4 px-1.5',
                  connected
                    ? 'border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-400'
                    : 'border-zinc-500/20 bg-zinc-500/[0.06] text-zinc-500'
                )}>
                  {connected ? 'Connected' : 'Offline'}
                </Badge>
              </div>
              {connected && currentApp ? (
                <p className="mt-0.5 text-xs text-zinc-400 truncate">
                  Currently: <span className="font-medium text-zinc-300">{currentApp}</span>
                </p>
              ) : !connected ? (
                <p className="mt-0.5 text-xs text-zinc-600">Install the desktop companion for real-time tracking</p>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

// ─── Active Mission Card ───

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
                  'border-zinc-500/20 bg-zinc-500/[0.06] text-zinc-400'
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

// ─── Today's Goal Widget ───

function TodaysGoalWidget({ todayMinutes, goalMinutes }: { todayMinutes: number; goalMinutes: number }) {
  const pct = goalMinutes > 0 ? Math.min(100, Math.round((todayMinutes / goalMinutes) * 100)) : 0;
  const remaining = Math.max(0, goalMinutes - todayMinutes);

  return (
    <Card className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02]">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/[0.08]" aria-hidden="true">
              <Target className="h-4 w-4 text-emerald-400/80" />
            </div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Today's Goal</span>
          </div>
          {pct >= 100 && (
            <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/[0.08] text-[9px] text-emerald-400">
              <CheckCircle2 className="h-2.5 w-2.5 mr-1" />Achieved
            </Badge>
          )}
        </div>
        <div className="flex items-baseline gap-1 mb-2">
          <AnimatedNumber value={todayMinutes} className="text-xl font-semibold tabular-nums tracking-tight text-zinc-50" />
          <span className="text-sm text-zinc-500">/ {formatDurationCompact(goalMinutes * 60)}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04] mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className={cn(
              'h-full rounded-full',
              pct >= 100
                ? 'bg-gradient-to-r from-emerald-400 to-teal-300'
                : pct >= 50
                  ? 'bg-gradient-to-r from-emerald-500/80 to-teal-400/60'
                  : 'bg-gradient-to-r from-emerald-500/50 to-teal-400/30'
            )}
            aria-hidden="true"
          />
        </div>
        <p className="text-[11px] text-zinc-600">
          {pct >= 100
            ? 'Goal achieved! Consider extra deep work or wrap up early.'
            : `${formatDurationCompact(remaining * 60)} remaining to hit your daily goal`
          }
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Daily Coach Widget ───

function DailyCoachWidget({ tip, icon: TipIcon, accent }: { tip: string; icon: typeof Lightbulb; accent: string }) {
  return (
    <Card className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02]">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04]')} aria-hidden="true">
            <TipIcon className={cn('h-4 w-4', accent)} />
          </div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Daily Coach</span>
        </div>
        <p className="text-sm leading-relaxed text-zinc-300">{tip}</p>
      </CardContent>
    </Card>
  );
}

// ─── Focus Blocks Widget ───

function FocusBlocksWidget({ blocks }: { blocks: { label: string; time: string; hour: number }[] }) {
  const nowHour = new Date().getHours();

  return (
    <Card className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02]">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/[0.08]" aria-hidden="true">
            <CalendarClock className="h-4 w-4 text-emerald-400/80" />
          </div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Suggested Focus Blocks</span>
        </div>
        <div className="space-y-2">
          {blocks.map((block, i) => (
            <div key={i} className={cn(
              'flex items-center justify-between rounded-lg px-3 py-2 transition-colors',
              block.hour <= nowHour + 1 && block.hour >= nowHour - 1
                ? 'bg-emerald-500/[0.08] border border-emerald-500/20'
                : 'bg-white/[0.02] border border-white/[0.04]'
            )}>
              <div className="flex items-center gap-2">
                {block.hour <= nowHour + 1 && block.hour >= nowHour - 1 ? (
                  <span className="text-[10px] font-medium text-emerald-400">NOW</span>
                ) : (
                  <span className="text-[10px] text-zinc-500">{block.time}</span>
                )}
                <span className="text-xs text-zinc-300">{block.label}</span>
              </div>
              <ArrowRight className="h-3 w-3 text-zinc-600" aria-hidden="true" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Distraction Summary Widget ───

function DistractionSummaryWidget({
  distractionMinutes,
  topApps,
  biggestDistraction,
  connected,
}: {
  distractionMinutes: number;
  topApps: { name: string; minutes: number }[];
  biggestDistraction: string | null;
  connected: boolean;
}) {
  if (!connected && distractionMinutes === 0) {
    return (
      <Card className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-500/[0.06]" aria-hidden="true">
              <ShieldAlert className="h-4 w-4 text-zinc-500" />
            </div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Distractions</span>
          </div>
          <p className="text-xs text-zinc-600">Connect the desktop tracker to see distraction insights</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02]">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg',
              distractionMinutes > 30 ? 'bg-red-500/[0.08]' : 'bg-zinc-500/[0.06]'
            )} aria-hidden="true">
              <ShieldAlert className={cn('h-4 w-4', distractionMinutes > 30 ? 'text-red-400/80' : 'text-zinc-400')} />
            </div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Distractions Today</span>
          </div>
          {distractionMinutes > 0 && (
            <span className={cn(
              'text-sm font-semibold tabular-nums',
              distractionMinutes > 30 ? 'text-red-400/80' : 'text-zinc-400'
            )}>
              {formatDurationCompact(distractionMinutes * 60)}
            </span>
          )}
        </div>
        {topApps.length > 0 ? (
          <div className="space-y-1.5 max-h-24 overflow-y-auto scrollbar-thin">
            {topApps.map((app, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 truncate">{app.name}</span>
                <span className="text-zinc-500 tabular-nums">{formatDurationCompact(app.minutes * 60)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-600">
            {distractionMinutes === 0
              ? 'No distractions detected — great focus!'
              : 'Minimal distractions so far today.'
            }
          </p>
        )}
        {biggestDistraction && distractionMinutes > 0 && (
          <p className="mt-2 text-[11px] text-zinc-600">
            Your known distraction: <span className="text-zinc-400 font-medium">{biggestDistraction}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Skeleton Loading ───

function DashboardSkeleton() {
  return (
    <div className="min-h-full -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      {/* Greeting skeleton */}
      <div className="mb-8 pt-2">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 animate-pulse rounded-xl bg-white/[0.04]" />
          <div>
            <div className="h-7 w-48 animate-pulse rounded bg-white/[0.04]" />
            <div className="mt-1.5 h-4 w-72 animate-pulse rounded bg-white/[0.04]" />
          </div>
        </div>
      </div>
      {/* Goal skeleton */}
      <div className="mb-8">
        <div className="h-20 animate-pulse rounded-xl bg-white/[0.04]" />
      </div>
      {/* Stats skeleton */}
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-white/[0.04]" />
        ))}
      </div>
    </div>
  );
}

// ─── Custom scrollbar style (applied once globally) ───

const SCROLLBAR_STYLES = `
.scrollbar-thin::-webkit-scrollbar { width: 4px; height: 4px; }
.scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
.scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
.scrollbar-thin::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.12); }
`;

// ─── Main Dashboard Component ───

export function DashboardView() {
  const setView = useAppStore(s => s.setView);
  const setStats = useAppStore(s => s.setStats);
  const setActiveMission = useAppStore(s => s.setActiveMission);
  const setRecentSessions = useAppStore(s => s.setRecentSessions);
  const stats = useAppStore(s => s.stats);
  const activeMission = useAppStore(s => s.activeMission);
  const recentSessions = useAppStore(s => s.recentSessions);

  // Desktop tracker status
  const [trackerConnected, setTrackerConnected] = useState(false);
  const [currentApp, setCurrentApp] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/stats');
      if (res.status === 401) {
        // Session is invalid — redirect to landing/login
        // The user will be shown the landing page via the auth state change
        setView('landing');
        return;
      }
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
        yesterdayFocusMinutes: data.yesterdayFocusMinutes || 0,
        lastWeekFocusMinutes: data.lastWeekFocusMinutes || 0,
        primaryUse: data.primaryUse || null,
        workSchedule: data.workSchedule || null,
        goals: data.goals || [],
        focusGoalMinutes: data.focusGoalMinutes || 120,
        biggestDistraction: data.biggestDistraction || null,
        todayDistractionMinutes: data.todayDistractionMinutes || 0,
        todayDistractionTopApps: data.todayDistractionTopApps || [],
        bestFocusHours: data.bestFocusHours || [],
        smartFocusScore: data.smartFocusScore || data.focusScore || 0,
        smartScoreColor: data.smartScoreColor || { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Good' },
        smartScoreTrend: data.smartScoreTrend || 0,
      });
      setActiveMission(data.activeMission);
      setRecentSessions(data.recentSessions);
      // Desktop tracker status
      setTrackerConnected(data.desktopActivityCount > 0);
      setCurrentApp(data.currentApp || null);
    } catch {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [setStats, setActiveMission, setRecentSessions]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  // Poll desktop status every 30 seconds
  useEffect(() => {
    const fetchDesktopStatus = async () => {
      try {
        const res = await fetch('/api/desktop/status');
        if (res.status === 401) return; // Don't retry on auth failure
        if (res.ok) {
          const data = await res.json();
          setTrackerConnected(data.connected);
          setCurrentApp(data.currentApp);
        }
      } catch { /* silent fail — polling */ }
    };
    fetchDesktopStatus();
    const interval = setInterval(fetchDesktopStatus, 30000);
    return () => clearInterval(interval);
  }, []);

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

  // Derived data
  const goalProgress = s ? (s.focusGoalMinutes > 0 ? Math.min(100, Math.round((s.todayFocusMinutes / s.focusGoalMinutes) * 100)) : 0) : 0;
  const personalizedMessage = getPersonalizedMessage(s, activeMission, s?.primaryUse, hour);
  const coachTip = getDailyCoachTip(s, s?.primaryUse, s?.biggestDistraction, hour);
  const focusBlocks = getFocusBlockSuggestions(s?.workSchedule, s?.bestFocusHours || []);

  // Trend calculations
  const todayVsYesterday = s ? s.todayFocusMinutes - s.yesterdayFocusMinutes : 0;
  const weekVsLastWeek = s ? s.weeklyFocusMinutes - s.lastWeekFocusMinutes : 0;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="min-h-full -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
    >
      {/* Inject scrollbar styles */}
      <style dangerouslySetInnerHTML={{ __html: SCROLLBAR_STYLES }} />

      {/* ───── Section 1: Overview ───── */}
      <motion.div variants={staggerItem} className="mb-6 pt-2">
        {/* Greeting + Tracker Status */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3.5">
            <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br', gradient)} aria-hidden="true">
              <GreetingIcon className={cn('h-5 w-5', iconColor)} />
            </div>
            <div>
              <h2 className="text-[1.65rem] font-semibold tracking-[-0.02em] text-zinc-100">
                Good {greeting}
              </h2>
              <p className="mt-0.5 text-sm leading-relaxed text-zinc-500">
                {personalizedMessage}
              </p>
            </div>
          </div>
          {/* Desktop Tracker Status */}
          <TrackerStatusBadge connected={trackerConnected} currentApp={currentApp} />
        </div>

        {/* Quick Start CTA */}
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

      {/* ───── Section 2: Today's Progress ───── */}
      <motion.div variants={staggerItem} className="mb-8">
        <SectionHeader title="Today's Progress" icon={BarChart3} />

        {/* Goal + Coach + Focus Blocks row */}
        <div className="grid gap-4 mb-4 lg:grid-cols-3">
          <TodaysGoalWidget todayMinutes={s?.todayFocusMinutes || 0} goalMinutes={s?.focusGoalMinutes || 120} />
          <DailyCoachWidget tip={coachTip.tip} icon={coachTip.icon} accent={coachTip.accent} />
          <FocusBlocksWidget blocks={focusBlocks} />
        </div>

        {/* Stats Grid — 6 cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3" aria-label="Focus statistics">
          <StatCard
            icon={Clock}
            label="Today's Focus"
            value={s?.todayFocusMinutes || 0}
            sub={`${s?.todaySessions || 0} sessions`}
            trend={todayVsYesterday !== 0 ? (todayVsYesterday > 0 ? 'up' : 'down') : null}
            trendLabel={todayVsYesterday !== 0 ? `${todayVsYesterday > 0 ? '+' : ''}${todayVsYesterday}m vs yesterday` : undefined}
          />
          <StatCard
            icon={Timer}
            label="Weekly Focus"
            value={s?.weeklyFocusMinutes || 0}
            sub="this week"
            trend={weekVsLastWeek !== 0 ? (weekVsLastWeek > 0 ? 'up' : 'down') : null}
            trendLabel={weekVsLastWeek !== 0 ? `${weekVsLastWeek > 0 ? '+' : ''}${weekVsLastWeek}m vs last week` : undefined}
          />
          <StatCard icon={TrendingUp} label="Total Focus" value={s?.totalFocusMinutes || 0} sub="all time" />
          <StatCard icon={Activity} label="Avg Session" value={s?.avgSessionMinutes || 0} sub="per session" />
          <StatCard icon={Flame} label="Current Streak" value={s?.currentStreak || 0} sub="consecutive days" />
          <StatCard
            icon={Zap}
            label="Focus Score"
            value={s?.smartFocusScore || s?.focusScore || 0}
            sub={`/ 100 · ${s?.smartScoreColor?.label || 'Good'}`}
            progressVal={s?.smartFocusScore || s?.focusScore || 0}
            trend={s?.smartScoreTrend !== 0 ? (s?.smartScoreTrend > 0 ? 'up' : 'down') : null}
            trendLabel={s?.smartScoreTrend !== 0 ? `${s?.smartScoreTrend > 0 ? '+' : ''}${s?.smartScoreTrend} vs yesterday` : undefined}
          />
        </div>
      </motion.div>

      {/* ───── Section 3: Activity ───── */}
      <motion.div variants={staggerItem} className="mb-8">
        <SectionHeader title="Activity" icon={Activity} />

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Active Mission */}
          <motion.div variants={fadeInUp}>
            <ActiveMissionCard activeMission={activeMission} onNavigate={setView} />
          </motion.div>

          {/* Recent Sessions */}
          <motion.div variants={fadeInUp}>
            <Card className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02]">
              <CardContent className="p-0">
                {recentSessions && recentSessions.length > 0 ? (
                  <div className="divide-y divide-white/[0.04] max-h-96 overflow-y-auto scrollbar-thin" aria-label="Recent sessions list">
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

          {/* Distraction Summary */}
          <motion.div variants={fadeInUp}>
            <DistractionSummaryWidget
              distractionMinutes={s?.todayDistractionMinutes || 0}
              topApps={s?.todayDistractionTopApps || []}
              biggestDistraction={s?.biggestDistraction}
              connected={trackerConnected}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* ───── Section 4: Insights ───── */}
      <motion.div variants={staggerItem} className="mb-8">
        <SectionHeader title="Insights" icon={Sparkles} />

        <div className="grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
          {/* Left column: AI Coach (full height — spans both rows) */}
          <div className="lg:row-span-2 flex">
            <div className="flex w-full">
              <AiCoach />
            </div>
          </div>

          {/* Middle column: Timeline (top) */}
          <Timeline />

          {/* Right column: Habit Tracker (top) */}
          <HabitTracker />

          {/* Middle column: AI Insights (bottom) */}
          <AiInsights />

          {/* Right column: Heatmap + Achievements (bottom) */}
          <div className="flex flex-col gap-4">
            <Heatmap />
            <AchievementsV2 />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
