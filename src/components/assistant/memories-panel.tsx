'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Brain, Search, Sparkles, Loader2, RefreshCw, AlertTriangle, Plus, Filter } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { staggerContainer, staggerItem } from '@/lib/animations';
import type { MemoryItem, MemoryType } from '@/types';

const memoryTypeColors: Record<string, string> = {
  habit: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  pattern: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  preference: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  insight: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  summary: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  conversation: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  weekly_report: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  streak: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  distraction_pattern: 'bg-red-500/20 text-red-400 border-red-500/30',
  best_hours: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  work_preference: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  manual: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

const memoryTypeLabels: Record<string, string> = {
  habit: 'Habit',
  pattern: 'Pattern',
  preference: 'Preference',
  insight: 'Insight',
  summary: 'Summary',
  conversation: 'Conversation',
  weekly_report: 'Weekly Report',
  streak: 'Streak',
  distraction_pattern: 'Distraction Pattern',
  best_hours: 'Best Hours',
  work_preference: 'Work Preference',
  manual: 'Manual',
};

const allTypes: MemoryType[] = ['habit', 'pattern', 'preference', 'insight', 'summary', 'weekly_report', 'streak', 'distraction_pattern', 'best_hours', 'work_preference'];

export const MemoriesPanel = React.memo(function MemoriesPanel() {
  const memories = useAppStore(s => s.memories);
  const setMemories = useAppStore(s => s.setMemories);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState<MemoryType | 'all'>('all');
  const [searchResults, setSearchResults] = useState<MemoryItem[]>([]);

  const fetchMemories = useCallback(async (type?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = type ? `/api/memories?type=${type}` : '/api/memories';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch memories');
      const data = await res.json();
      setMemories(data);
    } catch (err) {
      setError('Failed to load memories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [setMemories]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/memories/search?q=${encodeURIComponent(searchQuery.trim())}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/memories/generate', { method: 'POST' });
      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      // Refresh memories after generation
      await fetchMemories(activeType === 'all' ? undefined : activeType);
    } catch (err) {
      // Silent fail
    } finally {
      setIsGenerating(false);
    }
  }, [fetchMemories, activeType]);

  useEffect(() => {
    if (memories.length === 0) fetchMemories();
  }, [memories, fetchMemories]);

  // Filter memories by active type
  const displayMemories = useMemo(() => {
    const source = searchResults.length > 0 ? searchResults : memories;
    if (activeType === 'all') return source;
    return source.filter(m => m.type === activeType);
  }, [memories, searchResults, activeType]);

  if (isLoading && memories.length === 0) {
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
          <Button onClick={() => fetchMemories()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1.5" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      {/* Header with Generate Button */}
      <motion.div variants={staggerItem}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-emerald-400" />
            <p className="text-sm font-medium text-zinc-300">
              {displayMemories.length} memories stored
            </p>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            {isGenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            )}
            Generate
          </Button>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div variants={staggerItem}>
        <div className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search memories..."
            className="bg-zinc-900/50 border-white/[0.06] text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-400/50"
          />
          <Button
            onClick={handleSearch}
            disabled={!searchQuery.trim()}
            variant="outline"
            size="icon"
            className="border-white/[0.06] hover:bg-white/[0.04] shrink-0"
          >
            <Search className="h-4 w-4 text-zinc-400" />
          </Button>
        </div>
      </motion.div>

      {/* Type Filter */}
      <motion.div variants={staggerItem}>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveType('all')}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap',
              activeType === 'all'
                ? 'bg-emerald-500/[0.12] text-emerald-400 border border-emerald-500/20'
                : 'text-zinc-400 hover:bg-white/[0.04] border border-transparent'
            )}
          >
            All
          </button>
          {allTypes.map(type => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap',
                activeType === type
                  ? cn(memoryTypeColors[type])
                  : 'text-zinc-500 hover:bg-white/[0.04] border border-transparent'
              )}
            >
              {memoryTypeLabels[type]}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Memory Cards */}
      {displayMemories.length === 0 ? (
        <motion.div variants={staggerItem}>
          <Card className="glass-card glass-glow-edge card-glow">
            <CardContent className="flex flex-col items-center gap-3 py-8">
              <Brain className="h-8 w-8 text-zinc-500" />
              <p className="text-sm text-zinc-400">No memories yet.</p>
              <p className="text-xs text-zinc-500">Click "Generate" to auto-create memories from your data.</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto">
          {displayMemories.map((memory) => (
            <motion.div key={memory.id} variants={staggerItem}>
              <Card className="glass-card glass-glow-edge card-glow">
                <CardContent className="p-3.5">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className={cn('text-xs shrink-0 mt-0.5', memoryTypeColors[memory.type] || 'bg-zinc-500/20 text-zinc-400')}>
                      {memoryTypeLabels[memory.type] || memory.type}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-200 leading-relaxed">{memory.content}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-zinc-600">Importance</span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                              <div
                                key={n}
                                className={cn(
                                  'h-1.5 w-1.5 rounded-full',
                                  n <= memory.importance ? 'bg-emerald-400' : 'bg-zinc-700'
                                )}
                              />
                            ))}
                          </div>
                        </div>
                        {memory.source && (
                          <Badge variant="outline" className="text-[10px] bg-zinc-500/20 text-zinc-500 border-zinc-500/30">
                            {memory.source}
                          </Badge>
                        )}
                        <span className="text-[10px] text-zinc-600">
                          Score: {memory.score.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Refresh */}
      <motion.div variants={staggerItem} className="flex justify-center">
        <Button
          onClick={() => fetchMemories(activeType === 'all' ? undefined : activeType)}
          variant="outline"
          size="sm"
          className="text-zinc-400 border-white/[0.06] hover:text-zinc-200 hover:bg-white/[0.04]"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh Memories
        </Button>
      </motion.div>
    </motion.div>
  );
});
