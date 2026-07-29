'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkles, Shield, Clock, Brain, Trophy, Target, Flame, Sun, Sunset, Moon, Zap, Timer } from 'lucide-react';
import { IMPROVE_OPTIONS_LIST } from './improve-step';
import { ROLES_LIST } from './role-step';
import { SCHEDULE_TYPES_LIST } from './schedule-step';
import { DISTRACTIONS_LIST } from './distraction-step';
import { FOCUS_DURATION_OPTIONS_LIST } from './focus-style-step';
import { COACH_TYPES_LIST } from './motivation-step';
import { GOALS_LIST } from './goals-step';

const WORK_STYLE_LABELS: Record<string, string> = {
  short_sprints: 'Short Focused Sprints',
  deep_uninterrupted: 'Deep Uninterrupted Work',
  mix_both: 'A Mix of Both',
};

const SLEEP_RANGE_LABELS: Record<string, string> = {
  before_midnight: 'Before midnight',
  '12_2am': '12–2 AM',
  '2_4am': '2–4 AM',
  after_4am: 'After 4 AM',
  varies: 'It varies',
};

const SCHEDULE_TYPE_LABELS: Record<string, { label: string; icon: typeof Sun }> = {
  morning_person: { label: 'Morning Person', icon: Sun },
  night_owl: { label: 'Night Owl', icon: Moon },
  flexible_schedule: { label: 'Flexible Schedule', icon: Sunset },
  changes_frequently: { label: 'Variable Schedule', icon: Clock },
};

interface FinishStepProps {
  selectedImprovements: string[];
  otherImproveText: string;
  selectedRole: string;
  scheduleType: string;
  sleepRange: string;
  hasAdhd: boolean;
  focusDurationComfort: string;
  workStylePreference: string;
  coachPersonality: string;
  motivationStyle: string;
  selectedDistractions: string[];
  distractionRanking: string[];
  selectedGoals: string[];
  focusGoalMinutes: number;
  firstMission: string;
  direction: number;
}

