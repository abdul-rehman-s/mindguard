/**
 * Personalization Engine — MindGuard
 *
 * Pure calculation helpers for personalization throughout the app.
 * No database calls — all data is passed in as parameters.
 */

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface UserBasics {
  name?: string | null;
  displayName?: string | null;
  workSchedule?: string | null;
}

interface FocusStats {
  todayFocusMinutes: number;
  focusGoalMinutes: number;
  currentStreak: number;
  focusScore: number;
}

// ──────────────────────────────────────────────
// 1. Personalized Greeting
// ──────────────────────────────────────────────

/**
 * Returns a time-aware, name-aware greeting.
 *
 * - "Good morning, Alex" — morning with name
 * - "Good morning" — morning without name
 * - "Ready for your night session?" — night-owl / night-shift worker
 */
export function getPersonalizedGreeting(
  user: UserBasics,
  hour: number
): string {
  const displayName = user.displayName || user.name;
  const isNightOwl = isNightSchedule(user.workSchedule);

  // Time-of-day base
  let timeGreeting: string;
  if (hour >= 5 && hour < 12) {
    timeGreeting = "Good morning";
  } else if (hour >= 12 && hour < 17) {
    timeGreeting = "Good afternoon";
  } else if (hour >= 17 && hour < 21) {
    timeGreeting = "Good evening";
  } else {
    // Late night (21:00 – 4:59)
    if (isNightOwl) {
      return displayName
        ? `Ready for your night session, ${displayName}?`
        : "Ready for your night session?";
    }
    timeGreeting = "Burning the midnight oil";
  }

  // Night-shift workers in morning hours
  if (isNightOwl && hour >= 5 && hour < 9) {
    return displayName
      ? `Just winding down, ${displayName}?`
      : "Just winding down?";
  }

  return displayName
    ? `${timeGreeting}, ${displayName}`
    : timeGreeting;
}

// ──────────────────────────────────────────────
// 2. Motivational Text
// ──────────────────────────────────────────────

/**
 * Returns motivational text based on current focus stats.
 *
 * Priority order:
 *  1. Goal achieved → celebration
 *  2. Streak on fire (≥7) → streak encouragement
 *  3. Almost there (≥80%) → push
 *  4. Good progress (≥50%) → momentum
 *  5. New day / fresh start → encouragement
 */
