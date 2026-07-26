import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { generateAIResponse, buildAssistantSystemPrompt } from '@/lib/ai';
import { buildMemoryContext } from '@/lib/memory';
import { calculateStreak, calculateFocusScore } from '@/lib/analytics';
import { logError } from '@/lib/logger';
import { format, startOfDay, subDays } from 'date-fns';
import type { EveningReview } from '@/types';

export async function GET() {
  try {
    const authResult = await getAuthUserId();
    if (typeof authResult !== 'string') return authResult;
    const userId = authResult;

    const todayStart = startOfDay(new Date());
    const todayDate = format(new Date(), 'yyyy-MM-dd');
    const sevenDaysAgo = subDays(new Date(), 7);

    const [user, todaySessions, todayActivities, todayReflection, activeMissions, completedMissionsToday, achievementsToday, memories] = await Promise.all([
      db.user.findUnique({ where: { id: userId }, select: { name: true, displayName: true, xp: true, level: true } }),
      db.focusSession.findMany({ where: { userId, startedAt: { gte: todayStart }, type: { not: 'break' } }, select: { id: true, duration: true, startedAt: true, missionId: true, quality: true } }),
      db.desktopActivity.findMany({ where: { userId, startedAt: { gte: todayStart } }, select: { id: true, type: true, title: true, category: true, duration: true, startedAt: true } }),
      db.dailyReflection.findFirst({ where: { userId, date: todayDate }, select: { mood: true, energy: true, distraction: true, wentWell: true, tomorrowMission: true } }),
      db.mission.findMany({ where: { userId, status: 'active' }, select: { id: true, title: true } }),
      db.mission.findMany({ where: { userId, status: 'completed', completedAt: { gte: todayStart } }, select: { id: true, title: true } }),
      db.achievement.findMany({ where: { userId, unlockedAt: { gte: todayStart } }, select: { type: true } }),
      buildMemoryContext(userId, 10),
    ]);

    const userName = user?.displayName || user?.name || 'friend';
    const streak = await calculateStreak(userId);
    const recentWeekSessions = await db.focusSession.findMany({
      where: { userId, startedAt: { gte: sevenDaysAgo }, type: { not: 'break' } },
      select: { duration: true, startedAt: true },
    });
    const weeklyMinutes = recentWeekSessions.reduce((a, s) => a + s.duration / 60, 0);
    const todayFocusMinutes = todaySessions.reduce((a, s) => a + s.duration / 60, 0);
    const focusScore = calculateFocusScore(todayFocusMinutes, weeklyMinutes, streak);

    // Distraction summary
    const distractedActivities = todayActivities.filter(a =>
      ['distracted', 'entertainment', 'gaming', 'browsing'].includes(a.type)
    );
    const totalDistractionMin = Math.round(distractedActivities.reduce((a, a2) => a + a2.duration / 60, 0));

    // Productivity grade
    const gradeFromScore = (score: number): string => {
      if (score >= 90) return 'A';
      if (score >= 80) return 'B';
      if (score >= 70) return 'C';
      if (score >= 60) return 'D';
      return 'F';
    };

    // Build context
    const context = `
User Data for Evening Review:
- Name: ${userName}
- Today's focus minutes: ${Math.round(todayFocusMinutes)}
- Today's sessions: ${todaySessions.length}
- Focus score: ${focusScore}
- Current streak: ${streak} days
- Weekly focus minutes: ${Math.round(weeklyMinutes)}
- Reflection today: ${todayReflection ? `Mood: ${todayReflection.mood}/10, Energy: ${todayReflection.energy}/10, Distraction: "${todayReflection.distraction}", Went well: "${todayReflection.wentWell}"` : 'No reflection yet'}
- Active missions: ${activeMissions.map(m => `"${m.title}"`).join(', ') || 'None'}
- Missions completed today: ${completedMissionsToday.map(m => `"${m.title}"`).join(', ') || 'None'}
- Achievements today: ${achievementsToday.map(a => a.type).join(', ') || 'None'}
- Total distraction minutes: ${totalDistractionMin}
- Top distractions: ${distractedActivities.slice(0, 5).map(a => `"${a.title}" (${Math.round(a.duration / 60)}min)`).join(', ') || 'None'}
- Relevant memories: ${memories}`;

    const systemPrompt = `${buildAssistantSystemPrompt(userName)}

You are generating an Evening Review. Output ONLY valid JSON (no markdown, no explanation) matching this exact structure:
{
  "date": "${todayDate}",
  "productivityGrade": "${gradeFromScore(focusScore)}",
  "gradeScore": ${focusScore},
  "achievements": [<list of achievement strings>],
  "biggestWins": [{"title": "...", "description": "..."}],
  "biggestMistakes": [{"title": "...", "description": "..."}],
  "distractions": [{"source": "...", "minutes": <number>, "suggestion": "..."}],
  "lessonsLearned": [<list of lesson strings>],
  "suggestions": [<list of suggestion strings>],
  "moodAnalysis": {"mood": ${todayReflection?.mood || 'null'}, "trend": "improving|declining|stable", "insight": "..."},
  "reflectionSummary": "...",
  "tomorrowRecommendations": [<list of recommendation strings>]
}`;

    const aiResponse = await generateAIResponse(systemPrompt, 'Generate my evening review based on the context data provided.', context);

    // Parse the JSON response
    let review: EveningReview;
    try {
      const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      review = JSON.parse(cleanResponse);
    } catch {
      // Fallback review if AI doesn't return valid JSON
      review = {
        date: todayDate,
        productivityGrade: gradeFromScore(focusScore),
        gradeScore: focusScore,
        achievements: achievementsToday.map(a => a.type),
        biggestWins: [{ title: `${Math.round(todayFocusMinutes)} minutes of focus`, description: 'Solid focus time today' }],
        biggestMistakes: [],
        distractions: distractedActivities.slice(0, 3).map(a => ({
          source: a.title || a.type,
          minutes: Math.round(a.duration / 60),
          suggestion: 'Try to minimize this distraction tomorrow',
        })),
        lessonsLearned: [],
        suggestions: ['Review your priorities for tomorrow', 'Set up your morning focus block'],
        moodAnalysis: {
          mood: todayReflection?.mood || null,
          trend: 'stable',
          insight: 'Consistent mood levels',
        },
        reflectionSummary: `${Math.round(todayFocusMinutes)} minutes of focus with ${todaySessions.length} sessions. ${streak > 0 ? `Streak at ${streak} days.` : 'Start a new streak tomorrow!'}`,
        tomorrowRecommendations: ['Plan your morning focus block', 'Review your active missions'],
      };
    }

    return NextResponse.json(review);
  } catch (error) {
    logError('assistant-review', 'GET /api/assistant/review failed', error);
    return NextResponse.json({ error: 'Failed to generate evening review' }, { status: 500 });
  }
}
