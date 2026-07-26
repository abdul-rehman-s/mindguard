# MindGuard AI v4.1 — View Component Optimization Work Record

Task ID: 5b-views
Agent: Frontend Engineer

## Files Modified (16 view components)

### 1. src/components/life/life-dashboard.tsx
- Replaced Zustand destructuring `const { setLifeData, lifeData } = useAppStore()` → individual selectors
- Replaced local AnimNum component → shared AnimatedNumber from @/components/premium/animated-number
- Replaced local EASE constant → shared fadeInUp from @/lib/animations
- Wrapped MetricCard, HourlyChart, CategoryBar, LevelRing with React.memo
- Added LifeDashboardSkeleton for loading state
- Added role="alert" + aria-live="polite" on error state
- Added aria-hidden="true" on decorative elements (icons, gradients, streak dots, SVGs)
- Added aria-live="polite" on dynamic text (metric values, chart labels)
- Added aria-label="Retry loading life dashboard" on retry button
- Added role="img" + aria-label on HourlyChart
- Responsive padding: p-4 sm:p-5, p-4 sm:p-6 on cards

### 2. src/components/mission/mission-view.tsx
- Replaced Zustand destructuring → 3 individual selectors (missions, setMissions, setView)
- Replaced local formatDuration → shared import from @/lib/utils
- Replaced local container/item variants → shared staggerContainer/staggerItem from @/lib/animations
- Added aria-hidden="true" on decorative icons (Sparkles, Flame)
- Added aria-label on icon-only buttons: "Start focus session", "Complete mission", "Edit mission", "Delete mission"
- Replaced `title` attribute → `aria-label` on action buttons
- Responsive grid already present

### 3. src/components/timer/timer-view.tsx
- Replaced Zustand destructuring → 5 individual selectors (activeMission, setActiveMission, setView, setFocusDuration, setFocusMode, focusDuration)
- Replaced local duration computation logic → shared formatDuration from @/lib/utils
- Reduced ambient particles from 20 → 12 for performance
- Added aria-hidden="true" on decorative elements (breathing dot, Target icon, outer glow, SVG)
- Added role="timer" + aria-live="polite" on duration display
- Added aria-label on Start Focus button, custom input, and preset buttons
- Fixed responsive timer ring sizing: h-48 w-48 sm:h-56 sm:w-56 md:h-64 md:w-64
- Fixed responsive outer glow: h-56 w-56 sm:h-64 sm:w-64 md:h-72 md:w-72
- Responsive text sizing: text-3xl sm:text-4xl md:text-5xl

### 4. src/components/timer/focus-mode.tsx
- Replaced Zustand destructuring → 3 selectors (setFocusMode, setLastSessionResult, activeMission)
- Reduced particles from 40 → 15 for performance
- Added role="timer" + aria-label="Focus timer" on root div
- Added aria-live="polite" on timer display and status text
- Added aria-hidden="true" on decorative elements (background, glow, particles, mission pulse dot, SVG)
- Fixed responsive timer ring: h-56 w-56 sm:h-64 sm:w-64 md:h-72 md:w-72
- Fixed responsive text: text-4xl sm:text-5xl md:text-6xl
- Added savingRef guard for race condition (completedRef + saveAndFinish double-fire)
- Added formatDuration import from @/lib/utils for toast message

### 5. src/components/timer/celebration-screen.tsx
- Replaced Zustand destructuring → 2 selectors (stats, setView)
- Reduced confetti particles from 60 → 30 for performance
- Replaced local formatDuration → shared import from @/lib/utils
- Added role="alert" + aria-live="assertive" on celebration root div
- Added aria-label="Session complete celebration"
- Added aria-hidden="true" on confetti, glow, stat icons
- Added aria-live="polite" on dynamic stat values
- Added aria-label on action buttons (Reflect, Start Another, Dashboard)
- Responsive text sizing: text-2xl sm:text-3xl on title
- Responsive padding: px-4 sm:px-5 on stat boxes

