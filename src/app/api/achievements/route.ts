import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { logError } from '@/lib/logger';

// Known achievement types for validation
const VALID_ACHIEVEMENT_TYPES = [
  'first_focus',
  'streak_7',
  'streak_30',
  'hours_100',
  'night_owl',
  'early_bird',
  'deep_worker',
  'mission_master',
];

export async function GET() {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const achievements = await db.achievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: 'desc' },
    });
    return NextResponse.json({ achievements });
  } catch (e) {
    logError("achievements", "Failed to fetch achievements", e);
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const { type } = await req.json();
    if (!type || typeof type !== 'string') {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // Validate that achievement type is one of the known types
    if (!VALID_ACHIEVEMENT_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Unknown achievement type: ${type}. Valid types: ${VALID_ACHIEVEMENT_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    const achievement = await db.achievement.upsert({
      where: { userId_type: { userId, type } },
      update: {},
      create: { userId, type },
    });
    return NextResponse.json({ achievement });
  } catch (e) {
    logError("achievements", "Failed to create achievement", e);
    return NextResponse.json({ error: 'Failed to create achievement' }, { status: 500 });
  }
}
