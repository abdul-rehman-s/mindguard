'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  BookOpen,
  Trophy,
  Target,
  Coffee,
  PlusCircle,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { cn, formatDuration, formatTimeDisplay } from '@/lib/utils';
import { fadeInUp } from '@/lib/animations';
import type { TimelineEvent } from '@/types';

const iconMap: Record<TimelineEvent['type'], LucideIcon> = {
  session: Clock,
  reflection: BookOpen,
  mission_completed: Trophy,
  break: Coffee,
  mission_created: PlusCircle,
  achievement_unlocked: Sparkles,
};

const colorMap: Record<TimelineEvent['type'], string> = {
  session: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  reflection: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  mission_completed: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  break: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
  mission_created: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  achievement_unlocked: 'text-purple-300 bg-purple-500/10 border-purple-500/20',
};

const labelMap: Record<TimelineEvent['type'], string> = {
  session: 'Focus Session',
  reflection: 'Reflection',
  mission_completed: 'Mission Done',
  break: 'Break',
  mission_created: 'New Mission',
  achievement_unlocked: 'Achievement',
};

// ---- Timeline Event Row (React.memo) ----
const TimelineEventRow = React.memo(function TimelineEventRow({
  event,
  isMulti,
}: {
  event: TimelineEvent;
  isMulti: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-2.5',
        !isMulti && 'pt-0'
      )}
      aria-label={`${labelMap[event.type]}: ${event.title}`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[12px] font-medium text-zinc-200">
            {event.title}
          </p>
          {!isMulti && (
            <span className="shrink-0 text-[10px] tabular-nums text-zinc-600">
              {formatTimeDisplay(event.time)}
            </span>
          )}
        </div>
        {event.subtitle && (
          <p className="mt-0.5 truncate text-[10px] leading-snug text-zinc-600">
            {event.subtitle}
          </p>
        )}
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-[9px] uppercase tracking-wider text-zinc-700">
            {labelMap[event.type]}
          </span>
          {event.minutes ? (
            <span className="text-[9px] text-emerald-400/70">
              {formatDuration(event.minutes)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
});

export function Timeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/timeline')
      .then((r) => r.json())
      .then((d) => {
        setEvents(d.events || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Group consecutive events by their `group` field
  const grouped = useMemo(() => {
    const groups: { group: string; events: TimelineEvent[] }[] = [];
    for (const ev of events) {
      const last = groups[groups.length - 1];
      if (last && last.group === ev.group) {
        last.events.push(ev);
      } else {
        groups.push({ group: ev.group || ev.id, events: [ev] });
      }
    }
    return groups;
  }, [events]);

  if (loading) {
    return (
      <div className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02] p-5" aria-label="Loading timeline">
        <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-zinc-500">Today&apos;s Timeline</h3>
        <div className="flex h-24 flex-col gap-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-white/[0.04]" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-white/[0.04]" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-white/[0.04]" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02]"
    >
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Today&apos;s Timeline</h3>
          <span className="text-[10px] text-zinc-600" aria-live="polite">{events.length} events</span>
        </div>
      </div>
      <div className="px-5 pb-5">
        {events.length === 0 ? (
          <div className="flex flex-col items-center py-8" aria-label="No activity today">
            <Target className="mb-3 h-8 w-8 text-zinc-700" aria-hidden="true" />
            <p className="text-sm text-zinc-500">No activity yet today</p>
            <p className="text-xs text-zinc-600">Start a focus session to begin</p>
          </div>
        ) : (
          <div className="relative" aria-label="Timeline of today's activity">
            {/* Timeline line — decorative */}
            <div className="absolute left-[10px] top-2 bottom-2 w-px bg-gradient-to-b from-emerald-500/30 via-white/[0.08] to-transparent" aria-hidden="true" />

            <div className="space-y-1 max-h-96 overflow-y-auto">
              {grouped.map((grp, gi) => {
                const isMulti = grp.events.length > 1;
                const FirstIcon = iconMap[grp.events[0].type] || Clock;
                const firstColor = colorMap[grp.events[0].type];
                return (
                  <motion.div
                    key={grp.group}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: gi * 0.06, duration: 0.4 }}
                    className="relative"
                  >
                    {/* Group node */}
                    <div className="relative flex items-start gap-3">
                      <div className="relative z-10 mt-1 flex flex-col items-center">
                        {/* Primary node */}
                        <div
                          className={cn(
                            'flex h-[22px] w-[22px] items-center justify-center rounded-full border',
                            firstColor
                          )}
                          aria-hidden="true"
                        >
                          <FirstIcon className="h-3 w-3" />
                        </div>
                        {isMulti && (
                          <div className="mt-0.5 flex flex-col items-center gap-0.5" aria-hidden="true">
                            {grp.events.slice(1).map((ev, idx) => (
                              <div
                                key={`${ev.id}-${idx}`}
                                className={cn(
                                  'flex h-[16px] w-[16px] items-center justify-center rounded-full border',
                                  colorMap[ev.type]
                                )}
                              >
                                {(() => {
                                  const SubIcon = iconMap[ev.type] || Clock;
                                  return <SubIcon className="h-2.5 w-2.5" />;
                                })()}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 pb-3">
                        {/* Group time header for multi-event groups */}
                        {isMulti && (
                          <div className="mb-1.5 flex items-center gap-1.5">
                            <span className="text-[9px] font-medium uppercase tracking-wider text-zinc-600">
                              Cluster
                            </span>
                            <span className="text-[9px] text-zinc-700" aria-hidden="true">·</span>
                            <span className="text-[9px] tabular-nums text-zinc-600">
                              {formatTimeDisplay(grp.events[0].time)}
                              {grp.events[grp.events.length - 1].time !== grp.events[0].time && (
                                <> – {formatTimeDisplay(grp.events[grp.events.length - 1].time)}</>
                              )}
                            </span>
                            <span className="text-[9px] text-zinc-700" aria-hidden="true">·</span>
                            <span className="text-[9px] text-zinc-600">{grp.events.length} events</span>
                          </div>
                        )}

                        <div className={cn('space-y-1.5', isMulti && 'rounded-lg border border-white/[0.04] bg-white/[0.01] p-2')}>
                          {grp.events.map((event) => (
                            <TimelineEventRow key={event.id} event={event} isMulti={isMulti} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
