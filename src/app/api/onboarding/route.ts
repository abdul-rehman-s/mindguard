import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { logError } from '@/lib/logger';
import { z } from 'zod';

const schema = z.object({
  primaryUse: z.string().min(1),
  firstMission: z.string().min(1),
});

export async function GET() {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { onboarded: true, primaryUse: true },
    });
    return NextResponse.json({ onboarded: user?.onboarded ?? false, primaryUse: user?.primaryUse ?? null });
  } catch (e) {
    logError("onboarding", "Failed to fetch onboarding status", e);
    return NextResponse.json({ error: 'Failed to fetch onboarding status' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { primaryUse, firstMission } = parsed.data;

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
  } catch (e) {
    logError("onboarding", "Failed to complete onboarding", e);
    return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 });
  }
}
