import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { logError, logInfo } from '@/lib/logger';
import { aiCompleteWithFallback, type AIProviderConfig } from '@/lib/ai-provider';
import { buildCoachContext, buildCoachPrompt } from '@/lib/coach-context';

/**
 * GET /api/coach/briefing — Daily briefing powered by AI
 * Returns an AI-generated morning/afternoon/evening briefing
 */
export async function GET() {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const ctx = await buildCoachContext(userId);

    // Determine briefing mode by time of day
    const hour = ctx.hour;
    let mode: 'morning_plan' | 'briefing' | 'night_review';
    if (hour < 12) mode = 'morning_plan';
    else if (hour >= 21) mode = 'night_review';
    else mode = 'briefing';

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

    const hasData = ctx.todayMinutes > 0 || ctx.weekMinutes > 0 || ctx.streak > 0;

    let briefing: string | null = null;
    let providerUsed: string | null = null;
    let modelUsed: string | null = null;

    if (hasData) {
      const messages = buildCoachPrompt(mode, ctx);
      const result = await aiCompleteWithFallback(messages, aiConfig);
      if (result.success) {
        briefing = result.content;
        providerUsed = result.provider;
        modelUsed = result.model || null;
        logInfo('coach-briefing', `Generated briefing with ${providerUsed}`);
      } else {
        logError('coach-briefing', `AI failed: ${result.error}`);
      }
    } else {
      briefing = `Welcome to MindGuard! Start your first focus session and I'll craft a personalized daily briefing from your real data. Even 15 minutes of focus can change your day.`;
    }

    return NextResponse.json({
      briefing,
      mode,
      provider: providerUsed,
      model: modelUsed,
      context: {
        userName: ctx.userName,
        greeting: ctx.greeting,
        todayMinutes: ctx.todayMinutes,
        yesterdayMinutes: ctx.yesterdayMinutes,
        weekMinutes: ctx.weekMinutes,
        streak: ctx.streak,
        focusGoalMinutes: ctx.focusGoalMinutes,
        sessionCountToday: ctx.sessionCountToday,
        activeMissions: ctx.activeMissions,
        topDistractions: ctx.topDistractions,
        coachPersonality: ctx.coachPersonality,
      },
    });
  } catch (e) {
    logError('coach-briefing', 'Failed to generate briefing', e);
    return NextResponse.json({ error: 'Failed to generate briefing' }, { status: 500 });
  }
}
