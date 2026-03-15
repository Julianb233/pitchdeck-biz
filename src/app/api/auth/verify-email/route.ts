import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateToken } from "@/lib/auth/tokens";
import { createAdminClient } from "@/lib/supabase/admin";

const VerifySchema = z.object({
  token: z.string().uuid("Invalid verification token"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = VerifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const result = await validateToken(parsed.data.token, "email_verification");

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Mark user as verified
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Service unavailable" },
        { status: 503 },
      );
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ email_verified: true })
      .eq("id", result.userId);

    if (updateError) {
      console.error("[verify-email] Failed to update user:", updateError.message);
      return NextResponse.json(
        { error: "Failed to verify email" },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Email verified successfully" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
