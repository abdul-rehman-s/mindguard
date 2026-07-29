'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatDuration } from '@/lib/utils';
import {
  Play,
  Target,
  Settings2,
  X,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/stores/app-store';
import { MissionLaunch } from './mission-launch';
import { fadeInUp } from '@/lib/animations';
import type { Mission } from '@/types';

const PRESETS = [
  { label: '15 min', seconds: 900 },
  { label: '25 min', seconds: 1500 },
  { label: '45 min', seconds: 2700 },
  { label: '60 min', seconds: 3600 },
  { label: '90 min', seconds: 5400 },
];

// ---- Ambient Particles (reduced count: 20 → 12) ----
const ambientParticles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 15 + 10,
  delay: Math.random() * 5,
  opacity: Math.random() * 0.3 + 0.05,
}));

function AmbientParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {ambientParticles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-emerald-400"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [p.opacity, p.opacity * 2, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ---- Main Component ----
export function TimerView() {
  const activeMission = useAppStore(s => s.activeMission);
  const setActiveMission = useAppStore(s => s.setActiveMission);
  const setView = useAppStore(s => s.setView);
  const setFocusDuration = useAppStore(s => s.setFocusDuration);
  const setFocusMode = useAppStore(s => s.setFocusMode);
  const focusDuration = useAppStore(s => s.focusDuration);

  const [selectedPreset, setSelectedPreset] = useState(() => {
    const match = PRESETS.find(p => p.seconds === focusDuration);
    return match?.label || '25 min';
  });
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const [showLaunch, setShowLaunch] = useState(false);

  const fetchMissions = useCallback(async () => {
    try {
      const res = await fetch('/api/missions');
      if (res.status === 401) return; // Auth race — will be redirected
      if (!res.ok) return;
      const data: Mission[] = await res.json();
      const active = data.find((m) => m.status === 'active') || null;
      setActiveMission(active ? { ...active, focusSessions: [] } : null);
    } catch {
      // silent - non-critical fetch
    }
  }, [setActiveMission]);

  useEffect(() => { fetchMissions(); }, [fetchMissions]);

  const handlePresetChange = useCallback((value: string) => {
    const preset = PRESETS.find((p) => p.label === value);
    if (preset) {
      setFocusDuration(preset.seconds);
      setSelectedPreset(value);
      setShowCustomInput(false);
    }
  }, [setFocusDuration]);

  const handleCustomDuration = useCallback(() => {
    const mins = parseInt(customMinutes, 10);
    if (!mins || mins < 1 || mins > 180) return;
    const seconds = mins * 60;
    setFocusDuration(seconds);
    setSelectedPreset('custom');
    setShowCustomInput(false);
    setCustomMinutes('');
  }, [customMinutes, setFocusDuration]);

  const handleStart = useCallback(() => {
    setShowLaunch(true);
  }, []);

  const handleLaunchStart = useCallback(() => {
    setShowLaunch(false);
    setFocusMode('focus');
  }, [setFocusMode]);

  const handleLaunchCancel = useCallback(() => {
    setShowLaunch(false);
  }, []);

  const durationLabel = formatDuration(focusDuration);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="app-grid-bg relative flex min-h-full flex-col items-center -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
    >
      <AmbientParticles />

      {/* Mission indicator */}
      <AnimatePresence>
        {activeMission && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="mb-10 flex items-center gap-2.5 rounded-full border border-emerald-500/15 bg-emerald-500/[0.06] px-4 py-2 backdrop-blur-sm"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-breathe" aria-hidden="true" />
            <Target className="h-3.5 w-3.5 text-emerald-400/80" aria-hidden="true" />
            <span className="text-xs font-medium" style={{ color: 'rgba(52, 211, 153, 0.9)' }}>{activeMission.title}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Duration display ring */}
      <div className="relative mb-10 flex items-center justify-center">
        {/* Outer glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.02, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute h-56 w-56 rounded-full bg-emerald-500/15 blur-3xl sm:h-64 sm:w-64 md:h-72 md:w-72"
          aria-hidden="true"
        />

        <svg className="h-48 w-48 -rotate-90 sm:h-56 sm:w-56 md:h-64 md:w-64" viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" className="text-white/[0.04]" strokeWidth="3" />
          <circle
            cx="100" cy="100" r="90"
            fill="none"
            stroke="url(#timer-grad-idle)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 90}
            strokeDashoffset={0}
          />
          <defs>
            <linearGradient id="timer-grad-idle" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute flex flex-col items-center" aria-live="polite" role="timer">
          <Clock className="mb-3 h-8 w-8 text-emerald-500/40" aria-hidden="true" />
          <motion.span
            className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl md:text-5xl tabular-nums"
          >
            {durationLabel}
          </motion.span>
          <span className="mt-2 text-[11px] font-medium uppercase tracking-widest text-zinc-500">
            Session Duration
          </span>
        </div>
      </div>

      {/* Start button */}
      <div className="mb-10">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleStart}
            aria-label="Start focus session"
            className="btn-glow h-12 w-52 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-emerald-500/30"
          >
            <Play className="mr-2 h-5 w-5" aria-hidden="true" />
            Start Focus
          </Button>
        </motion.div>
      </div>

      {/* Duration Presets */}
      <Card className="card-glow w-full max-w-sm border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Session Duration</p>
            <button
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="flex items-center gap-1.5 text-[11px] text-zinc-600 transition-colors hover:text-zinc-400"
              aria-label={showCustomInput ? 'Close custom duration input' : 'Open custom duration input'}
            >
              {showCustomInput ? <X className="h-3 w-3" /> : <Settings2 className="h-3 w-3" />}
              {showCustomInput ? 'Close' : 'Custom'}
            </button>
          </div>

          {/* Custom duration input */}
          <AnimatePresence>
            {showCustomInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mb-4 flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="180"
                    placeholder="Min (1-180)"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCustomDuration()}
                    aria-label="Custom duration in minutes"
                    className="h-9 w-32 border-white/[0.06] bg-white/[0.03] text-sm text-zinc-200 placeholder:text-zinc-600 focus-visible:border-emerald-500/40 focus-visible:ring-emerald-500/20"
                  />
                  <Button
                    onClick={handleCustomDuration}
                    size="sm"
                    aria-label="Set custom duration"
                    className="h-9 bg-emerald-500/80 text-white hover:bg-emerald-500"
                  >
                    Set
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <motion.button
                key={preset.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePresetChange(preset.label)}
                aria-label={`Set duration to ${preset.label}`}
                className={cn(
                  'rounded-lg px-3.5 py-2 text-xs font-medium transition-all duration-200',
                  selectedPreset === preset.label
                    ? 'bg-emerald-500/10 text-emerald-400 shadow-sm shadow-emerald-500/10 ring-1 ring-emerald-500/20'
                    : 'bg-white/[0.03] text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300'
                )}
              >
                {preset.label}
              </motion.button>
            ))}
            {selectedPreset === 'custom' && (
              <div className="flex items-center rounded-lg bg-emerald-500/10 px-3.5 py-2 text-xs font-medium text-emerald-400 shadow-sm shadow-emerald-500/10 ring-1 ring-emerald-500/20">
                {Math.round(focusDuration / 60)} min
              </div>
            )}
          </div>

          {!activeMission && (
            <div className="mt-5 rounded-xl border border-dashed border-white/[0.06] bg-white/[0.01] p-4">
              <p className="text-xs leading-relaxed text-zinc-500">
                No active mission.{' '}
                <button
                  className="font-medium text-emerald-400/80 hover:text-emerald-300"
                  onClick={() => setView('mission')}
                  aria-label="Go to missions view"
                >
                  Create one
                </button>{' '}
                to track your focus.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mission Launch Overlay */}
      <AnimatePresence>
        {showLaunch && (
          <MissionLaunch
            missionTitle={activeMission?.title || null}
            duration={Math.round(focusDuration / 60)}
            onStart={handleLaunchStart}
            onCancel={handleLaunchCancel}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
