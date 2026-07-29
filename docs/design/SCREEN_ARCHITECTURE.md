# MindGuard — Screen Architecture

**Version:** 1.0.0
**Status:** Authoritative — Engineering Blueprint
**Last Updated:** 2025-07-19
**Author:** MindGuard Design Team  
**Classification:** Internal — Engineering & Design Reference
**Precedes:** All implementation decisions
**References:** MINDGUARD_UX_BIBLE.md, PRODUCT_REQUIREMENTS_DOCUMENT.md

---

## Preamble

### What This Document Is

This document is the **engineering blueprint** for every screen, view, modal, dialog, overlay, state, and transition in MindGuard. It exists because code alone cannot capture the *why* behind a screen's existence, the *order* of its elements, or the *feeling* it should evoke. The UX Bible defines philosophy and principles; this document defines *structure* — what exists, where it lives, how it connects, and what every pixel on every screen is supposed to accomplish.

If a screen exists in MindGuard, it is documented here. If a screen is in the codebase but not in this document, it is undocumented and should be added before any further changes. If a screen is in this document but not in the codebase, it is a planned feature and should be built according to this specification.

### Why This Exists Separate From the UX Bible

The UX Bible answers: *"What should the user feel?"* This document answers: *"What should the engineer build?"* The UX Bible says "the dashboard should feel like walking into your personal office." This document says "the dashboard has a greeting zone at the top with a time-aware greeting, an action zone in the middle with a quick-start button and AI coach card, and a reflection zone at the bottom with a heatmap and timeline — here is the exact widget ordering for each persona."

Both documents are authoritative. The UX Bible governs emotion; this document governs structure. When they conflict, update this document first, then validate against the UX Bible's principles.

### How to Read This Document

- **Section 1 (Screen Inventory)** is the exhaustive list. Read it to understand what exists.
- **Section 2 (User Flow)** is the journey map. Read it to understand how screens connect.
- **Section 3 (Navigation Architecture)** is the skeleton. Read it to understand how users move.
- **Section 4 (Screen Blueprints)** is the construction plan. Read it to build any screen correctly.

Each section cross-references the UX Bible. Principles are cited by section number (e.g., "UX Bible §2 — Progressive Disclosure").

---

## Section 1: Complete Screen Inventory

### 1.1 Inventory Philosophy

MindGuard is a single-page application with client-side routing. Every screen is an `AppView` value in the Zustand store, rendered inside an `AppShell` with sidebar + header. Some screens exist outside the shell (landing, onboarding, focus mode). Modals and overlays float above the shell.

The inventory is organized by **lifecycle stage**: screens the user encounters before they trust MindGuard, screens they use daily, screens they visit occasionally, and screens that exist for edge cases and system states.

### 1.2 Pre-Trust Screens (Before Authentication)

#### 1.2.1 Landing Page (`AppView: "landing"`)

**Purpose:** The first thing any human sees. Converts skepticism into curiosity. (UX Bible §10)

**What it contains:**
- Hero section: gradient headline "Your AI Productivity Coach", subtitle, CTA "Get Started Free", secondary CTA "See how it works", MindGuardHeroLogo (96px, pulse-glow animation)
- Authentication form: integrated into hero, smooth toggle between sign-up and sign-in states
- Social proof section: 6 testimonial cards with avatar, quote, name, role, rating, metric
- "How It Works" section: 3-step explanation
- Feature grid: 6 feature cards (Mission System, Deep Focus Timer, Daily Reflection, AI Coach, Activity Tracker, Session Analytics)
- Privacy section: trust signals ("Your data stays on your device", etc.)
- Pricing section: 3 tiers (Free $0, Pro $12/mo, Team Contact us)
- FAQ section: accordion with common questions
- Final CTA section: "Ready to meet your coach?"
- Footer: logo, links, copyright

**Rendering context:** Outside AppShell. Full-page. `bg-zinc-950` background with subtle emerald glow effects. No sidebar, no header. Lazy-loaded (`dynamic import, ssr: false`).

**Authentication sub-states within Landing:**

**Sign-Up State:**
- Fields: Email, Password, Confirm Password
- Google OAuth button
- GitHub OAuth button (planned)
- Small link: "Already have an account? Sign in"
- Validation: real-time email validation on blur, password minimum 8 characters validated on submit
- Error messages: human-readable ("That email doesn't look right"), not technical
- On submit: account created → onboarding (if `onboarded: false`) or dashboard (if `onboarded: true`)
- Loading state: spinner replaces button text

**Sign-In State:**
- Fields: Email, Password
- Google OAuth button
- GitHub OAuth button (planned)
- "Forgot password?" link (opens password reset modal)
- Small link: "Don't have an account? Sign up"
- On submit: authenticated → onboarding or dashboard
- Error: "That email or password doesn't match our records" (vague for security)

**Password Reset Modal:**
- Overlay triggered from "Forgot password?" link
- Fields: Email
- On submit: sends reset email, shows confirmation "Check your email"
- CTA: "Back to sign in"
- This is a modal overlay on the landing page, not a separate route

#### 1.2.2 Loading / Splash Screen

**Purpose:** Shows while session status is being determined (`status === 'loading'`).

**What it contains:**
- Full-screen `bg-zinc-950` centered layout
- MindGuardSplashLogo (56px logo + "MindGuard AI" text + "Protect Your Attention" tagline)
- Spinner (Loader2, 4px, `text-zinc-500`, `animate-spin`)

**Rendering context:** Outside AppShell. Full-page. No sidebar, no header. Shown before any routing decisions.

**Duration:** Typically <2 seconds. Must not feel like a wait — the logo animation provides visual continuity.

#### 1.2.3 OAuth Redirect Interstitial (Implicit)

**Purpose:** The brief state when Google/GitHub OAuth redirects back to MindGuard before session is established.

**What it contains:** Same splash screen as 1.2.2. The user should never perceive this as a separate state — it's the same loading screen, just lasting slightly longer during OAuth callback processing.

### 1.3 Trust-Building Screens (Onboarding)

#### 1.3.1 Onboarding Flow (`OnboardingFlow` component)

**Purpose:** Learn the user before teaching them. 11 screens (current) → 8 screens (target per UX Bible §13). This is discovery, not configuration.

**Rendering context:** Outside AppShell. Full-page. `bg-zinc-950` with emerald glow orbs. No sidebar, no header. Max-width `max-w-xl`. Lazy-loaded.

**Common layout elements across all steps:**
- MindGuardLogo (size "md", showText true) — centered at top
- Progress bar: 11 segments (current) → 8 segments (target), `h-1` bars with gradient fill `from-emerald-500 to-teal-400`
- Contextual progress message: animated per step (e.g., "Discovering your interests...")
- Step counter: `{step + 1}/{TOTAL_STEPS}` in `text-[11px] text-zinc-600`
- Steps container: `min-h-[340px] sm:min-h-[380px]`, `AnimatePresence mode="wait"` with direction-aware transitions
- Navigation: Back button (left, ghost variant, `ChevronLeft` icon), Continue/Launch button (right, emerald gradient, `ChevronRight` icon)
- Skip button: visible on steps 2 (Role) and 9 (Permissions) — optional steps

**Step-by-step inventory:**

| Step | Label | Component | Validation | Data Collected | UX Bible Target |
|------|-------|-----------|------------|----------------|-----------------|
| 0 | Welcome | WelcomeStep | Always proceed | None | Screen 1: Welcome |
| 1 | Interests | ImproveStep | `selectedImprovements.length > 0` | `primaryUse`, `otherImproveText` | Screen 2: Aspirations |
| 2 | Role | RoleStep | `selectedRole.length > 0` (skippable) | `role` | Merged into Screen 2 |
| 3 | Schedule | ScheduleStep | `scheduleType.length > 0` | `scheduleType`, `sleepRange` → derived `chronotype`, `workSchedule` | Screen 3: Schedule |
| 4 | Focus Style | FocusStyleStep | `focusDurationComfort + workStylePreference` | `hasAdhd`, `focusDurationComfort`, `workStylePreference` → derived `focusStyle`, `pomodoroPreference`, `deepWorkDuration`, `preferredSchedule`, `focusGoalMinutes` | Screen 4: Focus Style |
| 5 | Motivation | MotivationStep | `coachPersonality + motivationStyle` | `coachPersonality`, `motivationStyle` | Screen 5: Coach (motivation inferred) |
| 6 | Distractions | DistractionStep | `selectedDistractions.length > 0` | `selectedDistractions`, `distractionRanking` → derived `biggestDistraction`, `distractionsList` | Screen 6: Distractions |
| 7 | Goals | GoalsStep | `selectedGoals.length > 0` | `selectedGoals`, `focusGoalMinutes` | Merged into Screen 4 |
| 8 | Privacy | PrivacyStep | Always proceed | None | Merged into Screen 7 |
| 9 | Permissions | PermissionsStep | Always proceed (skippable) | `permissions` (desktop, notifications, accessibility) | Merged into Screen 7 |
| 10 | Finish | FinishStep | Always proceed | `firstMission` (auto-generated) | Screen 8: Finish |

**Step 0 — Welcome Screen:**
- Headline: "Let's build your personal productivity coach." (gradient text on "productivity coach")
- Subtitle: "MindGuard learns how you work..."
- Privacy commitment: "About 2 minutes. Everything stays private."
- Personalization preview card showing what gets personalized
- CTA: "Let's Begin" (emerald gradient)

**Step 1 — Interests/Improve:**
- Headline: emotional, not functional
- Multi-select grid (max 3): 14+ options with Lucide icons
- "Other" option reveals textarea
- Selected items show spring-animated check badge
- When max reached, unselected items dim

**Step 2 — Role:**
- Single-select role cards
- Skippable (role can be inferred from aspirations)
- Options: developer, designer, student, freelancer, founder, medical_student, competitive_exam, teacher, other

**Step 3 — Schedule:**
- Schedule type: 4-option 2×2 grid (Morning Person, Night Owl, Flexible, Changes Frequently)
- Sleep range: 5-option horizontal list (Before midnight, 12–2 AM, 2–4 AM, After 4 AM, It varies)

**Step 4 — Focus Style:**
- ADHD toggle: prominent at top with Brain icon
- Focus duration: 6-option grid (15min, 30min, 45min, about_an_hour, 90_plus, it_depends)
- Work style: 3-option row (Short Focused Sprints, Deep Uninterrupted, Mix of Both)

**Step 5 — Motivation/Coach:**
- Coach personality: 3 full-width cards (Accountability/strict, Supportive/friendly, Data-Driven/data_nerd)
- Each card has preview quote
- Motivation style: sub-selection per coach type

**Step 6 — Distractions:**
- Multi-select distraction grid (22 items with brand icons)
- Tap-to-rank top 3 (current implementation)
- Ranked items show numbered badge (#1, #2, #3)

**Step 7 — Goals:**
- Multi-select goal options (max 3)
- Focus goal slider (current) → smart-default calculation (target per UX Bible)
- Options: deep_work, screen_time, habits, career_growth, productivity, mental_clarity, creative_projects, consistency, reduce_distractions, improve_score

**Step 8 — Privacy:**
- Read-only privacy information
- Shield icon + privacy bullet points
- "Everything stays private" messaging
- Always proceed

**Step 9 — Permissions:**
- 3 permission toggles (desktop, notifications, accessibility)
- Each has icon, label, "Optional" badge, description
- Skippable

**Step 10 — Finish:**
- Celebration: "Your MindGuard is ready!" (gradient text)
- Personalized summary card with profile, schedule, focus style, coach, goals
- Auto-generated first mission
- ADHD badge if applicable
- CTA: "Launch Dashboard" (emerald gradient)
- Saving state: spinner + "Setting up..." text

**Onboarding Data Flow:**
All data collected across steps 1–9 is held in local state until step 10, then submitted as a single `POST /api/onboarding` with the complete payload. On success: `onComplete()` callback → `setView('dashboard')`. On 401: automatic retry after 1-second delay. On other errors: toast notification.

### 1.4 Daily Screens (Inside AppShell)

These screens live inside the `AppShell` component, which provides:
- `AppSidebar` (fixed left, collapsible)
- `AppHeader` (sticky top, view title + notification panel + profile menu)
- `CommandPalette` (overlay, ⌘K/Ctrl+K triggered)
- `ErrorBoundary` wrapping content

All daily screens are lazy-loaded (`dynamic import, ssr: false`) and rendered with `AnimatePresence mode="wait"` for smooth view transitions (`initial: opacity 0, y 8 → animate: opacity 1, y 0 → exit: opacity 0, duration: 0.15, ease: [0.4, 0, 0.2, 1]`).

Content area: `mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8`.

#### 1.4.1 Dashboard (`AppView: "dashboard"`)

**Purpose:** The user's personal office. Everything is where they left it. The coach has a message. (UX Bible §14)

**What it contains — Three Zones:**

**Zone 1: Greeting Zone (top)**
- Time-aware, name-aware greeting: `getPersonalizedGreeting()` from personalization engine
  - Morning (5–12): "Good morning, {name}" / Night owl morning: "Just winding down, {name}?"
  - Afternoon (12–17): "Good afternoon, {name}"
  - Evening (17–21): "Good evening, {name}"
  - Night (21–5): "Burning the midnight oil" / Night owl: "Ready for your night session, {name}?"
- Personalized motivational message: priority-ordered logic
  1. Goal achieved → celebration
  2. Streak ≥ 7 → streak encouragement  
  3. Goal ≥ 50% → halfway push
  4. Primary use-specific (Coding: "Time to write great code", Studying: "Deep learning starts with deep focus", etc.)
  5. Mission-based ("Focus on '{missionTitle}'")
  6. Time-based fallback
- Time-of-day icon: Sun/SunDim/Moon with gradient background
- Coach tip card: distraction-aware, score-aware, streak-aware, goal-aware, use-specific

**Zone 2: Action Zone (middle)**
- Quick-start focus button: "Start a Focus Session" → navigates to timer view or launches focus mode
- Active mission display with session count and progress
- AI Coach widget (`AiCoach`): 3 tabs (Briefing, Chat, Insights)
  - Briefing tab: greeting, key stats (today/yesterday minutes, streak, missions, reflections), change badges, AI briefing text, recommendations with action buttons
  - Chat tab: message input, AI conversation, contextual coaching
  - Insights tab: `AiInsights` — pattern/trend/achievement/suggestion cards
- Focus block suggestions: personalized based on `bestFocusHours` and `workSchedule`
  - Each suggestion shows label, time, hour, and "Start" button

**Zone 3: Reflection Zone (bottom)**
- Activity Heatmap (`Heatmap`): 90-day GitHub-style grid with emerald intensity scale
  - Color scale: 0m = `bg-white/[0.03]`, <15m = `bg-emerald-500/20`, <30m = `bg-emerald-500/35`, <60m = `bg-emerald-500/50`, <120m = `bg-emerald-500/65`, ≥120m = `bg-emerald-500/80`
  - Habit completion overlay: amber dots for days with habit completions
  - Tooltip on hover showing date, minutes, sessions, mission
  - "Show full map" toggle for expanded view
- Session Stats: today minutes, weekly minutes, total minutes, today sessions, avg session length, best day
- Focus Score: smart composite score with color indicator and trend vs yesterday
- Timeline (`Timeline`): today's activity in chronological order
  - Event types: session, reflection, mission_completed, break, mission_created, achievement_unlocked
  - Color-coded: emerald (session), amber (reflection/break), purple (mission_completed/achievement), sky (mission_created)
  - Group consecutive events of same type
- Achievements (`AchievementsV2`): categorized progress view
  - 4 categories: Focus (Brain), Consistency (Flame), Reflection (Sunrise), Milestones (Trophy)
  - Each achievement: icon/emoji, title, description, progress bar with percentage, XP reward, estimated remaining time
  - Unlocked: emerald glow border + shadow
  - Locked: dimmed, `opacity-70 hover:opacity-90`
- Habit Tracker widget: mini-view of today's habits with completion circles

**Dashboard State Transitions (UX Bible §14):**

| State | What the dashboard shows |
|-------|--------------------------|
| First visit (new user) | Welcome greeting, first mission (auto-created from onboarding), quick-start prominently, AI coach "Welcome!" briefing |
| Daily active | Greeting, progress, AI coach insights, active mission, heatmap filling |
| Goal achieved | Celebration emphasis in greeting, "Goal achieved!" in coach, achievement check |
| Returning after absence | "Welcome back" — no guilt, no shame, gentle "Let's restart your streak" |
| No data yet | Empty states with encouraging copy, "Start your first session" CTA in each widget |

**Widget ordering per persona (UX Bible §15):**

| Primary Use | Priority Widgets |
|-------------|-----------------|
| studying | heatmap, session-stats, quick-start, streak, focus-score |
| coding | timeline, achievements, quick-start, streak, focus-score |
| writing | session-stats, distraction-log, quick-start, streak, focus-score |
| creative | achievements, timeline, quick-start, streak, focus-score |
| work/business | heatmap, timeline, quick-start, streak, focus-score |
| general | heatmap, session-stats, quick-start, streak, focus-score |

**Empty states for dashboard widgets:**

| Widget | Empty State Message | CTA |
|--------|--------------------|-----|
| Heatmap | "Your heatmap will fill as you complete sessions" | "Start first session" |
| Session Stats | "No sessions yet — start your first focus session" | "Start session" |
| Focus Score | "Complete a session to see your focus score" | "Start session" |
| Timeline | "Your timeline starts with your first session" | "Start session" |
| Achievements | "Your first achievement awaits — complete a session" | "Start session" |
| AI Coach | "Meet your coach after your first session" | "Start session" |
| Habit Tracker | "Add your first habit to start tracking" | "Add habit" |

#### 1.4.2 Life Dashboard (`AppView: "life"`)

**Purpose:** The long-term view. Shows how the user's entire digital life maps to productive vs. distracted time. Requires desktop agent connection.

**What it contains:**
- Tracker status banner: connected (emerald bg) or disconnected (white bg) with current app/website display
- Metric cards grid:
  - Total laptop minutes, productive minutes, distracted minutes, idle minutes
  - Deep work minutes, focus sessions count
  - Screen time minutes, mission completion rate
  - Attention score (0–100 composite), XP, Level
  - Current streak, today focus minutes, weekly focus minutes
  - Each card: icon, label, animated number, unit, sub-text, optional progress bar
- Hourly distribution chart: bar chart showing focus minutes per hour
- Category breakdown: colored segments showing productive vs. distracted categories
- Recent activity list: last 5 activities with type, title, time, duration
- Desktop agent connection status: connected (emerald dot + current app) or disconnected ( WifiOff icon)

**State variations:**
- Connected: full data display with real-time tracker status
- Disconnected: banner shows "Connect your desktop agent" with pairing instructions
- No data: empty metrics with "Start tracking to see your digital life dashboard"

#### 1.4.3 Mission View (`AppView: "mission"`)

**Purpose:** Manage focus missions — the "one thing" paradigm. Active, create, completed states.

**What it contains:**
- Header: "Missions" title with Target icon
- Active mission card: prominently displayed with title, description, priority badge, session count, completion CTA
- Mission templates: 5 quick-create templates (Deep Work Sprint, Study Session, Code Review, Creative Brainstorm, Project Launch)
- Create mission button → opens Mission Create Dialog
- Completed missions section: collapsed by default, shows list with completion dates
- Empty state: "No active mission — create one to start focusing" with "Create Mission" CTA

**Mission Create/Edit Dialog (`Dialog` component):**
- Fields: Title (required, Input), Description (optional, Textarea), Priority (Select: low/medium/high)
- Submit label: "Create Mission" (new) or "Save Changes" (edit)
- Cancel button
- Loading state: spinner on submit button
- Pre-filled values when editing

**Mission Delete Confirmation (`AlertDialog` component):**
- Title: "Delete this mission?"
- Description: "This will permanently remove '{missionTitle}' and cannot be undone."
- Cancel: "Keep it"
- Confirm: "Delete" (red/destructive style)
- Only for active missions, not completed ones

#### 1.4.4 Focus Timer (`AppView: "timer"`)

**Purpose:** Configure and launch a focus session. The gateway to Focus Mode.

**What it contains:**
- Duration selection: 5 preset buttons (15min, 25min, 45min, 60min, 90min) + custom input
- Custom duration input: revealed by "Custom" toggle, numeric Input for minutes
- Mission selector: dropdown showing active missions, or "Free Focus" option
- Quick-start buttons for each preset
- Start button: "Start Focus" (emerald gradient) → sets `focusDuration` and `focusMode: 'launch'`
- Ambient particles: 12 emerald floating dots (decorative, `pointer-events: none`)
- MissionLaunch sub-component: quick mission assignment interface

**State variations:**
- No active mission: shows "Free Focus" as default, suggests creating a mission
- Active mission: pre-selected in dropdown
- Custom duration: input field visible, preset buttons dimmed

#### 1.4.5 Focus Mode (`FocusModeState: "focus"`)

**Purpose:** The immersive focus experience. Full-screen takeover. No sidebar, no header. The entire screen belongs to focus.

**What it contains:**
- Full-screen `bg-zinc-950` background
- Ambient particles: 15 emerald dots with gentle floating animation
- Timer display: large centered `formatTime(remaining)` with `text-zinc-100 font-bold`
  - Format: `MM:SS` for sessions < 1 hour, `H:MM:SS` for sessions ≥ 1 hour
- Progress ring/bar: circular or linear progress indicator showing elapsed vs. total
- Mission title: displayed above timer if mission is assigned
- Pause/Resume button: `Pause` icon when running, `Play` icon when paused
- Abandon button: `Square` icon → exits with confirmation
- Audio player: ambient sound controls (rain, classical, deep_focus, none)
- Wall-clock timing: uses `Date.now()` refs to prevent timer drift (not interval counting)

**State transitions within Focus Mode:**

| State | What it shows | Transition trigger |
|-------|---------------|--------------------|
| `idle` | Not shown — user is on timer view | User clicks "Start Focus" |
| `launch` | Brief countdown animation (3 seconds) | Automatic after start |
| `countdown` | Timer begins counting down from `focusDuration` | After launch animation |
| `focus` | Active timer with pause/resume controls | Running state |
| `celebration` | Celebration screen overlay | Timer reaches 0:00 |

**Focus Mode exit paths:**
1. **Complete session:** Timer reaches 0 → celebration screen → `POST /api/sessions` → return to dashboard
2. **Pause and resume:** Toggle pause state, wall-clock tracks paused duration
3. **Abandon session:** Click abandon → confirmation dialog → `POST /api/sessions` with partial duration → return to dashboard
4. **Emergency exit:** Escape key → abandon with no confirmation (saves partial session)

#### 1.4.6 Celebration Screen (Sub-component of Focus Mode)

**Purpose:** Reward completion. Not gamification — genuine acknowledgment of effort. (UX Bible §28)

**What it contains:**
- Full celebration overlay with confetti-like particles
- Duration display: "You focused for {duration}!"
- Mission display: if mission was assigned
- XP gain notification
- Achievement check: if new achievement unlocked, shows unlock animation
- CTA: "Continue to Dashboard" (emerald gradient)
- Skip: auto-continue after 5 seconds if `showCelebration` setting is true

**Can be disabled:** `showCelebration` toggle in Settings → Focus section. When disabled, session completion goes directly to dashboard with a brief toast notification instead.

#### 1.4.7 Daily Reflection (`AppView: "reflection"`)

**Purpose:** End each day with intentional reflection. The three questions that compound improvement. (UX Bible §9 — Reflection)

**What it contains:**
- Header: "Daily Reflection" with BookOpen icon
- 3-question stepper interface:
  1. "What distracted you today?" (BrainCircuit icon, placeholder: "Social media, notifications...")
  2. "What went well today?" (Sparkles icon, placeholder: "Completed a deep focus session...")
  3. "Tomorrow's ONE mission?" (ArrowRight icon, placeholder: "Finish the project proposal...")
- Step indicator: 3 icon circles with connecting lines, active step highlighted in emerald
- Textarea per question: max 500 characters, character counter
- Optional mood/energy rating (collapsible section)
- Previous reflection display: if reflection exists for today, shows saved answers with edit option
- Save button: "Save Reflection" (emerald gradient)
- Back button: navigate between questions

**State variations:**
- New reflection (no existing): blank textareas, stepper starts at question 1
- Existing reflection (already saved today): displays saved answers with "Edit" option
- Empty state (no reflections ever): "Your first reflection — let's capture today's insights"

#### 1.4.8 AI Assistant (`AppView: "assistant"` — planned, not currently in AppView types)

**Purpose:** Full AI conversation interface with 7 specialized tabs. The AI operating system for focus.

**What it contains (7 tabs):**

| Tab | Component | Icon | Purpose |
|-----|-----------|------|---------|
| Chat | ChatPanel | MessageSquare | Free-form AI conversation |
| Morning Plan | MorningPlanPanel | Sunrise | AI-generated daily focus plan |
| Evening Review | EveningReviewPanel | Sunset | AI analysis of the day's performance |
| Predictions | PredictionsPanel | TrendingUp | AI predictions about focus patterns |
| Recommendations | RecommendationsPanel | Lightbulb | AI suggestions for improvement |
| AI Timeline | AITimelinePanel | Clock | AI-enhanced timeline with commentary |
| Memories | MemoriesPanel | Brain | AI memory of past patterns and advice |

**Layout:**
- Header: Bot icon in emerald gradient container, "AI Assistant" title, "Your personal AI operating system" subtitle
- Tab navigation: horizontal scrollable tab bar with icons + labels
  - Mobile: shows only first word of label (e.g., "Morning" instead of "Morning Plan")
  - Desktop: shows full label
  - Active tab: `bg-emerald-500/[0.12] text-emerald-400 border-emerald-500/20`
  - Inactive: `text-zinc-400 hover:bg-white/[0.04]`
- Content area: `AnimatePresence mode="wait"` with directional transitions
- Each panel is a dedicated component with its own data fetching and rendering

#### 1.4.9 Daily Review (`AppView: "review"`)

**Purpose:** Comprehensive daily retrospective. Shows everything that happened today in one view.

**What it contains:**
- Header: CalendarCheck icon, "Daily Review" title, date display
- Focus summary section: total minutes, session count, longest session, avg session length, deep work sessions
- Mission summary section: completed count, created count, active count
- Reflection section: written status, mood, energy, distraction, wentWell
- Laptop summary section (if desktop connected): total, productive, distracted, idle minutes
- Distraction summary section: total distracted minutes, top distractions list, peak distraction hour
- Hourly chart: 24-hour bar chart showing focus distribution per hour, current hour highlighted in emerald gradient
- Week comparison: today vs. week average with percentage change
- XP gained, achievements unlocked
- AI recommendation: single contextual suggestion
- Timeline: chronological list of today's events with time, type, duration

**Skeleton loading state:** Animated pulse placeholders for all sections
**Error state:** "Couldn't load your daily review" with retry button
**Empty state:** "No data for this day yet — start a session to build your review"

#### 1.4.10 Session History (`AppView: "sessions"`)

**Purpose:** Browse past focus sessions. The archive of effort.

**What it contains:**
- Header: Clock icon, "Session History" title
- Pagination: page selector, total count, page numbers
- Filter controls: date range, mission filter, duration filter
- Session list: paginated rows showing:
  - Mission title (or "Free Focus") with Target icon
  - Priority badge (high: red, medium: amber, low: zinc)
  - Date and time: formatted display
  - Duration: Timer icon + formatted duration in rounded container
  - Emerald accent bar for mission-linked sessions
- Empty state: "No sessions recorded yet — your history grows with each focus session"

#### 1.4.11 Statistics (`AppView: "stats"`)

**Purpose:** Detailed analytics. Focus patterns, trends, and measurable improvement.

**What it contains:**
- Stat cards grid: total focus time, total sessions, avg session length, current streak, best streak, focus score
- Each card: icon container (emerald bg), label, animated number value, unit, sub-text, optional progress bar
- Weekly bar chart: 7-day focus visualization with hover tooltips showing exact minutes
- Trend indicators: comparison badges showing week-over-week changes
- Empty state: "Complete your first session to see statistics"

#### 1.4.12 Daily Replay (`AppView: "replay"`)

**Purpose:** Relive a day. Play through the timeline like a video — events appear one by one at accelerated speed.

**What it contains:**
- Header: RotateCcw icon, "Daily Replay" title
- Date picker: navigate between days with left/right arrows
- Play/pause controls: animated replay with events appearing chronologically
- Event timeline: same event types as dashboard timeline but animated
  - Each event: icon circle (type-colored), title, subtitle, time, duration
  - Active event: emerald ring pulse animation, `scale: 1.02`
  - Past events: slightly dimmed
- Summary panel: total minutes, session count, missions completed, reflection, longest session, best hour
- Speed control: normal / fast / ultra-fast replay speed
- Empty state: "No events to replay for this day"

#### 1.4.13 Weekly Wrapped (`AppView: "wrapped"`)

**Purpose:** Celebrate the week. A data-driven story of what the user accomplished. (UX Bible §28 — Success States)

**What it contains:**
- Header: Gift icon in emerald gradient container, "Your Weekly Wrapped" gradient text, week range date display
- **Top row hero cards:**
  - Total focus time: large animated number (4xl–6xl), hours label, session count, week-over-week change badge
  - Attention grade: letter grade (A–F) in large ring container, composite score, grade label (Outstanding/Strong/Solid/Building/Getting started)
- **Stats grid:**
  - Deepest Session, Best Day, Peak Hour, Longest Streak
  - Mission Completion Rate (with progress bar), Reflection Rate (with progress bar)
- **Week-over-Week comparison:**
  - 3 comparison cards: Focus Time, Sessions, Streak
  - Each shows this week vs. last week with change arrow
- Footer: "Generated from {N} real focus sessions this week"

**Grade styles:**

| Grade | Color | Background | Ring | Label |
|-------|-------|------------|------|-------|
| A | text-emerald-400 | from-emerald-500/15 | ring-emerald-500/30 | Outstanding |
| B | text-teal-400 | from-teal-500/15 | ring-teal-500/30 | Strong |
| C | text-amber-400 | from-amber-500/15 | ring-amber-500/30 | Solid |
| D | text-orange-400 | from-orange-500/15 | ring-orange-500/30 | Building |
| F | text-rose-400 | from-rose-500/15 | ring-rose-500/30 | Getting started |

**Empty state:** "No focus data this week" card with Sparkles icon and "Start a session" CTA

#### 1.4.14 Monthly Report (`AppView: "monthly"`)

**Purpose:** Long-term trend analysis. Month-over-month comparison.

**What it contains:**
- Header with month/year display
- Total focus hours, average daily focus
- Best day and worst day with dates
- Most productive hour
- Habit completion rate
- Mood and energy averages
- Achievement count
- Comparison section: focus change, session change, streak change, mood change vs. previous month
- Daily data chart: line/bar chart showing daily minutes over the month
- Empty state: "Complete a few sessions this month to see your report"

#### 1.4.15 Habit Tracker (`AppView: "habits"`)

**Purpose:** Track daily/weekly habits alongside focus. Habits compound with focus sessions.

**What it contains:**
- Header: "Habits" title with CheckCircle2 icon
- Habit list: each habit shows:
  - Name, icon (emoji), color, frequency (daily/weekly)
  - 7-day completion circles (colored when completed, outline when not, today highlighted)
  - Current streak count with Flame icon
  - Completion toggle: tap circle to mark today's completion
- Add habit button → opens Habit Create Dialog
- Habit Create Dialog:
  - Preset suggestions: 10 common habits (Exercise 💪, Reading 📚, Meditation 🧘, Journaling 📝, Drink Water 💧, Sleep 8h 😴, No Social Media 📵, Walk Outside 🚶, Healthy Eating 🥗, Deep Work 🧠)
  - Custom habit: name input, description textarea, frequency select, color picker
- Habit detail view (tap habit): description, streak history, completion calendar
- Delete habit: confirmation dialog
- Empty state: "No habits yet — add your first habit to start building consistency"

#### 1.4.16 Settings (`AppView: "settings"`)

**Purpose:** Calm configuration. Most users should never need to open Settings. When they do, find anything in under 30 seconds. (UX Bible §16)

**What it contains — 12 Sections:**

| Section ID | Label | Icon | Description |
|------------|-------|------|-------------|
| general | General | Settings | Language, timezone, display name |
| account | Account | User | Email (read-only), sign out, data export |
| appearance | Appearance | Palette | Theme, sidebar collapsed, compact mode |
| desktop | Desktop | Monitor | Auto-start, run in background, tracking, focus protection, mute notifications, tracker interval |
| tracking | Tracking | Target | Activity tracking toggle, exclusions list |
| privacy | Privacy | Shield | Privacy mode, share stats, public profile |
| focus | Focus | Zap | Default duration, daily goal, auto-start timer, celebration, ambient sound |
| notifications | Notifications | Bell | Desktop notifications, break reminders, mission reminders, streak milestones, achievement alerts, idle alerts, mute all |
| keyboard | Keyboard | Keyboard | View shortcuts, custom shortcuts |
| ai-coach | AI Coach | Brain | Provider, API key, model, coach personality, Ollama URL |
| advanced | Advanced | FlaskConical | Debug mode, API logs, React DevTools, clear cache, force sync, export/import settings, reset all settings |
| about | About | Info | Version, links, credits |

**Settings Search Index:** 57 searchable settings with keywords for fuzzy search. Example: searching "dark" finds the Appearance → Theme setting.

**Common setting row pattern:**
- Icon container (10×10 rounded-xl, emerald bg)
- Label + description text
- Control: toggle, select, input, slider, or button
- Default value hint (subtle, shown when value differs from default)
- Reset button (when value differs from default)

**Sub-dialogs within Settings:**
- **Keyboard Shortcuts Modal:** triggered by `?` key or keyboard section. Shows all shortcuts organized by category. Each shortcut: action name, key combination, description. Custom shortcuts: editable key bindings.
- **Delete Confirmation (Reset All Settings):** AlertDialog "Reset all settings to defaults? This cannot be undone."
- **Export Data Dialog:** triggers download of JSON data file
- **Import Settings Dialog:** file upload for JSON settings restore
- **API Key Input:** masked input with show/hide toggle (Eye/EyeOff icons)

**Design rules (UX Bible §16):**
1. Collapsible sections (each collapsed by default)
2. No nested settings (two levels maximum)
3. Descriptive labels ("Coach personality" not "coachPersonality")
4. Immediate save (no bottom "Save" button)
5. Undo affordance (toast after each change)
6. Confirmation for destructive actions
7. Defaults always visible as subtle hint

### 1.5 Overlay Screens (Above AppShell)

#### 1.5.1 Command Palette (`CommandPalette` component)

**Purpose:** The power-user's navigation hub. ⌘K/Ctrl+K opens it. Search for any view or action instantly. Inspired by Raycast/Linear command palettes.

**What it contains:**
- Triggered by: ⌘K (Mac), Ctrl+K (Windows/Linux), or Cmd+J
- Overlay: centered modal with backdrop blur
- Search input: auto-focused on open, fuzzy search across all commands
- Command list: filtered results showing icon, label, shortcut
- Two command types:
  - **Nav commands** (type: 'nav'): navigate to any AppView. 11 navigation commands matching sidebar items.
  - **Action commands** (type: 'action'): trigger an action. Currently 2: "Start Focus Timer", "Go to Missions"
- Keyboard navigation: arrow keys to select, Enter to execute, Escape to close
- Each nav command shows shortcut (e.g., "G D" for Dashboard)
- Keywords per command for fuzzy matching (e.g., Dashboard matches "home", "overview", "stats")

#### 1.5.2 Notification Panel (`NotificationPanel` component)

**Purpose:** View and act on notifications without losing context. Not a separate page — a dropdown panel from the header.

**What it contains:**
- Triggered by: Bell icon in AppHeader, with unread count badge
- Panel: dropdown from Bell icon position
- Notification list: scrollable, each item shows:
  - Type icon (mapped per type: Coffee for idle_alert, Clock for break_reminder, Target for mission_reminder, etc.)
  - Type color (amber for idle, sky for break, emerald for mission/focus/streak, purple for reflection, amber for achievement)
  - Title, body text
  - Timestamp (timeAgo format)
  - Unread indicator (bold text, dot marker)
- Actions:
  - Click notification: marks as read, navigates to relevant view (if actionUrl is valid AppView)
  - "Mark all as read" button
  - BellOff icon when no notifications
- Empty state: "No notifications yet" with BellOff icon

**Notification types:**

| Type | Icon | Color | Typical Content |
|------|------|-------|-----------------|
| idle_alert | Coffee | amber | "You've been idle for 30 minutes" |
| break_reminder | Clock | sky | "Time for a break" |
| mission_reminder | Target | emerald | "Don't forget your active mission" |
| reflection_reminder | BookOpen | purple | "Time for your daily reflection" |
| focus_celebration | Zap | emerald | "Great focus session completed!" |
| streak_milestone | Flame | orange | "7-day streak achieved!" |
| achievement_unlocked | Zap | amber | "New achievement: First Focus" |

#### 1.5.3 Keyboard Shortcuts Modal (`KeyboardShortcutsModal` component)

**Purpose:** Discover and learn all keyboard shortcuts. Triggered by `?` key or from Settings → Keyboard section.

**What it contains:**
- Modal overlay (not a full screen)
- Organized shortcut categories:
  - Navigation shortcuts (G + letter for each view)
  - Action shortcuts (start timer, create mission)
  - System shortcuts (command palette, shortcuts modal)
- Each shortcut: action name, key combination, description
- Close: Escape key or close button

#### 1.5.4 Achievement Unlock Overlay

**Purpose:** Celebrate new achievements in context. Not a separate screen — an overlay that appears during normal app use when an achievement is unlocked.

**What it contains:**
- Overlay card with spring animation (scale from 0.8 → 1)
- Achievement icon/emoji
- Achievement title and description
- XP reward display
- "View all achievements" link
- Auto-dismiss after 3 seconds, or manual dismiss
- Can be disabled per `achievementAlerts` notification setting

### 1.6 System States

#### 1.6.1 Error Pages

**Error Boundary (`ErrorBoundary` component):**
- Wraps all content in AppShell
- On error: shows fallback UI with error message, "Try again" button
- Context-specific: labeled by component context ("AppShell", "DashboardView", etc.)

**API Error States (per view):**
- Each data-fetching view has an error state
- Common pattern: AlertCircle icon, "Couldn't load [resource]" message, "Try again" button
- Views with error states: Dashboard (coach API), Daily Review, Weekly Wrapped, Session History, Stats, Life Dashboard, Replay, Habit Tracker

#### 1.6.2 Offline State

**Purpose:** Handle network disconnection gracefully. (UX Bible §27)

**What it contains:**
- Per-view offline detection (WifiOff icon in relevant widgets)
- Life Dashboard: shows "Desktop agent disconnected" banner
- Dashboard: shows WifiOff icon in desktop status widget
- Sessions/API calls: queued or cached locally, retried on reconnect
- No full-screen offline page — graceful degradation per component

#### 1.6.3 Loading States

**Purpose:** Every data-dependent view has a skeleton loading state. Never show a blank screen. (UX Bible §29)

**Skeleton pattern per view:**

| View | Skeleton Pattern |
|------|------------------|
| Dashboard | Staggered pulse placeholders for greeting, stats grid, coach card, heatmap, timeline |
| Weekly Wrapped | Centered hero placeholder, 6-cell grid placeholders, comparison card placeholders |
| Daily Review | Centered icon placeholder, 4 mini-stat placeholders, 4 section card placeholders |
| Session History | 5 session row placeholders with pulse animation |
| Stats | 6 stat card placeholders with pulse animation |
| Life Dashboard | Tracker banner placeholder, metric grid placeholders |
| Replay | Event row placeholders with staggered animation |
| Habit Tracker | Habit row placeholders with circle placeholders |

**Common skeleton styling:** `bg-white/[0.02] animate-pulse rounded-xl`

#### 1.6.4 Session Expired State

**Purpose:** Handle authentication session expiry gracefully.

**What it contains:**
- Automatic detection: 401 status from any API call
- Action: redirect to landing page via `setView('landing')`
- No modal or notification — seamless redirect
- On next API call after redirect: user sees sign-in form on landing page

#### 1.6.5 Desktop Pairing Flow

**Purpose:** Connect the desktop agent to the web app for activity tracking.

**What it contains:**
- Triggered from: Settings → Desktop section, or Life Dashboard when disconnected
- Pairing token display: QR code or short code for desktop app to scan/enter
- Pairing status: "no_pairing" | "pairing_available" | "paired"
- On pairing: device info display (device name, platform, last sync)
- Device management: list of paired devices with active/inactive status
- Sync response: delivers settings, missions, recent sessions, user profile to desktop agent

### 1.7 Complete Screen Count Summary

| Category | Count | Screens |
|----------|-------|---------|
| Pre-Trust | 3 | Landing (with auth states), Splash/Loading, OAuth Interstitial |
| Onboarding | 11 | Welcome, Interests, Role, Schedule, Focus Style, Motivation, Distractions, Goals, Privacy, Permissions, Finish |
| Daily (AppShell) | 14 | Dashboard, Life, Mission, Timer, Reflection, Assistant (7 tabs), Review, Sessions, Stats, Replay, Wrapped, Monthly, Habits, Settings |
| Overlays | 4 | Command Palette, Notification Panel, Keyboard Shortcuts Modal, Achievement Unlock |
| System States | 5 | Error pages, Offline state, Loading skeletons, Session expired, Desktop pairing |
| Focus Mode | 2 | Focus Mode (full-screen takeover), Celebration Screen |
| Modals/Dialogs | 8 | Mission Create/Edit, Mission Delete Confirmation, Password Reset, Habit Create, Delete Habit Confirmation, Reset All Settings Confirmation, Export Data, Import Settings |
| **Total** | **47** | |

---

## Section 2: Complete User Flow

### 2.1 Flow Philosophy

Every flow in MindGuard must feel like a conversation, not a process. The UX Bible's core principle (§2 — Progressive Disclosure) governs all flows: reveal complexity only when the user asks for it. Never present 5 options when 2 would suffice. Never ask for data that can be inferred.

Flows are documented with **entry points**, **decision branches**, **exit points**, and **emotional state annotations**. The emotional state matters because MindGuard is an AI coach, not a tool — every transition should feel intentional, supportive, or celebratory, never mechanical or punitive.

### 2.2 New User Flow

```
Landing Page → Sign Up → Onboarding → First Dashboard → First Focus Session
```

**Detailed path:**

1. **Landing Page (skeptical):** User arrives with skepticism ("Another productivity app?"). Sees gradient headline, shield logo, testimonials. Emotional target: curiosity + safety.

2. **"Get Started Free" click → Auth form reveals (fast):** Landing page hero smoothly reveals sign-up form. No page navigation. Fields: email, password, confirm password. Google/GitHub OAuth available.

3. **Sign Up submit (under 30 seconds):** 
   - **Success:** Account created → check `onboarded` status
     - `onboarded: false` → Onboarding flow
     - `onboarded: true` → Dashboard (edge case: existing user re-registering)
   - **Error (email taken):** "An account with that email already exists" → suggest sign-in
   - **Error (validation):** "That email doesn't look right" → inline error, no redirect
   - **Error (server):** "Something went wrong. Please try again." → stay on form

4. **Google OAuth click:**
   - Redirect to Google consent → callback → session established
   - If new user → Onboarding
   - If existing user → Dashboard (or onboarding if `onboarded: false`)
   - If OAuth fails → back to landing page with toast error

5. **Onboarding Flow (2 minutes, conversational):**
   - Step 0 (Welcome): Promise, not form. "Let's build your personal productivity coach."
   - Step 1 (Interests): Multi-select max 3. Role inferred from primary selection.
   - Step 2 (Role): Optional, skippable. Can be inferred from interests.
   - Step 3 (Schedule): Natural rhythm discovery. 4 options + sleep range.
   - Step 4 (Focus Style): ADHD toggle + duration + work style. Smart defaults calculated.
   - Step 5 (Motivation/Coach): 3 coach cards with preview quotes. Motivation inferred.
   - Step 6 (Distractions): Select + rank top 3. Tap-to-rank interface.
   - Step 7 (Goals): Multi-select max 3 + focus goal (smart-defaulted).
   - Step 8 (Privacy): Read-only. Trust building.
   - Step 9 (Permissions): Optional toggles. Skippable.
   - Step 10 (Finish): Celebration summary. "Launch Dashboard" CTA.
   - **On data submit:** `POST /api/onboarding` → on success: toast "Welcome to MindGuard!" → `setView('dashboard')` → first mission auto-created
   - **On submit failure:** toast error → stay on Finish step → retry available

6. **First Dashboard (personalized, impressed):**
   - Greeting with their name
   - First mission already created from onboarding answers
   - AI coach's first briefing
   - Quick-start button prominent
   - Empty states for data widgets with encouraging CTAs
   - Emotional target: "This is mine. I can start now."

7. **First Focus Session (action):**
   - User clicks "Start a Focus Session" from dashboard quick-start
   - `setView('timer')` → Timer view appears
   - Duration pre-selected based on onboarding focus duration preference
   - Active mission pre-linked
   - User clicks "Start Focus" → `setFocusMode('focus')` → Focus Mode takeover
   - Timer runs → completion → Celebration screen
   - `POST /api/sessions` → session saved → achievement check
   - Return to dashboard → data now populating (heatmap, stats, timeline)

### 2.3 Returning User Flow

```
App Load → Session Check → Dashboard (or Landing if unauthenticated)
```

**Detailed path:**

1. **App loads → Splash screen (1-2 seconds):** MindGuardSplashLogo + spinner
2. **Session check (`useSession`):**
   - **Authenticated + onboarded:** `setView('dashboard')` → dashboard with all data
   - **Authenticated + not onboarded:** `setView` stays at current → Onboarding flow renders
   - **Unauthenticated:** `setView('landing')` → landing page
   - **Loading:** splash screen continues
3. **Dashboard data fetches (parallel):**
   - `GET /api/dashboard` → stats, weekly data
   - `GET /api/coach` → coach data, AI briefing
   - `GET /api/missions` → active missions
   - `GET /api/timeline` → today's events
   - `GET /api/heatmap` + `GET /api/habits/entries` → heatmap with habit overlay
   - `GET /api/achievements/progress` → achievement progress
   - All fetched on dashboard mount, rendered progressively as data arrives

### 2.4 Premium User Flow (AI Coach Features)

**Premium access unlocks:**
- AI Coach full briefing (generated by AI, not just static text)
- AI Chat (conversational coaching)
- AI Morning Plan (daily focus plan generated by AI)
- AI Evening Review (AI analysis of day)
- AI Predictions (pattern predictions)
- AI Recommendations (specific suggestions)
- AI Timeline (AI commentary on events)
- AI Memories (persistent memory of past patterns)
- Advanced session analytics
- Custom focus durations beyond presets
- Export & integrations

**Flow difference from Free user:**
- Dashboard: AI Coach widget shows full AI-generated briefing instead of static tips
- AI Assistant view: all 7 tabs functional instead of upsell prompts
- Stats: deeper analytics with AI-powered trend analysis
- Settings → AI Coach: provider/model/API key configuration available
- Wrapped: AI-generated narrative summary alongside data

### 2.5 Offline User Flow

```
Dashboard → Graceful Degradation → Cached Data → Reconnect
```

**Detailed path:**

1. **Network drops:** API calls fail silently
2. **Cached data:** Last successfully fetched data remains displayed
3. **New actions:** Queued locally (session saves, reflection saves, mission creates)
4. **Visual indicators:** WifiOff icon appears in relevant widgets
5. **Life Dashboard:** Shows "Desktop agent disconnected" banner
6. **Reconnect:** Queued actions retried, fresh data fetched, WifiOff icons removed
7. **Never:** Show a full "You are offline" page. Graceful degradation per component.

### 2.6 Desktop User Flow (Desktop Agent Connected)

```
Settings → Desktop → Pair Device → Desktop App Runs → Data Syncs → Life Dashboard
```

**Detailed path:**

1. **User opens Settings → Desktop section:** sees pairing options
2. **Click "Pair a device":** generates pairing token, displays code
3. **Desktop app enters pairing code:** `POST /api/devices/pair` → device registered
4. **Desktop app begins tracking:** polls every `trackerInterval` seconds (5–120, default 30)
5. **Activity data syncs:** `POST /api/activities/batch` → desktop activities recorded
6. **Life Dashboard populates:** shows productive/distracted/idle minutes, hourly distribution, category breakdown
7. **Focus protection activates:** blocks configured apps/websites during focus sessions
8. **Desktop status visible:** TrackerBanner shows connected state with current app

### 2.7 Focus Session Flow (Complete Lifecycle)

```
Timer View → Configure → Launch → Focus Mode → (Complete | Pause | Abandon) → Celebration | Return
```

**Detailed path — Start:**

1. **User navigates to Timer view** (`setView('timer')`)
2. **Configure session:**
   - Select duration preset (15/25/45/60/90 min) or enter custom minutes
   - Select mission from dropdown (or "Free Focus")
   - `focusDuration` stored in Zustand
3. **Click "Start Focus":**
   - `setFocusDuration(selectedSeconds)` 
   - `setFocusMode('focus')`
   - Page.tsx detects `focusMode === 'focus'` → renders FocusMode component (full-screen takeover, outside AppShell)

**Detailed path — Running:**

4. **Focus Mode mounts:**
   - Wall-clock timing initialized: `sessionStartedAtRef = Date.now()`
   - Interval starts: 200ms tick updates display
   - Timer displays remaining time in large centered format
   - Pause/Resume button available
   - Abandon button available (Square icon)
   - Audio player available for ambient sounds

5. **Pause flow:**
   - Click Pause → `isPaused = true`, `pausedAtRef = Date.now()`
   - Display freezes on paused time
   - Resume button appears (Play icon)
   - Click Resume → `isPaused = false`, `totalPausedMsRef += Date.now() - pausedAtRef`
   - Interval restarts, display updates resume

6. **Complete flow (timer reaches 0):**
   - `completedRef = true`
   - Saving state activated
   - `POST /api/sessions` with: `{ missionId, duration, startedAt, endedAt }`
   - `setLastSessionResult({ duration, missionTitle })`
   - Show Celebration screen
   - Achievement check triggered
   - On celebration dismiss: `setFocusMode('idle')` → return to AppShell with dashboard

7. **Abandon flow:**
   - Click abandon → AlertDialog: "Abandon this session?"
   - Confirm: `POST /api/sessions` with partial duration
   - `setFocusMode('idle')` → return to AppShell
   - Cancel: stay in Focus Mode

**Edge cases:**

- **Browser tab hidden:** Timer continues via wall-clock refs. No drift.
- **Browser crash:** Session data lost. User sees no session recorded. Acceptable — data integrity over crash recovery complexity.
- **Mid-session achievement:** Achievement overlay appears over Focus Mode if unlocked during session.

### 2.8 Reflection Flow

```
Reflection View → Answer 3 Questions → Optional Mood/Energy → Save → Dashboard
```

**Detailed path:**

1. **Navigate to Reflection** (`setView('reflection')`)
2. **Check existing reflection:** `GET /api/reflections/today`
   - **No existing:** Show blank stepper, start at question 1
   - **Existing:** Show saved answers with "Edit" toggle
3. **Answer questions sequentially:**
   - Q1: "What distracted you today?" → textarea (max 500 chars)
   - Q2: "What went well today?" → textarea (max 500 chars)
   - Q3: "Tomorrow's ONE mission?" → textarea (max 500 chars)
   - Navigate between questions with Back/Continue buttons
4. **Optional:** Expand mood/energy rating section (1–5 scale sliders)
5. **Click "Save Reflection":**
   - `POST /api/reflections` with: `{ distraction, wentWell, tomorrowMission, mood?, energy? }`
   - Success: toast "Reflection saved" → `setView('dashboard')`
   - Error: toast error → stay on reflection view
6. **Dashboard update:** Reflection widget shows "✓ Reflection written today"

### 2.9 Achievement Unlock Flow

```
[Anywhere in app] → Achievement Condition Met → Unlock Overlay → View Details → Dashboard/Achievements View
```

**Detailed path:**

1. **Achievement condition met** (e.g., first session completed, 7-day streak reached)
2. **Backend creates achievement:** `Achievement` record in database
3. **Next data fetch reveals new achievement:**
   - Dashboard: AchievementsV2 widget shows newly unlocked card
   - If `achievementAlerts` setting is on: Achievement Unlock Overlay appears
4. **Overlay animation:** spring scale from 0.8 → 1, icon/emoji, title, description, XP reward
5. **Auto-dismiss after 3 seconds** or manual close
6. **"View all achievements" link:** `setView('dashboard')` → achievements section, or dedicated achievements page (planned)

### 2.10 Weekly Wrapped Flow

```
Sidebar/Command Palette → Wrapped View → Data Load → Review → Return
```

**Detailed path:**

1. **Navigate to Wrapped** (`setView('wrapped')`)
2. **Data fetch:** `GET /api/weekly-wrapped`
   - Loading: WrappedSkeleton displayed
   - Success: full wrapped view rendered
   - Error: "Couldn't load your weekly wrapped" with retry button
   - Empty (no sessions this week): empty state card with "Start a session" CTA
3. **Review experience:**
   - Scroll through hero cards, stats grid, WoW comparison
   - Each section animates in with staggered delays (0.1s–0.8s)
   - Attention grade animates with spring entrance (scale from 0, rotate -20 → 1, 0)
4. **Return:** Navigate to any other view via sidebar or command palette

### 2.11 Daily Review Flow

```
Sidebar/Command Palette → Review View → Date Selection → Data Load → Review → Return
```

**Detailed path:**

1. **Navigate to Review** (`setView('review')`)
2. **Data fetch:** `GET /api/daily-review` (defaults to today)
3. **Date navigation:** left/right arrows to view previous days
4. **Review experience:** scroll through focus summary, mission summary, reflection, distraction summary, hourly chart, timeline
5. **Return:** navigate away

### 2.12 Settings Changes Flow

```
Settings View → Select Section → Change Setting → Auto-Save → Undo Toast
```

**Detailed path:**

1. **Navigate to Settings** (`setView('settings')`)
2. **Section navigation:** click any of 12 section tabs
3. **Change a setting:** 
   - Toggle: click switch → `PUT /api/settings` → immediate save
   - Select: choose option → `PUT /api/settings` → immediate save
   - Input: type value → `PUT /api/settings` on blur/enter → immediate save
4. **Success:** toast "Setting updated" with "Undo" action
5. **Undo:** click "Undo" in toast → `PUT /api/settings` with previous value → toast "Setting restored"
6. **Destructive actions:** 
   - "Reset all settings" → AlertDialog confirmation → `PUT /api/settings` with defaults
   - "Sign out" → `signOut({ redirect: false })` → `setView('landing')`
   - "Export data" → `GET /api/export` → JSON file download

### 2.13 Onboarding Restart Flow

```
Settings → Account → [planned: "Restart Onboarding"] → Onboarding Flow → Dashboard
```

**Currently:** No explicit restart option in UI. Can be triggered by setting `onboarded: false` via API.

**Planned:** A "Restart onboarding" button in Settings → Account section that:
1. Shows confirmation: "This will reset your personalization profile. Continue?"
2. On confirm: `POST /api/onboarding/restart` → sets `onboarded: false`
3. Next app load: Onboarding flow appears
4. User completes onboarding again → fresh dashboard with new personalization

### 2.14 Password Reset Flow

```
Landing Page → "Forgot password?" → Password Reset Modal → Enter Email → Send Reset Email → Check Email → Click Link → New Password Page → Sign In
```

**Detailed path:**

1. **Click "Forgot password?"** on landing page sign-in form
2. **Password Reset Modal appears** over landing page
3. **Enter email:** Input field for email address
4. **Submit:** `POST /api/auth/reset-password` → sends reset email
5. **Confirmation:** "Check your email for a reset link" message
6. **Click link in email:** navigates to reset password page (separate route, not in SPA)
7. **Enter new password:** Input fields for new password + confirm
8. **Submit:** password updated → redirect to sign-in
9. **Sign in with new password:** normal authentication flow

### 2.15 Google/GitHub Login Flow

```
Landing Page → OAuth Button → Provider Consent → Callback → Session Established → Onboarding or Dashboard
```

**Google OAuth detailed path:**

1. **Click Google OAuth button:** `signIn('google')` from next-auth
2. **Google consent screen:** user grants permission
3. **Callback to MindGuard:** `/api/auth/callback/google`
4. **Session established:** `useSession` detects authentication
5. **Check `onboarded`:**
   - `false` → Onboarding flow
   - `true` → Dashboard
6. **If callback fails:** back to landing page with error toast

**GitHub OAuth (planned):** Same flow, `signIn('github')`.

### 2.16 Device Pairing Flow

```
Settings/Desktop → "Pair a Device" → Generate Token → Desktop App Enters Token → Pairing Complete → Sync Begins
```

**Detailed path:**

1. **Web app:** `POST /api/devices/pairing` → returns `{ pairingToken, expiresIn, deviceId }`
2. **Display pairing token:** show code to user
3. **Desktop app:** user enters code → `POST /api/devices/pair-complete` → returns `{ refreshToken, accessToken, deviceId, user }`
4. **Desktop app stores tokens:** begins authenticated API calls
5. **Desktop app syncs:** `GET /api/devices/sync` → receives settings, missions, sessions, user profile
6. **Desktop app begins tracking:** periodic `POST /api/activities/batch`
7. **Web app:** Life Dashboard shows connected status, desktop data populates

---

## Section 3: Navigation Architecture

### 3.1 Navigation Philosophy

MindGuard's navigation follows the UX Bible's principle (§2 — Progressive Disclosure): primary actions are always visible, secondary actions are one click away, and rare actions are searchable. The sidebar is the primary navigation organ. The command palette is the power-user accelerator. The header provides contextual actions.

The navigation system is inspired by Linear (sidebar as primary organ), Raycast (command palette for power users), and Arc Browser (collapsible sidebar with section labels).

**Key principle:** Navigation should never steal attention. It should protect it. (UX Bible §1 — "Protect Your Attention") This means:
- The sidebar should be calm, not exciting. No animated icons, no notification badges cluttering nav items.
- Keyboard shortcuts should be discoverable, not required. The app works perfectly with mouse only.
- The command palette should feel like a superpower, not a necessity. Every action reachable by click is also reachable by keyboard.

### 3.2 Sidebar Architecture

#### 3.2.1 Sidebar Structure

The sidebar (`AppSidebar`) is a fixed left panel. It contains:

**Layout:**
- Fixed position, full height (`h-screen`)
- Left edge of viewport (`left-0, top-0`)
- Z-index: 50 (mobile overlay), 30 (desktop persistent)
- Background: `bg-zinc-950/95 backdrop-blur-xl`
- Decorative: emerald gradient glow at top (`bg-gradient-to-b from-emerald-500/[0.06] to-transparent, h-32`)
- Border: `border-r border-white/[0.06]`

**Header area (h-14):**
- MindGuardLogo: size "sm", showText dynamic (hidden when collapsed)
- Mobile close button (X icon, `lg:hidden`)
- Desktop collapse toggle (ChevronsLeft/ChevronsRight, `hidden lg:flex`)

**Navigation area (flex-1, ScrollArea):**
- 5 sections with section labels:
  - **Core** (2 items): Dashboard, Life Dashboard
  - **Focus** (3 items): Mission, Focus Timer, Reflection
  - **Review** (3 items): Daily Review, Sessions, Statistics
  - **Insights** (4 items): Daily Replay, Weekly Wrapped, Habits, Monthly Report
  - **Bottom** (1 item): Settings
- Each nav item: `NavButton` with icon, label, keyboard shortcut badge
- Active indicator: emerald vertical bar (`layoutId="sidebar-active"`, spring animation)
- Click sound: `playClick()` on navigation (micro-interaction)

**Footer area (border-t):**
- User avatar: circular container with initials, `bg-white/[0.06]`
- User name: truncated, `text-xs font-medium text-zinc-300`
- User email: truncated, `text-[10px] text-zinc-600`

#### 3.2.2 Sidebar States

**Expanded state (240px width):**
- Default on desktop (`sidebarCollapsed: false`)
- Shows: logo with text, full nav labels, section labels with dividers, shortcut badges, user name + email
- Transition: `width: 240px`, `transition-[width] duration-300 ease-out`

**Collapsed state (64px width):**
- Toggle via collapse button or `sidebarCollapsed: true`
- Shows: logo icon only (no text), nav icons only (no labels), section dividers as thin lines (no text), user avatar only (no name/email)
- Nav buttons: `justify-center px-0 py-[9px]`, icon size increases to `h-[18px] w-[18px]`
- Name/email: AnimatePresence fade out (`duration: 0.15`)

**Mobile overlay state:**
- On screens < 1024px (`lg` breakpoint): sidebar is off-screen by default
- Triggered by: Menu button in AppHeader → `setSidebarOpen(true)`
- Animation: spring slide from left (`x: -280 → 0`, `damping: 25, stiffness: 200`)
- Background overlay: `bg-black/60 backdrop-blur-sm` behind sidebar
- Close: click overlay, click X button, or navigate to a view (auto-closes on nav click when < 1024px)
- After close: sidebar slides back to `x: -280`

**Auto-open behavior:**
- When viewport resizes to ≥ 1024px: sidebar auto-opens (`setSidebarOpen(true)`)

#### 3.2.3 Sidebar Section Labels

| Section | Expanded Label | Collapsed Display | Items |
|---------|---------------|-------------------|-------|
| Core | "Core" + horizontal divider line | Thin divider line (4px wide, `bg-white/[0.06]`) | Dashboard (D), Life Dashboard (L) |
| Focus | "Focus" + horizontal divider line | Thin divider line | Mission (M), Focus Timer (T), Reflection (R) |
| Review | "Review" + horizontal divider line | Thin divider line | Daily Review (V), Sessions (H), Statistics (S) |
| Insights | "Insights" + horizontal divider line | Thin divider line | Daily Replay (P), Weekly Wrapped (W), Habits (H), Monthly Report (M) |
| Bottom | Separator line only | Separator line only | Settings (,) |

#### 3.2.4 Sidebar Keyboard Shortcuts

Each sidebar item has a single-key shortcut displayed as a `<kbd>` badge:

| View | Shortcut | Full G-sequence |
|------|----------|-----------------|
| Dashboard | D | G D |
| Life Dashboard | L | G L |
| Mission | M | G M |
| Focus Timer | T | G T |
| Reflection | R | G R |
| Daily Review | V | G V |
| Sessions | H | G H |
| Statistics | S | G S |
| Daily Replay | P | G P |
| Weekly Wrapped | W | G W |
| Habits | H | G H |
| Monthly Report | M | G M |
| Settings | , | G , |

The `<kbd>` badges are visible only on desktop (`hidden lg:inline`), styled as `text-[10px] font-medium text-zinc-700`.

### 3.3 Top Navigation (AppHeader)

#### 3.3.1 Header Structure

The header (`AppHeader`) is a sticky top bar. Height: `h-14`.

**Layout:**
- Sticky: `sticky top-0 z-20`
- Background: `bg-zinc-950/50 backdrop-blur-2xl backdrop-saturate-[1.8]`
- Shadow: `shadow-[0_1px_0_0_rgba(255,255,255,0.03),0_8px_32px_-8px_rgba(0,0,0,0.5)]`
- Decorative: gradient lines at top — white line (`via-white/[0.08]`) always visible, emerald line (`via-emerald-400/[0.12]`) appears on hover
- Left section: mobile menu button (Menu icon, `lg:hidden`) + view title
- Right section: Notification panel + keyboard shortcuts badge + profile dropdown

**View title mapping (`viewTitles`):**

| AppView | Title |
|---------|-------|
| landing | '' (empty — landing has no header) |
| dashboard | Dashboard |
| life | Life Dashboard |
| mission | Missions |
| timer | Focus Timer |
| reflection | Daily Reflection |
| sessions | Session History |
| stats | Statistics |
| settings | Settings |
| replay | Daily Replay |
| review | Daily Review |
| wrapped | Weekly Wrapped |
| habits | Habits (not in current viewTitles — needs addition) |
| monthly | Monthly Report (not in current viewTitles — needs addition) |

Title style: `text-sm font-medium text-zinc-200`

#### 3.3.2 Mobile Menu Button

- Visible only on screens < 1024px (`lg:hidden`)
- Icon: Menu (h-5, w-5)
- Action: `setSidebarOpen(true)` → sidebar slides in as overlay
- Style: `h-8 w-8 text-zinc-400 hover:text-zinc-200`

#### 3.3.3 Notification Panel Position

- Bell icon button in header right section
- Opens NotificationPanel dropdown
- Shows unread count badge when `unreadCount > 0`

#### 3.3.4 Keyboard Shortcuts Badge

- Small button showing `? shortcuts`
- Visible on desktop (`hidden sm:flex`)
- Style: `border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-[10px] text-zinc-600`
- Click: opens KeyboardShortcutsModal
- Also triggered by pressing `?` key (when not in input/textarea/select)

#### 3.3.5 Profile Dropdown Menu

- Avatar button: circular, `h-7 w-7`, initials in `bg-zinc-800 text-xs`
- DropdownMenu aligned to end
- Contains:
  - User info section: name + email
  - Separator
  - "Settings" item → `setView('settings')`
  - Separator
  - "Sign out" item → `signOut({ redirect: false })` → `setView('landing')`
- Sign out styled in red: `text-red-400 focus:bg-red-500/10`

### 3.4 Back Button Behavior

MindGuard does not use browser-style back buttons. Navigation is intentional, not historical. The UX Bible's principle (§2 — Progressive Disclosure) means users navigate to where they *want* to be, not where they *were*.

**Implementation:**
- No back button in header or sidebar
- No browser history manipulation for view changes
- View changes are stored in Zustand (`currentView`), not in URL hash or history
- The sidebar always shows current location, making "back" unnecessary — you can see where you are and click where you want to go

**Exceptions where back behavior exists:**
- Onboarding flow: "Back" button to revisit previous step
- Reflection flow: "Back" button between 3 questions
- Command palette: Escape closes the palette (not "back")

**Why no back button:** Back buttons imply linear navigation. MindGuard uses hub-and-spoke navigation — the dashboard (or any view) is a hub, and the sidebar provides spokes to any other view. You never need to "go back" because you can always "go to" directly.

### 3.5 Escape Key Behavior

The Escape key has context-dependent behavior:

| Context | Escape Action |
|---------|---------------|
| Command Palette open | Close palette |
| Keyboard Shortcuts Modal open | Close modal |
| Notification Panel open | Close panel |
| Mission Create/Edit Dialog open | Close dialog |
| Habit Create Dialog open | Close dialog |
| AlertDialog open | Close dialog (cancel action) |
| Focus Mode (running) | Emergency abandon — exit focus mode, save partial session, no confirmation |
| Settings sub-dialog open | Close sub-dialog |
| Onboarding flow | No action (Escape does not exit onboarding) |
| Normal view | No action (Escape has no effect on view navigation) |

**Focus Mode emergency exit is intentionally without confirmation:** If a user presses Escape during focus, they need to leave immediately. The partial session is still saved. This follows the UX Bible principle (§2 — Progressive Disclosure): don't add a confirmation dialog when the user is trying to escape.

### 3.6 Keyboard Shortcuts System

#### 3.6.1 G-sequence Navigation (Linear-inspired)

All view navigation uses a G-prefix sequence:

1. Press `G` (no modifier needed)
2. Within 500ms, press the destination key
3. View changes immediately

| Sequence | Destination |
|----------|-------------|
| G D | Dashboard |
| G L | Life Dashboard |
| G M | Mission |
| G T | Focus Timer |
| G R | Reflection |
| G V | Daily Review |
| G H | Sessions |
| G S | Statistics |
| G P | Daily Replay |
| G W | Weekly Wrapped |
| G , | Settings |

**Implementation:** `shortcutManager` in `@/lib/shortcut-manager` handles G-sequence timing and dispatch.

#### 3.6.2 Direct Shortcuts

| Key | Action | Context |
|-----|--------|---------|
| ⌘K / Ctrl+K | Open Command Palette | Any context (except input focus) |
| ? | Open Keyboard Shortcuts Modal | Any context (except input/textarea/select) |
| Escape | Context-dependent close | See §3.5 |

#### 3.6.3 Custom Shortcuts

Users can define custom keyboard shortcuts via Settings → Keyboard → Custom Shortcuts. Stored as `customShortcuts: Record<string, string>` in UserSettings. The shortcut system merges default shortcuts with user-defined overrides.

### 3.7 Command Palette as Global Search

The Command Palette (`CommandPalette`) serves as MindGuard's global search and action launcher. It is not a search engine — it is a navigation accelerator.

**Architecture:**
- Overlay modal, centered, backdrop blur
- Triggered by ⌘K/Ctrl+K/Cmd+J
- Auto-focused search input
- Fuzzy search across command labels and keywords
- Two command groups:
  - **Navigation** (11 commands): every AppView accessible by name or keyword
  - **Actions** (2+ commands): "Start Focus Timer", "Go to Missions" (extensible)

**Search behavior:**
- Query matches against: command label (case-insensitive), keyword array
- Results filtered and displayed in real-time
- Keyboard navigation: ↑↓ to select, Enter to execute, Escape to close
- Mouse navigation: click to execute
- Selected index tracked, auto-adjusted when results change

**Command keyword examples:**

| Command | Keywords |
|---------|----------|
| Dashboard | home, overview, stats |
| Life Dashboard | life, desktop, screen, activity, laptop |
| Mission | task, goal, current, focus |
| Focus Timer | pomodoro, countdown, start, session |
| Daily Reflection | journal, review, diary, log |
| Statistics | analytics, charts, data |

**Extensibility:** New action commands can be added to `actionCommands` array. Future: "Create new mission", "Start quick 15-min session", "Write reflection", "Toggle sidebar".

### 3.8 Notification Panel as Contextual Navigation

The Notification Panel is not just an alert inbox — it is a contextual navigation tool. Each notification can deep-link to a relevant view.

**Deep-link behavior:**
- Click notification → `setView(notif.actionUrl as AppView)` → panel closes → user lands on relevant view
- Only valid AppView values accepted as action URLs (validated against `VALID_ACTION_VIEWS` array)
- Invalid or missing actionUrl → notification dismissed, no navigation

**Notification-to-view mapping:**

| Notification Type | Deep-link Target |
|-------------------|-----------------|
| idle_alert | Dashboard (no specific target) |
| break_reminder | Timer (to start a break session) |
| mission_reminder | Mission (to view active mission) |
| reflection_reminder | Reflection (to write daily reflection) |
| focus_celebration | Dashboard (to see updated stats) |
| streak_milestone | Dashboard (to see streak widget) |
| achievement_unlocked | Dashboard (to see achievements) |

### 3.9 Profile Menu as Quick Settings Access

The profile dropdown in the header provides quick access to:
- Settings (most common profile action)
- Sign out (destructive, clearly styled in red)

It does not provide:
- Profile editing (that's in Settings → General)
- Account management (that's in Settings → Account)
- Theme switching (that's in Settings → Appearance)

**Why limited:** The profile menu should have 2–3 items maximum. Adding more creates decision fatigue. The UX Bible principle (§2 — Progressive Disclosure) means: show only what 90% of users need 90% of the time. 90% of profile menu clicks are "go to settings" or "sign out."

### 3.10 Breadcrumbs — Current Status and Recommendation

**Current state:** No breadcrumbs exist in MindGuard.

**Should they exist?** No. Breadcrumbs imply deep hierarchical navigation. MindGuard uses flat navigation — every view is one click away from the sidebar. Breadcrumbs would add visual noise without adding navigational value.

**What instead:** The header shows the current view title. The sidebar shows the active indicator. These two elements together provide all the "where am I" information a breadcrumb would provide, without the cognitive load of interpreting a path.

**Future consideration:** If MindGuard adds nested views (e.g., Settings → sub-sections as separate views, or Mission → detail view), breadcrumbs may become useful. At current flat architecture, they are an anti-pattern.

### 3.11 Future Navigation Expansion

**Planned additions (per UX Bible §34 and PRD roadmap):**

1. **AI Assistant view** (`AppView: "assistant"`): Already implemented as a component but not in AppView types. Should be added as a sidebar item under "Core" section, between Dashboard and Life Dashboard.

2. **Team features:** Team mission boards, shared analytics, admin dashboard. These would add a "Team" section to the sidebar with appropriate items.

3. **Deep linking via URL:** Currently all navigation is client-side state. Future: hash-based URLs (`#/dashboard`, `#/timer`) for shareable links and browser history.

4. **Mobile bottom navigation:** On small screens, a bottom tab bar with 4–5 primary actions could supplement the overlay sidebar for faster mobile access.

5. **Contextual navigation:** When in Focus Mode, a minimal floating nav appears with timer controls and emergency exit. This already exists (Focus Mode has its own navigation).

6. **Quick actions in header:** Future header could include contextual actions per view (e.g., "New Mission" button when on Mission view, "Start Session" when on Dashboard).

---

## Section 4: Screen Blueprints

### 4.1 Blueprint Philosophy

A screen blueprint defines the *structural anatomy* of a screen — not its visual styling (that's the UX Bible's design tokens) but its *information hierarchy, element ordering, and spatial allocation*. Every blueprint answers:

1. **What does the header show?** (Context: where am I?)
2. **What does the sidebar show?** (Navigation: where can I go?)
3. **What does the content area contain?** (Purpose: what am I here for?)
4. **What is the primary CTA?** (Action: what should I do next?)
5. **What is the secondary CTA?** (Alternative: what else can I do?)
6. **What is the information hierarchy?** (Priority: what matters most?)
7. **What is the visual hierarchy?** (Attention: where do my eyes go?)
8. **What is the spacing pattern?** (Breathing: does the screen feel calm?)
9. **What is the card ordering?** (Sequence: what comes first, second, third?)
10. **What scrolls and what sticks?** (Motion: what stays fixed, what moves?)

### 4.2 Common Shell Blueprint (All AppShell Views)

Every view inside the AppShell shares this structural anatomy:

```
┌─────────────────────────────────────────────────────────────────────┐
│ SIDEBAR (240px or 64px) │ MAIN CONTENT AREA                        │
│                          │                                           │
│ ┌──Logo + Collapse──┐   │ ┌──APP HEADER (sticky, h-14)──┐         │
│ │                    │   │ │ Menu │ View Title │ 🔔 ? 👤 │         │
│ ├──Separator──────┤   │ └─────────────────────────────────┘         │
│ │                    │   │                                           │
│ │ Core               │   │ ┌──CONTENT (scrollable)────────┐        │
│ │ • Dashboard   [D]  │   │ │                              │        │
│ │ • Life        [L]  │   │ │ max-w-6xl                    │        │
│ │                    │   │ │ px-4 py-8 sm:px-6 lg:px-8    │        │
│ │ Focus              │   │ │                              │        │
│ │ • Mission     [M]  │   │ │ [View-specific content]      │        │
│ │ • Timer       [T]  │   │ │                              │        │
│ │ • Reflection  [R]  │   │ │                              │        │
│ │                    │   │ │                              │        │
│ │ Review             │   │ │                              │        │
│ │ • Review      [V]  │   │ │                              │        │
│ │ • Sessions    [H]  │   │ │                              │        │
│ │ • Stats       [S]  │   │ │                              │        │
│ │                    │   │ │                              │        │
│ │ Insights           │   │ │                              │        │
│ │ • Replay      [P]  │   │ │                              │        │
│ │ • Wrapped     [W]  │   │ │                              │        │
│ │ • Habits      [H]  │   │ │                              │        │
│ │ • Monthly     [M]  │   │ │                              │        │
│ │                    │   │ │                              │        │
│ ├──Separator──────┤   │ │                              │        │
│ │ • Settings    [,]  │   │ │                              │        │
│ │                    │   │ └──────────────────────────────┘        │
│ │                    │   │                                           │
│ ├──User Footer────┤   │                                           │
│ │ [Avatar] Name     │   │                                           │
│ │         Email     │   │                                           │
│ └────────────────────┘   │                                           │
│                          │ ┌──COMMAND PALETTE (overlay)──┐         │
│                          │ │ (⌘K triggered, floats above) │         │
│                          │ └─────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────┘
```

**Sticky elements:**
- Sidebar: fixed position, always visible on desktop, overlay on mobile
- Header: sticky top, `z-20`, backdrop blur

**Scrollable elements:**
- Content area: `overflow-y-auto`, `flex-1`
- Sidebar navigation: `ScrollArea` when content exceeds viewport

**Spacing:**
- Content area: `mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8`
- Left margin adjusts based on sidebar width: `lg:ml-[240px]` (expanded) or `lg:ml-[64px]` (collapsed), `transition-[margin-left] duration-300 ease-out`

### 4.3 Dashboard Blueprint

```
CONTENT AREA (max-w-6xl)
│
│ ┌──ZONE 1: GREETING──────────────────────────────────────────┐
│ │                                                             │
│ │ ┌─Greeting Card (full width, gradient bg)─────────────┐    │
│ │ │                                                      │    │
│ │ │ [Time Icon]  Good morning, Alex                      │    │
│ │ │              🔥 7-day streak! You're unstoppable     │    │
│ │ │                                                      │    │
│ │ │ ┌─Coach Tip──────────────────────────────────────┐   │    │
│ │ │ │ [Lightbulb] Try a 90-min deep work block...   │   │    │
│ │ │ └───────────────────────────────────────────────┘   │    │
│ │ │                                                      │    │
│ │ │ ┌─Focus Block Suggestions───────────────────────┐   │    │
│ │ │ │ Morning Deep Work  9:00 AM  [Start]           │   │    │
│ │ │ │ Late Morning Block 11:00 AM  [Start]          │   │    │
│ │ │ └───────────────────────────────────────────────┘   │    │
│ │ └─────────────────────────────────────────────────────┘    │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──ZONE 2: ACTION────────────────────────────────────────────┐
│ │                                                             │
│ │ ┌─Quick Start──────┐  ┌─AI Coach──────┐  ┌─Stats Row──┐   │
│ │ │                   │  │               │  │            │   │
│ │ │ [▶ Start Focus]  │  │ 3 tabs:       │  │ Today: 45m │   │
│ │ │                   │  │ Briefing      │  │ Week: 180m │   │
│ │ │ Active Mission:   │  │ Chat          │  │ Score: 82  │   │
│ │ │ "Deep Work Sprint"│  │ Insights      │  │ Streak: 7d │   │
│ │ │ [▶ Start Session]│  │               │  │            │   │
│ │ │                   │  │               │  │            │   │
│ │ └───────────────────┘  └───────────────┘  └────────────┘   │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──ZONE 3: REFLECTION────────────────────────────────────────┐
│ │                                                             │
│ │ ┌─Heatmap──────┐  ┌─Timeline──────┐  ┌─Achievements──┐    │
│ │ │               │  │               │  │               │    │
│ │ │ 90-day grid   │  │ Today's       │  │ 4 categories  │    │
│ │ │ emerald scale │  │ activity      │  │ progress bars │    │
│ │ │ habit overlay │  │ chronological │  │ XP rewards    │    │
│ │ │               │  │               │  │               │    │
│ │ └───────────────┘  └───────────────┘  └───────────────┘    │
│ │                                                             │
│ │ ┌─Habit Tracker Widget─────────────────────────────────┐    │
│ │ │ Today's habits with completion circles               │    │
│ │ └──────────────────────────────────────────────────────┘    │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
```

**Primary CTA:** "Start a Focus Session" button (emerald gradient, `btn-glow`)
**Secondary CTA:** "Create a Mission" link, "Write Reflection" link
**Information hierarchy (top → bottom importance):**
1. Personalized greeting + motivational message (emotional anchor)
2. Quick-start focus button (action driver)
3. AI Coach briefing (intelligence)
4. Focus block suggestions (timing guidance)
5. Stats overview (progress tracking)
6. Heatmap (long-term visualization)
7. Timeline (today's narrative)
8. Achievements (reward system)
9. Habit tracker (compound habits)

**Visual hierarchy (where eyes go first → last):**
1. Greeting headline (large text, gradient emphasis)
2. Quick-start button (emerald glow, prominent)
3. Coach tip icon (accent color)
4. Stats numbers (animated, tabular-nums)
5. Heatmap grid (visual pattern)
6. Achievement icons (emoji + color)

**Spacing:**
- Between zones: `mb-8` (greeting → action), `mb-6` (action → reflection)
- Between cards in same zone: `gap-4` (grid), `gap-6` (desktop 3-col)
- Within cards: `p-4 sm:p-5` (mobile), `p-5 sm:p-6` (desktop)
- Widget card structure: icon container (9×9) → label → value → sub-text → progress bar

**Card ordering per persona (desktop 3-column grid):**

| Row | Col 1 | Col 2 | Col 3 |
|-----|-------|-------|-------|
| Row 1 (studying) | Greeting + Heatmap | AI Coach | Quick Start + Stats |
| Row 2 (studying) | Session Stats | Timeline | Achievements |
| Row 1 (coding) | Greeting + Timeline | AI Coach | Quick Start + Achievements |
| Row 2 (coding) | Heatmap | Stats | Distraction Log |

**Scrolling behavior:**
- Greeting zone: no scroll, visible on load
- Action zone: may scroll on mobile (1-col), visible on desktop (3-col)
- Reflection zone: scrolls naturally, heatmap and timeline always accessible

**Sticky elements:** None within content area. Header and sidebar are sticky via AppShell.

**Collapsible sections:**
- Heatmap: "Show full map" toggle expands from 7-week view to 13-week view
- AI Coach: tab-based collapsible (Briefing | Chat | Insights)
- Achievements: category tabs (Focus | Consistency | Reflection | Milestones)

### 4.4 Mission View Blueprint

```
CONTENT AREA (max-w-6xl)
│
│ ┌──Header─────────────────────────────────────────────────────┐
│ │ [Target icon]  Missions                                    │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Active Mission Card (prominent, full width)───────────────┐
│ │                                                             │
│ │ ┌─Priority Badge──┐  Title: "Deep Work Sprint"            │
│ │ │ HIGH (red)       │  Description: "90 min of focus..."    │
│ │ └──────────────────┘                                       │
│ │                                                             │
│ │ Sessions: 3    Duration: 2h 15m    [✓ Complete Mission]    │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Mission Templates (quick-create)──────────────────────────┐
│ │                                                             │
│ │ [⚡ Deep Work Sprint] [📚 Study Session] [💻 Code Review] │
│ │ [💡 Creative Brainstorm] [🚀 Project Launch]              │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──+ Create Mission Button───────────────────────────────────┐
│ │ [+ Create Custom Mission] → opens Dialog                   │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Completed Missions (collapsed by default)─────────────────┐
│ │                                                             │
│ │ ▸ Completed Missions (3)                                   │
│ │   ┌─Mission Row────────────────────────────────────┐       │
│ │   │ ✓ "Study for finals"  Completed Dec 15        │       │
│ │   └────────────────────────────────────────────────┘       │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
```

**Primary CTA:** "Complete Mission" button (when active mission exists) or "Create Mission" button (when no active mission)
**Secondary CTA:** Template quick-create buttons, "Edit Mission" link
**Information hierarchy:**
1. Active mission (current focus target)
2. Quick-create templates (fast path to new mission)
3. Create custom mission (flexible path)
4. Completed missions (historical reference)

**Visual hierarchy:**
1. Active mission card (large, prominent, priority badge color)
2. Template buttons (medium, icon-based)
3. "Create Custom" button (medium, Plus icon)
4. Completed section (collapsed, dimmed)

**Scrolling behavior:** Minimal scroll needed. Active mission + templates visible on load. Completed section expands on click.

**Modal overlay (Mission Create/Edit Dialog):**
- Centered Dialog overlay
- Title input (required), Description textarea (optional), Priority select
- Submit + Cancel buttons
- Loading state on submit

### 4.5 Focus Timer Blueprint

```
CONTENT AREA (max-w-6xl)
│
│ ┌──Timer Configuration────────────────────────────────────────┐
│ │                                                             │
│ │ ┌─Duration Presets─────────────────────────────────────┐    │
│ │ │ [15 min] [25 min] [45 min] [60 min] [90 min] [⚙]   │    │
│ │ └──────────────────────────────────────────────────────┘    │
│ │                                                             │
│ │ ┌─Custom Duration (when ⚙ selected)───────────────────┐    │
│ │ │ [___] minutes                                        │    │
│ │ └──────────────────────────────────────────────────────┘    │
│ │                                                             │
│ │ ┌─Mission Selector─────────────────────────────────────┐    │
│ │ │ ▾ Select mission...  [Free Focus ▾]                  │    │
│ │ └──────────────────────────────────────────────────────┘    │
│ │                                                             │
│ │ ┌─Start Button─────────────────────────────────────────┐    │
│ │ │ [▶ Start Focus]  (emerald gradient, large)          │    │
│ │ └──────────────────────────────────────────────────────┘    │
│ │                                                             │
│ │ [Ambient particles: 12 emerald dots floating]              │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
```

**Primary CTA:** "Start Focus" button (emerald gradient, `btn-glow`)
**Secondary CTA:** Custom duration toggle, mission selector dropdown
**Information hierarchy:**
1. Duration selection (primary decision)
2. Mission assignment (secondary decision)
3. Start action (execution)

**Visual hierarchy:**
1. Duration preset buttons (row of equal-weight options)
2. Selected preset (highlighted state)
3. Start button (large, emerald, below presets)
4. Mission selector (dropdown, contextual)
5. Ambient particles (decorative, background)

**Spacing:** Centered layout, presets in a row with `gap-3`, start button below with `mt-6`.

### 4.6 Focus Mode Blueprint (Full-Screen Takeover)

```
FULL SCREEN (bg-zinc-950, no sidebar, no header)
│
│ ┌──Ambient Background─────────────────────────────────────────┐
│ │ [15 floating emerald particles, subtle glow orbs]           │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Timer Display (centered, large)───────────────────────────┐
│ │                                                             │
│ │          Mission: "Deep Work Sprint"                        │
│ │                                                             │
│ │               25:00                                         │
│ │          (large, tabular-nums)                              │
│ │                                                             │
│ │     ┌─Progress Indicator──────────────────────────┐        │
│ │     │ [Circular or linear progress bar]           │        │
│ │     └─────────────────────────────────────────────┘        │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Controls (bottom area)─────────────────────────────────────┐
│ │                                                             │
│ │ [⏸ Pause]    [⏹ Abandon]                                  │
│ │                                                             │
│ │ ┌─Audio Player───────────────────────────────────────┐      │
│ │ │ 🔊 Rain | Classical | Deep Focus | Off            │      │
│ │ └────────────────────────────────────────────────────┘      │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
```

**Primary CTA:** Pause/Resume toggle
**Secondary CTA:** Abandon button (destructive, always available)
**Information hierarchy:**
1. Remaining time (survival information — how much longer?)
2. Mission title (purpose — why am I focusing?)
3. Progress indicator (progress — how far am I?)
4. Controls (action — pause, resume, abandon)
5. Audio (ambient — background sound)

**Visual hierarchy:**
1. Timer digits (largest text on screen, `text-zinc-100 font-bold`, centered)
2. Mission title (above timer, smaller, `text-zinc-400`)
3. Progress bar (subtle, below or around timer)
4. Pause/Abandon buttons (bottom, muted until needed)
5. Audio controls (bottom-right, minimal, `text-zinc-600`)

**Spacing:** Everything centered vertically and horizontally. Timer occupies ~60% of visual attention. Controls at bottom with `mt-auto`. Ambient particles fill background without competing for attention.

**Sticky elements:** None — this is a full-screen takeover with no scrolling.

### 4.7 Celebration Screen Blueprint

```
FULL SCREEN OVERLAY (above Focus Mode)
│
│ ┌──Celebration Content (centered)─────────────────────────────┐
│ │                                                             │
│ │        🎉                                                  │
│ │                                                             │
│ │    You focused for 25 minutes!                             │
│ │    Mission: "Deep Work Sprint"                             │
│ │                                                             │
│ │    +50 XP                                                  │
│ │                                                             │
│ │    ┌─Achievement Unlock (if new)───────────────────┐       │
│ │    │ ✨ First Focus — You completed your first     │       │
│ │    │    focus session!                              │       │
│ │    └───────────────────────────────────────────────┘       │
│ │                                                             │
│ │    [Continue to Dashboard]                                  │
│ │    (or auto-continue after 5 seconds)                       │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
```

**Primary CTA:** "Continue to Dashboard" (emerald gradient)
**Secondary CTA:** Auto-continue after 5 seconds (no click needed)
**Information hierarchy:**
1. Duration completed (achievement acknowledgment)
2. Mission completed (context)
3. XP gained (reward)
4. New achievement (if applicable — surprise reward)
5. Continue action (exit)

**Visual hierarchy:**
1. Celebration icon/animation (center, spring entrance)
2. Duration text (large, gradient text)
3. XP badge (emerald accent)
4. Achievement card (if present, glow border)

### 4.8 Reflection View Blueprint

```
CONTENT AREA (max-w-6xl)
│
│ ┌──Header─────────────────────────────────────────────────────┐
│ │ [BookOpen icon]  Daily Reflection                           │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Step Indicator─────────────────────────────────────────────┐
│ │                                                             │
│ │ [🧠 1/3] ────── [✨ 2/3] ────── [→ 3/3]                  │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Question Card (current step)───────────────────────────────┐
│ │                                                             │
│ │ "What distracted you today?"                                │
│ │ "Be honest. Awareness is the first step."                   │
│ │                                                             │
│ │ ┌─Textarea──────────────────────────────────────────┐       │
│ │ │ Social media, notifications, wandering thoughts...│       │
│ │ │                                    0/500 chars    │       │
│ │ └───────────────────────────────────────────────────┘       │
│ │                                                             │
│ │ ┌─Mood/Energy (collapsible)─────────────────────────┐       │
│ │ │ Mood: [1──2──3──4──5]  Energy: [1──2──3──4──5]   │       │
│ │ └───────────────────────────────────────────────────┘       │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Previous Reflection (if exists for today)──────────────────┐
│ │                                                             │
│ │ ┌─Reflection Card───────────────────────────────────┐       │
│ │ │ Date: Today                                        │       │
│ │ │ Distraction: "Social media"                        │       │
│ │ │ Went Well: "Completed deep focus session"          │       │
│ │ │ Tomorrow: "Finish the proposal"                    │       │
│ │ │ Mood: 4/5  Energy: 3/5                             │       │
│ │ │                              [Edit]                │       │
│ │ └───────────────────────────────────────────────────┘       │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Navigation─────────────────────────────────────────────────┐
│ │ [← Back]                    [Save Reflection →]            │
│ └─────────────────────────────────────────────────────────────┘
```

**Primary CTA:** "Save Reflection" (emerald gradient, on step 3) or "Continue" (on steps 1–2)
**Secondary CTA:** "Back" (navigate to previous question), "Edit" (on existing reflection)
**Information hierarchy:**
1. Current question (what am I answering?)
2. Step indicator (where am I in the process?)
3. Textarea input (my answer)
4. Previous reflection (what did I already say?)
5. Mood/energy (optional, collapsible)

**Visual hierarchy:**
1. Question headline (medium-large, centered)
2. Step indicator icons (3 circles with connecting lines)
3. Textarea (large input area)
4. Character counter (small, bottom-right of textarea)

**Scrolling behavior:** Minimal. Single question visible at a time. Step transitions via `AnimatePresence`.

### 4.9 Settings View Blueprint

```
CONTENT AREA (max-w-6xl)
│
│ ┌──Header─────────────────────────────────────────────────────┐
│ │ [Settings icon]  Settings                                  │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Section Tabs (horizontal scroll)───────────────────────────┐
│ │                                                             │
│ │ [General] [Account] [Appearance] [Desktop] [Tracking]      │
│ │ [Privacy] [Focus] [Notifications] [Keyboard] [AI Coach]    │
│ │ [Advanced] [About]                                         │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Active Section Content─────────────────────────────────────┐
│ │                                                             │
│ │ Section: Focus                                              │
│ │                                                             │
│ │ ┌─Setting Row──────────────────────────────────────────┐    │
│ │ │ [⚡ icon]  Default Focus Duration                    │    │
│ │ │             Default timer length for sessions         │    │
│ │ │             [25 min ▾]  (default: 25)                 │    │
│ │ └──────────────────────────────────────────────────────┘    │
│ │                                                             │
│ │ ┌─Setting Row──────────────────────────────────────────┐    │
│ │ │ [🎯 icon]  Daily Focus Goal                          │    │
│ │ │             Target minutes of deep focus per day      │    │
│ │ │             [120 min ▾]  (default: 120)               │    │
│ │ └──────────────────────────────────────────────────────┘    │
│ │                                                             │
│ │ ┌─Setting Row──────────────────────────────────────────┐    │
│ │ │ [▶ icon]  Auto-Start Timer                           │    │
│ │ │             Auto-begin timer on focus mode entry      │    │
│ │ │             [○ toggle]  (default: off)                 │    │
│ │ └──────────────────────────────────────────────────────┘    │
│ │                                                             │
│ │ ┌─Setting Row──────────────────────────────────────────┐    │
│ │ │ [🎉 icon]  Celebration Screen                        │    │
│ │ │             Animated celebration after sessions        │    │
│ │ │             [● toggle on]  (default: on)              │    │
│ │ └──────────────────────────────────────────────────────┘    │
│ │                                                             │
│ │ ┌─Setting Row──────────────────────────────────────────┐    │
│ │ │ [🔊 icon]  Ambient Sound                             │    │
│ │ │             Background sound during focus sessions     │    │
│ │ │             [None ▾]  (default: none)                 │    │
│ │             Options: Rain, Classical, Deep Focus, None    │
│ │ └──────────────────────────────────────────────────────┘    │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
```

**Primary CTA:** None — settings auto-save on change. No "Save" button.
**Secondary CTA:** "Undo" toast after each change
**Information hierarchy:**
1. Section tabs (what category am I in?)
2. Setting rows (what can I change?)
3. Current values (what is the current state?)
4. Default hints (what was the original value?)

**Visual hierarchy:**
1. Active section tab (emerald highlight)
2. Setting row icons (emerald containers)
3. Toggle/select controls (interactive elements)
4. Default value hints (subtle, `text-zinc-600`)

**Spacing:**
- Section tabs: horizontal scroll, `gap-2`
- Setting rows: vertical stack, `gap-4` or `gap-6`
- Each row: icon (9×9) → label + description → control

**Scrolling behavior:** Section content scrolls vertically. Section tabs may scroll horizontally on mobile.

**Collapsible sections:** Each settings section is a separate tab (not collapsed/expanded within a page). This follows UX Bible §16 rule: "Collapsible sections — each section collapsed by default."

### 4.10 Weekly Wrapped Blueprint

```
CONTENT AREA (max-w-6xl, app-grid-bg background)
│
│ ┌──Header (centered)──────────────────────────────────────────┐
│ │                                                             │
│ │        [🎁 Gift icon in emerald gradient container]         │
│ │                                                             │
│ │    Your Weekly Wrapped                                      │
│ │    Jul 14 – Jul 19, 2025                                   │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Hero Row (2-col + 1-col on desktop)───────────────────────┐
│ │                                                             │
│ │ ┌─Total Focus Time (2-col span)──────────────────────┐     │
│ │ │                                                     │     │
│ │ │  12.5 hrs                                          │     │
│ │ │  (animated, 4xl–6xl text, gradient)                │     │
│ │ │  8 sessions this week                              │     │
│ │ │  [+15% vs last week]                               │     │
│ │ │                                                     │     │
│ │ └─────────────────────────────────────────────────────┘     │
│ │                                                             │
│ │ ┌─Attention Grade (1-col)────────────────────────────┐     │
│ │ │                                                     │     │
│ │ │         [A]                                         │     │
│ │ │  (large ring, spring animation)                    │     │
│ │ │  Outstanding                                        │     │
│ │ │  85/100 composite                                   │     │
│ │ │                                                     │     │
│ │ └─────────────────────────────────────────────────────┘     │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Stats Grid (3-col)────────────────────────────────────────┐
│ │                                                             │
│ │ ┌─Deepest Session─┐ ┌─Best Day────┐ ┌─Peak Hour──┐        │
│ │ │ 90m              │ │ 180m        │ │ 10 AM      │        │
│ │ │ "Deep Work"      │ │ Tuesday     │ │ 3 sessions │        │
│ │ └──────────────────┘ └─────────────┘ └────────────┘        │
│ │                                                             │
│ │ ┌─Longest Streak──┐ ┌─Mission %───┐ ┌─Reflection─┐        │
│ │ │ 7d               │ │ 75%         │ │ 86%        │        │
│ │ │ +2 vs last       │ │ 3/4 done    │ │ 6/7 days   │        │
│ │ └──────────────────┘ └─────────────┘ └────────────┘        │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Week-over-Week Comparison──────────────────────────────────┐
│ │                                                             │
│ │ ┌─Focus Time──┐ ┌─Sessions───┐ ┌─Streak─────┐              │
│ │ │ 12.5h vs 10h│ │ 8 vs 6     │ │ 7d vs 5d   │              │
│ │ │ [+25%]      │ │ [+33%]     │ │ [+2d]      │              │
│ │ └─────────────┘ └────────────┘ └────────────┘              │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Footer─────────────────────────────────────────────────────┐
│ │ Generated from 8 real focus sessions this week.             │
│ └─────────────────────────────────────────────────────────────┘
```

**Primary CTA:** None (this is a review view, not an action view)
**Secondary CTA:** "Start a session" (on empty state)
**Information hierarchy:**
1. Total focus time (hero metric — the week's biggest achievement)
2. Attention grade (single-score summary)
3. Individual stats (detail metrics)
4. Week-over-week comparison (trend direction)
5. Footer (data provenance)

**Visual hierarchy:**
1. Total focus hours number (4xl–6xl, gradient text, bg-clip-text transparent)
2. Attention grade letter (5xl, in ring container, spring animation)
3. Stat card values (2xl, animated numbers)
4. WoW arrows (small badges, colored by direction)

**Spacing:**
- Hero row: `mb-4`, grid `gap-4`
- Stats grid: `mb-4`, `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`
- WoW section: `mt-8`
- Footer: `mt-8`

**Scrolling behavior:** Vertical scroll through all sections. Hero row always visible on load. Stats and WoW sections scroll into view.

**Sticky elements:** None within content area.

### 4.11 Life Dashboard Blueprint

```
CONTENT AREA (max-w-6xl)
│
│ ┌──Tracker Status Banner──────────────────────────────────────┐
│ │                                                             │
│ │ [🟢 Connected]  Current: VS Code — github.com             │
│ │ or                                                          │
│ │ [🔴 Disconnected]  Connect your desktop agent              │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Metric Cards Grid (3-col desktop, 2-col mobile)───────────┐
│ │                                                             │
│ │ ┌─Total Laptop──┐ ┌─Productive───┐ ┌─Distracted──┐        │
│ │ │ 8h 30m        │ │ 5h 45m       │ │ 1h 15m      │        │
│ │ │ +12% vs avg   │ │ 67% ratio    │ │ top: Reddit │        │
│ │ └───────────────┘ └──────────────┘ └─────────────┘        │
│ │                                                             │
│ │ ┌─Deep Work─────┐ ┌─Focus Sess───┐ ┌─Attention───┐        │
│ │ │ 3h 20m        │ │ 5 sessions   │ │ Score: 82   │        │
│ │ │ 39% of total  │ │ today: 45m   │ │ improving   │        │
│ │ └───────────────┘ └──────────────┘ └─────────────┘        │
│ │                                                             │
│ │ ┌─XP/Level──────┐ ┌─Streak───────┐ ┌─Mission %───┐        │
│ │ │ 450 XP  Lvl 5 │ │ 7 days       │ │ 75% rate    │        │
│ │ └───────────────┘ └──────────────┘ └─────────────┘        │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Hourly Distribution Chart──────────────────────────────────┐
│ │ [Bar chart: 24 hours, focus minutes per hour]              │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Category Breakdown─────────────────────────────────────────┐
│ │ [Colored segments: coding, design, communication, etc.]    │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Recent Activity────────────────────────────────────────────┐
│ │ [Last 5 activities: type, title, time, duration]           │
│ └─────────────────────────────────────────────────────────────┘
```

**Primary CTA:** "Connect Desktop Agent" (when disconnected) or none (when connected)
**Secondary CTA:** Navigate to Settings → Desktop for configuration
**Information hierarchy:**
1. Tracker status (connected or not — foundational)
2. Productive vs. distracted time (the core insight)
3. Attention score (composite metric)
4. Hourly distribution (when am I productive?)
5. Category breakdown (what am I doing?)
6. Recent activity (what happened lately?)

### 4.12 Session History Blueprint

```
CONTENT AREA (max-w-6xl)
│
│ ┌──Header─────────────────────────────────────────────────────┐
│ │ [Clock icon]  Session History                               │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Filters────────────────────────────────────────────────────┐
│ │ [Date Range ▾]  [Mission Filter ▾]  [Duration Filter ▾]   │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Pagination─────────────────────────────────────────────────┐
│ │ Page 1 of 5  Total: 48 sessions                            │
│ │ [← Previous]  [Next →]                                     │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Session List───────────────────────────────────────────────┐
│ │                                                             │
│ │ ┌─Session Row───────────────────────────────────────┐       │
│ │ │ [│] [Target] Deep Work Sprint  [HIGH badge]       │       │
│ │ │     Dec 15 at 2:30 PM                             │       │
│ │ │                              [Timer] 45m           │       │
│ │ └───────────────────────────────────────────────────┘       │
│ │                                                             │
│ │ ┌─Session Row───────────────────────────────────────┐       │
│ │ │ [Target] Free Focus                                │       │
│ │ │     Dec 14 at 10:15 AM                             │       │
│ │ │                              [Timer] 25m           │       │
│ │ └───────────────────────────────────────────────────┘       │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
```

**Primary CTA:** None (history view, not action view)
**Secondary CTA:** Pagination controls, filter adjustments
**Information hierarchy:**
1. Session list (what sessions exist?)
2. Filters (how can I narrow the view?)
3. Pagination (how much data is there?)

**Visual hierarchy:**
1. Mission title + priority badge (left, primary info)
2. Duration badge (right, timer container, emerald accent)
3. Date/time (below title, secondary info)
4. Emerald accent bar (left edge, for mission-linked sessions only)

### 4.13 Statistics View Blueprint

```
CONTENT AREA (max-w-6xl)
│
│ ┌──Header─────────────────────────────────────────────────────┐
│ │ [BarChart3 icon]  Statistics                                │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Stat Cards Grid (3-col desktop, 2-col mobile)─────────────┐
│ │                                                             │
│ │ ┌─Total Focus───┐ ┌─Total Sess───┐ ┌─Avg Length──┐        │
│ │ │ 120h           │ │ 156          │ │ 45m         │        │
│ │ └────────────────┘ └───────────────┘ └────────────┘        │
│ │                                                             │
│ │ ┌─Current Streak─┐ ┌─Best Streak──┐ ┌─Focus Score─┐        │
│ │ │ 7d              │ │ 14d          │ │ 82          │        │
│ │ └────────────────┘ └───────────────┘ └────────────┘        │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Weekly Bar Chart───────────────────────────────────────────┐
│ │                                                             │
│ │ [7-day bar chart with hover tooltips]                       │
│ │ Mon: 30m  Tue: 180m  Wed: 45m  Thu: 90m  Fri: 60m        │
│ │ Today highlighted in emerald gradient                       │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
```

**Primary CTA:** None (analytics view)
**Secondary CTA:** Navigate to Wrapped for weekly summary, Monthly for long-term trends
**Information hierarchy:**
1. Key stats (overview metrics)
2. Weekly chart (visual trend)
3. Trend indicators (direction arrows)

### 4.14 Daily Review Blueprint

```
CONTENT AREA (max-w-6xl, app-grid-bg)
│
│ ┌──Header (centered)──────────────────────────────────────────┐
│ │                                                             │
│ │    [CalendarCheck icon in gradient container]               │
│ │    Daily Review                                             │
│ │    Today, Jul 19                                            │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Mini Stats Row (4-col)────────────────────────────────────┐
│ │                                                             │
│ │ ┌─Focus────┐ ┌─Missions─┐ ┌─Reflection┐ ┌─XP──────┐       │
│ │ │ 45m      │ │ 1 done   │ │ ✓ Written │ │ +50     │       │
│ │ │ 3 sess   │ │ 2 active │ │ mood: 4   │ │ 1 ach   │       │
│ │ └──────────┘ └──────────┘ └───────────┘ └─────────┘       │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Section Cards Grid─────────────────────────────────────────┐
│ │                                                             │
│ │ ┌─Focus Summary──┐ ┌─Distraction──┐ ┌─Hourly Chart─┐       │
│ │ │ Total: 45m     │ │ 15m total    │ │ [24h bars]   │       │
│ │ │ Longest: 25m   │ │ Top: Reddit  │ │ Peak: 10 AM  │       │
│ │ │ Deep: 1 sess   │ │ Peak: 3 PM   │ │              │       │
│ │ └────────────────┘ └──────────────┘ └──────────────┘       │
│ │                                                             │
│ │ ┌─Week Compare──┐ ┌─AI Rec───────┐ ┌─Timeline────┐        │
│ │ │ Today: 45m    │ │ "Try a 45m  │ │ [Chrono     │        │
│ │ │ Avg: 52m      │ │  session    │ │  list of    │        │
│ │ │ -13%          │ │  at 10 AM"  │ │  events]    │        │
│ │ └────────────────┘ └──────────────┘ └──────────────┘       │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
```

**Primary CTA:** None (review view)
**Secondary CTA:** Navigate to Reflection (if not written), Timer (if low focus), Replay (for animated review)
**Information hierarchy:**
1. Summary stats (quick overview)
2. Focus performance (deep metrics)
3. Distraction analysis (what went wrong)
4. Hourly chart (when was I productive)
5. Week comparison (am I improving?)
6. AI recommendation (what should I do differently?)
7. Timeline (full narrative)

### 4.15 Habit Tracker Blueprint

```
CONTENT AREA (max-w-6xl)
│
│ ┌──Header─────────────────────────────────────────────────────┐
│ │ [CheckCircle2 icon]  Habits                                │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Add Habit Button───────────────────────────────────────────┐
│ │ [+ Add Habit] → opens Dialog                               │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Habit List─────────────────────────────────────────────────┐
│ │                                                             │
│ │ ┌─Habit Row──────────────────────────────────────────┐      │
│ │ │ 💪 Exercise  [Daily]                               │      │
│ │ │                                                     │      │
│ │ │ Week view: [○][●][●][○][●][○][?]                  │      │
│ │ │            Mon Tue Wed Thu Fri Sat Sun              │      │
│ │ │                                                     │      │
│ │ │ 🔥 3-day streak                                    │      │
│ │ └─────────────────────────────────────────────────────┘      │
│ │                                                             │
│ │ ┌─Habit Row──────────────────────────────────────────┐      │
│ │ │ 📚 Reading  [Daily]                                │      │
│ │ │ Week view: [●][●][●][●][○][○][?]                  │      │
│ │ │ 🔥 4-day streak                                    │      │
│ │ └─────────────────────────────────────────────────────┘      │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
```

**Primary CTA:** "Add Habit" button
**Secondary CTA:** Tap day circle to mark completion, tap habit name for detail view
**Information hierarchy:**
1. Habit list (what habits am I tracking?)
2. Completion circles (did I do it today/this week?)
3. Streak counts (how consistent am I?)
4. Add button (create new habit)

**Visual hierarchy:**
1. Habit emoji/icon (colorful, eye-catching)
2. Today's circle (largest, highlighted)
3. Streak flame icon + number (achievement signal)
4. Week circles (pattern visualization)

### 4.16 Onboarding Flow Blueprint (Per-Step)

```
FULL SCREEN (bg-zinc-950, centered, max-w-xl)
│
│ ┌──Logo (centered)────────────────────────────────────────────┐
│ │ [MindGuard Logo, md size]                                   │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Progress Bar───────────────────────────────────────────────┐
│ │                                                             │
│ │ [11 segments, h-1 bars, emerald gradient fill]              │
│ │ "Discovering your interests..."  2/11                       │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Step Content (min-h-[340px])───────────────────────────────┐
│ │                                                             │
│ │ [AnimatePresence mode="wait", directional transitions]      │
│ │                                                             │
│ │ Step-specific content (varies per step)                     │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Navigation─────────────────────────────────────────────────┐
│ │                                                             │
│ │ [← Back]              [Continue →] or [Let's Begin →]     │
│ │                       or [Launch Dashboard →]               │
│ │                                                             │
│ │ [Skip] (optional, on steps 2 and 9 only)                   │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
```

**Background decoration:**
- Emerald glow orb: `left-1/2 top-1/4, h-[500px] w-[500px], bg-emerald-500/[0.04] blur-[120px]`
- Teal glow orb: `right-1/4 bottom-1/4, h-[350px] w-[350px], bg-teal-500/[0.03] blur-[100px]`

**Primary CTA per step:**
- Step 0: "Let's Begin"
- Steps 1–9: "Continue"
- Step 10: "Launch Dashboard"

**Secondary CTA per step:**
- Steps 1–10: "Back" (navigate to previous step)
- Steps 2, 9: "Skip" (optional steps)

**Spacing:** `mb-8` (logo → progress), `mb-6` (progress → content), `mt-8` (content → navigation)

### 4.17 Landing Page Blueprint

```
FULL SCREEN (bg-zinc-950, scrollable, no shell)
│
│ ┌──Hero Section (full viewport)───────────────────────────────┐
│ │                                                             │
│ │    [MindGuardHeroLogo 96px, pulse-glow]                     │
│ │                                                             │
│ │    Your AI Productivity Coach                               │
│ │    (gradient text, gradient-text class)                     │
│ │                                                             │
│ │    MindGuard learns how you work...                         │
│ │                                                             │
│ │    [Get Started Free]  (emerald gradient CTA)               │
│ │    [See how it works]  (ghost button, secondary)            │
│ │                                                             │
│ │    ┌─Auth Form (toggle sign-up/sign-in)──────────────┐      │
│ │    │ Email: [________]                                │      │
│ │    │ Password: [________]                             │      │
│ │    │ Confirm: [________]  (sign-up only)             │      │
│ │    │ [Get Started] / [Sign In]                       │      │
│ │    │ [Google OAuth] [GitHub OAuth]                   │      │
│ │    │ "Already have an account? Sign in"              │      │
│ │    └─────────────────────────────────────────────────┘      │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Social Proof Section───────────────────────────────────────┐
│ │                                                             │
│ │ "Join 10,000+ people who've reclaimed their focus"         │
│ │                                                             │
│ │ ┌─Testimonial───────────────────────────────────────┐       │
│ │ │ "I went from 2h to 5h+ deep work daily"          │       │
│ │ │ Sarah Chen · Senior Engineer at Stripe · 4.5★    │       │
│ │ │ 2h → 5h deep work                                 │       │
│ │ └───────────────────────────────────────────────────┘       │
│ │ (6 testimonial cards in responsive grid)                    │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──How It Works───────────────────────────────────────────────┐
│ │ 1. Tell us about you → 2. Meet your coach → 3. Protect    │
│ │ your focus                                                  │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Feature Grid───────────────────────────────────────────────┐
│ │ 6 feature cards with Lucide icons                          │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Privacy Section────────────────────────────────────────────┐
│ │ Trust signals                                               │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Pricing Section────────────────────────────────────────────┐
│ │ Free · Pro · Team                                          │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──FAQ Section────────────────────────────────────────────────┐
│ │ Accordion                                                   │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Final CTA──────────────────────────────────────────────────┐
│ │ "Ready to meet your coach?"  [Get Started Free]            │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Footer─────────────────────────────────────────────────────┐
│ │ Logo · Links · Copyright                                   │
│ └─────────────────────────────────────────────────────────────┘
```

**Primary CTA:** "Get Started Free" (appears in hero and final CTA sections)
**Secondary CTA:** "See how it works" (ghost button), Google/GitHub OAuth
**Information hierarchy:**
1. Value proposition headline (what is this?)
2. Auth form (how do I get in?)
3. Social proof (why should I trust this?)
4. Features (what does it do?)
5. Privacy (is my data safe?)
6. Pricing (how much does it cost?)
7. Final CTA (last chance to convert)

**Visual hierarchy:**
1. Gradient headline (largest text on page)
2. CTA buttons (emerald glow, prominent)
3. Testimonial avatars (human faces, trust signals)
4. Feature icons (Lucide, emerald-400)
5. Pricing cards (Free highlighted, Pro with badge)

**Scrolling behavior:** Full-page vertical scroll. Hero section takes full viewport. Each subsequent section scrolls into view with stagger reveal animations.

### 4.18 Command Palette Blueprint

```
OVERLAY (centered, backdrop blur, z-50)
│
│ ┌──Command Palette Container──────────────────────────────────┐
│ │                                                             │
│ │ ┌─Search Input───────────────────────────────────────┐      │
│ │ │ [🔍 Search commands...________]                    │      │
│ │ └────────────────────────────────────────────────────┘      │
│ │                                                             │
│ │ ┌─Results List───────────────────────────────────────┐      │
│ │ │                                                     │      │
│ │ │ Navigation                                          │      │
│ │ │ ┌─Dashboard───────┐  [G D]  home, overview         │      │
│ │ │ ┌─Life Dashboard──┐  [G L]  life, desktop          │      │
│ │ │ ┌─Mission─────────┐  [G M]  task, goal             │      │
│ │ │ ┌─Focus Timer─────┐  [G T]  pomodoro, session      │      │
│ │ │                                                     │      │
│ │ │ Actions                                             │      │
│ │ │ ┌─Start Focus Timer┐  quick start                  │      │
│ │ │ ┌─Go to Missions───┐  create, new                  │      │
│ │ │                                                     │      │
│ │ └────────────────────────────────────────────────────┘      │
│ │                                                             │
│ │ ↑↓ navigate  Enter select  Esc close                       │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
```

**Primary CTA:** Enter key (execute selected command)
**Secondary CTA:** Click on command row (mouse execution)
**Information hierarchy:**
1. Search input (what am I looking for?)
2. Results (what matches my search?)
3. Keyboard hints (how do I navigate this?)

**Visual hierarchy:**
1. Search input (auto-focused, full width)
2. Selected result (highlighted row)
3. Command icons (left, colored)
4. Shortcut badges (right, muted)

### 4.19 Notification Panel Blueprint

```
DROPDOWN PANEL (from Bell icon position in header)
│
│ ┌──Panel Header───────────────────────────────────────────────┐
│ │ Notifications                           [Mark all read ✓]   │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Notification List (ScrollArea)─────────────────────────────┐
│ │                                                             │
│ │ ┌─Notification Item──────────────────────────────────┐      │
│ │ │ [☕ Coffee]  You've been idle for 30 minutes       │      │
│ │ │              5 minutes ago  (unread: bold)          │      │
│ │ └─────────────────────────────────────────────────────┘      │
│ │                                                             │
│ │ ┌─Notification Item──────────────────────────────────┐      │
│ │ │ [🎯 Target]  Don't forget your active mission      │      │
│ │ │              2 hours ago  (read: normal)            │      │
│ │ └─────────────────────────────────────────────────────┘      │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Empty State────────────────────────────────────────────────┐
│ │ [BellOff]  No notifications yet                            │
│ └─────────────────────────────────────────────────────────────┘
```

**Primary CTA:** Click notification (navigate to relevant view)
**Secondary CTA:** "Mark all read" button
**Information hierarchy:**
1. Unread notifications (actionable items)
2. Read notifications (informational items)
3. Empty state (no items)

### 4.20 Daily Replay Blueprint

```
CONTENT AREA (max-w-6xl)
│
│ ┌──Header─────────────────────────────────────────────────────┐
│ │ [RotateCcw icon]  Daily Replay                              │
│ │ [← Jul 18]  Jul 19  [Jul 20 →]                            │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Controls───────────────────────────────────────────────────┐
│ │ [▶ Play]  [⏸ Pause]  Speed: [1x] [2x] [4x]              │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Summary Panel──────────────────────────────────────────────┐
│ │ Total: 45m  Sessions: 3  Missions: 1 done  Reflection: ✓  │
│ │ Longest: 25m  Best hour: 10 AM                             │
│ └─────────────────────────────────────────────────────────────┘
│
│ ┌──Event Timeline (animated replay)───────────────────────────┐
│ │                                                             │
│ │ ┌─Event───────┐  (active: emerald pulse ring)              │
│ │ │ [⏰ Clock]   │  Focus Session                            │
│ │ │ 10:00 AM    │  25 minutes                               │
│ │ │ emerald     │                                           │
│ │ └─────────────┘                                           │
│ │                                                             │
│ │ ┌─Event───────┐                                           │
│ │ │ [☕ Coffee]  │  Break                                   │
│ │ │ 10:25 AM    │  5 minutes                                │
│ │ │ amber       │                                           │
│ │ └─────────────┘                                           │
│ │                                                             │
│ └─────────────────────────────────────────────────────────────┘
```

**Primary CTA:** Play/Pause controls
**Secondary CTA:** Date navigation arrows, speed controls
**Information hierarchy:**
1. Current event (what's happening now in the replay?)
2. Timeline (what happened throughout the day?)
3. Summary (what were the totals?)
4. Controls (how do I navigate the replay?)

---

## Section 5: Dashboard Blueprint

### 5.1 Dashboard Philosophy & Vision

The dashboard is MindGuard's living room. It is the screen users see most often, the place they return to after every focus session, reflection, or break. It must feel like walking into a workspace that has been prepared for you — not a generic control panel, not a data dump, and certainly not a notification inbox.

**Core Principles (referencing UX Bible §14):**

1. **Personal Office, Not Control Panel** — Everything is where you left it. The lighting adjusts to your schedule. Your coach has a message tailored to this hour.
2. **Progressive Disclosure by Time** — Morning shows what you should do. Evening shows what you accomplished. The dashboard adapts to the moment.
3. **Zero Decision Fatigue** — The most important action is always visible within 2 seconds of scanning. No hunting. No scrolling to find the "start" button.
4. **Emotional Resonance** — Greeting copy changes based on streak, goal progress, and time of day. Never generic. Always personal.
5. **Widget Autonomy** — Every widget is self-contained, loadable independently, and can fail without breaking the dashboard skeleton.

### 5.2 The Three Zones

The dashboard is divided into three vertical zones, each with a distinct emotional purpose. This is not just layout — it is **information architecture driven by psychology**.

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌──── THE GREETING ZONE ────────────────────────────────┐  │
│  │  "Good morning, Alex. You're on a 5-day streak."      │  │
│  │  Quick Start CTA: [▶ Start Focus Session]              │  │
│  │  Desktop Tracker Status Badge                          │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──── THE ACTION ZONE ─────────────────────────────────┐  │
│  │  Today's Goal Widget                                   │  │
│  │  Daily Coach Widget                                    │  │
│  │  Suggested Focus Blocks                                │  │
│  │  Stat Cards (6 metrics)                                │  │
│  │  Active Mission Card                                   │  │
│  │  Recent Sessions                                       │  │
│  │  Distraction Summary                                   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──── THE REFLECTION ZONE ─────────────────────────────┐  │
│  │  AI Coach (full conversation card, spans 2 rows)      │  │
│  │  Timeline                                              │  │
│  │  Habit Tracker                                         │  │
│  │  AI Insights                                           │  │
│  │  Heatmap                                               │  │
│  │  Achievements                                          │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### 5.2.1 The Greeting Zone

**Emotional Purpose:** Make the user feel recognized. Not tracked, not monitored — *recognized*. The greeting zone says "I know who you are, I know when you're here, and I've prepared something for you."

**Contents:**
- Time-aware greeting (morning/afternoon/evening/midnight)
- Personalized motivational text (priority-ordered by goal progress, streak, time)
- Quick Start CTA button — the single most important action on the dashboard
- Desktop Tracker Status Badge (connected/offline indicator)

**Greeting Logic (from personalization.ts + dashboard-view.tsx):**

| Hour Range | Standard User | Night Owl |
|---|---|---|
| 5–12 | Good morning | Just winding down? |
| 12–17 | Good afternoon | Good afternoon |
| 17–21 | Good evening | Good evening |
| 21–5 | Burning the midnight oil | Ready for your night session? |

**Greeting Icon Mapping:**

| Hour Range | Icon | Gradient | Icon Color |
|---|---|---|---|
| < 12 | Sun (☀️) | `from-amber-500/20 to-orange-500/10` | `text-amber-400` |
| 12–18 | SunDim | `from-amber-500/15 to-yellow-500/10` | `text-amber-300/80` |
| > 18 | Moon (🌙) | `from-indigo-500/15 to-violet-500/10` | `text-indigo-300/80` |

**Motivational Text Priority Chain:**

1. Goal achieved (≥100%) → "Goal achieved today! 🎉 Consider extra deep work or wrap up early."
2. Streak ≥ 7 → "🔥 7-day streak! You're unstoppable — keep the momentum going."
3. Streak ≥ 3 → "Nice! 3-day streak in progress. Today is day 4."
4. Goal ≥ 80% → "You're almost there — keep pushing."
5. Goal ≥ 50% → "You're halfway to your 2h goal — keep pushing."
6. Goal > 0% → "45m done so far. 1h 15m left to hit your goal."
7. Primary-use specific → "Time to write some great code. Start a focused session and ship."
8. Active mission → "Focus on 'Complete coding tasks' — one session at a time."
9. Time-based fallback → "The morning is your best chance for deep work. Make it count."

**Quick Start CTA Specification:**

- Button label: "Start Focus Session" (primary: "Let's Begin" on first visit)
- Icon: `Play` (▶) with `ArrowUpRight` hover reveal
- Style: `bg-gradient-to-b from-emerald-500 to-emerald-600`, `shadow-lg shadow-emerald-500/20`
- Hover: `from-emerald-400 to-emerald-500`, `shadow-emerald-500/30`
- Height: `h-11` (44px)
- Width: `w-full` on mobile, `sm:w-auto` on desktop
- Sound: `playClick()` on click
- Action: `setView('timer')` — navigates to focus timer view

**Desktop Tracker Status Badge:**

- Connected state: emerald icon, "Connected" badge, shows current app name
- Offline state: zinc icon, "Offline" badge, "Install the desktop companion for real-time tracking" copy
- Size: compact card, `p-3 sm:p-4`
- Position: right side of greeting, top-right corner
- Update: polls `/api/desktop/status` every 30 seconds

#### 5.2.2 The Action Zone

**Emotional Purpose:** Give the user clarity about today's progress and the next optimal action. This zone answers "What should I do right now?" and "How am I doing today?"

**Contents (in priority order):**

1. **Today's Goal Widget** — Progress bar showing focus minutes vs. daily goal
2. **Daily Coach Widget** — Single contextual tip with icon and accent color
3. **Suggested Focus Blocks** — Time-aware focus block recommendations
4. **Stat Cards Grid** — 6 key metrics in a 2×3 (mobile) or 3×2 (desktop) grid
5. **Active Mission Card** — Current mission with "Start Focus" CTA or empty state
6. **Recent Sessions List** — Last 5 sessions with mission title, time ago, duration
7. **Distraction Summary** — Today's distraction minutes, top distracting apps

**Today's Goal Widget Specification:**

| Property | Value |
|---|---|
| Icon | Target (🎯) |
| Title label | "Today's Goal" (uppercase tracking-wider) |
| Value display | AnimatedNumber for focus minutes |
| Secondary | "/ {goalMinutes} formatted" |
| Progress bar | `h-1.5`, animated width from 0% to {pct}% |
| Bar color (≥100%) | `from-emerald-400 to-teal-300` |
| Bar color (≥50%) | `from-emerald-500/80 to-teal-400/60` |
| Bar color (<50%) | `from-emerald-500/50 to-teal-400/30` |
| Badge (≥100%) | "Achieved" badge with CheckCircle2 icon |
| Footer text | Remaining time or "Goal achieved!" |
| Card style | Standard widget card |

**Daily Coach Widget Specification:**

| Property | Value |
|---|---|
| Icon | Dynamic (Lightbulb, ShieldAlert, TrendingUp, Brain, Flame, Target) |
| Title label | "Daily Coach" (uppercase tracking-wider) |
| Tip text | Context-aware string from getDailyCoachTip() |
| Accent color | Dynamic based on tip context |
| Card style | Standard widget card |

**Coach Tip Priority Chain:**

1. Distractions > 30 min + known distraction → red ShieldAlert, "45m on distractions today, especially Instagram."
2. Focus score < 40 → amber TrendingUp, "Your focus score needs a boost."
3. Streak = 0 → emerald Flame, "No streak yet. Complete one session today."
4. Goal < 30% after 2 PM → emerald Target, "Only 45m toward your 2h goal."
5. Primary-use specific → emerald Brain, "Try a 90-minute deep work block for complex coding."
6. Generic → emerald Lightbulb, "Your best work happens in uninterrupted blocks."

**Suggested Focus Blocks Widget Specification:**

| Property | Value |
|---|---|
| Icon | CalendarClock |
| Title label | "Suggested Focus Blocks" |
| Data source | `getFocusBlockSuggestions(workSchedule, bestFocusHours)` |
| Current block | Highlighted with emerald border + "NOW" label |
| Past blocks | Shown with time only |
| Items per row | Up to 3 blocks |

**Focus Block Logic:**

- If `bestFocusHours` has data → use actual peak hours
- If `workSchedule = 'morning'` → suggest 9 AM + 11 AM
- If `workSchedule = 'evening'` → suggest 2 PM + 4 PM
- If `workSchedule = 'night'` → suggest 8 PM + 10 PM
- Default → suggest 9 AM + 2 PM

**Stat Cards Grid — 6 Metrics:**

| # | Icon | Label | Value Source | Trend | Sub-label |
|---|---|---|---|---|---|
| 1 | Clock | Today's Focus | `todayFocusMinutes` | vs yesterday | "X sessions" |
| 2 | Timer | Weekly Focus | `weeklyFocusMinutes` | vs last week | "this week" |
| 3 | TrendingUp | Total Focus | `totalFocusMinutes` | none | "all time" |
| 4 | Activity | Avg Session | `avgSessionMinutes` | none | "per session" |
| 5 | Flame | Current Streak | `currentStreak` | none | "consecutive days" |
| 6 | Zap | Focus Score | `smartFocusScore` | vs yesterday | "/ 100 · {label}" |

**Stat Card Design Specification:**

| Property | Value |
|---|---|
| Icon container | `h-9 w-9 rounded-lg bg-emerald-500/[0.08]` |
| Icon color | `text-emerald-400/80` |
| Label | `text-[11px] font-medium uppercase tracking-wider text-zinc-500` |
| Value | `text-2xl font-semibold tabular-nums tracking-tight text-zinc-50` (AnimatedNumber) |
| Trend icon | TrendingUp/TrendingDown/Minus |
| Trend color | up: `text-emerald-400`, down: `text-red-400/70`, flat: `text-zinc-500` |
| Sub text | `text-[11px] text-zinc-600` |
| Progress bar | `h-1 w-full` (only on Focus Score card) |
| Hover effect | `whileHover: { y: -2 }` |
| Card style | Standard widget card with `p-4 sm:p-5` |

**Active Mission Card Specification:**

| State | Contents |
|---|---|
| Has mission | Priority badge (high/medium/low), title, description, session count, "Start Focus" button |
| No mission | Empty state with Target icon, "No active mission" text, "Create Mission" button |

**Active Mission Card — Present State:**

- Left accent: `2px` emerald gradient line
- Priority badge color: high=red, medium=amber, low=zinc
- Session count: Timer icon + "{N} sessions"
- CTA: "Start Focus" ghost button with Play icon → `setView('timer')`
- Navigation: ChevronRight ghost button → `setView('mission')`

**Active Mission Card — Empty State:**

- Icon: `Target` at `h-6 w-6 text-zinc-700` inside `h-14 w-14 rounded-2xl bg-white/[0.03]`
- Title: "No active mission"
- Description: "Create one to start tracking your focus"
- CTA: "Create Mission" outline button → `setView('mission')`
- Card style: dashed border `border-dashed`

**Recent Sessions List Specification:**

| Property | Value |
|---|---|
| Max items | 5 sessions |
| Item layout | flex row: dot + title + time ago | duration |
| Session dot | `h-1.5 w-1.5 rounded-full` — emerald if mission, zinc if free focus |
| Title | mission.title or "Free Focus" |
| Time ago | `timeAgo(session.startedAt)` |
| Duration | Timer icon + `formatDuration(session.duration)` in emerald |
| Hover | `hover:bg-white/[0.02]` |
| Divider | `divide-y divide-white/[0.04]` |
| Empty state | Clock icon, "No sessions yet", "Complete your first focus session" |
| Max height | `max-h-96 overflow-y-auto scrollbar-thin` |

**Distraction Summary Widget Specification:**

| State | Contents |
|---|---|
| No tracker + no data | "Connect the desktop tracker to see distraction insights" |
| Tracker connected + data | Total distraction minutes, top distracting apps list |
| Tracker connected + 0 distractions | "No distractions detected — great focus!" |

**Distraction Display Rules:**

- If distractionMinutes > 30 → red ShieldAlert icon, red accent
- If distractionMinutes ≤ 30 → zinc ShieldAlert icon
- Top apps: list format `{name} — {minutes}m`, max 4 apps
- Known distraction footer: "Your known distraction: {biggestDistraction}"
- Max height: `max-h-24 overflow-y-auto`

#### 5.2.3 The Reflection Zone

**Emotional Purpose:** Give the user a sense of progress over time. This zone answers "How have I been doing?" and "What patterns should I notice?" It is the zone that builds long-term motivation and identity change.

**Contents (in Insights grid layout):**

```
Desktop (3-col, 2-row grid):
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│                  │ │   Timeline       │ │  Habit Tracker   │
│   AI Coach       │ │                  │ │                  │
│   (row-span-2)   │ ├──────────────────┤ ├──────────────────┤
│                  │ │   AI Insights    │ │  Heatmap +       │
│                  │ │                  │ │  Achievements    │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

### 5.3 Widget Priority & Ordering

Widgets appear in a specific order determined by the user's **primary use** and **goals**. The personalization engine (`personalization.ts → getRecommendedWidgets()`) returns a priority list that determines which widgets appear first and which are added conditionally.

#### 5.3.1 Default Widget Priority

All users see these widgets in this order, regardless of persona:

| Priority | Widget ID | Title | Always Present? |
|---|---|---|---|
| P0 | greeting | Greeting + Quick Start | Yes |
| P1 | today-goal | Today's Goal | Yes |
| P1 | daily-coach | Daily Coach Tip | Yes |
| P1 | focus-blocks | Suggested Focus Blocks | Yes |
| P2 | stat-cards | Stats Grid (6 metrics) | Yes |
| P3 | active-mission | Active Mission Card | Yes (empty state if no mission) |
| P3 | recent-sessions | Recent Sessions | Yes (empty state if no sessions) |
| P3 | distraction-summary | Distraction Summary | Yes (tracker-dependent) |
| P4 | ai-coach | AI Coach Card | Yes (empty state if no data) |
| P4 | timeline | Today's Timeline | Yes (empty state if no events) |
| P4 | habit-tracker | Habit Tracker | Yes (empty state if no habits) |
| P5 | ai-insights | AI Insights | Yes (empty state until patterns emerge) |
| P5 | heatmap | Activity Heatmap | Yes |
| P6 | achievements | Achievements | Yes |

#### 5.3.2 Widget Ordering per Primary Use

The personalization engine adjusts the **display emphasis** of widgets based on `primaryUse`. While all widgets are present, the visual hierarchy (size, position, first impression) shifts:

| Primary Use | First 3 Emphasis Widgets | Logic |
|---|---|---|
| studying | heatmap, session-stats, quick-start | Students need to see patterns over time and track study volume |
| coding | timeline, achievements, quick-start | Developers need chronological context and milestone motivation |
| writing | session-stats, distraction-log, quick-start | Writers need session length tracking and distraction awareness |
| creative | achievements, timeline, quick-start | Creative workers need milestone celebration and flow tracking |
| work | heatmap, timeline, quick-start | Business users need weekly patterns and daily flow visibility |
| general | heatmap, session-stats, quick-start | Default: patterns + volume + action |

**Implementation Detail:** Widget ordering does NOT physically rearrange widgets in the grid. Instead, it adjusts the **Section Headers**, **emphasis styling**, and **data density** of the relevant widgets. The AI Coach card always spans 2 rows in column 1 of the Insights section; this position is invariant.

#### 5.3.3 Goal-Based Widget Additions

Beyond primary use, the user's onboarding goals add conditional widget emphasis:

| Goal | Widget Added/Emphasized | Condition |
|---|---|---|
| `reduce_distractions` | distraction-log (Distraction Summary) | If not already prominent |
| `build_streak` | streak (within Stat Cards) | If streak card isn't already emphasized |
| `deep_work` | session-stats | If not already prominent |
| `improve_score` | focus-score (within Stat Cards) | If focus score card isn't already emphasized |

### 5.4 Widget Sizes & Responsive Layout

#### 5.4.1 Desktop Layout (≥1024px — 3 columns)

```
Greeting Zone: Full-width row
  ┌───────────────────────────────────────────────────────┐
  │  Greeting Icon + Text           Tracker Status Badge  │
  │  [▶ Start Focus Session]                              │
  └───────────────────────────────────────────────────────┘

Action Zone — Today's Progress: 3-column grid
  ┌──────────┐ ┌──────────┐ ┌──────────┐
  │ Goal      │ │ Coach    │ │ Blocks   │
  ├──────────┤ ├──────────┤ ├──────────┤
  │ Stats (6) │ — 3-col grid of stat cards             │
  ├──────────┤ ├──────────┤ ├──────────┤
  │ Mission   │ │ Sessions │ │ Distract │
  └──────────┘ └──────────┘ └──────────┘

Reflection Zone — Insights: 3-col × 2-row grid
  ┌──────────┐ ┌──────────┐ ┌──────────┐
  │ Coach     │ │ Timeline │ │ Habits   │
  │ (row-2)   │ ├──────────┤ ├──────────┤
  │           │ │ Insights │ │ Heatmap  │
  │           │ │          │ │+Achieve  │
  └──────────┘ └──────────┘ └──────────┘
```

**Column widths:** Equal `lg:grid-cols-3` with `gap-4` (16px).
**AI Coach:** Spans both rows in column 1 (`lg:row-span-2`).
**Heatmap + Achievements:** Stack vertically in column 3 (`flex flex-col gap-4`).

#### 5.4.2 Tablet Layout (768–1023px — 2 columns)

```
Greeting Zone: Full-width row (same as desktop)

Action Zone: 2-column grid
  ┌──────────┐ ┌──────────┐
  │ Goal      │ │ Coach    │
  ├──────────┤ ├──────────┤
  │ Blocks    │ (full width)
  ├──────────┤ ├──────────┤
  │ Stats: 2×3 grid
  ├──────────┤ ├──────────┤
  │ Mission   │ │ Sessions │
  ├──────────┤ ├──────────┤
  │ Distraction │
  └──────────┘

Reflection Zone: 2-column grid
  ┌──────────┐ ┌──────────┐
  │ Coach     │ │ Timeline │
  │           │ │          │
  ├──────────┤ ├──────────┤
  │ Insights  │ │ Habits   │
  ├──────────┤ ├──────────┤
  │ Heatmap   │ │ Achieve  │
  └──────────┘ └──────────┘
```

**AI Coach:** No row-span on tablet. Appears as regular card.
**Stats grid:** `grid-cols-2` (2 cards per row, 3 rows).

#### 5.4.3 Mobile Layout (<768px — 1 column)

```
Greeting Zone: Full-width row
  ┌─────────────────────────┐
  │ Greeting + Tracker Badge│
  │ [▶ Start Focus Session] │
  └─────────────────────────┘

Action Zone: Single column
  ┌─────────────────────────┐
  │ Today's Goal            │
  ├─────────────────────────┤
  │ Daily Coach             │
  ├─────────────────────────┤
  │ Focus Blocks            │
  ├─────────────────────────┤
  │ Stats: 2-col grid (3 rows)
  ├─────────────────────────┤
  │ Active Mission          │
  ├─────────────────────────┤
  │ Recent Sessions         │
  ├─────────────────────────┤
  │ Distraction Summary     │
  └─────────────────────────┘

Reflection Zone: Single column
  ┌─────────────────────────┐
  │ AI Coach                │
  ├─────────────────────────┤
  │ Timeline                │
  ├─────────────────────────┤
  │ Habit Tracker           │
  ├─────────────────────────┤
  │ AI Insights             │
  ├─────────────────────────┤
  │ Heatmap (compact view)  │
  ├─────────────────────────┤
  │ Achievements            │
  └─────────────────────────┘
```

**Mobile-specific adaptations:**
- Quick Start CTA becomes `w-full` instead of `sm:w-auto`
- Stats grid becomes `grid-cols-2` (3 rows of 2 cards)
- Heatmap switches to **compact summary view** (active days, avg/day, habits count) with "View full heatmap →" toggle
- Tracker badge simplifies to icon + connected label
- Cards use `p-4` padding (vs `p-5 sm:p-5` on desktop)
- Greeting text reduces to `text-[1.65rem]` from `text-[1.65rem]`
- All widget grids become single column

#### 5.4.4 Widget Card Design Specifications

Every widget card follows a unified design system:

```
┌──────────────────────────────────────────────────────┐
│ [Icon] Widget Title (uppercase, tracking-wider)      │
│                                              [Action]│
│                                                      │
│  Widget content area                                 │
│                                                      │
│  Optional footer / sub-text                          │
└──────────────────────────────────────────────────────┘
```

| Property | Default | Highlighted |
|---|---|---|
| Border | `border-white/[0.06]` | `border-emerald-500/20` |
| Background | `bg-white/[0.02]` | `bg-emerald-500/[0.04]` |
| Padding (mobile) | `p-4` | `p-4` |
| Padding (desktop) | `p-5` / `p-6` | `p-5` / `p-6` |
| Border radius | `rounded-xl` (12px) | `rounded-xl` |
| Hover | `hover:border-white/[0.12]` + `hover:bg-white/[0.04]` | Same |
| Title style | `text-xs font-medium uppercase tracking-wider text-zinc-500` | Same |
| Content primary | `text-zinc-200` | `text-zinc-100` |
| Content secondary | `text-zinc-400` | `text-zinc-300` |
| Content tertiary | `text-zinc-500` | `text-zinc-400` |
| Content muted | `text-zinc-600` | `text-zinc-500` |
| Section header | Icon + title + horizontal divider line |
| Section header icon | `h-3.5 w-3.5 text-emerald-400/60` |
| Section header title | `text-xs font-semibold uppercase tracking-wider text-zinc-400` |
| Section header divider | `flex-1 h-px bg-white/[0.04]` |

**Card CSS Classes (shared):**
```
card-glow glass-card glass-glow-edge border-white/[0.06] bg-white/[0.02]
```

**Card hover animation (stat cards only):**
```
whileHover: { y: -2, transition: { duration: 0.2 } }
```

### 5.5 AI Coach Card — Detailed Blueprint

The AI Coach is the most complex widget on the dashboard. It is a conversation card that combines static data display, AI-generated content, and interactive chat.

#### 5.5.1 Coach Card States

| State | Visual | Copy | CTA |
|---|---|---|---|
| Loading | Skeleton bars for greeting, comparison, AI content | — | — |
| Error | AlertCircle icon, "Couldn't load today's briefing." | Error message | "Try again" button |
| Empty (no sessions) | Sparkles icon in emerald container | "{greeting}, {name}. Start your first focus session and I'll craft a personalized daily briefing." | "Start your day" button → timer |
| Active (has data) | Full coach card | Personalized greeting + comparison + AI tabs | Chat input + quick actions |

#### 5.5.2 Coach Card Layout (Active State)

```
┌──────────────────────────────────────────┐
│ 🌅 AI Daily Coach        🎯 📊 AI       │
│                                          │
│ Good morning, Alex.                      │
│                                          │
│ ┌──Today──┐ ┌──Yesterday──┐              │
│ │ 45 min  │ │ 30 min      │              │
│ └─────────┘ └─────────────┘              │
│ [+15% vs yesterday] ChangeBadge           │
│                                          │
│ ┌──Tabs──────────────────────────────┐   │
│ │ [Briefing] [Morning] [Night]       │   │
│ └────────────────────────────────────┘   │
│                                          │
│ ┌──AI Content────────────────────────┐   │
│ │ 🧠 AI Insight                      │   │
│ │ Personalized daily briefing text   │   │
│ │ (max-h-64, scrollable)             │   │
│ └────────────────────────────────────┘   │
│                                          │
│ ┌──Summary──┐                   [🔄]     │
│ │ Coach summary text                 │   │
│ └────────────────────────────────────┘   │
│                                          │
│ [Ask the coach... input] [Send]          │
│                                          │
│ Chat history (scrollable, max-h-48)      │
│                                          │
│ [▶ Start focus] [🎯 Mission] [📖 Reflect]│
└──────────────────────────────────────────┘
```

#### 5.5.3 Coach Card — Today vs Yesterday

- Two side-by-side boxes: Today minutes (large, emerald) vs Yesterday minutes (medium, zinc)
- ChangeBadge: percentage comparison (+15% vs yesterday in emerald, -5% in red, "No data" in zinc, "Fresh start" in emerald for first day)

#### 5.5.4 Coach Card — AI Content Tabs

Three tabs: Briefing, Morning Plan, Night Review.

| Tab | API Mode | When Shown | Content Type |
|---|---|---|---|
| Briefing | `briefing` | Default | General daily coaching summary |
| Morning | `morning_plan` | If morning hours (5–12) | Structured morning plan with time blocks |
| Night | `night_review` | If evening hours (17+) | End-of-day review and reflection prompt |

**Auto-selection logic:** On initial load, if `coach.aiMorningPlan` exists and it's morning hours, auto-select Morning tab. If `coach.aiNightReview` exists and it's evening, auto-select Night tab. Otherwise, default to Briefing.

**Loading state:** "AI is thinking..." with spinning Loader2 icon inside emerald-bordered container.

**Fallback (no AI content):** Show recommendations list (from `coach.recommendations`) with clickable items that navigate to timer/mission/reflection views.

#### 5.5.5 Coach Card — Chat Input

- Input field: `h-7 w-full rounded-md border-white/[0.06] bg-white/[0.02]`
- Placeholder: "Ask the coach..."
- Send button: ghost button with Send icon
- Disabled when: empty input OR chatLoading
- On Enter key: trigger send
- Chat history: max-h-48 overflow-y-auto, alternating user (white bg) and coach (emerald bg) messages

#### 5.5.6 Coach Card — Quick Actions

Three action buttons at the bottom:

| Button | Icon | Action | Style |
|---|---|---|---|
| Start focus | Play | `setView('timer')` | outline ghost |
| Mission | Target | `setView('mission')` | outline ghost |
| Reflect | BookOpen | `setView('reflection')` | outline ghost |

All buttons: `h-7 gap-1.5 border-white/[0.06] bg-white/[0.02] text-[11px] text-zinc-300`

### 5.6 AI Insights Widget — Detailed Blueprint

The AI Insights widget shows pattern-based, trend-based, achievement-based, and suggestion-based insights discovered from the user's data.

#### 5.6.1 Insight Types & Visual Styles

| Type | Border Left | Icon Background | Icon Color | Label | Label Color |
|---|---|---|---|---|---|
| pattern | `border-l-emerald-500/60` | `bg-emerald-500/[0.08]` | `text-emerald-400` | "Pattern" | `text-emerald-400/80` |
| trend | `border-l-amber-500/60` | `bg-amber-500/[0.08]` | `text-amber-400` | "Trend" | `text-amber-400/80` |
| achievement | `border-l-purple-500/60` | `bg-purple-500/[0.08]` | `text-purple-400` | "Achievement" | `text-purple-400/80` |
| suggestion | `border-l-sky-500/60` | `bg-sky-500/[0.08]` | `text-sky-400` | "Suggestion" | `text-sky-400/80` |

#### 5.6.2 Insight Card Layout

```
┌─── left border accent ─────────────────────┐
│ [Icon]  Pattern · {metric}                   │
│         {title}                               │
│         {description} (line-clamp-2)          │
│         {value} (accent colored)              │
└──────────────────────────────────────────────┘
```

- Size: `rounded-lg border p-3`
- Hover: `hover:bg-white/[0.03]`
- Stagger animation: `delay: index * 0.06, duration: 0.4`
- Max height container: `max-h-96 overflow-y-auto`

#### 5.6.3 Insight Empty State

- Sparkles icon in `h-12 w-12 rounded-xl bg-white/[0.03]`
- "No insights yet"
- "Complete a few focus sessions to unlock patterns"

### 5.7 Heatmap Widget — Detailed Blueprint

#### 5.7.1 Heatmap Data Structure

- Data source: `/api/heatmap` + `/api/habits/entries`
- Time range: Last 90 days (not 365 — reduced for performance and mobile friendliness)
- Each day: `{ date, minutes, sessions, habitCompleted }`
- Habit overlay: amber `h-[3px] w-[3px] rounded-full bg-amber-400/60` dot on habit-completed days

#### 5.7.2 Heatmap Color Scale

| Minutes | Color Class | Meaning |
|---|---|---|
| 0 | `bg-white/[0.03]` | No activity |
| < 15 | `bg-emerald-500/20` | Light activity |
| 15–30 | `bg-emerald-500/35` | Moderate |
| 30–60 | `bg-emerald-500/50` | Good session |
| 60–120 | `bg-emerald-500/65` | Strong day |
| > 120 | `bg-emerald-500/80` | Exceptional day |

#### 5.7.3 Heatmap Desktop View

- Grid: columns of weeks, rows of days (7 rows per column)
- Cell size: `h-[10px] w-[10px] rounded-[2px]`
- Gap: `gap-[3px]` between cells
- Hover: `hover:ring-1 hover:ring-emerald-500/40`
- Tooltip: absolute positioned card with date, minutes, sessions, habit count, mission name
- Legend: "Less → [5 cells] → More | ○ Habits"
- Stats line: "X active · Ym total · Z habit days"

#### 5.7.4 Heatmap Mobile View

**Default: Compact summary** (not the full grid)

```
┌──────────────────────────────────────┐
│ ┌─── Active ───┐ ┌── Avg/day ──┐ ┌── Habits ──┐ │
│ │    45        │ │    32m      │ │    12d     │ │
│ └──────────────┘ └─────────────┘ └─────────────┘ │
│                                                    │
│ View full heatmap →                                │
└────────────────────────────────────────────────────┘
```

- Three stat boxes: active days, avg minutes/day, habit days
- Toggle button: "View full heatmap →" / "Show summary"
- Full grid view: shows last 8 weeks with `min-w-[320px]` and horizontal scroll

### 5.8 Timeline Widget — Detailed Blueprint

#### 5.8.1 Timeline Event Types & Visual Styles

| Event Type | Icon | Color Classes | Label |
|---|---|---|---|
| session | Clock | emerald bg/border/text | "Focus Session" |
| reflection | BookOpen | amber bg/border/text | "Reflection" |
| mission_completed | Trophy | purple bg/border/text | "Mission Done" |
| break | Coffee | amber bg/border/text | "Break" |
| mission_created | PlusCircle | sky bg/border/text | "New Mission" |
| achievement_unlocked | Sparkles | purple bg/border/text | "Achievement" |

#### 5.8.2 Timeline Grouping Logic

Events are grouped by a `group` field. Consecutive events with the same group ID are clustered:

- Single event: full detail (title, subtitle, time, type, duration)
- Multi-event cluster: group header ("Cluster · 9:00 AM – 10:30 AM · 4 events"), then nested event rows
- Cluster container: `rounded-lg border border-white/[0.04] bg-white/[0.01] p-2`

#### 5.8.3 Timeline Visual Structure

```
┌──────────────────────────────────────────┐
│ Today's Timeline            12 events    │
│                                          │
│ ── decorative gradient line ──           │
│                                          │
│ ● [22px circle, emerald]                │
│   Focus Session                          │
│   "Complete coding tasks" 25m            │
│                                          │
│ ● [22px circle, amber]                  │
│   Reflection                             │
│   "Morning journaling"                   │
│                                          │
│ ── cluster ──                            │
│ ● Cluster · 9:00 AM – 10:30 AM · 4 evts │
│   [16px sub-circles stacked]             │
│   ┌ contained events ──────────────┐    │
│   │ event 1, event 2, event 3, ... │    │
│   └─────────────────────────────────┘    │
└──────────────────────────────────────────┘
```

- Decorative line: `absolute left-[10px] w-px bg-gradient-to-b from-emerald-500/30 via-white/[0.08] to-transparent`
- Primary node: `h-[22px] w-[22px] rounded-full border`
- Sub-node: `h-[16px] w-[16px] rounded-full border`
- Max height: `max-h-96 overflow-y-auto`
- Empty state: Target icon, "No activity yet today", "Start a focus session to begin"

### 5.9 Achievements Widget — Detailed Blueprint

#### 5.9.1 Achievement Categories

| Category | Icon | Color | Achievement Types |
|---|---|---|---|
| Focus | Brain | `text-emerald-400` | first_focus, deep_worker |
| Consistency | Flame | `text-amber-400` | streak_7, streak_30 |
| Reflection | Sunrise | `text-violet-400` | night_owl, early_bird |
| Milestones | Trophy | `text-yellow-400` | hours_100, mission_master |

#### 5.9.2 Achievement Card Layout

```
┌──────────────────────────────────────────┐
│ [9×9 icon/emoji]   {title}      +{xp} XP │
│                    {description}           │
│                    {progress bar}          │
│                    {progress text}         │
│                    {estimated remaining}   │
└──────────────────────────────────────────┘
```

**Unlocked state:**
- Icon: actual Lucide icon or emoji fallback
- Container: `bg-emerald-500/10`
- Border: `border-emerald-500/20 bg-emerald-500/[0.04]`
- Glow: `shadow-[0_0_20px_-4px_rgba(16,185,129,0.15)]`
- Progress bar: `from-emerald-400 to-teal-400`
- Footer: "Unlocked {date}"

**Locked state:**
- Icon: Lock icon (`text-zinc-600`)
- Container: `bg-white/[0.03]`
- Border: `border-white/[0.04] bg-white/[0.01]`
- Progress bar: `from-zinc-600 to-zinc-500`
- Opacity: `opacity-70 hover:opacity-90`
- Footer: "Est. {remaining time}" or progress percentage

#### 5.9.3 Achievement Emoji Fallback Map

| Achievement Type | Emoji |
|---|---|
| first_focus | ✨ |
| streak_7 | 🔥 |
| streak_30 | 🏆 |
| hours_100 | ⏰ |
| night_owl | 🦉 |
| early_bird | 🐦 |
| deep_worker | 🧠 |
| mission_master | 👑 |

#### 5.9.4 Level & XP Display

- Total XP: sum of all unlocked achievement XP rewards
- Level: `Math.floor(totalXp / 500) + 1`
- Header display: `Level {N} · {totalXp.toLocaleString()} XP`
- Unlocked count: `{unlocked} / {total} unlocked` in emerald container

### 5.10 Habit Tracker Widget — Detailed Blueprint

#### 5.10.1 Habit Tracker States

| State | Visual |
|---|---|
| Loading | Skeleton bars |
| Error | AlertCircle, "Couldn't load habits", "Try again" |
| Empty | "No habits yet. Start building positive routines!", "Add Habit" button |
| Active | List of habit rows with streak indicators and day circles |

#### 5.10.2 Habit Row Layout

```
┌──────────────────────────────────────────┐
│ {emoji} {name}                  {streak}d │
│        {description}            [delete]  │
│ [30 day circles — last 30 days]           │
└──────────────────────────────────────────┘
```

- Day circle: `h-[10px] w-[10px] rounded-[2px]`, filled if completed, empty if not
- Today circle: ring indicator `ring-1 ring-emerald-500/40`
- Streak display: Flame icon if streak ≥ 7 (emerald), ≥ 3 (amber), else zinc
- Delete button: Trash2 icon, opacity-0 → opacity-100 on group hover
- Completed today: `border-emerald-500/20 bg-emerald-500/[0.04]`
- Not completed: `border-white/[0.04] bg-white/[0.01]`

#### 5.10.3 Add Habit Modal

- Trigger: "Add Habit" button (emerald gradient)
- Preset habits: 10 options (Exercise, Reading, Meditation, Journaling, Drink Water, Sleep 8h, No Social Media, Walk Outside, Healthy Eating, Deep Work)
- Custom form: name, description, frequency (daily/weekly), color picker (8 colors)
- Dialog: `border-white/[0.06] bg-zinc-950 sm:max-w-md`

#### 5.10.4 Habit Preset Data

| Preset | Emoji | Color |
|---|---|---|
| Exercise | 💪 | #10b981 |
| Reading | 📚 | #6366f1 |
| Meditation | 🧘 | #8b5cf6 |
| Journaling | 📝 | #f59e0b |
| Drink Water | 💧 | #06b6d4 |
| Sleep 8h | 😴 | #3b82f6 |
| No Social Media | 📵 | #ef4444 |
| Walk Outside | 🚶 | #22c55e |
| Healthy Eating | 🥗 | #14b8a6 |
| Deep Work | 🧠 | #f97316 |

### 5.11 Dashboard State Transitions

The dashboard is not static. It transitions between distinct states based on user lifecycle, data availability, and time of day.

#### 5.11.1 State Transition Matrix

| State | Trigger | What Changes | Emotional Goal |
|---|---|---|---|
| **First Visit** | User completes onboarding, opens dashboard for first time | Greeting: "Ready to start your focused day?", Empty states on all data widgets, Quick Start CTA prominent, Coach: "Start your first focus session" | Excitement + clarity. No overwhelm. |
| **Daily Active** | User has ≥1 session today, goal < 100% | Goal progress visible, Stats updating, Coach has data, Timeline has events | Momentum + progress awareness |
| **Goal Achieved** | `todayFocusMinutes ≥ focusGoalMinutes` | Goal bar full + "Achieved" badge, Celebration copy: "Goal achieved! 🎯", Coach shifts to celebration tone | Pride + accomplishment |
| **Returning After Absence** | No sessions in ≥3 days | Greeting: "Welcome back" (no guilt, no shame), Coach: "A fresh start — no pressure", Streak resets but no judgment | Re-engagement without guilt |
| **No Data Yet** | New user, no sessions, no heatmap data | All widgets show empty states, Heatmap: all white cells, Stats: all zeros, Timeline: "No activity yet today" | Encouragement. Not emptiness. |
| **Power User** | User has ≥50 sessions, ≥7-day streak, score ≥70 | Compact stats, More AI insights, Advanced coach features, Richer heatmap | Mastery + depth |
| **Night Session** | User opens dashboard between 21:00–5:00 | Night-aware greeting, Shorter recommended sessions (15–25 min), Coach night-specific tips | Accommodation + gentleness |

#### 5.11.2 Empty Dashboard State (First-Time User)

When a user first sees the dashboard after onboarding, every data-dependent widget shows an empty state. This is NOT a negative experience — it's a **blank canvas** with encouraging copy.

**Empty State Copy for Each Widget:**

| Widget | Empty Icon | Empty Title | Empty Description | Empty CTA |
|---|---|---|---|---|
| Today's Goal | — | — | "0m / 2h remaining" (shows goal even with 0 progress) | — |
| Daily Coach | Lightbulb | — | "Start your first session to unlock personalized tips." | — |
| Active Mission | Target | "No active mission" | "Create one to start tracking your focus" | "Create Mission" |
| Recent Sessions | Clock | "No sessions yet" | "Complete your first focus session" | — |
| Distraction Summary | — | — | "Connect the desktop tracker to see distraction insights" | — |
| AI Coach | Sparkles | "{greeting}, {name}." | "Start your first focus session and I'll craft a personalized daily briefing." | "Start your day" |
| Timeline | Target | "No activity yet today" | "Start a focus session to begin" | — |
| Habit Tracker | — | "No habits yet" | "Start building positive routines!" | "Add Habit" |
| AI Insights | Sparkles | "No insights yet" | "Complete a few focus sessions to unlock patterns" | — |
| Heatmap | — | — | All cells white/[0.03], stats show 0 active days | — |
| Achievements | Trophy | (Shows locked achievements with progress 0%) | — | — |

#### 5.11.3 Returning Dashboard State (Daily Active User)

The returning user's dashboard is rich with data. Key differences from empty state:

- Greeting is personalized (name, streak-aware, time-aware)
- Goal widget shows real progress percentage
- Coach card has full briefing/morning/night tabs with AI-generated content
- Stat cards show real numbers with trend indicators
- Timeline has clustered events
- Heatmap has colored cells
- Achievements show progress bars
- Habit tracker has habit rows with streaks
- Distraction summary shows real distraction data if tracker is connected

#### 5.11.4 Power-User Dashboard State

Users with ≥50 total sessions, ≥7-day streak, and focus score ≥70 unlock enhanced dashboard features:

| Feature | Standard | Power User |
|---|---|---|
| Coach AI content depth | Brief summary | Extended analysis with weekly patterns |
| Insights count | 3–5 insights | Up to 10 insights with deeper pattern detection |
| Heatmap range | 90 days | 365 days (opt-in) |
| Stats trend | vs yesterday | vs yesterday + vs 7-day average + vs 30-day average |
| Focus blocks | 2 suggestions | 3 suggestions with confidence scores |
| Achievement detail | Progress bar only | Progress bar + estimated time to unlock + milestone markers |
| Session history | Last 5 | Last 10 + average duration trend |
| Habit analytics | Streak only | Streak + completion rate + best day + worst day |

### 5.12 Personalization Rules — Complete Matrix

#### 5.12.1 Greeting Personalization

| Data Point | Source | Effect |
|---|---|---|
| displayName | User.name | Greeting includes name. If null, omit. |
| workSchedule | UserSettings.workSchedule | Night owl → night-aware greeting at all hours |
| hour | `new Date().getHours()` | Time-of-day base greeting |
| currentStreak | DashboardStats.currentStreak | Streak ≥7 → fire emoji + streak copy |
| todayFocusMinutes | DashboardStats.todayFocusMinutes | Goal progress → progress-aware copy |
| primaryUse | DashboardStats.primaryUse | Primary-use-specific motivational copy |
| activeMission | Active mission object | Mission title in motivational copy |

#### 5.12.2 Widget Display Personalization

| Data Point | Source | Effect |
|---|---|---|
| primaryUse | Onboarding → User.primaryUse | Widget emphasis order per persona |
| goals | Onboarding → User.goals | Conditional widget additions |
| bestFocusHours | `/api/stats` → bestFocusHours | Focus block suggestions use real peak hours |
| biggestDistraction | Onboarding → User.biggestDistraction | Distraction summary shows known distraction |
| desktopConnected | `/api/desktop/status` | Tracker badge state; distraction widget visibility |
| focusGoalMinutes | User.focusGoalMinutes | Goal widget target value |

#### 5.12.3 Coach Tip Personalization

| Data Point | Source | Effect |
|---|---|---|
| todayDistractionMinutes | DashboardStats | Distractions >30 → red alert tip |
| focusScore | DashboardStats.focusScore | Score <40 → boost tip |
| currentStreak | DashboardStats.currentStreak | Streak =0 → "start a streak" tip |
| todayFocusMinutes + focusGoalMinutes | DashboardStats | Goal <30% + afternoon → "try a focus block now" tip |
| primaryUse | DashboardStats.primaryUse | Primary-use-specific coaching advice |

#### 5.12.4 Focus Block Personalization

| Data Point | Source | Effect |
|---|---|---|
| bestFocusHours | `/api/stats` | Use actual observed peak hours |
| workSchedule | UserSettings.workSchedule | Fallback: schedule-based suggestions |
| hour (current) | Runtime | Highlight current/applicable blocks with "NOW" label |

### 5.13 Desktop Integration Widgets

The dashboard includes desktop-specific elements that only appear when the MindGuard Desktop Agent is installed and connected.

#### 5.13.1 Tracker Status Badge

| Connected | Icon | Badge | Detail Text | CTA |
|---|---|---|---|---|
| Yes | Wifi (emerald) | "Connected" (emerald) | "Currently: {currentApp}" | — |
| No | WifiOff (zinc) | "Offline" (zinc) | "Install the desktop companion for real-time tracking" | "Download" → GitHub releases |

- Poll frequency: 30 seconds
- Position: top-right of greeting zone
- Size: compact card `p-3 sm:p-4`

#### 5.13.2 Distraction Data Integration

When the desktop tracker is connected, the Distraction Summary widget gains enhanced functionality:

- Shows top distracting apps by name (from desktop API)
- Shows total distraction minutes per app
- Cross-references with user's self-reported biggestDistraction from onboarding
- Displays "Your known distraction: {name}" footer

#### 5.13.3 Focus Protection Integration (Future)

When focus protection is enabled during a focus session:
- Dashboard shows "Focus Protection Active" badge
- Distraction widget shows blocked apps count
- After session ends, dashboard shows "X distractions blocked during session"

### 5.14 Dashboard Loading & Error States

#### 5.14.1 Dashboard Skeleton (Loading State)

The skeleton mirrors the dashboard layout with gray placeholder blocks:

```
┌──────────────────────────────────────────┐
│ [12×12 rounded-xl animate-pulse]         │
│ [7×48 rounded animate-pulse]             │
│ [4×72 rounded animate-pulse]             │
├──────────────────────────────────────────┤
│ [20×full rounded-xl animate-pulse]       │
├──────────────────────────────────────────┤
│ [6 × 28-height cards in 3-col grid]     │
│ (each animate-pulse rounded-xl)          │
└──────────────────────────────────────────┘
```

- Container: `min-h-full -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8`
- Greeting skeleton: icon placeholder + two text bars
- Goal skeleton: single bar
- Stats skeleton: 6 cards in grid

#### 5.14.2 Dashboard Error State

- Icon: `AlertCircle h-8 w-8 text-red-400/60`
- Message: Error text from fetch failure
- CTA: "Try again" ghost button → `fetchDashboard()`
- Layout: centered column, `h-64`

#### 5.14.3 Auth Failure Handling

When `/api/stats` returns 401:
- Do NOT show error state
- Redirect to landing: `setView('landing')`
- The auth state change handles the transition

### 5.15 Dashboard Data Flow

#### 5.15.1 API Endpoints Used by Dashboard

| Endpoint | Method | Data Returned | Used By |
|---|---|---|---|
| `/api/stats` | GET | All DashboardStats fields | Main dashboard component |
| `/api/desktop/status` | GET | `{ connected, currentApp }` | Tracker badge + distraction widget |
| `/api/coach` | GET | CoachData (greeting, summary, recommendations, AI content) | AI Coach card |
| `/api/coach` | POST | `{ mode, question }` → AI response | Coach AI tabs + chat |
| `/api/insights` | GET | `{ insights: Insight[] }` | AI Insights widget |
| `/api/heatmap` | GET | `{ days: HeatmapDay[] }` | Heatmap widget |
| `/api/habits/entries` | GET | `{ entries }` by date range | Heatmap habit overlay |
| `/api/habits` | GET | `{ habits: HabitWithEntries[] }` | Habit Tracker widget |
| `/api/timeline` | GET | `{ events: TimelineEvent[] }` | Timeline widget |
| `/api/achievements/progress` | GET | `{ achievements: AchievementProgress[] }` | Achievements widget |

#### 5.15.2 Zustand Store Fields Used

| Store Field | Type | Set By | Used By |
|---|---|---|---|
| `stats` | DashboardStats | `setStats` from `/api/stats` | All stat-dependent widgets |
| `activeMission` | Mission | `setActiveMission` from `/api/stats` | Active Mission card |
| `recentSessions` | Session[] | `setRecentSessions` from `/api/stats` | Recent Sessions list |
| `coach` | CoachData | `setCoach` from `/api/coach` | AI Coach card |
| `view` | AppView | `setView` | Navigation CTAs |

#### 5.15.3 Desktop Status Polling

- Initial fetch on mount
- Poll interval: 30 seconds
- Poll endpoint: `/api/desktop/status`
- Silent failure: no toast, no error display on poll failure
- Cleanup: `clearInterval` on unmount

### 5.16 Dashboard Animation Specifications

#### 5.16.1 Section Entry Animations

The entire dashboard uses `staggerContainer` and `staggerItem` variants from `animations.ts`:

- Container: `staggerContainer` — orchestrates child animations
- Each section: `staggerItem` — fades in and slides up
- Stat cards: additional `whileHover: { y: -2 }` micro-interaction
- Coach card: `fadeInUp` variant for initial appearance
- Timeline events: stagger with `delay: gi * 0.06`
- Achievement cards: stagger with `delay: index * 0.06`
- Insight cards: stagger with `delay: index * 0.06`
- Heatmap cells: no animation (pure CSS transitions for hover)
- Habit day circles: `whileTap: { scale: 0.85 }`

#### 5.16.2 Animated Number Component

Stat values use `AnimatedNumber` component for smooth count-up transitions:

- Duration: implicit (driven by framer-motion spring)
- Format: `tabular-nums tracking-tight text-zinc-50`
- Used on: todayFocusMinutes, weeklyFocusMinutes, totalFocusMinutes, avgSessionMinutes, currentStreak, focusScore, achievement level, achievement XP

#### 5.16.3 Progress Bar Animations

All progress bars (goal, focus score, achievements) animate from 0 to target width:

- Duration: 1.2 seconds
- Delay: 0.3–0.4 seconds (after card entry)
- Easing: `[0.25, 0.1, 0.25, 1]` (custom ease-out curve)
- Gradient: `from-emerald-500/80 to-teal-400/60` (standard) or `from-emerald-400 to-teal-300` (goal achieved)

### 5.17 Widget Ordering per Persona — Complete Table

#### 5.17.1 Studying Persona

| Zone | Widget | Position | Emphasis |
|---|---|---|---|
| Greeting | Greeting + Quick Start | 1st row | Standard |
| Action | Today's Goal | 1st card | High — students track daily targets |
| Action | Daily Coach | 2nd card | Study-specific tips |
| Action | Focus Blocks | 3rd card | Peak study hours |
| Action | Stats Grid | Full width | Session count emphasized |
| Action | Active Mission | 1st in 3-col | Study mission highlighted |
| Action | Recent Sessions | 2nd in 3-col | Session history matters |
| Action | Distraction Summary | 3rd in 3-col | Distraction management |
| Reflection | AI Coach | Left col, row-span-2 | Study coaching |
| Reflection | Timeline | Middle top | Chronological study flow |
| Reflection | Habit Tracker | Right top | Study habit tracking |
| Reflection | AI Insights | Middle bottom | Study pattern detection |
| Reflection | Heatmap + Achievements | Right bottom | Progress visualization |

#### 5.17.2 Coding Persona

| Zone | Widget | Position | Emphasis |
|---|---|---|---|
| Greeting | Greeting + Quick Start | 1st row | "Time to write some great code" |
| Action | Today's Goal | 1st card | Code output tracking |
| Action | Daily Coach | 2nd card | "Try 90-min deep work block" |
| Action | Focus Blocks | 3rd card | Peak coding hours |
| Action | Stats Grid | Full width | Session duration emphasized |
| Action | Active Mission | 1st in 3-col | Feature/project mission |
| Action | Recent Sessions | 2nd in 3-col | Flow state tracking |
| Action | Distraction Summary | 3rd in 3-col | IDE vs browser distraction |
| Reflection | AI Coach | Left col, row-span-2 | Code-specific coaching |
| Reflection | Timeline | Middle top | Development flow |
| Reflection | Habit Tracker | Right top | Code habits (daily commits) |
| Reflection | AI Insights | Middle bottom | Coding pattern insights |
| Reflection | Heatmap + Achievements | Right bottom | Milestone tracking |

#### 5.17.3 Writing Persona

| Zone | Widget | Position | Emphasis |
|---|---|---|---|
| Greeting | Greeting + Quick Start | 1st row | "Your best writing happens in flow" |
| Action | Today's Goal | 1st card | Word count equivalent |
| Action | Daily Coach | 2nd card | "Flow state writing tips" |
| Action | Focus Blocks | 3rd card | Creative peak hours |
| Action | Stats Grid | Full width | Session length emphasized |
| Action | Active Mission | 1st in 3-col | Writing project mission |
| Action | Recent Sessions | 2nd in 3-col | Writing session history |
| Action | Distraction Summary | 3rd in 3-col | Social media as distraction |
| Reflection | AI Coach | Left col, row-span-2 | Writing-specific coaching |
| Reflection | Timeline | Middle top | Writing flow tracking |
| Reflection | Habit Tracker | Right top | Daily writing habit |
| Reflection | AI Insights | Middle bottom | Creative flow insights |
| Reflection | Heatmap + Achievements | Right bottom | Consistency tracking |

#### 5.17.4 Creative Persona

| Zone | Widget | Position | Emphasis |
|---|---|---|---|
| Greeting | Greeting + Quick Start | 1st row | Inspiration-focused copy |
| Action | Today's Goal | 1st card | Creative output tracking |
| Action | Daily Coach | 2nd card | Creative energy tips |
| Action | Focus Blocks | 3rd card | Creative peak hours |
| Action | Stats Grid | Full width | Achievements emphasized |
| Action | Active Mission | 1st in 3-col | Creative project mission |
| Action | Recent Sessions | 2nd in 3-col | Creative session history |
| Action | Distraction Summary | 3rd in 3-col | Inspiration vs distraction |
| Reflection | AI Coach | Left col, row-span-2 | Creative coaching |
| Reflection | Timeline | Middle top | Creative flow tracking |
| Reflection | Habit Tracker | Right top | Daily creative habit |
| Reflection | AI Insights | Middle bottom | Creative pattern insights |
| Reflection | Heatmap + Achievements | Right bottom | Milestone celebration |

#### 5.17.5 Work/Business Persona

| Zone | Widget | Position | Emphasis |
|---|---|---|---|
| Greeting | Greeting + Quick Start | 1st row | "Strategic work needs focused time" |
| Action | Today's Goal | 1st card | Productivity output |
| Action | Daily Coach | 2nd card | Business productivity tips |
| Action | Focus Blocks | 3rd card | Strategic work hours |
| Action | Stats Grid | Full width | Weekly total emphasized |
| Action | Active Mission | 1st in 3-col | Business objective mission |
| Action | Recent Sessions | 2nd in 3-col | Work session history |
| Action | Distraction Summary | 3rd in 3-col | Email/meeting distractions |
| Reflection | AI Coach | Left col, row-span-2 | Business coaching |
| Reflection | Timeline | Middle top | Work day flow |
| Reflection | Habit Tracker | Right top | Professional habits |
| Reflection | AI Insights | Middle bottom | Work pattern insights |
| Reflection | Heatmap + Achievements | Right bottom | Weekly consistency |

#### 5.17.6 General Persona

| Zone | Widget | Position | Emphasis |
|---|---|---|---|
| Greeting | Greeting + Quick Start | 1st row | Standard motivational copy |
| Action | Today's Goal | 1st card | Standard goal tracking |
| Action | Daily Coach | 2nd card | General productivity tips |
| Action | Focus Blocks | 3rd card | Standard peak hours |
| Action | Stats Grid | Full width | All metrics equal |
| Action | Active Mission | 1st in 3-col | Standard mission |
| Action | Recent Sessions | 2nd in 3-col | Standard history |
| Action | Distraction Summary | 3rd in 3-col | Standard distraction |
| Reflection | AI Coach | Left col, row-span-2 | General coaching |
| Reflection | Timeline | Middle top | Standard flow |
| Reflection | Habit Tracker | Right top | General habits |
| Reflection | AI Insights | Middle bottom | General patterns |
| Reflection | Heatmap + Achievements | Right bottom | Standard tracking |

---

## Section 6: Onboarding Blueprint

### 6.1 Onboarding Philosophy

Onboarding is MindGuard's first promise. It is the moment where skepticism transforms into trust, where a generic app becomes a personal coach. Every step must earn the user's attention. No step should exist because "we need the data" — every step must exist because "the user needs to give this data to get a better experience."

**Core Principles:**

1. **Minimum Friction, Maximum Personalization** — Fewer steps is better ONLY if personalization quality is preserved. Never sacrifice personalization for speed.
2. **Earn Every Step** — If a step feels like "why are you asking me this?", it's wrong. Every question must have a visible payoff.
3. **Trust by Transparency** — The Privacy step exists not because we need consent (we could bury it in settings), but because showing our privacy commitment during onboarding builds trust at the most vulnerable moment.
4. **Skip is Safety** — Only steps where we can infer a reasonable default should be skippable. Steps where wrong defaults harm the experience must require an answer.
5. **No Dead Ends** — Every step has a clear "Continue" path. The user should never feel stuck.

### 6.2 Current vs Proposed Flow Analysis

#### 6.2.1 Current Implementation (11 Steps)

The current onboarding flow in `onboarding-flow.tsx` has 11 steps:

| Step # | Name | State Variable | Validation | Skippable? |
|---|---|---|---|---|
| 0 | Welcome | — | Always proceed | No |
| 1 | Improve (Interests) | `selectedImprovements` (multi-select up to 3) | `length > 0` | No |
| 2 | Role | `selectedRole` (single select) | `length > 0` | Yes |
| 3 | Schedule | `scheduleType` + `sleepRange` | `scheduleType.length > 0` | No |
| 4 | Focus Style | `hasAdhd` + `focusDurationComfort` + `workStylePreference` | All three required | No |
| 5 | Motivation | `coachPersonality` + `motivationStyle` | Both required | No |
| 6 | Distractions | `selectedDistractions` + `distractionRanking` | `selectedDistractions.length > 0` | No |
| 7 | Goals | `selectedGoals` + `focusGoalMinutes` | `selectedGoals.length > 0` | No |
| 8 | Privacy | — | Always proceed | No |
| 9 | Permissions | `permissions` object | Always proceed | Yes |
| 10 | Finish | — | Always proceed (submit) | No |

**Total time estimate: ~2.5–3 minutes** (11 × ~15–20 seconds per step, some steps slower due to grids)

#### 6.2.2 Proposed Flow (8 Steps)

The UX Bible proposes an 8-step flow:

| Step # | Name | Merged From | Justification |
|---|---|---|---|
| 0 | Welcome | Welcome (unchanged) | First impression, trust-building |
| 1 | Aspirations | Improve + Role | Interests and role are both "what do you do?" — one question, two data points |
| 2 | Schedule | Schedule (unchanged) | Schedule data is critical and can't be inferred |
| 3 | Focus Style | Focus Style (unchanged) | ADHD, duration, and work style can't be inferred |
| 4 | Coach Personality | Motivation (coach only) | Coach personality is the key personalization driver; motivation style can be inferred |
| 5 | Distractions | Distractions (unchanged) | Distraction data drives blocking and advice; can't be inferred |
| 6 | Permissions + Privacy | Permissions + Privacy merged | Both are trust/consent steps; combining reduces "admin" feeling |
| 7 | Finish | Finish (unchanged) | Celebration and launch |

**Removed:** Goals step (see §6.3 for justification)
**Removed:** Role as standalone step (merged into Aspirations)
**Removed:** Motivation style (inferred from coach personality, see §6.4)

**Total time estimate: ~1.5–2 minutes** (8 × ~15–20 seconds per step)

### 6.3 Step-by-Step Analysis with Merge/Removal Justifications

#### 6.3.1 Step 0: Welcome — KEEP (unchanged)

**Why it stays:**
- Emotional goal: Build trust. Show the user this isn't a generic productivity app.
- Business goal: Set expectations for personalization quality.
- User goal: Understand what they'll get in exchange for their time.
- Current implementation: MindGuardHeroLogo, Shield icon with spring animation, "Let's build your personal productivity coach." headline, "About 2 minutes. Everything stays private." time commitment, personalization preview card ("Coaching style · Focus timers · Dashboard layout · Daily nudges").
- **No changes needed.** This step is perfectly designed.

#### 6.3.2 Step 1 → Aspirations (Merge Improve + Role)

**Current state:** Two separate steps — "What do you want to get better at?" (14 options, multi-select 3) followed by "What best describes you?" (12 options, single select).

**Why merge:**
1. **They ask the same meta-question:** "What is your work context?" Improve asks what you want to focus on; Role asks what you are. The answer to one strongly predicts the other. A developer who selects "Coding" as their improvement almost certainly selects "Developer" as their role.
2. **Reduces cognitive load:** Instead of scanning 14 options then 12 options, the user scans one unified set where each card represents both their aspiration and their identity.
3. **Preserves all data:** The merged card captures `primaryUse` (from aspiration selection) and `role` (from the same card's identity label). We don't lose any personalization signal.
4. **Evidence:** In the current implementation, `firstMission` is generated from both `selectedImprovements[0]` and `selectedRole`. If a user picks "Coding" as improvement and "Developer" as role, the mission is "Complete coding tasks with deep focus" — which comes from the role, not the improvement. This proves the two selections are redundant for mission generation.

**Proposed implementation:**
- One grid of 8–10 persona cards, each combining aspiration + role
- Example cards: "Developer — I want to code with deep focus 💻", "Student — I want to study more effectively 📚", "Writer — I want to write in flow ✍️", "Creative — I want to design without distractions 🎨", "Business — I want to run my business strategically 💼", "Researcher — I want to analyze data deeply 🔬"
- User selects ONE primary card (this sets both primaryUse and role)
- Optional: multi-select secondary aspirations (up to 2 more) for additional personalization
- The "other" option remains with free-text input

**Data preserved:** `primaryUse`, `role`, `otherImproveText` — all still captured.
**Data quality impact:** NONE. Single-selection of a combined card is actually MORE accurate than separate selections, because it prevents the common error pattern where a user selects "Studying" as improvement but "Developer" as role (contradictory signals).

#### 6.3.3 Step 2: Schedule — KEEP (unchanged)

**Why it stays:**
- This data **cannot be inferred** with sufficient confidence.
- Work schedule directly affects: greeting time logic, focus block suggestions, "wind down" notifications, session timing recommendations.
- Sleep range directly affects: night session handling, morning start recommendations.
- The 4-option schedule type + 5-option sleep range is already streamlined.
- Current implementation uses natural-language labels ("Morning Person", "Night Owl", "Flexible Schedule", "My schedule changes a lot") instead of technical terms.

**No changes needed.** Schedule is the most data-critical step after Focus Style.

#### 6.3.4 Step 3: Focus Style — KEEP (unchanged)

**Why it stays:**
- **ADHD toggle cannot be inferred.** This is the single most impactful personalization signal. If we guess wrong:
  - Guess ADHD for a non-ADHD user → annoying short sessions, excessive nudges
  - Guess non-ADHD for an ADHD user → frustrating long sessions, insufficient support
  - **Confidence level for inference: 0%.** This must be explicitly asked.
- **Focus duration comfort cannot be inferred.** A user who can focus for 90 minutes gets very different timer defaults than one who can only focus for 15 minutes. Wrong defaults = immediate frustration on first session.
  - **Confidence level for inference: ~30%** (we could guess from role — developers tend to focus longer — but the variance is too high).
- **Work style preference (pomodoro vs. deep work vs. flexible) cannot be inferred.** This sets the entire timer mode. Wrong guess = first session is in the wrong mode.
  - **Confidence level for inference: ~40%** (we could lean toward "flexible" as default, but that's a cop-out).

**No changes needed.** Focus Style is the second most data-critical step.

#### 6.3.5 Step 4: Coach Personality (from Motivation step — PARTIAL MERGE)

**Current state:** Two questions in one step — Coach personality (3 options) + Motivation style (3 options: gamification, minimalist, balanced).

**Why keep coach personality, remove motivation style:**

**Coach Personality — KEEP:**
- This is the most visible personalization in the entire app. The coach talks to the user every day. Wrong personality = wrong relationship.
- A "strict" coach saying "No excuses today" to someone who wants warmth is actively harmful.
- A "friendly" coach saying "You're doing great!" to someone who wants accountability feels patronizing.
- **Confidence level for inference: ~20%.** We could lean "friendly" as default, but 1 in 5 users would be mismatched.
- **Must be explicitly asked.**

**Motivation Style — REMOVE (infer from other signals):**
- Motivation style determines: gamification level, achievement visibility, XP display, streak emphasis.
- **Confidence level for inference: ~75%.** We can reliably infer this:
  - If coachPersonality = "data_nerd" → motivation = "balanced" (data people want metrics, not flash)
  - If coachPersonality = "strict" → motivation = "gamification" (accountability people respond to streaks/achievements)
  - If coachPersonality = "friendly" → motivation = "minimalist" (warmth people don't want gamification pressure)
  - If primaryUse ∈ {studying, coding, work} → lean "balanced"
  - If primaryUse ∈ {creative, writing} → lean "minimalist"
- **Risk of wrong inference:** Low. Motivation style is a secondary personalization signal. If we guess "balanced" and the user wants "gamification", they see fewer achievements — but achievements are still present, just not emphasized. The user can adjust in Settings.
- **The key insight:** Motivation style affects *emphasis*, not *existence*. Achievements exist regardless. XP exists regardless. Streaks exist regardless. Motivation style just controls how prominently they're displayed. A wrong inference here is easily corrected by the user noticing "I wish I saw my streak more" and toggling it in Settings.

**Proposed implementation:**
- Show only the 3 coach personality cards with preview quotes
- Auto-derive motivation style from coach personality + primary use
- Display a note: "Your coach style also affects how achievements and streaks are displayed. You can customize this later in Settings."
- This saves ~10 seconds and reduces one decision point.

#### 6.3.6 Step 5: Distractions — KEEP (unchanged)

**Why it stays:**
- Distraction data is **critical for the core value proposition.** MindGuard's primary promise is "protect your attention." If we don't know what pulls attention away, we can't protect it.
- The distraction step provides: `biggestDistraction` (drives Coach advice), `distractionRanking` (drives focus protection blocking), `selectedDistractions` (drives dashboard distraction widget emphasis).
- **Confidence level for inference: ~10%.** We could guess "social media" as the most common distraction, but individual variance is enormous. A developer's biggest distraction is Stack Overflow; a student's is Instagram; a writer's is email.
- The current implementation with 22 brand-style SVG icons + drag-and-drop ranking is excellent. It makes a potentially tedious question feel visual and interactive.
- **One optimization:** The ranking UI (drag-and-drop with @dnd-kit) could be simplified to **tap-to-rank** on mobile (see §6.7). But the data collection must remain.

**Changes:** Consider simplifying ranking interaction on mobile (tap-to-rank vs drag-and-drop). See §6.7 for analysis.

#### 6.3.7 Goals Step — REMOVE

**Current state:** "What outcomes matter most to you?" (12 options, multi-select up to 3) + Daily focus goal slider (30–300 min, step 15, default 120).

**Why remove:**

1. **Goals are derivable from aspirations + role + focus style.**
   - A developer who selected "deep work" as focus style → goal = "deep_work"
   - A student who selected "studying" → goal = "better_grades"
   - A creative who selected "creative projects" aspiration → goal = "creative_projects"
   - **Confidence level for inference: ~80%.** The mapping is straightforward:

| Aspiration | Inferred Primary Goal |
|---|---|
| programming / coding | deep_work |
| study / university / exam_preparation | better_grades |
| writing / reading | mental_clarity |
| business / freelancing | productivity |
| gaming_addiction / social_media_addiction | screen_time |
| adhd_support | habits |
| creative | creative_projects |
| research | skill_building |

2. **Goal-based widget additions are secondary personalization.** The `getRecommendedWidgets()` function adds widgets based on goals, but these additions are minor (adding distraction-log, streak, session-stats, or focus-score emphasis). The primary widget order is already driven by `primaryUse`. Missing goal data means slightly less optimized widget emphasis — NOT a broken dashboard.

3. **The focus goal slider is the most valuable part, and it can be smart-defaulted.**
   - Smart default logic:
     - If focusDurationComfort = "15min" → goal = 60 min (4 × their comfort duration)
     - If focusDurationComfort = "30min" → goal = 90 min
     - If focusDurationComfort = "45min" → goal = 120 min (default)
     - If focusDurationComfort = "about_an_hour" → goal = 120 min
     - If focusDurationComfort = "90_plus" → goal = 180 min
     - If focusDurationComfort = "it_depends" → goal = 120 min (balanced default)
   - **Confidence level for smart default: ~70%.** The goal is adjustable in Settings and shown on the dashboard, so the user can easily correct it.
   - **Key UX insight:** The slider adds ~10 seconds to onboarding. Removing it and using a smart default saves time AND reduces decision fatigue. The user can always adjust their goal later from the dashboard (where it's prominently displayed) or Settings.

4. **Goals have the weakest emotional justification.** "What outcomes matter most to you?" is the most abstract question in onboarding. It doesn't feel immediate or personal — it feels like a survey question. Compare to "What pulls your attention away?" (immediate, personal) or "How should your coach talk to you?" (immediate, personal). Goals feel like "marketing segmentation" rather than "personalization that helps me today."

**Risk assessment:**
- If we infer wrong goals → widget emphasis slightly off. User sees "session-stats" emphasized instead of "distraction-log". Easily corrected by behavior (the coach learns from actual usage in Level 2 personalization).
- If we set wrong focus goal → dashboard shows a target that may be too high or too low. BUT: the goal is visible every day on the dashboard. The user will notice "I'm only hitting 60 min but my goal says 120" and adjust it. This is a self-correcting error.
- **Overall risk: LOW.** The removal is justified.

#### 6.3.8 Step 6: Permissions + Privacy (MERGE)

**Current state:** Two separate steps — Privacy (informational, no choices) + Permissions (3 toggles: desktop, notifications, accessibility).

**Why merge:**

1. **Both are trust/consent steps.** Privacy says "we respect your data." Permissions says "here's what we can access." They belong together as a single "trust establishment" moment.
2. **Privacy step has no interactive elements.** It's purely informational — 3 sections of text (What IS tracked, What is NOT tracked, How data stays private). Adding 3 permission toggles below this information makes the step both informative AND actionable. The user reads the privacy commitment, then immediately makes consent decisions informed by that commitment.
3. **Separating them creates a "admin sandwich" feeling.** Step 8 (Privacy) is just text. Step 9 (Permissions) is just toggles. Two consecutive non-personalization steps feel bureaucratic. Merging them into one "Your Privacy & Permissions" step makes the bureaucracy feel like a single, cohesive trust-building moment.
4. **The privacy text INFORMS the permission decisions.** Seeing "We never sell or share your data" before toggling "Desktop Tracking" makes the user more likely to enable it. The current flow has them see privacy text, then navigate away, then come back to permissions — the persuasive context is lost.

**Proposed implementation:**
- Title: "Your privacy, always. And optional permissions."
- Top section: Privacy information (same as current — What IS tracked, What is NOT tracked, How data stays private)
- Bottom section: 3 permission toggles (Desktop Tracking, Notifications, Accessibility)
- All toggles default to OFF
- Clear label: "Optional — enable for the best experience. Change anytime in Settings."
- This step is always skippable (Proceed without enabling anything)

#### 6.3.9 Step 7: Finish — KEEP (unchanged)

**Why it stays:**
- Emotional goal: Celebration. Show the user their personalized profile summary. Give them a feeling of "this was worth it."
- Business goal: Confirm all data before saving. Show the user what they chose so they can go back if something is wrong.
- User goal: See the payoff. The finish step is the receipt that proves the onboarding investment was worthwhile.
- Current implementation is excellent: personalized summary card with role icon, schedule, focus style, coach personality, goals, ADHD badge (if selected), top distraction, coach preview quote, first mission announcement, celebration dots animation.
- **One change:** Remove goals display (since goals are now inferred). Replace with "Your daily goal: {smartDefault}m" which the user can adjust.
- **Another change:** Add motivation style display based on inferred value, with a note "Inferred from your coach style. Adjust in Settings."

### 6.4 Motivation Style Inference Justification

**The inference algorithm:**

```typescript
function inferMotivationStyle(
  coachPersonality: string,
  primaryUse: string | null
): string {
  // Direct mapping from coach personality
  if (coachPersonality === 'strict') return 'gamification';
  if (coachPersonality === 'data_nerd') return 'balanced';
  if (coachPersonality === 'friendly') return 'minimalist';

  // Fallback from primary use
  if (primaryUse === 'studying' || primaryUse === 'coding' || primaryUse === 'work') return 'balanced';
  if (primaryUse === 'creative' || primaryUse === 'writing') return 'minimalist';

  // Default
  return 'balanced';
}
```

**Why this is safe:**

1. **Motivation style controls emphasis, not existence.** All gamification elements (achievements, XP, streaks) are always present. The style only controls how prominently they're displayed. A "minimalist" user still sees achievements — they're just in a smaller section.
2. **The inference has a clear correction path.** If a user notices their dashboard doesn't show enough gamification, they go to Settings → AI Coach → Motivation Style and toggle it. This is a 3-click fix.
3. **The wrong inference has low impact.** The worst case: a gamification-motivated user gets "balanced" style. They see achievements at normal emphasis instead of high emphasis. They still see their streak, their XP, their level — just without the extra visual fanfare. This is not a broken experience.
4. **75% accuracy is sufficient for a secondary signal.** Primary personalization signals (coach personality, focus style, ADHD, distractions) require 95%+ accuracy because wrong values break the experience. Secondary signals (motivation style, goals) can tolerate lower accuracy because they're adjustable and their impact is emphasis-based.

### 6.5 Focus Goal Smart Default Justification

**The smart default algorithm:**

```typescript
function inferFocusGoal(focusDurationComfort: string): number {
  const map: Record<string, number> = {
    '15min': 60,    // 4 sessions of their comfort length
    '30min': 90,    // 3 sessions
    '45min': 120,   // default
    'about_an_hour': 120,  // 2 sessions
    '90_plus': 180,  // 2 deep sessions
    'it_depends': 120,     // balanced default
  };
  return map[focusDurationComfort] ?? 120;
}
```

**Why this is safe:**

1. **The goal is prominently displayed every day.** The "Today's Goal" widget on the dashboard shows the current goal, current progress, and remaining time. If the smart default is wrong (e.g., 120 min but the user can only do 60), they'll notice on day 1 and adjust.
2. **Goals are adjustable in 3 places:** Dashboard (tap the goal widget → Settings), Settings (Focus section), and the goal widget itself (could add inline adjustment).
3. **The smart default is based on the user's self-reported comfort duration.** If they said they can focus for 45 minutes, a 120-minute goal (= ~3 sessions) is reasonable. If they said 15 minutes, a 60-minute goal (= 4 short sessions) is reasonable. This is not a random guess — it's a derivation from data we already have.
4. **The alternative (showing a slider in onboarding) adds decision fatigue.** "How many minutes should you focus per day?" is a question most new users can't answer. They don't know their capacity yet. A smart default removes this unknown and lets them discover their optimal goal through actual usage.

### 6.6 Tap-to-Rank vs Drag-and-Drop Analysis

**Current implementation:** The Distraction step uses `@dnd-kit/core` + `@dnd-kit/sortable` for drag-and-drop ranking of top 3 distractions. This works well on desktop but has issues on mobile:

| Interaction | Desktop | Mobile |
|---|---|---|
| Drag-and-drop | Natural, precise | Clunky, imprecise, requires long-press |
| Tap-to-rank | Fast, 3 taps | Fast, 3 taps — native mobile interaction |
| Cognitive load | "Drag the items to reorder" | "Tap to assign rank #1, #2, #3" |
| Error rate | Low (visual feedback during drag) | Medium (touch targets small, scroll conflicts) |

**Proposed hybrid approach:**

1. **Desktop:** Keep drag-and-drop ranking (it's natural and satisfying on desktop)
2. **Mobile:** Replace with tap-to-rank:
   - First tap on a selected distraction → assigns rank #1
   - Second tap → assigns rank #2
   - Third tap → assigns rank #3
   - Tap on a ranked item → removes its rank
   - Visual: Ranked items show a numbered badge (#1, #2, #3) with emerald background
   - The ranking section below the grid becomes a static list (not sortable) on mobile

**Implementation note:** Use `useMediaQuery` or viewport detection to switch between DnD and tap-to-rank modes. Both produce the same `distractionRanking: string[]` data structure.

### 6.7 Progress Bar Design

#### 6.7.1 Current Implementation

- 11 segmented bars (`h-1 flex-1 rounded-full bg-white/[0.06]`)
- Each fills with emerald gradient when its step is reached
- Animation: `motion.div` with `width: i <= step ? '100%' : '0%'` and `duration: 0.4, ease: 'easeOut'`
- Below the bar: contextual message (changes per step) + step counter "X/11"
- Contextual messages: "Welcome", "Discovering your interests...", "Understanding your role...", etc.

#### 6.7.2 Proposed Progress Bar (8 Steps)

With 8 steps instead of 11:

- 8 segmented bars (same visual style)
- Faster perceived progress (each step fills more of the bar)
- Contextual messages updated for merged steps:
  - Step 0: "Welcome"
  - Step 1: "Understanding your aspirations..."
  - Step 2: "Learning your rhythm..."
  - Step 3: "Finding your focus style..."
  - Step 4: "Choosing your coach..."
  - Step 5: "Identifying your distractions..."
  - Step 6: "Privacy & permissions"
  - Step 7: "Almost ready!"

**Progress percentage perception:**
- 11 steps: after step 3, user has completed 27% → feels slow
- 8 steps: after step 3, user has completed 37% → feels faster
- This is a real psychological effect. Progress bars that advance faster increase completion rates (reference: UX research on progress indication).

### 6.8 Navigation Button Behavior per Step

#### 6.8.1 Button States

| Step | Back Button | Skip Button | Continue Button | Continue Label |
|---|---|---|---|---|
| 0 (Welcome) | Hidden | No | Enabled | "Let's Begin" |
| 1 (Aspirations) | Visible | No | Disabled until selection | "Continue" |
| 2 (Schedule) | Visible | No | Disabled until scheduleType selected | "Continue" |
| 3 (Focus Style) | Visible | No | Disabled until all 3 fields filled | "Continue" |
| 4 (Coach Personality) | Visible | No | Disabled until coach selected | "Continue" |
| 5 (Distractions) | Visible | No | Disabled until ≥1 distraction selected | "Continue" |
| 6 (Privacy+Permissions) | Visible | Yes | Always enabled | "Continue" |
| 7 (Finish) | Visible | No | Always enabled (→ submit) | "Launch Dashboard" |

#### 6.8.2 Skip Behavior

**Which steps are skippable and why:**

| Step | Skippable? | Why |
|---|---|---|
| Welcome | No | First impression, no data to skip |
| Aspirations | No | primaryUse + role are critical personalization signals |
| Schedule | No | workSchedule drives greeting, focus blocks, notifications |
| Focus Style | No | ADHD, duration, work style drive timer defaults |
| Coach Personality | No | coachPersonality drives all coach communication |
| Distractions | No | biggestDistraction drives blocking and advice |
| Privacy+Permissions | Yes | All permissions are optional; privacy is informational |
| Finish | No | This is the submit action |

**Skip on Privacy+Permissions:** When skipped, all permissions default to OFF. The user can enable them later from Settings or from the desktop tracker prompt.

### 6.9 Data Flow Documentation

#### 6.9.1 Onboarding Data Collection → Settings Mapping

| Onboarding Field | Internal Setting | Prisma Model | Effect |
|---|---|---|---|
| `selectedImprovements[0]` | `primaryUse` | User.primaryUse | Dashboard widget order, coach tips, greeting copy |
| `selectedRole` | `role` | User.role | First mission generation, widget emphasis |
| `scheduleType` | `workSchedule` + `chronotype` | UserSettings | Greeting time logic, focus blocks, session timing |
| `sleepRange` | `sleepTime` | UserSettings | Wind-down notifications, morning start |
| `hasAdhd` | `hasAdhd` | UserSettings | Session length, break frequency, nudge gentleness |
| `focusDurationComfort` | `estimatedDuration` + `pomodoroPreference` + `deepWorkDuration` | UserSettings | Timer defaults, session type |
| `workStylePreference` | `focusStyle` + `preferredSchedule` | UserSettings | Timer mode (pomodoro/deep/flex) |
| `coachPersonality` | `coachPersonality` | UserSettings | All coach communication tone |
| `motivationStyle` | `motivationStyle` | UserSettings | Achievement visibility, XP display, streak emphasis |
| `selectedDistractions` | `distractionsList` | User | Distraction widget, blocking suggestions |
| `distractionRanking` | `distractionRanking` | User | Biggest distraction for coach advice |
| `selectedGoals` | `goals` | User | Widget additions, mission suggestions |
| `focusGoalMinutes` | `focusGoalMinutes` | UserSettings | Daily goal target |
| `permissions.desktop` | DesktopSettings.trackingEnabled | DesktopSettings | Desktop activity tracking |
| `permissions.notifications` | UserSettings.desktopNotifications | UserSettings | Desktop notification permission |
| `permissions.accessibility` | DesktopSettings.accessibilityEnabled | DesktopSettings | App switch detection |

#### 6.9.2 Onboarding API Payload

The `handleFinish` function sends a POST to `/api/onboarding` with the following payload:

```typescript
{
  primaryUse: string,          // from selectedImprovements[0]
  firstMission: string,        // auto-generated from role + aspirations
  estimatedDuration: number,   // mapped from focusDurationComfort
  workSchedule: string,        // mapped from scheduleType
  biggestDistraction: string,  // from distractionRanking[0] or selectedDistractions[0]
  goals: string[],             // from selectedGoals (or inferred)
  distractionsList: string[],  // from selectedDistractions
  role: string,                // from selectedRole
  chronotype: string,          // mapped from scheduleType
  focusStyle: string,          // mapped from workStylePreference
  hasAdhd: boolean,            // direct
  pomodoroPreference: string,  // mapped from focusDurationComfort
  deepWorkDuration: number,    // mapped from focusDurationComfort
  preferredSchedule: string,   // mapped from workStylePreference
  coachPersonality: string,    // direct
  motivationStyle: string,     // direct (or inferred)
  distractionRanking: string[],// direct
  focusGoalMinutes: number,    // direct (or smart-defaulted)
  sleepTime: string,           // from sleepRange
  scheduleType: string,        // direct
  sleepRange: string,          // direct
  focusDurationComfort: string,// direct
  workStylePreference: string, // direct
  otherImproveText: string,    // direct (optional)
}
```

**Error handling:**
- If `/api/onboarding` returns 401 → wait 1 second, retry once
- If retry also fails → throw error, show toast "Failed to save preferences"
- On success → toast "Welcome to MindGuard!" → `onComplete()` → navigate to dashboard

### 6.10 Each Screen's Emotional, User, and Business Goals

| Step | Emotional Goal | User Goal | Business Goal |
|---|---|---|---|
| Welcome | Trust, curiosity, warmth | "Is this worth my time?" | Set expectations, reduce drop-off |
| Aspirations | Identity recognition, empowerment | "Tell it what I do so it helps me" | Collect primaryUse + role for personalization |
| Schedule | Self-awareness, accommodation | "It should know when I'm at my best" | Collect workSchedule for timing personalization |
| Focus Style | Safety, customization, ADHD support | "Set up the timer so it works for me" | Collect timer defaults + ADHD status |
| Coach Personality | Choice, personal connection | "Pick a coach I'd actually listen to" | Collect coach personality for communication tone |
| Distractions | Honesty, vulnerability, relief | "Tell it what distracts me so it can help" | Collect distraction data for blocking + advice |
| Privacy+Permissions | Trust, control, transparency | "Know what I'm consenting to" | Establish consent, enable desktop features |
| Finish | Celebration, payoff, excitement | "See that this was worth it" | Confirm data, generate first mission, reduce post-onboarding churn |

### 6.11 Onboarding Animation Specifications

#### 6.11.1 Step Transitions

Each step uses `AnimatePresence` with `mode="wait"` and custom `direction` parameter:

- Enter: `x: direction > 0 ? 60 : -60, opacity: 0, scale: 0.97, filter: 'blur(3px)'`
- Center: `x: 0, opacity: 1, scale: 1, filter: 'blur(0px)'` — spring animation (stiffness: 260, damping: 25)
- Exit: `x: direction > 0 ? -60 : 60, opacity: 0, scale: 0.97, filter: 'blur(3px)'` — spring animation

This creates a horizontal slide effect with subtle blur and scale, giving a sense of depth during transitions.

#### 6.11.2 Card Selection Animations

When a user selects a card (improve, role, schedule, focus, coach, distraction, goals):

- Selected check mark: `initial: { scale: 0 }` → `animate: { scale: 1 }` — spring (stiffness: 400, damping: 15)
- Card border/background: instant transition via CSS classes
- Card hover: `whileHover: { scale: 1.02, y: -1 }`
- Card tap: `whileTap: { scale: 0.97 }`

#### 6.11.3 Item Stagger Animations

Grid items stagger their appearance:

- Container: `variants: itemStagger` — `staggerChildren: 0.03`
- Items: `variants: itemFade` — `opacity: 0, y: 8` → `opacity: 1, y: 0` with `duration: 0.25, ease: 'easeOut'`

#### 6.11.4 Progress Bar Animation

Each segment animates independently:

- `initial: { width: '0%' }` → `animate: { width: i <= step ? '100%' : '0%' }`
- Transition: `duration: 0.4, ease: 'easeOut'`
- Active fill: `bg-gradient-to-r from-emerald-500 to-teal-400`

#### 6.11.5 Finish Step Celebration

- Sparkles icon: spring animation (stiffness: 200, damping: 12, delay: 0.1)
- Celebration dots: 5 emerald circles staggered with `delay: 1 + i * 0.15`, spring (stiffness: 300, damping: 10)
- Profile card: fade-in with `delay: 0.5`
- ADHD badge (if present): spring animation with `delay: 0.6`

---

## Section 7: Settings Architecture

### 7.1 Settings Philosophy

Settings should feel calm, not overwhelming. Most users should never need to open Settings. The product should work well out of the box. When they do open Settings, they should find what they need in under 30 seconds. (UX Bible §16)

**Core Design Rules (from UX Bible §16):**

1. **Collapsible sections** — Each section is collapsed by default. Click to expand.
2. **No nested settings** — Two levels maximum. If you need three, reorganize.
3. **Descriptive labels** — "Coach personality" not "coachPersonality"
4. **Immediate save** — Changes save instantly. No "Save" button at the bottom.
5. **Undo affordance** — "Undo" toast appears after changing a setting
6. **Confirmation for destructive actions** — "Delete account" requires confirmation
7. **Defaults are always visible** — The default value is shown as a subtle hint

### 7.2 Current Settings Organization (12 Sections)

The current `settings-view.tsx` organizes settings into 12 sections:

| # | Section ID | Label | Description | Icon |
|---|---|---|---|---|
| 1 | general | General | Language, timezone, display name | Settings |
| 2 | account | Account | Email, sign out, data export | User |
| 3 | appearance | Appearance | Theme, sidebar, compact mode | Palette |
| 4 | desktop | Desktop | Desktop agent, tracker, blocking | Monitor |
| 5 | tracking | Tracking | Activity tracking, exclusions | Target |
| 6 | privacy | Privacy | Data sharing, privacy mode | Shield |
| 7 | focus | Focus | Timer defaults, goals, ambient sound | Zap |
| 8 | notifications | Notifications | Desktop alerts, reminders | Bell |
| 9 | keyboard | Keyboard | Shortcuts, customization | Keyboard |
| 10 | ai-coach | AI Coach | Provider, model, personality, API key | Brain |
| 11 | advanced | Advanced | Debug, developer tools, data management | FlaskConical |
| 12 | about | About | Version, links, credits | Info |

**Problems with current organization:**

1. **Too many sections** — 12 sections creates decision fatigue. The user has to scan 12 section headers to find what they want.
2. **Overlap between Desktop and Tracking** — "Tracking" is a subset of "Desktop" functionality. Having them as separate sections forces the user to look in two places for related settings.
3. **Overlap between Privacy and Account** — "Export data" is in Account, but "Privacy mode" is in Privacy. Data export is a privacy action.
4. **Keyboard is too narrow** — A single section for keyboard shortcuts, with only 2 items, is excessive vertical space for minimal content.
5. **Advanced is a dumping ground** — Debug mode, API logs, React DevTools, clear cache, force sync, export/import settings, reset all — these are disparate functions crammed into one section.
6. **About is not "settings"** — Version info, credits, and links are reference material, not configurable settings. They belong in a footer or sidebar, not in the Settings view.
7. **Missing future sections** — Billing, connected devices, session management, and mobile-specific settings are not planned.

### 7.3 Proposed Reorganization (8 Sections)

| # | Section ID | Label | Icon | Description | Merged From |
|---|---|---|---|---|---|
| 1 | profile | Profile | User | Display name, language, timezone, account info, sign out | General + Account |
| 2 | appearance | Appearance | Palette | Theme, compact mode, sidebar collapsed | Appearance (unchanged) |
| 3 | focus | Focus | Zap | Timer defaults, daily goal, auto-start, celebration, ambient sound, ADHD mode | Focus (unchanged, expanded) |
| 4 | coach | AI Coach | Brain | Coach personality, motivation style, AI provider, model, API key, Ollama URL | AI Coach (unchanged) |
| 5 | notifications | Notifications | Bell | Desktop notifications, break reminders, mission reminders, streak milestones, achievement alerts, idle alerts, mute all | Notifications (unchanged) |
| 6 | desktop | Desktop | Monitor | Tracker status, auto start, run in background, tracking toggle, focus protection, mute notifications, tracker interval, blocked apps/sites, exclusions, privacy mode | Desktop + Tracking + Privacy (tracking-related) |
| 7 | data | Data & Privacy | Shield | Export data, privacy mode (window titles), share stats, public profile, delete account, session management, connected devices | Account (export) + Privacy + future |
| 8 | advanced | Advanced | FlaskConical | Debug mode, keyboard shortcuts, API logs, clear cache, force sync, export/import settings, reset all, developer tools | Advanced + Keyboard merged |

**Removed sections:** About (moved to sidebar footer), Tracking (merged into Desktop), General (merged into Profile), Account (merged into Profile + Data & Privacy)

**New sections:** None — all existing settings are preserved, just reorganized.

**Key insight:** We go from 12 to 8 sections by **merging related settings** and **removing non-settings content** (About). Every setting still exists. The user just finds it faster.

### 7.4 Per-Setting Documentation

#### 7.4.1 Section 1: Profile

| Setting | Label | Control Type | Default | Description | Prisma Model | Validation |
|---|---|---|---|---|---|---|
| displayName | Display Name | Input (text) | null (use auth name) | Your name shown in greetings and coach messages | User.name | Max 50 chars, no special chars restriction |
| email | Email | Input (read-only) | — | Your login email address | User.email | Read-only, shown for reference |
| language | Language | Select | "en" | Choose your preferred language | UserSettings.language | One of: en, es, fr, de (en only active) |
| timezone | Timezone | Select | "UTC" | Used for scheduling and daily statistics | UserSettings.timezone | One of: UTC, America/New_York, America/Chicago, America/Los_Angeles, Europe/London, Europe/Berlin, Asia/Shanghai, Asia/Tokyo |
| signOut | Sign Out | Button (destructive) | — | End your current session and return to landing page | — | Requires confirmation dialog |

**Profile section notes:**
- Display Name has an explicit "Save Changes" button (unlike most settings which auto-save) because it's a profile field, not a preference toggle
- Email is read-only because it's the auth identifier
- Language and timezone auto-save immediately on change

#### 7.4.2 Section 2: Appearance

| Setting | Label | Control Type | Default | Description | Prisma Model | Validation |
|---|---|---|---|---|---|---|
| theme | Theme | Radio group (3) | "dark" | Choose dark, light, or system color scheme | UserSettings.theme | One of: dark, light, system |
| compactMode | Compact Mode | Toggle (boolean) | false | Reduce spacing and show more content per screen | UserSettings.compactMode | Boolean |
| sidebarCollapsed | Sidebar Collapsed | Toggle (boolean) | false | Start with a collapsed sidebar for more workspace | UserSettings.sidebarCollapsed | Boolean |

**Appearance section notes:**
- Theme change applies instantly via `next-themes` setTheme()
- Theme selection uses visual radio buttons with color dot indicators (dark circle, light circle, gradient circle)
- Compact mode affects: card padding, stat card sizes, section spacing
- Sidebar collapsed affects: initial sidebar state on app load

#### 7.4.3 Section 3: Focus

| Setting | Label | Control Type | Default | Description | Prisma Model | Validation |
|---|---|---|---|---|---|---|
| defaultDuration | Default Focus Duration | Select | 45 | Default timer length for new focus sessions | UserSettings.estimatedDuration | One of: 15, 25, 30, 45, 60, 90, 120 |
| focusGoal | Daily Focus Goal | Slider | 120 | Target minutes of deep focus per day | UserSettings.focusGoalMinutes | Range: 30–300, step: 15 |
| autoStartTimer | Auto-Start Timer | Toggle | false | Auto-begin timer when entering focus mode | UserSettings.autoStartTimer | Boolean |
| showCelebration | Celebration Screen | Toggle | true | Show animated celebration after completing sessions | UserSettings.showCelebration | Boolean |
| ambientSound | Ambient Sound | Select | "none" | Background sound during focus sessions | UserSettings.ambientSound | One of: none, rain, classical, white_noise, cafe, nature |
| hasAdhd | ADHD Mode | Toggle | false | Enable ADHD-adapted coaching: shorter sessions, gentler nudges, more breaks | UserSettings.hasAdhd | Boolean |
| pomodoroPreference | Pomodoro Schedule | Select | "45/10" | Work/break interval pattern | UserSettings.pomodoroPreference | One of: 25/5, 45/10, 60/15, 90/20 |
| focusStyle | Focus Mode Style | Select | "flexible" | Timer mode: pomodoro, deep work, or flexible | UserSettings.focusStyle | One of: pomodoro, deep_work, flexible |
| preferredSchedule | Session Schedule | Select | "flexible" | Structured or flexible session timing | UserSettings.preferredSchedule | One of: structured, flexible |

**Focus section notes:**
- Default duration maps from onboarding's `focusDurationComfort` via `mapFocusDurationToEstimatedDuration()`
- Daily focus goal is the same slider from onboarding (now accessible here for adjustment)
- ADHD mode toggle shows a supportive description, not clinical language
- Ambient sound options: rain, classical, white_noise, cafe, nature (played via Web Audio API or similar)
- pomodoroPreference and focusStyle are derived from onboarding but adjustable here

#### 7.4.4 Section 4: AI Coach

| Setting | Label | Control Type | Default | Description | Prisma Model | Validation |
|---|---|---|---|---|---|---|
| coachPersonality | Coach Personality | Radio group (3) | "friendly" | How your AI coach talks to you | UserSettings.coachPersonality | One of: strict, friendly, data_nerd |
| motivationStyle | Motivation Style | Radio group (3) | "balanced" | How the app feels: gamification, minimalist, or balanced | UserSettings.motivationStyle | One of: gamification, minimalist, balanced |
| aiProvider | AI Provider | Select | "openai" | Choose which AI provider to use for coaching | UserSettings.aiProvider | One of: openai, deepseek, gemini, anthropic, ollama |
| aiModel | AI Model | Select | "gpt-4o-mini" | Select which model to use | UserSettings.aiModel | Depends on provider |
| aiApiKey | API Key | Input (password) | null | API key for external AI providers (stored securely) | UserSettings.aiApiKey (encrypted) | String, min 20 chars for OpenAI |
| ollamaUrl | Ollama URL | Input (text) | "http://localhost:11434" | URL for self-hosted Ollama server | UserSettings.ollamaUrl | Valid URL format |

**AI Coach section notes:**
- Coach personality cards show preview quotes (strict: "No excuses today", friendly: "You're doing great!", data_nerd: "Your focus score is up 12%")
- API Key input uses password masking with Eye/EyeOff toggle for visibility
- AI model dropdown changes based on selected provider (dynamic options)
- Ollama URL only shown when provider = "ollama"
- API key is stored encrypted, never sent to client in plain text after initial save

#### 7.4.5 Section 5: Notifications

| Setting | Label | Control Type | Default | Description | Prisma Model | Validation |
|---|---|---|---|---|---|---|
| desktopNotifications | Desktop Notifications | Toggle | true | Show system notifications for focus events | UserSettings.desktopNotifications | Boolean |
| breakReminders | Break Reminders | Toggle | true | Remind you to take breaks during long sessions | UserSettings.breakReminders | Boolean |
| missionReminders | Mission Reminders | Toggle | true | Get notified about mission progress | UserSettings.missionReminders | Boolean |
| streakReminders | Streak Milestones | Toggle | true | Celebrate streak achievements | UserSettings.streakReminders | Boolean |
| achievementAlerts | Achievement Alerts | Toggle | true | Notify when new achievements are unlocked | UserSettings.achievementAlerts | Boolean |
| idleAlerts | Idle Alerts | Toggle | false | Warn when you've been idle for too long | UserSettings.idleAlerts | Boolean |
| muteAll | Mute All | Toggle | false | Suppress all notifications at once | UserSettings.muteAll | Boolean |

**Notifications section notes:**
- "Mute All" is a master override that disables all other notification settings visually (but doesn't change their stored values)
- When "Mute All" is on, all other toggles are visually dimmed and disabled
- When "Mute All" is turned off, previous individual settings are restored
- Desktop notifications require browser permission (requested on first toggle)

#### 7.4.6 Section 6: Desktop

| Setting | Label | Control Type | Default | Description | Prisma Model | Validation |
|---|---|---|---|---|---|---|
| trackerStatus | Tracker Connection | Status badge | — | Shows if desktop agent is connected | — | Read-only, polled every 30s |
| autoStart | Auto Start | Toggle | false | Launch MindGuard Desktop with system login | DesktopSettings.autoStart | Boolean |
| runInBackground | Run in Background | Toggle | true | Minimize to tray instead of closing | DesktopSettings.runInBackground | Boolean |
| trackingEnabled | Tracking Enabled | Toggle | false | Record desktop app activity for distraction detection | DesktopSettings.trackingEnabled | Boolean |
| focusProtection | Focus Protection | Toggle | false | Block distracting apps during focus sessions | DesktopSettings.focusProtection | Boolean |
| muteNotifications | Mute Notifications (desktop) | Toggle | false | Suppress all desktop notifications during focus | DesktopSettings.muteNotificationsDuringFocus | Boolean |
| trackerInterval | Tracker Interval | Slider | 15 | How often tracker polls active window (5–120 sec) | DesktopSettings.trackerInterval | Range: 5–120, step: 5 |
| blockedApps | Blocked Apps | List editor | [] | Apps to block during focus sessions | DesktopSettings.blockedApps | Array of strings |
| blockedWebsites | Blocked Websites | List editor | [] | Websites to block during focus sessions | DesktopSettings.blockedWebsites | Array of strings |
| exclusions | Tracking Exclusions | List editor | [] | Apps/websites to exclude from tracking | DesktopSettings.exclusions | Array of strings |
| privacyMode | Privacy Mode | Toggle | false | Hide window titles from tracking data | DesktopSettings.privacyMode | Boolean |

**Desktop section notes:**
- Tracker status is read-only; shows connected/offline with download CTA
- Auto Start and Run in Background only work when desktop agent is installed
- Tracking Enabled is the master toggle for all activity tracking
- When Tracking Enabled is off, all tracking-dependent features (distraction detection, heatmap desktop data, timeline desktop events) show "tracking disabled" states
- Blocked apps/sites list uses add/remove interface with text input + delete buttons
- Privacy Mode hides window titles — only tracks app category (e.g., "Social Media" instead of "Instagram - User's Feed")
- Tracker Interval is advanced; shown with a "Advanced" label

#### 7.4.7 Section 7: Data & Privacy

| Setting | Label | Control Type | Default | Description | Prisma Model | Validation |
|---|---|---|---|---|---|---|
| exportData | Export Your Data | Button | — | Download all missions, sessions, and reflections as JSON | — | Triggers /api/export, returns JSON file |
| shareStats | Share Statistics | Toggle | false | Contribute anonymized stats to community leaderboard | UserSettings.shareStats | Boolean |
| publicProfile | Public Profile | Toggle | false | Allow others to see your achievements and streaks | UserSettings.publicProfile | Boolean |
| deleteAccount | Delete Account | Button (destructive) | — | Permanently delete your account and all data | — | Requires 2-step confirmation |
| sessionManagement | Active Sessions | List (read-only) | — | View and revoke active login sessions | — | Shows session list with revoke buttons |
| connectedDevices | Connected Devices | List (read-only) | — | Devices where MindGuard Desktop is installed | — | Shows device list with disconnect buttons |

**Data & Privacy section notes:**
- Export data: downloads a JSON file containing all user data (missions, sessions, reflections, habits, achievements, settings)
- Delete account: 2-step confirmation:
  1. "Are you sure? This permanently deletes all your data." → Confirm button
  2. "Type 'DELETE' to confirm." → Must type exact string
  After confirmation: API call to delete account, redirect to landing page
- Share stats: only shares anonymized aggregate data (total focus minutes, average score) — never personal data
- Public profile: shows achievements and streak on a shareable profile page (future feature)
- Session management: shows list of active browser sessions with IP, device, last active time, and "Revoke" button
- Connected devices: shows desktop agent installations with device name, status, and "Disconnect" button

**Future additions to this section:**

| Setting | Label | Control Type | Default | Description | Status |
|---|---|---|---|---|---|
| billing | Billing & Subscription | Card | — | Manage Pro subscription, view invoices, update payment | Future (when billing implemented) |
| apiKeys | API Keys | List editor | [] | Manage API keys for integrations | Future |
| dataRetention | Data Retention | Select | "forever" | How long to keep historical data | Future |

#### 7.4.8 Section 8: Advanced

| Setting | Label | Control Type | Default | Description | Prisma Model | Validation |
|---|---|---|---|---|---|---|
| keyboardShortcuts | Keyboard Shortcuts | Button → Modal | — | View and manage all keyboard shortcuts | — | Opens KeyboardShortcutsModal |
| debugMode | Debug Mode | Toggle | false | Show debug info and additional logging | UserSettings.debugMode | Boolean |
| showApiLogs | Show API Logs | Toggle | false | Display API request/response logs in console | UserSettings.showApiLogs | Boolean |
| clearCache | Clear Local Cache | Button | — | Remove cached data from localStorage | — | Triggers localStorage.clear(), refresh |
| forceSync | Force Sync | Button | — | Force immediate data synchronization with server | — | Triggers /api/sync |
| exportSettings | Export Settings | Button | — | Download all settings as JSON file | — | Triggers settings JSON download |
| importSettings | Import Settings | Button (file upload) | — | Upload settings from a JSON file | — | File input, validates JSON structure |
| resetAllSettings | Reset All Settings | Button (destructive) | — | Reset all settings to factory defaults | — | Requires confirmation dialog |

**Advanced section notes:**
- Keyboard shortcuts moved here from its own section — reduces section count without losing functionality
- Debug mode and API logs are developer-facing features, hidden behind a "Developer Tools" sub-header
- Clear cache, force sync, export/import settings are data management tools
- Reset all settings requires confirmation: "This will reset all preferences to defaults. Your missions and sessions will NOT be deleted."
- Import settings validates the JSON structure before applying — rejects invalid or partial files

### 7.5 Collapsible Sections Behavior

#### 7.5.1 Default State

All sections are **collapsed by default**. The user sees only section headers:

```
┌──────────────────────────────────────────┐
│ ▶ Profile            Language, timezone  │
│ ▶ Appearance         Theme, sidebar      │
│ ▶ Focus              Timer, goals        │
│ ▶ AI Coach           Provider, style     │
│ ▶ Notifications      Alerts, reminders   │
│ ▶ Desktop            Tracker, blocking   │
│ ▶ Data & Privacy     Export, delete      │
│ ▶ Advanced           Debug, shortcuts    │
└──────────────────────────────────────────┘
```

#### 7.5.2 Expanded State

When a section header is clicked, it expands to show all settings within that section. Only one section is expanded at a time (accordion behavior).

```
┌──────────────────────────────────────────┐
│ ▼ Profile            Language, timezone  │
│   ┌────────────────────────────────────┐ │
│   │ Display Name: [Alex]              │ │
│   │ Language: [English ▼]             │ │
│   │ Timezone: [America/New_York ▼]    │ │
│   │ Email: alex@example.com (locked)  │ │
│   │ [Save Changes]                    │ │
│   │ ── Danger Zone ──                 │ │
│   │ [Sign Out]                        │ │
│   └────────────────────────────────────┘ │
│ ▶ Appearance         Theme, sidebar      │
│ ▶ Focus              Timer, goals        │
│ ...                                      │
└──────────────────────────────────────────┘
```

#### 7.5.3 Section Expansion Animation

- Chevron icon rotates: `▶` (collapsed) → `▼` (expanded)
- Content area: `AnimatePresence` with slide-down animation
- Duration: 200ms, easing: ease-out
- Only one section open at a time (clicking another section closes the current one)

### 7.6 Immediate Save Behavior

#### 7.6.1 Auto-Save Settings

All toggle, select, and slider settings save immediately when changed:

1. User changes a setting (toggle, select, slider)
2. The change is sent to the server via API call
3. A toast notification appears: "Setting updated" (success) or "Failed to update setting" (error)
4. An "Undo" option appears in the toast for 5 seconds

**API calls:**
- User settings: `PUT /api/user/settings` with `{ key: value }` payload
- Desktop settings: `PUT /api/desktop/settings` with `{ key: value }` payload

#### 7.6.2 Manual-Save Settings

Only the Display Name field requires a manual "Save Changes" button because:
- It's a profile field that the user might want to edit and review before saving
- It has validation that should be checked before committing
- The save button shows states: default → "Saving..." (with spinner) → "Saved" (with check icon) → default

#### 7.6.3 Undo Affordance

After any auto-save setting change, a toast appears with:
- Setting name: "Theme changed to dark"
- Undo button: "Undo" → reverts to previous value, sends another API call
- Duration: toast auto-dismisses after 5 seconds
- Undo sends the previous value to the same API endpoint

### 7.7 Confirmation for Destructive Actions

#### 7.7.1 Sign Out

- No confirmation needed — sign out is non-destructive (user can sign back in)
- Red-outlined danger card for visual distinction

#### 7.7.2 Delete Account

**Two-step confirmation:**

Step 1: "Are you sure you want to delete your account?"
- Description: "This will permanently delete all your data including missions, sessions, reflections, habits, and achievements. This action cannot be undone."
- Buttons: "Cancel" (default) + "Continue" (red)

Step 2: "Type DELETE to confirm"
- Input field: user must type the exact string "DELETE"
- Buttons: "Cancel" + "Delete Account" (only enabled when input matches "DELETE")

After confirmation:
- API call: `DELETE /api/user/account`
- On success: sign out, redirect to landing page
- On failure: error toast "Failed to delete account. Please try again or contact support."

#### 7.7.3 Reset All Settings

- One-step confirmation: "This will reset all preferences to defaults. Your missions and sessions will NOT be deleted."
- Buttons: "Cancel" + "Reset Settings"
- After confirmation: API call to reset all UserSettings to defaults, refresh UI

#### 7.7.4 Clear Cache

- No confirmation needed — clearing localStorage is non-destructive (data is synced to server)
- Action: `localStorage.clear()`, then page refresh
- Toast: "Local cache cleared"

### 7.8 Search Within Settings

#### 7.8.1 Search Index

The settings view includes a `searchIndex` array of `SearchableSetting` objects:

```typescript
interface SearchableSetting {
  id: string;
  sectionId: SectionId;
  label: string;
  description: string;
  keywords: string[];
}
```

Each setting has an entry with keywords for fuzzy matching:

| Setting | Keywords |
|---|---|
| Language | language, locale, english, spanish, french |
| Theme | theme, dark, light, system, color, mode |
| Coach Personality | coach, personality, strict, friendly, data |
| API Key | api, key, secret, credential |
| etc. | ... |

#### 7.8.2 Search UI

- Search input at the top of the settings view
- Uses `Command` component (cmdk) for keyboard-navigable search
- Results show: setting label + section name + description
- Clicking a result: expands the relevant section and scrolls to the setting
- Icon: Search (🔍) in the input field

#### 7.8.3 Search Behavior

1. User types in search field
2. Settings view filters to show only matching settings
3. Matching sections auto-expand
4. Non-matching sections collapse and dim
5. On clear: all sections return to default collapsed state

### 7.9 Settings That Should Be Removed or Merged

#### 7.9.1 Remove: "About" Section

**Why:** Version, credits, and links are reference information, not configurable settings. They should appear in:
- Sidebar footer (version number)
- Help menu or external link (credits, documentation)
- Not in the Settings view

#### 7.9.2 Merge: "Tracking" into "Desktop"

**Why:** Tracking settings (tracking toggle, exclusions) are sub-functions of the desktop agent. Having them in a separate section forces users to navigate two sections for related functionality.

#### 7.9.3 Merge: "Keyboard" into "Advanced"

**Why:** Keyboard shortcuts are a single modal with 2 entries. They don't warrant their own section. Moving the "View Shortcuts" button to Advanced reduces visual clutter.

#### 7.9.4 Merge: "General" + "Account" → "Profile"

**Why:** Display name, language, timezone, email, and sign out are all identity-related settings. They belong together as "who you are" settings, separate from "how the app behaves" settings.

#### 7.9.5 Merge: Privacy (data-related) → "Data & Privacy"

**Why:** "Share stats", "Public profile", "Privacy mode" (window title hiding), "Export data", and "Delete account" are all about data control. They belong together.

### 7.10 Settings That Should Be Added

#### 7.10.1 Session Management

- **Section:** Data & Privacy
- **Label:** Active Sessions
- **Control:** Read-only list with revoke buttons
- **Data:** Shows all active auth sessions with device, IP, last active time
- **API:** `GET /api/user/sessions`, `DELETE /api/user/sessions/{id}`

#### 7.10.2 Connected Devices

- **Section:** Data & Privacy
- **Label:** Connected Devices
- **Control:** Read-only list with disconnect buttons
- **Data:** Shows desktop agent installations with device name, OS, connection status
- **API:** `GET /api/desktop/devices`, `DELETE /api/desktop/devices/{id}`

#### 7.10.3 Motivation Style (Explicit)

- **Section:** AI Coach
- **Label:** Motivation Style
- **Control:** Radio group (3: gamification, minimalist, balanced)
- **Why:** Even though we infer this during onboarding, the user should be able to explicitly adjust it
- **Default:** Inferred value from onboarding

#### 7.10.4 ADHD Mode (Explicit in Focus)

- **Section:** Focus
- **Label:** ADHD Mode
- **Control:** Toggle
- **Why:** The onboarding ADHD toggle sets the initial value, but users may want to enable/disable it later
- **Default:** Value from onboarding

#### 7.10.5 Data Retention Period (Future)

- **Section:** Data & Privacy
- **Label:** Data Retention
- **Control:** Select (forever, 1 year, 6 months, 3 months)
- **Why:** Some users want their historical data auto-purged after a period
- **Default:** "forever"

#### 7.10.6 API Keys Management (Future)

- **Section:** Data & Privacy
- **Label:** API Keys
- **Control:** List editor (create, revoke, name keys)
- **Why:** For integrations and third-party access
- **Default:** Empty

### 7.11 Desktop-Specific Settings Section

The Desktop section contains settings that **only function when the MindGuard Desktop Agent is installed**. These settings are:

- Auto Start (launch on system login)
- Run in Background (minimize to tray)
- Tracking Enabled (record desktop activity)
- Focus Protection (block distracting apps)
- Mute Notifications during Focus
- Tracker Interval (poll frequency)
- Blocked Apps list
- Blocked Websites list
- Tracking Exclusions list

**Mobile behavior:** On mobile (no desktop agent possible), this section shows:
- A message: "Desktop features require the MindGuard Desktop app. Download it for macOS, Windows, or Linux."
- A download link to GitHub releases
- The section is collapsed and dimmed
- No settings are interactive

### 7.12 Delete Account Flow

#### 7.12.1 Step-by-Step Flow

```
1. User clicks "Delete Account" button in Data & Privacy section
2. Confirmation Dialog Step 1 appears:
   ┌──────────────────────────────────────┐
   │ ⚠️ Delete Your Account              │
   │                                      │
   │ This will permanently delete:        │
   │ • All missions and sessions          │
   │ • All reflections and habits         │
   │ • All achievements and XP            │
   │ • All personal settings              │
   │                                      │
   │ This action CANNOT be undone.        │
   │                                      │
   │ [Cancel]  [Continue →]               │
   └──────────────────────────────────────┘

3. User clicks "Continue"
4. Confirmation Dialog Step 2 appears:
   ┌──────────────────────────────────────┐
   │ ⚠️ Final Confirmation               │
   │                                      │
   │ Type DELETE to confirm:              │
   │ [________________]                   │
   │                                      │
   │ [Cancel]  [Delete Account] (disabled │
   │            until "DELETE" typed)     │
   └──────────────────────────────────────┘

5. User types "DELETE"
6. "Delete Account" button becomes enabled (red)
7. User clicks "Delete Account"
8. API call: DELETE /api/user/account
9. Success → sign out → redirect to landing
10. Failure → error toast → user stays in settings
```

### 7.13 Data Export Flow

#### 7.13.1 Step-by-Step Flow

```
1. User clicks "Export Your Data" button in Data & Privacy section
2. Button enters loading state: [Exporting...]
3. API call: GET /api/user/export
4. Server generates JSON file containing:
   - User profile (name, email, created date)
   - All missions (title, description, status, sessions)
   - All sessions (duration, startedAt, completedAt, mission)
   - All reflections (content, date, mood)
   - All habits (name, icon, entries)
   - All achievements (type, unlocked, progress)
   - All settings (every UserSettings field)
5. Server returns JSON file download
6. Browser triggers file download (mindguard-export-{date}.json)
7. Button returns to normal state: [Export]
8. Toast: "Data exported successfully"
```

**Export file size estimate:** ~50KB for average user (100 sessions, 20 habits, 8 achievements)

### 7.14 Mobile Settings (Available vs Desktop-Only)

#### 7.14.1 Settings Available on Both Mobile and Desktop

| Section | Settings Available |
|---|---|
| Profile | Display Name, Language, Timezone, Sign Out (Email is read-only) |
| Appearance | Theme, Compact Mode |
| Focus | Default Duration, Daily Goal, Auto-Start, Celebration, Ambient Sound, ADHD Mode |
| AI Coach | Coach Personality, Motivation Style, AI Provider, AI Model, API Key |
| Notifications | All notification toggles |
| Data & Privacy | Export Data, Share Stats, Public Profile, Delete Account |

#### 7.14.2 Settings Available ONLY on Desktop

| Section | Settings Desktop-Only |
|---|---|
| Desktop | Entire section (tracker, blocking, exclusions, privacy mode) |
| Appearance | Sidebar Collapsed (sidebar doesn't exist on mobile) |
| Advanced | Keyboard Shortcuts (mobile uses touch, no keyboard) |
| Notifications | Desktop Notifications (mobile uses in-app notifications instead) |

#### 7.14.3 Mobile-Specific Adaptations

- **Sidebar Collapsed** → hidden on mobile (sidebar is always overlay-based)
- **Desktop Notifications** → replaced with "In-App Notifications" toggle on mobile
- **Keyboard Shortcuts** → hidden on mobile
- **Desktop section** → shows "Download desktop app" message, all settings dimmed
- **Compact Mode** → forced ON on mobile (screen space is limited)
- **Tracker Interval** → hidden on mobile

### 7.15 Settings View Layout

#### 7.15.1 Desktop Layout (≥1024px)

```
┌──Sidebar──┐ ┌──Settings Content──────────────────────────────┐
│            │ │ [🔍 Search settings...]                       │
│ ▶ Profile  │ │                                              │
│ ▶ Appearance│ │ ┌──Expanded Section────────────────────────┐ │
│ ▶ Focus    │ │ │  Section Title          [Reset Section]  │ │
│ ▶ Coach    │ │ │                                              │ │
│ ▶ Notif    │ │ │  ┌─Card─────────────────────────────────┐ │ │
│ ▶ Desktop  │ │ │  │ Setting Row: Icon | Label | Control │ │ │
│ ▶ Data     │ │ │  │ ─── separator ───                    │ │ │
│ ▶ Advanced │ │ │  │ Setting Row: Icon | Label | Control │ │ │
│            │ │ │  └─────────────────────────────────────┘ │ │
│            │ │ │                                              │ │
│            │ │ │  ┌─Danger Card──────────────────────────┐ │ │
│            │ │ │  │ [Red] Destructive action button      │ │ │
│            │ │ │  └─────────────────────────────────────┘ │ │
│            │ │ └──────────────────────────────────────────┘ │
└────────────┘ └──────────────────────────────────────────────┘
```

- Sidebar width: standard sidebar width (64px collapsed, 240px expanded)
- Settings content: full width minus sidebar
- Section navigation: left sidebar with section icons and labels
- Currently selected section: highlighted in sidebar

#### 7.15.2 Mobile Layout (<768px)

```
┌──────────────────────────────────────┐
│ Settings                  [✕ Close]  │
│                                      │
│ [🔍 Search settings...]             │
│                                      │
│ ▶ Profile                            │
│ ▶ Appearance                         │
│ ▶ Focus                              │
│ ▶ AI Coach                           │
│ ▶ Notifications                      │
│ ▶ Desktop (dimmed)                   │
│ ▶ Data & Privacy                     │
│ ▶ Advanced                           │
│                                      │
│ (expanded section content below)     │
└──────────────────────────────────────┘
```

- No sidebar — sections are inline collapsible headers
- Close button: returns to previous view
- Section headers act as both navigation and expansion triggers
- Desktop section is visually dimmed with "Requires desktop app" note

### 7.16 Settings Design Tokens

| Element | Style |
|---|---|
| Section header title | `text-lg font-semibold text-zinc-100` |
| Section header description | `text-sm text-zinc-500` |
| Section reset button | `text-[11px] text-zinc-500 hover:text-zinc-300` with RotateCcw icon |
| Setting row icon container | `h-8 w-8 rounded-lg bg-emerald-500/[0.08]` |
| Setting row icon | `h-4 w-4 text-emerald-400/80` |
| Setting row label | `text-sm font-medium text-zinc-200` |
| Setting row description | `text-xs text-zinc-500` |
| Setting row default value hint | `text-[10px] text-zinc-600` |
| Setting row reset button | `h-6 w-6 rounded-md text-zinc-600 hover:text-zinc-300` with RotateCcw icon |
| Card | `card-glow border-white/[0.06] bg-white/[0.02]` |
| Card padding | `p-6` |
| Card spacing | `space-y-5` between setting rows |
| Separator | `bg-white/[0.04]` |
| Danger card | `card-glow border-red-500/[0.08] bg-red-500/[0.02]` |
| Danger icon | `text-red-400` |
| Danger icon container | `bg-red-500/[0.08]` |
| Toggle switch | Standard Switch component, emerald when on |
| Select trigger | `w-[140px] border-white/[0.06] bg-white/[0.03] text-zinc-200 text-xs h-8` |
| Select content | `border-white/[0.06] bg-zinc-900` |
| Input field | `border-white/[0.06] bg-white/[0.03] text-zinc-200 placeholder:text-zinc-600` |

### 7.17 Settings State Management

#### 7.17.1 UserSettings Data Flow

```
1. SettingsView mounts
2. Fetch GET /api/user/settings
3. Response → UserSettingsData object
4. Store in local state: userSettings
5. setUserSetting(key, value) → 
   a. Update local state immediately (optimistic)
   b. Send PUT /api/user/settings { key: value }
   c. On success: toast "Setting updated"
   d. On failure: revert local state, toast "Failed to update setting"
```

#### 7.17.2 DesktopSettings Data Flow

```
1. SettingsDesktop component mounts
2. Fetch GET /api/desktop/settings
3. Response → DesktopSettingsData object
4. Store in local state: settings
5. saveSetting(key, value) →
   a. Update local state immediately (optimistic)
   b. Send PUT /api/desktop/settings { key: value }
   c. On success: update local state with server response, toast "Setting updated"
   d. On failure: revert local state, toast "Failed to update setting"
```

#### 7.17.3 Profile Data Flow

```
1. SettingsGeneral mounts
2. displayName initialized from session.user.name
3. User edits displayName in input
4. User clicks "Save Changes"
5. handleSaveProfile() →
   a. Set saving=true, saved=false
   b. Send PUT /api/user/profile { displayName }
   c. On success: saving=false, saved=true, toast "Profile updated"
   d. On failure: saving=false, error=message, toast error
```

### 7.18 Future Billing Section (Planned)

When billing is implemented, a "Billing" section will be added between "Data & Privacy" and "Advanced":

| Setting | Label | Control Type | Default | Description |
|---|---|---|---|---|
| currentPlan | Current Plan | Status card | Free | Shows current subscription tier |
| upgradePlan | Upgrade to Pro | Button | — | Opens pricing/upgrade flow |
| paymentMethod | Payment Method | Card display | — | Shows current card (last 4 digits) |
| invoices | Invoice History | List | — | Download past invoices |
| cancelSubscription | Cancel Subscription | Button (destructive) | — | Downgrade to Free tier |

**Billing section notes:**
- Only shown when billing system is implemented
- "Upgrade to Pro" opens an external Stripe checkout or in-app upgrade flow
- "Cancel Subscription" requires confirmation but is NOT destructive (user keeps Free tier access, data preserved)
- Invoice history links to Stripe customer portal

---

## Section 8: Component Inventory

This section documents every reusable component in MindGuard. Each component is specified with its purpose, variants, states, responsive behavior, accessibility, animation, reuse guidelines, and design tokens applied.

### 8.1 Buttons

**Purpose:** Primary interactive element for triggering actions, navigation, and form submission. Every clickable action in the app uses a Button component.

**Variants:**

| Variant | Class | Visual | Use Case |
|---|---|---|---|
| `default` (Primary) | `bg-primary text-primary-foreground shadow-xs hover:bg-primary/90` | Solid dark (light mode) / solid white (dark mode) with subtle shadow | Primary CTA: "Start Focus", "Save", "Continue" |
| `secondary` | `bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80` | Muted background, lighter text | Secondary actions: "Cancel", "Later", "Skip" |
| `destructive` | `bg-destructive text-white shadow-xs hover:bg-destructive/90` | Red/destructive background with white text | Destructive actions: "Delete", "Remove", "Clear Data" |
| `outline` | `border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground` | Bordered, transparent background | Tertiary actions, filter toggles, "Edit" |
| `ghost` | `hover:bg-accent hover:text-accent-foreground` | No visible background until hover | Inline actions, icon buttons, toolbar items |
| `link` | `text-primary underline-offset-4 hover:underline` | Text-only with underline on hover | Text links within prose, "Learn more" |
| Premium gradient | `btn-glow` + `btn-premium` classes | Emerald gradient border glow, scale on hover | Premium CTA: "Start Focus" on timer, "Upgrade" on landing |

**Sizes:**

| Size | Dimensions | Padding | Use Case |
|---|---|---|---|
| `default` | h-9 | px-4 py-2 | Standard buttons |
| `sm` | h-8 | px-3, gap-1.5 | Compact buttons, inline actions |
| `lg` | h-10 | px-6 | Hero CTA, onboarding actions |
| `icon` | size-9 (36×36) | Icon only | Icon-only buttons (toolbar, close, etc.) |

**States:**

| State | Visual | Implementation |
|---|---|---|
| Default | Base variant styling | — |
| Hover | Scale 1.02, lift -1px, border brightens (200ms ease) | CSS `transition-all` + `btn-premium:hover` |
| Active | Scale 0.97, press down (150ms ease) | `btn-premium:active { transform: scale(0.97) }` |
| Disabled | Opacity 40%, pointer-events-none | `disabled:pointer-events-none disabled:opacity-50` |
| Focus | Emerald ring (outline + box-shadow) | `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]` |
| Loading | Spinner icon replaces content, disabled state | Spinner child + `disabled` prop |
| Error | `aria-invalid` triggers destructive ring | `aria-invalid:ring-destructive/20 aria-invalid:border-destructive` |

**Responsive Behavior:**
- Default size on mobile, can use `lg` on desktop for hero CTAs
- Icon buttons maintain 36×36px minimum touch target
- Full-width buttons on mobile (`w-full`) for primary CTAs in modals
- Text truncation with `whitespace-nowrap` and `shrink-0`

**Accessibility:**
- `data-slot="button"` for E2E testing
- `aria-disabled` when disabled
- `aria-invalid` when form validation fails
- `focus-visible` ring only on keyboard navigation (not mouse click)
- `asChild` prop allows rendering as `<a>` for navigation links
- Screen reader: announces button text + state (disabled, loading)

**Animation:**
- Hover: `transition-all 200ms ease` + `btn-premium:hover` box-shadow
- Press: `scale(0.97) 150ms ease`
- Premium: `btn-glow::before` gradient opacity transition 300ms
- Focus ring: instant (0ms) — no animation on focus ring appearance

**Design Tokens Applied:**
- `--primary`, `--primary-foreground`, `--secondary`, `--destructive`
- `--accent`, `--accent-foreground`
- `--ring` (emerald-500 hsl(160 84% 39%))
- `--border`, `--input`

**Reuse Guidelines:**
- ✅ Use for all clickable actions
- ✅ Use `asChild` when wrapping links (preserves semantic `<a>`)
- ❌ Do NOT use `<a>` styled as button without `asChild` (breaks accessibility)
- ❌ Do NOT use for navigation items (use NavButton in sidebar)
- ❌ Do NOT use more than one primary button per section

---

### 8.2 Cards

**Purpose:** Container for grouping related content. The foundational building block for all dashboard sections, stats, coach messages, missions, and habits.

**Variants:**

| Variant | CSS Class | Visual | Use Case |
|---|---|---|---|
| Glass Card | `glass-card` | Glassmorphism with blur, subtle border, deep shadow | Dashboard cards, onboarding step cards |
| Stat Card | `glass-card` + stat layout | Glass card with number, label, trend icon | Dashboard metrics: "Focus Time", "Streak", "Sessions" |
| Coach Card | `glass-card` + coach styling | Glass card with avatar, message, action | AI Coach messages, suggestions |
| Mission Card | `glass-card` + mission layout | Glass card with title, priority, progress, action | Mission list items |
| Metric Card | `glass-card` + metric layout | Glass card with sparkline, value, label | Dashboard metrics row |
| Habit Card | `glass-card` + habit layout | Glass card with habit name, streak, toggle | Habit tracking items |
| Active/Selected | `glass-card-active` | Emerald border tint, emerald bg tint | Selected onboarding options, active mission |

**Card Sub-components:**

| Sub-component | Purpose | Visual |
|---|---|---|
| `CardHeader` | Title area with optional action | Grid layout, px-6, gap-1.5 |
| `CardTitle` | Card heading | `font-semibold`, `leading-none` |
| `CardDescription` | Subtitle/muted text | `text-muted-foreground`, `text-sm` |
| `CardAction` | Top-right action area | `col-start-2`, `self-start` |
| `CardContent` | Main content area | `px-6` |
| `CardFooter` | Bottom action area | `flex`, `px-6` |

**States:**

| State | Visual | Timing |
|---|---|---|
| Default | Glass card, subtle border (white/6) | — |
| Hover | Border brightens (white/10), lift -2px, shadow deepens | 300ms cubic-bezier(0.34, 1.56, 0.64, 1) |
| Selected/Active | Emerald border (emerald/20), emerald bg tint, check badge | 200ms spring |
| Disabled | Opacity 50%, no hover effect | — |
| Loading | Skeleton shimmer overlay | 1.5s shimmer |
| Error | Destructive border, error message | — |

**Responsive Behavior:**
- Cards stack vertically on mobile (`flex-col`)
- Grid layout: 1 column on mobile, 2 on tablet, 3+ on desktop
- `card-spacing` utility: `p-5` on mobile, `p-6` on `sm:`
- Full-width on mobile, constrained width on desktop

**Accessibility:**
- `data-slot="card"` for E2E testing
- Interactive cards: `role="button"`, `tabIndex={0}`, `aria-pressed` for selected state
- Card actions: proper `aria-label` for icon-only buttons
- Screen reader: card title announced first, then content

**Animation:**
- Hover: `lift-hover` — `translateY(-2px) 300ms cubic-bezier(0.34, 1.56, 0.64, 1)`
- Highlight bar: `card-highlight::after` opacity 0→1 on hover (300ms ease)
- Glow edge: `glass-glow-edge::before` opacity 0→1 on hover (300ms ease)
- Stagger reveal: `staggerContainer` + `staggerItem` (60ms offset per card)

**Design Tokens Applied:**
- `--card`, `--card-foreground`
- `--border` (white/8% in dark mode)
- Glassmorphism: `rgba(255, 255, 255, 0.02)` bg, `blur(24px)` backdrop
- Shadow: `0 1px 3px rgba(0,0,0,0.35)`, `0 4px 20px rgba(0,0,0,0.18)`

**Reuse Guidelines:**
- ✅ Use for all grouped content sections
- ✅ Use `glass-card` for dark mode cards
- ✅ Use `glass-card-active` for selected/interactive states
- ❌ Do NOT use raw `<div>` with manual card styling — always use Card component
- ❌ Do NOT nest glass cards (causes double-blur artifacts)

---

### 8.3 Heatmap

**Purpose:** Year-long contribution heatmap showing daily focus minutes. Inspired by GitHub's contribution graph. Displays focus activity and habit completion data.

**Implementation:** `src/components/dashboard/heatmap.tsx`

**Variants:**

| Variant | Visual | Use Case |
|---|---|---|
| Compact (default) | Last 90 days, 10×10px cells | Dashboard sidebar |
| Full map | Last 365 days, 10×10px cells | Expanded view (toggle) |

**Color Scale (focus minutes):**

| Minutes | Color | Opacity |
|---|---|---|
| 0 | `bg-white/[0.03]` | Nearly invisible |
| 1–14 | `bg-emerald-500/20` | Light |
| 15–29 | `bg-emerald-500/35` | Medium-light |
| 30–59 | `bg-emerald-500/50` | Medium |
| 60–119 | `bg-emerald-500/65` | Medium-dark |
| 120+ | `bg-emerald-500/80` | Dark |

**Habit Completion Overlay:** Small amber dot (`h-[3px] w-[3px] bg-amber-400/60`) in bottom-right corner of cells where habits were completed.

**States:**

| State | Visual | Timing |
|---|---|---|
| Default | Colored cell per minute scale | — |
| Hover | Ring highlight (`ring-1 ring-emerald-500/40`) + tooltip | 150ms |
| Loading | Skeleton shimmer | 1.5s |
| Empty | `bg-white/[0.03]` cells | — |

**Responsive Behavior:**
- Compact mode: 90 days, fits in sidebar width
- Full mode: 365 days, scrollable horizontally on mobile
- Tooltip positions near cursor, clamped to viewport
- Cell size: 10×10px on all breakpoints

**Accessibility:**
- Individual cells: `aria-hidden="true"` (decorative — data conveyed via tooltip)
- Tooltip: `role="tooltip"` with date, minutes, and habit info
- Screen reader: summary text above heatmap ("You focused 42 hours this week")

**Animation:**
- Cell hover: `transition-colors duration-150` + ring
- Tooltip: Framer Motion `fadeIn` (200ms)
- Stagger: cells appear with `staggerContainer` on mount

**Design Tokens Applied:**
- Emerald-500 at varying opacities
- Amber-400 for habit dots
- `--border` for month labels

**Reuse Guidelines:**
- ✅ Use on dashboard for activity overview
- ✅ Use in stats page for historical data
- ❌ Do NOT use for real-time data (use line chart instead)
- ❌ Do NOT use more than one per page

---

### 8.4 Charts

**Purpose:** Data visualization for focus statistics, session history, and trends.

**Variants:**

| Variant | Visual | Use Case |
|---|---|---|
| Bar chart | Vertical bars, emerald gradient fill | Daily/weekly focus minutes |
| Hourly distribution | Horizontal bars, emerald fill | Focus time by hour of day |
| Trend indicators | Arrow up/down + percentage | Stat card trend indicators |

**States:**

| State | Visual | Timing |
|---|---|---|
| Default | Chart rendered with data | — |
| Hover | Bar highlights, tooltip appears | 150ms |
| Loading | Skeleton shimmer placeholder | 1.5s |
| Empty | "No data yet" message with illustration | — |
| Error | Error boundary fallback | — |

**Responsive Behavior:**
- Charts scale to container width
- Tooltip repositions to stay within viewport
- Bar width adjusts based on data density
- Mobile: fewer bars shown (7-day view vs 30-day)

**Accessibility:**
- Charts: `role="img"` with `aria-label` describing the data
- Data tables provided as alternative (`sr-only`)
- Trend indicators: `aria-label` with full text ("Up 12% from last week")

**Animation:**
- Bar chart: bars grow from bottom with `fadeInUp` (stagger 30ms)
- Trend numbers: `AnimatedNumber` component (0.8s ease)
- Hover: bar brightness increase (150ms)

**Design Tokens Applied:**
- Chart colors: `--chart-1` through `--chart-5`
- Emerald-500 gradient for primary data
- `--muted-foreground` for axis labels

**Reuse Guidelines:**
- ✅ Use for statistical data visualization
- ✅ Use `AnimatedNumber` for chart values
- ❌ Do NOT use for categorical data (use badge/list instead)
- ❌ Do NOT animate chart data changes during focus sessions

---

### 8.5 Inputs

**Purpose:** Form input controls for text entry, selection, and value adjustment.

**Variants:**

| Variant | Component | Visual | Use Case |
|---|---|---|---|
| Text input | `Input` | `h-9`, `rounded-md`, border, `px-3` | Name, email, search, short text |
| Textarea | `Textarea` | Multi-line, `min-h-[80px]` | Reflection text, notes |
| Select | `Select` + `SelectTrigger` | Dropdown with chevron, `h-9` | Duration preset, category, priority |
| Slider | `Slider` | Track + thumb, `h-1.5` track | Duration selector, mood/energy rating |
| Toggle/Switch | `Switch` | `h-[1.15rem] w-8`, thumb slides | Boolean settings, on/off toggles |
| Search | `Input` type="search" | With search icon, clear button | Command palette, filtering |

**Input States:**

| State | Visual | Timing |
|---|---|---|
| Default | `border-input`, `bg-transparent` (dark: `bg-input/30`) | — |
| Focus | `border-ring`, `ring-ring/50 ring-[3px]` | 200ms ease |
| Error | `border-destructive`, `ring-destructive/20` | 200ms ease |
| Typing | No border color change (keep focus state) | — |
| Disabled | `opacity-50`, `cursor-not-allowed`, `pointer-events-none` | — |
| Placeholder | `text-muted-foreground` | — |

**Select States:**

| State | Visual | Timing |
|---|---|---|
| Default | `border-input`, `bg-transparent` | — |
| Open | `border-ring`, dropdown slides in from top | 200ms, `zoom-in-95` + `fade-in-0` |
| Selected item | Check icon, `bg-accent` | — |
| Disabled | `opacity-50`, `cursor-not-allowed` | — |

**Slider States:**

| State | Visual | Timing |
|---|---|---|
| Default | `bg-muted` track, `bg-primary` range, `size-4` thumb | — |
| Hover | `ring-4 ring-ring/50` on thumb | — |
| Dragging | Thumb scales slightly, `focus-visible:ring-4` | Spring |
| Disabled | `opacity-50` | — |

**Switch States:**

| State | Visual | Timing |
|---|---|---|
| Off | `bg-input` (dark: `bg-input/80`), thumb left | — |
| On | `bg-primary`, thumb right | 200ms spring (stiffness: 500, damping: 30) |
| Focus | `border-ring`, `ring-ring/50 ring-[3px]` | Instant |
| Disabled | `opacity-50`, `cursor-not-allowed` | — |

**Responsive Behavior:**
- Input height: `h-9` default, `h-8` for `sm` size select
- Text size: `text-base` on mobile (prevents iOS zoom), `md:text-sm` on desktop
- Full-width inputs in forms on mobile
- Select dropdown: `max-w-md` on mobile, wider on desktop

**Accessibility:**
- All inputs: `aria-invalid` for validation errors
- `aria-label` for icon-only inputs (search)
- `aria-describedby` for error messages
- Select: keyboard navigation (Arrow keys, Enter, Escape)
- Slider: `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Switch: `aria-checked` state
- Focus ring: `focus-visible` only (not on mouse click)

**Animation:**
- Input focus: `transition-[color,box-shadow] 200ms ease`
- Select open: `animate-in` (fade + zoom + slide) 200ms
- Switch thumb: `transition-transform` with spring physics
- Slider thumb: spring on drag

**Design Tokens Applied:**
- `--input` (white/12% in dark mode)
- `--ring` (emerald-500)
- `--destructive` for error states
- `--primary` for switch active state
- `--muted`, `--muted-foreground` for slider track

**Reuse Guidelines:**
- ✅ Use `Input` for all single-line text entry
- ✅ Use `Select` for dropdown choices (5+ options)
- ✅ Use `Slider` for continuous value ranges
- ✅ Use `Switch` for boolean toggles
- ❌ Do NOT use `Input` for long text (use `Textarea`)
- ❌ Do NOT use custom dropdown implementations (use `Select`)

---

### 8.6 Dialogs

**Purpose:** Modal overlays for focused interactions that require user attention or confirmation.

**Variants:**

| Variant | Component | Visual | Use Case |
|---|---|---|---|
| Modal | `Dialog` + `DialogContent` | Centered, `max-w-lg`, rounded, backdrop blur | Settings, forms, detail views |
| Alert Dialog | `AlertDialog` | Centered, destructive action confirmation | "Delete account?", "Clear all data?" |
| Sheet/Drawer | `Sheet` + `SheetContent` | Slides from edge (right/bottom) | Mobile navigation, filters |
| Custom Dialog | `Dialog` with custom content | Any modal content | Celebration screen, onboarding |

**States:**

| State | Visual | Timing |
|---|---|---|
| Closed | Hidden | — |
| Opening | Fade in + zoom in from 95% | 200ms, `fade-in-0` + `zoom-in-95` |
| Open | Centered, backdrop `bg-black/50` | — |
| Closing | Fade out + zoom out to 95% | 200ms, `fade-out-0` + `zoom-out-95` |
| Backdrop click | Closes dialog | — |

**Dialog Sub-components:**

| Sub-component | Purpose | Visual |
|---|---|---|
| `DialogOverlay` | Backdrop | `bg-black/50`, fade in/out |
| `DialogContent` | Main container | `max-w-lg`, `rounded-lg`, `border`, `p-6` |
| `DialogHeader` | Title area | `flex-col gap-2`, centered on mobile, left on desktop |
| `DialogTitle` | Modal title | `text-lg font-semibold` |
| `DialogDescription` | Subtitle | `text-muted-foreground text-sm` |
| `DialogFooter` | Action area | `flex-row justify-end` on desktop, `flex-col-reverse` on mobile |
| `DialogClose` | Close button | `absolute top-4 right-4`, X icon, `sr-only` "Close" |

**Responsive Behavior:**
- `max-w-[calc(100%-2rem)]` on mobile, `sm:max-w-lg` on desktop
- Footer: `flex-col-reverse` on mobile (primary action at bottom), `flex-row` on desktop
- Header: `text-center` on mobile, `sm:text-left` on desktop
- Sheet: slides from bottom on mobile, from right on desktop

**Accessibility:**
- `role="dialog"` on content
- `aria-modal="true"` traps focus
- `aria-labelledby` points to `DialogTitle`
- `aria-describedby` points to `DialogDescription`
- Escape key closes dialog
- Focus trap: Tab cycles within dialog
- Focus restoration: returns to trigger element on close
- `sr-only` "Close" text on X button

**Animation:**
- Open: `animate-in` (fade + zoom) 200ms
- Close: `animate-out` (fade + zoom) 200ms
- Backdrop: `fade-in-0` / `fade-out-0` 200ms
- Sheet: `slide-in-from-right` / `slide-in-from-bottom` 300ms

**Design Tokens Applied:**
- `--background` for dialog surface
- `--border` for dialog border
- `--popover`, `--popover-foreground` for content
- `--destructive` for alert dialog actions

**Reuse Guidelines:**
- ✅ Use `Dialog` for focused interactions requiring user input
- ✅ Use `AlertDialog` for destructive action confirmations
- ✅ Use `Sheet` for mobile-friendly slide-out panels
- ❌ Do NOT use Dialog for simple notifications (use Toast)
- ❌ Do NOT stack multiple dialogs (use wizard pattern instead)
- ❌ Do NOT use Dialog for content that should be inline

---

### 8.7 Progress

**Purpose:** Visual indicator of completion status for tasks, onboarding, and loading states.

**Variants:**

| Variant | Component | Visual | Use Case |
|---|---|---|---|
| Progress bar | `Progress` | `h-2`, rounded, primary fill | Onboarding steps, loading |
| Step indicator | Custom | Numbered circles with connector | Onboarding step count |
| Circular progress | Custom | SVG circle with stroke-dashoffset | Timer display, goal completion |

**Progress Bar States:**

| State | Visual | Timing |
|---|---|---|
| Idle | 0% width, `bg-primary/20` track | — |
| Filling | Emerald gradient fill, smooth width transition | 400ms ease-out |
| Complete | 100% width, subtle pulse | — |

**Implementation:**
- Track: `bg-primary/20 h-2 w-full rounded-full overflow-hidden`
- Indicator: `bg-primary h-full w-full flex-1 transition-all`
- Transform: `translateX(-${100 - (value || 0)}%)`

**Responsive Behavior:**
- Full-width by default
- Height remains `h-2` at all breakpoints
- Step indicator: horizontal on desktop, vertical on mobile (if needed)

**Accessibility:**
- `role="progressbar"` via Radix
- `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`
- Screen reader: announces progress percentage

**Animation:**
- Fill: `transition-all 400ms ease-out`
- Step indicator: `SPRING_ONBOARDING` (stiffness: 260, damping: 25)
- Complete: subtle pulse glow

**Design Tokens Applied:**
- `--primary` for fill color
- `--primary/20` for track background

**Reuse Guidelines:**
- ✅ Use for deterministic progress (known start/end)
- ✅ Use `Progress` component for all linear progress bars
- ❌ Do NOT use for indeterminate loading (use spinner/skeleton)
- ❌ Do NOT animate progress bar during focus sessions

---

### 8.8 Toasts (Sonner-based)

**Purpose:** Brief, non-blocking notifications for action feedback, confirmations, and error messages.

**Variants:**

| Type | Duration | Visual | Use Case |
|---|---|---|---|
| Success | 3s | Emerald icon, slide-in from top-right | "Setting saved", "Profile updated" |
| Error | 5s | Destructive icon, slide-in from top-right | "Failed to save", "Network error" |
| Info | 3s | Zinc icon, slide-in from top-right | "Tip: Use ⌘K for quick navigation" |
| Loading | Indefinite | Spinner icon, slide-in | "Saving..." → replaced by success/error |
| Warning | 5s | Amber icon, slide-in | "Session about to expire" |

**States:**

| State | Visual | Timing |
|---|---|---|
| Entering | Slide in from right, fade in | 300ms |
| Visible | Full opacity, positioned top-right | Duration varies |
| Exiting | Slide out to right, fade out | 300ms |
| Hover | Pauses auto-dismiss timer | — |

**Implementation:**
- Uses Sonner library with `Toaster` component
- Theme-aware: `useTheme()` for light/dark mode
- CSS variables: `--normal-bg`, `--normal-text`, `--normal-border`

**Responsive Behavior:**
- `max-w-md` on mobile, wider on desktop
- Positioned top-right on desktop, top-center on mobile
- Stacks vertically with overlap

**Accessibility:**
- `role="status"` by default
- `aria-live="polite"` for screen readers
- Loading toasts: `aria-live="assertive"` when replaced
- Action buttons in toast: proper `aria-label`

**Animation:**
- Enter: slide-in from right + fade-in (300ms)
- Exit: slide-out to right + fade-out (300ms)
- Sonner handles animation internally

**Design Tokens Applied:**
- `--popover` for background
- `--popover-foreground` for text
- `--border` for border
- `--destructive` for error toasts

**Reuse Guidelines:**
- ✅ Use for action feedback (save, delete, update)
- ✅ Use loading toast for async operations
- ✅ Use error toast for API failures
- ❌ Do NOT use for critical errors (use Dialog)
- ❌ Do NOT use for marketing messages (use notification panel)
- ❌ Do NOT show more than 3 toasts simultaneously

---

### 8.9 Badges

**Purpose:** Small labels for status, achievements, categories, and priority indicators.

**Variants:**

| Variant | Class | Visual | Use Case |
|---|---|---|---|
| Default | `bg-primary text-primary-foreground` | Solid primary bg | Status indicators |
| Secondary | `bg-secondary text-secondary-foreground` | Muted bg | Category labels |
| Destructive | `bg-destructive text-white` | Red bg | Error states, urgent |
| Outline | `text-foreground` | Bordered, no fill | Tags, filters |
| Status badge | Custom | Colored dot + text | "Active", "Paused", "Completed" |
| Achievement badge | Custom | Icon + text, emerald/amber | "🏆 7-Day Streak", "⚡ Focus Master" |
| Coach badge | Custom | AI sparkle icon | "AI Coach" label |
| Priority badge | Custom | Color-coded (high=red, med=amber, low=zinc) | Mission priority |

**States:**

| State | Visual | Timing |
|---|---|---|
| Default | Base variant styling | — |
| Hover | `bg-primary/90` (link badges) | 150ms |
| Focus | `focus-visible:ring-[3px]` | Instant |
| Selected | Scale up, spring animation | 200ms spring |

**Implementation:**
- `badgeVariants` from CVA
- `rounded-md border px-2 py-0.5 text-xs font-medium`
- `inline-flex items-center justify-center gap-1`
- `shrink-0 whitespace-nowrap w-fit`

**Responsive Behavior:**
- Fixed size at all breakpoints
- Text truncation with `overflow-hidden` for long labels
- `w-fit` prevents stretching

**Accessibility:**
- `data-slot="badge"` for E2E testing
- `aria-invalid` support for form validation
- `focus-visible` ring for interactive badges
- Screen reader: badge text announced with context

**Animation:**
- Appearance: `scaleIn` spring (stiffness: 400, damping: 15) for achievement badges
- Selection: `SPRING_SNAPPY` for rank badges
- Hover: `transition-[color,box-shadow] 150ms`

**Design Tokens Applied:**
- `--primary`, `--secondary`, `--destructive` for bg
- `--border` for outline variant
- `--foreground` for text

**Reuse Guidelines:**
- ✅ Use for status indicators, tags, and labels
- ✅ Use achievement badges for gamification
- ❌ Do NOT use badges for primary actions (use Button)
- ❌ Do NOT use more than 3 badges per item

---

### 8.10 Timeline

**Purpose:** Chronological display of activity events and session history.

**Variants:**

| Variant | Visual | Use Case |
|---|---|---|
| Activity timeline event | Icon + timestamp + description + connector | Dashboard recent activity |
| Session timeline | Session card with duration, mission, stats | Session history page |

**States:**

| State | Visual | Timing |
|---|---|---|
| Default | Timeline item with connector | — |
| Hover | Slight background highlight | 150ms |
| Loading | Skeleton placeholders | 1.5s |
| Empty | "No activity yet" message | — |

**Responsive Behavior:**
- Vertical timeline on all breakpoints
- Compact layout on mobile (smaller icons, less spacing)
- Full layout on desktop (larger icons, more detail)

**Accessibility:**
- `role="list"` on timeline container
- `role="listitem"` on each event
- `aria-label` with timestamp and description
- Screen reader: chronological order maintained

**Animation:**
- Stagger reveal: `staggerContainer` + `staggerItem` (60ms offset)
- Connector: `animated-dash` CSS animation (2s linear infinite)
- Hover: `transition-colors 150ms`

**Design Tokens Applied:**
- `--border` for connector lines
- `--muted-foreground` for timestamps
- `--primary` for active/current indicator

**Reuse Guidelines:**
- ✅ Use for chronological activity display
- ✅ Use for session history
- ❌ Do NOT use for non-chronological data (use list/grid)
- ❌ Do NOT use for real-time data (use live feed)

---

### 8.11 Focus Timer

**Purpose:** The core focus experience — countdown timer with controls, presets, and session management.

**Variants:**

| Variant | Visual | Use Case |
|---|---|---|
| Timer display | Large circular progress + time | Main timer view |
| Timer controls | Play/Pause, Stop, Skip buttons | Timer interaction |
| Timer presets | Duration selector (15/25/45/60/90 min) | Quick session start |

**Timer Display States:**

| State | Visual | Timing |
|---|---|---|
| Idle | Full circle, "Start" text | — |
| Running | Circle depletes, time counting down | 1s per tick |
| Paused | Circle frozen, pulsing ring | 3s breathe |
| Complete | Full circle, celebration trigger | — |

**Timer Control States:**

| State | Visual | Timing |
|---|---|---|
| Play → Pause | Icon morphs (play to pause) | 200ms |
| Pause → Play | Icon morphs (pause to play) | 200ms |
| Stop | Reset to idle state | 300ms |
| Hover | Scale 1.05, glow | 200ms |

**Responsive Behavior:**
- Timer display: `180px` on mobile, `240px` on desktop
- Controls: centered row on mobile
- Presets: horizontal scroll on mobile, grid on desktop

**Accessibility:**
- `role="timer"` on display
- `aria-live="polite"` for time updates
- `aria-label` on all controls ("Play", "Pause", "Stop")
- Screen reader: announces time every minute

**Animation:**
- Circular progress: SVG stroke-dashoffset transition (1s linear)
- Pulsing ring: `breathe` CSS animation (3s ease-in-out)
- Background: `focus-breathe-bg` (4s ease-in-out)
- Celebration: confetti + glow (2s duration)

**Design Tokens Applied:**
- `--primary` (emerald-500) for progress ring
- `--destructive` for time warning (last 5 minutes)
- Timer text: `text-zinc-50` with `tabular-nums`

**Reuse Guidelines:**
- ✅ Use for all focus session timing
- ✅ Use presets for quick session start
- ❌ Do NOT use for non-focus timers (use Stopwatch pattern)
- ❌ Do NOT modify timer during active session (use Stop first)

---

### 8.12 Animated Number

**Purpose:** Counter animation that smoothly transitions between numeric values. Used for stat displays, dashboard metrics, and any changing number.

**Implementation:** `src/components/premium/animated-number.tsx`

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | required | Target number to display |
| `duration` | `number` | 0.8 | Animation duration in seconds |
| `decimals` | `number` | 0 | Decimal places to show |
| `prefix` | `string` | "" | Text before number (e.g., "$") |
| `suffix` | `string` | "" | Text after number (e.g., "min") |
| `className` | `string` | — | Additional CSS classes |

**States:**

| State | Visual | Timing |
|---|---|---|
| Initial | Displays target value immediately | — |
| Animating | Smooth count from previous to new value | 0.8s default |
| Complete | Displays final value | — |

**Responsive Behavior:**
- Inherits font size from parent
- `inline-flex items-baseline` for proper alignment with prefix/suffix
- `tabular-nums` recommended for consistent number width

**Accessibility:**
- `aria-hidden="true"` on animated display (prevents screen reader from reading changing numbers)
- Separate `sr-only` span with final value for screen readers
- Screen reader: announces final value, not intermediate values

**Animation:**
- `useMotionValue` + `animate` from Framer Motion
- Easing: `[0.25, 0.1, 0.25, 1]` (EASE_STANDARD)
- Duration: 0.8s default, configurable
- Smooth interpolation between any two numeric values

**Design Tokens Applied:**
- No specific tokens — inherits parent text color
- `tabular-nums` font feature for consistent width

**Reuse Guidelines:**
- ✅ Use for all stat numbers that change
- ✅ Use for dashboard metrics, streak counts, session totals
- ✅ Use `prefix`/`suffix` for units ("h", "min", "$", "%")
- ❌ Do NOT use for static numbers (use plain text)
- ❌ Do NOT use for very large number ranges (>1000x) — animation may be jarring

---

### 8.13 Stagger Container

**Purpose:** Animation wrapper that reveals children with a staggered delay, creating a cascading entrance effect.

**Implementation:** `src/components/premium/stagger.tsx`

**Components:**

| Component | Purpose | Visual |
|---|---|---|
| `StaggerContainer` | Parent wrapper | No visual, animation orchestrator |
| `StaggerItem` | Child wrapper | Fade in + slide up |

**Animation Config:**

| Property | Container | Item |
|---|---|---|
| Initial | `opacity: 0` | `opacity: 0, y: 12` |
| Animate | `opacity: 1` | `opacity: 1, y: 0` |
| Stagger | `staggerChildren: 0.06` | — |
| Delay | `delayChildren: 0.1` | — |
| Easing | — | `spring: stiffness: 300, damping: 30` |

**States:**

| State | Visual | Timing |
|---|---|---|
| Hidden | All children invisible | — |
| Animating | Children appear one by one | 60ms stagger + 300ms spring each |
| Complete | All children visible | — |

**Responsive Behavior:**
- Same animation on all breakpoints
- Stagger delay remains constant (60ms)
- Reduced motion: instant appearance (no animation)

**Accessibility:**
- `aria-hidden` not applied — content is always accessible
- Screen reader: content available immediately, not delayed
- Reduced motion: `prefers-reduced-motion` check in Framer Motion

**Animation:**
- Container: `staggerChildren: 0.06, delayChildren: 0.1`
- Items: Spring physics (stiffness: 300, damping: 30)
- Alternative: `staggerContainer` + `staggerItem` from `@/lib/animations` (different spring config)

**Design Tokens Applied:**
- No specific tokens — wraps any content

**Reuse Guidelines:**
- ✅ Use for dashboard card grids
- ✅ Use for list items, notification items
- ✅ Use for onboarding option grids
- ❌ Do NOT nest StaggerContainers (causes double-stagger)
- ❌ Do NOT use for single items (use `fadeInUp` instead)
- ❌ Do NOT use for items that appear frequently (e.g., chat messages)

---

### 8.14 Cursor Glow

**Purpose:** Premium mouse-follow glow effect that creates a subtle emerald halo around the cursor on desktop. Enhances the feeling of quality and craftsmanship.

**Implementation:** `src/components/premium/cursor-glow.tsx`

**Elements:**

| Element | Size | Visual | Purpose |
|---|---|---|---|
| Glow | 32×32px | Emerald radial gradient, blur(4px), 8% opacity | Ambient glow halo |
| Cursor | 16×16px | White/emerald border, blur(1px), semi-transparent | Custom cursor dot |

**States:**

| State | Visual | Timing |
|---|---|---|
| Hidden | Off-screen (`x: -100, y: -100`) | — |
| Visible | Following cursor with spring lag | Spring: damping: 28, stiffness: 400 |
| Over clickable | Cursor: 1.4× size, emerald tint; Glow: 1.5× size, 15% opacity | Spring: damping: 25, stiffness: 300 |
| Clicking | Cursor: scale 0.85, then back to 1 | 100ms delay |
| Pointer device | Cursor hidden, custom cursor shown | — |
| Touch device | Not rendered (returns null) | — |
| Reduced motion | Not rendered (returns null) | — |

**Responsive Behavior:**
- Only renders on `(pointer: fine)` devices (desktop)
- Hidden on `(pointer: coarse)` devices (touch/mobile)
- Hidden when `prefers-reduced-motion: reduce` is active
- Listens for `pointer` and `prefers-reduced-motion` media query changes

**Accessibility:**
- `aria-hidden="true"` on all cursor elements
- Default cursor hidden via CSS: `* { cursor: none !important; }` on desktop
- Restored on touch devices: `@media (pointer: coarse) { * { cursor: auto !important; } }`
- Restored for reduced motion: `@media (prefers-reduced-motion: reduce) { * { cursor: auto !important; } }`

**Animation:**
- Cursor position: spring (damping: 28, stiffness: 400, mass: 0.5)
- Glow position: spring (damping: 20, stiffness: 250, mass: 0.8) — intentionally lagged
- Click scale: spring (damping: 20, stiffness: 500)
- Hover scale: spring (damping: 25, stiffness: 300)
- Uses `requestAnimationFrame` for glow position update

**Design Tokens Applied:**
- Emerald-500: `rgba(16, 185, 129, 0.6)` for glow center
- White/60%: `border-white/60` for cursor border
- `radial-gradient(circle, rgba(16,185,129,0.25), rgba(16,185,129,0.08))` for clickable state

**Reuse Guidelines:**
- ✅ Render once at app root level
- ✅ Automatically detects clickable elements
- ❌ Do NOT render more than one instance
- ❌ Do NOT use on pages with heavy DOM manipulation (performance)
- ❌ Do NOT force-enable on touch devices

---

### 8.15 Brand Logo

**Purpose:** MindGuard brand identity elements — logo, wordmark, and splash screen identity.

**Implementation:** `src/components/branding/mindguard-logo.tsx`

**Variants:**

| Variant | Component | Size | Visual | Use Case |
|---|---|---|---|---|
| Standard | `MindGuardLogo` | xs/sm/md/lg/xl | Logo + "MindGuard" text | Sidebar, header |
| Splash | `MindGuardSplashLogo` | Fixed (56px) | Logo + "MindGuard AI" + tagline | Loading screen |
| Hero | `MindGuardHeroLogo` | Fixed (80/96px) | Logo with pulse-glow | Landing page |

**Standard Logo Sizes:**

| Size | Container | Image | Text |
|---|---|---|---|
| `xs` | h-5 w-5 | 20px | 11px |
| `sm` | h-7 w-7 | 28px | 12px |
| `md` | h-9 w-9 | 36px | 13px |
| `lg` | h-12 w-12 | 48px | 14px |
| `xl` | h-16 w-16 | 64px | 16px |

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Logo size |
| `showText` | `boolean` | `true` | Show wordmark text |
| `collapsed` | `boolean` | `false` | Sidebar collapsed mode (centered, no text) |

**States:**

| State | Visual | Timing |
|---|---|---|
| Default | Static logo + text | — |
| Hover (Hero) | `pulse-glow` animation | 3s infinite |
| Loading | Skeleton placeholder | 1.5s |

**Responsive Behavior:**
- Hero logo: `h-20 w-20` on mobile, `sm:h-24 sm:w-24` on desktop
- Standard logo: size adapts via prop
- Collapsed: centers logo, hides text

**Accessibility:**
- `alt="MindGuard Logo"` on all images
- `priority` prop for LCP optimization
- Screen reader: "MindGuard Logo" then "MindGuard" text

**Animation:**
- Hero: `pulse-glow` CSS animation (3s ease-in-out infinite)
- `shadow-emerald-500/20` on splash logo

**Design Tokens Applied:**
- `text-zinc-100` for wordmark
- `text-zinc-500` for tagline
- `rounded-lg`/`rounded-xl`/`rounded-2xl` for container

**Reuse Guidelines:**
- ✅ Use `MindGuardLogo` for sidebar and header
- ✅ Use `MindGuardSplashLogo` for loading screens
- ✅ Use `MindGuardHeroLogo` for landing/marketing pages
- ❌ Do NOT use custom logo implementations
- ❌ Do NOT modify logo colors or proportions

---

### 8.16 Sidebar

**Purpose:** Primary navigation component for the desktop app. Contains navigation buttons, section labels, and user controls.

**Implementation:** `src/components/ui/sidebar.tsx` (Radix-based)

**Sub-components:**

| Sub-component | Purpose | Visual |
|---|---|---|
| `SidebarProvider` | Context provider | — |
| `Sidebar` | Main container | `glass-sidebar`, 16rem width |
| `SidebarContent` | Scrollable content area | `overflow-y-auto` |
| `SidebarHeader` | Logo + collapse toggle | MindGuard logo + PanelLeft icon |
| `SidebarFooter` | User avatar + settings | Avatar + name + settings link |
| `SidebarGroup` | Navigation group | With label + items |
| `SidebarMenu` | Menu container | `flex flex-col gap-1` |
| `SidebarMenuItem` | Individual menu item | Contains NavButton |
| `SidebarMenuButton` | Navigation button | `ghost` variant, active state |
| `SidebarTrigger` | Collapse toggle | `PanelLeftIcon` button |
| `SidebarSeparator` | Visual divider | `Separator` component |
| NavButton | Custom navigation button | Icon + label, active emerald indicator |
| SectionLabel | Group label | `text-[10px] uppercase tracking-widest text-zinc-600` |

**States:**

| State | Visual | Timing |
|---|---|---|
| Expanded | `w-64` (16rem), full labels | 300ms spring |
| Collapsed | `w-12` (3rem), icon-only | 300ms spring |
| Mobile | Sheet overlay, slides from left | 300ms |
| Active item | Emerald left border, emerald bg tint | 200ms |

**Responsive Behavior:**
- Desktop: persistent sidebar with expand/collapse
- Mobile: hidden by default, opens as Sheet overlay
- `SIDEBAR_WIDTH = "16rem"` expanded
- `SIDEBAR_WIDTH_ICON = "3rem"` collapsed
- `SIDEBAR_WIDTH_MOBILE = "18rem"` mobile sheet

**Accessibility:**
- `SIDEBAR_KEYBOARD_SHORTCUT = "b"` (Cmd+B to toggle)
- `role="navigation"` on sidebar
- `aria-label` on navigation groups
- `aria-current="page"` on active item
- Focus trap in mobile sheet
- `useSidebar()` hook for state management

**Animation:**
- Expand/collapse: CSS transition on width (300ms)
- Mobile sheet: `slide-in-from-left` 300ms
- Active indicator: `transition-colors 200ms`
- Tooltip on collapsed items: `fadeIn` 150ms

**Design Tokens Applied:**
- `--sidebar` (oklch(0.13 0.005 150) in dark mode)
- `--sidebar-foreground`, `--sidebar-border`
- `--sidebar-primary`, `--sidebar-accent`
- `glass-sidebar` class: `rgba(9, 9, 11, 0.8)` + `blur(20px)`

**Reuse Guidelines:**
- ✅ Use as primary navigation container
- ✅ Use `useSidebar()` for state access
- ❌ Do NOT create custom sidebar implementations
- ❌ Do NOT put content other than navigation in sidebar

---

### 8.17 Header

**Purpose:** Top application bar with search, notifications, and profile controls. Fixed at top of main content area.

**Elements:**

| Element | Visual | Purpose |
|---|---|---|
| Breadcrumb/page title | `text-sm font-medium text-zinc-200` | Current page context |
| Search trigger | `Cmd+K` badge | Opens command palette |
| Notification bell | Bell icon + unread count | Opens notification panel |
| Profile dropdown | Avatar + name | User menu, settings, sign out |

**States:**

| State | Visual | Timing |
|---|---|---|
| Default | `glass-header` backdrop blur | — |
| Scrolled | Border becomes more visible | 200ms |

**Responsive Behavior:**
- Breadcrumb: truncated on mobile
- Search trigger: icon-only on mobile, text+icon on desktop
- Profile: avatar-only on mobile, avatar+name on desktop

**Accessibility:**
- `role="banner"` on header
- `aria-label` on all interactive elements
- Keyboard navigation: Tab between header items

**Animation:**
- Notification bell: bounce on new notification (300ms spring)
- Profile dropdown: `fadeIn` + `scaleIn` (200ms)

**Design Tokens Applied:**
- `glass-header`: `rgba(9, 9, 11, 0.6)` + `blur(16px)`
- `--border` for bottom border

**Reuse Guidelines:**
- ✅ Use as app-level header
- ✅ Integrate with notification panel and command palette
- ❌ Do NOT duplicate header per page

---

### 8.18 Command Palette

**Purpose:** Keyboard-first search and navigation overlay. Central hub for quick access to all views, actions, and settings.

**Implementation:** `src/components/command-palette/command-palette.tsx`

**Command Types:**

| Type | Visual | Examples |
|---|---|---|
| Navigation | Icon + label + shortcut | Dashboard (G D), Timer (G T), Settings (G ,) |
| Action | Icon + label + "Action" badge | Start Focus Timer, Go to Missions |

**Navigation Commands:**

| Command | Shortcut | Keywords |
|---|---|---|
| Dashboard | G D | home, overview, stats |
| Life Dashboard | G L | life, desktop, screen, activity |
| Mission | G M | task, goal, current, focus |
| Focus Timer | G T | pomodoro, countdown, start, session |
| Daily Reflection | G R | journal, review, diary, log |
| Daily Review | G V | review, summary, today, report |
| Session History | G H | sessions, history, log, past |
| Statistics | G S | analytics, charts, data |
| Daily Replay | G P | replay, day, history, timeline |
| Weekly Wrapped | G W | wrapped, weekly, summary, report |
| Settings | G , | profile, preferences, account, theme |

**States:**

| State | Visual | Timing |
|---|---|---|
| Closed | Hidden | — |
| Opening | Scale from 96% + fade in + slide from top | 200ms |
| Open | Centered overlay, backdrop blur | — |
| Searching | Filtered results, real-time | Instant |
| No results | "No results found" message | — |
| Selected item | `bg-white/[0.06]` highlight, emerald icon | 100ms |
| Closing | Scale to 96% + fade out + slide up | 200ms |

**Responsive Behavior:**
- `max-w-md` on all breakpoints
- `top-[10%]` on mobile, `top-[15%]` on desktop
- `w-[calc(100%-2rem)]` ensures margin on mobile
- Keyboard shortcuts hidden on mobile (`hidden sm:inline`)

**Accessibility:**
- `role="dialog"` + `aria-modal="true"` + `aria-label="Command palette"`
- Focus trap: Tab cycles within palette
- `aria-label` on each command button
- Auto-focus on search input when opened
- Escape closes palette
- Arrow keys navigate results
- Enter selects result

**Animation:**
- Open: `opacity: 0 → 1, scale: 0.96 → 1, y: -8 → 0` (200ms, EASE_STANDARD)
- Close: reverse of open (200ms)
- Backdrop: `opacity: 0 → 1` (150ms)
- Item highlight: `transition-colors duration-100`

**Design Tokens Applied:**
- `bg-zinc-900/95` surface
- `border-white/[0.08]` border
- `shadow-2xl shadow-black/40`
- `backdrop-blur-xl`

**Reuse Guidelines:**
- ✅ Render once at app root
- ✅ Use `Cmd+K` / `Ctrl+K` to open
- ✅ Integrate with `shortcutManager` for conflict resolution
- ❌ Do NOT render more than one instance
- ❌ Do NOT use for page-level navigation (use sidebar)

---

### 8.19 Notification Panel

**Purpose:** Dropdown panel for viewing and managing notifications. Shows smart alerts, achievements, and reminders.

**Implementation:** `src/components/notifications/notification-panel.tsx`

**Notification Types:**

| Type | Icon | Color | Description |
|---|---|---|---|
| `idle_alert` | Coffee | Amber | User has been idle |
| `break_reminder` | Clock | Sky | Time for a break |
| `mission_reminder` | Target | Emerald | Mission due/starting |
| `reflection_reminder` | BookOpen | Purple | Daily reflection reminder |
| `focus_celebration` | Zap | Emerald | Focus session completed |
| `streak_milestone` | Flame | Orange | Streak record reached |
| `achievement_unlocked` | Zap | Amber | New achievement earned |

**States:**

| State | Visual | Timing |
|---|---|---|
| Closed | Hidden | — |
| Opening | Scale from 95% + slide from top | 200ms |
| Open | Dropdown panel, right-aligned | — |
| Loading | Spinner in center | — |
| Empty | BellOff icon + "No notifications yet" | — |
| Unread | Green dot indicator + `bg-white/[0.02]` | — |
| Read | No dot, dimmer text | — |
| Closing | Scale to 95% + slide up | 200ms |

**Responsive Behavior:**
- `w-72` on mobile, `sm:w-80` on desktop
- `max-h-72` scrollable list
- Positioned right-aligned below bell icon

**Accessibility:**
- Bell: `aria-label` with unread count
- `aria-expanded` on bell button
- `aria-haspopup="menu"` on bell
- Panel: `role="menu"` + `aria-label="Notifications panel"`
- Items: `role="menuitem"` + `aria-label` with title + unread status
- Unread count badge: `aria-label="N unread notifications"`
- `aria-live="polite"` on count badge

**Animation:**
- Bell badge: `scaleIn` spring (stiffness: 400, damping: 15)
- Panel open: `opacity + y + scale` (200ms)
- Items: `fadeIn` stagger (initial `opacity: 0, x: -4` → visible)
- Hover: `transition-colors` on items

**Design Tokens Applied:**
- `bg-zinc-900/95` surface
- `border-white/[0.08]` border
- `shadow-2xl backdrop-blur-xl`
- Type-specific colors: amber, sky, emerald, purple, orange

**Reuse Guidelines:**
- ✅ Use in app header for global notifications
- ✅ Use `NotificationItem` type for all notification data
- ❌ Do NOT use for in-page alerts (use Toast)
- ❌ Do NOT use for confirmation dialogs (use Dialog)
- ❌ Do NOT render more than one instance

---

### 8.20 Tabs

**Purpose:** Tab navigation for switching between related content views within the same page.

**Implementation:** `src/components/ui/tabs.tsx` (Radix-based)

**Sub-components:**

| Sub-component | Purpose | Visual |
|---|---|---|
| `Tabs` | Root container | `flex flex-col gap-2` |
| `TabsList` | Tab button container | `bg-muted`, `rounded-lg`, `h-9`, `p-[3px]` |
| `TabsTrigger` | Individual tab button | `rounded-md`, `h-[calc(100%-1px)]` |
| `TabsContent` | Tab panel content | `flex-1 outline-none` |

**States:**

| State | Visual | Timing |
|---|---|---|
| Inactive | `text-muted-foreground`, transparent bg | — |
| Active | `bg-background` (dark: `bg-input/30`), `text-foreground`, `shadow-sm` | 200ms ease |
| Hover | Text brightens | 150ms ease |
| Focus | `focus-visible:ring-[3px]` | Instant |
| Disabled | `opacity-50`, `pointer-events-none` | — |

**Responsive Behavior:**
- `w-fit` on tab list — doesn't stretch
- `flex-1` on triggers — equal width
- Content: `flex-1` fills available space
- Horizontal scroll on mobile if many tabs

**Accessibility:**
- `role="tablist"` on TabsList
- `role="tab"` on TabsTrigger
- `role="tabpanel"` on TabsContent
- `aria-selected` on active tab
- `aria-controls` / `aria-labelledby` linking tabs to panels
- Arrow keys navigate between tabs
- Home/End keys move to first/last tab
- Tab key moves focus to panel content

**Animation:**
- Tab switch: `transition-[color,box-shadow] 200ms`
- Active indicator: underline appears with 200ms ease
- Content: instant swap (no animation)

**Design Tokens Applied:**
- `--muted` for tab list background
- `--muted-foreground` for inactive text
- `--background` for active tab bg
- `--foreground` for active text
- `--border` for active tab border

**Reuse Guidelines:**
- ✅ Use for switching between related views
- ✅ Use for AI Coach conversation tabs
- ✅ Use for settings sections
- ❌ Do NOT use for top-level navigation (use sidebar)
- ❌ Do NOT use for more than 5 tabs (use navigation instead)

---

### 8.21 Keyboard Shortcuts Modal

**Purpose:** Modal for viewing, customizing, and managing all keyboard shortcuts in MindGuard.

**Implementation:** `src/components/keyboard-shortcuts-modal.tsx`

**Categories:**

| Category | Shortcuts | Description |
|---|---|---|
| Navigation | G D, G M, G T, G R, etc. | View navigation shortcuts |
| Focus | Start/Stop timer | Focus session controls |
| System | Cmd+K, ? | Palette and shortcuts |

**States:**

| State | Visual | Timing |
|---|---|---|
| Closed | Hidden | — |
| Opening | Scale from 95% + fade + slide | 200ms |
| Open | Centered modal, backdrop | — |
| Editing shortcut | Emerald highlight ring, "Press new shortcut…" | — |
| Conflict detected | Amber warning + Override/Cancel buttons | — |
| Recording | `animate-pulse` on prompt text | — |
| Closing | Scale to 95% + fade | 200ms |

**Responsive Behavior:**
- `max-w-xl` on desktop
- `w-[calc(100%-2rem)]` on mobile
- `max-h-[50vh]` on mobile, `sm:max-h-[60vh]` on desktop
- Category tabs: horizontal scroll on mobile

**Accessibility:**
- `role="dialog"` + `aria-modal="true"` + `aria-label="Keyboard shortcuts"`
- Focus trap: Tab cycles within modal
- `aria-label` on each shortcut row
- `aria-label` on all action buttons
- Escape closes modal (or cancels editing)
- Backspace/Delete resets shortcut to default

**Animation:**
- Open: `opacity: 0 → 1, scale: 0.95 → 1, y: 10 → 0` (200ms, EASE_STANDARD)
- Close: reverse of open (200ms)
- Backdrop: `opacity: 0 → 1` (instant)
- Category tab: `transition-colors` on active state

**Design Tokens Applied:**
- `bg-zinc-900` surface
- `border-white/[0.06]` border
- `shadow-2xl`
- Emerald-500/10 for active category
- Amber-400 for conflict warnings

**Reuse Guidelines:**
- ✅ Render once at app root
- ✅ Open with `?` keyboard shortcut
- ✅ Integrate with `shortcutManager` for customization
- ❌ Do NOT render more than one instance
- ❌ Do NOT modify shortcut definitions outside `shortcutManager`

---

### 8.22 Error Boundary

**Purpose:** React error boundary that catches runtime errors and displays a user-friendly fallback UI instead of crashing the entire app.

**Implementation:** `src/components/app/error-boundary.tsx`

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | required | Protected content |
| `fallback` | `ReactNode` | — | Custom fallback UI |
| `context` | `string` | — | Error context for logging |

**States:**

| State | Visual | Timing |
|---|---|---|
| Normal | Children rendered normally | — |
| Error | Fallback UI with error message + retry button | — |

**Fallback UI:**
- Container: `glass-card` with `flex flex-col items-center justify-center gap-4 p-8`
- Icon: `AlertTriangle` in destructive circle
- Title: "Something went wrong" (heading-md)
- Message: Error message or "An unexpected error occurred"
- Retry button: Emerald button with `RefreshCw` icon + "Try again"

**Responsive Behavior:**
- Centered in parent container
- `max-w-md` for text content
- Works at any container size

**Accessibility:**
- `role="alert"` on fallback container
- `aria-live="assertive"` for screen reader announcement
- `aria-label="Retry loading this section"` on retry button
- `focus-emerald` on retry button

**Animation:**
- No animation on error state (instant appearance)
- Retry: re-renders children (may animate on mount)

**Design Tokens Applied:**
- `glass-card` for container
- `--destructive` for error icon
- `--foreground` for title
- `--muted-foreground` for message
- `bg-emerald-500/10` for retry button

**Reuse Guidelines:**
- ✅ Wrap major page sections
- ✅ Wrap components that fetch data
- ✅ Use `context` prop for error logging
- ✅ Provide custom `fallback` for specialized error UIs
- ❌ Do NOT wrap individual small components (overhead)
- ❌ Do NOT use for expected errors (use try/catch + toast)

---

### 8.23 Avatar

**Purpose:** User profile image with fallback initials display. Used in sidebar, header, and user references.

**Implementation:** `src/components/ui/avatar.tsx` (Radix-based)

**Sub-components:**

| Sub-component | Purpose | Visual |
|---|---|---|
| `Avatar` | Root container | `size-8`, `rounded-full`, `overflow-hidden` |
| `AvatarImage` | Profile image | `aspect-square size-full` |
| `AvatarFallback` | Initials fallback | `bg-muted`, `rounded-full`, centered text |

**States:**

| State | Visual | Timing |
|---|---|---|
| Loading | Image loading, fallback shown | — |
| Loaded | Image displayed | Instant |
| Error | Fallback initials shown | — |

**Responsive Behavior:**
- Default: `size-8` (32×32)
- Override with `className` for larger sizes
- `shrink-0` prevents squishing

**Accessibility:**
- `alt` text on `AvatarImage`
- Fallback: initials are readable
- `data-slot="avatar"` for E2E testing

**Animation:**
- No animation on state changes
- Image: instant appearance (no fade-in)

**Design Tokens Applied:**
- `--muted` for fallback background
- `--foreground` for fallback text

**Reuse Guidelines:**
- ✅ Use for all user profile images
- ✅ Use `AvatarFallback` with user initials
- ❌ Do NOT use for non-user images (use `Image` component)
- ❌ Do NOT use sizes smaller than 32×32 (accessibility)

---

## Section 9: Interaction Map

This section documents every interaction type across all MindGuard components. Each interaction is specified with its visual behavior, timing, implementation details, and component-specific variations.

### 9.1 Hover Behavior

Hover is the most common micro-interaction. It provides immediate visual feedback that an element is interactive.

**General Hover Rules:**
- All interactive elements MUST have a hover state
- Hover states MUST be subtle (never jarring)
- Hover timing: 150–300ms depending on element type
- Hover MUST NOT change layout (no reflow, no size changes that affect siblings)
- Hover MUST NOT require precision (large hit areas)

**Component-Specific Hover:**

| Component | Visual Change | Timing | CSS/Implementation |
|---|---|---|---|
| Button (Primary) | `bg-primary/90`, slight scale 1.02 | 200ms ease | `transition-all`, `hover:bg-primary/90` |
| Button (Ghost) | `bg-accent`, text brightens | 200ms ease | `hover:bg-accent hover:text-accent-foreground` |
| Button (Premium) | Box-shadow glow, scale 1.02 | 200ms ease | `btn-premium:hover`, `btn-glow::before` opacity 1 |
| Card (Glass) | Border brightens (white/10), lift -2px, shadow deepens | 300ms cubic-bezier(0.34, 1.56, 0.64, 1) | `lift-hover`, `glass-card:hover` |
| Card (Highlight) | Top highlight bar appears | 300ms ease | `card-highlight::after` opacity 1 |
| Card (Glow Edge) | Gradient border glow appears | 300ms ease | `glass-glow-edge::before` opacity 1 |
| Input | No visual change (only focus changes border) | — | — |
| Select Trigger | `bg-input/50` (dark mode) | 200ms ease | `dark:hover:bg-input/50` |
| Badge | `bg-primary/90` (link badges only) | 150ms ease | `[a&]:hover:bg-primary/90` |
| Tab | Text brightens | 150ms ease | `transition-[color,box-shadow]` |
| NavButton (Sidebar) | `bg-accent/50`, text brightens | 200ms ease | `hover:bg-accent/50` |
| Heatmap Cell | Ring highlight (`ring-1 ring-emerald-500/40`) | 150ms | `transition-colors duration-150` |
| Slider Thumb | `ring-4 ring-ring/50` | 200ms | `hover:ring-4` |
| Command Palette Item | `bg-white/[0.06]`, text brightens, emerald icon | 100ms | `transition-colors duration-100` |
| Notification Item | `bg-white/[0.03]` | 150ms | `transition-colors` |
| Scrollbar | Brightens from 8% to 15% opacity | 200ms | `::-webkit-scrollbar-thumb:hover` |
| Toast | Pauses auto-dismiss | — | Sonner internal |
| Avatar | No change | — | — |
| Logo | No change (Hero variant: pulse-glow) | 3s | `pulse-glow` animation |

**Hover Anti-Patterns:**
- ❌ Never use `color` transitions on large text blocks (use `opacity` or `filter`)
- ❌ Never change `font-size` on hover (causes reflow)
- ❌ Never use `transform: scale()` larger than 1.05 on small elements
- ❌ Never add hover effects that require sub-pixel precision
- ❌ Never use `cursor: pointer` on non-interactive elements

---

### 9.2 Press/Click Behavior

Press behavior provides tactile feedback that an action was registered.

**General Press Rules:**
- All buttons MUST have a press/active state
- Press MUST feel like a physical button press (scale down)
- Press timing: 100–150ms (fast, responsive)
- Press MUST NOT trigger the action (action triggers on release/click)
- Press scale: 0.95–0.97 depending on element size

**Component-Specific Press:**

| Component | Visual Change | Timing | CSS/Implementation |
|---|---|---|---|
| Button (all) | Scale 0.97, slight press down | 150ms ease | `btn-premium:active { transform: scale(0.97) }` |
| Press-hover class | Scale 0.97 on hover, 0.95 on active | 150ms ease | `press-hover` CSS class |
| Card | No press state (unless card is a button) | — | — |
| Switch Thumb | Slight scale increase | 150ms | Radix internal |
| Slider Thumb | Scale increase on drag | Spring | `SPRING_LIGHT` |
| Cursor Glow | Scale 0.85 on mousedown, back to 1 | 100ms | `clickScale.set(0.85)` → `setTimeout(100)` |
| Heatmap Cell | No press state (click handled by parent) | — | — |
| Notification Item | No press state | — | — |
| Command Palette Item | No press state (click handled) | — | — |

**Sound Feedback:**
- `playClick()`: Throttled to max 5 per second, very low volume (0.08 gain)
- `playTap()`: Throttled to max ~6 per second, even lower volume (0.05 gain)
- Both use Web Audio API with a shared `AudioContext`
- Silent fail on error — audio is non-critical

---

### 9.3 Focus Behavior

Focus behavior indicates which element will receive keyboard input. Critical for keyboard navigation and accessibility.

**General Focus Rules:**
- Focus rings MUST be visible and distinct
- Focus rings MUST use `focus-visible` (keyboard only, not mouse click)
- Focus ring color: emerald-500 (`--ring: hsl(160 84% 39%)`)
- Focus ring: `outline: 2px solid` + `box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15)`
- Focus ring MUST NOT animate on appearance (instant, 0ms)
- `:focus:not(:focus-visible)` must suppress outline (mouse click should not show ring)

**Component-Specific Focus:**

| Component | Ring Style | Implementation |
|---|---|---|
| Button | `border-ring`, `ring-ring/50 ring-[3px]` | `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]` |
| Input | `border-ring`, `ring-ring/50 ring-[3px]` | `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]` |
| Select Trigger | `border-ring`, `ring-ring/50 ring-[3px]` | `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]` |
| Switch | `border-ring`, `ring-ring/50 ring-[3px]` | `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]` |
| Tab | `ring-[3px]`, outline | `focus-visible:ring-[3px]` |
| Badge | `border-ring`, `ring-ring/50 ring-[3px]` | `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]` |
| Slider Thumb | `ring-4` on hover/drag | `hover:ring-4 focus-visible:ring-4` |
| NavButton | Emerald outline | `focus-emerald` class |
| Dialog Close | `ring-2`, `ring-offset-2` | `focus:ring-2 focus:ring-offset-2` |
| Error Boundary Retry | `focus-emerald` | `outline: 2px solid hsl(160 84% 39%)` |

**Focus Ring CSS:**
```css
/* Global focus-visible */
:focus-visible {
  outline: 2px solid hsl(160 84% 39%);
  outline-offset: 2px;
}

/* Suppress focus ring on mouse click */
:focus:not(:focus-visible) {
  outline: none;
  box-shadow: none;
}

/* Emerald focus ring utility */
.focus-emerald:focus-visible {
  outline: 2px solid hsl(160 84% 39%);
  outline-offset: 3px;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
  border-radius: 4px;
}
```

---

### 9.4 Disabled Behavior

Disabled behavior indicates that an element is present but not currently interactive.

**General Disabled Rules:**
- Disabled elements MUST be visually distinct from interactive elements
- Opacity: 40–50% (varies by component)
- `pointer-events: none` — prevents all mouse interaction
- `cursor: not-allowed` — indicates non-interactive state
- `aria-disabled="true"` — announces disabled state to screen readers
- Disabled MUST NOT have hover, focus, or active states

**Component-Specific Disabled:**

| Component | Opacity | Cursor | Pointer Events | Additional |
|---|---|---|---|---|
| Button | 50% | `not-allowed` | `none` | — |
| Input | 50% | `not-allowed` | `none` | — |
| Select | 50% | `not-allowed` | `none` | — |
| Switch | 50% | `not-allowed` | — | — |
| Slider | 50% | — | `none` | `data-[disabled]:opacity-50` |
| Tab | 50% | — | `none` | — |
| Badge | — | — | — | `aria-invalid:border-destructive` |
| Card | 50% | — | — | No hover effect |

**Disabled CSS:**
```css
button:disabled,
[role="button"][aria-disabled="true"],
[type="button"]:disabled,
[type="submit"]:disabled,
[type="reset"]:disabled {
  cursor: not-allowed;
}
```

---

### 9.5 Loading Behavior

Loading behavior indicates that content is being fetched or an operation is in progress.

**General Loading Rules:**
- Loading states MUST be visible immediately (no delay)
- Skeleton shimmer for content areas
- Spinner for buttons and small elements
- Progress bar for deterministic progress
- Loading states MUST NOT block the entire UI

**Component-Specific Loading:**

| Component | Loading Visual | Implementation |
|---|---|---|
| Button | Spinner icon replaces content, disabled state | `Loader2` icon + `disabled` prop |
| Card | Skeleton shimmer overlay | `Skeleton` component |
| Input | No loading state (use form-level) | — |
| Select | No loading state | — |
| Dashboard | Stagger reveal with skeleton placeholders | `staggerContainer` + `Skeleton` |
| Heatmap | Skeleton shimmer | `Skeleton` component |
| Charts | Skeleton shimmer | `Skeleton` component |
| Notification Panel | Spinner in center | `Loader2 animate-spin` |
| Command Palette | No loading state (instant) | — |
| Toast (loading) | Spinner icon, indefinite duration | Sonner `toast.loading()` |
| Progress Bar | Smooth fill animation | `transition-all 400ms ease-out` |
| Avatar | Fallback initials shown | `AvatarFallback` |

**Skeleton Shimmer:**
- Duration: 1.5s
- Animation: `animate-pulse` or custom shimmer gradient
- Shape: matches content shape (rectangle for cards, circle for avatars)
- Color: `bg-muted` (dark: `bg-white/[0.04]`)

---

### 9.6 Success Behavior

Success behavior confirms that an action completed successfully.

**General Success Rules:**
- Success feedback MUST be immediate and clear
- Success toast: 3s duration, emerald icon
- Success animation: brief, delightful, not distracting
- Success state: temporary — returns to default after feedback

**Component-Specific Success:**

| Component | Success Visual | Timing |
|---|---|---|
| Toast | Emerald icon, slide-in from top-right | 3s auto-dismiss |
| Button | Returns to default + success toast | — |
| Form | Fields reset, success toast | — |
| Switch | Smooth transition to new state | 200ms spring |
| Check Badge | Spring scale from 0 → 1, emerald circle with check | Spring (stiffness: 400, damping: 15) |
| Progress Bar | 100% width, subtle pulse | — |
| Celebration Screen | Trophy spring animation + confetti + glow | 2s confetti, 600ms content delay |
| Achievement Unlock | Badge spring animation + toast | 300ms spring |
| Animated Number | Smooth count to target value | 0.8s ease |

---

### 9.7 Error Behavior

Error behavior indicates that something went wrong or validation failed.

**General Error Rules:**
- Error feedback MUST be immediate and specific
- Error messages MUST be human-readable (not technical)
- Error toast: 5s duration, destructive icon
- Error state: persistent until user corrects or dismisses
- Error boundary: catches catastrophic errors

**Component-Specific Error:**

| Component | Error Visual | Timing |
|---|---|---|
| Toast | Destructive icon, slide-in from top-right | 5s auto-dismiss |
| Input | `border-destructive`, `ring-destructive/20` | 200ms ease |
| Select | `aria-invalid:border-destructive` | 200ms |
| Badge | `aria-invalid:border-destructive` | 200ms |
| Button | Returns to default + error toast | — |
| Form | Error message below field, destructive border | — |
| Error Boundary | `AlertTriangle` icon + message + retry button | — |
| API Failure | Error toast + possible retry button | — |
| Network Error | Error toast with "Check your connection" | — |

**Error Message Placement:**
- Form fields: below the field, `text-destructive text-sm`
- Toast: top-right, destructive icon
- Error boundary: centered in component, glass-card

---

### 9.8 Drag Behavior

**Current Status: NOT USED per UX Bible.** MindGuard does not implement drag-and-drop interactions.

**Rationale:**
- Drag interactions are difficult to make accessible
- Drag interactions are unreliable on touch devices
- Drag interactions add complexity without clear UX benefit in MindGuard's context
- The UX Bible explicitly avoids drag-and-drop for these reasons

**If Drag Is Needed in the Future:**
- Must have keyboard alternative (arrow keys to move)
- Must have touch alternative (long-press + move)
- Must have `aria-grabbed` and `aria-dropeffect` attributes
- Must provide visual drop targets
- Must not rely solely on drag for any critical interaction

---

### 9.9 Drop Behavior

**Current Status: NOT USED per UX Bible.** Same rationale as drag behavior.

---

### 9.10 Keyboard Behavior

Keyboard behavior is critical for accessibility, power users, and the command palette experience.

**Global Keyboard Shortcuts:**

| Shortcut | Action | Context |
|---|---|---|
| `Cmd/Ctrl + K` | Open command palette | Global |
| `?` | Open keyboard shortcuts modal | Global (not in input) |
| `Cmd/Ctrl + B` | Toggle sidebar | Global |
| `G D` | Navigate to Dashboard | Global |
| `G M` | Navigate to Mission | Global |
| `G T` | Navigate to Timer | Global |
| `G R` | Navigate to Reflection | Global |
| `G S` | Navigate to Statistics | Global |
| `G H` | Navigate to Session History | Global |
| `G L` | Navigate to Life Dashboard | Global |
| `G V` | Navigate to Daily Review | Global |
| `G P` | Navigate to Daily Replay | Global |
| `G W` | Navigate to Weekly Wrapped | Global |
| `G ,` | Navigate to Settings | Global |

**Component-Specific Keyboard:**

| Component | Key | Action |
|---|---|---|
| Button | `Enter` | Activate button |
| Button | `Space` | Activate button |
| Input | `Enter` | Submit form (if in form) |
| Input | `Tab` | Move to next field |
| Input | `Shift+Tab` | Move to previous field |
| Select | `Enter`/`Space` | Open dropdown |
| Select | `ArrowUp/Down` | Navigate options |
| Select | `Enter` | Select option |
| Select | `Escape` | Close dropdown |
| Tabs | `ArrowLeft/Right` | Navigate between tabs |
| Tabs | `Home/End` | First/Last tab |
| Tabs | `Tab` | Move focus to panel content |
| Dialog | `Escape` | Close dialog |
| Dialog | `Tab` | Cycle within dialog (focus trap) |
| Command Palette | `ArrowUp/Down` | Navigate results |
| Command Palette | `Enter` | Select result |
| Command Palette | `Escape` | Close palette |
| Shortcuts Modal | `Escape` | Close modal or cancel editing |
| Shortcuts Modal | `Tab` | Cycle within modal (focus trap) |
| Shortcuts Modal | `Backspace` | Reset shortcut to default |
| Sidebar | `Cmd+B` | Toggle collapse |
| Slider | `ArrowLeft/Right` | Adjust value |
| Slider | `Home/End` | Min/Max value |
| Switch | `Space` | Toggle state |
| Toast | `Escape` | Dismiss toast |

**Focus Management:**
- Dialog opens: focus moves to first focusable element
- Dialog closes: focus returns to trigger element
- Command palette opens: focus moves to search input
- Command palette closes: focus returns to previous element
- Tab navigation: focus moves to active panel content
- New view: focus moves to page heading

**Keyboard Shortcut Management:**
- `shortcutManager` handles registration, conflict detection, and customization
- Shortcuts can be customized via the keyboard shortcuts modal
- Custom shortcuts are persisted to user settings
- Conflict detection: warns when a shortcut is already assigned
- Shortcut override: can force-assign with conflict resolution
- Export/Import: JSON config file for sharing shortcuts

---

### 9.11 Touch Behavior

Touch behavior ensures the app works well on mobile and tablet devices.

**General Touch Rules:**
- Minimum touch target: 44×44px (Apple HIG) / 48×48px (Material)
- All interactive elements MUST be reachable by touch
- Touch targets MUST have adequate spacing (8px minimum between targets)
- No hover effects on touch devices (use `:active` state instead)
- Cursor glow is disabled on touch devices (`pointer: coarse`)

**Component-Specific Touch:**

| Component | Touch Target | Active State | Special Behavior |
|---|---|---|---|
| Button | 36×36px (icon), 44px height (text) | `scale(0.97)` | — |
| Card | Full card area | Slight opacity change | — |
| Switch | 44×44px area | — | — |
| Slider | 44px thumb area | — | — |
| Select | 44px height | — | — |
| Tab | Full tab width | Text brightens | — |
| NavButton | 44px height | `bg-accent/50` | — |
| Sidebar | Sheet overlay on mobile | — | Slide from left |
| Command Palette | Full item height | `bg-white/[0.06]` | — |
| Notification Item | Full item height | `bg-white/[0.03]` | — |
| Heatmap Cell | 10×10px (too small) | — | Tooltip on touch |

**Mobile-Specific Adaptations:**
- Sidebar: Sheet overlay instead of persistent sidebar
- Command palette: `w-[calc(100%-2rem)]` for margin
- Dialog: `flex-col-reverse` footer (primary action at bottom)
- Toast: top-center on mobile
- Keyboard shortcuts: hidden on mobile (`hidden sm:inline`)

---

### 9.12 Long Press Behavior

**Current Status: NOT USED.** MindGuard does not implement long-press interactions.

**If Long Press Is Needed in the Future:**
- Must have visual feedback during press (progress indicator)
- Must have alternative (e.g., right-click context menu)
- Must not be the only way to access critical features
- Must be cancellable (user releases before threshold)

---

### 9.13 Context Menu Behavior

**Current Status: NOT USED.** MindGuard does not implement right-click context menus.

**Rationale:**
- Context menus are not discoverable by most users
- Context menus are difficult to make accessible
- All actions are available through visible UI elements
- The command palette serves as the keyboard-first alternative

**If Context Menu Is Needed in the Future:**
- Must have keyboard alternative (Shift+F10)
- Must have visible alternative (action buttons)
- Must use standard Radix ContextMenu component
- Must not contain critical actions unavailable elsewhere

---

### 9.14 Double-Click Behavior

**Current Status: NOT USED.** MindGuard does not implement double-click interactions.

**Rationale:**
- Double-click is not discoverable
- Double-click conflicts with accessibility
- All actions are achievable with single click

---

## Section 10: Animation Map

This section documents the complete animation system in MindGuard — every animation, its timing, its spring configuration, its reduced motion behavior, and the rules governing when animations should and should not be used.

### 10.1 Animation System Architecture

MindGuard's animation system is built on two layers:

1. **Framer Motion** — For interactive animations, page transitions, spring physics, and orchestration (stagger, AnimatePresence)
2. **CSS Animations** — For decorative loops, background effects, and micro-interactions that don't need spring physics

**Import Points:**
- Shared variants: `@/lib/animations` (`staggerContainer`, `staggerItem`, `fadeIn`, `fadeInUp`, `scaleIn`, `EASE`, `SPRING_LIGHT`, `SPRING_MEDIUM`)
- Premium components: `@/components/premium/stagger` (`StaggerContainer`, `StaggerItem`)
- Premium components: `@/components/premium/animated-number` (`AnimatedNumber`)
- Premium components: `@/components/premium/cursor-glow` (`CursorGlow`)
- CSS classes: `globals.css` (`glass-card`, `btn-premium`, `lift-hover`, `animate-*`, etc.)

---

### 10.2 Page Transitions

**How views transition in the SPA:**

MindGuard uses a single-page application architecture where views swap without full page reloads. Transitions are subtle and fast.

| Transition | Visual | Timing | Implementation |
|---|---|---|---|
| View enter | Fade in + slide up 8px | 300ms cubic-bezier(0.4, 0, 0.2, 1) | CSS `.page-transition-enter` / `.page-transition-enter-active` |
| View exit | Fade out | 200ms | Component unmount |
| Dashboard load | Stagger reveal of cards | 60ms stagger + 350ms per item | `staggerContainer` + `staggerItem` |

**Page transition CSS:**
```css
.page-transition-enter {
  opacity: 0;
  transform: translateY(8px);
}
.page-transition-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Rules:**
- Page transitions MUST be 300ms or less
- Page transitions MUST NOT include scale changes
- Page transitions MUST NOT include rotation
- Page transitions MUST be instant when `prefers-reduced-motion: reduce`

---

### 10.3 Modal Animations

**How modals open and close:**

| Animation | Visual | Timing | Implementation |
|---|---|---|---|
| Backdrop appear | Black/50 fade in | 200ms | `data-[state=open]:fade-in-0` |
| Backdrop disappear | Black/50 fade out | 200ms | `data-[state=closed]:fade-out-0` |
| Content appear | Zoom in from 95% + fade in | 200ms | `data-[state=open]:zoom-in-95 data-[state=open]:fade-in-0` |
| Content disappear | Zoom out to 95% + fade out | 200ms | `data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out-0` |
| Sheet appear | Slide from edge | 300ms | `slide-in-from-right` / `slide-in-from-bottom` |
| Sheet disappear | Slide to edge | 300ms | `slide-out-to-right` / `slide-out-to-bottom` |
| Command palette appear | Scale from 96% + slide from top | 200ms | Framer Motion `initial/animate/exit` |
| Command palette disappear | Scale to 96% + slide up | 200ms | Framer Motion `exit` |
| Shortcuts modal appear | Scale from 95% + slide down | 200ms | Framer Motion `initial/animate/exit` |
| Notification panel appear | Scale from 95% + slide from top | 200ms | Framer Motion `initial/animate/exit` |

**Modal Animation Rules:**
- All modals MUST have backdrop animation
- Content MUST NOT appear before backdrop
- Close animation MUST be the reverse of open animation
- Close animation MUST be the same duration as open animation
- Focus MUST move to modal after animation completes

---

### 10.4 Toast Animations

**How toasts appear and disappear:**

| Animation | Visual | Duration | Direction |
|---|---|---|---|
| Toast appear | Slide in + fade in | 300ms | From top-right |
| Toast disappear | Slide out + fade out | 300ms | To top-right |
| Toast swap | Loading → Success/Error | 200ms | In-place swap |

**Toast Duration by Type:**

| Type | Duration | Reason |
|---|---|---|
| Success | 3s | Brief confirmation |
| Error | 5s | More time to read |
| Info | 3s | Brief information |
| Warning | 5s | More time to read |
| Loading | Indefinite | Until operation completes |

**Toast Animation Rules:**
- Toasts MUST NOT stack more than 3 visible
- Toasts MUST pause auto-dismiss on hover
- Toasts MUST slide in from the same direction consistently
- Toasts MUST NOT overlap content on mobile

---

### 10.5 Hover Animations

**How elements respond to hover:**

| Animation | Visual | Timing | Easing | Used By |
|---|---|---|---|---|
| Button hover | Scale 1.02, border brightens | 200ms | ease | All buttons |
| Card hover | Lift -2px, border brightens, shadow deepens | 300ms | cubic-bezier(0.34, 1.56, 0.64, 1) | Glass cards |
| Card highlight bar | Top gradient bar appears | 300ms | ease | `card-highlight` |
| Card glow edge | Gradient border glow appears | 300ms | ease | `glass-glow-edge` |
| Premium button glow | Emerald gradient glow behind button | 300ms | ease | `btn-glow` |
| Cursor glow scale | Cursor and glow enlarge on interactive elements | Spring | damping: 25, stiffness: 300 | CursorGlow |
| Tab hover | Text brightens | 150ms | ease | Tab triggers |
| NavButton hover | Background tint, text brightens | 200ms | ease | Sidebar nav items |
| Scrollbar hover | Brightens from 8% to 15% | 200ms | ease | Scrollbar |

**Hover Animation Rules:**
- Hover animations MUST NOT cause layout reflow
- Hover animations MUST NOT be slower than 300ms
- Hover animations MUST NOT use rotation
- Hover scale MUST NOT exceed 1.05 for small elements
- Hover lift MUST NOT exceed -2px for cards
- Hover MUST be instant when `prefers-reduced-motion: reduce`

---

### 10.6 Focus Animations

**How focus rings appear and disappear:**

| Animation | Visual | Timing | Implementation |
|---|---|---|---|
| Focus ring appear | Emerald outline + box-shadow | 0ms (instant) | `focus-visible` CSS |
| Focus ring disappear | Outline and shadow removed | 0ms (instant) | `:focus:not(:focus-visible)` |

**Focus Ring Specification:**
- Color: `hsl(160 84% 39%)` (emerald-500)
- Outline: `2px solid hsl(160 84% 39%)`
- Outline offset: `2px` (default), `3px` (`.focus-emerald`)
- Box-shadow: `0 0 0 4px rgba(16, 185, 129, 0.15)`
- Border radius: `4px` (matches rounded corners)

**Focus Animation Rules:**
- Focus rings MUST appear instantly (0ms)
- Focus rings MUST NOT animate on appearance
- Focus rings MUST be visible on keyboard navigation only
- Focus rings MUST NOT appear on mouse click (`:focus:not(:focus-visible)`)
- Focus rings MUST be suppressed when `prefers-reduced-motion: reduce` is NOT needed (they're already instant)

---

### 10.7 Loading Animations

**How loading states are animated:**

| Animation | Visual | Duration | Easing | Used By |
|---|---|---|---|---|
| Skeleton shimmer | Gradient sweep across placeholder | 1.5s | ease-in-out | Card loading, list loading |
| Spinner | `Loader2` icon rotating | 1s | linear | Button loading, notification loading |
| Progress bar fill | Emerald gradient fill, smooth width | 400ms | ease-out | Onboarding progress, determinate loading |
| Cursor glow click | Scale 0.85 → 1 | 100ms | — | CursorGlow |

**Skeleton Shimmer Implementation:**
- `animate-pulse` CSS animation (opacity cycling)
- Custom shimmer: gradient animation with `translateX` sweep
- Color: `bg-muted` (dark: `bg-white/[0.04]`)
- Shape: matches content shape

**Loading Animation Rules:**
- Loading animations MUST start immediately (no delay)
- Skeleton shimmer MUST match the shape of the content it replaces
- Spinners MUST NOT be used for determinate progress (use progress bar)
- Loading states MUST NOT block the entire UI
- Loading animations MUST be instant when `prefers-reduced-motion: reduce`

---

### 10.8 Dashboard Animations

**How the dashboard comes alive:**

| Animation | Visual | Timing | Implementation |
|---|---|---|---|
| Stagger reveal | Cards appear one by one, fade in + slide up | 60ms stagger + 350ms per item | `staggerContainer` + `staggerItem` |
| Animated numbers | Numbers count up from 0 to target | 0.8s | `AnimatedNumber` with `EASE_STANDARD` |
| Progress bars | Smooth fill from 0% to target | 400ms ease-out | `Progress` component |
| Stat cards | Number + label + trend indicator | 60ms stagger | `StaggerContainer` + `StaggerItem` |
| Heatmap | Cells appear with stagger | 60ms stagger | `staggerContainer` |
| Timeline | Events appear with stagger | 60ms stagger | `staggerContainer` + `staggerItem` |

**Dashboard Stagger Configuration:**
- Container: `staggerChildren: 0.06`, `delayChildren: 0.1`
- Item: `opacity: 0, y: 14` → `opacity: 1, y: 0`
- Item duration: `0.35s` with `EASE_STANDARD: [0.25, 0.1, 0.25, 1]`
- Alternative: `SPRING_LIGHT` (stiffness: 300, damping: 30) for premium feel

**Dashboard Animation Rules:**
- Dashboard MUST use stagger reveal on mount
- Animated numbers MUST use `AnimatedNumber` component
- Stagger MUST NOT be used on re-renders (only initial mount)
- Dashboard MUST NOT animate during focus sessions (performance)

---

### 10.9 Onboarding Animations

**How onboarding steps transition:**

| Animation | Visual | Timing | Implementation |
|---|---|---|---|
| Step enter | Slide from direction + blur(3px) → clear | Spring (stiffness: 260, damping: 25) | `slideVariants` with `direction` |
| Step exit | Slide to direction + blur(3px) + scale(0.97) | Spring (stiffness: 260, damping: 25) | `slideVariants` with `direction` |
| Progress bar fill | Emerald gradient fill | 400ms ease-out | `Progress` component |
| Check badge | Spring scale from 0 → 1, emerald circle + check | Spring (stiffness: 400, damping: 15) | `SPRING_SNAPPY` |
| Option select | Border brightens, emerald tint, check badge | 200ms spring | `glass-card-active` |

**Onboarding Step Transition Variants:**
```typescript
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
    scale: 0.97,
    filter: 'blur(3px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 25,
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
    scale: 0.97,
    filter: 'blur(3px)',
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 25,
    },
  }),
};
```

**Onboarding Animation Rules:**
- Step transitions MUST use `SPRING_ONBOARDING` (stiffness: 260, damping: 25)
- Step transitions MUST include blur effect (3px → 0px)
- Step transitions MUST be directional (forward slides right, back slides left)
- Progress bar MUST fill smoothly (400ms ease-out)
- Check badges MUST use `SPRING_SNAPPY` (stiffness: 400, damping: 15)
- Onboarding animations MUST NOT be skipped (they're part of the experience)

---

### 10.10 Notification Animations

**How notifications animate:**

| Animation | Visual | Timing | Implementation |
|---|---|---|---|
| Bell bounce | Bell icon scales up on new notification | 300ms spring | Framer Motion `scale: 0 → 1` |
| Badge appear | Unread count badge scales from 0 → 1 | 300ms spring | `initial={{ scale: 0 }} animate={{ scale: 1 }}` |
| Panel slide | Panel slides down from top + scale from 95% | 200ms | Framer Motion `initial/animate` |
| Item stagger | Notification items appear one by one | 60ms stagger | `initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}` |
| Unread dot | Small emerald dot appears | 200ms | Static element |
| Mark all read | Dots disappear, items dim | 200ms | State update |

**Notification Animation Rules:**
- Bell bounce MUST NOT be distracting (subtle scale only)
- Panel MUST slide from top (not left/right)
- Items MUST stagger in (not all at once)
- Unread indicators MUST be subtle (1.5px dot)
- Notification animations MUST NOT interrupt focus sessions

---

### 10.11 Success Animations

**How success is celebrated:**

| Animation | Visual | Timing | Implementation |
|---|---|---|---|
| Achievement unlock | Badge spring scale from 0 → 1, emerald glow | 300ms spring | `SPRING_SNAPPY` |
| Check badge | Spring scale from 0 → 1, emerald circle + check icon | Spring (stiffness: 400, damping: 15) | `SPRING_SNAPPY` |
| Celebration screen | Trophy spring + confetti + emerald glow | 2s confetti + 600ms content delay | `CelebrationScreen` |
| Confetti | 30 particles burst from center | 2s, staggered delays | Framer Motion particles |
| Trophy icon | Scale from 0 → 1, rotate from -20° → 0° | Spring (stiffness: 200, damping: 12) | Framer Motion |
| Glow pulse | Emerald glow scales and fades | 3s infinite | `scale: [1, 1.2, 1]`, `opacity: [0.3, 0.5, 0.3]` |
| Success toast | Emerald icon, slide-in from top-right | 3s auto-dismiss | Sonner `toast.success()` |

**Celebration Screen Implementation:**
- 30 confetti particles (reduced from 60 for performance)
- 7 colors: emerald, teal, amber, purple
- 3 shapes: circle, rectangle, diamond
- Random: position, rotation, scale, delay
- Duration: 2s per particle
- Background glow: 500px emerald blur, 3s infinite
- Content: delayed 600ms after confetti starts
- Trophy: spring scale + rotate
- Stats: grid layout with animated numbers

**Success Animation Rules:**
- Celebration MUST only trigger for major milestones (session complete, streak, achievement)
- Confetti MUST NOT trigger for minor successes
- Celebration MUST be dismissible (click/tap anywhere)
- Celebration MUST NOT trigger during focus sessions
- Celebration MUST respect `prefers-reduced-motion: reduce`

---

### 10.12 Reduced Motion Behavior

**Exact CSS override when `prefers-reduced-motion: reduce` is active:**

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Framer Motion Fallback:**

All Framer Motion animations MUST check `prefers-reduced-motion` and use instant transitions instead of springs:

```typescript
// Pattern for checking reduced motion
const prefersReducedMotion = typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Use in animation config
const variants = prefersReducedMotion
  ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0 } } }
  : { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
```

**Reduced Motion Behavior by Component:**

| Component | Normal Behavior | Reduced Motion Behavior |
|---|---|---|
| Stagger reveal | Fade + slide, 60ms stagger | Instant opacity, no slide, no stagger |
| Animated number | Smooth count over 0.8s | Instant display of final value |
| Cursor glow | Spring-followed cursor | Not rendered (returns null) |
| Celebration | Confetti + spring + glow | Instant display, no confetti |
| Card hover | Lift + border brighten | Border brighten only (no lift) |
| Button hover | Scale 1.02 | No scale change |
| Button press | Scale 0.97 | No scale change |
| Modal open | Zoom + fade | Fade only |
| Toast | Slide in | Fade in |
| Toggle switch | Spring thumb slide | Instant position change |
| Progress bar | Smooth fill | Instant fill |
| Onboarding step | Slide + blur + spring | Instant swap, no blur |
| Heatmap | Stagger reveal | Instant display |
| Bell bounce | Spring scale | No bounce |

**Reduced Motion Rules:**
- ALL animations MUST be disabled or replaced with instant transitions
- Content MUST still be accessible (no hidden content waiting for animation)
- Focus rings MUST still appear (they're already instant)
- Disabled state MUST still be visually distinct
- The `CursorGlow` component MUST NOT render at all
- Scroll behavior MUST be `auto` (not `smooth`)

---

### 10.13 Animation Timing Tokens

**Canonical animation timing values. All animations in the product MUST use these tokens. Do NOT invent new values.**

| Token | Duration | Use Case |
|---|---|---|
| `DURATION_INSTANT` | 0ms | Focus rings, disabled states, instant transitions |
| `DURATION_FAST` | 150ms | Button press, toggle state, active feedback |
| `DURATION_NORMAL` | 200ms | Hover states, card interactions, tab switch, input focus |
| `DURATION_MEDIUM` | 300ms | Page transitions, card reveals, modal open/close, command palette |
| `DURATION_SLOW` | 400ms | Onboarding steps, modals, progress bar fill, premium reveals |
| `DURATION_DELIBERATE` | 500ms | Major reveals, celebrations, onboarding step transitions |

**Duration Mapping by Animation Type:**

| Animation Type | Duration Token | Actual Duration |
|---|---|---|
| Button hover | `DURATION_NORMAL` | 200ms |
| Button press | `DURATION_FAST` | 150ms |
| Card hover | `DURATION_MEDIUM` | 300ms |
| Card appear | `DURATION_MEDIUM` | 300ms |
| Input focus | `DURATION_NORMAL` | 200ms |
| Tab switch | `DURATION_NORMAL` | 200ms |
| Modal open | `DURATION_SLOW` | 400ms |
| Modal close | `DURATION_SLOW` | 400ms |
| Toast appear | `DURATION_MEDIUM` | 300ms |
| Toast disappear | `DURATION_MEDIUM` | 300ms |
| Page transition | `DURATION_MEDIUM` | 300ms |
| Stagger offset | 60ms | — |
| Stagger item | 350ms | — |
| Onboarding step | `DURATION_SLOW` | 400ms |
| Progress bar fill | `DURATION_SLOW` | 400ms |
| Animated number | 800ms | — |
| Celebration confetti | 2000ms | — |
| Celebration content | 600ms (delay) | — |
| Glow pulse (decorative) | 4000ms | — |
| Glow slow (decorative) | 6000ms | — |
| Gradient shift (decorative) | 6000ms | — |
| Float (decorative) | 6000ms | — |
| Breathe (decorative) | 3000ms | — |
| Focus breathe (decorative) | 4000ms | — |

---

### 10.14 Spring Values

**Canonical spring configurations. All spring animations MUST use these values. Do NOT invent new values.**

| Token | Stiffness | Damping | Use Case |
|---|---|---|---|
| `SPRING_LIGHT` | 300 | 20 | Interactive elements (buttons, toggles) |
| `SPRING_MEDIUM` | 200 | 15 | Cards, modals, popovers |
| `SPRING_ONBOARDING` | 260 | 25 | Onboarding step transitions |
| `SPRING_SNAPPY` | 400 | 15 | Check badges, rank badges, achievement unlock |
| `SPRING_TOGGLE` | 500 | 30 | Toggle switch thumb |

**Spring Usage by Component:**

| Component | Spring | Stiffness | Damping |
|---|---|---|---|
| Button press | `SPRING_LIGHT` | 300 | 20 |
| Toggle switch | `SPRING_TOGGLE` | 500 | 30 |
| Check badge | `SPRING_SNAPPY` | 400 | 15 |
| Card reveal | `SPRING_MEDIUM` | 200 | 15 |
| Onboarding step | `SPRING_ONBOARDING` | 260 | 25 |
| Modal appear | `SPRING_MEDIUM` | 200 | 15 |
| Achievement badge | `SPRING_SNAPPY` | 400 | 15 |
| Stagger item (premium) | Custom | 300 | 30 |
| Cursor glow cursor | Custom | 400 | 28 |
| Cursor glow glow | Custom | 250 | 20 |
| Cursor glow scale | Custom | 500 | 20 |
| Celebration trophy | Custom | 200 | 12 |

**Easing Tokens:**

| Token | Value | Use Case |
|---|---|---|
| `EASE_STANDARD` | `[0.25, 0.1, 0.25, 1]` | Default easing for most animations |
| `EASE_OUT` | `[0, 0, 0.2, 1]` | Elements entering the viewport |
| `EASE_IN` | `[0.4, 0, 1, 1]` | Elements leaving the viewport |
| `EASE_BOUNCE` | `[0.34, 1.56, 0.64, 1]` | Playful lift effects (use sparingly) |

---

### 10.15 Framer Motion Variants

**Shared animation variants imported from `@/lib/animations`:**

```typescript
// Container that staggers children
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

// Individual item in a stagger container
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
  },
};

// Simple fade in
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

// Fade in + slide up
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
};

// Scale in from 90%
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
  },
};
```

**Premium Stagger Variants (from `@/components/premium/stagger`):**

```typescript
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
};
```

**Onboarding Step Transition Variants:**

```typescript
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
    scale: 0.97,
    filter: 'blur(3px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 25,
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
    scale: 0.97,
    filter: 'blur(3px)',
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 25,
    },
  }),
};
```

---

### 10.16 CSS Keyframe Animations

**All CSS keyframe animations defined in `globals.css`:**

| Animation Name | Duration | Easing | Iteration | Use Case |
|---|---|---|---|---|
| `glow-pulse` | 4s | ease-in-out | infinite | Background glow orbs |
| `glow-slow` | 6s | ease-in-out | infinite | Subtle ambient glows |
| `breathe` | 3s | ease-in-out | infinite | Focus mode breathing indicator |
| `float` | 6s | ease-in-out | infinite | Floating decorative elements |
| `gradient-shift` | 6s | ease-in-out | infinite | Gradient text animation (`.gradient-text`) |
| `pulse-glow` | 3s | ease-in-out | infinite | Important element pulsing (`.pulse-glow`) |
| `border-glow` | 4s | ease-in-out | infinite | Gradient border animation (`.gradient-border`) |
| `dash-flow` | 2s | linear | infinite | Animated dashed lines (`.animated-dash`) |
| `focus-breathe-bg` | 4s | ease-in-out | infinite | Focus mode background (`.focus-breathe-bg`) |

**Keyframe Definitions:**

```css
@keyframes glow-pulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
}

@keyframes glow-slow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

@keyframes breathe {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}

@keyframes gradient-shift {
  0% { background-position: 0% center; }
  50% { background-position: 100% center; }
  100% { background-position: 0% center; }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.15); }
  50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.3); }
}

@keyframes border-glow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

@keyframes dash-flow {
  to { stroke-dashoffset: -28; }
}

@keyframes focus-breathe-bg {
  0%, 100% { background: radial-gradient(ellipse at 50% 50%, rgba(16, 185, 129, 0.04) 0%, transparent 70%); }
  50% { background: radial-gradient(ellipse at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 70%); }
}
```

---

### 10.17 When Animation Should NEVER Be Used

**Rule 1: Never animate during focus sessions.** When the timer is running, all non-essential animations should be paused or disabled. The only animation that should continue is the timer countdown itself. Background glows, stagger reveals, and decorative animations should freeze. This prevents distraction and conserves CPU.

**Rule 2: Never animate when `prefers-reduced-motion: reduce` is active.** Every animation in the product must respect this media query. CSS animations must be reduced to 0.01ms duration. Framer Motion animations must use instant transitions. The CursorGlow component must not render at all. This is a non-negotiable accessibility requirement.

**Rule 3: Never use animation as the sole indicator of state.** If an animation conveys meaning (e.g., a check badge appearing means "selected"), there must also be a non-animated indicator (e.g., a persistent border color change, an `aria-pressed` attribute). Animation should enhance understanding, not be the only way to understand.

**Rule 4: Never animate properties that cause layout reflow.** Do not animate `width`, `height`, `top`, `left`, `margin`, `padding`, `border-width`, or `font-size` on elements that affect the layout of other elements. Use `transform` and `opacity` instead. The only exception is the progress bar indicator, which uses `translateX` (a transform).

**Rule 5: Never use animation to slow down the user.** If a user clicks a button 20 times in rapid succession, the button must respond 20 times. No animation should create a "cooldown" period. Hover animations should be 200ms or less. Click feedback should be 150ms or less. The only exception is `DURATION_DELIBERATE` (500ms) for major reveals that the user explicitly triggered.

**Rule 6: Never use linear easing for interactive elements.** Linear easing feels robotic and unnatural. Use `ease`, `ease-out`, or spring physics for all interactive animations. Linear easing is only acceptable for `dash-flow` (animated dashed lines) and spinner rotation.

**Rule 7: Never animate the same interaction differently in different contexts.** A button press should always feel the same whether it's on the dashboard, in a modal, or in the sidebar. Consistency in animation is as important as consistency in visual design.

---

### 10.18 Animation Anti-Patterns

**Anti-Pattern 1: Animation for Decoration Only**
- ❌ A spinning logo that doesn't convey loading state
- ❌ Particles floating in the background that serve no purpose
- ❌ A bouncing arrow that doesn't indicate direction
- ✅ A pulsing glow on the "Start Focus" button that draws attention to the primary CTA
- ✅ A stagger reveal that helps the eye track where new content appeared

**Anti-Pattern 2: Animation That Hides Latency**
- ❌ A skeleton shimmer that lasts 5+ seconds while waiting for data
- ❌ A loading spinner that replaces content that could have been cached
- ✅ A skeleton shimmer that appears instantly while data loads
- ✅ Optimistic updates with rollback on error

**Anti-Pattern 3: Animation That Competes for Attention**
- ❌ Multiple elements animating simultaneously without orchestration
- ❌ A notification appearing while a celebration is in progress
- ❌ A toast sliding in while a modal is opening
- ✅ Sequential animations: stagger reveals, queued notifications
- ✅ Canceling previous animation when new one starts (AnimatePresence)

**Anti-Pattern 4: Animation That Breaks on Re-render**
- ❌ Stagger animation that re-triggers on every state change
- ❌ AnimatedNumber that re-animates from 0 on every re-render
- ❌ Modal close animation that gets interrupted by component unmount
- ✅ Stagger animation only on initial mount (not on re-render)
- ✅ AnimatedNumber that animates from previous value (not from 0)
- ✅ AnimatePresence for exit animations before unmount

**Anti-Pattern 5: Animation Without Accessibility**
- ❌ An animation that conveys information without a non-animated alternative
- ❌ An animation that cannot be disabled by `prefers-reduced-motion`
- ❌ An animation that moves content that a screen reader is currently reading
- ✅ `aria-hidden="true"` on decorative animated elements
- ✅ Separate `sr-only` content for screen readers
- ✅ `prefers-reduced-motion` fallback for all animations

**Anti-Pattern 6: Animation That Causes Performance Issues**
- ❌ Animating `box-shadow` on scroll (causes paint on every frame)
- ❌ Animating `filter: blur()` on more than 3 elements simultaneously
- ❌ Using `will-change` on more than 5 elements at once
- ❌ Running 60+ confetti particles (reduced to 30)
- ✅ Using `transform` and `opacity` for animations (GPU-accelerated)
- ✅ Using `will-change` sparingly on animated elements
- ✅ Reducing particle count for performance
- ✅ Using `requestAnimationFrame` for cursor glow

**Anti-Pattern 7: Inconsistent Animation Timing**
- ❌ Using 250ms for one button hover and 300ms for another
- ❌ Using a different spring for check badges in different contexts
- ❌ Using `ease-in` for entering elements and `ease-out` for leaving
- ✅ Using `DURATION_NORMAL` (200ms) for all hover states
- ✅ Using `SPRING_SNAPPY` for all check badges
- ✅ Using `EASE_OUT` for entering and `EASE_IN` for leaving

---

### 10.19 Sound Effects System

**Implementation:** `src/lib/sounds.ts`

While not strictly visual animation, sound effects are a companion to animation that provides multi-sensory feedback.

| Sound | Function | Volume | Throttle | Use Case |
|---|---|---|---|---|
| Click | `playClick()` | 0.08 gain, exponential ramp to 0.001 over 50ms | Max 5 per second (200ms) | Button clicks, navigation |
| Tap | `playTap()` | 0.05 gain, exponential ramp to 0.001 over 30ms | Max ~6 per second (150ms) | Lighter taps, secondary actions |

**Sound Rules:**
- Sounds MUST be very low volume (barely audible, like Notion)
- Sounds MUST be throttled (max 5–6 per second)
- Sounds MUST fail silently (no error on AudioContext failure)
- Sounds MUST respect system audio preferences
- Sounds MUST NOT play during focus sessions
- Sounds MUST NOT play on touch devices without user gesture
- AudioContext MUST be created lazily (not on page load)
- AudioContext MUST be resumed if suspended (browser autoplay policy)

---

### 10.20 Animation Performance Budget

**Maximum animation budget per frame:**

| Metric | Budget | Rationale |
|---|---|---|
| Animated elements per page | ≤ 10 | Prevents jank on low-end devices |
| Simultaneous spring animations | ≤ 5 | Framer Motion overhead |
| CSS animation elements | ≤ 3 | Background glows, decorative only |
| Confetti particles | ≤ 30 | Reduced from 60 for performance |
| `will-change` elements | ≤ 5 | Prevents excessive GPU memory |
| `backdrop-filter` elements | ≤ 3 | Expensive compositing |
| Animated properties per element | ≤ 2 | `transform` + `opacity` preferred |

**Performance Rules:**
- All animations MUST target 60fps on mid-range devices
- Animations MUST NOT cause layout shifts (CLS = 0)
- Animations MUST NOT cause paint on the main thread
- `transform` and `opacity` are the only animation-safe properties
- `filter: blur()` MUST be used sparingly (max 3 elements)
- `backdrop-filter` MUST be used sparingly (max 3 elements)
- All animations MUST be paused when tab is not visible (Framer Motion handles this)

---

## Section 11: Accessibility Blueprint

### 11.1 Accessibility Philosophy

MindGuard is a focus and productivity tool. The very people who need it most — those with ADHD, executive dysfunction, or attention challenges — are disproportionately likely to benefit from rigorous accessibility. Accessibility is not a compliance checkbox; it is a core product value. If MindGuard is not usable by someone navigating entirely by keyboard, or by someone who cannot perceive color, or by someone who needs reduced motion to avoid sensory overload, then MindGuard has failed its mission.

This section defines the complete accessibility architecture: every standard, every pattern, every test, and every component-level checklist. It is informed by WCAG 2.1 Level AA, the UX Bible §30, and the actual implementation in `globals.css`, `use-keyboard-shortcuts.ts`, and the component library.

### 11.2 WCAG 2.1 Level AA Compliance

MindGuard targets WCAG 2.1 Level AA compliance across all screens. This means:

| Principle | Requirement | MindGuard Implementation |
|---|---|---|
| Perceivable | Text alternatives for non-text content | All icons have `aria-label`; decorative images use `aria-hidden="true"` |
| Perceivable | Captions for audio/video | N/A (MindGuard has no audio/video content) |
| Perceivable | Content adaptable to different presentations | Semantic HTML structure; no information conveyed by CSS alone |
| Perceivable | Content distinguishable (color, contrast) | All text meets 4.5:1 (normal) or 3:1 (large) contrast ratios |
| Operable | Keyboard accessible | All interactive elements reachable via keyboard; focus trapping in modals |
| Operable | Enough time | Focus timer has no forced time limits; all notifications are dismissible |
| Operable | Seizures and physical reactions | `prefers-reduced-motion` respected; no flashing content |
| Operable | Navigable | Skip links, consistent navigation, descriptive headings, focus indicators |
| Operable | Input modalities | Touch targets ≥ 44px; gesture alternatives available |
| Understandable | Readable | Simple language; no jargon without explanation |
| Understandable | Predictable | Consistent navigation; no unexpected context changes |
| Understandable | Input assistance | Form labels, error messages, validation feedback |
| Robust | Compatible | Semantic HTML; ARIA where needed; no reliance on specific assistive tech |

### 11.3 Color Contrast Ratios

All color combinations in MindGuard have been verified against WCAG 2.1 AA standards. The dark mode palette is the primary theme, and all contrast ratios are verified against the dark background (`bg-zinc-950` / `#09090b`).

#### 11.3.1 Primary Text Contrast (Dark Mode)

| Foreground Class | Hex Value | Background | Contrast Ratio | Passes AA? | Usage |
|---|---|---|---|---|---|
| `text-zinc-50` | `#fafafa` | `#09090b` | 19.3:1 | ✅ AAA | Headings, primary text |
| `text-zinc-100` | `#f4f4f5` | `#09090b` | 17.6:1 | ✅ AAA | Primary body text |
| `text-zinc-200` | `#e4e4e7` | `#09090b` | 14.1:1 | ✅ AAA | Secondary text |
| `text-zinc-300` | `#d4d4d8` | `#09090b` | 10.8:1 | ✅ AAA | Tertiary text |
| `text-zinc-400` | `#a1a1aa` | `#09090b` | 7.2:1 | ✅ AA | Description text, captions |
| `text-zinc-500` | `#71717a` | `#09090b` | 4.7:1 | ✅ AA | Muted text (large only) |
| `text-zinc-600` | `#52525b` | `#09090b` | 3.1:1 | ⚠️ Large text only | Disabled text — never for body |
| `text-zinc-700` | `#3f3f46` | `#09090b` | 2.1:1 | ❌ Fail | Borders only — never for text |

#### 11.3.2 Accent Color Contrast (Dark Mode)

| Foreground Class | Hex Value | Background | Contrast Ratio | Passes AA? | Usage |
|---|---|---|---|---|---|
| `text-emerald-400` | `#34d399` | `#09090b` | 8.9:1 | ✅ AAA | Primary accent text |
| `text-emerald-300` | `#6ee7b7` | `#09090b` | 11.3:1 | ✅ AAA | Highlighted accent |
| `text-emerald-500` | `#10b981` | `#09090b` | 6.2:1 | ✅ AA | Buttons, links |
| `text-emerald-300` | `#6ee7b7` | `emerald-500/[0.08]` | 8.1:1 | ✅ AAA | Badge text on accent bg |
| `text-rose-400` | `#fb7185` | `#09090b` | 5.8:1 | ✅ AA | Destructive/warning text |
| `text-amber-400` | `#fbbf24` | `#09090b` | 7.9:1 | ✅ AAA | Warning/notification text |
| `text-sky-400` | `#38bdf8` | `#09090b` | 7.4:1 | ✅ AAA | Info text |

#### 11.3.3 UI Component Contrast (Dark Mode)

| Element | Foreground | Background | Ratio | Passes? |
|---|---|---|---|---|
| Card border | `rgba(255,255,255,0.06)` | `#09090b` | 1.1:1 | ⚠️ Decorative only |
| Card border (hover) | `rgba(255,255,255,0.1)` | `#09090b` | 1.2:1 | ⚠️ Decorative only |
| Input border | `rgba(255,255,255,0.12)` | `#09090b` | 1.2:1 | ⚠️ Paired with label |
| Focus ring | `hsl(160 84% 39%)` | `#09090b` | 6.2:1 | ✅ AA |
| Toggle switch (on) | `#10b981` | `#09090b` | 6.2:1 | ✅ AA |
| Toggle switch (off) | `#71717a` | `#09090b` | 4.7:1 | ✅ AA |
| Button primary | `#fafafa` | `#10b981` | 4.6:1 | ✅ AA |
| Button secondary | `#fafafa` | `#27272a` | 12.1:1 | ✅ AAA |
| Progress bar fill | `#10b981` | `#27272a` | 4.5:1 | ✅ AA |

**Note:** Card borders and input borders are decorative and do not convey information independently. They are always paired with labels, text, or other visual indicators that meet contrast requirements.

#### 11.3.4 High Contrast Mode

Windows High Contrast Mode (HCM) is supported via forced-colors media query:

```css
@media (forced-colors: active) {
  /* Override all custom colors */
  .glass-card {
    background: Canvas;
    border: 1px solid ButtonText;
  }
  .glass-sidebar {
    background: Canvas;
    border-right: 1px solid ButtonText;
  }
  .btn-glow {
    border: 1px solid ButtonText;
  }
  /* Ensure focus ring is visible */
  .focus-emerald:focus-visible {
    outline: 2px solid Highlight;
    outline-offset: 2px;
  }
  /* Ensure link text is distinguishable */
  a {
    text-decoration: underline;
  }
  /* Ensure progress bars are visible */
  .progress-fill {
    background: Highlight;
  }
  /* Ensure toggle switches are visible */
  .toggle-track {
    border: 2px solid ButtonText;
  }
  .toggle-thumb {
    background: ButtonText;
  }
}
```

### 11.4 Keyboard Navigation

#### 11.4.1 Global Keyboard Shortcuts

MindGuard uses a centralized `ShortcutManager` (see `use-keyboard-shortcuts.ts`) for all keyboard shortcuts. The manager handles:

- **Conflict detection:** No two shortcuts can use the same key combination
- **Context suppression:** Shortcuts are disabled in input fields and during focus timer mode
- **Platform awareness:** Cmd (macOS) / Ctrl (Windows/Linux) are treated as equivalents
- **Escape key:** Always propagated — never consumed by the shortcut manager

**Navigation shortcuts (all screens):**

| Shortcut | Action | Category |
|---|---|---|
| `G` then `D` | Go to Dashboard | `nav.dashboard` |
| `G` then `M` | Go to Missions | `nav.mission` |
| `G` then `T` | Go to Timer | `nav.timer` |
| `G` then `R` | Go to Reflection | `nav.reflection` |
| `G` then `S` | Go to Sessions | `nav.sessions` |
| `G` then `A` | Go to Stats | `nav.stats` |
| `G` then `P` | Go to Replay | `nav.replay` |
| `G` then `W` | Go to Wrapped | `nav.wrapped` |
| `G` then `L` | Go to Life Dashboard | `nav.life` |
| `G` then `V` | Go to Review | `nav.review` |
| `G` then `,` | Go to Settings | `nav.settings` |
| `G` then `H` | Go to Habits | `nav.habits` |
| `G` then `X` | Go to Monthly | `nav.monthly` |
| `Cmd/Ctrl + K` | Open Command Palette | `system.palette` |
| `Cmd/Ctrl + /` | Open Shortcuts Modal | `system.shortcuts` |
| `?` | Open Shortcuts Modal (when not in input) | `system.shortcuts` |
| `Escape` | Close modal / palette / focus mode | System |

**Focus timer shortcuts (during active session):**

| Shortcut | Action | Category |
|---|---|---|
| `Space` | Start / Pause timer | `focus.start_pause` |
| `Escape` | End session (with confirmation) | `focus.end` |
| `S` | Skip break | `focus.skip_break` |

**Input field suppression rule:** When `isInputElement(e.target)` returns true (i.e., the user is typing in an `<input>`, `<textarea>`, or `contentEditable` element), all shortcuts except `Escape` are suppressed. This prevents accidental navigation while typing.

#### 11.4.2 Tab Order Specification

The tab order follows a logical left-to-right, top-to-bottom flow within each screen. The global structure is:

```
1. Skip link (hidden until focused)
2. Sidebar navigation (desktop) / Bottom tab bar (mobile)
3. Main content area
   a. Header / breadcrumb
   b. Primary content
   c. Secondary content
4. Modal overlays (when open, trap focus within)
5. Toast notifications (not in tab order — announced via aria-live)
```

**Per-screen tab order:**

**Dashboard:**
1. Skip link → main content
2. Greeting zone: greeting text, motivational message
3. Action zone: quick-start button, AI coach card
4. Reflection zone: heatmap, timeline
5. Widget cards: each widget is a single tab stop (card has `tabindex="0"`)
6. Within each widget: interactive elements follow inner tab order

**Focus Timer:**
1. Skip link → main content
2. Timer display (non-interactive, `aria-live="polite"`)
3. Start/Pause button
4. End Session button
5. Session type selector (if not started)
6. Break controls (if on break)

**Onboarding:**
1. Skip link → main content
2. Step indicator (non-interactive)
3. Step content: form fields in visual order
4. Back / Next buttons
5. Skip onboarding link

**Settings:**
1. Skip link → main content
2. Settings section tabs (horizontal)
3. Within each section: form fields in visual order
4. Save / Reset buttons

#### 11.4.3 Focus Ring Design

The focus ring is defined in `globals.css` and applied globally:

```css
.focus-emerald:focus-visible {
  outline: 2px solid hsl(160 84% 39%);
  outline-offset: 3px;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
  border-radius: 4px;
}

/* Keyboard-only focus outlines (not on mouse click) */
:focus:not(:focus-visible) {
  outline: none;
  box-shadow: none;
}

/* Ensure keyboard focus is always visible */
:focus-visible {
  outline: 2px solid hsl(160 84% 39%);
  outline-offset: 2px;
}
```

**Design decisions:**
- **`:focus-visible` only** — not `:focus` — prevents focus rings from appearing on mouse click, which is the #1 source of "ugly focus rings" complaints
- **2px outline** — visible but not overwhelming
- **3px offset** — ensures the ring doesn't overlap or touch the element
- **4px emerald box-shadow** — secondary visual indicator for low-vision users who might miss the outline
- **4px border-radius** — matches the rounded design language
- **No `outline: none`** on `:focus-visible` — the outline is always present for keyboard users

#### 11.4.4 Skip Links

Every page in MindGuard includes a skip link as the first focusable element:

```html
<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-md">
  Skip to main content
</a>
```

**Behavior:**
- Hidden by default (`sr-only` / visually hidden)
- Appears when focused via Tab key
- Jumps focus to `#main-content` which is the `<main>` landmark
- On dashboard, a second skip link is available: "Skip to quick-start button"

#### 11.4.5 Modal Focus Trapping

When a modal is open, focus is trapped within the modal. The implementation follows the WAI-ARIA Authoring Practices for Dialog Modal:

1. **On open:** Focus moves to the first interactive element in the modal
2. **On Tab from last element:** Focus wraps to the first element
3. **On Shift+Tab from first element:** Focus wraps to the last element
4. **On Escape:** Modal closes, focus returns to the element that triggered it
5. **Background is inert:** All content outside the modal has `aria-hidden="true"` and `inert` attribute

**Implementation pattern (used in all modals):**

```typescript
// Focus trap implementation
const modalRef = useRef<HTMLDivElement>(null);
const previousFocusRef = useRef<HTMLElement | null>(null);

useEffect(() => {
  if (isOpen) {
    previousFocusRef.current = document.activeElement as HTMLElement;
    // Move focus to first interactive element
    const firstFocusable = modalRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    firstFocusable?.focus();
  } else {
    // Restore focus
    previousFocusRef.current?.focus();
  }
}, [isOpen]);
```

### 11.5 ARIA Labels, Roles, and Live Regions

#### 11.5.1 ARIA Labels

Every interactive element in MindGuard has a descriptive `aria-label` or `aria-labelledby`:

| Element | ARIA Label Pattern | Example |
|---|---|---|
| Sidebar nav items | `aria-label="{view_name} view"` | `aria-label="Dashboard view"` |
| Icon buttons | `aria-label="{action_description}"` | `aria-label="Open settings"` |
| Toggle switches | `aria-label="{setting_name}"` | `aria-label="Dark mode"` |
| Card (selectable) | `aria-label="{card_title}"` | `aria-label="Focus score: 78"` |
| Timer display | `aria-label="Timer: {mm}:{ss} remaining"` | `aria-label="Timer: 25:00 remaining"` |
| Progress bar | `aria-label="{label}: {percentage}%"` | `aria-label="Focus goal: 67%"` |
| Heatmap cell | `aria-label="{date}: {minutes} minutes"` | `aria-label="Jan 15: 45 minutes"` |
| Coach message | `aria-label="Coach message"` | N/A |
| Text input | `aria-labelledby="{label_id}"` | Paired with visible label |

#### 11.5.2 ARIA Roles

Custom components use appropriate ARIA roles:

| Component | Role | Additional Attributes |
|---|---|---|
| Onboarding step indicator | `role="tablist"` | `aria-selected` on each step |
| Onboarding step content | `role="tabpanel"` | `aria-labelledby` matching step tab |
| Distraction picker cards | `role="checkbox"` | `aria-checked="true/false"` |
| Coach personality selector | `role="radiogroup"` | `role="radio"` on each option |
| Toggle switch | `role="switch"` | `aria-checked="true/false"` |
| Sidebar nav | `role="navigation"` | `aria-label="Main navigation"` |
| Bottom tab bar | `role="tablist"` | `role="tab"` on each tab |
| Modal overlay | `role="dialog"` | `aria-modal="true"`, `aria-labelledby` |
| Toast notification | `role="status"` | `aria-live="polite"` |
| Command palette | `role="dialog"` | `aria-label="Command palette"` |
| Dropdown menu | `role="menu"` | `role="menuitem"` on each item |
| Accordion | `role="button"` (header) | `aria-expanded`, `aria-controls` |
| Progress bar | `role="progressbar"` | `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| Slider | `role="slider"` | `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| Tooltip | `role="tooltip"` | `aria-describedby` on trigger |

#### 11.5.3 ARIA States

| State | Attribute | Usage |
|---|---|---|
| Button pressed | `aria-pressed="true/false"` | Toggle buttons, sidebar active state |
| Checkbox checked | `aria-checked="true/false"` | Distraction picker, goal selector |
| Expanded | `aria-expanded="true/false"` | Collapsible sections, dropdowns |
| Disabled | `aria-disabled="true"` | Disabled buttons (use instead of `disabled` to keep in tab order) |
| Selected | `aria-selected="true/false"` | Tab-like navigation, personality picker |
| Hidden | `aria-hidden="true"` | Decorative elements, off-screen content |
| Invalid | `aria-invalid="true"` | Form validation errors |
| Described by | `aria-describedby` | Error messages, help text |
| Required | `aria-required="true"` | Required form fields |

#### 11.5.4 Live Regions

Dynamic content changes are announced via ARIA live regions:

| Region | `aria-live` | `aria-atomic` | Usage |
|---|---|---|---|
| Toast container | `"polite"` | `true` | All toast notifications |
| Timer display | `"polite"` | `false` | Timer countdown (announced every minute) |
| Focus score update | `"polite"` | `true` | Score changes after session |
| Achievement unlock | `"assertive"` | `true` | Immediate announcement |
| Coach message | `"polite"` | `true` | New AI coach responses |
| Progress bar | `"polite"` | `false` | Progress updates |
| Onboarding step change | `"polite"` | `true` | Step transition announcements |

**Implementation pattern:**

```typescript
// Live region for announcements
const [announcement, setAnnouncement] = useState('');

function announce(message: string) {
  setAnnouncement(''); // Clear first to force re-announcement
  requestAnimationFrame(() => setAnnouncement(message));
}

// In JSX:
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {announcement}
</div>
```

### 11.6 Screen Reader Announcements

#### 11.6.1 Event-Based Announcements

| Event | Announcement Text | Priority |
|---|---|---|
| Onboarding step change | `"Step [n] of [total]: [step_name]. [Contextual message]"` | `polite` |
| Focus session started | `"Focus session started. [Duration] minutes of [session_type]."` | `polite` |
| Focus session paused | `"Focus session paused. [Elapsed] minutes elapsed."` | `polite` |
| Focus session completed | `"Focus session complete. [Duration] minutes of focused work."` | `polite` |
| Focus session abandoned | `"Focus session ended early. [Elapsed] minutes recorded."` | `polite` |
| Achievement unlocked | `"Achievement unlocked: [name]. [description]"` | `assertive` |
| Streak updated | `"Your streak is now [n] days!"` | `polite` |
| Toggle changed | `"[Label] [enabled/disabled]"` | `polite` |
| Selection changed | `"[Item] selected. [Count] of [max] selected."` | `polite` |
| Error occurred | `"Error: [message]. [suggested_action]"` | `assertive` |
| Goal achieved | `"Congratulations! You've reached your [goal_name] goal!"` | `assertive` |
| Navigation changed | `"Navigated to [view_name]"` | `polite` |
| Coach message received | `"Coach says: [message_summary]"` | `polite` |
| Burnout risk warning | `"Warning: [risk_level] burnout risk detected. [suggestion]"` | `assertive` |
| Timer countdown | `"Timer: [mm] minutes remaining"` (announced every 5 min) | `polite` |

#### 11.6.2 Landmark Regions

Every screen uses semantic landmarks for efficient screen reader navigation:

| Landmark | HTML Element | `aria-label` | Present On |
|---|---|---|---|
| Banner | `<header>` | `"MindGuard header"` | All screens with shell |
| Navigation | `<nav>` | `"Main navigation"` | All screens with shell |
| Main | `<main>` | `"Main content"` | All screens |
| Complementary | `<aside>` | `"Sidebar"` | Dashboard, Life Dashboard |
| Search | `<search>` | `"Search"` | Command palette |
| Content info | `<footer>` | `"Footer"` | Landing page |

#### 11.6.3 Heading Hierarchy

Every screen follows a strict heading hierarchy. No heading levels are skipped:

| Screen | h1 | h2 | h3 |
|---|---|---|---|
| Dashboard | `"{Greeting}"` | "Quick Start", "Focus Score", "Today's Focus", "Streak", "Heatmap" | Widget subheadings |
| Focus Timer | `"Focus Session"` | Timer section, Session settings | — |
| Missions | `"Missions"` | "Active Missions", "Completed Missions", "Suggested Missions" | Mission titles |
| Reflection | `"Daily Reflection"` | "How was your day?", "What went well?", "Distractions" | — |
| Sessions | `"Session History"` | "Today", "This Week", "This Month" | Session entries |
| Stats | `"Focus Statistics"` | "Focus Score", "Weekly Overview", "Best Times", "Distractions" | — |
| Settings | `"Settings"` | "General", "Focus", "Notifications", "Integrations", "Accessibility" | Setting groups |
| Onboarding | `"Welcome to MindGuard"` | Step titles | — |
| Life Dashboard | `"Life Dashboard"` | "Focus", "Health", "Learning", "Finance" | Category cards |
| Review | `"Weekly Review"` | "Summary", "Highlights", "Improvements" | — |
| Wrapped | `"Your Year in Focus"` | Section titles | — |
| Habits | `"Habits"` | "Daily Habits", "Weekly Habits", "Streaks" | Habit names |
| Monthly | `"Monthly Review"` | "Overview", "Trends", "Goals" | — |

### 11.7 Reduced Motion Behavior

#### 11.7.1 CSS-Level Reduced Motion

The `globals.css` file defines a global reduced motion rule:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

This ensures:
- All CSS animations are effectively disabled (duration: 0.01ms)
- All CSS transitions are effectively disabled
- Smooth scrolling is disabled
- Animation iteration count is limited to 1

**Specific overrides for reduced motion:**

| Animation | Normal Behavior | Reduced Motion Behavior |
|---|---|---|
| `glow-pulse` | 4s infinite pulse | Static opacity (0.4) |
| `glow-slow` | 6s infinite pulse | Static opacity (0.3) |
| `breathe` | 3s infinite pulse | Static opacity (0.6) |
| `float` | 6s infinite float | Static position (0px) |
| `gradient-shift` | 6s infinite gradient | Static gradient position |
| `dash-flow` | 2s infinite dash | Static dash pattern |
| `pulse-glow` | 3s infinite glow | Static shadow |
| `focus-breathe-bg` | 4s infinite bg | Static background |
| `border-glow` | 4s infinite opacity | Static opacity (0.5) |
| Page transitions | 300ms fade+slide | Instant appearance |
| Card hover lift | 300ms translateY(-2px) | No transform |
| Button press | 150ms scale(0.97) | No transform |

#### 11.7.2 Framer Motion Reduced Motion

In Framer Motion, all animations check `prefers-reduced-motion`:

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const transition = prefersReducedMotion
  ? { duration: 0 }
  : { type: 'spring', stiffness: 260, damping: 25 };

// Or for layout animations:
const layoutTransition = prefersReducedMotion
  ? { duration: 0 }
  : { type: 'spring', stiffness: 350, damping: 30 };
```

**Component-level reduced motion handling:**

| Component | Normal Animation | Reduced Motion |
|---|---|---|
| `AnimatePresence` page transitions | `fade + slide` (300ms) | Instant swap |
| `motion.div` card entrance | `stagger` (0.05s per card) | All appear instantly |
| `motion.div` coach message | `slideUp + fadeIn` (200ms) | Instant appearance |
| `motion.div` toast | `slideIn from right` (300ms) | Instant appearance |
| `motion.div` achievement | `scale + confetti` | Text announcement only |
| `motion.div` timer pulse | `breathe` animation | Static display |
| `Confetti` component | 30 particles, 3s | No confetti at all |
| `Lottie` animations | Full animation | First frame only |

#### 11.7.3 Reduced Motion Fallback for Confetti

The confetti animation used in achievements is completely disabled under reduced motion:

```typescript
if (prefersReducedMotion) {
  // No confetti — just the screen reader announcement
  announce(`Achievement unlocked: ${achievement.name}`);
  return;
}
```

### 11.8 Touch Target Sizes

#### 11.8.1 Minimum Touch Target Requirements

All interactive elements meet minimum touch target sizes per Apple HIG (44×44px) and Material Design (48×48dp):

| Element | Minimum Size | Preferred Size | Implementation |
|---|---|---|---|
| Button | 44×44px | 48×48px | `min-h-[44px] min-w-[44px]` |
| Icon button | 44×44px | 48×48px | `h-11 w-11` (44px) |
| Toggle switch | 44×24px | 48×28px | Track: `h-6 w-11`, Thumb: `h-5 w-5` |
| Card (selectable) | 44×44px | Full card | `min-h-[44px]` + click handler on full card |
| Link | 44px height | Full line height | `min-h-[44px] inline-flex items-center` |
| Slider thumb | 44×44px | 48×48px | `h-11 w-11` |
| Checkbox/Radio | 44×44px | 48×48px | `h-11 w-11` with visual indicator |
| Nav item (sidebar) | 44px height | Full sidebar width | `min-h-[44px]` |
| Nav item (bottom bar) | 44×44px | Full tab width | `min-h-[44px] min-w-[44px]` |
| Swipe target | 44px height | Full row | Full-width touch area |

#### 11.8.2 Touch Target Spacing

Interactive elements must have sufficient spacing to prevent accidental taps:

| Context | Minimum Spacing | Implementation |
|---|---|---|
| Between adjacent buttons | 8px | `gap-2` |
| Between list items | 4px | `gap-1` |
| Between nav items | 4px | `gap-1` |
| Between card selections | 8px | `gap-2` |
| Between form fields | 16px | `gap-4` |
| Between toggle switches | 8px | `gap-2` |

### 11.9 Skip Links and Navigation Aids

#### 11.9.1 Skip Link Structure

Every screen has at least one skip link. Complex screens have additional skip links:

| Screen | Skip Links |
|---|---|
| All screens | "Skip to main content" |
| Dashboard | "Skip to main content" → "Skip to quick-start" |
| Settings | "Skip to main content" → "Skip to [section_name]" |
| Focus Timer | "Skip to main content" → "Skip to timer controls" |
| Onboarding | "Skip to main content" → "Skip onboarding" |

#### 11.9.2 Breadcrumb Navigation

Screens that are deeply nested (e.g., Session Detail within Session History) use breadcrumb navigation:

```
Sessions > Today > Session Detail
```

Each breadcrumb is a link, and the last item is the current page (not a link, `aria-current="page"`).

### 11.10 Per-Component Accessibility Checklist

Every component in MindGuard must pass the following checklist before it can be considered complete:

#### 11.10.1 Universal Checklist (All Components)

- [ ] All interactive elements are keyboard-navigable (Tab, Enter, Space, Escape)
- [ ] Focus rings are visible and styled with `.focus-emerald` or `:focus-visible`
- [ ] ARIA labels are present and descriptive for all interactive elements
- [ ] Color is not the sole indicator of state (paired with text, icon, or pattern)
- [ ] Contrast ratios meet AA standards (4.5:1 for normal text, 3:1 for large text)
- [ ] Reduced motion is respected (test with `prefers-reduced-motion: reduce`)
- [ ] Semantic HTML is used (no `<div>` where `<button>`, `<nav>`, or `<main>` should be)
- [ ] Form inputs have associated labels (`<label>` or `aria-labelledby`)
- [ ] Error messages are announced to screen readers (`aria-live` or `aria-describedby`)
- [ ] Touch targets meet minimum 44×44px requirement
- [ ] `aria-disabled` is used instead of `disabled` attribute when the element should remain in tab order
- [ ] No `tabindex` values greater than 0 (use 0 or -1 only)
- [ ] Component works in Windows High Contrast Mode (forced-colors: active)

#### 11.10.2 Modal/Dialog Checklist

- [ ] Modal has `role="dialog"` and `aria-modal="true"`
- [ ] Modal has `aria-labelledby` pointing to the modal title
- [ ] Focus is trapped within the modal when open
- [ ] Escape closes the modal
- [ ] Focus returns to the triggering element on close
- [ ] Background content is inert (`aria-hidden="true"` + `inert` attribute)
- [ ] Modal is announced when opened (screen reader reads the title)

#### 11.10.3 Form Checklist

- [ ] Every input has a visible label
- [ ] Every input has an associated `<label>` or `aria-labelledby`
- [ ] Required fields have `aria-required="true"`
- [ ] Validation errors are associated with the field via `aria-describedby`
- [ ] Validation errors use `aria-invalid="true"` on the field
- [ ] Error messages are announced via `aria-live="polite"`
- [ ] Form submission errors are announced via `aria-live="assertive"`
- [ ] Autocomplete attributes are set where appropriate (`autocomplete="name"`, etc.)

#### 11.10.4 Data Display Checklist

- [ ] Tables use `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>` with proper scope
- [ ] Charts have a text alternative (data table or `aria-label` summary)
- [ ] Heatmap cells have individual `aria-label` with date and value
- [ ] Progress bars have `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- [ ] Dynamic content updates use `aria-live` regions
- [ ] Loading states are announced (`aria-busy="true"`)
- [ ] Empty states are announced ("No sessions recorded yet")

#### 11.10.5 Navigation Checklist

- [ ] Navigation uses `<nav>` element with `aria-label`
- [ ] Active navigation item has `aria-current="page"`
- [ ] Sidebar items are in a consistent order across all screens
- [ ] Bottom tab bar items have `role="tab"` with `aria-selected`
- [ ] Dropdown menus have `role="menu"` with `role="menuitem"` children
- [ ] Breadcrumbs use `<nav aria-label="Breadcrumb">` with structured markup

#### 11.10.6 Interactive Widget Checklist

- [ ] Custom widgets have appropriate ARIA roles (radiogroup, checkbox, switch, slider)
- [ ] State changes are announced via `aria-live` or `aria-pressed`/`aria-checked`
- [ ] Drag and drop has keyboard alternative (move up/down buttons)
- [ ] Swipe gestures have keyboard alternative (arrow keys)
- [ ] Multi-select has count announcement ("3 of 5 selected")
- [ ] Timers have periodic announcements (every 5 minutes for focus timer)

### 11.11 Accessibility Testing Protocol

#### 11.11.1 Automated Testing

| Tool | Purpose | Frequency |
|---|---|---|
| `axe-core` (via `@axe-core/react`) | Automated WCAG violation detection | Every PR |
| `eslint-plugin-jsx-a11y` | Linting for common A11y issues | Every commit |
| Lighthouse Accessibility audit | Overall score and specific issues | Weekly |
| `pa11y-ci` | CI/CD automated a11y testing | Every PR |

#### 11.11.2 Manual Testing

| Test | Tool | Frequency |
|---|---|---|
| Keyboard-only navigation | Manual Tab-through | Every screen change |
| Screen reader testing (macOS) | VoiceOver | Every sprint |
| Screen reader testing (Windows) | NVDA | Monthly |
| Screen reader testing (mobile) | TalkBack (Android) | Monthly |
| High contrast mode | Windows HCM | Every sprint |
| Zoom testing | 200% browser zoom | Monthly |
| Reduced motion | Chrome DevTools emulation | Every sprint |

#### 11.11.3 Accessibility Score Targets

| Metric | Target | Minimum |
|---|---|---|
| Lighthouse Accessibility score | 100 | 95 |
| axe-core violations | 0 | 0 |
| `eslint-plugin-jsx-a11y` errors | 0 | 0 |
| Manual keyboard navigation | All screens pass | All screens pass |
| VoiceOver navigation | All screens pass | All screens pass |
| WCAG 2.1 AA compliance | 100% | 100% |

---

## Section 12: Responsive Blueprint

### 12.1 Responsive Design Philosophy

MindGuard is used on desktops, laptops, tablets, and phones. The focus timer is primarily a desktop experience (users need their computers to work), but the dashboard, reflection, and review screens are frequently used on mobile. The responsive design must feel native on every device — not like a desktop site shrunk to fit a phone.

The responsive strategy follows a **mobile-first, desktop-enhanced** approach. The base styles target mobile, and progressively more complex layouts are added at wider breakpoints. However, because MindGuard's primary use case is desktop focus sessions, the desktop experience is given equal priority in design and testing.

### 12.2 Breakpoint Definitions

MindGuard uses Tailwind CSS breakpoints, which are min-width media queries:

| Breakpoint | Tailwind Class | Min Width | Device Category | Primary Use Case |
|---|---|---|---|---|
| `xs` | (default) | 0px | Small mobile | iPhone SE, small Android phones |
| `sm` | `sm:` | 640px | Large mobile | iPhone 15, Pixel, Galaxy S |
| `md` | `md:` | 768px | Tablet (portrait) | iPad Mini, iPad portrait |
| `lg` | `lg:` | 1024px | Tablet (landscape) / Small laptop | iPad landscape, small laptop |
| `xl` | `xl:` | 1280px | Desktop | Standard desktop monitors |
| `2xl` | `2xl:` | 1536px | Ultra-wide | Large desktop monitors, ultrawide |

**Mobile detection hook (`use-mobile.ts`):**

```typescript
const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);
  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return !!isMobile;
}
```

The `useIsMobile()` hook returns `true` for viewports below 768px. This is used for:
- Switching between sidebar and bottom tab bar
- Switching between centered modals and full-screen modals
- Adjusting card padding and spacing
- Showing/hiding hover effects

### 12.3 Layout Behavior by Breakpoint

#### 12.3.1 Global Layout Changes

| Component | xs (<640px) | sm (640-767px) | md (768-1023px) | lg (1024-1279px) | xl (1280-1535px) | 2xl (1536px+) |
|---|---|---|---|---|---|---|
| Navigation | Bottom tab bar | Bottom tab bar | Sidebar (collapsed) | Sidebar (expanded) | Sidebar (expanded) | Sidebar (expanded) |
| Sidebar width | N/A | N/A | 64px (icons only) | 240px | 240px | 280px |
| Header height | 56px | 56px | 56px | 64px | 64px | 64px |
| Main content max-width | 100% | 100% | 100% | 100% | 1280px | 1440px |
| Content padding | 16px | 16px | 24px | 24px | 32px | 32px |
| Card padding | 16px | 16px | 20px | 20px | 24px | 24px |
| Card spacing (gap) | 12px | 12px | 16px | 16px | 16px | 16px |
| Typography scale | 90% | 95% | 100% | 100% | 100% | 100% |
| Modal width | Full screen | Full screen | 480px | 480px | 560px | 560px |
| Toast position | Top center | Top center | Top right | Top right | Top right | Top right |
| Bottom bar height | 64px | 64px | N/A | N/A | N/A | N/A |

#### 12.3.2 Grid Column Behavior

| Component | xs | sm | md | lg | xl | 2xl |
|---|---|---|---|---|---|---|
| Dashboard grid | 1 column | 1 column | 2 columns | 2 columns | 3 columns | 3 columns |
| Onboarding grid | 1 column | 2 columns | 2 columns | 2 columns | 3 columns | 3 columns |
| Distraction grid | 2 columns | 3 columns | 3 columns | 4 columns | 5 columns | 5 columns |
| Mission cards | 1 column | 1 column | 2 columns | 2 columns | 3 columns | 3 columns |
| Session list | 1 column | 1 column | 1 column | 2 columns | 2 columns | 2 columns |
| Stats grid | 1 column | 2 columns | 2 columns | 2 columns | 3 columns | 4 columns |
| Achievement grid | 2 columns | 3 columns | 3 columns | 4 columns | 4 columns | 5 columns |
| Settings form | 1 column | 1 column | 1 column | 2 columns | 2 columns | 2 columns |
| Life Dashboard categories | 1 column | 2 columns | 2 columns | 2 columns | 3 columns | 3 columns |
| Habit tracker | 1 column | 1 column | 2 columns | 2 columns | 2 columns | 3 columns |
| Review sections | 1 column | 1 column | 1 column | 2 columns | 2 columns | 2 columns |

### 12.4 Per-Screen Layout Behavior

#### 12.4.1 Dashboard — Responsive Behavior

**xs (<640px) — Small Mobile:**
- Greeting zone: Full-width, single column
- Action zone: Quick-start button is full-width, prominent
- AI coach card: Full-width, collapsed by default (tap to expand)
- Reflection zone: Heatmap is scrollable horizontally, timeline is vertical list
- Widget cards: Stacked vertically, full-width
- No sidebar — bottom tab bar navigation
- No hover effects — touch-only interactions

**sm (640-767px) — Large Mobile:**
- Greeting zone: Full-width, single column
- Action zone: Quick-start button is full-width
- AI coach card: Full-width, expanded by default
- Reflection zone: Heatmap fits 7 columns, timeline is vertical
- Widget cards: Stacked vertically, full-width
- No sidebar — bottom tab bar navigation

**md (768-1023px) — Tablet Portrait:**
- Sidebar appears as icon-only column (64px wide)
- Greeting zone: Full-width
- Action zone: Quick-start + AI coach side by side (2-column grid)
- Reflection zone: Heatmap (full width) + timeline (full width below)
- Widget cards: 2-column grid
- Card hover effects enabled

**lg (1024-1279px) — Tablet Landscape / Small Laptop:**
- Sidebar expands to 240px with labels
- Greeting zone: Full-width with sidebar
- Action zone: Quick-start + AI coach side by side
- Reflection zone: Heatmap + timeline side by side (2-column)
- Widget cards: 2-column grid

**xl (1280-1535px) — Desktop:**
- Sidebar: 240px, fully expanded
- Action zone: 3-column layout (quick-start, AI coach, distraction log)
- Reflection zone: Heatmap + timeline side by side
- Widget cards: 3-column grid
- All hover effects and micro-interactions active

**2xl (1536px+) — Ultra-wide:**
- Sidebar: 280px with extra padding
- Content max-width: 1440px (centered)
- Dashboard grid: 3-column with generous spacing
- Extra whitespace used for visual breathing room
- Optional: Fourth column for "trending" or "suggestions" widget

#### 12.4.2 Focus Timer — Responsive Behavior

**xs (<640px) — Small Mobile:**
- Timer display: Full-width, centered, large font
- Session type selector: Horizontal scrollable chips
- Start/Pause button: Full-width, sticky at bottom
- End Session button: Full-width, below Start/Pause
- Session settings: Full-screen modal
- Break timer: Full-screen with breathing animation

**sm (640-767px) — Large Mobile:**
- Timer display: Centered, larger font
- Session type selector: Horizontal chips, no scroll needed
- Start/Pause button: Full-width, sticky at bottom
- End Session button: Full-width

**md (768-1023px) — Tablet Portrait:**
- Timer display: Centered, with session info sidebar
- Session type selector: Horizontal chips
- Start/Pause button: Centered, 240px wide
- End Session button: Centered, 240px wide
- Session settings: Side panel (480px)

**lg (1024-1279px) — Tablet Landscape / Small Laptop:**
- Timer display: Centered, with session info on left
- Session type selector: Full display
- Start/Pause button: Centered, 240px wide
- Session settings: Side panel (480px)

**xl (1280-1535px) — Desktop:**
- Timer display: Centered, large
- Session info: Left sidebar
- Break suggestions: Right sidebar
- Session settings: Side panel (480px)
- Desktop activity tracking visible in dedicated panel

**2xl (1536px+) — Ultra-wide:**
- Timer display: Centered, extra-large
- Full 3-column layout: Session info | Timer | Break suggestions
- Desktop activity tracking: Full dedicated panel

#### 12.4.3 Onboarding — Responsive Behavior

**xs (<640px) — Small Mobile:**
- Step indicator: Simplified dots only (no text)
- Step content: Full-width, scrollable
- Navigation: Full-width buttons at bottom
- Back/Next: Full-width, stacked
- Distraction picker: 2-column grid of cards
- Swipe gesture: Swipe left/right to navigate steps

**sm (640-767px) — Large Mobile:**
- Step indicator: Dots + step names (horizontal scroll)
- Step content: Full-width
- Navigation: Side-by-side buttons
- Distraction picker: 2-column grid

**md (768-1023px) — Tablet Portrait:**
- Step indicator: Full text + progress bar
- Step content: Centered, max-width 640px
- Navigation: Side-by-side buttons
- Distraction picker: 3-column grid

**lg (1024-1279px) — Tablet Landscape / Small Laptop:**
- Step indicator: Full text + progress bar
- Step content: Centered, max-width 640px
- Navigation: Side-by-side buttons
- Distraction picker: 4-column grid

**xl (1280-1535px) — Desktop:**
- Step indicator: Full text + progress bar
- Step content: Centered, max-width 768px
- Navigation: Side-by-side buttons
- Distraction picker: 5-column grid
- Illustration: Side illustration visible

**2xl (1536px+) — Ultra-wide:**
- Same as xl, with more breathing room
- Content max-width: 896px

#### 12.4.4 Missions — Responsive Behavior

**xs (<640px) — Small Mobile:**
- Mission list: Vertical stack, full-width cards
- Mission detail: Full-screen slide-up
- Active/Completed tabs: Horizontal scrollable
- Create mission: Full-screen modal

**sm (640-767px) — Large Mobile:**
- Mission list: Vertical stack, full-width cards
- Mission detail: Full-screen modal
- Active/Completed tabs: Full display

**md (768-1023px) — Tablet Portrait:**
- Mission list: 2-column grid
- Mission detail: Centered modal (480px)
- Create mission: Centered modal (480px)

**lg (1024-1279px) — Tablet Landscape / Small Laptop:**
- Mission list: 2-column grid
- Mission detail: Centered modal (480px)

**xl (1280-1535px) — Desktop:**
- Mission list: 3-column grid
- Mission detail: Centered modal (560px)
- Create mission: Centered modal (560px)

**2xl (1536px+) — Ultra-wide:**
- Mission list: 3-column grid with generous spacing
- Content max-width: 1440px

#### 12.4.5 Reflection — Responsive Behavior

**xs (<640px) — Small Mobile:**
- Reflection form: Full-width, stacked fields
- Mood/energy selectors: Horizontal scrollable
- Text inputs: Full-width
- Previous reflections: Accordion list

**sm (640-767px) — Large Mobile:**
- Reflection form: Full-width
- Mood/energy selectors: Full display
- Previous reflections: Accordion list

**md (768-1023px) — Tablet Portrait:**
- Reflection form: Centered, max-width 640px
- Previous reflections: 2-column grid

**lg (1024-1279px) — Tablet Landscape / Small Laptop:**
- Reflection form: Centered, max-width 640px
- Previous reflections: 2-column grid

**xl (1280-1535px) — Desktop:**
- Reflection form: Left column (60% width)
- Previous reflections: Right column (40% width)
- Side-by-side layout

**2xl (1536px+) — Ultra-wide:**
- Same as xl, with more breathing room

#### 12.4.6 Sessions — Responsive Behavior

**xs (<640px) — Small Mobile:**
- Session list: Vertical list, compact cards
- Session detail: Full-screen slide-up
- Date filters: Horizontal scrollable chips
- No calendar view

**sm (640-767px) — Large Mobile:**
- Session list: Vertical list, standard cards
- Session detail: Full-screen modal
- Date filters: Full display

**md (768-1023px) — Tablet Portrait:**
- Session list: Vertical list, wider cards
- Session detail: Centered modal (480px)
- Calendar view: Available

**lg (1024-1279px) — Tablet Landscape / Small Laptop:**
- Session list: 2-column grid
- Session detail: Centered modal (480px)

**xl (1280-1535px) — Desktop:**
- Session list: 2-column grid
- Session detail: Centered modal (560px)
- Calendar view: Full month view

**2xl (1536px+) — Ultra-wide:**
- Session list: 2-column grid with generous spacing
- Content max-width: 1440px

#### 12.4.7 Stats — Responsive Behavior

**xs (<640px) — Small Mobile:**
- Stats grid: Single column, stacked cards
- Charts: Full-width, scrollable
- Focus score: Large prominent display
- No side-by-side charts

**sm (640-767px) — Large Mobile:**
- Stats grid: 2-column grid
- Charts: Full-width
- Focus score: Large prominent display

**md (768-1023px) — Tablet Portrait:**
- Stats grid: 2-column grid
- Charts: Side-by-side where possible
- Focus score: Large display

**lg (1024-1279px) — Tablet Landscape / Small Laptop:**
- Stats grid: 2-column grid
- Charts: Side-by-side

**xl (1280-1535px) — Desktop:**
- Stats grid: 3-column grid
- Charts: Side-by-side, larger
- Focus score: Large display with breakdown

**2xl (1536px+) — Ultra-wide:**
- Stats grid: 4-column grid
- Charts: Full-width with detail panels

#### 12.4.8 Settings — Responsive Behavior

**xs (<640px) — Small Mobile:**
- Settings sections: Vertical list (accordion)
- Form fields: Full-width
- No side-by-side layout
- Toggle switches: Full-width with labels

**sm (640-767px) — Large Mobile:**
- Settings sections: Vertical list (accordion)
- Form fields: Full-width

**md (768-1023px) — Tablet Portrait:**
- Settings sections: Vertical tabs on left
- Form fields: Full-width within section

**lg (1024-1279px) — Tablet Landscape / Small Laptop:**
- Settings sections: Vertical tabs on left (180px)
- Form fields: 2-column where appropriate

**xl (1280-1535px) — Desktop:**
- Settings sections: Vertical tabs on left (240px)
- Form fields: 2-column where appropriate
- Live preview panel on right

**2xl (1536px+) — Ultra-wide:**
- Same as xl, with more breathing room

#### 12.4.9 Life Dashboard — Responsive Behavior

**xs (<640px) — Small Mobile:**
- Category cards: Vertical stack, full-width
- Category detail: Full-screen slide-up
- Score summary: Horizontal scrollable

**sm (640-767px) — Large Mobile:**
- Category cards: 2-column grid
- Score summary: Full display

**md (768-1023px) — Tablet Portrait:**
- Category cards: 2-column grid
- Score summary: 2-column grid

**lg (1024-1279px) — Tablet Landscape / Small Laptop:**
- Category cards: 2-column grid
- Category detail: Side panel (480px)

**xl (1280-1535px) — Desktop:**
- Category cards: 3-column grid
- Category detail: Side panel (480px)
- Score summary: 4-column grid

**2xl (1536px+) — Ultra-wide:**
- Category cards: 3-column grid with generous spacing
- Content max-width: 1440px

#### 12.4.10 Review / Wrapped — Responsive Behavior

**xs (<640px) — Small Mobile:**
- Review sections: Vertical stack
- Charts: Full-width, simplified
- Summary: Large text, centered
- No side-by-side layout

**sm (640-767px) — Large Mobile:**
- Review sections: Vertical stack
- Charts: Full-width

**md (768-1023px) — Tablet Portrait:**
- Review sections: 2-column where appropriate
- Charts: Full-width

**lg (1024-1279px) — Tablet Landscape / Small Laptop:**
- Review sections: 2-column
- Charts: Side-by-side

**xl (1280-1535px) — Desktop:**
- Review sections: 2-column with generous spacing
- Wrapped: Full cinematic presentation

**2xl (1536px+) — Ultra-wide:**
- Same as xl, with more breathing room

### 12.5 Mobile-Specific Adaptations

#### 12.5.1 Navigation: Bottom Tab Bar

On mobile (<768px), the sidebar is replaced by a bottom tab bar:

```
┌──────────────────────────────┐
│                              │
│        Main Content          │
│                              │
│                              │
├──────────────────────────────┤
│  🏠  🎯  ⏱  📊  ⚙️        │
│  Dashboard Mission Timer Stats Settings │
└──────────────────────────────┘
```

**Bottom tab bar specifications:**
- Height: 64px
- Background: `bg-zinc-950` with `border-t` border
- Active tab: Emerald text + icon highlight
- Inactive tab: Zinc-500 text
- Touch targets: Minimum 44px height (tab bar is 64px)
- Icons: 24px, text: 10px
- Maximum 5 tabs visible (scrollable if more)
- `role="tablist"` with `role="tab"` on each item

**Bottom tab bar items (default):**
1. Dashboard (home icon)
2. Missions (target icon)
3. Timer (clock icon)
4. Stats (chart icon)
5. More (menu icon — opens overflow menu)

**Overflow menu items:**
- Reflection, Sessions, Replay, Wrapped, Life Dashboard, Review, Habits, Monthly

#### 12.5.2 Full-Screen Modals

On mobile, modals are displayed as full-screen overlays instead of centered dialogs:

```typescript
const isMobile = useIsMobile();

<Dialog>
  <DialogContent className={cn(
    isMobile
      ? "fixed inset-0 h-full w-full max-w-none rounded-none"
      : "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[480px] rounded-xl"
  )}>
    {/* Content */}
  </DialogContent>
</Dialog>
```

**Full-screen modal behavior:**
- No border radius (flush with screen edges)
- Full viewport coverage
- Close button in top-right corner
- Swipe down to dismiss (optional)
- Back button closes the modal on Android

#### 12.5.3 Swipe Gestures

On mobile, swipe gestures are supported for:

| Gesture | Action | Screen |
|---|---|---|
| Swipe left | Next onboarding step | Onboarding |
| Swipe right | Previous onboarding step | Onboarding |
| Swipe down | Dismiss modal | Full-screen modals |
| Swipe left on card | Delete session | Session list |
| Swipe right on card | Mark complete | Mission list |

**All swipe gestures have keyboard alternatives:**
- Left/Right arrows for onboarding navigation
- Escape for modal dismissal
- Delete key for session deletion
- Enter for mission completion

#### 12.5.4 No Hover States

On mobile, hover states are not available. The following adaptations are made:

| Desktop Pattern | Mobile Adaptation |
|---|---|
| Card hover (lift + border glow) | Active state (press-down + border highlight) |
| Button hover (glow) | Active state (press-down) |
| Tooltip on hover | Info icon with tap-to-reveal |
| Dropdown on hover | Tap to open dropdown |
| Link preview on hover | Tap to navigate |

**Implementation:**

```css
/* Disable hover effects on touch devices */
@media (hover: none) {
  .lift-hover:hover {
    transform: none;
    box-shadow: none;
  }
  .card-glow:hover {
    border-color: rgba(255, 255, 255, 0.06);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.15);
  }
  .btn-glow:hover::before {
    opacity: 0;
  }
}
```

#### 12.5.5 Larger Text on Mobile

Body text on mobile is minimum 14px to ensure readability on small screens:

```css
@media (max-width: 639px) {
  body {
    font-size: 14px;
  }
  .heading-xl {
    font-size: 1.5rem;
  }
  .heading-lg {
    font-size: 1.25rem;
  }
  .heading-md {
    font-size: 1rem;
  }
}
```

#### 12.5.6 Simplified Grids

On mobile, grids are simplified to fewer columns with more scrolling:

| Desktop Layout | Mobile Layout |
|---|---|
| 3-column grid | 1-column stack |
| 2-column grid | 1-column stack |
| Side-by-side panels | Stacked panels |
| Data table | Card list |
| Horizontal tabs | Vertical accordion |

### 12.6 Desktop-Specific Features

#### 12.6.1 Sidebar Navigation

On desktop (≥768px), the sidebar is the primary navigation:

**Collapsed state (md, 768-1023px):**
- Width: 64px
- Icons only, no text labels
- Tooltip on hover showing label
- Active item: Emerald background pill
- Expand button at bottom

**Expanded state (lg+, 1024px+):**
- Width: 240px (280px at 2xl)
- Icons + text labels
- Active item: Emerald background pill + bold text
- Collapse button at top
- User avatar + name at bottom

**Sidebar items (in order):**
1. Dashboard
2. Missions
3. Timer
4. Reflection
5. Sessions
6. Stats
7. Replay
8. Wrapped
9. Life Dashboard
10. Review
11. Habits
12. Monthly
13. — divider —
14. Settings

#### 12.6.2 Command Palette

The command palette (`Cmd/Ctrl + K`) is a desktop-only feature:

```
┌─────────────────────────────────────┐
│ 🔍  Search commands, views, actions  │
├─────────────────────────────────────┤
│  📊  Dashboard                       │
│  🎯  Missions                        │
│  ⏱  Timer                           │
│  📝  Reflection                      │
│  ─────────────────────────────────── │
│  🎮  Start Focus Session             │
│  📋  Create Mission                  │
│  📝  Start Reflection                │
│  ─────────────────────────────────── │
│  ⚙️  Open Settings                   │
│  ⌨️  Show Shortcuts                  │
└─────────────────────────────────────┘
```

**Command palette behavior:**
- Fuzzy search across all commands and views
- Keyboard navigable (arrow keys + Enter)
- Category dividers
- Recent commands shown first
- Not available on mobile (replaced by bottom tab bar + overflow menu)

#### 12.6.3 Desktop Activity Tracking

The desktop app (Electron) provides real-time activity tracking that is displayed in the focus timer and stats screens:

- **Focus timer:** Shows current desktop activity in a side panel
- **Stats:** Shows desktop activity breakdown by app
- **Dashboard:** Shows today's distraction minutes
- **Distraction log:** Shows real-time distraction alerts

This feature is only available on desktop (Electron) and is hidden on web/mobile.

#### 12.6.4 Keyboard Shortcuts

Keyboard shortcuts are primarily a desktop feature. On mobile, the shortcut system is disabled (no physical keyboard):

```typescript
// In useKeyboardShortcuts:
// On mobile, the hook is a no-op
const isMobile = useIsMobile();
if (isMobile) return { shortcutsModalRef };
```

#### 12.6.5 Multi-Window Support

On desktop, MindGuard supports:
- **Focus mode:** A minimal, always-on-top timer window (separate from the main window)
- **Desktop widget:** A small overlay showing today's focus score
- **Notification system:** System-level notifications for break reminders and achievements

### 12.7 Grid Column Change Specifications

#### 12.7.1 CSS Grid Implementation

All grids use CSS Grid with Tailwind's responsive utilities:

```css
/* Dashboard grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem; /* gap-3 */
}

@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem; /* gap-4 */
  }
}

@media (min-width: 1280px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
}
```

**Tailwind class equivalent:**
```html
<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
```

#### 12.7.2 Card Padding by Breakpoint

| Breakpoint | Card Padding | Tailwind Class | CSS Value |
|---|---|---|---|
| xs | 16px | `p-4` | `1rem` |
| sm | 16px | `sm:p-4` | `1rem` |
| md | 20px | `md:p-5` | `1.25rem` |
| lg | 20px | `lg:p-5` | `1.25rem` |
| xl | 24px | `xl:p-6` | `1.5rem` |
| 2xl | 24px | `2xl:p-6` | `1.5rem` |

**Global CSS utility:**

```css
.card-spacing {
  padding: 1.25rem; /* p-5 */
}
@media (min-width: 640px) {
  .card-spacing {
    padding: 1.5rem; /* sm:p-6 */
  }
}
```

### 12.8 Modal Width by Breakpoint

| Breakpoint | Modal Width | Modal Style | Border Radius |
|---|---|---|---|
| xs | 100% (full screen) | Full-screen overlay | 0px |
| sm | 100% (full screen) | Full-screen overlay | 0px |
| md | 480px | Centered dialog | 12px |
| lg | 480px | Centered dialog | 12px |
| xl | 560px | Centered dialog | 12px |
| 2xl | 560px | Centered dialog | 12px |

### 12.9 Toast Position by Breakpoint

| Breakpoint | Toast Position | Animation | Max Visible |
|---|---|---|---|
| xs | Top center | Slide down | 2 |
| sm | Top center | Slide down | 2 |
| md | Top right | Slide in from right | 3 |
| lg | Top right | Slide in from right | 3 |
| xl | Top right | Slide in from right | 3 |
| 2xl | Top right | Slide in from right | 3 |

**Toast offset from edge:**
- Mobile: 16px from top, 16px from left/right
- Desktop: 24px from top, 24px from right

### 12.10 Responsive Testing Protocol

#### 12.10.1 Device Testing Matrix

| Device | Breakpoint | Orientation | Priority |
|---|---|---|---|
| iPhone SE | xs (375px) | Portrait | High |
| iPhone 15 | sm (390px) | Portrait | High |
| iPhone 15 Pro Max | sm (430px) | Portrait | Medium |
| Pixel 7 | sm (412px) | Portrait | High |
| Galaxy S23 | sm (360px) | Portrait | Medium |
| iPad Mini | md (744px) | Portrait | High |
| iPad Air | md (820px) | Portrait | Medium |
| iPad Pro 11" | md (834px) | Portrait | Medium |
| iPad Pro 12.9" | md (1024px) | Portrait | Medium |
| iPad Mini (landscape) | lg (1024px) | Landscape | Medium |
| iPad Air (landscape) | lg (1180px) | Landscape | Low |
| 13" MacBook | lg (1280px) | — | High |
| 15" MacBook | xl (1440px) | — | High |
| 24" Monitor | xl (1920px) | — | High |
| 34" Ultrawide | 2xl (3440px) | — | Medium |

#### 12.10.2 Responsive Testing Checklist

For each screen, test at every breakpoint:

- [ ] Layout is appropriate for the viewport width
- [ ] No horizontal scrolling (except intentional scrollable areas)
- [ ] All interactive elements are reachable and usable
- [ ] Text is readable without zooming
- [ ] Touch targets meet minimum size requirements
- [ ] Images and icons scale appropriately
- [ ] Navigation is accessible and functional
- [ ] Modals and overlays display correctly
- [ ] Forms are usable on mobile
- [ ] Charts and data visualizations are readable

---

## Section 13: AI Personalization Blueprint

### 13.1 Personalization Philosophy

MindGuard is not a generic productivity app. It is a personal focus coach that adapts to each user's unique patterns, preferences, and needs. The AI personalization engine is the brain that makes MindGuard feel like it was built for one person — not a million.

Personalization in MindGuard operates on three levels, each building on the previous:

1. **Static Personalization** — Data from onboarding, applied immediately
2. **Behavioral Personalization** — Patterns observed from real usage, emerging over the first 2 weeks
3. **Predictive Personalization** — Forward-looking suggestions based on accumulated data, emerging after month 2

These levels are not toggled — they are progressive. Every user starts at Level 1, naturally progresses to Level 2, and eventually reaches Level 3 as their data accumulates.

### 13.2 The 14 Personalization Surfaces

MindGuard has 14 distinct surfaces where personalization is applied. Each surface is a screen, component, or feature that adapts based on user data.

#### 13.2.1 Surface 1: Personalized Greeting

**Location:** Dashboard header, top of every screen
**Component:** `getPersonalizedGreeting()` in `personalization.ts`
**What it affects:** The greeting text shown at the top of the dashboard

**Personalization logic:**

| Input | Output |
|---|---|
| Time of day (hour) | "Good morning" / "Good afternoon" / "Good evening" |
| User's display name | "Good morning, Alex" |
| Night-shift schedule | "Ready for your night session, Alex?" (after 9 PM) |
| Night-shift schedule | "Just winding down, Alex?" (5-9 AM) |
| Late night (9 PM - 5 AM) without night schedule | "Burning the midnight oil" |

**Data flow:**
```
User.workSchedule → isNightSchedule() → greeting template
User.displayName || User.name → greeting template
new Date().getHours() → time-of-day bucket
```

**Level progression:**
- Level 1: Uses onboarding data (name, schedule)
- Level 2: No change (greeting is already personalized)
- Level 3: Adds contextual greeting ("You're on a 7-day streak! Ready for another focused morning?")

#### 13.2.2 Surface 2: AI Coach

**Location:** AI Coach card on Dashboard, full Coach view
**Component:** `buildCoachContext()` in `coach-context.ts`
**What it affects:** Coach personality, system prompt, context data

**Personalization logic:**

| Input | Output |
|---|---|
| `coachPersonality` setting | "strict" / "friendly" / "data_nerd" personality |
| Focus stats (today, week, streak) | Contextual awareness of current state |
| Active missions | Mission-aware suggestions |
| Recent reflection | Mood and energy context |
| Top distractions | Distraction-specific advice |
| Best hour / best weekday | Optimal timing suggestions |
| Primary use | Use-case-specific language |

**Data flow:**
```
Prisma queries (12 parallel queries):
  User → userName, primaryUse, workSchedule, biggestDistraction
  UserSettings → coachPersonality, focusGoalMinutes
  FocusSession (today) → todayMinutes, sessionCount
  FocusSession (yesterday) → yesterdayMinutes
  FocusSession (week) → weekMinutes
  FocusSession (last 30 days) → bestHour, bestWeekday
  DailyReflection (last 30 days) → reflectionRate
  Mission (completed this week) → weekMissionsCompleted
  Mission (active) → activeMissions
  DesktopActivity (today) → topDistractions, todayDistractionMinutes
  DailyReflection (most recent) → recentReflection
  calculateStreak() → streak

All data → buildCoachContext() → CoachContext object
CoachContext + personality → system prompt → AI provider
```

**Level progression:**
- Level 1: Uses onboarding data (personality, primary use, schedule)
- Level 2: Adds behavioral data (actual session patterns, distraction data)
- Level 3: Adds predictive suggestions (best focus window, burnout risk, session length optimization)

#### 13.2.3 Surface 3: Dashboard Widget Priority

**Location:** Dashboard grid layout
**Component:** `getRecommendedWidgets()` in `personalization.ts`
**What it affects:** Which widgets appear and in what order

**Personalization logic:**

| Input | Widget Priority |
|---|---|
| `primaryUse: "studying"` | heatmap, session-stats, quick-start, streak, focus-score |
| `primaryUse: "coding"` | timeline, achievements, quick-start, streak, focus-score |
| `primaryUse: "writing"` | session-stats, distraction-log, quick-start, streak, focus-score |
| `primaryUse: "creative"` | achievements, timeline, quick-start, streak, focus-score |
| `primaryUse: "work"` | heatmap, timeline, quick-start, streak, focus-score |
| `primaryUse: "general"` | heatmap, session-stats, quick-start, streak, focus-score |
| `goals: "reduce_distractions"` | + distraction-log |
| `goals: "build_streak"` | + streak (if not already) |
| `goals: "deep_work"` | + session-stats (if not already) |
| `goals: "improve_score"` | + focus-score (if not already) |

**Level progression:**
- Level 1: Uses onboarding data (primary use, goals)
- Level 2: Reorders based on actual engagement (most-viewed widgets first)
- Level 3: Adds predictive widgets (e.g., "Suggested focus time" widget)

#### 13.2.4 Surface 4: Notification Timing

**Location:** Push notification system, in-app notifications
**Component:** Notification scheduling logic
**What it affects:** When and how notifications are sent

**Personalization logic:**

| Input | Notification Behavior |
|---|---|
| Work schedule | Focus reminders aligned to work hours |
| Night-shift schedule | No morning reminders; evening reminders instead |
| Actual session start times (Level 2) | Reminders at the user's actual peak hours |
| Missed days (Level 2) | Gentle re-engagement on days the user typically skips |
| Burnout risk (Level 3) | Suggest lighter days when burnout risk is high |
| Streak break risk (Level 3) | "Your streak is at risk" reminder on vulnerable days |

**Level progression:**
- Level 1: Uses onboarding schedule data
- Level 2: Adjusts based on actual session patterns
- Level 3: Predictive — "You usually skip Fridays" → lower goal suggestion

#### 13.2.5 Surface 5: Reports and Insights

**Location:** Stats screen, Weekly Review, Monthly Review
**Component:** `calculateSmartFocusScore()` in `analytics.ts`, `predictFocusScore()` in `predictions.ts`
**What it affects:** Which metrics are highlighted, which insights are shown

**Personalization logic:**

| Input | Insight Shown |
|---|---|
| Low reflection rate | "Reflection is a powerful tool — try adding a daily reflection" |
| High distraction time | "Your distraction time has increased this week" |
| Declining mood (Level 3) | "Your mood has been trending down — consider a lighter schedule" |
| Best focus hour (Level 2) | "Your best focus time is 9–11 AM. Schedule deep work here." |
| Session length optimization (Level 3) | "Your best sessions are 45 minutes. Consider making that your default." |

**Level progression:**
- Level 1: Standard reports (time, sessions, score)
- Level 2: Behavioral insights (best times, patterns, trends)
- Level 3: Predictive insights (burnout risk, optimal session length, streak break risk)

#### 13.2.6 Surface 6: Goal Suggestions

**Location:** Mission creation, goal setting
**Component:** Mission suggestion engine
**What it affects:** Suggested missions and goals

**Personalization logic:**

| Input | Suggested Mission |
|---|---|
| `primaryUse: "studying"` | "Complete 3 study sessions this week" |
| `primaryUse: "coding"` | "Ship 2 features this sprint" |
| `primaryUse: "writing"` | "Write 5000 words this week" |
| Low focus goal | "Increase daily focus by 15 minutes" |
| High streak (Level 2) | "Maintain your streak with a 30-minute daily minimum" |
| Streak break risk (Level 3) | "Set a lower goal for tomorrow to keep your streak alive" |

**Level progression:**
- Level 1: Generic goals based on primary use
- Level 2: Adjusted goals based on actual performance
- Level 3: Predictive goals ("You're likely to hit burnout — set a lighter goal for this week")

#### 13.2.7 Surface 7: Insights and Recommendations

**Location:** Dashboard AI coach card, insights panel
**Component:** `getDistractionAdvice()` in `personalization.ts`
**What it affects:** Contextual advice for the user's biggest distraction

**Personalization logic:**

| Distraction | Advice |
|---|---|
| Social media | "Schedule 10-min social breaks after each focus session" |
| Phone/notifications | "Enable Do Not Disturb mode and keep your phone in another room" |
| Email/Slack | "Batch-check messages at set times — not reactively" |
| YouTube/video | "Use video as a reward after completing a focus session" |
| Browser/tabs | "Use a dedicated browser profile for work" |
| Noise/people | "Try noise-cancelling headphones with ambient sounds" |
| Food/snacks | "Prepare water and healthy snacks before you start" |
| Daydreaming | "Try a 2-min mindfulness reset before each session" |
| Gaming | "Set a hard rule: no games until today's focus goal is complete" |
| (none set) | "Identify your biggest distraction and set a block schedule" |

**Level progression:**
- Level 1: Uses onboarding data (biggestDistraction)
- Level 2: Adds actual distraction data from desktop tracking
- Level 3: Predictive — warns about likely distraction triggers before they happen

#### 13.2.8 Surface 8: Reflection Prompts

**Location:** Daily Reflection screen
**Component:** Reflection prompt engine
**What it affects:** Which reflection questions are asked, how they're phrased

**Personalization logic:**

| Input | Prompt Adaptation |
|---|---|
| Coach personality: strict | "What did you accomplish today? Be specific." |
| Coach personality: friendly | "How did your day go? Tell me about it!" |
| Coach personality: data_nerd | "Rate your focus efficiency today. What was your signal-to-noise ratio?" |
| High distraction day (Level 2) | "What pulled you away from your focus today?" |
| Low mood (Level 2) | "What would make tomorrow feel better?" |
| Streak day (Level 2) | "You're on a streak! What's keeping you going?" |

**Level progression:**
- Level 1: Standard reflection prompts
- Level 2: Context-aware prompts based on the day's data
- Level 3: Predictive prompts ("You tend to skip reflections on Fridays — quick 30-second check-in?")

#### 13.2.9 Surface 9: Achievement Milestones

**Location:** Achievement cards, notification badges
**Component:** Achievement system
**What it affects:** Which achievements are shown, milestone targets

**Personalization logic:**

| Input | Achievement Behavior |
|---|---|
| Focus goal minutes | "First [goal] minutes" achievement scaled to goal |
| Session type preference | "Pomodoro Master" vs. "Deep Work Champion" |
| Primary use | Use-case-specific achievements |
| ADHD flag | Shorter milestone intervals, more frequent rewards |
| Actual performance (Level 2) | Achievement difficulty adjusted to be challenging but achievable |

**Level progression:**
- Level 1: Standard achievements based on onboarding data
- Level 2: Difficulty adjusted based on actual performance
- Level 3: Predictive — "You're 2 sessions away from unlocking [achievement]"

#### 13.2.10 Surface 10: Focus Session Defaults

**Location:** Focus Timer screen, quick-start
**Component:** `getFocusRecommendation()` in `personalization.ts`
**What it affects:** Default session duration, type, and break schedule

**Personalization logic:**

| Input | Recommended Session |
|---|---|
| Night-shift + late night | 60 min deep work |
| Night-shift + early morning | 25 min session |
| Early-bird + early morning | 60 min deep work |
| Early-bird + mid-morning | 45 min session |
| Standard + morning | 60 min deep work |
| Standard + post-lunch | 25 min pomodoro |
| Standard + afternoon | 45 min session |
| Standard + evening | 25 min session |
| Standard + late night | 15 min session |

**Level progression:**
- Level 1: Uses onboarding data (schedule, focus duration)
- Level 2: Adjusts based on actual session lengths (if user always ends sessions early, suggest shorter duration)
- Level 3: Predictive — "Your best sessions are 45 minutes. Consider making that your default."

#### 13.2.11 Surface 11: AI Suggestions

**Location:** AI Coach suggestions, mission suggestions
**Component:** AI suggestion engine
**What it affects:** Proactive suggestions offered by the coach

**Personalization logic:**

| Input | Suggestion |
|---|---|
| Low focus today | "A quick 15-minute session can get you back on track" |
| High streak | "You're on a [n]-day streak! Keep it going" |
| Burnout risk (Level 3) | "You've been pushing hard for 5 days. A lighter day might help." |
| Best focus window (Level 3) | "Your best focus time is 9–11 AM. Schedule deep work here." |
| Streak break risk (Level 3) | "You usually skip Fridays. Want to set a lower goal for tomorrow?" |

**Level progression:**
- Level 1: Basic suggestions based on current state
- Level 2: Behavioral suggestions based on patterns
- Level 3: Predictive suggestions based on prediction engine

#### 13.2.12 Surface 12: Morning Plan

**Location:** Morning briefing, AI Coach morning mode
**Component:** `buildCoachContext()` with `mode: 'morning_plan'`
**What it affects:** The morning plan content and suggestions

**Personalization logic:**

| Input | Morning Plan Content |
|---|---|
| Active missions | "Your active missions: [list]" |
| Yesterday's focus | "Yesterday you focused for [n] minutes" |
| Best focus hour | "Your best focus window is [hour]" |
| Streak | "You're on a [n]-day streak" |
| Goals | "Today's focus goal: [n] minutes" |
| Weather (if available) | "It's a [weather] day — great for [indoor/outdoor] focus" |

**Level progression:**
- Level 1: Uses onboarding data (goals, schedule)
- Level 2: Adds yesterday's data and best focus window
- Level 3: Adds predictions ("Based on your patterns, today is a high-focus day")

#### 13.2.13 Surface 13: Evening Review

**Location:** Evening review, AI Coach night mode
**Component:** `buildCoachContext()` with `mode: 'night_review'`
**What it affects:** The evening review content and suggestions

**Personalization logic:**

| Input | Evening Review Content |
|---|---|
| Today's focus | "You focused for [n] minutes today" |
| Goal achievement | "You [hit/missed] your focus goal by [n] minutes" |
| Streak | "Your streak is now [n] days" |
| Tomorrow's plan | "Tomorrow's plan: [missions]" |
| Wind-down time | "It's past your usual bedtime — consider wrapping up" |

**Level progression:**
- Level 1: Uses onboarding data (sleep range, goals)
- Level 2: Adds today's data and tomorrow's preview
- Level 3: Adds predictions ("You're on track for a great week — 2 more days to hit your weekly goal")

#### 13.2.14 Surface 14: Desktop Activity Tracking

**Location:** Focus Timer (desktop), Stats (desktop)
**Component:** Desktop activity tracking, distraction classification
**What it affects:** Real-time distraction alerts, activity breakdown

**Personalization logic:**

| Input | Tracking Behavior |
|---|---|
| Desktop tracking enabled | Real-time activity monitoring |
| Custom distraction list | User-defined distractions flagged |
| Focus session active | Stricter distraction thresholds |
| Focus session inactive | Relaxed distraction thresholds |
| Work app list (Level 2) | Auto-classified work vs. distraction apps |

**Level progression:**
- Level 1: Uses onboarding data (distraction list)
- Level 2: Learns which apps are productive vs. distracting for this user
- Level 3: Predictive — "You usually switch to [app] at this time — stay focused!"

### 13.3 Three Levels of Personalization

#### 13.3.1 Level 1: Static Personalization (Onboarding)

Data collected during onboarding immediately shapes the experience. This is the "first impression" personalization — the user should feel that MindGuard understands them from the very first screen.

**Data collected during onboarding:**

| Onboarding Step | Data Collected | What It Affects |
|---|---|---|
| Schedule type | `workSchedule` | Greeting time, focus recommendations, session timing |
| Focus duration | `focusGoalMinutes` | Timer defaults, pomodoro/break schedule |
| Work style | `primaryUse` | Session type (pomodoro vs. deep work vs. flexible) |
| Coach personality | `coachPersonality` | All coach communication tone |
| Distractions | `biggestDistraction` | Distraction advice, blocking recommendations |
| Goals | `goals[]` | Dashboard widget priority, mission suggestions |
| ADHD | `hasAdhd` | Session length, break frequency, nudge gentleness |
| Sleep range | `sleepRange` | "Wind down" notifications, late-night focus adjustments |

**Implementation:**

```typescript
// On onboarding completion, all data is saved to the database
await db.user.update({
  where: { id: userId },
  data: {
    workSchedule: formData.schedule,
    focusGoalMinutes: formData.focusDuration,
    primaryUse: formData.workStyle,
    biggestDistraction: formData.biggestDistraction,
    goals: formData.goals,
    hasAdhd: formData.hasAdhd,
    sleepRange: formData.sleepRange,
  },
});

await db.userSettings.upsert({
  where: { userId },
  create: {
    userId,
    coachPersonality: formData.coachPersonality,
    focusGoalMinutes: formData.focusDuration,
  },
  update: {
    coachPersonality: formData.coachPersonality,
    focusGoalMinutes: formData.focusDuration,
  },
});
```

**What changes immediately after onboarding:**
1. Greeting becomes personalized (name + time-of-day)
2. Dashboard widget order is adjusted based on `primaryUse` and `goals`
3. Focus timer defaults to the user's preferred session type
4. AI coach speaks in the selected personality
5. Distraction advice is tailored to the user's biggest distraction
6. Notification timing is aligned to the user's schedule

#### 13.3.2 Level 2: Behavioral Personalization (First 2 Weeks)

The coach observes behavior and adjusts. This is the "learning" phase — the coach is watching, but not yet predicting.

**Behavioral signals observed:**

| Behavior | What the Coach Learns | How It's Used |
|---|---|---|
| When the user starts focus sessions | Peak focus hours | "Your best focus time is [hour]" |
| How long sessions actually last | Real vs. stated focus duration | Adjust default session length |
| Which distractions are triggered | Actual distraction patterns | Update distraction advice |
| Missed days | Patterns of disengagement | Re-engagement nudges |
| Session quality ratings | What kind of work produces the best focus | "Your best sessions are [type]" |
| Reflection completion rate | How often the user reflects | Reflection prompt frequency |
| Which widgets the user interacts with | Most-used features | Widget priority reordering |
| Which settings the user changes | Preferences | Default adjustment |
| Time of day for each session | Circadian patterns | Best time suggestions |
| Break behavior | Do they skip breaks? Take long breaks? | Break schedule optimization |

**Data flow for Level 2:**

```
FocusSession (created after each session)
  → duration, startedAt, type, quality
  → analytics.calculateStreak()
  → analytics.calculateFocusScore()
  → analytics.findBestHour()
  → analytics.findBestWeekday()
  → predictions.predictFocusScore()
  → personalization.getFocusRecommendation()
  → personalization.getMotivationalText()
  → coach-context.buildCoachContext()

DailyReflection (created after each reflection)
  → mood, energy, wentWell, distraction, tomorrowMission
  → predictions.predictBurnoutRisk()

DesktopActivity (created by desktop tracking)
  → application, duration, type
  → distraction classification
  → coach-context.topDistractions
```

**Level 2 activation criteria:**
- Minimum 5 focus sessions recorded
- Minimum 3 days of data
- Minimum 1 reflection completed

**What changes at Level 2:**
1. Best focus hour is calculated and displayed
2. Best weekday is calculated and displayed
3. Session length recommendation is adjusted based on actual data
4. Distraction advice is updated based on actual distraction data
5. Coach starts using behavioral context ("You've been focusing for 3 hours today")
6. Notification timing is adjusted based on actual session times
7. Dashboard widget order is adjusted based on actual engagement
8. Reflection prompts become context-aware

#### 13.3.3 Level 3: Predictive Personalization (Month 2+)

The coach starts predicting and suggesting. This is the "proactive" phase — the coach is not just observing, but anticipating.

**Predictive capabilities:**

| Prediction | Engine | Example Output |
|---|---|---|
| Best focus window | `findBestHour()` + `findBestWeekday()` | "Your best focus time is 9–11 AM on Tuesdays" |
| Burnout risk | `predictBurnoutRisk()` | "You've been pushing hard for 5 days. A lighter day might help." (probability: 0.7) |
| Streak break risk | Behavioral pattern analysis | "You usually skip Fridays. Want to set a lower goal for tomorrow?" |
| Optimal session length | `predictFocusScore()` + session analysis | "Your best sessions are 45 minutes. Consider making that your default." |
| Mission completion probability | `predictMissionCompletion()` | "This mission has a 60% chance of completion — consider breaking it down" |
| Focus score prediction | `predictFocusScore()` | "Based on your recent activity, your focus score is trending up" |

**Burnout risk prediction (from `predictions.ts`):**

```typescript
// Risk factors checked:
// 1. Heavy workload (>50 hours this week) → +20 risk score
// 2. Increasing workload over 3 weeks → +25 risk score
// 3. Mood decline (recent avg < older avg by >1 point) → +30 risk score
// 4. Low energy levels (avg < 5/10) → +20 risk score
// 5. Very long sessions (>2 hours, >3 sessions) → +15 risk score

// Risk levels:
// probability < 0.3 → 'low'
// probability 0.3-0.6 → 'medium'
// probability > 0.6 → 'high'
```

**Mission completion prediction (from `predictions.ts`):**

```typescript
// Base probability: 0.5
// +0.2 if progress ratio > 0.5 (invested significant time)
// +0.15 if progress ratio > 1.0 (exceeded average session time)
// -0.2 if time ratio > 2.0 (been active too long)
// -0.15 if time ratio > 4.0 (seriously overdue)
// +0.1 if user has completed >3 missions historically
```

**Level 3 activation criteria:**
- Minimum 30 days of data
- Minimum 15 focus sessions recorded
- Minimum 5 reflections completed
- Minimum 1 week of desktop tracking data (if enabled)

**What changes at Level 3:**
1. Coach starts making proactive suggestions ("Your best focus time is 9–11 AM")
2. Burnout risk warnings appear when risk is medium or high
3. Streak break risk notifications appear on vulnerable days
4. Session length is optimized based on actual data
5. Mission completion probability is shown for each active mission
6. Focus score prediction is shown in the stats screen
7. Morning plan includes predictive suggestions
8. Evening review includes next-day predictions
9. Notification timing is adjusted based on predicted best times
10. Achievement milestones are adjusted based on predicted performance

### 13.4 Personalization Rules

These rules govern all personalization behavior. They are non-negotiable.

#### 13.4.1 Rule 1: Never Assume Without Data

If the user hasn't completed a focus session yet, don't suggest "best times." If the user hasn't enabled desktop tracking, don't suggest features that require it. If the user hasn't set a goal, don't calculate goal achievement.

**Implementation:**

```typescript
// In getPersonalizedGreeting:
// If no name is set, use time-only greeting without name
const displayName = user.displayName || user.name;
return displayName
  ? `${timeGreeting}, ${displayName}`
  : timeGreeting;

// In getFocusRecommendation:
// If no schedule is set, use "standard" as default
const schedule = (workSchedule || "standard").toLowerCase();

// In buildCoachContext:
// If no recent reflection exists, don't reference it
if (recentReflection) {
  // Include reflection data in context
}
```

#### 13.4.2 Rule 2: Always Explain Why

Every personalized suggestion must include a reason. The user should never feel that MindGuard is making decisions without transparency.

**Implementation:**

```typescript
// Good: "Based on your last 10 sessions, your best focus window is 9-11 AM."
// Bad: "Try focusing at 10 AM."

// Good: "You've been pushing hard for 5 days. A lighter day might help."
// Bad: "Take a break today."

// Good: "Your best sessions are 45 minutes. Consider making that your default."
// Bad: "Use 45-minute sessions."
```

**In the coach context system prompt:**

```
When making a suggestion, always explain the reasoning:
- "Based on your last [n] sessions..."
- "Your data shows that..."
- "You've been [pattern] for [duration]..."
```

#### 13.4.3 Rule 3: Allow Override

Every personalized suggestion can be dismissed. The coach learns from dismissals too.

**Implementation:**

```typescript
// Each suggestion has a dismiss button
// When dismissed, the dismissal is recorded
await db.userInteraction.create({
  data: {
    userId,
    type: 'suggestion_dismissed',
    suggestionId: suggestion.id,
    dismissedAt: new Date(),
  },
});

// Future suggestions of the same type are deprioritized
// After 3 dismissals of the same type, the suggestion is permanently hidden
```

#### 13.4.4 Rule 4: Respect Privacy

Only use data the user has explicitly enabled. If desktop tracking is off, don't suggest features that require it. If the user has not opted into analytics, don't use their data for cohort analysis.

**Implementation:**

```typescript
// Check desktop tracking permission before using activity data
if (userSettings.desktopTrackingEnabled) {
  // Use desktop activity data
  const topDistractions = await getTopDistractions(userId);
}

// Check analytics permission before using cohort data
if (userSettings.analyticsOptIn) {
  // Use anonymized cohort data
}

// Never use data without explicit permission
```

#### 13.4.5 Rule 5: No Creepy Personalization

MindGuard should never feel like it's watching too closely. Personalization should feel helpful, not surveillance.

**Anti-patterns (things we NEVER do):**
- "You spent 3 hours on YouTube today" → Too surveillance-like
- "You haven't opened MindGuard in 3 days" → Too guilt-tripping
- "Your productivity is lower than 87% of users" → Never compare to others
- "You were distracted by [specific app] at 2:34 PM" → Too granular
- "We noticed you were on Instagram at 3:15 PM" → Too specific, too creepy

**Good alternatives:**
- "Your distraction time was higher than usual today" → Aggregate, not specific
- "A quick focus session can get you back on track" → Encouraging, not guilt-tripping
- "You're on a 5-day streak! Keep it going" → Positive reinforcement
- "You tend to get distracted by social media in the afternoon" → Pattern, not incident
- "Consider blocking distractions during focus sessions" → Suggestion, not observation

#### 13.4.6 Rule 6: Graceful Degradation

If personalization data is unavailable, the experience should gracefully degrade to a good default — not break or show empty states.

**Default behaviors (no personalization data):**

| Feature | Default Behavior |
|---|---|
| Greeting | "Good morning" / "Good afternoon" / "Good evening" |
| Dashboard widgets | Default order: quick-start, streak, focus-score, heatmap, session-stats |
| Focus timer | 25-minute pomodoro, standard schedule |
| Coach personality | "friendly" |
| Distraction advice | "Identify your biggest distraction and set a block schedule" |
| Session recommendation | "A 25-minute focus session is a great way to make progress" |
| Notification timing | 9 AM, 1 PM, 5 PM |
| Reports | Standard metrics (time, sessions, score) |

### 13.5 Data Flow Architecture

#### 13.5.1 Personalization Data Pipeline

```
┌──────────────┐
│   User Input  │
│  (Onboarding) │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  User Table  │────▶│ UserSettings │────▶│  FocusSession│
│  (name,      │     │ (personality,│     │ (duration,   │
│   schedule,  │     │  goals,      │     │  startedAt,  │
│   primaryUse)│     │  tracking)   │     │  type)       │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                     │
       │                    │                     │
       ▼                    ▼                     ▼
┌──────────────────────────────────────────────────────┐
│                 Personalization Engine                 │
│                                                       │
│  ┌─────────────────┐  ┌──────────────────────────┐   │
│  │ personalization  │  │ coach-context             │   │
│  │ .ts              │  │ .ts                       │   │
│  │                  │  │                           │   │
│  │ - Greeting       │  │ - buildCoachContext()     │   │
│  │ - Motivation     │  │ - 12 parallel DB queries  │   │
│  │ - Widgets        │  │ - CoachContext object      │   │
│  │ - Focus rec      │  │ - System prompt           │   │
│  │ - Distraction    │  │                           │   │
│  └─────────────────┘  └──────────────────────────┘   │
│                                                       │
│  ┌─────────────────┐  ┌──────────────────────────┐   │
│  │ analytics.ts     │  │ predictions.ts            │   │
│  │                  │  │                           │   │
│  │ - calculateStreak│  │ - predictBurnoutRisk()    │   │
│  │ - calculateFocus │  │ - predictMissionComplete()│   │
│  │   Score          │  │ - predictFocusScore()     │   │
│  │ - findBestHour   │  │                           │   │
│  │ - findBestWeekday│  │                           │   │
│  └─────────────────┘  └──────────────────────────┘   │
│                                                       │
│  ┌─────────────────┐                                  │
│  │ ai-provider.ts   │                                  │
│  │                  │                                  │
│  │ - Multi-provider │                                  │
│  │ - z-ai (default) │                                  │
│  │ - Fallback chain │                                  │
│  └─────────────────┘                                  │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│                    14 Surfaces                         │
│                                                       │
│  Greeting → Coach → Dashboard → Notifications →       │
│  Reports → Goals → Insights → Reflection →            │
│  Achievements → Focus → Suggestions → Morning →       │
│  Evening → Desktop Tracking                           │
└──────────────────────────────────────────────────────┘
```

#### 13.5.2 AI Provider Architecture

The AI provider system (`ai-provider.ts`) supports multiple LLM backends:

| Provider | Default Model | Requires API Key | Status |
|---|---|---|---|
| `z-ai` | `default` | No | ✅ Default |
| `openai` | `gpt-4o-mini` | Yes | ✅ Supported |
| `deepseek` | `deepseek-chat` | Yes | ✅ Supported |
| `openrouter` | `openai/gpt-4o-mini` | Yes | ✅ Supported |
| `gemini` | `gemini-2.0-flash` | Yes | ✅ Supported |
| `anthropic` | `claude-3-haiku-20240307` | Yes | ✅ Supported |
| `ollama` | `llama3` | No (self-hosted) | ✅ Supported |

**Fallback chain:**
1. If the configured provider fails, try `z-ai` as fallback
2. If `z-ai` fails, show a graceful error message
3. The coach card shows a "Coach is temporarily unavailable" message
4. All non-AI personalization continues to work (greeting, widgets, focus rec, etc.)

#### 13.5.3 Context Window Management

The coach context is built from 12 parallel Prisma queries. The total context size is managed to stay within token limits:

| Component | Approximate Tokens | Notes |
|---|---|---|
| System prompt | ~500 | Personality + instructions |
| User context | ~800 | Stats, missions, distractions |
| Conversation history | ~2000 | Last 10 messages |
| Response budget | ~300 | Coach response |
| **Total** | **~3600** | Well within 4K context limit |

**Token management strategies:**
- Limit conversation history to last 10 messages
- Summarize older messages if needed
- Truncate mission list to top 5 active missions
- Truncate distraction list to top 5 distractions
- Use concise field names in context

### 13.6 Anti-Patterns

#### 13.6.1 Things We Never Do

1. **Never compare to other users.** "You're more productive than 87% of users" is a dark pattern. MindGuard is about personal growth, not competition.

2. **Never use guilt as motivation.** "You haven't focused today" → Bad. "A quick session can get you started" → Good.

3. **Never use manipulative streak mechanics.** Streaks are motivational, but they should not induce anxiety. "Don't lose your streak!" → Bad. "You're on a 5-day streak!" → Good.

4. **Never show raw data without context.** "You focused for 45 minutes" → Bad. "You focused for 45 minutes — that's 75% of your daily goal!" → Good.

5. **Never make suggestions without explaining why.** "Try focusing at 10 AM" → Bad. "Based on your last 10 sessions, your best focus window is 9-11 AM" → Good.

6. **Never change the user's settings without consent.** "We've adjusted your focus goal to 45 minutes" → Bad. "Your data suggests 45-minute sessions work best for you. Want to update your default?" → Good.

7. **Never use personalization to justify upselling.** "Based on your usage, you'd benefit from Pro" → Bad. (MindGuard has no paid tiers for personalization features.)

8. **Never store personalization data that the user hasn't explicitly generated.** If the user hasn't done a focus session, there's no session data to store. If the user hasn't enabled desktop tracking, there's no activity data to store.

9. **Never use personalization data across different users.** No cohort analysis, no "users like you" features, no social comparison.

10. **Never make personalization feel like surveillance.** The user should feel like MindGuard is a helpful coach, not a monitoring system. Aggregate patterns, not specific incidents.

#### 13.6.2 Personalization Degradation Matrix

When personalization data is unavailable, the experience degrades gracefully:

| Data Missing | Affected Surface | Degraded Behavior |
|---|---|---|
| No name set | Greeting | Time-only greeting without name |
| No schedule set | Focus recommendation | Standard schedule (9-5) |
| No primary use | Dashboard widgets | Default widget order |
| No goals | Mission suggestions | Generic mission suggestions |
| No distraction data | Distraction advice | Generic advice |
| No sessions yet | Focus score | Score = 0 (no misleading data) |
| No reflections yet | Reflection prompts | Standard prompts |
| No desktop tracking | Activity data | Distraction tracking hidden |
| No streak | Streak display | "Start your first streak today!" |
| AI provider down | Coach | "Coach is temporarily unavailable" |
| All data missing | Everything | Graceful defaults (see Rule 6) |

### 13.7 Personalization Testing Protocol

#### 13.7.1 Test Scenarios

| Scenario | What to Test | Expected Behavior |
|---|---|---|
| Fresh user (no data) | Greeting, widgets, focus rec | Default values, no errors |
| User with onboarding only | Greeting, coach personality | Personalized based on onboarding data |
| User with 1 week of data | Best hour, widget reordering | Behavioral insights start appearing |
| User with 1 month of data | Burnout risk, predictions | Predictive suggestions start appearing |
| User with ADHD flag | Session length, break frequency | Shorter sessions, more breaks |
| Night-shift user | Greeting, focus rec | Night-shift aware greetings and times |
| User with no sessions | Focus score, stats | Score = 0, no misleading data |
| User with AI provider down | Coach card | Graceful degradation message |
| User with desktop tracking off | Activity data | Tracking features hidden |

#### 13.7.2 Personalization Quality Metrics

| Metric | Target | Measurement |
|---|---|---|
| Suggestion acceptance rate | >30% | Dismissals vs. actions taken |
| Coach message helpfulness | >4.0/5 | In-app rating |
| Focus session start rate after suggestion | >15% | Conversion rate |
| Personalization accuracy | >80% | User feedback on suggestions |
| Graceful degradation rate | 100% | No errors when data is missing |

---

## Section 14: Technical Notes

### 14.1 Architecture Overview

MindGuard is built as a **single-page application (SPA)** with client-side routing using Next.js App Router. The application uses a hybrid rendering model:

- **Server Components** for data-fetching and static content (no client-side JavaScript)
- **Client Components** for interactive elements (state, effects, event handlers)
- **API Routes** for backend logic (database queries, AI completions, webhooks)

### 14.2 Rendering Strategy

#### 14.2.1 Server Components

Server Components are used for:
- Initial page loads (data fetching from Prisma)
- Static content (landing page, documentation)
- SEO-critical content (meta tags, Open Graph)
- Data-heavy components that don't need interactivity

**Implementation:**

```typescript
// app/dashboard/page.tsx (Server Component)
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { DashboardClient } from './dashboard-client';

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session?.user) redirect('/login');

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, displayName: true, primaryUse: true },
  });

  return <DashboardClient user={user} />;
}
```

#### 14.2.2 Client Components

Client Components are used for:
- Interactive UI (forms, modals, animations)
- State management (Zustand stores)
- Real-time updates (timer, desktop tracking)
- User input handling (keyboard shortcuts, gestures)

**Implementation:**

```typescript
// app/dashboard/dashboard-client.tsx (Client Component)
'use client';

import { useAppStore } from '@/stores/app-store';
import { motion } from 'framer-motion';

export function DashboardClient({ user }: { user: User }) {
  const currentView = useAppStore((s) => s.currentView);
  // ... interactive logic
}
```

#### 14.2.3 Component Boundary Strategy

The boundary between Server and Client Components follows these rules:

| Rule | Example |
|---|---|
| Fetch data in Server Components | Dashboard page fetches user data server-side |
| Pass data as props to Client Components | `<DashboardClient user={user} />` |
| Keep Client Components as deep as possible | Don't make a whole page a Client Component if only a button needs interactivity |
| Use `Suspense` for async data | Wrap data-dependent components in `<Suspense>` |
| Use `use()` hook for server data | `const data = use(fetchData())` in Client Components |

### 14.3 State Management

#### 14.3.1 Zustand Store Architecture

MindGuard uses Zustand for global state management. The main store is `useAppStore`:

```typescript
// stores/app-store.ts
interface AppState {
  // Navigation
  currentView: AppView;
  setView: (view: AppView) => void;

  // Focus mode
  focusMode: 'idle' | 'running' | 'paused' | 'break';
  setFocusMode: (mode: 'idle' | 'running' | 'paused' | 'break') => void;

  // UI state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Command palette
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;

  // Onboarding
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;

  // User preferences (cached)
  coachPersonality: 'strict' | 'friendly' | 'data_nerd';
  setCoachPersonality: (personality: 'strict' | 'friendly' | 'data_nerd') => void;
}
```

**Zustand patterns used:**

1. **Slice pattern:** Large stores are split into slices for maintainability
2. **Selector pattern:** Components use fine-grained selectors to minimize re-renders
3. **Persisted state:** User preferences are persisted to localStorage
4. **Optimistic updates:** UI updates immediately, with server sync in background

#### 14.3.2 Selector Optimization

Components use fine-grained selectors to prevent unnecessary re-renders:

```typescript
// Bad: subscribes to entire store
const store = useAppStore();

// Good: subscribes only to specific value
const currentView = useAppStore((s) => s.currentView);
const setView = useAppStore((s) => s.setView);
```

### 14.4 CSS Architecture

#### 14.4.1 CSS Grid and Flexbox Strategy

MindGuard uses a combination of CSS Grid and Flexbox:

| Layout Type | Use Case | CSS Method |
|---|---|---|
| Page-level layout | Sidebar + main content | CSS Grid (`grid-template-columns`) |
| Card grid | Dashboard widgets | CSS Grid (`grid-template-columns: repeat(n, 1fr)`) |
| Navigation | Sidebar items, bottom tab bar | Flexbox (`flex-direction: column/row`) |
| Card content | Internal card layout | Flexbox |
| Form layout | Settings, onboarding | CSS Grid (`grid-template-columns: label input`) |
| Modal layout | Modal header + body + footer | Flexbox (`flex-direction: column`) |

**Global CSS variable system (from `globals.css`):**

```css
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --accent: hsl(160 84% 39%);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --ring: hsl(160 84% 39%);
  /* ... more variables */
}

.dark {
  --background: oklch(0.1 0.005 150);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.155 0.003 150);
  --primary: oklch(0.922 0 0);
  --accent: hsl(160 84% 39%);
  --border: oklch(1 0 0 / 8%);
  --ring: hsl(160 84% 39%);
  /* ... more variables */
}
```

#### 14.4.2 Glassmorphism System

MindGuard uses a layered glassmorphism system defined in `globals.css`:

| Class | Use Case | Properties |
|---|---|---|
| `.glass-card` | Content cards | `bg: rgba(255,255,255,0.02)`, `backdrop-filter: blur(24px)`, `border: 1px solid rgba(255,255,255,0.06)` |
| `.glass-card-active` | Selected/active cards | `bg: rgba(255,255,255,0.04)`, `border: 1px solid rgba(16,185,129,0.2)` |
| `.glass-sidebar` | Sidebar | `bg: rgba(9,9,11,0.8)`, `backdrop-filter: blur(20px)` |
| `.glass-header` | Header | `bg: rgba(9,9,11,0.6)`, `backdrop-filter: blur(16px)` |
| `.glass-panel` | Overlays/panels | `bg: rgba(24,24,27,0.7)`, `backdrop-filter: blur(32px)` |
| `.glass-glow-edge` | Hover glow effect | Gradient border on hover |
| `.glass` | Simple glass | `bg: rgba(24,24,27,0.6)`, `backdrop-filter: blur(20px)` |

**Performance guardrails for glassmorphism:**
- Maximum 3 `backdrop-filter` elements per page
- All `backdrop-filter` elements use `will-change: transform` (set by Framer Motion)
- Glassmorphism is disabled on low-end devices (detected via `navigator.hardwareConcurrency`)

### 14.5 Animation System

#### 14.5.1 Framer Motion Architecture

All animations use Framer Motion. The animation system is defined in Section 10 of this document. Key technical notes:

**Page transitions:**

```typescript
<AnimatePresence mode="wait">
  <motion.div
    key={currentView}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
  >
    {renderView(currentView)}
  </motion.div>
</AnimatePresence>
```

**Staggered card entrance:**

```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 25 } },
};
```

**Reduced motion handling:**

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const transition = prefersReducedMotion
  ? { duration: 0 }
  : { type: 'spring', stiffness: 260, damping: 25 };
```

### 14.6 Suspense and Lazy Loading

#### 14.6.1 Suspense Boundaries

Every screen that fetches data is wrapped in a `<Suspense>` boundary with a skeleton fallback:

```typescript
<Suspense fallback={<DashboardSkeleton />}>
  <DashboardContent />
</Suspense>
```

**Skeleton components are defined for every screen:**

| Screen | Skeleton Component | Fallback Content |
|---|---|---|
| Dashboard | `DashboardSkeleton` | Card placeholders with shimmer |
| Focus Timer | `TimerSkeleton` | Circular timer placeholder |
| Missions | `MissionListSkeleton` | Card list placeholders |
| Sessions | `SessionListSkeleton` | Row placeholders |
| Stats | `StatsSkeleton` | Chart placeholders with shimmer |
| Settings | `SettingsSkeleton` | Form field placeholders |
| Onboarding | `OnboardingSkeleton` | Step content placeholder |

#### 14.6.2 Lazy Loading Strategy

Heavy components are lazy-loaded using `next/dynamic`:

```typescript
const CommandPalette = dynamic(() => import('@/components/command-palette'), {
  ssr: false,
  loading: () => null,
});

const AchievementConfetti = dynamic(() => import('@/components/confetti'), {
  ssr: false,
  loading: () => null,
});

const FocusTimer = dynamic(() => import('@/components/focus-timer'), {
  loading: () => <TimerSkeleton />,
});
```

**Components loaded lazily:**

| Component | Reason | Loading Strategy |
|---|---|---|
| Command Palette | Only needed when opened | `ssr: false`, `loading: () => null` |
| Confetti | Heavy animation library | `ssr: false`, `loading: () => null` |
| Chart components | Heavy chart library (Recharts) | `loading: () => <ChartSkeleton />` |
| AI Coach | Depends on API availability | `loading: () => <CoachSkeleton />` |
| Wrapped (year-end) | Very heavy, rarely used | `loading: () => <WrappedSkeleton />` |
| Desktop tracking | Only on Electron | `ssr: false`, `loading: () => null` |

### 14.7 Database Queries

#### 14.7.1 Prisma ORM

MindGuard uses Prisma ORM with PostgreSQL. All database queries are made through Prisma.

**Key models:**

| Model | Purpose | Key Fields |
|---|---|---|
| `User` | User account | `name`, `displayName`, `primaryUse`, `workSchedule`, `biggestDistraction`, `focusGoalMinutes`, `hasAdhd` |
| `UserSettings` | User preferences | `coachPersonality`, `focusGoalMinutes`, `desktopTrackingEnabled`, `customShortcuts`, `notificationsEnabled` |
| `FocusSession` | Focus session records | `userId`, `duration`, `startedAt`, `type`, `quality` |
| `DailyReflection` | Daily reflections | `userId`, `date`, `wentWell`, `distraction`, `tomorrowMission`, `mood`, `energy` |
| `Mission` | User missions | `userId`, `title`, `priority`, `status`, `createdAt`, `completedAt` |
| `DesktopActivity` | Desktop tracking data | `userId`, `application`, `duration`, `type`, `startedAt` |
| `Achievement` | User achievements | `userId`, `type`, `unlockedAt` |

#### 14.7.2 Query Optimization

**Parallel queries in `buildCoachContext()`:**

```typescript
const [
  user,
  userSettings,
  todaySessions,
  yesterdaySessions,
  weekSessions,
  last30Sessions,
  last30Reflections,
  weekMissionsCompleted,
  streak,
  activeMissions,
  todayActivities,
  recentReflection,
] = await Promise.all([
  db.user.findUnique({ ... }),
  db.userSettings.findUnique({ ... }),
  db.focusSession.findMany({ ... }),
  db.focusSession.findMany({ ... }),
  db.focusSession.findMany({ ... }),
  db.focusSession.findMany({ ... }),
  db.dailyReflection.findMany({ ... }),
  db.mission.count({ ... }),
  calculateStreak(userId),
  db.mission.findMany({ ... }),
  db.desktopActivity.findMany({ ... }),
  db.dailyReflection.findFirst({ ... }),
]);
```

**All 12 queries run in parallel** — no sequential awaits. This reduces the total query time from the sum of all queries to the maximum single query time.

**Query constraints:**
- `last30Sessions` is limited to 30 days of data
- `calculateStreak` is limited to 60 days of data
- `activeMissions` is limited to top 5
- `todayActivities` is limited to today only
- `topDistractions` is limited to top 5

**Index requirements:**

| Model | Index | Type | Purpose |
|---|---|---|---|
| `FocusSession` | `userId + startedAt` | Compound | Time-range queries |
| `FocusSession` | `userId + type` | Compound | Filter by session type |
| `DailyReflection` | `userId + date` | Compound | Date-range queries |
| `Mission` | `userId + status` | Compound | Filter by status |
| `DesktopActivity` | `userId + startedAt` | Compound | Time-range queries |
| `DesktopActivity` | `userId + type` | Compound | Filter by activity type |

### 14.8 API Routes

#### 14.8.1 API Route Architecture

All API routes follow the Next.js App Router pattern:

```typescript
// app/api/coach/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { buildCoachContext, buildSystemPrompt } from '@/lib/coach-context';
import { completeAI } from '@/lib/ai-provider';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { message, mode } = await req.json();
  const context = await buildCoachContext(session.user.id);
  const systemPrompt = buildSystemPrompt(context, mode);

  const result = await completeAI({
    provider: context.provider,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ],
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ response: result.content });
}
```

**Key API routes:**

| Route | Method | Purpose | Auth Required |
|---|---|---|---|
| `/api/coach` | POST | AI coach chat | Yes |
| `/api/stats` | GET | Focus statistics | Yes |
| `/api/sessions` | GET | Session history | Yes |
| `/api/sessions` | POST | Create session | Yes |
| `/api/reflections` | GET | Reflection history | Yes |
| `/api/reflections` | POST | Create reflection | Yes |
| `/api/missions` | GET | Mission list | Yes |
| `/api/missions` | POST | Create mission | Yes |
| `/api/missions/[id]` | PATCH | Update mission | Yes |
| `/api/predictions/burnout` | GET | Burnout risk | Yes |
| `/api/predictions/focus-score` | GET | Focus score prediction | Yes |
| `/api/predictions/missions` | GET | Mission completion predictions | Yes |
| `/api/desktop/activity` | POST | Desktop activity data | Yes |
| `/api/auth/*` | Various | NextAuth routes | No |

#### 14.8.2 Error Handling in API Routes

All API routes follow a consistent error handling pattern:

```typescript
try {
  // ... business logic
  return NextResponse.json({ data });
} catch (error) {
  logError('api:route-name', 'Description', error);
  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  );
}
```

**Error response format:**

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {} // Optional, only in development
}
```

### 14.9 Authentication

#### 14.9.1 NextAuth Configuration

MindGuard uses NextAuth.js for authentication:

- **OAuth providers:** Google, GitHub (configured in `[...nextauth].ts`)
- **Session strategy:** JWT (stateless, no server-side session storage)
- **Session duration:** 30 days
- **CSRF protection:** Built-in with NextAuth

**Session data available in Server Components:**

```typescript
const session = await getServerSession();
// session.user.id — used for all database queries
// session.user.email — used for display
// session.user.name — used as fallback for displayName
```

**Session data available in Client Components:**

```typescript
const { data: session } = useSession();
// Same data as Server Components
```

### 14.10 Desktop Sync (Electron)

#### 14.10.1 Desktop Architecture

The MindGuard desktop app is built with Electron and communicates with the web app via:

1. **Shared authentication** — Same NextAuth session
2. **Desktop activity tracking** — Sent to `/api/desktop/activity` endpoint
3. **Real-time sync** — Activity data is sent every 30 seconds during focus sessions
4. **Focus mode** — A minimal always-on-top window with timer display

**Desktop activity data format:**

```typescript
interface DesktopActivity {
  application: string;    // e.g., "Chrome", "VS Code", "Slack"
  title: string;          // Window title
  duration: number;       // Duration in seconds
  type: 'productive' | 'distracted' | 'browsing' | 'entertainment' | 'gaming' | 'communication' | 'system';
  startedAt: Date;
}
```

**Classification logic:**
- Productive: VS Code, Terminal, Xcode, etc. (user-defined + defaults)
- Distracted: YouTube, Twitter, Reddit, etc. (user-defined + defaults)
- Communication: Slack, Email, Teams (neutral)
- System: Finder, Settings, Activity Monitor (excluded from stats)

### 14.11 Performance Optimization

#### 14.11.1 Performance Budgets

| Metric | Budget | Rationale |
|---|---|---|
| First Contentful Paint (FCP) | < 1.5s | User sees content quickly |
| Largest Contentful Paint (LCP) | < 2.5s | Main content loads fast |
| Time to Interactive (TTI) | < 3.5s | User can interact quickly |
| Total Bundle Size | < 300KB (gzipped) | Fast initial load |
| Client-side JS | < 150KB (gzipped) | Minimal client-side code |
| CSS Size | < 50KB (gzipped) | Minimal CSS |
| Image Size | < 100KB per image | Optimized images |
| API Response Time | < 200ms (p95) | Fast API responses |
| Database Query Time | < 100ms (p95) | Fast queries |

#### 14.11.2 Optimization Techniques

| Technique | Implementation | Impact |
|---|---|---|
| Code splitting | `next/dynamic` for heavy components | Reduces initial bundle |
| Image optimization | `next/image` with automatic sizing | Reduces image load time |
| Font optimization | `next/font` with Geist font | No layout shift from fonts |
| Prefetching | Next.js automatic prefetching for links | Instant navigation |
| Caching | SWR/React Query for API data | Reduced API calls |
| Parallel queries | `Promise.all` in database queries | Reduced query time |
| Skeleton loading | Suspense boundaries with skeletons | Perceived performance |
| Virtual scrolling | `react-window` for long lists | Reduced DOM nodes |
| Memoization | `React.memo`, `useMemo`, `useCallback` | Reduced re-renders |
| Zustand selectors | Fine-grained store subscriptions | Reduced re-renders |
| CSS containment | `contain: layout paint` on cards | Reduced paint cost |
| `will-change` | Only on animated elements | GPU-accelerated animations |
| Debounced inputs | `useDeferredValue` for search | Reduced API calls during typing |

#### 14.11.3 Bundle Size Management

| Dependency | Size (gzipped) | Purpose | Lazy-loaded? |
|---|---|---|---|
| `framer-motion` | ~30KB | Animations | No (used everywhere) |
| `recharts` | ~45KB | Charts | Yes |
| `date-fns` | ~15KB (tree-shaken) | Date utilities | No |
| `z-ai-web-dev-sdk` | ~5KB | AI provider | No |
| `@prisma/client` | ~10KB | Database client | No (server-only) |
| `next-auth` | ~15KB | Authentication | No |
| `zustand` | ~2KB | State management | No |
| `cmdk` | ~8KB | Command palette | Yes |

### 14.12 Error Handling

#### 14.12.1 Error Boundary Architecture

MindGuard uses React Error Boundaries at multiple levels:

```
<RootErrorBoundary>          ← Catches all errors, shows full-page error
  <AppShell>
    <ViewErrorBoundary>      ← Catches view-level errors, shows view error
      <WidgetErrorBoundary>  ← Catches widget-level errors, shows widget error
        <Widget />
      </WidgetErrorBoundary>
    </ViewErrorBoundary>
  </AppShell>
</RootErrorBoundary>
```

**Error boundary behavior:**

| Level | Fallback | Recovery |
|---|---|---|
| Root | Full-page error with "Restart" button | Refresh page |
| View | View-level error with "Try again" button | Retry the view |
| Widget | Widget-level error with "Reload" button | Retry the widget |
| Component | Inline error with "Retry" link | Retry the component |

#### 14.12.2 Error Logging

All errors are logged using the `logError()` function:

```typescript
import { logError } from '@/lib/logger';

try {
  // ... risky operation
} catch (error) {
  logError('context', 'description', error);
  // Show user-friendly error
}
```

**Error log structure:**

```typescript
{
  context: string;      // e.g., 'api:coach', 'component:dashboard'
  message: string;      // Human-readable description
  error: unknown;       // Original error object
  timestamp: Date;      // When the error occurred
  userId?: string;      // If available
  metadata?: Record<string, unknown>; // Additional context
}
```

#### 14.12.3 Graceful Degradation for AI Features

When the AI provider fails, the app degrades gracefully:

```typescript
const result = await completeAI(messages);

if (!result.success) {
  // Don't show a technical error to the user
  // Show a friendly message instead
  return {
    response: "I'm having trouble thinking right now. Your focus data is still being tracked, and I'll be back soon!",
    isFallback: true,
  };
}
```

**Degradation levels:**

| AI Feature | Fallback When AI Fails |
|---|---|
| Coach chat | "Coach is temporarily unavailable" message |
| Focus recommendation | Use `getFocusRecommendation()` (pure calculation, no AI) |
| Motivational text | Use `getMotivationalText()` (pure calculation, no AI) |
| Distraction advice | Use `getDistractionAdvice()` (pure calculation, no AI) |
| Morning plan | Show yesterday's data and today's goals without AI narration |
| Evening review | Show today's data without AI narration |

### 14.13 Testing Strategy

#### 14.13.1 Testing Pyramid

| Level | Type | Tool | Coverage Target |
|---|---|---|---|
| Unit | Functions, utilities | Vitest | 80%+ |
| Integration | Component interactions | React Testing Library | 60%+ |
| E2E | User flows | Playwright | Critical paths |
| Visual | UI regression | Chromatic | Key screens |
| Accessibility | A11y compliance | axe-core | 100% |
| Performance | Load times | Lighthouse CI | Score > 90 |

#### 14.13.2 Critical Test Paths

| Path | What to Test | Type |
|---|---|---|
| Onboarding → Dashboard | Full onboarding flow leads to personalized dashboard | E2E |
| Start focus session | Timer starts, duration is recorded, stats update | E2E |
| Daily reflection | Reflection form submits, data is saved | E2E |
| AI coach chat | Message sends, response received, displayed | Integration |
| Dashboard widgets | All widgets render, data is displayed | Integration |
| Personalization | Greeting changes based on time, name, schedule | Unit |
| Focus score | Score calculation matches expected values | Unit |
| Responsive | All screens render correctly at every breakpoint | Visual |
| Accessibility | Keyboard navigation works on all screens | Accessibility |

### 14.14 Deployment

#### 14.14.1 Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│                   Vercel (Primary)                │
│                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │
│  │  Next.js App │  │  API Routes │  │  Auth    │ │
│  │  (SSR/SSG)  │  │  (Serverless│  │  (NextAuth│ │
│  │             │  │   Functions)│  │   JWT)   │ │
│  └──────┬──────┘  └──────┬──────┘  └────┬─────┘ │
│         │                │               │        │
│         └────────────────┼───────────────┘        │
│                          │                        │
│                    ┌─────▼─────┐                   │
│                    │  Prisma   │                   │
│                    │  Accelerate│                   │
│                    │  (Connection│                   │
│                    │   Pooling) │                   │
│                    └─────┬─────┘                   │
│                          │                        │
└──────────────────────────┼────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  PostgreSQL │
                    │  (Supabase) │
                    └─────────────┘
```

#### 14.14.2 Environment Variables

| Variable | Purpose | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | NextAuth JWT secret | Yes |
| `NEXTAUTH_URL` | NextAuth callback URL | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | Yes |
| `GITHUB_CLIENT_ID` | GitHub OAuth | Yes |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth | Yes |
| `OPENAI_API_KEY` | OpenAI provider (optional) | No |
| `DEEPSEEK_API_KEY` | DeepSeek provider (optional) | No |
| `OPENROUTER_API_KEY` | OpenRouter provider (optional) | No |
| `GEMINI_API_KEY` | Gemini provider (optional) | No |
| `ANTHROPIC_API_KEY` | Anthropic provider (optional) | No |
| `OLLAMA_URL` | Ollama self-hosted URL (optional) | No |

#### 14.14.3 Build and Deployment Pipeline

```
Push to main → Lint → Type Check → Unit Tests → Build → Deploy to Vercel (Preview)
                                                                               ↓
PR Merged to main → Lint → Type Check → Unit Tests → E2E Tests → Build → Deploy to Vercel (Production)
```

**Build optimizations:**
- Static pages are pre-rendered at build time (SSG)
- Dynamic pages use ISR (Incremental Static Regeneration)
- API routes are deployed as serverless functions
- Images are optimized via Vercel's Image Optimization
- Fonts are optimized via `next/font`

#### 14.14.4 Desktop App Distribution

The Electron desktop app is distributed via:

1. **GitHub Releases** — Auto-update via `electron-updater`
2. **macOS** — DMG installer + auto-update
3. **Windows** — NSIS installer + auto-update
4. **Linux** — AppImage + auto-update

**Desktop app update flow:**
1. Check for updates on startup
2. Download update in background
3. Prompt user to restart when ready
4. Rollback on failure

### 14.15 Security Considerations

| Area | Measure | Implementation |
|---|---|---|
| Authentication | JWT with rotation | NextAuth with 30-day expiry |
| Authorization | User-scoped queries | All queries include `where: { userId }` |
| SQL injection | Prisma parameterized queries | All queries use Prisma (no raw SQL) |
| XSS | React auto-escaping | No `dangerouslySetInnerHTML` |
| CSRF | NextAuth CSRF tokens | Built-in NextAuth protection |
| Rate limiting | API route rate limiting | `next-rate-limit` or Vercel Edge Middleware |
| Input validation | Zod schemas | All API inputs validated with Zod |
| Data encryption | TLS in transit, encryption at rest | Vercel + Supabase defaults |
| PII handling | Minimal collection, no logging | Only collect what's needed |
| Desktop tracking | User consent required | Explicit opt-in with clear explanation |

### 14.16 Monitoring and Observability

| Metric | Tool | Alert Threshold |
|---|---|---|
| API response time | Vercel Analytics | p95 > 500ms |
| Error rate | Custom logging | > 1% of requests |
| Database query time | Prisma Accelerate | p95 > 200ms |
| Client-side errors | Sentry (if enabled) | Any unhandled error |
| Core Web Vitals | Vercel Analytics | LCP > 2.5s, CLS > 0.1, FID > 100ms |
| AI provider latency | Custom logging | p95 > 3s |
| AI provider error rate | Custom logging | > 5% of requests |

### 14.17 Technical Debt and Future Considerations

| Area | Current State | Future Direction |
|---|---|---|
| Real-time sync | Polling every 30s | WebSocket for real-time updates |
| Offline support | No offline mode | Service Worker + IndexedDB |
| AI provider | Single provider per request | Provider failover chain |
| Desktop tracking | Basic activity classification | ML-based classification |
| Personalization | Rule-based + AI | ML model for personalization |
| Internationalization | English only | i18n support (next-intl) |
| Accessibility testing | Manual + axe-core | Automated CI/CD accessibility testing |
| Performance monitoring | Vercel Analytics | Custom RUM (Real User Monitoring) |
| Error tracking | Custom logging | Sentry integration |
| Mobile app | Web responsive | React Native or Capacitor |

---

*End of Screen Architecture Document — Sections 1-14*
