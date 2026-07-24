'use client';

import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Target,
  Timer,
  BookOpen,
  BarChart3,
  Settings,
  Shield,
  X,
  Clock,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { AppView } from '@/types';

const navItems: { view: AppView; icon: typeof LayoutDashboard; label: string; shortcut: string }[] = [
  { view: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', shortcut: 'D' },
  { view: 'mission', icon: Target, label: 'Mission', shortcut: 'M' },
  { view: 'timer', icon: Timer, label: 'Focus Timer', shortcut: 'T' },
  { view: 'reflection', icon: BookOpen, label: 'Reflection', shortcut: 'R' },
  { view: 'sessions', icon: Clock, label: 'Sessions', shortcut: 'H' },
  { view: 'stats', icon: BarChart3, label: 'Statistics', shortcut: 'S' },
  { view: 'settings', icon: Settings, label: 'Settings', shortcut: ',' },
];

export function AppSidebar() {
  const { currentView, setView, sidebarOpen, setSidebarOpen } = useAppStore();
  const { data: session } = useSession();

  const handleNavClick = (view: AppView) => {
    setView(view);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : -280,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 z-50 flex h-screen w-[240px] flex-col border-r border-white/[0.06] bg-zinc-950/95 backdrop-blur-xl lg:translate-x-0 lg:z-30"
        style={{ willChange: 'transform' }}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <span className="text-[13px] font-semibold tracking-tight text-zinc-100">
              MindGuard
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-500 hover:text-zinc-300 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Separator className="bg-white/[0.04]" />

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 py-3">
          <nav className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const isActive = currentView === item.view;
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.view}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNavClick(item.view)}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-[9px] text-[13px] font-medium transition-all duration-150',
                    isActive
                      ? 'bg-white/[0.06] text-zinc-100'
                      : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-emerald-400 shadow-sm shadow-emerald-400/30"
                      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    />
                  )}
                  <Icon
                    className={cn(
                      'h-[15px] w-[15px] shrink-0 transition-colors duration-150',
                      isActive ? 'text-emerald-400' : 'text-zinc-600 group-hover:text-zinc-400'
                    )}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  <kbd className="hidden text-[10px] font-medium text-zinc-700 lg:inline">{item.shortcut}</kbd>
                </motion.button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-white/[0.04] px-3 pb-4 pt-3">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.03]">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-[11px] font-medium text-zinc-400">
              {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-xs font-medium text-zinc-300">
                {session?.user?.name || 'User'}
              </p>
              <p className="truncate text-[10px] text-zinc-600">
                {session?.user?.email || ''}
              </p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}