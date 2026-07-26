import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { calculateStreak, findBestHour, findBestWeekday, weekdayLabel, hourLabel } from '@/lib/analytics';
import { logError } from '@/lib/logger';
import {
  format,
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  differenceInCalendarDays,
} from 'date-fns';

export async function GET() {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const yesterdayStart = startOfDay(subDays(now, 1));
    const yesterdayEnd = endOfDay(subDays(now, 1));
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const last30Start = subDays(now, 30);

    const [
      user,
      todaySessions,
      yesterdaySessions,
      weekSessions,
      last30Sessions,
      last30Reflections,
      weekMissionsCompleted,
      streak,
    ] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: { name: true, displayName: true },
      }),
      db.focusSession.findMany({
        where: {
          userId,
          startedAt: { gte: todayStart, lte: todayEnd },
          type: { not: 'break' },
        },
        select: { id: true, duration: true, startedAt: true },
      }),
      db.focusSession.findMany({
        where: {
          userId,
          startedAt: { gte: yesterdayStart, lte: yesterdayEnd },
          type: { not: 'break' },
        },
        select: { id: true, duration: true, startedAt: true },
      }),
      db.focusSession.findMany({
        where: {
          userId,
          startedAt: { gte: weekStart },
          type: { not: 'break' },
        },
        select: { id: true, duration: true, startedAt: true },
      }),
      db.focusSession.findMany({
        where: {
          userId,
          startedAt: { gte: last30Start },
          type: { not: 'break' },
        },
        select: { startedAt: true, duration: true },
      }),
      db.dailyReflection.findMany({
        where: { userId, date: { gte: format(last30Start, 'yyyy-MM-dd') } },
        select: { date: true },
      }),
      db.mission.count({
        where: {
          userId,
          status: 'completed',
          completedAt: { gte: weekStart },
        },
      }),
      calculateStreak(userId),
    ]);

    const userName = user?.displayName || user?.name || 'there';

    const todayMinutes = Math.round(
      todaySessions.reduce((acc, s) => acc + s.duration, 0) / 60
    );
    const yesterdayMinutes = Math.round(
      yesterdaySessions.reduce((acc, s) => acc + s.duration, 0) / 60
    );
    const weekMinutes = Math.round(
      weekSessions.reduce((acc, s) => acc + s.duration, 0) / 60
    );

    const bestHourResult = findBestHour(last30Sessions);
    const bestWeekdayResult = findBestWeekday(last30Sessions);
    const bestWeekday = bestWeekdayResult !== null ? weekdayLabel(bestWeekdayResult) : '—';
    const bestWeekdayMinutes = bestWeekdayResult !== null
      ? last30Sessions.filter(s => new Date(s.startedAt).getDay() === bestWeekdayResult).reduce((acc, s) => acc + s.duration, 0)
      : 0;

    // Reflection rate over last 30 days
    const last30DayCount = differenceInCalendarDays(now, last30Start) + 1;
    const reflectionRate =
      last30DayCount > 0
        ? Math.round((last30Reflections.length / last30DayCount) * 100)
        : 0;

    // Greeting based on hour
    const hour = now.getHours();
    let greeting = 'Hello';
    if (hour < 5) greeting = 'Burning the midnight oil';
    else if (hour < 12) greeting = 'Good morning';
    else if (hour < 17) greeting = 'Good afternoon';
    else if (hour < 21) greeting = 'Good evening';
    else greeting = 'Good night';

    // ---- Recommendations generated from ACTUAL data patterns ----
    const recommendations: string[] = [];

    if (todaySessions.length === 0) {
      recommendations.push(
        `You haven't started a focus session yet today. Even a 15-minute block will keep your ${streak > 1 ? `${streak}-day streak` : 'momentum'} alive.`
      );
    } else if (todayMinutes < 30) {
      recommendations.push(
        `You've logged ${todayMinutes} minute${todayMinutes === 1 ? '' : 's'} today. A single 25-minute deep work block would double your output.`
      );
    } else if (todayMinutes < 90) {
      recommendations.push(
        `Solid start at ${todayMinutes} minutes today. Consider one more session to push past the 90-minute focus threshold.`
      );
    } else {
      recommendations.push(
        `${todayMinutes} minutes of focused work today — your attention is on point. Protect the rest of the day from context switches.`
      );
    }

    if (yesterdayMinutes > 0 && todayMinutes < yesterdayMinutes) {
      const dropPct = Math.round(
        ((yesterdayMinutes - todayMinutes) / yesterdayMinutes) * 100
      );
      recommendations.push(
        `You're ${dropPct}% behind yesterday's ${yesterdayMinutes}-minute pace. One focused session will close the gap.`
      );
    } else if (yesterdayMinutes > 0 && todayMinutes > yesterdayMinutes) {
      recommendations.push(
        `You've already surpassed yesterday's ${yesterdayMinutes} minutes. Momentum is on your side.`
      );
    } else if (yesterdayMinutes === 0 && todayMinutes > 0) {
      recommendations.push(
        `Yesterday had no recorded focus time. Today's ${todayMinutes} minutes is a fresh start — keep it going.`
      );
    }

    if (bestHourResult !== null) {
      const hLabel = hourLabel(bestHourResult);
      const formattedHour = format(new Date().setHours(bestHourResult, 0, 0, 0), 'h a');
      recommendations.push(
        `Your data says you focus best in the ${hLabel} (around ${formattedHour}). Try scheduling your hardest mission in that window.`
      );
    }

    if (bestWeekdayResult !== null) {
      recommendations.push(
        `${bestWeekday} is your strongest weekday (${Math.round(bestWeekdayMinutes / 60)} focus minutes logged in the last 30 days). Plan deep work for ${bestWeekday}s.`
      );
    }

    if (reflectionRate < 30) {
      recommendations.push(
        `Your reflection rate is ${reflectionRate}% over the last 30 days. Reflecting for 60 seconds at day's end improves tomorrow's focus.`
      );
    } else if (reflectionRate >= 70) {
      recommendations.push(
        `You've reflected on ${reflectionRate}% of the last 30 days — strong self-awareness habit. Keep it up.`
      );
    }

    if (weekMissionsCompleted === 0) {
      recommendations.push(
        `No missions completed yet this week. Pick one mission and ship it before Sunday.`
      );
    } else if (weekMissionsCompleted >= 3) {
      recommendations.push(
        `${weekMissionsCompleted} missions completed this week — execution is high. Consider raising the bar for next week.`
      );
    }

    if (streak >= 3) {
      recommendations.push(
        `${streak}-day streak active. Don't break the chain — even a short session today keeps it alive.`
      );
    }

    // Cap recommendations at 5 to keep the briefing tight
    const trimmedRecs = recommendations.slice(0, 5);

    // ---- Summary: a natural-language paragraph from real numbers ----
    const changeVsYesterday = yesterdayMinutes > 0
      ? `${todayMinutes > yesterdayMinutes ? 'up' : 'down'} ${Math.abs(Math.round(((todayMinutes - yesterdayMinutes) / yesterdayMinutes) * 100))}% vs yesterday`
      : todayMinutes > 0
        ? 'a fresh start vs no focus time yesterday'
        : 'no focus time yet today';

    const summary = `${todayMinutes} focused minute${todayMinutes === 1 ? '' : 's'} today — ${changeVsYesterday}. ${weekMinutes} minutes this week across ${weekSessions.length} session${weekSessions.length === 1 ? '' : 's'}. ${streak}-day streak. ${weekMissionsCompleted} mission${weekMissionsCompleted === 1 ? '' : 's'} completed this week, reflection rate at ${reflectionRate}%.`;

    return NextResponse.json({
      greeting,
      userName,
      todayMinutes,
      yesterdayMinutes,
      weekMinutes,
      bestHour: bestHourResult,
      bestWeekday,
      streak,
      weekMissionsCompleted,
      weekReflections: last30Reflections.length,
      reflectionRate,
      recommendations: trimmedRecs,
      summary,
    });
  } catch (e) {
    logError("coach", "Failed to fetch coach briefing", e);
    return NextResponse.json(
      { error: 'Failed to fetch coach briefing' },
      { status: 500 }
    );
  }
}
