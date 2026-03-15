import { NextRequest, NextResponse } from "next/server";

/**
 * Simple in-memory IP-based rate limiter.
 *
 * Each instance tracks its own bucket map so different route groups
 * can have independent limits.
 *
 * Usage:
 *   const limiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 });
 *   // inside route handler:
 *   const limited = limiter.check(request);
 *   if (limited) return limited; // 429 response
 */

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

interface RateLimiterOptions {
  /** Maximum requests allowed within the window. */
  maxRequests: number;
  /** Time window in milliseconds. */
  windowMs: number;
}

export function createRateLimiter(options: RateLimiterOptions) {
  const { maxRequests, windowMs } = options;
  const buckets = new Map<string, RateLimitBucket>();

  // Periodically prune stale buckets to prevent unbounded growth
  const PRUNE_INTERVAL = Math.max(windowMs * 2, 120_000);
  let lastPrune = Date.now();

  function prune() {
    const now = Date.now();
    if (now - lastPrune < PRUNE_INTERVAL) return;
    lastPrune = now;
    for (const [key, bucket] of buckets) {
      if (now > bucket.resetAt) {
        buckets.delete(key);
      }
    }
  }

  function getIp(request: NextRequest): string {
    return (
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "anonymous"
    );
  }

  /**
   * Check whether the request exceeds the rate limit.
   * Returns a 429 NextResponse if exceeded, or null if allowed.
   */
  function check(request: NextRequest): NextResponse | null {
    prune();

    const ip = getIp(request);
    const now = Date.now();
    const bucket = buckets.get(ip);

    if (!bucket || now > bucket.resetAt) {
      buckets.set(ip, { count: 1, resetAt: now + windowMs });
      return null;
    }

    if (bucket.count >= maxRequests) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(maxRequests),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(bucket.resetAt / 1000)),
          },
        }
      );
    }

    bucket.count += 1;
    return null;
  }

  return { check };
}

// ── Pre-configured limiters for different route groups ──────────────────────

/** Auth routes: 10 requests per minute */
export const authLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 60_000,
});

/** Analysis routes: 5 requests per minute */
export const analysisLimiter = createRateLimiter({
  maxRequests: 5,
  windowMs: 60_000,
});

/** Generate routes: 3 requests per minute */
export const generateLimiter = createRateLimiter({
  maxRequests: 3,
  windowMs: 60_000,
});

/** Export routes: 10 requests per minute */
export const exportLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 60_000,
});
