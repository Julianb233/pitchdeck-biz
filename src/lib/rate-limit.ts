import { NextRequest, NextResponse } from "next/server";

/**
 * Simple in-memory IP-based rate limiter.
 *
 * Each instance tracks its own bucket map so different route groups
 * can have independent limits.
 *
 * The `.check()` method accepts either a NextRequest (extracts IP automatically)
 * or a plain IP string for backwards compatibility.
 *
 * Usage:
 *   const limiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 });
 *   const limited = limiter.check(request);
 *   if (limited) return limited; // 429 response
 */

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

interface RateLimiterOptions {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimiterInstance {
  check: (requestOrIp: NextRequest | string) => NextResponse | null;
}

export function createRateLimiter(options: RateLimiterOptions): RateLimiterInstance {
  const { maxRequests, windowMs } = options;
  const buckets = new Map<string, RateLimitBucket>();

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

  function check(requestOrIp: NextRequest | string): NextResponse | null {
    prune();

    const ip =
      typeof requestOrIp === "string"
        ? requestOrIp
        : getClientIp(requestOrIp);

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
        },
      );
    }

    bucket.count += 1;
    return null;
  }

  return { check };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Extract client IP from a NextRequest. */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous"
  );
}

/**
 * Legacy helper kept for checkout route compatibility.
 * New routes should use `limiter.check(request)` directly.
 */
export function applyRateLimit(
  limiter: RateLimiterInstance,
  ip: string,
  _message?: string,
): NextResponse | null {
  return limiter.check(ip);
}

// ── Pre-configured limiters ─────────────────────────────────────────────────

/** Auth routes: 10 req/min */
export const authLimiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 });

/** Analysis routes: 5 req/min */
export const analysisLimiter = createRateLimiter({ maxRequests: 5, windowMs: 60_000 });

/** Deck/image generation routes: 3 req/min */
export const generateLimiter = createRateLimiter({ maxRequests: 3, windowMs: 60_000 });

/** Export routes: 10 req/min */
export const exportLimiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 });

/** Checkout routes: 5 req/min */
export const checkoutLimiter = createRateLimiter({ maxRequests: 5, windowMs: 60_000 });

/** Image generation routes: 10 req/min */
export const generateImageLimiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 });

/** Generation limiter (alias for pipeline route): 10 req/min */
export const generationLimiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 });
