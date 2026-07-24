'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Square,
  Timer,
  Target,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

export function TimerView() {
  const { activeMission, setActiveMission, setView } = useAppStore();
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(1500);
  const [selectedPreset, setSelectedPreset] = useState('25 min');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
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

  useEffect(() => {
    if (timerState === 'running') {
      if (!startTimeRef.current) {
        startTimeRef.current = new Date().toISOString();
      }
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev >= duration) {
            handleStop();
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
  }, [timerState]);

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
      setElapsed(0);
      startTimeRef.current = '';
    } catch {
      setError('Failed to save session');
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center"
    >
      {/* Mission indicator */}
      {activeMission && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5"
        >
          <Target className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-xs font-medium text-emerald-400">{activeMission.title}</span>
        </motion.div>
      )}

      {/* Timer Display */}
      <div className="relative mb-8 flex items-center justify-center">
        {/* Ring */}
        <svg className="h-64 w-64 -rotate-90 sm:h-72 sm:w-72" viewBox="0 0 200 200">
          <circle
            cx="100" cy="100" r="90"
            fill="none"
            stroke="currentColor"
            className="text-zinc-800/50"
            strokeWidth="4"
          />
          <motion.circle
            cx="100" cy="100" r="90"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 90}
            strokeDashoffset={2 * Math.PI * 90 * (1 - progress / 100)}
            initial={false}
            animate={{ strokeDashoffset: 2 * Math.PI * 90 * (1 - progress / 100) }}
            transition={{ duration: 0.3, ease: 'linear' }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={elapsed}
              initial={false}
              className="font-mono text-5xl font-light tracking-tight text-zinc-100 sm:text-6xl"
            >
              {formatTime(elapsed)}
            </motion.span>
          </AnimatePresence>
          <span className="mt-1 text-xs text-zinc-500">
            {timerState === 'idle' ? 'ready' : timerState === 'running' ? 'focusing' : 'paused'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-8 flex items-center gap-3">
        {isIdle ? (
          <Button
            onClick={handleStart}
            className="h-12 w-48 bg-emerald-500 text-white hover:bg-emerald-600"
          >
            <Play className="mr-2 h-5 w-5" />
            Start Focus
          </Button>
        ) : (
          <>
            <Button
              onClick={timerState === 'running' ? handlePause : handleStart}
              variant="outline"
              className="h-12 w-48 border-zinc-700 text-zinc-200 hover:bg-zinc-800"
            >
              {timerState === 'running' ? (
                <><Pause className="mr-2 h-5 w-5" />Pause</>
              ) : (
                <><Play className="mr-2 h-5 w-5" />Resume</>
              )}
            </Button>
            <Button
              onClick={handleStop}
              variant="outline"
              className="h-12 w-12 border-zinc-700 text-zinc-400 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
            >
              <Square className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>

      {saving && (
        <div className="mb-4 flex items-center gap-2 text-xs text-zinc-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Saving session...
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-2 text-xs text-red-400">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </div>
      )}

      {/* Duration Preset */}
      <Card className="w-full max-w-sm border-zinc-800/50 bg-zinc-900/30">
        <CardContent className="p-4">
          <p className="mb-3 text-xs font-medium text-zinc-400">Session Duration</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                disabled={!isIdle}
                onClick={() => {
                  setDuration(preset.seconds);
                  setSelectedPreset(preset.label);
                }}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                  selectedPreset === preset.label && isIdle
                    ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30'
                    : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300',
                  !isIdle && 'opacity-50 cursor-not-allowed'
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {!activeMission && isIdle && (
            <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-800/30 p-3">
              <p className="text-xs text-zinc-500">
                No active mission.{' '}
                <button
                  className="font-medium text-emerald-400 hover:text-emerald-300"
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
