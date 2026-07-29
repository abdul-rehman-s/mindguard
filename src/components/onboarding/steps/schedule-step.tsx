'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sun, Moon, Clock, Shuffle } from 'lucide-react';

const SCHEDULE_TYPES = [
  { id: 'morning_person', label: 'Morning Person', desc: 'I peak early and fade by evening', icon: Sun, color: 'text-amber-400' },
  { id: 'night_owl', label: 'Night Owl', desc: 'I come alive after the sun sets', icon: Moon, color: 'text-indigo-400' },
  { id: 'flexible_schedule', label: 'Flexible Schedule', desc: 'I can adapt to most time blocks', icon: Clock, color: 'text-emerald-400' },
  { id: 'changes_frequently', label: 'My schedule changes a lot', desc: 'Shifts, deadlines, or unpredictable days', icon: Shuffle, color: 'text-rose-400' },
];

const SLEEP_RANGES = [
  { id: 'before_midnight', label: 'Before midnight' },
  { id: '12_2am', label: '12–2 AM' },
  { id: '2_4am', label: '2–4 AM' },
  { id: 'after_4am', label: 'After 4 AM' },
  { id: 'varies', label: 'It varies' },
];

export const SCHEDULE_TYPES_LIST = SCHEDULE_TYPES;

interface ScheduleStepProps {
  scheduleType: string;
  onScheduleTypeChange: (type: string) => void;
  sleepRange: string;
  onSleepRangeChange: (range: string) => void;
  direction: number;
}

export function ScheduleStep({
  scheduleType,
  onScheduleTypeChange,
  sleepRange,
  onSleepRangeChange,
  direction,
}: ScheduleStepProps) {
  return (
    <motion.div
      initial={{ x: direction > 0 ? 60 : -60, opacity: 0, scale: 0.97, filter: 'blur(3px)' }}
      animate={{ x: 0, opacity: 1, scale: 1, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 260, damping: 25 } }}
      exit={{ x: direction > 0 ? -60 : 60, opacity: 0, scale: 0.97, filter: 'blur(3px)', transition: { type: 'spring', stiffness: 260, damping: 25 } }}
    >
      {/* Schedule type question */}
      <h2 className="mb-2 text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
        Which best describes your rhythm?
      </h2>
      <p className="mb-6 text-sm text-zinc-500">
        No rigid schedules needed — just a sense of when you&apos;re at your best.
      </p>
      <div className="grid grid-cols-2 gap-3 mb-8" role="radiogroup" aria-label="Schedule type">
        {SCHEDULE_TYPES.map((st) => {
          const Icon = st.icon;
          return (
            <motion.button
              key={st.id}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onScheduleTypeChange(st.id)}
              role="radio"
              aria-checked={scheduleType === st.id}
              aria-label={`${st.label} — ${st.desc}`}
              className={cn(
                'flex flex-col items-center gap-2.5 rounded-xl border p-4 transition-all duration-200',
                scheduleType === st.id
                  ? 'border-emerald-500/30 bg-emerald-500/[0.08] ring-1 ring-emerald-500/20'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
              )}
            >
              <Icon className={cn('h-5 w-5', scheduleType === st.id ? 'text-emerald-400' : st.color)} />
              <span className={cn('text-sm font-medium', scheduleType === st.id ? 'text-emerald-300' : 'text-zinc-400')}>
                {st.label}
              </span>
              <span className="text-xs text-zinc-500 leading-snug">{st.desc}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Sleep range question */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-zinc-300">
          When do you usually go to sleep?
        </h3>
        <p className="mb-4 text-xs text-zinc-500">
          This helps us suggest when to wind down and when to start your day.
        </p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3" role="radiogroup" aria-label="Sleep range">
          {SLEEP_RANGES.map((sr) => (
            <motion.button
              key={sr.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSleepRangeChange(sr.id)}
              role="radio"
              aria-checked={sleepRange === sr.id}
              aria-label={sr.label}
              className={cn(
                'rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200',
                sleepRange === sr.id
                  ? 'border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-300 ring-1 ring-emerald-500/20'
                  : 'border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:border-white/[0.12] hover:bg-white/[0.04]'
              )}
            >
              {sr.label}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
