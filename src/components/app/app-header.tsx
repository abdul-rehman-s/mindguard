'use client';

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
import type { AppView } from '@/types';

const viewTitles: Record<AppView, string> = {
  landing: '',
  dashboard: 'Dashboard',
  mission: 'Mission',
  timer: 'Focus Timer',
  reflection: 'Daily Reflection',
  stats: 'Statistics',
  settings: 'Settings',
};

export function AppHeader() {
  const { currentView, setSidebarOpen, setView, setUser } = useAppStore();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    setUser(null);
    setView('landing');
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-zinc-800/50 bg-zinc-950/80 px-4 backdrop-blur-xl lg:px-6">
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

      <div className="flex items-center gap-2">
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
    </header>
  );
}