// MindGuard Desktop Companion — Shared Types
// Production-grade type definitions for all modules

// === Activity Types ===
export type ActivityType =
  | 'focus'
  | 'idle'
  | 'distracted'
  | 'break'
  | 'deep_work'
  | 'learning'
  | 'coding'
  | 'writing'
  | 'meetings'
  | 'browsing'
  | 'entertainment'
  | 'gaming'
  | 'app_usage'
  | 'website_usage'
  | 'ai_usage'
  | 'reading'
  | 'research';

export type ActivityCategory =
  | 'coding'
  | 'design'
  | 'communication'
  | 'entertainment'
  | 'research'
  | 'writing'
  | 'meetings'
  | 'learning'
  | 'other';

export type ProductivityLevel = 'productive' | 'neutral' | 'distracting' | 'custom';

// === Desktop Activity ===
export interface DesktopActivity {
  id: string;
  userId: string;
  type: ActivityType;
  title: string | null;
  category: ActivityCategory | null;
  duration: number; // seconds
  startedAt: string; // ISO datetime
  endedAt: string | null;
  application: string | null;
  website: string | null;
  metadata: string | null; // JSON string
  createdAt: string;
}

export interface CreateActivityInput {
  type: ActivityType;
  title?: string | null;
  category?: ActivityCategory | null;
  duration: number;
  startedAt: string;
  endedAt?: string | null;
  application?: string | null;
  website?: string | null;
  metadata?: string | null;
}

export interface BatchActivityInput {
  activities: CreateActivityInput[];
}

// === Desktop Settings ===
export interface DesktopSettings {
  id?: string;
  userId?: string;
  autoStart: boolean;
  runInBackground: boolean;
  privacyMode: boolean;
  trackingEnabled: boolean;
  trackingExclusions: string[];
  blockedApps: string[];
  blockedWebsites: string[];
  notificationPrefs: NotificationPreferences;
  focusProtection: boolean;
  muteNotifications: boolean;
  trackerInterval: number; // seconds
}

export interface NotificationPreferences {
  idleAlert: boolean;
  breakReminder: boolean;
  focusCelebration: boolean;
  missionReminder: boolean;
}

// === Desktop Status ===
export interface DesktopStatus {
  connected: boolean;
  trackingEnabled: boolean;
  currentApp: string | null;
  currentWebsite: string | null;
  currentActivityType: ActivityType | null;
  idleMinutes: number;
  lastActivityAt: string | null;
  focusState: FocusState;
  syncStatus: SyncStatusInfo;
}

// === Tracker State ===
export type TrackerState = 'tracking' | 'paused' | 'idle' | 'stopped';

export interface TrackerInfo {
  state: TrackerState;
  currentActivity: ActivityInfo | null;
  idleMs: number;
  isIdle: boolean;
  isLocked: boolean;
  sessionDurationMs: number;
  batchQueueSize: number;
  lastFlushAt: string | null;
}

// === Activity Detection ===
export interface ActivityInfo {
  appName: string;
  windowTitle: string;
  processId?: number;
  url?: string;
  hostname?: string;
  tabTitle?: string;
  timestamp: string;
  durationMs: number;
}

export interface ClassificationResult {
  type: ActivityType;
  category: ActivityCategory;
  productivityLevel: ProductivityLevel;
  confidence: number; // 0-1
  source: 'url' | 'app' | 'keyword' | 'default' | 'exact' | 'partial' | 'custom';
}

export interface BrowserInfo {
  isBrowser: boolean;
  browserName: string | null;
  hostname: string | null;
  tabTitle: string | null;
  url: string | null;
}

// === Focus Detection ===
export type FocusState =
  | 'deep_work'
  | 'focus'
  | 'idle'
  | 'break'
  | 'distraction'
  | 'meeting'
  | 'coding'
  | 'reading'
  | 'research'
  | 'learning'
  | 'browsing'
  | 'ai_usage';

export interface FocusSessionInfo {
  id: string;
  focusState: FocusState;
  startedAt: string;
  endedAt: string | null;
  duration: number; // seconds
  missionId: string | null;
  quality: number; // 1-10
  distractionCount: number;
}

