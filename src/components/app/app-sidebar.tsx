'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Target,
  Timer,
  BookOpen,
  BarChart3,
  Settings,
  X,
  Clock,
  RotateCcw,
  Gift,
  Monitor,
  CalendarCheck,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle2,
  CalendarDays,
} from 'lucide-react';
import { MindGuardLogo } from '@/components/branding/mindguard-logo';
import { useAppStore } from '@/stores/app-store';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { playClick } from '@/lib/sounds';
import type { AppView } from '@/types';

// ---- Section definitions ----
type NavSection = 'core' | 'focus' | 'review' | 'insights' | 'bottom';

interface NavItem {
  view: AppView;
  icon: typeof LayoutDashboard;
  label: string;
  shortcut: string;
  section: NavSection;
}

const navItems: NavItem[] = [
  // Core
  { view: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', shortcut: 'D', section: 'core' },
  { view: 'life', icon: Monitor, label: 'Life Dashboard', shortcut: 'L', section: 'core' },
  // Focus
  { view: 'mission', icon: Target, label: 'Mission', shortcut: 'M', section: 'focus' },
  { view: 'timer', icon: Timer, label: 'Focus Timer', shortcut: 'T', section: 'focus' },
  { view: 'reflection', icon: BookOpen, label: 'Reflection', shortcut: 'R', section: 'focus' },
  // Review
  { view: 'review', icon: CalendarCheck, label: 'Daily Review', shortcut: 'V', section: 'review' },
  { view: 'sessions', icon: Clock, label: 'Sessions', shortcut: 'H', section: 'review' },
  { view: 'stats', icon: BarChart3, label: 'Statistics', shortcut: 'S', section: 'review' },
  // Insights
  { view: 'replay', icon: RotateCcw, label: 'Daily Replay', shortcut: 'P', section: 'insights' },
  { view: 'wrapped', icon: Gift, label: 'Weekly Wrapped', shortcut: 'W', section: 'insights' },
  { view: 'habits', icon: CheckCircle2, label: 'Habits', shortcut: 'H', section: 'insights' },
  { view: 'monthly', icon: CalendarDays, label: 'Monthly Report', shortcut: 'M', section: 'insights' },
  // Bottom
  { view: 'settings', icon: Settings, label: 'Settings', shortcut: ',', section: 'bottom' },
];

const sectionLabels: Record<NavSection, string> = {
  core: 'Core',
  focus: 'Focus',
  review: 'Review',
  insights: 'Insights',
  bottom: '',
};

// Group items by section in display order
const sectionOrder: NavSection[] = ['core', 'focus', 'review', 'insights', 'bottom'];

// ---- Memoized NavButton ----
const NavButton = React.memo(function NavButton({
  view,
  icon: Icon,
  label,
  shortcut,
  isActive,
  collapsed,
  onClick,
}: {
  view: AppView;
  icon: typeof LayoutDashboard;
  label: string;
  shortcut: string;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      aria-label={label}
      className={cn(
        'group relative flex items-center rounded-lg text-[13px] font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 cursor-pointer',
        collapsed
          ? 'justify-center px-0 py-[9px]'
          : 'gap-3 px-3 py-[9px]',
        isActive
          ? 'bg-white/[0.06] text-zinc-100'
          : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
      )}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className={cn(
            'absolute top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-emerald-400 shadow-sm shadow-emerald-400/30',
            collapsed ? 'left-0' : 'left-0'
          )}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        />
      )}
      <Icon
        className={cn(
          'shrink-0 transition-colors duration-150',
          collapsed ? 'h-[18px] w-[18px]' : 'h-[16px] w-[16px]',
          isActive ? 'text-emerald-400' : 'text-zinc-600 group-hover:text-zinc-400'
        )}
      />
      {!collapsed && (
        <>
          <span className="flex-1 text-left">{label}</span>
          <kbd className="hidden text-[10px] font-medium text-zinc-700 lg:inline">{shortcut}</kbd>
        </>
      )}
    </motion.button>
  );
});

