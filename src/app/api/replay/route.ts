import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  format,
  startOfDay,
  endOfDay,
  parseISO,
  isValid,
} from 'date-fns';

async function getUserId(): Promise<string | NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = session.user as Record<string, unknown>;
  return user.id as string;
}

type ReplayEvent = {
  id: string;
  type: 'session' | 'break' | 'reflection' | 'mission_created' | 'mission_completed';
  title: string;
  subtitle: string;
  time: string;
  duration?: number;
  icon: string;
};

export async function GET(request: NextRequest) {
  const userId = await getUserId();
  if (userId instanceof NextResponse) return userId;

  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');

  // Default to today if no date provided
  let targetDate: Date;
  if (dateParam) {
    const parsed = parseISO(dateParam);
    if (!isValid(parsed)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD.' },
        { status: 400 }
      );
    }
    targetDate = parsed;
  } else {
    targetDate = new Date();
  }

  const dayStart = startOfDay(targetDate);
  const dayEnd = endOfDay(targetDate);
  const dateStr = format(dayStart, 'yyyy-MM-dd');

  try {
    const [sessions, reflections, missionsCreated, missionsCompleted] = await Promise.all([
      db.focusSession.findMany({
        where: {
          userId,
          startedAt: { gte: dayStart, lte: dayEnd },
        },
        include: { mission: { select: { id: true, title: true } } },
        orderBy: { startedAt: 'asc' },
      }),
      db.dailyReflection.findMany({
        where: { userId, date: dateStr },
        orderBy: { createdAt: 'asc' },
      }),
      db.mission.findMany({
        where: {
          userId,
          createdAt: { gte: dayStart, lte: dayEnd },
        },
        orderBy: { createdAt: 'asc' },
      }),
      db.mission.findMany({
        where: {
          userId,
          status: 'completed',
          completedAt: { gte: dayStart, lte: dayEnd },
        },
        orderBy: { completedAt: 'asc' },
      }),
    ]);

    const events: ReplayEvent[] = [];

    for (const s of sessions) {
      const isBreak = s.type === 'break';
      events.push({
        id: s.id,
        type: isBreak ? 'break' : 'session',
        title: s.mission?.title || (isBreak ? 'Break Time' : 'Free Focus'),
        subtitle: isBreak
          ? 'Recharge break'
          : `${Math.round(s.duration / 60)} minute${s.duration === 60 ? '' : 's'} of focus`,
        time: s.startedAt.toISOString(),
        duration: s.duration,
        icon: isBreak ? 'Coffee' : 'Timer',
      });
    }

    for (const r of reflections) {
      events.push({
        id: r.id,
        type: 'reflection',
        title: 'Daily Reflection',
        subtitle: r.tomorrowMission
          ? `Tomorrow: ${r.tomorrowMission.slice(0, 60)}${r.tomorrowMission.length > 60 ? '…' : ''}`
          : 'Reflected on the day',
        time: r.createdAt.toISOString(),
        icon: 'PenLine',
      });
    }

    for (const m of missionsCreated) {
      events.push({
        id: m.id,
        type: 'mission_created',
        title: m.title,
        subtitle: `Mission created • ${m.priority} priority`,
        time: m.createdAt.toISOString(),
        icon: 'PlusCircle',
      });
    }

    for (const m of missionsCompleted) {
      events.push({
        id: `${m.id}-done`,
        type: 'mission_completed',
        title: m.title,
        subtitle: 'Mission completed',
        time: (m.completedAt || m.updatedAt).toISOString(),
        icon: 'CheckCircle2',
      });
    }

    // Sort chronologically (oldest first for replay)
    events.sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );

    // --- Summary stats ---
    const focusSessions = sessions.filter((s) => s.type !== 'break');
    const totalMinutes = Math.round(
      focusSessions.reduce((acc, s) => acc + s.duration, 0) / 60
    );
    const sessionCount = focusSessions.length;
    const missionsCompletedCount = missionsCompleted.length;
    const reflectionWritten = reflections.length > 0;
    const longestSession = focusSessions.reduce(
      (max, s) => (s.duration > max ? s.duration : max),
      0
    );
    const longestSessionMinutes = Math.round(longestSession / 60);

    // Best hour = hour with most focus minutes that day
    const hourMinutes = new Array(24).fill(0);
    for (const s of focusSessions) {
      hourMinutes[new Date(s.startedAt).getHours()] += s.duration;
    }
    let bestHour = -1;
    let bestHourMinutes = 0;
    for (let h = 0; h < 24; h++) {
      if (hourMinutes[h] > bestHourMinutes) {
        bestHourMinutes = hourMinutes[h];
        bestHour = h;
      }
    }
    const bestHourLabel =
      bestHour >= 0
        ? format(new Date().setHours(bestHour, 0, 0, 0), 'h a')
        : null;

    return NextResponse.json({
      date: dateStr,
      events,
      summary: {
        totalMinutes,
        sessionCount,
        missionsCompleted: missionsCompletedCount,
        reflectionWritten,
        longestSessionMinutes,
        bestHour: bestHourLabel,
      },
    });
  } catch (e) {
    console.error('[replay] error', e);
    return NextResponse.json(
      { error: 'Failed to fetch replay data' },
      { status: 500 }
    );
  }
}
