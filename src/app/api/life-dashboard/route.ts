import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { format, startOfDay, endOfDay, subDays, startOfWeek, isSameDay } from 'date-fns';

async function getUserId(): Promise<string | NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = session.user as Record<string, unknown>;
  return user.id as string;
}

const CATEGORY_COLORS: Record<string, string> = {
  coding: 'text-emerald-400',
  design: 'text-purple-400',
  communication: 'text-sky-400',
  entertainment: 'text-rose-400',
  research: 'text-amber-400',
  other: 'text-zinc-400',
};

export async function GET() {
  const userId = await getUserId();
  if (userId instanceof NextResponse) return userId;

  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekAgo = subDays(now, 6);

    const [sessions, activities, missions, user, achievements, reflections] = await Promise.all([
      // All sessions this week
      db.focusSession.findMany({
        where: { userId, startedAt: { gte: weekAgo } },
        orderBy: { startedAt: 'desc' },
      }),
      // Desktop activities today
      db.desktopActivity.findMany({
        where: { userId, startedAt: { gte: todayStart, lte: todayEnd } },
        orderBy: { startedAt: 'desc' },
        take: 50,
      }),
      // All missions
      db.mission.findMany({ where: { userId } }),
      // User with XP/level
      db.user.findUnique({ where: { id: userId }, select: { xp: true, level: true } }),
      // Achievements
      db.achievement.count({ where: { userId } }),
      // Reflections this week
      db.dailyReflection.findMany({
        where: { userId, date: { gte: format(weekAgo, 'yyyy-MM-dd') } },
        select: { date: true },
      }),
    ]);

    // Today's sessions
    const todaySessions = sessions.filter((s) => isSameDay(new Date(s.startedAt), now));
    const todayMinutes = Math.round(todaySessions.reduce((a, s) => a + s.duration, 0) / 60);
    const weeklyMinutes = Math.round(sessions.reduce((a, s) => a + s.duration, 0) / 60);

    // Desktop activity calculations
    const activityMinutes = activities.reduce((a, act) => a + act.duration, 0) / 60;
    const productiveMinutes = Math.round(
      activities.filter((a) => a.type === 'focus' || a.type === 'deep_work').reduce((a, act) => a + act.duration, 0) / 60
    );
    const distractedMinutes = Math.round(
      activities.filter((a) => a.type === 'distracted' || a.type === 'app_usage' || a.type === 'website_usage').reduce((a, act) => a + act.duration, 0) / 60
    );
    const idleMinutes = Math.round(
      activities.filter((a) => a.type === 'idle').reduce((a, act) => a + act.duration, 0) / 60
    );
    const deepWorkMinutes = Math.round(
      activities.filter((a) => a.type === 'deep_work').reduce((a, act) => a + act.duration, 0) / 60
    ) + Math.round(
      todaySessions.filter((s) => s.duration >= 5400).reduce((a, s) => a + s.duration, 0) / 60 // 90min+
    );

    // Total laptop time = all activities + all focus sessions
    const totalLaptopMinutes = Math.round(activityMinutes + todayMinutes);

    // Mission completion rate
    const completedMissions = missions.filter((m) => m.status === 'completed').length;
    const missionCompletionRate = missions.length > 0 ? Math.round((completedMissions / missions.length) * 100) : 0;

    // Streak
    const allSessionsForStreak = await db.focusSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      select: { startedAt: true },
    });
    const daysWithSessions = new Set(
      allSessionsForStreak.map((s) => format(startOfDay(new Date(s.startedAt)), 'yyyy-MM-dd'))
    );
    let streak = 0;
    let checkDate = startOfDay(now);
    while (daysWithSessions.has(format(checkDate, 'yyyy-MM-dd'))) {
      streak++;
      checkDate = subDays(checkDate, 1);
    }

    // Attention score
    const totalAllMinutes = Math.round(
      allSessionsForStreak.length > 0
        ? (await db.focusSession.findMany({ where: { userId }, select: { duration: true } })).reduce((a, s) => a + s.duration, 0) / 60
        : 0
    );
    const attentionScore =
      weeklyMinutes > 0
        ? Math.min(100, Math.round(
            (Math.min(todayMinutes, 480) / 480) * 40 +
            (Math.min(weeklyMinutes, 2400) / 2400) * 40 +
            (Math.min(streak, 30) / 30) * 20
          ))
        : 0;

    // Hourly distribution (today)
    const hourlyDistribution = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      minutes: Math.round(
        todaySessions
          .filter((s) => new Date(s.startedAt).getHours() === h)
          .reduce((a, s) => a + s.duration, 0) / 60
      ),
    }));

    // Category breakdown from desktop activities
    const categoryMap = new Map<string, number>();
    for (const act of activities) {
      const cat = act.category || 'other';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + act.duration / 60);
    }
    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, minutes]) => ({
        category,
        minutes: Math.round(minutes),
        color: CATEGORY_COLORS[category] || CATEGORY_COLORS.other,
      }))
      .sort((a, b) => b.minutes - a.minutes);

    // Recent activity feed
    const recentActivity = activities.slice(0, 10).map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title || a.type,
      startedAt: a.startedAt.toISOString(),
      duration: a.duration,
    }));

    return NextResponse.json({
      totalLaptopMinutes,
      productiveMinutes,
      distractedMinutes,
      idleMinutes,
      deepWorkMinutes,
      focusSessions: todaySessions.length,
      screenTimeMinutes: totalLaptopMinutes,
      missionCompletionRate,
      attentionScore,
      xp: user?.xp || 0,
      level: user?.level || 1,
      currentStreak: streak,
      todayFocusMinutes: todayMinutes,
      weeklyFocusMinutes: weeklyMinutes,
      hourlyDistribution,
      categoryBreakdown,
      recentActivity,
    });
  } catch (e) {
    console.error('[life-dashboard] error', e);
    return NextResponse.json({ error: 'Failed to load life dashboard' }, { status: 500 });
  }
}
