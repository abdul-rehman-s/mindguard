import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { calculateStreak, calculateFocusScore } from "@/lib/analytics";
import { logError } from "@/lib/logger";
import { format, subDays, startOfDay, isSameDay, startOfWeek } from "date-fns";
import type { ActivityType } from "@/types";

const PRODUCTIVE_ACTIVITY_TYPES: ActivityType[] = ["focus", "deep_work", "learning", "coding", "writing"];

export async function GET() {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekAgo = subDays(now, 6);

    const [sessions, recentSessions, activeMission, streak, todayActivities] = await Promise.all([
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
        select: { id: true, duration: true, type: true, application: true, startedAt: true },
        orderBy: { startedAt: "desc" },
        take: 20,
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
    });
  } catch (e) {
    logError("stats", "Failed to fetch stats", e);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
