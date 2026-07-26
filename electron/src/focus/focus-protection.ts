// MindGuard Desktop — Focus Protection
// Blocks distracting apps/websites during focus sessions (platform-specific)

import type { DesktopSettings } from '../types';
import { logger } from '../logger/logger';
import { BrowserWindow } from 'electron';
import { exec } from 'child_process';

export class FocusProtection {
  private isActive = false;
  private blockedApps: string[] = [];
  private blockedWebsites: string[] = [];
  private mainWindow: BrowserWindow | null = null;
  private checkInterval: ReturnType<typeof setInterval> | null = null;
  private blockedAttempts: string[] = [];

  start(settings: DesktopSettings, mainWindow: BrowserWindow): void {
    if (this.isActive) return;

    this.blockedApps = settings.blockedApps || [];
    this.blockedWebsites = settings.blockedWebsites || [];
    this.mainWindow = mainWindow;
    this.isActive = true;
    this.blockedAttempts = [];

    // Start monitoring interval (check every 10 seconds)
    this.checkInterval = setInterval(() => this.checkAndBlock(), 10000);

    // Notify renderer
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('desktop:focus-protection-change', { active: true });
    }

    logger.info('FocusProtection', 'Focus protection activated', {
      blockedApps: this.blockedApps.length,
      blockedWebsites: this.blockedWebsites.length,
    });
  }

  stop(): void {
    if (!this.isActive) return;

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    this.isActive = false;
    this.blockedAttempts = [];

    // Notify renderer
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('desktop:focus-protection-change', { active: false });
    }

    logger.info('FocusProtection', 'Focus protection deactivated');
  }

  isWebsiteBlocked(hostname: string | null): boolean {
    if (!this.isActive || !hostname) return false;
    return this.blockedWebsites.some(w => hostname.includes(w.toLowerCase()));
  }

  isAppBlocked(appName: string): boolean {
    if (!this.isActive) return false;
    return this.blockedApps.some(a => appName.toLowerCase().includes(a.toLowerCase()));
  }

  private async checkAndBlock(): Promise<void> {
    // This is called periodically to check current app/website
    // Actual blocking is implemented per platform
    // Note: True process killing requires elevated permissions on some platforms

    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;

    // Send warning overlay for blocked websites (via IPC to web app)
    // The web app will show an overlay when a blocked site is detected
    // We cannot truly block websites from Electron — we rely on the web app UI

    logger.debug('FocusProtection', 'Protection check cycle', {
      blockedAttempts: this.blockedAttempts.length,
    });
  }

  async minimizeBlockedApp(appName: string): Promise<boolean> {
    if (!this.isAppBlocked(appName)) return false;

    this.blockedAttempts.push(appName);

    try {
      if (process.platform === 'win32') {
        // Windows: Minimize the window using PowerShell
        const cmd = `powershell -Command "(Get-Process -Name '${appName}' -ErrorAction SilentlyContinue).MainWindowHandle | ForEach-Object { [System.Windows.Forms.Control]::FromHandle($_) } | ForEach-Object { $_.WindowState = 'Minimized' }"`;
        await this.execCommand(cmd, 3000);
      } else if (process.platform === 'darwin') {
        // macOS: Hide the app using AppleScript
        const cmd = `osascript -e 'tell application "${appName}" to minimize windows'`;
        await this.execCommand(cmd, 3000);
      }

      logger.info('FocusProtection', 'Blocked app minimized', { app: appName });

      // Show notification
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('desktop:notification', {
          type: 'focus_protection',
          title: 'App blocked during focus',
          body: `${appName} has been minimized because it's on your blocked list.`,
        });
      }

      return true;
    } catch (err) {
      logger.warn('FocusProtection', 'Failed to minimize blocked app', { app: appName, error: String(err) });
      return false;
    }
  }

  private execCommand(cmd: string, timeout: number): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(cmd, { timeout }, (err, stdout) => {
        if (err) reject(err);
        else resolve(stdout);
      });
    });
  }

  getBlockedAttempts(): string[] {
    return [...this.blockedAttempts];
  }

  isActiveProtection(): boolean {
    return this.isActive;
  }
}
