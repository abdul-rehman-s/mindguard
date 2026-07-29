// MindGuard Desktop — Main Process Entry Point
// Production-grade Electron app with all subsystems initialized

import { app, BrowserWindow, session } from 'electron';
import * as path from 'path';
import { autoUpdater } from 'electron-updater';
import { logger } from './logger/logger';
import { ActivityTracker } from './tracker/activity-tracker';
import { TrayManager } from './tray/tray-manager';
import { NotificationManager } from './notifications/notification-manager';
import { FocusProtection } from './focus/focus-protection';
import { FocusTimerSync } from './focus/focus-timer-sync';
import { SettingsManager } from './settings/settings-manager';
import { SecurityManager } from './security/security-manager';
import { AutoLaunchManager } from './auto-launch/auto-launch';
import { LocalDB } from './database/local-db';
import { SyncEngine } from './sync/sync-engine';
import { WSClient } from './websocket/ws-client';
import { registerIPCHandlers } from './ipc/handlers';
import { formatDuration } from './utils/formatters';

// === Configuration ===
const WEB_URL = process.env.MINDGUARD_URL || 'http://localhost:3000';
const WS_URL = process.env.MINDGUARD_WS_URL || 'ws://localhost:3003';
const TRACKER_INTERVAL_MS = 30000; // 30 seconds
const SYNC_INTERVAL_MS = 60000; // 1 minute
const NOTIFICATION_CHECK_INTERVAL_MS = 60000; // 1 minute

// === Single Instance Lock ===
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

// === Global State ===
let isQuitting = false;
let mainWindow: BrowserWindow | null = null;
let tracker: ActivityTracker | null = null;
let trayManager: TrayManager | null = null;
let notificationManager: NotificationManager | null = null;
let focusProtection: FocusProtection | null = null;
let timerSync: FocusTimerSync | null = null;
let settingsManager: SettingsManager | null = null;
let securityManager: SecurityManager | null = null;
let autoLaunchManager: AutoLaunchManager | null = null;
let localDB: LocalDB | null = null;
let syncEngine: SyncEngine | null = null;
let wsClient: WSClient | null = null;

let reportingTimer: ReturnType<typeof setInterval> | null = null;
let syncTimer: ReturnType<typeof setInterval> | null = null;
let notificationTimer: ReturnType<typeof setInterval> | null = null;
let trayTooltipTimer: ReturnType<typeof setInterval> | null = null;

