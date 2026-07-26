// MindGuard Desktop — Notification Manager
// Native OS notifications with cooldown and click handlers

import type { NotificationType, NotificationPayload, NotificationCooldown } from '../types';
import { logger } from '../logger/logger';
import { Notification, BrowserWindow } from 'electron';

const DEFAULT_COOLDOWNS: Record<NotificationType, number> = {
  idle_alert: 1800000,        // 30 min
  break_reminder: 3600000,    // 60 min
  mission_reminder: 1800000,  // 30 min
  reflection_reminder: 3600000, // 60 min
  focus_celebration: 7200000, // 120 min
  streak_milestone: 86400000, // 24 hours
  achievement_unlocked: 86400000, // 24 hours
  context_switch_alert: 3600000, // 60 min
  back_to_work: 1800000,      // 30 min
};

export class NotificationManager {
  private cooldowns: Map<NotificationType, NotificationCooldown> = new Map();
  private mainWindow: BrowserWindow | null = null;
  private muteNotifications = false;

  initialize(mainWindow: BrowserWindow, muteNotifications: boolean): void {
    this.mainWindow = mainWindow;
    this.muteNotifications = muteNotifications;

    // Initialize cooldowns
    for (const [type, cooldownMs] of Object.entries(DEFAULT_COOLDOWNS)) {
      this.cooldowns.set(type as NotificationType, {
        type: type as NotificationType,
        lastShownAt: 0,
        cooldownMs,
      });
    }

    logger.info('NotificationManager', 'Initialized', { muted: muteNotifications });
  }

  show(payload: NotificationPayload): boolean {
    if (this.muteNotifications) {
      logger.debug('NotificationManager', 'Notification muted', { type: payload.type });
      return false;
    }

    // Check cooldown
    const cooldown = this.cooldowns.get(payload.type);
    if (cooldown) {
      const elapsed = Date.now() - cooldown.lastShownAt;
      if (elapsed < cooldown.cooldownMs) {
        logger.debug('NotificationManager', 'Notification cooldown active', {
          type: payload.type,
          elapsed: Math.round(elapsed / 1000),
          cooldown: Math.round(cooldown.cooldownMs / 1000),
        });
        return false;
      }
    }

    // Show native notification
    const notification = new Notification({
      title: payload.title,
      body: payload.body,
      silent: false,
    });

    notification.on('click', () => {
      // Bring window to focus and navigate to relevant view
      if (this.mainWindow) {
        this.mainWindow.show();
        this.mainWindow.focus();
        if (payload.actionUrl) {
          this.mainWindow.webContents.send('desktop:navigate', payload.actionUrl);
        }
      }
    });

    notification.show();

    // Update cooldown
    if (cooldown) {
      cooldown.lastShownAt = Date.now();
    }

    logger.info('NotificationManager', 'Notification shown', {
      type: payload.type,
      title: payload.title,
    });

    return true;
  }

  setMuted(muted: boolean): void {
    this.muteNotifications = muted;
    logger.info('NotificationManager', `Notifications ${muted ? 'muted' : 'unmuted'}`);
  }

  checkIdleAndNotify(idleMinutes: number): void {
    if (idleMinutes >= 30) {
      this.show({
        type: 'idle_alert',
        title: 'You\'ve been idle',
        body: `You've been inactive for ${idleMinutes} minutes. Time to get back to work!`,
        actionUrl: 'dashboard',
      });
    } else if (idleMinutes >= 15) {
      this.show({
        type: 'back_to_work',
        title: 'Back to work?',
        body: `You've been idle for ${idleMinutes} minutes. Your focus session is waiting.`,
        actionUrl: 'timer',
      });
    }
  }

  checkBreakReminder(focusMinutes: number): void {
    if (focusMinutes >= 90) {
      this.show({
        type: 'break_reminder',
        title: 'Take a break',
        body: `You've been focused for ${focusMinutes} minutes. Take a short break to recharge.`,
        actionUrl: 'dashboard',
      });
    }
  }

  checkContextSwitchAlert(switchesPerHour: number): void {
    if (switchesPerHour > 8) {
      this.show({
        type: 'context_switch_alert',
        title: 'Too many app switches',
        body: `You've switched apps ${switchesPerHour} times in the last hour. Try to focus on one task.`,
        actionUrl: 'dashboard',
      });
    }
  }

  celebrateFocus(focusMinutes: number): void {
    this.show({
      type: 'focus_celebration',
      title: 'Great focus session!',
      body: `You've completed ${focusMinutes} minutes of focused work. Keep it up!`,
      actionUrl: 'dashboard',
    });
  }

  resetCooldowns(): void {
    for (const cooldown of this.cooldowns.values()) {
      cooldown.lastShownAt = 0;
    }
  }
}
