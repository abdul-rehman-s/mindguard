import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { logError, logInfo } from '@/lib/logger';
import { aiCompleteWithFallback, type AIProviderConfig } from '@/lib/ai-provider';
import { buildCoachContext, buildCoachPrompt, type CoachMode } from '@/lib/coach-context';

/**
 * GET /api/coach/suggestions?type=mission|focus — AI-powered mission/focus suggestions
 *
 * Query params:
 *   type: "mission" (mission suggestions) or "focus" (focus suggestions)
 */
export async function GET(request: NextRequest) {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'focus';
    const mode: CoachMode = type === 'mission' ? 'mission_suggestions' : 'focus_suggestions';

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

    const hasData = ctx.todayMinutes > 0 || ctx.weekMinutes > 0 || ctx.streak > 0;

    let suggestions: string | null = null;
    let providerUsed: string | null = null;
    let modelUsed: string | null = null;

    if (hasData) {
      const messages = buildCoachPrompt(mode, ctx);
      const result = await aiCompleteWithFallback(messages, aiConfig);
      if (result.success) {
        suggestions = result.content;
        providerUsed = result.provider;
        modelUsed = result.model || null;
        logInfo('coach-suggestions', `Generated ${type} suggestions with ${providerUsed}`);
      } else {
        logError('coach-suggestions', `AI failed: ${result.error}`);
      }
    } else {
      suggestions = type === 'mission'
        ? `No focus data yet. Start tracking and I'll suggest personalized missions based on your patterns and goals.`
        : `No focus data yet. Start tracking and I'll suggest optimal focus session durations, time windows, and techniques based on your real data.`;
    }

    return NextResponse.json({
      suggestions,
      type,
      provider: providerUsed,
      model: modelUsed,
      context: {
        userName: ctx.userName,
        todayMinutes: ctx.todayMinutes,
        weekMinutes: ctx.weekMinutes,
        streak: ctx.streak,
        focusGoalMinutes: ctx.focusGoalMinutes,
        bestHour: ctx.bestHour,
        activeMissions: ctx.activeMissions,
        topDistractions: ctx.topDistractions,
        avgSessionDurationToday: ctx.avgSessionDurationToday,
        coachPersonality: ctx.coachPersonality,
      },
    });
  } catch (e) {
    logError('coach-suggestions', 'Failed to generate suggestions', e);
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 });
  }
}
