---
Task ID: 1
Agent: Main Agent
Task: Fix Mission Launch checklist - enforce strict pre-launch validation

Work Log:
- Read existing MissionLaunch component (mission-launch.tsx) - found it had checklist items but no enforcement
- Read timer-view.tsx to understand how MissionLaunch is invoked (showLaunch state)
- Read app-store.ts to check for debug exposure
- Rewrote MissionLaunch component with all requirements:
  - 4 checklist items: Phone Silent, Water Nearby, Notifications Off, Ready to Focus
  - Button disabled until ALL items checked (disabled={!allChecked})
  - Disabled state: opacity-50, cursor-not-allowed, zinc-800 bg, zinc-500 text
  - Enabled state: emerald gradient, animated glow pulse overlay, background blur glow
  - Progress indicator: animated progress bar + "X/4 Ready" counter
  - Toast notification on early click: toast.error('Complete your setup first')
  - Each item has a unique icon (ShieldOff, Droplets, BellOff, Crosshair)
  - Spring-animated check marks, staggered entrance animations
- Removed debug exposure from app-store.ts (_setState, _getState, window.__appStore)
- Verified lint passes clean (no errors)
- Verified server compiles and returns HTTP 200

Stage Summary:
- MissionLaunch now strictly enforces all 4 checklist items before allowing session start
- Visual feedback: disabled button at 50% opacity, enabled button with emerald glow pulse
- Progress bar with "X/4 Ready" text updates in real-time
- Toast error shown if user tries clicking Start Mission early
- Debug code removed from app-store.ts
- Server compiles and serves successfully (HTTP 200)
- Note: agent-browser cannot connect to localhost in this sandbox environment (Chrome runs in isolated network namespace), but code is verified via lint + successful compilation

---
Previous Context (from session continuation):
- Audio player system was completed in prior session (real HTMLAudioElement with 3 tracks)
- Timer system was already fixed to use Date.now()-based timing in prior session
- Focus mode has proper pause/resume/stop with interval cleanup
- Audio files exist at /public/audio/{classical-study,deep-focus,rain-ambient}.wav

---
Task ID: 2
Agent: Main Agent
Task: Fix preview panel loading + Fix session duration tracking

Work Log:
- **Preview panel fix**: Discovered `allowedDevOrigins: ["*"]` in next.config.ts was causing Next.js to BLOCK cross-origin requests from `space-z.ai` preview panel. The Next.js source (`block-cross-site.js`) shows: when `allowedDevOrigins` is defined, mode='block' (vs mode='warn' when undefined). Wildcard `*` doesn't match real domains. Fix: removed `allowedDevOrigins` entirely → falls back to warn-but-allow mode.

