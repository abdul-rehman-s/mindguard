// MindGuard Desktop — IPC Channel Constants
// Centralized channel names for all IPC communication

export const IPC_CHANNELS = {
  // Status & Info
  GET_STATUS: 'desktop:get-status',
  GET_SETTINGS: 'desktop:get-settings',
  UPDATE_SETTINGS: 'desktop:update-settings',

  // Auth
  AUTH_TOKEN: 'desktop:auth-token',

  // Activity Reporting
  REPORT_ACTIVITY: 'desktop:report-activity',
  REPORT_BATCH: 'desktop:report-batch',

  // Focus Protection
  START_FOCUS_PROTECTION: 'desktop:start-focus-protection',
  STOP_FOCUS_PROTECTION: 'desktop:stop-focus-protection',

  // Notifications
  TRIGGER_NOTIFICATION: 'desktop:trigger-notification',

  // Auto Launch
  SET_AUTO_START: 'desktop:set-auto-start',

  // Sync
  FORCE_SYNC: 'desktop:force-sync',
  GET_SYNC_STATUS: 'desktop:get-sync-status',

  // Tracking Control
  PAUSE_TRACKING: 'desktop:pause-tracking',
  RESUME_TRACKING: 'desktop:resume-tracking',

  // Data Export
  EXPORT_LOGS: 'desktop:export-logs',

  // Event channels (main → renderer)
  ACTIVITY_UPDATE: 'desktop:activity-update',
  NOTIFICATION: 'desktop:notification',
  FOCUS_PROTECTION_CHANGE: 'desktop:focus-protection-change',
  NAVIGATE: 'desktop:navigate',
  TIMER_SYNC: 'desktop:timer-sync',
} as const;

export type IpcChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS];
