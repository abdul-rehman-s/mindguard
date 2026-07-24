import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as Record<string, unknown>).id as string;
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  oneYearAgo.setHours(0, 0, 0, 0);

  const sessions = await db.focusSession.findMany({
    where: { userId, endedAt: { gte: oneYearAgo } },
    include: { mission: { select: { title: true } } },
    orderBy: { endedAt: 'asc' },
  });

  const dayMap = new Map<string, { minutes: number; sessions: number; mission?: string }>();
  for (const s of sessions) {
    const dateStr = s.endedAt.toISOString().split('T')[0];
    const existing = dayMap.get(dateStr) || { minutes: 0, sessions: 0 };
    existing.minutes += Math.round(s.duration / 60);
    existing.sessions += 1;
    existing.mission = s.mission?.title || existing.mission;
    dayMap.set(dateStr, existing);
  }

  const days = Array.from(dayMap.entries()).map(([date, data]) => ({ date, ...data }));
  return NextResponse.json({ days });
}
