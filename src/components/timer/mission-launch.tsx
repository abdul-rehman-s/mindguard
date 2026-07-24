'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const CHECKLIST_ITEMS = ['Phone Silent', 'Water Nearby', 'Notifications Off', 'Ready to Focus'];

interface MissionLaunchProps {
  missionTitle: string | null;
  duration: number;
  onStart: () => void;
  onCancel: () => void;
}

export function MissionLaunch({ missionTitle, duration, onStart, onCancel }: MissionLaunchProps) {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [countdown, setCountdown] = useState<number | null>(null);

  const toggleCheck = (item: string) => setChecks((p) => ({ ...p, [item]: !p[item] }));
  const checkedCount = Object.values(checks).filter(Boolean).length;

  const handleStart = () => {
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          onStart();
          return null;
        }
        return prev - 1;
      });
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-zinc-950"
    >
      {/* Background */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-emerald-500/[0.06] blur-[120px]" />

      {countdown !== null ? (
        <motion.div key={countdown} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 2, opacity: 0 }} transition={{ duration: 0.3 }} className="flex items-center justify-center">
          <span className="font-mono text-9xl font-light text-emerald-400 tabular-nums" style={{ textShadow: '0 0 60px rgba(16,185,129,0.5)' }}>{countdown}</span>
        </motion.div>
      ) : (
        <div className="relative z-10 flex w-full max-w-sm flex-col items-center px-6">
          {/* Mission title */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-2 flex items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/[0.06] px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-medium text-emerald-400/90">{missionTitle || 'Free Focus'}</span>
          </motion.div>

          {/* Duration */}
          <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-1 mt-4 text-4xl font-semibold tracking-tight text-zinc-100 tabular-nums">
            {duration >= 3600 ? `${Math.floor(duration / 60)}h ${duration % 60 ? `${duration % 60}m` : ''}` : `${duration} min`}
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-8 text-sm text-zinc-500">Estimated Duration</motion.p>

          {/* Checklist */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-10 w-full space-y-2.5">
            {CHECKLIST_ITEMS.map((item) => (
              <motion.button
                key={item} whileTap={{ scale: 0.98 }} onClick={() => toggleCheck(item)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200',
                  checks[item] ? 'border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-300' : 'border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.04]'
                )}
              >
                <div className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                  checks[item] ? 'border-emerald-500 bg-emerald-500/20' : 'border-white/[0.1]'
                )}>
                  {checks[item] && <Check className="h-3 w-3 text-emerald-400" />}
                </div>
                {item}
              </motion.button>
            ))}
          </motion.div>

          {/* Start button */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="flex w-full flex-col gap-3">
            <Button
              onClick={handleStart}
              className="w-full gap-2 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-500/25 hover:from-emerald-400 hover:to-emerald-500 h-14 text-base"
              style={{ boxShadow: '0 0 40px rgba(16,185,129,0.3)' }}
            >
              <Play className="h-5 w-5" /> Start Mission
            </Button>
            <Button variant="ghost" onClick={onCancel} className="w-full text-zinc-500 hover:text-zinc-200">
              Cancel
            </Button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
