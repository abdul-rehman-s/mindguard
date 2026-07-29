# MindGuard — Product Requirements Document

**Version:** 4.2.0  
**Status:** Active — Living Document  
**Last Updated:** 2025-07-16  
**Author:** Chief Software Architect  
**Classification:** Internal — Engineering Source of Truth

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision](#2-product-vision)
3. [Mission](#3-mission)
4. [Long-Term Vision (3–5 Years)](#4-long-term-vision-35-years)
5. [Core Philosophy](#5-core-philosophy)
6. [Target Audience](#6-target-audience)
7. [User Personas](#7-user-personas)
8. [Problems MindGuard Solves](#8-problems-mindguard-solves)
9. [Product Goals](#9-product-goals)
10. [Non-Goals](#10-non-goals)
11. [Core Features](#11-core-features)
12. [Desktop Application Overview](#12-desktop-application-overview)
13. [Web Application Overview](#13-web-application-overview)
14. [AI System Overview](#14-ai-system-overview)
15. [Synchronization System Overview](#15-synchronization-system-overview)
16. [High-Level System Architecture](#16-high-level-system-architecture)
17. [Product Modules](#17-product-modules)
18. [User Journey](#18-user-journey)
19. [Desktop User Journey](#19-desktop-user-journey)
20. [Web User Journey](#20-web-user-journey)
21. [Authentication Flow](#21-authentication-flow)
22. [Desktop Pairing Flow](#22-desktop-pairing-flow)
23. [Data Flow](#23-data-flow)
24. [Offline Strategy](#24-offline-strategy)
25. [Security Principles](#25-security-principles)
26. [Privacy Principles](#26-privacy-principles)
27. [Scalability Strategy](#27-scalability-strategy)
28. [Future Roadmap](#28-future-roadmap)
29. [Release Strategy](#29-release-strategy)
30. [Success Metrics](#30-success-metrics)
31. [Risks](#31-risks)
32. [Technical Debt](#32-technical-debt)
33. [Guiding Engineering Principles](#33-guiding-engineering-principles)
34. [Product Design Principles](#34-product-design-principles)
35. [Quality Standards](#35-quality-standards)
36. [Definition of Done](#36-definition-of-done)
37. [Future Expansion Vision](#37-future-expansion-vision)

---

## 1. Executive Summary

### Current Implementation

MindGuard is an **AI-powered Attention Operating System** — a cross-platform productivity application that helps users protect their attention, build deep focus habits, and understand their digital behavior through intelligent coaching and real-time desktop activity tracking.

The product exists as two interconnected applications:

- **Web Application** — A Next.js 16.1.3 single-page application (App Router, Turbopack) providing the full MindGuard experience: dashboard, mission management, focus timer, AI coaching, reflections, statistics, habit tracking, and settings.
- **Desktop Application** — An Electron-based companion agent that runs in the background, tracks active window titles, application usage, website domains, and idle time, then reports this data to the web app's API for intelligent analysis and behavioral coaching.

The system is built on a monolithic Next.js backend with a SQLite database via Prisma ORM, NextAuth.js v4 for authentication, Zustand for client state, and a multi-provider AI system supporting 7 LLM backends (z-ai built-in, OpenAI, DeepSeek, OpenRouter, Gemini, Anthropic, Ollama).

**Key technical facts:**
- ~35 API route handlers across 28 endpoints
- 11 Prisma models (User, Mission, FocusSession, DailyReflection, Achievement, DesktopActivity, DesktopSettings, Notification, UserSettings, Device, Habit, HabitEntry)
- 14 distinct view components (Dashboard, Life Dashboard, Mission, Timer, Reflection, Sessions, Stats, Replay, Review, Wrapped, Settings, Habits, Monthly Report, Command Palette)
- 11-step onboarding flow with psychological profiling
- Device pairing system with JWT-based token exchange
- 7 AI provider integrations with automatic fallback

### Future Direction

MindGuard will evolve from a focus-tracking tool into a **complete attention management platform** — a system that understands individual cognitive patterns, proactively prevents distraction, and provides actionable intelligence for sustained peak performance. The architecture will need to support real-time WebSocket communication, multi-device synchronization, team analytics, and a plugin ecosystem.

---

## 2. Product Vision

### Current Implementation

MindGuard's vision is to be the **operating system for human attention** — a product that treats focus as a first-class resource, the same way operating systems treat CPU and memory. The product embodies the belief that attention is the scarcest resource in the knowledge economy, and that technology should protect it rather than exploit it.

The current product delivers on this vision through:
- **Mission-first focus** — one clear objective at a time, not a task list
- **AI-powered coaching** — personalized, data-driven productivity advice
- **Real-time desktop awareness** — the system knows what you're doing and can intervene
- **Gamification** — XP, levels, streaks, achievements to reinforce positive habits
- **Psychological profiling** — the onboarding captures chronotype, ADHD status, coach personality preference, and motivation style

### Future Direction

The vision will expand to encompass:
- **Predictive attention management** — the system anticipates when focus will wane and proactively intervenes
- **Cross-device awareness** — unified attention tracking across phone, tablet, desktop, and browser
- **Team attention analytics** — organizational insights into collective focus patterns
- **Attention marketplace** — integrations with other productivity tools (calendar, email, project management)
- **Cognitive health monitoring** — long-term trend analysis of attention capacity

---

## 3. Mission

### Current Implementation

To build technology that **protects human attention** rather than exploiting it. MindGuard exists to help people reclaim their capacity for deep work, meaningful engagement, and sustained cognitive performance in an increasingly distracting world.

The product mission is realized through three pillars:
1. **Measure** — Track where attention goes (desktop activity, focus sessions, distractions)
2. **Coach** — Provide AI-driven, personalized guidance based on actual behavioral data
3. **Protect** — Actively prevent distractions through focus protection, app blocking, and behavioral interventions

### Future Direction

The mission will extend to:
- **Restore** — Help users recover attention capacity that has been eroded by chronic distraction
- **Optimize** — Match cognitive tasks to optimal attention states (circadian alignment, energy management)
- **Scale** — Extend attention protection from individuals to teams and organizations

---

## 4. Long-Term Vision (3–5 Years)

### Current Implementation

MindGuard is currently a single-user, single-device productivity tool with a companion desktop tracker. The system is self-contained with no external integrations, no team features, and no mobile presence.

### Future Direction

**Year 1 — Foundation Completion**
- Stable WebSocket communication between desktop and web
- Multi-device pairing and real-time sync
- Mobile companion app (React Native) for on-the-go tracking
- Browser extension for web activity tracking
- Robust offline support with conflict resolution

**Year 2 — Intelligence Layer**
- Predictive distraction modeling (ML-based)
- Personalized circadian rhythm optimization
- Automated focus scheduling (calendar integration)
- Team dashboard with aggregate attention analytics
- API platform for third-party integrations

**Year 3 — Ecosystem**
- Plugin marketplace for custom trackers, coaches, and interventions
- Enterprise tier with SSO, compliance, and admin controls
- Attention health reports (annual cognitive assessment)
- Wearable integration (Apple Watch, Fitbit for physiological data)
- Public API and SDK

**Year 4–5 — Platform**
- Attention OS concept — MindGuard as the layer between humans and their digital environment
- AI agents that can take actions on behalf of the user (auto-reply, schedule management)
- Cross-platform attention graph (unified attention profile across all devices)
- Research partnerships (attention science, cognitive psychology)
- Global attention health index

---

## 5. Core Philosophy

### Current Implementation

1. **Attention is a resource** — It should be measured, protected, and optimized, like CPU or memory
2. **One mission at a time** — Multitasking is a myth; focus on one clear objective
3. **Data over opinions** — The AI coach uses actual behavioral data, not generic advice
4. **Privacy by design** — Desktop activity tracking is opt-in, data stays on the user's device and server
5. **Progress over perfection** — Small, consistent focus blocks compound into extraordinary results
6. **Personalization is essential** — Every user has different chronotypes, goals, and distraction patterns

### Future Direction

7. **Proactive, not reactive** — The system should intervene before distraction occurs, not after
8. **Cognitive diversity** — Different minds need different strategies; the system adapts to neurodivergence
9. **Transparency** — Users always understand what the system knows about them and why it makes recommendations
10. **Sustainable productivity** — The system promotes long-term cognitive health, not burnout-inducing sprints

---

## 6. Target Audience

### Current Implementation

✓ **Knowledge workers** — Developers, designers, writers, researchers who need sustained focus  
✓ **Students** — University and competitive exam students studying for long hours  
✓ **Freelancers** — Self-directed professionals managing their own time  
✓ **People with ADHD** — Users who need structured focus support and distraction management  
⚠ **Night-shift workers** — Partially supported through chronotype profiling  
⚠ **Remote workers** — Partially supported through desktop activity tracking  

### Future Direction

✗ **Teams and organizations** — Not yet supported; requires team analytics and admin features  
✗ **Mobile-first users** — No mobile app exists yet  
✗ **Enterprise** — Requires SSO, compliance, and admin controls  
✗ **Educational institutions** — Requires student management and reporting features  
✗ **Therapists and coaches** — Requires client management and progress sharing  

---

## 7. User Personas

### Current Implementation

**Persona 1: The Deep-Work Developer**
- _Role_: Software engineer
- _Age_: 25–35
- _Pain_: Context switching between IDE, Slack, email, and browser tabs
- _Goal_: Complete coding tasks with deep focus blocks
- _MindGuard use_: Mission system for coding sprints, focus timer, desktop tracker for context-switch awareness

**Persona 2: The Exam Student**
- _Role_: Medical student or competitive exam candidate
- _Age_: 20–28
- _Pain_: Social media and phone distractions during study sessions
- _Goal_: Study for 6+ hours daily with sustained attention
- _MindGuard use_: Pomodoro timer, habit tracker, daily review, AI coach for study planning

**Persona 3: The Freelancer**
- _Role_: Independent designer or consultant
- _Age_: 28–40
- _Pain_: No structured work hours; difficulty separating work from personal time
- _Goal_: Deliver client work on schedule while maintaining work-life balance
- _MindGuard use_: Mission system for project milestones, focus protection for deep work, daily reflections for work-life balance

**Persona 4: The ADHD Professional**
- _Role_: Knowledge worker with ADHD
- _Age_: 22–40
- _Pain_: Chronic distraction, difficulty starting tasks, time blindness
- _Goal_: Build consistent focus habits with external structure
- _MindGuard use_: Pomodoro timer with short intervals, idle alerts, behavioral coach for context-switching awareness, gamification for motivation

### Future Direction

**Persona 5: The Engineering Manager**
- _Pain_: Team productivity tracking without surveillance
- _Goal_: Understand team attention patterns and optimize meeting culture
- _MindGuard use_: Team dashboard, aggregate analytics, meeting-impact analysis

**Persona 6: The Remote Team Lead**
- _Pain_: Team members working in different time zones with inconsistent focus patterns
- _Goal_: Coordinate focus blocks across time zones
- _MindGuard use_: Shared focus schedules, team sync windows, cross-timezone coach

---

## 8. Problems MindGuard Solves

### Current Implementation

| Problem | How MindGuard Solves It | Status |
|---------|------------------------|--------|
| Lack of awareness about how time is spent | Desktop activity tracker + life dashboard | ✓ Implemented |
| No structured approach to deep work | Mission system + focus timer with Pomodoro | ✓ Implemented |
| Generic productivity advice that doesn't apply | AI coach with user-specific data and context | ✓ Implemented |
| Distraction during focus sessions | Focus protection (app/website blocking) | ✓ Implemented |
| No accountability for daily focus goals | Streak system, XP, achievements, daily goals | ✓ Implemented |
| Difficulty starting focus sessions | Mission launch flow, quick-start from dashboard | ✓ Implemented |
| No reflection on what works and what doesn't | Daily reflection, daily review, weekly wrapped | ✓ Implemented |
| Forgetting to take breaks | Break reminders, idle alerts | ✓ Implemented |
| Different people need different strategies | 11-step onboarding with psychological profiling | ✓ Implemented |
| Need for offline-first privacy | Self-hosted SQLite, local data processing | ✓ Implemented |

### Future Direction

| Problem | Proposed Solution | Status |
|---------|-------------------|--------|
| No real-time communication between desktop and web | WebSocket-based real-time sync | ✗ Planned |
| No mobile tracking | Mobile companion app | ✗ Planned |
| No team-level insights | Team analytics dashboard | ✗ Planned |
| No calendar integration | Calendar-aware focus scheduling | ✗ Planned |
| No browser-level tracking | Browser extension for web activity | ✗ Planned |
| Burnout detection is reactive | Predictive burnout modeling with ML | ✗ Planned |

---

## 9. Product Goals

### Current Implementation

1. ✓ **Help users achieve 2+ hours of daily deep focus** — Through mission system, timer, and coaching
2. ✓ **Provide personalized, data-driven AI coaching** — Through 7-provider AI system with behavioral context
3. ✓ **Build consistent focus habits** — Through streaks, gamification, and daily goals
4. ✓ **Track and reduce digital distractions** — Through desktop activity tracker and distraction analysis
5. ✓ **Create a premium, delightful user experience** — Through Framer Motion animations, dark theme, glassmorphism, and micro-interactions
6. ✓ **Protect user privacy** — Through self-hosted SQLite, opt-in tracking, and privacy mode

### Future Direction

7. ✗ **Enable real-time desktop-web communication** — WebSocket for instant data flow
8. ✗ **Support multi-device ecosystems** — Phone, tablet, desktop, browser all tracked
9. ✗ **Scale to teams and organizations** — Team analytics, admin controls, SSO
10. ✗ **Achieve 100K+ active users** — Requires infrastructure scaling, mobile apps, and marketing

---

## 10. Non-Goals

### Current Implementation

1. **Surveillance software** — MindGuard is not a tool for monitoring employees without their consent
2. **Generic task management** — MindGuard is not a to-do list; it's an attention management system
3. **Social media for productivity** — MindGuard does not have social features, followers, or sharing
4. **All-in-one project management** — MindGuard does not replace Jira, Asana, or Linear
5. **Meditation app** — MindGuard is about focus management, not mindfulness meditation
6. **Time tracking for billing** — MindGuard tracks attention, not billable hours

### Future Direction

These non-goals remain consistent. The product will never become:
- A surveillance tool
- A social network
- A generic project management platform
- A time-tracking tool for billing

---

## 11. Core Features

### Current Implementation

#### 11.1 Focus Timer System
- **Status**: ✓ Implemented
- **Description**: A full-screen focus timer with Pomodoro-style sessions, customizable durations (25/5, 45/10, 60/15, 90/20, custom), wall-clock timing (immune to tab sleep), pause/resume, and celebration screen on completion
- **Key Files**: `src/components/timer/focus-mode.tsx`, `src/components/timer/timer-view.tsx`, `src/components/timer/celebration-screen.tsx`, `src/components/timer/mission-launch.tsx`, `src/components/timer/audio-player.tsx`
- **Architecture**: Uses `useRef` for wall-clock timing (not `setInterval` counting), preventing drift when browser throttles background tabs

#### 11.2 Mission System
- **Status**: ✓ Implemented
- **Description**: One-mission-at-a-time focus system. Users create missions with title, description, and priority. Active missions can be linked to focus sessions. Template missions available (Deep Work Sprint, Study Session, Code Review, Creative Brainstorm, Project Launch)
- **Key Files**: `src/components/mission/mission-view.tsx`, `src/app/api/missions/route.ts`, `src/app/api/missions/[id]/route.ts`

#### 11.3 AI Coach
- **Status**: ✓ Implemented
- **Description**: Multi-provider AI coaching system with 7 backends. Generates personalized daily briefings, morning plans, night reviews, and mission suggestions. Supports 3 coach personalities (strict, friendly, data_nerd). Context builder aggregates user data into structured prompts
- **Key Files**: `src/lib/ai-provider.ts`, `src/lib/coach-context.ts`, `src/components/dashboard/ai-coach.tsx`, `src/app/api/coach/route.ts`, `src/app/api/coach/briefing/route.ts`, `src/app/api/coach/review/route.ts`, `src/app/api/coach/suggestions/route.ts`
- **Fallback Strategy**: If the user's configured provider fails, the system automatically falls back to z-ai (built-in provider). Uses exponential backoff with 2 retries before fallback

#### 11.4 Desktop Activity Tracker
- **Status**: ✓ Implemented
- **Description**: Electron-based background tracker that monitors active window titles, application names, website domains, and idle time. Uses `active-win` npm package for window detection and `node-idle-time` for idle detection. Reports data to the Next.js API at configurable intervals (default: 30 seconds)
- **Key Files**: `electron/src/tracker/activity-tracker.js`, `electron/src/classifier/classifier.js`
- **Classification**: Activities are classified into types (focus, idle, distracted, deep_work, learning, coding, writing, meetings, browsing, entertainment, gaming) and categories (coding, design, communication, entertainment, research, writing, meetings, learning, other)

#### 11.5 Onboarding Flow
- **Status**: ✓ Implemented
- **Description**: 11-step onboarding wizard that captures: welcome, interests (multi-select), role + work mode, work schedule (hours, wake/sleep times, chronotype), focus style (ADHD, Pomodoro preference, deep work duration, schedule preference), motivation style (coach personality, motivation type), distraction ranking, goals, privacy preferences, permissions, and finish
- **Key Files**: `src/components/onboarding/onboarding-flow.tsx`, `src/components/onboarding/steps/*.tsx`
- **Psychological Profiling**: Captures chronotype (early_bird/night_owl/flexible), ADHD status, coach personality preference, and motivation style for personalization

#### 11.6 Dashboard
- **Status**: ✓ Implemented
- **Description**: Main dashboard with personalized greeting, focus score, streak, today's stats, heatmap, timeline, AI coach, AI insights, achievements, and quick-start buttons
- **Key Files**: `src/components/dashboard/dashboard-view.tsx`, `src/components/dashboard/heatmap.tsx`, `src/components/dashboard/timeline.tsx`, `src/components/dashboard/ai-coach.tsx`, `src/components/dashboard/ai-insights.tsx`, `src/components/dashboard/achievements-v2.tsx`

#### 11.7 Life Dashboard
- **Status**: ✓ Implemented
- **Description**: Desktop-intelligence dashboard showing total laptop time, productive/distracted/idle minutes, deep work sessions, XP level ring, attention score, streak, hourly focus distribution, and activity category breakdown
- **Key Files**: `src/components/life/life-dashboard.tsx`, `src/app/api/life-dashboard/route.ts`
- **Polling**: Desktop status polled every 30 seconds for current app/website

#### 11.8 Daily Reflection
- **Status**: ✓ Implemented
- **Description**: Daily journaling with structured prompts: what went well, what was the biggest distraction, tomorrow's mission. Optional mood (1-10), energy (1-10), sleep hours, and tags
- **Key Files**: `src/components/reflection/reflection-view.tsx`, `src/app/api/reflections/route.ts`

#### 11.9 Daily Review
- **Status**: ✓ Implemented
- **Description**: Automated daily summary combining focus sessions, missions, reflections, laptop activity, distractions, and AI recommendations. Includes hourly chart and week comparison
- **Key Files**: `src/components/review/daily-review.tsx`, `src/app/api/daily-review/route.ts`

#### 11.10 Weekly Wrapped
- **Status**: ✓ Implemented
- **Description**: Weekly summary with total focus hours, session count, deepest session, best day, most productive hour, longest streak, mission completion rate, reflection rate, attention grade (A-F), and week-over-week comparison
- **Key Files**: `src/components/wrapped/wrapped-view.tsx`, `src/app/api/weekly-wrapped/route.ts`

#### 11.11 Habit Tracker
- **Status**: ✓ Implemented
- **Description**: Custom habit tracking with predefined presets (Exercise, Reading, Meditation, Journaling, etc.), daily/weekly frequency, streak calculation, and completion tracking
- **Key Files**: `src/components/habits/habit-tracker.tsx`, `src/app/api/habits/route.ts`, `src/app/api/habits/[id]/route.ts`, `src/app/api/habits/entries/route.ts`

#### 11.12 Statistics & Insights
- **Status**: ✓ Implemented
- **Description**: 30-day analytics with focus-by-hour, focus-by-weekday, weekly trends, consistency score, reflection correlation, session length trends, mission completion rate, and pattern detection
- **Key Files**: `src/components/stats/stats-view.tsx`, `src/app/api/stats/route.ts`, `src/app/api/insights/route.ts`

#### 11.13 Command Palette
- **Status**: ✓ Implemented
- **Description**: Keyboard-driven command palette (Cmd+K) for navigation and actions. Supports fuzzy search across all views and quick actions
- **Key Files**: `src/components/command-palette/command-palette.tsx`

#### 11.14 Focus Protection
- **Status**: ✓ Implemented
- **Description**: Desktop-level app and website blocking during focus sessions. Configurable blocked apps and blocked websites lists
- **Key Files**: `electron/src/focus/focus-protection.js`

#### 11.15 System Tray & Notifications
- **Status**: ✓ Implemented
- **Description**: Electron system tray with minimize-to-tray, tray menu, and native OS notifications for idle alerts, break reminders, focus celebrations, and mission reminders
- **Key Files**: `electron/src/tray/tray-manager.js`, `electron/src/notifications/notification-manager.js`

#### 11.16 Device Pairing
- **Status**: ✓ Implemented
- **Description**: Automatic pairing between web app and desktop agent using JWT-based token exchange. Desktop polls for pairing tokens, completes pairing, and receives long-lived refresh tokens
- **Key Files**: `electron/src/auth/device-auth.js`, `src/app/api/desktop/auth/pair/route.ts`, `src/app/api/desktop/auth/complete/route.ts`, `src/app/api/desktop/auth/status/route.ts`, `src/app/api/desktop/auth/refresh/route.ts`

#### 11.17 Gamification
- **Status**: ✓ Implemented
- **Description**: XP system with levels (level = XP / 500), 8 achievement types (first_focus, streak_7, streak_30, hours_100, night_owl, early_bird, deep_worker, mission_master), streak tracking, and focus score
- **Key Files**: `src/app/api/achievements/route.ts`, `src/app/api/achievements/progress/route.ts`, `src/components/dashboard/achievements-v2.tsx`

#### 11.18 Settings
- **Status**: ✓ Implemented
- **Description**: 12-section settings panel: General, Account, Appearance, Desktop, Tracking, Privacy, Focus, Notifications, Keyboard, AI Coach, Advanced, About
- **Key Files**: `src/components/settings/settings-view.tsx`, `src/app/api/settings/route.ts`, `src/app/api/user-settings/route.ts`, `src/app/api/desktop/settings/route.ts`

### Future Direction

#### 11.19 Real-Time WebSocket Communication
- **Status**: ✗ Planned
- **Description**: Bidirectional real-time communication between desktop tracker and web app, replacing polling-based data transfer with instant updates

#### 11.20 Mobile Companion
- **Status**: ✗ Planned
- **Description**: React Native app for on-the-go tracking, notification management, and quick focus sessions

#### 11.21 Browser Extension
- **Status**: ✗ Planned
- **Description**: Chrome/Firefox extension for web activity tracking without the desktop app

#### 11.22 Team Analytics
- **Status**: ✗ Planned
- **Description**: Aggregate attention analytics for teams, with privacy-preserving metrics

---

## 12. Desktop Application Overview

### Current Implementation

The MindGuard Desktop Agent is an Electron application (v33) that runs as a background process on macOS, Windows, and Linux. Its primary responsibility is tracking user activity on the desktop and reporting it to the web application's API.

**Architecture:**
```
electron/src/
├── main.js              — Main process: window creation, lifecycle, loops
├── preload.js           — Context isolation bridge for renderer
├── tracker/
│   └── activity-tracker.js  — Active window & idle time tracking
├── auth/
│   └── device-auth.js       — Device pairing & token management
├── classifier/
│   └── classifier.js        — Activity classification logic
├── focus/
│   └── focus-protection.js  — App/website blocking during focus
├── notifications/
│   └── notification-manager.js  — Native OS notifications
├── tray/
│   └── tray-manager.js      — System tray management
├── ipc/
│   └── handlers.js          — IPC handlers for renderer communication
└── config/
    └── settings.js          — Persistent settings via electron-store
```

**Key Behaviors:**
- Loads the Next.js web app (`http://localhost:3000` in dev, `https://mindguard.app` in production) in a BrowserWindow
- Single instance lock prevents multiple copies
- Runs in background when window is closed (configurable)
- Auto-start on login (configurable)
- Uses `active-win` for window title detection (macOS/Windows)
- Uses `node-idle-time` for idle detection
- Activity data reported to API at configurable intervals (default: 30 seconds)
- Settings synced from web app every 5 minutes
- Notification checks every 60 seconds
- Device pairing polls every 10 seconds when unpaired

**Known Limitations:**
- ⚠ `active-win` has limited Linux support
- ⚠ No WebSocket support — all communication is polling-based
- ⚠ No offline queue for activity data — if the API is unreachable, data is lost
- ⚠ The classifier (`classifier.js`) exists but its implementation details are not fully documented

### Future Direction

- ✗ Real-time WebSocket communication with the web app
- ✗ Offline activity queue with local SQLite storage
- ✗ Linux Wayland support for window tracking
- ✗ Native menu bar widget (macOS)
- ✗ Global keyboard shortcuts for focus session control
- ✗ Screen time reports via native OS integration
- ✗ Auto-updater for seamless version updates

---

## 13. Web Application Overview

### Current Implementation

The MindGuard Web Application is a Next.js 16.1.3 single-page application using the App Router with Turbopack. The entire application is served from a single route (`/`) with client-side view routing managed by Zustand state.

**Architecture:**
```
src/
├── app/
│   ├── page.tsx              — Single page entry point (all views)
│   ├── layout.tsx            — Root layout with providers
│   ├── globals.css           — Global styles
│   └── api/                  — 28+ API route handlers
│       ├── auth/             — NextAuth.js + registration
│       ├── coach/            — AI coaching endpoints
│       ├── desktop/          — Desktop-specific endpoints
│       ├── sessions/         — Focus session CRUD
│       ├── missions/         — Mission CRUD
│       ├── habits/           — Habit tracking
│       ├── reflections/      — Daily reflections
│       ├── stats/            — Statistics
│       ├── insights/         — AI insights
│       ├── heatmap/          — Heatmap data
│       ├── timeline/         — Timeline events
│       ├── achievements/     — Achievement system
│       ├── notifications/    — Notifications
│       ├── onboarding/       — Onboarding completion
│       ├── settings/         — User settings
│       ├── user-settings/    — Detailed settings
│       ├── devices/          — Device management
│       ├── activities/       — Desktop activity ingestion
│       ├── life-dashboard/   — Life dashboard data
│       ├── daily-review/     — Daily review data
│       ├── weekly-wrapped/   — Weekly summary
│       ├── replay/           — Day replay
│       └── monthly-report/   — Monthly report
├── components/
│   ├── app/                  — AppShell, Sidebar, Header, ErrorBoundary
│   ├── dashboard/            — Dashboard view + sub-widgets
│   ├── life/                 — Life Dashboard
│   ├── mission/              — Mission management
│   ├── timer/                — Focus timer, celebration, audio
│   ├── reflection/           — Daily reflection
│   ├── review/               — Daily review
│   ├── wrapped/              — Weekly wrapped
│   ├── stats/                — Statistics + monthly report
│   ├── sessions/             — Session history
│   ├── replay/               — Day replay
│   ├── habits/               — Habit tracker
│   ├── settings/             — Settings (12 sections)
│   ├── onboarding/           — 11-step onboarding
│   ├── landing/              — Landing page with auth
│   ├── notifications/        — Notification panel
│   ├── command-palette/      — Command palette
│   ├── branding/             — Logo components
│   ├── premium/              — Premium animation components
│   ├── providers/            — Auth + Query + Theme providers
│   └── ui/                   — 50+ shadcn/ui components
├── stores/
│   └── app-store.ts          — Zustand global state
├── lib/
│   ├── ai-provider.ts        — 7-provider AI system
│   ├── auth.ts               — NextAuth.js configuration
│   ├── auth-utils.ts         — Auth helpers + device token management
│   ├── coach-context.ts      — AI coach context builder
│   ├── personalization.ts    — Personalization engine
│   ├── analytics.ts          — Streak calculation, best hour/weekday
│   ├── db.ts                 — Prisma client singleton
│   ├── logger.ts             — Logging utility
│   ├── validators.ts         — Zod schemas
│   ├── animations.ts         — Framer Motion variants
│   ├── sounds.ts             — Click sound effects
│   ├── sanitize.ts           — Input sanitization
│   ├── rate-limiter.ts       — Rate limiting
│   ├── shortcut-manager.ts   — Keyboard shortcut manager
│   └── utils.ts              — Utility functions
├── hooks/
│   ├── use-mobile.ts         — Mobile detection
│   ├── use-mounted.ts        — Mounted state
│   └── use-keyboard-shortcuts.ts — Global keyboard shortcuts
└── types/
    └── index.ts              — All TypeScript types
```

**Key Design Decisions:**
- Single-page architecture: All views are rendered client-side based on `currentView` in Zustand
- Dynamic imports: All heavy view components are lazy-loaded with `next/dynamic` and `ssr: false`
- Auth-gated: All views except Landing Page require authentication
- Dark theme first: The app is designed for dark mode with emerald accent colors
- Glassmorphism: Card components use `glass-card` and `glass-glow-edge` classes

### Future Direction

- ✗ Multi-page routing with Next.js App Router for deep linking
- ✗ SSR for landing page SEO
- ✗ Progressive Web App (PWA) support
- ✗ Internationalization (i18n) beyond English
- ✗ Light theme polish (currently broken in some areas)

---

## 14. AI System Overview

### Current Implementation

MindGuard's AI system is a **multi-provider abstraction layer** that provides personalized coaching through any of 7 LLM backends, with automatic fallback to the built-in provider.

**Provider Architecture:**
```
User's configured provider
  └── Attempt 1 (with retry)
  └── Attempt 2 (with retry)
  └── Fallback to z-ai (built-in)
       └── If z-ai also fails → return error
```

**Supported Providers:**
| Provider | Requires API Key | Default Model | Backend |
|----------|-----------------|---------------|---------|
| z-ai (Built-in) | No | default | z-ai-web-dev-sdk |
| OpenAI | Yes | gpt-4o-mini | OpenAI API |
| DeepSeek | Yes | deepseek-chat | DeepSeek API |
| OpenRouter | Yes | openai/gpt-4o-mini | OpenRouter API |
| Gemini | Yes | gemini-2.0-flash | Google AI API |
| Anthropic | Yes | claude-3-haiku-20240307 | Anthropic API |
| Ollama | No | llama3 | Self-hosted Ollama |

**Coach Context Builder** (`src/lib/coach-context.ts`):
- Aggregates 12 parallel database queries into a structured context object
- Includes: user name, focus data (today/yesterday/week), streak, mission progress, distraction data, reflection data, best hours/weekdays
- Supports 7 coach modes: briefing, morning_plan, night_review, question, weekly_review, mission_suggestions, focus_suggestions
- 3 personality system prompts: strict (direct, accountability-focused), friendly (encouraging, positive reinforcement), data_nerd (analytics-focused, comparison-driven)

**AI Coach Endpoints:**
- `POST /api/coach` — General coaching with mode selection
- `POST /api/coach/briefing` — Daily briefing
- `POST /api/coach/review` — Night review
- `POST /api/coach/suggestions` — Mission and focus suggestions

**Desktop Behavioral Coach** (`GET /api/desktop/coach`):
- Detects 5 behavioral patterns: excessive context switching, late-night work, burnout risk, distraction spike, poor consistency
- Generates recommendations based on detected patterns
- Runs entirely on the server using rule-based analysis (no AI call)

### Future Direction

- ✗ Streaming responses for AI coaching (SSE)
- ✗ Conversation memory (multi-turn coaching sessions)
- ✗ Fine-tuned models on user's behavioral data
- ✗ Proactive coaching (system reaches out when patterns are detected)
- ✗ Voice-based coaching (TTS integration)
- ✗ On-device AI (WebLLM for offline coaching)

---

## 15. Synchronization System Overview

### Current Implementation

Data synchronization between the desktop agent and web app is **polling-based** — the desktop agent periodically sends HTTP requests to the Next.js API.

**Sync Loops:**
| Loop | Interval | Purpose |
|------|----------|---------|
| Activity Reporting | 30 seconds (configurable) | Send tracked activity data to `/api/activities` |
| Notification Check | 60 seconds | Check `/api/desktop/notifications` for new notifications |
| Data Sync | 5 minutes | Sync settings and missions from `/api/desktop/sync` |
| Pairing Poll | 10 seconds (when unpaired) | Check `/api/desktop/auth/status` for pairing tokens |

**Authentication for Desktop:**
- Desktop uses a separate device authentication system (not session cookies)
- Pairing flow: Web app generates a pairing token → Desktop polls for it → Desktop completes pairing → Receives refresh token
- Access tokens: Short-lived (1 hour) JWTs for API calls
- Refresh tokens: Long-lived (90 days) JWTs for obtaining new access tokens
- Token refresh: Automatic on 401 responses, with re-pairing if refresh fails

**Known Limitations:**
- ⚠ No real-time sync — all data flows through polling
- ⚠ No conflict resolution — last-write-wins
- ⚠ No offline queue — if API is unreachable, tracked activities are lost
- ⚠ No delta sync — full data transfer on each sync cycle

### Future Direction

- ✗ WebSocket-based real-time communication
- ✗ Offline-first with local SQLite in Electron
- ✗ Delta sync with vector clocks for conflict resolution
- ✗ Push notifications instead of polling
- ✗ Multi-device sync with conflict resolution

---

## 16. High-Level System Architecture

### Current Implementation

```
┌─────────────────────────────────────────────────────────────────┐
│                        MindGuard System                         │
│                                                                 │
│  ┌──────────────────────────┐    ┌──────────────────────────┐  │
│  │   Electron Desktop Agent  │    │    Next.js Web App        │  │
│  │                          │    │                          │  │
│  │  ┌────────────────────┐  │    │  ┌────────────────────┐  │  │
│  │  │  Activity Tracker   │  │    │  │   React SPA         │  │  │
│  │  │  (active-win)       │  │    │  │   (14 views)        │  │  │
│  │  └────────────────────┘  │    │  └────────────────────┘  │  │
│  │  ┌────────────────────┐  │    │  ┌────────────────────┐  │  │
│  │  │  Focus Protection   │  │    │  │   Zustand Store     │  │  │
│  │  │  (app/website block)│  │    │  │   (app-store.ts)    │  │  │
│  │  └────────────────────┘  │    │  └────────────────────┘  │  │
│  │  ┌────────────────────┐  │    │  ┌────────────────────┐  │  │
│  │  │  Device Auth        │  │    │  │   NextAuth.js       │  │  │
│  │  │  (JWT tokens)       │  │    │  │   (Credentials)     │  │  │
│  │  └────────────────────┘  │    │  └────────────────────┘  │  │
│  │  ┌────────────────────┐  │    │  ┌────────────────────┐  │  │
│  │  │  System Tray        │  │    │  │   AI Provider       │  │  │
│  │  │  (notifications)    │  │    │  │   (7 backends)      │  │  │
│  │  └────────────────────┘  │    │  └────────────────────┘  │  │
│  └──────────┬───────────────┘    └──────────┬───────────────┘  │
│             │                               │                  │
│             │  HTTP (polling)               │                  │
│             │  Bearer token auth            │                  │
│             ▼                               ▼                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Next.js API Layer                      │  │
│  │                                                          │  │
│  │  28+ Route Handlers (App Router)                        │  │
│  │  ├── Auth: /api/auth/*                                   │  │
│  │  ├── Desktop: /api/desktop/* (status, sync, coach, etc.) │  │
│  │  ├── Core: /api/sessions, /api/missions, /api/stats      │  │
│  │  ├── AI: /api/coach/*                                    │  │
│  │  └── Settings: /api/settings, /api/user-settings         │  │
│  └──────────────────────┬───────────────────────────────────┘  │
│                         │                                      │
│                         ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Prisma ORM + SQLite                      │  │
│  │                                                          │  │
│  │  11 Models: User, Mission, FocusSession,                 │  │
│  │  DailyReflection, Achievement, DesktopActivity,          │  │
│  │  DesktopSettings, Notification, UserSettings,            │  │
│  │  Device, Habit, HabitEntry                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Data Flow Summary:**
1. User interacts with React SPA → Zustand state → API calls
2. Desktop tracker polls active window → Activity data → HTTP POST to API
3. API routes → Prisma ORM → SQLite database
4. AI coach → Context builder → LLM API → Response back to user

### Future Direction

```
┌─────────────────────────────────────────────────────────────────┐
│                    Future MindGuard Architecture                 │
│                                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │  Desktop App  │ │  Mobile App  │ │  Browser Ext │           │
│  │  (Electron)   │ │  (React      │ │  (Chrome/    │           │
│  │               │ │   Native)    │ │   Firefox)   │           │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘           │
│         │                │                │                    │
│         └────────────────┼────────────────┘                    │
│                          │                                     │
│                    WebSocket + REST                             │
│                          │                                     │
│         ┌────────────────┼────────────────┐                    │
│         │                ▼                │                    │
│         │    ┌───────────────────┐        │                    │
│         │    │  API Gateway /     │        │                    │
│         │    │  Load Balancer     │        │                    │
│         │    └─────────┬─────────┘        │                    │
│         │              │                  │                    │
│         │    ┌─────────▼─────────┐        │                    │
│         │    │  Next.js API       │        │                    │
│         │    │  (Horizontal Scale)│        │                    │
│         │    └─────────┬─────────┘        │                    │
│         │              │                  │                    │
│         │    ┌─────────▼─────────┐        │                    │
│         │    │  PostgreSQL        │        │                    │
│         │    │  (with migrations) │        │                    │
│         │    └───────────────────┘        │                    │
│         └─────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 17. Product Modules

### Current Implementation

| Module | Status | Key Files | Description |
|--------|--------|-----------|-------------|
| **Auth** | ✓ Implemented | `src/lib/auth.ts`, `src/lib/auth-utils.ts`, `src/app/api/auth/*` | Credentials-based auth with NextAuth.js v4, JWT sessions, device token auth |
| **Onboarding** | ✓ Implemented | `src/components/onboarding/*`, `src/app/api/onboarding/route.ts` | 11-step wizard with psychological profiling |
| **Dashboard** | ✓ Implemented | `src/components/dashboard/*`, `src/app/api/stats/route.ts` | Main dashboard with 8+ widgets |
| **Life Dashboard** | ✓ Implemented | `src/components/life/*`, `src/app/api/life-dashboard/route.ts` | Desktop intelligence view |
| **Missions** | ✓ Implemented | `src/components/mission/*`, `src/app/api/missions/*` | CRUD + templates + priority |
| **Focus Timer** | ✓ Implemented | `src/components/timer/*`, `src/app/api/sessions/route.ts` | Full-screen timer with Pomodoro |
| **AI Coach** | ✓ Implemented | `src/lib/ai-provider.ts`, `src/lib/coach-context.ts`, `src/app/api/coach/*` | 7-provider AI with fallback |
| **Reflections** | ✓ Implemented | `src/components/reflection/*`, `src/app/api/reflections/route.ts` | Structured daily journaling |
| **Daily Review** | ✓ Implemented | `src/components/review/*`, `src/app/api/daily-review/route.ts` | Automated daily summary |
| **Weekly Wrapped** | ✓ Implemented | `src/components/wrapped/*`, `src/app/api/weekly-wrapped/route.ts` | Weekly performance report |
| **Stats & Insights** | ✓ Implemented | `src/components/stats/*`, `src/app/api/stats/*`, `src/app/api/insights/*` | 30-day analytics with pattern detection |
| **Habits** | ✓ Implemented | `src/components/habits/*`, `src/app/api/habits/*` | Custom habit tracking with streaks |
| **Achievements** | ✓ Implemented | `src/components/dashboard/achievements-v2.tsx`, `src/app/api/achievements/*` | 8 achievement types with XP |
| **Notifications** | ✓ Implemented | `src/components/notifications/*`, `src/app/api/notifications/*`, `src/app/api/desktop/notifications/*` | 7 notification types with deduplication |
| **Settings** | ✓ Implemented | `src/components/settings/*`, `src/app/api/settings/*`, `src/app/api/user-settings/*` | 12-section settings panel |
| **Desktop Tracker** | ✓ Implemented | `electron/src/tracker/*`, `electron/src/classifier/*` | Active window + idle tracking |
| **Focus Protection** | ✓ Implemented | `electron/src/focus/focus-protection.js` | App/website blocking |
| **Device Pairing** | ✓ Implemented | `electron/src/auth/device-auth.js`, `src/app/api/desktop/auth/*` | JWT-based pairing flow |
| **Desktop Sync** | ✓ Implemented | `electron/src/main.js` (sync loop), `src/app/api/desktop/sync/route.ts` | Polling-based sync |
| **Command Palette** | ✓ Implemented | `src/components/command-palette/command-palette.tsx` | Keyboard-driven navigation |
| **Replay** | ✓ Implemented | `src/components/replay/*`, `src/app/api/replay/route.ts` | Day replay timeline |
| **Monthly Report** | ✓ Implemented | `src/components/stats/monthly-report.tsx`, `src/app/api/monthly-report/route.ts` | Monthly analytics |
| **Heatmap** | ✓ Implemented | `src/components/dashboard/heatmap.tsx`, `src/app/api/heatmap/route.ts` | Year-long focus heatmap |
| **Timeline** | ✓ Implemented | `src/components/dashboard/timeline.tsx`, `src/app/api/timeline/route.ts` | Activity timeline |
| **Landing Page** | ✓ Implemented | `src/components/landing/landing-page.tsx` | Marketing + auth (register/login) |

### Future Direction

| Module | Status | Description |
|--------|--------|-------------|
| **WebSocket Service** | ✗ Planned | Real-time bidirectional communication |
| **Mobile Companion** | ✗ Planned | React Native app |
| **Browser Extension** | ✗ Planned | Chrome/Firefox web activity tracking |
| **Team Dashboard** | ✗ Planned | Aggregate team analytics |
| **Calendar Integration** | ✗ Planned | Calendar-aware focus scheduling |
| **Data Export** | ✗ Planned | CSV/JSON export of all user data |
| **Plugin System** | ✗ Planned | Third-party integrations |

---

## 18. User Journey

### Current Implementation

```
1. Landing Page → Register/Login
2. Onboarding (11 steps) → Dashboard
3. Dashboard → View stats, AI coach, heatmap, timeline
4. Create Mission → Start Focus Timer → Complete Session → Celebration
5. Daily Reflection → Review what went well / what distracted
6. Daily Review → Automated summary of the day
7. Weekly Wrapped → Weekly performance report
8. Settings → Customize preferences, AI provider, desktop tracking
```

### Future Direction

```
9. Install Desktop Agent → Pair with web → Real-time tracking
10. Install Browser Extension → Web activity tracking
11. Install Mobile App → On-the-go tracking
12. Team Dashboard → View team attention patterns
13. Calendar Integration → Auto-schedule focus blocks
14. Annual Review → Year-long cognitive health assessment
```

---

## 19. Desktop User Journey

### Current Implementation

```
1. Download MindGuard Desktop from GitHub Releases
2. Install and launch → BrowserWindow opens to localhost:3000
3. Desktop polls /api/desktop/auth/status every 10 seconds
4. User logs into web app → Web generates pairing token
5. Desktop detects pairing token → Completes pairing → Receives refresh token
6. Activity tracker starts → Reports data every 30 seconds
7. Notification checks every 60 seconds
8. Settings sync every 5 minutes
9. User can close window → App runs in system tray
10. Focus protection activates during focus sessions
```

### Future Direction

```
1. Download → Auto-configure → WebSocket connection established
2. Seamless pairing with QR code or one-click
3. Offline-first with local SQLite queue
4. Real-time data push to web app
5. Global hotkeys for focus session control
6. Native menu bar widget for quick stats
7. Auto-updater for seamless version updates
```

---

## 20. Web User Journey

### Current Implementation

```
1. Visit localhost:3000 → Landing page with auth
2. Register (email + password) → 11-step onboarding
3. Dashboard → Personalized greeting, stats, AI coach
4. Create mission → Start focus timer → Session saved
5. Daily reflection → Structured journaling
6. Navigate via sidebar or command palette (Cmd+K)
7. View stats, insights, heatmap, timeline
8. Weekly wrapped → Attention grade
9. Settings → Customize everything
10. Download desktop companion → Enhanced tracking
```

### Future Direction

```
11. Mobile-responsive full experience
12. Deep linking to specific views
13. PWA install for offline access
14. Team workspace for collaborative focus
15. Calendar integration for auto-scheduling
```

---

## 21. Authentication Flow

### Current Implementation

MindGuard uses **NextAuth.js v4** with the **Credentials provider** and **JWT session strategy**.

**Registration Flow:**
```
1. User enters email + password on Landing Page
2. Client validates with Zod schema (registerSchema)
3. POST /api/auth/register → Creates user with bcryptjs-hashed password
4. Client calls signIn('credentials', { email, password })
5. NextAuth validates credentials → Creates JWT session
6. JWT callback adds user.id and onboarded status to token
7. Session callback exposes id and onboarded to client
8. User is redirected to onboarding (if not onboarded) or dashboard
```

**Session Management:**
- JWT strategy (no database sessions)
- Session includes: `id`, `email`, `name`, `onboarded`
- `onboarded` is fetched from DB on every JWT refresh
- Auth secret: `NEXTAUTH_SECRET` env var (or hardcoded fallback for development)

**API Authentication:**
- Web API routes use `getAuthUserId()` from `src/lib/auth-utils.ts`
- Calls `getServerSession(authOptions)` to validate session
- Returns 401 if not authenticated

**Known Issues:**
- ⚠ 401 race condition: `HomePage.useEffect` may fire API requests before the session is fully established
- ⚠ The onboarding flow has a manual retry on 401 (1-second delay, then retry)
- ⚠ No CSRF protection beyond NextAuth.js defaults
- ⚠ No rate limiting on login attempts (rate limiter exists but is not used on auth routes)

### Future Direction

- ✗ OAuth providers (Google, GitHub, Apple)
- ✗ Two-factor authentication
- ✗ Session revocation
- ✗ Rate limiting on auth endpoints
- ✗ Email verification
- ✗ Password reset flow

---

## 22. Desktop Pairing Flow

### Current Implementation

```
┌──────────────┐                          ┌──────────────┐
│   Web App    │                          │  Desktop App │
│  (Browser)   │                          │  (Electron)  │
└──────┬───────┘                          └──────┬───────┘
       │                                         │
       │  1. User logs in via web                │
       │  2. User sets pendingPairing = true     │
       │                                         │
       │  3. POST /api/desktop/auth/pair         │
       │     → Generates pairingToken (5min JWT) │
       │     → Creates Device record             │
       │     → Returns pairingToken + deviceId   │
       │                                         │
       │                          4. GET /api/desktop/auth/status
       │                             (every 10 seconds)
       │                          ← Returns { status: "pairing_available",
       │                              pairingToken, deviceId }
       │                                         │
       │                          5. POST /api/desktop/auth/complete
       │                             { pairingToken, deviceId }
       │                          ← Returns { refreshToken, accessToken,
       │                              deviceId, user }
       │                                         │
       │                          6. Desktop stores tokens
       │                             Activity tracker starts
       │                             Reporting loop starts
       │                                         │
       │  7. Desktop sends 'desktop:auth-change' │
       │     to renderer via IPC                 │
       │                                         │
```

**Token Lifecycle:**
- **Pairing Token**: 5-minute JWT, one-time use
- **Access Token**: 1-hour JWT, used for API calls
- **Refresh Token**: 90-day JWT, used to obtain new access tokens
- **Token Refresh**: Automatic on 401; if refresh fails, re-enters pairing poll

### Future Direction

- ✗ QR code pairing (scan from mobile)
- ✗ WebSocket-based pairing (instant, no polling)
- ✗ Multi-device pairing (multiple desktops + mobile)
- ✗ Device trust levels (primary, secondary, guest)
- ✗ Device activity audit log

---

## 23. Data Flow

### Current Implementation

**Focus Session Data Flow:**
```
1. User starts Focus Timer
2. Wall-clock timer runs (useRef-based, not setInterval counting)
3. User completes or stops session
4. POST /api/sessions { missionId, duration, startedAt, endedAt }
5. Server validates → Creates FocusSession in SQLite
6. Achievement checks triggered
7. Dashboard stats update on next fetch
```

**Desktop Activity Data Flow:**
```
1. Activity Tracker polls active window every 30 seconds
2. Classifies activity (type, category, app, website)
3. Queues activity data in memory
4. Reporting loop flushes queue to POST /api/activities
5. Server validates → Creates DesktopActivity records in SQLite
6. Stats, insights, and coach data updated on next API call
```

**AI Coach Data Flow:**
```
1. User opens AI Coach or requests briefing
2. GET /api/coach (or POST with mode)
3. Server builds CoachContext (12 parallel DB queries)
4. Server generates system prompt (personality-based)
5. Server generates user prompt (mode-specific)
6. Server calls aiComplete() with configured provider
7. If provider fails → retry with exponential backoff
8. If still fails → fallback to z-ai
9. Response returned to client
```

### Future Direction

- ✗ Real-time data flow via WebSocket
- ✗ Event-driven architecture (event bus)
- ✗ CQRS for read-heavy analytics
- ✗ Background job processing for AI coaching
- ✗ Cached analytics with incremental updates

---

## 24. Offline Strategy

### Current Implementation

⚠ **Minimal offline support.** The application is effectively online-only:

- The web app requires a running Next.js server and database
- The desktop app requires the web app's API to be accessible
- If the API is unreachable, the desktop tracker loses activity data
- No local storage of activity data in the desktop app
- No service worker or PWA caching for the web app

**What works offline:**
- The Zustand store persists in memory (not localStorage)
- The focus timer uses wall-clock timing (works without network)
- The focus timer will fail to save the session on completion (no retry)

### Future Direction

- ✗ Service Worker for web app caching
- ✗ Local SQLite in Electron for offline activity queue
- ✗ Automatic sync when connectivity is restored
- ✗ Conflict resolution with vector clocks
- ✗ PWA for offline-first web experience
- ✗ Local AI coaching (WebLLM) for offline use

---

## 25. Security Principles

### Current Implementation

| Principle | Implementation | Status |
|-----------|---------------|--------|
| Password hashing | bcryptjs with 12 rounds | ✓ Implemented |
| JWT authentication | NextAuth.js v4 with JWT strategy | ✓ Implemented |
| Device token auth | JWT-based access/refresh tokens | ✓ Implemented |
| Input validation | Zod schemas on all API routes | ✓ Implemented |
| SQL injection prevention | Prisma ORM parameterized queries | ✓ Implemented |
| XSS prevention | React's built-in escaping + sanitize.ts | ✓ Implemented |
| Context isolation | Electron contextIsolation: true | ✓ Implemented |
| Rate limiting | rate-limiter.ts exists | ⚠ Implemented but not widely used |
| CORS | Next.js default same-origin | ⚠ Default only |
| API key storage | Stored in UserSettings (not encrypted) | ⚠ Not encrypted at rest |
| Auth secret | Hardcoded fallback in auth.ts | ⚠ Should be env-only |
| HTTPS | Not enforced in development | ⚠ Dev mode is HTTP only |

**Known Security Concerns:**
1. ⚠ AI API keys stored in plaintext in SQLite (not encrypted)
2. ⚠ NEXTAUTH_SECRET has a hardcoded fallback — should fail if not set
3. ⚠ No rate limiting on auth endpoints
4. ⚠ No CSRF protection beyond NextAuth.js defaults
5. ⚠ No content security policy headers
6. ⚠ Device tokens are JWTs (not opaque tokens) — can't be revoked without a blocklist

### Future Direction

- ✗ Encrypted API key storage (AES-256)
- ✗ Environment-variable-only secrets (no hardcoded fallbacks)
- ✗ Rate limiting on all auth endpoints
- ✗ CSRF tokens for state-changing operations
- ✗ Content Security Policy headers
- ✗ Opaque refresh tokens (not JWTs) with database revocation
- ✗ Two-factor authentication
- ✗ Audit logging for sensitive operations
- ✗ Penetration testing

---

## 26. Privacy Principles

### Current Implementation

| Principle | Implementation | Status |
|-----------|---------------|--------|
| Opt-in tracking | Desktop tracking is off by default (must enable) | ✓ Implemented |
| Privacy mode | Desktop privacy mode hides window titles | ✓ Implemented |
| Tracking exclusions | Configurable list of excluded apps/websites | ✓ Implemented |
| Data ownership | All data stored locally in SQLite | ✓ Implemented |
| No telemetry | No analytics or tracking beyond the app itself | ✓ Implemented |
| Data minimization | Only essential data is collected | ✓ Implemented |

**Privacy by Design:**
- Desktop activity tracking is opt-in and can be disabled at any time
- Privacy mode replaces window titles with generic descriptions
- Tracking exclusions allow users to exclude sensitive apps/websites
- All data is stored locally in SQLite — no cloud storage
- No third-party analytics or tracking

**Privacy Concerns:**
- ⚠ Window titles may contain sensitive information (document names, email subjects)
- ⚠ Website URLs may contain query parameters with sensitive data
- ⚠ No data export or deletion mechanism
- ⚠ No automatic data retention policy

### Future Direction

- ✗ Automatic data retention policy (configurable: 30/90/365 days)
- ✗ One-click data export (GDPR compliance)
- ✗ One-click account deletion
- ✗ End-to-end encryption for sensitive data
- ✗ Differential privacy for aggregate analytics
- ✗ Privacy impact assessment documentation

---

## 27. Scalability Strategy

### Current Implementation

MindGuard is designed as a **single-user, single-instance** application. The current architecture is not designed for horizontal scaling:

- **Database**: SQLite (file-based, single-writer) — does not support concurrent writes
- **Server**: Single Next.js process on port 3000
- **Sessions**: JWT-based (stateless) — no session store
- **Caching**: None — every API call hits the database
- **File storage**: Local filesystem only

**Performance Characteristics:**
- Suitable for single-user or small-team deployment
- SQLite handles read-heavy workloads well (analytics queries)
- Prisma query logging enabled in development
- No database connection pooling (Prisma handles this internally)

### Future Direction

**Phase 1 — Vertical Scaling (Current)**
- SQLite is sufficient for single-user deployment
- Optimize queries with proper indexing
- Add in-memory caching for frequently accessed data

**Phase 2 — Multi-User Deployment**
- Migrate to PostgreSQL (preserving Prisma ORM)
- Add Redis for session caching and rate limiting
- Implement connection pooling
- Add CDN for static assets

**Phase 3 — Horizontal Scaling**
- Containerize with Docker
- Kubernetes orchestration
- Read replicas for analytics queries
- Background job processing (Bull/BullMQ)
- Event-driven architecture

**Phase 4 — Global Scale**
- Multi-region deployment
- Edge caching with Cloudflare
- Sharded database
- Event sourcing for audit trail

---

## 28. Future Roadmap

### Current Implementation

The product is at **v4.2.0** with the core feature set complete. The following areas need stabilization before new features are added:

**Stability Sprint (Priority 0)**
1. Fix 401 auth race condition at HomePage.useEffect
2. Fix loading screen that sometimes never disappears
3. Fix desktop preview/status panel not showing correctly
4. Fix live desktop widgets not updating
5. Fix light theme
6. Fix MissionLaunch React error ("Cannot update TimerView while rendering")
7. Fix JSON parsing errors (blind response.json() without status checks)

### Future Direction

**Phase 1 — Desktop Integration (Q3 2025)**
- WebSocket real-time communication
- Auth sync between desktop and web
- Live desktop widgets
- Desktop pairing improvements

**Phase 2 — Intelligence Layer (Q4 2025)**
- Predictive distraction modeling
- Personalized circadian rhythm optimization
- Streaming AI responses
- Proactive coaching notifications

**Phase 3 — Mobile & Multi-Device (Q1 2026)**
- React Native mobile app
- Browser extension
- Multi-device sync
- Cross-device attention tracking

**Phase 4 — Team & Enterprise (Q2 2026)**
- Team analytics dashboard
- SSO and admin controls
- Compliance features
- API platform

**Phase 5 — Ecosystem (Q3 2026+)**
- Plugin marketplace
- Calendar integration
- Wearable integration
- Public API and SDK

---

## 29. Release Strategy

### Current Implementation

- **Versioning**: Semantic versioning (v4.2.0)
- **Branching**: Git with `main` branch
- **Build**: No CI/CD pipeline; manual builds
- **Desktop packaging**: electron-builder for Mac, Windows, Linux
- **Deployment**: Manual (bun run dev for development)

### Future Direction

- ✗ Automated CI/CD pipeline (GitHub Actions)
- ✗ Automated testing (unit, integration, E2E)
- ✗ Staged rollouts (canary → beta → stable)
- ✗ Feature flags for gradual feature releases
- ✗ Automated desktop app updates (auto-updater)
- ✗ Docker containerization for server deployment
- ✗ Semantic release automation

---

## 30. Success Metrics

### Current Implementation

**Product Metrics (tracked in-app):**
- Daily focus minutes
- Weekly focus minutes
- Current streak
- Focus score
- Session count
- Average session length
- Achievement count
- XP and level

**Behavioral Metrics (derived from desktop activity):**
- Productive vs distracted minutes
- Context switches per hour
- Best focus hours
- Idle time
- Deep work sessions

### Future Direction

**Business Metrics:**
- Monthly Active Users (MAU)
- Daily Active Users (DAU)
- Retention rate (D1, D7, D30)
- Average session duration
- Focus goal completion rate
- Desktop companion adoption rate
- AI coach engagement rate
- Premium conversion rate

**Health Metrics:**
- Average attention score trend (30-day)
- Burnout risk reduction
- Streak consistency improvement
- Distraction reduction over time

---

## 31. Risks

### Current Implementation

| Risk | Severity | Mitigation |
|------|----------|------------|
| Auth race condition causing 401s | High | Needs proper session verification before API calls |
| SQLite corruption under concurrent writes | Medium | Single-writer design; Prisma handles this |
| Desktop tracker not working on Linux | Medium | `active-win` has limited Linux support |
| AI API keys stored in plaintext | Medium | Needs encryption at rest |
| No offline support | Medium | Users lose data when offline |
| No automated testing | High | Bugs can be introduced without detection |
| No CI/CD pipeline | Medium | Manual deployment is error-prone |
| Light theme broken | Low | Users default to dark theme |
| Hardcoded auth secret | High | Must be env-variable-only in production |

### Future Direction

| Risk | Severity | Mitigation |
|------|----------|------------|
| Scalability with SQLite | High | Plan PostgreSQL migration |
| Multi-device sync conflicts | Medium | Implement conflict resolution |
| Privacy regulations (GDPR) | High | Implement data export and deletion |
| AI provider reliability | Medium | Already mitigated with fallback system |
| User data breach | Critical | Implement encryption, audit logging |
| Platform dependency (Electron) | Medium | Consider Tauri as alternative |
| Feature creep | Medium | Strictly follow PRD priorities |

---

## 32. Technical Debt

### Current Implementation

| Item | Severity | Description |
|------|----------|-------------|
| Auth race condition | **Critical** | 401 errors at HomePage.useEffect due to session not being ready when API calls are made |
| Blind response.json() | **High** | Multiple API calls call `.json()` without checking status first, causing JSON parse errors |
| No TypeScript in Electron | **Medium** | Electron codebase is plain JavaScript (no type safety) |
| No automated tests | **High** | Zero test coverage; all testing is manual |
| No WebSocket support | **Medium** | All communication is polling-based, causing latency and unnecessary API calls |
| Hardcoded auth secret | **High** | `mindguard-secret-key-production-2025-a7f3e9b1c4d8` in auth.ts |
| No encryption for API keys | **Medium** | User AI API keys stored in plaintext in SQLite |
| Light theme broken | **Low** | Multiple CSS issues in light mode |
| No error boundaries in views | **Low** | Only one error boundary in AppShell; individual views lack them |
| Single-page architecture | **Medium** | No deep linking, no SEO, no URL-based navigation |
| No database migrations | **Medium** | Using `prisma db push` instead of `prisma migrate` |
| No API versioning | **Low** | All API routes are unversioned |
| Zustand state not persisted | **Medium** | All state lost on page refresh; must be refetched from API |
| No request deduplication | **Low** | Multiple components may fetch the same data simultaneously |

### Future Direction

| Priority | Item | Description |
|----------|------|-------------|
| P0 | Fix auth race condition | Proper session verification before API calls |
| P0 | Fix blind response.json() | Always check response.ok before parsing |
| P1 | Add TypeScript to Electron | Migrate desktop app to TypeScript |
| P1 | Add automated tests | Unit tests for lib/, integration tests for API routes |
| P1 | WebSocket communication | Replace polling with real-time data flow |
| P2 | Encrypt API keys at rest | AES-256 encryption for stored API keys |
| P2 | Database migrations | Use Prisma migrate instead of db push |
| P2 | Persist Zustand state | localStorage or IndexedDB persistence |
| P3 | Multi-page routing | Next.js App Router with proper URL-based navigation |
| P3 | API versioning | Version all API routes |
| P3 | Request deduplication | React Query caching strategy |

---

## 33. Guiding Engineering Principles

### Current Implementation

1. **TypeScript everywhere** — All web code is TypeScript; Electron code is JavaScript (technical debt)
2. **Prisma ORM** — No raw SQL; all database access through Prisma
3. **shadcn/ui** — Use existing components instead of building from scratch
4. **API routes** — All backend logic in Next.js API routes (no server actions)
5. **Zustand for state** — Single global store with individual selectors to prevent over-rendering
6. **Dynamic imports** — All heavy components are lazy-loaded
7. **Tailwind CSS** — All styling through utility classes
8. **Framer Motion** — All animations through Framer Motion
9. **Zod validation** — All API inputs validated with Zod schemas

### Future Direction

10. **Test-driven development** — Write tests before implementation
11. **Progressive enhancement** — Core functionality works without JavaScript
12. **Performance budget** — Lighthouse score > 90 for all pages
13. **Accessibility-first** — WCAG 2.1 AA compliance
14. **Documentation-driven development** — Document APIs before implementing them
15. **Error recovery** — Every error has a recovery path; never leave the user stuck

---

## 34. Product Design Principles

### Current Implementation

1. **Dark theme first** — The primary experience is dark mode with emerald accents
2. **Glassmorphism** — Cards use glass effects (backdrop-blur, translucent backgrounds)
3. **Micro-interactions** — Every click has feedback (sound, animation, or both)
4. **One mission at a time** — The UI reinforces single-task focus
5. **Progressive disclosure** — Complex settings are hidden behind sections
6. **Data density** — The dashboard shows maximum information without clutter
7. **Animated transitions** — View changes are animated with Framer Motion
8. **Responsive design** — Works on mobile (with some limitations) and desktop
9. **Keyboard-first** — Full keyboard navigation with command palette

### Future Direction

10. **Calm technology** — The system should not demand attention; it should protect it
11. **Contextual intelligence** — Show relevant information at the right time
12. **Zero-friction actions** — Common actions should take 1 click or 1 keyboard shortcut
13. **Graceful degradation** — The product should work without JavaScript, without desktop, without AI
14. **Accessible design** — Screen reader support, high contrast, keyboard navigation

---

## 35. Quality Standards

### Current Implementation

| Standard | Status | Description |
|----------|--------|-------------|
| TypeScript strict mode | ✓ | All web code is TypeScript with strict mode |
| ESLint | ✓ | Next.js ESLint config |
| Input validation | ✓ | Zod schemas on all API routes |
| Error boundaries | ⚠ | Only one error boundary in AppShell |
| Loading states | ✓ | Skeleton loading states for all views |
| Responsive design | ✓ | Mobile-first with Tailwind breakpoints |
| Accessibility | ⚠ | ARIA labels on some elements, not all |
| Console errors | ⚠ | 401 errors in console on first load |
| Performance | ⚠ | Dynamic imports used, but no lazy loading of data |

### Future Direction

| Standard | Target | Description |
|----------|--------|-------------|
| Unit test coverage | > 80% | All lib/ and hooks/ tested |
| Integration test coverage | > 70% | All API routes tested |
| E2E test coverage | Critical paths | Registration, onboarding, focus timer, AI coach |
| Lighthouse score | > 90 | Performance, accessibility, best practices |
| Bundle size | < 200KB initial | Code splitting and lazy loading |
| API response time | < 200ms | All API routes under 200ms |
| Error rate | < 0.1% | No unhandled errors in production |
| Uptime | > 99.9% | Production deployment reliability |

---

## 36. Definition of Done

### Current Implementation

A feature is considered "done" when:
1. ✓ Code is written in TypeScript
2. ✓ API routes have Zod validation
3. ✓ The feature works in the browser
4. ✓ The feature works on mobile
5. ✓ The developer has manually tested it

### Future Direction

A feature is considered "done" when:
1. ✗ Code is written in TypeScript with strict mode
2. ✗ All API routes have Zod validation
3. ✗ Unit tests pass with > 80% coverage
4. ✗ Integration tests pass for all API routes
5. ✗ E2E tests pass for critical paths
6. ✗ ESLint passes with no warnings
7. ✗ No console errors in the browser
8. ✗ Lighthouse score > 90
9. ✗ Accessibility audit passes
10. ✗ Documentation is updated
11. ✗ Code is reviewed by at least one other engineer
12. ✗ Feature is deployed to staging and verified
13. ✗ Feature is deployed to production with monitoring

---

## 37. Future Expansion Vision

### Current Implementation

MindGuard is a focused productivity tool with a well-defined scope. The current feature set is complete and stable (with known regressions).

### Future Direction

**Expansion Area 1: Attention Intelligence Platform**
- Become the definitive platform for understanding and optimizing human attention
- Expand from individual tracking to team-level and organizational insights
- Build an attention research API for academic institutions

**Expansion Area 2: Cognitive Health**
- Long-term cognitive health monitoring and trend analysis
- Early detection of attention-related health issues (burnout, ADHD management, cognitive decline)
- Partnerships with cognitive psychology researchers

**Expansion Area 3: Attention Marketplace**
- Plugin ecosystem for custom trackers, coaches, and interventions
- Integration marketplace (calendar, email, project management, communication tools)
- AI coaching marketplace (specialized coaches for different professions)

**Expansion Area 4: Ambient Computing**
- MindGuard as the attention layer across all computing devices
- Wearable integration for physiological data (heart rate, sleep, stress)
- Smart home integration (lighting, sound, environment optimization for focus)

**Expansion Area 5: Education**
- MindGuard for students and educational institutions
- Attention curriculum and training programs
- Research partnerships with universities

---

## Appendix A: Implementation Status Summary

| Feature | Status |
|---------|--------|
| Focus Timer | ✓ Implemented |
| Mission System | ✓ Implemented |
| AI Coach (7 providers) | ✓ Implemented |
| Desktop Activity Tracker | ✓ Implemented |
| Onboarding (11 steps) | ✓ Implemented |
| Dashboard | ✓ Implemented |
| Life Dashboard | ✓ Implemented |
| Daily Reflection | ✓ Implemented |
| Daily Review | ✓ Implemented |
| Weekly Wrapped | ✓ Implemented |
| Habit Tracker | ✓ Implemented |
| Statistics & Insights | ✓ Implemented |
| Command Palette | ✓ Implemented |
| Focus Protection | ✓ Implemented |
| System Tray & Notifications | ✓ Implemented |
| Device Pairing | ✓ Implemented |
| Gamification (XP/Levels/Achievements) | ✓ Implemented |
| Settings (12 sections) | ✓ Implemented |
| Heatmap | ✓ Implemented |
| Timeline | ✓ Implemented |
| Replay | ✓ Implemented |
| Monthly Report | ✓ Implemented |
| Landing Page + Auth | ✓ Implemented |
| WebSocket Communication | ✗ Planned |
| Mobile Companion | ✗ Planned |
| Browser Extension | ✗ Planned |
| Team Analytics | ✗ Planned |
| Calendar Integration | ✗ Planned |
| Data Export | ✗ Planned |
| Plugin System | ✗ Planned |
| Offline Support | ✗ Planned |
| Multi-Page Routing | ✗ Planned |
| PWA Support | ✗ Planned |
| Light Theme Polish | ⚠ Partially Implemented |
| Auth Race Condition Fix | ⚠ Known Issue |
| TypeScript in Electron | ✗ Planned |

---

## Appendix B: Technology Stack Reference

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router, Turbopack) | 16.1.3 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| UI Components | shadcn/ui (New York) | Latest |
| State Management | Zustand | 5.x |
| Server State | TanStack React Query | 5.x |
| Database | Prisma ORM + SQLite | 6.x |
| Authentication | NextAuth.js | 4.x |
| AI (Built-in) | z-ai-web-dev-sdk | 0.0.18 |
| Animations | Framer Motion | 12.x |
| Forms | React Hook Form + Zod | 7.x / 4.x |
| Desktop | Electron | 33.x |
| Desktop Tracking | active-win, node-idle-time | 8.x / 1.x |
| Desktop Storage | electron-store | 10.x |
| Icons | Lucide React | 0.525.x |
| Charts | Recharts | 2.x |
| Date Utilities | date-fns | 4.x |
| Package Manager | bun (root), npm (electron/) | Latest |

---

*This document is the single source of truth for the MindGuard product. All engineering decisions should be made in alignment with this PRD. When in doubt, refer to this document first.*

*Last reviewed: 2025-07-16*
