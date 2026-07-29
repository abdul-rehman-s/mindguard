// MindGuard Desktop — Secure Preload Script
// Exposes only safe methods via contextBridge (NO nodeIntegration, contextIsolation enabled)

import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from './ipc/channels';

const api = {
  // === Status & Info ===
  getStatus: (): Promise<any> => ipcRenderer.invoke(IPC_CHANNELS.GET_STATUS),
  getSettings: (): Promise<any> => ipcRenderer.invoke(IPC_CHANNELS.GET_SETTINGS),
  updateSettings: (settings: any): Promise<any> => ipcRenderer.invoke(IPC_CHANNELS.UPDATE_SETTINGS, settings),

  // === Auth ===
  sendAuthToken: (token: string): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.AUTH_TOKEN, token),

  // === Activity Reporting ===
  reportActivity: (activity: any): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.REPORT_ACTIVITY, activity),
  reportBatch: (activities: any): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.REPORT_BATCH, activities),

  // === Focus Protection ===
  startFocusProtection: (): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.START_FOCUS_PROTECTION),
  stopFocusProtection: (): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.STOP_FOCUS_PROTECTION),

  // === Notifications ===
  triggerNotification: (payload: any): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.TRIGGER_NOTIFICATION, payload),

  // === Auto Launch ===
  setAutoStart: (enabled: boolean): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.SET_AUTO_START, enabled),

  // === Sync ===
  forceSync: (): Promise<any> => ipcRenderer.invoke(IPC_CHANNELS.FORCE_SYNC),
  getSyncStatus: (): Promise<any> => ipcRenderer.invoke(IPC_CHANNELS.GET_SYNC_STATUS),

  // === Tracking Control ===
  pauseTracking: (): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.PAUSE_TRACKING),
  resumeTracking: (): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.RESUME_TRACKING),

  // === Data Export ===
  exportLogs: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.EXPORT_LOGS),

  // === Event Channels (main → renderer) ===
  onActivityUpdate: (callback: (data: any) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: any) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.ACTIVITY_UPDATE, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.ACTIVITY_UPDATE, handler);
  },

  onNotification: (callback: (data: any) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: any) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.NOTIFICATION, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.NOTIFICATION, handler);
  },

  onFocusProtectionChange: (callback: (data: any) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: any) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.FOCUS_PROTECTION_CHANGE, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.FOCUS_PROTECTION_CHANGE, handler);
  },

  onNavigate: (callback: (view: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, view: string) => callback(view);
    ipcRenderer.on(IPC_CHANNELS.NAVIGATE, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.NAVIGATE, handler);
  },

  onTimerSync: (callback: (state: any) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, state: any) => callback(state);
    ipcRenderer.on(IPC_CHANNELS.TIMER_SYNC, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.TIMER_SYNC, handler);
  },

  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },

  // === Constants ===
  isElectron: true,
  platform: process.platform,
};

// Expose to renderer via contextBridge (SECURE)
contextBridge.exposeInMainWorld('mindguardDesktop', api);
