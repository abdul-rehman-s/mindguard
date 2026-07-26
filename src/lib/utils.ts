import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format duration in seconds to a human-readable string.
 * Unified replacement for 5 different formatDuration helpers.
 */
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return "0s";
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${seconds}s`;
}

/**
 * Format duration in seconds to a compact display (for stats/cards).
 * Returns just minutes or hours+minutes.
 */
export function formatDurationCompact(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${minutes}m`;
}

/**
 * Relative time formatting (replaces 5 different timeAgo/relativeTime helpers).
 */
export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Format a date for display (replaces formatDate/prettyDate/formatDateTime).
 */
export function formatDateDisplay(date: Date | string, pattern: string = "MMM d, yyyy"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, pattern);
}

/**
 * Format time for display.
 */
export function formatTimeDisplay(date: Date | string, pattern: string = "h:mm a"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, pattern);
}

/**
 * Greeting based on hour of day.
 */
export function getGreeting(hour: number): string {
  if (hour < 5) return "Burning the midnight oil";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

/**
 * Clamp a percentage value between 0 and 100.
 */
export function clampPct(pct: number): number {
  return Math.max(0, Math.min(100, Math.round(pct)));
}
