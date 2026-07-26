/**
 * MindGuard Desktop Agent — Notification Manager
 * 
 * Handles native OS notifications:
 * - Idle alerts
 * - Break reminders
 * - Focus celebration
 * - Mission reminders
 * - Back-to-work reminders
 */

const { Notification } = require('electron');

class NotificationManager {
  constructor(settingsManager) {
    this.settings = settingsManager;
    this.lastNotificationTime = {};
  }

  showNative(title, body) {
    if (this.settings.get('muteNotifications')) return;

    const notification = new Notification({
      title,
      body,
      silent: false,
      icon: undefined, // Could add MindGuard icon
    });

    notification.show();
    notification.on('click', () => {
      // Bring window to focus on notification click
      // (handled by main process)
    });

    return notification;
  }

  showIdleAlert(idleMinutes) {
    const prefs = this.settings.get('notificationPrefs') || {};
    if (!prefs.idleAlert) return;

    // Prevent duplicate within 30 min
    if (this.isDuplicate('idle_alert', 30)) return;

    this.showNative(
      'You\'ve been idle',
      `No activity detected for ${idleMinutes} minutes. Consider getting back to your mission.`
    );
    this.markSent('idle_alert');
  }

  showBreakReminder(sessionDuration) {
    const prefs = this.settings.get('notificationPrefs') || {};
    if (!prefs.breakReminder) return;

    if (this.isDuplicate('break_reminder', 60)) return;

    this.showNative(
      'Take a break',
      `You just completed a ${Math.round(sessionDuration / 60)}-minute session. Stand up, stretch, and hydrate.`
    );
    this.markSent('break_reminder');
  }

  showFocusCelebration(totalMinutes) {
    const prefs = this.settings.get('notificationPrefs') || {};
    if (!prefs.focusCelebration) return;

    if (this.isDuplicate('focus_celebration', 120)) return;

    this.showNative(
      'Excellent — focus streak!',
      `You've accumulated ${totalMinutes} minutes of focused work today. Outstanding productivity!`
    );
    this.markSent('focus_celebration');
  }

  showBackToWork() {
    const prefs = this.settings.get('notificationPrefs') || {};
    if (!prefs.missionReminder) return;

    if (this.isDuplicate('back_to_work', 30)) return;

    this.showNative(
      'Back to work',
      'Your focus session is waiting. Get back to it.'
    );
    this.markSent('back_to_work');
  }

  showContextSwitchAlert(switchesPerHour) {
    if (this.isDuplicate('context_switch', 60)) return;

    this.showNative(
      'Excessive context switching',
      `You're switching between ${switchesPerHour} apps per hour. Try batching similar tasks together.`
    );
    this.markSent('context_switch');
  }

  // ─── Helpers ───

  isDuplicate(type, cooldownMinutes) {
    const lastTime = this.lastNotificationTime[type];
    if (!lastTime) return false;
    const elapsed = (Date.now() - lastTime) / 60000;
    return elapsed < cooldownMinutes;
  }

  markSent(type) {
    this.lastNotificationTime[type] = Date.now();
  }
}

module.exports = { NotificationManager };