### 6. src/components/timer/mission-launch.tsx
- No Zustand usage (pure props component)
- Replaced local formatDuration helper → shared formatDurationCompact from @/lib/utils
- Added role="dialog" + aria-modal="true" + aria-label on root
- Added aria-live="assertive" on countdown display
- Added aria-label on checklist buttons (aria-pressed state)
- Added aria-live="polite" on progress status
- Added role="progressbar" with aria-valuenow/aria-valuemin/aria-valuemax on progress bar
- Fixed countdown text size for mobile: text-6xl sm:text-7xl md:text-9xl
- Fixed responsive duration header: text-3xl sm:text-4xl
- Added aria-label on Start Mission and Cancel buttons
- Added aria-hidden="true" on decorative elements

### 7. src/components/timer/audio-player.tsx
- No Zustand usage
- Added playError state for audio.play() failure with user-facing feedback
- Added aria-label on play/pause button, track expand button, mute button, track selection buttons
- Added aria-expanded on expand button
- Added role="alert" + aria-live="polite" on playback error message
- Added aria-labelledby on volume slider
- Added aria-label="Volume slider" on Slider component
- Added aria-hidden="true" on decorative elements (track icons, bouncing bars)

### 8. src/components/reflection/reflection-view.tsx
- Replaced Zustand destructuring → 2 selectors (todayReflection, setTodayReflection)
- Replaced local formatDate → shared formatDateDisplay from @/lib/utils
- Replaced local container/item variants → shared staggerContainer/staggerItem from @/lib/animations
- Wrapped StepIndicator with React.memo
- Wrapped ReflectionCard with React.memo
- Fixed double fetch on submit: use POST response data instead of separate GET refetch
- Added toast.error on fetch catch
- Added role="alert" + aria-live="polite" on error state
- Added aria-label on step indicator
- Added aria-live="polite" on char count display
- Added aria-label on textareas and submit button
- Added aria-hidden="true" on decorative icons
- Added max-h-96 overflow-y-auto on history list

### 9. src/components/sessions/session-history-view.tsx
- No Zustand store (uses local state + API)
- Replaced local formatDuration + formatDateTime → shared formatDuration + formatDateDisplay + formatTimeDisplay from @/lib/utils
- Replaced local container/item variants → shared staggerContainer/staggerItem from @/lib/animations
- Wrapped SessionRow with React.memo
- Added SessionSkeleton loading component
- Added role="alert" + aria-live="polite" on error state
- Added aria-label on retry button, filter select, pagination buttons
- Added aria-live="polite" on session count and pagination status
- Added aria-hidden="true" on decorative icons and accent bars
- Added meaningful empty state text
- Added aria-label="Pagination" on pagination nav

### 10. src/components/stats/stats-view.tsx
- Replaced Zustand destructuring → 4 individual selectors (stats, setStats, weeklyData, setWeeklyData)
- Replaced dead AnimatedNumber (just renders text) → shared AnimatedNumber from @/components/premium/animated-number
- Replaced local formatMinutes → shared formatDuration from @/lib/utils
- Replaced local container/item variants → shared staggerContainer/staggerItem from @/lib/animations
- Wrapped StatCard and MiniBarChart with React.memo
- Added StatsSkeleton loading component
- Added role="progressbar" with aria-valuenow/aria-valuemin/aria-valuemax on progress bars
- Added aria-live="polite" on dynamic values
- Added aria-hidden="true" on decorative icons
- Added role="img" + aria-label on bar chart
- Added aria-label on hourly bar items

### 11. src/components/settings/settings-view.tsx
- Replaced Zustand destructuring → 2 selectors (setUser, setView)
- Replaced local container/item variants → shared staggerContainer/staggerItem from @/lib/animations
- Added aria-label on all form inputs (email, display name, buttons)
- Added aria-hidden="true" on all decorative icons
- Added role="radiogroup" + aria-label="Theme selection" on theme buttons
- Added role="radio" + aria-checked on theme options
- Added aria-label on all buttons (Save, Export, Sign Out)
- Added aria-live="polite" on error display
- Added toast.error on fetch catch
- Responsive gaps: gap-4 sm:gap-6 on layout items

