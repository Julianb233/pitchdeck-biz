import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateToken } from "@/lib/auth/tokens";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ForgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { email } = parsed.data;

    // Always return success to prevent email enumeration
    const successResponse = NextResponse.json({
      message: "If an account with that email exists, a password reset link has been sent.",
    });

    const supabase = createAdminClient();
    if (!supabase) {
      return successResponse;
    }

    // Look up user by email
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (!user) {
      // Don't reveal that the user doesn't exist
      return successResponse;
    }

    const token = await generateToken(user.id, "password_reset");
    if (token) {
      // TODO: Send password reset email once email provider is configured
      console.log(`[forgot-password] Reset token for ${email}: ${token}`);
      console.log(`[forgot-password] Reset URL: /reset-password?token=${token}`);
    }

    return successResponse;
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
