'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Target,
  Plus,
  Pencil,
  Check,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Clock,
  Timer,
  ChevronDown,
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
import { cn } from '@/lib/utils';
import type { Mission, MissionPriority, MissionWithSessions } from '@/types';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const priorityConfig: Record<MissionPriority, { label: string; class: string }> = {
  high: { label: 'High', class: 'bg-red-500/10 text-red-400 border-red-500/20' },
  medium: { label: 'Medium', class: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  low: { label: 'Low', class: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
};

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

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
          className="border-zinc-800 bg-zinc-800/50 text-zinc-200 placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
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
          className="border-zinc-800 bg-zinc-800/50 text-zinc-200 placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20 min-h-[80px]"
        />
      </div>
      <div>
        <Label className="mb-1.5 text-xs font-medium text-zinc-400">Priority</Label>
        <Select value={priority} onValueChange={(v) => setPriority(v as MissionPriority)}>
          <SelectTrigger className="border-zinc-800 bg-zinc-800/50 text-zinc-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-zinc-800 bg-zinc-900">
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
  const { missions, setMissions, setView } = useAppStore();
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
      alert(err instanceof Error ? err.message : 'Failed to create mission');
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
      toast.success('Mission completed! 🎉');
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
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p className="text-sm text-zinc-400">{error}</p>
        <Button variant="ghost" size="sm" onClick={fetchMissions}>Try again</Button>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="visible">
      <motion.div variants={item} className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Missions</h2>
          <p className="text-sm text-zinc-500">One active mission at a time. Stay focused.</p>
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
        <motion.div variants={item} className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-2.5">
          <p className="text-xs text-amber-400">
            Complete or archive your active mission before creating a new one.
          </p>
        </motion.div>
      )}

      <motion.div variants={item} className="flex flex-col gap-3">
        {missions.length === 0 && !showForm ? (
          <Card className="border-zinc-800/50 bg-zinc-900/30">
            <CardContent className="flex flex-col items-center justify-center p-12">
              <Target className="mb-3 h-10 w-10 text-zinc-700" />
              <h3 className="mb-1 text-sm font-medium text-zinc-400">No missions yet</h3>
              <p className="mb-4 text-xs text-zinc-500">Create your first mission to get started.</p>
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
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={cn(
                    'border-zinc-800/50 bg-zinc-900/30 transition-colors hover:bg-zinc-900/50',
                    mission.status === 'active' && 'border-emerald-500/20'
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                            mission.status === 'active' ? 'bg-emerald-500/10' : 'bg-zinc-800/50'
                          )}
                        >
                          {mission.status === 'completed' ? (
                            <Check className="h-4 w-4 text-emerald-400" />
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
                              mission.status === 'completed' ? 'text-zinc-400 line-through' : 'text-zinc-100'
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
                          </div>
                          {mission.description && (
                            <p className="mt-1 text-xs text-zinc-500 line-clamp-2">
                              {mission.description}
                            </p>
                          )}
                          <button
                            className="mt-2 flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-400"
                            onClick={() => setExpandedId(isExpanded ? null : mission.id)}
                          >
                            <Clock className="h-3 w-3" />
                            {mission.focusSessions.length} sessions · {formatDuration(totalFocus)}
                            <ChevronDown className={cn('h-3 w-3 transition-transform', isExpanded && 'rotate-180')} />
                          </button>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          {mission.status === 'active' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-zinc-500 hover:text-emerald-400"
                                onClick={() => setView('timer')}
                                title="Start focus session"
                              >
                                <Timer className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-zinc-500 hover:text-emerald-400"
                                onClick={() => handleComplete(mission.id)}
                                title="Complete mission"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-zinc-500 hover:text-zinc-300"
                            onClick={() => setEditingMission(mission)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-zinc-500 hover:text-red-400"
                            onClick={() => setDeletingId(mission.id)}
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
        <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-md">
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
        <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-md">
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
        <AlertDialogContent className="border-zinc-800 bg-zinc-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100">Delete mission?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              This action cannot be undone. The mission and its data will be archived.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
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
