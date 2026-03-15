import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { signUp } from "@/lib/auth";
import { authLimiter, getClientIp, applyRateLimit } from "@/lib/rate-limit";

const SignupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = await applyRateLimit(authLimiter, ip, "Too many signup attempts. Please try again later.");
  if (limited) return limited;

  try {
    const body = await request.json();
    const parsed = SignupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { email, password, name } = parsed.data;
    const { data, error } = await signUp(email, password, name);

    if (error) {
      if (error.message.includes("already registered")) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 },
      );
    }

    const user = data.user;
    return NextResponse.json(
      {
        user: {
          id: user?.id,
          email: user?.email,
          name,
        },
        message: "Account created. Please check your email to verify your account.",
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
