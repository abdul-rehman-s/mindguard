'use client';

import { AppSidebar } from './app-sidebar';
import { AppHeader } from './app-header';
import { CommandPalette } from '@/components/command-palette/command-palette';
import { CursorGlow } from '@/components/premium/cursor-glow';
import type { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-zinc-950 noise-bg selection:bg-emerald-500/20">
      <AppSidebar />
      <div className="lg:pl-[240px]">
        <AppHeader />
        <main className="relative z-10">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      <CommandPalette />
      <CursorGlow />
    </div>
  );
}