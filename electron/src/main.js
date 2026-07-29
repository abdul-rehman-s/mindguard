/**
 * MindGuard Desktop Agent — Main Process
 * 
 * Responsibilities:
 * - Create BrowserWindow loading the Next.js web app
 * - Run desktop activity tracker in background
 * - System tray management (minimize to tray, tray menu)
 * - IPC communication with renderer
 * - Auto-start on login registration
 * - Native OS notifications
 * - Focus protection (block apps/websites during focus sessions)
 * - Automatic pairing with web app (no manual login)
 */

const { app, BrowserWindow, Tray, Menu, ipcMain, Notification, nativeImage } = require('electron');
const path = require('path');
const { ActivityTracker } = require('./tracker/activity-tracker');
const { TrayManager } = require('./tray/tray-manager');
const { NotificationManager } = require('./notifications/notification-manager');
const { FocusProtection } = require('./focus/focus-protection');
const { SettingsManager } = require('./config/settings');
const { DeviceAuthManager } = require('./auth/device-auth');
const { registerIpcHandlers } = require('./ipc/handlers');

// ─── Configuration ───
const IS_DEV = process.env.NODE_ENV === 'development' || process.env.MINDGUARD_DEV === 'true';
const WEB_URL = IS_DEV ? 'http://localhost:3000' : 'https://mindguard.app';
const TRAY_ICON_PATH = path.join(__dirname, '..', 'assets', 'tray-icon.png');

// ─── Global References ───
let mainWindow = null;
let tracker = null;
let trayManager = null;
let notificationManager = null;
let focusProtection = null;
let settingsManager = null;
let deviceAuth = null;

// ─── App Lifecycle ───

// Prevent multiple instances
app.requestSingleInstanceLock();
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on('ready', async () => {
  // Initialize settings
  settingsManager = new SettingsManager();
  await settingsManager.load();

  // Initialize device auth manager
  deviceAuth = new DeviceAuthManager(settingsManager, WEB_URL);

  // Create main window
  createMainWindow();

  // Initialize tray
  trayManager = new TrayManager(TRAY_ICON_PATH, mainWindow, settingsManager);

  // Register auto-start if enabled
  if (settingsManager.get('autoStart')) {
    app.setLoginItemSettings({ openAtLogin: true, path: app.getPath('exe') });
  }

  // Start device auth flow
  await deviceAuth.initialize();

  // Initialize activity tracker (only if paired)
  if (deviceAuth.isPaired()) {
    tracker = new ActivityTracker(settingsManager);
    await tracker.start();
  }

  // Initialize notification manager
  notificationManager = new NotificationManager(settingsManager);

  // Initialize focus protection
  focusProtection = new FocusProtection(settingsManager);

  // Register IPC handlers
  registerIpcHandlers({
    tracker,
    notificationManager,
    focusProtection,
    settingsManager,
    mainWindow,
    deviceAuth,
  });

  // Start pairing polling if not yet paired
  if (!deviceAuth.isPaired()) {
    startPairingPoll();
  } else {
    // Start tracker data reporting loop
    startReportingLoop();
    // Start notification check loop
    startNotificationLoop();
    // Start periodic data sync
    startSyncLoop();
  }
});

app.on('window-all-closed', (e) => {
  // Prevent app from quitting — run in background
  if (settingsManager && settingsManager.get('runInBackground')) {
    e.preventDefault();
  } else {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (tracker) tracker.stop();
  if (focusProtection) focusProtection.stop();
  if (deviceAuth) deviceAuth.stopPolling();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  } else {
    mainWindow.show();
  }
});

