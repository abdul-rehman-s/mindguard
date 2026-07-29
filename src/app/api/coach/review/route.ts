import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { logError, logInfo } from '@/lib/logger';
import { aiCompleteWithFallback, type AIProviderConfig } from '@/lib/ai-provider';
import { buildCoachContext, buildCoachPrompt } from '@/lib/coach-context';

/**
 * GET /api/coach/review — Weekly review powered by AI
 * Returns an AI-generated weekly analysis with trends, patterns, and recommendations
 */
export async function GET() {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const ctx = await buildCoachContext(userId);

    // Get AI settings
    const settings = await db.userSettings.findUnique({
      where: { userId },
      select: { aiProvider: true, aiApiKey: true, aiModel: true, aiOllamaUrl: true },
    });

    const aiConfig: AIProviderConfig = {
      provider: (settings?.aiProvider as AIProviderConfig['provider']) || 'z-ai',
      apiKey: settings?.aiApiKey,
      model: settings?.aiModel,
      ollamaUrl: settings?.aiOllamaUrl,
    };

    const hasData = ctx.weekMinutes > 0 || ctx.streak > 0;

    let review: string | null = null;
    let providerUsed: string | null = null;
    let modelUsed: string | null = null;

    if (hasData) {
      const messages = buildCoachPrompt('weekly_review', ctx);
      const result = await aiCompleteWithFallback(messages, aiConfig);
      if (result.success) {
        review = result.content;
        providerUsed = result.provider;
        modelUsed = result.model || null;
        logInfo('coach-review', `Generated weekly review with ${providerUsed}`);
      } else {
        logError('coach-review', `AI failed: ${result.error}`);
      }
    } else {
      review = `No focus data yet this week. Start your first session and I'll generate a comprehensive weekly review with trends, patterns, and personalized recommendations.`;
    }

    return NextResponse.json({
      review,
      provider: providerUsed,
      model: modelUsed,
      context: {
        userName: ctx.userName,
        weekMinutes: ctx.weekMinutes,
        streak: ctx.streak,
        weekMissionsCompleted: ctx.weekMissionsCompleted,
        reflectionRate: ctx.reflectionRate,
        todayMinutes: ctx.todayMinutes,
        yesterdayMinutes: ctx.yesterdayMinutes,
        bestHour: ctx.bestHour,
        bestWeekday: ctx.bestWeekday,
        coachPersonality: ctx.coachPersonality,
      },
    });
  } catch (e) {
    logError('coach-review', 'Failed to generate weekly review', e);
    return NextResponse.json({ error: 'Failed to generate weekly review' }, { status: 500 });
  }
}
