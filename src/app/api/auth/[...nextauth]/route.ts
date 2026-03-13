// NextAuth is no longer used — auth is handled by Supabase.
// This catch-all route is kept to avoid 404s on any legacy NextAuth callback URLs.
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Auth is handled by Supabase" }, { status: 410 });
}

export async function POST() {
  return NextResponse.json({ error: "Auth is handled by Supabase" }, { status: 410 });
}
