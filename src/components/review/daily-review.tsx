'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import {
  CalendarCheck,
  Target,
  Clock,
  Brain,
  Laptop,
  Eye,
  Trophy,
  Zap,
  Lightbulb,
  BookOpen,
  Loader2,
  AlertCircle,
  Award,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import type { DailyReviewData } from '@/types';

const EASE = [0.25, 0.1, 0.25, 1] as [number, number, number, number];

function AnimNum({ value, decimals = 0, className }: { value: number; decimals?: number; className?: string }) {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => (decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString()));
  const ref = useRef<HTMLSpanElement>(null);
  const init = useRef(false);
  useEffect(() => {
    if (!init.current) { init.current = true; return animate(mv, value, { duration: 1.2, ease: EASE }).stop; }
    return animate(mv, value, { duration: 0.6, ease: EASE }).stop;
  }, [value, mv]);
  useEffect(() => { const unsub = display.on('change', (v) => { if (ref.current) ref.current.textContent = v; }); return unsub; }, [display]);
  return <span ref={ref} className={className}>{decimals > 0 ? value.toFixed(decimals) : value}</span>;
}

function SectionCard({ icon: Icon, title, children, delay = 0 }: { icon: LucideIcon; title: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5, ease: EASE }}>
      <Card className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Icon className="h-3.5 w-3.5 text-zinc-500" />
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">{title}</h3>
          </div>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MiniStat({ label, value, unit, color }: { label: string; value: number | string; unit?: string; color?: string }) {
  return (
    <div className="flex flex-col">
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">{label}</p>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className={cn('text-lg font-bold tabular-nums', color || 'text-zinc-100')}>{typeof value === 'number' ? <AnimNum value={value} className={cn('text-lg font-bold tabular-nums', color || 'text-zinc-100')} /> : value}</span>
        {unit && <span className="text-[10px] text-zinc-600">{unit}</span>}
      </div>
    </div>
  );
}

// ---- Hourly Bar Chart ----
function ReviewHourlyChart({ data }: { data: { hour: number; minutes: number }[] }) {
  const maxVal = useMemo(() => Math.max(...data.map((d) => d.minutes), 1), [data]);
  const currentHour = new Date().getHours();
  return (
    <div className="flex items-end gap-[3px] h-24 sm:h-28">
      {data.map((d) => {
        const h = Math.max(2, (d.minutes / maxVal) * 100);
        const isNow = d.hour === currentHour;
        return (
          <div key={d.hour} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: d.hour * 0.015, duration: 0.4, ease: EASE }}
              className={cn(
                'w-full rounded-sm min-h-[2px]',
                isNow ? 'bg-gradient-to-t from-emerald-500 to-teal-400' : d.minutes > 0 ? 'bg-emerald-500/25' : 'bg-white/[0.03]'
              )}
            />
            {d.hour % 4 === 0 && <span className="text-[8px] text-zinc-700 tabular-nums">{d.hour}</span>}
          </div>
        );
      })}
    </div>
  );
}

