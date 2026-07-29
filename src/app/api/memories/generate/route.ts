import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth-utils';
import { generateMemories } from '@/lib/memory';
import { logError } from '@/lib/logger';

export async function POST() {
  try {
    const authResult = await getAuthUserId();
    if (typeof authResult !== 'string') return authResult;
    const userId = authResult;

    const count = await generateMemories(userId);
    return NextResponse.json({ generated: count });
  } catch (error) {
    logError('memories-generate', 'POST /api/memories/generate failed', error);
    return NextResponse.json({ error: 'Failed to generate memories' }, { status: 500 });
  }
}
