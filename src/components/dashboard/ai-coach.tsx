'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Sun,
  Moon,
  Sunrise,
  Sunset,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Play,
  BookOpen,
  Target,
  AlertCircle,
  Send,
  Loader2,
  RefreshCw,
  ChevronDown,
  Brain,
  MessageSquare,
  Clock,
  BarChart3,
  Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import { fadeInUp } from '@/lib/animations';
import type { CoachData } from '@/types';

function getGreetingIcon(hour: number) {
  if (hour < 5) return { Icon: Moon, color: 'text-indigo-300/80', label: 'midnight' };
  if (hour < 12) return { Icon: Sunrise, color: 'text-amber-400', label: 'morning' };
  if (hour < 17) return { Icon: Sun, color: 'text-amber-300/80', label: 'afternoon' };
  if (hour < 21) return { Icon: Sunset, color: 'text-orange-400/80', label: 'evening' };
  return { Icon: Moon, color: 'text-indigo-300/80', label: 'night' };
}

// ---- ChangeBadge (React.memo) ----
const ChangeBadge = React.memo(function ChangeBadge({ today, yesterday }: { today: number; yesterday: number }) {
  if (yesterday === 0 && today === 0) {
    return (
      <div className="flex items-center gap-1 rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-zinc-500" aria-label="No data to compare">
        <Minus className="h-2.5 w-2.5" aria-hidden="true" />
        No data
      </div>
    );
  }
  if (yesterday === 0 && today > 0) {
    return (
      <div className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400" aria-label="Fresh start — first day of tracking">
        <TrendingUp className="h-2.5 w-2.5" aria-hidden="true" />
        Fresh start
      </div>
    );
  }
  const diff = today - yesterday;
  const pct = Math.round((diff / yesterday) * 100);
  if (diff > 0) {
    return (
      <div className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400" aria-label={`${pct}% increase vs yesterday`}>
        <TrendingUp className="h-2.5 w-2.5" aria-hidden="true" />
        +{pct}% vs yesterday
      </div>
    );
  }
  if (diff < 0) {
    return (
      <div className="flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-400" aria-label={`${pct}% decrease vs yesterday`}>
        <TrendingDown className="h-2.5 w-2.5" aria-hidden="true" />
        {pct}% vs yesterday
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-zinc-500" aria-label="Same as yesterday">
      <Minus className="h-2.5 w-2.5" aria-hidden="true" />
      Same as yesterday
    </div>
  );
});

function parseRecommendationAction(text: string): 'timer' | 'reflection' | 'mission' | null {
  const lower = text.toLowerCase();
  if (lower.includes('reflect') || lower.includes('reflection')) return 'reflection';
  if (lower.includes('mission')) return 'mission';
  if (lower.includes('session') || lower.includes('focus') || lower.includes('streak')) return 'timer';
  return null;
}

export function AiCoach() {
  const coach = useAppStore(s => s.coach);
  const setCoach = useAppStore(s => s.setCoach);
  const setView = useAppStore(s => s.setView);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<'briefing' | 'morning' | 'night'>('briefing');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContent, setAiContent] = useState<string | null>(null);
  const [askQuestion, setAskQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'coach'; content: string }>>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const fetchCoach = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/coach');
      if (!res.ok) throw new Error('Failed');
      const data = (await res.json()) as CoachData;
      setCoach(data);
      // Set the active AI content based on what came back
      if (data.aiMorningPlan) {
        setAiContent(data.aiMorningPlan);
        setActiveTab('morning');
      } else if (data.aiNightReview) {
        setAiContent(data.aiNightReview);
        setActiveTab('night');
      } else if (data.aiBriefing) {
        setAiContent(data.aiBriefing);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [setCoach]);

  useEffect(() => {
    fetchCoach();
  }, [fetchCoach]);

  // Fetch AI content for a specific tab
  const fetchAiContent = useCallback(async (tab: 'briefing' | 'morning' | 'night') => {
    // If we already have the content from the initial fetch, don't re-fetch
    if (coach) {
      if (tab === 'morning' && coach.aiMorningPlan) {
        setAiContent(coach.aiMorningPlan);
        setActiveTab(tab);
        return;
      }
      if (tab === 'night' && coach.aiNightReview) {
        setAiContent(coach.aiNightReview);
        setActiveTab(tab);
        return;
      }
      if (tab === 'briefing' && coach.aiBriefing) {
        setAiContent(coach.aiBriefing);
        setActiveTab(tab);
        return;
      }
    }

    setAiLoading(true);
    try {
      const modeMap = { briefing: 'briefing', morning: 'morning_plan', night: 'night_review' };
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: modeMap[tab] }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setAiContent(data.response);
      setActiveTab(tab);
    } catch {
      setAiContent(null);
    } finally {
      setAiLoading(false);
    }
  }, [coach]);

  // Send a follow-up question
  const handleAskQuestion = useCallback(async () => {
    if (!askQuestion.trim() || chatLoading) return;

    const question = askQuestion.trim();
    setAskQuestion('');
    setChatLoading(true);
    setChatHistory(prev => [...prev, { role: 'user', content: question }]);

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: 'coach', content: data.response }]);
    } catch {
      setChatHistory(prev => [...prev, { role: 'coach', content: 'Sorry, I couldn\'t process your question. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  }, [askQuestion, chatLoading]);

  const hour = new Date().getHours();
  const { Icon: GreetingIcon, color: greetingColor } = getGreetingIcon(hour);

  if (loading) {
    return (
      <div className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02] flex w-full flex-col" aria-label="Loading AI coach">
        <div className="p-5 pb-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">AI Daily Coach</h3>
        </div>
        <div className="flex flex-1 flex-col gap-3 px-5 pb-5">
          <div className="h-7 w-3/4 animate-pulse rounded bg-white/[0.04]" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-16 animate-pulse rounded-lg bg-white/[0.04]" />
            <div className="h-16 animate-pulse rounded-lg bg-white/[0.04]" />
          </div>
          <div className="h-20 animate-pulse rounded-lg bg-white/[0.04]" />
        </div>
      </div>
    );
  }

  if (error || !coach) {
    return (
      <div className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02] w-full" role="alert" aria-live="polite">
        <div className="p-5 pb-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">AI Daily Coach</h3>
        </div>
        <div className="flex flex-col items-center px-5 pb-6 pt-2 text-center">
          <AlertCircle className="mb-3 h-7 w-7 text-zinc-700" aria-hidden="true" />
          <p className="mb-3 text-sm text-zinc-500">Couldn&apos;t load today&apos;s briefing.</p>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-zinc-400" onClick={fetchCoach} aria-label="Try loading coach again">
            Try again
          </Button>
        </div>
      </div>
    );
  }

  // Empty state — no sessions yet
  if (coach.todayMinutes === 0 && coach.weekMinutes === 0 && coach.streak === 0) {
    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02] flex w-full flex-col"
      >
        <div className="p-5 pb-3">
          <div className="flex items-center gap-2">
            <GreetingIcon className={cn('h-3.5 w-3.5', greetingColor)} aria-hidden="true" />
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">AI Daily Coach</h3>
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-5 pb-6 pt-2 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/[0.06]" aria-hidden="true">
            <Sparkles className="h-6 w-6 text-emerald-400/70" />
          </div>
          <p className="mb-1 text-sm font-medium text-zinc-200">
            {coach.greeting}, {coach.userName}.
          </p>
          <p className="mb-4 max-w-xs text-xs leading-relaxed text-zinc-500">
            Start your first focus session and I&apos;ll craft a personalized daily briefing from your real data.
          </p>
          <Button
            onClick={() => setView('timer')}
            className="btn-glow h-9 gap-2 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500"
            size="sm"
            aria-label="Start your first focus session"
          >
            <Play className="h-3.5 w-3.5" aria-hidden="true" />
            Start your day
          </Button>
        </div>
      </motion.div>
    );
  }

  // Determine which AI content to show initially
  const hasAiContent = aiContent || coach.aiBriefing || coach.aiMorningPlan || coach.aiNightReview;

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02] flex w-full flex-col"
    >
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GreetingIcon className={cn('h-3.5 w-3.5', greetingColor)} aria-hidden="true" />
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">AI Daily Coach</h3>
          </div>
          <div className="flex items-center gap-2">
            {coach.coachPersonality && (
              <span className="text-[10px] text-zinc-600" title={`Coach personality: ${coach.coachPersonality}`}>
                {coach.coachPersonality === 'strict' ? '🎯' : coach.coachPersonality === 'data_nerd' ? '📊' : '🌟'}
              </span>
            )}
            <span className="text-[10px] text-emerald-400/60" aria-live="polite">
              {coach.aiProvider ? `AI` : 'Live'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5">
        {/* Greeting + name */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.4 }}
        >
          <p className="text-base font-medium text-zinc-100">
            {coach.greeting}, <span className="text-emerald-400">{coach.userName}</span>.
          </p>
        </motion.div>

        {/* Today vs Yesterday comparison */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.4 }}
          className="mt-3 grid grid-cols-2 gap-2"
        >
          <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Today</p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-semibold tabular-nums text-zinc-50" aria-live="polite">{coach.todayMinutes}</span>
              <span className="text-[10px] text-zinc-600">min</span>
            </div>
          </div>
          <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Yesterday</p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-semibold tabular-nums text-zinc-400">{coach.yesterdayMinutes}</span>
              <span className="text-[10px] text-zinc-600">min</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18, duration: 0.3 }}
          className="mt-2"
        >
          <ChangeBadge today={coach.todayMinutes} yesterday={coach.yesterdayMinutes} />
        </motion.div>

        {/* AI Content Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.22, duration: 0.3 }}
          className="mt-4"
        >
          <Tabs value={activeTab} onValueChange={(v) => fetchAiContent(v as 'briefing' | 'morning' | 'night')}>
            <TabsList className="h-7 w-full bg-white/[0.04] p-0">
              <TabsTrigger
                value="briefing"
                className="h-7 flex-1 gap-1 text-[10px] data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400"
              >
                <Sparkles className="h-2.5 w-2.5" />
                Briefing
              </TabsTrigger>
              <TabsTrigger
                value="morning"
                className="h-7 flex-1 gap-1 text-[10px] data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400"
              >
                <Sunrise className="h-2.5 w-2.5" />
                Morning
              </TabsTrigger>
              <TabsTrigger
                value="night"
                className="h-7 flex-1 gap-1 text-[10px] data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400"
              >
                <Moon className="h-2.5 w-2.5" />
                Night
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-2">
              {aiLoading ? (
                <div className="flex items-center justify-center rounded-lg border border-emerald-500/[0.08] bg-emerald-500/[0.03] p-4">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-400/60" />
                  <span className="ml-2 text-[11px] text-zinc-400">AI is thinking...</span>
                </div>
              ) : hasAiContent && aiContent ? (
                <div className="rounded-lg border border-emerald-500/[0.08] bg-emerald-500/[0.03] p-3">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <Brain className="h-3 w-3 text-emerald-400/80" aria-hidden="true" />
                    <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-400/80">
                      AI Insight
                    </span>
                  </div>
                  <div className="text-[12px] leading-relaxed text-zinc-300 max-h-64 overflow-y-auto coach-scroll" aria-live="polite">
                    {aiContent}
                  </div>
                </div>
              ) : (
                /* Recommendations list (fallback) */
                <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <Lightbulb className="h-3 w-3 text-zinc-400/60" aria-hidden="true" />
                    <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                      Recommendations
                    </span>
                  </div>
                  <ul className="space-y-2" aria-label="Coach recommendations">
                    {coach.recommendations.map((rec, i) => {
                      const action = parseRecommendationAction(rec);
                      return (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 + i * 0.07, duration: 0.4 }}
                          className="group flex gap-2"
                        >
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400/60 group-hover:bg-emerald-400" aria-hidden="true" />
                          <button
                            type="button"
                            onClick={() => action && setView(action)}
                            className={cn(
                              'flex-1 text-left text-[12px] leading-relaxed text-zinc-400 transition-colors',
                              action ? 'cursor-pointer hover:text-zinc-200' : 'cursor-default'
                            )}
                            aria-label={action ? `Go to ${action} view` : undefined}
                          >
                            {rec}
                            {action && (
                              <span className="ml-1 inline-flex items-center gap-0.5 text-[10px] text-emerald-400/0 transition-colors group-hover:text-emerald-400/80" aria-hidden="true">
                                →
                              </span>
                            )}
                          </button>
                        </motion.li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="mt-3 rounded-lg border border-white/[0.04] bg-white/[0.02] p-3"
        >
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BarChart3 className="h-3 w-3 text-zinc-400/60" aria-hidden="true" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                Summary
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 text-zinc-500 hover:text-zinc-300"
              onClick={fetchCoach}
              aria-label="Refresh coach data"
            >
              <RefreshCw className="h-3 w-3" aria-hidden="true" />
            </Button>
          </div>
          <p className="text-[11px] leading-relaxed text-zinc-400" aria-live="polite">{coach.summary}</p>
        </motion.div>

        {/* Ask the coach — follow-up questions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.3 }}
          className="mt-3"
        >
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                ref={chatInputRef}
                type="text"
                value={askQuestion}
                onChange={(e) => setAskQuestion(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAskQuestion(); }}
                placeholder="Ask the coach..."
                className="h-7 w-full rounded-md border border-white/[0.06] bg-white/[0.02] pl-3 pr-7 text-[11px] text-zinc-300 placeholder:text-zinc-600 focus:border-emerald-500/30 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                aria-label="Ask the AI coach a question"
                disabled={chatLoading}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-7 w-7 p-0 text-zinc-500 hover:text-emerald-400"
                onClick={handleAskQuestion}
                disabled={chatLoading || !askQuestion.trim()}
                aria-label="Send question to coach"
              >
                {chatLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
              </Button>
            </div>
          </div>

          {/* Chat history */}
          {chatHistory.length > 0 && (
            <div className="mt-2 max-h-48 overflow-y-auto coach-scroll space-y-2">
              {chatHistory.map((msg, i) => (
                <div key={i} className={cn(
                  'rounded-md p-2 text-[11px] leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-white/[0.04] text-zinc-400 ml-2'
                    : 'bg-emerald-500/[0.06] text-zinc-300 border border-emerald-500/[0.06] mr-2'
                )}>
                  <div className="flex items-start gap-1.5">
                    {msg.role === 'coach' && <Brain className="h-2.5 w-2.5 mt-0.5 text-emerald-400/70 shrink-0" />}
                    <span>{msg.content}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.3 }}
          className="mt-3 flex flex-wrap gap-2"
        >
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 border-white/[0.06] bg-white/[0.02] text-[11px] text-zinc-300 hover:bg-white/[0.04] hover:text-zinc-100"
            onClick={() => setView('timer')}
            aria-label="Start a focus session"
          >
            <Play className="h-3 w-3" aria-hidden="true" />
            Start focus
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 border-white/[0.06] bg-white/[0.02] text-[11px] text-zinc-300 hover:bg-white/[0.04] hover:text-zinc-100"
            onClick={() => setView('mission')}
            aria-label="Go to missions"
          >
            <Target className="h-3 w-3" aria-hidden="true" />
            Mission
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 border-white/[0.06] bg-white/[0.02] text-[11px] text-zinc-300 hover:bg-white/[0.04] hover:text-zinc-100"
            onClick={() => setView('reflection')}
            aria-label="Go to reflection"
          >
            <BookOpen className="h-3 w-3" aria-hidden="true" />
            Reflect
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
