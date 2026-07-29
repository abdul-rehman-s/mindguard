import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { logError } from '@/lib/logger';

export async function GET() {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
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
      const dateStr = (s.endedAt ?? s.startedAt).toISOString().split('T')[0];
      const existing = dayMap.get(dateStr) || { minutes: 0, sessions: 0 };
      existing.minutes += Math.round(s.duration / 60);
      existing.sessions += 1;
      existing.mission = s.mission?.title || existing.mission;
      dayMap.set(dateStr, existing);
    }

    const days = Array.from(dayMap.entries()).map(([date, data]) => ({ date, ...data }));
    return NextResponse.json({ days });
  } catch (e) {
    logError("heatmap", "Failed to fetch heatmap", e);
    return NextResponse.json({ error: 'Failed to fetch heatmap' }, { status: 500 });
  }
}
