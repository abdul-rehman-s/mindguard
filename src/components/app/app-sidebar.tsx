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
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { AppView } from '@/types';

const navItems: { view: AppView; icon: typeof LayoutDashboard; label: string }[] = [
  { view: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { view: 'mission', icon: Target, label: 'Mission' },
  { view: 'timer', icon: Timer, label: 'Focus Timer' },
  { view: 'reflection', icon: BookOpen, label: 'Reflection' },
  { view: 'stats', icon: BarChart3, label: 'Statistics' },
  { view: 'settings', icon: Settings, label: 'Settings' },
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
        className="fixed left-0 top-0 z-50 flex h-screen w-[240px] flex-col bg-zinc-950/95 backdrop-blur-xl border-r border-zinc-800/50 lg:translate-x-0 lg:z-30"
        style={{ willChange: 'transform' }}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
              <Shield className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-zinc-100">
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

        <Separator className="bg-zinc-800/50" />

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
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-zinc-800/60 text-zinc-100'
                      : 'text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-emerald-500"
                      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    />
                  )}
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-colors',
                      isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-400'
                    )}
                  />
                  {item.label}
                </motion.button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-zinc-800/50 p-3">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-300">
              {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-xs font-medium text-zinc-300">
                {session?.user?.name || 'User'}
              </p>
              <p className="truncate text-[10px] text-zinc-500">
                {session?.user?.email || ''}
              </p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}