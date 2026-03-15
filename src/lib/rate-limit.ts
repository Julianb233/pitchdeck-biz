/**
 * In-memory sliding-window rate limiter.
 *
 * Each limiter instance tracks its own bucket map so different route groups
 * can have independent limits.
 *
 * Usage:
 *   const limited = applyRateLimit(authLimiter, ip);
 *   if (limited) return limited; // 429 response with Retry-After header
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

interface RateLimiterOptions {
  /** Maximum requests allowed within the window. */
  maxRequests: number;
  /** Time window in milliseconds. */
  windowMs: number;
  /**
   * Whether to persist rate-limit state to Supabase for cross-instance
   * enforcement. When Supabase is unavailable, falls back to in-memory.
   */
  persistent?: boolean;
}

/**
 * Sync rate-limit state to Supabase for cross-instance enforcement.
 * Returns true (allowed), false (rate-limited), or null (Supabase unavailable).
 */
async function persistentCheck(
  limiterName: string,
  key: string,
  maxRequests: number,
  windowMs: number,
): Promise<boolean | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;

  try {
    const now = new Date();
    const resetAt = new Date(now.getTime() + windowMs);

    const { data: existing } = await supabase
      .from("rate_limits")
      .select("count, reset_at")
      .eq("key", key)
      .eq("limiter", limiterName)
      .maybeSingle();

    if (!existing || new Date(existing.reset_at) < now) {
      await supabase
        .from("rate_limits")
        .upsert(
          { key, limiter: limiterName, count: 1, reset_at: resetAt.toISOString() },
          { onConflict: "key,limiter" },
        );
      return true;
    }

    if (existing.count >= maxRequests) return false;

    await supabase
      .from("rate_limits")
      .update({ count: existing.count + 1 })
      .eq("key", key)
      .eq("limiter", limiterName);

    return true;
  } catch (error) {
    console.error("[rate-limit] Supabase persistence error:", error);
    return null;
  }
}

export function createRateLimiter(nameOrOptions: string | RateLimiterOptions, maybeOptions?: RateLimiterOptions) {
  // Support both createRateLimiter("name", opts) and createRateLimiter(opts)
  const options = maybeOptions ?? (typeof nameOrOptions === "object" ? nameOrOptions : { maxRequests: 10, windowMs: 60_000 });
  const { maxRequests, windowMs } = options;
  const isPersistent = "persistent" in options && (options as RateLimiterOptions & { persistent?: boolean }).persistent === true;
  const limiterName = typeof nameOrOptions === "string" ? nameOrOptions : "default";
  const buckets = new Map<string, RateLimitBucket>();

  // Periodically prune stale buckets to prevent unbounded growth
  const PRUNE_INTERVAL = Math.max(windowMs * 2, 120_000);
  let lastPrune = Date.now();

  function prune() {
    const now = Date.now();
    if (now - lastPrune < PRUNE_INTERVAL) return;
    lastPrune = now;
    for (const [key, bucket] of buckets) {
      if (now > bucket.resetAt) buckets.delete(key);
    }
  }

  /**
   * Check whether the key exceeds the rate limit.
   * Returns true if allowed, false if rate-limited.
   */
  function check(key: string): boolean {
    prune();
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || now > bucket.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    if (bucket.count >= maxRequests) return false;
    bucket.count += 1;
    return true;
  }

  /** Returns seconds until the rate limit resets for the given key. */
  function retryAfterSec(key: string): number {
    const now = Date.now();
    const bucket = buckets.get(key);
    if (!bucket || now > bucket.resetAt) return 0;
    return Math.ceil(Math.max(0, bucket.resetAt - now) / 1000);
  }

  /** Returns remaining requests for the given key. */
  function remaining(key: string): number {
    const now = Date.now();
    const bucket = buckets.get(key);
    if (!bucket || now > bucket.resetAt) return maxRequests;
    return Math.max(0, maxRequests - bucket.count);
  }

  return { check, retryAfterSec, remaining };
}

// -- Presets ------------------------------------------------------------------

/** Auth endpoints: 10 req/min per IP. */
export const authLimiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 });

/** Analysis endpoints: 5 req/min per user. */
export const analysisLimiter = createRateLimiter({ maxRequests: 5, windowMs: 60_000 });

/** Deck generation: 3 req/min per user. */
export const generateDeckLimiter = createRateLimiter({ maxRequests: 3, windowMs: 60_000 });

/** Image generation: 5 req/min per user. */
export const generateImageLimiter = createRateLimiter({ maxRequests: 5, windowMs: 60_000 });

/** Asset generation: 5 req/min per user. */
export const generateAssetLimiter = createRateLimiter({ maxRequests: 5, windowMs: 60_000 });

/** Export endpoints: 10 req/min per user. */
export const exportLimiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 });

/** Checkout endpoints: 5 req/min per user. */
export const checkoutLimiter = createRateLimiter({ maxRequests: 5, windowMs: 60_000 });

/** General API: 30 req/min. */
export const apiLimiter = createRateLimiter({ maxRequests: 30, windowMs: 60_000 });

/** Alias for pipeline/generate routes: 3 req/min. */
export const generateLimiter = generateDeckLimiter;

/** Alias for backward compat: 5 req/min. */
export const generationLimiter = analysisLimiter;

// -- Helpers ------------------------------------------------------------------

/** Extract client IP from request headers. */
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
 * Returns null if the request is allowed.
 */
export function applyRateLimit(
  limiter: ReturnType<typeof createRateLimiter>,
  key: string,
  message = "Too many requests. Please try again later.",
): NextResponse | null {
  if (limiter.check(key)) return null;

  const retryAfter = limiter.retryAfterSec(key);
  return NextResponse.json(
    { error: message },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(retryAfter),
      },
    },
  );
}
