// MindGuard Desktop — System Tray Manager
// Tray icon with dynamic context menu for quick actions

import type { DesktopSettings } from '../types';
import { logger } from '../logger/logger';
import { app, Menu, Tray, nativeImage, BrowserWindow } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

export class TrayManager {
  private tray: Tray | null = null;
  private mainWindow: BrowserWindow | null = null;
  private settings: DesktopSettings | null = null;
  private trackingPaused = false;

  initialize(mainWindow: BrowserWindow, settings: DesktopSettings): void {
    this.mainWindow = mainWindow;
    this.settings = settings;

    // Create tray icon
    const iconPath = this.getIconPath();
    let icon: Electron.NativeImage;

    if (fs.existsSync(iconPath)) {
      icon = nativeImage.createFromPath(iconPath);
      // Resize for tray (16x16 on Windows, 22x22 on macOS)
      if (process.platform === 'darwin') {
        icon = icon.resize({ width: 22, height: 22 });
      } else {
        icon = icon.resize({ width: 16, height: 16 });
      }
    } else {
      // Create a simple green circle as fallback
      icon = this.createFallbackIcon();
    }

    this.tray = new Tray(icon);
    this.tray.setToolTip('MindGuard Desktop — Protect Your Attention');

    this.buildMenu();

    // Handle tray click
    this.tray.on('click', () => {
      if (this.mainWindow) {
        if (this.mainWindow.isVisible()) {
          this.mainWindow.focus();
        } else {
          this.mainWindow.show();
          this.mainWindow.focus();
        }
      }
    });

    logger.info('TrayManager', 'System tray initialized');
  }

  private buildMenu(): void {
    if (!this.tray) return;

    const menuTemplate: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'Open Dashboard',
        click: () => {
          if (this.mainWindow) {
            this.mainWindow.show();
            this.mainWindow.focus();
            this.mainWindow.webContents.send('desktop:navigate', 'dashboard');
          }
        },
      },
      { type: 'separator' },
      {
        label: this.trackingPaused ? '▶ Resume Tracking' : '⏸ Pause Tracking',
        click: () => {
          this.trackingPaused = !this.trackingPaused;
          if (this.mainWindow) {
            this.mainWindow.webContents.send(
              this.trackingPaused ? 'desktop:activity-update' : 'desktop:activity-update',
              { trackingResumed: !this.trackingPaused }
            );
          }
          this.buildMenu(); // Rebuild menu to update label
          logger.info('TrayManager', `Tracking ${this.trackingPaused ? 'paused' : 'resumed'}`);
        },
      },
      {
        label: '🎯 Start Focus',
        click: () => {
          if (this.mainWindow) {
            this.mainWindow.show();
            this.mainWindow.focus();
            this.mainWindow.webContents.send('desktop:navigate', 'timer');
          }
        },
      },
      { type: 'separator' },
      {
        label: '☑ Tracking Enabled',
        type: 'checkbox',
        checked: this.settings?.trackingEnabled ?? true,
        click: (menuItem) => {
          if (this.settings) {
            this.settings.trackingEnabled = menuItem.checked;
            this.buildMenu();
          }
        },
      },
      {
        label: '☑ Privacy Mode',
        type: 'checkbox',
        checked: this.settings?.privacyMode ?? false,
        click: (menuItem) => {
          if (this.settings) {
            this.settings.privacyMode = menuItem.checked;
            this.buildMenu();
          }
        },
      },
      { type: 'separator' },
      {
        label: 'Quit MindGuard',
        click: () => {
          app.quit();
        },
      },
    ];

    const contextMenu = Menu.buildFromTemplate(menuTemplate);
    this.tray.setContextMenu(contextMenu);
  }

  updateSettings(settings: DesktopSettings): void {
    this.settings = settings;
    this.buildMenu();
  }

  updateTooltip(text: string): void {
    if (this.tray) {
      this.tray.setToolTip(`MindGuard Desktop — ${text}`);
    }
  }

  private getIconPath(): string {
    // Try multiple possible icon locations
    const possiblePaths = [
      path.join(__dirname, '..', 'assets', 'tray-icon.png'),
      path.join(__dirname, '..', '..', 'assets', 'tray-icon.png'),
      path.join(process.resourcesPath || '', 'assets', 'tray-icon.png'),
      path.join(app.getAppPath(), 'assets', 'tray-icon.png'),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) return p;
    }

    return ''; // Will use fallback
  }

  private createFallbackIcon(): Electron.NativeImage {
    // Create a 16x16 green circle as fallback tray icon
    const size = 16;
    const canvas = Buffer.alloc(size * size * 4);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const cx = x - size / 2;
        const cy = y - size / 2;
        const dist = Math.sqrt(cx * cx + cy * cy);
        const idx = (y * size + x) * 4;

        if (dist < size / 2 - 1) {
          // Green circle (RGBA)
          canvas[idx] = 16;     // R
          canvas[idx + 1] = 185; // G
          canvas[idx + 2] = 129; // B
          canvas[idx + 3] = 255; // A
        } else {
          // Transparent
          canvas[idx + 3] = 0;
        }
      }
    }

    return nativeImage.createFromBuffer(canvas, {
      width: size,
      height: size,
    });
  }

  destroy(): void {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
}
