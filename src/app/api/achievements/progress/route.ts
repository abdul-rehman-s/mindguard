import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { calculateStreak } from '@/lib/analytics';
import { logError } from '@/lib/logger';
import {
  format,
  startOfDay,
  subDays,
} from 'date-fns';

// Achievement catalog with metadata and XP rewards (50-500 range)
type AchievementDef = {
  type: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
};

const ACHIEVEMENTS: AchievementDef[] = [
  {
    type: 'first_focus',
    title: 'First Focus',
    description: 'Complete your very first focus session',
    icon: 'Sparkles',
    xpReward: 50,
  },
  {
    type: 'streak_7',
    title: '7-Day Streak',
    description: 'Focus at least once a day for 7 consecutive days',
    icon: 'Flame',
    xpReward: 150,
  },
  {
    type: 'streak_30',
    title: '30-Day Streak',
    description: 'Focus at least once a day for 30 consecutive days',
    icon: 'Trophy',
    xpReward: 300,
  },
  {
    type: 'hours_100',
    title: '100-Hour Club',
    description: 'Accumulate 100 total hours of focused work',
    icon: 'Clock',
    xpReward: 400,
  },
  {
    type: 'night_owl',
    title: 'Night Owl',
    description: 'Finish a focus session between midnight and 5 AM',
    icon: 'Moon',
    xpReward: 100,
  },
  {
    type: 'early_bird',
    title: 'Early Bird',
    description: 'Start a focus session before 7:00 AM',
    icon: 'Sunrise',
    xpReward: 100,
  },
  {
    type: 'deep_worker',
    title: 'Deep Worker',
    description: 'Complete a single focus session of 90 minutes or longer',
    icon: 'Brain',
    xpReward: 200,
  },
  {
    type: 'mission_master',
    title: 'Mission Master',
    description: 'Complete 10 missions',
    icon: 'Target',
    xpReward: 250,
  },
];

function clampPct(pct: number): number {
  return Math.max(0, Math.min(100, Math.round(pct)));
}