### 12. src/components/replay/replay-view.tsx
- No Zustand store (uses local state + API)
- Replaced local formatDuration/formatTime/prettyDate → shared formatDuration/formatTimeDisplay/formatDateDisplay from @/lib/utils
- Replaced local EASE → shared fadeInUp from @/lib/animations
- Wrapped EventItem, SummaryStat with React.memo
- Added refSetter callback pattern for eventRefs
- Added aria-label on event items with type, title, and time
- Added role="img" + aria-label on hourly chart
- Added role="alert" + aria-live="polite" on error state
- Added aria-label on replay buttons, date navigation
- Added aria-hidden="true" on decorative elements
- Added aria-live="polite" on replay floating status

### 13. src/components/review/daily-review.tsx
- Replaced Zustand destructuring → 3 selectors (setReviewData, reviewData, setView)
- Replaced local AnimNum → shared AnimatedNumber from @/components/premium/animated-number
- Replaced local EASE → removed (using inline transitions)
- Wrapped SectionCard, MiniStat, ReviewHourlyChart with React.memo
- Added DailyReviewSkeleton loading component
- Added role="alert" + aria-live="polite" on error state
- Added aria-hidden="true" on decorative icons, gradients, SVGs
- Added aria-live="polite" on dynamic values
- Added aria-label on buttons
- Replaced useAppStore.getState().setView → proper setView selector
- Added aria-label on mood dots
- Responsive padding: p-4 sm:p-5

### 14. src/components/wrapped/wrapped-view.tsx
- Replaced Zustand destructuring → 3 selectors (wrapped, setWrapped, setView)
- Replaced local AnimatedNumber → shared from @/components/premium/animated-number
- Replaced local EASE → removed (using inline/shared variants)
- Wrapped WoWArrow, WrappedStatCard, WrappedProgressCard, WoWCard with React.memo
- Added WrappedSkeleton loading component
- Added role="alert" + aria-live="polite" on error state
- Added role="progressbar" + aria-valuenow/aria-valuemin/aria-valuemax on progress cards
- Added aria-hidden="true" on decorative elements
- Added aria-live="polite" on dynamic values
- Replaced useAppStore.getState().setView → proper setView selector
- Added aria-label on buttons

### 15. src/components/onboarding/onboarding-flow.tsx
- No Zustand store (pure props, local state)
- Replaced local EASE → shared EASE from @/lib/animations
- Fixed responsive grid: grid-cols-1 sm:grid-cols-2 on primary use step
- Fixed responsive text: text-lg sm:text-xl, text-2xl sm:text-3xl on headings
- Fixed responsive button padding: px-5 sm:px-6 on duration buttons
- Added aria-label on all interactive buttons (Back, Continue, Launch Dashboard)
- Added aria-pressed on use/duration/checklist buttons
- Added aria-live="polite" on step counter
- Added aria-label="Onboarding setup wizard" on root div
- Added role="progressbar" + aria-valuenow on progress steps
- Added aria-hidden="true" on logo icon

### 16. src/components/landing/landing-page.tsx
- Replaced Zustand destructuring → 2 selectors (setView, setUser)
- Replaced local staggerContainer/staggerItem/sectionFade/scaleIn → shared imports from @/lib/animations
- Kept heroContainer/heroItem as custom (unique stagger timing for landing)
- Added aria-label on nav buttons (Features, Sign In)
- Added aria-label on password toggle button
- Added role="alert" + aria-live="polite" on error message

## Final Verification
- ESLint: ✅ clean (0 errors)
- Dev server: ✅ serving 200 responses
- All 16 files optimized across 7 categories (Zustand selectors, shared utilities, React.memo, accessibility, responsive, loading/error states, animation performance)
