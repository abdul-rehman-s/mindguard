'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Timer,
  Target,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { FocusSession, Mission } from '@/types';

// ---- Animation variants ----
const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
};

// ---- Types ----
interface SessionWithMission extends FocusSession {
  mission: { id: string; title: string; priority: string } | null;
}

interface PaginatedResponse {
  sessions: SessionWithMission[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ---- Helpers ----
function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (isToday) return `Today at ${timeStr}`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday at ${timeStr}`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  }) + ` at ${timeStr}`;
}

function priorityVariant(priority: string) {
  switch (priority) {
    case 'high':
      return 'border-red-500/30 bg-red-500/[0.08] text-red-400';
    case 'medium':
      return 'border-amber-500/30 bg-amber-500/[0.08] text-amber-400';
    case 'low':
      return 'border-zinc-500/30 bg-zinc-500/[0.08] text-zinc-400';
    default:
      return 'border-zinc-500/30 bg-zinc-500/[0.08] text-zinc-400';
  }
}

// ---- Component ----
export function SessionHistoryView() {
  const [sessions, setSessions] = useState<SessionWithMission[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedMission, setSelectedMission] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const limit = 20;

  const fetchMissions = useCallback(async () => {
    try {
      const res = await fetch('/api/missions');
      if (res.ok) {
        const data = await res.json();
        setMissions(Array.isArray(data) ? data : []);
      }
    } catch {
      // Missions fetch failure is non-critical
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (selectedMission !== 'all') {
        params.set('missionId', selectedMission);
      }
      const res = await fetch(`/api/sessions?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch sessions');
      const data: PaginatedResponse = await res.json();
      setSessions(data.sessions);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      setError('Failed to load session history');
    } finally {
      setLoading(false);
    }
  }, [page, selectedMission]);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [selectedMission]);

  // ---- Render ----
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="app-grid-bg min-h-full -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
    >
      {/* Header */}
      <motion.div variants={item} className="mb-8 pt-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/[0.08]">
            <Clock className="h-5 w-5 text-emerald-400/80" />
          </div>
          <div>
            <h2 className="text-[1.65rem] font-semibold tracking-[-0.02em] text-zinc-100">
              Session History
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Review all your completed focus sessions.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <motion.div variants={item} className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-zinc-500">
          <Filter className="h-3.5 w-3.5" />
          <span className="text-xs font-medium uppercase tracking-wider">Filter</span>
        </div>

        <Select value={selectedMission} onValueChange={(val) => setSelectedMission(val)}>
          <SelectTrigger className="h-8 w-[200px] border-white/[0.08] bg-white/[0.02] text-xs text-zinc-300 hover:bg-white/[0.04] focus:ring-emerald-500/20 focus:border-emerald-500/30">
            <SelectValue placeholder="All Missions" />
          </SelectTrigger>
          <SelectContent className="border-white/[0.08] bg-zinc-900/95 backdrop-blur-xl">
            <SelectItem value="all" className="text-xs text-zinc-300 focus:bg-white/[0.06] focus:text-zinc-100">
              All Missions
            </SelectItem>
            {missions.map((m) => (
              <SelectItem key={m.id} value={m.id} className="text-xs text-zinc-300 focus:bg-white/[0.06] focus:text-zinc-100">
                {m.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!loading && (
          <span className="text-xs text-zinc-600">
            {total} {total === 1 ? 'session' : 'sessions'}
          </span>
        )}
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
        </div>
      ) : error ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <AlertCircle className="h-8 w-8 text-red-400/60" />
          <p className="text-sm text-zinc-400">{error}</p>
          <Button variant="ghost" size="sm" onClick={fetchSessions}>
            Try again
          </Button>
        </div>
      ) : sessions.length === 0 ? (
        <motion.div variants={item}>
          <Card className="card-glow border-dashed border-white/[0.06] bg-white/[0.01]">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03]">
                <Clock className="h-6 w-6 text-zinc-700" />
              </div>
              <p className="mb-1 text-sm font-medium text-zinc-400">No sessions yet</p>
              <p className="text-xs text-zinc-600">Complete a focus session to see it here.</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* Session List */}
          <motion.div variants={container} initial="hidden" animate="visible" className="flex flex-col gap-2">
            {sessions.map((session) => (
              <motion.div
                key={session.id}
                variants={item}
                whileHover={{ y: -1, transition: { duration: 0.15 } }}
              >
                <Card className="card-glow border-white/[0.06] bg-white/[0.02] overflow-hidden">
                  <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                    {/* Emerald accent bar for mission-linked sessions */}
                    {session.mission && (
                      <div className="flex h-full w-1 shrink-0 self-stretch rounded-full bg-emerald-500/40" />
                    )}

                    <div className="min-w-0 flex-1">
                      {/* Mission title + priority */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Target className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
                          <span className="truncate text-sm font-medium text-zinc-200">
                            {session.mission?.title || 'Free Focus'}
                          </span>
                        </div>
                        {session.mission?.priority && session.mission.priority !== 'medium' && (
                          <Badge
                            variant="outline"
                            className={cn('border text-[10px] font-medium capitalize', priorityVariant(session.mission.priority))}
                          >
                            {session.mission.priority}
                          </Badge>
                        )}
                      </div>

                      {/* Date and time */}
                      <p className="mt-1.5 text-[11px] text-zinc-600">
                        {formatDateTime(session.startedAt)}
                      </p>
                    </div>

                    {/* Duration */}
                    <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white/[0.03] px-3 py-1.5">
                      <Timer className="h-3 w-3 text-emerald-400/60" />
                      <span className="text-sm font-medium tabular-nums text-zinc-300">
                        {formatDuration(session.duration)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              variants={item}
              className="mt-6 flex items-center justify-center gap-4"
            >
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="h-8 gap-1.5 border border-white/[0.06] text-xs text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200 disabled:opacity-30"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Prev
              </Button>

              <span className="text-xs font-medium text-zinc-500">
                Page {page} of {totalPages}
              </span>

              <Button
                variant="ghost"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="h-8 gap-1.5 border border-white/[0.06] text-xs text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200 disabled:opacity-30"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
