'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Clock,
  Coffee,
  PenLine,
  PlusCircle,
  CheckCircle2,
  Calendar as CalendarIcon,
  AlertCircle,
  Loader2,
  Timer,
  Trophy,
  BookOpen,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatDuration, formatTimeDisplay, formatDateDisplay } from '@/lib/utils';
import { fadeInUp } from '@/lib/animations';
import type { ReplayData, ReplayEvent } from '@/types';

const ICON_MAP: Record<string, LucideIcon> = {
  Timer,
  Coffee,
  PenLine,
  PlusCircle,
  CheckCircle2,
  Clock,
};

const TYPE_STYLES: Record<string, { color: string; label: string }> = {
  session: {
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    label: 'Focus Session',
  },
  break: {
    color: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
    label: 'Break',
  },
  reflection: {
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    label: 'Reflection',
  },
  mission_created: {
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    label: 'Mission Created',
  },
  mission_completed: {
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    label: 'Mission Completed',
  },
};

const EventItem = React.memo(function EventItem({ ev, i, isActive, refSetter }: {
  ev: ReplayEvent; i: number; isActive: boolean; refSetter: (el: HTMLDivElement | null, idx: number) => void;
}) {
  const style = TYPE_STYLES[ev.type] || TYPE_STYLES.session;
  const IconComp = ICON_MAP[ev.icon] || Clock;
  return (
    <motion.div
      ref={(el) => refSetter(el, i)}
      initial={{ opacity: 0, x: -8 }}
      animate={{
        opacity: 1,
        x: 0,
        scale: isActive ? 1.02 : 1,
      }}
      transition={{ delay: i * 0.04, duration: 0.4 }}
      className={cn(
        'relative flex items-start gap-3 rounded-lg p-2 transition-all duration-300',
        isActive && 'bg-emerald-500/[0.06] ring-1 ring-emerald-500/20'
      )}
      aria-label={`${style.label}: ${ev.title} at ${formatTimeDisplay(ev.time)}`}
    >
      <div
        className={cn(
          'relative z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border',
          style.color
        )}
        aria-hidden="true"
      >
        <IconComp className="h-3.5 w-3.5" />
        {isActive && (
          <motion.div
            layoutId="replay-pulse"
            className="absolute inset-0 rounded-full border-2 border-emerald-400"
            animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            aria-hidden="true"
          />
        )}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-100">
              {ev.title}
            </p>
            {ev.subtitle && (
              <p className="mt-0.5 truncate text-xs text-zinc-500">
                {ev.subtitle}
              </p>
            )}
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[9px] uppercase tracking-wider text-zinc-700">
                {style.label}
              </span>
              {ev.duration && (
                <span className="text-[9px] text-emerald-400/70" aria-live="polite">
                  {formatDuration(ev.duration)}
                </span>
              )}
            </div>
          </div>
          <span className="shrink-0 text-[10px] tabular-nums text-zinc-600">
            {formatTimeDisplay(ev.time)}
          </span>
        </div>
      </div>
    </motion.div>
  );
});

