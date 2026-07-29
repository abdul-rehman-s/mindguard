import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { generateAIResponse, buildAssistantSystemPrompt } from '@/lib/ai';
import { buildMemoryContext } from '@/lib/memory';
import { calculateStreak, calculateFocusScore } from '@/lib/analytics';
import { logError } from '@/lib/logger';
import { format, startOfDay, subDays } from 'date-fns';
import type { MorningBriefing } from '@/types';

export async function GET() {
  try {
    const authResult = await getAuthUserId();
    if (typeof authResult !== 'string') return authResult;
    const userId = authResult;

    // Fetch all relevant data
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    const sevenDaysAgo = subDays(new Date(), 7);

    const [user, activeMissions, yesterdayReflection, recentSessions, recentActivities, memories] = await Promise.all([
      db.user.findUnique({ where: { id: userId }, select: { name: true, displayName: true, xp: true, level: true } }),
      db.mission.findMany({ where: { userId, status: 'active' }, select: { id: true, title: true, priority: true, createdAt: true } }),
      db.dailyReflection.findFirst({ where: { userId, date: yesterday }, select: { mood: true, energy: true, distraction: true, wentWell: true, tomorrowMission: true } }),
      db.focusSession.findMany({ where: { userId, startedAt: { gte: sevenDaysAgo }, type: { not: 'break' } }, select: { duration: true, startedAt: true, missionId: true } }),
      db.desktopActivity.findMany({ where: { userId, startedAt: { gte: sevenDaysAgo }, type: 'distracted' }, select: { title: true, duration: true } }),
      buildMemoryContext(userId, 15),
    ]);

    const userName = user?.displayName || user?.name || 'friend';
    const streak = await calculateStreak(userId);
    const weeklyMinutes = recentSessions.reduce((a, s) => a + s.duration / 60, 0);
    const todayMinutes = recentSessions.filter(s => s.startedAt >= startOfDay(new Date())).reduce((a, s) => a + s.duration / 60, 0);
    const focusScore = calculateFocusScore(todayMinutes, weeklyMinutes, streak);

    // Build context string
    const context = `
User Data for Morning Briefing:
- Name: ${userName}
- Level: ${user?.level || 1}, XP: ${user?.xp || 0}
- Current streak: ${streak} days
- This week focus minutes: ${Math.round(weeklyMinutes)}
- Focus score: ${focusScore}
- Active missions: ${activeMissions.map(m => `"${m.title}" (priority: ${m.priority})`).join(', ') || 'None'}
- Yesterday's reflection: ${yesterdayReflection ? `Mood: ${yesterdayReflection.mood}/10, Energy: ${yesterdayReflection.energy}/10, Went well: "${yesterdayReflection.wentWell}", Tomorrow mission: "${yesterdayReflection.tomorrowMission}"` : 'No reflection'}
- Recent distractions: ${recentActivities.slice(0, 5).map(a => `"${a.title}" (${Math.round(a.duration / 60)}min)`).join(', ') || 'None'}
- Relevant memories: ${memories}`;

    const systemPrompt = `${buildAssistantSystemPrompt(userName)}

You are generating a Morning Briefing. Output ONLY valid JSON (no markdown, no explanation) matching this exact structure:
{
  "date": "${format(new Date(), 'yyyy-MM-dd')}",
  "priorities": [{"title": "...", "reason": "...", "priority": "high|medium|low"}],
  "estimatedFocusScore": <number 0-100>,
  "suggestedWorkBlocks": [{"start": "9:00", "end": "10:30", "task": "...", "type": "deep_work|creative|planning|review"}],
  "suggestedBreaks": [{"time": "10:30", "duration": 15, "reason": "..."}],
  "missionOrdering": [{"missionId": "...", "title": "...", "order": 1, "reason": "..."}],
  "predictedDistractions": [{"time": "...", "source": "...", "suggestion": "..."}],
  "motivationalSummary": "...",
  "weatherNote": "A metaphorical weather note about your productivity outlook"
}`;

    const aiResponse = await generateAIResponse(systemPrompt, 'Generate my morning briefing based on the context data provided.', context);

    // Parse the JSON response
    let briefing: MorningBriefing;
    try {
      // Clean potential markdown wrappers
      const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      briefing = JSON.parse(cleanResponse);
    } catch {
      // Fallback briefing if AI doesn't return valid JSON
      briefing = {
        date: format(new Date(), 'yyyy-MM-dd'),
        priorities: activeMissions.slice(0, 3).map(m => ({
          title: m.title,
          reason: `Active mission with ${m.priority} priority`,
          priority: m.priority as 'high' | 'medium' | 'low',
        })),
        estimatedFocusScore: focusScore,
        suggestedWorkBlocks: [{ start: '9:00', end: '10:30', task: 'Deep work on most important mission', type: 'deep_work' }],
        suggestedBreaks: [{ time: '10:30', duration: 15, reason: 'Rest after deep work block' }],
        missionOrdering: activeMissions.map((m, i) => ({
          missionId: m.id,
          title: m.title,
          order: i + 1,
          reason: `Based on priority: ${m.priority}`,
        })),
        predictedDistractions: [],
        motivationalSummary: `Good morning ${userName}! You have a ${streak}-day streak going. Keep the momentum!`,
        weatherNote: 'Clear skies ahead for productivity',
      };
    }

    // Ensure missionOrdering uses actual mission IDs
    if (briefing.missionOrdering) {
      briefing.missionOrdering = briefing.missionOrdering.map(order => {
        const matchMission = activeMissions.find(m => m.id === order.missionId || m.title === order.title);
        return {
          ...order,
          missionId: matchMission?.id || order.missionId,
          title: matchMission?.title || order.title,
        };
      });
    }

    return NextResponse.json(briefing);
  } catch (error) {
    logError('assistant-plan', 'GET /api/assistant/plan failed', error);
    return NextResponse.json({ error: 'Failed to generate morning briefing' }, { status: 500 });
  }
}
