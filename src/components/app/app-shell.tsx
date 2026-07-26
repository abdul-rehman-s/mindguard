'use client';

import { AppSidebar } from './app-sidebar';
import { AppHeader } from './app-header';
import { CommandPalette } from '@/components/command-palette/command-palette';
import { CursorGlow } from '@/components/premium/cursor-glow';
import { ErrorBoundary } from '@/components/app/error-boundary';
import type { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col bg-zinc-950 noise-bg selection:bg-emerald-500/20">
      <AppSidebar />
      <div className="lg:pl-[240px] flex flex-col min-h-screen">
        <AppHeader />
        <main className="relative z-10 flex-1">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <ErrorBoundary context="AppShell">
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
      <CommandPalette />
      <CursorGlow />
    </div>
  );
}
