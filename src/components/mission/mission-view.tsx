'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Target,
  Plus,
  Pencil,
  Check,
  Trash2,
  Loader2,
  AlertCircle,
  Clock,
  Timer,
  ChevronDown,
  Flame,
  Sparkles,
  Zap,
  BookOpen,
  Code,
  Rocket,
  Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/stores/app-store';
import { cn, formatDuration } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/animations';
import type { MissionPriority, MissionWithSessions } from '@/types';

// Using shared staggerContainer/staggerItem from @/lib/animations

const priorityConfig: Record<MissionPriority, { label: string; class: string }> = {
  high: { label: 'High', class: 'bg-red-500/10 text-red-400 border-red-500/20' },
  medium: { label: 'Medium', class: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  low: { label: 'Low', class: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
};

const missionTemplates = [
  { title: 'Deep Work Sprint', description: '90 minutes of uninterrupted deep focus on a single task.', priority: 'high' as MissionPriority, icon: Zap },
  { title: 'Study Session', description: 'Focused study or learning with active recall.', priority: 'medium' as MissionPriority, icon: BookOpen },
  { title: 'Code Review', description: 'Review and improve existing codebase quality.', priority: 'medium' as MissionPriority, icon: Code },
  { title: 'Creative Brainstorm', description: 'Free-form creative thinking and idea generation.', priority: 'low' as MissionPriority, icon: Lightbulb },
  { title: 'Project Launch', description: 'Push forward the most critical launch tasks.', priority: 'high' as MissionPriority, icon: Rocket },
];

// formatDuration imported from @/lib/utils

interface MissionFormProps {
  initialData?: { title: string; description?: string; priority: MissionPriority };
  onSubmit: (data: { title: string; description?: string; priority: MissionPriority }) => void;
  onCancel: () => void;
  loading?: boolean;
  submitLabel?: string;
}

function MissionForm({ initialData, onSubmit, onCancel, loading, submitLabel }: MissionFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [priority, setPriority] = useState<MissionPriority>(initialData?.priority || 'medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), description: description.trim() || undefined, priority });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="mission-title" className="mb-1.5 text-xs font-medium text-zinc-400">
          Mission Title
        </Label>
        <Input
          id="mission-title"
          placeholder="What's your one mission?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border-white/[0.06] bg-white/[0.03] text-zinc-200 placeholder:text-zinc-600 focus-visible:border-emerald-500/40 focus-visible:ring-emerald-500/20"
          autoFocus
          required
        />
      </div>
      <div>
        <Label htmlFor="mission-desc" className="mb-1.5 text-xs font-medium text-zinc-400">
          Description (optional)
        </Label>
        <Textarea
          id="mission-desc"
          placeholder="Add details about this mission..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border-white/[0.06] bg-white/[0.03] text-zinc-200 placeholder:text-zinc-600 focus-visible:border-emerald-500/40 focus-visible:ring-emerald-500/20 min-h-[80px] resize-none"
        />
      </div>
      <div>
        <Label className="mb-1.5 text-xs font-medium text-zinc-400">Priority</Label>
        <Select value={priority} onValueChange={(v) => setPriority(v as MissionPriority)}>
          <SelectTrigger className="border-white/[0.06] bg-white/[0.03] text-zinc-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-white/[0.06] bg-zinc-900">
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          className="text-zinc-400 hover:text-zinc-200"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || !title.trim()}
          className="bg-emerald-500 text-white hover:bg-emerald-600"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {submitLabel || 'Create Mission'}
        </Button>
      </div>
    </form>
  );
}

export function MissionView() {
  const missions = useAppStore(s => s.missions);
  const setMissions = useAppStore(s => s.setMissions);
  const setView = useAppStore(s => s.setView);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMission, setEditingMission] = useState<MissionWithSessions | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchMissions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/missions');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setMissions(data);
    } catch {
      setError('Failed to load missions');
    } finally {
      setLoading(false);
    }
  }, [setMissions]);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  const hasActiveMission = missions.some((m) => m.status === 'active');
  const completedCount = missions.filter((m) => m.status === 'completed').length;
  const totalFocusSeconds = missions.reduce((a, m) => a + m.focusSessions.reduce((s, fs) => s + fs.duration, 0), 0);

  const handleCreate = async (data: { title: string; description?: string; priority: MissionPriority }) => {
    setFormLoading(true);
    try {
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create mission');
      }
      setShowForm(false);
      toast.success('Mission created', { description: data.title });
      fetchMissions();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create mission');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (data: { title: string; description?: string; priority: MissionPriority }) => {
    if (!editingMission) return;
    setFormLoading(true);
    try {
      const res = await fetch(`/api/missions/${editingMission.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update');
      setEditingMission(null);
      toast.success('Mission updated');
      fetchMissions();
    } catch {
      toast.error('Failed to update mission');
    } finally {
      setFormLoading(false);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      const res = await fetch(`/api/missions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Mission completed!', { description: 'Great work staying focused.' });
      fetchMissions();
    } catch {
      toast.error('Failed to complete mission');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/missions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      setDeletingId(null);
      toast.success('Mission archived');
      fetchMissions();
    } catch {
      toast.error('Failed to delete mission');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <AlertCircle className="h-8 w-8 text-red-400/60" />
        <p className="text-sm text-zinc-400">{error}</p>
        <Button variant="ghost" size="sm" onClick={fetchMissions}>Try again</Button>
      </div>
    );
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="app-grid-bg min-h-full -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      {/* Header */}
      <motion.div variants={staggerItem} className="mb-10 pt-2">
        <h2 className="text-[1.65rem] font-semibold tracking-[-0.02em] text-zinc-100">Missions</h2>
        <p className="mt-1.5 text-sm text-zinc-500">One active mission at a time. Stay focused on what matters.</p>
      </motion.div>

      {/* Quick Stats Row */}
      <motion.div variants={staggerItem} className="mb-8 grid grid-cols-3 gap-3">
        <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/[0.08]" aria-hidden="true">
                <Target className="h-4 w-4 text-emerald-400/80" />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Total</p>
                <p className="text-lg font-semibold tabular-nums text-zinc-50">{missions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/[0.08]" aria-hidden="true">
                <Check className="h-4 w-4 text-emerald-400/80" />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Completed</p>
                <p className="text-lg font-semibold tabular-nums text-zinc-50">{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-glow border-white/[0.06] bg-white/[0.02]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/[0.08]" aria-hidden="true">
                <Clock className="h-4 w-4 text-emerald-400/80" />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Focus Time</p>
                <p className="text-lg font-semibold tabular-nums text-zinc-50">{formatDuration(totalFocusSeconds)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Mission Templates */}
      {!hasActiveMission && (
        <motion.div variants={staggerItem} className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Quick Start Templates</h3>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {missionTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <motion.button
                  key={template.title}
                  whileHover={{ y: -1, transition: { duration: 0.15 } }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCreate({ title: template.title, description: template.description, priority: template.priority })}
                  className="card-glow group flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition-colors hover:border-emerald-500/15"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/[0.08] transition-colors group-hover:bg-emerald-500/15">
                    <Icon className="h-4 w-4 text-emerald-400/70 group-hover:text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-200 group-hover:text-zinc-100">{template.title}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500 line-clamp-2">{template.description}</p>
                    <Badge variant="outline" className={cn('mt-2 text-[10px]', priorityConfig[template.priority].class)}>
                      {priorityConfig[template.priority].label}
                    </Badge>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Create Button + Warning */}
      <motion.div variants={staggerItem} className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">All Missions</h3>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          disabled={hasActiveMission}
          className="bg-emerald-500 text-white hover:bg-emerald-600"
          size="sm"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          New Mission
        </Button>
      </motion.div>

      {hasActiveMission && !showForm && !editingMission && (
        <motion.div variants={staggerItem} className="mb-5 rounded-xl border border-amber-500/15 bg-amber-500/[0.04] px-4 py-3">
          <p className="text-xs text-amber-400/80">
            <Sparkles className="mr-1.5 inline-block h-3 w-3" />
            Complete or archive your active mission before creating a new one.
          </p>
        </motion.div>
      )}

      {/* Mission List */}
      <motion.div variants={staggerItem} className="flex flex-col gap-3">
        {missions.length === 0 && !showForm ? (
          <Card className="border-dashed border-white/[0.06] bg-white/[0.01]">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03]">
                <Target className="h-7 w-7 text-zinc-700" />
              </div>
              <p className="mb-1 text-sm font-medium text-zinc-400">No missions yet</p>
              <p className="mb-5 text-xs text-zinc-600">Create your first mission to start tracking focus.</p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-emerald-500 text-white hover:bg-emerald-600"
                size="sm"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Create Mission
              </Button>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence>
            {missions.map((mission) => {
              const pConfig = priorityConfig[mission.priority as MissionPriority];
              const isExpanded = expandedId === mission.id;
              const totalFocus = mission.focusSessions.reduce((a, s) => a + s.duration, 0);

              return (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={cn(
                    'card-glow border-white/[0.06] bg-white/[0.02] transition-colors',
                    mission.status === 'active' && 'border-emerald-500/15'
                  )}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3.5">
                        <div
                          className={cn(
                            'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                            mission.status === 'active' ? 'bg-emerald-500/10' :
                            mission.status === 'completed' ? 'bg-emerald-500/[0.06]' : 'bg-white/[0.03]'
                          )}
                        >
                          {mission.status === 'completed' ? (
                            <Check className="h-4 w-4 text-emerald-400/70" />
                          ) : (
                            <Target className={cn(
                              'h-4 w-4',
                              mission.status === 'active' ? 'text-emerald-400' : 'text-zinc-500'
                            )} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className={cn(
                              'text-sm font-medium',
                              mission.status === 'completed' ? 'text-zinc-500 line-through' : 'text-zinc-100'
                            )}>
                              {mission.title}
                            </h4>
                            <Badge
                              variant="outline"
                              className={cn('text-[10px]', pConfig.class)}
                            >
                              {pConfig.label}
                            </Badge>
                            {mission.status === 'active' && (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-[10px]">
                                Active
                              </Badge>
                            )}
                            {mission.status === 'completed' && mission.completedAt && (
                              <span className="text-[10px] text-zinc-600">
                                {new Date(mission.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                          {mission.description && (
                            <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 line-clamp-2">
                              {mission.description}
                            </p>
                          )}
                          <button
                            className="mt-2.5 flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                            onClick={() => setExpandedId(isExpanded ? null : mission.id)}
                          >
                            <Clock className="h-3 w-3" />
                            {mission.focusSessions.length} session{mission.focusSessions.length !== 1 ? 's' : ''} · {formatDuration(totalFocus)}
                            <ChevronDown className={cn('h-3 w-3 transition-transform', isExpanded && 'rotate-180')} />
                          </button>

                          {/* Expanded Sessions */}
                          <AnimatePresence>
                            {isExpanded && mission.focusSessions.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 overflow-hidden"
                              >
                                <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] divide-y divide-white/[0.04]">
                                  {mission.focusSessions.map((session) => (
                                    <div key={session.id} className="flex items-center justify-between px-3 py-2.5">
                                      <span className="text-[11px] text-zinc-500">
                                        {new Date(session.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                      <span className="text-[11px] font-medium tabular-nums text-zinc-400">
                                        {formatDuration(session.duration)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <div className="flex shrink-0 items-center gap-0.5">
                          {mission.status === 'active' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-zinc-600 hover:text-emerald-400 hover:bg-emerald-500/[0.06]"
                                onClick={() => setView('timer')}
                                aria-label="Start focus session"
                              >
                                <Timer className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-zinc-600 hover:text-emerald-400 hover:bg-emerald-500/[0.06]"
                                onClick={() => handleComplete(mission.id)}
                                aria-label="Complete mission"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.04]"
                            onClick={() => setEditingMission(mission)}
                            aria-label="Edit mission"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-600 hover:text-red-400 hover:bg-red-500/[0.06]"
                            onClick={() => setDeletingId(mission.id)}
                            aria-label="Delete mission"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Create Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="border-white/[0.06] bg-zinc-900 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Create Mission</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Define your one active mission. What will you focus on?
            </DialogDescription>
          </DialogHeader>
          <MissionForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            loading={formLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Form Dialog */}
      <Dialog open={!!editingMission} onOpenChange={() => setEditingMission(null)}>
        <DialogContent className="border-white/[0.06] bg-zinc-900 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Edit Mission</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Update your mission details.
            </DialogDescription>
          </DialogHeader>
          {editingMission && (
            <MissionForm
              initialData={{
                title: editingMission.title,
                description: editingMission.description || undefined,
                priority: editingMission.priority as MissionPriority,
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingMission(null)}
              loading={formLoading}
              submitLabel="Save Changes"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent className="border-white/[0.06] bg-zinc-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100">Delete mission?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              This action cannot be undone. The mission and its data will be archived.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/[0.08] text-zinc-300 hover:bg-white/[0.04]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && handleDelete(deletingId)}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}