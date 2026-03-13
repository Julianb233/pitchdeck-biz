import { NextRequest, NextResponse } from "next/server";
import { getDeck } from "@/lib/supabase/decks";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Deck ID is required" }, { status: 400 });
    }

    const deck = await getDeck(id);

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      deck,
    });
  } catch (error) {
    console.error("[api/decks] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load deck" },
      { status: 500 }
    );
  }
}
