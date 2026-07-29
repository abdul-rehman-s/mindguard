/**
 * MindGuard Desktop Agent — IPC Handlers
 * 
 * Registers all IPC handlers for communication between
 * the main process and the renderer (Next.js web app).
 * 
 * Updated with device pairing auth handlers.
 */

const { ipcMain, app } = require('electron');

function registerIpcHandlers(context) {
  const { tracker, notificationManager, focusProtection, settingsManager, mainWindow, deviceAuth } = context;

  // ─── Status ───
  ipcMain.handle('desktop:get-status', async () => {
    const currentActivity = tracker?.currentActivity;
    return {
      connected: tracker?.running || false,
      trackingEnabled: settingsManager?.get('trackingEnabled') || true,
      paired: deviceAuth?.isPaired() || false,
      deviceId: deviceAuth?.deviceId || null,
      currentApp: currentActivity?.application || null,
      currentWebsite: currentActivity?.website || null,
      currentActivityType: currentActivity?.type || null,
      idleMinutes: 0,
      lastActivityAt: currentActivity?.startedAt || null,
    };
  });

  // ─── Settings ───
  ipcMain.handle('desktop:get-settings', async () => {
    return settingsManager?.getAll() || {};
  });

  ipcMain.handle('desktop:update-settings', async (_event, settings) => {
    settingsManager?.setAll(settings);
    return settingsManager?.getAll() || {};
  });

  // ─── Activity Reporting ───
  ipcMain.handle('desktop:report-activity', async (_event, activity) => {
    tracker?.queue.push(activity);
    return { queued: true };
  });

  ipcMain.handle('desktop:report-batch', async (_event, activities) => {
    for (const activity of activities) {
      tracker?.queue.push(activity);
    }
    return { queued: activities.length };
  });

  // ─── Focus Protection ───
  ipcMain.handle('desktop:start-focus-protection', async () => {
    focusProtection?.start();
    mainWindow?.webContents.send('desktop:focus-protection-change', true);
    return { active: true };
  });

  ipcMain.handle('desktop:stop-focus-protection', async () => {
    focusProtection?.stop();
    mainWindow?.webContents.send('desktop:focus-protection-change', false);
    return { active: false };
  });

  // ─── Notifications ───
  ipcMain.handle('desktop:trigger-notification', async (_event, type, title, body) => {
    notificationManager?.showNative(title, body);
    return { shown: true };
  });

  // ─── Auto Start ───
  ipcMain.handle('desktop:set-auto-start', async (_event, enabled) => {
    settingsManager?.set('autoStart', enabled);
    app.setLoginItemSettings({ openAtLogin: enabled, path: app.getPath('exe') });
    return { autoStart: enabled };
  });

  // ─── Device Auth ───
  ipcMain.handle('desktop:check-pairing-status', async () => {
    if (!deviceAuth) return { status: 'no_pairing' };
    return await deviceAuth.checkPairingStatus();
  });

  ipcMain.handle('desktop:complete-pairing', async (_event, pairingToken, deviceId) => {
    if (!deviceAuth) return false;
    const result = await deviceAuth.completePairing(pairingToken, deviceId);
    return result;
  });

  ipcMain.handle('desktop:refresh-auth', async () => {
    if (!deviceAuth) return false;
    return await deviceAuth.refreshAuth();
  });

  ipcMain.handle('desktop:sync-data', async () => {
    if (!deviceAuth) return null;
    return await deviceAuth.syncData();
  });

  ipcMain.handle('desktop:disconnect', async () => {
    if (!deviceAuth) return;
    deviceAuth.disconnect();
    return { disconnected: true };
  });

  ipcMain.handle('desktop:get-auth-status', async () => {
    return {
      paired: deviceAuth?.isPaired() || false,
      deviceId: deviceAuth?.deviceId || null,
      userId: deviceAuth?.authStore?.get('userId') || null,
    };
  });
}

module.exports = { registerIpcHandlers };
