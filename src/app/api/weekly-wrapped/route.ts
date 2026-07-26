import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  format,
  startOfWeek,
  endOfWeek,
  subDays,
  startOfDay,
  differenceInCalendarDays,
  eachDayOfInterval,
} from 'date-fns';

async function getUserId(): Promise<string | NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = session.user as Record<string, unknown>;
  return user.id as string;
}

const WEEKDAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function gradeFromScore(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export async function GET() {
  const userId = await getUserId();
  if (userId instanceof NextResponse) return userId;

  try {
    const now = new Date();
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const lastWeekStart = subDays(thisWeekStart, 7);
    const lastWeekEnd = endOfWeek(lastWeekStart, { weekStartsOn: 1 });

    const [
      thisWeekSessions,
      lastWeekSessions,
      thisWeekMissions,
      lastWeekMissions,
      thisWeekReflections,
      lastWeekReflections,
      allSessionDates,
    ] = await Promise.all([
      db.focusSession.findMany({
        where: {
          userId,
          startedAt: { gte: thisWeekStart, lte: thisWeekEnd },
          type: { not: 'break' },
        },
        include: { mission: { select: { title: true } } },
        orderBy: { startedAt: 'asc' },
      }),
      db.focusSession.findMany({
        where: {
          userId,
          startedAt: { gte: lastWeekStart, lte: lastWeekEnd },
          type: { not: 'break' },
        },
        include: { mission: { select: { title: true } } },
        orderBy: { startedAt: 'asc' },
      }),
      db.mission.findMany({
        where: { userId, createdAt: { gte: thisWeekStart, lte: thisWeekEnd } },
        select: { id: true, status: true },
      }),
      db.mission.findMany({
        where: { userId, createdAt: { gte: lastWeekStart, lte: lastWeekEnd } },
        select: { id: true, status: true },
      }),
      db.dailyReflection.findMany({
        where: {
          userId,
          date: {
            gte: format(thisWeekStart, 'yyyy-MM-dd'),
            lte: format(thisWeekEnd, 'yyyy-MM-dd'),
          },
        },
        select: { date: true },
      }),
      db.dailyReflection.findMany({
        where: {
          userId,
          date: {
            gte: format(lastWeekStart, 'yyyy-MM-dd'),
            lte: format(lastWeekEnd, 'yyyy-MM-dd'),
          },
        },
        select: { date: true },
      }),
      db.focusSession.findMany({
        where: { userId, type: { not: 'break' } },
        select: { startedAt: true },
        orderBy: { startedAt: 'desc' },
      }),
    ]);

    // --- This week aggregates ---
    const thisWeekMinutes = thisWeekSessions.reduce(
      (acc, s) => acc + s.duration,
      0
    );
    const thisWeekHours = Math.round((thisWeekMinutes / 60 / 60) * 10) / 10; // hours with 1 decimal
    const lastWeekMinutes = lastWeekSessions.reduce(
      (acc, s) => acc + s.duration,
      0
    );
    const lastWeekHours = Math.round((lastWeekMinutes / 60 / 60) * 10) / 10;

    // Deepest session (longest single session this week)
    const deepest = thisWeekSessions.reduce(
      (best, s) => (s.duration > best.duration ? s : best),
      thisWeekSessions[0] as (typeof thisWeekSessions)[number] | undefined
    );
    const deepestSession = deepest
      ? {
          duration: Math.round(deepest.duration / 60), // minutes
          mission: deepest.mission?.title || 'Free Focus',
          date: format(new Date(deepest.startedAt), 'yyyy-MM-dd'),
        }
      : null;

    // Best day of this week (Mon-Sun)
    const dayRange = eachDayOfInterval({ start: thisWeekStart, end: thisWeekEnd });
    const dayAgg = dayRange.map((d) => {
      const sessions = thisWeekSessions.filter(
        (s) => new Date(s.startedAt).toDateString() === d.toDateString()
      );
      return {
        date: d,
        dayLabel: WEEKDAY_LABELS[d.getDay()],
        minutes: Math.round(sessions.reduce((acc, s) => acc + s.duration, 0) / 60),
        sessions: sessions.length,
      };
    });
    const bestDay = dayAgg.reduce(
      (best, d) => (d.minutes > best.minutes ? d : best),
      dayAgg[0] as (typeof dayAgg)[number] | undefined
    );
    const bestDayPayload = bestDay
      ? { day: bestDay.dayLabel, minutes: bestDay.minutes, sessions: bestDay.sessions }
      : null;

    // Most productive hour
    const hourAgg = new Map<number, { sessions: number; minutes: number }>();
    for (const s of thisWeekSessions) {
      const h = new Date(s.startedAt).getHours();
      const entry = hourAgg.get(h) || { sessions: 0, minutes: 0 };
      entry.sessions += 1;
      entry.minutes += s.duration / 60;
      hourAgg.set(h, entry);
    }
    let mostProductiveHour: { hour: string; sessions: number; avgMinutes: number } | null = null;
    let bestHourSessions = -1;
    for (const [h, entry] of hourAgg.entries()) {
      if (entry.sessions > bestHourSessions) {
        bestHourSessions = entry.sessions;
        mostProductiveHour = {
          hour: format(new Date().setHours(h, 0, 0, 0), 'h a'),
          sessions: entry.sessions,
          avgMinutes: Math.round(entry.minutes / entry.sessions),
        };
      }
    }

    // Longest active streak this week (consecutive days with sessions, within week)
    let longestStreak = 0;
    let run = 0;
    for (const d of dayRange) {
      const has = thisWeekSessions.some(
        (s) => new Date(s.startedAt).toDateString() === d.toDateString()
      );
      if (has) {
        run++;
        longestStreak = Math.max(longestStreak, run);
      } else {
        run = 0;
      }
    }

    // Mission completion rate this week
    const totalMissionsThisWeek = thisWeekMissions.length;
    const completedMissionsThisWeek = thisWeekMissions.filter(
      (m) => m.status === 'completed'
    ).length;
    const missionCompletionRate =
      totalMissionsThisWeek > 0
        ? Math.round((completedMissionsThisWeek / totalMissionsThisWeek) * 100)
        : 0;

    // Reflection rate this week (fraction of days with reflections)
    const weekDayCount = dayRange.length;
    const reflectionRate =
      weekDayCount > 0
        ? Math.round((thisWeekReflections.length / weekDayCount) * 100)
        : 0;

    // Last week's mission completion rate (for delta)
    const lastWeekCompleted = lastWeekMissions.filter(
      (m) => m.status === 'completed'
    ).length;
    const lastWeekMissionRate =
      lastWeekMissions.length > 0
        ? Math.round((lastWeekCompleted / lastWeekMissions.length) * 100)
        : 0;

    // Last week's longest streak
    const lastWeekDayRange = eachDayOfInterval({ start: lastWeekStart, end: lastWeekEnd });
    let lastWeekStreak = 0;
    let lastRun = 0;
    for (const d of lastWeekDayRange) {
      const has = lastWeekSessions.some(
        (s) => new Date(s.startedAt).toDateString() === d.toDateString()
      );
      if (has) {
        lastRun++;
        lastWeekStreak = Math.max(lastWeekStreak, lastRun);
      } else {
        lastRun = 0;
      }
    }

    // Overall current streak (from all sessions)
    const daysWithSessions = new Set(
      allSessionDates.map((s) => format(startOfDay(new Date(s.startedAt)), 'yyyy-MM-dd'))
    );
    let overallStreak = 0;
    let checkDate = startOfDay(now);
    if (!daysWithSessions.has(format(checkDate, 'yyyy-MM-dd'))) {
      checkDate = subDays(checkDate, 1);
    }
    while (daysWithSessions.has(format(checkDate, 'yyyy-MM-dd'))) {
      overallStreak++;
      checkDate = subDays(checkDate, 1);
    }

    // Attention grade: composite score from focus hours, consistency, mission rate, reflection rate
    const hoursScore = Math.min((thisWeekHours / 20) * 40, 40); // 20h/week = full 40 pts
    const streakScore = Math.min((longestStreak / 7) * 25, 25); // 7-day streak = full 25 pts
    const missionScore = Math.min((missionCompletionRate / 100) * 20, 20);
    const reflectionScore = Math.min((reflectionRate / 100) * 15, 15);
    const attentionScore = Math.round(
      hoursScore + streakScore + missionScore + reflectionScore
    );
    const attentionGrade = gradeFromScore(attentionScore);

    // Week-over-week deltas
    const focusChange =
      lastWeekMinutes > 0
        ? Math.round(((thisWeekMinutes - lastWeekMinutes) / lastWeekMinutes) * 100)
        : thisWeekMinutes > 0
          ? 100
          : 0;
    const sessionChange =
      lastWeekSessions.length > 0
        ? Math.round(
            ((thisWeekSessions.length - lastWeekSessions.length) /
              lastWeekSessions.length) *
              100
          )
        : thisWeekSessions.length > 0
          ? 100
          : 0;
    const streakChange = longestStreak - lastWeekStreak;

    const totalDays = differenceInCalendarDays(thisWeekEnd, thisWeekStart) + 1;

    return NextResponse.json({
      weekRange: {
        start: format(thisWeekStart, 'yyyy-MM-dd'),
        end: format(thisWeekEnd, 'yyyy-MM-dd'),
      },
      totalFocusHours: thisWeekHours,
      totalFocusMinutes: Math.round(thisWeekMinutes / 60),
      sessionCount: thisWeekSessions.length,
      deepestSession,
      bestDay,
      mostProductiveHour,
      longestStreak,
      overallStreak,
      missionCompletionRate,
      missionsCompleted: completedMissionsThisWeek,
      missionsCreated: totalMissionsThisWeek,
      reflectionRate,
      reflectionsWritten: thisWeekReflections.length,
      reflectionDaysPossible: totalDays,
      attentionScore,
      attentionGrade,
      weekOverWeek: {
        focusChange,
        sessionChange,
        streakChange,
        missionRateChange: missionCompletionRate - lastWeekMissionRate,
      },
      lastWeek: {
        totalFocusHours: lastWeekHours,
        sessionCount: lastWeekSessions.length,
        longestStreak: lastWeekStreak,
        missionCompletionRate: lastWeekMissionRate,
        reflectionCount: lastWeekReflections.length,
      },
    });
  } catch (e) {
    console.error('[weekly-wrapped] error', e);
    return NextResponse.json(
      { error: 'Failed to build weekly wrapped report' },
      { status: 500 }
    );
  }
}
