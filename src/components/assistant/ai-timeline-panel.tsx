'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Clock, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { staggerContainer, staggerItem } from '@/lib/animations';
import type { AITimelineEntry } from '@/types';

const categoryColors: Record<string, string> = {
  productive: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  distracted: 'bg-red-500/20 text-red-400 border-red-500/30',
  self_care: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  communication: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  learning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  deep_work: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  creative: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  planning: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

export const AITimelinePanel = React.memo(function AITimelinePanel() {
  const aiTimeline = useAppStore(s => s.aiTimeline);
  const setAITimeline = useAppStore(s => s.setAITimeline);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/assistant/timeline');
      if (!res.ok) throw new Error('Failed to fetch AI timeline');
      const data: AITimelineEntry[] = await res.json();
      setAITimeline(data);
    } catch {
      setError('Failed to generate AI timeline. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [setAITimeline]);

  useEffect(() => {
    if (aiTimeline.length === 0) fetchTimeline();
  }, [aiTimeline, fetchTimeline]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full rounded-xl" />
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
          <Button onClick={fetchTimeline} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1.5" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (aiTimeline.length === 0) {
    return (
      <Card className="glass-card glass-glow-edge card-glow">
        <CardContent className="flex flex-col items-center gap-3 py-8">
          <Clock className="h-8 w-8 text-zinc-500" />
          <p className="text-sm text-zinc-400">No timeline entries for today yet.</p>
          <p className="text-xs text-zinc-500">Start tracking your activities to see AI-generated timeline stories.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-0">
      {/* Timeline Header */}
      <motion.div variants={staggerItem} className="mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-emerald-400" />
          <p className="text-sm font-medium text-zinc-300">
            {aiTimeline.length} timeline entries for today
          </p>
        </div>
      </motion.div>

      {/* Vertical Timeline */}
      <div className="relative pl-8">
        {/* Connection line */}
        <div className="absolute left-3 top-0 bottom-0 w-[2px] bg-gradient-to-b from-emerald-500/30 via-white/[0.06] to-white/[0.03]" />

        {aiTimeline.map((entry, i) => {
          const isLast = i === aiTimeline.length - 1;
          const catColor = categoryColors[entry.category || ''] || 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';

          return (
            <motion.div
              key={`${entry.time}-${i}`}
              variants={staggerItem}
              className="relative mb-4"
            >
              {/* Dot on timeline */}
              <div className="absolute -left-8 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950 border-[2px] border-emerald-500/30">
                <span className="text-[10px]">{entry.icon || '•'}</span>
              </div>

              {/* Card */}
              <Card className="glass-card glass-glow-edge card-glow">
                <CardContent className="p-3.5">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-emerald-400">{entry.time}</span>
                        {entry.category && (
                          <Badge variant="outline" className={cn('text-xs shrink-0', catColor)}>
                            {entry.category}
                          </Badge>
                        )}
                        {entry.duration && (
                          <Badge variant="outline" className="text-xs bg-zinc-500/20 text-zinc-400 border-zinc-500/30 shrink-0">
                            {entry.duration} min
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-zinc-200">{entry.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{entry.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next entry connector */}
              {!isLast && entry.nextEntry && (
                <div className="flex items-center gap-1.5 ml-2 mt-1 mb-1">
                  <div className="h-[2px] w-3 bg-emerald-500/20" />
                  <span className="text-[10px] text-zinc-600">→ {entry.nextEntry}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Refresh */}
      <motion.div variants={staggerItem} className="flex justify-center mt-4">
        <Button
          onClick={fetchTimeline}
          variant="outline"
          size="sm"
          className="text-zinc-400 border-white/[0.06] hover:text-zinc-200 hover:bg-white/[0.04]"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh Timeline
        </Button>
      </motion.div>
    </motion.div>
  );
});
