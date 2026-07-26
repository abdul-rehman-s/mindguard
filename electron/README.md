# MindGuard Desktop Agent

Real-time desktop activity tracking and focus protection for MindGuard AI.

## Features

- **Activity Tracking**: Monitors active applications, window titles, browser URLs, idle time
- **Auto Classification**: Automatically categorizes activities (Coding, Learning, Writing, Meetings, etc.)
- **Timeline Generation**: Creates automatic timelines of your daily desktop activity
- **Focus Protection**: Blocks distracting apps and websites during focus sessions
- **Native Notifications**: Idle alerts, break reminders, focus celebrations
- **System Tray**: Runs in background with tray icon for quick access
- **Auto Start**: Launch automatically on Windows login
- **Privacy Mode**: Hide window titles and URLs from tracking data

## Installation

```bash
cd electron
npm install
```

## Development

```bash
# Start the Next.js dev server first (port 3000)
cd /path/to/mindguard
npm run dev

# Then start the Electron app
cd electron
npm run dev
```

## Building

```bash
# Build for current platform
npm run build

# Build for specific platform
npm run build:mac
npm run build:win
npm run build:linux
```

## Architecture

```
electron/src/
├── main.js                 # Main process (window, tray, lifecycle)
├── preload.js              # Preload script (IPC bridge)
├── tracker/
│   └── activity-tracker.js # Desktop activity tracking
├── classifier/
│   └── classifier.js       # Activity classification rules
├── tray/
│   └ tray-manager.js       # System tray management
├── notifications/
│   └ notification-manager.js # Native notifications
├── focus/
│   └ focus-protection.js   # Focus session protection
├── config/
│   └ settings.js           # Settings management (electron-store)
└── ipc/
    └── handlers.js          # IPC handler registration
```

## Data Flow

1. **Tracker** polls active window every 30 seconds (configurable)
2. **Classifier** determines activity type and category
3. **Queue** batches activities for efficient API submission
4. **Main process** POSTs batched data to `/api/activities`
5. **Next.js API** stores activities in DesktopActivity model
6. **Dashboard** fetches from `/api/desktop/status`, `/api/desktop/timeline`, etc.

## Performance Targets

- <2% CPU usage
- <100MB RAM
- Batch database writes (30-second intervals)
- Background worker (does not block UI)

## Dependencies

- `active-win` — Get active window information (native)
- `node-idle-time` — System idle time detection (native)
- `electron-store` — Settings persistence