// ─── Window Creation ───

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'MindGuard AI',
    icon: nativeImage.createFromPath(TRAY_ICON_PATH),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
    backgroundColor: '#09090b',
  });

  mainWindow.loadURL(WEB_URL);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('close', (e) => {
    if (settingsManager && settingsManager.get('runInBackground')) {
      e.preventDefault();
      mainWindow.hide();
      trayManager?.showBalloon('MindGuard is running in the background');
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (IS_DEV) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
}

// ─── Pairing Poll ───
// Desktop polls the web app for pending pairing tokens

let pairingPollInterval = null;

function startPairingPoll() {
  console.log('[auth] Starting pairing poll — looking for web login...');
  pairingPollInterval = setInterval(async () => {
    if (!deviceAuth) return;

    try {
      const result = await deviceAuth.checkPairingStatus();
      
      if (result.status === 'pairing_available' && result.pairingToken) {
        console.log('[auth] Found pairing token! Completing pairing...');
        const completed = await deviceAuth.completePairing(result.pairingToken, result.deviceId);
        
        if (completed) {
          console.log('[auth] Pairing successful! Switching to authenticated mode.');
          stopPairingPoll();
          
          // Now start all authenticated services
          tracker = new ActivityTracker(settingsManager);
          await tracker.start();
          startReportingLoop();
          startNotificationLoop();
          startSyncLoop();

          // Notify renderer
          mainWindow?.webContents.send('desktop:auth-change', { paired: true });
        }
      } else if (result.status === 'paired') {
        // Already paired (perhaps from a previous session)
        console.log('[auth] Already paired. Syncing...');
        stopPairingPoll();
        tracker = new ActivityTracker(settingsManager);
        await tracker.start();
        startReportingLoop();
        startNotificationLoop();
        startSyncLoop();
        mainWindow?.webContents.send('desktop:auth-change', { paired: true });
      }
    } catch (err) {
      console.error('[auth] Pairing poll error:', err.message);
    }
  }, 10000); // Poll every 10 seconds
}

function stopPairingPoll() {
  if (pairingPollInterval) {
    clearInterval(pairingPollInterval);
    pairingPollInterval = null;
  }
}

// ─── Reporting Loop ───
// Periodically sends tracked activity data to the Next.js API
// Uses device token auth instead of session cookies

function startReportingLoop() {
  const interval = (settingsManager?.get('trackerInterval') || 30) * 1000;
  
  setInterval(async () => {
    if (!tracker || !settingsManager?.get('trackingEnabled')) return;
    if (!deviceAuth?.isPaired()) return;

    const activities = tracker.flushQueue();
    if (activities.length === 0) return;

    try {
      const accessToken = await deviceAuth.getAccessToken();
      if (!accessToken) return;

      const response = await fetch(`${WEB_URL}/api/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Device-Id': deviceAuth.deviceId,
        },
        body: JSON.stringify({ activities }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`[tracker] Reported ${result.created || 1} activities`);
      } else if (response.status === 401) {
        // Token might have expired — try refreshing
        console.log('[tracker] Access token expired, refreshing...');
        const refreshed = await deviceAuth.refreshAuth();
        if (refreshed) {
          // Retry the request
          const newToken = await deviceAuth.getAccessToken();
          if (newToken) {
            const retryResponse = await fetch(`${WEB_URL}/api/activities`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}`,
                'X-Device-Id': deviceAuth.deviceId,
              },
              body: JSON.stringify({ activities }),
            });
            if (retryResponse.ok) {
              console.log(`[tracker] Reported activities after token refresh`);
            }
          }
        } else {
          // Refresh failed — need to re-pair
          console.error('[tracker] Token refresh failed. Starting pairing poll...');
          startPairingPoll();
        }
      }
    } catch (err) {
      console.error('[tracker] Failed to report activities:', err.message);
    }
  }, interval);
}

// ─── Notification Loop ───
// Periodically checks for notification triggers using device auth

function startNotificationLoop() {
  setInterval(async () => {
    if (!settingsManager?.get('trackingEnabled')) return;
    if (!deviceAuth?.isPaired()) return;

    try {
      const accessToken = await deviceAuth.getAccessToken();
      if (!accessToken) return;

      const response = await fetch(`${WEB_URL}/api/desktop/notifications`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Device-Id': deviceAuth.deviceId,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Show suggested notifications
        for (const suggestion of data.suggested || []) {
          notificationManager?.showNative(suggestion.title, suggestion.body);
        }
      }
    } catch (err) {
      console.error('[notifications] Check failed:', err.message);
    }
  }, 60000); // Check every 60 seconds
}

// ─── Data Sync Loop ───
// Periodically syncs settings and missions from the web app

function startSyncLoop() {
  setInterval(async () => {
    if (!deviceAuth?.isPaired()) return;

    try {
      const accessToken = await deviceAuth.getAccessToken();
      if (!accessToken) return;

      const response = await fetch(`${WEB_URL}/api/desktop/sync`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Device-Id': deviceAuth.deviceId,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Sync settings locally
        if (data.desktopSettings) {
          settingsManager?.set('trackingEnabled', data.desktopSettings.trackingEnabled);
          settingsManager?.set('blockedApps', data.desktopSettings.blockedApps);
          settingsManager?.set('blockedWebsites', data.desktopSettings.blockedWebsites);
          settingsManager?.set('trackerInterval', data.desktopSettings.trackerInterval);
          console.log('[sync] Desktop settings synced');
        }

        if (data.settings) {
          // Sync user settings (theme, focus preferences, etc.)
          console.log('[sync] User settings synced');
        }

        // Notify renderer of synced data
        mainWindow?.webContents.send('desktop:sync-complete', data);
      }
    } catch (err) {
      console.error('[sync] Sync failed:', err.message);
    }
  }, 300000); // Sync every 5 minutes
}
