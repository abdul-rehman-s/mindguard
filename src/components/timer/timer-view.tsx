'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Play,
  Pause,
  Square,
  Target,
  Loader2,
  AlertCircle,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import type { TimerState, Mission } from '@/types';

const PRESETS = [
  { label: '15 min', seconds: 900 },
  { label: '25 min', seconds: 1500 },
  { label: '45 min', seconds: 2700 },
  { label: '60 min', seconds: 3600 },
  { label: '90 min', seconds: 5400 },
];

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const particles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: (Math.random() - 0.5) * 200,
  y: -(Math.random() * 150 + 50),
  rotate: Math.random() * 360,
  scale: Math.random() * 0.5 + 0.5,
  delay: Math.random() * 0.3,
}));

function CelebrationOverlay({ show, duration }: { show: boolean; duration: string }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
          className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center"
        >
          {/* Particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
              animate={{
                x: p.x,
                y: p.y,
                opacity: [1, 1, 0],
                scale: [0, p.scale, p.scale],
                rotate: p.rotate,
              }}
              transition={{ duration: 1.2, delay: p.delay, ease: 'easeOut' }}
              className="absolute h-2 w-2 rounded-full bg-emerald-400"
              style={{
                background: p.id % 3 === 0 ? '#10b981' : p.id % 3 === 1 ? '#14b8a6' : '#34d399',
              }}
            />
          ))}
          {/* Trophy Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
            className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 shadow-lg shadow-emerald-500/20"
          >
            <Trophy className="h-8 w-8 text-emerald-400" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg font-semibold text-zinc-100"
          >
            Session Complete!
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-zinc-400"
          >
            {duration} of deep focus
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function TimerView() {
  const { activeMission, setActiveMission, setView } = useAppStore();
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(1500);
  const [selectedPreset, setSelectedPreset] = useState('25 min');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationDuration, setCelebrationDuration] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<string>('');

  const fetchMissions = useCallback(async () => {
    try {
      const res = await fetch('/api/missions');
      if (!res.ok) return;
      const data: Mission[] = await res.json();
      const active = data.find((m) => m.status === 'active') || null;
      setActiveMission(active ? { ...active, focusSessions: [] } : null);
    } catch {
      // silent
    }
  }, [setActiveMission]);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  // Dismiss celebration after 3s
  useEffect(() => {
    if (showCelebration) {
      const t = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(t);
    }
  }, [showCelebration]);

  useEffect(() => {
    if (timerState === 'running') {
      if (!startTimeRef.current) {
        startTimeRef.current = new Date().toISOString();
      }
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev >= duration) {
            // We'll handle stop in the next tick via a separate effect
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerState, duration]);

  // Auto-stop when elapsed reaches duration
  const elapsedRef = useRef(elapsed);
  elapsedRef.current = elapsed;
  const durationRef = useRef(duration);
  durationRef.current = duration;

  useEffect(() => {
    if (timerState === 'running' && elapsedRef.current >= durationRef.current && elapsedRef.current >= 5) {
      handleStop();
    }
  }, [elapsed, timerState]);

  const handleStart = () => {
    setTimerState('running');
    setError('');
  };

  const handlePause = () => {
    setTimerState('paused');
  };

  const handleStop = useCallback(async () => {
    setTimerState('idle');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (elapsed < 5) {
      setElapsed(0);
      startTimeRef.current = '';
      return;
    }

    setSaving(true);
    try {
      const now = new Date();
      const start = startTimeRef.current ? new Date(startTimeRef.current) : new Date(now.getTime() - elapsed * 1000);
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missionId: activeMission?.id || null,
          duration: elapsed,
          startedAt: start.toISOString(),
          endedAt: now.toISOString(),
        }),
      });
      if (!res.ok) throw new Error('Failed to save session');
      toast.success(`Session saved — ${formatTime(elapsed)} of focus`, {
        description: activeMission ? activeMission.title : 'Free focus session',
      });
      // Show celebration
      setCelebrationDuration(formatTime(elapsed));
      setShowCelebration(true);
      setElapsed(0);
      startTimeRef.current = '';
    } catch {
      toast.error('Failed to save session');
    } finally {
      setSaving(false);
    }
  }, [elapsed, activeMission]);

  const handlePresetChange = (value: string) => {
    if (timerState !== 'idle') return;
    const preset = PRESETS.find((p) => p.label === value);
    if (preset) {
      setDuration(preset.seconds);
      setSelectedPreset(value);
    }
  };

  const progress = duration > 0 ? (elapsed / duration) * 100 : 0;
  const isIdle = timerState === 'idle';
  const isRunning = timerState === 'running';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="app-grid-bg relative flex min-h-full flex-col items-center -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
    >
      {/* Celebration Overlay */}
      <CelebrationOverlay show={showCelebration} duration={celebrationDuration} />

      {/* Mission indicator */}
      <AnimatePresence>
        {activeMission && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="mb-10 flex items-center gap-2.5 rounded-full border border-emerald-500/15 bg-emerald-500/[0.06] px-4 py-2 backdrop-blur-sm"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-breathe" />
            <Target className="h-3.5 w-3.5 text-emerald-400/80" />
            <span className="text-xs font-medium text-zinc-300" style={{ color: 'rgba(52, 211, 153, 0.9)' }}>{activeMission.title}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer Ring */}
      <div className="relative mb-10 flex items-center justify-center">
        {/* Outer glow when running */}
        {isRunning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: [0.15, 0.25, 0.15], scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl sm:h-80 sm:w-80"
          />
        )}

        <svg className="h-64 w-64 -rotate-90 sm:h-72 sm:w-72" viewBox="0 0 200 200">
          {/* Track */}
          <circle
            cx="100" cy="100" r="90"
            fill="none"
            stroke="currentColor"
            className="text-white/[0.04]"
            strokeWidth="3"
          />
          {/* Progress */}
          <motion.circle
            cx="100" cy="100" r="90"
            fill="none"
            stroke={isRunning ? 'url(#timer-gradient)' : 'url(#timer-gradient-idle)'}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 90}
            strokeDashoffset={2 * Math.PI * 90 * (1 - progress / 100)}
            initial={false}
            animate={{ strokeDashoffset: 2 * Math.PI * 90 * (1 - progress / 100) }}
            transition={{ duration: 0.3, ease: 'linear' }}
            style={isRunning ? { filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.4))' } : undefined}
          />
          <defs>
            <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
            <linearGradient id="timer-gradient-idle" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute flex flex-col items-center">
          <motion.span
            key={elapsed}
            initial={false}
            className={cn(
              'font-mono text-5xl font-light tracking-tight sm:text-6xl tabular-nums transition-colors duration-500',
              isRunning ? 'text-emerald-50' : isIdle ? 'text-zinc-200' : 'text-zinc-100'
            )}
          >
            {formatTime(elapsed)}
          </motion.span>
          <motion.span
            key={timerState}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'mt-1.5 text-[11px] font-medium uppercase tracking-widest',
              isRunning ? 'text-emerald-400/60' : 'text-zinc-600'
            )}
          >
            {timerState === 'idle' ? 'Ready' : timerState === 'running' ? 'Focusing' : 'Paused'}
          </motion.span>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-10 flex items-center gap-3">
        {isIdle ? (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleStart}
              className="btn-glow h-12 w-52 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-emerald-500/30"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Focus
            </Button>
          </motion.div>
        ) : (
          <>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={timerState === 'running' ? handlePause : handleStart}
                variant="outline"
                className="h-12 w-52 border-white/[0.08] text-zinc-200 hover:bg-white/[0.04] hover:text-white"
              >
                {timerState === 'running' ? (
                  <><Pause className="mr-2 h-5 w-5" />Pause</>
                ) : (
                  <><Play className="mr-2 h-5 w-5" />Resume</>
                )}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleStop}
                variant="outline"
                className="h-12 w-12 border-white/[0.06] text-zinc-500 hover:border-red-500/30 hover:bg-red-500/[0.06] hover:text-red-400"
              >
                <Square className="h-4 w-4" />
              </Button>
            </motion.div>
          </>
        )}
      </div>

      {saving && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 flex items-center gap-2 text-xs text-zinc-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Saving session...
        </motion.div>
      )}

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 flex items-center gap-2 text-xs text-red-400">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </motion.div>
      )}

      {/* Duration Presets */}
      <Card className="card-glow w-full max-w-sm border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-5">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Session Duration</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <motion.button
                key={preset.label}
                whileHover={isIdle ? { scale: 1.05 } : undefined}
                whileTap={isIdle ? { scale: 0.95 } : undefined}
                disabled={!isIdle}
                onClick={() => {
                  setDuration(preset.seconds);
                  setSelectedPreset(preset.label);
                }}
                className={cn(
                  'rounded-lg px-3.5 py-2 text-xs font-medium transition-all duration-200',
                  selectedPreset === preset.label && isIdle
                    ? 'bg-emerald-500/10 text-emerald-400 shadow-sm shadow-emerald-500/10 ring-1 ring-emerald-500/20'
                    : 'bg-white/[0.03] text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300',
                  !isIdle && 'opacity-40 cursor-not-allowed'
                )}
              >
                {preset.label}
              </motion.button>
            ))}
          </div>

          {!activeMission && isIdle && (
            <div className="mt-5 rounded-xl border border-dashed border-white/[0.06] bg-white/[0.01] p-4">
              <p className="text-xs leading-relaxed text-zinc-500">
                No active mission.{' '}
                <button
                  className="font-medium text-emerald-400/80 hover:text-emerald-300"
                  onClick={() => setView('mission')}
                >
                  Create one
                </button>{' '}
                to track your focus.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
