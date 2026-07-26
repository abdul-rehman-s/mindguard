import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { calculateStreak, calculateFocusScore } from '@/lib/analytics';
import { logError } from '@/lib/logger';
import { format, startOfDay, endOfDay, subDays, startOfWeek, isSameDay } from 'date-fns';
import type { ActivityType } from '@/types';

const PRODUCTIVE_TYPES: ActivityType[] = ['focus', 'deep_work', 'learning', 'coding', 'writing'];
const DISTRACTED_TYPES: ActivityType[] = ['distracted', 'browsing', 'entertainment', 'gaming', 'app_usage', 'website_usage'];
const IDLE_TYPES: ActivityType[] = ['idle', 'break'];

const CATEGORY_COLORS: Record<string, string> = {
  coding: 'text-emerald-400',
  design: 'text-purple-400',
  communication: 'text-sky-400',
  entertainment: 'text-rose-400',
  research: 'text-amber-400',
  writing: 'text-teal-400',
  meetings: 'text-indigo-400',
  learning: 'text-cyan-400',
  other: 'text-zinc-400',
};

export async function GET() {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekAgo = subDays(now, 6);

    const [sessions, activities, missions, user, achievements, reflections, streak, desktopSettings] = await Promise.all([
      // All sessions this week
      db.focusSession.findMany({
        where: { userId, startedAt: { gte: weekAgo } },
        select: { id: true, duration: true, startedAt: true, missionId: true, type: true },
        orderBy: { startedAt: 'desc' },
      }),
      // Desktop activities today
      db.desktopActivity.findMany({
        where: { userId, startedAt: { gte: todayStart, lte: todayEnd } },
        orderBy: { startedAt: 'desc' },
        take: 50,
      }),
      // All missions
      db.mission.findMany({
        where: { userId },
        select: { id: true, status: true },
      }),
      // User with XP/level
      db.user.findUnique({ where: { id: userId }, select: { xp: true, level: true } }),
      // Achievements
      db.achievement.count({ where: { userId } }),
      // Reflections this week
      db.dailyReflection.findMany({
        where: { userId, date: { gte: format(weekAgo, 'yyyy-MM-dd') } },
        select: { date: true },
      }),
      calculateStreak(userId),
      // Desktop settings (to show connection status)
      db.desktopSettings.findUnique({ where: { userId } }),
    ]);

    // Today's sessions
    const todaySessions = sessions.filter((s) => isSameDay(new Date(s.startedAt), now));
    const todayMinutes = Math.round(todaySessions.reduce((a, s) => a + s.duration, 0) / 60);
    const weeklyMinutes = Math.round(sessions.reduce((a, s) => a + s.duration, 0) / 60);

    // Desktop activity calculations (with expanded type support)
    const productiveMinutes = Math.round(
      activities.filter((a) => PRODUCTIVE_TYPES.includes(a.type as ActivityType)).reduce((a, act) => a + act.duration, 0) / 60
    ) + todayMinutes; // Include focus session minutes
    const distractedMinutes = Math.round(
      activities.filter((a) => DISTRACTED_TYPES.includes(a.type as ActivityType)).reduce((a, act) => a + act.duration, 0) / 60
    );
    const idleMinutes = Math.round(
      activities.filter((a) => IDLE_TYPES.includes(a.type as ActivityType)).reduce((a, act) => a + act.duration, 0) / 60
    );
    const deepWorkMinutes = Math.round(
      activities.filter((a) => a.type === 'deep_work').reduce((a, act) => a + act.duration, 0) / 60
    ) + Math.round(
      todaySessions.filter((s) => s.duration >= 5400).reduce((a, s) => a + s.duration, 0) / 60
    );

    // Total laptop time = all activities + all focus sessions
    const activityMinutes = activities.reduce((a, act) => a + act.duration, 0) / 60;
    const totalLaptopMinutes = Math.round(activityMinutes + todayMinutes);

    // Mission completion rate
    const completedMissions = missions.filter((m) => m.status === 'completed').length;
    const missionCompletionRate = missions.length > 0 ? Math.round((completedMissions / missions.length) * 100) : 0;

    // Attention score (using shared helper)
    const attentionScore = calculateFocusScore(todayMinutes, weeklyMinutes, streak);

    // Hourly distribution (today) — now includes desktop activities
    const hourlyDistribution = Array.from({ length: 24 }, (_, h) => {
      const sessionMinutes = Math.round(
        todaySessions
          .filter((s) => new Date(s.startedAt).getHours() === h)
          .reduce((a, s) => a + s.duration, 0) / 60
      );
      const activityMinutes = Math.round(
        activities
          .filter((a) => new Date(a.startedAt).getHours() === h && PRODUCTIVE_TYPES.includes(a.type as ActivityType))
          .reduce((a, act) => a + act.duration, 0) / 60
      );
      return { hour: h, minutes: sessionMinutes + activityMinutes };
    });

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

    // Recent activity feed — now includes app names
    const recentActivity = activities.slice(0, 10).map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title || a.application || a.type,
      startedAt: a.startedAt.toISOString(),
      duration: a.duration,
      application: a.application || undefined,
      website: a.website || undefined,
    }));

    // Desktop tracker connection status
    const trackerConnected = activities.length > 0;

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
      trackerConnected,
      desktopSettings: desktopSettings ? {
        trackingEnabled: desktopSettings.trackingEnabled,
        privacyMode: desktopSettings.privacyMode,
      } : null,
    });
  } catch (e) {
    logError("life-dashboard", "Failed to load life dashboard", e);
    return NextResponse.json({ error: 'Failed to load life dashboard' }, { status: 500 });
  }
}
