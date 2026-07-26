// MindGuard Desktop — Activity Tracker (Core Engine)
// Polls active window, classifies activities, manages batch queue, and broadcasts updates

import type {
  TrackerInfo, TrackerState, ActivityInfo, ClassificationResult,
  CreateActivityInput, DesktopSettings, IdleState, FocusState, ActivityType
} from '../types';
import { logger } from '../logger/logger';
import { WindowDetector } from './window-detector';
import { IdleDetector } from './idle-detector';
import { FocusDetector } from './focus-detector';
import { BrowserTracker } from './browser-tracker';
import { SessionRecorder } from './session-recorder';
import { ActivityClassifier } from '../classifier/classifier';
import { isoNow } from '../utils/formatters';
import { BrowserWindow } from 'electron';

export class ActivityTracker {
  private state: TrackerState = 'stopped';
  private windowDetector: WindowDetector;
  private idleDetector: IdleDetector;
  private focusDetector: FocusDetector;
  private browserTracker: BrowserTracker;
  private sessionRecorder: SessionRecorder;
  private classifier: ActivityClassifier;

  private batchQueue: CreateActivityInput[] = [];
  private currentActivityInfo: ActivityInfo | null = null;
  private lastActivityApp: string | null = null;
  private lastActivityStart: Date = new Date();
  private trackerIntervalMs = 30000; // 30 seconds default
  private trackingTimer: ReturnType<typeof setInterval> | null = null;
  private settings: DesktopSettings | null = null;
  private mainWindow: BrowserWindow | null = null;

  constructor() {
    this.windowDetector = new WindowDetector();
    this.idleDetector = new IdleDetector();
    this.focusDetector = new FocusDetector();
    this.browserTracker = new BrowserTracker();
    this.sessionRecorder = new SessionRecorder();
    this.classifier = new ActivityClassifier();
  }

  async initialize(mainWindow: BrowserWindow, settings: DesktopSettings): Promise<void> {
    this.mainWindow = mainWindow;
    this.settings = settings;
    this.trackerIntervalMs = settings.trackerInterval * 1000;

    // Initialize subsystems
    await this.windowDetector.initialize();
    await this.idleDetector.initialize();

    // Update idle threshold
    this.idleDetector.setThreshold(300000); // 5 min default

    // Apply tracking exclusions to classifier
    if (settings.trackingExclusions) {
      for (const exclusion of settings.trackingExclusions) {
        this.classifier.setCustomOverride(exclusion, {
          type: 'app_usage',
          category: 'other',
          productivityLevel: 'neutral',
          confidence: 1,
          source: 'custom',
        });
      }
    }

    logger.info('ActivityTracker', 'Initialized with settings', {
      interval: settings.trackerInterval,
      trackingEnabled: settings.trackingEnabled,
      privacyMode: settings.privacyMode,
      exclusions: settings.trackingExclusions.length,
    });
  }

  start(): void {
    if (this.state === 'tracking') return;

    this.state = 'tracking';
    this.lastActivityStart = new Date();

    // Start the tracking loop
    this.trackingTimer = setInterval(() => this.pollActivity(), this.trackerIntervalMs);

    logger.info('ActivityTracker', 'Tracking started', { intervalMs: this.trackerIntervalMs });
  }

  stop(): void {
    if (this.trackingTimer) {
      clearInterval(this.trackingTimer);
      this.trackingTimer = null;
    }

    // End current session
    this.sessionRecorder.endCurrentSession();

    // Flush remaining batch
    this.flushQueue();

    this.state = 'stopped';
    this.currentActivityInfo = null;
    logger.info('ActivityTracker', 'Tracking stopped');
  }

  pause(): void {
    if (this.state !== 'tracking') return;
    this.state = 'paused';
    if (this.trackingTimer) {
      clearInterval(this.trackingTimer);
      this.trackingTimer = null;
    }
    logger.info('ActivityTracker', 'Tracking paused');
  }

