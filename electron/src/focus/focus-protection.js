/**
 * MindGuard Desktop Agent — Focus Protection
 * 
 * During focus sessions:
 * - Mute notifications
 * - Block selected websites
 * - Block selected applications
 * - Hide taskbar badges (where possible)
 * 
 * Configurable in Desktop Settings.
 */

class FocusProtection {
  constructor(settingsManager) {
    this.settings = settingsManager;
    this.active = false;
    this.blockedProcesses = [];
  }

  start() {
    if (!this.settings.get('focusProtection')) return;
    this.active = true;

    const blockedApps = this.settings.get('blockedApps') || [];
    const blockedWebsites = this.settings.get('blockedWebsites') || [];

    // Block applications by terminating their processes
    if (blockedApps.length > 0) {
      this.blockProcesses(blockedApps);
    }

    console.log('[focus-protection] Started with', blockedApps.length, 'blocked apps and', blockedWebsites.length, 'blocked sites');
  }

  stop() {
    this.active = false;
    this.restoreProcesses();
    console.log('[focus-protection] Stopped');
  }

  isActive() {
    return this.active;
  }

  blockProcesses(appNames) {
    // Store blocked process info for restoration
    // Note: actual blocking depends on platform and permissions
    this.blockedProcesses = appNames.map(name => ({
      name,
      originalState: 'running',
    }));

    // On Windows: could use taskkill to minimize/close blocked apps
    // On Mac: could use AppleScript to hide blocked apps
    // On Linux: could use kill signals
    // For now: log intent (implementation varies by platform)
    console.log('[focus-protection] Would block:', appNames.join(', '));
  }

  restoreProcesses() {
    // Restore blocked processes
    // (undo any blocking applied during focus session)
    this.blockedProcesses = [];
  }

  isWebsiteBlocked(url) {
    if (!this.active) return false;
    const blockedWebsites = this.settings.get('blockedWebsites') || [];
    const domain = this.extractDomain(url);
    return blockedWebsites.some(b => domain.includes(b));
  }

  isAppBlocked(appName) {
    if (!this.active) return false;
    const blockedApps = this.settings.get('blockedApps') || [];
    return blockedApps.some(b => appName.toLowerCase().includes(b.toLowerCase()));
  }

  extractDomain(url) {
    if (!url) return '';
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }
}

module.exports = { FocusProtection };
