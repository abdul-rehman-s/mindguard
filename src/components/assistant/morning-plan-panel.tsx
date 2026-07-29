'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Target, AlertTriangle, Sparkles, Clock, RefreshCw, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { staggerContainer, staggerItem } from '@/lib/animations';
import type { MorningBriefing } from '@/types';

const priorityColors: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const typeColors: Record<string, string> = {
  deep_work: 'bg-emerald-500/15 text-emerald-400',
  creative: 'bg-purple-500/15 text-purple-400',
  planning: 'bg-blue-500/15 text-blue-400',
  review: 'bg-orange-500/15 text-orange-400',
};

export const MorningPlanPanel = React.memo(function MorningPlanPanel() {
  const morningBriefing = useAppStore(s => s.morningBriefing);
  const setMorningBriefing = useAppStore(s => s.setMorningBriefing);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBriefing = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/assistant/plan');
      if (!res.ok) throw new Error('Failed to fetch morning briefing');
      const data: MorningBriefing = await res.json();
      setMorningBriefing(data);
    } catch {
      setError('Failed to generate morning briefing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [setMorningBriefing]);

  useEffect(() => {
    if (!morningBriefing) fetchBriefing();
  }, [morningBriefing, fetchBriefing]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="glass-card glass-glow-edge card-glow">
        <CardContent className="flex flex-col items-center gap-3 py-8">
          <AlertTriangle className="h-8 w-8 text-red-400" />
          <p className="text-sm text-zinc-400">{error}</p>
          <Button onClick={fetchBriefing} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1.5" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!morningBriefing) return null;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      {/* Motivational Summary */}
      <motion.div variants={staggerItem}>
        <Card className="glass-card glass-glow-edge card-glow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/10">
                <Sparkles className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">Morning Briefing</p>
                <p className="text-xs text-zinc-500">{morningBriefing.date}</p>
              </div>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed bg-emerald-500/[0.05] rounded-lg p-3 border border-emerald-500/10">
              {morningBriefing.motivationalSummary}
            </p>
            {morningBriefing.weatherNote && (
              <p className="text-xs text-zinc-500 mt-2">☀️ {morningBriefing.weatherNote}</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Focus Score Estimate */}
      <motion.div variants={staggerItem}>
        <Card className="glass-card glass-glow-edge card-glow">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-zinc-300 mb-3">Estimated Focus Score</p>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Progress value={morningBriefing.estimatedFocusScore} className="h-3 bg-zinc-800 [&>div]:bg-emerald-400" />
              </div>
              <span className="text-xl font-bold text-emerald-400">
                {morningBriefing.estimatedFocusScore}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Priorities */}
      <motion.div variants={staggerItem}>
        <Card className="glass-card glass-glow-edge card-glow">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium text-zinc-200 flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-400" /> Today&apos;s Priorities
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {morningBriefing.priorities.map((p, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-zinc-900/50 px-3 py-2.5 border border-white/[0.04]">
                  <Badge variant="outline" className={cn('text-xs shrink-0', priorityColors[p.priority])}>
                    {p.priority}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200">{p.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{p.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Work Blocks */}
      <motion.div variants={staggerItem}>
        <Card className="glass-card glass-glow-edge card-glow">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium text-zinc-200 flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-400" /> Suggested Work Blocks
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {morningBriefing.suggestedWorkBlocks.map((block, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-zinc-900/50 px-3 py-2.5 border border-white/[0.04]">
                  <Badge variant="outline" className={cn('text-xs shrink-0', typeColors[block.type] || 'bg-zinc-500/15 text-zinc-400')}>
                    {block.type}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200">{block.task}</p>
                    <p className="text-xs text-zinc-500">{block.start} — {block.end}</p>
                  </div>
                  <ArrowRight className="h-3 w-3 text-zinc-500 shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Predicted Distractions */}
      {morningBriefing.predictedDistractions.length > 0 && (
        <motion.div variants={staggerItem}>
          <Card className="glass-card glass-glow-edge card-glow">
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400" /> Predicted Distractions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {morningBriefing.predictedDistractions.map((d, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg bg-yellow-500/[0.04] px-3 py-2.5 border border-yellow-500/10">
                    <span className="text-xs text-yellow-500 shrink-0">{d.time}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-200">{d.source}</p>
                      <p className="text-xs text-zinc-500">{d.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Refresh Button */}
      <motion.div variants={staggerItem} className="flex justify-center">
        <Button
          onClick={fetchBriefing}
          variant="outline"
          size="sm"
          className="text-zinc-400 border-white/[0.06] hover:text-zinc-200 hover:bg-white/[0.04]"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh Briefing
        </Button>
      </motion.div>
    </motion.div>
  );
});
