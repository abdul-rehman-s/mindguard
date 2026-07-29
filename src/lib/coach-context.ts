/**
 * Coach Context Builder — MindGuard
 *
 * Fetches user data from the database and builds a context prompt
 * for the AI coach. This is the bridge between raw data and LLM input.
 */

import { db } from '@/lib/db';
import { calculateStreak, findBestHour, findBestWeekday, hourLabel, weekdayLabel } from '@/lib/analytics';
import { format, startOfDay, endOfDay, subDays, startOfWeek, differenceInCalendarDays } from 'date-fns';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface CoachContext {
  userName: string;
  greeting: string;
  hour: number;
  todayMinutes: number;
  yesterdayMinutes: number;
  weekMinutes: number;
  streak: number;
  focusGoalMinutes: number;
  weekMissionsCompleted: number;
  reflectionRate: number;
  bestHour: number | null;
  bestWeekday: string | null;
  sessionCountToday: number;
  sessionCountWeek: number;
  avgSessionDurationToday: number;
  activeMissions: { title: string; priority: string; status: string }[];
  topDistractions: { app: string; minutes: number }[];
  recentReflection?: { wentWell: string; distraction: string; tomorrowMission: string; mood: number | null; energy: number | null } | null;
  todayDistractionMinutes: number;
  primaryUse?: string | null;
  workSchedule?: string | null;
  biggestDistraction?: string | null;
  coachPersonality: 'strict' | 'friendly' | 'data_nerd';
}

export type CoachMode = 'briefing' | 'morning_plan' | 'night_review' | 'question' | 'weekly_review' | 'mission_suggestions' | 'focus_suggestions';

// ──────────────────────────────────────────────
// Data fetching
// ──────────────────────────────────────────────

export async function buildCoachContext(userId: string): Promise<CoachContext> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const yesterdayStart = startOfDay(subDays(now, 1));
  const yesterdayEnd = endOfDay(subDays(now, 1));
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const last30Start = subDays(now, 30);

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
    db.user.findUnique({
      where: { id: userId },
      select: { name: true, displayName: true, primaryUse: true, workSchedule: true, biggestDistraction: true, focusGoalMinutes: true },
    }),
    db.userSettings.findUnique({
      where: { userId },
      select: { coachPersonality: true, focusGoalMinutes: true },
    }),
    db.focusSession.findMany({
      where: { userId, startedAt: { gte: todayStart, lte: todayEnd }, type: { not: 'break' } },
      select: { id: true, duration: true, startedAt: true },
    }),
    db.focusSession.findMany({
      where: { userId, startedAt: { gte: yesterdayStart, lte: yesterdayEnd }, type: { not: 'break' } },
      select: { duration: true },
    }),
    db.focusSession.findMany({
      where: { userId, startedAt: { gte: weekStart }, type: { not: 'break' } },
      select: { duration: true, startedAt: true },
    }),
    db.focusSession.findMany({
      where: { userId, startedAt: { gte: last30Start }, type: { not: 'break' } },
      select: { startedAt: true, duration: true },
    }),
    db.dailyReflection.findMany({
      where: { userId, date: { gte: format(last30Start, 'yyyy-MM-dd') } },
      select: { date: true },
    }),
    db.mission.count({
      where: { userId, status: 'completed', completedAt: { gte: weekStart } },
    }),
    calculateStreak(userId),
    db.mission.findMany({
      where: { userId, status: 'active' },
      select: { title: true, priority: true, status: true },
      take: 5,
    }),
    db.desktopActivity.findMany({
      where: { userId, startedAt: { gte: todayStart }, type: { in: ['distracted', 'browsing', 'entertainment', 'gaming'] } },
      select: { application: true, duration: true },
    }),
    db.dailyReflection.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { wentWell: true, distraction: true, tomorrowMission: true, mood: true, energy: true },
    }),
  ]);

  const userName = user?.displayName || user?.name || 'there';
  const hour = now.getHours();

  let greeting = 'Hello';
  if (hour < 5) greeting = 'Burning the midnight oil';
  else if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';
  else if (hour < 21) greeting = 'Good evening';
  else greeting = 'Good night';

  const todaySeconds = todaySessions.reduce((acc, s) => acc + s.duration, 0);
  const todayMinutes = Math.round(todaySeconds / 60);
  const yesterdayMinutes = Math.round(yesterdaySessions.reduce((acc, s) => acc + s.duration, 0) / 60);
  const weekMinutes = Math.round(weekSessions.reduce((acc, s) => acc + s.duration, 0) / 60);

  const bestHourResult = findBestHour(last30Sessions);
  const bestWeekdayResult = findBestWeekday(last30Sessions);

  const last30DayCount = differenceInCalendarDays(now, last30Start) + 1;
  const reflectionRate = last30DayCount > 0
    ? Math.round((last30Reflections.length / last30DayCount) * 100)
    : 0;

  // Session counts & averages
  const sessionCountToday = todaySessions.length;
  const sessionCountWeek = weekSessions.length;
  const avgSessionDurationToday = sessionCountToday > 0
    ? Math.round(todaySeconds / sessionCountToday / 60)
    : 0;

  // Top distractions from desktop activity
  const distractionAgg = new Map<string, number>();
  for (const a of todayActivities) {
    const app = a.application || 'Unknown';
    distractionAgg.set(app, (distractionAgg.get(app) || 0) + a.duration / 60);
  }
  const topDistractions = Array.from(distractionAgg.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([app, minutes]) => ({ app, minutes: Math.round(minutes) }));

  const todayDistractionMinutes = Math.round(
    todayActivities.reduce((acc, a) => acc + a.duration, 0) / 60
  );

  const coachPersonality = (userSettings?.coachPersonality as 'strict' | 'friendly' | 'data_nerd') || 'friendly';
  const focusGoalMinutes = userSettings?.focusGoalMinutes || user?.focusGoalMinutes || 120;

  return {
    userName,
    greeting,
    hour,
    todayMinutes,
    yesterdayMinutes,
    weekMinutes,
    streak,
    focusGoalMinutes,
    weekMissionsCompleted,
    reflectionRate,
    bestHour: bestHourResult,
    bestWeekday: bestWeekdayResult !== null ? weekdayLabel(bestWeekdayResult) : null,
    sessionCountToday,
    sessionCountWeek,
    avgSessionDurationToday,
    activeMissions,
    topDistractions,
    recentReflection,
    todayDistractionMinutes,
    primaryUse: user?.primaryUse,
    workSchedule: user?.workSchedule,
    biggestDistraction: user?.biggestDistraction,
    coachPersonality,
  };
}

