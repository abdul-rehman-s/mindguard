/**
 * MindGuard Desktop Agent — Activity Tracker
 * 
 * Tracks:
 * - Active application name and window title
 * - Browser URL (where possible)
 * - Idle time (system idle detection)
 * - Keyboard/mouse activity levels
 * 
 * Automatically classifies activities into types:
 * Deep Work, Learning, Coding, Writing, Meetings, Browsing,
 * Entertainment, Gaming, Idle
 * 
 * Performance: <2% CPU, <100MB RAM, batched writes
 */

const { ActivityClassifier } = require('../classifier/classifier');
const { exec } = require('child_process');

// Try to load native modules (graceful fallback if not available)
let activeWin = null;
let idleTime = null;

try {
  activeWin = require('active-win');
} catch (e) {
  console.warn('[tracker] active-win not available, using fallback');
}

try {
  idleTime = require('node-idle-time');
} catch (e) {
  console.warn('[tracker] node-idle-time not available, using fallback');
}

class ActivityTracker {
  constructor(settingsManager) {
    this.settings = settingsManager;
    this.classifier = new ActivityClassifier();
    this.queue = []; // Batch queue for pending activities
    this.currentActivity = null;
    this.lastActivityStart = Date.now();
    this.running = false;
    this.pollInterval = null;
    this.idleThreshold = 5 * 60 * 1000; // 5 minutes = idle
  }

  async start() {
    if (this.running) return;
    this.running = true;
    this.lastActivityStart = Date.now();

    const interval = (this.settings.get('trackerInterval') || 30) * 1000;
    this.pollInterval = setInterval(() => this.poll(), interval);

    console.log('[tracker] Started, polling every', interval / 1000, 'seconds');
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    // Flush remaining queue
    if (this.currentActivity) {
      this.finalizeCurrentActivity();
    }
    console.log('[tracker] Stopped');
  }

  async poll() {
    if (!this.running || !this.settings.get('trackingEnabled')) return;

    // Check privacy mode
    if (this.settings.get('privacyMode')) {
      // Only track type and duration, no titles or URLs
      this.recordPrivacyActivity();
      return;
    }

    try {
      // Get active window
      const activeWindow = await this.getActiveWindow();

      // Get idle time
      const idleMs = this.getIdleTime();

      // Determine if idle
      if (idleMs > this.idleThreshold) {
        this.recordIdle(idleMs);
        return;
      }

      // Classify the activity
      const classification = this.classifier.classify(activeWindow);

      // Check if activity changed from previous
      const activityChanged = this.hasActivityChanged(activeWindow, classification);

      if (activityChanged) {
        // Finalize previous activity and start new one
        this.finalizeCurrentActivity();
        this.startNewActivity(activeWindow, classification);
      } else {
        // Extend current activity duration
        this.extendCurrentActivity();
      }
    } catch (err) {
      console.error('[tracker] Poll error:', err.message);
    }
  }

  async getActiveWindow() {
    if (activeWin) {
      try {
        const window = await activeWin();
        if (window) {
          return {
            app: window.owner.name || 'Unknown',
            title: window.title || '',
            url: window.url || null,
          };
        }
      } catch (e) {
        // active-win can fail on some platforms
      }
    }

    // Fallback: use platform-specific commands
    return this.getActiveWindowFallback();
  }

  async getActiveWindowFallback() {
    const platform = process.platform;

    if (platform === 'win32') {
      return this.getWindowsActiveWindow();
    } else if (platform === 'darwin') {
      return this.getMacActiveWindow();
    } else if (platform === 'linux') {
      return this.getLinuxActiveWindow();
    }

    return { app: 'Unknown', title: '', url: null };
  }

