// MindGuard Desktop — Active Window Detection
// Detects the currently active window using active-win native module with platform fallbacks

import type { ActivityInfo } from '../types';
import { logger } from '../logger/logger';
import { isWindows, isMac, isLinux } from '../utils/platform';
import { isoNow } from '../utils/formatters';

export class WindowDetector {
  private activeWin: typeof import('active-win') | null = null;
  private moduleLoaded = false;
  private lastError: string | null = null;

  async initialize(): Promise<boolean> {
    try {
      this.activeWin = require('active-win');
      this.moduleLoaded = true;
      logger.info('WindowDetector', 'active-win native module loaded successfully');
      return true;
    } catch (err) {
      this.moduleLoaded = false;
      this.lastError = String(err);
      logger.warn('WindowDetector', 'active-win module not available, using platform fallbacks', { error: this.lastError });
      return false;
    }
  }

  async getActiveWindow(): Promise<ActivityInfo | null> {
    if (this.moduleLoaded && this.activeWin) {
      try {
        const result = await this.activeWin() as any;
        if (!result) return null;

        return {
          appName: result.appName || 'Unknown',
          windowTitle: result.title || '',
          processId: result.processId,
          url: result.url ?? undefined,
          hostname: result.url ? this.extractHostname(result.url) ?? undefined : undefined,
          tabTitle: undefined,
          timestamp: isoNow(),
          durationMs: 0,
        };
      } catch (err) {
        logger.warn('WindowDetector', 'active-win failed, trying fallback', { error: String(err) });
        return this.fallbackDetection();
      }
    }

    return this.fallbackDetection();
  }

  private async fallbackDetection(): Promise<ActivityInfo | null> {
    if (isWindows()) return this.windowsFallback();
    if (isMac()) return this.macFallback();
    if (isLinux()) return this.linuxFallback();
    return null;
  }

  private async windowsFallback(): Promise<ActivityInfo | null> {
    try {
      const { exec } = require('child_process');
      const cmd = `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Control]::FromHandle([System.Diagnostics.Process]::GetCurrentProcess().MainWindowHandle); Get-Process | Where-Object { $_.MainWindowTitle -ne '' } | Select-Object -First 1 ProcessName, MainWindowTitle | ConvertTo-Json"`;

      const output: string = await new Promise((resolve, reject) => {
        exec(cmd, { timeout: 5000 }, (err: Error | null, stdout: string) => {
          if (err) reject(err);
          else resolve(stdout);
        });
      });

      const parsed = JSON.parse(output.trim());
      if (parsed && parsed.ProcessName) {
        return {
          appName: parsed.ProcessName,
          windowTitle: parsed.MainWindowTitle || '',
          timestamp: isoNow(),
          durationMs: 0,
        };
      }
    } catch (err) {
      logger.debug('WindowDetector', 'Windows PowerShell fallback failed', { error: String(err) });
    }
    return null;
  }

  private async macFallback(): Promise<ActivityInfo | null> {
    try {
      const { exec } = require('child_process');
      const cmd = `osascript -e 'tell application "System Events" to get {name, title} of (first process whose frontmost is true)'`;

      const output: string = await new Promise((resolve, reject) => {
        exec(cmd, { timeout: 5000 }, (err: Error | null, stdout: string) => {
          if (err) reject(err);
          else resolve(stdout);
        });
      });

      const parts = output.trim().split(', ');
      if (parts.length >= 2) {
        return {
          appName: parts[0],
          windowTitle: parts.slice(1).join(', '),
          timestamp: isoNow(),
          durationMs: 0,
        };
      }
    } catch (err) {
      logger.debug('WindowDetector', 'macOS AppleScript fallback failed', { error: String(err) });
    }
    return null;
  }

  private async linuxFallback(): Promise<ActivityInfo | null> {
    try {
      const { exec } = require('child_process');
      const cmd = `xdotool getactivewindow getwindowname`;

      const output: string = await new Promise((resolve, reject) => {
        exec(cmd, { timeout: 5000 }, (err: Error | null, stdout: string) => {
          if (err) reject(err);
          else resolve(stdout);
        });
      });

      if (output.trim()) {
        return {
          appName: 'Unknown',
          windowTitle: output.trim(),
          timestamp: isoNow(),
          durationMs: 0,
        };
      }
    } catch (err) {
      logger.debug('WindowDetector', 'Linux xdotool fallback failed', { error: String(err) });
    }
    return null;
  }

  private extractHostname(url: string): string | null {
    try {
      const parsed = new URL(url);
      // Only return hostname — never capture full URL paths/params
      return parsed.hostname;
    } catch {
      return null;
    }
  }

  getModuleStatus(): { loaded: boolean; lastError: string | null } {
    return { loaded: this.moduleLoaded, lastError: this.lastError };
  }
}
