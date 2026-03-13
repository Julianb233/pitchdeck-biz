import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getUserDecks } from "@/lib/supabase/decks";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decks = await getUserDecks(user.id);

    return NextResponse.json({
      success: true,
      decks,
    });
  } catch (error) {
    console.error("[api/decks] list error:", error);
    return NextResponse.json(
      { error: "Failed to load decks" },
      { status: 500 }
    );
  }
}
