'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, Trophy, Smile, BarChart3, Gamepad2, Minimize2, Scale } from 'lucide-react';

const COACH_TYPES = [
  { id: 'strict', label: 'Accountability Coach', desc: 'Tough accountability, no excuses', icon: Trophy, preview: '"No excuses today. Let\'s get it done."' },
  { id: 'friendly', label: 'Supportive Coach', desc: 'Warm encouragement, gentle nudges', icon: Smile, preview: '"You\'re doing great! Keep going."' },
  { id: 'data_nerd', label: 'Data-Driven Coach', desc: 'Charts, metrics, and insights', icon: BarChart3, preview: '"Your focus score is up 12% this week."' },
];

const MOTIVATION_TYPES = [
  { id: 'gamification', label: 'Gamification', desc: 'Achievements, streaks, XP — make it fun', icon: Gamepad2 },
  { id: 'minimalist', label: 'Minimalist', desc: 'Clean, simple — no distractions', icon: Minimize2 },
  { id: 'balanced', label: 'Balanced', desc: 'A mix of both — not too flashy', icon: Scale },
];

export const COACH_TYPES_LIST = COACH_TYPES;

interface MotivationStepProps {
  coachPersonality: string;
  onCoachChange: (coach: string) => void;
  motivationStyle: string;
  onMotivationChange: (style: string) => void;
  direction: number;
}

export function MotivationStep({
  coachPersonality,
  onCoachChange,
  motivationStyle,
  onMotivationChange,
  direction,
}: MotivationStepProps) {
  return (
    <motion.div
      initial={{ x: direction > 0 ? 60 : -60, opacity: 0, scale: 0.97, filter: 'blur(3px)' }}
      animate={{ x: 0, opacity: 1, scale: 1, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 260, damping: 25 } }}
      exit={{ x: direction > 0 ? -60 : 60, opacity: 0, scale: 0.97, filter: 'blur(3px)', transition: { type: 'spring', stiffness: 260, damping: 25 } }}
    >
      {/* Coach personality */}
      <h2 className="mb-2 text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
        How should your coach talk to you?
      </h2>
      <p className="mb-6 text-sm text-zinc-500">
        Pick the style that resonates most — you can always change it later.
      </p>
      <div className="space-y-3 mb-8" role="radiogroup" aria-label="Coach personality">
        {COACH_TYPES.map((coach) => {
          const Icon = coach.icon;
          return (
            <motion.button
              key={coach.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onCoachChange(coach.id)}
              role="radio"
              aria-checked={coachPersonality === coach.id}
              aria-label={`${coach.label} — ${coach.desc}`}
              className={cn(
                'flex items-center gap-4 rounded-xl border px-4 py-4 text-left w-full transition-all duration-200',
                coachPersonality === coach.id
                  ? 'border-emerald-500/30 bg-emerald-500/[0.08] ring-1 ring-emerald-500/20'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
              )}
            >
              {coachPersonality === coach.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20"
                >
                  <Check className="h-3 w-3 text-emerald-400" />
                </motion.div>
              )}
              <div className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                coachPersonality === coach.id ? 'bg-emerald-500/10' : 'bg-white/[0.04]'
              )}>
                <Icon className={cn('h-5 w-5', coachPersonality === coach.id ? 'text-emerald-400' : 'text-zinc-500')} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn('text-sm font-medium', coachPersonality === coach.id ? 'text-emerald-300' : 'text-zinc-400')}>
                    {coach.label}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500">{coach.desc}</p>
              </div>
              {/* Preview quote */}
              {coachPersonality === coach.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="hidden sm:block shrink-0 rounded-lg border border-emerald-500/10 bg-emerald-500/[0.03] px-3 py-1.5"
                >
                  <p className="text-xs text-emerald-300/60 italic whitespace-nowrap">
                    {coach.preview}
                  </p>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Motivation style */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-zinc-300">
          How should the app feel?
        </h3>
        <p className="mb-4 text-xs text-zinc-500">
          This affects your dashboard layout and gamification level.
        </p>
        <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Motivation style">
          {MOTIVATION_TYPES.map((mt) => {
            const Icon = mt.icon;
            return (
              <motion.button
                key={mt.id}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onMotivationChange(mt.id)}
                role="radio"
                aria-checked={motivationStyle === mt.id}
                aria-label={`${mt.label} — ${mt.desc}`}
                className={cn(
                  'flex flex-col items-center gap-3 rounded-xl border p-5 transition-all duration-200',
                  motivationStyle === mt.id
                    ? 'border-emerald-500/30 bg-emerald-500/[0.08] ring-1 ring-emerald-500/20'
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
                )}
              >
                {motivationStyle === mt.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20"
                  >
                    <Check className="h-3 w-3 text-emerald-400" />
                  </motion.div>
                )}
                <Icon className={cn('h-6 w-6', motivationStyle === mt.id ? 'text-emerald-400' : 'text-zinc-500')} />
                <span className={cn('text-sm font-medium', motivationStyle === mt.id ? 'text-emerald-300' : 'text-zinc-400')}>{mt.label}</span>
                <span className="text-xs text-zinc-500">{mt.desc}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
