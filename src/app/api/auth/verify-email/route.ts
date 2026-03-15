import { NextRequest, NextResponse } from "next/server";
import { validateVerificationToken } from "@/lib/auth/verification";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Missing verification token" },
      { status: 400 },
    );
  }

  const result = validateVerificationToken(token);

  if (!result) {
    return NextResponse.json(
      { error: "Invalid or expired verification token" },
      { status: 400 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return NextResponse.redirect(
    `${appUrl}/login?verified=true`,
  );
}
