'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Clock, Zap, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/app-store';
import { formatDuration } from '@/lib/utils';

// Reduced confetti particles: 60 → 30 for performance
const confettiParticles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: (Math.random() - 0.5) * 400,
  y: -(Math.random() * 300 + 100),
  rotate: Math.random() * 720 - 360,
  scale: Math.random() * 0.6 + 0.4,
  delay: Math.random() * 0.5,
  color: ['#10b981', '#14b8a6', '#34d399', '#6ee7b7', '#fbbf24', '#f59e0b', '#a78bfa'][i % 7],
  shape: i % 3 === 0 ? 'circle' : i % 3 === 1 ? 'rect' : 'diamond',
}));

interface CelebrationScreenProps {
  duration: number;
  missionTitle: string | null;
  onExit: () => void;
}

export function CelebrationScreen({ duration, missionTitle, onExit }: CelebrationScreenProps) {
  const stats = useAppStore(s => s.stats);
  const setView = useAppStore(s => s.setView);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-zinc-950 overflow-hidden"
      role="alert"
      aria-live="assertive"
      aria-label="Session complete celebration"
    >
      {/* Confetti */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {confettiParticles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
            animate={{
              x: p.x, y: p.y,
              opacity: [1, 1, 1, 0],
              scale: [0, p.scale, p.scale, p.scale * 0.5],
              rotate: p.rotate,
            }}
            transition={{ duration: 2, delay: p.delay, ease: 'easeOut' }}
            className="absolute left-1/2 top-1/2"
            style={{
              width: p.shape === 'circle' ? 10 : p.shape === 'rect' ? 12 : 8,
              height: p.shape === 'circle' ? 10 : p.shape === 'rect' ? 6 : 8,
              backgroundColor: p.color,
              borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'rect' ? '2px' : '2px',
              transform: p.shape === 'diamond' ? 'rotate(45deg)' : undefined,
            }}
          />
        ))}
      </div>

      {/* Glow */}
      <motion.div
        className="pointer-events-none absolute h-[500px] w-[500px] rounded-full bg-emerald-500/[0.1] blur-[150px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
        aria-hidden="true"
      />

      {showContent && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 flex flex-col items-center text-center px-6">
          {/* Trophy */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/15 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500/20"
          >
            <Trophy className="h-10 w-10 text-emerald-400" />
          </motion.div>

          <h2 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">Mission Complete</h2>
          <p className="mb-8 text-sm text-zinc-400">Great work staying focused.</p>

          {/* Stats grid */}
          <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex flex-col items-center rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 sm:px-5">
              <Clock className="mb-2 h-4 w-4 text-emerald-400/70" aria-hidden="true" />
              <span className="text-lg font-semibold text-zinc-100 tabular-nums" aria-live="polite">{formatDuration(duration)}</span>
              <span className="mt-0.5 text-[10px] text-zinc-500">Focus Time</span>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 sm:px-5">
              <Zap className="mb-2 h-4 w-4 text-emerald-400/70" aria-hidden="true" />
              <span className="text-lg font-semibold text-zinc-100 tabular-nums" aria-live="polite">{stats?.focusScore || 0}</span>
              <span className="mt-0.5 text-[10px] text-zinc-500">Focus Score</span>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 sm:px-5">
              <Flame className="mb-2 h-4 w-4 text-emerald-400/70" aria-hidden="true" />
              <span className="text-lg font-semibold text-zinc-100 tabular-nums" aria-live="polite">{stats?.currentStreak || 0}</span>
              <span className="mt-0.5 text-[10px] text-zinc-500">Day Streak</span>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 sm:px-5">
              <Trophy className="mb-2 h-4 w-4 text-emerald-400/70" aria-hidden="true" />
              <span className="text-sm font-medium text-zinc-100 truncate max-w-[100px]">{missionTitle || 'Free Focus'}</span>
              <span className="mt-0.5 text-[10px] text-zinc-500">Mission</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => { setView('reflection'); onExit(); }}
              variant="outline" className="gap-2 border-white/[0.08] bg-white/[0.02] text-zinc-300 hover:bg-white/[0.04] hover:text-zinc-100"
              aria-label="Go to reflection"
            >
              <BookOpen className="h-4 w-4" /> Reflect
            </Button>
            <Button
              onClick={() => { setView('timer'); onExit(); }}
              className="gap-2 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-emerald-500"
              aria-label="Start another session"
            >
              Start Another <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => { setView('dashboard'); onExit(); }}
              variant="ghost" className="text-zinc-500 hover:text-zinc-200"
              aria-label="Return to dashboard"
            >
              Dashboard
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
