'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/app-store';

export function AttentionScore() {
  const { stats } = useAppStore();
  const score = stats?.focusScore || 0;

  // Calculate breakdown
  const streakPct = Math.min((stats?.currentStreak || 0) / 30 * 100, 100);
  const avgPct = Math.min((stats?.avgSessionMinutes || 0) / 60 * 100, 100);
  const todayPct = Math.min((stats?.todayFocusMinutes || 0) / 120 * 100, 100);
  const sessionPct = Math.min((stats?.totalSessions || 0) / 200 * 100, 100);

  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference * (1 - score / 100);

  const breakdowns = [
    { label: 'Consistency', value: streakPct, color: 'bg-emerald-400' },
    { label: 'Session Quality', value: avgPct, color: 'bg-teal-400' },
    { label: 'Daily Goal', value: todayPct, color: 'bg-amber-400' },
    { label: 'Volume', value: sessionPct, color: 'bg-purple-400' },
  ];

  return (
    <div className="card-glow border-white/[0.06] bg-white/[0.02]">
      <div className="p-5 pb-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Attention Score</h3>
      </div>
      <div className="flex flex-col items-center px-5 pb-5">
        <div className="relative mb-4">
          <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" className="text-white/[0.04]" strokeWidth="4" />
            <motion.circle
              cx="60" cy="60" r="52" fill="none" stroke="url(#score-grad)" strokeWidth="4" strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.4))' }}
            />
            <defs>
              <linearGradient id="score-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#14b8a6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-3xl font-semibold tabular-nums text-zinc-100"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            >
              {score}
            </motion.span>
            <span className="text-[10px] text-zinc-600">/ 100</span>
          </div>
        </div>
        {/* Breakdown bars */}
        <div className="w-full space-y-2.5">
          {breakdowns.map((b, i) => (
            <div key={b.label}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">{b.label}</span>
                <span className="text-[10px] tabular-nums text-zinc-600">{Math.round(b.value)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
                <motion.div
                  className={cn('h-full rounded-full', b.color, 'opacity-60')}
                  initial={{ width: 0 }}
                  animate={{ width: `${b.value}%` }}
                  transition={{ duration: 1, delay: 0.3 + i * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