// === Idle Detection ===
export interface IdleState {
  idleMs: number;
  isIdle: boolean;
  isLocked: boolean;
  thresholdMs: number; // default 5 min = 300000
  lastActivityAt: string;
}

// === Sync ===
export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

export interface SyncStatusInfo {
  status: SyncStatus;
  pendingCount: number;
  failedCount: number;
  lastSyncAt: string | null;
  lastError: string | null;
}

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  error?: string;
}

export type QueueItemStatus = 'pending' | 'sending' | 'failed' | 'synced';

export interface SyncQueueItem {
  id: number;
  type: 'activity' | 'session' | 'settings';
  payload: string; // JSON
  status: QueueItemStatus;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

// === Notifications ===
export type NotificationType =
  | 'idle_alert'
  | 'break_reminder'
  | 'mission_reminder'
  | 'reflection_reminder'
  | 'focus_celebration'
  | 'streak_milestone'
  | 'achievement_unlocked'
  | 'context_switch_alert'
  | 'back_to_work';

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  actionUrl?: string;
  metadata?: string;
}

export interface NotificationCooldown {
  type: NotificationType;
  lastShownAt: number; // epoch ms
  cooldownMs: number;
}

// === IPC ===
export interface IPCChannelMap {
  'desktop:get-status': { input: void; output: DesktopStatus };
  'desktop:get-settings': { input: void; output: DesktopSettings };
  'desktop:update-settings': { input: Partial<DesktopSettings>; output: DesktopSettings };
  'desktop:auth-token': { input: string; output: boolean };
  'desktop:report-activity': { input: CreateActivityInput; output: boolean };
  'desktop:report-batch': { input: BatchActivityInput; output: boolean };
  'desktop:start-focus-protection': { input: void; output: boolean };
  'desktop:stop-focus-protection': { input: void; output: boolean };
  'desktop:trigger-notification': { input: NotificationPayload; output: boolean };
  'desktop:set-auto-start': { input: boolean; output: boolean };
  'desktop:force-sync': { input: void; output: SyncResult };
  'desktop:get-sync-status': { input: void; output: SyncStatusInfo };
  'desktop:pause-tracking': { input: void; output: boolean };
  'desktop:resume-tracking': { input: void; output: boolean };
  'desktop:export-logs': { input: void; output: string };
}

// === Local DB Schema ===
export interface LocalActivityRow {
  id: number;
  type: ActivityType;
  title: string | null;
  category: ActivityCategory | null;
  duration: number;
  startedAt: string;
  endedAt: string | null;
  application: string | null;
  website: string | null;
  metadata: string | null;
  synced: number; // 0 or 1
  createdAt: string;
}

export interface LocalSessionRow {
  id: number;
  missionId: string | null;
  duration: number;
  startedAt: string;
  endedAt: string | null;
  quality: number | null;
  type: string;
  synced: number;
  createdAt: string;
}

export interface LocalSettingsRow {
  key: string;
  value: string; // JSON
}

export interface LocalEventRow {
  id: number;
  eventType: string;
  data: string; // JSON
  timestamp: string;
}

// === WebSocket Messages ===
export interface WSMessage {
  type: 'activity_update' | 'timer_command' | 'settings_sync' | 'notification_trigger' | 'auth_request' | 'ping' | 'pong' | 'connected' | 'error';
  payload: unknown;
  timestamp: string;
}

export interface TimerCommand {
  action: 'start' | 'pause' | 'stop' | 'resume' | 'complete';
  duration?: number;
  missionId?: string;
  missionTitle?: string;
}

export interface TimerStateMessage {
  isRunning: boolean;
  elapsed: number;
  missionId: string | null;
  missionTitle: string | null;
  focusMode: string;
}

// === Logging ===
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  module: string;
  data?: Record<string, unknown>;
}

// === Platform ===
export type Platform = 'win32' | 'darwin' | 'linux';

// === App Config ===
export interface AppConfig {
  webUrl: string;
  wsUrl: string;
  trackerIntervalSeconds: number;
  idleThresholdMs: number;
  batchMaxSize: number;
  syncIntervalMs: number;
  maxRetryCount: number;
  dbPath: string;
  logDir: string;
}
