import { db } from '@/lib/db';
import { subDays } from 'date-fns';
import { calculateStreak, findBestHour } from '@/lib/analytics';
import { logError, logInfo } from '@/lib/logger';

/**
 * AI Memory Engine — auto-generates and scores memories from user data.
 */

// ─── Memory Generation ───

export async function generateMemories(userId: string): Promise<number> {
  const thirtyDaysAgo = subDays(new Date(), 30);
  let count = 0;

  try {
    // Fetch recent data for memory generation
    const [sessions, reflections, activities, achievements] = await Promise.all([
      db.focusSession.findMany({
        where: { userId, startedAt: { gte: thirtyDaysAgo }, type: { not: 'break' } },
        select: { id: true, startedAt: true, duration: true, missionId: true, quality: true },
      }),
      db.dailyReflection.findMany({
        where: { userId, createdAt: { gte: thirtyDaysAgo } },
        select: { id: true, date: true, mood: true, energy: true, distraction: true, wentWell: true },
      }),
      db.desktopActivity.findMany({
        where: { userId, startedAt: { gte: thirtyDaysAgo } },
        select: { id: true, type: true, title: true, category: true, duration: true, startedAt: true },
      }),
      db.achievement.findMany({
        where: { userId, unlockedAt: { gte: thirtyDaysAgo } },
        select: { id: true, type: true, unlockedAt: true },
      }),
    ]);

    // 1. Best Focus Hours Memory
    const bestHour = findBestHour(sessions);
    if (bestHour !== null) {
      const hourSessions = sessions.filter(s => new Date(s.startedAt).getHours() === bestHour);
      const avgMinutes = Math.round(hourSessions.reduce((a, s) => a + s.duration / 60, 0) / (hourSessions.length || 1));
      const hourLabel = bestHour < 12 ? `${bestHour} AM` : bestHour === 12 ? '12 PM' : `${bestHour - 12} PM`;

      await createMemoryIfNotExists(userId, 'best_hours', {
        content: `Best focus hour is ${hourLabel} with average ${avgMinutes} minutes per session`,
        importance: 8,
        source: 'session',
        sourceId: undefined,
        context: JSON.stringify({ hour: bestHour, avgMinutes, sessionCount: hourSessions.length }),
      });
      count++;
    }

    // 2. Distraction Patterns Memory
    const distractedActivities = activities.filter(a =>
      ['distracted', 'entertainment', 'gaming', 'browsing'].includes(a.type)
    );
    if (distractedActivities.length > 0) {
      const totalDistractionMin = Math.round(distractedActivities.reduce((a, a2) => a + a2.duration / 60, 0));
      const topDistractionApps = [...new Set(distractedActivities.map(a => a.title || 'Unknown'))].slice(0, 3);

      await createMemoryIfNotExists(userId, 'distraction_pattern', {
        content: `Frequently distracted by ${topDistractionApps.join(', ')} — total ${totalDistractionMin} minutes in last 30 days`,
        importance: 7,
        source: 'activity',
        context: JSON.stringify({ totalMinutes: totalDistractionMin, topSources: topDistractionApps }),
      });
      count++;
    }

    // 3. Work Preferences Memory
    const codingActivities = activities.filter(a => a.category === 'coding' || a.type === 'coding');
    const writingActivities = activities.filter(a => a.category === 'writing' || a.type === 'writing');
    const meetingActivities = activities.filter(a => a.type === 'meetings');
    const deepWorkActivities = activities.filter(a => a.type === 'deep_work');

    const categoryCounts = [
      { category: 'coding', minutes: Math.round(codingActivities.reduce((a, s) => a + s.duration / 60, 0)) },
      { category: 'writing', minutes: Math.round(writingActivities.reduce((a, s) => a + s.duration / 60, 0)) },
      { category: 'meetings', minutes: Math.round(meetingActivities.reduce((a, s) => a + s.duration / 60, 0)) },
      { category: 'deep_work', minutes: Math.round(deepWorkActivities.reduce((a, s) => a + s.duration / 60, 0)) },
    ].sort((a, b) => b.minutes - a.minutes);

    if (categoryCounts[0].minutes > 0) {
      await createMemoryIfNotExists(userId, 'work_preference', {
        content: `Spends most time on ${categoryCounts[0].category} (${categoryCounts[0].minutes} min/30d), followed by ${categoryCounts[1]?.category || 'other'}`,
        importance: 6,
        source: 'activity',
        context: JSON.stringify({ categoryBreakdown: categoryCounts }),
      });
      count++;
    }

    // 4. Streak History Memory
    const streak = await calculateStreak(userId);
    if (streak > 0) {
      await createMemoryIfNotExists(userId, 'streak', {
        content: `Current streak is ${streak} days — best streak was likely around this value`,
        importance: streak > 7 ? 9 : streak > 3 ? 6 : 4,
        source: 'achievement',
        context: JSON.stringify({ currentStreak: streak }),
      });
      count++;
    }

    // 5. Mood Patterns Memory
    const moodReflections = reflections.filter(r => r.mood !== null);
    if (moodReflections.length >= 3) {
      const avgMood = Math.round(moodReflections.reduce((a, r) => a + (r.mood || 0), 0) / moodReflections.length);
      const moodTrend = moodReflections.length >= 5
        ? (moodReflections.slice(-3).reduce((a, r) => a + (r.mood || 0), 0) / 3 > avgMood ? 'improving' : 'declining')
        : 'stable';

      await createMemoryIfNotExists(userId, 'habit', {
        content: `Average mood is ${avgMood}/10 with ${moodTrend} trend`,
        importance: 7,
        source: 'reflection',
        context: JSON.stringify({ avgMood, moodTrend, sampleSize: moodReflections.length }),
      });
      count++;
    }

    // 6. Reflection Insights Memory
    if (reflections.length > 0) {
      const commonDistractions = reflections
        .map(r => r.distraction)
        .filter(Boolean)
        .reduce<Record<string, number>>((acc, d) => {
          acc[d] = (acc[d] || 0) + 1;
          return acc;
        }, {});
      const topDistraction = Object.entries(commonDistractions).sort((a, b) => b[1] - a[1])[0];

      if (topDistraction) {
        await createMemoryIfNotExists(userId, 'pattern', {
          content: `Most common distraction: "${topDistraction[0]}" (mentioned ${topDistraction[1]} times in reflections)`,
          importance: 7,
          source: 'reflection',
          context: JSON.stringify({ distraction: topDistraction[0], count: topDistraction[1] }),
        });
        count++;
      }
    }

    // 7. Weekly Summary Memory
    const lastWeekSessions = sessions.filter(s => s.startedAt >= subDays(new Date(), 7));
    const weeklyMinutes = Math.round(lastWeekSessions.reduce((a, s) => a + s.duration / 60, 0));
    if (weeklyMinutes > 0) {
      await createMemoryIfNotExists(userId, 'weekly_report', {
        content: `Last week: ${weeklyMinutes} focus minutes across ${lastWeekSessions.length} sessions`,
        importance: 6,
        source: 'session',
        context: JSON.stringify({ weekMinutes: weeklyMinutes, sessionCount: lastWeekSessions.length }),
      });
      count++;
    }

    // 8. Achievement Memory
    for (const ach of achievements.slice(0, 3)) {
      await createMemoryIfNotExists(userId, 'insight', {
        content: `Achievement unlocked: ${ach.type}`,
        importance: 5,
        source: 'achievement',
        sourceId: ach.id,
        context: JSON.stringify({ achievementType: ach.type, unlockedAt: ach.unlockedAt }),
      });
      count++;
    }

    // Apply decay to all memories
    await decayMemories(userId);

    logInfo('memory', `Generated ${count} memories for user ${userId}`);
    return count;
  } catch (error) {
    logError('memory', 'generateMemories failed', error);
    return 0;
  }
}

