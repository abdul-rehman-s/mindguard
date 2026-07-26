// MindGuard Desktop — Settings Manager
// Two-way settings sync between local electron-store and web API

import type { DesktopSettings, NotificationPreferences } from '../types';
import { logger } from '../logger/logger';
import Store from 'electron-store';
import { LocalDB } from '../database/local-db';
import { SyncEngine } from '../sync/sync-engine';

const DEFAULT_SETTINGS: DesktopSettings = {
  autoStart: false,
  runInBackground: true,
  privacyMode: false,
  trackingEnabled: true,
  trackingExclusions: [],
  blockedApps: [],
  blockedWebsites: [],
  notificationPrefs: {
    idleAlert: true,
    breakReminder: true,
    focusCelebration: true,
    missionReminder: true,
  },
  focusProtection: false,
  muteNotifications: false,
  trackerInterval: 30,
};

export class SettingsManager {
  private store: Store<Record<string, string>>;
  private syncEngine: SyncEngine;
  private currentSettings: DesktopSettings;

  constructor(_localDB: LocalDB, syncEngine: SyncEngine) {
    this.store = new Store<Record<string, string>>({
      name: 'mindguard-settings',
      encryptionKey: 'mindguard-desktop-settings-v5',
    });
    this.syncEngine = syncEngine;

    // Load from local store
    this.currentSettings = this.loadFromLocal();
  }

  async syncFromWebAPI(): Promise<DesktopSettings> {
    const apiSettings = await this.syncEngine.fetchSettingsFromAPI();

    if (apiSettings) {
      // Merge: API wins for most settings, local wins for autoStart (OS-specific)
      this.currentSettings = {
        ...apiSettings,
        autoStart: this.currentSettings.autoStart, // Keep local auto-start (OS-specific)
      };
      this.saveToLocal();
      logger.info('SettingsManager', 'Settings synced from web API');
    }

    return this.currentSettings;
  }

  async pushToWebAPI(settings: Partial<DesktopSettings>): Promise<boolean> {
    const updated = this.updateLocal(settings);
    return this.syncEngine.syncSettings(updated);
  }

  getSettings(): DesktopSettings {
    return { ...this.currentSettings };
  }

  updateLocal(partial: Partial<DesktopSettings>): DesktopSettings {
    this.currentSettings = { ...this.currentSettings, ...partial };

    // Handle JSON fields properly
    if (partial.notificationPrefs) {
      this.currentSettings.notificationPrefs = { ...this.currentSettings.notificationPrefs, ...partial.notificationPrefs };
    }

    this.saveToLocal();
    logger.info('SettingsManager', 'Settings updated locally', { keys: Object.keys(partial) });
    return this.currentSettings;
  }

  private loadFromLocal(): DesktopSettings {
    const stored = (this.store as any).get('settings');
    if (stored && typeof stored === 'object') {
      try {
        const parsed = stored as Record<string, unknown>;
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          trackingExclusions: this.parseJSONArray(parsed.trackingExclusions, []),
          blockedApps: this.parseJSONArray(parsed.blockedApps, []),
          blockedWebsites: this.parseJSONArray(parsed.blockedWebsites, []),
          notificationPrefs: this.parseNotificationPrefs(parsed.notificationPrefs),
        };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  }

  private saveToLocal(): void {
    (this.store as any).set('settings', {
      ...this.currentSettings,
      // Store arrays as JSON strings for compatibility
    });
  }

  private parseJSONArray(value: unknown, defaultValue: string[]): string[] {
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch { return defaultValue; }
    }
    if (Array.isArray(value)) return value;
    return defaultValue;
  }

  private parseNotificationPrefs(value: unknown): NotificationPreferences {
    const defaults = DEFAULT_SETTINGS.notificationPrefs;
    if (typeof value === 'string') {
      try { return { ...defaults, ...JSON.parse(value) }; } catch { return defaults; }
    }
    if (value && typeof value === 'object') return { ...defaults, ...value as NotificationPreferences };
    return defaults;
  }
}
