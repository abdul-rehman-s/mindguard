import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { calculateStreak } from '@/lib/analytics';
import { logError } from '@/lib/logger';
import {
  format,
  startOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  eachDayOfInterval,
  parseISO,
  isValid,
} from 'date-fns';

export async function GET(req: Request) {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const url = new URL(req.url);
    // Default: current month. Can pass ?month=YYYY-MM for specific month.
    const monthParam = url.searchParams.get('month');
    const now = new Date();
    let targetMonth = now;
    if (monthParam) {
      const parsed = parseISO(monthParam + '-01');
      if (!isValid(parsed)) {
        return NextResponse.json({ error: 'Invalid month parameter. Use YYYY-MM format.' }, { status: 400 });
      }
      targetMonth = parsed;
    }

    const monthStart = startOfMonth(targetMonth);
    const monthEnd = endOfMonth(targetMonth);
    const prevMonthStart = startOfMonth(subMonths(targetMonth, 1));
    const prevMonthEnd = endOfMonth(subMonths(targetMonth, 1));

    // Fetch current month data
    const [sessions, reflections, achievements, prevSessions, prevReflections, streak, habits, habitEntries] = await Promise.all([
      db.focusSession.findMany({
        where: {
          userId,
          startedAt: { gte: monthStart, lte: monthEnd },
          type: { not: 'break' },
        },
        select: { id: true, duration: true, startedAt: true, endedAt: true },
        orderBy: { startedAt: 'asc' },
      }),
      db.dailyReflection.findMany({
        where: {
          userId,
          date: { gte: format(monthStart, 'yyyy-MM-dd'), lte: format(monthEnd, 'yyyy-MM-dd') },
        },
        select: { date: true, mood: true, energy: true },
      }),
      db.achievement.findMany({
        where: {
          userId,
          unlockedAt: { gte: monthStart, lte: monthEnd },
        },
        select: { type: true, unlockedAt: true },
      }),
      db.focusSession.findMany({
        where: {
          userId,
          startedAt: { gte: prevMonthStart, lte: prevMonthEnd },
          type: { not: 'break' },
        },
        select: { duration: true, startedAt: true },
      }),
      db.dailyReflection.findMany({
        where: {
          userId,
          date: { gte: format(prevMonthStart, 'yyyy-MM-dd'), lte: format(prevMonthEnd, 'yyyy-MM-dd') },
        },
        select: { date: true, mood: true },
      }),
      calculateStreak(userId),
      db.habit.findMany({
        where: { userId, isActive: true },
        select: { id: true, frequency: true },
      }),
      db.habitEntry.findMany({
        where: {
          userId,
          date: { gte: format(monthStart, 'yyyy-MM-dd'), lte: format(monthEnd, 'yyyy-MM-dd') },
        },
        select: { habitId: true, date: true },
      }),
    ]);

    // Calculate metrics
    const totalMinutes = Math.round(sessions.reduce((acc, s) => acc + s.duration, 0) / 60);
    const totalFocusHours = Math.round(totalMinutes / 60 * 10) / 10;
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd }).length;
    const averageDailyFocus = Math.round(totalMinutes / daysInMonth);

    // Best day / worst day
    const dayMap = new Map<string, number>();
    for (const s of sessions) {
      const dateStr = format(startOfDay(new Date(s.startedAt)), 'yyyy-MM-dd');
      dayMap.set(dateStr, (dayMap.get(dateStr) || 0) + Math.round(s.duration / 60));
    }

    let bestDay: { date: string; minutes: number } | null = null;
    let worstDay: { date: string; minutes: number } | null = null;
    for (const [date, mins] of dayMap.entries()) {
      if (!bestDay || mins > bestDay.minutes) bestDay = { date, minutes: mins };
      if (!worstDay || mins < worstDay.minutes) worstDay = { date, minutes: mins };
    }

    // Most productive hour
    const hourMap = new Array(24).fill(0);
    for (const s of sessions) {
      hourMap[new Date(s.startedAt).getHours()] += s.duration / 60;
    }
    let mostProductiveHour: number | null = null;
    let maxHourMins = 0;
    for (let h = 0; h < 24; h++) {
      if (hourMap[h] > maxHourMins) {
        maxHourMins = hourMap[h];
        mostProductiveHour = h;
      }
    }

    // Mood average
    const moodValues = reflections
      .map(r => r.mood)
      .filter((m): m is number => m !== null && m !== 0);
    const moodAverage = moodValues.length > 0
      ? Math.round((moodValues.reduce((a, b) => a + b, 0) / moodValues.length) * 10) / 10
      : null;

    // Energy average
    const energyValues = reflections
      .map(r => r.energy)
      .filter((e): e is number => e !== null && e !== 0);
    const energyAverage = energyValues.length > 0
      ? Math.round((energyValues.reduce((a, b) => a + b, 0) / energyValues.length) * 10) / 10
      : null;

    // Habit completion rate
    const totalActiveHabits = habits.length;
    const expectedCompletions = totalActiveHabits * daysInMonth;
    const actualCompletions = habitEntries.length;
    const habitCompletionRate = expectedCompletions > 0
      ? Math.round((actualCompletions / expectedCompletions) * 100)
      : 0;

    // Comparison to previous month
    const prevTotalMinutes = Math.round(prevSessions.reduce((acc, s) => acc + s.duration, 0) / 60);
    const prevSessionCount = prevSessions.length;
    const prevMoodValues = prevReflections
      .map(r => r.mood)
      .filter((m): m is number => m !== null && m !== 0);
    const prevMoodAverage = prevMoodValues.length > 0
      ? Math.round((prevMoodValues.reduce((a, b) => a + b, 0) / prevMoodValues.length) * 10) / 10
      : null;

    const focusChange = prevTotalMinutes > 0
      ? Math.round(((totalMinutes - prevTotalMinutes) / prevTotalMinutes) * 100)
      : totalMinutes > 0 ? 100 : 0;
    const sessionChange = prevSessionCount > 0
      ? Math.round(((sessions.length - prevSessionCount) / prevSessionCount) * 100)
      : sessions.length > 0 ? 100 : 0;
    const streakChange = streak;
    const moodChange = moodAverage !== null && prevMoodAverage !== null
      ? Math.round((moodAverage - prevMoodAverage) * 10) / 10
      : null;

    // Daily data for chart
    const dailyData = eachDayOfInterval({ start: monthStart, end: monthEnd }).map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const mins = dayMap.get(dateStr) || 0;
      const sessionsOnDay = sessions.filter(s => format(startOfDay(new Date(s.startedAt)), 'yyyy-MM-dd') === dateStr).length;
      const reflection = reflections.find(r => r.date === dateStr);
      const habitsOnDay = habitEntries.filter(e => e.date === dateStr).length;
      return {
        date: dateStr,
        minutes: mins,
        sessions: sessionsOnDay,
        mood: reflection?.mood || null,
        energy: reflection?.energy || null,
        habitCompleted: habitsOnDay,
      };
    });

    return NextResponse.json({
      totalFocusHours,
      averageDailyFocus,
      bestDay,
      worstDay: worstDay && worstDay.minutes > 0 ? worstDay : null,
      mostProductiveHour,
      habitCompletionRate,
      moodAverage,
      energyAverage,
      achievementCount: achievements.length,
      comparison: {
        focusChange,
        sessionChange,
        streakChange,
        moodChange,
      },
      dailyData,
      month: format(targetMonth, 'yyyy-MM'),
      monthLabel: format(targetMonth, 'MMMM yyyy'),
    });
  } catch (e) {
    logError('monthly-report', 'Failed to generate monthly report', e);
    return NextResponse.json(
      { error: 'Failed to generate monthly report' },
      { status: 500 }
    );
  }
}
