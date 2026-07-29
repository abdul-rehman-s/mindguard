import { db } from '@/lib/db';
import { subDays, startOfDay } from 'date-fns';
import { calculateStreak, calculateFocusScore } from '@/lib/analytics';
import { logError } from '@/lib/logger';
import type { PredictionResult } from '@/types';

/**
 * Prediction Engine — uses real data + heuristics to predict future states.
 * Each prediction includes: value, confidence score (0-1), and contributing factors.
 */

export async function predictBurnoutRisk(userId: string): Promise<{
  level: 'low' | 'medium' | 'high';
  probability: number;
  factors: string[];
}> {
  try {
    const now = new Date();
    const week1 = subDays(now, 7);
    const week2 = subDays(now, 14);
    const week3 = subDays(now, 21);

    // Get weekly focus hours for last 3 weeks
    const [week1Sessions, week2Sessions, week3Sessions, recentReflections] = await Promise.all([
      db.focusSession.findMany({
        where: { userId, startedAt: { gte: week1 }, type: { not: 'break' } },
        select: { duration: true, startedAt: true },
      }),
      db.focusSession.findMany({
        where: { userId, startedAt: { gte: week2, lt: week1 }, type: { not: 'break' } },
        select: { duration: true, startedAt: true },
      }),
      db.focusSession.findMany({
        where: { userId, startedAt: { gte: week3, lt: week2 }, type: { not: 'break' } },
        select: { duration: true, startedAt: true },
      }),
      db.dailyReflection.findMany({
        where: { userId, createdAt: { gte: week1 } },
        select: { mood: true, energy: true },
      }),
    ]);

    const week1Hours = week1Sessions.reduce((a, s) => a + s.duration / 3600, 0);
    const week2Hours = week2Sessions.reduce((a, s) => a + s.duration / 3600, 0);
    const week3Hours = week3Sessions.reduce((a, s) => a + s.duration / 3600, 0);

    const factors: string[] = [];
    let riskScore = 0; // 0-100

    // Check workload trend
    if (week1Hours > 50) {
      factors.push(`Heavy workload: ${Math.round(week1Hours)}h this week`);
      riskScore += 20;
    }

    // Check increasing workload
    if (week1Hours > week2Hours && week2Hours > week3Hours) {
      factors.push('Workload has been increasing over 3 weeks');
      riskScore += 25;
    }

    // Check mood decline
    const moods = recentReflections.filter(r => r.mood !== null).map(r => r.mood!);
    if (moods.length >= 3) {
      const recentAvg = moods.slice(-3).reduce((a, m) => a + m, 0) / 3;
      const olderAvg = moods.slice(0, -3).length > 0
        ? moods.slice(0, -3).reduce((a, m) => a + m, 0) / moods.slice(0, -3).length
        : recentAvg;
      if (recentAvg < olderAvg - 1) {
        factors.push(`Mood declining: recent avg ${recentAvg.toFixed(1)} vs earlier ${olderAvg.toFixed(1)}`);
        riskScore += 30;
      }
    }

    // Check energy decline
    const energies = recentReflections.filter(r => r.energy !== null).map(r => r.energy!);
    if (energies.length >= 3) {
      const recentAvg = energies.slice(-3).reduce((a, e) => a + e, 0) / 3;
      if (recentAvg < 5) {
        factors.push(`Low energy levels: avg ${recentAvg.toFixed(1)}/10`);
        riskScore += 20;
      }
    }

    // Check very long sessions (potential overwork)
    const longSessions = week1Sessions.filter(s => s.duration > 7200); // >2h
    if (longSessions.length > 3) {
      factors.push(`${longSessions.length} sessions over 2 hours`);
      riskScore += 15;
    }

    const probability = Math.min(1, riskScore / 100);
    const level = probability < 0.3 ? 'low' : probability < 0.6 ? 'medium' : 'high';

    if (factors.length === 0) {
      factors.push('No significant burnout indicators detected');
    }

    return { level, probability, factors };
  } catch (error) {
    logError('predictions', 'predictBurnoutRisk failed', error);
    return { level: 'low', probability: 0, factors: ['Unable to calculate'] };
  }
}

