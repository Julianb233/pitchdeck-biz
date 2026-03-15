import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateToken } from "@/lib/auth/tokens";
import { createAdminClient } from "@/lib/supabase/admin";

const ResetPasswordSchema = z.object({
  token: z.string().uuid("Invalid reset token"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ResetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { token, password } = parsed.data;

    const result = await validateToken(token, "password_reset");
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Update password via Supabase Admin API
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Service unavailable" },
        { status: 503 },
      );
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      result.userId,
      { password }
    );

    if (updateError) {
      console.error("[reset-password] Failed to update password:", updateError.message);
      return NextResponse.json(
        { error: "Failed to reset password" },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Password reset successfully" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