  getWindowsActiveWindow() {
    return new Promise((resolve) => {
      // PowerShell command to get active window
      const cmd = `powershell -command "Add-Type @\"using System;using System.Runtime.InteropServices;public class Win { [DllImport('user32.dll')] public static extern IntPtr GetForegroundWindow();[DllImport('user32.dll')] public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);}\"@;\$hwnd = [Win]::GetForegroundWindow();\$title = New-Object System.Text.StringBuilder 256;[Win]::GetWindowText(\$hwnd, \$title, 256) | Out-Null;\$title.ToString()"`;
      exec(cmd, (err, stdout) => {
        resolve({
          app: 'Unknown',
          title: stdout?.trim() || '',
          url: null,
        });
      });
    });
  }

  getMacActiveWindow() {
    return new Promise((resolve) => {
      exec('osascript -e "tell application "System Events" to get name of first process whose frontmost is true"', (err, stdout) => {
        const appName = stdout?.trim() || 'Unknown';
        exec('osascript -e "tell application "System Events" to get title of front window of first process whose frontmost is true"', (err2, titleOut) => {
          resolve({
            app: appName,
            title: titleOut?.trim() || '',
            url: null,
          });
        });
      });
    });
  }

  getLinuxActiveWindow() {
    return new Promise((resolve) => {
      exec('xdotool getactivewindow getwindowname', (err, stdout) => {
        resolve({
          app: 'Unknown',
          title: stdout?.trim() || '',
          url: null,
        });
      });
    });
  }

  getIdleTime() {
    if (idleTime) {
      try {
        return idleTime.getIdleTimeMs();
      } catch {
        // Fallback
      }
    }

    // Fallback: assume not idle
    return 0;
  }

  hasActivityChanged(window, classification) {
    if (!this.currentActivity) return true;
    return (
      this.currentActivity.application !== window.app ||
      this.currentActivity.type !== classification.type
    );
  }

  startNewActivity(window, classification) {
    this.currentActivity = {
      type: classification.type,
      category: classification.category,
      title: window.title,
      application: window.app,
      website: window.url ? this.extractDomain(window.url) : null,
      startedAt: new Date(this.lastActivityStart).toISOString(),
      duration: 0,
    };
    this.lastActivityStart = Date.now();
  }

  extendCurrentActivity() {
    if (!this.currentActivity) return;
    const now = Date.now();
    const elapsed = Math.round((now - this.lastActivityStart) / 1000);
    this.currentActivity.duration = elapsed;
  }

  finalizeCurrentActivity() {
    if (!this.currentActivity) return;

    const now = Date.now();
    const totalDuration = Math.round((now - new Date(this.currentActivity.startedAt).getTime()) / 1000);
    this.currentActivity.duration = totalDuration;
    this.currentActivity.endedAt = new Date(now).toISOString();

    // Add to queue (will be batched and sent to API)
    if (totalDuration >= 5) { // Only record activities >= 5 seconds
      this.queue.push(this.currentActivity);
    }

    this.currentActivity = null;
  }

  recordIdle(idleMs) {
    // If current activity is not idle, finalize it and start idle
    if (this.currentActivity && this.currentActivity.type !== 'idle') {
      this.finalizeCurrentActivity();
    }

    if (!this.currentActivity) {
      this.currentActivity = {
        type: 'idle',
        category: null,
        title: 'Idle',
        application: null,
        website: null,
        startedAt: new Date(this.lastActivityStart).toISOString(),
        duration: 0,
      };
      this.lastActivityStart = Date.now();
    }

    this.extendCurrentActivity();
  }

  recordPrivacyActivity() {
    // In privacy mode, only record generic type information
    if (this.currentActivity) {
      this.extendCurrentActivity();
    } else {
      this.currentActivity = {
        type: 'app_usage',
        category: 'other',
        title: null, // No titles in privacy mode
        application: null, // No app names in privacy mode
        website: null, // No URLs in privacy mode
        startedAt: new Date(this.lastActivityStart).toISOString(),
        duration: 0,
      };
      this.lastActivityStart = Date.now();
    }
  }

  extractDomain(url) {
    if (!url) return null;
    try {
      const u = new URL(url);
      return u.hostname;
    } catch {
      return url;
    }
  }

  flushQueue() {
    const batch = [...this.queue];
    this.queue = [];
    return batch;
  }
}

module.exports = { ActivityTracker };
