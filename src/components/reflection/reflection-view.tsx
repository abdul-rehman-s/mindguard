'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Loader2,
  AlertCircle,
  Check,
  BrainCircuit,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAppStore } from '@/stores/app-store';

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

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function ReflectionView() {
  const { todayReflection, setTodayReflection } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    distraction: '',
    wentWell: '',
    tomorrowMission: '',
  });

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
        });
        setSaved(true);
      }
    } catch {
      setError('Failed to load reflection');
    } finally {
      setLoading(false);
    }
  }, [setTodayReflection]);

  useEffect(() => {
    fetchReflection();
  }, [fetchReflection]);

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
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSaved(true);
    } catch {
      setError('Failed to save reflection');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (id: string, value: string) => {
    setForm((prev) => ({ ...prev, [id]: value }));
    setSaved(false);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="visible">
      <motion.div variants={item} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-zinc-100">Daily Reflection</h2>
        </div>
        <p className="text-sm text-zinc-500">
          Three questions to close your day with intention.
        </p>
      </motion.div>

      {error && (
        <motion.div variants={item} className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2.5">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <span className="text-xs text-red-400">{error}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {questions.map((q, idx) => {
          const Icon = q.icon;
          return (
            <motion.div key={q.id} variants={item}>
              <Card className="border-zinc-800/50 bg-zinc-900/30">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                      <Icon className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                        Question {idx + 1}
                      </span>
                      <h3 className="text-sm font-medium text-zinc-100">{q.question}</h3>
                    </div>
                  </div>
                  <p className="mb-3 text-xs text-zinc-500">{q.sub}</p>
                  <Textarea
                    placeholder={q.placeholder}
                    value={form[q.id as keyof typeof form]}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                    className="border-zinc-800 bg-zinc-800/50 text-sm text-zinc-200 placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20 min-h-[80px] resize-none"
                    required
                  />
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        <motion.div variants={item} className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={
              saving ||
              !form.distraction.trim() ||
              !form.wentWell.trim() ||
              !form.tomorrowMission.trim()
            }
            className="bg-emerald-500 text-white hover:bg-emerald-600"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : saved ? (
              <Check className="mr-2 h-4 w-4" />
            ) : null}
            {saving ? 'Saving...' : saved ? 'Update Reflection' : 'Save Reflection'}
          </Button>
          {saved && !saving && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-emerald-400"
            >
              Saved for today
            </motion.span>
          )}
        </motion.div>
      </form>
    </motion.div>
  );
}
