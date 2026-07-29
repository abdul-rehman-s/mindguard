import { db } from "@/lib/db";
import { format, startOfDay, subDays } from "date-fns";

/**
 * Shared streak calculation — counts consecutive days with focus sessions.
 * Walks backwards from today (or yesterday if today has no sessions yet).
 * Limits lookup to last 60 days for performance.
 */
export async function calculateStreak(userId: string): Promise<number> {
  const limitDate = subDays(new Date(), 60);
  const allSessions = await db.focusSession.findMany({
    where: {
      userId,
      type: { not: "break" },
      startedAt: { gte: limitDate },
    },
    select: { startedAt: true },
  });

  const daysWithSessions = new Set(
    allSessions.map((s) =>
      format(startOfDay(new Date(s.startedAt)), "yyyy-MM-dd")
    )
  );

  let streak = 0;
  let checkDate = startOfDay(new Date());

  // If today has no sessions yet, start from yesterday
  if (!daysWithSessions.has(format(checkDate, "yyyy-MM-dd"))) {
    checkDate = subDays(checkDate, 1);
  }

  while (daysWithSessions.has(format(checkDate, "yyyy-MM-dd"))) {
    streak++;
    checkDate = subDays(checkDate, 1);
  }

  return streak;
}

/**
 * Shared focus score calculation (time + streak based).
 * Used by /api/stats and /api/life-dashboard.
 * Scale: 0-100
 * Formula: (today% * 40) + (weekly% * 40) + (streak% * 20)
 */
export function calculateFocusScore(
  todayMinutes: number,
  weeklyMinutes: number,
  streak: number
): number {
  if (weeklyMinutes === 0) return 0;
  return Math.min(
    100,
    Math.round(
      (Math.min(todayMinutes, 480) / 480) * 40 +
        (Math.min(weeklyMinutes, 2400) / 2400) * 40 +
        (Math.min(streak, 30) / 30) * 20
    )
  );
}

/**
 * Smart Focus Score — weighted average of multiple factors.
 * Scale: 0-100
 * Formula:
 *   - focusMinutes / focusGoalMinutes (40% weight)
 *   - completedSessions / plannedSessions (20% weight)
 *   - streakLength / 7 (15% weight)
 *   - mood average / 5 (10% weight)
 *   - reflectionRate (15% weight)
 */
export function calculateSmartFocusScore(data: {
  focusMinutes: number;
  focusGoalMinutes: number;
  completedSessions: number;
  plannedSessions: number;
  streakLength: number;
  moodAverage: number;    // 1-5 or 0 if no data
  reflectionRate: number; // 0-1, fraction of days with reflections
}): number {
  const {
    focusMinutes,
    focusGoalMinutes,
    completedSessions,
    plannedSessions,
    streakLength,
    moodAverage,
    reflectionRate,
  } = data;

  // Focus time ratio (capped at 1.0)
  const focusRatio = focusGoalMinutes > 0 ? Math.min(focusMinutes / focusGoalMinutes, 1) : 0;

  // Session completion ratio
  const sessionRatio = plannedSessions > 0 ? Math.min(completedSessions / plannedSessions, 1) : completedSessions > 0 ? 1 : 0;

  // Streak ratio (max 7 days = 1.0)
  const streakRatio = Math.min(streakLength / 7, 1);

  // Mood ratio (1-5 scale)
  const moodRatio = moodAverage > 0 ? moodAverage / 5 : 0.5; // default to 0.5 if no mood data

  // Reflection rate (0-1)
  const reflectionRatio = Math.min(reflectionRate, 1);

  const score = Math.round(
    focusRatio * 40 +
    sessionRatio * 20 +
    streakRatio * 15 +
    moodRatio * 10 +
    reflectionRatio * 15
  );

  return Math.max(0, Math.min(100, score));
}

/**
 * Get focus score color class based on score.
 */
export function getFocusScoreColor(score: number): { bg: string; text: string; label: string } {
  if (score >= 80) return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Excellent' };
  if (score >= 60) return { bg: 'bg-green-500/15', text: 'text-green-400', label: 'Good' };
  if (score >= 40) return { bg: 'bg-amber-500/15', text: 'text-amber-400', label: 'Fair' };
  return { bg: 'bg-red-500/15', text: 'text-red-400', label: 'Needs Work' };
}

/**
 * Shared attention grade from a score (0-100).
 * Used by /api/weekly-wrapped.
 */
export function gradeFromScore(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

/**
 * Find the best focus hour from a set of sessions.
 * Returns hour number (0-23) or null if no sessions.
 */
export function findBestHour(
  sessions: { startedAt: Date | string; duration: number }[]
): number | null {
  const hourAgg = new Array(24).fill(0);
  for (const s of sessions) {
    hourAgg[new Date(s.startedAt).getHours()] += s.duration;
  }

  let bestHour = -1;
  let bestMinutes = 0;
  for (let h = 0; h < 24; h++) {
    if (hourAgg[h] > bestMinutes) {
      bestMinutes = hourAgg[h];
      bestHour = h;
    }
  }

  return bestHour >= 0 ? bestHour : null;
}

/**
 * Find the best weekday from sessions.
 * Returns weekday index (0=Sun..6=Sat) or null.
 */
export function findBestWeekday(
  sessions: { startedAt: Date | string; duration: number }[]
): number | null {
  const weekdayAgg = new Array(7).fill(0);
  for (const s of sessions) {
    weekdayAgg[new Date(s.startedAt).getDay()] += s.duration;
  }

  let bestIdx = -1;
  let bestMinutes = 0;
  for (let d = 0; d < 7; d++) {
    if (weekdayAgg[d] > bestMinutes) {
      bestMinutes = weekdayAgg[d];
      bestIdx = d;
    }
  }

  return bestIdx >= 0 ? bestIdx : null;
}

const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const SHORT_WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function weekdayLabel(idx: number): string {
  return WEEKDAY_LABELS[idx] ?? "—";
}

export function shortWeekdayLabel(idx: number): string {
  return SHORT_WEEKDAY_LABELS[idx] ?? "—";
}

/**
 * Hour-of-day label (e.g., "3 AM", "late night").
 */
const HOUR_LABELS: Record<number, string> = {
  0: "late night",
  1: "late night",
  2: "late night",
  3: "late night",
  4: "early morning",
  5: "early morning",
  6: "early morning",
  7: "morning",
  8: "morning",
  9: "morning",
  10: "morning",
  11: "late morning",
  12: "midday",
  13: "afternoon",
  14: "afternoon",
  15: "afternoon",
  16: "afternoon",
  17: "late afternoon",
  18: "evening",
  19: "evening",
  20: "evening",
  21: "night",
  22: "night",
  23: "late night",
};

export function hourLabel(hour: number): string {
  return HOUR_LABELS[hour] ?? "daytime";
}
