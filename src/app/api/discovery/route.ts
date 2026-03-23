import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/lib/supabase/server";
import { analysisLimiter, getClientIp, applyRateLimit } from "@/lib/rate-limit";
import { STEP_CONFIGS } from "@/lib/ai/discovery-engine";

export const runtime = "nodejs";

/**
 * POST /api/discovery — Start a new discovery session
 *
 * Creates a session in Supabase (if authenticated) or returns an ephemeral
 * session object for unauthenticated users.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = applyRateLimit(
    analysisLimiter,
    ip,
    "Too many requests. Please try again later.",
  );
  if (limited) return limited;

  const sessionId = uuidv4();

  // Try to persist to Supabase if user is authenticated
  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      userId = user.id;
      await supabase.from("discovery_sessions").insert({
        id: sessionId,
        user_id: user.id,
        status: "in_progress",
        current_step: 1,
        responses: {},
        file_references: [],
        ai_context: [],
      });
    }
  } catch {
    // Non-fatal — session works without persistence
  }

  return NextResponse.json({
    success: true,
    session: {
      id: sessionId,
      userId,
      status: "in_progress",
      currentStep: 1,
      steps: STEP_CONFIGS.map((s) => ({
        id: s.id,
        title: s.title,
        openingQuestion: s.openingQuestion,
      })),
    },
  });
}

/**
 * PUT /api/discovery — Update session step response (legacy compat)
 *
 * Kept for backward compatibility; new code should use /api/discovery/step/[N].
 */
export async function PUT(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = applyRateLimit(
    analysisLimiter,
    ip,
    "Too many requests. Please try again later.",
  );
  if (limited) return limited;

  try {
    const body = await request.json();
    const { sessionId, stepResponse } = body as {
      sessionId: string;
      stepResponse: { stepId: number; textInput?: string; audioTranscription?: string; uploadedFiles?: Array<{ name: string; extractedText: string }> };
    };

    if (!sessionId || !stepResponse || !stepResponse.stepId) {
      return NextResponse.json(
        { error: "sessionId and stepResponse with stepId are required" },
        { status: 400 },
      );
    }

    // Try to persist to Supabase
    try {
      const supabase = await createClient();
      const { data: session } = await supabase
        .from("discovery_sessions")
        .select("responses")
        .eq("id", sessionId)
        .single();

      if (session) {
        const responses = (session.responses as Record<string, unknown>) || {};
        responses[String(stepResponse.stepId)] = {
          text: stepResponse.textInput,
          transcript: stepResponse.audioTranscription,
          files: stepResponse.uploadedFiles,
        };

        await supabase
          .from("discovery_sessions")
          .update({
            responses,
            current_step: stepResponse.stepId,
          })
          .eq("id", sessionId);
      }
    } catch {
      // Non-fatal
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to update session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
