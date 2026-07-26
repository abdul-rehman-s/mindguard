import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  format,
  startOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
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

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type Insight = {
  type: 'pattern' | 'trend' | 'achievement' | 'suggestion';
  title: string;
  description: string;
  metric: string;
  value: string | number;
  icon: string;
};

function stdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export async function GET() {
  const userId = await getUserId();
  if (userId instanceof NextResponse) return userId;

  try {
    const now = new Date();
    const last30Start = subDays(now, 29);
    const last30StartDay = startOfDay(last30Start);

    const [sessions, reflections, missions] = await Promise.all([
      db.focusSession.findMany({
        where: {
          userId,
          startedAt: { gte: last30StartDay },
          type: { not: 'break' },
        },
        select: {
          id: true,
          duration: true,
          startedAt: true,
          endedAt: true,
        },
        orderBy: { startedAt: 'asc' },
      }),
      db.dailyReflection.findMany({
        where: { userId, date: { gte: format(last30Start, 'yyyy-MM-dd') } },
        select: { date: true },
      }),
      db.mission.findMany({
        where: { userId, createdAt: { gte: last30StartDay } },
        select: { id: true, status: true, createdAt: true },
      }),
    ]);

    // --- focusByHour: number[24], total minutes per hour of day ---
    const focusByHour = new Array(24).fill(0);
    for (const s of sessions) {
      focusByHour[new Date(s.startedAt).getHours()] += s.duration / 60;
    }
    const focusByHourRounded = focusByHour.map((m) => Math.round(m));

    // --- focusByWeekday: {day, minutes}[] ---
    const weekdayMinutes = new Array(7).fill(0);
    const weekdaySessionCount = new Array(7).fill(0);
    for (const s of sessions) {
      const dow = new Date(s.startedAt).getDay();
      weekdayMinutes[dow] += s.duration / 60;
      weekdaySessionCount[dow] += 1;
    }
    const focusByWeekday = WEEKDAY_LABELS.map((day, idx) => ({
      day,
      minutes: Math.round(weekdayMinutes[idx]),
      sessions: weekdaySessionCount[idx],
    }));

    // --- weeklyTrend: minutes per ISO week (Mon-Sun) for last 4 weeks + this week ---
    // Build week boundaries for last 5 weeks (weekStartsOn Monday)
    const weeklyTrend: { week: string; minutes: number; sessions: number }[] = [];
    for (let w = 4; w >= 0; w--) {
      const ref = subDays(now, w * 7);
      const ws = startOfWeek(ref, { weekStartsOn: 1 });
      const we = endOfWeek(ref, { weekStartsOn: 1 });
      const inWeek = sessions.filter((s) => {
        const t = new Date(s.startedAt);
        return t >= ws && t <= we;
      });
      weeklyTrend.push({
        week: format(ws, 'MMM d'),
        minutes: Math.round(inWeek.reduce((acc, s) => acc + s.duration, 0) / 60),
        sessions: inWeek.length,
      });
    }

    // --- Daily focus minutes for last 30 days (for consistency) ---
    const dayRange = eachDayOfInterval({ start: last30StartDay, end: startOfDay(now) });
    const dayMinutesMap = new Map<string, number>();
    for (const day of dayRange) {
      dayMinutesMap.set(format(day, 'yyyy-MM-dd'), 0);
    }
    for (const s of sessions) {
      const key = format(startOfDay(new Date(s.startedAt)), 'yyyy-MM-dd');
      dayMinutesMap.set(key, (dayMinutesMap.get(key) || 0) + s.duration / 60);
    }
    const dailyMinutes = Array.from(dayMinutesMap.values());
    const dailyMean = mean(dailyMinutes);
    const dailyStd = stdDev(dailyMinutes);
    const activeDays = dailyMinutes.filter((m) => m > 0).length;
    const consistencyScore =
      dailyMean > 0 ? clampPct(100 - (dailyStd / (dailyMean + 1)) * 50) : 0;

    // --- This week vs last week trend ---
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const lastWeekStart = subDays(thisWeekStart, 7);
    const lastWeekEnd = endOfWeek(lastWeekStart, { weekStartsOn: 1 });
    const thisWeekSessions = sessions.filter(
      (s) => new Date(s.startedAt) >= thisWeekStart && new Date(s.startedAt) <= thisWeekEnd
    );
    const lastWeekSessions = sessions.filter(
      (s) => new Date(s.startedAt) >= lastWeekStart && new Date(s.startedAt) <= lastWeekEnd
    );
    const thisWeekMinutes = Math.round(
      thisWeekSessions.reduce((acc, s) => acc + s.duration, 0) / 60
    );
    const lastWeekMinutes = Math.round(
      lastWeekSessions.reduce((acc, s) => acc + s.duration, 0) / 60
    );
    const weekOverWeekChange =
      lastWeekMinutes > 0
        ? Math.round(((thisWeekMinutes - lastWeekMinutes) / lastWeekMinutes) * 100)
        : thisWeekMinutes > 0
          ? 100
          : 0;

    // --- Reflection correlation: avg minutes on days with vs without reflections ---
    const reflectionDates = new Set(reflections.map((r) => r.date));
    const withReflection: number[] = [];
    const withoutReflection: number[] = [];
    for (const [dayStr, minutes] of dayMinutesMap.entries()) {
      if (reflectionDates.has(dayStr)) {
        withReflection.push(minutes);
      } else {
        withoutReflection.push(minutes);
      }
    }
    const avgWithReflection = mean(withReflection);
    const avgWithoutReflection = mean(withoutReflection);
    const reflectionDeltaPct =
      avgWithoutReflection > 0
        ? Math.round(((avgWithReflection - avgWithoutReflection) / avgWithoutReflection) * 100)
        : avgWithReflection > 0
          ? 100
          : 0;

    // --- Mission completion rate ---
    const totalMissions = missions.length;
    const completedMissions = missions.filter((m) => m.status === 'completed').length;
    const missionCompletionRate =
      totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0;

    // --- Average session length trend ---
    const avgSessionLengthMin =
      sessions.length > 0
        ? Math.round(
            sessions.reduce((acc, s) => acc + s.duration, 0) /
              sessions.length /
              60
          )
        : 0;

    // First-half vs second-half avg session length (trend within 30 days)
    const midIndex = Math.floor(sessions.length / 2);
    const firstHalf = sessions.slice(0, Math.max(midIndex, 1));
    const secondHalf = sessions.slice(Math.max(midIndex, 1));
    const firstHalfAvg =
      firstHalf.length > 0
        ? firstHalf.reduce((acc, s) => acc + s.duration, 0) / firstHalf.length / 60
        : 0;
    const secondHalfAvg =
      secondHalf.length > 0
        ? secondHalf.reduce((acc, s) => acc + s.duration, 0) / secondHalf.length / 60
        : 0;
    const sessionLengthTrendPct =
      firstHalfAvg > 0
        ? Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100)
        : 0;

    // --- Now build insights from real patterns ---
    const insights: Insight[] = [];

    // Insight 1: Best weekday
    let bestWeekdayIdx = -1;
    let bestWeekdayMinutes = 0;
    for (let i = 0; i < 7; i++) {
      if (weekdayMinutes[i] > bestWeekdayMinutes) {
        bestWeekdayMinutes = weekdayMinutes[i];
        bestWeekdayIdx = i;
      }
    }
    if (bestWeekdayIdx >= 0 && bestWeekdayMinutes > 0) {
      insights.push({
        type: 'pattern',
        title: `${WEEKDAY_LABELS[bestWeekdayIdx]} is your strongest day`,
        description: `You log the most focus time on ${WEEKDAY_LABELS[bestWeekdayIdx]} — ${Math.round(bestWeekdayMinutes)} minutes across ${weekdaySessionCount[bestWeekdayIdx]} session${weekdaySessionCount[bestWeekdayIdx] === 1 ? '' : 's'} in the last 30 days.`,
        metric: 'focus minutes',
        value: Math.round(bestWeekdayMinutes),
        icon: 'Calendar',
      });
    }

    // Insight 2: Best hour
    let bestHour = -1;
    let bestHourMinutes = 0;
    for (let h = 0; h < 24; h++) {
      if (focusByHour[h] > bestHourMinutes) {
        bestHourMinutes = focusByHour[h];
        bestHour = h;
      }
    }
    if (bestHour >= 0 && bestHourMinutes > 0) {
      const hourLabel = format(new Date().setHours(bestHour, 0, 0, 0), 'h a');
      insights.push({
        type: 'pattern',
        title: `Peak focus hour is ${hourLabel}`,
        description: `You accumulate the most focus time starting around ${hourLabel} — ${Math.round(bestHourMinutes)} minutes in the last 30 days. Schedule your hardest work in this window.`,
        metric: 'focus minutes',
        value: Math.round(bestHourMinutes),
        icon: 'Clock',
      });
    }

    // Insight 3: Afternoon dip — check hours 13-16 vs hours 9-11
    const morningMinutes = focusByHour[9] + focusByHour[10] + focusByHour[11];
    const afternoonMinutes = focusByHour[13] + focusByHour[14] + focusByHour[15] + focusByHour[16];
    if (morningMinutes > 0 && afternoonMinutes < morningMinutes * 0.5) {
      insights.push({
        type: 'pattern',
        title: 'You lose focus every afternoon',
        description: `Your afternoon focus time (${Math.round(afternoonMinutes)} min between 1-5 PM) is ${Math.round(((morningMinutes - afternoonMinutes) / morningMinutes) * 100)}% lower than your morning peak (${Math.round(morningMinutes)} min between 9-11 AM). Try a 10-minute walk or lighter tasks after lunch.`,
        metric: 'afternoon dip',
        value: `${Math.round(afternoonMinutes)} min`,
        icon: 'Sunset',
      });
    }

    // Insight 4: Reflection correlation
    if (withReflection.length >= 2 && withoutReflection.length >= 2) {
      if (reflectionDeltaPct > 10) {
        insights.push({
          type: 'trend',
          title: 'Reflection improves your focus',
          description: `Days where you wrote a reflection averaged ${Math.round(avgWithReflection)} focus minutes vs ${Math.round(avgWithoutReflection)} on days without — a ${reflectionDeltaPct}% boost.`,
          metric: 'focus boost',
          value: `${reflectionDeltaPct}%`,
          icon: 'PenLine',
        });
      } else if (reflectionDeltaPct < -10) {
        insights.push({
          type: 'trend',
          title: 'Reflection days show lower focus',
          description: `Interestingly, days with reflections averaged ${Math.round(avgWithReflection)} min vs ${Math.round(avgWithoutReflection)} min without (${reflectionDeltaPct}%). Reflections may be falling on lighter days — try writing them even on heavy focus days.`,
          metric: 'focus delta',
          value: `${reflectionDeltaPct}%`,
          icon: 'PenLine',
        });
      }
    }

    // Insight 5: Week-over-week trend
    if (lastWeekMinutes > 0 || thisWeekMinutes > 0) {
      if (weekOverWeekChange > 0) {
        insights.push({
          type: 'trend',
          title: 'Your focus is trending up this week',
          description: `This week you've logged ${thisWeekMinutes} minutes vs ${lastWeekMinutes} last week — a ${weekOverWeekChange}% increase. Keep the momentum going.`,
          metric: 'week-over-week',
          value: `+${weekOverWeekChange}%`,
          icon: 'TrendingUp',
        });
      } else if (weekOverWeekChange < 0) {
        insights.push({
          type: 'trend',
          title: 'Focus is down vs last week',
          description: `This week's ${thisWeekMinutes} minutes is ${Math.abs(weekOverWeekChange)}% below last week's ${lastWeekMinutes}. A single deep work session will close the gap.`,
          metric: 'week-over-week',
          value: `${weekOverWeekChange}%`,
          icon: 'TrendingDown',
        });
      } else {
        insights.push({
          type: 'trend',
          title: 'Focus is steady week-over-week',
          description: `You've matched last week's ${lastWeekMinutes} minutes this week. Consistency is good — try a slightly longer session tomorrow to break the plateau.`,
          metric: 'week-over-week',
          value: '0%',
          icon: 'Activity',
        });
      }
    }

    // Insight 6: Consistency
    if (activeDays >= 7) {
      insights.push({
        type: 'pattern',
        title: `You've focused on ${activeDays} of the last 30 days`,
        description: `Daily average is ${Math.round(dailyMean)} min with a standard deviation of ${Math.round(dailyStd)} min. Consistency score: ${consistencyScore}/100. ${consistencyScore >= 70 ? 'Strong, reliable routine.' : 'Try to even out your daily totals for a more reliable rhythm.'}`,
        metric: 'consistency',
        value: `${consistencyScore}/100`,
        icon: 'Repeat',
      });
    } else if (sessions.length > 0) {
      insights.push({
        type: 'suggestion',
        title: 'Build a more consistent habit',
        description: `You've focused on ${activeDays} of the last 30 days (avg ${Math.round(dailyMean)} min/day on active days). Aim for daily sessions — even 15 minutes builds the streak.`,
        metric: 'active days',
        value: `${activeDays}/30`,
        icon: 'Repeat',
      });
    }

    // Insight 7: Session length trend
    if (firstHalfAvg > 0 && secondHalfAvg > 0 && Math.abs(sessionLengthTrendPct) >= 10) {
      if (sessionLengthTrendPct > 0) {
        insights.push({
          type: 'trend',
          title: 'Your sessions are getting longer',
          description: `Average session length grew from ${Math.round(firstHalfAvg)} min to ${Math.round(secondHalfAvg)} min over the last 30 days (+${sessionLengthTrendPct}%). You're building deeper focus capacity.`,
          metric: 'session length',
          value: `+${sessionLengthTrendPct}%`,
          icon: 'Timer',
        });
      } else {
        insights.push({
          type: 'trend',
          title: 'Your sessions are getting shorter',
          description: `Average session length dropped from ${Math.round(firstHalfAvg)} min to ${Math.round(secondHalfAvg)} min (${sessionLengthTrendPct}%). Consider scheduling one longer deep work block to rebuild capacity.`,
          metric: 'session length',
          value: `${sessionLengthTrendPct}%`,
          icon: 'Timer',
        });
      }
    }

    // Insight 8: Mission completion rate
    if (totalMissions > 0) {
      insights.push({
        type: 'achievement',
        title: `Mission completion rate: ${missionCompletionRate}%`,
        description: `You've completed ${completedMissions} of ${totalMissions} missions created in the last 30 days. ${missionCompletionRate >= 70 ? 'Excellent follow-through.' : missionCompletionRate >= 40 ? 'Decent, but consider fewer missions with sharper focus.' : 'Consider finishing older missions before adding new ones.'}`,
        metric: 'completion rate',
        value: `${missionCompletionRate}%`,
        icon: 'Target',
      });
    }

    // Insight 9: Overall volume (achievement-level)
    if (sessions.length > 0) {
      const totalMin = Math.round(sessions.reduce((acc, s) => acc + s.duration, 0) / 60);
      insights.push({
        type: 'achievement',
        title: `${totalMin} minutes focused in 30 days`,
        description: `Across ${sessions.length} session${sessions.length === 1 ? '' : 's'} (avg ${avgSessionLengthMin} min each). ${totalMin >= 1500 ? "Outstanding volume — that's 25+ hours of deep work." : totalMin >= 600 ? 'Solid month. Push for one extra session per day to break 1500.' : 'Getting started — small consistent blocks add up.'}`,
        metric: 'total minutes',
        value: totalMin,
        icon: 'Award',
      });
    }

    // Insight 10: First-time user / sparse data suggestion
    if (sessions.length === 0) {
      insights.push({
        type: 'suggestion',
        title: 'Start your first focus session',
        description: 'No focus sessions in the last 30 days. Pick a 25-minute block, silence notifications, and start your first mission — your insights will populate from real data.',
        metric: 'sessions',
        value: 0,
        icon: 'Sparkles',
      });
    }

    // Sort: pattern/trend first, achievement/suggestion last (keep stable)
    const typeOrder = { pattern: 0, trend: 1, achievement: 2, suggestion: 3 };
    insights.sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);

    return NextResponse.json({
      insights,
      focusByHour: focusByHourRounded,
      focusByWeekday,
      weeklyTrend,
      meta: {
        totalSessions: sessions.length,
        totalReflections: reflections.length,
        activeDays,
        dailyMeanMinutes: Math.round(dailyMean),
        dailyStdDevMinutes: Math.round(dailyStd),
        consistencyScore,
        avgSessionLengthMin,
        missionCompletionRate,
        weekOverWeekChange,
        reflectionDeltaPct,
      },
    });
  } catch (e) {
    console.error('[insights] error', e);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}

function clampPct(pct: number): number {
  return Math.max(0, Math.min(100, Math.round(pct)));
}
