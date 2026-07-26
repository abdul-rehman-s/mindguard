# MindGuard Desktop Companion

Production-grade Electron desktop application for attention tracking, focus detection, and productivity analytics.

## Quick Start

### Development

```bash
# From the project root
bun run desktop:dev

# Or directly in the electron directory
cd electron
npm install
npm run dev
```

### Build & Package

```bash
# TypeScript compilation only
bun run desktop:build

# Package for Windows (NSIS installer + portable + unpacked)
bun run desktop:dist

# Create unpacked directory (for testing)
bun run desktop:pack
```

### Release

```bash
# Tag and push to trigger GitHub Actions release pipeline
git tag v1.0.0
git push origin v1.0.0
```

## Architecture

### Main Process (`src/main.ts`)
Orchestrates all subsystems:
- Activity Tracker — monitors active windows and browser URLs
- Tray Manager — system tray icon with context menu
- Notification Manager — native desktop notifications
- Focus Protection — distraction blocking during focus sessions
- Focus Timer Sync — bidirectional timer sync with web app
- Settings Manager — persistent configuration with web API sync
- Security Manager — JWT auth, encrypted storage, CSP headers
- Auto Launch Manager — OS startup integration
- Local Database — SQLite for offline storage
- Sync Engine — queue-based sync with retry logic
- WebSocket Client — real-time updates to web dashboard
- Auto Updater — checks for new versions on GitHub Releases

### Preload Script (`src/preload.ts`)
Secure bridge between main and renderer:
- `contextIsolation: true` — always enabled
- `nodeIntegration: false` — always disabled
- `sandbox: true` — renderer runs in sandbox
- Only exposes typed IPC methods via `contextBridge.exposeInMainWorld`

### IPC Channels
14 typed channels for bi-directional communication:
- Status, Settings, Auth, Activity Reporting, Focus Protection
- Notifications, Auto Start, Sync, Tracking Control, Data Export
- Event channels: ActivityUpdate, Notification, FocusProtectionChange, Navigate, TimerSync

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `autoStart` | `false` | Launch on system startup |
| `runInBackground` | `true` | Keep running when window closed |
| `trackingEnabled` | `true` | Enable activity tracking |
| `privacyMode` | `false` | Don't capture browser URLs/titles |
| `muteNotifications` | `false` | Silence all desktop notifications |
| `trackerInterval` | `30` | Tracking interval in seconds |
| `focusProtection` | `false` | Block distracting sites during focus |

## Project Structure

```
electron/
├── src/
│   ├── main.ts            # Main process entry point
│   ├── preload.ts         # Secure preload script
│   ├── auto-launch/       # OS startup integration
│   ├── classifier/        # Productivity classification engine
│   ├── database/          # Local SQLite database
│   ├── focus/             # Focus protection & timer sync
│   ├── ipc/               # IPC channel definitions & handlers
│   ├── logger/            # Structured logging
│   ├── notifications/     # Native desktop notifications
│   ├── security/          # Auth, encryption, CSP
│   ├── settings/          # Configuration management
│   ├── sync/              # Sync engine with web API
│   ├── tracker/           # Activity, window, browser, idle detection
│   ├── tray/              # System tray management
│   ├── types/             # Shared TypeScript type definitions
│   ├── utils/             # Crypto, formatters, platform, timers
│   └── websocket/         # Real-time WebSocket client
├── assets/
│   ├── icon.ico           # Windows icon (multi-resolution)
│   ├── icon.png           # Linux icon (512x512)
│   ├── tray-icon.png      # System tray icon (24x24)
│   └ installer-banner.bmp # NSIS installer banner (164x314)
├── package.json           # Electron app config & electron-builder
├── tsconfig.json          # TypeScript configuration
├── CHANGELOG.md           # Version history
├── RELEASE_NOTES.md       # Release notes for GitHub
└── README.md              # This file
```

## Security

- **Context Isolation**: Always enabled — renderer cannot access Node.js
- **No nodeIntegration**: Renderer runs in sandbox mode
- **Secure IPC**: Only typed channels exposed via preload
- **No secrets exposure**: JWT tokens passed securely via IPC, never in source
- **HTTPS only**: All sync requests use HTTPS
- **Encrypted local storage**: Sensitive data encrypted before storage
- **CSP headers**: Content Security Policy enforced on all web content
- **Privacy mode**: Optional mode that skips URL/title capture

## Auto Updates

MindGuard uses `electron-updater` to check GitHub Releases for new versions. Update flow:
1. App checks for updates on startup (silent)
2. If update available → notification shown
3. User chooses to download → downloads in background
4. On next restart → update installed automatically

## Build Targets

| Target | Output | Description |
|--------|--------|-------------|
| NSIS | `MindGuard-Setup-{version}.exe` | Full installer with custom banner |
| Portable | `MindGuard-Portable-{version}.exe` | Zero-install portable |
| Unpacked | `win-unpacked/` | Directory build for testing |

## Performance Targets

- CPU usage < 1% during background tracking
- RAM usage < 100MB steady state
- Startup time < 2 seconds
- Tracking interval: 30 seconds (configurable)

## License

MIT — Copyright © 2024 Abdul Rehman