export async function GET() {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const now = new Date();

    const [
      allSessions,
      allMissionsCount,
      unlockedAchievements,
      currentStreak,
      bestStreak,
    ] = await Promise.all([
      db.focusSession.findMany({
        where: { userId, type: { not: 'break' } },
        select: {
          id: true,
          duration: true,
          startedAt: true,
          endedAt: true,
        },
        orderBy: { startedAt: 'desc' },
      }),
      db.mission.count({
        where: { userId, status: 'completed' },
      }),
      db.achievement.findMany({
        where: { userId },
        select: { type: true, unlockedAt: true },
      }),
      calculateStreak(userId),
      // Calculate best streak from all sessions
      db.focusSession.findMany({
        where: { userId, type: { not: 'break' } },
        select: { startedAt: true },
        orderBy: { startedAt: 'asc' },
      }),
    ]);

    const unlockedMap = new Map(
      unlockedAchievements.map((a) => [a.type, a.unlockedAt])
    );

    // --- Compute aggregate metrics ---
    const totalSessions = allSessions.length;
    const totalMinutes = allSessions.reduce((acc, s) => acc + s.duration, 0);
    const totalHours = totalMinutes / 60;

    // Best streak: walk through all session days in chronological order
    const daysWithSessions = new Set(
      bestStreak.map((s) => format(startOfDay(new Date(s.startedAt)), 'yyyy-MM-dd'))
    );
    const sortedDays = Array.from(daysWithSessions).sort();
    let bestStreakCount = 0;
    let run = 0;
    let prev: number | null = null;
    for (const dayStr of sortedDays) {
      const t = startOfDay(new Date(dayStr)).getTime();
      if (prev !== null) {
        const diffDays = Math.round((t - prev) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          run++;
        } else {
          run = 1;
        }
      } else {
        run = 1;
      }
      bestStreakCount = Math.max(bestStreakCount, run);
      prev = t;
    }

    // Special pattern checks
    let nightOwlFound = false;
    let earlyBirdFound = false;
    let deepWorkerFound = false;
    let longestSingleSessionMinutes = 0;

    for (const s of allSessions) {
      const start = new Date(s.startedAt);
      const end = new Date(s.endedAt);
      const sessionMinutes = s.duration / 60;
      if (sessionMinutes > longestSingleSessionMinutes) {
        longestSingleSessionMinutes = sessionMinutes;
      }

      if (end.getHours() >= 0 && end.getHours() < 5) {
        nightOwlFound = true;
      }
      if (start.getHours() < 7) {
        earlyBirdFound = true;
      }
      if (sessionMinutes >= 90) {
        deepWorkerFound = true;
      }
    }

    // --- Build progress for each achievement ---
    const achievements = ACHIEVEMENTS.map((def) => {
      const unlockedAt = unlockedMap.get(def.type) || null;
      let progress = 0;
      let progressMax = 1;
      let estimatedRemaining: string | null = null;

      switch (def.type) {
        case 'first_focus': {
          progressMax = 1;
          progress = Math.min(totalSessions, 1);
          if (progress < progressMax) {
            estimatedRemaining = '1 session';
          }
          break;
        }
        case 'streak_7': {
          progressMax = 7;
          progress = unlockedAt ? Math.max(currentStreak, 7) : Math.min(currentStreak, 7);
          if (progress < progressMax) {
            const daysLeft = 7 - currentStreak;
            estimatedRemaining = `${daysLeft} day${daysLeft === 1 ? '' : 's'}`;
          }
          break;
        }
        case 'streak_30': {
          progressMax = 30;
          progress = unlockedAt ? Math.max(bestStreakCount, 30) : Math.min(currentStreak, 30);
          if (progress < progressMax) {
            const daysLeft = 30 - currentStreak;
            estimatedRemaining = `${daysLeft} day${daysLeft === 1 ? '' : 's'}`;
          }
          break;
        }
        case 'hours_100': {
          progressMax = 100;
          progress = Math.min(Math.floor(totalHours), 100);
          if (progress < progressMax) {
            const hoursLeft = Math.ceil(100 - totalHours);
            estimatedRemaining = `${hoursLeft} hour${hoursLeft === 1 ? '' : 's'}`;
          }
          break;
        }
        case 'night_owl': {
          progressMax = 1;
          progress = nightOwlFound ? 1 : 0;
          if (!nightOwlFound) {
            estimatedRemaining = '1 late-night session (00:00-05:00)';
          }
          break;
        }
        case 'early_bird': {
          progressMax = 1;
          progress = earlyBirdFound ? 1 : 0;
          if (!earlyBirdFound) {
            estimatedRemaining = '1 early session (before 7 AM)';
          }
          break;
        }
        case 'deep_worker': {
          progressMax = 90;
          progress = Math.min(Math.floor(longestSingleSessionMinutes), 90);
          if (progress < progressMax) {
            const minutesLeft = Math.ceil(90 - longestSingleSessionMinutes);
            estimatedRemaining = `${minutesLeft} more minute${minutesLeft === 1 ? '' : 's'} in a single session`;
          }
          break;
        }
        case 'mission_master': {
          progressMax = 10;
          progress = Math.min(allMissionsCount, 10);
          if (progress < progressMax) {
            const left = 10 - allMissionsCount;
            estimatedRemaining = `${left} more mission${left === 1 ? '' : 's'}`;
          }
          break;
        }
        default: {
          progressMax = 1;
          progress = 0;
        }
      }

      const progressPct = progressMax > 0 ? clampPct((progress / progressMax) * 100) : 0;
      const unlocked = !!unlockedAt;

      return {
        type: def.type,
        title: def.title,
        description: def.description,
        icon: def.icon,
        unlocked,
        progress,
        progressMax,
        progressPct,
        xpReward: def.xpReward,
        unlockedAt,
        estimatedRemaining: unlocked ? null : estimatedRemaining,
      };
    });

    return NextResponse.json({ achievements });
  } catch (e) {
    logError("achievements/progress", "Failed to compute achievement progress", e);
    return NextResponse.json(
      { error: 'Failed to compute achievement progress' },
      { status: 500 }
    );
  }
}
