import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth-utils';
import { getFullPredictions } from '@/lib/predictions';
import { logError } from '@/lib/logger';

export async function GET() {
  try {
    const authResult = await getAuthUserId();
    if (typeof authResult !== 'string') return authResult;
    const userId = authResult;

    const predictions = await getFullPredictions(userId);
    return NextResponse.json(predictions);
  } catch (error) {
    logError('assistant-predict', 'GET /api/assistant/predict failed', error);
    return NextResponse.json({ error: 'Failed to generate predictions' }, { status: 500 });
  }
}
