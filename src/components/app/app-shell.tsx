'use client';

import { AppSidebar } from './app-sidebar';
import { AppHeader } from './app-header';
import { CommandPalette } from '@/components/command-palette/command-palette';
import type { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-zinc-950 noise-bg">
      <AppSidebar />
      <div className="lg:pl-[240px]">
        <AppHeader />
        <main className="relative z-10">
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}