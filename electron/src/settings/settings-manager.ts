// MindGuard Desktop — Settings Manager
// Two-way settings sync between local SQLite DB and web API.
// Uses the settings table in better-sqlite3 (via LocalDB) for
// local persistence instead of electron-store (which is ESM-only).

import type { DesktopSettings, NotificationPreferences } from '../types';
import { logger } from '../logger/logger';
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

const SETTINGS_KEY = 'desktop_settings';

export class SettingsManager {
  private localDB: LocalDB;
  private syncEngine: SyncEngine;
  private currentSettings: DesktopSettings;

  constructor(localDB: LocalDB, syncEngine: SyncEngine) {
    this.localDB = localDB;
    this.syncEngine = syncEngine;
    this.currentSettings = this.loadFromLocal();
  }

  async syncFromWebAPI(): Promise<DesktopSettings> {
    const apiSettings = await this.syncEngine.fetchSettingsFromAPI();

    if (apiSettings) {
      this.currentSettings = {
        ...apiSettings,
        autoStart: this.currentSettings.autoStart,
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

    if (partial.notificationPrefs) {
      this.currentSettings.notificationPrefs = {
        ...this.currentSettings.notificationPrefs,
        ...partial.notificationPrefs,
      };
    }

    this.saveToLocal();
    logger.info('SettingsManager', 'Settings updated locally', { keys: Object.keys(partial) });
    return this.currentSettings;
  }

  // =========================================================================
  // Private: SQLite-backed persistence (replaces electron-store)
  // =========================================================================

  private loadFromLocal(): DesktopSettings {
    try {
      const db = (this.localDB as unknown as { db: { prepare: (sql: string) => { get: (...args: unknown[]) => unknown } } }).db;
      const row = db
        ?.prepare('SELECT value FROM settings WHERE key = ?')
        .get(SETTINGS_KEY) as { value: string } | undefined;

      if (row?.value) {
        const parsed = JSON.parse(row.value) as Record<string, unknown>;
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          trackingExclusions: this.parseArray(parsed.trackingExclusions, []),
          blockedApps: this.parseArray(parsed.blockedApps, []),
          blockedWebsites: this.parseArray(parsed.blockedWebsites, []),
          notificationPrefs: this.parsePrefs(parsed.notificationPrefs),
        };
      }
    } catch (err) {
      logger.warn('SettingsManager', 'Failed to load settings from DB, using defaults', {
        error: String(err),
      });
    }
    return DEFAULT_SETTINGS;
  }

  private saveToLocal(): void {
    try {
      const value = JSON.stringify(this.currentSettings);
      const db = (this.localDB as unknown as { db: { prepare: (sql: string) => { run: (...args: unknown[]) => void } } }).db;
      db?.prepare(
        'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      ).run(SETTINGS_KEY, value);
    } catch (err) {
      logger.error('SettingsManager', 'Failed to save settings to DB', { error: String(err) });
    }
  }

  private parseArray(value: unknown, defaultValue: string[]): string[] {
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch { return defaultValue; }
    }
    if (Array.isArray(value)) return value;
    return defaultValue;
  }

  private parsePrefs(value: unknown): NotificationPreferences {
    const defaults = DEFAULT_SETTINGS.notificationPrefs;
    if (typeof value === 'string') {
      try { return { ...defaults, ...JSON.parse(value) }; } catch { return defaults; }
    }
    if (value && typeof value === 'object') return { ...defaults, ...value as NotificationPreferences };
    return defaults;
  }
}