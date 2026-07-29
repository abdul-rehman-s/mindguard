// MindGuard Desktop — Sync Engine
// Reliably syncs local data to web API with retries, dedup, batch uploads

import type { CreateActivityInput, SyncResult, SyncStatusInfo, DesktopSettings } from '../types';
import { logger } from '../logger/logger';
import { LocalDB } from '../database/local-db';

export class SyncEngine {
  private localDB: LocalDB;
  private apiUrl: string;
  private authToken: string | null = null;
  private maxRetryCount = 5;
  private batchSize = 100;
  private isSyncing = false;
  private lastSyncAt: Date | null = null;
  private lastError: string | null = null;

  constructor(localDB: LocalDB, apiUrl: string) {
    this.localDB = localDB;
    this.apiUrl = apiUrl;
  }

  setAuthToken(token: string): void {
    this.authToken = token;
    logger.info('SyncEngine', 'Auth token set');
  }

  async syncActivities(): Promise<SyncResult> {
    if (this.isSyncing) {
      return { success: false, syncedCount: 0, failedCount: 0, error: 'Sync already in progress' };
    }

    if (!this.authToken) {
      return { success: false, syncedCount: 0, failedCount: 0, error: 'No auth token' };
    }

    this.isSyncing = true;
    let syncedCount = 0;
    let failedCount = 0;

    try {
      // Get unsynced activities from local DB
      const unsynced = this.localDB.getUnsyncedActivities(this.batchSize);

      if (unsynced.length === 0) {
        this.isSyncing = false;
        return { success: true, syncedCount: 0, failedCount: 0 };
      }

      // Convert to API format
      const activities: CreateActivityInput[] = unsynced.map(row => ({
        type: row.type,
        title: row.title,
        category: row.category,
        duration: row.duration,
        startedAt: row.startedAt,
        endedAt: row.endedAt,
        application: row.application,
        website: row.website,
        metadata: row.metadata,
      }));

      // Deduplication: Check if any activities overlap with already synced ones
      // (This is handled by the server — we trust it to dedup by timestamp)

      // Batch upload
      const response = await this.postBatch(activities);

      if (response.success) {
        // Mark synced in local DB
        const ids = unsynced.map(a => a.id);
        this.localDB.markActivitiesSynced(ids);
        syncedCount = unsynced.length;
        this.lastSyncAt = new Date();
        this.lastError = null;
        logger.info('SyncEngine', 'Activities synced successfully', { count: syncedCount });
      } else {
        failedCount = unsynced.length;
        this.lastError = response.error || 'Unknown error';

        // Add to retry queue
        for (const activity of activities) {
          this.localDB.addToSyncQueue('activity', JSON.stringify(activity));
        }

        logger.warn('SyncEngine', 'Activity sync failed', { error: this.lastError, count: failedCount });
      }
    } catch (err) {
      this.lastError = String(err);
      logger.error('SyncEngine', 'Sync error', { error: this.lastError });
    } finally {
      this.isSyncing = false;
    }

    return {
      success: failedCount === 0,
      syncedCount,
      failedCount,
      error: this.lastError ?? undefined,
    };
  }

  async syncSettings(settings: DesktopSettings): Promise<boolean> {
    if (!this.authToken) return false;

    try {
      const response = await fetch(`${this.apiUrl}/api/desktop/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
        },
        body: JSON.stringify({
          autoStart: settings.autoStart,
          runInBackground: settings.runInBackground,
          privacyMode: settings.privacyMode,
          trackingEnabled: settings.trackingEnabled,
          trackingExclusions: JSON.stringify(settings.trackingExclusions),
          blockedApps: JSON.stringify(settings.blockedApps),
          blockedWebsites: JSON.stringify(settings.blockedWebsites),
          notificationPrefs: JSON.stringify(settings.notificationPrefs),
          focusProtection: settings.focusProtection,
          muteNotifications: settings.muteNotifications,
          trackerInterval: settings.trackerInterval,
        }),
      });

      if (response.ok) {
        logger.info('SyncEngine', 'Settings synced to web API');
        return true;
      }

      logger.warn('SyncEngine', 'Settings sync failed', { status: response.status });
      return false;
    } catch (err) {
      logger.error('SyncEngine', 'Settings sync error', { error: String(err) });
      return false;
    }
  }

  async fetchSettingsFromAPI(): Promise<DesktopSettings | null> {
    if (!this.authToken) return null;

    try {
      const response = await fetch(`${this.apiUrl}/api/desktop/settings`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        logger.info('SyncEngine', 'Settings fetched from web API');
        return this.parseSettingsResponse(data as Record<string, unknown>);
      }

      return null;
    } catch {
      return null;
    }
  }

  async forceFullSync(): Promise<SyncResult> {
    // Sync all unsynced data including retry queue
    const activityResult = await this.syncActivities();

    // Process retry queue
    const pending = this.localDB.getPendingSyncQueue(20);
    let retrySynced = 0;
    let retryFailed = 0;

    for (const item of pending) {
      if (item.retryCount >= this.maxRetryCount) {
        this.localDB.updateSyncQueueStatus(item.id, 'failed');
        retryFailed++;
        continue;
      }

      try {
        const payload = JSON.parse(item.payload);
        const response = await this.postBatch([payload as CreateActivityInput]);

        if (response.success) {
          this.localDB.updateSyncQueueStatus(item.id, 'synced');
          retrySynced++;
        } else {
          this.localDB.incrementRetryCount(item.id);
          retryFailed++;
        }
      } catch {
        this.localDB.incrementRetryCount(item.id);
        retryFailed++;
      }
    }

    return {
      success: activityResult.success && retryFailed === 0,
      syncedCount: activityResult.syncedCount + retrySynced,
      failedCount: activityResult.failedCount + retryFailed,
      error: activityResult.error,
    };
  }

  private async postBatch(activities: CreateActivityInput[]): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/api/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
        },
        body: JSON.stringify({ activities }),
      });

      if (response.ok) {
        return { success: true };
      }

      const errorBody = await response.text();
      return { success: false, error: `HTTP ${response.status}: ${errorBody}` };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }

  private parseSettingsResponse(data: Record<string, unknown>): DesktopSettings {
    return {
      autoStart: Boolean(data.autoStart ?? false),
      runInBackground: Boolean(data.runInBackground ?? true),
      privacyMode: Boolean(data.privacyMode ?? false),
      trackingEnabled: Boolean(data.trackingEnabled ?? true),
      trackingExclusions: this.parseJSONField(data.trackingExclusions, []),
      blockedApps: this.parseJSONField(data.blockedApps, []),
      blockedWebsites: this.parseJSONField(data.blockedWebsites, []),
      notificationPrefs: this.parseJSONField(data.notificationPrefs, {
        idleAlert: true, breakReminder: true, focusCelebration: true, missionReminder: true,
      }),
      focusProtection: Boolean(data.focusProtection ?? false),
      muteNotifications: Boolean(data.muteNotifications ?? false),
      trackerInterval: Number(data.trackerInterval ?? 30),
    };
  }

  private parseJSONField<T>(value: unknown, defaultValue: T): T {
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch { return defaultValue; }
    }
    if (value && typeof value === 'object') return value as T;
    return defaultValue;
  }

  getSyncStatus(): SyncStatusInfo {
    return {
      status: this.isSyncing ? 'syncing' : (this.lastError ? 'error' : 'idle'),
      pendingCount: this.localDB.getUnsyncedCount(),
      failedCount: this.localDB.getFailedSyncCount(),
      lastSyncAt: this.lastSyncAt?.toISOString() ?? null,
      lastError: this.lastError,
    };
  }
}
