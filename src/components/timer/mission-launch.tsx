'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Check, ShieldOff, Droplets, BellOff, Crosshair } from 'lucide-react';
import { toast } from 'sonner';
import { cn, formatDurationCompact } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const TOTAL_ITEMS = 4;

const CHECKLIST_ITEMS = [
  { id: 'phone', label: 'Phone Silent', icon: ShieldOff },
  { id: 'water', label: 'Water Nearby', icon: Droplets },
  { id: 'notifications', label: 'Notifications Off', icon: BellOff },
  { id: 'ready', label: 'Ready to Focus', icon: Crosshair },
] as const;

interface MissionLaunchProps {
  missionTitle: string | null;
  duration: number;
  onStart: () => void;
  onCancel: () => void;
}

export function MissionLaunch({ missionTitle, duration, onStart, onCancel }: MissionLaunchProps) {
  const [checks, setChecks] = useState<Record<string, boolean>>({
    phone: false,
    water: false,
    notifications: false,
    ready: false,
  });
  const [countdown, setCountdown] = useState<number | null>(null);

  const checkedCount = Object.values(checks).filter(Boolean).length;
  const allChecked = checkedCount === TOTAL_ITEMS;

  const toggleCheck = useCallback((id: string) => {
    if (countdown !== null) return;
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  }, [countdown]);

  const handleStart = useCallback(() => {
    if (!allChecked) {
      toast.error('Complete your setup first');
      return;
    }
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
  }, [allChecked, onStart]);

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-zinc-950"
      role="dialog"
      aria-modal="true"
      aria-label="Mission launch checklist"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-emerald-500/[0.06] blur-[120px]" aria-hidden="true" />

      {/* Animated glow behind button when all checked */}
      <AnimatePresence>
        {allChecked && countdown === null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.05, 1] }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute bottom-[18%] left-1/2 -translate-x-1/2 h-32 w-72 rounded-full bg-emerald-500/30 blur-[60px]"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {countdown !== null ? (
        <motion.div
          key={countdown}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center"
          aria-live="assertive"
        >
          <span
            className="font-mono text-6xl font-light text-emerald-400 tabular-nums sm:text-7xl md:text-9xl"
            style={{ textShadow: '0 0 60px rgba(16,185,129,0.5)' }}
          >
            {countdown}
          </span>
        </motion.div>
      ) : (
        <div className="relative z-10 flex w-full max-w-sm flex-col items-center px-4 sm:px-6">
          {/* Mission title badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-2 flex items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/[0.06] px-4 py-1.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
            <span className="text-xs font-medium text-emerald-400/90">
              {missionTitle || 'Free Focus'}
            </span>
          </motion.div>

          {/* Duration header */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-1 mt-4 text-3xl font-semibold tracking-tight text-zinc-100 tabular-nums sm:text-4xl"
            aria-live="polite"
          >
            {formatDurationCompact(duration * 60)}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 text-sm text-zinc-500"
          >
            Estimated Duration
          </motion.p>

          {/* Progress indicator */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="mb-5 flex items-center gap-3"
          >
            {/* Progress bar */}
            <div className="h-1 w-24 rounded-full bg-white/[0.06] overflow-hidden"
              role="progressbar"
              aria-valuenow={checkedCount}
              aria-valuemin={0}
              aria-valuemax={TOTAL_ITEMS}
              aria-label="Setup progress"
            >
              <motion.div
                className={cn(
                  'h-full rounded-full transition-all duration-500 ease-out',
                  allChecked ? 'bg-emerald-400' : 'bg-emerald-500/40'
                )}
                animate={{ width: `${(checkedCount / TOTAL_ITEMS) * 100}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </div>
            <span className={cn(
              'text-xs font-medium tabular-nums transition-colors duration-300',
              allChecked ? 'text-emerald-400' : 'text-zinc-500'
            )} aria-live="polite">
              {checkedCount}/{TOTAL_ITEMS} Ready
            </span>
          </motion.div>

          {/* Checklist */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-10 w-full space-y-2.5"
          >
            {CHECKLIST_ITEMS.map((item, idx) => {
              const isChecked = checks[item.id];
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.06 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleCheck(item.id)}
                  aria-label={`${isChecked ? 'Completed' : 'Not completed'}: ${item.label}`}
                  aria-pressed={isChecked}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition-all duration-300',
                    isChecked
                      ? 'border-emerald-500/25 bg-emerald-500/[0.07] text-emerald-300 shadow-sm shadow-emerald-500/[0.04]'
                      : 'border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:border-white/[0.1] hover:bg-white/[0.04]'
                  )}
                >
                  {/* Checkbox */}
                  <div
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-300',
                      isChecked
                        ? 'border-emerald-500 bg-emerald-500/20 shadow-sm shadow-emerald-500/20'
                        : 'border-white/[0.12] group-hover:border-white/[0.2]'
                    )}
                    aria-hidden="true"
                  >
                    <AnimatePresence mode="wait">
                      {isChecked && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        >
                          <Check className="h-3 w-3 text-emerald-400" strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Icon */}
                  <Icon className={cn(
                    'h-4 w-4 shrink-0 transition-colors duration-300',
                    isChecked ? 'text-emerald-400' : 'text-zinc-600'
                  )} />

                  {/* Label */}
                  <span className={cn(
                    'transition-colors duration-300',
                    isChecked ? 'text-emerald-200' : 'text-zinc-400'
                  )}>
                    {item.label}
                  </span>

                  {/* Checked indicator dot */}
                  {isChecked && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto"
                      aria-hidden="true"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </motion.div>

          {/* Start button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex w-full flex-col gap-3"
          >
            <Button
              onClick={handleStart}
              disabled={!allChecked}
              aria-label="Start mission"
              className={cn(
                'relative w-full gap-2 h-14 text-base font-medium transition-all duration-500',
                allChecked
                  ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-500/25 hover:from-emerald-400 hover:to-emerald-500'
                  : 'bg-zinc-800 text-zinc-500 shadow-none border border-white/[0.06] cursor-not-allowed opacity-50'
              )}
              style={allChecked ? {
                boxShadow: '0 0 40px rgba(16,185,129,0.3), 0 0 80px rgba(16,185,129,0.15)',
              } : undefined}
            >
              {/* Glow pulse overlay when ready */}
              {allChecked && (
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-lg"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(16,185,129,0.2), inset 0 0 20px rgba(16,185,129,0.05)',
                      '0 0 40px rgba(16,185,129,0.4), inset 0 0 30px rgba(16,185,129,0.1)',
                      '0 0 20px rgba(16,185,129,0.2), inset 0 0 20px rgba(16,185,129,0.05)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  aria-hidden="true"
                />
              )}
              <Play className={cn('h-5 w-5', allChecked ? 'text-white' : 'text-zinc-500')} aria-hidden="true" />
              <span>Start Mission</span>
            </Button>

            <Button
              variant="ghost"
              onClick={handleCancel}
              aria-label="Cancel mission launch"
              className="w-full text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03]"
            >
              Cancel
            </Button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
