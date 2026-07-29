'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  LayoutDashboard,
  Target,
  Timer,
  BookOpen,
  Clock,
  BarChart3,
  Settings,
  Search,
  Play,
  RotateCcw,
  Gift,
  Monitor,
  CalendarCheck,
  Sparkles,
  Zap,
  Download,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import { shortcutManager, formatComboForDisplay, type ShortcutCombo, type ShortcutDefinition, type ConflictResult } from '@/lib/shortcut-manager';
import { toast } from 'sonner';

// ─── Icon Map ───

const iconMap: Record<string, typeof LayoutDashboard> = {
  'nav.dashboard': LayoutDashboard,
  'nav.mission': Target,
  'nav.timer': Timer,
  'nav.reflection': BookOpen,
  'nav.sessions': Clock,
  'nav.stats': BarChart3,
  'nav.replay': RotateCcw,
  'nav.wrapped': Gift,
  'nav.life': Monitor,
  'nav.review': CalendarCheck,
  'nav.settings': Settings,
  'system.palette': Search,
  'system.shortcuts': Sparkles,
  'focus.start': Play,
  'focus.exit': Zap,
};

// ─── Category Labels ───

const categoryLabels: Record<string, string> = {
  navigation: 'Navigation',
  system: 'System',
  focus: 'Focus',
  actions: 'Actions',
};

const categoryOrder = ['navigation', 'focus', 'system'];

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
  /** Optional: callback to save custom shortcuts to UserSettings */
  onSaveCustomShortcuts?: (overrides: Record<string, string>) => Promise<void>;
  /** Optional: current custom shortcuts from UserSettings */
  customShortcuts?: Record<string, string> | null;
  /** Optional: callback to export shortcut config */
  onExport?: () => void;
  /** Optional: callback to import shortcut config */
  onImport?: (data: string) => void;
}

