import { NextRequest, NextResponse } from "next/server";
import { validateVerificationToken } from "@/lib/auth/verification";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/auth/verify-email?token=...
 * Called when user clicks the verification link in their email.
 * Validates the token and redirects to login with a success flag.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Missing verification token" },
      { status: 400 },
    );
  }

  const result = await validateVerificationToken(token);

  if (!result) {
    return NextResponse.json(
      { error: "Invalid or expired verification token" },
      { status: 400 },
    );
  }

  // Mark email_verified in public.users table
  const supabase = createAdminClient();
  if (supabase) {
    await supabase
      .from("users")
      .update({ email_verified: true })
      .eq("id", result.userId);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return NextResponse.redirect(
    `${appUrl}/login?verified=true`,
  );
}

/**
 * POST /api/auth/verify-email
 * Called by the client-side verify-email page for AJAX-based verification.
 * Accepts { token } in the request body.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = body?.token;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Missing verification token" },
        { status: 400 },
      );
    }

    const result = await validateVerificationToken(token);

    if (!result) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 },
      );
    }

    // Mark email_verified in public.users table
    const supabase = createAdminClient();
    if (supabase) {
      await supabase
        .from("users")
        .update({ email_verified: true })
        .eq("id", result.userId);
    }

    return NextResponse.json(
      { message: "Email verified successfully! You can now sign in." },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
