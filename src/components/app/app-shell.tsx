'use client';

import { AppSidebar } from './app-sidebar';
import { AppHeader } from './app-header';
import { CommandPalette } from '@/components/command-palette/command-palette';
import { ErrorBoundary } from '@/components/app/error-boundary';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useAppStore } from '@/stores/app-store';
import type { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  useKeyboardShortcuts();
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-zinc-950 noise-bg selection:bg-emerald-500/20">
      <AppSidebar />
      <div
        className={`flex flex-col min-h-screen transition-[margin-left] duration-300 ease-out ${sidebarCollapsed ? 'lg:ml-[64px]' : 'lg:ml-[240px]'}`}
        role="region"
        aria-label="Main content area"
      >
        <AppHeader />
        <main id="main-content" className="relative z-10 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <ErrorBoundary context="AppShell">
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