// ──────────────────────────────────────────────
// System prompts by personality
// ──────────────────────────────────────────────

function getPersonalitySystemPrompt(personality: 'strict' | 'friendly' | 'data_nerd'): string {
  switch (personality) {
    case 'strict':
      return `You are MindGuard's Strict Coach — direct, no-nonsense, and accountability-focused.
You don't sugarcoat. You tell the user exactly what they need to hear.
You reference specific numbers and hold them to their goals.
If they're behind, you call it out. If they're ahead, you push them further.
Keep responses concise and actionable. No fluff. Every sentence must carry value.
Format: Use bullet points and short paragraphs. Bold key numbers.`;

    case 'friendly':
      return `You are MindGuard's Friendly Coach — warm, encouraging, and celebrates small wins.
You believe in positive reinforcement. You acknowledge progress before suggesting improvements.
You're like a supportive friend who also happens to be a productivity expert.
Keep responses warm but actionable. Always start with what went well.
Format: Use short paragraphs with encouragement. Mix data with empathy.`;

    case 'data_nerd':
      return `You are MindGuard's Data Nerd Coach — analytics-focused, trends, comparisons, and insights.
You love numbers. You compare today vs yesterday, this week vs last week.
You spot patterns, identify trends, and make data-driven recommendations.
Show comparisons, percentages, and trend arrows. Think in terms of metrics.
Format: Use data tables, percentages, trend indicators. Be precise with numbers.`;

    default:
      return `You are MindGuard's AI Coach — a productivity expert who helps users focus better.
Give specific, actionable advice. Reference the user's actual data.
Keep responses concise and helpful.`;
  }
}

// ──────────────────────────────────────────────
// Context-to-text converter
// ──────────────────────────────────────────────

