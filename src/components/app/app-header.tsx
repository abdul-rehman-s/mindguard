'use client';

import { useState, useEffect } from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { KeyboardShortcutsModal } from '@/components/keyboard-shortcuts-modal';
import { NotificationPanel } from '@/components/notifications/notification-panel';
import type { AppView } from '@/types';

const viewTitles: Record<AppView, string> = {
  landing: '',
  dashboard: 'Dashboard',
  life: 'Life Dashboard',
  mission: 'Missions',
  timer: 'Focus Timer',
  reflection: 'Daily Reflection',
  sessions: 'Session History',
  stats: 'Statistics',
  settings: 'Settings',
  replay: 'Daily Replay',
  review: 'Daily Review',
  wrapped: 'Weekly Wrapped',
};

export function AppHeader() {
  const { currentView, setSidebarOpen, setView, setUser } = useAppStore();
  const { data: session } = useSession();
  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    setUser(null);
    setView('landing');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) return;
      if (e.key === '?') {
        e.preventDefault();
        setShowShortcuts(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="group/header relative sticky top-0 z-20 flex h-14 items-center justify-between border-b border-white/[0.06] bg-zinc-950/50 px-4 shadow-[0_1px_0_0_rgba(255,255,255,0.03),0_8px_32px_-8px_rgba(0,0,0,0.5)] backdrop-blur-2xl backdrop-saturate-[1.8] lg:px-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/[0.12] to-transparent opacity-0 transition-opacity duration-500 group-hover/header:opacity-100" />
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-400 hover:text-zinc-200 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          {currentView !== 'landing' && (
            <h1 className="text-sm font-medium text-zinc-200">
              {viewTitles[currentView]}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <NotificationPanel />
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowShortcuts(true)}
              className="hidden items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-[10px] text-zinc-600 transition-colors hover:bg-white/[0.04] hover:text-zinc-400 sm:flex"
            >
              <kbd className="font-medium">?</kbd>
              <span>shortcuts</span>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-zinc-800 text-xs font-medium text-zinc-300">
                      {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 border-zinc-800 bg-zinc-900"
              >
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-zinc-200">
                    {session?.user?.name || 'User'}
                  </p>
                  <p className="text-xs text-zinc-500">{session?.user?.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem
                  onClick={() => setView('settings')}
                  className="text-zinc-400 focus:bg-zinc-800 focus:text-zinc-200"
                >
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-400 focus:bg-red-500/10 focus:text-red-300"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <KeyboardShortcutsModal open={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </>
  );
}
