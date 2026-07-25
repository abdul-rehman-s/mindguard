'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Pause, Play, Square } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { CelebrationScreen } from './celebration-screen';
import { AudioPlayer } from './audio-player';

const particles = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 12 + 8,
  delay: Math.random() * 5,
  opacity: Math.random() * 0.25 + 0.05,
}));

function formatTime(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = clamped % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface FocusModeProps {
  duration: number;
  missionTitle: string | null;
  onExit: () => void;
}

export function FocusMode({ duration: initialDuration, missionTitle, onExit }: FocusModeProps) {
  const { setFocusMode, setLastSessionResult } = useAppStore();

  // ── Display state (drives UI only) ──
  const [tick, setTick] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ duration: number; mission: string | null }>({ duration: 0, mission: null });
  const [saving, setSaving] = useState(false);

  // ── Wall-clock timing refs (source of truth) ──
  const sessionStartedAtRef = useRef<number>(0);   // Date.now() when session first started
  const pausedAtRef = useRef<number>(0);            // Date.now() when last paused
  const totalPausedMsRef = useRef<number>(0);       // accumulated ms spent paused
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);
  const onExitRef = useRef(onExit);
  const missionTitleRef = useRef(missionTitle);
  const durationRef = useRef(initialDuration);

  onExitRef.current = onExit;
  missionTitleRef.current = missionTitle;
  durationRef.current = initialDuration;

  // ── Calculate real elapsed seconds from wall clock ──
  const getElapsedSeconds = useCallback(() => {
    if (sessionStartedAtRef.current === 0) return 0;
    if (isPaused) {
      // While paused, freeze at the moment we paused
      return Math.floor((pausedAtRef.current - sessionStartedAtRef.current - totalPausedMsRef.current) / 1000);
    }
    return Math.floor((Date.now() - sessionStartedAtRef.current - totalPausedMsRef.current) / 1000);
  }, [isPaused]);

  const elapsedSeconds = getElapsedSeconds();
  const remaining = Math.max(durationRef.current - elapsedSeconds, 0);
  const progress = durationRef.current > 0 ? Math.min((elapsedSeconds / durationRef.current) * 100, 100) : 0;

  // ── Start / resume interval ──
  const startInterval = useCallback(() => {
    // Always clear first to prevent duplicates
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    console.log('[FocusTimer] ▶ Timer interval started');
    intervalRef.current = setInterval(() => {
      setTick((t) => t + 1);
    }, 200); // 200ms for smooth display, elapsed calculated from Date.now()
  }, []);

  // ── Stop interval ──
  const stopInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('[FocusTimer] ⏹ Timer interval cleared');
    }
  }, []);

  // ── Boot: start session on mount ──
  useEffect(() => {
    sessionStartedAtRef.current = Date.now();
    totalPausedMsRef.current = 0;
    pausedAtRef.current = 0;
    completedRef.current = false;
    console.log('[FocusTimer] 🚀 Session started at', new Date(sessionStartedAtRef.current).toISOString());
    startInterval();
    return () => {
      stopInterval();
      console.log('[FocusTimer] 🔧 Unmount cleanup');
    };
  }, [startInterval, stopInterval]);

  // ── Auto-complete when time runs out ──
  useEffect(() => {
    if (remaining <= 0 && sessionStartedAtRef.current > 0 && !completedRef.current && elapsedSeconds >= 5) {
      completedRef.current = true;
      stopInterval();
      const finalElapsed = getElapsedSeconds();
      console.log('[FocusTimer] ✅ Timer completed! Elapsed:', finalElapsed, 'seconds');
      saveAndFinishRef.current(true, finalElapsed);
    }
  });

  // ── Pause / Resume handler ──
  const handleTogglePause = useCallback(() => {
    if (isPaused) {
      // ── Resume ──
      const pauseDuration = Date.now() - pausedAtRef.current;
      totalPausedMsRef.current += pauseDuration;
      console.log('[FocusTimer] ▶ Resumed after', Math.round(pauseDuration / 1000), 's pause. Total paused:', Math.round(totalPausedMsRef.current / 1000), 's');
      setIsPaused(false);
      startInterval();
    } else {
      // ── Pause ──
      pausedAtRef.current = Date.now();
      console.log('[FocusTimer] ⏸ Paused at elapsed:', getElapsedSeconds(), 's');
      setIsPaused(true);
      stopInterval();
    }
  }, [isPaused, getElapsedSeconds, startInterval, stopInterval]);

  // ── Save session (defined before effects that use it) ──
  const saveAndFinishRef = useRef<(showCeleb: boolean, forcedElapsed?: number) => Promise<void>>(
    async () => {}
  );

  const saveAndFinish = useCallback(async (showCeleb: boolean, forcedElapsed?: number) => {
    stopInterval();
    const realElapsed = forcedElapsed ?? getElapsedSeconds();
    const endNow = Date.now();
    const computedDuration = Math.floor((endNow - sessionStartedAtRef.current - totalPausedMsRef.current) / 1000);
    console.log('[FocusTimer] 💾 Saving session.');
    console.log('[FocusTimer]   startTime =', sessionStartedAtRef.current, '→', new Date(sessionStartedAtRef.current).toISOString());
    console.log('[FocusTimer]   endTime   =', endNow, '→', new Date(endNow).toISOString());
    console.log('[FocusTimer]   pausedMs  =', totalPausedMsRef.current, 'ms');
    console.log('[FocusTimer]   computed  = Math.floor((Date.now() - startTime - pausedMs) / 1000) =', computedDuration, 's');
    console.log('[FocusTimer]   sending   duration:', realElapsed, 's (', formatTime(realElapsed), ')');

    if (realElapsed < 5) {
      console.log('[FocusTimer] ⚠️ Session too short (<5s), discarding');
      onExitRef.current();
      return;
    }

    setSaving(true);
    try {
      const endedAt = new Date();
      const startedAt = new Date(sessionStartedAtRef.current);
      const { activeMission } = useAppStore.getState();

      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missionId: activeMission?.id || null,
          duration: realElapsed,
          startedAt: startedAt.toISOString(),
          endedAt: endedAt.toISOString(),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const title = missionTitleRef.current || activeMission?.title || null;
      if (showCeleb) {
        setCelebrationData({ duration: realElapsed, mission: title });
        setLastSessionResult({ duration: realElapsed, missionTitle: title });
        setShowCelebration(true);
      } else {
        toast.success(`Session saved — ${formatTime(realElapsed)}`);
        onExitRef.current();
      }
      console.log('[FocusTimer] ✅ Session saved successfully:', realElapsed, 's');
    } catch (err) {
      console.error('[FocusTimer] ❌ Save failed:', err);
      toast.error('Failed to save session');
      onExitRef.current();
    } finally {
      setSaving(false);
    }
  }, [getElapsedSeconds, setLastSessionResult, stopInterval]);

  // Keep ref in sync so the auto-complete effect can call the latest version
  saveAndFinishRef.current = saveAndFinish;

  // ── Stop handler ──
  const handleStop = useCallback(() => {
    console.log('[FocusTimer] ⏹ Stop requested. Real elapsed:', getElapsedSeconds(), 's');
    saveAndFinish(false);
  }, [getElapsedSeconds, saveAndFinish]);

  // ── Keyboard: ESC to stop ──
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); handleStop(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleStop]);

  // ── Celebration screen ──
  if (showCelebration) {
    return (
      <CelebrationScreen
        duration={celebrationData.duration}
        missionTitle={celebrationData.mission}
        onExit={() => { setShowCelebration(false); setFocusMode('idle'); }}
      />
    );
  }

  const circumference = 2 * Math.PI * 120;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-zinc-950 overflow-hidden"
    >
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-emerald-500/[0.06] blur-[150px]" />
      </div>

      {/* Particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-emerald-400"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
            animate={{
              y: [0, -40, 0], x: [0, Math.random() * 30 - 15, 0],
              opacity: [p.opacity, p.opacity * 2.5, p.opacity],
            }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Breathing glow */}
      <motion.div
        className="pointer-events-none absolute h-80 w-80 rounded-full bg-emerald-500/[0.08] blur-[100px]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Mission title */}
      <AnimatePresence>
        {missionTitle && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-8 left-0 right-0 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/[0.06] px-4 py-1.5 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-emerald-400/90">{missionTitle}</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer ring */}
      <div className="relative mb-8 flex items-center justify-center">
        <svg className="h-72 w-72 -rotate-90" viewBox="0 0 260 260">
          <circle cx="130" cy="130" r="120" fill="none" stroke="currentColor" className="text-white/[0.03]" strokeWidth="3" />
          <motion.circle
            cx="130" cy="130" r="120" fill="none" stroke="url(#focus-grad)" strokeWidth="3" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress / 100)}
            style={{ filter: 'drop-shadow(0 0 12px rgba(16,185,129,0.5))' }}
          />
          <defs>
            <linearGradient id="focus-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="font-mono text-6xl font-light tracking-tight text-emerald-50 tabular-nums sm:text-7xl">
            {formatTime(remaining)}
          </span>
          <span className="mt-2 text-[11px] font-medium uppercase tracking-widest text-emerald-400/50">
            {isPaused ? 'Paused' : 'Deep Focus'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleTogglePause}
          className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-zinc-300 transition-colors hover:bg-white/[0.06]"
          aria-label={isPaused ? 'Resume timer' : 'Pause timer'}
        >
          {isPaused ? <Play className="h-5 w-5 text-amber-400" /> : <Pause className="h-5 w-5" />}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStop}
          disabled={saving}
          className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] text-zinc-500 transition-colors hover:border-red-500/30 hover:bg-red-500/[0.06] hover:text-red-400"
          aria-label="Stop session"
        >
          <Square className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Audio Player */}
      <AudioPlayer />

      {/* ESC hint */}
      <div className="absolute bottom-8 right-8">
        <span className="text-[10px] text-zinc-700">
          <kbd className="rounded border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 text-[9px]">ESC</kbd> to exit
        </span>
      </div>

      {saving && (
        <div className="absolute top-8 right-8 flex items-center gap-2 text-xs text-zinc-400">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          Saving...
        </div>
      )}
    </motion.div>
  );
}
