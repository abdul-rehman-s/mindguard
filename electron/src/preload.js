/**
 * MindGuard Desktop Agent — Preload Script
 * 
 * Bridges IPC between the main process and the renderer (Next.js web app).
 * Exposes safe APIs via contextBridge for the renderer to call.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mindguardDesktop', {
  // ─── Status ───
  getStatus: () => ipcRenderer.invoke('desktop:get-status'),

  // ─── Settings ───
  getSettings: () => ipcRenderer.invoke('desktop:get-settings'),
  updateSettings: (settings) => ipcRenderer.invoke('desktop:update-settings', settings),

  // ─── Activity Reporting ───
  reportActivity: (activity) => ipcRenderer.invoke('desktop:report-activity', activity),
  reportBatch: (activities) => ipcRenderer.invoke('desktop:report-batch', activities),

  // ─── Focus Protection ───
  startFocusProtection: () => ipcRenderer.invoke('desktop:start-focus-protection'),
  stopFocusProtection: () => ipcRenderer.invoke('desktop:stop-focus-protection'),

  // ─── Notifications ───
  triggerNotification: (type, title, body) => ipcRenderer.invoke('desktop:trigger-notification', type, title, body),

  // ─── Auto Start ───
  setAutoStart: (enabled) => ipcRenderer.invoke('desktop:set-auto-start', enabled),

  // ─── Events (main → renderer) ───
  onActivityUpdate: (callback) => ipcRenderer.on('desktop:activity-update', callback),
  onNotification: (callback) => ipcRenderer.on('desktop:notification', callback),
  onFocusProtectionChange: (callback) => ipcRenderer.on('desktop:focus-protection-change', callback),

  // ─── Utility ───
  isElectron: true,
  platform: process.platform,
});
