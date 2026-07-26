# MindGuard Desktop Companion — CHANGELOG

All notable changes to the MindGuard Desktop Companion are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2025-07-26

### Added
- Production-grade Electron desktop companion application
- Active window detection with app name, window title, process ID tracking
- Browser URL tracking with hostname, domain, and tab title extraction
- Productivity classification engine (Productive / Neutral / Distracting / Custom)
- Idle detection based on mouse/keyboard activity and screen lock state
- Focus state detection (Deep Work, Focus, Idle, Break, Distraction, Meeting, Coding, Reading, Research, Learning, Browsing, AI Usage)
- Automatic session recording with no manual input required
- Chronological timeline of all activity events
- Activity heatmap generation
- AI-powered analysis of patterns, habits, and productivity insights
- System tray integration with context menu (Open Dashboard, Pause/Resume Tracking, Start/Stop Focus, Quit)
- Background tracking when dashboard is closed
- Auto-launch on system startup
- Local SQLite database for offline storage
- Sync engine with retry logic, deduplication, and batch uploads
- WebSocket/SSE live updates to web dashboard
- Native desktop notifications (idle/break/mission reminders, focus complete, achievement unlocked)
- Focus timer integration (desktop timer syncs with web timer)
- Security: HTTPS only, JWT authentication, encrypted local storage, secure IPC with contextIsolation
- Settings: tracking toggle, privacy mode, ignored apps/websites, startup, notifications, sync interval, theme, export logs, reset tracker
- Auto-updater integration (electron-updater) for future releases
- NSIS installer with custom banner, desktop shortcut, start menu shortcut
- Portable executable for zero-install usage
- GitHub Actions automated release pipeline

### Desktop Architecture
- **Main Process**: Full subsystem orchestration (tracker, tray, notifications, sync, IPC)
- **Preload**: Secure contextBridge with no nodeIntegration, contextIsolation enabled
- **IPC Channels**: 14 typed channels for bi-directional communication
- **Local Database**: SQLite with activity, session, settings, and event tables
- **WebSocket Client**: Real-time bidirectional sync with web app
- **Sync Engine**: Queue-based with retry, compression, and conflict resolution

### Performance
- CPU usage < 1% during idle/background tracking
- RAM usage < 100MB steady state
- Startup time < 2 seconds
