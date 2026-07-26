import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { format, startOfDay, subDays } from 'date-fns';

async function getUserId(): Promise<string | NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = session.user as Record<string, unknown>;
  return user.id as string;
}

// GET: Fetch notifications
export async function GET() {
  const userId = await getUserId();
  if (userId instanceof NextResponse) return userId;

  try {
    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await db.notification.count({
      where: { userId, read: false },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (e) {
    console.error('[notifications] error', e);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST: Mark as read
export async function POST(req: Request) {
  const userId = await getUserId();
  if (userId instanceof NextResponse) return userId;

  try {
    const body = await req.json();
    const { id } = body as { id?: string; markAll?: boolean };

    if (body.markAll) {
      await db.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
      return NextResponse.json({ success: true });
    }

    if (id) {
      await db.notification.update({
        where: { id, userId },
        data: { read: true },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Provide id or markAll' }, { status: 400 });
  } catch (e) {
    console.error('[notifications] POST error', e);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}

// Generate smart notifications based on user data
export async function PUT() {
  const userId = await getUserId();
  if (userId instanceof NextResponse) return userId;

  try {
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');
    const todayStart = startOfDay(now);

    const [todaySessions, reflection, activeMissions, user, lastNotification] = await Promise.all([
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

    // Check idle time (no session in last 25+ minutes)
    if (todaySessions.length > 0) {
      const lastSessionEnd = new Date(
        Math.max(...todaySessions.map((s) => new Date(s.startedAt).getTime() + s.duration * 1000))
      );
      const idleMinutes = (now.getTime() - lastSessionEnd.getTime()) / 60000;
      if (idleMinutes >= 25 && (!lastNotification || lastNotification.type !== 'idle_alert' || now.getTime() - lastNotification.createdAt.getTime() > 1800000)) {
        created.push({
          type: 'idle_alert',
          title: 'You\'ve been idle for a while',
          body: `No focus activity in the last ${Math.floor(idleMinutes)} minutes. A short break is fine, but consider getting back to your mission.`,
          actionUrl: 'timer',
        });
      }
    }

    // Break reminder (long sessions)
    if (todaySessions.length > 0) {
      const lastSession = todaySessions[todaySessions.length - 1];
      const sessionEnd = new Date(lastSession.startedAt).getTime() + lastSession.duration * 1000;
      if (now.getTime() - sessionEnd < 60000 && lastSession.duration >= 5400) { // just ended 90min+
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

    // Create notifications
    for (const n of created) {
      await db.notification.create({
        data: {
          userId,
          type: n.type,
          title: n.title,
          body: n.body,
          actionUrl: n.actionUrl || null,
        },
      });
    }

    return NextResponse.json({ created: created.length, types: created.map((c) => c.type) });
  } catch (e) {
    console.error('[notifications] PUT error', e);
    return NextResponse.json({ error: 'Failed to generate notifications' }, { status: 500 });
  }
}
