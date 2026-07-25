'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { HeatmapDay } from '@/types';

function getHeatColor(minutes: number): string {
  if (minutes === 0) return 'bg-white/[0.03]';
  if (minutes < 15) return 'bg-emerald-500/20';
  if (minutes < 30) return 'bg-emerald-500/35';
  if (minutes < 60) return 'bg-emerald-500/50';
  if (minutes < 120) return 'bg-emerald-500/65';
  return 'bg-emerald-500/80';
}

export function Heatmap() {
  const [data, setData] = useState<HeatmapDay[]>([]);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; day: HeatmapDay } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/heatmap')
      .then(r => r.json())
      .then(d => { setData(d.days || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Build grid of last 365 days
  const today = new Date();
  const dayMap = new Map(data.map(d => [d.date, d]));
  const weeks: { date: string; day: HeatmapDay | null }[][] = [];
  let currentWeek: { date: string; day: HeatmapDay | null }[] = [];

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    currentWeek.push({ date: dateStr, day: dayMap.get(dateStr) || null });
    if (d.getDay() === 6 || i === 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  const totalDays = data.reduce((sum, d) => sum + 1, 0);
  const totalMinutes = data.reduce((sum, d) => sum + d.minutes, 0);

  return (
    <div className="card-glow border-white/[0.06] bg-white/[0.02]">
      <div className="p-5 pb-3">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Activity</h3>
          <span className="text-[11px] text-zinc-600">{totalDays} active days · {totalMinutes}m total</span>
        </div>
      </div>
      <div className="relative px-5 pb-5">
        {loading ? (
          <div className="flex h-24 items-center justify-center">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex gap-[3px]">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((d) => {
                    const mins = d.day?.minutes || 0;
                    return (
                      <motion.div
                        key={d.date}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (364 - weeks.slice(0, wi).flat().length - week.indexOf(d)) * 0.001, duration: 0.15 }}
                        className={cn('h-[10px] w-[10px] rounded-[2px] cursor-pointer transition-colors hover:ring-1 hover:ring-emerald-500/40', getHeatColor(mins))}
                        onMouseEnter={(e) => {
                          if (d.day) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltip({ x: rect.left + rect.width / 2, y: rect.top - 8, day: d.day });
                          }
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Tooltip */}
        {tooltip && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-white/[0.08] bg-zinc-900/95 px-3 py-2 text-xs shadow-xl backdrop-blur-sm"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <p className="font-medium text-zinc-200">{tooltip.day.date}</p>
            <p className="text-zinc-400">{tooltip.day.minutes}m &middot; {tooltip.day.sessions} session{tooltip.day.sessions !== 1 ? 's' : ''}</p>
            {tooltip.day.mission ? <p className="text-emerald-400/70">{tooltip.day.mission}</p> : null}
          </div>
        )}
      </div>
    </div>
  );
}