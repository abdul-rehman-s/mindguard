'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, MessageSquare, Sunrise, Sunset, TrendingUp, Lightbulb, Clock, Brain } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { ChatPanel } from './chat-panel';
import { MorningPlanPanel } from './morning-plan-panel';
import { EveningReviewPanel } from './evening-review-panel';
import { PredictionsPanel } from './predictions-panel';
import { RecommendationsPanel } from './recommendations-panel';
import { AITimelinePanel } from './ai-timeline-panel';
import { MemoriesPanel } from './memories-panel';

type AssistantTabId = 'chat' | 'plan' | 'review' | 'predictions' | 'recommendations' | 'timeline' | 'memories';

const tabs: { id: AssistantTabId; label: string; icon: typeof MessageSquare }[] = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'plan', label: 'Morning Plan', icon: Sunrise },
  { id: 'review', label: 'Evening Review', icon: Sunset },
  { id: 'predictions', label: 'Predictions', icon: TrendingUp },
  { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
  { id: 'timeline', label: 'AI Timeline', icon: Clock },
  { id: 'memories', label: 'Memories', icon: Brain },
];

export function AssistantView() {
  const assistantView = useAppStore(s => s.assistantView);
  const setAssistantView = useAppStore(s => s.setAssistantView);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="px-4 sm:px-6 pb-8">
      {/* Header */}
      <motion.div variants={staggerItem} className="mb-6 pt-2">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10">
            <Bot className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-[1.65rem] font-semibold tracking-[-0.02em] text-zinc-100">
              AI Assistant
            </h2>
            <p className="mt-0.5 text-sm text-zinc-500">
              Your personal AI operating system
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div variants={staggerItem} className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map(tab => {
            const isActive = assistantView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAssistantView(tab.id)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap',
                  'outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
                  isActive
                    ? 'bg-emerald-500/[0.12] text-emerald-400 border border-emerald-500/20'
                    : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200 border border-transparent'
                )}
              >
                <tab.icon className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={assistantView}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          {assistantView === 'chat' && <ChatPanel />}
          {assistantView === 'plan' && <MorningPlanPanel />}
          {assistantView === 'review' && <EveningReviewPanel />}
          {assistantView === 'predictions' && <PredictionsPanel />}
          {assistantView === 'recommendations' && <RecommendationsPanel />}
          {assistantView === 'timeline' && <AITimelinePanel />}
          {assistantView === 'memories' && <MemoriesPanel />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