// ─── Memory Scoring ───

export function scoreMemory(memory: {
  importance: number;
  createdAt: Date | string;
  type: string;
}): number {
  const now = new Date();
  const created = typeof memory.createdAt === 'string' ? new Date(memory.createdAt) : memory.createdAt;
  const daysSinceCreation = Math.max(0, (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

  // Recency factor: decays by 0.5% per day, minimum 0.3
  const recencyFactor = Math.max(0.3, 1 - 0.005 * daysSinceCreation);

  // Type weight: certain types are more valuable
  const typeWeights: Record<string, number> = {
    best_hours: 1.2,
    distraction_pattern: 1.1,
    work_preference: 1.1,
    streak: 1.3,
    habit: 1.0,
    pattern: 1.0,
    insight: 1.0,
    weekly_report: 0.8,
    preference: 0.9,
    summary: 0.7,
    conversation: 0.6,
  };
  const typeFactor = typeWeights[memory.type] || 1.0;

  // Composite score
  return memory.importance * recencyFactor * typeFactor;
}

// ─── Memory Retrieval ───

export async function retrieveMemories(
  userId: string,
  query?: string,
  limit: number = 20
): Promise<Array<{ id: string; type: string; content: string; importance: number; score: number; source: string | null; createdAt: Date }>> {
  try {
    let memories = await db.memory.findMany({
      where: { userId },
      orderBy: [
        { importance: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 100,
    });

    // Calculate scores
    memories = memories.map(m => ({
      ...m,
      score: scoreMemory(m),
    }));

    // Sort by score
    memories.sort((a, b) => b.score - a.score);

    // If query provided, filter by relevance (simple text matching)
    if (query) {
      const queryLower = query.toLowerCase();
      const relevant = memories.filter(m =>
        m.content.toLowerCase().includes(queryLower) ||
        m.type.toLowerCase().includes(queryLower)
      );
      // Boost score of relevant memories
      const boosted = relevant.map(m => ({ ...m, score: m.score * 1.5 }));
      // Combine: relevant first, then others
      const others = memories.filter(m =>
        !m.content.toLowerCase().includes(queryLower) &&
        !m.type.toLowerCase().includes(queryLower)
      );
      memories = [...boosted, ...others];
    }

    return memories.slice(0, limit);
  } catch (error) {
    logError('memory', 'retrieveMemories failed', error);
    return [];
  }
}

// ─── Memory Search ───

export async function searchMemories(
  userId: string,
  query: string,
  limit: number = 10
): Promise<Array<{ id: string; type: string; content: string; importance: number; score: number; source: string | null; createdAt: Date }>> {
  const queryLower = query.toLowerCase();

  try {
    const memories = await db.memory.findMany({
      where: {
        userId,
        content: { contains: queryLower },
      },
      orderBy: { importance: 'desc' },
      take: limit * 2, // over-fetch then score
    });

    return memories
      .map(m => ({ ...m, score: scoreMemory(m) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    logError('memory', 'searchMemories failed', error);
    return [];
  }
}

// ─── Memory Decay ───

export async function decayMemories(userId: string): Promise<void> {
  try {
    // Reduce importance of memories older than 30 days
    const thirtyDaysAgo = subDays(new Date(), 30);

    const oldMemories = await db.memory.findMany({
      where: {
        userId,
        createdAt: { lt: thirtyDaysAgo },
        importance: { gt: 2 }, // don't decay already low importance memories
      },
      select: { id: true, importance: true },
    });

    for (const memory of oldMemories) {
      const newImportance = Math.max(2, memory.importance - 1);
      await db.memory.update({
        where: { id: memory.id },
        data: { importance: newImportance },
      });
    }

    // Delete memories with importance 1 that are older than 90 days
    const ninetyDaysAgo = subDays(new Date(), 90);
    await db.memory.deleteMany({
      where: {
        userId,
        importance: { lte: 1 },
        createdAt: { lt: ninetyDaysAgo },
      },
    });

    // Update scores for all memories
    const allMemories = await db.memory.findMany({
      where: { userId },
      select: { id: true, importance: true, createdAt: true, type: true },
    });

    for (const memory of allMemories) {
      const newScore = scoreMemory(memory);
      await db.memory.update({
        where: { id: memory.id },
        data: { score: newScore },
      });
    }

    logInfo('memory', `Decay applied for user ${userId}: ${oldMemories.length} memories decayed`);
  } catch (error) {
    logError('memory', 'decayMemories failed', error);
  }
}

// ─── Helper: Create Memory Only If Similar Doesn't Exist ───

async function createMemoryIfNotExists(
  userId: string,
  type: string,
  data: {
    content: string;
    importance: number;
    source?: string;
    sourceId?: string;
    context?: string;
  }
): Promise<void> {
  // Check if a very similar memory already exists (same type, similar content)
  const existing = await db.memory.findFirst({
    where: {
      userId,
      type,
      content: { contains: data.content.slice(0, 50) },
      createdAt: { gte: subDays(new Date(), 7) }, // only check recent duplicates
    },
  });

  if (!existing) {
    await db.memory.create({
      data: {
        userId,
        type,
        content: data.content,
        importance: data.importance,
        score: scoreMemory({ importance: data.importance, createdAt: new Date(), type }),
        source: data.source || 'ai_generated',
        sourceId: data.sourceId,
        context: data.context,
      },
    });
  }
}

// ─── Build Memory Context for AI ───

export async function buildMemoryContext(userId: string, limit: number = 10): Promise<string> {
  const memories = await retrieveMemories(userId, undefined, limit);

  if (memories.length === 0) {
    return 'No memories available yet.';
  }

  return memories
    .map(m => `[${m.type}] (importance: ${m.importance.toFixed(1)}) ${m.content}`)
    .join('\n');
}
