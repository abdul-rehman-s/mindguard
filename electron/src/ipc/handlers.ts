// MindGuard Desktop — IPC Handlers
// All ipcMain.handle() registrations for renderer→main communication

import type { DesktopStatus, DesktopSettings, CreateActivityInput, BatchActivityInput, NotificationPayload } from '../types';
import { IPC_CHANNELS } from './channels';
import { logger } from '../logger/logger';
import { ipcMain, BrowserWindow } from 'electron';
import { ActivityTracker } from '../tracker/activity-tracker';
import { SettingsManager } from '../settings/settings-manager';
import { SyncEngine } from '../sync/sync-engine';
import { FocusProtection } from '../focus/focus-protection';
import { NotificationManager } from '../notifications/notification-manager';
import { SecurityManager } from '../security/security-manager';
import { AutoLaunchManager } from '../auto-launch/auto-launch';
import { LocalDB } from '../database/local-db';
import { FocusTimerSync } from '../focus/focus-timer-sync';

export function registerIPCHandlers(deps: {
  tracker: ActivityTracker;
  settingsManager: SettingsManager;
  syncEngine: SyncEngine;
  focusProtection: FocusProtection;
  notificationManager: NotificationManager;
  securityManager: SecurityManager;
  autoLaunchManager: AutoLaunchManager;
  localDB: LocalDB;
  timerSync: FocusTimerSync;
  mainWindow: BrowserWindow;
}): void {
  const { tracker, settingsManager, syncEngine, focusProtection, notificationManager, securityManager, autoLaunchManager, localDB, mainWindow } = deps;

  // === desktop:get-status ===
  ipcMain.handle(IPC_CHANNELS.GET_STATUS, async () => {
    const trackerInfo = tracker.getInfo();
    const syncStatus = syncEngine.getSyncStatus();

    const status: DesktopStatus = {
      connected: true,
      trackingEnabled: trackerInfo.state === 'tracking' || trackerInfo.state === 'paused',
      currentApp: tracker.getCurrentApp(),
      currentWebsite: tracker.getCurrentWebsite(),
      currentActivityType: tracker.getCurrentActivityType(),
      idleMinutes: Math.round(trackerInfo.idleMs / 60000),
      lastActivityAt: trackerInfo.currentActivity?.timestamp ?? null,
      focusState: tracker.getCurrentFocusState(),
      syncStatus,
    };

    return status;
  });

  // === desktop:get-settings ===
  ipcMain.handle(IPC_CHANNELS.GET_SETTINGS, async () => {
    return settingsManager.getSettings();
  });

  // === desktop:update-settings ===
  ipcMain.handle(IPC_CHANNELS.UPDATE_SETTINGS, async (_event, partial: Partial<DesktopSettings>) => {
    if (!securityManager.validateIPCInput(IPC_CHANNELS.UPDATE_SETTINGS, partial)) {
      return settingsManager.getSettings();
    }

    const updated = settingsManager.updateLocal(partial);
    tracker.updateSettings(updated);

    // Push to web API asynchronously
    settingsManager.pushToWebAPI(partial).catch(err => {
      logger.warn('IPC', 'Settings push to API failed', { error: String(err) });
    });

    return updated;
  });

  // === desktop:auth-token ===
  ipcMain.handle(IPC_CHANNELS.AUTH_TOKEN, async (_event, token: string) => {
    if (!securityManager.validateIPCInput(IPC_CHANNELS.AUTH_TOKEN, token)) {
      return false;
    }

    securityManager.storeAuthToken(token);
    syncEngine.setAuthToken(token);
    logger.info('IPC', 'Auth token received from renderer');
    return true;
  });

  // === desktop:report-activity ===
  ipcMain.handle(IPC_CHANNELS.REPORT_ACTIVITY, async (_event, activity: CreateActivityInput) => {
    if (!securityManager.validateIPCInput(IPC_CHANNELS.REPORT_ACTIVITY, activity)) {
      return false;
    }

    localDB.insertActivity(activity);
    return true;
  });

  // === desktop:report-batch ===
  ipcMain.handle(IPC_CHANNELS.REPORT_BATCH, async (_event, batch: BatchActivityInput) => {
    if (!securityManager.validateIPCInput(IPC_CHANNELS.REPORT_BATCH, batch)) {
      return false;
    }

    localDB.insertActivityBatch(batch.activities);
    return true;
  });

  // === desktop:start-focus-protection ===
  ipcMain.handle(IPC_CHANNELS.START_FOCUS_PROTECTION, async () => {
    const settings = settingsManager.getSettings();
    focusProtection.start(settings, mainWindow);
    return true;
  });

  // === desktop:stop-focus-protection ===
  ipcMain.handle(IPC_CHANNELS.STOP_FOCUS_PROTECTION, async () => {
    focusProtection.stop();
    return true;
  });

  // === desktop:trigger-notification ===
  ipcMain.handle(IPC_CHANNELS.TRIGGER_NOTIFICATION, async (_event, payload: NotificationPayload) => {
    if (!securityManager.validateIPCInput(IPC_CHANNELS.TRIGGER_NOTIFICATION, payload)) {
      return false;
    }

    return notificationManager.show(payload);
  });

  // === desktop:set-auto-start ===
  ipcMain.handle(IPC_CHANNELS.SET_AUTO_START, async (_event, enabled: boolean) => {
    return autoLaunchManager.setAutoStart(enabled);
  });

  // === desktop:force-sync ===
  ipcMain.handle(IPC_CHANNELS.FORCE_SYNC, async () => {
    return syncEngine.forceFullSync();
  });

  // === desktop:get-sync-status ===
  ipcMain.handle(IPC_CHANNELS.GET_SYNC_STATUS, async () => {
    return syncEngine.getSyncStatus();
  });

  // === desktop:pause-tracking ===
  ipcMain.handle(IPC_CHANNELS.PAUSE_TRACKING, async () => {
    tracker.pause();
    return true;
  });

  // === desktop:resume-tracking ===
  ipcMain.handle(IPC_CHANNELS.RESUME_TRACKING, async () => {
    tracker.resume();
    return true;
  });

  // === desktop:export-logs ===
  ipcMain.handle(IPC_CHANNELS.EXPORT_LOGS, async () => {
    return localDB.exportAllData();
  });

  logger.info('IPC', 'All handlers registered');
}
