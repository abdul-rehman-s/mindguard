# MindGuard UX Bible

**Version:** 1.0.0
**Status:** Authoritative — Design Source of Truth
**Last Updated:** 2025-07-18
**Author:** MindGuard Design Team
**Classification:** Internal — Engineering & Design Reference

---

> *"People don't want a productivity app. They want someone who believes in them."*

This document is the single source of truth for every design decision in MindGuard. If code conflicts with this document, the document wins. If this document is wrong, update the document first — then change the code.

---

## Table of Contents

1. [Product Philosophy](#1-product-philosophy)
2. [Core UX Principles](#2-core-ux-principles)
3. [Brand Personality](#3-brand-personality)
4. [AI Coach Personality](#4-ai-coach-personality)
5. [Product Voice & Tone](#5-product-voice--tone)
6. [Emotional Journey](#6-emotional-journey)
7. [User Personas](#7-user-personas)
8. [User Journey](#8-user-journey)
9. [Information Architecture](#9-information-architecture)
10. [Landing Page Experience](#10-landing-page-experience)
11. [Authentication Experience](#11-authentication-experience)
12. [Welcome Experience](#12-welcome-experience)
13. [Onboarding Experience](#13-onboarding-experience)
14. [Dashboard Philosophy](#14-dashboard-philosophy)
15. [Dashboard Layout](#15-dashboard-layout)
16. [Settings Philosophy](#16-settings-philosophy)
17. [AI Personalization](#17-ai-personalization)
18. [Notification Philosophy](#18-notification-philosophy)
19. [Micro-interactions](#19-micro-interactions)
20. [Motion Guidelines](#20-motion-guidelines)
21. [Animation System](#21-animation-system)
22. [Design Tokens](#22-design-tokens)
23. [Typography](#23-typography)
24. [Color Philosophy](#24-color-philosophy)
25. [Iconography](#25-iconography)
26. [Empty States](#26-empty-states)
27. [Error States](#27-error-states)
28. [Success States](#28-success-states)
29. [Loading States](#29-loading-states)
30. [Accessibility Standards](#30-accessibility-standards)
31. [Responsive Behavior](#31-responsive-behavior)
32. [Desktop vs Mobile Experience](#32-desktop-vs-mobile-experience)
33. [AI Conversation Style](#33-ai-conversation-style)
34. [Future Expansion Guidelines](#34-future-expansion-guidelines)
35. [UX Anti-patterns](#35-ux-anti-patterns)
36. [Product Consistency Rules](#36-product-consistency-rules)

---

## 1. Product Philosophy

### Why MindGuard Exists

The world is louder than it has ever been. Notifications, tabs, feeds, and algorithms compete for every millisecond of human attention. Traditional productivity tools respond to this with more features, more dashboards, more data — adding noise instead of reducing it.

MindGuard exists because the problem isn't a lack of tools. The problem is a lack of understanding.

People don't fail at focus because they haven't found the right app. They fail because no tool has ever taken the time to understand *how they work*. Morning people and night owls don't need the same schedule. Developers and designers don't need the same metrics. Someone with ADHD doesn't need the same timer as someone who can sit for three hours straight.

MindGuard is an **AI Productivity Coach** — not another productivity app. The distinction is critical:

| Productivity App | AI Productivity Coach |
|---|---|
| Gives you tools | Understands your patterns |
| Shows you data | Tells you what the data means |
| Treats everyone the same | Adapts to your chronotype, focus style, and goals |
| Adds features when you're stuck | Adjusts its approach when you're stuck |
| You configure it | It configures itself around you |
| Static | Alive |

### The Core Belief

**Every person has a unique rhythm of focus.** MindGuard's job is to discover that rhythm, protect it, and coach the person toward their best work — not by imposing a system, but by adapting to theirs.

### What "Protect Your Attention" Really Means

The tagline "Protect Your Attention" is not a marketing slogan. It is a design constraint. Every feature, every interaction, every pixel must answer this question:

> *"Does this protect the user's attention, or steal it?"*

If a feature adds cognitive load, it fails. If a notification interrupts a focus session, it fails. If a setting requires a blog post to understand, it fails. MindGuard is the anti-attention-economy product — built inside the attention economy.

### The Three Promises

1. **We will learn before we teach.** MindGuard never prescribes a solution before understanding the person. Onboarding is discovery, not configuration.
2. **We will adapt, never force.** If the user works best at 2 AM, the coach adjusts. If 15-minute sessions are their ceiling, the coach starts there. The product bends to the user, never the other way.
3. **We will earn trust, not demand it.** Privacy is not a feature — it's a foundation. Every data point collected must justify its existence. The user always knows what is tracked and can remove anything at any time.

---

## 2. Core UX Principles

### Principle 1: Emotional Design Over Functional Design

People don't remember what an app *did*. They remember how it *made them feel*. MindGuard must feel like a coach who believes in you, not a form that collects your preferences.

**In practice:**
- Headlines use emotional language ("Imagine six months from now...") not functional language ("Select your goals")
- Onboarding feels like a conversation, not a wizard
- Success moments feel earned, not automatic
- The dashboard greeting is warm and personal, not generic

**Violation example:** A headline that says "Configure Your Schedule" is a functional violation. It should say "When are you at your best?"

### Principle 2: Progressive Disclosure

Never show everything at once. The human brain can process 3–4 new pieces of information at a time. MindGuard respects this limit ruthlessly.

**In practice:**
- Onboarding reveals one question at a time
- The dashboard shows the 3 most relevant widgets first, not all 8
- Settings groups are collapsed by default
- Advanced features are hidden behind a "More" affordance
- The AI coach gives one insight at a time, not a wall of text

**Violation example:** Showing all 12 goals at once with a slider, a checkbox grid, and a timer configuration on the same screen.

### Principle 3: Conversation-First

Every interaction should feel like talking to a coach, not filling out a form. If you can imagine a human coach saying it, it belongs. If it sounds like a government form, rewrite it.

**In practice:**
- Questions are phrased as natural language: "What pulls your attention away?" not "Select Distractions"
- Subtext explains *why*: "Pick up to 3. This shapes how your coach works with you."
- The "Continue" button says "Let's Begin" on the first step
- Contextual hints appear at the right moment, not as tooltips you have to hover

**Violation example:** A label that says "focusDurationComfort" or "Select your chronotype preference."

### Principle 4: Premium Feel

MindGuard should feel like a product that costs more than it does. Every pixel should communicate care, craftsmanship, and attention to detail. This is not vanity — it's trust. People trust beautiful things more than ugly things.

**In practice:**
- Glassmorphism cards with subtle inner glows
- Smooth spring animations, never abrupt
- Gradient text for key moments, not everywhere
- Consistent spacing system (never "eyeball it")
- No orphaned 1px borders, no misaligned text, no jarring color jumps

**Violation example:** A button with no hover state, no transition, and a flat color that doesn't match the palette.

### Principle 5: Human Language

Every word in MindGuard should be something a real person would say in a real conversation. No jargon, no developer-ese, no marketing-speak.

**In practice:**
- "Daily focus goal" not "focusGoalMinutes"
- "Night Owl" not "chronotype: night_owl"
- "Short focused sprints" not "pomodoroPreference: 25/5"
- "You've been on a roll!" not "Streak counter: 7"

**Violation example:** Any UI text that matches a database column name.

### Principle 6: Personalization

MindGuard is different for every person. The dashboard, the coach voice, the timer defaults, the notification timing — all of it adapts. This is not a feature. It is the product.

**In practice:**
- Morning people see a sunrise-themed greeting; night owls see a moon-themed one
- The coach's tone matches the personality the user selected
- Widget order is determined by primary use and goals
- Focus duration defaults are calculated from schedule + focus style, not hardcoded
- The ADHD toggle changes the entire coaching cadence

**Violation example:** A hardcoded 25-minute timer for everyone regardless of their focus style.

### Principle 7: Trust Through Transparency

Users should never wonder what MindGuard is doing with their data. Trust is earned through clarity, not through legal documents buried in a footer.

**In practice:**
- Privacy information is shown during onboarding, not hidden in settings
- Every toggle clearly explains what it does and what it doesn't
- The "What IS tracked" and "What is NOT tracked" lists are explicit
- Data export and deletion are one-click, not a support ticket
- The AI coach never accesses data the user hasn't explicitly enabled

**Violation example:** A vague "We may collect data to improve your experience" with no specifics.

### Principle 8: Accessibility Is Not Optional

MindGuard is for everyone. Accessibility is not a ticket in the backlog. It is a design principle that affects every decision from color contrast to animation timing to keyboard navigation.

**In practice:**
- All interactive elements are keyboard-navigable
- Focus rings are visible and styled (emerald, not default blue)
- All images and icons have alt text or aria-labels
- Color is never the sole indicator of state — always pair with icon or text
- Reduced motion is respected globally
- Screen reader announcements for dynamic content (aria-live regions)

**Violation example:** A card that only uses color to indicate "selected" state with no visual indicator for color-blind users.

---

## 3. Brand Personality

MindGuard's brand personality is defined by five traits. Every piece of content, every interaction, every animation should express at least one of these traits.

### Trait 1: Wise — Not Preachy

MindGuard knows things. It understands focus, productivity, and human behavior. But it shares that knowledge like a mentor, not a lecturer. It asks questions before giving answers. It suggests, never commands (unless you chose the Accountability Coach).

**How it shows up:**
- "Your focus score is up 12% this week. That's not random — you've been consistent with morning sessions." (Data-Driven Coach)
- "You've been starting strong and fading by afternoon. What if we moved your hardest task to the morning?" (Supportive Coach)

**How it doesn't:**
- "Research shows that morning focus sessions are 23% more effective. You should schedule accordingly."

### Trait 2: Warm — Not Saccharine

MindGuard cares about the person using it. It celebrates their wins, acknowledges their struggles, and never makes them feel judged. But warmth is not the same as being overly sweet. It's genuine, not performative.

**How it shows up:**
- "You showed up today. That matters."
- "Three-day streak! Consistency is your superpower."

**How it doesn't:**
- "AMAZING! You're INCREDIBLE! 🎉🎉🎉 Keep being your FABULOUS self!!!"

### Trait 3: Calm — Not Passive

MindGuard is a calm presence in a noisy world. It doesn't panic when you miss a day. It doesn't celebrate so loudly that it becomes distracting. It's the stillness at the center of a storm. But calm is not passive — it still holds you accountable, still nudges you forward.

**How it shows up:**
- Gentle transitions instead of jarring page changes
- Muted color palette with emerald accents, not neon explosions
- Notifications that arrive at the right time, not constantly
- Error messages that reassure, not blame

**How it doesn't:**
- "You missed your focus goal today. No worries, everything is fine, don't worry about it, it's totally fine! 😊"

### Trait 4: Sharp — Not Cold

MindGuard is precise. It uses data well. It gives clear, actionable advice. It doesn't waste time. But sharp is not cold — it's efficient with warmth. Like a surgeon who explains what they're doing while they operate.

**How it shows up:**
- "45 minutes of deep work today. That's 15 more than yesterday." (Data-Driven Coach)
- "You've been on a 3-day streak. One more session today and you'll hit your weekly goal." (Accountability Coach)

**How it doesn't:**
- "Focus session completed. Duration: 45m. Score: 78. Goal: 120m. Remaining: 75m."

### Trait 5: Protective — Not Controlling

MindGuard protects your attention. That's the core promise. But protection is not control. It blocks distractions you've asked it to block, but it doesn't judge. It suggests focus sessions, but it doesn't force them. It's a guardian, not a warden.

**How it shows up:**
- "You've been on YouTube for 20 minutes. Want to start a focus session instead?" (Not: "YouTube has been blocked. You have been unproductive.")
- "Your next focus session starts in 5 minutes. Time to wrap up." (Not: "Focus session starting NOW. All other apps closed.")

**How it doesn't:**
- "You have exceeded your daily limit for social media. Access denied."

---

## 4. AI Coach Personality

MindGuard offers three coach personalities. Each one is a complete character with its own voice, tone, and behavioral patterns. The user selects their coach during onboarding (Screen 5), and the coach personality affects every subsequent interaction.

### The Accountability Coach (strict)

**Archetype:** The personal trainer who won't let you skip leg day.

**Voice:**
- Direct, no-nonsense
- Uses facts and commitments
- Short sentences, no filler
- Occasionally confrontational (in a productive way)

**Sample phrases:**

| Situation | What the Accountability Coach says |
|---|---|
| Morning greeting | "Good morning. You committed to 2 hours of focus today. Let's get started." |
| Streak building | "5-day streak. Don't break it now." |
| Missed goal | "You fell short by 30 minutes today. What happened? Let's fix it tomorrow." |
| Distraction detected | "You've been off-task for 15 minutes. Get back to work." |
| Achievement unlocked | "You earned it. Now let's raise the bar." |
| End of day | "You hit your goal. That's what discipline looks like." |

**What they never say:**
- "That's okay, you can try again tomorrow!" (too soft)
- "You might want to consider perhaps thinking about maybe starting a session." (too tentative)

### The Supportive Coach (friendly)

**Archetype:** The friend who believes in you even when you don't believe in yourself.

**Voice:**
- Warm, encouraging
- Acknowledges effort, not just results
- Uses "we" and "you" language
- Celebrates small wins

**Sample phrases:**

| Situation | What the Supportive Coach says |
|---|---|
| Morning greeting | "Good morning! You've been on a roll this week. Let's keep that momentum going." |
| Streak building | "3 days and counting! You're building something real here." |
| Missed goal | "You showed up today, and that's what matters. Tomorrow, we go a little further." |
| Distraction detected | "Hey, it looks like you drifted a bit. No judgment — want to start a short session?" |
| Achievement unlocked | "You did it! That took real effort. Take a moment to feel good about this." |
| End of day | "You put in solid work today. Rest well — you've earned it." |

**What they never say:**
- "You failed to meet your goal." (too harsh)
- "Your focus score is 34th percentile." (too data-centric)

### The Data-Driven Coach (data_nerd)

**Archetype:** The analyst who shows you the pattern you couldn't see yourself.

**Voice:**
- Evidence-based, quantitative
- Draws connections between data points
- Uses percentages, trends, and comparisons
- Never makes a claim without data

**Sample phrases:**

| Situation | What the Data-Driven Coach says |
|---|---|
| Morning greeting | "Good morning. Your focus score averaged 72 this week — up 8% from last week." |
| Streak building | "7-day streak. You've logged focus sessions on 100% of the last 7 days." |
| Missed goal | "You completed 67% of your focus goal today. Your average completion rate is 84% — this is a minor dip." |
| Distraction detected | "YouTube usage increased 40% this session compared to your average. Want to set a block schedule?" |
| Achievement unlocked | "Focus score: 85. That's your personal best. The trend is positive." |
| End of day | "2h 15m of focus today. Your 7-day average is 2h 03m. Trending upward." |

**What they never say:**
- "You're doing great!" (too vague)
- "Don't worry about it." (too dismissive of data)

### Coach Personality → Motivation Style Mapping

The motivation style sub-question is removed from onboarding. Instead, it is inferred from the coach personality:

| Coach Personality | Inferred Motivation Style |
|---|---|
| Accountability (strict) | Gamification — achievements, streaks, XP are accountability tools |
| Supportive (friendly) | Balanced — some gamification, but not overwhelming |
| Data-Driven (data_nerd) | Minimalist — the data IS the motivation; no extra chrome needed |

This mapping is the default. Users can change their motivation style later in Settings, but we don't ask during onboarding because it's one more question that most people can't answer meaningfully until they've lived with the product.

---

## 5. Product Voice & Tone

### Writing Guidelines

MindGuard's voice is consistent. Its tone varies by context. The voice is the personality; the tone is the mood.

**Voice:**
- Wise, warm, calm, sharp, protective
- First person plural ("we") when referring to MindGuard
- Second person ("you") when addressing the user
- Active voice, not passive
- Short sentences for impact, longer ones for explanation

**Tone shifts by context:**

| Context | Tone | Example |
|---|---|---|
| Onboarding | Curious, inviting | "Let's build your personal productivity coach." |
| Dashboard greeting | Warm, personal | "Good morning, Alex. Ready to focus?" |
| Focus session | Calm, supportive | "Stay in the zone. You've got this." |
| Achievement | Celebratory, measured | "5-day streak! Consistency is your superpower." |
| Error | Reassuring, helpful | "Something went wrong. Your data is safe — let's try again." |
| Privacy | Clear, direct | "We never sell your data. Period." |
| Empty state | Encouraging, not guilt-tripping | "Your first mission awaits. What will you focus on?" |

### Dos and Don'ts

| Do | Don't |
|---|---|
| "Pick up to 3" | "Select up to 3 items from the list below" |
| "What pulls your attention away?" | "Select your primary distractions" |
| "Imagine six months from now..." | "What do you want to improve?" |
| "About 2 minutes. Everything stays private." | "Estimated completion time: 2 minutes. Data privacy policy applies." |
| "You showed up today. That matters." | "Daily login recorded." |
| "Let's Begin" | "Proceed to Step 1" |
| "Almost there! One more focused session." | "You are 80% towards your daily focus goal." |
| "Your first mission awaits" | "No missions found. Create one." |
| "Something went wrong" | "Error 500: Internal Server Error" |
| "Setting up your coach..." | "Processing..." |

### Microcopy Reference

These are the standard phrases used across the product. Do not invent new phrases for situations that already have a standard phrase.

**Navigation:**
- Continue → `Continue`
- First step → `Let's Begin`
- Back → `Back`
- Skip → `Skip` (only on optional steps)
- Final step → `Launch Dashboard`

**Progress:**
- Step counter → Do NOT show step numbers (e.g., "3/8"). Show only the progress bar with contextual messages.
- Progress messages → See Section 13 for the complete list.

**Actions:**
- Save → `Save` (not "Save Changes" or "Update")
- Delete → `Delete` (with confirmation: "This can't be undone.")
- Cancel → `Cancel`
- Start focus → `Start Focus`
- Start session → `Start Session`

**Time:**
- Duration display → `1h 30m` (not "90m" or "1.5h" or "90 minutes")
- Short duration → `25m` (not "0h 25m")
- Relative time → `2 hours ago`, `Yesterday`, `3 days ago`

---

## 6. Emotional Journey

### The Arc

MindGuard's user experience follows a deliberate emotional arc. Every interaction is designed to move the user along this arc.

```
Curiosity → Trust → Discovery → Momentum → Mastery → Belonging
```

**Phase 1: Curiosity** (Landing page → Sign up)
- The user is skeptical. They've tried productivity apps before.
- MindGuard must feel different immediately.
- The landing page should feel like a promise, not a pitch.

**Phase 2: Trust** (Onboarding)
- The user is sharing personal information. They need to feel safe.
- Privacy commitment is stated early and clearly.
- The coach is introduced as a partner, not a tool.
- "About 2 minutes. Everything stays private." — this one line builds more trust than any privacy policy.

**Phase 3: Discovery** (First week)
- The user is learning what MindGuard can do for them.
- The dashboard is personalized from the first visit.
- The AI coach gives its first recommendations.
- The first focus session is a revelation — the timer actually fits their style.

**Phase 4: Momentum** (Week 2–4)
- The user is building a streak. They're seeing their heatmap fill up.
- Achievements unlock. The XP system rewards consistency.
- The coach starts giving deeper insights: "Your best focus time is between 9–11 AM."
- The product feels like it's growing with them.

**Phase 5: Mastery** (Month 2+)
- The user has internalized their rhythm. They don't need the coach as much, but they still want it.
- The dashboard is a reflection of their progress.
- The weekly review shows patterns they wouldn't have noticed.
- They start recommending MindGuard to friends.

**Phase 6: Belonging** (Ongoing)
- The user identifies as someone who uses MindGuard.
- "Wrapped" and monthly reports become events they look forward to.
- The product is part of their identity, not just their workflow.

### Emotional Pitfalls to Avoid

| Pitfall | What it feels like | How to avoid it |
|---|---|---|
| Overwhelm | "Too many options, too many screens" | Progressive disclosure, smart defaults |
| Guilt | "I missed a day and now the app is judging me" | Never shame. Acknowledge, reframe, move forward. |
| Abandonment | "I stopped using it and now it feels like starting over" | "Welcome back" state, not "You've been gone for 7 days" |
| Surveillance | "Is this app watching everything I do?" | Transparent tracking, clear opt-in/out, privacy section |
| Generic | "This could be any productivity app" | Personalization from minute one, coach voice, adaptive UI |

---

## 7. User Personas

### Persona 1: Sarah — The Overwhelmed Student

**Demographics:**
- Age: 21
- Role: University student, pre-med
- Device: Laptop + phone
- Schedule: Chaotic — classes at random times, studies late at night

**Goals:**
- Pass exams without burning out
- Build a study routine that actually sticks
- Stop doomscrolling during study sessions

**Frustrations:**
- Every productivity app assumes she has a 9-to-5 schedule
- Pomodoro timers feel too rigid — 25 minutes is either too short or too long
- She's tried 5 apps and none of them "got" her
- She has ADHD tendencies but hasn't been diagnosed

**How MindGuard helps:**
- Night owl detection: The coach doesn't suggest 6 AM sessions
- ADHD mode: Shorter sessions, gentler nudges, more frequent breaks
- Distraction-specific advice: "Social media pulling you away? Try scheduling 10-min social breaks after each focus session."
- Exam preparation mode: The coach knows her exams are coming and adjusts intensity

**Coach match:** Supportive Coach (friendly) — she needs encouragement, not pressure

**Onboarding answers:**
- Aspirations: Studying, Exam preparation, Managing ADHD
- Schedule: Night Owl
- Focus style: 15–30 min, Short sprints, ADHD toggle on
- Coach: Supportive
- Distractions: Instagram, TikTok, YouTube
- Goals: Better Grades, Exam Prep, Better Habits

---

### Persona 2: Marcus — The Deep Work Developer

**Demographics:**
- Age: 32
- Role: Senior software engineer
- Device: Desktop (MacBook Pro) + external monitor
- Schedule: Morning person, starts at 7 AM, deep work until noon

**Goals:**
- Protect his deep work blocks from meetings and Slack
- Hit 3+ hours of deep work daily
- Track his focus patterns over time
- Ship a side project

**Frustrations:**
- Meetings fragment his focus blocks
- Slack notifications are constant
- He knows he's productive but can't prove it to himself
- He wants data, not motivational quotes

**How MindGuard helps:**
- Desktop integration: Tracks app usage, identifies distraction patterns automatically
- Data-Driven Coach: Gives him metrics, trends, and insights
- Focus protection: Blocks Slack during deep work sessions
- Timeline view: Shows him exactly where his time went
- Deep work sessions: 90-minute blocks with ambient sound

**Coach match:** Data-Driven Coach (data_nerd) — he wants evidence, not cheerleading

**Onboarding answers:**
- Aspirations: Coding, Running a business
- Schedule: Morning Person
- Focus style: 90+ min, Deep uninterrupted work
- Coach: Data-Driven
- Distractions: Slack, Email, Meetings
- Goals: Deep Work, Career Growth, Productivity

---

### Persona 3: Priya — The Freelancer Juggling Everything

**Demographics:**
- Age: 28
- Role: Freelance graphic designer
- Device: iPad Pro + laptop
- Schedule: Flexible — works when inspiration strikes, sometimes 10 AM, sometimes 10 PM

**Goals:**
- Deliver client work on time without all-nighters
- Build a creative routine that doesn't kill inspiration
- Reduce the "I should be working" anxiety during off hours

**Frustrations:**
- No structure means no boundaries — work bleeds into life
- She can focus for hours when inspired, but can't start when she's not
- Client deadlines create panic cycles
- She feels guilty when she's not working, even during rest

**How MindGuard helps:**
- Flexible schedule: The coach works with her rhythm, not against it
- Accountability Coach: Keeps her on track with deadlines without being harsh
- Mission system: Breaks client work into manageable missions
- Focus protection: Blocks creative-app distractions (Pinterest, Dribbble rabbit holes)
- Evening review: Helps her close the work day mentally, reducing guilt

**Coach match:** Accountability Coach (strict) — she needs external accountability

**Onboarding answers:**
- Aspirations: Freelancing, Design/Creative work
- Schedule: Flexible Schedule
- Focus style: It depends, Mix of both
- Coach: Accountability
- Distractions: Chrome, Pinterest, Phone
- Goals: Creative Projects, Productivity, Healthy Routine

---

### Persona 4: Jordan — The ADHD Professional

**Demographics:**
- Age: 26
- Role: Marketing coordinator
- Device: Work laptop + phone
- Schedule: Variable — some days are 9-to-5, some are chaotic

**Goals:**
- Manage ADHD without feeling broken
- Get through the workday without hyperfocusing on the wrong things
- Build systems that compensate for executive dysfunction

**Frustrations:**
- Most apps assume you can just "start a timer" — they don't understand task initiation
- Pomodoro is too rigid, but unstructured time is worse
- She hyperfocuses on the wrong things (Reddit for 3 hours) and can't start the right things
- She's been told to "just be more organized" more times than she can count

**How MindGuard helps:**
- ADHD mode: Shorter sessions, gentler transitions, more frequent check-ins
- Distraction-specific advice that actually works for ADHD brains
- The coach initiates sessions ("Ready to start?") instead of waiting for Jordan to find the button
- Achievement system provides dopamine hits that ADHD brains need
- The "5-minute start" — a tiny session that's easier to start than a full one

**Coach match:** Supportive Coach (friendly) — she needs encouragement, not pressure

**Onboarding answers:**
- Aspirations: Managing ADHD, Work productivity
- Schedule: Variable Schedule
- Focus style: 15 min, Short sprints, ADHD toggle on
- Coach: Supportive
- Distractions: Reddit, Phone, Procrastination, Overthinking
- Goals: Better Habits, Mental Clarity, Productivity

---

## 8. User Journey

### Complete Journey Map

```
Landing Page → Sign Up → Onboarding → Dashboard → Daily Use → Mastery
```

#### Stage 1: Landing Page (0–2 minutes)

**User mindset:** "Another productivity app? Let me see if this is different."

**What they see:**
- A bold, clear value proposition: "Your AI Productivity Coach"
- Social proof: testimonials, user count
- The shield logo — protection, not productivity
- A single CTA: "Get Started Free"

**What they feel:**
- Intrigue — this doesn't look like the other apps
- Safety — the privacy messaging is prominent
- Simplicity — there's only one thing to do

**Exit criteria:** Clicks "Get Started Free" or "Sign In"

---

#### Stage 2: Authentication (30 seconds)

**User mindset:** "Let me just get in quickly."

**What they see:**
- Clean sign-up form with email + password
- Google OAuth option
- No terms of service wall — just a small link

**What they feel:**
- Speed — this is fast
- No friction — no email verification loop, no CAPTCHA

**Exit criteria:** Account created, redirected to onboarding

---

#### Stage 3: Onboarding (2 minutes)

**User mindset:** "Okay, show me what you've got."

**What they see:**
- 8 screens that feel like a conversation
- Emotional headlines, not form labels
- Their coach personality preview
- A personalized summary at the end

**What they feel:**
- "This app is different" — it's asking questions, not making me fill forms
- "This is about me" — the questions are personal, not generic
- Trust — the privacy commitment is clear
- Excitement — "My coach is ready!"

**Exit criteria:** Clicks "Launch Dashboard"

---

#### Stage 4: First Dashboard (30 seconds)

**User mindset:** "Wow, this is actually personalized."

**What they see:**
- A greeting with their name
- Widgets that match their goals
- Their first mission, pre-created from onboarding answers
- The AI coach's first message

**What they feel:**
- "This is mine" — the dashboard reflects their choices
- "I can start now" — there's a clear first action
- "This is beautiful" — the glassmorphism and animations feel premium

**Exit criteria:** Starts first focus session or creates a mission

---

#### Stage 5: Daily Use (Week 1–4)

**User mindset:** "Let me check in, do my session, see my progress."

**What they see:**
- Personalized greeting that changes with time of day
- Focus score and streak
- Heatmap showing their activity
- AI coach insights and recommendations
- Mission status

**What they feel:**
- Rhythm — the product fits their schedule
- Progress — the heatmap fills, the streak grows
- Support — the coach is there, not nagging
- Ownership — they're in control

**Exit criteria:** Continues daily use or lapses

---

#### Stage 6: Mastery (Month 2+)

**User mindset:** "I know my rhythm now. MindGuard is my co-pilot."

**What they see:**
- Weekly and monthly reports
- Deep insights from the AI coach
- Achievement milestones
- Wrapped — a celebration of their year

**What they feel:**
- Pride — they've built something real
- Belonging — they're part of the MindGuard community
- Loyalty — they can't imagine going back
- Advocacy — they tell their friends

---

## 9. Information Architecture

### Navigation Structure

```
MindGuard
├── Dashboard          ← Home base, personalized greeting, widgets
├── Assistant          ← AI chat, morning plan, evening review
├── Missions           ← Active and completed missions
├── Timer              ← Focus session timer, focus mode
├── Life               ← Life dashboard, heatmap, long-term view
├── Habits             ← Habit tracker
├── Sessions           ← Session history
├── Stats              ← Focus statistics, charts, trends
├── Reflection         ← Daily reflection, journaling
├── Review             ← Weekly/monthly review
├── Wrapped            ← Year-end celebration
├── Monthly            ← Monthly report
├── Replay             ← Session replay
├── Settings           ← All settings
└── Command Palette    ← ⌘K / Ctrl+K
```

### Sidebar Architecture

The sidebar is always visible on desktop (collapsible) and accessible via hamburger on mobile.

**Primary navigation (always visible):**
1. Dashboard
2. Assistant
3. Missions
4. Timer

**Secondary navigation (below a divider):**
5. Life
6. Habits
7. Sessions
8. Stats

**Tertiary (in Settings or accessed via Command Palette):**
- Reflection
- Review
- Wrapped
- Monthly
- Replay

### Deep Linking

Every view has a unique URL. The Command Palette can navigate to any view. Deep links are shareable.

---

## 10. Landing Page Experience

### What It Should Feel Like

The landing page should feel like walking into a calm, beautifully designed room after being in a noisy crowd. The user arrives with skepticism and leaves with curiosity.

### Structure

1. **Hero Section** — Full-viewport, dark background with subtle emerald glow
   - Headline: "Your AI Productivity Coach" (gradient text)
   - Subtitle: "MindGuard learns how you work, what distracts you, and when you're at your best — then coaches you accordingly."
   - CTA: "Get Started Free" (emerald gradient button)
   - Secondary CTA: "See how it works" (ghost button)
   - Shield logo with premium animation

2. **Social Proof Section** — Trust signals
   - "Join 10,000+ people who've reclaimed their focus"
   - Three testimonial cards with avatars
   - Star rating

3. **How It Works** — Three-step explanation
   - Step 1: "Tell us about you" — 2-minute onboarding
   - Step 2: "Meet your coach" — Personalized AI coach
   - Step 3: "Protect your focus" — Smart timers, distraction blocking

4. **Feature Grid** — Key features with Lucide icons
   - Mission System (Target icon)
   - Smart Timer (Timer icon)
   - AI Coach (Sparkles icon)
   - Privacy Shield (Shield icon)
   - Cross-Device Sync (Monitor icon)
   - Focus Insights (BarChart3 icon)

5. **Privacy Section** — Explicit trust building
   - "Your data stays on your device"
   - "You control what gets tracked"
   - "Export or delete anytime"

6. **CTA Section** — Final push
   - "Ready to meet your coach?"
   - "Get Started Free" button

7. **Footer** — Minimal
   - Logo, links, copyright

### Design Specifications

- **Background:** `bg-zinc-950` with subtle emerald glow (`bg-emerald-500/[0.04]` blur)
- **Cards:** Glassmorphism (`.glass-card`)
- **Headlines:** Gradient text (`.gradient-text`)
- **Feature icons:** Lucide icons, 48px, emerald-400
- **Animations:** Stagger reveal on scroll, fade-in-up for sections
- **Auth form:** Integrated into the hero section (no separate page), smooth toggle between sign-up and sign-in

---

## 11. Authentication Experience

### Design Principles

- **Frictionless:** No email verification, no CAPTCHA, no multi-step forms
- **Integrated:** The sign-up form is part of the landing page, not a separate route
- **Fast:** The entire auth flow should take under 30 seconds
- **Reassuring:** No password requirements listed during sign-up (validate silently)

### Sign Up Flow

1. User clicks "Get Started Free" on the landing page
2. The hero section smoothly reveals the sign-up form (no page navigation)
3. Fields: Email, Password, Confirm Password
4. Google OAuth button below
5. Small link: "Already have an account? Sign in"
6. On submit: account created, redirected to onboarding

### Sign In Flow

1. User clicks "Sign In" in the header or toggles the form
2. Fields: Email, Password
3. Google OAuth button
4. "Forgot password?" link
5. On submit: authenticated, redirected to dashboard (or onboarding if not completed)

### Validation

- **Email:** Real-time validation, show error only after blur
- **Password:** Minimum 8 characters, validate on submit
- **Error messages:** "That email doesn't look right" (not "Invalid email format")
- **Success:** No success message — just redirect. Speed is the feedback.

### Security

- Passwords are hashed with bcrypt
- NextAuth handles session management
- CSRF protection on all forms
- Rate limiting on auth endpoints

---

## 12. Welcome Experience

### The First Screen After Auth

The welcome experience is the first screen of onboarding (Screen 0). It should feel like meeting someone for the first time — warm, brief, and promising.

### Design

- **Centered layout** on a dark background with subtle emerald glow
- **MindGuard Hero Logo** at the top
- **Shield icon** with premium spring animation (scale from 0.6 → 1)
- **Headline:** "Let's build your personal productivity coach." (gradient text on "productivity coach")
- **Subtitle:** "MindGuard learns how you work, what distracts you, and when you're at your best — then coaches you accordingly."
- **Privacy commitment:** "About 2 minutes. Everything stays private."
- **Personalization preview:** A small card showing what will be personalized:
  - Coaching style
  - Focus timers
  - Dashboard layout
  - Daily nudges
- **CTA:** "Let's Begin" (emerald gradient button)

### What Makes This Different

The welcome screen is NOT a form. It's a promise. It tells the user:
1. What will happen (2 minutes of questions)
2. What they'll get (a personalized coach)
3. What they won't sacrifice (privacy)

---

## 13. Onboarding Experience

### The Problem with the Current Flow

The current 11-screen onboarding has these issues:
1. **Too many screens** — 11 screens feel like a form, not a conversation
2. **Redundant steps** — Role is already implied by Aspirations
3. **Unnecessary questions** — Motivation style can be inferred from coach personality
4. **Read-only steps** — Privacy is informational and doesn't need its own screen
5. **Complexity** — The daily focus goal slider adds cognitive load for a value that can be smart-defaulted
6. **Emoji icons** — Should use Lucide throughout for consistency
7. **Functional headlines** — "What do you want to improve?" is functional, not emotional

### The New 8-Screen Flow

The redesigned onboarding reduces from 11 to 8 screens by merging, removing, and inferring.

#### Screen 1: Welcome

**Purpose:** Emotional opening, set expectations

**Headline:** "Let's build your personal productivity coach." (gradient text)

**Subtext:** "MindGuard learns how you work, what distracts you, and when you're at your best — then coaches you accordingly."

**Privacy line:** "About 2 minutes. Everything stays private."

**Personalization preview card:**
- Coaching style · Focus timers · Dashboard layout · Daily nudges

**CTA:** "Let's Begin"

**Data collected:** None

---

#### Screen 2: Aspirations

**Purpose:** Understand what the user wants to improve (merges "Improve" and "Role")

**Headline:** "Imagine six months from now..."

**Subtext:** "Pick up to 3. This shapes how your coach works with you."

**Options:** 14 items in a 2-column grid (mobile: 2-col, desktop: 3-col)

| ID | Label | Lucide Icon |
|---|---|---|
| study | Studying | BookOpen |
| programming | Coding | Code2 |
| university | University work | GraduationCap |
| school | School work | School |
| business | Running a business | Briefcase |
| freelancing | Freelancing | Rocket |
| writing | Writing | PenLine |
| reading | Reading more | BookText |
| gaming_addiction | Reducing gaming | Gamepad2 |
| social_media_addiction | Less social media | Smartphone |
| adhd_support | Managing ADHD | Brain |
| research | Research & analysis | Microscope |
| exam_preparation | Exam preparation | FileText |
| other | Something else | Sparkles |

**Selection behavior:** Multi-select, max 3. Selected items show a spring-animated check badge. When max is reached, unselected items dim.

**"Other" text input:** When "Something else" is selected, a textarea appears with label "Tell us in your own words" and placeholder "What are you working on improving?"

**Role inference:** The role is inferred from the primary aspiration:
- `study`, `university`, `school`, `exam_preparation` → student
- `programming` → developer
- `freelancing` → freelancer
- `business` → founder
- `writing` → writer
- `research` → researcher

This eliminates the need for a separate Role screen.

**Data collected:** `primaryUse`, `otherImproveText`, inferred `role`

---

#### Screen 3: Schedule

**Purpose:** Understand the user's natural rhythm

**Headline:** "When are you at your best?"

**Subtext:** "Your coach will adapt to your natural rhythm, not fight it."

**Schedule type selection** (4 options in a 2x2 grid):

| ID | Label | Lucide Icon |
|---|---|---|
| morning_person | Morning Person | Sun |
| night_owl | Night Owl | Moon |
| flexible_schedule | Flexible Schedule | Sunset |
| changes_frequently | It Changes | Clock |

**Sleep range** (appears below, 5 options in a horizontal list):

| ID | Label |
|---|---|
| before_midnight | Before midnight |
| 12_2am | 12–2 AM |
| 2_4am | 2–4 AM |
| after_4am | After 4 AM |
| varies | It varies |

**Data collected:** `scheduleType`, `sleepRange`

**Derived fields:** `chronotype`, `workSchedule` (mapped from scheduleType)

---

#### Screen 4: Focus Style

**Purpose:** Understand how the user focuses (merges ADHD toggle, focus duration, and work style)

**Headline:** "How do you focus best?"

**Subtext:** "There's no wrong answer. This sets your timer defaults and break schedule."

**ADHD toggle** (prominent, at the top):

```
[Brain icon] "I have ADHD or trouble focusing"
Toggle switch
Subtext: "We'll adapt your sessions, breaks, and nudges for you."
```

**Focus duration** (6 options in a 2x3 grid):

| ID | Label |
|---|---|
| 15min | About 15 minutes |
| 30min | About 30 minutes |
| 45min | About 45 minutes |
| about_an_hour | About an hour |
| 90_plus | 90 minutes or more |
| it_depends | It really depends |

**Work style** (3 options in a row):

| ID | Label | Lucide Icon |
|---|---|---|
| short_sprints | Short Focused Sprints | Zap |
| deep_uninterrupted | Deep Uninterrupted Work | Brain |
| mix_both | A Mix of Both | Scale |

**Data collected:** `hasAdhd`, `focusDurationComfort`, `workStylePreference`

**Derived fields:** `focusStyle`, `pomodoroPreference`, `deepWorkDuration`, `preferredSchedule`, `focusGoalMinutes` (smart default)

**Smart default for focus goal:** The daily focus goal is auto-calculated from schedule + focus duration + work style:

| Schedule | Focus Duration | Work Style | Default Goal |
|---|---|---|---|
| Morning Person | 90+ min | Deep work | 180m (3h) |
| Night Owl | 45 min | Short sprints | 90m (1.5h) |
| Flexible | About an hour | Mix | 120m (2h) |
| Variable | It depends | Mix | 90m (1.5h) |
| Any | 15 min | Any | 45m |
| Any | 30 min | Short sprints | 60m (1h) |

The slider is removed from onboarding. Users can adjust their focus goal in Settings later.

---

#### Screen 5: Coach Personality

**Purpose:** Choose the AI coach type (merges "Motivation" — removes motivation style sub-question)

**Headline:** "How should your coach talk to you?"

**Subtext:** "Pick the style that resonates most. You can always change it later."

**Three coach options** (full-width cards, not a grid):

| ID | Label | Description | Lucide Icon | Preview Quote |
|---|---|---|---|---|
| strict | Accountability Coach | Tough accountability, no excuses | Trophy | "No excuses today. Let's get it done." |
| friendly | Supportive Coach | Warm encouragement, gentle nudges | Smile | "You're doing great! Keep going." |
| data_nerd | Data-Driven Coach | Charts, metrics, and insights | BarChart3 | "Your focus score is up 12% this week." |

**When selected:** The preview quote appears in a subtle card on the right side (desktop) or below (mobile).

**Motivation style is inferred:**

| Coach | Inferred Motivation |
|---|---|
| strict | gamification |
| friendly | balanced |
| data_nerd | minimalist |

**Data collected:** `coachPersonality`

**Derived fields:** `motivationStyle` (inferred from coachPersonality)

---

#### Screen 6: Distractions

**Purpose:** Identify and rank what pulls the user's attention away

**Headline:** "What pulls your attention away?"

**Subtext:** "Tap all that apply. Then tap your top 3 in order — first tap is #1."

**Distraction grid** (22 items in a responsive grid, 4–5 columns on desktop):

| ID | Label | SVG Icon | Color |
|---|---|---|---|
| instagram | Instagram | InstagramIcon | pink-400 |
| youtube | YouTube | YouTubeIcon | red-400 |
| tiktok | TikTok | TikTokIcon | cyan-400 |
| discord | Discord | DiscordIcon | indigo-400 |
| facebook | Facebook | FacebookIcon | blue-400 |
| reddit | Reddit | RedditIcon | orange-400 |
| twitter | X / Twitter | XIcon | zinc-300 |
| slack | Slack | SlackIcon | purple-400 |
| whatsapp | WhatsApp | WhatsAppIcon | green-400 |
| linkedin | LinkedIn | LinkedInIcon | sky-400 |
| spotify | Spotify | SpotifyIcon | green-400 |
| netflix | Netflix | NetflixIcon | red-400 |
| steam | Steam | SteamIcon | gray-400 |
| chrome | Chrome | ChromeIcon | yellow-400 |
| vscode | VS Code | VSCodeIcon | blue-400 |
| email | Email | EmailIcon | zinc-400 |
| meetings | Meetings | MeetingsIcon | zinc-400 |
| gaming | Gaming | GamingIcon | emerald-400 |
| phone | Phone | PhoneIcon | zinc-400 |
| procrastination | Procrastination | ProcrastinationIcon | amber-400 |
| overthinking | Overthinking | OverthinkingIcon | violet-400 |
| other | Other | Search (Lucide) | zinc-400 |

**NEW: Tap-to-rank instead of drag-and-drop.** The current drag-and-drop ranking is technically impressive but cognitively expensive. It requires understanding the drag affordance, grabbing the handle, and moving items to the right position. Tap-to-rank is simpler:

1. First tap on a distraction selects it and makes it #1 (most distracting)
2. Second tap on a different distraction makes it #2
3. Third tap makes it #3
4. Tapping a ranked item removes it and re-numbers the rest
5. Visual: Ranked items show a badge (#1, #2, #3) in emerald

**Why tap-to-rank is better:**
- Works perfectly on mobile (no drag-and-drop on small screens)
- Faster — 3 taps vs. select + drag + drop + reorder
- No dependency on @dnd-kit
- No "how to drag" cognitive load
- Clear visual feedback with numbered badges

**Data collected:** `selectedDistractions`, `distractionRanking`

**Derived fields:** `biggestDistraction` (distractionRanking[0]), `distractionsList`

---

#### Screen 7: Permissions + Privacy

**Purpose:** Optional permissions and privacy summary (merges Privacy and Permissions)

**Headline:** "One last thing — your privacy and permissions"

**Subtext:** "Everything is optional. You can change any of this later in Settings."

**Privacy summary** (at the top, collapsed by default):

```
[Shield icon] "Your privacy, always."
- All data stored locally on your device
- You control what gets tracked
- Export or delete your data anytime
- We never sell or share your data
```

**Permissions** (3 toggles below):

| ID | Label | Description | Lucide Icon |
|---|---|---|---|
| desktop | Desktop Tracking | Track app usage to identify distraction patterns | Monitor |
| notifications | Notifications | Send you focus reminders and break alerts | Bell |
| accessibility | Accessibility | Detect when you switch between apps | Accessibility |

Each toggle has:
- Icon (10x10 rounded-xl container)
- Label + "Optional" badge
- Description
- Custom toggle switch (emerald when on, white/10 when off)

**Data collected:** `permissions` (desktop, notifications, accessibility)

**Why this is merged:** The Privacy screen is read-only information. It doesn't need a standalone step. By placing the privacy summary above the permissions toggles, the user gets the information they need to make an informed decision about permissions — all in one screen.

---

#### Screen 8: Finish

**Purpose:** Celebration and personalized summary

**Headline:** "Your MindGuard is ready!" (gradient text)

**Subtext:** "Based on your profile, here's what we'll focus on."

**Personalized summary card:**
- Profile card (role icon + label + primary aspiration + daily goal)
- 2x2 grid of mini-cards:
  - Schedule (schedule type + sleep range)
  - Focus Style (duration + work style)
  - Coach (personality + preview quote)
  - Goals (top goal + count)
- ADHD badge (if applicable): "ADHD-adapted coaching active — shorter sessions, gentler nudges"
- Top distraction card
- Coach preview quote

**First mission:** "Your first mission: [auto-generated from onboarding answers]"

**Celebration dots:** 5 emerald dots that spring in one by one

**CTA:** "Launch Dashboard" (emerald gradient button)

### Progress Bar Design

The progress bar across all 8 screens:

- **No step counter** (no "3/8"). Only a smooth progress bar with contextual messages.
- **8 segments** that fill from left to right
- **Gradient fill:** `from-emerald-500 to-teal-400`
- **Contextual messages** that animate with each step:

| Screen | Progress Message |
|---|---|
| 1 (Welcome) | Welcome |
| 2 (Aspirations) | Discovering your interests... |
| 3 (Schedule) | Learning your routine... |
| 4 (Focus Style) | Finding your focus style... |
| 5 (Coach) | Choosing your coach... |
| 6 (Distractions) | Identifying your distractions... |
| 7 (Permissions) | Almost there... |
| 8 (Finish) | Ready! |

### Navigation Buttons

| Position | Screen 1 | Screens 2–7 | Screen 8 |
|---|---|---|---|
| Left | Empty | Back | Back |
| Right | Let's Begin | Continue | Launch Dashboard |

**Skip button** appears only on Screen 7 (Permissions + Privacy) since all permissions are optional.

### Onboarding Data Flow

```
Screen 2 → primaryUse, otherImproveText, inferred role
Screen 3 → scheduleType, sleepRange → derived chronotype, workSchedule
Screen 4 → hasAdhd, focusDurationComfort, workStylePreference → derived focusStyle, pomodoroPreference, deepWorkDuration, preferredSchedule, focusGoalMinutes
Screen 5 → coachPersonality → derived motivationStyle
Screen 6 → selectedDistractions, distractionRanking → derived biggestDistraction, distractionsList
Screen 7 → permissions
Screen 8 → firstMission (auto-generated)
```

All data is submitted as a single POST to `/api/onboarding` on Screen 8.

---

## 14. Dashboard Philosophy

### What the Dashboard Should Feel Like

The dashboard should feel like walking into your personal office — everything is where you left it, the lighting is right, and your coach has a message for you. It's not a control panel. It's a workspace.

### The Three Zones

1. **The Greeting Zone** — Top of the dashboard
   - Time-aware, name-aware greeting
   - Motivational text based on progress
   - Focus score and streak summary

2. **The Action Zone** — Middle of the dashboard
   - Quick-start button (start a focus session)
   - Active missions
   - AI coach insights
   - Recommended next action

3. **The Reflection Zone** — Bottom of the dashboard
   - Heatmap
   - Session stats
   - Timeline
   - Achievements

### Greeting Logic

The greeting is personalized based on:

| Time | Normal User | Night Owl |
|---|---|---|
| 5–12 | Good morning, [name] | Just winding down, [name]? |
| 12–17 | Good afternoon, [name] | Good afternoon, [name] |
| 17–21 | Good evening, [name] | Good evening, [name] |
| 21–5 | Burning the midnight oil | Ready for your night session, [name]? |

**If no name is set:** Drop the name. "Good morning." not "Good morning, ."

### Motivational Text Priority

1. Goal achieved → celebration
2. Streak ≥ 7 → streak encouragement
3. Almost there (≥80%) → push
4. Good progress (≥50%) → momentum
5. No progress today, but good history → "New day, new focus"
6. No progress today → "A fresh start awaits. Even 15 minutes of focus can change your day."

### Dashboard State Transitions

| State | What it shows |
|---|---|
| First visit | Welcome state with first mission, quick-start button |
| Daily active | Greeting, progress, AI coach insights |
| Goal achieved | Celebration state, achievement unlocked |
| Returning after absence | "Welcome back" — no guilt, no shame |
| No data yet | Empty states with encouraging copy |

---

## 15. Dashboard Layout

### Widget System

The dashboard is composed of widgets. Each widget is a self-contained card with a title, content, and optional actions.

**Available widgets:**

| Widget ID | Title | Description |
|---|---|---|
| quick-start | Quick Start | Start a focus session button |
| streak | Focus Streak | Current streak, best streak |
| focus-score | Focus Score | Today's focus score with trend |
| heatmap | Activity Heatmap | GitHub-style contribution heatmap |
| session-stats | Session Stats | Today's sessions, total minutes |
| timeline | Timeline | Today's activity timeline |
| achievements | Achievements | Recent achievements, XP progress |
| ai-coach | AI Coach | Coach insights and recommendations |
| distraction-log | Distraction Log | Today's distraction events |
| habits | Habit Tracker | Daily habit check-in |

### Widget Ordering

Widgets are ordered based on the user's primary use and goals:

| Primary Use | First 3 Widgets |
|---|---|
| studying | heatmap, session-stats, quick-start |
| coding | timeline, achievements, quick-start |
| writing | session-stats, distraction-log, quick-start |
| creative | achievements, timeline, quick-start |
| work | heatmap, timeline, quick-start |
| general | heatmap, session-stats, quick-start |

**Goal-based additions:**
- `reduce_distractions` → add distraction-log
- `build_streak` → add streak (if not already included)
- `deep_work` → add session-stats (if not already included)
- `improve_score` → add focus-score (if not already included)

### Widget Layout

```
Desktop (3-column):
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   Greeting +      │ │   AI Coach       │ │   Quick Start    │
│   Motivational    │ │   Insights       │ │   + Streak       │
├──────────────────┤ ├──────────────────┤ ├──────────────────┤
│   Heatmap         │ │   Session Stats  │ │   Achievements   │
├──────────────────┤ ├──────────────────┤ ├──────────────────┤
│   Timeline        │ │   Habits         │ │   Distraction Log│
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

```
Mobile (1-column):
┌──────────────────┐
│   Greeting +      │
│   Quick Start     │
├──────────────────┤
│   AI Coach        │
├──────────────────┤
│   Focus Score     │
│   + Streak        │
├──────────────────┤
│   Session Stats   │
├──────────────────┤
│   Heatmap         │
├──────────────────┤
│   Achievements    │
└──────────────────┘
```

### Widget Card Design

Every widget card follows the same structure:

```
┌──────────────────────────────────────┐
│ [Icon] Widget Title          [Action]│
│                                      │
│  Widget content area                 │
│                                      │
│  Optional footer text                │
└──────────────────────────────────────┘
```

- **Border:** `border-white/[0.06]` (default), `border-emerald-500/20` (highlighted)
- **Background:** `bg-white/[0.02]` (default), `bg-emerald-500/[0.04]` (highlighted)
- **Padding:** `p-5` (mobile), `p-6` (desktop)
- **Border radius:** `rounded-xl` (12px)
- **Hover:** `hover:border-white/[0.12]` + `hover:bg-white/[0.04]`
- **Title:** `text-sm font-medium text-zinc-300`
- **Content:** `text-zinc-400` (secondary), `text-zinc-200` (primary)

---

## 16. Settings Philosophy

### The Principle

Settings should feel calm, not overwhelming. Most users should never need to open Settings. The product should work well out of the box. When they do open Settings, they should find what they need in under 30 seconds.

### Organization

Settings are organized into sections with clear headers:

```
Settings
├── General
│   ├── Language
│   ├── Timezone
│   └── Theme (dark/light/system)
├── Focus
│   ├── Default focus duration
│   ├── Daily focus goal
│   ├── Auto-start timer
│   ├── Show celebration
│   └── Ambient sound
├── AI Coach
│   ├── Coach personality
│   ├── AI provider
│   └── AI model
├── Notifications
│   ├── Desktop notifications
│   ├── Break reminders
│   ├── Mission reminders
│   ├── Streak reminders
│   ├── Achievement alerts
│   └── Idle alerts
├── Privacy
│   ├── Share stats
│   ├── Public profile
│   └── Data export
├── Keyboard
│   └── Custom shortcuts
└── Advanced
    ├── Debug mode
    └── Data export
```

### Design Rules

1. **Collapsible sections** — Each section is collapsed by default. Click to expand.
2. **No nested settings** — Two levels maximum. If you need three, reorganize.
3. **Descriptive labels** — "Coach personality" not "coachPersonality"
4. **Immediate save** — Changes save instantly. No "Save" button at the bottom.
5. **Undo affordance** — "Undo" toast appears after changing a setting
6. **Confirmation for destructive actions** — "Delete account" requires confirmation
7. **Defaults are always visible** — The default value is shown as a subtle hint

### Setting Controls

| Setting Type | Control | Example |
|---|---|---|
| Boolean | Toggle switch | Desktop notifications |
| Single choice | Radio group or select | Coach personality |
| Numeric range | Slider | Daily focus goal |
| Text | Input field | Custom shortcut |
| Destructive | Button with confirmation | Delete account |

---

## 17. AI Personalization

### How the AI Coach Learns

The AI coach personalization engine operates on three levels:

#### Level 1: Static Personalization (Onboarding)

Data collected during onboarding immediately shapes the experience:

| Data | What it affects |
|---|---|
| Schedule type | Greeting time, focus recommendations, session timing |
| Focus duration | Timer defaults, pomodoro/break schedule |
| Work style | Session type (pomodoro vs. deep work vs. flexible) |
| Coach personality | All coach communication tone |
| Distractions | Distraction advice, blocking recommendations |
| Goals | Dashboard widget priority, mission suggestions |
| ADHD | Session length, break frequency, nudge gentleness |
| Sleep range | "Wind down" notifications, late-night focus adjustments |

#### Level 2: Behavioral Personalization (First 2 weeks)

The coach observes behavior and adjusts:

| Behavior | What the coach learns |
|---|---|
| When the user starts focus sessions | Peak focus hours |
| How long sessions actually last | Real vs. stated focus duration |
| Which distractions are triggered | Actual distraction patterns |
| Missed days | Patterns of disengagement |
| Session quality ratings | What kind of work produces the best focus |

#### Level 3: Predictive Personalization (Month 2+)

The coach starts predicting and suggesting:

| Prediction | Example |
|---|---|
| Best focus window | "Your best focus time is 9–11 AM. Schedule deep work here." |
| Burnout risk | "You've been pushing hard for 5 days. A lighter day might help." |
| Streak break risk | "You usually skip Fridays. Want to set a lower goal for tomorrow?" |
| Optimal session length | "Your best sessions are 45 minutes. Consider making that your default." |

### Personalization Rules

1. **Never assume without data.** If the user hasn't completed a focus session yet, don't suggest "best times."
2. **Always explain why.** "Based on your last 10 sessions, your best focus window is..." not "Try focusing at 10 AM."
3. **Allow override.** Every personalized suggestion can be dismissed. The coach learns from dismissals too.
4. **Respect privacy.** Only use data the user has explicitly enabled. If desktop tracking is off, don't suggest features that require it.

---

## 18. Notification Philosophy

### When to Notify

MindGuard should notify the user only when the notification is more valuable than the interruption it causes.

**The Notification Value Test:**
> Will this notification help the user focus, or will it break their focus?

If the answer is "break their focus," don't send it. If the answer is "help them focus," send it at the right time.

### Notification Types

| Type | When | Priority | Example |
|---|---|---|---|
| Break reminder | During long focus sessions | High | "Time for a break. You've been focused for 45 minutes." |
| Focus session start | At scheduled session times | High | "Your deep work session starts in 5 minutes." |
| Streak milestone | When streak hits a milestone | Medium | "7-day streak! You're building something real." |
| Achievement unlocked | When achievement criteria met | Medium | "Achievement unlocked: First Focus Session" |
| Daily goal progress | When 80% of daily goal reached | Medium | "Almost there! One more session and you'll hit your goal." |
| Idle alert | When desktop is idle for 15+ min | Low | "You've been idle for a while. Want to start a focus session?" |
| Mission reminder | When a mission is overdue | Low | "Your mission 'Complete project proposal' is waiting." |
| Reflection reminder | End of day (user's schedule) | Low | "Time for your daily reflection." |

### Notification Timing

| Time | Notification | Never notify about |
|---|---|---|
| Morning (5–9 AM) | Morning plan, focus session start | Streak milestones, achievements |
| Work hours (9–5 PM) | Break reminders, focus session start, goal progress | Reflection reminders, idle alerts |
| Evening (5–9 PM) | Reflection reminders, daily summary | Focus session start |
| Night (9 PM–5 AM) | Nothing (unless night owl) | Everything (unless night owl) |

### Notification Design

- **Desktop:** macOS/Windows native notification with emerald icon
- **In-app:** Toast notification (top-right, Sonner-style)
- **Sound:** Optional click sound (can be disabled)
- **Never:** Push notifications to mobile (MindGuard is not a phone app)

### Notification Suppression

- During focus sessions: Suppress all notifications except break reminders
- During reflection: Suppress all notifications
- During onboarding: Suppress all notifications
- After dismissal: Don't repeat the same notification for 24 hours

---

## 19. Micro-interactions

### Every Tiny Interaction Detail

Micro-interactions are the difference between a product that feels "fine" and one that feels "alive." Every interaction in MindGuard should feel intentional, responsive, and delightful.

#### Button Interactions

| State | Visual | Timing |
|---|---|---|
| Default | Base color | — |
| Hover | Scale 1.02, lift -1px, border brightens | 200ms ease |
| Active | Scale 0.97, press down | 150ms ease |
| Disabled | Opacity 40%, pointer-events-none | — |
| Focus | Emerald ring (outline + box-shadow) | 0ms (instant) |

#### Card Interactions

| State | Visual | Timing |
|---|---|---|
| Default | Glass card, subtle border | — |
| Hover | Border brightens, lift -2px, shadow deepens | 300ms cubic-bezier(0.34, 1.56, 0.64, 1) |
| Selected | Emerald border, emerald bg tint, check badge | 200ms spring |
| Disabled | Opacity 50%, no hover | — |

#### Toggle Switch

| State | Visual | Timing |
|---|---|---|
| Off | White/10 bg, thumb left | — |
| On | Emerald-500 bg, thumb right | 200ms spring (stiffness: 500, damping: 30) |
| Transition | Thumb slides with spring animation | Spring |

#### Checkbox / Check Badge

| State | Visual | Timing |
|---|---|---|
| Unchecked | Hidden | — |
| Checked | Spring scale from 0 → 1, emerald circle with check icon | Spring (stiffness: 400, damping: 15) |

#### Progress Bar

| State | Visual | Timing |
|---|---|---|
| Idle | 0% width, white/6 bg | — |
| Filling | Emerald gradient fill, smooth width transition | 400ms ease-out |
| Complete | 100% width, subtle pulse | — |

#### Tab Switching

| State | Visual | Timing |
|---|---|---|
| Inactive | Transparent, text-zinc-500 | — |
| Active | Underline indicator, text-zinc-200 | 200ms ease |
| Hover | Text brightens | 150ms ease |

#### Input Fields

| State | Visual | Timing |
|---|---|---|
| Default | White/6 border, white/2 bg | — |
| Focus | Emerald/30 border, emerald/20 ring | 200ms ease |
| Error | Destructive border, error message below | 200ms ease |
| Typing | No border color change (keep focus state) | — |

#### Scroll Interactions

| Behavior | Implementation |
|---|---|
| Scrollbar | Thin (5px), semi-transparent, rounded |
| Scrollbar hover | Brightens from 8% to 15% opacity |
| Overscroll | None (prevent bouncy overscroll) |
| Smooth scroll | CSS `scroll-behavior: smooth` on all scrollable containers |

#### Selection Interactions

| Behavior | Visual | Timing |
|---|---|---|
| Multi-select | Tap to select, spring check badge, dim at max | 200ms spring |
| Single select | Tap to select, radio-style highlight | 200ms spring |
| Tap-to-rank | First tap = #1, second = #2, third = #3, badge appears | 200ms spring |
| Deselect | Tap again, badge disappears, remaining badges re-number | 200ms spring |

#### Toast Notifications

| Type | Duration | Visual |
|---|---|---|
| Success | 3s | Emerald icon, slide-in from top-right |
| Error | 5s | Destructive icon, slide-in from top-right |
| Info | 3s | Zinc icon, slide-in from top-right |
| Loading | Indefinite | Spinner icon, slide-in, replaced by success/error |

---

## 20. Motion Guidelines

### When to Animate

**Animate when:**
- The user's action causes a change that needs to be understood (e.g., a card being selected)
- The user needs feedback that their action was registered (e.g., a button press)
- The interface is transitioning between states (e.g., onboarding steps)
- You want to draw attention to something important (e.g., a new achievement)
- You want to create a feeling of quality and craft (e.g., stagger animations)

**Do NOT animate when:**
- The animation would slow down the user (e.g., a 500ms transition on a button that's clicked 20 times)
- The animation is purely decorative and adds no information (e.g., a spinning logo)
- The user has `prefers-reduced-motion` enabled
- The animation would cause jank or performance issues (e.g., animating layout properties)
- The user is in a hurry (e.g., during a focus session, skip all transitions)

### Motion Principles

1. **Purposeful:** Every animation should answer "why does this move?" If the answer is "because it looks cool," remove it.
2. **Brief:** Most animations should be 200–400ms. Nothing should take longer than 500ms unless it's a deliberate reveal.
3. **Natural:** Spring physics for interactive elements, ease curves for decorative ones. Never linear.
4. **Consistent:** The same type of interaction should always use the same animation. Never use two different animations for the same action.
5. **Respectful:** Always respect `prefers-reduced-motion`. If reduced motion is enabled, replace all animations with instant transitions or opacity-only fades.

### Motion Categories

| Category | Use Case | Duration | Easing |
|---|---|---|---|
| Micro | Button hover, toggle, check badge | 150–200ms | ease or spring |
| Transition | Page change, card appear | 300–400ms | spring (stiffness: 260, damping: 25) |
| Stagger | List items, grid items | 30–60ms offset | ease-out |
| Reveal | Onboarding step, modal | 300–400ms | spring |
| Decorative | Background glow, gradient shift | 3–6s loop | ease-in-out |

---

## 21. Animation System

### Animation Tokens

These are the canonical animation values. All animations in the product must use these tokens. Do not invent new values.

#### Spring Configurations

| Name | Stiffness | Damping | Use Case |
|---|---|---|---|
| `SPRING_LIGHT` | 300 | 20 | Interactive elements (buttons, toggles) |
| `SPRING_MEDIUM` | 200 | 15 | Cards, modals, popovers |
| `SPRING_ONBOARDING` | 260 | 25 | Onboarding step transitions |
| `SPRING_SNAPPY` | 400 | 15 | Check badges, rank badges |
| `SPRING_TOGGLE` | 500 | 30 | Toggle switch thumb |

#### Duration Tokens

| Name | Duration | Use Case |
|---|---|---|
| `DURATION_INSTANT` | 0ms | Focus rings, disabled states |
| `DURATION_FAST` | 150ms | Button press, toggle state |
| `DURATION_NORMAL` | 200ms | Hover states, card interactions |
| `DURATION_MEDIUM` | 300ms | Page transitions, card reveals |
| `DURATION_SLOW` | 400ms | Onboarding steps, modals |
| `DURATION_DELIBERATE` | 500ms | Major reveals, celebrations |

#### Easing Tokens

| Name | Value | Use Case |
|---|---|---|
| `EASE_STANDARD` | `[0.25, 0.1, 0.25, 1]` | Default easing for most animations |
| `EASE_OUT` | `[0, 0, 0.2, 1]` | Elements entering the viewport |
| `EASE_IN` | `[0.4, 0, 1, 1]` | Elements leaving the viewport |
| `EASE_BOUNCE` | `[0.34, 1.56, 0.64, 1]` | Playful lift effects (use sparingly) |

#### Framer Motion Variants

These are the shared animation variants imported from `@/lib/animations`:

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

#### Onboarding Step Transition

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

#### CSS Keyframe Animations

| Animation Name | Duration | Easing | Use Case |
|---|---|---|---|
| `glow-pulse` | 4s | ease-in-out | Background glow orbs |
| `glow-slow` | 6s | ease-in-out | Subtle ambient glows |
| `breathe` | 3s | ease-in-out | Focus mode breathing |
| `float` | 6s | ease-in-out | Floating elements |
| `gradient-shift` | 6s | ease-in-out | Gradient text animation |
| `pulse-glow` | 3s | ease-in-out | Important element pulsing |
| `border-glow` | 4s | ease-in-out | Gradient border animation |
| `dash-flow` | 2s | linear | Animated dashed lines |
| `focus-breathe-bg` | 4s | ease-in-out | Focus mode background |

#### Reduced Motion

When `prefers-reduced-motion: reduce` is active:

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

All Framer Motion animations should check `prefers-reduced-motion` and use instant transitions instead of springs.

---

## 22. Design Tokens

### Spacing Scale

All spacing uses a consistent 4px base unit. Do not use arbitrary values.

| Token | Value | Use Case |
|---|---|---|
| `space-0` | 0px | No spacing |
| `space-0.5` | 2px | Tiny gaps |
| `space-1` | 4px | Inline gaps |
| `space-1.5` | 6px | Small gaps |
| `space-2` | 8px | Compact padding |
| `space-2.5` | 10px | Default padding |
| `space-3` | 12px | Standard padding |
| `space-4` | 16px | Card padding (mobile) |
| `space-5` | 20px | Card padding (desktop) |
| `space-6` | 24px | Section padding |
| `space-8` | 32px | Section gaps |
| `space-10` | 40px | Large gaps |
| `space-12` | 48px | Page sections |
| `space-16` | 64px | Page-level spacing |
| `space-20` | 80px | Hero spacing |

### Border Radii

| Token | Value | Use Case |
|---|---|---|
| `radius-sm` | 6px | Small elements (badges, tags) |
| `radius-md` | 8px | Buttons, inputs |
| `radius-lg` | 10px | Cards, panels |
| `radius-xl` | 12px | Large cards, modals |
| `radius-2xl` | 16px | Feature cards, hero elements |
| `radius-3xl` | 24px | Onboarding icons |
| `radius-full` | 9999px | Circles, pills |

### Shadows

| Token | Value | Use Case |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.3)` | Subtle depth |
| `shadow-md` | `0 4px 16px rgba(0,0,0,0.15)` | Cards |
| `shadow-lg` | `0 8px 32px rgba(0,0,0,0.2)` | Elevated cards |
| `shadow-xl` | `0 12px 48px rgba(0,0,0,0.25)` | Modals |
| `shadow-glow` | `0 0 20px rgba(16,185,129,0.15)` | Emerald glow |
| `shadow-glow-strong` | `0 0 40px rgba(16,185,129,0.3)` | Active glow |

### Borders

| Token | Value | Use Case |
|---|---|---|
| `border-default` | `1px solid rgba(255,255,255,0.06)` | Default card border |
| `border-subtle` | `1px solid rgba(255,255,255,0.04)` | Subtle dividers |
| `border-hover` | `1px solid rgba(255,255,255,0.12)` | Hover state border |
| `border-active` | `1px solid rgba(16,185,129,0.2)` | Active/selected border |
| `border-focus` | `2px solid hsl(160 84% 39%)` | Focus ring |

### Glassmorphism Tokens

| Token | Value | Use Case |
|---|---|---|
| `glass-bg` | `rgba(255,255,255,0.02)` | Card background |
| `glass-bg-hover` | `rgba(255,255,255,0.04)` | Card hover background |
| `glass-bg-active` | `rgba(16,185,129,0.08)` | Selected card background |
| `glass-blur` | `24px` | Backdrop blur |
| `glass-border` | `1px solid rgba(255,255,255,0.06)` | Card border |
| `glass-shadow` | Complex (see globals.css `.glass-card`) | Card shadow |

---

## 23. Typography

### Font System

| Font | Family | Use Case |
|---|---|---|
| Geist Sans | `var(--font-geist-sans)` | Body text, UI elements |
| Geist Mono | `var(--font-geist-mono)` | Code, numbers, durations |

### Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Use Case |
|---|---|---|---|---|---|
| `text-hero` | 2.5rem (40px) | 700 | 1.15 | -0.03em | Landing page hero |
| `text-heading-xl` | 1.875rem (30px) | 700 | 1.2 | -0.025em | Page titles |
| `text-heading-lg` | 1.5rem (24px) | 600 | 1.3 | -0.02em | Section titles |
| `text-heading-md` | 1.125rem (18px) | 600 | 1.4 | -0.015em | Card titles |
| `text-heading-sm` | 1rem (16px) | 600 | 1.4 | -0.01em | Widget titles |
| `text-body-lg` | 0.9375rem (15px) | 400 | 1.7 | 0 | Large body text |
| `text-body-md` | 0.875rem (14px) | 400 | 1.65 | 0 | Default body text |
| `text-body-sm` | 0.8125rem (13px) | 400 | 1.6 | 0 | Secondary text |
| `text-caption` | 0.75rem (12px) | 400 | 1.5 | 0 | Captions, labels |
| `text-micro` | 0.6875rem (11px) | 500 | 1.5 | 0.01em | Step counters, badges |

### Weight Scale

| Token | Value | Use Case |
|---|---|---|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Labels, emphasis |
| `font-semibold` | 600 | Headings, buttons |
| `font-bold` | 700 | Page titles, hero text |

### Text Color Tiers (Dark Mode)

| Token | Tailwind | Hex | Use Case |
|---|---|---|---|
| `text-primary` | `text-zinc-50` | `#fafafa` | Headlines, primary text |
| `text-secondary` | `text-zinc-400` | `#a1a1aa` | Secondary text, descriptions |
| `text-description` | `text-zinc-500` | `#71717a` | Subtle but readable descriptions |
| `text-disabled` | `text-zinc-600` | `#52525b` | Disabled, muted text |
| `text-accent` | `text-emerald-400` | `#34d399` | Accent text, highlights |
| `text-accent-dim` | `text-emerald-300/60` | — | Coach preview quotes |

### Gradient Text

The `.gradient-text` class creates an animated emerald-to-teal gradient:

```css
.gradient-text {
  background: linear-gradient(135deg, #34d399 0%, #5eead4 25%, #34d399 50%, #2dd4bf 75%, #34d399 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-shift 6s ease-in-out infinite;
}
```

**Usage rules:**
- Use on primary headlines only (onboarding, finish screen, celebration)
- Never use on body text, buttons, or labels
- Maximum 2 gradient text elements per screen
- Never use on more than 3 consecutive words

---

## 24. Color Philosophy

### The Meaning Behind Colors

MindGuard's color system is not arbitrary. Every color has a meaning, and every meaning is reinforced by consistent use.

#### Emerald/Teal — The Core

The primary color is emerald/teal (`hsl(160 84% 39%)`). This color represents:

- **Protection** — The shield, the guard, the keeper of attention
- **Growth** — Like a plant growing, focus is a living thing
- **Calm** — Green is the most restful color for the human eye
- **Trust** — Consistent emerald creates a sense of reliability

**When to use emerald:**
- Primary actions (buttons, CTAs)
- Active/selected states
- Progress indicators
- Success states
- The coach's accent color
- Focus rings
- Achievement badges

#### Zinc — The Neutral

The neutral palette is zinc-based, not gray. Zinc has a slight warm undertone that prevents the cold, sterile feel of pure gray.

| Role | Value | Usage |
|---|---|---|
| Background | `oklch(0.1 0.005 150)` (#09090b) | Page background |
| Card | `oklch(0.155 0.003 150)` (#18181b) | Card backgrounds |
| Secondary | `oklch(0.22 0.005 150)` (#27272a) | Muted backgrounds |
| Text primary | `oklch(0.985 0 0)` (#fafafa) | Headlines |
| Text secondary | `oklch(0.65 0.01 150)` (#a1a1aa) | Descriptions |
| Text muted | `oklch(0.55 0.01 150)` (#71717a) | Disabled text |
| Border | `oklch(1 0 0 / 8%)` | Card borders |

#### Red — The Destructive

Red is used sparingly and only for destructive actions and errors:

| Role | Value | Usage |
|---|---|---|
| Destructive | `oklch(0.704 0.191 22.216)` | Error states, delete buttons |
| Destructive text | `text-red-400` | Error messages |
| Destructive bg | `bg-red-500/10` | Error backgrounds |

**When to use red:**
- Error messages
- Delete buttons
- Destructive action confirmations
- Never for emphasis (use emerald instead)

#### Amber — The Warning

Amber is used for caution and attention:

| Role | Value | Usage |
|---|---|---|
| Warning | `text-amber-400` | Warning messages |
| Warning bg | `bg-amber-500/10` | Warning backgrounds |

**When to use amber:**
- Idle alerts
- Distraction warnings
- "Almost there" progress indicators
- Never for errors (use red) or success (use emerald)

#### Distraction-Specific Colors

Each distraction category has a brand-hinting color for quick recognition:

| Category | Color | Hex |
|---|---|---|
| Instagram | `text-pink-400` | #f472b6 |
| YouTube | `text-red-400` | #f87171 |
| TikTok | `text-cyan-400` | #22d3ee |
| Discord | `text-indigo-400` | #818cf8 |
| Facebook | `text-blue-400` | #60a5fa |
| Reddit | `text-orange-400` | #fb923c |
| X/Twitter | `text-zinc-300` | #d4d4d8 |
| Slack | `text-purple-400` | #c084fc |
| WhatsApp | `text-green-400` | #4ade80 |
| LinkedIn | `text-sky-400` | #38bdf8 |
| Spotify | `text-green-400` | #4ade80 |
| Netflix | `text-red-400` | #f87171 |
| Gaming | `text-emerald-400` | #34d399 |
| Procrastination | `text-amber-400` | #fbbf24 |
| Overthinking | `text-violet-400` | #a78bfa |

### Color Rules

1. **Never use pure white (#ffffff) for text on dark backgrounds.** Use zinc-50 (#fafafa) instead. Pure white creates too much contrast and causes eye strain.
2. **Never use emerald for more than 2 interactive elements per screen.** Too much emerald dilutes its meaning.
3. **Never use red for anything that isn't destructive or an error.** Red is the most emotionally charged color.
4. **Every color must pass WCAG 2.1 AA contrast requirements.** See Section 30.
5. **Opacity is a color tool.** Use `rgba(255,255,255,0.06)` for borders, not solid gray. Opacity creates depth.
6. **Dark mode is the default.** Light mode is supported but secondary. All design decisions are made for dark mode first.

---

## 25. Iconography

### Icon System

MindGuard uses **Lucide icons** exclusively for all UI icons. No emoji in the UI. No custom icon sets for standard UI elements.

### Icon Sizes

| Token | Size | Use Case |
|---|---|---|
| `icon-xs` | 12px | Inline icons, micro labels |
| `icon-sm` | 14px | Small labels, badges |
| `icon-md` | 16px | Standard UI icons |
| `icon-lg` | 20px | Navigation, section headers |
| `icon-xl` | 24px | Feature icons, empty states |
| `icon-2xl` | 32px | Hero icons, onboarding |
| `icon-3xl` | 40px | Onboarding step icons, celebration |

### Icon + Text Pairing

| Icon Size | Text Size | Gap |
|---|---|---|
| 14px | 12px | 6px |
| 16px | 14px | 8px |
| 20px | 16px | 8px |
| 24px | 18px | 12px |
| 32px | 24px | 12px |

### When to Use Custom SVGs

Custom SVGs are only used for **distraction icons** in the onboarding flow. These are stylized category representations that hint at the brand without being exact logos. They must:

1. Be simple, geometric, and recognizable
2. Use `stroke` for outline icons (consistent with Lucide)
3. Use `fill` only for brand-hinting elements (e.g., the YouTube play button)
4. Never use brand colors as fill — only as stroke/fill color classes
5. Be 24x24 viewBox with `strokeWidth="1.5"` for consistency

### Replacing Emoji with Lucide Icons

The current codebase uses emoji in several places (improve-step, goals-step, finish-step). These must be replaced:

| Current Emoji | Replacement Lucide Icon | Context |
|---|---|---|
| 📚 | `BookOpen` | Studying |
| 💻 | `Code2` | Coding |
| 🎓 | `GraduationCap` | University work |
| 🏫 | `School` | School work |
| 💼 | `Briefcase` | Running a business |
| 🚀 | `Rocket` | Freelancing |
| ✍️ | `PenLine` | Writing |
| 📖 | `BookText` | Reading more |
| 🎮 | `Gamepad2` | Reducing gaming |
| 📱 | `Smartphone` | Less social media |
| 🧠 | `Brain` | Managing ADHD |
| 🔬 | `Microscope` | Research & analysis |
| 📝 | `FileText` | Exam preparation |
| ✨ | `Sparkles` | Something else |
| 🎯 | `Target` | Deep Work (goal) |
| 📉 | `TrendingDown` | Less Screen Time (goal) |
| 🔁 | `Repeat` | Better Habits (goal) |
| 📊 | `BarChart3` | Better Grades (goal) |
| ⚡ | `Zap` | More Productivity (goal) |
| 🧘 | `Flower2` | Mental Clarity (goal) |
| 🌿 | `Leaf` | Healthy Routine (goal) |
| 🛠️ | `Wrench` | Skill Building (goal) |
| 💪 | `Dumbbell` | Health & Fitness (goal) |
| 🎨 | `Palette` | Creative Projects (goal) |
| 🔍 | `Search` | Other (distraction) |

### Icon Rules

1. **Never use emoji in the UI.** Emoji render differently across platforms, can't be colored consistently, and look unprofessional.
2. **Always use the same icon for the same concept.** "Timer" is always `Timer`, never sometimes `Clock` and sometimes `Timer`.
3. **Icons should be paired with text.** Icon-only buttons require tooltips.
4. **Color icons only when they convey meaning.** Emerald icons for active/selected states, zinc for inactive.
5. **Never use a custom SVG when a Lucide icon exists.** If Lucide has it, use it. Only create custom SVGs for the distraction grid.

---

## 26. Empty States

### Design Philosophy

Empty states are not failures. They are opportunities. Every empty state should:
1. Explain what would go here
2. Encourage the user to take action
3. Feel warm, not empty

### Empty State Templates

#### No Missions

```
[Target icon, 48px, emerald-400/30]
"Your first mission awaits"
"What will you focus on today?"
[Create Mission] button
```

#### No Focus Sessions

```
[Timer icon, 48px, emerald-400/30]
"No sessions yet"
"Start your first focus session and build momentum."
[Start Focus] button
```

#### No Habits

```
[Repeat icon, 48px, emerald-400/30]
"Build your first habit"
"Small daily habits lead to big changes. Start with one."
[Add Habit] button
```

#### No Reflections

```
[BookOpen icon, 48px, emerald-400/30]
"Your reflection journal is empty"
"Take a moment each evening to reflect on what went well."
[Start Reflection] button
```

#### No Achievements

```
[Trophy icon, 48px, emerald-400/30]
"Achievements are coming"
"Complete focus sessions and build streaks to unlock your first one."
```

#### No Stats

```
[BarChart3 icon, 48px, emerald-400/30]
"Stats will appear here"
"Complete a few focus sessions and we'll show you your patterns."
```

### Empty State Design Rules

- Icon: 48px, emerald-400/30 (subtle, not overwhelming)
- Title: `text-heading-md` (18px), `text-zinc-200`
- Description: `text-body-md` (14px), `text-zinc-500`
- CTA: Optional, emerald ghost button
- No illustration or emoji
- Centered layout within the card
- Generous padding (py-12 minimum)

---

## 27. Error States

### Design Philosophy

Errors should never make the user feel like they did something wrong. The system failed, not the user. Every error message should:
1. Explain what happened in plain language
2. Reassure the user that their data is safe
3. Offer a clear next action

### Error Categories

| Category | Example | Tone |
|---|---|---|
| Network error | "Couldn't connect to the server. Check your internet and try again." | Calm, helpful |
| Auth error | "Your session expired. Please sign in again." | Direct, no blame |
| Validation error | "That email doesn't look right." | Gentle, specific |
| Server error | "Something went wrong on our end. Your data is safe — try again in a moment." | Reassuring, honest |
| Not found | "This page doesn't exist. Let's get you back on track." | Friendly, redirecting |
| Permission error | "You need to enable notifications for this feature. Open Settings to enable it." | Clear, actionable |

### Error UI Patterns

#### Inline Error

Used for form validation:

```
[Input field with red border]
"Please enter a valid email address."
```

- Border: `border-destructive`
- Text: `text-sm text-red-400`
- Position: Directly below the input

#### Toast Error

Used for system errors and failed actions:

```
[Toast notification, top-right]
"Failed to save preferences. Please try again."
```

- Duration: 5 seconds
- Icon: AlertCircle, red
- Action: Optional "Retry" button

#### Full-Page Error

Used for critical failures:

```
[Centered layout]
[Shield icon, 48px, emerald-400/30]
"Something went wrong"
"Your data is safe. This is on us, not you."
[Try Again] button
[Go to Dashboard] link
```

### Error Rules

1. **Never show raw error codes.** "Error 500" is meaningless. "Something went wrong on our end" is meaningful.
2. **Never blame the user.** "You entered an invalid email" → "That email doesn't look right"
3. **Always preserve data.** If a save fails, the user's input should still be in the form.
4. **Always offer a next step.** "Try again" or "Go to Dashboard" — never leave the user stranded.
5. **Log errors for debugging.** Use the logger, not the UI.

---

## 28. Success States

### Design Philosophy

Success states should feel earned, not automatic. They should be proportional to the achievement. A 25-minute session doesn't deserve the same celebration as a 30-day streak.

### Success Categories

| Category | Example | Celebration Level |
|---|---|---|
| Micro success | Toggle enabled, setting saved | Subtle toast (2s) |
| Small success | Focus session completed | Animated number + toast (3s) |
| Medium success | Daily goal achieved | Celebration screen, achievement check |
| Large success | 7-day streak, milestone | Full celebration, achievement unlock |
| Major success | 30-day streak, year wrapped | Full-screen celebration, confetti |

### Celebration Screen

The celebration screen appears after a focus session is completed:

```
[Centered layout]
[Sparkles icon, 40px, emerald-400, spring animation]
"Session Complete!"
"45 minutes of focused work"
[Animated duration display]
[XP earned: +50 XP]
[Start Another] button
[Back to Dashboard] link
```

### Achievement Unlock

When an achievement is unlocked:

```
[Toast notification, top-right]
[Trophy icon, emerald]
"Achievement Unlocked: First Focus Session"
[View Achievement] link
```

### XP System

| Action | XP Earned |
|---|---|
| Complete a focus session | +10 XP per 15 minutes |
| Hit daily goal | +50 XP |
| Maintain 3-day streak | +25 XP |
| Maintain 7-day streak | +100 XP |
| Maintain 30-day streak | +500 XP |
| Daily reflection | +15 XP |
| Achievement unlock | +25 XP |
| Complete a mission | +50 XP |

### Success Rules

1. **Never over-celebrate.** A toggle being enabled doesn't need confetti.
2. **Always be specific.** "45 minutes of focused work" not "Great job!"
3. **Use the coach's voice.** The Accountability Coach says "Done. Now raise the bar." The Supportive Coach says "You did it! That took real effort."
4. **Make it skippable.** Every celebration screen can be dismissed immediately.
5. **Never interrupt focus.** Celebrations happen AFTER a session, never during.

---

## 29. Loading States

### Design Philosophy

Loading states should feel fast, not empty. The user should always know that something is happening and that the system hasn't frozen.

### Loading Patterns

#### Skeleton Loading

Used for content that takes time to load (dashboard widgets, stats):

```
[Card with animated skeleton]
┌──────────────────────────────────────┐
│ ██████████                           │
│ ████████████████                     │
│ ████████████                         │
│ ████████████████████████             │
└──────────────────────────────────────┘
```

- Skeleton color: `bg-white/[0.06]` with `animate-pulse`
- Shape: Rounded rectangles matching the content layout
- Duration: Show skeleton for 500ms minimum (avoid flash)

#### Spinner

Used for short waits (button actions, form submissions):

```
[Loader2 icon, spinning, emerald-400]
"Setting up your coach..."
```

- Icon: `Loader2` from Lucide, `animate-spin`
- Size: 16px (inline) or 20px (standalone)
- Color: `text-emerald-400`
- Text: Descriptive, present tense

#### Progress Bar

Used for determinate progress (onboarding, data export):

```
[Progress bar, emerald gradient fill]
"Saving your preferences... 75%"
```

- Fill: Emerald gradient (`from-emerald-500 to-teal-400`)
- Text: `text-sm text-zinc-500`

#### Shimmer

Used for image or card loading:

```
[Card with shimmer effect]
Background gradient that moves left to right
```

- CSS: `background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)`
- Animation: `translateX` from -100% to 100%, 1.5s infinite

### Loading Rules

1. **Never show a blank screen.** If content takes more than 200ms to load, show a skeleton.
2. **Never show a spinner for more than 5 seconds.** If it takes longer, show a progress bar or a message.
3. **Always describe what's loading.** "Loading your dashboard..." not just a spinner.
4. **Skeletons should match the layout.** The skeleton should preview the shape of the content.
5. **Never use the word "Loading."** Use a present-tense description: "Fetching your stats...", "Preparing your dashboard..."

---

## 30. Accessibility Standards

### WCAG 2.1 AA Compliance

MindGuard must meet WCAG 2.1 Level AA standards. This is not optional.

### Contrast Requirements

| Text Type | Minimum Ratio | Standard |
|---|---|---|
| Normal text (< 18px) | 4.5:1 | AA |
| Large text (≥ 18px bold or ≥ 24px) | 3:1 | AA |
| UI components and graphical objects | 3:1 | AA |

**Verified contrast ratios (dark mode):**

| Foreground | Background | Ratio | Pass? |
|---|---|---|---|
| `text-zinc-50` (#fafafa) | `bg-zinc-950` (#09090b) | 19.3:1 | ✅ |
| `text-zinc-400` (#a1a1aa) | `bg-zinc-950` (#09090b) | 7.2:1 | ✅ |
| `text-zinc-500` (#71717a) | `bg-zinc-950` (#09090b) | 4.7:1 | ✅ |
| `text-zinc-600` (#52525b) | `bg-zinc-950` (#09090b) | 3.1:1 | ⚠️ Large text only |
| `text-emerald-400` (#34d399) | `bg-zinc-950` (#09090b) | 8.9:1 | ✅ |
| `text-emerald-300` (#6ee7b7) | `bg-emerald-500/[0.08]` | 8.1:1 | ✅ |

### Keyboard Navigation

All interactive elements must be keyboard-navigable:

1. **Tab order:** Logical, left-to-right, top-to-bottom
2. **Focus indicators:** Visible emerald ring (`.focus-emerald`)
3. **Skip links:** Skip to main content link at the top of every page
4. **Modal focus trap:** When a modal is open, Tab cycles within the modal
5. **Escape to close:** All modals, drawers, and popovers close with Escape
6. **Enter/Space to activate:** All buttons and interactive elements respond to Enter and Space

### Focus Ring Design

```css
.focus-emerald:focus-visible {
  outline: 2px solid hsl(160 84% 39%);
  outline-offset: 3px;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
  border-radius: 4px;
}
```

- **Only on `:focus-visible`** — not on `:focus` (prevents mouse click rings)
- **2px outline** — visible but not overwhelming
- **3px offset** — ensures the ring doesn't overlap the element
- **4px emerald box-shadow** — secondary visual indicator for low-vision users

### Screen Reader Support

1. **Semantic HTML:** Use native elements (`button`, `a`, `nav`, `main`, `section`)
2. **ARIA labels:** All interactive elements have descriptive `aria-label` or `aria-labelledby`
3. **ARIA roles:** Use `role="radiogroup"`, `role="radio"`, `role="switch"` for custom components
4. **ARIA states:** `aria-pressed`, `aria-checked`, `aria-disabled`, `aria-expanded`
5. **Live regions:** `aria-live="polite"` for dynamic content (progress messages, toast notifications)
6. **Alt text:** All images have descriptive `alt` text. Decorative images use `aria-hidden="true"`
7. **Headings:** Proper heading hierarchy (h1 → h2 → h3, never skip levels)

### Screen Reader Announcements

| Event | Announcement |
|---|---|
| Onboarding step change | "Step [name]. [Contextual message]" |
| Focus session started | "Focus session started. [Duration] minutes." |
| Focus session completed | "Focus session complete. [Duration] minutes of focused work." |
| Achievement unlocked | "Achievement unlocked: [Achievement name]" |
| Toggle changed | "[Label] [enabled/disabled]" |
| Selection changed | "[Item] selected. [Count] of [max] selected." |

### Reduced Motion

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

In Framer Motion:

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const transition = prefersReducedMotion
  ? { duration: 0 }
  : { type: 'spring', stiffness: 260, damping: 25 };
```

### Accessibility Checklist (Per Component)

- [ ] All interactive elements are keyboard-navigable
- [ ] Focus rings are visible and styled
- [ ] ARIA labels are present and descriptive
- [ ] Color is not the sole indicator of state
- [ ] Contrast ratios meet AA standards
- [ ] Reduced motion is respected
- [ ] Screen reader announcements are present for dynamic content
- [ ] Semantic HTML is used (no `div` where `button` should be)
- [ ] Form inputs have associated labels
- [ ] Error messages are announced to screen readers

---

## 31. Responsive Behavior

### Breakpoints

| Name | Width | Use Case |
|---|---|---|
| `xs` | < 640px | Small phones (iPhone SE) |
| `sm` | 640px+ | Large phones |
| `md` | 768px+ | Tablets (portrait) |
| `lg` | 1024px+ | Tablets (landscape), small laptops |
| `xl` | 1280px+ | Desktops |
| `2xl` | 1536px+ | Large desktops |

### Layout Behavior by Breakpoint

| Component | xs/sm | md/lg | xl/2xl |
|---|---|---|---|
| Dashboard grid | 1 column | 2 columns | 3 columns |
| Onboarding grid | 2 columns | 2 columns | 3 columns |
| Distraction grid | 3 columns | 4 columns | 5 columns |
| Sidebar | Hidden (hamburger) | Collapsible | Always visible |
| Navigation | Bottom tab bar | Sidebar | Sidebar |
| Card padding | p-4 | p-5 | p-6 |
| Card spacing | gap-3 | gap-4 | gap-4 |
| Typography scale | 90% | 100% | 100% |
| Modal width | Full screen | 480px | 480px |
| Toast position | Top center | Top right | Top right |

### Mobile-Specific Adaptations

1. **Bottom navigation bar** instead of sidebar for primary views
2. **Full-screen modals** instead of centered dialogs
3. **Swipe gestures** for onboarding (swipe left/right to navigate steps)
4. **Touch targets** minimum 44x44px (Apple HIG) / 48x48dp (Material)
5. **No hover states** — rely on active states instead
6. **Larger text** — minimum 14px body text on mobile
7. **Simplified grids** — fewer columns, more scrolling

### Touch Target Sizes

| Element | Minimum Size | Preferred Size |
|---|---|---|
| Button | 44x44px | 48x48px |
| Icon button | 44x44px | 48x48px |
| Toggle switch | 44x24px | 48x28px |
| Card (selectable) | 44x44px | Full card |
| Link | 44px height | Full line height |
| Slider thumb | 44x44px | 48x48px |

---

## 32. Desktop vs Mobile Experience

### Core Philosophy

MindGuard is a desktop-first product with a mobile-responsive web view. The primary use case is at a desk, during focused work. The mobile experience is for checking in, not for deep work.

### Feature Parity

| Feature | Desktop | Mobile | Difference |
|---|---|---|---|
| Dashboard | Full 3-column layout | Single column, top 3 widgets | Fewer widgets visible |
| Focus timer | Full timer with focus mode | Basic timer | No focus mode |
| AI Coach | Full chat panel | Read-only insights | No chat input |
| Missions | Full CRUD | View + start only | No create/edit |
| Settings | Full settings | Limited settings | Only most-used settings |
| Onboarding | Full 8-screen flow | Same 8-screen flow | Stacked layout |
| Desktop tracking | Available | Not available | N/A |
| Notifications | System notifications | In-app only | No push |
| Command palette | ⌘K / Ctrl+K | Not available | N/A |
| Keyboard shortcuts | Full set | Not available | N/A |

### Desktop-Specific Features

1. **Desktop app (Electron)** — Activity tracking, focus protection, window detection
2. **System tray integration** — Quick start, status, break reminders
3. **Keyboard shortcuts** — Global shortcuts for common actions
4. **Command palette** — ⌘K for quick navigation and actions
5. **Focus protection** — Block apps and websites during focus sessions
6. **Multi-window** — Timer in a separate window while working

### Mobile-Specific Features

1. **Touch-optimized** — Large tap targets, swipe gestures
2. **Bottom navigation** — Quick access to primary views
3. **Simplified views** — Essential information only
4. **Haptic feedback** — Subtle vibration on achievements and milestones
5. **Share** — Share achievements and wrapped summaries

### Desktop Pairing

The desktop app pairs with the web app via a short-lived pairing token:

1. User opens desktop app → "Pair with your account" screen
2. Desktop app shows a pairing code
3. User enters the code on the web app (Settings → Devices)
4. Desktop app receives auth token and syncs data

---

## 33. AI Conversation Style

### How the Coach Speaks

The AI coach's conversation style is determined by the user's coach personality selection. The coach speaks through two channels:

1. **Dashboard insights** — Short, contextual messages on the dashboard
2. **Chat panel** — Longer, conversational responses in the Assistant view

### Conversation Principles

1. **Always respond to what the user said.** Never give a generic response.
2. **Use the user's data.** Reference their sessions, streaks, and patterns.
3. **Be specific, not generic.** "Your focus score is 72, up from 65 last week" not "You're improving!"
4. **One insight per message.** Don't overwhelm with a wall of text.
5. **End with a question or suggestion.** "Want to try a 30-minute session?" not just "You should focus more."
6. **Never use jargon.** "You focused best between 9 and 11 AM" not "Your peak cognitive window is 09:00–11:00."
7. **Respect the user's time.** If they're in a hurry, be brief. If they're reflecting, be thoughtful.

### Coach Personality → Conversation Style

#### Accountability Coach

```
User: "I keep getting distracted by YouTube."
Coach: "YouTube is your #1 distraction this week — 2.3 hours total. Block it during focus sessions starting now. You committed to 2 hours of focus today. You're at 45 minutes. Let's close the gap."
```

- Direct, action-oriented
- References commitments and goals
- Uses data to make the point
- No softening language

#### Supportive Coach

```
User: "I keep getting distracted by YouTube."
Coach: "That's really common — YouTube is designed to keep you watching. The good news is you've noticed the pattern, which is the first step. What if we tried scheduling YouTube as a reward after your focus sessions? That way you still get to watch, but it doesn't steal your focus time."
```

- Empathetic, normalizing
- Acknowledges the challenge
- Suggests a positive alternative
- Uses "we" language

#### Data-Driven Coach

```
User: "I keep getting distracted by YouTube."
Coach: "YouTube usage: 2.3 hours this week. That's 40% above your average. Your focus score drops by an average of 15 points on days with 30+ minutes of YouTube. Recommendation: Block YouTube during your peak focus window (9–11 AM). Your data shows this window is your most productive."
```

- Data-first, evidence-based
- Quantifies the impact
- Provides a specific, data-backed recommendation
- No emotional language

### Conversation Anti-patterns

| Anti-pattern | Why it's bad | What to do instead |
|---|---|---|
| "I'm sorry you're feeling that way" | Dismissive, generic | "That's a common challenge. Here's what the data shows..." |
| "Have you tried focusing?" | Useless, condescending | "Your best focus window is 9–11 AM. Want to schedule a session?" |
| "You should be more productive" | Shaming, unhelpful | "You're at 45 minutes today. Your goal is 2 hours. One more session gets you there." |
| "As an AI, I don't have feelings" | Uncanny, robotic | Just don't say this. Focus on the user's experience. |
| "According to research..." | Lecturing, boring | "Your data shows..." — personal, not academic |

---

## 34. Future Expansion Guidelines

### How to Add New Features Without Breaking the UX

Every new feature must pass the UX Expansion Test before being designed:

> **The UX Expansion Test:** "Does this feature protect the user's attention, or does it add to the noise?"

If the answer is "adds noise," the feature must be redesigned or removed from the roadmap.

### Expansion Principles

1. **Add by subtraction.** Before adding a new feature, ask: "Can we achieve the same result by improving an existing feature?"
2. **Progressive disclosure.** New features should be hidden by default. Users discover them when they need them.
3. **Consistent patterns.** New features must use existing design patterns (cards, buttons, animations). No new patterns.
4. **Settings control.** Every new feature must have a toggle in Settings. No feature is mandatory.
5. **Data justification.** Every new data point collected must justify its existence. "We might need it someday" is not a justification.

### Adding a New Dashboard Widget

1. Define the widget ID, title, and content
2. Add it to the widget ordering logic in `getRecommendedWidgets()`
3. Create the widget component using the standard card structure
4. Add it to the Settings → Focus → Widget visibility section
5. Ensure it works on mobile (1-column layout)
6. Add skeleton loading state
7. Add empty state
8. Add aria-label and keyboard navigation

### Adding a New Onboarding Step

1. **Don't.** The onboarding is already at 8 screens. Adding more is a UX regression.
2. If you MUST add a step, merge it with an existing step. The total must not exceed 8.
3. Every new question must justify its existence: "What does this change about the user's experience?"
4. If the answer is "it adds a data point but doesn't change the experience," remove the question.

### Adding a New Coach Personality

1. Define the personality's voice, tone, and sample phrases
2. Create a mapping from the personality to motivation style
3. Add the personality to the coach selection screen
4. Update all AI coach messages to support the new personality
5. Add the personality to the coach preview quote system
6. Test with users to ensure the voice is distinct from existing personalities

### Adding a New View

1. Define the view's purpose and how it fits into the information architecture
2. Add it to the sidebar navigation (primary, secondary, or tertiary)
3. Add it to the command palette
4. Add a route and page component
5. Ensure it works on mobile (responsive layout)
6. Add a meaningful empty state
7. Add a loading state
8. Add a breadcrumb or back navigation

### Adding a New Notification Type

1. Define the notification's trigger, timing, and priority
2. Add it to the Notification model in Prisma
3. Add it to the Settings → Notifications section
4. Add a suppression rule (when should this NOT be sent?)
5. Ensure it respects the user's schedule (no night notifications for non-night-owls)
6. Test that it doesn't interrupt focus sessions

---

## 35. UX Anti-patterns

### Things MindGuard Should NEVER Do

This is the anti-pattern registry. Every item on this list is a design decision that has been made and must not be reversed without a formal design review.

#### Anti-pattern 1: Guilt-Tripping

**Never make the user feel guilty for not using the product.**

| ❌ Never | ✅ Instead |
|---|---|
| "You haven't focused in 3 days" | "Welcome back! Ready to pick up where you left off?" |
| "You missed your goal again" | "You showed up today. That's what matters." |
| "Your streak is broken" | "Building a new streak starts with one session." |
| "You've been unproductive" | "Tomorrow is a fresh start. Let's make it count." |

#### Anti-pattern 2: Notification Spam

**Never send more than 3 notifications per day.**

| ❌ Never | ✅ Instead |
|---|---|
| "Start your session!" at 9 AM | One gentle reminder at the user's preferred start time |
| "Still on break?" after 5 minutes | "Taking a longer break? No rush." |
| "You haven't opened MindGuard today" | No notification — the user will come back when they're ready |
| "Achievement: You logged in!" | Achievements should be meaningful, not participation trophies |

#### Anti-pattern 3: Dark Patterns

**Never use deceptive design to increase engagement.**

| ❌ Never | ✅ Instead |
|---|---|
| "Are you sure you want to leave? Your streak will break!" | "See you later. Your data is saved." |
| Auto-renewing subscriptions with no reminder | Clear email 7 days before renewal |
| Hiding the delete account button | "Delete account" in Settings → Privacy, one click |
| Making the free plan feel broken | "You can do everything in the free plan. Premium adds AI insights." |

#### Anti-pattern 4: Emoji in UI

**Never use emoji as UI elements.** They render inconsistently across platforms, can't be colored, and look unprofessional.

| ❌ Never | ✅ Instead |
|---|---|
| 📚 Studying | `BookOpen` Lucide icon + "Studying" |
| 🎯 Deep Work | `Target` Lucide icon + "Deep Work" |
| 🏆 Achievement! | `Trophy` Lucide icon + "Achievement Unlocked" |
| ✅ Saved! | `CheckCircle2` Lucide icon + "Saved" |

**Exception:** Emoji in user-generated content (reflections, habit names) is fine. The user chose to use them.

#### Anti-pattern 5: Functional Headlines

**Never use functional, software-like headlines.** Every headline should be something a human coach would say.

| ❌ Never | ✅ Instead |
|---|---|
| "What do you want to improve?" | "Imagine six months from now..." |
| "Configure Your Schedule" | "When are you at your best?" |
| "Select Distractions" | "What pulls your attention away?" |
| "Set Goals" | "What outcomes matter most to you?" |
| "User Preferences" | "How should your coach talk to you?" |

#### Anti-pattern 6: Information Overload

**Never show more than 5 pieces of new information on a single screen.**

| ❌ Never | ✅ Instead |
|---|---|
| 12 goals + a slider + selection count | 12 goals + selection count (slider is a smart default) |
| All 8 widgets on the dashboard at once | 3 primary widgets + "See more" |
| 11 onboarding screens | 8 onboarding screens |
| A wall of text in the coach panel | One insight + "Read more" |

#### Anti-pattern 7: Unexplained Settings

**Never show a setting without explaining what it does.**

| ❌ Never | ✅ Instead |
|---|---|
| "Focus Duration: 25" | "Focus Duration: 25 minutes — Your default session length. Shorter sessions work better for building habits." |
| "Coach Personality: strict" | "Coach Personality: Accountability — Tough accountability, no excuses. Your coach will push you to hit your goals." |
| A toggle with no description | A toggle with a one-line description |

#### Anti-pattern 8: Inconsistent Animations

**Never use different animations for the same type of interaction.**

| ❌ Never | ✅ Instead |
|---|---|
| Card A fades in, Card B slides in | All cards use `fadeInUp` |
| Button A scales on hover, Button B doesn't | All buttons use the same hover scale |
| Page A has a loading spinner, Page B has a skeleton | Loading states follow the Loading Patterns section |

#### Anti-pattern 9: Jargon in the UI

**Never use developer terminology in the user interface.**

| ❌ Never | ✅ Instead |
|---|---|
| "chronotype" | "Morning Person / Night Owl" |
| "pomodoroPreference: 25/5" | "Short focused sprints" |
| "focusGoalMinutes" | "Daily focus goal" |
| "API Error 500" | "Something went wrong on our end" |
| "localStorage" | "Your device" |

#### Anti-pattern 10: Surveillance Feel

**Never make the user feel watched.**

| ❌ Never | ✅ Instead |
|---|---|
| "We detected you were on YouTube for 47 minutes" | "You spent some time on YouTube today. Want to set a schedule for it?" |
| "Your screen time is 6 hours" | "You've been focused for 2 hours today. That's 15% more than yesterday." |
| Tracking without explicit permission | "Enable desktop tracking to get personalized insights. You control what's tracked." |
| "We're monitoring your activity" | "Your activity data stays on your device" |

---

## 36. Product Consistency Rules

### Rules That Must Never Be Violated

These are the inviolable rules of the MindGuard product. They are not guidelines. They are constraints. Violating any of these rules is a bug, not a design choice.

#### Rule 1: The Emerald Accent

Emerald (`hsl(160 84% 39%)`) is the ONLY accent color. No other color may be used for primary actions, active states, or focus indicators. Blue is not emerald. Teal is not emerald. Green is not emerald. Emerald is emerald.

#### Rule 2: Lucide Icons Only

All UI icons must come from the Lucide icon library. No emoji. No custom icon sets for standard UI elements. Custom SVGs are only permitted for the distraction grid.

#### Rule 3: The 8-Screen Onboarding

Onboarding must never exceed 8 screens. If a new question is needed, it must be merged into an existing screen. If a screen is removed, the total must stay at 8 or below.

#### Rule 4: Smart Defaults Over Sliders

Never ask the user to configure a value that can be calculated from their existing answers. The daily focus goal is a smart default, not a slider. If a user wants to change it, they can do so in Settings.

#### Rule 5: No Step Counter

The onboarding progress indicator must never show a step counter (e.g., "3/8"). Use only the progress bar with contextual messages.

#### Rule 6: Privacy First

Privacy information must be presented during onboarding, not hidden in a footer link. The user must see "What IS tracked" and "What is NOT tracked" before being asked to enable permissions.

#### Rule 7: One Primary Action Per Screen

Every screen must have exactly one primary action. The primary action is the emerald gradient button. There should be no ambiguity about what the user should do next.

#### Rule 8: Consistent Card Structure

All cards must follow the same structure: border, background, padding, hover state. No card may use a different visual language. The glassmorphism system is universal.

#### Rule 9: No Modal Overlays in Onboarding

The onboarding flow must never open a modal. If additional information is needed, it should be part of the step. If it's optional, it should be a collapsible section.

#### Rule 10: Coach Personality Is Consistent

The coach personality must be consistent across all surfaces. If the user selected the Accountability Coach, the dashboard greeting, the AI insights, the notification text, and the celebration messages must all use the Accountability voice. No mixing.

#### Rule 11: Dark Mode Is the Default

All design decisions are made for dark mode first. Light mode is an adaptation, not the primary. If a design works in dark mode but not light mode, fix the light mode adaptation, not the dark mode design.

#### Rule 12: Never Break the Progress Bar

The onboarding progress bar must always be smooth and continuous. It must never jump backwards or skip segments. The contextual messages must always match the current step.

#### Rule 13: Data Stays Private

The user must always be able to:
1. See what data is collected
2. Export all their data
3. Delete all their data
4. Disable any tracking feature

If any of these is not possible, the feature is not allowed.

#### Rule 14: Accessibility Is Not a Ticket

Every new feature must pass the Accessibility Checklist (Section 30) before being merged. "We'll add accessibility later" is not acceptable. Accessibility is a design constraint, not a feature.

#### Rule 15: The Conversation Principle

Every interaction must feel like a conversation with a coach, not a form submission. If a screen feels like a form, it needs to be redesigned. The test: "Would a human coach say this?" If the answer is no, rewrite it.

---

## Appendix A: Onboarding Flow Comparison

### Current (11 Screens) vs. New (8 Screens)

| # | Current | New | Change |
|---|---|---|---|
| 1 | Welcome | Welcome | Same |
| 2 | Improve (What do you want to get better at?) | Aspirations (Imagine six months from now...) | Merged with Role, emotional headline |
| 3 | Role | *(Removed — inferred from Aspirations)* | Eliminated |
| 4 | Schedule | Schedule | Same |
| 5 | Focus Style | Focus Style | Same |
| 6 | Motivation | Coach Personality | Removed motivation style sub-question, inferred from coach |
| 7 | Distractions | Distractions | Tap-to-rank instead of drag-and-drop |
| 8 | Goals | *(Removed — merged into Aspirations + smart default for focus goal)* | Eliminated |
| 9 | Privacy | *(Merged into Permissions)* | Merged |
| 10 | Permissions | Permissions + Privacy | Added privacy summary above permissions |
| 11 | Finish | Finish | Same |

### What Was Removed

1. **Role screen** — Role is inferred from the primary aspiration (e.g., "Studying" → student)
2. **Goals screen** — Goals are merged into Aspirations (the aspirations ARE the goals). The daily focus goal slider is replaced with a smart default.
3. **Motivation style sub-question** — Inferred from coach personality (strict → gamification, friendly → balanced, data_nerd → minimalist)
4. **Privacy screen** — Privacy summary is merged into the Permissions screen as a collapsed section above the toggles

### What Was Changed

1. **Headlines** — Functional → Emotional ("Imagine six months from now..." instead of "What do you want to improve?")
2. **Distraction ranking** — Drag-and-drop → Tap-to-rank (simpler, mobile-friendly)
3. **Focus goal** — Slider → Smart default (calculated from schedule + focus duration + work style)
4. **Icons** — Emoji → Lucide icons throughout
5. **Progress bar** — Step counter removed, contextual messages only

---

## Appendix B: Component Reference

### Onboarding Steps

| Component | File | Purpose |
|---|---|---|
| `OnboardingFlow` | `onboarding-flow.tsx` | Main flow controller, state management |
| `WelcomeStep` | `steps/welcome-step.tsx` | Screen 1: Welcome |
| `ImproveStep` → `AspirationsStep` | `steps/improve-step.tsx` | Screen 2: Aspirations (renamed) |
| `ScheduleStep` | `steps/schedule-step.tsx` | Screen 3: Schedule |
| `FocusStyleStep` | `steps/focus-style-step.tsx` | Screen 4: Focus Style |
| `MotivationStep` → `CoachStep` | `steps/motivation-step.tsx` | Screen 5: Coach Personality (renamed) |
| `DistractionStep` | `steps/distraction-step.tsx` | Screen 6: Distractions |
| `PermissionsStep` | `steps/permissions-step.tsx` | Screen 7: Permissions + Privacy |
| `FinishStep` | `steps/finish-step.tsx` | Screen 8: Finish |

### Removed Steps

| Component | File | Reason for Removal |
|---|---|---|
| `RoleStep` | `steps/role-step.tsx` | Inferred from Aspirations |
| `GoalsStep` | `steps/goals-step.tsx` | Merged into Aspirations + smart defaults |
| `PrivacyStep` | `steps/privacy-step.tsx` | Merged into Permissions |

---

## Appendix C: Personalization Engine Reference

### Input → Output Mappings

| Input | Derived Field | Mapping Function |
|---|---|---|
| `scheduleType: morning_person` | `chronotype: early_bird` | `mapScheduleTypeToChronotype` |
| `scheduleType: night_owl` | `chronotype: night_owl` | `mapScheduleTypeToChronotype` |
| `scheduleType: flexible_schedule` | `chronotype: flexible` | `mapScheduleTypeToChronotype` |
| `scheduleType: changes_frequently` | `chronotype: flexible` | `mapScheduleTypeToChronotype` |
| `scheduleType: morning_person` | `workSchedule: morning` | `mapScheduleTypeToWorkSchedule` |
| `scheduleType: night_owl` | `workSchedule: night` | `mapScheduleTypeToWorkSchedule` |
| `focusDurationComfort: 15min` | `pomodoroPreference: 25/5` | `mapFocusDurationToPomodoroPreference` |
| `focusDurationComfort: 30min` | `pomodoroPreference: 25/5` | `mapFocusDurationToPomodoroPreference` |
| `focusDurationComfort: 45min` | `pomodoroPreference: 45/10` | `mapFocusDurationToPomodoroPreference` |
| `focusDurationComfort: about_an_hour` | `pomodoroPreference: 60/15` | `mapFocusDurationToPomodoroPreference` |
| `focusDurationComfort: 90_plus` | `pomodoroPreference: 90/20` | `mapFocusDurationToPomodoroPreference` |
| `workStylePreference: short_sprints` | `focusStyle: pomodoro` | `mapWorkStyleToFocusStyle` |
| `workStylePreference: deep_uninterrupted` | `focusStyle: deep_work` | `mapWorkStyleToFocusStyle` |
| `workStylePreference: mix_both` | `focusStyle: flexible` | `mapWorkStyleToFocusStyle` |
| `coachPersonality: strict` | `motivationStyle: gamification` | Inferred |
| `coachPersonality: friendly` | `motivationStyle: balanced` | Inferred |
| `coachPersonality: data_nerd` | `motivationStyle: minimalist` | Inferred |

### Focus Goal Smart Defaults

| Schedule | Focus Duration | Work Style | Default Goal (minutes) |
|---|---|---|---|
| morning_person | 90_plus | deep_uninterrupted | 180 |
| morning_person | about_an_hour | deep_uninterrupted | 150 |
| morning_person | 45min | mix_both | 120 |
| morning_person | 30min | short_sprints | 90 |
| morning_person | 15min | any | 45 |
| night_owl | 90_plus | deep_uninterrupted | 150 |
| night_owl | about_an_hour | deep_uninterrupted | 120 |
| night_owl | 45min | mix_both | 90 |
| night_owl | 30min | short_sprints | 60 |
| night_owl | 15min | any | 45 |
| flexible_schedule | any | any | 120 |
| changes_frequently | any | any | 90 |

---

## Appendix D: CSS Class Reference

### Glassmorphism System

| Class | Purpose |
|---|---|
| `.glass` | Basic glass background |
| `.glass-card` | Premium card with hover state |
| `.glass-card-active` | Selected/active card |
| `.glass-sidebar` | Sidebar background |
| `.glass-header` | Header background |
| `.glass-panel` | Floating panel (popover, modal) |
| `.glass-glow-edge` | Card with gradient border on hover |

### Animation Classes

| Class | Purpose |
|---|---|
| `.animate-glow-pulse` | Pulsing glow (4s) |
| `.animate-glow-slow` | Slow glow (6s) |
| `.animate-breathe` | Breathing opacity (3s) |
| `.animate-float` | Floating motion (6s) |
| `.animate-dash-flow` | Animated dashed line (2s) |
| `.gradient-text` | Animated emerald gradient text |
| `.pulse-glow` | Box-shadow pulse (3s) |
| `.focus-breathe-bg` | Focus mode background (4s) |

### Interaction Classes

| Class | Purpose |
|---|---|
| `.btn-premium` | Premium button hover/active |
| `.btn-glow` | Button with glow effect |
| `.lift-hover` | Card lift on hover |
| `.press-hover` | Press-down on hover |
| `.focus-emerald` | Emerald focus ring |
| `.card-elevated` | Elevated card shadow |
| `.card-glow` | Card with glow on hover |
| `.card-highlight` | Card with top highlight bar |
| `.gradient-border` | Card with animated gradient border |

### Typography Classes

| Class | Size | Weight | Use Case |
|---|---|---|---|
| `.heading-xl` | 30px | 700 | Page titles |
| `.heading-lg` | 24px | 600 | Section titles |
| `.heading-md` | 18px | 600 | Card titles |
| `.body-lg` | 15px | 400 | Large body text |
| `.body-md` | 14px | 400 | Default body text |

### Background Classes

| Class | Purpose |
|---|---|
| `.noise-bg` | Noise texture overlay |
| `.app-grid-bg` | Subtle grid background |

---

## Appendix E: Keyboard Shortcuts Reference

| Shortcut | Action | Context |
|---|---|---|
| `⌘K` / `Ctrl+K` | Open command palette | Global |
| `⌘\` / `Ctrl+\` | Toggle sidebar | Global |
| `⌘N` / `Ctrl+N` | New mission | Global |
| `Space` | Start/pause focus timer | Timer view |
| `Escape` | Close modal/drawer | Modal context |
| `?` | Show keyboard shortcuts | Global |

---

## Changelog

| Date | Version | Change |
|---|---|---|
| 2025-07-18 | 1.0.0 | Initial UX Bible — 36 sections, 8-screen onboarding flow |

---

*This document is maintained by the MindGuard Design Team. For questions, proposals, or challenges to any rule in this document, open a design review discussion. The document is always more important than the code. The code serves the experience, not the other way around.*
