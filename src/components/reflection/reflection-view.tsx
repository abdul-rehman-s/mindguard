'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Loader2,
  AlertCircle,
  Check,
  BrainCircuit,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  History,
  SmilePlus,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useAppStore } from '@/stores/app-store';
import { cn, formatDateDisplay, formatTimeDisplay } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { toast } from 'sonner';
import type { DailyReflection } from '@/types';

const questions = [
  {
    id: 'distraction',
    question: 'What distracted you today?',
    sub: 'Be honest. Awareness is the first step.',
    icon: BrainCircuit,
    placeholder: 'Social media, notifications, wandering thoughts...',
  },
  {
    id: 'wentWell',
    question: 'What went well today?',
    sub: 'Celebrate your wins, no matter how small.',
    icon: Sparkles,
    placeholder: 'Completed a deep focus session, stayed on task...',
  },
  {
    id: 'tomorrowMission',
    question: "Tomorrow's ONE mission?",
    sub: 'What is the single most important thing?',
    icon: ArrowRight,
    placeholder: 'Finish the project proposal...',
  },
];

const MAX_CHARS = 500;

const StepIndicator = React.memo(function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8 flex items-center gap-0" aria-label={`Step ${currentStep + 1} of 3`}>
      {questions.map((q, idx) => {
        const Icon = q.icon;
        const isActive = idx <= currentStep;
        const isCurrent = idx === currentStep;
        return (
          <div key={q.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{ scale: isCurrent ? 1.05 : 1 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300',
                  isActive
                    ? 'bg-emerald-500/15 ring-1 ring-emerald-500/20'
                    : 'bg-white/[0.03] ring-1 ring-white/[0.06]'
                )}
              >
                <Icon className={cn(
                  'h-4 w-4 transition-colors duration-300',
                  isActive ? 'text-emerald-400' : 'text-zinc-700'
                )} />
              </motion.div>
              <span className={cn(
                'mt-1.5 text-[10px] font-medium uppercase tracking-wider',
                isCurrent ? 'text-emerald-400/60' : 'text-zinc-700'
              )}>
                {idx + 1}/3
              </span>
            </div>
            {idx < questions.length - 1 && (
              <div className={cn(
                'mx-3 h-[2px] w-12 rounded-full transition-colors duration-300',
                idx < currentStep ? 'bg-emerald-500/30' : 'bg-white/[0.04]'
              )} aria-hidden="true" />
            )}
          </div>
        );
      })}
    </div>
  );
});

