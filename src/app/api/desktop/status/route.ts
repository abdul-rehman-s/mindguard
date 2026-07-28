import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { endOfDay, startOfDay, subMinutes } from "date-fns";
import type { ActivityType } from "@/types";

const PRODUCTIVE_TYPES: ActivityType[] = ["focus", "deep_work", "learning", "coding", "writing", "meetings"];
const DISTRACTED_TYPES: ActivityType[] = ["distracted", "browsing", "entertainment", "gaming", "app_usage", "website_usage"];

/** GET — Current desktop tracking status */
export async function GET(request: Request) {
  const userIdOr401 = await getAuthUserId(request);
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const now = new Date();
    const todayStart = startOfDay(now);

    // Get desktop settings
    const settings = await db.desktopSettings.findUnique({ where: { userId } });

    // Get the most recent activity in last 5 minutes
    const recentActivity = await db.desktopActivity.findFirst({
      where: {
        userId,
        startedAt: { gte: subMinutes(now, 5) },
      },
      orderBy: { startedAt: "desc" },
    });

    // Get activities from last 30 minutes to calculate idle time
    const recentActivities = await db.desktopActivity.findMany({
      where: {
        userId,
        startedAt: { gte: subMinutes(now, 30) },
      },
      orderBy: { startedAt: "desc" },
      take: 20,
    });

    // Calculate idle minutes from gap since last activity
    let idleMinutes = 0;
    if (recentActivity) {
      const lastActivityEnd = recentActivity.endedAt
        ? new Date(recentActivity.endedAt).getTime()
        : new Date(recentActivity.startedAt).getTime() + recentActivity.duration * 1000;
      idleMinutes = Math.max(0, Math.round((now.getTime() - lastActivityEnd) / 60000));
    } else {
      // No recent activity at all — check if any activity exists today
      const todayActivity = await db.desktopActivity.findFirst({
        where: { userId, startedAt: { gte: todayStart } },
        orderBy: { startedAt: "desc" },
      });
      if (todayActivity) {
        const lastEnd = todayActivity.endedAt
          ? new Date(todayActivity.endedAt).getTime()
          : new Date(todayActivity.startedAt).getTime() + todayActivity.duration * 1000;
        idleMinutes = Math.max(0, Math.round((now.getTime() - lastEnd) / 60000));
      } else {
        idleMinutes = 0; // No data yet, not idle — just no tracker connected
      }
    }

    // Determine current activity type from recent activity
    let currentActivityType: ActivityType | null = null;
    if (recentActivity) {
      currentActivityType = recentActivity.type as ActivityType;
    } else if (idleMinutes > 5) {
      currentActivityType = "idle";
    }

    // Check if tracker is "connected" (has recent data in last 10 min)
    const hasRecentData = recentActivities.length > 0 ||
      (recentActivity && (now.getTime() - new Date(recentActivity.startedAt).getTime()) < 600000);

    return NextResponse.json({
      connected: hasRecentData,
      trackingEnabled: settings?.trackingEnabled ?? true,
      currentApp: recentActivity?.application || null,
      currentWebsite: recentActivity?.website || null,
      currentActivityType,
      idleMinutes,
      lastActivityAt: recentActivity?.startedAt.toISOString() || null,
    });
  } catch (e) {
    logError("desktop-status", "Failed to get desktop status", e);
    return NextResponse.json({ error: "Failed to get desktop status" }, { status: 500 });
  }
}
