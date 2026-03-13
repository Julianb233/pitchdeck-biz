import { NextResponse } from "next/server";
import { signOut } from "@/lib/auth";

export async function POST() {
  const { error } = await signOut();

  if (error) {
    return NextResponse.json(
      { error: "Failed to sign out" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
