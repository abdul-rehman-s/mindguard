'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Pause, Play, Square, Volume2, VolumeX, CloudRain, TreePine, Coffee, Waves, Sailboat } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import { CelebrationScreen } from './celebration-screen';

const AMBIENT_SOUNDS = [
  { id: 'none', label: 'None', icon: VolumeX },
  { id: 'rain', label: 'Rain', icon: CloudRain },
  { id: 'forest', label: 'Forest', icon: TreePine },
  { id: 'cafe', label: 'Cafe', icon: Coffee },
  { id: 'brown', label: 'Brown Noise', icon: Waves },
  { id: 'ocean', label: 'Ocean', icon: Sailboat },
] as const;

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
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
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
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ duration: number; mission: string | null }>({ duration: 0, mission: null });
  const [showSounds, setShowSounds] = useState(false);
  const [selectedSound, setSelectedSound] = useState('none');
  const [saving, setSaving] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef('');
  const elapsedRef = useRef(0);
  const durationRef = useRef(initialDuration);
  const onExitRef = useRef(onExit);
  const missionTitleRef = useRef(missionTitle);

  onExitRef.current = onExit;
  missionTitleRef.current = missionTitle;
  durationRef.current = initialDuration;

  // Timer tick
  useEffect(() => {
    if (!startTimeRef.current) startTimeRef.current = new Date().toISOString();
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        if (prev >= initialDuration) return prev;
        return prev + 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [initialDuration]);

  // Sync ref
  useEffect(() => { elapsedRef.current = elapsed; }, [elapsed]);

  const saveAndFinish = useCallback(async (showCeleb: boolean) => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    const currentElapsed = elapsedRef.current;
    if (currentElapsed < 5) { onExitRef.current(); return; }
    setSaving(true);
    try {
      const now = new Date();
      const start = startTimeRef.current ? new Date(startTimeRef.current) : new Date(now.getTime() - currentElapsed * 1000);
      const { activeMission } = useAppStore.getState();
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missionId: activeMission?.id || null,
          duration: currentElapsed,
          startedAt: start.toISOString(),
          endedAt: now.toISOString(),
        }),
      });
      if (!res.ok) throw new Error();
      const title = missionTitleRef.current || activeMission?.title || null;
      if (showCeleb) {
        setCelebrationData({ duration: currentElapsed, mission: title });
        setLastSessionResult({ duration: currentElapsed, missionTitle: title });
        setShowCelebration(true);
      } else {
        toast.success(`Session saved — ${formatTime(currentElapsed)}`);
        onExitRef.current();
      }
    } catch {
      toast.error('Failed to save session');
      onExitRef.current();
    } finally {
      setSaving(false);
    }
  }, [setLastSessionResult]);

  // Auto-complete when time is up
  const completedRef = useRef(false);
  useEffect(() => {
    if (elapsed >= initialDuration && elapsed >= 5 && !completedRef.current) {
      completedRef.current = true;
      saveAndFinish(true);
    }
  }, [elapsed, initialDuration, saveAndFinish]);

  const handleStop = useCallback(() => { saveAndFinish(false); }, [saveAndFinish]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); handleStop(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleStop]);

  const progress = initialDuration > 0 ? (elapsed / initialDuration) * 100 : 0;
  const remaining = Math.max(initialDuration - elapsed, 0);
  const circumference = 2 * Math.PI * 120;

  if (showCelebration) {
    return <CelebrationScreen duration={celebrationData.duration} missionTitle={celebrationData.mission} onExit={() => { setShowCelebration(false); setFocusMode('idle'); }} />;
  }

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
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setIsPaused(!isPaused)}
          className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-zinc-300 transition-colors hover:bg-white/[0.06]"
        >
          {isPaused ? <Play className={cn('h-5 w-5 text-amber-400')} /> : <Pause className={cn('h-5 w-5')} />}
        </motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={handleStop} disabled={saving}
          className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] text-zinc-500 transition-colors hover:border-red-500/30 hover:bg-red-500/[0.06] hover:text-red-400"
        >
          <Square className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Sound selector */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSounds(!showSounds)}
          className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-xs text-zinc-500 transition-colors hover:bg-white/[0.05] hover:text-zinc-300"
        >
          {selectedSound === 'none' ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-emerald-400" />}
          {selectedSound === 'none' ? 'Ambient Sound' : AMBIENT_SOUNDS.find(s => s.id === selectedSound)?.label}
        </motion.button>
        <AnimatePresence>
          {showSounds && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              className="absolute bottom-12 flex gap-2 rounded-xl border border-white/[0.08] bg-zinc-900/95 p-2 backdrop-blur-xl"
            >
              {AMBIENT_SOUNDS.map((sound) => {
                const Icon = sound.id === 'none' ? VolumeX : sound.id === 'rain' ? CloudRain : sound.id === 'forest' ? TreePine : sound.id === 'cafe' ? Coffee : sound.id === 'brown' ? Waves : Sailboat;
                return (
                  <button key={sound.id} onClick={() => { setSelectedSound(sound.id); setShowSounds(false); }}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                      selectedSound === sound.id ? 'bg-emerald-500/10 text-emerald-300' : 'text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" /> {sound.label}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ESC hint */}
      <div className="absolute bottom-8 right-8">
        <span className="text-[10px] text-zinc-700"><kbd className="rounded border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 text-[9px]">ESC</kbd> to exit</span>
      </div>

      {saving && <div className="absolute top-8 right-8 flex items-center gap-2 text-xs text-zinc-400"><span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" /> Saving...</div>}
    </motion.div>
  );
}