export function KeyboardShortcutsModal({
  open,
  onClose,
  onSaveCustomShortcuts,
  customShortcuts,
  onExport,
  onImport,
}: KeyboardShortcutsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [conflict, setConflict] = useState<ConflictResult | null>(null);
  const [recordingKey, setRecordingKey] = useState<ShortcutCombo | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('navigation');

  // Load custom overrides when custom shortcuts change
  useEffect(() => {
    if (customShortcuts) {
      shortcutManager.setCustomOverrides(customShortcuts);
    }
  }, [customShortcuts]);

  // Reset editing state when modal closes
  // Use the "derive state from props" pattern instead of an effect
  // to avoid cascading renders
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) {
      setEditingId(null);
      setConflict(null);
      setRecordingKey(null);
    }
  }



  // Focus trap
  useEffect(() => {
    if (!open) return;

    const closeButton = modalRef.current?.querySelector<HTMLButtonElement>('button[aria-label="Close"]');
    closeButton?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingId) {
          setEditingId(null);
          setConflict(null);
          setRecordingKey(null);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleTab);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose, editingId]);

  // Key recording handler for customizing shortcuts
  const handleRecordingKeyDown = useCallback((e: KeyboardEvent) => {
    if (!editingId) return;

    e.preventDefault();
    e.stopPropagation();

    // Escape cancels recording
    if (e.key === 'Escape') {
      setEditingId(null);
      setConflict(null);
      setRecordingKey(null);
      return;
    }

    // Backspace/Delete clears the shortcut (revert to default)
    if (e.key === 'Backspace' || e.key === 'Delete') {
      shortcutManager.removeCustomOverride(editingId);
      setEditingId(null);
      setConflict(null);
      setRecordingKey(null);
      toast.success('Shortcut reset to default');
      if (onSaveCustomShortcuts) {
        onSaveCustomShortcuts(shortcutManager.getCustomOverridesForSave());
      }
      return;
    }

    // Build the combo from the keypress
    const modifiers: string[] = [];
    if (e.metaKey || e.ctrlKey) modifiers.push('cmd');
    if (e.altKey) modifiers.push('alt');
    if (e.shiftKey) modifiers.push('shift');

    let key = e.key.toLowerCase();
    if (key === ' ') key = 'space';
    else if (key === 'meta' || key === 'control' || key === 'alt' || key === 'shift') return; // Ignore standalone modifiers

    const combo: ShortcutCombo = { modifiers: modifiers as ShortcutCombo['modifiers'], key };
    setRecordingKey(combo);

    // Check for conflicts
    const conflictResult = shortcutManager.checkConflict(combo, editingId);
    if (conflictResult) {
      setConflict(conflictResult);
    } else {
      setConflict(null);
      // Apply the override
      const result = shortcutManager.setCustomOverride(editingId, combo);
      if (result) {
        setConflict(result);
      } else {
        setEditingId(null);
        setRecordingKey(null);
        toast.success('Shortcut updated');
        if (onSaveCustomShortcuts) {
          onSaveCustomShortcuts(shortcutManager.getCustomOverridesForSave());
        }
      }
    }
  }, [editingId, onSaveCustomShortcuts]);

  // Register key recording listener when editing
  useEffect(() => {
    if (!editingId) return;
    document.addEventListener('keydown', handleRecordingKeyDown, true);
    return () => document.removeEventListener('keydown', handleRecordingKeyDown, true);
  }, [editingId, handleRecordingKeyDown]);

  // Handle export
  const handleExport = useCallback(() => {
    const config = shortcutManager.exportConfig();
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindguard-shortcuts-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Shortcuts exported');
    if (onExport) onExport();
  }, [onExport]);

  // Handle import
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        if (onImport) {
          onImport(text);
        } else {
          const data = JSON.parse(text);
          const result = shortcutManager.importConfig(data);
          if (result.success) {
            toast.success('Shortcuts imported');
            if (onSaveCustomShortcuts) {
              onSaveCustomShortcuts(shortcutManager.getCustomOverridesForSave());
            }
          } else {
            toast.error(`Import failed: ${result.errors.join(', ')}`);
          }
        }
      } catch {
        toast.error('Invalid shortcuts file');
      }
    };
    input.click();
  }, [onImport, onSaveCustomShortcuts]);

  // Handle reset to defaults
  const handleResetDefaults = useCallback(() => {
    shortcutManager.clearAllOverrides();
    toast.success('All shortcuts reset to defaults');
    if (onSaveCustomShortcuts) {
      onSaveCustomShortcuts({});
    }
  }, [onSaveCustomShortcuts]);

  // Handle conflict override
  const handleOverrideConflict = useCallback(() => {
    if (!editingId || !conflict || !recordingKey) return;

    // Remove the conflicting shortcut's override (or reset to default)
    if (conflict.conflictingActionId) {
      shortcutManager.removeCustomOverride(conflict.conflictingActionId);
    }
    // Now set our new shortcut
    shortcutManager.setCustomOverride(editingId, recordingKey);
    setEditingId(null);
    setConflict(null);
    setRecordingKey(null);
    toast.success('Shortcut updated (previous binding cleared)');
    if (onSaveCustomShortcuts) {
      onSaveCustomShortcuts(shortcutManager.getCustomOverridesForSave());
    }
  }, [editingId, conflict, recordingKey, onSaveCustomShortcuts]);

  if (!open) return null;

  // Group definitions by category
  const allDefs = shortcutManager.getAllDefinitions();
  const grouped = categoryOrder.map(cat => ({
    category: cat,
    label: categoryLabels[cat],
    items: allDefs.filter(d => d.category === cat),
  }));

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal */}
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed left-1/2 top-1/2 z-[61] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/[0.06] bg-zinc-900 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.04] px-6 py-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Keyboard Shortcuts</h3>
            <p className="mt-0.5 text-xs text-zinc-500">Navigate faster with keyboard commands</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Export/Import buttons */}
            <button
              onClick={handleExport}
              className="flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[11px] text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-300"
              aria-label="Export shortcuts"
            >
              <Download className="h-3 w-3" /> Export
            </button>
            <button
              onClick={handleImport}
              className="flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[11px] text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-300"
              aria-label="Import shortcuts"
            >
              <Upload className="h-3 w-3" /> Import
            </button>
            <button
              onClick={handleResetDefaults}
              className="flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[11px] text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-300"
              aria-label="Reset all shortcuts to defaults"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-300"
              aria-label="Close keyboard shortcuts"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 px-6 pt-3">
          {grouped.map(({ category, label }) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors',
                activeCategory === category
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-300 border border-transparent'
              )}
              aria-label={`Show ${label} shortcuts`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Shortcuts List */}
        <div className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto px-6 py-3">
          <div className="flex flex-col gap-1">
            {grouped.find(g => g.category === activeCategory)?.items.map((def) => {
              const Icon = iconMap[def.id] ?? Settings;
              const resolvedCombo = shortcutManager.getResolvedCombo(def.id);
              const defaultCombo = shortcutManager.getDefaultCombo(def.id);
              const isCustom = resolvedCombo && defaultCombo && shortcutManager.comboToString(resolvedCombo) !== shortcutManager.comboToString(defaultCombo);
              const isEditing = editingId === def.id;

              return (
                <div
                  key={def.id}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors',
                    isEditing ? 'bg-emerald-500/[0.06] ring-1 ring-emerald-500/30' : 'hover:bg-white/[0.03]'
                  )}
                  aria-label={`${def.label}: ${formatComboForDisplay(resolvedCombo ?? defaultCombo).join(' + ')}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="h-4 w-4 shrink-0 text-zinc-600" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-sm text-zinc-200">{def.label}</p>
                      <p className="text-[11px] text-zinc-600 truncate">{def.description}</p>
                    </div>
                    {isCustom && !isEditing && (
                      <span className="text-[9px] font-medium text-emerald-400/60 uppercase tracking-wider ml-1">Custom</span>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        {conflict ? (
                          <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-1.5 text-[11px] text-amber-400">
                              <AlertTriangle className="h-3 w-3 shrink-0" />
                              <span>{conflict.reason}</span>
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={handleOverrideConflict}
                                className="rounded-md border border-amber-500/20 bg-amber-500/[0.06] px-2 py-0.5 text-[10px] text-amber-400 hover:bg-amber-500/10"
                                aria-label="Override conflicting shortcut"
                              >
                                Override
                              </button>
                              <button
                                onClick={() => { setEditingId(null); setConflict(null); setRecordingKey(null); }}
                                className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] text-zinc-400 hover:bg-white/[0.04]"
                                aria-label="Cancel shortcut editing"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-zinc-500 animate-pulse">Press new shortcut…</span>
                        )}
                        {recordingKey && !conflict && (
                          <kbd className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-md border border-emerald-500/20 bg-emerald-500/[0.06] px-1.5 text-[11px] font-medium text-emerald-400">
                            {formatComboForDisplay(recordingKey).join('+')}
                          </kbd>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-1">
                          {formatComboForDisplay(resolvedCombo ?? defaultCombo).map((keyPart, i) => (
                            <span key={i}>
                              {i > 0 && <span className="mx-0.5 text-[10px] text-zinc-700" aria-hidden="true">+</span>}
                              <kbd className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 text-[11px] font-medium text-zinc-400">
                                {keyPart}
                              </kbd>
                            </span>
                          ))}
                        </div>
                        {def.customizable && (
                          <button
                            onClick={() => { setEditingId(def.id); setConflict(null); setRecordingKey(null); }}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-600 hover:bg-white/[0.04] hover:text-zinc-300 transition-colors"
                            aria-label={`Customize ${def.label} shortcut`}
                          >
                            <Settings className="h-3 w-3" />
                          </button>
                        )}
                        {isCustom && def.customizable && (
                          <button
                            onClick={() => {
                              shortcutManager.removeCustomOverride(def.id);
                              toast.success(`${def.label} reset to default`);
                              if (onSaveCustomShortcuts) {
                                onSaveCustomShortcuts(shortcutManager.getCustomOverridesForSave());
                              }
                            }}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-600 hover:bg-white/[0.04] hover:text-zinc-300 transition-colors"
                            aria-label={`Reset ${def.label} shortcut to default`}
                          >
                            <RotateCcw className="h-3 w-3" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.04] px-6 py-3">
          <p className="text-center text-[11px] text-zinc-600">
            Press <kbd className="inline-flex h-5 items-center rounded border border-white/[0.08] bg-white/[0.04] px-1.5 text-[10px] font-medium text-zinc-500 mx-0.5">?</kbd> to open this panel · Click <Settings className="inline h-3 w-3 mx-0.5 text-zinc-500" /> to customize · <kbd className="inline-flex h-5 items-center rounded border border-white/[0.08] bg-white/[0.04] px-1.5 text-[10px] font-medium text-zinc-500 mx-0.5">Backspace</kbd> resets to default
          </p>
        </div>
      </motion.div>
    </>
  );
}

// ─── Utility ───

function cn(...inputs: (string | undefined | false | null)[]) {
  return inputs.filter(Boolean).join(' ');
}
