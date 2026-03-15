import { NextRequest, NextResponse } from "next/server";

interface RateLimiter {
  check: (ip: string) => Promise<{ success: boolean; remaining: number }>;
}

function createLimiter(_opts: { interval: number; uniqueTokenPerInterval: number }): RateLimiter {
  const requests = new Map<string, { count: number; resetAt: number }>();

  return {
    async check(ip: string) {
      const now = Date.now();
      const entry = requests.get(ip);

      if (!entry || now > entry.resetAt) {
        requests.set(ip, { count: 1, resetAt: now + _opts.interval });
        return { success: true, remaining: _opts.uniqueTokenPerInterval - 1 };
      }

      if (entry.count >= _opts.uniqueTokenPerInterval) {
        return { success: false, remaining: 0 };
      }

      entry.count++;
      return { success: true, remaining: _opts.uniqueTokenPerInterval - entry.count };
    },
  };
}

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function applyRateLimit(
  limiter: RateLimiter,
  ip: string
): Promise<NextResponse | null> {
  const { success } = await limiter.check(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }
  return null;
}

// Pre-configured limiters
export const authLimiter = createLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 10,
});

export const exportLimiter = createLimiter({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 20,
});

export const generateImageLimiter = createLimiter({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 10,
});

export const checkoutLimiter = createLimiter({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 10,
});
