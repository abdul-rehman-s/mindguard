'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';

interface ShortcutItem {
  keys: string[];
  label: string;
  description: string;
  icon: typeof LayoutDashboard;
}

const shortcuts: ShortcutItem[] = [
  { keys: ['D'], label: 'Dashboard', description: 'Go to your dashboard', icon: LayoutDashboard },
  { keys: ['M'], label: 'Missions', description: 'View and manage missions', icon: Target },
  { keys: ['T'], label: 'Focus Timer', description: 'Start a focus session', icon: Timer },
  { keys: ['R'], label: 'Reflection', description: 'Daily reflection journal', icon: BookOpen },
  { keys: ['H'], label: 'Sessions', description: 'View session history', icon: Clock },
  { keys: ['S'], label: 'Statistics', description: 'Your focus statistics', icon: BarChart3 },
  { keys: [','], label: 'Settings', description: 'App preferences', icon: Settings },
  { keys: ['G', 'S'], label: 'Go to Statistics', description: 'Navigate using Go prefix', icon: BarChart3 },
  { keys: ['G', ','], label: 'Go to Settings', description: 'Navigate using Go prefix', icon: Settings },
  { keys: ['⌘', 'K'], label: 'Command Palette', description: 'Quick search and navigate', icon: Search },
  { keys: ['Space'], label: 'Start Focus', description: 'Quick start from timer view', icon: Timer },
  { keys: ['Esc'], label: 'Exit Focus', description: 'Exit immersive focus mode', icon: Timer },
];

export function KeyboardShortcutsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap: keep focus inside the modal
  useEffect(() => {
    if (!open) return;

    // Focus the close button initially
    const closeButton = modalRef.current?.querySelector<HTMLButtonElement>('button[aria-label="Close keyboard shortcuts"]');
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
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    // Also handle Escape
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleTab);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleTab);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

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
        className="fixed left-1/2 top-1/2 z-[61] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/[0.06] bg-zinc-900 shadow-2xl"
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
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-300"
            aria-label="Close keyboard shortcuts"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-1">
            {shortcuts.map((shortcut) => {
              const Icon = shortcut.icon;
              return (
                <div
                  key={shortcut.label}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.03]"
                  aria-label={`${shortcut.label}: ${shortcut.keys.join(' + ')}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="h-4 w-4 shrink-0 text-zinc-600" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-sm text-zinc-200">{shortcut.label}</p>
                      <p className="text-[11px] text-zinc-600 truncate">{shortcut.description}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {shortcut.keys.map((key, i) => (
                      <span key={i}>
                        {i > 0 && <span className="mx-0.5 text-[10px] text-zinc-700" aria-hidden="true">+</span>}
                        <kbd className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 text-[11px] font-medium text-zinc-400">
                          {key}
                        </kbd>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.04] px-6 py-3">
          <p className="text-center text-[11px] text-zinc-600">
            Press <kbd className="inline-flex h-5 items-center rounded border border-white/[0.08] bg-white/[0.04] px-1.5 text-[10px] font-medium text-zinc-500 mx-0.5">?</kbd> to open this panel
          </p>
        </div>
      </motion.div>
    </>
  );
}
