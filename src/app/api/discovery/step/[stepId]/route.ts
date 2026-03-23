import { NextRequest, NextResponse } from "next/server";
import { processStep } from "@/lib/ai/discovery-engine";
import { analysisLimiter, getClientIp, applyRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * POST /api/discovery/step/[stepId]
 *
 * Process a single discovery step with AI. Accepts text, voice transcript,
 * and/or file extractions and returns an acknowledgment + extracted data.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ stepId: string }> },
) {
  const ip = getClientIp(request);
  const limited = applyRateLimit(
    analysisLimiter,
    ip,
    "Too many requests. Please try again later.",
  );
  if (limited) return limited;

  try {
    const { stepId: stepIdStr } = await params;
    const stepId = parseInt(stepIdStr, 10);

    if (isNaN(stepId) || stepId < 1 || stepId > 6) {
      return NextResponse.json(
        { error: "stepId must be between 1 and 6" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { text, transcript, fileExtractions } = body as {
      sessionId?: string;
      text?: string;
      transcript?: string;
      fileExtractions?: Array<{ name: string; extractedText: string }>;
    };

    const hasInput =
      text?.trim() ||
      transcript?.trim() ||
      (fileExtractions && fileExtractions.length > 0);

    if (!hasInput) {
      return NextResponse.json(
        { error: "At least one input (text, transcript, or files) is required" },
        { status: 400 },
      );
    }

    const ai = await processStep(stepId, { text, transcript, fileExtractions });

    return NextResponse.json({ success: true, ai });
  } catch (error) {
    console.error("Discovery step processing failed:", error);
    return NextResponse.json(
      {
        error: "Step processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
