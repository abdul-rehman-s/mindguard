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
 */

const { app, BrowserWindow, Tray, Menu, ipcMain, Notification, nativeImage } = require('electron');
const path = require('path');
const { ActivityTracker } = require('./tracker/activity-tracker');
const { TrayManager } = require('./tray/tray-manager');
const { NotificationManager } = require('./notifications/notification-manager');
const { FocusProtection } = require('./focus/focus-protection');
const { SettingsManager } = require('./config/settings');
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

  // Create main window
  createMainWindow();

  // Initialize tray
  trayManager = new TrayManager(TRAY_ICON_PATH, mainWindow, settingsManager);

  // Register auto-start if enabled
  if (settingsManager.get('autoStart')) {
    app.setLoginItemSettings({ openAtLogin: true, path: app.getPath('exe') });
  }

  // Initialize activity tracker
  tracker = new ActivityTracker(settingsManager);
  await tracker.start();

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
  });

  // Start tracker data reporting loop
  startReportingLoop();

  // Start notification check loop
  startNotificationLoop();
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

// ─── Reporting Loop ───
// Periodically sends tracked activity data to the Next.js API

function startReportingLoop() {
  const interval = (settingsManager?.get('trackerInterval') || 30) * 1000;
  
  setInterval(async () => {
    if (!tracker || !settingsManager?.get('trackingEnabled')) return;

    const activities = tracker.flushQueue();
    if (activities.length === 0) return;

    try {
      // Get auth token from renderer via IPC
      const token = await getTokenFromRenderer();
      if (!token) return;

      const response = await fetch(`${WEB_URL}/api/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `next-auth.session-token=${token}`,
        },
        body: JSON.stringify({ activities }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`[tracker] Reported ${result.created || 1} activities`);
      }
    } catch (err) {
      console.error('[tracker] Failed to report activities:', err.message);
    }
  }, interval);
}

async function getTokenFromRenderer() {
  if (!mainWindow) return null;
  try {
    return await mainWindow.webContents.executeJavaScript(
      `document.cookie.match(/next-auth\\.session-token=([^;]+)/)?.[1] || null`
    );
  } catch {
    return null;
  }
}

// ─── Notification Loop ───
// Periodically checks for notification triggers

function startNotificationLoop() {
  setInterval(async () => {
    if (!settingsManager?.get('trackingEnabled')) return;

    try {
      const token = await getTokenFromRenderer();
      if (!token) return;

      const response = await fetch(`${WEB_URL}/api/desktop/notifications`, {
        headers: { 'Cookie': `next-auth.session-token=${token}` },
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
