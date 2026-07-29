import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { logError } from '@/lib/logger';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const { id } = await params;
    const body = await req.json();

    // Verify ownership
    const existing = await db.habit.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    const updated = await db.habit.update({
      where: { id },
      data: {
        name: body.name?.trim() ?? existing.name,
        description: body.description?.trim() ?? existing.description,
        icon: body.icon ?? existing.icon,
        frequency: body.frequency ?? existing.frequency,
        targetCount: body.targetCount ?? existing.targetCount,
        color: body.color ?? existing.color,
        isActive: body.isActive ?? existing.isActive,
      },
    });

    return NextResponse.json({ habit: updated });
  } catch (e) {
    logError('habits/[id]', 'Failed to update habit', e);
    return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const { id } = await params;

    // Verify ownership
    const existing = await db.habit.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    // Soft delete — mark as inactive
    await db.habit.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    logError('habits/[id]', 'Failed to delete habit', e);
    return NextResponse.json({ error: 'Failed to delete habit' }, { status: 500 });
  }
}
