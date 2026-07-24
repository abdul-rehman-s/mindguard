'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ACHIEVEMENTS } from '@/types';
import type { Achievement } from '@prisma/client';
import { useAppStore } from '@/stores/app-store';

export function Achievements() {
  const { stats, setAchievements, achievements } = useAppStore();
  const [loading, setLoading] = useState(true);

  const fetchAchievements = useCallback(() => {
    fetch('/api/achievements')
      .then(r => r.json())
      .then(d => { setAchievements(d.achievements || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [setAchievements]);

  useEffect(() => { fetchAchievements(); }, [fetchAchievements]);

  // Check and unlock new achievements
  useEffect(() => {
    if (!stats) return;
    const unlockedTypes = new Set(achievements.map(a => a.type));
    for (const ach of ACHIEVEMENTS) {
      if (!unlockedTypes.has(ach.type) && ach.check({ ...stats, todayReflection: false })) {
        fetch('/api/achievements', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: ach.type }),
        }).then(() => fetchAchievements());
      }
    }
  }, [stats, achievements, fetchAchievements]);

  const unlockedSet = new Set(achievements.map(a => a.type));

  return (
    <div className="card-glow border-white/[0.06] bg-white/[0.02]">
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Achievements</h3>
          <span className="text-[11px] text-zinc-600">{unlockedSet.size}/{ACHIEVEMENTS.length}</span>
        </div>
      </div>
      <div className="px-5 pb-5">
        {loading ? (
          <div className="flex h-20 items-center justify-center">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ACHIEVEMENTS.map((ach, i) => {
              const unlocked = unlockedSet.has(ach.type);
              return (
                <motion.div
                  key={ach.type}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    'flex flex-col items-center rounded-xl border p-3 text-center transition-all duration-200',
                    unlocked
                      ? 'border-emerald-500/20 bg-emerald-500/[0.06]'
                      : 'border-white/[0.04] bg-white/[0.01] opacity-50'
                  )}
                >
                  <span className="mb-1.5 text-2xl">{unlocked ? ach.icon : '🔒'}</span>
                  <span className={cn('text-[11px] font-medium', unlocked ? 'text-emerald-300' : 'text-zinc-500')}>{ach.title}</span>
                  <span className="mt-0.5 text-[9px] leading-tight text-zinc-600 line-clamp-2">{ach.description}</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