export function getMotivationalText(stats: FocusStats): string {
  const { todayFocusMinutes, focusGoalMinutes, currentStreak, focusScore } =
    stats;

  const pct =
    focusGoalMinutes > 0
      ? Math.round((todayFocusMinutes / focusGoalMinutes) * 100)
      : 0;

  // 1. Goal achieved
  if (pct >= 100) {
    const msgs = [
      "You've crushed your focus goal today! 🎯",
      "Goal achieved — you're on fire today!",
      "Focus goal complete! Time to celebrate.",
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }

  // 2. Streak on fire
  if (currentStreak >= 7) {
    return `${currentStreak}-day streak! You're unstoppable — keep the momentum going.`;
  }
  if (currentStreak >= 3) {
    return `${currentStreak}-day streak and counting! Consistency is your superpower.`;
  }

  // 3. Almost there
  if (pct >= 80) {
    return "Almost there! One more focused session and you'll hit your goal.";
  }

  // 4. Good progress
  if (pct >= 50) {
    return "Great progress today! You're past the halfway mark.";
  }

  // 5. Fresh start / low progress
  if (todayFocusMinutes === 0) {
    if (focusScore >= 70) {
      return "New day, new focus. You've been sharp lately — let's keep it up!";
    }
    return "A fresh start awaits. Even 15 minutes of focus can change your day.";
  }

  // 6. Some progress but early
  if (pct < 50) {
    return "You've started — that's the hardest part. Keep going!";
  }

  return "Every minute of focus counts. Keep it up!";
}

// ──────────────────────────────────────────────
// 3. Recommended Widgets
// ──────────────────────────────────────────────

/**
 * Returns dashboard widget IDs that should be prioritized
 * based on the user's primary use-case and goals.
 *
 * Widget IDs: heatmap, session-stats, timeline, achievements,
 *             focus-score, streak, distraction-log, quick-start
 */
export function getRecommendedWidgets(
  primaryUse: string | null,
  goals: string[] | null
): string[] {
  const base: string[] = ["quick-start", "streak", "focus-score"];

  // Primary-use prioritisation
  switch (primaryUse) {
    case "studying":
      base.unshift("heatmap", "session-stats");
      break;
    case "coding":
      base.unshift("timeline", "achievements");
      break;
    case "writing":
      base.unshift("session-stats", "distraction-log");
      break;
    case "creative":
      base.unshift("achievements", "timeline");
      break;
    case "work":
      base.unshift("heatmap", "timeline");
      break;
    case "general":
    default:
      base.unshift("heatmap", "session-stats");
      break;
  }

  // Goal-based additions
  if (goals) {
    if (goals.includes("reduce_distractions") && !base.includes("distraction-log")) {
      base.push("distraction-log");
    }
    if (goals.includes("build_streak") && !base.includes("streak")) {
      base.push("streak");
    }
    if (goals.includes("deep_work") && !base.includes("session-stats")) {
      base.push("session-stats");
    }
    if (goals.includes("improve_score") && !base.includes("focus-score")) {
      base.push("focus-score");
    }
  }

  // De-duplicate while preserving order
  return [...new Set(base)];
}

// ──────────────────────────────────────────────
// 4. Focus Recommendation
// ──────────────────────────────────────────────

/**
 * Returns a recommended focus duration (minutes) and a short
 * motivational message based on work schedule and current time.
 */
export function getFocusRecommendation(
  workSchedule: string | null,
  hour: number
): { message: string; duration: number } {
  const schedule = (workSchedule || "standard").toLowerCase();

  // Night-shift workers
  if (isNightSchedule(schedule)) {
    if (hour >= 21 || hour < 3) {
      return {
        message: "Perfect time for deep night focus! Try a 60-min session.",
        duration: 60,
      };
    }
    if (hour >= 3 && hour < 7) {
      return {
        message: "Winding down? A short 25-min session can close the night strong.",
        duration: 25,
      };
    }
    return {
      message: "Off-peak hours — a quick 25-min focus session keeps the streak alive.",
      duration: 25,
    };
  }

  // Early-bird schedule
  if (schedule.includes("early") || schedule.includes("morning")) {
    if (hour >= 5 && hour < 9) {
      return {
        message: "Early bird gets the focus! Try a 60-min deep work session.",
        duration: 60,
      };
    }
    if (hour >= 9 && hour < 12) {
      return {
        message: "Your peak morning window — a 45-min session is ideal.",
        duration: 45,
      };
    }
    return {
      message: "A 25-min afternoon session keeps the momentum going.",
      duration: 25,
    };
  }

  // Standard / flexible schedule
  if (hour >= 9 && hour < 12) {
    return {
      message: "Perfect time for deep work! Try a 60-min session.",
      duration: 60,
    };
  }
  if (hour >= 13 && hour < 15) {
    return {
      message: "Post-lunch focus boost — a 25-min session can re-energise you.",
      duration: 25,
    };
  }
  if (hour >= 15 && hour < 18) {
    return {
      message: "Afternoon focus window — a 45-min session is a great fit.",
      duration: 45,
    };
  }
  if (hour >= 20 && hour < 22) {
    return {
      message: "Evening wind-down — a short 25-min session to close the day.",
      duration: 25,
    };
  }
  if (hour >= 22 || hour < 5) {
    return {
      message: "Late night focus — keep it short, 15 minutes is enough.",
      duration: 15,
    };
  }

  // Default
  return {
    message: "A 25-min focus session is a great way to make progress.",
    duration: 25,
  };
}

// ──────────────────────────────────────────────
// 5. Distraction Advice
// ──────────────────────────────────────────────

/**
 * Returns actionable advice for managing the user's biggest
 * known distraction.
 */
export function getDistractionAdvice(biggestDistraction: string | null): string {
  if (!biggestDistraction) {
    return "Tip: Identify your biggest distraction and set a specific block schedule for it.";
  }

  const distraction = biggestDistraction.toLowerCase();

  if (distraction.includes("social") || distraction.includes("instagram") || distraction.includes("twitter") || distraction.includes("tiktok") || distraction.includes("facebook")) {
    return "Social media pulls you away? Try scheduling 10-min social breaks after each focus session — guilt-free and controlled.";
  }
  if (distraction.includes("phone") || distraction.includes("notification")) {
    return "Phone notifications breaking your flow? Enable Do Not Disturb mode and keep your phone in another room during focus sessions.";
  }
  if (distraction.includes("email") || distraction.includes("slack") || distraction.includes("message")) {
    return "Messages and emails fragmenting your focus? Batch-check them at set times — not reactively.";
  }
  if (distraction.includes("youtube") || distraction.includes("video") || distraction.includes("netflix") || distraction.includes("stream")) {
    return "Video content sidetracking you? Use video as a reward after completing a focus session, not during.";
  }
  if (distraction.includes("browser") || distraction.includes("tab") || distraction.includes("web")) {
    return "Too many tabs pulling you off-task? Use a dedicated browser profile for work and close everything unrelated.";
  }
  if (distraction.includes("noise") || distraction.includes("people") || distraction.includes("environment") || distraction.includes("chatter")) {
    return "Environmental noise disrupting focus? Try noise-cancelling headphones with ambient sounds or white noise.";
  }
  if (distraction.includes("food") || distraction.includes("snack") || distraction.includes("kitchen")) {
    return "Snack breaks derailing your session? Prepare water and healthy snacks before you start so you don't need to leave.";
  }
  if (distraction.includes("daydream") || distraction.includes("thought") || distraction.includes("mind")) {
    return "Racing thoughts? Try a 2-min mindfulness reset before each session — jot down lingering thoughts and return to them later.";
  }
  if (distraction.includes("game") || distraction.includes("gaming")) {
    return "Gaming pulling you away? Set a hard rule: no games until today's focus goal is complete.";
  }

  // Generic fallback
  return `"${biggestDistraction}" getting in the way? Try blocking it during focus sessions and rewarding yourself with it after you hit your goal.`;
}

// ──────────────────────────────────────────────
// Internal helpers
// ──────────────────────────────────────────────

/**
 * Returns true if the schedule indicates a night-shift or
 * night-owl pattern.
 */
function isNightSchedule(schedule: string | null | undefined): boolean {
  if (!schedule) return false;
  const s = schedule.toLowerCase();
  return (
    s.includes("night") ||
    s.includes("graveyard") ||
    s.includes("evening") ||
    s.includes("late") ||
    s.includes("owl")
  );
}
