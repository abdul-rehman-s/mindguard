import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth-utils';
import { searchMemories } from '@/lib/memory';
import { logError } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthUserId();
    if (typeof authResult !== 'string') return authResult;
    const userId = authResult;

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query) {
      return NextResponse.json({ error: 'Search query (q) is required' }, { status: 400 });
    }

    const memories = await searchMemories(userId, query, limit);
    return NextResponse.json(memories);
  } catch (error) {
    logError('memories-search', 'GET /api/memories/search failed', error);
    return NextResponse.json({ error: 'Failed to search memories' }, { status: 500 });
  }
}
