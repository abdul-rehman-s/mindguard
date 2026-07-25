import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as Record<string, unknown>).id as string;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [sessions, reflections, completedMissions] = await Promise.all([
    db.focusSession.findMany({
      where: { userId, endedAt: { gte: today } },
      include: { mission: { select: { title: true } } },
      orderBy: { endedAt: 'desc' },
    }),
    db.dailyReflection.findMany({
      where: { userId, date: today.toISOString().split('T')[0] },
    }),
    db.mission.findMany({
      where: { userId, status: 'completed', completedAt: { gte: today } },
      orderBy: { completedAt: 'desc' },
    }),
  ]);

  const events: { id: string; type: 'session' | 'reflection' | 'mission_completed'; title: string; time: string; minutes?: number }[] = [];

  for (const s of sessions) {
    events.push({
      id: s.id,
      type: 'session',
      title: s.mission?.title || 'Free Focus',
      time: s.endedAt.toISOString(),
      minutes: s.duration,
    });
  }
  for (const r of reflections) {
    events.push({
      id: r.id,
      type: 'reflection',
      title: 'Daily Reflection',
      time: r.createdAt.toISOString(),
    });
  }
  for (const m of completedMissions) {
    events.push({
      id: m.id,
      type: 'mission_completed',
      title: m.title,
      time: (m.completedAt || m.updatedAt).toISOString(),
    });
  }

  events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  return NextResponse.json({ events });
}
