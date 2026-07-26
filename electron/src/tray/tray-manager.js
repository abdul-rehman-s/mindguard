/**
 * MindGuard Desktop Agent — Tray Manager
 * 
 * Creates and manages the system tray icon with context menu.
 * Handles minimize-to-tray behavior.
 */

const { Tray, Menu, nativeImage, app } = require('electron');
const path = require('path');

class TrayManager {
  constructor(iconPath, mainWindow, settingsManager) {
    this.mainWindow = mainWindow;
    this.settings = settingsManager;

    // Create tray icon
    let icon;
    try {
      icon = nativeImage.createFromPath(iconPath);
    } catch {
      // Fallback: create a simple 16x16 icon
      icon = nativeImage.createEmpty();
    }

    this.tray = new Tray(icon);
    this.tray.setToolTip('MindGuard Desktop Agent');

    this.buildMenu();
  }

  buildMenu() {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Open MindGuard',
        click: () => {
          if (this.mainWindow) {
            this.mainWindow.show();
            this.mainWindow.focus();
          }
        },
      },
      { type: 'separator' },
      {
        label: 'Start Focus Session',
        click: () => {
          if (this.mainWindow) {
            this.mainWindow.show();
            this.mainWindow.webContents.send('desktop:navigate', 'timer');
          }
        },
      },
      {
        label: 'Dashboard',
        click: () => {
          if (this.mainWindow) {
            this.mainWindow.show();
            this.mainWindow.webContents.send('desktop:navigate', 'dashboard');
          }
        },
      },
      { type: 'separator' },
      {
        label: 'Tracking Enabled',
        type: 'checkbox',
        checked: this.settings.get('trackingEnabled'),
        click: (menuItem) => {
          this.settings.set('trackingEnabled', menuItem.checked);
        },
      },
      {
        label: 'Privacy Mode',
        type: 'checkbox',
        checked: this.settings.get('privacyMode'),
        click: (menuItem) => {
          this.settings.set('privacyMode', menuItem.checked);
        },
      },
      { type: 'separator' },
      {
        label: 'Quit MindGuard',
        click: () => {
          app.quit();
        },
      },
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  showBalloon(text) {
    this.tray.displayBalloon({
      title: 'MindGuard',
      content: text,
      iconType: 'info',
    });
  }

  updateMenu() {
    this.buildMenu();
  }

  destroy() {
    this.tray.destroy();
  }
}

module.exports = { TrayManager };
