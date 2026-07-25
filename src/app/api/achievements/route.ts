import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as Record<string, unknown>).id as string;
  const achievements = await db.achievement.findMany({
    where: { userId },
    orderBy: { unlockedAt: 'desc' },
  });
  return NextResponse.json({ achievements });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as Record<string, unknown>).id as string;
  const { type } = await req.json();
  if (!type || typeof type !== 'string') {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  const achievement = await db.achievement.upsert({
    where: { userId_type: { userId, type } },
    update: {},
    create: { userId, type },
  });
  return NextResponse.json({ achievement });
}
