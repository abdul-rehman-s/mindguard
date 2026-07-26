import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { format, subDays, startOfDay, endOfDay, isSameDay, startOfWeek } from "date-fns";

async function getUserId(): Promise<string | NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = session.user as Record<string, unknown>;
  return user.id as string;
}

export async function GET() {
  const userId = await getUserId();
  if (userId instanceof NextResponse) return userId;

  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekAgo = subDays(now, 6);

    const sessions = await db.focusSession.findMany({
      where: {
        userId,
        startedAt: { gte: weekAgo },
      },
      orderBy: { startedAt: "desc" },
    });

    const todaySessions = sessions.filter((s) =>
      isSameDay(new Date(s.startedAt), now)
    );
    const todayMinutes = Math.round(
      todaySessions.reduce((acc, s) => acc + s.duration, 0) / 60
    );
    const weeklyMinutes = Math.round(
      sessions.reduce((acc, s) => acc + s.duration, 0) / 60
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

    let streak = 0;
    let checkDate = startOfDay(now);
    const allSessions = await db.focusSession.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
      select: { startedAt: true },
    });

    const daysWithSessions = new Set(
      allSessions.map((s) => format(startOfDay(new Date(s.startedAt)), "yyyy-MM-dd"))
    );

    while (daysWithSessions.has(format(checkDate, "yyyy-MM-dd"))) {
      streak++;
      checkDate = subDays(checkDate, 1);
    }

    // Calculate total all-time minutes for streak scoring context
    const totalMinutes = Math.round(
      allSessions.reduce((acc, s) => acc + s.duration, 0) / 60
    );


    const focusScore =
      weeklyMinutes > 0
        ? Math.min(
            100,
            Math.round(
              (Math.min(todayMinutes, 480) / 480) * 40 +
                (Math.min(weeklyMinutes, 2400) / 2400) * 40 +
                (Math.min(streak, 30) / 30) * 20
            )
          )
        : 0;

    const recentSessions = await db.focusSession.findMany({
      where: { userId },
      include: { mission: { select: { id: true, title: true } } },
      orderBy: { startedAt: "desc" },
      take: 10,
    });

    const activeMission = await db.mission.findFirst({
      where: { userId, status: "active" },
      include: { focusSessions: true },
    });

    // --- New: achievement progress count, today's reflection, weekly missions completed ---
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

    return NextResponse.json({
      todayFocusMinutes: todayMinutes,
      weeklyFocusMinutes: weeklyMinutes,
      totalFocusMinutes: totalMinutes,
      currentStreak: streak,
      focusScore,
      totalSessions: allSessions.length,
      todaySessions: todaySessions.length,
      avgSessionMinutes: allSessions.length > 0 ? Math.round(totalMinutes / allSessions.length) : 0,
      bestDay: weekDays.reduce((best, d) => d.minutes > best.minutes ? d : best, weekDays[0]),
      weeklyData: weekDays,
      recentSessions,
      activeMission,
      achievementProgress: unlockedAchievementCount,
      todayReflection: !!todayReflectionRecord,
      weeklyMissionsCompleted,
      totalMissionsCompleted: totalMissionCount,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
