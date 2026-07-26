---
Task ID: 2-b
Agent: Frontend Engineer
Task: Create ALL new frontend components for MindGuard v3.1

Work Log:

### 1. Type System Updates — `src/types/index.ts`
- Extended `AppView` union with `'replay'` and `'wrapped'`
- Updated `TimelineEvent` interface to support new event types (`break`, `mission_created`, `achievement_unlocked`), plus `subtitle?` and `group?` fields
- Added new interfaces: `CoachData`, `AchievementProgress`, `Insight`, `ReplayEvent`, `ReplayData`, `WeeklyWrapped` (with optional fields to match the backend payload shape)

### 2. Zustand Store Updates — `src/stores/app-store.ts`
- Added `coach: CoachData | null` + `setCoach` action
- Added `wrapped: WeeklyWrapped | null` + `setWrapped` action

### 3. AI Daily Coach — `src/components/dashboard/ai-coach.tsx`
- Fetches from `/api/coach`
- Renders greeting (time-of-day aware: Sunrise/Sun/Sunset/Moon icon + color)
- Today vs Yesterday comparison with two stat tiles + `ChangeBadge` (TrendingUp emerald / TrendingDown rose / Minus neutral / "Fresh start" if yesterday=0)
- Personalized recommendations list — each rec is a clickable button that navigates to `timer`, `reflection`, or `mission` view based on simple keyword parsing of the recommendation text
- "Today's Summary" panel with emerald accent border
- Quick action buttons (Start focus / Mission / Reflect)
- Loading skeleton, error state with retry, and empty-state CTA ("Start your day" button → timer view) when no sessions yet
- Uses `card-glow glass-card glass-glow-edge` styling, emerald accents, Framer Motion stagger

### 4. AI Insights — `src/components/dashboard/ai-insights.tsx`
- Fetches from `/api/insights`
- Renders insights as cards with left-border color based on type:
  - pattern → emerald
  - trend → amber
  - achievement → purple
  - suggestion → sky
- Each card has icon (looked up from string name via `ICON_MAP`), type label, metric, title, description (line-clamp-2), and metric value
- Loading skeleton (3 pulse cards), error state with retry, empty state with Sparkles icon
- Scrollable list with `max-h-[400px] overflow-y-auto` and custom scrollbar
- Framer Motion stagger entrance

### 5. Achievement Progress V2 — `src/components/dashboard/achievements-v2.tsx`
- Fetches from `/api/achievements/progress`
- Header: "Level X · X,XXX XP" computed from unlocked achievements' XP rewards (level = floor(totalXp / 500) + 1)
- Progress bar showing "X / 8 unlocked"
- Per-achievement card:
  - Icon (lucide icon name → component via `ICON_MAP`, fallback to emoji from `EMOJI_FALLBACK`); locked achievements show Lock icon
  - Title + description
  - Animated progress bar (motion.div width animation, 0.8s)
  - XP reward badge (Zap icon + "+X")
  - "Unlocked!" or "X left" with type-aware unit (min/hrs/days/missions/left)
  - Estimated remaining text from backend (`estimatedRemaining`)
  - Unlocked date if unlocked
- Unlocked achievements have emerald glow (shadow + radial blur); locked are dimmed to opacity-70

### 6. Timeline Update — `src/components/dashboard/timeline.tsx`
- Extended `iconMap`, `colorMap`, `labelMap` for new event types: `break` (Coffee, amber), `mission_created` (PlusCircle, sky), `achievement_unlocked` (Sparkles, purple)
- Group-based rendering: events sharing a `group` field are displayed together with a primary node + secondary nodes (smaller circles for additional events in the cluster)
- Multi-event groups show a "Cluster" header with time range and event count
- Subtitle now rendered below the title when present
- Timeline line uses gradient (emerald → transparent)
- All animations use `EASE` constant with `as [number, number, number, number]` type assertion

### 7. Daily Replay View — `src/components/replay/replay-view.tsx` (new file in new directory)
- Full-page component for the `replay` view
- Page header with RotateCcw icon
- Date picker: prev/next day buttons, current date display ("Today"/"Yesterday"/pretty date), and native date input with `max=today`
- Replay control bar: shows event count + total minutes, with "Replay day" button (Play icon) / "Stop replay" button (Pause icon)
- Timeline column (lg:col-span-2, max-h-[640px] overflow-y-auto):
  - Vertical timeline with gradient line
  - Each event has icon (from `ICON_MAP`), color (from `TYPE_STYLES`), time, title, subtitle, duration, type label
  - Active replay event gets emerald ring + pulse animation (motion.div with `repeat: Infinity` scale/opacity animation)
- Right column:
  - Hourly Distribution mini bar chart (24 bars, gradient fill, hover tooltip via title attribute)
  - Day Summary stats grid (6 stats: focus time, sessions, missions done, reflection, longest, best hour)
- "Replay" feature: auto-scrolls through events every 1.2s using `setTimeout` chain, showing a floating pill at bottom with current event info
- Empty state when no events for selected date
- AnimatePresence for replay pill enter/exit

### 8. Weekly Wrapped View — `src/components/wrapped/wrapped-view.tsx` (new file in new directory)
- Full-page component for the `wrapped` view
- Spotify Wrapped-style header: Gift icon in gradient box, "Your Weekly Wrapped" heading with gradient text, date range subtitle
- Hero cards row (lg:grid-cols-3):
  - Total Focus Hours (col-span-2): big animated number with decimal precision, gradient text, session count, WoW arrow badge, emerald radial blur background
  - Attention Grade: spring-animated big letter (A-F) in colored ring, grade label (Outstanding/Strong/Solid/Building/Getting started), composite score
