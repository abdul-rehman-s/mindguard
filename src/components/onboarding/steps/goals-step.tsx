'use client';

import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const GOALS = [
  { id: 'deep_work', label: 'Deep Work', icon: '🎯' },
  { id: 'screen_time', label: 'Less Screen Time', icon: '📉' },
  { id: 'habits', label: 'Better Habits', icon: '🔁' },
  { id: 'better_grades', label: 'Better Grades', icon: '📊' },
  { id: 'productivity', label: 'More Productivity', icon: '⚡' },
  { id: 'mental_clarity', label: 'Mental Clarity', icon: '🧘' },
  { id: 'healthy_routine', label: 'Healthy Routine', icon: '🌿' },
  { id: 'exam_preparation', label: 'Exam Prep', icon: '📝' },
  { id: 'skill_building', label: 'Skill Building', icon: '🛠️' },
  { id: 'career_advancement', label: 'Career Growth', icon: '🚀' },
  { id: 'health_fitness', label: 'Health & Fitness', icon: '💪' },
  { id: 'creative_projects', label: 'Creative Projects', icon: '🎨' },
];

export const GOALS_LIST = GOALS;

const itemStagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

const itemFade = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
};

interface GoalsStepProps {
  selectedGoals: string[];
  onToggleGoal: (id: string) => void;
  focusGoalMinutes: number;
  onFocusGoalChange: (mins: number) => void;
  direction: number;
}

export function GoalsStep({
  selectedGoals,
  onToggleGoal,
  focusGoalMinutes,
  onFocusGoalChange,
  direction,
}: GoalsStepProps) {
  const isAtMax = selectedGoals.length >= 3;

  return (
    <motion.div
      initial={{ x: direction > 0 ? 60 : -60, opacity: 0, scale: 0.97, filter: 'blur(3px)' }}
      animate={{ x: 0, opacity: 1, scale: 1, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 260, damping: 25 } }}
      exit={{ x: direction > 0 ? -60 : 60, opacity: 0, scale: 0.97, filter: 'blur(3px)', transition: { type: 'spring', stiffness: 260, damping: 25 } }}
    >
      <h2 className="mb-2 text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
        What outcomes matter most to you?
      </h2>
      <p className="mb-6 text-sm text-zinc-500">
        Pick up to 3. These shape your dashboard and daily focus targets.
      </p>

      <motion.div
        variants={itemStagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-2.5 sm:grid-cols-3"
        role="group"
        aria-label="Choose up to 3 goals"
      >
        {GOALS.map((g) => {
          const isSelected = selectedGoals.includes(g.id);
          const isDisabled = !isSelected && isAtMax;
          return (
            <motion.button
              key={g.id}
              variants={itemFade}
              whileHover={isDisabled ? {} : { scale: 1.02, y: -1 }}
              whileTap={isDisabled ? {} : { scale: 0.97 }}
              onClick={() => !isDisabled && onToggleGoal(g.id)}
              aria-pressed={isSelected}
              aria-label={g.label}
              aria-disabled={isDisabled}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-200',
                isSelected
                  ? 'border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-300 ring-1 ring-emerald-500/20'
                  : isDisabled
                    ? 'border-white/[0.04] bg-white/[0.01] text-zinc-600 opacity-50 cursor-not-allowed'
                    : 'border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-zinc-200'
              )}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20"
                >
                  <Check className="h-3 w-3 text-emerald-400" />
                </motion.div>
              )}
              <span className="text-lg" aria-hidden="true">{g.icon}</span>
              <span className="text-xs sm:text-sm">{g.label}</span>
            </motion.button>
          );
        })}
      </motion.div>
      {selectedGoals.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-xs text-zinc-500"
        >
          {selectedGoals.length}/3 selected
        </motion.p>
      )}

      {/* Daily focus goal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-300">Daily focus goal</label>
          <motion.span
            key={focusGoalMinutes}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-sm font-bold text-emerald-400"
          >
            {focusGoalMinutes >= 60 ? `${Math.floor(focusGoalMinutes / 60)}h${focusGoalMinutes % 60 > 0 ? ` ${focusGoalMinutes % 60}m` : ''}` : `${focusGoalMinutes}m`}
          </motion.span>
        </div>
        <Slider
          value={[focusGoalMinutes]}
          onValueChange={(v) => onFocusGoalChange(v[0])}
          min={30}
          max={300}
          step={15}
          aria-label="Daily focus goal in minutes"
          className="w-full [&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-track]]:bg-white/[0.08] [&_[data-slot=slider-range]]:bg-emerald-500 [&_[data-slot=slider-thumb]]:border-emerald-500 [&_[data-slot=slider-thumb]]:bg-zinc-900 [&_[data-slot=slider-thumb]]:h-5 [&_[data-slot=slider-thumb]]:w-5"
        />
        <div className="mt-1 flex justify-between text-xs text-zinc-600">
          <span>30m</span>
          <span>2h</span>
          <span>5h</span>
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Your daily target for focused work minutes. Start small — you can increase later.
        </p>
      </motion.div>
    </motion.div>
  );
}
