/**
 * Centralized logging utility for MindGuard.
 * In production, suppresses verbose logs; in development, logs everything.
 */

const isDev = process.env.NODE_ENV === "development";

export function logInfo(context: string, message: string, data?: unknown) {
  if (isDev) {
    console.log(`[${context}] ${message}`, data ?? "");
  }
}

export function logWarn(context: string, message: string, data?: unknown) {
  console.warn(`[${context}] ${message}`, data ?? "");
}

export function logError(context: string, message: string, error?: unknown) {
  console.error(`[${context}] ${message}`, error ?? "");
}

/**
 * Standardized API error response helper.
 */
export function apiError(message: string, status: number = 500, details?: unknown) {
  return {
    error: message,
    ...(details ? { details } : {}),
    status,
  };
}
