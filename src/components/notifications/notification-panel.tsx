'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  BellOff,
  Loader2,
  X,
  Clock,
  Coffee,
  Target,
  BookOpen,
  Zap,
  Flame,
  CheckCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/stores/app-store';
import { cn, timeAgo } from '@/lib/utils';
import type { NotificationItem, AppView } from '@/types';

const VALID_ACTION_VIEWS: AppView[] = [
  'landing', 'dashboard', 'life', 'mission', 'timer', 'reflection',
  'sessions', 'stats', 'settings', 'replay', 'review', 'wrapped',
];

const ICON_MAP: Record<string, typeof Bell> = {
  idle_alert: Coffee,
  break_reminder: Clock,
  mission_reminder: Target,
  reflection_reminder: BookOpen,
  focus_celebration: Zap,
  streak_milestone: Flame,
  achievement_unlocked: Zap,
};

const TYPE_COLORS: Record<string, string> = {
  idle_alert: 'text-amber-400 bg-amber-500/10',
  break_reminder: 'text-sky-400 bg-sky-500/10',
  mission_reminder: 'text-emerald-400 bg-emerald-500/10',
  reflection_reminder: 'text-purple-400 bg-purple-500/10',
  focus_celebration: 'text-emerald-400 bg-emerald-500/10',
  streak_milestone: 'text-orange-400 bg-orange-500/10',
  achievement_unlocked: 'text-amber-400 bg-amber-500/10',
};

export function NotificationPanel() {
  const notifications = useAppStore(s => s.notifications);
  const setNotifications = useAppStore(s => s.setNotifications);
  const unreadCount = useAppStore(s => s.unreadCount);
  const setUnreadCount = useAppStore(s => s.setUnreadCount);
  const setView = useAppStore(s => s.setView);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch {} finally { setLoading(false); }
  }, [setNotifications, setUnreadCount]);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAll: true }) });
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleNotifClick = (notif: NotificationItem) => {
    if (!notif.read) {
      fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notif.id }),
      }).catch(() => {});
      setNotifications(notifications.map((n) => n.id === notif.id ? { ...n, read: true } : n));
      setUnreadCount(Math.max(0, unreadCount - 1));
    }
    // Validate actionUrl before using setView — only valid AppView values
    if (notif.actionUrl && VALID_ACTION_VIEWS.includes(notif.actionUrl as AppView)) {
      setView(notif.actionUrl as AppView);
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) fetchNotifs();
  }, [open, fetchNotifs]);

  return (
    <div className="relative">
      {/* Bell button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative h-8 w-8 text-zinc-400 hover:text-zinc-200"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close notifications' : `Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {unreadCount > 0 ? (
          <>
            <Bell className="h-4 w-4" aria-hidden="true" />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white"
              aria-label={`${unreadCount} unread notifications`}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          </>
        ) : (
          <BellOff className="h-4 w-4" aria-hidden="true" />
        )}
      </Button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full z-50 mt-2 w-72 sm:w-80 overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900/95 shadow-2xl backdrop-blur-xl"
              role="menu"
              aria-label="Notifications panel"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
                  <span className="text-xs font-medium text-zinc-200">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-medium text-rose-400" aria-live="polite">{unreadCount}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-zinc-500 hover:text-zinc-300" onClick={markAllRead} aria-label="Mark all notifications as read">
                      <CheckCheck className="mr-1 h-3 w-3" aria-hidden="true" />Mark all read
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-600 hover:text-zinc-300" onClick={() => setOpen(false)} aria-label="Close notifications">
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* List */}
              <ScrollArea className="max-h-72" role="menu">
                {loading ? (
                  <div className="flex items-center justify-center py-8" aria-label="Loading notifications">
                    <Loader2 className="h-4 w-4 animate-spin text-zinc-600" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center" aria-label="No notifications">
                    <BellOff className="h-6 w-6 text-zinc-700 mb-2" aria-hidden="true" />
                    <p className="text-xs text-zinc-500">No notifications yet</p>
                    <p className="text-[10px] text-zinc-700 mt-0.5">Smart alerts will appear here</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.04]">
                    {notifications.map((n) => {
                      const Icon = ICON_MAP[n.type] || Bell;
                      const colorClass = TYPE_COLORS[n.type] || 'text-zinc-400 bg-zinc-500/10';
                      return (
                        <motion.button
                          key={n.id}
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={cn(
                            'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03]',
                            !n.read && 'bg-white/[0.02]'
                          )}
                          onClick={() => handleNotifClick(n)}
                          aria-label={`${n.title}${!n.read ? ' (unread)' : ''}`}
                          role="menuitem"
                        >
                          <div className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', colorClass)} aria-hidden="true">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className={cn('text-xs font-medium', !n.read ? 'text-zinc-100' : 'text-zinc-400')}>{n.title}</p>
                              {!n.read && <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 mt-1.5" aria-hidden="true" />}
                            </div>
                            <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500 line-clamp-2">{n.body}</p>
                            <p className="mt-1 text-[9px] text-zinc-700">{timeAgo(n.createdAt)}</p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
