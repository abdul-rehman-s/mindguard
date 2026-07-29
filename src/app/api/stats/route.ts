import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { calculateStreak, calculateFocusScore, calculateSmartFocusScore, getFocusScoreColor } from "@/lib/analytics";
import { logError } from "@/lib/logger";
import { format, subDays, startOfDay, endOfDay, isSameDay, startOfWeek } from "date-fns";
import type { ActivityType } from "@/types";

const PRODUCTIVE_ACTIVITY_TYPES: ActivityType[] = ["focus", "deep_work", "learning", "coding", "writing"];
const DISTRACTED_ACTIVITY_TYPES: ActivityType[] = ["distracted", "browsing", "entertainment", "gaming", "app_usage", "website_usage"];

export async function GET() {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const yesterdayStart = startOfDay(subDays(now, 1));
    const yesterdayEnd = endOfDay(subDays(now, 1));
    const weekAgo = subDays(now, 6);
    const twoWeeksAgo = subDays(now, 13);

    const [
      sessions,
      recentSessions,
      activeMission,
      streak,
      todayActivities,
      yesterdaySessions,
      lastWeekSessions,
      yesterdayActivities,
      userRecord,
      userSettingsRecord,
    ] = await Promise.all([
      db.focusSession.findMany({
        where: {
          userId,
          startedAt: { gte: weekAgo },
        },
        select: { id: true, duration: true, startedAt: true, missionId: true },
        orderBy: { startedAt: "desc" },
      }),
      db.focusSession.findMany({
        where: { userId },
        include: { mission: { select: { id: true, title: true } } },
        orderBy: { startedAt: "desc" },
        take: 10,
      }),
      db.mission.findFirst({
        where: { userId, status: "active" },
        include: { focusSessions: true },
      }),
      calculateStreak(userId),
      // Desktop activities today for enhanced stats
      db.desktopActivity.findMany({
        where: { userId, startedAt: { gte: todayStart } },
        select: { id: true, duration: true, type: true, application: true, category: true, startedAt: true },
        orderBy: { startedAt: "desc" },
        take: 50,
      }),
      // Yesterday's focus sessions for trend
      db.focusSession.findMany({
        where: { userId, startedAt: { gte: yesterdayStart, lte: yesterdayEnd } },
        select: { id: true, duration: true, startedAt: true },
      }),
      // Last week's sessions for trend comparison
      db.focusSession.findMany({
        where: { userId, startedAt: { gte: twoWeeksAgo, lte: weekAgo } },
        select: { id: true, duration: true, startedAt: true },
      }),
      // Yesterday's desktop activities
      db.desktopActivity.findMany({
        where: { userId, startedAt: { gte: yesterdayStart, lte: yesterdayEnd } },
        select: { id: true, duration: true, type: true },
      }),
      // User personalization data
      db.user.findUnique({
        where: { id: userId },
        select: {
          primaryUse: true,
          workSchedule: true,
          goals: true,
          focusGoalMinutes: true,
          biggestDistraction: true,
          displayName: true,
          name: true,
        },
      }),
      // User settings for focus goal fallback
      db.userSettings.findUnique({
        where: { userId },
        select: { focusGoalMinutes: true },
      }),
    ]);

    const todaySessions = sessions.filter((s) =>
      isSameDay(new Date(s.startedAt), now)
    );
    const todayMinutes = Math.round(
      todaySessions.reduce((acc, s) => acc + s.duration, 0) / 60
    );
    const weeklyMinutes = Math.round(
      sessions.reduce((acc, s) => acc + s.duration, 0) / 60
    );

    // Include desktop productive minutes in today's focus
    const desktopProductiveMinutes = Math.round(
      todayActivities.filter((a) => PRODUCTIVE_ACTIVITY_TYPES.includes(a.type as ActivityType))
        .reduce((acc, a) => acc + a.duration, 0) / 60
    );
    const todayFocusMinutes = todayMinutes + desktopProductiveMinutes;

    // Yesterday's total focus (sessions + desktop productive)
    const yesterdayFocusMinutes = Math.round(
      yesterdaySessions.reduce((acc, s) => acc + s.duration, 0) / 60
    ) + Math.round(
      yesterdayActivities.filter((a) => PRODUCTIVE_ACTIVITY_TYPES.includes(a.type as ActivityType))
        .reduce((acc, a) => acc + a.duration, 0) / 60
    );

    // Last week's total focus (for week-over-week trend)
    const lastWeekFocusMinutes = Math.round(
      lastWeekSessions.reduce((acc, s) => acc + s.duration, 0) / 60
    );

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = subDays(now, 6 - i);
      const daySessions = sessions.filter((s) =>
        isSameDay(new Date(s.startedAt), day)
      );
      return {
        day: format(day, "EEE"),
        minutes: Math.round(
          daySessions.reduce((acc, s) => acc + s.duration, 0) / 60
        ),
        sessions: daySessions.length,
      };
    });

    const totalMinutes = Math.round(
      sessions.reduce((acc, s) => acc + s.duration, 0) / 60
    );

    const focusScore = calculateFocusScore(todayFocusMinutes, weeklyMinutes, streak);

    // ─── Smart Focus Score calculation ───
    // Gather mood data from recent reflections
    const recentReflections = await db.dailyReflection.findMany({
      where: {
        userId,
        date: { gte: format(subDays(now, 6), "yyyy-MM-dd") },
        mood: { not: null },
      },
      select: { mood: true, date: true },
    });

    const moodValues = recentReflections
      .map(r => r.mood)
      .filter((m): m is number => m !== null && m !== 0);
    const moodAverage = moodValues.length > 0 ? moodValues.reduce((a, b) => a + b, 0) / moodValues.length : 0;

    // Reflection rate: days with reflections / total days in last week
    const allWeekReflections = await db.dailyReflection.findMany({
      where: {
        userId,
        date: { gte: format(subDays(now, 6), "yyyy-MM-dd") },
      },
      select: { date: true },
    });
    const reflectionRate = allWeekReflections.length / 7;

    // ─── Personalization & focus goal (needed early for smart score) ───
    const primaryUse = userRecord?.primaryUse || null;
    const workSchedule = userRecord?.workSchedule || null;
    let goals: string[] = [];
    if (userRecord?.goals) {
      try { goals = JSON.parse(userRecord.goals); } catch { goals = []; }
    }
    const focusGoalMinutes = userRecord?.focusGoalMinutes || userSettingsRecord?.focusGoalMinutes || 120;
    const biggestDistraction = userRecord?.biggestDistraction || null;

    // Planned sessions estimate: based on user's focus goal and average session length
    const avgSessionLen = sessions.length > 0 ? totalMinutes / sessions.length : 25;
    const plannedSessions = focusGoalMinutes > 0 ? Math.round(focusGoalMinutes / avgSessionLen) : 4;

    const smartFocusScore = calculateSmartFocusScore({
      focusMinutes: todayFocusMinutes,
      focusGoalMinutes,
      completedSessions: todaySessions.length,
      plannedSessions,
      streakLength: streak,
      moodAverage,
      reflectionRate,
    });

    // Yesterday's smart score for trend
    const yesterdayReflections = await db.dailyReflection.findMany({
      where: {
        userId,
        date: { gte: format(subDays(now, 1), "yyyy-MM-dd"), lte: format(subDays(now, 1), "yyyy-MM-dd") },
        mood: { not: null },
      },
      select: { mood: true },
    });
    const yesterdayMoodValues = yesterdayReflections
      .map(r => r.mood)
      .filter((m): m is number => m !== null && m !== 0);
    const yesterdayMoodAvg = yesterdayMoodValues.length > 0 ? yesterdayMoodValues.reduce((a, b) => a + b, 0) / yesterdayMoodValues.length : 0;
    const yesterdaySessionCount = yesterdaySessions.length;
    const yesterdaySmartScore = calculateSmartFocusScore({
      focusMinutes: yesterdayFocusMinutes,
      focusGoalMinutes,
      completedSessions: yesterdaySessionCount,
      plannedSessions,
      streakLength: Math.max(streak - 1, 0),
      moodAverage: yesterdayMoodAvg,
      reflectionRate: yesterdaySessionCount > 0 ? 0.5 : 0,
    });

    const smartScoreColor = getFocusScoreColor(smartFocusScore);
    const smartScoreTrend = smartFocusScore - yesterdaySmartScore; // positive = improving

    // Distraction summary from desktop tracker
    const distractedActivities = todayActivities.filter((a) =>
      DISTRACTED_ACTIVITY_TYPES.includes(a.type as ActivityType)
    );
    const todayDistractionMinutes = Math.round(
      distractedActivities.reduce((acc, a) => acc + a.duration, 0) / 60
    );
    // Top distraction apps (aggregate by application name)
    const distractionAppMap: Record<string, number> = {};
    for (const a of distractedActivities) {
      const appName = a.application || a.category || a.type;
      if (appName) {
        distractionAppMap[appName] = (distractionAppMap[appName] || 0) + Math.round(a.duration / 60);
      }
    }
    const todayDistractionTopApps = Object.entries(distractionAppMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, minutes]) => ({ name, minutes }));

    // Best focus hours — find hours with most focus sessions historically
    const allSessionsForHours = await db.focusSession.findMany({
      where: { userId },
      select: { startedAt: true, duration: true },
      orderBy: { startedAt: "desc" },
      take: 100,
    });
    const hourMap: Record<number, number> = {};
    for (const s of allSessionsForHours) {
      const h = new Date(s.startedAt).getHours();
      hourMap[h] = (hourMap[h] || 0) + Math.round(s.duration / 60);
    }
    const bestFocusHours = Object.entries(hourMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([h]) => parseInt(h));

    // (Personalization data already computed above for smart score)

    const weekStartMon = startOfWeek(now, { weekStartsOn: 1 });
    const [
      unlockedAchievementCount,
      todayReflectionRecord,
      weeklyMissionsCompleted,
      totalMissionCount,
    ] = await Promise.all([
      db.achievement.count({ where: { userId } }),
      db.dailyReflection.findUnique({
        where: {
          userId_date: { userId, date: format(now, "yyyy-MM-dd") },
        },
        select: { id: true },
      }),
      db.mission.count({
        where: {
          userId,
          status: "completed",
          completedAt: { gte: weekStartMon },
        },
      }),
      db.mission.count({ where: { userId, status: "completed" } }),
    ]);

    // Current application (from desktop activities)
    const currentApp = todayActivities.length > 0
      ? todayActivities[0].application || todayActivities[0].type
      : null;

    return NextResponse.json({
      todayFocusMinutes,
      weeklyFocusMinutes: weeklyMinutes,
      totalFocusMinutes: totalMinutes,
      currentStreak: streak,
      focusScore,
      totalSessions: sessions.length,
      todaySessions: todaySessions.length,
      avgSessionMinutes: sessions.length > 0 ? Math.round(totalMinutes / sessions.length) : 0,
      bestDay: weekDays.reduce((best, d) => d.minutes > best.minutes ? d : best, weekDays[0]),
      weeklyData: weekDays,
      recentSessions,
      activeMission,
      achievementProgress: unlockedAchievementCount,
      todayReflection: !!todayReflectionRecord,
      weeklyMissionsCompleted,
      totalMissionsCompleted: totalMissionCount,
      currentApp,
      desktopActivityCount: todayActivities.length,
      // New fields
      yesterdayFocusMinutes,
      lastWeekFocusMinutes,
      primaryUse,
      workSchedule,
      goals,
      focusGoalMinutes,
      biggestDistraction,
      todayDistractionMinutes,
      todayDistractionTopApps,
      bestFocusHours,
      smartFocusScore,
      smartScoreColor,
      smartScoreTrend,
    });
  } catch (e) {
    logError("stats", "Failed to fetch stats", e);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