// === Window Creation ===
function createWindow(): BrowserWindow {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'MindGuard AI — Protect Your Attention',
    backgroundColor: '#09090b', // zinc-950
    show: false, // Show after ready
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,  // SECURITY: Always enabled
      nodeIntegration: false,  // SECURITY: Always disabled
      sandbox: true,
      disableHtmlFullscreenWindowResize: true,
    },
  });

  // Load web app
  mainWindow.loadURL(WEB_URL);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    logger.info('Main', 'Window shown');
  });

  // Handle close — minimize to tray if runInBackground
  mainWindow.on('close', (e: Electron.Event) => {
    const settings = settingsManager?.getSettings();
    if (settings?.runInBackground && !isQuitting) {
      e.preventDefault();
      mainWindow?.hide();
      logger.info('Main', 'Window hidden (run in background)');
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

// === Initialize All Systems ===
async function initializeSystems(): Promise<void> {
  logger.info('Main', 'Initializing systems...');

  // 1. Local Database
  const dbPath = path.join(app.getPath('userData'), 'desktop.db');
  localDB = new LocalDB(dbPath);
  localDB.initialize();

  // 2. Security Manager
  securityManager = new SecurityManager(localDB);

  // 3. Sync Engine
  syncEngine = new SyncEngine(localDB, WEB_URL);

  // 4. Settings Manager
  settingsManager = new SettingsManager(localDB, syncEngine);
    await settingsManager.syncFromWebAPI();

  const settings = settingsManager.getSettings();

  // 5. Auto Launch
  autoLaunchManager = new AutoLaunchManager();
  if (settings.autoStart) {
    autoLaunchManager.setAutoStart(true);
  }

  // 6. Activity Tracker
  tracker = new ActivityTracker();
  await tracker.initialize(mainWindow!, settings);

  // 7. Tray Manager
  trayManager = new TrayManager();
  trayManager.initialize(mainWindow!, settings);

  // 8. Notification Manager
  notificationManager = new NotificationManager();
  notificationManager.initialize(mainWindow!, settings.muteNotifications);

  // 9. Focus Protection
  focusProtection = new FocusProtection();

  // 10. Focus Timer Sync
  timerSync = new FocusTimerSync();
  timerSync.initialize(mainWindow!);

  // 11. WebSocket Client
  wsClient = new WSClient(WS_URL);
  wsClient.setMessageHandler((msg) => handleWSMessage(msg));
  wsClient.connect();

  // 12. IPC Handlers
  registerIPCHandlers({
    tracker,
    settingsManager,
    syncEngine,
    focusProtection,
    notificationManager,
    securityManager,
    autoLaunchManager,
    localDB,
    timerSync,
    mainWindow: mainWindow!,
  });

  // 13. Start tracking
  if (settings.trackingEnabled) {
    tracker.start();
  }

  // 14. Start reporting loop
  startReportingLoop();

  // 15. Start sync loop
  startSyncLoop();

  // 16. Start notification check loop
  startNotificationLoop();

  // 17. Start tray tooltip update loop
  startTrayTooltipLoop();

  logger.info('Main', 'All systems initialized');
}

// === Reporting Loop ===
function startReportingLoop(): void {
  if (reportingTimer) clearInterval(reportingTimer);

  reportingTimer = setInterval(async () => {
    if (!tracker || !localDB || !syncEngine) return;

    try {
      const batch = tracker.flushQueue();
      if (batch.length > 0) {
        // Store locally first (offline support)
        localDB.insertActivityBatch(batch);
        logger.info('Reporting', 'Activity batch stored locally', { count: batch.length });
      }
    } catch (err) {
      logger.error('Reporting', 'Error in reporting loop', { error: String(err) });
    }
  }, TRACKER_INTERVAL_MS);
}

// === Sync Loop ===
function startSyncLoop(): void {
  if (syncTimer) clearInterval(syncTimer);

  syncTimer = setInterval(async () => {
    if (!syncEngine) return;

    try {
      const result = await syncEngine.syncActivities();
      if (result.syncedCount > 0) {
        logger.info('Sync', 'Activities synced', { count: result.syncedCount });
      }

      // Also sync settings periodically
      if (settingsManager) {
        await settingsManager.pushToWebAPI(settingsManager.getSettings());
      }
    } catch (err) {
      logger.error('Sync', 'Sync loop error', { error: String(err) });
    }
  }, SYNC_INTERVAL_MS);
}

// === Notification Check Loop ===
function startNotificationLoop(): void {
  if (notificationTimer) clearInterval(notificationTimer);

  notificationTimer = setInterval(async () => {
    if (!notificationManager || !tracker) return;

    const info = tracker.getInfo();
    notificationManager.checkIdleAndNotify(Math.round(info.idleMs / 60000));
  }, NOTIFICATION_CHECK_INTERVAL_MS);
}

// === Tray Tooltip Update Loop ===
function startTrayTooltipLoop(): void {
  if (trayTooltipTimer) clearInterval(trayTooltipTimer);

  trayTooltipTimer = setInterval(() => {
    if (!trayManager || !tracker) return;

    const info = tracker.getInfo();
    const app = tracker.getCurrentApp() || 'No activity';
    const duration = formatDuration(Math.round(info.sessionDurationMs / 1000));
    const state = info.state === 'tracking' ? 'Tracking' : info.state;

    trayManager.updateTooltip(`${state}: ${app} (${duration})`);
  }, 10000); // Update every 10 seconds
}

// === WebSocket Message Handler ===
function handleWSMessage(msg: { type: string; payload: unknown }): void {
  logger.debug('Main', 'WebSocket message', { type: msg.type });

  switch (msg.type) {
    case 'timer_command': {
      const command = msg.payload as { action: string; duration?: number; missionId?: string; missionTitle?: string };
      if (timerSync) {
        timerSync.handleTimerCommand(command as any);
      }
      break;
    }

    case 'settings_sync': {
      // Web app settings changed — sync locally
      if (settingsManager) {
        const sm = settingsManager;
        sm.syncFromWebAPI().then(() => {
          const settings = sm.getSettings();
          tracker?.updateSettings(settings);
          trayManager?.updateSettings(settings);
          notificationManager?.setMuted(settings.muteNotifications);
        });
      }
      break;
    }

    case 'notification_trigger': {
      const payload = msg.payload as { type: string; title: string; body: string };
      if (notificationManager) {
        notificationManager.show(payload as any);
      }
      break;
    }

    case 'pong': {
      // Heartbeat response — connection is alive
      break;
    }
  }
}

// === App Lifecycle ===
app.whenReady().then(async () => {
  logger.info('Main', 'App ready');

  // Set Content-Security-Policy for all web contents
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' ws://localhost:* http://localhost:* https://*; img-src 'self' data: https:; font-src 'self' data: https:;"
        ],
      },
    });
  });

  createWindow();
  await initializeSystems();

  // === Auto Updater ===
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'abdul-rehman-s',
    repo: 'mindguard',
  });

  autoUpdater.on('update-available', (info) => {
    logger.info('AutoUpdater', 'Update available', { version: info.version });
    // Notify user via tray/notification — they can choose to download
    if (notificationManager) {
      notificationManager.show({
        type: 'context_switch_alert',
        title: 'MindGuard Update Available',
        body: `Version ${info.version} is available. Click to download.`,
      });
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    logger.info('AutoUpdater', 'Update downloaded', { version: info.version });
    if (notificationManager) {
      notificationManager.show({
        type: 'focus_celebration',
        title: 'MindGuard Update Ready',
        body: `Version ${info.version} downloaded. Restart to install.`,
      });
    }
  });

  autoUpdater.on('error', (err) => {
    logger.error('AutoUpdater', 'Update error', { error: String(err) });
  });

  autoUpdater.on('download-progress', (progress) => {
    logger.debug('AutoUpdater', 'Download progress', { percent: progress.percent });
  });

  // Check for updates (silent — no user interruption)
  autoUpdater.checkForUpdates().catch((err) => {
    logger.debug('AutoUpdater', 'Update check failed (offline or no releases)', { error: String(err) });
  });
});

app.on('window-all-closed', () => {
  // Don't quit on macOS (menu bar app convention)
  const settings = settingsManager?.getSettings();
  if (!settings?.runInBackground && process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else {
    mainWindow?.show();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
  logger.info('Main', 'App quitting...');
});

app.on('will-quit', () => {
  // Clean up all systems
  tracker?.stop();
  trayManager?.destroy();
  wsClient?.disconnect();
  localDB?.close();

  // Clear timers
  if (reportingTimer) clearInterval(reportingTimer);
  if (syncTimer) clearInterval(syncTimer);
  if (notificationTimer) clearInterval(notificationTimer);
  if (trayTooltipTimer) clearInterval(trayTooltipTimer);

  logger.info('Main', 'All systems cleaned up');
});

// Handle second instance — focus existing window
app.on('second-instance', () => {
  if (mainWindow) {
    if (!mainWindow.isVisible()) mainWindow.show();
    mainWindow.focus();
  }
});

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  logger.error('Main', 'Uncaught exception', { error: String(err) });
});

process.on('unhandledRejection', (reason) => {
  logger.error('Main', 'Unhandled promise rejection', { reason: String(reason) });
});