const ReflectionCard = React.memo(function ReflectionCard({ reflection }: { reflection: DailyReflection }) {
  const dateLabel = formatDateDisplay(reflection.date, 'MMM d, yyyy');
  return (
    <Card className="card-glow border-white/[0.04] bg-white/[0.01]">
      <CardContent className="p-4">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-zinc-600">
          {dateLabel}
        </p>
        <div className="flex flex-col gap-2.5">
          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Distractions</span>
            <p className="mt-0.5 text-xs leading-relaxed text-zinc-400 line-clamp-2">{reflection.distraction}</p>
          </div>
          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Went Well</span>
            <p className="mt-0.5 text-xs leading-relaxed text-zinc-400 line-clamp-2">{reflection.wentWell}</p>
          </div>
          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Tomorrow</span>
            <p className="mt-0.5 text-xs leading-relaxed text-emerald-400/70 line-clamp-1">{reflection.tomorrowMission}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export function ReflectionView() {
  const todayReflection = useAppStore(s => s.todayReflection);
  const setTodayReflection = useAppStore(s => s.setTodayReflection);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    distraction: '',
    wentWell: '',
    tomorrowMission: '',
    mood: 0 as number,       // 1-5, 0 = unset
    energy: 0 as number,     // 1-5, 0 = unset
  });
  const [activeField, setActiveField] = useState<string | null>(null);
  const [reflections, setReflections] = useState<DailyReflection[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const fetchReflection = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reflections');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      if (data.todayReflection) {
        setTodayReflection(data.todayReflection);
        setForm({
          distraction: data.todayReflection.distraction,
          wentWell: data.todayReflection.wentWell,
          tomorrowMission: data.todayReflection.tomorrowMission,
          mood: data.todayReflection.mood || 0,
          energy: data.todayReflection.energy || 0,
        });
        setSaved(true);
      }
      setReflections(data.reflections || []);
    } catch {
      setError('Failed to load reflection');
      toast.error('Failed to load reflection');
    } finally {
      setLoading(false);
    }
  }, [setTodayReflection]);

  useEffect(() => { fetchReflection(); }, [fetchReflection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.distraction.trim() || !form.wentWell.trim() || !form.tomorrowMission.trim()) return;

    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/reflections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          distraction: form.distraction.trim(),
          wentWell: form.wentWell.trim(),
          tomorrowMission: form.tomorrowMission.trim(),
          mood: form.mood > 0 ? form.mood : undefined,
          energy: form.energy > 0 ? form.energy : undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      const postData = await res.json();
      // Use POST response data instead of refetch to avoid double fetch
      if (postData.todayReflection) {
        setTodayReflection(postData.todayReflection);
      }
      setSaved(true);
      // Only update the list if POST returns reflections
      if (postData.reflections) {
        setReflections(postData.reflections);
      }
    } catch {
      setError('Failed to save reflection');
      toast.error('Failed to save reflection');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (id: string, value: string) => {
    if (value.length <= MAX_CHARS) {
      setForm((prev) => ({ ...prev, [id]: value }));
      setSaved(false);
    }
  };

  const currentStep = questions.findIndex((q) => q.id === activeField);
  const completedSteps = questions.filter((q) => form[q.id as keyof typeof form].trim().length > 0).length;

  // Filter out today from history
  const today = new Date().toISOString().split('T')[0];
  const historyReflections = reflections.filter((r) => r.date !== today);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" aria-label="Loading reflection data" />
      </div>
    );
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" aria-label="Daily reflection">
      <motion.div variants={staggerItem} className="mb-2 pt-2">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="h-5 w-5 text-emerald-400" aria-hidden="true" />
          <h2 className="text-[1.65rem] font-semibold tracking-[-0.02em] text-zinc-100">Daily Reflection</h2>
        </div>
        <p className="mt-1.5 text-sm text-zinc-500">
          Three questions to close your day with intention.
        </p>
      </motion.div>

      {/* Step Progress Indicator */}
      <motion.div variants={staggerItem}>
        <StepIndicator currentStep={currentStep >= 0 ? currentStep : completedSteps - 1} />
      </motion.div>

      {/* Mood & Energy Selector */}
      <motion.div variants={staggerItem}>
        <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col gap-5">
              {/* Mood */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <SmilePlus className="h-4 w-4 text-emerald-400/80" aria-hidden="true" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">How do you feel?</span>
                </div>
                <div className="flex items-center gap-2" role="radiogroup" aria-label="Mood selector">
                  {[
                    { value: 1, emoji: '😞', label: 'Terrible' },
                    { value: 2, emoji: '😕', label: 'Not great' },
                    { value: 3, emoji: '😐', label: 'Okay' },
                    { value: 4, emoji: '😊', label: 'Good' },
                    { value: 5, emoji: '🤩', label: 'Amazing' },
                  ].map(m => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => { setForm(prev => ({ ...prev, mood: m.value })); setSaved(false); }}
                      role="radio"
                      aria-checked={form.mood === m.value}
                      aria-label={`Mood: ${m.label}`}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-lg px-2.5 py-2 transition-all duration-200 cursor-pointer',
                        form.mood === m.value
                          ? 'bg-emerald-500/15 ring-1 ring-emerald-500/20 scale-105'
                          : 'bg-white/[0.03] hover:bg-white/[0.06]'
                      )}
                    >
                      <span className={cn(
                        'text-lg transition-all duration-200',
                        form.mood === m.value ? 'grayscale-0 scale-110' : 'grayscale-50 opacity-50'
                      )}>{m.emoji}</span>
                      <span className={cn(
                        'text-[9px] font-medium',
                        form.mood === m.value ? 'text-emerald-400/70' : 'text-zinc-600'
                      )}>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4 text-emerald-400/80" aria-hidden="true" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Energy level?</span>
                </div>
                <div className="flex items-center gap-2" role="radiogroup" aria-label="Energy selector">
                  {[
                    { value: 1, emoji: '🔋', label: 'Drained', sub: 'Low' },
                    { value: 2, emoji: '🔋', label: 'Tired', sub: 'Below avg' },
                    { value: 3, emoji: '⚡', label: 'Normal', sub: 'Medium' },
                    { value: 4, emoji: '⚡', label: 'Energized', sub: 'High' },
                    { value: 5, emoji: '⚡', label: 'Supercharged', sub: 'Peak' },
                  ].map(e => (
                    <button
                      key={e.value}
                      type="button"
                      onClick={() => { setForm(prev => ({ ...prev, energy: e.value })); setSaved(false); }}
                      role="radio"
                      aria-checked={form.energy === e.value}
                      aria-label={`Energy: ${e.label}`}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-lg px-2.5 py-2 transition-all duration-200 cursor-pointer',
                        form.energy === e.value
                          ? 'bg-emerald-500/15 ring-1 ring-emerald-500/20 scale-105'
                          : 'bg-white/[0.03] hover:bg-white/[0.06]'
                      )}
                    >
                      <span className={cn(
                        'text-base transition-all duration-200',
                        form.energy === e.value ? 'grayscale-0 scale-110' : 'grayscale-50 opacity-50',
                        e.value <= 2 ? 'text-amber-400' : 'text-emerald-400'
                      )}>{e.emoji}</span>
                      <span className={cn(
                        'text-[9px] font-medium',
                        form.energy === e.value ? 'text-emerald-400/70' : 'text-zinc-600'
                      )}>{e.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {error && (
        <motion.div variants={staggerItem} className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2.5" role="alert" aria-live="polite">
          <AlertCircle className="h-4 w-4 text-red-400" aria-hidden="true" />
          <span className="text-xs text-red-400">{error}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {questions.map((q, idx) => {
          const Icon = q.icon;
          const charCount = form[q.id as keyof typeof form].length;
          const isNearLimit = charCount > MAX_CHARS * 0.8;
          return (
            <motion.div key={q.id} variants={staggerItem}>
              <Card className={cn(
                'card-glow border-white/[0.06] bg-white/[0.02] transition-colors duration-200',
                activeField === q.id && 'border-emerald-500/15'
              )}>
                <CardContent className="p-4 sm:p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <div className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-200',
                      activeField === q.id ? 'bg-emerald-500/15' : 'bg-emerald-500/10'
                    )} aria-hidden="true">
                      <Icon className={cn(
                        'h-4 w-4 transition-colors duration-200',
                        activeField === q.id ? 'text-emerald-400' : 'text-emerald-400/80'
                      )} />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                        Question {idx + 1}
                      </span>
                      <h3 className="text-sm font-medium text-zinc-100">{q.question}</h3>
                    </div>
                  </div>
                  <p className="mb-3 text-xs text-zinc-500">{q.sub}</p>
                  <div className="relative">
                    <Textarea
                      placeholder={q.placeholder}
                      value={form[q.id as keyof typeof form]}
                      onChange={(e) => handleChange(q.id, e.target.value)}
                      onFocus={() => setActiveField(q.id)}
                      onBlur={() => setActiveField(null)}
                      aria-label={q.question}
                      className="border-white/[0.06] bg-white/[0.03] text-sm text-zinc-200 placeholder:text-zinc-600 focus-visible:border-emerald-500/40 focus-visible:ring-emerald-500/20 min-h-[100px] resize-none pr-14"
                      required
                    />
                    <span className={cn(
                      'absolute bottom-3 right-3 text-[10px] tabular-nums transition-colors',
                      isNearLimit ? 'text-amber-400/60' : 'text-zinc-700'
                    )} aria-live="polite">
                      {charCount}/{MAX_CHARS}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        <motion.div variants={staggerItem} className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={
              saving ||
              !form.distraction.trim() ||
              !form.wentWell.trim() ||
              !form.tomorrowMission.trim()
            }
            aria-label={saving ? 'Saving reflection' : saved ? 'Update reflection' : 'Save reflection'}
            className="btn-glow bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/15 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-emerald-500/25"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : saved ? (
              <Check className="mr-2 h-4 w-4" aria-hidden="true" />
            ) : null}
            {saving ? 'Saving...' : saved ? 'Update Reflection' : 'Save Reflection'}
          </Button>
          {saved && !saving && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-emerald-400"
              aria-live="polite"
            >
              Saved for today
            </motion.span>
          )}
        </motion.div>
      </form>

      {/* Reflection History */}
      {historyReflections.length > 0 && (
        <motion.div variants={staggerItem} className="mt-10">
          <button
            onClick={() => setShowHistory(!showHistory)}
            aria-label={showHistory ? 'Hide past reflections' : 'Show past reflections'}
            aria-expanded={showHistory}
            className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500 transition-colors hover:text-zinc-300"
          >
            <History className="h-3.5 w-3.5" aria-hidden="true" />
            Past Reflections
            <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] tabular-nums">{historyReflections.length}</span>
            {showHistory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-3 overflow-hidden max-h-96 overflow-y-auto"
              >
                {historyReflections.slice(0, 7).map((r) => (
                  <ReflectionCard key={r.id} reflection={r} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
