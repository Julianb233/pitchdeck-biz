import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateApiKey, analyzeBusinessInfo, logger } from "@/lib/analysis";

export const runtime = "nodejs";

const AnalyzeRequestSchema = z.object({
  textContent: z.string().optional(),
  imageBase64: z.array(z.string()).optional(),
  transcription: z.string().optional(),
  additionalContext: z.string().optional(),
});

/**
 * POST /api/analysis/analyze
 *
 * Accepts pre-processed content and runs the AI business analysis pipeline.
 * Use this if you've already extracted text / transcribed audio separately.
 */
export async function POST(request: NextRequest) {
  // Auth check
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = AnalyzeRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { textContent, imageBase64, transcription, additionalContext } =
      parsed.data;

    // Ensure at least some input
    if (!textContent && !imageBase64?.length && !transcription && !additionalContext) {
      return NextResponse.json(
        {
          error:
            "At least one input is required: textContent, imageBase64, transcription, or additionalContext",
        },
        { status: 400 }
      );
    }

    logger.info("Analysis request", {
      hasText: !!textContent,
      imageCount: imageBase64?.length ?? 0,
      hasTranscription: !!transcription,
      hasContext: !!additionalContext,
    });

    const analysis = await analyzeBusinessInfo({
      textContent,
      imageBase64,
      transcription,
      additionalContext,
    });

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    logger.error("Analysis endpoint failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        error: "Analysis failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
