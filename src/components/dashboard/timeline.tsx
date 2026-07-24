'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, BookOpen, Trophy, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TimelineEvent } from '@/types';

function formatEventTime(isoStr: string): string {
  const d = new Date(isoStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatMinutes(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
}

const iconMap = {
  session: Clock,
  reflection: BookOpen,
  mission_completed: Trophy,
};

const colorMap = {
  session: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  reflection: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  mission_completed: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
};

const labelMap = {
  session: 'Focus Session',
  reflection: 'Reflection',
  mission_completed: 'Mission Done',
};

export function Timeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/timeline')
      .then(r => r.json())
      .then(d => { setEvents(d.events || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card-glow border-white/[0.06] bg-white/[0.02] p-5">
        <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-zinc-500">Today's Timeline</h3>
        <div className="flex h-20 items-center justify-center">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="card-glow border-white/[0.06] bg-white/[0.02]">
      <div className="p-5 pb-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Today's Timeline</h3>
      </div>
      <div className="px-5 pb-5">
        {events.length === 0 ? (
          <div className="flex flex-col items-center py-8">
            <Target className="mb-3 h-8 w-8 text-zinc-700" />
            <p className="text-sm text-zinc-500">No activity yet today</p>
            <p className="text-xs text-zinc-600">Start a focus session to begin</p>
          </div>
        ) : (
          <div className="relative space-y-0">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/[0.06]" />
            {events.map((event, i) => {
              const Icon = iconMap[event.type];
              const color = colorMap[event.type];
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="relative flex items-start gap-3 py-2.5"
                >
                  <div className={cn('relative z-10 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border', color)}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm text-zinc-200">{event.title}</p>
                      <span className="shrink-0 text-[10px] tabular-nums text-zinc-600">{formatEventTime(event.time)}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-[10px] text-zinc-600">{labelMap[event.type]}</span>
                      {event.minutes && <span className="text-[10px] text-emerald-400/60">{formatMinutes(event.minutes)}</span>}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
