import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { startOfDay, endOfDay } from "date-fns";
import type { ActivityType } from "@/types";

const PRODUCTIVE_TYPES: ActivityType[] = ["focus", "deep_work", "learning", "coding", "writing"];
const DISTRACTED_TYPES: ActivityType[] = ["distracted", "browsing", "entertainment", "gaming", "website_usage"];
const IDLE_TYPES: ActivityType[] = ["idle", "break"];

/** GET — Productivity metrics calculated from desktop activity data */
export async function GET() {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    // Get today's desktop activities
    const activities = await db.desktopActivity.findMany({
      where: {
        userId,
        startedAt: { gte: todayStart, lte: todayEnd },
      },
      orderBy: { startedAt: "asc" },
    });

    // Get today's focus sessions
    const sessions = await db.focusSession.findMany({
      where: {
        userId,
        startedAt: { gte: todayStart },
        type: { not: "break" },
      },
      select: { duration: true, startedAt: true },
    });

    // Calculate productive minutes
    const productiveSeconds = activities
      .filter((a) => PRODUCTIVE_TYPES.includes(a.type as ActivityType))
      .reduce((acc, a) => acc + a.duration, 0)
      + sessions.reduce((acc, s) => acc + s.duration, 0);
    const productiveMinutes = Math.round(productiveSeconds / 60);

    // Calculate distracted minutes
    const distractedSeconds = activities
      .filter((a) => DISTRACTED_TYPES.includes(a.type as ActivityType))
      .reduce((acc, a) => acc + a.duration, 0);
    const distractedMinutes = Math.round(distractedSeconds / 60);

    // Calculate idle minutes
    const idleSeconds = activities
      .filter((a) => IDLE_TYPES.includes(a.type as ActivityType))
      .reduce((acc, a) => acc + a.duration, 0);
    const idleMinutes = Math.round(idleSeconds / 60);

    // Deep work sessions (activities with type "deep_work" or sessions >= 90 min)
    const deepWorkActivities = activities.filter((a) => a.type === "deep_work");
    const deepWorkSessions = sessions.filter((s) => s.duration >= 5400); // 90 min
    const deepWorkSessionsCount = deepWorkActivities.length + deepWorkSessions.length;

    // Context switches — count transitions between different applications
    let contextSwitches = 0;
    let lastApp: string | null = null;
    for (const a of activities) {
      const currentApp = a.application || a.type;
      if (lastApp !== null && currentApp !== lastApp) {
        contextSwitches++;
      }
      lastApp = currentApp;
    }

    // Longest focus session
    const longestSession = sessions.length > 0
      ? Math.round(Math.max(...sessions.map((s) => s.duration)) / 60)
      : activities.filter((a) => PRODUCTIVE_TYPES.includes(a.type as ActivityType)).length > 0
        ? Math.round(Math.max(...activities.filter((a) => PRODUCTIVE_TYPES.includes(a.type as ActivityType)).map((a) => a.duration)) / 60)
        : 0;

    // Focus ratio
    const totalActiveSeconds = productiveSeconds + distractedSeconds;
    const focusRatio = totalActiveSeconds > 0
      ? Math.round((productiveSeconds / totalActiveSeconds) * 100)
      : 0;

    // Best and worst hour — based on productive minutes per hour
    const hourMap = new Map<number, number>();
    for (const a of activities) {
      const hour = new Date(a.startedAt).getHours();
      if (PRODUCTIVE_TYPES.includes(a.type as ActivityType)) {
        hourMap.set(hour, (hourMap.get(hour) || 0) + a.duration / 60);
      } else if (DISTRACTED_TYPES.includes(a.type as ActivityType)) {
        hourMap.set(hour, (hourMap.get(hour) || 0) - a.duration / 60);
      }
    }
    for (const s of sessions) {
      const hour = new Date(s.startedAt).getHours();
      hourMap.set(hour, (hourMap.get(hour) || 0) + s.duration / 60);
    }

    let bestHour: number | null = null;
    let worstHour: number | null = null;
    let bestVal = -Infinity;
    let worstVal = Infinity;
    for (const [h, val] of hourMap) {
      if (val > bestVal) { bestVal = val; bestHour = h; }
      if (val < worstVal) { worstVal = val; worstHour = h; }
    }

    return NextResponse.json({
      productiveMinutes,
      distractedMinutes,
      idleMinutes,
      deepWorkSessions: deepWorkSessionsCount,
      contextSwitches,
      longestFocusSession: longestSession,
      focusRatio,
      bestHour: bestVal > -Infinity ? bestHour : null,
      worstHour: worstVal < Infinity ? worstHour : null,
    });
  } catch (e) {
    logError("desktop-productivity", "Failed to get productivity metrics", e);
    return NextResponse.json({ error: "Failed to get productivity metrics" }, { status: 500 });
  }
}
