# Changelog

All notable changes to MindGuard Desktop Companion will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2025-07-26

### Added

- **Activity Tracking**: Automatic detection of focused, idle, and distracted states
  - Window title and process detection for active application monitoring
  - Browser activity detection (URL, hostname, tab title)
  - Idle threshold detection (5-minute default)
  - Session duration tracking with batch queuing
- **Focus Protection**: Smart alerts when distraction patterns are detected
  - Configurable blocked apps and websites list
  - Context-switch notifications
  - Focus session quality scoring (1-10)
- **Focus Timer Sync**: Bidirectional timer synchronization between desktop and web app
  - Timer commands (start, pause, stop, resume, complete)
  - Mission-linked focus sessions
  - Real-time state broadcasting via WebSocket
- **System Tray**: Always-available tray icon with dynamic context menu
  - Open Dashboard quick action
  - Pause/Resume Tracking toggle
  - Start Focus quick action
  - Tracking Enabled checkbox
  - Privacy Mode checkbox
  - Quit MindGuard action
  - Dynamic tooltip showing current state and activity
- **Notification Manager**: Comprehensive notification system with cooldowns
  - Idle alerts (after configurable threshold)
  - Break reminders
  - Focus celebrations
  - Mission reminders
  - Context-switch alerts
  - Back-to-work nudges
  - Notification cooldown system (prevents spam)
  - Mute notifications toggle
- **Auto-Launch**: Optional startup registration with Windows
  - Configurable via settings or tray menu
  - Synced with web app preferences
- **Local SQLite Database**: Offline-first data persistence
  - Activities table with full CRUD and batch insert
  - Sessions table for focus session tracking
  - Settings table with key-value storage
  - Sync queue table with retry logic
  - Events table for audit logging
  - WAL mode for concurrent read/write performance
  - Automatic cleanup of old synced data (90-day retention)
- **Sync Engine**: Automatic data synchronization with MindGuard web API
  - Periodic sync (1-minute interval)
  - Retry logic for failed syncs
  - Offline-first with local queue
  - Settings push and pull
- **WebSocket Client**: Real-time connection to MindGuard web app
  - Automatic reconnection with exponential backoff
  - Heartbeat (ping/pong) keep-alive
  - Bidirectional message handling
  - Timer commands, settings sync, notification triggers
- **Security Manager**: Content Security Policy and secure context isolation
  - contextIsolation enabled (always)
  - nodeIntegration disabled (always)
  - Sandbox mode enabled
  - CSP headers enforced on all web content
- **Settings Manager**: Comprehensive desktop settings with web sync
  - Auto-start, background mode, privacy mode
  - Tracking exclusions, blocked apps, blocked websites
  - Notification preferences with granular control
  - Focus protection toggle
  - Tracker interval configuration
  - Sync from/to web API
- **IPC Handlers**: Secure inter-process communication bridge
  - 16 IPC channels for all desktop operations
  - Context bridge (preload) with no direct Node access
  - Full CRUD for activities, settings, sessions
  - Focus protection control
  - Tracking pause/resume
  - Log export
  - Auth token handling
- **Auto-Updater**: Automatic update checking via GitHub Releases
  - electron-updater with GitHub provider
  - Silent update check on launch
  - Notification on available update
  - Notification on downloaded update
  - Auto-install on app quit
- **Professional Packaging**: Production-grade Windows installer
  - NSIS installer with custom banner
  - Portable executable
  - Zip archive for unpacked build
  - SHA256 checksums for all artifacts
  - Desktop and Start Menu shortcuts
  - Per-user installation (no admin required)
  - Custom icon throughout (exe, installer, tray)
- **GitHub Actions CI/CD**: Automated build and release pipeline
  - Triggered by version tags (v*)
  - Windows-latest runner
  - Automatic version extraction from tag
  - NSIS + Portable + Zip build
  - SHA256 checksum generation
  - GitHub Release creation with all artifacts

### Technical Details

- **Electron**: v33.2.0
- **electron-builder**: v25.1.8
- **electron-updater**: v6.3.0
- **better-sqlite3**: v11.7.0 (local database)
- **TypeScript**: v5.7.0 (strict mode, all checks enabled)
- **App ID**: com.abdulrehman.mindguard
- **Publisher**: Abdul Rehman
