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
