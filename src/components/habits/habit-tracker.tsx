'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Loader2,
  AlertCircle,
  Flame,
  Check,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/animations';
import { toast } from 'sonner';
import type { HabitWithEntries, HabitStreak } from '@/types';
import { format, subDays } from 'date-fns';

// ─── Predefined habit suggestions ───
const HABIT_PRESETS = [
  { name: 'Exercise', icon: '💪', color: '#10b981' },
  { name: 'Reading', icon: '📚', color: '#6366f1' },
  { name: 'Meditation', icon: '🧘', color: '#8b5cf6' },
  { name: 'Journaling', icon: '📝', color: '#f59e0b' },
  { name: 'Drink Water', icon: '💧', color: '#06b6d4' },
  { name: 'Sleep 8h', icon: '😴', color: '#3b82f6' },
  { name: 'No Social Media', icon: '📵', color: '#ef4444' },
  { name: 'Walk Outside', icon: '🚶', color: '#22c55e' },
  { name: 'Healthy Eating', icon: '🥗', color: '#14b8a6' },
  { name: 'Deep Work', icon: '🧠', color: '#f97316' },
];

function calculateStreakFromEntries(entries: { date: string }[], frequency: string): number {
  if (entries.length === 0) return 0;

  const sortedDates = entries
    .map(e => e.date)
    .sort()
    .reverse();

  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  // For daily habits: check consecutive days from today/yesterday backwards
  if (frequency === 'daily') {
    // Start streak from today or yesterday
    let streak = 0;
    let checkDate = sortedDates.includes(today) ? today : yesterday;

    while (true) {
      if (sortedDates.includes(checkDate)) {
        streak++;
        const d = new Date(checkDate);
        d.setDate(d.getDate() - 1);
        checkDate = format(d, 'yyyy-MM-dd');
      } else {
        break;
      }
    }
    return streak;
  }

  // For weekly habits: count weeks with entries in last 12 weeks
  if (frequency === 'weekly') {
    return Math.min(entries.length, 12);
  }

  return entries.length;
}

// ─── Day Circle Component ───
const DayCircle = React.memo(function DayCircle({
  date,
  completed,
  isToday,
  onClick,
  color,
}: {
  date: string;
  completed: boolean;
  isToday: boolean;
  onClick: () => void;
  color?: string | null;
}) {
  const fillColor = color || '#10b981';
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={onClick}
      className={cn(
        'relative h-[10px] w-[10px] rounded-[2px] cursor-pointer transition-all duration-150',
        isToday && 'ring-1 ring-emerald-500/40',
      )}
      style={{
        backgroundColor: completed ? fillColor : 'rgba(255,255,255,0.03)',
        opacity: completed ? 0.8 : 0.3,
      }}
      aria-label={`${date}: ${completed ? 'Completed' : 'Not completed'}`}
    />
  );
});

// ─── Habit Row Component ───
const HabitRow = React.memo(function HabitRow({
  habit,
  streak,
  onToggleDay,
  onDelete,
}: {
  habit: HabitWithEntries;
  streak: number;
  onToggleDay: (habitId: string, date: string) => void;
  onDelete: (habitId: string) => void;
}) {
  const today = new Date();
  const entryMap = new Map(habit.entries.map(e => [e.date, e]));

  // Generate last 30 days
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = subDays(today, 29 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    return {
      date: dateStr,
      completed: entryMap.has(dateStr),
      isToday: dateStr === format(today, 'yyyy-MM-dd'),
    };
  });

  const todayStr = format(today, 'yyyy-MM-dd');
  const todayCompleted = entryMap.has(todayStr);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'group rounded-lg border p-3 transition-all duration-200',
        todayCompleted
          ? 'border-emerald-500/20 bg-emerald-500/[0.04]'
          : 'border-white/[0.04] bg-white/[0.01]'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Icon + Name */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-base" aria-hidden="true">{habit.icon || '⭐'}</span>
          <div className="min-w-0 flex-1">
            <p className={cn(
              'text-[12px] font-medium leading-tight truncate',
              todayCompleted ? 'text-zinc-100' : 'text-zinc-400'
            )}>
              {habit.name}
            </p>
            {habit.description && (
              <p className="mt-0.5 text-[10px] text-zinc-600 line-clamp-1">{habit.description}</p>
            )}
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-1 shrink-0">
          {streak > 0 && (
            <Flame className={cn(
              'h-3 w-3',
              streak >= 7 ? 'text-emerald-400' : streak >= 3 ? 'text-amber-400/60' : 'text-zinc-500'
            )} aria-hidden="true" />
          )}
          <span className={cn(
            'text-[10px] tabular-nums',
            streak >= 7 ? 'text-emerald-400 font-medium' : 'text-zinc-500'
          )}>
            {streak > 0 ? `${streak}d` : '—'}
          </span>
        </div>

        {/* Delete button (visible on hover) */}
        <button
          onClick={() => onDelete(habit.id)}
          className="shrink-0 rounded p-1 text-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          aria-label={`Delete ${habit.name}`}
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Day circles row */}
      <div className="mt-2 flex gap-[2px]" role="group" aria-label={`${habit.name} daily progress`}>
        {days.map(d => (
          <DayCircle
            key={d.date}
            date={d.date}
            completed={d.completed}
            isToday={d.isToday}
            onClick={() => onToggleDay(habit.id, d.date)}
            color={habit.color}
          />
        ))}
      </div>
    </motion.div>
  );
});

