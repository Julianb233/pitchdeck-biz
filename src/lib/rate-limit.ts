/**
 * In-memory sliding-window rate limiter.
 *
 * Supports both IP-based (unauthenticated) and user-ID-based (authenticated)
 * limiting. Process-local — swap for Redis if running multiple instances.
 */

import { NextRequest, NextResponse } from "next/server";

interface Bucket {
  count: number;
  resetAt: number;
}

interface RateLimiterOptions {
  /** Max requests allowed within the window. */
  maxRequests: number;
  /** Window duration in milliseconds. */
  windowMs: number;
}

interface CheckResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

const stores = new Map<string, Map<string, Bucket>>();

// Periodic cleanup to prevent unbounded memory growth
const CLEANUP_INTERVAL = 5 * 60_000; // 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const store of stores.values()) {
      for (const [key, bucket] of store) {
        if (now > bucket.resetAt) store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
}

function getStore(name: string): Map<string, Bucket> {
  let store = stores.get(name);
  if (!store) {
    store = new Map();
    stores.set(name, store);
  }
  return store;
}

export function createRateLimiter(name: string, options: RateLimiterOptions) {
  const { maxRequests, windowMs } = options;
  const store = getStore(name);

  return {
    /** Returns `true` if the request is allowed, `false` if rate-limited. */
    check(key: string): boolean {
      return this.checkDetailed(key).allowed;
    },

    /** Returns detailed rate-limit info including remaining count and retry-after. */
    checkDetailed(key: string): CheckResult {
      const now = Date.now();
      const bucket = store.get(key);

      if (!bucket || now > bucket.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: maxRequests - 1, retryAfterMs: 0 };
      }

      if (bucket.count >= maxRequests) {
        const retryAfterMs = Math.max(0, bucket.resetAt - now);
        return { allowed: false, remaining: 0, retryAfterMs };
      }

      bucket.count += 1;
      return {
        allowed: true,
        remaining: maxRequests - bucket.count,
        retryAfterMs: 0,
      };
    },

    /** Returns remaining requests for the given key. */
    remaining(key: string): number {
      const now = Date.now();
      const bucket = store.get(key);
      if (!bucket || now > bucket.resetAt) return maxRequests;
      return Math.max(0, maxRequests - bucket.count);
    },
  };
}

// ── Presets ─────────────────────────────────────────────────────────────────

/** Auth endpoints: 10 attempts per 60 seconds per IP. */
export const authLimiter = createRateLimiter("auth", {
  maxRequests: 10,
  windowMs: 60_000,
});

/** Analysis endpoints: 5 requests per 60 seconds per user. */
export const analysisLimiter = createRateLimiter("analysis", {
  maxRequests: 5,
  windowMs: 60_000,
});

/** Deck generation: 3 requests per 60 seconds per user. */
export const generateDeckLimiter = createRateLimiter("generate-deck", {
  maxRequests: 3,
  windowMs: 60_000,
});

/** Image generation: 5 requests per 60 seconds per user. */
export const generateImageLimiter = createRateLimiter("generate-image", {
  maxRequests: 5,
  windowMs: 60_000,
});

/** Asset generation: 5 requests per 60 seconds per user. */
export const generateAssetLimiter = createRateLimiter("generate-asset", {
  maxRequests: 5,
  windowMs: 60_000,
});

/** Export endpoints: 10 requests per 60 seconds per user. */
export const exportLimiter = createRateLimiter("export", {
  maxRequests: 10,
  windowMs: 60_000,
});

/** Checkout endpoints: 5 requests per 60 seconds per user. */
export const checkoutLimiter = createRateLimiter("checkout", {
  maxRequests: 5,
  windowMs: 60_000,
});

/** General API: 30 requests per 60 seconds. */
export const apiLimiter = createRateLimiter("api", {
  maxRequests: 30,
  windowMs: 60_000,
});

// ── Helpers ─────────────────────────────────────────────────────────────────

export function getClientIp(request: Request | NextRequest): string {
  const headers = request.headers;
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "anonymous"
  );
}

/**
 * Apply rate limiting and return a 429 response if exceeded.
 * Returns `null` if the request is allowed.
 */
export function applyRateLimit(
  limiter: ReturnType<typeof createRateLimiter>,
  key: string,
  message = "Too many requests. Please try again later.",
): NextResponse | null {
  const result = limiter.checkDetailed(key);
  if (result.allowed) return null;

  const retryAfterSec = Math.ceil(result.retryAfterMs / 1000);
  return NextResponse.json(
    { error: message },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSec),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(retryAfterSec),
      },
    },
  );
}
