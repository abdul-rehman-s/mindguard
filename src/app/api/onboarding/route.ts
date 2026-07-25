import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({
  primaryUse: z.string().min(1),
  firstMission: z.string().min(1),
  estimatedDuration: z.number().min(1),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as Record<string, unknown>).id as string;
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { onboarded: true, primaryUse: true },
  });
  return NextResponse.json({ onboarded: user?.onboarded ?? false, primaryUse: user?.primaryUse ?? null });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const userId = (session.user as Record<string, unknown>).id as string;
  const { primaryUse, firstMission, estimatedDuration } = parsed.data;

  await db.user.update({
    where: { id: userId },
    data: { onboarded: true, primaryUse },
  });

  if (firstMission) {
    await db.mission.create({
      data: { userId, title: firstMission, priority: 'medium' },
    });
  }

  return NextResponse.json({ success: true });
}
