import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { startOfDay, endOfDay, subDays, format } from "date-fns";
import type { ActivityType, BehavioralCoachData } from "@/types";

const PRODUCTIVE_TYPES: ActivityType[] = ["focus", "deep_work", "learning", "coding", "writing"];
const DISTRACTED_TYPES: ActivityType[] = ["distracted", "browsing", "entertainment", "gaming"];

/** GET — Behavioral AI coaching based on desktop activity patterns */
export async function GET(request: Request) {
  const userIdOr401 = await getAuthUserId(request);
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekAgo = subDays(now, 7);
    const twoWeeksAgo = subDays(now, 14);

    // Get today's activities
    const todayActivities = await db.desktopActivity.findMany({
      where: { userId, startedAt: { gte: todayStart } },
      orderBy: { startedAt: "asc" },
    });

    // Get this week's activities
    const weekActivities = await db.desktopActivity.findMany({
      where: { userId, startedAt: { gte: weekAgo } },
      orderBy: { startedAt: "asc" },
    });

    // Get last week's activities for comparison
    const lastWeekActivities = await db.desktopActivity.findMany({
      where: { userId, startedAt: { gte: twoWeeksAgo, lte: weekAgo } },
      orderBy: { startedAt: "asc" },
    });

    // Get sessions for more context
    const weekSessions = await db.focusSession.findMany({
      where: { userId, startedAt: { gte: weekAgo }, type: { not: "break" } },
      select: { duration: true, startedAt: true },
    });

    // ---- Pattern Detection ----

    // 1. Excessive context switching (>8 app switches per hour today)
    let contextSwitches = 0;
    let lastApp: string | null = null;
    for (const a of todayActivities) {
      const currentApp = a.application || a.type;
      if (lastApp !== null && currentApp !== lastApp) contextSwitches++;
      lastApp = currentApp;
    }
    const todayActiveHours = Math.max(1, todayActivities.reduce((acc, a) => acc + a.duration, 0) / 3600);
    const switchesPerHour = contextSwitches / todayActiveHours;
    const excessiveContextSwitching = switchesPerHour > 8;

    // 2. Late-night work (activity after 11pm or before 6am in last 7 days)
    const lateNightActivities = weekActivities.filter((a) => {
      const h = new Date(a.startedAt).getHours();
      return h >= 23 || h < 6;
    });
    const lateNightWork = lateNightActivities.length > 5;

    // 3. Burnout risk (>10 hours productive per day, or declining productive time over 3 days)
    const todayProductiveMinutes = Math.round(
      todayActivities.filter((a) => PRODUCTIVE_TYPES.includes(a.type as ActivityType))
        .reduce((acc, a) => acc + a.duration, 0) / 60
      + weekSessions.filter((s) => isSameDayLocal(s.startedAt, now))
        .reduce((acc, s) => acc + s.duration, 0) / 60
    );
    const burnoutRisk = todayProductiveMinutes > 600; // >10 hours

    // 4. Distraction spike (distracted > 40% of total active time today)
    const todayDistractedSeconds = todayActivities
      .filter((a) => DISTRACTED_TYPES.includes(a.type as ActivityType))
      .reduce((acc, a) => acc + a.duration, 0);
    const todayTotalSeconds = todayActivities.reduce((acc, a) => acc + a.duration, 0);
    const distractionRatio = todayTotalSeconds > 0 ? todayDistractedSeconds / todayTotalSeconds : 0;
    const distractionSpike = distractionRatio > 0.4;

    // 5. Poor consistency (less than 3 days with focus in last 7 days)
    const daysWithFocus = new Set<string>();
    for (const a of weekActivities) {
      if (PRODUCTIVE_TYPES.includes(a.type as ActivityType)) {
        daysWithFocus.add(format(new Date(a.startedAt), "yyyy-MM-dd"));
      }
    }
    for (const s of weekSessions) {
      daysWithFocus.add(format(new Date(s.startedAt), "yyyy-MM-dd"));
    }
    const poorConsistency = daysWithFocus.size < 3;

    // ---- Best Working Hours ----
    const hourAgg = new Map<number, number>();
    for (const a of weekActivities) {
      if (PRODUCTIVE_TYPES.includes(a.type as ActivityType)) {
        const h = new Date(a.startedAt).getHours();
        hourAgg.set(h, (hourAgg.get(h) || 0) + a.duration / 60);
      }
    }
    for (const s of weekSessions) {
      const h = new Date(s.startedAt).getHours();
      hourAgg.set(h, (hourAgg.get(h) || 0) + s.duration / 60);
    }
    // Sort hours by productive minutes descending, take top 3
    const bestWorkingHours = Array.from(hourAgg.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([h]) => h);

    // ---- Recommendations ----
    const recommendations: string[] = [];

    if (excessiveContextSwitching) {
      recommendations.push(
        `You're switching between ${Math.round(switchesPerHour)} apps per hour — that's excessive. Try grouping similar tasks together and batching notifications.`
      );
    }

    if (lateNightWork) {
      recommendations.push(
        `You've had ${lateNightActivities.length} late-night work sessions this week. Sleep deprivation kills focus — try setting a "work ends at 10pm" boundary.`
      );
    }

    if (burnoutRisk) {
      recommendations.push(
        `You've logged ${todayProductiveMinutes} minutes of productive work today — that's over 10 hours. Your brain needs recovery time to maintain quality tomorrow.`
      );
    }

    if (distractionSpike) {
      recommendations.push(
        `Distractions are consuming ${Math.round(distractionRatio * 100)}% of your active time today. Consider using Focus Protection to block distracting apps and websites during work hours.`
      );
    }

    if (poorConsistency) {
      recommendations.push(
        `You've only focused on ${daysWithFocus.size} out of 7 days this week. Consistency beats intensity — aim for at least 25 minutes every single day.`
      );
    }

    if (bestWorkingHours.length > 0 && !excessiveContextSwitching && !distractionSpike) {
      const hoursStr = bestWorkingHours.map((h) => `${h}:00`).join(", ");
      recommendations.push(
        `Your best focus hours are ${hoursStr}. Schedule your hardest tasks in those windows for maximum output.`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Your work patterns look healthy today. Keep maintaining consistency and protecting your focus blocks."
      );
    }

    // ---- Summary ----
    const patterns = {
      excessiveContextSwitching,
      lateNightWork,
      burnoutRisk,
      distractionSpike,
      poorConsistency,
    };
    const flaggedCount = Object.values(patterns).filter(Boolean).length;

    let summary: string;
    if (flaggedCount === 0) {
      summary = `Your behavioral patterns are healthy today. ${todayProductiveMinutes} productive minutes, low context switching, and consistent focus. Keep it up.`;
    } else if (flaggedCount === 1) {
      summary = `One behavioral concern detected: ${getPrimaryFlag(patterns)}. ${todayProductiveMinutes} productive minutes today.`;
    } else {
      summary = `${flaggedCount} behavioral concerns detected: ${getFlagList(patterns)}. Address the most impactful one first — ${todayProductiveMinutes} productive minutes today.`;
    }

    return NextResponse.json({
      patterns,
      bestWorkingHours,
      recommendations,
      summary,
    } satisfies BehavioralCoachData);
  } catch (e) {
    logError("desktop-coach", "Failed to generate behavioral coaching", e);
    return NextResponse.json({ error: "Failed to generate behavioral coaching" }, { status: 500 });
  }
}

// Helpers
function isSameDayLocal(date: Date | string, ref: Date): boolean {
  const d = new Date(date);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate();
}

function getPrimaryFlag(patterns: Record<string, boolean>): string {
  if (patterns.burnoutRisk) return "burnout risk";
  if (patterns.excessiveContextSwitching) return "excessive context switching";
  if (patterns.distractionSpike) return "distraction spike";
  if (patterns.lateNightWork) return "late-night work pattern";
  if (patterns.poorConsistency) return "poor consistency";
  return "unknown";
}

function getFlagList(patterns: Record<string, boolean>): string {
  const flags: string[] = [];
  if (patterns.burnoutRisk) flags.push("burnout risk");
  if (patterns.excessiveContextSwitching) flags.push("context switching");
  if (patterns.distractionSpike) flags.push("distraction spike");
  if (patterns.lateNightWork) flags.push("late-night work");
  if (patterns.poorConsistency) flags.push("poor consistency");
  return flags.join(", ");
}
