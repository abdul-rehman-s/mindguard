import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { logError } from '@/lib/logger';
import { format, startOfDay, endOfDay, subDays, startOfWeek, isSameDay } from 'date-fns';

export async function GET() {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const todayStr = format(now, 'yyyy-MM-dd');
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });

    const [todaySessions, weekSessions, missions, reflection, activities, achievements] = await Promise.all([
      db.focusSession.findMany({
        where: { userId, startedAt: { gte: todayStart, lte: todayEnd } },
        orderBy: { startedAt: 'asc' },
      }),
      db.focusSession.findMany({
        where: { userId, startedAt: { gte: weekStart } },
        select: { startedAt: true, duration: true },
      }),
      db.mission.findMany({ where: { userId } }),
      db.dailyReflection.findUnique({
        where: { userId_date: { userId, date: todayStr } },
      }),
      db.desktopActivity.findMany({
        where: { userId, startedAt: { gte: todayStart, lte: todayEnd } },
        orderBy: { startedAt: 'asc' },
      }),
      db.achievement.findMany({
        where: { userId, unlockedAt: { gte: todayStart } },
        select: { type: true },
      }),
    ]);

    // Focus summary
    const totalFocusMinutes = Math.round(todaySessions.reduce((a, s) => a + s.duration, 0) / 60);
    const sessionCount = todaySessions.length;
    const longestSession = todaySessions.length > 0
      ? Math.round(Math.max(...todaySessions.map((s) => s.duration)) / 60)
      : 0;
    const avgSessionLength = sessionCount > 0 ? Math.round(totalFocusMinutes / sessionCount) : 0;
    const deepWorkSessions = todaySessions.filter((s) => s.duration >= 5400).length;

    // Mission summary
    const todayMissions = missions.filter((m) =>
      m.completedAt && isSameDay(new Date(m.completedAt), now)
    );
    const todayCreatedMissions = missions.filter((m) =>
      isSameDay(new Date(m.createdAt), now)
    );
    const activeMissions = missions.filter((m) => m.status === 'active');

    // Laptop/activity summary
    const totalActivityMinutes = Math.round(activities.reduce((a, act) => a + act.duration, 0) / 60);
    const productiveMinutes = Math.round(
      activities.filter((a) => a.type === 'focus' || a.type === 'deep_work').reduce((a, act) => a + act.duration, 0) / 60
    );
    const distractedMinutes = Math.round(
      activities.filter((a) => a.type === 'distracted' || a.type === 'app_usage' || a.type === 'website_usage').reduce((a, act) => a + act.duration, 0) / 60
    );
    const idleMinutes = Math.round(
      activities.filter((a) => a.type === 'idle').reduce((a, act) => a + act.duration, 0) / 60
    );

    // Distraction summary
    const distractionActivities = activities.filter(
      (a) => a.type === 'distracted' || a.type === 'app_usage' || a.type === 'website_usage'
    );
    const distractionMap = new Map<string, number>();
    for (const da of distractionActivities) {
      const key = da.title || da.application || da.website || da.type;
      distractionMap.set(key, (distractionMap.get(key) || 0) + da.duration / 60);
    }
    const topDistractions = Array.from(distractionMap.entries())
      .map(([title, minutes]) => ({ title, minutes: Math.round(minutes) }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 5);

    // Peak distraction hour
    const distractionByHour = new Array(24).fill(0);
    for (const da of distractionActivities) {
      distractionByHour[new Date(da.startedAt).getHours()] += da.duration / 60;
    }
    let peakDistractionHour: number | null = null;
    let peakDistractionVal = 0;
    for (let h = 0; h < 24; h++) {
      if (distractionByHour[h] > peakDistractionVal) {
        peakDistractionVal = distractionByHour[h];
        peakDistractionHour = h;
      }
    }

    // XP calculation (approximate)
    const xpGained = sessionCount * 25 + (longestSession >= 90 ? 50 : 0) + (reflection ? 30 : 0) + todayMissions.length * 100;

    // Hourly chart for today
    const hourlyChart = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      minutes: Math.round(
        todaySessions
          .filter((s) => new Date(s.startedAt).getHours() === h)
          .reduce((a, s) => a + s.duration, 0) / 60
      ),
    }));

    // Week comparison
    const weekMinutes = Math.round(weekSessions.reduce((a, s) => a + s.duration, 0) / 60);
    const weekDays = new Set(weekSessions.map((s) => format(startOfDay(new Date(s.startedAt)), 'yyyy-MM-dd'))).size;
    const weekAvgMinutes = weekDays > 0 ? Math.round(weekMinutes / Math.min(weekDays, 7)) : 0;
    const todayTotal = Math.round(todaySessions.reduce((a, s) => a + s.duration, 0) / 60);
    const weekChange = weekAvgMinutes > 0
      ? Math.round(((todayTotal - weekAvgMinutes) / weekAvgMinutes) * 100)
      : todayTotal > 0 ? 100 : 0;

    // Build timeline
    const timeline: { time: string; event: string; type: string; duration?: number }[] = [];
    for (const s of todaySessions) {
      const h = format(new Date(s.startedAt), 'h:mm a');
      timeline.push({ time: h, event: `Focus: ${s.missionId ? 'Mission' : 'Free Focus'}`, type: 'session', duration: Math.round(s.duration / 60) });
    }
    if (reflection) {
      timeline.push({ time: format(new Date(reflection.updatedAt), 'h:mm a'), event: 'Daily reflection written', type: 'reflection' });
    }
    for (const m of todayMissions) {
      timeline.push({ time: format(new Date(m.completedAt!), 'h:mm a'), event: `Mission completed: ${m.title}`, type: 'achievement' });
    }
    for (const a of achievements) {
      timeline.push({ time: '', event: `Achievement unlocked: ${a.type}`, type: 'achievement' });
    }
    timeline.sort((a, b) => (a.time || 'z').localeCompare(b.time || 'z'));

    // AI recommendation based on real data
    let aiRecommendation = '';
    if (sessionCount === 0) {
      aiRecommendation = 'No focus sessions today. Start with a short 25-minute session to build momentum. Small wins compound into big results.';
    } else if (totalFocusMinutes < 60) {
      aiRecommendation = `You've logged ${totalFocusMinutes} minutes today. Try one more 25-minute session to reach at least 60 minutes — that's where the real compounding begins.`;
    } else if (!reflection) {
      aiRecommendation = `Great focus today (${totalFocusMinutes}m across ${sessionCount} sessions). Writing a reflection will help you understand what worked and build on it tomorrow.`;
    } else if (distractedMinutes > productiveMinutes && distractedMinutes > 0) {
      aiRecommendation = `Distractions outweighed productive time today (${distractedMinutes}m distracted vs ${productiveMinutes}m productive). Try blocking distracting sites during your next focus block.`;
    } else if (longestSession >= 90) {
      aiRecommendation = `Outstanding deep work today! Your longest session was ${longestSession} minutes. You're building serious focus capacity. Keep it up.`;
    } else {
      aiRecommendation = `Solid day with ${totalFocusMinutes} minutes of focus. ${avgSessionLength < 30 ? 'Try extending your sessions gradually — even adding 5 minutes per session builds deep work capacity.' : 'Your session consistency is strong. Keep this rhythm going.'}`;
    }

    return NextResponse.json({
      date: todayStr,
      focusSummary: {
        totalMinutes: totalFocusMinutes,
        sessionCount,
        longestSession,
        avgSessionLength,
        deepWorkSessions,
      },
      missionSummary: {
        completed: todayMissions.length,
        created: todayCreatedMissions.length,
        active: activeMissions.length,
      },
      reflection: {
        written: !!reflection,
        mood: reflection?.mood ?? null,
        energy: reflection?.energy ?? null,
        distraction: reflection?.distraction ?? null,
        wentWell: reflection?.wentWell ?? null,
      },
      laptopSummary: {
        totalMinutes: totalActivityMinutes,
        productiveMinutes,
        distractedMinutes,
        idleMinutes,
      },
      distractionSummary: {
        totalDistractedMinutes: distractedMinutes,
        topDistractions,
        peakDistractionHour,
      },
      xpGained,
      achievementsUnlocked: achievements.map((a) => ({ type: a.type, title: a.type, icon: '🏆' })),
      timeline,
      aiRecommendation,
      hourlyChart,
      weekComparison: {
        todayMinutes: todayTotal,
        weekAvgMinutes,
        change: weekChange,
      },
    });
  } catch (e) {
    logError("daily-review", "Failed to load daily review", e);
    return NextResponse.json({ error: 'Failed to load daily review' }, { status: 500 });
  }
}
