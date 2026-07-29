import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { generateAIResponse, buildAssistantSystemPrompt } from '@/lib/ai';
import { buildMemoryContext } from '@/lib/memory';
import { getFullPredictions } from '@/lib/predictions';
import { calculateStreak, calculateFocusScore } from '@/lib/analytics';
import { logError } from '@/lib/logger';
import { startOfDay, subDays } from 'date-fns';
import type { AIRecommendation } from '@/types';

export async function GET() {
  try {
    const authResult = await getAuthUserId();
    if (typeof authResult !== 'string') return authResult;
    const userId = authResult;

    const [user, predictions, memories] = await Promise.all([
      db.user.findUnique({ where: { id: userId }, select: { name: true, displayName: true } }),
      getFullPredictions(userId),
      buildMemoryContext(userId, 10),
    ]);

    const userName = user?.displayName || user?.name || 'friend';
    const sevenDaysAgo = subDays(new Date(), 7);
    const recentSessions = await db.focusSession.findMany({
      where: { userId, startedAt: { gte: sevenDaysAgo }, type: { not: 'break' } },
      select: { duration: true, startedAt: true },
    });
    const weeklyMinutes = recentSessions.reduce((a, s) => a + s.duration / 60, 0);
    const streak = await calculateStreak(userId);
    const todayMinutes = recentSessions.filter(s => s.startedAt >= startOfDay(new Date())).reduce((a, s) => a + s.duration / 60, 0);
    const focusScore = calculateFocusScore(todayMinutes, weeklyMinutes, streak);

    // Get recent distraction data
    const recentDistractions = await db.desktopActivity.findMany({
      where: { userId, startedAt: { gte: sevenDaysAgo }, type: { in: ['distracted', 'entertainment', 'gaming', 'browsing'] } },
      select: { title: true, duration: true, type: true },
      take: 5,
    });

    const context = `
User Data for Recommendations:
- Name: ${userName}
- Focus score: ${focusScore}
- Current streak: ${streak}
- Weekly focus: ${Math.round(weeklyMinutes)} minutes
- Burnout risk: ${predictions.burnoutRisk.level} (${predictions.burnoutRisk.probability.toFixed(2)})
- Streak risk: ${predictions.streakRisk.riskLevel}
- Best work hours: ${predictions.bestWorkHours.map(h => `${h.hour}:00 (${h.productiveMinutes}min)`).join(', ')}
- Top distractions: ${recentDistractions.map(d => `"${d.title}" (${Math.round(d.duration / 60)}min)`).join(', ')}
- Memories: ${memories}`;

    const systemPrompt = `${buildAssistantSystemPrompt(userName)}

You are generating personalized AI Recommendations. Output ONLY valid JSON array (no markdown, no explanation) matching this exact structure:
[
  {
    "id": "rec-1",
    "type": "break|schedule|avoid|continue|habit|health|focus",
    "title": "...",
    "description": "...",
    "urgency": "low|medium|high",
    "dataBased": true,
    "supportingData": "...",
    "action": "..."
  }
]

Generate 5-7 personalized recommendations based on the user's data. Each recommendation should be actionable and specific to their patterns.`;

    const aiResponse = await generateAIResponse(systemPrompt, 'Generate my personalized recommendations based on the context data provided.', context);

    // Parse the JSON response
    let recommendations: AIRecommendation[];
    try {
      const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      recommendations = JSON.parse(cleanResponse);
    } catch {
      // Fallback recommendations
      recommendations = [
        {
          id: 'rec-1',
          type: 'focus',
          title: 'Schedule your best work hours',
          description: `Your most productive time is ${predictions.bestWorkHours[0]?.hour || 9}:00. Block that time for deep work.`,
          urgency: 'medium',
          dataBased: true,
          supportingData: `Best hour data: ${predictions.bestWorkHours.map(h => `${h.hour}:00`).join(', ')}`,
          action: 'Block your best hours for deep work tomorrow',
        },
        {
          id: 'rec-2',
          type: 'habit',
          title: 'Maintain your streak',
          description: predictions.streakRisk.riskLevel === 'high'
            ? 'Your streak is at risk! Start a session today.'
            : `You're on a ${streak}-day streak. Keep it going!`,
          urgency: predictions.streakRisk.riskLevel === 'high' ? 'high' : 'low',
          dataBased: true,
          supportingData: `Streak: ${streak} days, Risk: ${predictions.streakRisk.riskLevel}`,
          action: 'Start a focus session today to protect your streak',
        },
        {
          id: 'rec-3',
          type: 'health',
          title: 'Watch for burnout',
          description: predictions.burnoutRisk.level === 'high'
            ? 'You may be overworking. Take extra breaks.'
            : 'Your workload seems balanced.',
          urgency: predictions.burnoutRisk.level === 'high' ? 'high' : 'low',
          dataBased: true,
          supportingData: `Burnout risk: ${predictions.burnoutRisk.level} (${predictions.burnoutRisk.probability.toFixed(2)})`,
          action: 'Take regular breaks and track your mood',
        },
        {
          id: 'rec-4',
          type: 'avoid',
          title: 'Minimize distractions',
          description: recentDistractions.length > 0
            ? `Your top distraction is "${recentDistractions[0].title}". Try to avoid it during focus blocks.`
            : 'No major distractions detected recently.',
          urgency: 'medium',
          dataBased: true,
          supportingData: `Distraction data: ${recentDistractions.map(d => d.title).join(', ')}`,
          action: 'Set app/website blockers during focus sessions',
        },
        {
          id: 'rec-5',
          type: 'continue',
          title: 'Keep your momentum',
          description: `You've accumulated ${Math.round(weeklyMinutes)} focus minutes this week. Keep the pace!`,
          urgency: 'low',
          dataBased: true,
          supportingData: `Weekly focus: ${Math.round(weeklyMinutes)} minutes`,
          action: 'Continue your current routine',
        },
      ];
    }

    // Ensure IDs
    recommendations = recommendations.map((r, i) => ({
      ...r,
      id: r.id || `rec-${i + 1}`,
    }));

    return NextResponse.json(recommendations);
  } catch (error) {
    logError('assistant-recommendations', 'GET /api/assistant/recommendations failed', error);
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}
