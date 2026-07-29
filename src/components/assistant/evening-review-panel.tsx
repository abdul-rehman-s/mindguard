'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sunset, Trophy, AlertTriangle, TrendingDown, Lightbulb, RefreshCw, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { staggerContainer, staggerItem } from '@/lib/animations';
import type { EveningReview } from '@/types';

const gradeColors: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  B: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  C: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  D: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  F: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
};

export const EveningReviewPanel = React.memo(function EveningReviewPanel() {
  const eveningReview = useAppStore(s => s.eveningReview);
  const setEveningReview = useAppStore(s => s.setEveningReview);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReview = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/assistant/review');
      if (!res.ok) throw new Error('Failed to fetch evening review');
      const data: EveningReview = await res.json();
      setEveningReview(data);
    } catch {
      setError('Failed to generate evening review. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [setEveningReview]);

  useEffect(() => {
    if (!eveningReview) fetchReview();
  }, [eveningReview, fetchReview]);

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
          <Button onClick={fetchReview} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1.5" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!eveningReview) return null;

  const gradeStyle = gradeColors[eveningReview.productivityGrade] || gradeColors.C;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      {/* Productivity Grade */}
      <motion.div variants={staggerItem}>
        <Card className="glass-card glass-glow-edge card-glow">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className={cn('flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold', gradeStyle.bg, gradeStyle.text, gradeStyle.border)}>
                {eveningReview.productivityGrade}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-300">Productivity Grade</p>
                <div className="flex items-center gap-3 mt-2">
                  <Progress value={eveningReview.gradeScore} className="h-2 bg-zinc-800 [&>div]:bg-emerald-400" />
                  <span className="text-sm font-medium text-emerald-400">{eveningReview.gradeScore}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">{eveningReview.date}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reflection Summary */}
      <motion.div variants={staggerItem}>
        <Card className="glass-card glass-glow-edge card-glow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sunset className="h-4 w-4 text-emerald-400" />
              <p className="text-sm font-medium text-zinc-200">Day Summary</p>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed bg-emerald-500/[0.05] rounded-lg p-3 border border-emerald-500/10">
              {eveningReview.reflectionSummary}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Biggest Wins */}
      <motion.div variants={staggerItem}>
        <Card className="glass-card glass-glow-edge card-glow">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium text-zinc-200 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-emerald-400" /> Biggest Wins
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {eveningReview.biggestWins.map((w, i) => (
                <div key={i} className="rounded-lg bg-emerald-500/[0.05] px-3 py-2.5 border border-emerald-500/10">
                  <p className="text-sm font-medium text-zinc-200">{w.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{w.description}</p>
                </div>
              ))}
              {eveningReview.biggestWins.length === 0 && (
                <p className="text-sm text-zinc-500 py-2">No big wins recorded today.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Biggest Mistakes */}
      <motion.div variants={staggerItem}>
        <Card className="glass-card glass-glow-edge card-glow">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium text-zinc-200 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-400" /> Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {eveningReview.biggestMistakes.map((m, i) => (
                <div key={i} className="rounded-lg bg-red-500/[0.05] px-3 py-2.5 border border-red-500/10">
                  <p className="text-sm font-medium text-zinc-200">{m.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{m.description}</p>
                </div>
              ))}
              {eveningReview.biggestMistakes.length === 0 && (
                <p className="text-sm text-zinc-500 py-2">Nothing to flag today — nice work!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Mood Analysis */}
      {eveningReview.moodAnalysis && (
        <motion.div variants={staggerItem}>
          <Card className="glass-card glass-glow-edge card-glow">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-zinc-200 mb-2">Mood Analysis</p>
              <div className="flex items-center gap-3">
                {eveningReview.moodAnalysis.mood && (
                  <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    Mood: {eveningReview.moodAnalysis.mood}/10
                  </Badge>
                )}
                <Badge variant="outline" className={cn(
                  eveningReview.moodAnalysis.trend === 'improving' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                  eveningReview.moodAnalysis.trend === 'declining' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                  'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
                )}>
                  Trend: {eveningReview.moodAnalysis.trend}
                </Badge>
              </div>
              <p className="text-xs text-zinc-500 mt-2">{eveningReview.moodAnalysis.insight}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Distractions */}
      {eveningReview.distractions.length > 0 && (
        <motion.div variants={staggerItem}>
          <Card className="glass-card glass-glow-edge card-glow">
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400" /> Distractions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {eveningReview.distractions.map((d, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg bg-yellow-500/[0.04] px-3 py-2 border border-yellow-500/10">
                    <span className="text-sm font-medium text-zinc-200">{d.source}</span>
                    <Badge variant="outline" className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30 shrink-0">
                      {d.minutes}min
                    </Badge>
                    <p className="text-xs text-zinc-500 flex-1">{d.suggestion}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tomorrow Recommendations */}
      <motion.div variants={staggerItem}>
        <Card className="glass-card glass-glow-edge card-glow">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium text-zinc-200 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-emerald-400" /> Tomorrow&apos;s Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
              {eveningReview.tomorrowRecommendations.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                  <ArrowRight className="h-3 w-3 text-emerald-400 shrink-0" />
                  {r}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Refresh */}
      <motion.div variants={staggerItem} className="flex justify-center">
        <Button
          onClick={fetchReview}
          variant="outline"
          size="sm"
          className="text-zinc-400 border-white/[0.06] hover:text-zinc-200 hover:bg-white/[0.04]"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh Review
        </Button>
      </motion.div>
    </motion.div>
  );
});
