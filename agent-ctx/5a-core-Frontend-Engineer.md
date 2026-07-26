# Task 5a-core — Frontend Engineer: Core App Shell & Dashboard Optimization

## Task Summary
Optimize 13 core app shell and dashboard components with 6 categories of changes: Zustand selectors, shared utilities, React.memo, accessibility, responsive layout, and animation performance.

## Files Modified (13 total)

| # | File | Key Changes |
|---|------|-------------|
| 1 | app-shell.tsx | ErrorBoundary wrapper, min-h-screen flex-col sticky footer |
| 2 | app-sidebar.tsx | Zustand selectors, React.memo NavButton, aria-current/aria-label, focus-visible, useCallback |
| 3 | app-header.tsx | Zustand selectors, aria-labels on icon buttons, aria-hidden on decorative |
| 4 | dashboard-view.tsx | Zustand selectors (7), shared imports (formatDuration, timeAgo, AnimatedNumber, stagger), React.memo StatCard/ActiveMissionCard, DashboardSkeleton, aria-labels |
| 5 | ai-coach.tsx | Zustand selectors, shared fadeInUp, React.memo ChangeBadge, aria-labels, aria-live |
| 6 | achievements-v2.tsx | Shared fadeInUp + AnimatedNumber, React.memo AchievementCard, aria-labels, max-h scroll |
| 7 | timeline.tsx | Shared formatTimeDisplay/formatDuration/fadeInUp, React.memo TimelineEventRow, aria-labels |
| 8 | ai-insights.tsx | Shared fadeInUp, React.memo InsightCard, aria-labels, role="alert" |
| 9 | heatmap.tsx | **365 motion.div → regular divs + CSS** (massive perf), React.memo HeatmapDayCell, sr-only summary, mobile summary toggle, aria-labels |
| 10 | notification-panel.tsx | Zustand selectors, shared timeAgo, VALID_ACTION_VIEWS validation, aria-expanded/aria-haspopup/role="menu" |
| 11 | command-palette.tsx | Zustand selectors, role="dialog"/aria-modal, focus trap, aria-label on search + items, responsive max-height |
| 12 | keyboard-shortcuts-modal.tsx | role="dialog"/aria-modal, focus trap (Tab+Escape), aria-label on close, responsive |
| 13 | cursor-glow.tsx | Conditional cursor hiding (pointer: fine + not reduced-motion), prefers-reduced-motion detection, aria-hidden |

## Removed Local Helpers
- `formatDuration` (dashboard-view.tsx) → shared from "@/lib/utils"
- `relativeTime` (dashboard-view.tsx) → `timeAgo` from "@/lib/utils"
- `AnimatedNumber` class (dashboard-view.tsx) → shared from "@/components/premium/animated-number"
- `container`/`item` variants (dashboard-view.tsx) → `staggerContainer`/`staggerItem`/`fadeInUp` from "@/lib/animations"
- `EASE` constants (ai-coach, achievements-v2, timeline, ai-insights) → shared `fadeInUp` from "@/lib/animations"
- `formatEventTime` (timeline.tsx) → `formatTimeDisplay` from "@/lib/utils"
- `formatMinutes` (timeline.tsx) → `formatDuration` from "@/lib/utils"
- `timeAgo` (notification-panel.tsx) → shared from "@/lib/utils"

## React.memo Sub-Components Added
1. NavButton (app-sidebar.tsx)
2. StatCard (dashboard-view.tsx)
3. ActiveMissionCard (dashboard-view.tsx)
4. ChangeBadge (ai-coach.tsx)
5. AchievementCard (achievements-v2.tsx)
6. TimelineEventRow (timeline.tsx)
7. InsightCard (ai-insights.tsx)
8. HeatmapDayCell (heatmap.tsx)

## Lint Result
ESLint ✅ clean (0 errors), dev server running on port 3000
