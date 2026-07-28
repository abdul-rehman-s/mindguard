import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { startOfDay, endOfDay, format } from "date-fns";
import type { ActivityType, ActivityCategory, DesktopTimelineEntry } from "@/types";

/** GET — Automatic timeline from desktop activity data */
export async function GET(request: Request) {
  const userIdOr401 = await getAuthUserId(request);
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    // Get all desktop activities for today
    const activities = await db.desktopActivity.findMany({
      where: {
        userId,
        startedAt: { gte: todayStart, lte: todayEnd },
      },
      orderBy: { startedAt: "asc" },
    });

    // Get focus sessions for today (merge with desktop timeline)
    const sessions = await db.focusSession.findMany({
      where: {
        userId,
        startedAt: { gte: todayStart, lte: todayEnd },
      },
      include: { mission: { select: { title: true } } },
      orderBy: { startedAt: "asc" },
    });

    const timeline: DesktopTimelineEntry[] = [];

    // Add desktop activities
    for (const act of activities) {
      const title = act.title || act.application || act.type;
      const endTime = act.endedAt
        ? format(new Date(act.endedAt), "HH:mm")
        : format(new Date(act.startedAt.getTime() + act.duration * 1000), "HH:mm");

      timeline.push({
        id: act.id,
        time: format(new Date(act.startedAt), "HH:mm"),
        endTime,
        type: act.type as ActivityType,
        title,
        application: act.application || undefined,
        website: act.website || undefined,
        duration: act.duration,
        category: act.category as ActivityCategory | undefined,
      });
    }

    // Add focus sessions as timeline entries
    for (const s of sessions) {
      const isBreak = s.type === "break";
      const endTime = format(new Date(s.endedAt), "HH:mm");

      timeline.push({
        id: `session-${s.id}`,
        time: format(new Date(s.startedAt), "HH:mm"),
        endTime,
        type: isBreak ? "break" : "focus",
        title: s.mission?.title || (isBreak ? "Break" : "Free Focus"),
        duration: s.duration,
        category: undefined,
      });
    }

    // Sort chronologically
    timeline.sort((a, b) => a.time.localeCompare(b.time));

    // Merge consecutive same-type entries (e.g., multiple "idle" or "browsing" segments)
    const merged: DesktopTimelineEntry[] = [];
    for (const entry of timeline) {
      const last = merged[merged.length - 1];
      if (
        last &&
        last.type === entry.type &&
        last.application === entry.application &&
        last.website === entry.website &&
        last.endTime === entry.time
      ) {
        // Merge: extend duration and endTime
        last.duration += entry.duration;
        last.endTime = entry.endTime;
        last.title = entry.title; // Keep the more recent title
      } else {
        merged.push({ ...entry });
      }
    }

    return NextResponse.json({ timeline: merged });
  } catch (e) {
    logError("desktop-timeline", "Failed to get timeline", e);
    return NextResponse.json({ error: "Failed to get timeline" }, { status: 500 });
  }
}
