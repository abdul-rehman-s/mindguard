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

// ---- Heatmap Day Cell (React.memo) ----
const HeatmapDayCell = React.memo(function HeatmapDayCell({
  date,
  day,
  onHover,
}: {
  date: string;
  day: HeatmapDay | null;
  onHover: (e: React.MouseEvent<HTMLDivElement>, day: HeatmapDay) => void;
  onLeave: () => void;
}) {
  const mins = day?.minutes || 0;
  const habitCompleted = day?.habitCompleted || 0;
  return (
    <div
      className={cn(
        'relative h-[10px] w-[10px] rounded-[2px] cursor-pointer transition-colors duration-150 hover:ring-1 hover:ring-emerald-500/40',
        getHeatColor(mins)
      )}
      style={{ willChange: 'background-color' }}
      onMouseEnter={(e) => {
        if (day) onHover(e, day);
      }}
      onMouseLeave={() => {}}
      aria-hidden="true"
    >
      {/* Habit completion dot overlay */}
      {habitCompleted > 0 && (
        <div
          className="absolute bottom-0 right-0 h-[3px] w-[3px] rounded-full bg-amber-400/60"
          aria-hidden="true"
        />
      )}
    </div>
  );
});

export function Heatmap() {
  const [data, setData] = useState<HeatmapDay[]>([]);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; day: HeatmapDay } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullMap, setShowFullMap] = useState(false);

  useEffect(() => {
    // Fetch heatmap (focus data) and habit entries
    Promise.all([
      fetch('/api/heatmap').then(r => r.json()),
      fetch('/api/habits/entries?start=' + (() => {
        const d = new Date();
        d.setDate(d.getDate() - 89);
        return d.toISOString().split('T')[0];
      })()).then(r => r.json()),
    ])
      .then(([heatmapData, habitData]) => {
        const days: HeatmapDay[] = heatmapData.days || [];
        const entries = habitData.entries || [];

        // Build habit completion map
        const habitMap = new Map<string, number>();
        for (const e of entries) {
          habitMap.set(e.date, (habitMap.get(e.date) || 0) + 1);
        }

        // Merge habit data into heatmap days
        const merged = days.map(d => ({
          ...d,
          habitCompleted: habitMap.get(d.date) || 0,
        }));

        setData(merged);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Build grid of last 90 days (instead of 365)
  const today = new Date();
  const dayMap = new Map(data.map(d => [d.date, d]));
  const weeks: { date: string; day: HeatmapDay | null }[][] = [];
  let currentWeek: { date: string; day: HeatmapDay | null }[] = [];

  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayData = dayMap.get(dateStr) || { date: dateStr, minutes: 0, sessions: 0, habitCompleted: 0 };
    currentWeek.push({ date: dateStr, day: dayData });
    if (d.getDay() === 6 || i === 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  const totalDays = data.filter(d => d.minutes > 0).length;
  const totalMinutes = data.reduce((sum, d) => sum + d.minutes, 0);
  const activeDays = data.filter(d => d.minutes > 0).length;
  const avgMinutes = activeDays > 0 ? Math.round(totalMinutes / activeDays) : 0;
  const habitDays = data.filter(d => d.habitCompleted > 0).length;

  const handleHover = (e: React.MouseEvent<HTMLDivElement>, day: HeatmapDay) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ x: rect.left + rect.width / 2, y: rect.top - 8, day });
  };

  // Accessible summary for screen readers
  const srSummary = `Activity heatmap: ${activeDays} active days, ${totalMinutes} total minutes, ${habitDays} days with habits. Average ${avgMinutes} minutes per active day.`;

  if (loading) {
    return (
      <div className="card-glow border-white/[0.06] bg-white/[0.02]" aria-label="Loading activity heatmap">
        <div className="p-4 sm:p-5 pb-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Activity</h3>
        </div>
        <div className="px-4 sm:px-5 pb-5">
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
          <span className="text-[11px] text-zinc-600" aria-live="polite">{activeDays} active · {totalMinutes}m total · {habitDays} habit days</span>
        </div>
      </div>
      <div className="relative px-4 sm:px-5 pb-5">
        {/* Desktop view */}
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
          {/* Legend */}
          <div className="mt-3 flex items-center gap-4 text-[10px] text-zinc-600">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="h-[8px] w-[8px] rounded-[1px] bg-white/[0.03]" />
              <div className="h-[8px] w-[8px] rounded-[1px] bg-emerald-500/20" />
              <div className="h-[8px] w-[8px] rounded-[1px] bg-emerald-500/35" />
              <div className="h-[8px] w-[8px] rounded-[1px] bg-emerald-500/50" />
              <div className="h-[8px] w-[8px] rounded-[1px] bg-emerald-500/65" />
              <div className="h-[8px] w-[8px] rounded-[1px] bg-emerald-500/80" />
            </div>
            <span>More</span>
            <span className="text-zinc-500">|</span>
            <span className="flex items-center gap-1">
              <div className="h-[3px] w-[3px] rounded-full bg-amber-400/60" aria-hidden="true" />
              Habits
            </span>
          </div>
        </div>

        {/* Mobile compact view */}
        <div className="block sm:hidden">
          {showFullMap ? (
            <div className="overflow-x-auto" aria-label="Activity heatmap visualization" role="img">
              <div className="flex gap-[3px] min-w-[320px]" onMouseLeave={() => setTooltip(null)}>
                {weeks.slice(-8).map((week, wi) => (
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
                className="mt-3 text-[10px] text-zinc-500 hover:text-zinc-300 cursor-pointer"
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
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600">Habits</p>
                  <p className="text-lg font-semibold text-zinc-100">{habitDays}d</p>
                </div>
              </div>
              <button
                onClick={() => setShowFullMap(true)}
                className="text-[10px] text-emerald-400/70 hover:text-emerald-400 cursor-pointer"
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
            {tooltip.day.habitCompleted > 0 && (
              <p className="text-amber-400/70">{tooltip.day.habitCompleted} habit{tooltip.day.habitCompleted !== 1 ? 's' : ''} done</p>
            )}
            {tooltip.day.mission ? <p className="text-emerald-400/70">{tooltip.day.mission}</p> : null}
          </div>
        )}
      </div>
    </div>
  );
}