  resume(): void {
    if (this.state !== 'paused') return;
    this.state = 'tracking';
    this.lastActivityStart = new Date();
    this.trackingTimer = setInterval(() => this.pollActivity(), this.trackerIntervalMs);
    logger.info('ActivityTracker', 'Tracking resumed');
  }

  updateSettings(settings: DesktopSettings): void {
    this.settings = settings;
    this.trackerIntervalMs = settings.trackerInterval * 1000;

    // Restart timer with new interval
    if (this.state === 'tracking' && this.trackingTimer) {
      clearInterval(this.trackingTimer);
      this.trackingTimer = setInterval(() => this.pollActivity(), this.trackerIntervalMs);
    }

    logger.info('ActivityTracker', 'Settings updated', { interval: settings.trackerInterval });
  }

  private async pollActivity(): Promise<void> {
    if (this.state !== 'tracking' || !this.settings) return;

    try {
      // 1. Get active window
      const activityInfo = await this.windowDetector.getActiveWindow();

      // 2. Check idle state
      const idleState = this.idleDetector.getIdleState();

      // 3. Handle idle detection
      if (idleState.isIdle) {
        this.handleIdle(idleState);
        return;
      }

      // 4. Record activity for idle detection
      this.idleDetector.recordActivity();

      // 5. If no window detected, skip
      if (!activityInfo) {
        logger.debug('ActivityTracker', 'No active window detected');
        return;
      }

      // 6. Extract browser info if browser
      const browserInfo = this.browserTracker.extractBrowserInfo(
        activityInfo.appName,
        activityInfo.windowTitle,
        activityInfo.url
      );

      // 7. Apply privacy mode
      if (this.settings.privacyMode) {
        activityInfo.windowTitle = '';
        activityInfo.hostname = undefined;
        activityInfo.url = undefined;
      }

      // 8. Apply exclusion filtering
      if (this.isExcluded(activityInfo)) {
        logger.debug('ActivityTracker', 'Activity excluded by settings', { app: activityInfo.appName });
        return;
      }

      // 9. Classify the activity
      const classification = this.classifier.classify({
        appName: activityInfo.appName,
        windowTitle: activityInfo.windowTitle,
        hostname: browserInfo.hostname || null,
        url: null, // Never pass full URL to classifier
      });

      // 10. Detect focus state
      const focusState = this.focusDetector.detectFocus({
        currentActivity: activityInfo,
        classification,
        idleState,
        sessionStartAt: this.sessionRecorder.getCurrentSession()?.startedAt ?? null,
        totalDurationMs: this.focusDetector.getSessionDurationMs(),
        contextSwitchCount: this.focusDetector.getContextSwitchCount(),
        previousFocusState: this.focusDetector.getCurrentState(),
      });

      // 11. Update focus detector state
      this.focusDetector.updateState(focusState);
      this.focusDetector.addDuration(this.trackerIntervalMs);

      // 12. Update session recorder
      this.sessionRecorder.updateFocusState(focusState);

      // 13. Create activity record
      const durationSec = Math.round(this.trackerIntervalMs / 1000);
      const activityRecord: CreateActivityInput = {
        type: classification.type,
        title: this.settings.privacyMode ? null : activityInfo.windowTitle,
        category: classification.category,
        duration: durationSec,
        startedAt: this.lastActivityStart.toISOString(),
        endedAt: isoNow(),
        application: activityInfo.appName,
        website: browserInfo.hostname || undefined,
        metadata: JSON.stringify({
          classification: {
            productivityLevel: classification.productivityLevel,
            confidence: classification.confidence,
            source: classification.source,
          },
          focusState,
          browserInfo: browserInfo.isBrowser ? {
            browserName: browserInfo.browserName,
            tabTitle: this.settings.privacyMode ? null : browserInfo.tabTitle,
          } : null,
          processId: activityInfo.processId,
        }),
      };

      // 14. Handle activity change
      if (this.lastActivityApp !== activityInfo.appName) {
        // App changed — flush old activity batch and start new
        this.batchQueue.push(activityRecord);
        this.broadcastActivityUpdate(activityInfo, classification, focusState);
        this.lastActivityApp = activityInfo.appName;
        this.lastActivityStart = new Date();
      } else {
        // Same app — accumulate duration
        this.batchQueue.push(activityRecord);
        this.currentActivityInfo = activityInfo;
      }

      // 15. Auto-flush if batch is large
      if (this.batchQueue.length >= 50) {
        this.flushQueue();
      }

    } catch (err) {
      logger.error('ActivityTracker', 'Error in poll cycle', { error: String(err) });
    }
  }

