'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Target, Clock, Flame, Loader2, RefreshCw } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { staggerContainer, staggerItem } from '@/lib/animations';
import type { PredictionResult } from '@/types';

const riskColors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  low: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: '✓' },
  medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', icon: '~' },
  high: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', icon: '!' },
};

export const PredictionsPanel = React.memo(function PredictionsPanel() {
  const predictions = useAppStore(s => s.predictions);
  const setPredictions = useAppStore(s => s.setPredictions);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPredictions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/assistant/predict');
      if (!res.ok) throw new Error('Failed to fetch predictions');
      const data: PredictionResult = await res.json();
      setPredictions(data);
    } catch (err) {
      setError('Failed to generate predictions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [setPredictions]);

  useEffect(() => {
    if (!predictions) fetchPredictions();
  }, [predictions, fetchPredictions]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-xl" />
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
          <Button onClick={fetchPredictions} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1.5" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!predictions) return null;

  const burnoutStyle = riskColors[predictions.burnoutRisk.level];
  const streakStyle = riskColors[predictions.streakRisk.riskLevel];

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      {/* Burnout Risk */}
      <motion.div variants={staggerItem}>
        <Card className="glass-card glass-glow-edge card-glow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', burnoutStyle.bg)}>
                <AlertTriangle className={cn('h-4 w-4', burnoutStyle.text)} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-200">Burnout Risk</p>
                <Badge variant="outline" className={cn('text-xs mt-0.5', burnoutStyle.bg, burnoutStyle.text, burnoutStyle.border)}>
                  {predictions.burnoutRisk.level}
                </Badge>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-zinc-100">{Math.round(predictions.burnoutRisk.probability * 100)}%</span>
                <p className="text-xs text-zinc-500">probability</p>
              </div>
            </div>
            <Progress value={predictions.burnoutRisk.probability * 100} className={cn(
              'h-2 bg-zinc-800',
              predictions.burnoutRisk.level === 'high' ? '[&>div]:bg-red-400' :
              predictions.burnoutRisk.level === 'medium' ? '[&>div]:bg-yellow-400' : '[&>div]:bg-emerald-400'
            )} />
            <div className="mt-2 flex flex-col gap-1">
              {predictions.burnoutRisk.factors.map((f, i) => (
                <p key={i} className="text-xs text-zinc-500">• {f}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Focus Score Prediction */}
      <motion.div variants={staggerItem}>
        <Card className="glass-card glass-glow-edge card-glow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">Predicted Focus Score (Tomorrow)</p>
                <p className="text-xs text-zinc-500">Confidence: {Math.round(predictions.focusScoreTomorrow.confidence * 100)}%</p>
              </div>
              <div className="text-right ml-auto">
                <span className="text-lg font-bold text-emerald-400">{predictions.focusScoreTomorrow.predicted}</span>
              </div>
            </div>
            <Progress value={predictions.focusScoreTomorrow.predicted} className="h-2 bg-zinc-800 [&>div]:bg-emerald-400" />
            <div className="mt-2 flex flex-col gap-1">
              {predictions.focusScoreTomorrow.factors.map((f, i) => (
                <p key={i} className="text-xs text-zinc-500">• {f}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Streak Risk */}
      <motion.div variants={staggerItem}>
        <Card className="glass-card glass-glow-edge card-glow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', streakStyle.bg)}>
                <Flame className={cn('h-4 w-4', streakStyle.text)} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-200">Streak Risk</p>
                <Badge variant="outline" className={cn('text-xs mt-0.5', streakStyle.bg, streakStyle.text, streakStyle.border)}>
                  {predictions.streakRisk.riskLevel}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500">{predictions.streakRisk.daysToBreak === 999 ? 'No streak' : predictions.streakRisk.daysToBreak === 0 ? 'Could break today' : `${predictions.streakRisk.daysToBreak} days to break`}</p>
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-2 bg-zinc-900/50 rounded-lg p-2 border border-white/[0.04]">
              {predictions.streakRisk.suggestion}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Mission Completion */}
      {predictions.missionCompletionProbability.length > 0 && (
        <motion.div variants={staggerItem}>
          <Card className="glass-card glass-glow-edge card-glow">
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-400" /> Mission Completion Probability
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
                {predictions.missionCompletionProbability.map((m) => (
                  <div key={m.missionId} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-zinc-200 truncate">{m.title}</p>
                      <span className="text-sm font-bold text-emerald-400">{Math.round(m.probability * 100)}%</span>
                    </div>
                    <Progress value={m.probability * 100} className="h-1.5 bg-zinc-800 [&>div]:bg-emerald-400" />
                    <div className="flex flex-col gap-0.5">
                      {m.factors.map((f, i) => (
                        <p key={i} className="text-xs text-zinc-500">• {f}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Best Work Hours */}
      {predictions.bestWorkHours.length > 0 && (
        <motion.div variants={staggerItem}>
          <Card className="glass-card glass-glow-edge card-glow">
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-400" /> Best Work Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex flex-col gap-2">
                {predictions.bestWorkHours.map((h) => {
                  const hourLabel = h.hour < 12 ? `${h.hour} AM` : h.hour === 12 ? '12 PM' : `${h.hour - 12} PM`;
                  return (
                    <div key={h.hour} className="flex items-center gap-3 rounded-lg bg-zinc-900/50 px-3 py-2 border border-white/[0.04]">
                      <span className="text-sm font-medium text-emerald-400 shrink-0">{hourLabel}</span>
                      <div className="flex-1">
                        <Progress value={h.confidence * 100} className="h-1.5 bg-zinc-800 [&>div]:bg-emerald-400" />
                      </div>
                      <span className="text-xs text-zinc-500 shrink-0">{h.productiveMinutes} min</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Weekly Productivity */}
      <motion.div variants={staggerItem}>
        <Card className="glass-card glass-glow-edge card-glow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-200">Weekly Productivity Prediction</p>
                <p className="text-xs text-zinc-500">
                  Predicted: {predictions.weeklyProductivity.predictedMinutes} min • Trend: {predictions.weeklyProductivity.trend} • Confidence: {Math.round(predictions.weeklyProductivity.confidence * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Refresh */}
      <motion.div variants={staggerItem} className="flex justify-center">
        <Button
          onClick={fetchPredictions}
          variant="outline"
          size="sm"
          className="text-zinc-400 border-white/[0.06] hover:text-zinc-200 hover:bg-white/[0.04]"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh Predictions
        </Button>
      </motion.div>
    </motion.div>
  );
});
