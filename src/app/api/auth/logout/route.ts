import { NextRequest, NextResponse } from "next/server";
import { signOut } from "@/lib/auth";
import { authLimiter, getClientIp, applyRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Rate limiting — 10 req/min per IP
  const ip = getClientIp(request);
  const limited = applyRateLimit(authLimiter, ip, "Too many requests. Please try again later.");
  if (limited) return limited;

  const { error } = await signOut();

  if (error) {
    return NextResponse.json(
      { error: "Failed to sign out" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
