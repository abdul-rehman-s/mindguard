'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Flame,
  Trophy,
  Clock,
  Moon,
  Sunrise,
  Brain,
  Target,
  Lock,
  CheckCircle2,
  Zap,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fadeInUp } from '@/lib/animations';
import { AnimatedNumber } from '@/components/premium/animated-number';
import type { AchievementProgress } from '@/types';

const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  Flame,
  Trophy,
  Clock,
  Moon,
  Sunrise,
  Brain,
  Target,
};

const EMOJI_FALLBACK: Record<string, string> = {
  first_focus: '✨',
  streak_7: '🔥',
  streak_30: '🏆',
  hours_100: '⏰',
  night_owl: '🦉',
  early_bird: '🐦',
  deep_worker: '🧠',
  mission_master: '👑',
};

// ---- Achievement Card (React.memo) ----
const AchievementCard = React.memo(function AchievementCard({
  ach,
  index,
}: {
  ach: AchievementProgress;
  index: number;
}) {
  const IconComp = ICON_MAP[ach.icon];
  const emoji = EMOJI_FALLBACK[ach.type] || '⭐';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className={cn(
        'group relative overflow-hidden rounded-lg border p-3 transition-all duration-200',
        ach.unlocked
          ? 'border-emerald-500/20 bg-emerald-500/[0.04] shadow-[0_0_20px_-4px_rgba(16,185,129,0.15)]'
          : 'border-white/[0.04] bg-white/[0.01] opacity-70 hover:opacity-90'
      )}
      aria-label={`${ach.title}: ${ach.unlocked ? 'Unlocked' : `${ach.progressPct}% progress`}`}
    >
      {ach.unlocked && (
        <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-500/[0.08] blur-2xl" aria-hidden="true" />
      )}
      <div className="relative flex items-start gap-3">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base',
            ach.unlocked ? 'bg-emerald-500/10' : 'bg-white/[0.03]'
          )}
          aria-hidden="true"
        >
          {ach.unlocked ? (
            IconComp ? (
              <IconComp className="h-4 w-4 text-emerald-400" />
            ) : (
              <span>{emoji}</span>
            )
          ) : (
            <Lock className="h-3.5 w-3.5 text-zinc-600" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'text-[12px] font-medium leading-tight',
                  ach.unlocked ? 'text-zinc-100' : 'text-zinc-400'
                )}
              >
                {ach.title}
              </p>
              <p className="mt-0.5 text-[10px] leading-snug text-zinc-600 line-clamp-1">
                {ach.description}
              </p>
            </div>
            <div
              className={cn(
                'flex shrink-0 items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium tabular-nums',
                ach.unlocked
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-white/[0.04] text-zinc-500'
              )}
            >
              <Zap className="h-2.5 w-2.5" aria-hidden="true" />
              +{ach.xpReward}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[9px] tabular-nums text-zinc-600">
                {ach.unlocked
                  ? 'Unlocked!'
                  : `${ach.progressMax - ach.progress} ${
                      ach.type === 'deep_worker'
                        ? 'min'
                        : ach.type === 'hours_100'
                          ? 'hrs'
                          : ach.type === 'streak_7' || ach.type === 'streak_30'
                            ? 'days'
                            : ach.type === 'mission_master'
                              ? 'missions'
                              : 'left'
                    }`}
              </span>
              <span className="text-[9px] tabular-nums text-zinc-600">{ach.progressPct}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${ach.progressPct}%` }}
                transition={{ duration: 0.8, delay: 0.1 + index * 0.05 }}
                className={cn(
                  'h-full rounded-full',
                  ach.unlocked
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                    : 'bg-gradient-to-r from-zinc-600 to-zinc-500'
                )}
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Estimated remaining */}
          {!ach.unlocked && ach.estimatedRemaining && (
            <p className="mt-1.5 text-[10px] text-zinc-600">
              <span className="text-zinc-500">Est.</span> {ach.estimatedRemaining}
            </p>
          )}
          {ach.unlocked && ach.unlockedAt && (
            <p className="mt-1.5 text-[10px] text-emerald-400/70">
              Unlocked {new Date(ach.unlockedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export function AchievementsV2() {
  const [achievements, setAchievements] = useState<AchievementProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchAchievements = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/achievements/progress');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setAchievements(data.achievements || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  if (loading) {
    return (
      <div className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02]" aria-label="Loading achievements">
        <div className="p-5 pb-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Achievements</h3>
        </div>
        <div className="flex flex-col gap-2 px-5 pb-5">
          <div className="h-8 w-3/4 animate-pulse rounded bg-white/[0.04]" />
          <div className="h-16 animate-pulse rounded-lg bg-white/[0.04]" />
          <div className="h-16 animate-pulse rounded-lg bg-white/[0.04]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02]" role="alert" aria-live="polite">
        <div className="p-5 pb-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Achievements</h3>
        </div>
        <div className="flex flex-col items-center px-5 pb-6 pt-2 text-center">
          <AlertCircle className="mb-3 h-7 w-7 text-zinc-700" aria-hidden="true" />
          <p className="mb-3 text-sm text-zinc-500">Couldn&apos;t load progress.</p>
          <button onClick={fetchAchievements} className="text-xs text-emerald-400 hover:text-emerald-300" aria-label="Try loading achievements again">
            Try again
          </button>
        </div>
      </div>
    );
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalXp = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.xpReward, 0);
  const level = Math.floor(totalXp / 500) + 1;

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02]"
    >
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Achievements</h3>
          </div>
          <span className="flex items-center gap-1 text-[11px] text-zinc-400" aria-live="polite">
            <Zap className="h-3 w-3 text-emerald-400/70" aria-hidden="true" />
            <AnimatedNumber value={level} className="font-medium text-zinc-200" />
            <span className="text-zinc-600">·</span>
            <span className="tabular-nums text-zinc-500">{totalXp.toLocaleString()} XP</span>
          </span>
        </div>
      </div>

      <div className="px-5 pb-5">
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-emerald-500/[0.08] bg-emerald-500/[0.03] p-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10" aria-hidden="true">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
          </div>
          <span className="text-[11px] text-zinc-400" aria-live="polite">
            <span className="font-medium text-emerald-400">{unlockedCount}</span>
            <span className="text-zinc-600"> / {achievements.length} unlocked</span>
          </span>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto" aria-label="Achievements list">
          {achievements.map((ach, i) => (
            <AchievementCard key={ach.type} ach={ach} index={i} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