export async function predictMissionCompletion(userId: string): Promise<{
  missionId: string;
  title: string;
  probability: number;
  factors: string[];
}[]> {
  try {
    const missions = await db.mission.findMany({
      where: { userId, status: 'active' },
      select: { id: true, title: true, createdAt: true, focusSessions: { select: { duration: true } } },
    });

    // Get user's average mission completion time from past completed missions
    const completedMissions = await db.mission.findMany({
      where: { userId, status: 'completed', completedAt: { not: null } },
      select: { createdAt: true, completedAt: true, focusSessions: { select: { duration: true } } },
    });

    const avgCompletionDays = completedMissions.length > 0
      ? completedMissions.reduce((a, m) => {
        if (m.completedAt) {
          const days = (new Date(m.completedAt).getTime() - new Date(m.createdAt).getTime()) / (86400000);
          return a + days;
        }
        return a;
      }, 0) / completedMissions.length
      : 14; // default 14 days

    const avgSessionMinutes = completedMissions.length > 0
      ? completedMissions.reduce((a, m) => a + m.focusSessions.reduce((s2, s) => s2 + s.duration / 60, 0), 0) / completedMissions.length
      : 60; // default 60 min

    return missions.map(m => {
      const daysSinceCreation = (new Date().getTime() - new Date(m.createdAt).getTime()) / 86400000;
      const totalFocusMin = m.focusSessions.reduce((a, s) => a + s.duration / 60, 0);
      const progressRatio = totalFocusMin / avgSessionMinutes;
      const timeRatio = daysSinceCreation / avgCompletionDays;

      let probability = 0.5; // base probability

      // Higher if they've already invested time
      if (progressRatio > 0.5) probability += 0.2;
      if (progressRatio > 1) probability += 0.15;

      // Lower if it's been lingering too long
      if (timeRatio > 2) probability -= 0.2;
      if (timeRatio > 4) probability -= 0.15;

      // Higher if user has good completion history
      if (completedMissions.length > 3) probability += 0.1;

      probability = Math.max(0.1, Math.min(0.95, probability));

      const factors: string[] = [];
      factors.push(`${Math.round(totalFocusMin)} minutes invested`);
      if (daysSinceCreation > avgCompletionDays) {
        factors.push(`Been active for ${Math.round(daysSinceCreation)} days (avg: ${Math.round(avgCompletionDays)})`);
      }
      if (completedMissions.length > 0) {
        factors.push(`Completed ${completedMissions.length} missions historically`);
      }

      return {
        missionId: m.id,
        title: m.title,
        probability,
        factors,
      };
    });
  } catch (error) {
    logError('predictions', 'predictMissionCompletion failed', error);
    return [];
  }
}

export async function predictFocusScore(userId: string): Promise<{
  predicted: number;
  confidence: number;
  factors: string[];
}> {
  try {
    const now = new Date();
    const last7Days = subDays(now, 7);
    const last14Days = subDays(now, 14);

    const [recentSessions, olderSessions] = await Promise.all([
      db.focusSession.findMany({
        where: { userId, startedAt: { gte: last7Days }, type: { not: 'break' } },
        select: { duration: true, startedAt: true },
      }),
      db.focusSession.findMany({
        where: { userId, startedAt: { gte: last14Days, lt: last7Days }, type: { not: 'break' } },
        select: { duration: true, startedAt: true },
      }),
    ]);

    const streak = await calculateStreak(userId);

    const recentMinutes = recentSessions.reduce((a, s) => a + s.duration / 60, 0);
    const olderMinutes = olderSessions.reduce((a, s) => a + s.duration / 60, 0);
    const weeklyMinutes = recentMinutes;

    // Predict based on recent trend
    const trendFactor = recentMinutes > olderMinutes ? 1.05 : recentMinutes < olderMinutes * 0.7 ? 0.85 : 1;
    const predictedToday = Math.min(480, recentMinutes / 7) * trendFactor;
    const predicted = calculateFocusScore(predictedToday, weeklyMinutes, streak);

    // Confidence based on data richness
    const confidence = Math.min(1, recentSessions.length / 14); // more sessions = higher confidence

    const factors: string[] = [];
    factors.push(`Recent weekly avg: ${Math.round(weeklyMinutes / 7)} min/day`);
    if (streak > 0) factors.push(`${streak}-day streak active`);
    if (trendFactor > 1) factors.push('Productivity trend is improving');
    if (trendFactor < 1) factors.push('Productivity trend is declining');

    return { predicted, confidence, factors };
  } catch (error) {
    logError('predictions', 'predictFocusScore failed', error);
    return { predicted: 0, confidence: 0, factors: ['Unable to calculate'] };
  }
}

export async function predictWeeklyProductivity(userId: string): Promise<{
  predictedMinutes: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
}> {
  try {
    const now = new Date();
    const thisWeekStart = startOfDay(subDays(now, now.getDay())); // start of current week (Sunday)
    const lastWeekStart = subDays(thisWeekStart, 7);
    const twoWeeksAgoStart = subDays(lastWeekStart, 7);

    const [thisWeekSessions, lastWeekSessions, twoWeeksAgoSessions] = await Promise.all([
      db.focusSession.findMany({
        where: { userId, startedAt: { gte: thisWeekStart }, type: { not: 'break' } },
        select: { duration: true },
      }),
      db.focusSession.findMany({
        where: { userId, startedAt: { gte: lastWeekStart, lt: thisWeekStart }, type: { not: 'break' } },
        select: { duration: true },
      }),
      db.focusSession.findMany({
        where: { userId, startedAt: { gte: twoWeeksAgoStart, lt: lastWeekStart }, type: { not: 'break' } },
        select: { duration: true },
      }),
    ]);

    const thisWeekMin = thisWeekSessions.reduce((a, s) => a + s.duration / 60, 0);
    const lastWeekMin = lastWeekSessions.reduce((a, s) => a + s.duration / 60, 0);
    const twoWeeksAgoMin = twoWeeksAgoSessions.reduce((a, s) => a + s.duration / 60, 0);

    // Predict remaining days based on trend
    const avgDailyLast = lastWeekMin / 7;
    const daysElapsed = (now.getTime() - thisWeekStart.getTime()) / 86400000;
    const daysRemaining = Math.max(1, 7 - daysElapsed);

    const predictedMinutes = thisWeekMin + avgDailyLast * daysRemaining;

    const trend: 'up' | 'down' | 'stable' =
      lastWeekMin > twoWeeksAgoMin * 1.15 ? 'up' :
      lastWeekMin < twoWeeksAgoMin * 0.85 ? 'down' : 'stable';

    const confidence = Math.min(1, (thisWeekSessions.length + lastWeekSessions.length) / 14);

    return { predictedMinutes: Math.round(predictedMinutes), confidence, trend };
  } catch (error) {
    logError('predictions', 'predictWeeklyProductivity failed', error);
    return { predictedMinutes: 0, confidence: 0, trend: 'stable' };
  }
}

