import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { logError } from '@/lib/logger';

type TimelineEvent = {
  id: string;
  type:
    | 'session'
    | 'break'
    | 'reflection'
    | 'mission_created'
    | 'mission_completed'
    | 'achievement_unlocked'
    | 'desktop_activity';
  title: string;
  subtitle?: string;
  time: string;
  minutes?: number;
  group: string;
};

const GROUP_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function GET() {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const [
      sessions,
      reflections,
      missionsCreatedToday,
      missionsCompletedToday,
      achievementsUnlockedToday,
      desktopActivities,
    ] = await Promise.all([
      db.focusSession.findMany({
        where: { userId, endedAt: { gte: today } },
        include: { mission: { select: { title: true } } },
        orderBy: { endedAt: 'desc' },
      }),
      db.dailyReflection.findMany({
        where: { userId, date: today.toISOString().split('T')[0] },
        orderBy: { createdAt: 'desc' },
      }),
      db.mission.findMany({
        where: { userId, createdAt: { gte: today } },
        orderBy: { createdAt: 'desc' },
      }),
      db.mission.findMany({
        where: { userId, status: 'completed', completedAt: { gte: today } },
        orderBy: { completedAt: 'desc' },
      }),
      db.achievement.findMany({
        where: { userId, unlockedAt: { gte: today } },
        orderBy: { unlockedAt: 'desc' },
      }),
      // Desktop activities for today — merge into timeline
      db.desktopActivity.findMany({
        where: { userId, startedAt: { gte: today } },
        orderBy: { startedAt: 'asc' },
        take: 100,
      }),
    ]);

    const events: TimelineEvent[] = [];

    // Add desktop activities to timeline
    for (const a of desktopActivities) {
      const title = a.title || a.application || a.type;
      const subtitle = a.application && a.website
        ? `${a.application} — ${a.website}`
        : a.website || a.application || undefined;

      events.push({
        id: a.id,
        type: 'desktop_activity',
        title,
        subtitle,
        time: a.startedAt.toISOString(),
        minutes: Math.round(a.duration / 60),
        group: '',
      });
    }

    for (const s of sessions) {
      const isBreak = s.type === 'break';
      events.push({
        id: s.id,
        type: isBreak ? 'break' : 'session',
        title: s.mission?.title || (isBreak ? 'Break' : 'Free Focus'),
        subtitle: isBreak
          ? 'Recharge'
          : `${Math.round(s.duration / 60)} min`,
        time: s.endedAt.toISOString(),
        minutes: s.duration,
        group: '',
      });
    }

    for (const r of reflections) {
      events.push({
        id: r.id,
        type: 'reflection',
        title: 'Daily Reflection',
        subtitle: r.tomorrowMission
          ? `Next: ${r.tomorrowMission.slice(0, 60)}${r.tomorrowMission.length > 60 ? '…' : ''}`
          : undefined,
        time: r.createdAt.toISOString(),
        group: '',
      });
    }

    for (const m of missionsCreatedToday) {
      events.push({
        id: m.id,
        type: 'mission_created',
        title: m.title,
        subtitle: `New mission • ${m.priority} priority`,
        time: m.createdAt.toISOString(),
        group: '',
      });
    }

    for (const m of missionsCompletedToday) {
      events.push({
        id: `${m.id}-done`,
        type: 'mission_completed',
        title: m.title,
        subtitle: 'Completed',
        time: (m.completedAt || m.updatedAt).toISOString(),
        group: '',
      });
    }

    for (const a of achievementsUnlockedToday) {
      events.push({
        id: a.id,
        type: 'achievement_unlocked',
        title: prettyAchievementType(a.type),
        subtitle: 'Achievement unlocked',
        time: a.unlockedAt.toISOString(),
        group: '',
      });
    }

    // Sort chronologically: oldest first (for timeline display)
    events.sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );

    // Group events within 15 minutes of each other
    let currentGroup = '';
    let lastTime = 0;
    let groupCounter = 0;
    for (const ev of events) {
      const t = new Date(ev.time).getTime();
      if (
        currentGroup === '' ||
        Math.abs(t - lastTime) > GROUP_WINDOW_MS
      ) {
        groupCounter++;
        currentGroup = `g-${groupCounter}`;
      }
      ev.group = currentGroup;
      lastTime = t;
    }

    return NextResponse.json({ events });
  } catch (e) {
    logError("timeline", "Failed to fetch timeline", e);
    return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 });
  }
}

function prettyAchievementType(type: string): string {
  const map: Record<string, string> = {
    first_focus: 'First Focus',
    streak_7: '7-Day Streak',
    streak_30: '30-Day Streak',
    hours_100: '100-Hour Club',
    night_owl: 'Night Owl',
    early_bird: 'Early Bird',
    deep_worker: 'Deep Worker',
    mission_master: 'Mission Master',
  };
  return map[type] || type.replace(/_/g, ' ');
}
