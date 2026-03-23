import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analysisLimiter, getClientIp, applyRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * GET /api/discovery/status?sessionId=xxx
 *
 * Get the current status of a discovery session, including which steps
 * have been completed and the current step number.
 */
export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = applyRateLimit(
    analysisLimiter,
    ip,
    "Too many requests. Please try again later.",
  );
  if (limited) return limited;

  const sessionId = request.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json(
      { error: "sessionId query parameter is required" },
      { status: 400 },
    );
  }

  try {
    const supabase = await createClient();
    const { data: session, error } = await supabase
      .from("discovery_sessions")
      .select(
        "id, status, current_step, responses, summary, investor_type, analysis_id, deck_id, created_at, updated_at",
      )
      .eq("id", sessionId)
      .single();

    if (error || !session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 },
      );
    }

    const responses = (session.responses as Record<string, unknown>) || {};
    const completedSteps = Object.keys(responses).map(Number).sort((a, b) => a - b);

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        currentStep: session.current_step,
        completedSteps,
        totalSteps: 6,
        hasSummary: !!session.summary,
        summary: session.summary,
        investorType: session.investor_type,
        analysisId: session.analysis_id,
        deckId: session.deck_id,
        createdAt: session.created_at,
        updatedAt: session.updated_at,
      },
    });
  } catch (error) {
    console.error("Discovery status failed:", error);
    return NextResponse.json(
      {
        error: "Failed to get session status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