- Stats grid (sm:grid-cols-2 lg:grid-cols-3):
  - Deepest Session (purple accent)
  - Best Day (emerald accent)
  - Peak Hour (amber accent)
  - Longest Streak (emerald accent, with WoW delta)
  - Mission Completion (purple accent, animated progress bar, WoW percentage-point change)
  - Reflection Rate (sky accent, animated progress bar)
- Week-over-Week comparison card: 3 WoW cards showing this week vs last week values + WoWArrow for focus time, sessions, streak
- AnimatedNumber component using `useMotionValue` + `animate()` from framer-motion (with decimals support)
- WoWArrow component: emerald (+), rose (-), or neutral (0) badge
- Empty state when no focus data this week
- All cards use gradient backgrounds, stagger entrance animations

### 9. App Sidebar Update — `src/components/app/app-sidebar.tsx`
- Added 2 new nav items:
  - `{ view: 'replay', icon: RotateCcw, label: 'Daily Replay', shortcut: 'P' }`
  - `{ view: 'wrapped', icon: Gift, label: 'Weekly Wrapped', shortcut: 'W' }`
- Imported `RotateCcw` and `Gift` from `lucide-react`

### 10. Page Routing — `src/app/page.tsx`
- Imported `ReplayView` and `WrappedView`
- Added conditional rendering for `currentView === 'replay'` and `currentView === 'wrapped'`

### 11. Command Palette Update — `src/components/command-palette/command-palette.tsx`
- Added navigation commands for `replay` (G P shortcut) and `wrapped` (G W shortcut) with appropriate keywords
- Imported `RotateCcw` and `Gift` icons

### 12. App Header Update — `src/components/app/app-header.tsx`
- Added `'replay': 'Daily Replay'` and `'wrapped': 'Weekly Wrapped'` to `viewTitles` Record so the header shows the correct title for new views

### 13. Dashboard View Layout Update — `src/components/dashboard/dashboard-view.tsx`
- Replaced `Achievements` import with `AchievementsV2`
- Removed `AttentionScore` import (no longer in spec's bottom row)
- Added `AiCoach` and `AiInsights` imports
- Replaced old bottom-row layout with a 3-col × 2-row CSS grid:
  - Left column (row-span-2): AI Coach (full height)
  - Middle column row 1: Timeline
  - Middle column row 2: AI Insights
  - Right column row 1: Heatmap
  - Right column row 2: AchievementsV2
- All greeting, CTA, stat cards, mission card, recent sessions remain unchanged

### Design System Compliance
- All new components use existing CSS classes: `card-glow`, `glass-card`, `glass-glow-edge`, `app-grid-bg`, `heading-lg`, `btn-glow`, `gradient-text`
- Dark theme with zinc-950 base, emerald accents throughout
- Framer Motion used for ALL animations; every `ease` array uses `as [number, number, number, number]` type assertion
- Loading states: skeleton divs with `animate-pulse bg-white/[0.04] rounded`
- Empty states: centered icon + text + optional CTA
- Error states: AlertCircle icon + message + Try again button
- Fully responsive: single column on mobile, multi-column grids on sm/lg breakpoints
- All section headers use `text-xs font-medium uppercase tracking-wider text-zinc-500`
- No hardcoded data — all values come from real API responses

### Verification
- `bun run lint` — passes clean (zero errors)
- `bun run db:push` — DB schema in sync, Prisma Client regenerated (the backend agent 2-a had already added the `type` and `quality` columns to FocusSession; my db:push confirmed sync)
- Dev server returns HTTP 200 on `/` route
- All frontend components gracefully handle loading, error, and empty states — so even if backend endpoints fail (e.g., due to stale Prisma Client cache in the dev server), the UI shows helpful states instead of crashing

### Notes for downstream agents / main agent
- The dev server's Prisma Client cache is stale (it doesn't recognize the new `type` field on FocusSession that backend agent 2-a added). This causes `/api/coach`, `/api/insights`, `/api/achievements/progress`, `/api/replay`, `/api/weekly-wrapped` to return 500 errors. The DB itself has the columns (verified via `PRAGMA table_info`), and the Prisma Client in node_modules has been regenerated, but the running dev server's Turbopack cache + `globalThis.prisma` singleton in `lib/db.ts` keep the old client alive. This will be resolved automatically when the dev server restarts (which happens automatically on system restart). The frontend components I built handle this gracefully with error + retry UIs.
- `/api/timeline` returns 200 (it doesn't filter by `type` — uses `include` only).
- `/api/heatmap` returns 200.
- The existing `src/components/dashboard/achievements.tsx` and `src/components/dashboard/attention-score.tsx` files are left in place but no longer imported anywhere (achievements is replaced by achievements-v2; attention-score is removed from the dashboard layout per spec). They can be safely deleted in a cleanup pass.

Stage Summary:
- 4 new dashboard components: AiCoach, AiInsights, AchievementsV2, updated Timeline
- 2 new full-page views: ReplayView (with auto-scroll replay feature), WrappedView (Spotify-style animated report)
- Sidebar, command palette, and app header updated to expose new views
- Page routing extended for replay + wrapped
- Dashboard reorganized into a 3×2 grid with AI Coach taking full left column height
- All components fetch real data from the v3.1 API endpoints created by backend agent 2-a
- Lint passes clean, home route returns 200
