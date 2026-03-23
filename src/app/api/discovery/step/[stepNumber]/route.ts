import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analysisLimiter, getClientIp, applyRateLimit } from "@/lib/rate-limit";
import {
  processDiscoveryStep,
  STEP_CONFIGS,
} from "@/lib/ai/discovery-engine";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/discovery/step/[stepNumber]
 *
 * Submit a response for a specific discovery step. The Gemini engine
 * processes the input and returns acknowledgment, extracted data,
 * and follow-up questions.
 *
 * Body: {
 *   sessionId: string,
 *   text?: string,
 *   transcript?: string,
 *   fileExtractions?: Array<{ name: string, extractedText: string }>
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ stepNumber: string }> },
) {
  const ip = getClientIp(request);
  const limited = applyRateLimit(
    analysisLimiter,
    ip,
    "Too many requests. Please try again later.",
  );
  if (limited) return limited;

  const { stepNumber } = await params;
  const stepId = parseInt(stepNumber, 10);

  if (isNaN(stepId) || stepId < 1 || stepId > STEP_CONFIGS.length) {
    return NextResponse.json(
      { error: `Invalid step number. Must be 1-${STEP_CONFIGS.length}.` },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();
    const { sessionId, text, transcript, fileExtractions } = body as {
      sessionId: string;
      text?: string;
      transcript?: string;
      fileExtractions?: Array<{ name: string; extractedText: string }>;
    };

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 },
      );
    }

    // Load prior responses from Supabase (if available)
    let priorResponses: Record<
      string,
      {
        text?: string;
        transcript?: string;
        files?: Array<{ name: string; extractedText: string }>;
        aiExtraction?: Record<string, string>;
      }
    > = {};

    try {
      const supabase = await createClient();
      const { data: session } = await supabase
        .from("discovery_sessions")
        .select("responses")
        .eq("id", sessionId)
        .single();

      if (session?.responses) {
        priorResponses = session.responses as typeof priorResponses;
      }
    } catch {
      // Use empty prior responses if Supabase unavailable
    }

    // Process with Gemini
    const aiResponse = await processDiscoveryStep(
      stepId,
      { text, transcript, fileExtractions },
      priorResponses,
    );

    // Persist step response + AI extraction to Supabase
    try {
      const supabase = await createClient();
      const { data: session } = await supabase
        .from("discovery_sessions")
        .select("responses")
        .eq("id", sessionId)
        .single();

      if (session) {
        const responses = (session.responses as Record<string, unknown>) || {};
        responses[String(stepId)] = {
          text,
          transcript,
          files: fileExtractions,
          aiExtraction: aiResponse.extractedData,
          aiAcknowledgment: aiResponse.acknowledgment,
          confidence: aiResponse.stepConfidence,
        };

        await supabase
          .from("discovery_sessions")
          .update({
            responses,
            current_step: Math.min(stepId + 1, STEP_CONFIGS.length + 1),
          })
          .eq("id", sessionId);
      }
    } catch {
      // Non-fatal
    }

    return NextResponse.json({
      success: true,
      step: stepId,
      ai: aiResponse,
    });
  } catch (error) {
    console.error(`Discovery step ${stepId} failed:`, error);
    return NextResponse.json(
      {
        error: "Step processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
