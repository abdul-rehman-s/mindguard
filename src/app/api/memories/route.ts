import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { logError } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthUserId();
    if (typeof authResult !== 'string') return authResult;
    const userId = authResult;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');

    const memories = await db.memory.findMany({
      where: {
        userId,
        ...(type ? { type } : {}),
      },
      orderBy: [
        { importance: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    return NextResponse.json(memories);
  } catch (error) {
    logError('memories', 'GET /api/memories failed', error);
    return NextResponse.json({ error: 'Failed to get memories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthUserId();
    if (typeof authResult !== 'string') return authResult;
    const userId = authResult;

    const body = await req.json();
    const { type, content, importance } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const memory = await db.memory.create({
      data: {
        userId,
        type: type || 'manual',
        content,
        importance: importance || 5,
        source: 'manual',
      },
    });

    return NextResponse.json(memory);
  } catch (error) {
    logError('memories', 'POST /api/memories failed', error);
    return NextResponse.json({ error: 'Failed to create memory' }, { status: 500 });
  }
}
