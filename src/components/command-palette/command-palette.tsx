'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Target,
  Timer,
  BookOpen,
  BarChart3,
  Settings,
  Search,
  Clock,
  Play,
  Plus,
  RotateCcw,
  Gift,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import type { AppView } from '@/types';

interface NavCommand {
  type: 'nav';
  view: AppView;
  icon: typeof LayoutDashboard;
  label: string;
  shortcut: string;
  keywords: string[];
}

interface ActionCommand {
  type: 'action';
  id: string;
  icon: typeof Play;
  label: string;
  shortcut: string;
  keywords: string[];
  action: () => void;
}

type Command = NavCommand | ActionCommand;

const navCommands: NavCommand[] = [
  { type: 'nav', view: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', shortcut: 'G D', keywords: ['home', 'overview', 'stats'] },
  { type: 'nav', view: 'mission', icon: Target, label: 'Mission', shortcut: 'G M', keywords: ['task', 'goal', 'current', 'focus'] },
  { type: 'nav', view: 'timer', icon: Timer, label: 'Focus Timer', shortcut: 'G T', keywords: ['pomodoro', 'countdown', 'start', 'session'] },
  { type: 'nav', view: 'reflection', icon: BookOpen, label: 'Daily Reflection', shortcut: 'G R', keywords: ['journal', 'review', 'diary', 'log'] },
  { type: 'nav', view: 'sessions', icon: Clock, label: 'Session History', shortcut: 'G H', keywords: ['sessions', 'history', 'log', 'past', 'completed'] },
  { type: 'nav', view: 'stats', icon: BarChart3, label: 'Statistics', shortcut: 'G S', keywords: ['analytics', 'charts', 'data'] },
  { type: 'nav', view: 'replay', icon: RotateCcw, label: 'Daily Replay', shortcut: 'G P', keywords: ['replay', 'day', 'history', 'timeline'] },
  { type: 'nav', view: 'wrapped', icon: Gift, label: 'Weekly Wrapped', shortcut: 'G W', keywords: ['wrapped', 'weekly', 'summary', 'report'] },
  { type: 'nav', view: 'settings', icon: Settings, label: 'Settings', shortcut: 'G ,', keywords: ['profile', 'preferences', 'account', 'theme'] },
];

export function CommandPalette() {
  const { setView, setSidebarOpen } = useAppStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const actionCommands: ActionCommand[] = [
    {
      type: 'action',
      id: 'start-timer',
      icon: Play,
      label: 'Start Focus Timer',
      shortcut: '',
      keywords: ['start', 'focus', 'begin', 'quick'],
      action: () => { setView('timer'); },
    },
    {
      type: 'action',
      id: 'new-mission',
      icon: Plus,
      label: 'Go to Missions',
      shortcut: '',
      keywords: ['create', 'new', 'add', 'mission'],
      action: () => { setView('mission'); },
    },
  ];

  const allCommands: Command[] = [...navCommands, ...actionCommands];

  const filtered = allCommands.filter((cmd) => {
    const q = query.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(q) ||
      cmd.keywords.some((kw) => kw.includes(q))
    );
  });

  const safeIndex = Math.min(selectedIndex, Math.max(filtered.length - 1, 0));

  const handleSelect = useCallback((cmd: Command) => {
    if (cmd.type === 'nav') {
      setView(cmd.view);
    } else {
      cmd.action();
    }
    setOpen(false);
    setQuery('');
    setSelectedIndex(0);
  }, [setView]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }
      if (!open) return;
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[safeIndex]) {
          handleSelect(filtered[safeIndex]);
        }
      }
    },
    [open, filtered, safeIndex, handleSelect]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const navItems = filtered.filter((c) => c.type === 'nav');
  const actionItems = filtered.filter((c) => c.type === 'action');

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={() => { setOpen(false); setQuery(''); }}
          />
          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed left-1/2 top-[15%] z-[101] w-full max-w-md -translate-x-1/2"
          >
            <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
              {/* Search */}
              <div className="flex items-center gap-3 border-b border-white/[0.06] px-4">
                <Search className="h-4 w-4 shrink-0 text-zinc-500" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                  placeholder="Type a command or search..."
                  className="h-12 flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 outline-none"
                />
                <kbd className="hidden shrink-0 rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 sm:inline">
                  ESC
                </kbd>
              </div>
              {/* Commands */}
              <div className="max-h-72 overflow-y-auto p-2">
                {filtered.length === 0 ? (
                  <div className="py-8 text-center text-sm text-zinc-500">No results found</div>
                ) : (
                  <>
                    {/* Quick Actions */}
                    {actionItems.length > 0 && (
                      <>
                        <div className="mb-1 px-3 pt-1 pb-1.5">
                          <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">Quick Actions</span>
                        </div>
                        {actionItems.map((cmd) => {
                          const Icon = cmd.icon;
                          const globalIdx = filtered.indexOf(cmd);
                          const isSelected = globalIdx === safeIndex;
                          return (
                            <button
                              key={cmd.id}
                              onClick={() => handleSelect(cmd)}
                              onMouseEnter={() => setSelectedIndex(globalIdx)}
                              className={cn(
                                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-100',
                                isSelected ? 'bg-white/[0.06] text-zinc-100' : 'text-zinc-400'
                              )}
                            >
                              <Icon className={cn('h-4 w-4 shrink-0', isSelected ? 'text-emerald-400' : 'text-zinc-500')} />
                              <span className="flex-1 text-sm font-medium">{cmd.label}</span>
                              <span className="hidden rounded-md border border-emerald-500/20 bg-emerald-500/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-emerald-500/70 sm:inline">Action</span>
                            </button>
                          );
                        })}
                      </>
                    )}
                    {/* Navigation */}
                    {navItems.length > 0 && (
                      <>
                        <div className={cn('mb-1 px-3 pt-3 pb-1.5', actionItems.length > 0 && 'mt-1 border-t border-white/[0.04]')}>
                          <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">Navigation</span>
                        </div>
                        {navItems.map((cmd) => {
                          const Icon = cmd.icon;
                          const globalIdx = filtered.indexOf(cmd);
                          const isSelected = globalIdx === safeIndex;
                          return (
                            <button
                              key={cmd.view}
                              onClick={() => handleSelect(cmd)}
                              onMouseEnter={() => setSelectedIndex(globalIdx)}
                              className={cn(
                                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-100',
                                isSelected ? 'bg-white/[0.06] text-zinc-100' : 'text-zinc-400'
                              )}
                            >
                              <Icon className={cn('h-4 w-4 shrink-0', isSelected ? 'text-emerald-400' : 'text-zinc-500')} />
                              <span className="flex-1 text-sm font-medium">{cmd.label}</span>
                              <kbd className="hidden rounded-md border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 sm:inline">
                                {cmd.shortcut}
                              </kbd>
                            </button>
                          );
                        })}
                      </>
                    )}
                  </>
                )}
              </div>
              {/* Footer hint */}
              <div className="flex items-center gap-4 border-t border-white/[0.04] px-4 py-2.5">
                <span className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                  <kbd className="rounded border border-white/[0.06] bg-white/[0.03] px-1 py-0.5 text-[9px]">↑↓</kbd> navigate
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                  <kbd className="rounded border border-white/[0.06] bg-white/[0.03] px-1 py-0.5 text-[9px]">↵</kbd> select
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                  <kbd className="rounded border border-white/[0.06] bg-white/[0.03] px-1 py-0.5 text-[9px]">esc</kbd> close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
