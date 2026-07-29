import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { generateAIResponse, buildAssistantSystemPrompt } from '@/lib/ai';
import { logError } from '@/lib/logger';
import { format, startOfDay } from 'date-fns';
import type { AITimelineEntry } from '@/types';

export async function GET() {
  try {
    const authResult = await getAuthUserId();
    if (typeof authResult !== 'string') return authResult;
    const userId = authResult;

    const todayStart = startOfDay(new Date());

    // Fetch today's activities and sessions
    const [sessions, activities, reflections] = await Promise.all([
      db.focusSession.findMany({
        where: { userId, startedAt: { gte: todayStart }, type: { not: 'break' } },
        select: { id: true, duration: true, startedAt: true, endedAt: true, missionId: true, quality: true },
        orderBy: { startedAt: 'asc' },
      }),
      db.desktopActivity.findMany({
        where: { userId, startedAt: { gte: todayStart } },
        select: { id: true, type: true, title: true, category: true, duration: true, startedAt: true, application: true, website: true },
        orderBy: { startedAt: 'asc' },
      }),
      db.dailyReflection.findFirst({
        where: { userId, date: format(new Date(), 'yyyy-MM-dd') },
        select: { id: true, mood: true, wentWell: true },
      }),
    ]);

    // Build raw timeline data
    const rawTimeline: Array<{
      time: string;
      title: string;
      type: string;
      duration: number;
      category?: string;
      application?: string;
    }> = [];

    for (const s of sessions) {
      const mission = await db.mission.findUnique({
        where: { id: s.missionId || '' },
        select: { title: true },
      }).catch(() => null);

      rawTimeline.push({
        time: format(new Date(s.startedAt), 'HH:mm'),
        title: `${Math.round(s.duration / 60)}min focus on ${mission?.title || 'general focus'}`,
        type: 'focus_session',
        duration: s.duration,
        category: 'productive',
      });
    }

    for (const a of activities) {
      rawTimeline.push({
        time: format(new Date(a.startedAt), 'HH:mm'),
        title: a.title || a.type,
        type: a.type,
        duration: a.duration,
        category: a.category ?? undefined,
        application: a.application ?? undefined,
      });
    }

    if (reflections) {
      rawTimeline.push({
        time: '20:00', // approximate reflection time
        title: 'Daily reflection',
        type: 'reflection',
        duration: 0,
        category: 'self-care',
      });
    }

    // Sort by time
    rawTimeline.sort((a, b) => a.time.localeCompare(b.time));

    const user = await db.user.findUnique({ where: { id: userId }, select: { name: true, displayName: true } });
    const userName = user?.displayName || user?.name || 'friend';

    // Build context for AI to create human-readable stories
    const context = `Raw timeline data for today (${format(new Date(), 'yyyy-MM-dd')}):
${rawTimeline.map(e => `${e.time} — ${e.title} (${e.type}, ${Math.round(e.duration / 60)}min, ${e.category || 'unknown'})`).join('\n')}`;

    const systemPrompt = `${buildAssistantSystemPrompt(userName)}

You are converting raw activity data into an AI Timeline — human-readable stories with descriptions. Output ONLY valid JSON array (no markdown, no explanation) matching this exact structure:
[
  {
    "time": "9:00",
    "title": "Deep Focus on Project Alpha",
    "description": "Spent 45 minutes in deep work, completing a major milestone",
    "type": "deep_work",
    "icon": "🎯",
    "duration": 45,
    "category": "productive",
    "nextEntry": "9:45"
  }
]

Convert each raw entry into a engaging, narrative entry. Use descriptive titles and insightful descriptions. Merge similar consecutive entries if appropriate.`;

    const aiResponse = await generateAIResponse(systemPrompt, 'Convert my raw timeline into an AI timeline story.', context);

    // Parse the JSON response
    let timeline: AITimelineEntry[];
    try {
      const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      timeline = JSON.parse(cleanResponse);
    } catch {
      // Fallback: convert raw timeline directly
      timeline = rawTimeline.map(e => ({
        time: e.time,
        title: e.title,
        description: `${e.type} activity for ${Math.round(e.duration / 60)} minutes`,
        type: e.type,
        icon: e.type.includes('focus') ? '🎯' : e.type.includes('distracted') ? '⚠️' : '📝',
        duration: Math.round(e.duration / 60),
        category: e.category,
      }));
    }

    return NextResponse.json(timeline);
  } catch (error) {
    logError('assistant-timeline', 'GET /api/assistant/timeline failed', error);
    return NextResponse.json({ error: 'Failed to generate AI timeline' }, { status: 500 });
  }
}
