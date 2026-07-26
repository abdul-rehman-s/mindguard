/**
 * MindGuard Desktop Agent — Settings Manager
 * 
 * Manages desktop settings persisted to local storage.
 * Synced with the web app via API.
 */

const Store = require('electron-store');

class SettingsManager {
  constructor() {
    this.store = new Store({
      name: 'mindguard-desktop',
      defaults: {
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
      },
    });
  }

  async load() {
    // Settings are automatically loaded from electron-store
    console.log('[settings] Loaded:', this.store.path);
  }

  get(key) {
    return this.store.get(key);
  }

  set(key, value) {
    this.store.set(key, value);
    console.log('[settings] Updated:', key, value);
  }

  getAll() {
    return this.store.store;
  }

  setAll(settings) {
    for (const [key, value] of Object.entries(settings)) {
      this.store.set(key, value);
    }
  }

  // Sync settings with web app API
  async syncFromWebApp(token) {
    try {
      const response = await fetch('http://localhost:3000/api/desktop/settings', {
        headers: { 'Cookie': `next-auth.session-token=${token}` },
      });
      if (response.ok) {
        const webSettings = await response.json();
        // Merge web settings into local settings
        this.setAll(webSettings);
        console.log('[settings] Synced from web app');
      }
    } catch (err) {
      console.error('[settings] Sync failed:', err.message);
    }
  }
}

module.exports = { SettingsManager };