export function FinishStep({
  selectedImprovements,
  otherImproveText,
  selectedRole,
  scheduleType,
  sleepRange,
  hasAdhd,
  focusDurationComfort,
  workStylePreference,
  coachPersonality,
  motivationStyle,
  selectedDistractions,
  distractionRanking,
  selectedGoals,
  focusGoalMinutes,
  firstMission,
  direction,
}: FinishStepProps) {
  const roleLabel = ROLES_LIST.find((r) => r.id === selectedRole)?.label ?? selectedRole;
  const scheduleInfo = SCHEDULE_TYPE_LABELS[scheduleType];
  const coachObj = COACH_TYPES_LIST.find((c) => c.id === coachPersonality);
  const primaryLabel = IMPROVE_OPTIONS_LIST.find((o) => o.id === selectedImprovements[0])?.label ?? '—';
  const goalsLabels = selectedGoals.map((g) => GOALS_LIST.find((go) => go.id === g)?.label ?? g);

  const focusDurationObj = FOCUS_DURATION_OPTIONS_LIST.find((f) => f.id === focusDurationComfort);
  const focusLabel = focusDurationObj?.label ?? focusDurationComfort;

  const coachPreviewQuote = coachPersonality === 'strict'
    ? '"No excuses today. Let\'s get it done."'
    : coachPersonality === 'friendly'
    ? '"You\'re doing great! Let\'s keep the momentum going."'
    : '"Your focus score increased 15% this week. Data speaks."';

  const ScheduleIcon = scheduleInfo?.icon ?? Clock;

  return (
    <motion.div
      initial={{ x: direction > 0 ? 60 : -60, opacity: 0, scale: 0.97, filter: 'blur(3px)' }}
      animate={{ x: 0, opacity: 1, scale: 1, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 260, damping: 25 } }}
      exit={{ x: direction > 0 ? -60 : 60, opacity: 0, scale: 0.97, filter: 'blur(3px)', transition: { type: 'spring', stiffness: 260, damping: 25 } }}
      className="flex flex-col items-center text-center"
    >
      {/* Celebration icon */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
        className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 ring-1 ring-emerald-500/20"
      >
        <Sparkles className="h-10 w-10 text-emerald-400" />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-2 text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl"
      >
        Your MindGuard is ready!
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-6 max-w-sm text-sm text-zinc-400"
      >
        Based on your profile, here&apos;s what we&apos;ll focus on.
      </motion.p>

      {/* Personalized summary */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-4 w-full space-y-2"
      >
        {/* Profile card */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
            Your Profile
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl">{ROLES_LIST.find((r) => r.id === selectedRole)?.icon ?? '✨'}</span>
            <div className="flex flex-col">
              <p className="text-sm font-medium text-zinc-200">{roleLabel}</p>
              <p className="text-xs text-zinc-500">
                {primaryLabel} · {focusGoalMinutes >= 60 ? `${Math.floor(focusGoalMinutes / 60)}h${focusGoalMinutes % 60 > 0 ? ` ${focusGoalMinutes % 60}m` : ''}` : `${focusGoalMinutes}m`} daily goal
              </p>
            </div>
          </div>
        </div>

        {/* Settings grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Schedule */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
              <ScheduleIcon className="h-3 w-3 text-emerald-400" />
              Schedule
            </div>
            <p className="text-sm font-medium text-zinc-200">
              {scheduleInfo?.label ?? 'Flexible'}
            </p>
            <p className="text-xs text-zinc-500">
              {sleepRange ? `Sleep: ${SLEEP_RANGE_LABELS[sleepRange] ?? sleepRange}` : 'Adaptive'}
            </p>
          </div>

          {/* Focus style */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
              <Timer className="h-3 w-3 text-emerald-400" />
              Focus Style
            </div>
            <p className="text-sm font-medium text-zinc-200">
              {focusLabel}
            </p>
            <p className="text-xs text-zinc-500">
              {WORK_STYLE_LABELS[workStylePreference] ?? 'Balanced'}
            </p>
          </div>

          {/* Coach */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
              <Trophy className="h-3 w-3 text-emerald-400" />
              Coach
            </div>
            <p className="text-sm font-medium text-zinc-200">
              {coachObj?.label ?? coachPersonality}
            </p>
            <p className="text-xs text-zinc-500">{motivationStyle} style</p>
          </div>

          {/* Goals */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
              <Target className="h-3 w-3 text-emerald-400" />
              Goals
            </div>
            <p className="text-sm font-medium text-zinc-200">
              {goalsLabels[0] ?? '—'}
            </p>
            <p className="text-xs text-zinc-500">{goalsLabels.length} goals set</p>
          </div>
        </div>

        {/* ADHD badge */}
        {hasAdhd && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] p-3 flex items-center gap-2"
          >
            <Brain className="h-4 w-4 text-emerald-400" />
            <span className="text-xs text-emerald-300">ADHD-adapted coaching active</span>
            <span className="text-xs text-zinc-500">— shorter sessions, gentler nudges</span>
          </motion.div>
        )}

        {/* Other improve text */}
        {otherImproveText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.65 }}
            className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] p-3"
          >
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
              <Sparkles className="h-3 w-3 text-emerald-400" />
              Personal goal
            </div>
            <p className="text-sm text-zinc-300 italic">{otherImproveText}</p>
          </motion.div>
        )}

        {/* Top distraction */}
        {distractionRanking.length > 0 && (() => {
          const d = DISTRACTIONS_LIST.find((dd) => dd.id === distractionRanking[0]);
          return (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                <Flame className="h-3 w-3 text-emerald-400" />
                Top Distraction
              </div>
              <p className="text-sm font-medium text-zinc-200">
                {d?.label ?? distractionRanking[0]}
              </p>
              <p className="text-xs text-zinc-500">We&apos;ll help you manage this</p>
            </div>
          );
        })()}

        {/* Coach personality preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] p-4 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 mb-2">
            <Sparkles className="h-3 w-3 text-emerald-400" />
            Coach Preview
          </div>
          <p className="text-sm italic text-emerald-300/70">{coachPreviewQuote}</p>
        </motion.div>
      </motion.div>

      {/* First mission */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-xs text-zinc-600"
      >
        Your first mission: <span className="text-zinc-400">{firstMission}</span>
      </motion.p>

      {/* Celebration dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-4 flex items-center justify-center gap-1"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 10,
              delay: 1 + i * 0.15,
            }}
            className="h-1.5 w-1.5 rounded-full bg-emerald-400"
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