export function DailyReview() {
  const { setReviewData, reviewData } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReview = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/daily-review');
      if (!res.ok) throw new Error('Failed');
      const data = (await res.json()) as DailyReviewData;
      setReviewData(data);
    } catch { setError('Failed to load daily review'); } finally { setLoading(false); }
  }, [setReviewData]);

  useEffect(() => { fetchReview(); }, [fetchReview]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
      </div>
    );
  }

  if (error || !reviewData) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <AlertCircle className="h-8 w-8 text-red-400/60" />
        <p className="text-sm text-zinc-400">{error || 'No data'}</p>
        <Button variant="ghost" size="sm" onClick={fetchReview}>Try again</Button>
      </div>
    );
  }

  const r = reviewData;
  const isEmpty = r.focusSummary.sessionCount === 0 && r.laptopSummary.totalMinutes === 0;

  if (isEmpty) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="app-grid-bg min-h-full -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03]">
          <CalendarCheck className="h-7 w-7 text-zinc-700" />
        </div>
        <p className="mb-1 text-base font-medium text-zinc-300">No activity recorded today</p>
        <p className="mb-4 text-sm text-zinc-500">Start a focus session to generate your daily review.</p>
        <Button onClick={() => useAppStore.getState().setView('timer')} className="btn-glow bg-gradient-to-b from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500">
          Start a session
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className="app-grid-bg min-h-full -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: EASE }} className="mb-8 flex flex-col items-center pt-2 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/10">
          <CalendarCheck className="h-7 w-7 text-emerald-400" />
        </div>
        <h1 className="heading-xl text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
          Daily <span className="gradient-text">Review</span>
        </h1>
        <p className="mt-2 max-w-md text-sm text-zinc-500">
          {new Date(r.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </motion.div>

      {/* Top metrics row */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ease: EASE }} className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02] p-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">Total Focus</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-50"><AnimNum value={r.focusSummary.totalMinutes} /> <span className="text-xs text-zinc-600">min</span></p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, ease: EASE }} className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02] p-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">Sessions</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-50"><AnimNum value={r.focusSummary.sessionCount} /></p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ease: EASE }} className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02] p-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">XP Earned</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-400"><AnimNum value={r.xpGained} /></p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, ease: EASE }} className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02] p-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">vs Week Avg</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            {r.weekComparison.change > 0 ? <span className="text-emerald-400">+{r.weekComparison.change}%</span> : r.weekComparison.change < 0 ? <span className="text-rose-400">{r.weekComparison.change}%</span> : <span className="text-zinc-400">0%</span>}
          </p>
        </motion.div>
      </div>

      {/* Focus + Mission + Reflection + Laptop summaries */}
      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SectionCard icon={Target} title="Focus Summary" delay={0.3}>
          <div className="grid grid-cols-2 gap-3">
            <MiniStat label="Total" value={r.focusSummary.totalMinutes} unit="min" />
            <MiniStat label="Sessions" value={r.focusSummary.sessionCount} />
            <MiniStat label="Longest" value={r.focusSummary.longestSession} unit="min" color="text-purple-400" />
            <MiniStat label="Deep Work" value={r.focusSummary.deepWorkSessions} color="text-teal-400" />
          </div>
        </SectionCard>

        <SectionCard icon={Target} title="Mission Summary" delay={0.35}>
          <div className="grid grid-cols-2 gap-3">
            <MiniStat label="Completed" value={r.missionSummary.completed} color="text-emerald-400" />
            <MiniStat label="Created" value={r.missionSummary.created} />
            <MiniStat label="Active" value={r.missionSummary.active} color="text-amber-400" />
          </div>
        </SectionCard>

        <SectionCard icon={BookOpen} title="Reflection" delay={0.4}>
          {r.reflection.written ? (
            <div className="space-y-2">
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">Written today</Badge>
              {r.reflection.mood !== null && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-600">Mood</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className={cn('h-1.5 w-1.5 rounded-full', i < r.reflection.mood! ? 'bg-amber-400' : 'bg-white/[0.06]')} />
                    ))}
                  </div>
                </div>
              )}
              {r.reflection.wentWell && <p className="text-xs text-zinc-500 line-clamp-2">{r.reflection.wentWell}</p>}
            </div>
          ) : (
            <div className="flex flex-col items-center py-4">
              <p className="text-xs text-zinc-500 mb-2">Not written yet</p>
              <Button variant="outline" size="sm" className="border-white/[0.08] text-zinc-300 hover:bg-white/[0.04] text-xs" onClick={() => useAppStore.getState().setView('reflection')}>
                Write now
              </Button>
            </div>
          )}
        </SectionCard>

        <SectionCard icon={Laptop} title="Laptop Summary" delay={0.45}>
          <div className="grid grid-cols-2 gap-3">
            <MiniStat label="Total" value={r.laptopSummary.totalMinutes} unit="min" />
            <MiniStat label="Productive" value={r.laptopSummary.productiveMinutes} unit="min" color="text-emerald-400" />
            <MiniStat label="Distracted" value={r.laptopSummary.distractedMinutes} unit="min" color="text-rose-400" />
            <MiniStat label="Idle" value={r.laptopSummary.idleMinutes} unit="min" color="text-amber-400" />
          </div>
        </SectionCard>
      </div>

      {/* Distraction Summary */}
      <SectionCard icon={Eye} title="Distraction Analysis" delay={0.5} className="mb-4">
        {r.distractionSummary.topDistractions.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-zinc-300">Total distracted: {r.distractionSummary.totalDistractedMinutes}m</span>
              {r.distractionSummary.peakDistractionHour !== null && (
                <Badge variant="outline" className="border-rose-500/20 bg-rose-500/[0.06] text-rose-400 text-[10px]">
                  Peak: {r.distractionSummary.peakDistractionHour}:00
                </Badge>
              )}
            </div>
            {r.distractionSummary.topDistractions.slice(0, 5).map((d, i) => (
              <div key={i} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-zinc-600 text-[10px] w-4">{i + 1}.</span>
                  <span className="text-xs text-zinc-300 truncate">{d.title}</span>
                </div>
                <span className="text-xs tabular-nums text-zinc-500 ml-2">{d.minutes}m</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-6">
            <Eye className="h-8 w-8 text-emerald-500/20 mb-2" />
            <p className="text-xs text-zinc-500">No distractions recorded. Excellent focus discipline!</p>
          </div>
        )}
      </SectionCard>

      {/* Hourly Chart + Timeline + AI Recommendation */}
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <SectionCard icon={Clock} title="Hourly Focus Distribution" delay={0.55}>
          <ReviewHourlyChart data={r.hourlyChart} />
        </SectionCard>

        <SectionCard icon={Award} title="Timeline" delay={0.6}>
          {r.timeline.length > 0 ? (
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {r.timeline.map((t, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs">
                  <span className="shrink-0 w-14 tabular-nums text-zinc-600">{t.time}</span>
                  <div className={cn(
                    'h-1.5 w-1.5 shrink-0 rounded-full mt-1.5',
                    t.type === 'session' ? 'bg-emerald-400' : t.type === 'reflection' ? 'bg-amber-400' : 'bg-purple-400'
                  )} />
                  <span className="text-zinc-300 flex-1">{t.event}</span>
                  {t.duration && <span className="tabular-nums text-zinc-500">{t.duration}m</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-600 text-center py-6">No events recorded today</p>
          )}
        </SectionCard>
      </div>

      {/* AI Recommendation */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.5, ease: EASE }}>
        <Card className="border-emerald-500/10 bg-gradient-to-br from-emerald-500/[0.06] via-white/[0.02] to-transparent overflow-hidden">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/[0.06] blur-3xl" />
          <CardContent className="relative p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
                <Lightbulb className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-emerald-400/80">AI Recommendation</h3>
            </div>
            <p className="text-sm leading-relaxed text-zinc-300">{r.aiRecommendation}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievements unlocked today */}
      {r.achievementsUnlocked.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.5, ease: EASE }} className="mt-4">
          <Card className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02]">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Achievements Unlocked</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {r.achievementsUnlocked.map((a) => (
                  <Badge key={a.type} className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">{a.icon} {a.title}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.5 }} className="mt-8 text-center">
        <p className="text-[11px] text-zinc-700">Generated from {r.focusSummary.sessionCount} focus session{r.focusSummary.sessionCount === 1 ? '' : 's'} and real activity data.</p>
      </motion.div>
    </motion.div>
  );
}