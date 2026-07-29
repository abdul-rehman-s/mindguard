'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Coffee, CalendarCheck, ShieldOff, ArrowRight, Heart, Target, Zap, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { staggerContainer, staggerItem } from '@/lib/animations';
import type { AIRecommendation } from '@/types';

const typeIcons: Record<string, typeof Lightbulb> = {
  break: Coffee,
  schedule: CalendarCheck,
  avoid: ShieldOff,
  continue: ArrowRight,
  habit: Heart,
  health: Zap,
  focus: Target,
};

const urgencyColors: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

export const RecommendationsPanel = React.memo(function RecommendationsPanel() {
  const aiRecommendations = useAppStore(s => s.aiRecommendations);
  const setAIRecommendations = useAppStore(s => s.setAIRecommendations);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/assistant/recommendations');
      if (!res.ok) throw new Error('Failed to fetch recommendations');
      const data: AIRecommendation[] = await res.json();
      setAIRecommendations(data);
    } catch {
      setError('Failed to generate recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [setAIRecommendations]);

  useEffect(() => {
    if (aiRecommendations.length === 0) fetchRecommendations();
  }, [aiRecommendations, fetchRecommendations]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="glass-card glass-glow-edge card-glow">
        <CardContent className="flex flex-col items-center gap-3 py-8">
          <AlertTriangle className="h-8 w-8 text-red-400" />
          <p className="text-sm text-zinc-400">{error}</p>
          <Button onClick={fetchRecommendations} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1.5" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (aiRecommendations.length === 0) return null;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      <motion.div variants={staggerItem}>
        <div className="flex items-center gap-2 mb-1">
          <Lightbulb className="h-4 w-4 text-emerald-400" />
          <p className="text-sm font-medium text-zinc-300">
            {aiRecommendations.length} personalized recommendations
          </p>
        </div>
      </motion.div>

      {aiRecommendations.map((rec) => {
        const Icon = typeIcons[rec.type] || Lightbulb;
        const urgencyStyle = urgencyColors[rec.urgency];

        return (
          <motion.div key={rec.id} variants={staggerItem}>
            <Card className="glass-card glass-glow-edge card-glow lift-hover">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 shrink-0 mt-0.5">
                    <Icon className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-zinc-200">{rec.title}</p>
                      <Badge variant="outline" className={cn('text-xs shrink-0', urgencyStyle)}>
                        {rec.urgency}
                      </Badge>
                      {rec.dataBased && (
                        <Badge variant="outline" className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shrink-0">
                          data-based
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed">{rec.description}</p>
                    {rec.supportingData && (
                      <p className="text-xs text-zinc-600 mt-1.5 italic">Data: {rec.supportingData}</p>
                    )}
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                      <ArrowRight className="h-3 w-3 shrink-0" />
                      {rec.action}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}

      {/* Refresh */}
      <motion.div variants={staggerItem} className="flex justify-center">
        <Button
          onClick={fetchRecommendations}
          variant="outline"
          size="sm"
          className="text-zinc-400 border-white/[0.06] hover:text-zinc-200 hover:bg-white/[0.04]"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh Recommendations
        </Button>
      </motion.div>
    </motion.div>
  );
});
