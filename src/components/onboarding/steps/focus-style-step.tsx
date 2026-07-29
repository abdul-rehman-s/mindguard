'use client';

import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Brain, Timer, Zap, Flame } from 'lucide-react';

const FOCUS_DURATION_OPTIONS = [
  { id: '15min', label: 'About 15 minutes', desc: 'Short bursts, quick wins', icon: Zap },
  { id: '30min', label: 'About 30 minutes', desc: 'Solid sessions, manageable length', icon: Timer },
  { id: '45min', label: 'About 45 minutes', desc: 'Good depth, still fresh afterwards', icon: Flame },
  { id: 'about_an_hour', label: 'About an hour', desc: 'Deep engagement, real progress', icon: Flame },
  { id: '90_plus', label: '90+ minutes', desc: 'Full immersion, marathon sessions', icon: Flame },
  { id: 'it_depends', label: 'It depends on the day', desc: 'Some days short, some days long', icon: Timer },
];

const WORK_STYLE_OPTIONS = [
  { id: 'short_sprints', label: 'Short focused sprints', desc: 'Quick wins with regular breaks' },
  { id: 'deep_uninterrupted', label: 'Deep uninterrupted work', desc: 'Long sessions, no interruptions' },
  { id: 'mix_both', label: 'A mix of both', desc: 'Some sprints, some deep work' },
];

export const FOCUS_DURATION_OPTIONS_LIST = FOCUS_DURATION_OPTIONS;

interface FocusStyleStepProps {
  hasAdhd: boolean;
  onHasAdhdChange: (v: boolean) => void;
  focusDurationComfort: string;
  onFocusDurationComfortChange: (val: string) => void;
  workStylePreference: string;
  onWorkStylePreferenceChange: (val: string) => void;
  direction: number;
}

export function FocusStyleStep({
  hasAdhd,
  onHasAdhdChange,
  focusDurationComfort,
  onFocusDurationComfortChange,
  workStylePreference,
  onWorkStylePreferenceChange,
  direction,
}: FocusStyleStepProps) {
  return (
    <motion.div
      initial={{ x: direction > 0 ? 60 : -60, opacity: 0, scale: 0.97, filter: 'blur(3px)' }}
      animate={{ x: 0, opacity: 1, scale: 1, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 260, damping: 25 } }}
      exit={{ x: direction > 0 ? -60 : 60, opacity: 0, scale: 0.97, filter: 'blur(3px)', transition: { type: 'spring', stiffness: 260, damping: 25 } }}
    >
      <h2 className="mb-2 text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
        How do you focus best?
      </h2>
      <p className="mb-6 text-sm text-zinc-500">
        We&apos;ll set your timer defaults based on this — no tech jargon required.
      </p>

      {/* ADHD toggle — subtle and supportive */}
      <div className={cn(
        'mb-8 flex items-center gap-4 rounded-xl border p-4 transition-all duration-200',
        hasAdhd
          ? 'border-emerald-500/20 bg-emerald-500/[0.04]'
          : 'border-white/[0.06] bg-white/[0.02]'
      )}>
        <div className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          hasAdhd ? 'bg-emerald-500/10' : 'bg-white/[0.04]'
        )}>
          <Brain className={cn('h-5 w-5', hasAdhd ? 'text-emerald-400' : 'text-zinc-500')} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={cn('text-sm font-medium', hasAdhd ? 'text-emerald-300' : 'text-zinc-300')}>
              I have ADHD or attention challenges
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
              Coaching adapts
            </span>
          </div>
          <p className="mt-0.5 text-xs text-zinc-500">
            Your coach will use shorter sessions, gentler nudges, and more breaks
          </p>
        </div>
        <Switch
          checked={hasAdhd}
          onCheckedChange={onHasAdhdChange}
          aria-label="ADHD or attention challenges toggle"
          className={cn(
            'h-6 w-11',
            hasAdhd ? 'data-[state=checked]:bg-emerald-500' : ''
          )}
        />
      </div>

      {/* Focus duration — natural language */}
      <div className="mb-8">
        <label className="mb-3 block text-sm font-medium text-zinc-300">
          How long can you comfortably stay focused?
        </label>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3" role="radiogroup" aria-label="Comfortable focus duration">
          {FOCUS_DURATION_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <motion.button
                key={opt.id}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onFocusDurationComfortChange(opt.id)}
                role="radio"
                aria-checked={focusDurationComfort === opt.id}
                aria-label={opt.label}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border p-3.5 text-center transition-all duration-200',
                  focusDurationComfort === opt.id
                    ? 'border-emerald-500/30 bg-emerald-500/[0.08] ring-1 ring-emerald-500/20'
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
                )}
              >
                <Icon className={cn('h-4 w-4', focusDurationComfort === opt.id ? 'text-emerald-400' : 'text-zinc-500')} />
                <span className={cn('text-sm font-medium', focusDurationComfort === opt.id ? 'text-emerald-300' : 'text-zinc-400')}>
                  {opt.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Work style preference */}
      <div>
        <label className="mb-3 block text-sm font-medium text-zinc-300">
          How do you enjoy working?
        </label>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3" role="radiogroup" aria-label="Work style preference">
          {WORK_STYLE_OPTIONS.map((opt) => (
            <motion.button
              key={opt.id}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onWorkStylePreferenceChange(opt.id)}
              role="radio"
              aria-checked={workStylePreference === opt.id}
              aria-label={opt.label}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all duration-200',
                workStylePreference === opt.id
                  ? 'border-emerald-500/30 bg-emerald-500/[0.08] ring-1 ring-emerald-500/20'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
              )}
            >
              <span className={cn('text-sm font-medium', workStylePreference === opt.id ? 'text-emerald-300' : 'text-zinc-400')}>
                {opt.label}
              </span>
              <span className="text-xs text-zinc-500">{opt.desc}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
