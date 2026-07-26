# Task 2-a: Backend API Routes + Prisma Schema

## Agent: Backend Engineer
## Status: ✅ Complete

## What was done

### Schema (additive only — no existing fields touched)
- `prisma/schema.prisma`
  - `FocusSession`: + `quality Int?`, + `type String? @default("focus")`
  - `DailyReflection`: + `mood Int?`, + `energy Int?`, + `sleepHours Float?`, + `tags String?`
  - `User`: + `xp Int @default(0)`, + `level Int @default(1)`
- `bun run db:push` executed — DB in sync, Prisma Client regenerated

### New API routes
1. **`src/app/api/coach/route.ts`** — GET personalized daily briefing. Real queries (today/yesterday/week/last-30 sessions + last-30 reflections + this-week missions). Returns greeting, userName, todayMinutes, yesterdayMinutes, weekMinutes, bestHour, bestWeekday, streak, weekMissionsCompleted, weekReflections, reflectionRate, recommendations[] (max 5, data-driven), summary string. ZERO hardcoded insights.

2. **`src/app/api/achievements/progress/route.ts`** — GET progress for all 8 achievement types (first_focus, streak_7, streak_30, hours_100, night_owl, early_bird, deep_worker, mission_master). Per achievement: type, title, description, icon (lucide), unlocked, progress, progressMax, progressPct, xpReward (50-400), unlockedAt, estimatedRemaining. Real server-side calculations for night_owl (session ended 00:00-05:00), early_bird (started before 7AM), deep_worker (>=90 min single session), mission_master (10+ completed).

3. **`src/app/api/insights/route.ts`** — GET last-30-day analytics. Returns `insights[]` (5-10 entries with type/title/description/metric/value/icon), `focusByHour: number[24]`, `focusByWeekday: {day,minutes,sessions}[]`, `weeklyTrend: {week,minutes,sessions}[]`, plus `meta` block. Pattern detection: best weekday, best hour, afternoon dip (9-11 vs 13-16), reflection correlation (avg minutes with vs without reflection), week-over-week trend, consistency (std-dev of daily minutes), session length trend, mission completion rate, total volume.

4. **`src/app/api/replay/route.ts`** — GET ?date=YYYY-MM-DD (defaults to today, validates ISO). Returns `{date, events[], summary}`. Events are chronological (oldest first) with types: session, break, reflection, mission_created, mission_completed. Summary: totalMinutes, sessionCount, missionsCompleted, reflectionWritten, longestSessionMinutes, bestHour.

5. **`src/app/api/weekly-wrapped/route.ts`** — GET Spotify-style report. Queries this week (Mon-Sun) AND last week. Returns totalFocusHours, deepestSession, bestDay, mostProductiveHour, longestStreak (within week), overallStreak, missionCompletionRate, reflectionRate, attentionScore (0-100 composite), attentionGrade (A-F), weekOverWeek{focusChange, sessionChange, streakChange, missionRateChange}, lastWeek{}.

### Updated existing routes
6. **`src/app/api/timeline/route.ts`** — Added event types: 'break' (sessions with type='break'), 'mission_created', 'achievement_unlocked'. Added `group` field (events within 15 min share a group id). **Sort order changed from newest-first to oldest-first** per spec. Added optional `subtitle` field.

7. **`src/app/api/stats/route.ts`** — Added `startOfWeek` import. Added Promise.all query block for achievement count, today's reflection (findUnique on userId_date), weekly missions completed, total missions completed. Response now also returns: `achievementProgress` (int), `todayReflection` (boolean), `weeklyMissionsCompleted` (int), `totalMissionsCompleted` (int). All existing fields preserved.

## Auth pattern (all routes)
```ts
const session = await getServerSession(authOptions);
if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const userId = (session.user as Record<string, unknown>).id as string;
```

## Verification
- `bun run lint` — passes clean (0 errors)
- `bun run db:push` — DB in sync, Prisma Client regenerated
- Dev server compiles successfully (HTTP 200 on `/`)

## Important note for downstream frontend agents
- `/api/timeline` now emits NEW event types: `'break'`, `'mission_created'`, `'achievement_unlocked'`. The current `src/components/dashboard/timeline.tsx` only maps `'session'`, `'reflection'`, `'mission_completed'` in its `iconMap`/`colorMap`/`labelMap`. **Without extending those maps, the Timeline component WILL CRASH** when rendering new event types (because `iconMap[event.type]` returns `undefined`, and `<undefined className="h-3 w-3" />` is not valid React).
- `/api/timeline` sort order is now oldest-first (was newest-first).
- New routes return shapes documented above; frontend components consuming them should be created/updated accordingly.

## File list (all created/modified by this task)
- `prisma/schema.prisma` (modified)
- `src/app/api/coach/route.ts` (new)
- `src/app/api/achievements/progress/route.ts` (new)
- `src/app/api/insights/route.ts` (new)
- `src/app/api/replay/route.ts` (new)
- `src/app/api/weekly-wrapped/route.ts` (new)
- `src/app/api/timeline/route.ts` (modified)
- `src/app/api/stats/route.ts` (modified)
