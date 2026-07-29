import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { calculateStreak, findBestHour, findBestWeekday, weekdayLabel, hourLabel } from '@/lib/analytics';
import { logError, logInfo } from '@/lib/logger';
import { aiCompleteWithFallback, type AIProviderConfig } from '@/lib/ai-provider';
import { buildCoachContext, buildCoachPrompt, contextToText, type CoachMode } from '@/lib/coach-context';
import {
  format,
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  differenceInCalendarDays,
} from 'date-fns';

// ─── GET: Daily briefing (enhanced with AI) ───

export async function GET() {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    // Build coach context from user data
    const ctx = await buildCoachContext(userId);

    // Get user's AI provider settings
    const settings = await db.userSettings.findUnique({
      where: { userId },
      select: { aiProvider: true, aiApiKey: true, aiModel: true, aiOllamaUrl: true, coachPersonality: true },
    });

    const aiConfig: AIProviderConfig = {
      provider: (settings?.aiProvider as AIProviderConfig['provider']) || 'z-ai',
      apiKey: settings?.aiApiKey,
      model: settings?.aiModel,
      ollamaUrl: settings?.aiOllamaUrl,
    };

    // Determine the right mode based on time of day
    const hour = ctx.hour;
    let mode: CoachMode = 'briefing';
    if (hour < 12) mode = 'morning_plan';
    else if (hour >= 21) mode = 'night_review';

    // Build prompt for AI coach
    const messages = buildCoachPrompt(mode, ctx);

    // Call AI with fallback
    let aiBriefing: string | null = null;
    let aiMorningPlan: string | null = null;
    let aiNightReview: string | null = null;
    let aiProviderUsed: string | null = null;
    let aiModelUsed: string | null = null;

    // Only call AI if user has some data (not completely empty)
    const hasData = ctx.todayMinutes > 0 || ctx.weekMinutes > 0 || ctx.streak > 0;

    if (hasData) {
      const result = await aiCompleteWithFallback(messages, aiConfig);
      if (result.success) {
        aiProviderUsed = result.provider;
        aiModelUsed = result.model || null;

        // Store in the right field based on mode
        if (mode === 'morning_plan') aiMorningPlan = result.content;
        else if (mode === 'night_review') aiNightReview = result.content;
        else aiBriefing = result.content;
      } else {
        logError('coach', `AI completion failed: ${result.error}`);
      }
    }

    // Also compute the static recommendations (as fallback / supplement)
    const recommendations: string[] = [];

    if (ctx.todayMinutes === 0) {
      recommendations.push(
        `You haven't started a focus session yet today. Even a 15-minute block will keep your ${ctx.streak > 1 ? `${ctx.streak}-day streak` : 'momentum'} alive.`
      );
    } else if (ctx.todayMinutes < 30) {
      recommendations.push(
        `You've logged ${ctx.todayMinutes} minute${ctx.todayMinutes === 1 ? '' : 's'} today. A single 25-minute deep work block would double your output.`
      );
    } else if (ctx.todayMinutes < 90) {
      recommendations.push(
        `Solid start at ${ctx.todayMinutes} minutes today. Consider one more session to push past the 90-minute focus threshold.`
      );
    } else {
      recommendations.push(
        `${ctx.todayMinutes} minutes of focused work today — your attention is on point. Protect the rest of the day from context switches.`
      );
    }

    if (ctx.yesterdayMinutes > 0 && ctx.todayMinutes < ctx.yesterdayMinutes) {
      const dropPct = Math.round(
        ((ctx.yesterdayMinutes - ctx.todayMinutes) / ctx.yesterdayMinutes) * 100
      );
      recommendations.push(
        `You're ${dropPct}% behind yesterday's ${ctx.yesterdayMinutes}-minute pace. One focused session will close the gap.`
      );
    } else if (ctx.yesterdayMinutes > 0 && ctx.todayMinutes > ctx.yesterdayMinutes) {
      recommendations.push(
        `You've already surpassed yesterday's ${ctx.yesterdayMinutes} minutes. Momentum is on your side.`
      );
    }

    if (ctx.bestHour !== null) {
      const hLabel = hourLabel(ctx.bestHour);
      recommendations.push(
        `Your data says you focus best in the ${hLabel} (around ${ctx.bestHour}:00). Try scheduling your hardest mission in that window.`
      );
    }

    if (ctx.bestWeekday) {
      recommendations.push(
        `${ctx.bestWeekday} is your strongest weekday. Plan deep work for ${ctx.bestWeekday}s.`
      );
    }

    if (ctx.reflectionRate < 30) {
      recommendations.push(
        `Your reflection rate is ${ctx.reflectionRate}% over the last 30 days. Reflecting for 60 seconds at day's end improves tomorrow's focus.`
      );
    }

    if (ctx.weekMissionsCompleted === 0) {
      recommendations.push(
        `No missions completed yet this week. Pick one mission and ship it before Sunday.`
      );
    }

    if (ctx.streak >= 3) {
      recommendations.push(
        `${ctx.streak}-day streak active. Don't break the chain — even a short session today keeps it alive.`
      );
    }

    const trimmedRecs = recommendations.slice(0, 5);

    // Static summary as baseline
    const changeVsYesterday = ctx.yesterdayMinutes > 0
      ? `${ctx.todayMinutes > ctx.yesterdayMinutes ? 'up' : 'down'} ${Math.abs(Math.round(((ctx.todayMinutes - ctx.yesterdayMinutes) / ctx.yesterdayMinutes) * 100))}% vs yesterday`
      : ctx.todayMinutes > 0
        ? 'a fresh start vs no focus time yesterday'
        : 'no focus time yet today';

    const summary = `${ctx.todayMinutes} focused minute${ctx.todayMinutes === 1 ? '' : 's'} today — ${changeVsYesterday}. ${ctx.weekMinutes} minutes this week across ${ctx.sessionCountWeek} session${ctx.sessionCountWeek === 1 ? '' : 's'}. ${ctx.streak}-day streak. ${ctx.weekMissionsCompleted} mission${ctx.weekMissionsCompleted === 1 ? '' : 's'} completed this week, reflection rate at ${ctx.reflectionRate}%.`;

    return NextResponse.json({
      greeting: ctx.greeting,
      userName: ctx.userName,
      todayMinutes: ctx.todayMinutes,
      yesterdayMinutes: ctx.yesterdayMinutes,
      weekMinutes: ctx.weekMinutes,
      bestHour: ctx.bestHour,
      bestWeekday: ctx.bestWeekday,
      streak: ctx.streak,
      weekMissionsCompleted: ctx.weekMissionsCompleted,
      weekReflections: ctx.reflectionRate,
      recommendations: trimmedRecs,
      summary,
      // AI-enhanced fields
      aiBriefing,
      aiMorningPlan,
      aiNightReview,
      aiProvider: aiProviderUsed,
      aiModel: aiModelUsed,
      coachPersonality: ctx.coachPersonality,
    });
  } catch (e) {
    logError("coach", "Failed to fetch coach briefing", e);
    return NextResponse.json(
      { error: 'Failed to fetch coach briefing' },
      { status: 500 }
    );
  }
}

// ─── POST: Ask the coach a question ───

export async function POST(request: NextRequest) {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const body = await request.json();
    const { question, mode } = body as { question?: string; mode?: CoachMode };

    if (!question && !mode) {
      return NextResponse.json(
        { error: 'Please provide a question or mode' },
        { status: 400 }
      );
    }

    const coachMode: CoachMode = mode || 'question';

    // Build context
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

    // Build prompt
    const messages = buildCoachPrompt(coachMode, ctx, question);

    // Call AI
    const result = await aiCompleteWithFallback(messages, aiConfig);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'AI coach failed to respond' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      response: result.content,
      provider: result.provider,
      model: result.model,
      mode: coachMode,
    });
  } catch (e) {
    logError('coach', 'Failed to process coach question', e);
    return NextResponse.json(
      { error: 'Failed to process coach question' },
      { status: 500 }
    );
  }
}
