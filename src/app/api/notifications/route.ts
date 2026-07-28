import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { logError } from '@/lib/logger';
import { format, startOfDay, subDays } from 'date-fns';
import { z } from 'zod';

// Zod validation for POST body
const notificationActionSchema = z.object({
  id: z.string().optional(),
  markAll: z.boolean().optional(),
}).refine(data => data.id !== undefined || data.markAll === true, {
  message: 'Provide id or markAll',
});

// GET: Fetch notifications
export async function GET() {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const [notifications, unreadCount] = await Promise.all([
      db.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      db.notification.count({
        where: { userId, read: false },
      }),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (e) {
    logError("notifications", "Failed to fetch notifications", e);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST: Mark as read
export async function POST(req: Request) {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const body = await req.json();
    const validated = notificationActionSchema.parse(body);

    if (validated.markAll) {
      await db.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
      return NextResponse.json({ success: true });
    }

    if (validated.id) {
      await db.notification.update({
        where: { id: validated.id, userId },
        data: { read: true },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Provide id or markAll' }, { status: 400 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "issues" in error) {
      return NextResponse.json(
        { error: "Validation failed", details: (error as { issues: Array<{ message: string }> }).issues },
        { status: 400 }
      );
    }
    logError("notifications", "Failed to update notification", error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}

// Generate smart notifications based on user data
export async function PUT() {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');
    const todayStart = startOfDay(now);

    const [todaySessions, reflection, activeMissions, _user, lastNotification] = await Promise.all([
      db.focusSession.findMany({
        where: { userId, startedAt: { gte: todayStart } },
        select: { duration: true, startedAt: true },
      }),
      db.dailyReflection.findUnique({
        where: { userId_date: { userId, date: todayStr } },
        select: { id: true },
      }),
      db.mission.findMany({
        where: { userId, status: 'active' },
        select: { id: true, title: true },
      }),
      db.user.findUnique({ where: { id: userId }, select: { xp: true, level: true } }),
      db.notification.findFirst({
        where: { userId, createdAt: { gte: subDays(now, 1) } },
        orderBy: { createdAt: 'desc' },
        select: { type: true, createdAt: true },
      }),
    ]);

    const todayMinutes = Math.round(todaySessions.reduce((a, s) => a + s.duration, 0) / 60);
    const created: { type: string; title: string; body: string; actionUrl?: string }[] = [];

    // Check idle time (no session in last 25+ minutes OR no desktop activity in last 15+ minutes)
    const desktopActivities = await db.desktopActivity.findMany({
      where: { userId, startedAt: { gte: todayStart } },
      orderBy: { startedAt: 'desc' },
      take: 5,
    });

    const _desktopIdleMinutes = 0;
    if (desktopActivities.length > 0) {
      const lastDesktopActivity = desktopActivities[0];
      const _lastActivityEnd = lastDesktopActivity.endedAt
        ? new Date(lastDesktopActivity.endedAt).getTime()
        : new Date(lastDesktopActivity.startedAt).getTime() + lastDesktopActivity.duration * 1000;
    }

    if (todaySessions.length > 0 || desktopActivities.length > 0) {
      const lastSessionEnd = todaySessions.length > 0
        ? new Date(Math.max(...todaySessions.map((s) => new Date(s.startedAt).getTime() + s.duration * 1000)))
        : new Date(0);
      const lastDesktopEnd = desktopActivities.length > 0
        ? new Date(desktopActivities[0].endedAt || new Date(desktopActivities[0].startedAt.getTime() + desktopActivities[0].duration * 1000))
        : new Date(0);
      const lastActivityTime = Math.max(lastSessionEnd.getTime(), lastDesktopEnd.getTime());
      const idleMinutes = Math.max(0, Math.round((now.getTime() - lastActivityTime) / 60000));

      if (idleMinutes >= 15 && (!lastNotification || lastNotification.type !== 'idle_alert' || now.getTime() - lastNotification.createdAt.getTime() > 1800000)) {
        created.push({
          type: 'idle_alert',
          title: idleMinutes >= 15 ? 'You\'ve been idle' : 'You\'ve been idle for a while',
          body: `No activity detected for ${idleMinutes} minutes. Consider getting back to your mission.`,
          actionUrl: 'timer',
        });
      }
    }

    // Break reminder (long sessions)
    if (todaySessions.length > 0) {
      const lastSession = todaySessions[todaySessions.length - 1];
      const sessionEnd = new Date(lastSession.startedAt).getTime() + lastSession.duration * 1000;
      if (now.getTime() - sessionEnd < 60000 && lastSession.duration >= 5400) {
        created.push({
          type: 'break_reminder',
          title: 'Take a well-earned break',
          body: `You just completed a ${Math.round(lastSession.duration / 60)}-minute deep work session. Stand up, stretch, and hydrate before your next block.`,
        });
      }
    }

    // Mission reminder
    if (activeMissions.length > 0 && todaySessions.length === 0 && now.getHours() >= 10) {
      if (!lastNotification || lastNotification.type !== 'mission_reminder') {
        created.push({
          type: 'mission_reminder',
          title: 'Start today\'s mission',
          body: `You have ${activeMissions.length} active mission${activeMissions.length === 1 ? '' : 's'}. ${activeMissions[0].title} is waiting for you.`,
          actionUrl: 'timer',
        });
      }
    }

    // Reflection reminder (evening, no reflection written)
    if (!reflection && now.getHours() >= 20 && todaySessions.length > 0) {
      if (!lastNotification || lastNotification.type !== 'reflection_reminder') {
        created.push({
          type: 'reflection_reminder',
          title: 'Write today\'s reflection',
          body: `You logged ${todayMinutes} minutes of focus today. A quick reflection will help you understand what worked.`,
          actionUrl: 'reflection',
        });
      }
    }

    // Focus celebration
    if (todayMinutes >= 120) {
      if (!lastNotification || lastNotification.type !== 'focus_celebration') {
        created.push({
          type: 'focus_celebration',
          title: 'Excellent focus today!',
          body: `You've accumulated ${todayMinutes} minutes of focused work across ${todaySessions.length} sessions. That's serious productivity.`,
        });
      }
    }

    // Create notifications using createMany for batch efficiency
    if (created.length > 0) {
      await db.notification.createMany({
        data: created.map((n) => ({
          userId,
          type: n.type,
          title: n.title,
          body: n.body,
          actionUrl: n.actionUrl || null,
        })),
      });
    }

    return NextResponse.json({ created: created.length, types: created.map((c) => c.type) });
  } catch (e) {
    logError("notifications", "Failed to generate notifications", e);
    return NextResponse.json({ error: 'Failed to generate notifications' }, { status: 500 });
  }
}
