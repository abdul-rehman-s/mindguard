/**
 * In-memory rate limiter for auth endpoints
 * 
 * Uses a sliding window approach: tracks request counts per IP
 * within a configurable time window. No Redis needed — suitable
 * for single-instance deployments.
 * 
 * Security note: This is effective for single-server deployments.
 * For multi-instance deployments, use Redis-backed rate limiting.
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now - entry.windowStart > 15 * 60 * 1000) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /** Max requests allowed within the window */
  maxRequests: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

/** Pre-configured rate limits for common endpoints */
export const AUTH_RATE_LIMITS = {
  /** Registration: max 5 requests per 15 minutes per IP */
  register: { maxRequests: 5, windowMs: 15 * 60 * 1000 },
  /** Sign-in: max 10 requests per 15 minutes per IP */
  signin: { maxRequests: 10, windowMs: 15 * 60 * 1000 },
} as const;

/**
 * Check if a request from a given IP is within rate limits.
 * Returns { allowed: true } if the request is permitted,
 * or { allowed: false, retryAfterMs } if rate limited.
 */
export function checkRateLimit(
  ip: string,
  config: RateLimitConfig
): { allowed: true } | { allowed: false; retryAfterMs: number } {
  const now = Date.now();
  const key = ip;

  const entry = store.get(key);

  if (!entry || now - entry.windowStart > config.windowMs) {
    // New window or expired window — start fresh
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }

  if (entry.count >= config.maxRequests) {
    // Rate limited — calculate how long until the window resets
    const retryAfterMs = config.windowMs - (now - entry.windowStart);
    return { allowed: false, retryAfterMs };
  }

  // Increment count within existing window
  entry.count += 1;
  return { allowed: true };
}

/**
 * Extract client IP from a Next.js request.
 * Handles proxied requests via X-Forwarded-For header.
 * Falls back to "unknown" if no IP can be determined.
 */
export function getClientIp(request: Request): string {
  // Check X-Forwarded-For header (for proxied requests)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // Take the first IP in the chain (original client IP)
    return forwarded.split(',')[0].trim();
  }

  // Check X-Real-IP header (set by some reverse proxies)
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  // Fall back to unknown — rate limit will be shared for unidentified clients
  return 'unknown';
}

/**
 * Apply rate limiting to a request. Returns a 429 response if rate limited,
 * or null if the request is allowed.
 */
export function applyRateLimit(
  request: Request,
  config: RateLimitConfig
): Response | null {
  const ip = getClientIp(request);
  const result = checkRateLimit(ip, config);

  if (!result.allowed) {
    const retryAfterSeconds = Math.ceil(result.retryAfterMs / 1000);
    return new Response(
      JSON.stringify({
        error: 'Too many requests. Please try again later.',
        retryAfter: retryAfterSeconds,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfterSeconds),
        },
      }
    );
  }

  return null;
}