// ─── Add Habit Modal ───
function AddHabitModal({ onAdd }: { onAdd: (data: { name: string; description?: string; icon: string; color: string; frequency: string }) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('⭐');
  const [color, setColor] = useState('#10b981');
  const [frequency, setFrequency] = useState('daily');
  const [showPresets, setShowPresets] = useState(true);
  const [open, setOpen] = useState(false);

  const handlePresetClick = (preset: typeof HABIT_PRESETS[0]) => {
    setName(preset.name);
    setIcon(preset.icon);
    setColor(preset.color);
    setShowPresets(false);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('Please enter a habit name');
      return;
    }
    onAdd({ name: name.trim(), description: description.trim() || undefined, icon, color, frequency });
    setName('');
    setDescription('');
    setIcon('⭐');
    setColor('#10b981');
    setFrequency('daily');
    setShowPresets(true);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="btn-glow bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/15 hover:from-emerald-400 hover:to-emerald-500 cursor-pointer"
          aria-label="Add new habit"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          Add Habit
        </Button>
      </DialogTrigger>
      <DialogContent className="border-white/[0.06] bg-zinc-950 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Add New Habit</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          {/* Presets */}
          {showPresets && (
            <div>
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500">Quick Start</p>
              <div className="flex flex-wrap gap-2">
                {HABIT_PRESETS.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => handlePresetClick(preset)}
                    className="flex items-center gap-1.5 rounded-lg border border-white/[0.04] bg-white/[0.02] px-2.5 py-1.5 text-xs text-zinc-300 hover:border-emerald-500/20 hover:bg-emerald-500/[0.06] transition-all cursor-pointer"
                    aria-label={`Add ${preset.name} habit`}
                  >
                    <span>{preset.icon}</span>
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom form */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{icon}</span>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Habit name"
                className="border-white/[0.06] bg-white/[0.03] text-sm text-zinc-200 placeholder:text-zinc-600 focus-visible:border-emerald-500/40"
                aria-label="Habit name"
              />
            </div>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="border-white/[0.06] bg-white/[0.03] text-sm text-zinc-200 placeholder:text-zinc-600 focus-visible:border-emerald-500/40 min-h-[60px] resize-none"
              aria-label="Habit description"
            />

            {/* Frequency selector */}
            <div>
              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">Frequency</p>
              <div className="flex gap-2">
                {(['daily', 'weekly'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFrequency(f)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer',
                      frequency === f
                        ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20'
                        : 'bg-white/[0.03] text-zinc-400 hover:text-zinc-200'
                    )}
                    aria-pressed={frequency === f}
                    aria-label={`${f} frequency`}
                  >
                    {f === 'daily' ? 'Every day' : 'Weekly'}
                  </button>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div>
              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">Color</p>
              <div className="flex gap-2">
                {['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#22c55e', '#ec4899'].map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      'h-5 w-5 rounded-full cursor-pointer transition-transform',
                      color === c ? 'scale-125 ring-2 ring-white/20' : 'hover:scale-110'
                    )}
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                    aria-pressed={color === c}
                  />
                ))}
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="btn-glow bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/15 hover:from-emerald-400 hover:to-emerald-500 cursor-pointer"
            >
              Create Habit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Habit Tracker Component ───
export function HabitTracker() {
  const [habits, setHabits] = useState<HabitWithEntries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [streaks, setStreaks] = useState<Map<string, HabitStreak>>(new Map());

  const fetchHabits = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/habits');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      const habitsList: HabitWithEntries[] = data.habits || [];
      setHabits(habitsList);

      // Calculate streaks
      const streakMap = new Map<string, HabitStreak>();
      for (const h of habitsList) {
        const currentStreak = calculateStreakFromEntries(h.entries, h.frequency);
        streakMap.set(h.id, { habitId: h.id, currentStreak, longestStreak: currentStreak });
      }
      setStreaks(streakMap);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const toggleDay = useCallback(async (habitId: string, date: string) => {
    try {
      const res = await fetch('/api/habits/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitId, date }),
      });
      if (!res.ok) throw new Error('Failed');

      // Refresh habits to update streaks
      await fetchHabits();

      const todayStr = format(new Date(), 'yyyy-MM-dd');
      if (date === todayStr) {
        toast.success('Habit completed for today! 🎉');
      }
    } catch {
      toast.error('Failed to update habit');
    }
  }, [fetchHabits]);

  const addHabit = useCallback(async (data: { name: string; description?: string; icon: string; color: string; frequency: string }) => {
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(`"${data.name}" habit created!`);
      await fetchHabits();
    } catch {
      toast.error('Failed to create habit');
    }
  }, [fetchHabits]);

  const deleteHabit = useCallback(async (habitId: string) => {
    try {
      const res = await fetch(`/api/habits/${habitId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast.success('Habit removed');
      await fetchHabits();
    } catch {
      toast.error('Failed to remove habit');
    }
  }, [fetchHabits]);

  // Empty state
  const hasNoHabits = habits.length === 0;

  // Total streak across all habits
  const totalActiveStreaks = habits.filter(h => {
    const s = streaks.get(h.id);
    return s && s.currentStreak > 0;
  }).length;

  if (loading) {
    return (
      <div className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02]" aria-label="Loading habits">
        <div className="p-4 sm:p-5 pb-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Habits</h3>
        </div>
        <div className="flex flex-col gap-2 px-4 sm:px-5 pb-5">
          <div className="h-8 w-3/4 animate-pulse rounded bg-white/[0.04]" />
          <div className="h-16 animate-pulse rounded-lg bg-white/[0.04]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02]" role="alert" aria-live="polite">
        <div className="p-4 sm:p-5 pb-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Habits</h3>
        </div>
        <div className="flex flex-col items-center px-4 sm:px-5 pb-6 pt-2 text-center">
          <AlertCircle className="mb-3 h-7 w-7 text-zinc-700" aria-hidden="true" />
          <p className="mb-3 text-sm text-zinc-500">Couldn&apos;t load habits.</p>
          <button onClick={fetchHabits} className="text-xs text-emerald-400 hover:text-emerald-300 cursor-pointer" aria-label="Try loading habits again">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02]"
    >
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Habits</h3>
          </div>
          <span className="flex items-center gap-1 text-[11px] text-zinc-400" aria-live="polite">
            {totalActiveStreaks > 0 && (
              <Flame className="h-3 w-3 text-emerald-400/70" aria-hidden="true" />
            )}
            <span className="text-zinc-500">{habits.length} habit{habits.length !== 1 ? 's' : ''}</span>
          </span>
        </div>
      </div>

      <div className="px-4 sm:px-5 pb-5">
        {/* Add habit button */}
        <div className="mb-3">
          <AddHabitModal onAdd={addHabit} />
        </div>

        {/* Empty state */}
        {hasNoHabits && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-zinc-500">No habits yet. Start building positive routines!</p>
            <p className="text-[10px] text-zinc-600">Click "Add Habit" to create your first one.</p>
          </div>
        )}

        {/* Habits list */}
        <div className="space-y-2 max-h-96 overflow-y-auto" aria-label="Habit list">
          {habits.map(h => (
            <HabitRow
              key={h.id}
              habit={h}
              streak={streaks.get(h.id)?.currentStreak || 0}
              onToggleDay={toggleDay}
              onDelete={deleteHabit}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
