// MindGuard Desktop — Auto Launch Manager
// Register/unregister app to launch with OS startup

import { logger } from '../logger/logger';
import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { isLinux } from '../utils/platform';

export class AutoLaunchManager {
  setAutoStart(enabled: boolean): boolean {

    if (isLinux()) {
      return this.setLinuxAutoStart(enabled);
    }

    // Windows & macOS: Use Electron's built-in API
    try {
      app.setLoginItemSettings({
        openAtLogin: enabled,
        path: app.getPath('exe'),
        args: ['--hidden'], // Start hidden to tray
      });
      logger.info('AutoLaunchManager', `Auto-start ${enabled ? 'enabled' : 'disabled'}`);
      return true;
    } catch (err) {
      logger.error('AutoLaunchManager', 'Failed to set auto-start', { error: String(err) });
      return false;
    }
  }

  private setLinuxAutoStart(enabled: boolean): boolean {
    const autostartDir = path.join(
      process.env.XDG_CONFIG_HOME || path.join(process.env.HOME || '/', '.config'),
      'autostart'
    );
    const desktopFile = path.join(autostartDir, 'mindguard-desktop.desktop');

    try {
      if (enabled) {
        // Ensure directory exists
        if (!fs.existsSync(autostartDir)) {
          fs.mkdirSync(autostartDir, { recursive: true });
        }

        // Create .desktop file
        const content = `[Desktop Entry]
Type=Application
Name=MindGuard Desktop
Comment=MindGuard AI Desktop Companion
Exec=${app.getPath('exe')} --hidden
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
`;
        fs.writeFileSync(desktopFile, content, 'utf8');
        logger.info('AutoLaunchManager', 'Linux auto-start enabled');
      } else {
        // Remove .desktop file
        if (fs.existsSync(desktopFile)) {
          fs.unlinkSync(desktopFile);
        }
        logger.info('AutoLaunchManager', 'Linux auto-start disabled');
      }
      return true;
    } catch (err) {
      logger.error('AutoLaunchManager', 'Linux auto-start failed', { error: String(err) });
      return false;
    }
  }

  isAutoStartEnabled(): boolean {
    if (isLinux()) {
      const autostartDir = path.join(
        process.env.XDG_CONFIG_HOME || path.join(process.env.HOME || '/', '.config'),
        'autostart'
      );
      const desktopFile = path.join(autostartDir, 'mindguard-desktop.desktop');
      return fs.existsSync(desktopFile);
    }

    try {
      const settings = app.getLoginItemSettings();
      return settings.openAtLogin;
    } catch {
      return false;
    }
  }
}