  private handleIdle(idleState: IdleState): void {
    // Create idle activity record
    const durationSec = Math.round(this.trackerIntervalMs / 1000);
    const idleRecord: CreateActivityInput = {
      type: 'idle',
      title: null,
      category: null,
      duration: durationSec,
      startedAt: this.lastActivityStart.toISOString(),
      endedAt: isoNow(),
      application: null,
      metadata: JSON.stringify({ idleMs: idleState.idleMs, isLocked: idleState.isLocked }),
    };

    this.batchQueue.push(idleRecord);
    this.focusDetector.updateState('idle');
    this.sessionRecorder.updateFocusState('idle');
    this.lastActivityStart = new Date();

    logger.debug('ActivityTracker', 'Idle detected', {
      idleMs: idleState.idleMs,
      locked: idleState.isLocked,
    });
  }

  private isExcluded(activity: ActivityInfo): boolean {
    if (!this.settings) return false;

    const exclusions = this.settings.trackingExclusions || [];
    return exclusions.some(ex =>
      activity.appName.toLowerCase().includes(ex.toLowerCase()) ||
      (activity.hostname && activity.hostname.toLowerCase().includes(ex.toLowerCase()))
    );
  }

  flushQueue(): CreateActivityInput[] {
    const batch = [...this.batchQueue];
    this.batchQueue = [];
    return batch;
  }

  getQueueSize(): number {
    return this.batchQueue.length;
  }

  private broadcastActivityUpdate(
    activity: ActivityInfo,
    classification: ClassificationResult,
    focusState: FocusState
  ): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;

    this.mainWindow.webContents.send('desktop:activity-update', {
      app: activity.appName,
      title: this.settings?.privacyMode ? null : activity.windowTitle,
      website: activity.hostname || null,
      type: classification.type,
      category: classification.category,
      productivityLevel: classification.productivityLevel,
      focusState,
      timestamp: isoNow(),
    });
  }

  getInfo(): TrackerInfo {
    return {
      state: this.state,
      currentActivity: this.currentActivityInfo,
      idleMs: this.idleDetector.getIdleState().idleMs,
      isIdle: this.idleDetector.getIdleState().isIdle,
      isLocked: this.idleDetector.getIdleState().isLocked,
      sessionDurationMs: this.focusDetector.getSessionDurationMs(),
      batchQueueSize: this.batchQueue.length,
      lastFlushAt: null,
    };
  }

  getCurrentApp(): string | null {
    return this.currentActivityInfo?.appName ?? null;
  }

  getCurrentWebsite(): string | null {
    return this.currentActivityInfo?.hostname ?? null;
  }

  getCurrentActivityType(): ActivityType | null {
    if (!this.currentActivityInfo) return null;
    const classification = this.classifier.classify({
      appName: this.currentActivityInfo.appName,
      windowTitle: this.currentActivityInfo.windowTitle,
      hostname: this.currentActivityInfo.hostname ?? null,
      url: null,
    });
    return classification.type;
  }

  getCurrentFocusState(): FocusState {
    return this.focusDetector.getCurrentState();
  }
}
