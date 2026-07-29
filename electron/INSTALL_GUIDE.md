# MindGuard Desktop — Installation Guide

## Windows Installation

### Option 1: Full Installation (Recommended)

1. Download **MindGuard-Setup-1.0.0.exe** from the [GitHub Releases](https://github.com/abdul-rehman-s/mindguard/releases) page
2. Run the installer
3. Choose your installation directory (default: `C:\Users\{YourName}\AppData\Local\MindGuard`)
4. Desktop shortcut and Start menu shortcut will be created automatically
5. Click **Install** and wait for completion
6. MindGuard launches automatically after installation

### Option 2: Portable (No Installation)

1. Download **MindGuard-Portable-1.0.0.exe** from the [GitHub Releases](https://github.com/abdul-rehman-s/mindguard/releases) page
2. Place it in any folder (e.g., your Desktop or a USB drive)
3. Double-click to run — no installation required
4. Settings and data are stored alongside the executable

### Verifying Download Integrity

Before running, verify the download checksum:

```powershell
# In PowerShell
certutil -hashfile MindGuard-Setup-1.0.0.exe SHA256
```

Compare the output with the `sha256-checksums.txt` file in the release assets.

## First Run

When MindGuard starts for the first time:

1. It appears in your **system tray** (bottom-right corner near the clock)
2. The MindGuard dashboard opens in a browser window
3. You need to **sign in** or **create an account** on the web dashboard
4. After signing in, the desktop companion connects automatically

## System Tray

Right-click the MindGuard tray icon for:
- **Open Dashboard** — Show the MindGuard web interface
- **Pause/Resume Tracking** — Toggle activity tracking
- **Start/Stop Focus** — Begin or end a focus session
- **Quit** — Fully exit MindGuard

## Settings

Configure MindGuard from the web dashboard Settings page or via the desktop companion:

- **Auto Start** — Launch MindGuard when Windows starts
- **Run in Background** — Keep tracking when dashboard window is closed
- **Privacy Mode** — Don't capture browser URLs or page titles
- **Tracking Exclusions** — Ignore specific apps or websites
- **Notification Preferences** — Choose which notifications to receive
- **Sync Interval** — How often to sync data with the cloud (1-60 minutes)

## Uninstallation

### If installed with Setup.exe:
1. Find "MindGuard" in your Start menu
2. Click **Uninstall MindGuard**
3. Or go to Settings → Apps → MindGuard → Uninstall

### If using Portable:
1. Simply delete the `MindGuard-Portable.exe` file
2. Delete the `MindGuard-data` folder if it exists alongside it

## Troubleshooting

| Problem | Solution |
|---------|----------|
| App doesn't start | Check if another instance is running (system tray). Restart computer. |
| Tracking not working | Ensure "Tracking Enabled" is on in Settings. Check Privacy Mode. |
| Notifications not showing | Ensure Windows notifications are enabled for MindGuard. Check Settings → Notifications. |
| Sync not working | Check internet connection. Verify web dashboard is accessible. |
| High CPU/RAM | Restart MindGuard. Check for conflicting antivirus software. |

## System Requirements

- **OS**: Windows 10 or later (64-bit)
- **Disk**: 100MB free space (installed), 50MB (portable)
- **RAM**: 100MB steady state
- **Network**: Internet connection for sync (optional — offline supported)
