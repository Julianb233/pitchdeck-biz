import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { authLimiter, getClientIp, applyRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  // Rate limiting — 10 req/min per IP
  const ip = getClientIp(request);
  const limited = applyRateLimit(authLimiter, ip, "Too many requests. Please try again later.");
  if (limited) return limited;

  const user = await getSessionFromCookies();

  if (!user) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 },
    );
  }

  return NextResponse.json({ user });
}