const SummaryStat = React.memo(function SummaryStat({
  icon: Icon, label, value,
}: {
  icon: LucideIcon; label: string; value: string | number;
}) {
  return (
    <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-2.5">
      <div className="mb-1.5 flex items-center gap-1.5" aria-hidden="true">
        <Icon className="h-3 w-3 text-zinc-600" />
        <span className="text-[9px] font-medium uppercase tracking-wider text-zinc-600">
          {label}
        </span>
      </div>
      <p className="text-sm font-semibold tabular-nums text-zinc-100" aria-live="polite">{value}</p>
    </div>
  );
});

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function ReplayView() {
  const [date, setDate] = useState<string>(todayStr());
  const [data, setData] = useState<ReplayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayIdx, setReplayIdx] = useState<number | null>(null);
  const eventRefs = useRef<(HTMLDivElement | null)[]>([]);

  const refSetter = useCallback((el: HTMLDivElement | null, idx: number) => {
    eventRefs.current[idx] = el;
  }, []);

  const fetchReplay = useCallback(async (d: string) => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/replay?date=${d}`);
      if (!res.ok) throw new Error('Failed');
      const json = (await res.json()) as ReplayData;
      setData(json);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReplay(date);
  }, [date, fetchReplay]);

  // Auto-scroll replay
  useEffect(() => {
    if (!isReplaying || !data || data.events.length === 0) return;
    let idx = 0;
    setReplayIdx(0);
    let timer: number | undefined;
    const tick = () => {
      const el = eventRefs.current[idx];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setReplayIdx(idx);
      idx++;
      if (idx >= data.events.length) {
        timer = window.setTimeout(() => {
          setIsReplaying(false);
          setReplayIdx(null);
        }, 800);
        return;
      }
      timer = window.setTimeout(tick, 1200);
    };
    timer = window.setTimeout(tick, 300);
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [isReplaying, data]);

  const hourly = useMemo(() => {
    if (!data) return new Array(24).fill(0);
    const arr = new Array(24).fill(0);
    for (const ev of data.events) {
      if (ev.type === 'session' && ev.duration) {
        const h = new Date(ev.time).getHours();
        arr[h] += ev.duration / 60;
      }
    }
    return arr.map((v) => Math.round(v));
  }, [data]);

  const maxHour = Math.max(...hourly, 1);
  const isToday = date === todayStr();
  const prettyDate = formatDateDisplay(date, 'EEEE, MMMM d, yyyy');

  const startReplay = () => {
    if (!data || data.events.length === 0) return;
    setIsReplaying(true);
  };
  const stopReplay = () => {
    setIsReplaying(false);
    setReplayIdx(null);
  };

  return (
    <motion.div
      variants={fadeInUp} initial="hidden" animate="visible"
      className="app-grid-bg min-h-full -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
    >
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/[0.08]" aria-hidden="true">
            <RotateCcw className="h-5 w-5 text-emerald-400/80" />
          </div>
          <div>
            <h2 className="heading-lg text-[1.65rem] font-semibold tracking-[-0.02em] text-zinc-100">
              Daily Replay
            </h2>
            <p className="mt-0.5 text-sm text-zinc-500">
              Replay your day&apos;s focus events in chronological order.
            </p>
          </div>
        </div>

        {/* Date picker */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
            onClick={() => setDate((d) => shiftDate(d, -1))}
            aria-label="Previous day"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
            <CalendarIcon className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
            <span className="text-xs font-medium text-zinc-200">{prettyDate}</span>
            <span className="text-[10px] text-zinc-600">{date}</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200 disabled:opacity-30"
            onClick={() => {
              if (!isToday) setDate((d) => shiftDate(d, 1));
            }}
            disabled={isToday}
            aria-label="Next day"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <input
            type="date"
            value={date}
            max={todayStr()}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            aria-label="Select date for replay"
            className="h-9 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 text-xs text-zinc-300 outline-none focus:border-emerald-500/30 [color-scheme:dark]"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-600" aria-label="Loading replay data" />
        </div>
      ) : error || !data ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3" role="alert" aria-live="polite">
          <AlertCircle className="h-8 w-8 text-red-400/60" aria-hidden="true" />
          <p className="text-sm text-zinc-400">Couldn&apos;t load replay data.</p>
          <Button variant="ghost" size="sm" onClick={() => fetchReplay(date)} aria-label="Retry loading replay">
            Try again
          </Button>
        </div>
      ) : data.events.length === 0 ? (
        <div className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02] flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03]" aria-hidden="true">
            <CalendarIcon className="h-7 w-7 text-zinc-700" />
          </div>
          <p className="mb-1 text-sm font-medium text-zinc-400">No events on {prettyDate}</p>
          <p className="text-xs text-zinc-600">
            Pick another date or start a focus session to populate your replay.
          </p>
        </div>
      ) : (
        <>
          {/* Replay control bar */}
          <div className="mb-6 flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                {data.events.length} events
              </span>
              <span className="text-[10px] text-zinc-700" aria-hidden="true">·</span>
              <span className="text-[10px] tabular-nums text-zinc-600" aria-live="polite">
                {data.summary.totalMinutes} min total
              </span>
            </div>
            {isReplaying ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-2 border-amber-500/20 bg-amber-500/[0.06] text-[11px] text-amber-400 hover:bg-amber-500/[0.1]"
                onClick={stopReplay}
                aria-label="Stop replay"
              >
                <Pause className="h-3 w-3" aria-hidden="true" />
                Stop replay
              </Button>
            ) : (
              <Button
                onClick={startReplay}
                size="sm"
                aria-label="Start replay"
                className="btn-glow h-8 gap-2 bg-gradient-to-b from-emerald-500 to-emerald-600 text-[11px] text-white hover:from-emerald-400 hover:to-emerald-500"
              >
                <Play className="h-3 w-3" aria-hidden="true" />
                Replay day
              </Button>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {/* Timeline column */}
            <div className="lg:col-span-2">
              <div className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02] max-h-[640px] overflow-y-auto">
                <div className="p-5 pb-3">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Timeline
                  </h3>
                </div>
                <div className="px-5 pb-5">
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-emerald-500/40 via-white/[0.08] to-transparent" aria-hidden="true" />
                    <div className="space-y-3">
                      {data.events.map((ev: ReplayEvent, i: number) => (
                        <EventItem key={ev.id} ev={ev} i={i} isActive={replayIdx === i} refSetter={refSetter} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: hourly chart + summary */}
            <div className="space-y-4">
              {/* Hourly distribution */}
              <div className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02]">
                <div className="p-5 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
                    <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Hourly Distribution
                    </h3>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  <div className="flex h-32 items-end gap-[2px]" role="img" aria-label="Hourly focus distribution chart">
                    {hourly.map((mins, h) => {
                      const hasFocus = mins > 0;
                      const heightPct = hasFocus ? (mins / maxHour) * 100 : 0;
                      return (
                        <div
                          key={h}
                          className="group relative flex flex-1 flex-col items-center gap-1"
                          aria-label={`${h}:00 — ${mins} min`}
                        >
                          <div className="relative flex w-full justify-center">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${heightPct}%` }}
                              transition={{ duration: 0.5, delay: h * 0.015 }}
                              className={cn(
                                'w-full rounded-t-sm transition-all duration-200',
                                hasFocus
                                  ? 'bg-gradient-to-t from-emerald-500/70 to-emerald-400/40 group-hover:from-emerald-500 group-hover:to-emerald-400/60'
                                  : 'bg-white/[0.02]'
                              )}
                              style={hasFocus ? { minHeight: '4px' } : undefined}
                            />
                          </div>
                          {h % 3 === 0 && (
                            <span className="text-[8px] tabular-nums text-zinc-700">{h}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Summary stats */}
              <div className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02]">
                <div className="p-5 pb-3">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Day Summary
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2 px-5 pb-5">
                  <SummaryStat icon={Clock} label="Focus time" value={`${data.summary.totalMinutes}m`} />
                  <SummaryStat icon={Timer} label="Sessions" value={data.summary.sessionCount} />
                  <SummaryStat icon={Trophy} label="Missions done" value={data.summary.missionsCompleted} />
                  <SummaryStat icon={BookOpen} label="Reflection" value={data.summary.reflectionWritten ? 'Yes' : '—'} />
                  <SummaryStat icon={Timer} label="Longest" value={`${data.summary.longestSession}m`} />
                  <SummaryStat icon={Clock} label="Best hour" value={data.summary.bestHour ?? '—'} />
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isReplaying && replayIdx !== null && data && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-emerald-500/20 bg-zinc-900/95 px-5 py-2.5 backdrop-blur-md shadow-2xl shadow-emerald-500/10"
                aria-live="polite"
              >
                <span className="text-[11px] font-medium text-emerald-400">
                  Event {replayIdx + 1} / {data.events.length}
                </span>
                <span className="mx-2 text-zinc-700" aria-hidden="true">·</span>
                <span className="text-[11px] text-zinc-300">
                  {data.events[replayIdx]?.title}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}
