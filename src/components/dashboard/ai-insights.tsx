'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Sunset,
  PenLine,
  TrendingUp,
  TrendingDown,
  Activity,
  Repeat,
  Target,
  Award,
  Sparkles,
  BrainCircuit,
  AlertCircle,
  Lightbulb,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fadeInUp } from '@/lib/animations';
import type { Insight } from '@/types';

const ICON_MAP: Record<string, LucideIcon> = {
  Calendar,
  Clock,
  Sunset,
  PenLine,
  TrendingUp,
  TrendingDown,
  Activity,
  Repeat,
  Target,
  Award,
  Sparkles,
  BrainCircuit,
  Lightbulb,
};

const TYPE_STYLES: Record<
  Insight['type'],
  { border: string; iconBg: string; iconColor: string; label: string; labelColor: string }
> = {
  pattern: {
    border: 'border-l-emerald-500/60',
    iconBg: 'bg-emerald-500/[0.08]',
    iconColor: 'text-emerald-400',
    label: 'Pattern',
    labelColor: 'text-emerald-400/80',
  },
  trend: {
    border: 'border-l-amber-500/60',
    iconBg: 'bg-amber-500/[0.08]',
    iconColor: 'text-amber-400',
    label: 'Trend',
    labelColor: 'text-amber-400/80',
  },
  achievement: {
    border: 'border-l-purple-500/60',
    iconBg: 'bg-purple-500/[0.08]',
    iconColor: 'text-purple-400',
    label: 'Achievement',
    labelColor: 'text-purple-400/80',
  },
  suggestion: {
    border: 'border-l-sky-500/60',
    iconBg: 'bg-sky-500/[0.08]',
    iconColor: 'text-sky-400',
    label: 'Suggestion',
    labelColor: 'text-sky-400/80',
  },
};

// ---- Insight Card (React.memo) ----
const InsightCard = React.memo(function InsightCard({
  insight,
  index,
}: {
  insight: Insight;
  index: number;
}) {
  const style = TYPE_STYLES[insight.type];
  const IconComp = ICON_MAP[insight.icon] || Sparkles;
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className={cn(
        'group relative overflow-hidden rounded-lg border border-l-2 border-white/[0.04] bg-white/[0.02] p-3 transition-all duration-200 hover:bg-white/[0.03]',
        style.border
      )}
      aria-label={`${style.label} insight: ${insight.title}`}
    >
      <div className="flex items-start gap-3">
        <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', style.iconBg)} aria-hidden="true">
          <IconComp className={cn('h-3.5 w-3.5', style.iconColor)} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className={cn('text-[9px] font-medium uppercase tracking-wider', style.labelColor)}>
              {style.label}
            </span>
            <span className="text-[9px] text-zinc-600" aria-hidden="true">·</span>
            <span className="text-[9px] text-zinc-600">{insight.metric}</span>
          </div>
          <p className="text-[12px] font-medium leading-snug text-zinc-200">{insight.title}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-zinc-500 line-clamp-2">
            {insight.description}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className={cn('text-[11px] font-semibold tabular-nums', style.iconColor)}>
              {insight.value}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export function AiInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/insights');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setInsights(data.insights || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  if (loading) {
    return (
      <div className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02] flex flex-col" aria-label="Loading AI insights">
        <div className="p-5 pb-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">AI Insights</h3>
        </div>
        <div className="flex flex-1 flex-col gap-2 px-5 pb-5">
          <div className="h-16 animate-pulse rounded-lg bg-white/[0.04]" />
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
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">AI Insights</h3>
        </div>
        <div className="flex flex-col items-center px-5 pb-6 pt-2 text-center">
          <AlertCircle className="mb-3 h-7 w-7 text-zinc-700" aria-hidden="true" />
          <p className="mb-3 text-sm text-zinc-500">Couldn&apos;t analyze your patterns.</p>
          <button onClick={fetchInsights} className="text-xs text-emerald-400 hover:text-emerald-300" aria-label="Try loading insights again">
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02]"
      >
        <div className="p-5 pb-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">AI Insights</h3>
        </div>
        <div className="flex flex-col items-center px-5 pb-6 pt-2 text-center" aria-label="No insights yet">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.03]" aria-hidden="true">
            <Sparkles className="h-5 w-5 text-zinc-700" />
          </div>
          <p className="mb-1 text-sm font-medium text-zinc-400">No insights yet</p>
          <p className="text-xs text-zinc-600">Complete a few focus sessions to unlock patterns</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02] flex flex-col"
    >
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">AI Insights</h3>
          </div>
          <span className="text-[10px] text-zinc-600" aria-live="polite">{insights.length} found</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-5 pb-5">
        <div className="max-h-96 overflow-y-auto pr-1 space-y-2" aria-label="Insights list">
          {insights.map((insight, i) => (
            <InsightCard key={`${insight.title}-${i}`} insight={insight} index={i} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
