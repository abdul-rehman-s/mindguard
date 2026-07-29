import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { logError } from '@/lib/logger';

export async function GET() {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const habits = await db.habit.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'asc' },
      include: {
        entries: {
          orderBy: { date: 'desc' },
          take: 90,
        },
      },
    });

    return NextResponse.json({ habits });
  } catch (e) {
    logError('habits', 'Failed to fetch habits', e);
    return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const body = await req.json();
    const { name, description, icon, frequency, targetCount, color } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const habit = await db.habit.create({
      data: {
        userId,
        name: name.trim(),
        description: description?.trim() || null,
        icon: icon || null,
        frequency: frequency || 'daily',
        targetCount: targetCount || 1,
        color: color || null,
        isActive: true,
      },
    });

    return NextResponse.json({ habit });
  } catch (e) {
    logError('habits', 'Failed to create habit', e);
    return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 });
  }
}