// ---- Section Label ----
function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (!label) return <Separator className="bg-white/[0.04] my-1" />;
  if (collapsed) {
    return (
      <div className="flex items-center justify-center py-1">
        <div className="h-px w-4 bg-white/[0.06]" />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 px-3 pt-4 pb-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
        {label}
      </span>
      <div className="flex-1 h-px bg-white/[0.04]" />
    </div>
  );
}

export function AppSidebar() {
  const currentView = useAppStore(s => s.currentView);
  const setView = useAppStore(s => s.setView);
  const sidebarOpen = useAppStore(s => s.sidebarOpen);
  const setSidebarOpen = useAppStore(s => s.setSidebarOpen);
  const sidebarCollapsed = useAppStore(s => s.sidebarCollapsed);
  const setSidebarCollapsed = useAppStore(s => s.setSidebarCollapsed);
  const { data: session } = useSession();

  // Track desktop viewport for robust sidebar positioning
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    const check = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      // Auto-open sidebar when viewport becomes desktop-sized
      if (desktop && !sidebarOpen) {
        setSidebarOpen(true);
      }
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [sidebarOpen, setSidebarOpen]);

  const handleNavClick = useCallback((view: AppView) => {
    playClick();
    setView(view);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [setView, setSidebarOpen]);

  const toggleCollapsed = useCallback(() => {
    playClick();
    setSidebarCollapsed(!sidebarCollapsed);
  }, [sidebarCollapsed, setSidebarCollapsed]);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && !isDesktop && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isDesktop ? 0 : (sidebarOpen ? 0 : -280) }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        aria-label="Sidebar navigation"
        className={cn(
          "glass-sidebar fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-white/[0.06] bg-zinc-950/95 backdrop-blur-xl overflow-hidden",
          "transition-[width] duration-300 ease-out",
          sidebarCollapsed ? "w-[64px]" : "w-[240px]",
          isDesktop && "z-30"
        )}
        style={{ willChange: 'transform' }}
      >
        {/* Emerald glow accent — decorative */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-emerald-500/[0.06] to-transparent" aria-hidden="true" />

        {/* Header */}
        <div className="flex h-14 items-center justify-between px-3">
          <MindGuardLogo size="sm" showText={!sidebarCollapsed} collapsed={sidebarCollapsed} />
          {/* Mobile close + Desktop collapse */}
          <div className="flex items-center gap-1">
            {/* Mobile close button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-zinc-500 hover:text-zinc-300 lg:hidden cursor-pointer"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
          {/* Desktop collapse toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden h-7 w-7 shrink-0 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] lg:flex cursor-pointer"
            onClick={toggleCollapsed}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <ChevronsLeft className="h-4 w-4" />
            )}
          </Button>
          </div>
        </div>

        <Separator className="bg-white/[0.04]" />

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 py-2">
          <nav className="flex flex-col gap-0.5" role="navigation" aria-label="Main navigation">
            {sectionOrder.map((section) => {
              const items = navItems.filter(item => item.section === section);
              if (items.length === 0) return null;
              return (
                <React.Fragment key={section}>
                  <SectionLabel label={sectionLabels[section]} collapsed={sidebarCollapsed} />
                  {items.map((item) => (
                    <NavButton
                      key={item.view}
                      view={item.view}
                      icon={item.icon}
                      label={item.label}
                      shortcut={item.shortcut}
                      isActive={currentView === item.view}
                      collapsed={sidebarCollapsed}
                      onClick={() => handleNavClick(item.view)}
                    />
                  ))}
                </React.Fragment>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-white/[0.04] px-2 pb-4 pt-3">
          <div className={cn(
            'flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.03]',
            sidebarCollapsed && 'justify-center px-0'
          )}>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[11px] font-medium text-zinc-400" aria-hidden="true">
              {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 truncate overflow-hidden"
                >
                  <p className="truncate text-xs font-medium text-zinc-300">
                    {session?.user?.name || 'User'}
                  </p>
                  <p className="truncate text-[10px] text-zinc-600">
                    {session?.user?.email || ''}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
