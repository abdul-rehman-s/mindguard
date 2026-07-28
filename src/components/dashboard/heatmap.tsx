'use client';

import React, { useState, useEffect } from 'react';
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

// ---- Heatmap Day Cell (React.memo, regular div + CSS transition) ----
const HeatmapDayCell = React.memo(function HeatmapDayCell({
  date: _date,
  day,
  onHover,
}: {
  date: string;
  day: HeatmapDay | null;
  onHover: (e: React.MouseEvent<HTMLDivElement>, day: HeatmapDay) => void;
  onLeave: () => void;
}) {
  const mins = day?.minutes || 0;
  return (
    <div
      className={cn(
        'h-[10px] w-[10px] rounded-[2px] cursor-pointer transition-colors duration-150 hover:ring-1 hover:ring-emerald-500/40',
        getHeatColor(mins)
      )}
      style={{ willChange: 'background-color' }}
      onMouseEnter={(e) => {
        if (day) onHover(e, day);
      }}
      onMouseLeave={() => {}}
      aria-hidden="true"
    />
  );
});

export function Heatmap() {
  const [data, setData] = useState<HeatmapDay[]>([]);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; day: HeatmapDay } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullMap, setShowFullMap] = useState(false);

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

  const totalDays = data.length;
  const totalMinutes = data.reduce((sum, d) => sum + d.minutes, 0);
  const activeDays = data.filter(d => d.minutes > 0).length;
  const avgMinutes = activeDays > 0 ? Math.round(totalMinutes / activeDays) : 0;
  const bestDay = data.length > 0 ? data.reduce((best, d) => d.minutes > best.minutes ? d : best, data[0]) : null;

  const handleHover = (e: React.MouseEvent<HTMLDivElement>, day: HeatmapDay) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ x: rect.left + rect.width / 2, y: rect.top - 8, day });
  };

  // Accessible summary for screen readers
  const srSummary = `Activity heatmap: ${totalDays} tracked days, ${activeDays} active days, ${totalMinutes} total minutes. Average ${avgMinutes} minutes per active day. ${bestDay ? `Best day: ${bestDay.date} with ${bestDay.minutes} minutes.` : ''}`;

  if (loading) {
    return (
      <div className="card-glow border-white/[0.06] bg-white/[0.02]" aria-label="Loading activity heatmap">
        <div className="p-5 pb-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Activity</h3>
        </div>
        <div className="px-5 pb-5">
          <div className="flex h-24 items-center justify-center">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-glow border-white/[0.06] bg-white/[0.02]">
      {/* Screen reader summary */}
      <p className="sr-only">{srSummary}</p>

      <div className="p-4 sm:p-5 pb-3">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500" id="heatmap-heading">Activity</h3>
          <span className="text-[11px] text-zinc-600" aria-live="polite">{totalDays} active days · {totalMinutes}m total</span>
        </div>
      </div>
      <div className="relative px-4 sm:px-5 pb-5">
        {/* Mobile: show summary view, with toggle to expand */}
        <div className="hidden sm:block" aria-label="Activity heatmap visualization" role="img">
          <div className="overflow-x-auto">
            <div className="flex gap-[3px]" onMouseLeave={() => setTooltip(null)}>
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((d) => (
                    <HeatmapDayCell
                      key={d.date}
                      date={d.date}
                      day={d.day}
                      onHover={handleHover}
                      onLeave={() => setTooltip(null)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile compact view */}
        <div className="block sm:hidden">
          {showFullMap ? (
            <div className="overflow-x-auto" aria-label="Activity heatmap visualization" role="img">
              <div className="flex gap-[3px] min-w-[320px]" onMouseLeave={() => setTooltip(null)}>
                {weeks.slice(-12).map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px]">
                    {week.map((d) => (
                      <HeatmapDayCell
                        key={d.date}
                        date={d.date}
                        day={d.day}
                        onHover={handleHover}
                        onLeave={() => setTooltip(null)}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowFullMap(false)}
                className="mt-3 text-[10px] text-zinc-500 hover:text-zinc-300"
                aria-label="Show summary view"
              >
                Show summary
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2" aria-label="Activity summary">
              <div className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600">Active days</p>
                  <p className="text-lg font-semibold text-zinc-100">{activeDays}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600">Avg/day</p>
                  <p className="text-lg font-semibold text-zinc-100">{avgMinutes}m</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600">Total</p>
                  <p className="text-lg font-semibold text-zinc-100">{totalMinutes}m</p>
                </div>
              </div>
              <button
                onClick={() => setShowFullMap(true)}
                className="text-[10px] text-emerald-400/70 hover:text-emerald-400"
                aria-label="Show full heatmap"
              >
                View full heatmap →
              </button>
            </div>
          )}
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-white/[0.08] bg-zinc-900/95 px-3 py-2 text-xs shadow-xl backdrop-blur-sm"
            style={{ left: tooltip.x, top: tooltip.y }}
            role="tooltip"
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
