# MindGuard v1.0.0 — First Production Release

## MindGuard Desktop Companion

Your AI-powered attention guardian that protects focus, tracks activity, and boosts productivity.

### What's Included

- **MindGuard-Setup-1.0.0.exe** — NSIS installer with desktop shortcut, Start Menu integration, and per-user installation
- **MindGuard-Portable-1.0.0.exe** — Portable executable that runs from any location without installation
- **MindGuard-v1.0.0-win.zip** — Unpacked build archive for advanced deployment
- **sha256-checksums.txt** — SHA256 checksums for all release artifacts

### Features

- **Activity Tracking** — Automatic detection of focused, idle, and distracted states
- **Focus Protection** — Smart alerts when distraction patterns are detected
- **Focus Timer Sync** — Timer synchronization between desktop and web application
- **System Tray** — Always-available tray icon with quick actions (pause/resume tracking, start focus)
- **Auto-Launch** — Optional startup with Windows
- **Background Mode** — Continue tracking when window is closed
- **Notifications** — Idle alerts, break reminders, focus celebrations, and mission reminders
- **Local SQLite Database** — Offline-first data storage with automatic sync
- **WebSocket Connection** — Real-time bidirectional communication with MindGuard web app
- **Auto-Update** — Automatic update checking via GitHub Releases

### Installation

#### NSIS Installer (Recommended)
1. Download `MindGuard-Setup-1.0.0.exe`
2. Run the installer
3. Choose installation directory (default: `%LOCALAPPDATA%\MindGuard`)
4. Desktop shortcut and Start Menu entry created automatically
5. Launch MindGuard from desktop shortcut or Start Menu

#### Portable Version
1. Download `MindGuard-Portable-1.0.0.exe`
2. Place it in any directory
3. Double-click to run — no installation required
4. Settings and data stored alongside the executable

### Auto-Update

MindGuard automatically checks for updates on launch. When a new version is available:
1. A notification appears in the system tray
2. Click the notification to download the update
3. Restart MindGuard to install the update

### System Requirements

- **OS**: Windows 10 or later (x64)
- **RAM**: 512 MB minimum
- **Disk**: 200 MB for installation
- **Network**: Required for sync and auto-update features

### Verification

Verify download integrity using SHA256 checksums:

```powershell
# PowerShell
$hash = (Get-FileHash -Algorithm SHA256 MindGuard-Setup-1.0.0.exe).Hash
# Compare with sha256-checksums.txt
```

```bash
# Git Bash / WSL
sha256sum MindGuard-Setup-1.0.0.exe
# Compare with sha256-checksums.txt
```
