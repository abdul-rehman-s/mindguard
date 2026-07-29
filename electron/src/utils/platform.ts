// MindGuard Desktop — Platform Detection Utilities

import type { Platform } from '../types';

export function getPlatform(): Platform {
  return process.platform as Platform;
}

export function isWindows(): boolean {
  return process.platform === 'win32';
}

export function isMac(): boolean {
  return process.platform === 'darwin';
}

export function isLinux(): boolean {
  return process.platform === 'linux';
}

export function getAppDataPath(): string {
  const home = process.env.HOME || process.env.USERPROFILE || '/';
  if (isWindows()) {
    return process.env.APPDATA || pathJoin(home, 'AppData', 'Roaming');
  }
  if (isMac()) {
    return pathJoin(home, 'Library', 'Application Support');
  }
  return process.env.XDG_CONFIG_HOME || pathJoin(home, '.config');
}

export function getMindGuardDataDir(): string {
  const { app } = require('electron');
  return app.getPath('userData');
}

function pathJoin(...segments: string[]): string {
  return segments.join(isWindows() ? '\\' : '/');
}

export function getShellCommand(): string {
  if (isWindows()) return 'powershell';
  if (isMac()) return 'osascript';
  return 'bash';
}
