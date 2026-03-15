import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateToken } from "@/lib/auth/tokens";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") || "signup";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!token && !tokenHash) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Missing verification token.")}`, appUrl));
  }

  try {
    const supabase = createAdminClient();

    if (tokenHash && supabase) {
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as "signup" | "email" });
      if (error) {
        console.error("[verify-email] OTP verification failed:", error.message);
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Verification failed. The link may have expired.")}`, appUrl));
      }
      return NextResponse.redirect(new URL("/login?verified=true", appUrl));
    }

    if (token) {
      const result = await validateToken(token, "email_verification");
      if ("error" in result) {
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(result.error)}`, appUrl));
      }
      if (supabase) {
        const { error: updateError } = await supabase.auth.admin.updateUserById(result.userId, { email_confirm: true });
        if (updateError) console.error("[verify-email] Failed to confirm user:", updateError.message);
      }
      return NextResponse.redirect(new URL("/login?verified=true", appUrl));
    }

    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Invalid verification request.")}`, appUrl));
  } catch (err) {
    console.error("[verify-email] Unexpected error:", err);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("An unexpected error occurred.")}`, appUrl));
  }
}