export async function predictStreakRisk(userId: string): Promise<{
  riskLevel: 'low' | 'medium' | 'high';
  daysToBreak: number;
  suggestion: string;
}> {
  try {
    const streak = await calculateStreak(userId);

    // Check today's sessions
    const todayStart = startOfDay(new Date());
    const todaySessions = await db.focusSession.findMany({
      where: {
        userId,
        startedAt: { gte: todayStart },
        type: { not: 'break' },
      },
      select: { duration: true },
    });

    const todayMinutes = todaySessions.reduce((a, s) => a + s.duration / 60, 0);

    // If streak is 0, no risk
    if (streak === 0) {
      return { riskLevel: 'low', daysToBreak: 999, suggestion: 'Start a new streak today!' };
    }

    // If today already has sessions, streak is safe for today
    if (todayMinutes > 0) {
      const riskLevel: 'low' | 'medium' | 'high' =
        streak < 3 ? 'medium' : 'low';
      return {
        riskLevel,
        daysToBreak: 1, // could break tomorrow if no session
        suggestion: streak < 3 ? 'Your streak is young — keep it going!' : 'Streak is safe for today. Keep the momentum tomorrow!',
      };
    }

    // Today has no sessions — streak could break today
    const hoursRemaining = 24 - new Date().getHours();
    const riskLevel: 'low' | 'medium' | 'high' =
      hoursRemaining < 4 ? 'high' :
      hoursRemaining < 8 ? 'medium' : 'low';

    return {
      riskLevel,
      daysToBreak: 0,
      suggestion: `No focus session today yet. ${hoursRemaining < 4 ? 'Only a few hours left!' : 'You still have time today.'} Even a 15-minute session keeps your ${streak}-day streak alive.`,
    };
  } catch (error) {
    logError('predictions', 'predictStreakRisk failed', error);
    return { riskLevel: 'low', daysToBreak: 999, suggestion: 'Unable to calculate' };
  }
}

export async function predictBestWorkHours(userId: string): Promise<{
  hour: number;
  confidence: number;
  productiveMinutes: number;
}[]> {
  try {
    const last30Days = subDays(new Date(), 30);
    const sessions = await db.focusSession.findMany({
      where: { userId, startedAt: { gte: last30Days }, type: { not: 'break' } },
      select: { duration: true, startedAt: true },
    });

    // Aggregate by hour
    const hourData: Record<number, { minutes: number; sessions: number }> = {};
    for (let h = 0; h < 24; h++) {
      hourData[h] = { minutes: 0, sessions: 0 };
    }

    for (const s of sessions) {
      const hour = new Date(s.startedAt).getHours();
      hourData[hour].minutes += s.duration / 60;
      hourData[hour].sessions += 1;
    }

    // Sort by productivity (minutes) and return top 5
    return Object.entries(hourData)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        confidence: Math.min(1, data.sessions / 10),
        productiveMinutes: Math.round(data.minutes),
      }))
      .filter(h => h.productiveMinutes > 0)
      .sort((a, b) => b.productiveMinutes - a.productiveMinutes)
      .slice(0, 5);
  } catch (error) {
    logError('predictions', 'predictBestWorkHours failed', error);
    return [];
  }
}

export async function getFullPredictions(userId: string): Promise<PredictionResult> {
  const [burnoutRisk, missionCompletion, focusScore, weeklyProductivity, streakRisk, bestWorkHours] = await Promise.all([
    predictBurnoutRisk(userId),
    predictMissionCompletion(userId),
    predictFocusScore(userId),
    predictWeeklyProductivity(userId),
    predictStreakRisk(userId),
    predictBestWorkHours(userId),
  ]);

  return {
    burnoutRisk,
    missionCompletionProbability: missionCompletion,
    focusScoreTomorrow: focusScore,
    weeklyProductivity,
    streakRisk,
    bestWorkHours,
  };
}