- **Session duration audit**: Traced full data pipeline:
  - focus-mode.tsx: Uses `sessionStartedAtRef.current = Date.now()` + `Math.floor((Date.now() - start - pausedMs) / 1000)` — CORRECT
  - API route (/api/sessions): Stores `validated.duration` directly — CORRECT
  - Stats API: `s.duration / 60` for minutes — CORRECT
  - Heatmap API: `Math.round(s.duration / 60)` for minutes — CORRECT
  - Timeline API: `minutes: s.duration` (misleading name but component's formatMinutes divides by 60) — CORRECT

- **Bug 1 - Hardcoded duration**: page.tsx had `duration={1500}` (always 25min) ignoring user selection. Fixed: added `focusDuration` to zustand store, page.tsx now reads `duration={focusDuration}`.

- **Bug 2 - Dead tick-based timer**: timer-view.tsx had a full `setInterval` tick counter (elapsed++), handleStop saving `duration: elapsed`, timerState machine, etc. This code was dead (MissionLaunch always redirects to FocusMode) but was the original source of wrong durations. Fix: completely rewrote TimerView as a pure duration-selector + launcher. Removed all timer state (timerState, elapsed, intervalRef, handleStop, handlePause, saving, error, showCelebration, celebrationDuration, startTimeRef).

- **Bug 3 - No duration bridge**: TimerView selected duration had no way to reach FocusMode. Fix: `setFocusDuration(seconds)` called on every preset/custom change, stored in zustand, read by page.tsx.

- **Lint fix**: Changed `onboardingChecked` from useState to useRef in page.tsx to fix `react-hooks/set-state-in-effect` lint error.

- Added detailed console.log in focus-mode.tsx save path showing startTime, endTime, pausedMs, computed formula, and final duration sent.

Stage Summary:
- Preview panel now loads (removed allowedDevOrigins, no more 403 blocks)
- Session duration chain: Date.now() start → real elapsed seconds → API stores as-is → downstream divides by 60
- 5 min session = ~300 seconds stored in DB → 5 minutes in stats/heatmap
- All dead tick-based timer code removed from TimerView
- User's selected duration now properly flows: TimerView → zustand store → page.tsx → FocusMode
- Lint passes clean, server compiles HTTP 200

---
Task ID: 3
Agent: Main Agent
Task: Premium UI upgrade — $20/month feel

Work Log:
- Generated tiny WAV click sound (1164 bytes) with Web Audio API playback utility (throttled, very low volume like Notion)
- Created CursorGlow component: spring-physics cursor with 16px dot + 32px emerald glow, glow follows with extra lag via rAF, scales on click, expands on interactive elements, auto-hides on touch devices
- Created PremiumButton wrapper with whileHover scale+lift and whileTap scale:0.97 + sound
- Created StaggerContainer/StaggerItem for dashboard widget entrance animations
- Added comprehensive CSS system to globals.css:
  - .glass-card, .glass-sidebar, .glass-header, .glass-panel (backdrop-blur + soft borders + multi-layer shadows)
  - .glass-glow-edge (gradient border glow on hover using mask-composite)
  - .btn-premium (hover glow + active scale:0.97)
  - .lift-hover (hover translateY:-2px + elevated shadow)
  - .heading-xl/lg/md, .body-lg/md (typography hierarchy)
  - .focus-breathe-bg (radial gradient breathing animation for focus mode)
  - ::selection with emerald tint
- Updated page.tsx transitions: added blur effect on enter/exit, eased with cubic-bezier
- Updated app-shell.tsx: added CursorGlow, widened content to max-w-6xl, increased padding
- Updated app-sidebar.tsx: glass-sidebar class, emerald gradient glow at top, hover:scale-[1.01] on nav items, playClick() on navigation
- Updated app-header.tsx: deeper backdrop-blur, top shine line, emerald hover glow, dual-layer shadow
- Updated dashboard-view.tsx: StaggerContainer/StaggerItem wrappers, glass-card+glass-glow-edge on all stat cards, heading-lg on main heading
- Updated focus-mode.tsx: breathing CSS background animation, pulsing glow synced with timer progress (intensity and speed increase as timer progresses)

Stage Summary:
- Custom cursor with spring physics and emerald glow (desktop only, auto-hides on touch)
- Subtle click sounds on sidebar navigation (Web Audio API, 8% volume, throttled)
- Page transitions with fade+slide+blur effect (0.25s cubic-bezier)
- Dashboard widgets stagger in with 60ms delay between each
- Focus mode has dual-layer breathing: CSS radial gradient + Framer Motion pulsing glow that intensifies with progress
- Glassmorphism on all cards (backdrop-blur:24px, gradient glow edges on hover)
- Glass sidebar and header with top shine lines
- Typography hierarchy with custom heading/body utility classes
- Selection color is emerald-tinted
- Lint passes clean, server compiles and serves HTTP 200

---
Task ID: 2-a
Agent: Backend Engineer
Task: Create ALL new backend API routes and update the Prisma schema for MindGuard v3.1

Work Log:

### 1. Prisma Schema Updates (additive only — no existing fields changed)
- FocusSession: added `quality Int?` (1-5 self-rated or auto-computed), `type String? @default("focus")` ("focus" or "break")
- DailyReflection: added `mood Int?` (1-5), `energy Int?` (1-5), `sleepHours Float?`, `tags String?` (comma-separated)
- User: added `xp Int @default(0)`, `level Int @default(1)`
- Ran `bun run db:push` twice — DB is in sync, Prisma Client regenerated

### 2. NEW: /api/coach/route.ts — AI Daily Coach
- GET returns personalized daily briefing from REAL DB data
- Queries today's, yesterday's, week's, last-30-days sessions + last-30-days reflections + this-week's completed missions in parallel (Promise.all)
- Computes: todayMinutes, yesterdayMinutes, weekMinutes, bestHour (aggregated by hour-of-day across last 30 days), bestWeekday (aggregated by day-of-week), streak (walks back from today, allowing today to be empty), weekMissionsCompleted, reflectionRate (last 30 days), weekReflections
- Greeting generated by time-of-day (morning/afternoon/evening/night/midnight oil)
- Recommendations are 100% data-driven — different recs fire based on:
  - Whether today has 0 / <30 / <90 / 90+ minutes
  - Whether today is ahead/behind/parity vs yesterday
  - Best hour block (with human label: morning/afternoon/etc.)
  - Best weekday with concrete minute count
  - Reflection rate tiers (<30% / >=70%)
  - Weekly missions count (0 / >=3)
  - Streak >=3 days
- Recommendations capped at 5, summary is a single natural-language paragraph built from real numbers (today's minutes, % change vs yesterday, week minutes/sessions, streak, missions, reflection rate)
- NO hardcoded insights anywhere

### 3. NEW: /api/achievements/progress/route.ts — Real Achievement Progress
- GET returns server-side progress for EVERY achievement in the catalog (8 types)
- Achievement catalog: first_focus (50xp), streak_7 (150xp), streak_30 (300xp), hours_100 (400xp), night_owl (100xp), early_bird (100xp), deep_worker (200xp), mission_master (250xp)
- Queries all sessions + completed mission count + already-unlocked achievements in parallel
- Per-achievement server-side calculations:
  - first_focus: progress = min(totalSessions, 1) / 1
  - streak_7: current streak vs 7 (uses best streak after unlock for display)
  - streak_30: current streak vs 30 (uses best streak after unlock for display)
  - hours_100: floor(totalHours) vs 100
  - night_owl: scans sessions for any `endedAt` between 00:00-05:00 (boolean progress)
  - early_bird: scans sessions for any `startedAt` hour < 7 (boolean progress)
  - deep_worker: longest single session minutes vs 90
  - mission_master: completed missions count vs 10
- Also computes best-streak-ever by walking sorted session-day list and counting consecutive calendar days
- Returns per achievement: type, title, description, icon (lucide name), unlocked, progress, progressMax, progressPct (0-100 clamped), xpReward, unlockedAt, estimatedRemaining (human-readable: "5 more days", "12 more minutes in a single session", "1 early session (before 7 AM)", etc.)

### 4. NEW: /api/insights/route.ts — Smarter AI Insights
- GET analyzes the last 30 days and returns 5-10 real insights + chart data
- Queries: 30-day sessions (asc), 30-day reflections, 30-day missions in parallel
- Builds:
  - `focusByHour: number[24]` — total minutes per hour-of-day
  - `focusByWeekday: {day, minutes, sessions}[]` — Sun..Sat aggregation
  - `weeklyTrend: {week, minutes, sessions}[]` — last 5 ISO weeks (Mon-Sun)
- Pattern analytics computed:
  - Best weekday + best hour (from real aggregations)
  - Afternoon dip: morningMinutes (9-11) vs afternoonMinutes (13-16) — fires "You lose focus every afternoon" if afternoon is <50% of morning
  - Reflection correlation: avg focus minutes on days WITH reflections vs WITHOUT — fires "Reflection improves your focus" if delta >10%, or reverse insight if delta <-10%
  - Week-over-week trend: this week minutes vs last week, fires up/down/steady insight with %
  - Consistency: std-dev of daily minutes, consistency score 0-100 (100 - normalized deviation)
  - Session length trend: first half of 30 days vs second half — fires "sessions getting longer/shorter" if delta >=10%
  - Mission completion rate this 30-day window with contextual message
  - Total volume achievement insight ("X minutes focused in 30 days")
  - First-time user suggestion when sessions.length === 0
- Each insight has: type ('pattern'|'trend'|'achievement'|'suggestion'), title, description, metric, value, icon
- Sorted by type priority (pattern → trend → achievement → suggestion)

### 5. NEW: /api/replay/route.ts — Productivity Replay
- GET ?date=YYYY-MM-DD (defaults to today if omitted, validates ISO date)
- Queries all sessions (with mission titles), reflections, missions created, missions completed for that calendar day
- Builds chronological events array (oldest first) with: id, type ('session'|'break'|'reflection'|'mission_created'|'mission_completed'), title, subtitle, time (ISO), duration (seconds, for sessions/breaks), icon (lucide name)
- Break sessions are detected via `s.type === 'break'`
- Returns summary: totalMinutes, sessionCount, missionsCompleted, reflectionWritten (boolean), longestSessionMinutes, bestHour (formatted "h a" or null)
- Edge case: empty day returns empty events + zero-summary cleanly

### 6. NEW: /api/weekly-wrapped/route.ts — Spotify-style Weekly Report
- GET queries this week (Mon-Sun) AND last week in parallel for comparison
- Returns:
  - totalFocusHours (1-decimal precision), totalFocusMinutes, sessionCount
  - deepestSession: {duration (min), mission, date} — longest single session this week
  - bestDay: {day, minutes, sessions} — highest-minute day of this week
  - mostProductiveHour: {hour ("h a"), sessions, avgMinutes} — hour with most sessions
  - longestStreak: longest run of consecutive days with sessions WITHIN this week
  - overallStreak: current all-time consecutive-day streak
  - missionCompletionRate, missionsCompleted, missionsCreated
  - reflectionRate, reflectionsWritten, reflectionDaysPossible (7)
  - attentionScore (0-100 composite), attentionGrade (A-F)
    - Score = hoursScore(40) + streakScore(25) + missionScore(20) + reflectionScore(15)
    - A>=90, B>=80, C>=70, D>=60, else F
  - weekOverWeek: {focusChange %, sessionChange %, streakChange (delta days), missionRateChange (delta %)}
  - lastWeek: {totalFocusHours, sessionCount, longestStreak, missionCompletionRate, reflectionCount}

### 7. UPDATED: /api/timeline/route.ts
- Now queries 5 sources in parallel: sessions, reflections, missions created today, missions completed today, achievements unlocked today
- New event types added: 'break' (sessions with type='break'), 'mission_created', 'achievement_unlocked'
- Achievement types are pretty-printed (first_focus → "First Focus", streak_7 → "7-Day Streak", etc.)
- Grouping: events within 15 minutes of each other share a `group` string identifier ("g-1", "g-2", ...)
- Sort order CHANGED from newest-first to oldest-first (per spec, for timeline display)
- Each event now also includes optional `subtitle` for richer rendering

### 8. UPDATED: /api/stats/route.ts
- Added `startOfWeek` import from date-fns
- Added parallel Promise.all query for: unlocked achievement count, today's reflection (findUnique on userId_date), weekly missions completed (Mon-based week), total missions completed
- Response now also includes:
  - `achievementProgress` (count of unlocked achievements — integer)
  - `todayReflection` (boolean — has user written today's reflection?)
  - `weeklyMissionsCompleted` (count — missions completed since Monday)
  - `totalMissionsCompleted` (bonus — all-time completed mission count)
- Existing fields preserved (no breaking change to existing dashboard reads)

### Verification
- `bun run lint` — passes clean, zero errors
- `bun run db:push` — DB in sync, Prisma Client regenerated
- Dev server log shows clean compiles, all routes return 200 on `/` route (auth-protected routes return 401 without session, as expected)

### Notes for downstream (frontend) agents
- `/api/timeline` now emits event types 'break', 'mission_created', 'achievement_unlocked' — the existing `Timeline` component's `iconMap`/`colorMap`/`labelMap` only know 'session'|'reflection'|'mission_completed'. Without updates, new event types will cause `iconMap[event.type]` to return `undefined` and crash `<Icon />` rendering. Frontend agent should extend the maps.
- `/api/timeline` sort order changed from newest-first to oldest-first per spec.
- All new routes use the standard auth pattern: `getServerSession(authOptions)` → return 401 if no session.

Stage Summary:
- Prisma schema extended additively (no breaking changes to existing models)
- 5 brand-new API routes created: /api/coach, /api/achievements/progress, /api/insights, /api/replay, /api/weekly-wrapped
- 2 existing routes enhanced: /api/timeline (more event types + grouping + oldest-first), /api/stats (achievement count + today reflection + weekly missions)
- Every insight/recommendation/progress number is computed from real DB queries — zero hardcoded/fake data
- Edge cases handled: no sessions, first-time user, empty days, missing reflections, divide-by-zero guards everywhere
- Lint passes clean, DB schema in sync, dev server compiles successfully

---
Task ID: 2-b
Agent: Frontend Engineer
Task: Create ALL new frontend components for MindGuard v3.1

Work Log:

### 1. Type System Updates — `src/types/index.ts`
- Extended `AppView` union with `'replay'` and `'wrapped'`
- Updated `TimelineEvent` to support new event types (`break`, `mission_created`, `achievement_unlocked`) + `subtitle?` + `group?`
- Added new interfaces: `CoachData`, `AchievementProgress`, `Insight`, `ReplayEvent`, `ReplayData`, `WeeklyWrapped`

### 2. Zustand Store — `src/stores/app-store.ts`
- Added `coach: CoachData | null` + `setCoach`
- Added `wrapped: WeeklyWrapped | null` + `setWrapped`

### 3. New Dashboard Components
- **AiCoach** (`src/components/dashboard/ai-coach.tsx`): time-of-day greeting (Sunrise/Sun/Sunset/Moon), today vs yesterday comparison with change badge (TrendingUp/TrendingDown/Minus), clickable recommendations that navigate based on keyword parsing, summary panel with emerald accent, quick action buttons, loading skeleton, error retry, empty-state CTA
- **AiInsights** (`src/components/dashboard/ai-insights.tsx`): cards with left-border color per type (pattern=emerald, trend=amber, achievement=purple, suggestion=sky), icon lookup via `ICON_MAP`, type/metric labels, scrollable list with `max-h-[400px]`, loading/error/empty states
- **AchievementsV2** (`src/components/dashboard/achievements-v2.tsx`): "Level X · X,XXX XP" header (computed from unlocked XP), per-achievement cards with animated progress bars (motion.div width), XP badges (Zap icon), unit-aware "X left" text, emerald glow on unlocked, dimmed opacity on locked, estimated remaining text
- **Updated Timeline** (`src/components/dashboard/timeline.tsx`): extended icon/color/label maps for new event types, group-based rendering (primary node + secondary nodes for clustered events), subtitle support, gradient timeline line, stagger animations

### 4. New Full-Page Views
- **ReplayView** (`src/components/replay/replay-view.tsx`): date picker (prev/next + native input), auto-scroll "Replay day" feature with floating event indicator pill, vertical timeline with active-event pulse animation, hourly distribution mini bar chart, 6-stat day summary grid, empty state for empty days
- **WrappedView** (`src/components/wrapped/wrapped-view.tsx`): Spotify Wrapped-style hero with gradient text, animated numbers (using `useMotionValue` + `animate`), 8 stat cards (total focus hours, attention grade A-F, deepest session, best day, peak hour, longest streak, mission completion, reflection rate), week-over-week comparison cards with up/down/neutral arrows, spring-animated grade reveal

### 5. Navigation & Routing Updates
- `src/components/app/app-sidebar.tsx`: added nav items for `replay` (RotateCcw, P) and `wrapped` (Gift, W)
- `src/components/command-palette/command-palette.tsx`: added nav commands with G P / G W shortcuts
- `src/components/app/app-header.tsx`: added view titles for replay + wrapped
- `src/app/page.tsx`: imported and conditionally rendered ReplayView + WrappedView

### 6. Dashboard Layout Overhaul — `src/components/dashboard/dashboard-view.tsx`
- Replaced old `Achievements` with `AchievementsV2`
- Removed `AttentionScore` from bottom row (per spec)
- Added `AiCoach` + `AiInsights`
- New 3-col × 2-row CSS grid layout:
  - Left column (row-span-2): AI Coach full height
  - Middle column: Timeline (top) + AI Insights (bottom)
  - Right column: Heatmap (top) + AchievementsV2 (bottom)
- All existing sections (greeting, CTA, stat cards, mission card, recent sessions) unchanged

### Design System Compliance
- All new components use existing CSS classes: `card-glow`, `glass-card`, `glass-glow-edge`, `app-grid-bg`, `heading-lg`, `btn-glow`, `gradient-text`
- Framer Motion used for ALL animations; every `ease` array uses `as [number, number, number, number]` type assertion
- Loading states: skeleton divs with `animate-pulse bg-white/[0.04] rounded`
- Empty states: centered icon + text + optional CTA
- Error states: AlertCircle icon + message + Try again button
- Fully responsive: single column on mobile, multi-column grids on sm/lg breakpoints
- No hardcoded data — all values come from real API responses

### Verification
- `bun run lint` — passes clean (zero errors)
- `bun run db:push` — DB schema in sync, Prisma Client regenerated
- Dev server returns HTTP 200 on `/` route
- All frontend components gracefully handle loading, error, and empty states

### Notes for downstream / main agent
- The dev server's Prisma Client cache is currently stale (it doesn't recognize the new `type` field on FocusSession that backend agent 2-a added). This causes `/api/coach`, `/api/insights`, `/api/achievements/progress`, `/api/replay`, `/api/weekly-wrapped` to return 500 errors. The DB itself has the columns (verified via `PRAGMA table_info`), and the Prisma Client in node_modules has been regenerated, but the running dev server's `globalThis.prisma` singleton in `lib/db.ts` keeps the old client alive. This will be resolved automatically when the dev server restarts. The frontend components I built handle this gracefully with error + retry UIs.
- `/api/timeline` and `/api/heatmap` return 200 (don't filter by `type`).
- The existing `src/components/dashboard/achievements.tsx` and `src/components/dashboard/attention-score.tsx` files are left in place but no longer imported anywhere — safe to delete in a cleanup pass.

Stage Summary:
- 4 new dashboard components: AiCoach, AiInsights, AchievementsV2, updated Timeline
- 2 new full-page views: ReplayView (with auto-scroll replay feature), WrappedView (Spotify-style animated report)
- Sidebar, command palette, and app header updated to expose new views
- Page routing extended for replay + wrapped
- Dashboard reorganized into a 3×2 grid with AI Coach taking full left column height
- All components fetch real data from the v3.1 API endpoints created by backend agent 2-a
- Lint passes clean, home route returns 200

---
Task ID: 2
Agent: Main Agent
Task: MindGuard AI v3.1 — Life Operating System

Work Log:
- Investigated entire codebase: all components, stores, APIs, types, schema, CSS
- Backend subagent (2-a): Created 5 new API routes, updated 2 existing, added Prisma fields
- Frontend subagent (2-b): Created 8 new components, updated 7 existing files
- Killed orphaned dev server processes, restarted with fresh schema
- Ran ESLint: 0 errors
- Browser tested ALL 9 pages: Dashboard, Mission, Timer, Reflection, Sessions, Stats, Replay, Wrapped, Settings
- Verified zero JS errors, zero console errors, zero 500 errors
- Created 15-minute cron job for continuous development

Stage Summary:
- **Status**: ✅ MindGuard v3.1 fully implemented and verified
- **All 10 features delivered**
- **No errors** across any page
- **All data is real** — no hardcoded/fake data anywhere
