import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { logError, logInfo } from "@/lib/logger";
import { z } from "zod";
import { startOfDay, subMinutes } from "date-fns";
import type { ActivityType } from "@/types";

const PRODUCTIVE_TYPES: ActivityType[] = ["focus", "deep_work", "learning", "coding", "writing"];

const notificationTriggerSchema = z.object({
  type: z.enum(["idle_alert", "break_reminder", "focus_celebration", "back_to_work", "context_switch_alert", "mission_reminder"]),
  title: z.string().max(200),
  body: z.string().max(500),
  actionUrl: z.string().max(200).optional(),
});

/** POST — Trigger desktop notification (from Electron tracker) */
export async function POST(req: Request) {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const body = await req.json();
    const validated = notificationTriggerSchema.parse(body);

    // Check notification preferences before creating
    const settings = await db.desktopSettings.findUnique({ where: { userId } });
    if (settings?.muteNotifications) {
      return NextResponse.json({ suppressed: true, reason: "notifications muted" });
    }

    const prefs = settings?.notificationPrefs ? JSON.parse(settings.notificationPrefs) : null;

    // Check if this notification type is enabled
    if (prefs) {
      switch (validated.type) {
        case "idle_alert":
          if (!prefs.idleAlert) return NextResponse.json({ suppressed: true, reason: "idle alerts disabled" });
          break;
        case "break_reminder":
          if (!prefs.breakReminder) return NextResponse.json({ suppressed: true, reason: "break reminders disabled" });
          break;
        case "focus_celebration":
          if (!prefs.focusCelebration) return NextResponse.json({ suppressed: true, reason: "focus celebrations disabled" });
          break;
        case "mission_reminder":
        case "back_to_work":
          if (!prefs.missionReminder) return NextResponse.json({ suppressed: true, reason: "mission reminders disabled" });
          break;
      }
    }

    // Prevent duplicate notifications within 30 minutes
    const recentDuplicate = await db.notification.findFirst({
      where: {
        userId,
        type: validated.type,
        createdAt: { gte: subMinutes(new Date(), 30) },
      },
    });
    if (recentDuplicate) {
      return NextResponse.json({ suppressed: true, reason: "duplicate within 30 minutes" });
    }

    // Create the notification
    const notification = await db.notification.create({
      data: {
        userId,
        type: validated.type,
        title: validated.title,
        body: validated.body,
        actionUrl: validated.actionUrl || null,
      },
    });

    logInfo("desktop-notifications", `Created ${validated.type} notification for user ${userId}`);
    return NextResponse.json({ created: true, id: notification.id }, { status: 201 });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "issues" in e) {
      return NextResponse.json(
        { error: "Validation failed", details: (e as { issues: Array<{ message: string }> }).issues },
        { status: 400 }
      );
    }
    logError("desktop-notifications", "Failed to trigger notification", e);
    return NextResponse.json({ error: "Failed to trigger notification" }, { status: 500 });
  }
}

/** GET — Get current desktop notification state (for real-time polling) */
export async function GET() {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const now = new Date();
    const todayStart = startOfDay(now);

    // Get unread count and recent notifications
    const [unreadCount, recent] = await Promise.all([
      db.notification.count({ where: { userId, read: false } }),
      db.notification.findMany({
        where: { userId, createdAt: { gte: todayStart } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    // Also check: should we generate any automatic desktop notifications?
    // Get recent activity to determine if notifications should be triggered
    const recentActivity = await db.desktopActivity.findFirst({
      where: { userId, startedAt: { gte: subMinutes(now, 30) } },
      orderBy: { startedAt: "desc" },
    });

    // Calculate idle minutes
    let idleMinutes = 0;
    if (recentActivity) {
      const lastEnd = recentActivity.endedAt
        ? new Date(recentActivity.endedAt).getTime()
        : new Date(recentActivity.startedAt).getTime() + recentActivity.duration * 1000;
      idleMinutes = Math.max(0, Math.round((now.getTime() - lastEnd) / 60000));
    }

    // Calculate today productive minutes
    const todayActivities = await db.desktopActivity.findMany({
      where: { userId, startedAt: { gte: todayStart } },
    });
    const todayProductiveMinutes = Math.round(
      todayActivities.filter((a) => PRODUCTIVE_TYPES.includes(a.type as ActivityType))
        .reduce((acc, a) => acc + a.duration, 0) / 60
    );

    // Suggested notifications
    const suggested: { type: string; title: string; body: string }[] = [];

    if (idleMinutes >= 15) {
      suggested.push({
        type: "idle_alert",
        title: "You've been idle",
        body: `No activity detected for ${idleMinutes} minutes. Consider getting back to your mission.`,
      });
    }

    if (todayProductiveMinutes >= 90) {
      suggested.push({
        type: "focus_celebration",
        title: "Excellent — 90 minute focus streak",
        body: `You've accumulated ${todayProductiveMinutes} productive minutes today. Outstanding focus!`,
      });
    }

    if (idleMinutes >= 5 && todayProductiveMinutes > 0) {
      suggested.push({
        type: "back_to_work",
        title: "Back to work",
        body: "Your focus session is waiting. Get back to it.",
      });
    }

    return NextResponse.json({
      unreadCount,
      recent,
      suggested,
      idleMinutes,
      todayProductiveMinutes,
    });
  } catch (e) {
    logError("desktop-notifications", "Failed to get notification state", e);
    return NextResponse.json({ error: "Failed to get notification state" }, { status: 500 });
  }
}
