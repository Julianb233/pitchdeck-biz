import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { signIn } from "@/lib/auth";
import { authLimiter, getClientIp, applyRateLimit } from "@/lib/rate-limit";

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting — 10 req/min per IP
    const ip = getClientIp(request);
    const limited = applyRateLimit(authLimiter, ip, "Too many login attempts. Please try again later.");
    if (limited) return limited;

    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;
    const { data, error } = await signIn(email, password);

    if (error) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const user = data.user;
    return NextResponse.json({
      user: {
        id: user?.id,
        email: user?.email,
        name: user?.user_metadata?.name,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