export function contextToText(ctx: CoachContext): string {
  const lines: string[] = [];

  lines.push(`User: ${ctx.userName}`);
  if (ctx.primaryUse) lines.push(`Primary use: ${ctx.primaryUse}`);
  if (ctx.workSchedule) lines.push(`Work schedule: ${ctx.workSchedule}`);

  lines.push(`--- Focus Data ---`);
  lines.push(`Today's focus: ${ctx.todayMinutes} minutes (goal: ${ctx.focusGoalMinutes} minutes)`);
  lines.push(`Yesterday's focus: ${ctx.yesterdayMinutes} minutes`);
  lines.push(`This week total: ${ctx.weekMinutes} minutes across ${ctx.sessionCountWeek} sessions`);
  lines.push(`Current streak: ${ctx.streak} days`);
  if (ctx.sessionCountToday > 0) {
    lines.push(`Today: ${ctx.sessionCountToday} sessions, avg ${ctx.avgSessionDurationToday} min each`);
  } else {
    lines.push(`Today: 0 sessions so far`);
  }
  if (ctx.bestHour !== null) {
    lines.push(`Best focus hour (30-day): ${hourLabel(ctx.bestHour)} (${ctx.bestHour}:00)`);
  }
  if (ctx.bestWeekday) {
    lines.push(`Best focus weekday (30-day): ${ctx.bestWeekday}`);
  }

  lines.push(`--- Goal Progress ---`);
  const goalPct = ctx.focusGoalMinutes > 0 ? Math.round((ctx.todayMinutes / ctx.focusGoalMinutes) * 100) : 0;
  lines.push(`Daily goal: ${goalPct}% complete (${ctx.todayMinutes}/${ctx.focusGoalMinutes} min)`);

  lines.push(`--- Missions ---`);
  lines.push(`Completed this week: ${ctx.weekMissionsCompleted}`);
  if (ctx.activeMissions.length > 0) {
    lines.push(`Active missions: ${ctx.activeMissions.map(m => `"${m.title}" (${m.priority})`).join(', ')}`);
  } else {
    lines.push(`No active missions`);
  }

  lines.push(`--- Distractions ---`);
  lines.push(`Distraction time today: ${ctx.todayDistractionMinutes} minutes`);
  if (ctx.topDistractions.length > 0) {
    lines.push(`Top distractions: ${ctx.topDistractions.map(d => `${d.app} (${d.minutes} min)`).join(', ')}`);
  }
  if (ctx.biggestDistraction) {
    lines.push(`Self-reported biggest distraction: ${ctx.biggestDistraction}`);
  }

  lines.push(`--- Reflections ---`);
  lines.push(`Reflection rate (30-day): ${ctx.reflectionRate}%`);
  if (ctx.recentReflection) {
    lines.push(`Last reflection: went well = "${ctx.recentReflection.wentWell}", distraction = "${ctx.recentReflection.distraction}"`);
    if (ctx.recentReflection.mood) lines.push(`Last mood: ${ctx.recentReflection.mood}/10`);
    if (ctx.recentReflection.energy) lines.push(`Last energy: ${ctx.recentReflection.energy}/10`);
  }

  lines.push(`--- Time Context ---`);
  lines.push(`Current hour: ${ctx.hour}:00 (${hourLabel(ctx.hour)})`);
  lines.push(`Current greeting: ${ctx.greeting}`);

  return lines.join('\n');
}

// ──────────────────────────────────────────────
// Mode-specific user prompts
// ──────────────────────────────────────────────

export function getModePrompt(mode: CoachMode, ctx: CoachContext): string {
  const dataContext = contextToText(ctx);

  switch (mode) {
    case 'briefing':
      return `${dataContext}\n\nBased on this data, give me a personalized daily briefing. Include:\n1. A one-line greeting referencing my name and current progress\n2. 3-5 specific, data-driven recommendations for today\n3. A brief summary paragraph\n\nKeep it concise. Every recommendation must reference my actual numbers.`;

    case 'morning_plan':
      return `${dataContext}\n\nCreate a personalized morning plan for today. Include:\n1. Top 3 priorities based on my active missions and streak\n2. Recommended focus blocks with specific times (based on my best hours)\n3. One thing to avoid today (based on my distraction data)\n\nFormat as a clear, actionable plan.`;

    case 'night_review':
      return `${dataContext}\n\nGive me a night review of today. Include:\n1. What went well (reference my actual minutes and sessions)\n2. What to improve tomorrow\n3. A brief reflection prompt based on my recent reflection data\n4. Whether I should celebrate or push harder tomorrow\n\nBe honest but encouraging.`;

    case 'question':
      return `${dataContext}\n\nThe user has a question about their productivity. Give specific, data-driven advice. Always reference their actual numbers when relevant.`;

    case 'weekly_review':
      return `${dataContext}\n\nCreate a weekly review. Include:\n1. Overall week performance (total minutes, session count, streak)\n2. Day-by-day breakdown trends\n3. Mission progress\n4. Distraction analysis\n5. Recommendations for next week\n\nUse comparisons and trend indicators.`;

    case 'mission_suggestions':
      return `${dataContext}\n\nBased on my focus patterns and current missions, suggest:\n1. Which active mission to prioritize next\n2. 2-3 new mission ideas based on my goals and patterns\n3. How to structure my missions for maximum completion rate\n\nKeep suggestions specific and actionable.`;

    case 'focus_suggestions':
      return `${dataContext}\n\nBased on my focus data, suggest:\n1. Optimal focus session duration for me today\n2. Best time windows for deep work\n3. Break pattern recommendations\n4. One focus technique to try today\n\nReference my actual data for each suggestion.`;

    default:
      return `${dataContext}\n\nGive me a brief, personalized productivity tip based on my data.`;
  }
}

// ──────────────────────────────────────────────
// Full prompt builder
// ──────────────────────────────────────────────

export function buildCoachPrompt(mode: CoachMode, ctx: CoachContext, userQuestion?: string): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  const systemPrompt = getPersonalitySystemPrompt(ctx.coachPersonality);
  const userPrompt = mode === 'question' && userQuestion
    ? getModePrompt('question', ctx) + `\n\nUser's question: ${userQuestion}`
    : getModePrompt(mode, ctx);

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
}
