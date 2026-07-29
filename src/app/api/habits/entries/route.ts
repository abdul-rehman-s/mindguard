import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { logError } from '@/lib/logger';
import { format, subDays } from 'date-fns';

export async function GET(req: Request) {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const url = new URL(req.url);
    const startDate = url.searchParams.get('start') || format(subDays(new Date(), 29), 'yyyy-MM-dd');
    const endDate = url.searchParams.get('end') || format(new Date(), 'yyyy-MM-dd');

    const entries = await db.habitEntry.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json({ entries });
  } catch (e) {
    logError('habits/entries', 'Failed to fetch habit entries', e);
    return NextResponse.json({ error: 'Failed to fetch habit entries' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const body = await req.json();
    const { habitId, date, count, note } = body;

    if (!habitId || !date) {
      return NextResponse.json({ error: 'habitId and date are required' }, { status: 400 });
    }

    // Verify habit ownership
    const habit = await db.habit.findUnique({ where: { id: habitId } });
    if (!habit || habit.userId !== userId) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    // Upsert — create or update entry for the day
    const entry = await db.habitEntry.upsert({
      where: {
        habitId_date: { habitId, date },
      },
      create: {
        habitId,
        userId,
        date,
        count: count || 1,
        note: note || null,
      },
      update: {
        count: count || 1,
        note: note || null,
      },
    });

    return NextResponse.json({ entry });
  } catch (e) {
    logError('habits/entries', 'Failed to mark habit entry', e);
    return NextResponse.json({ error: 'Failed to mark habit entry' }, { status: 500 });
  }
}
