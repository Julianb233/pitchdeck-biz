import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/analysis/transcribe";
import { analysisLimiter, getClientIp, applyRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * POST /api/discovery/voice
 *
 * Transcribe audio for a discovery step using OpenAI Whisper.
 * Returns the transcription text which the client then sends to
 * /api/discovery/step/[N] along with any other inputs.
 *
 * Body: FormData with "audio" field (Blob)
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = applyRateLimit(
    analysisLimiter,
    ip,
    "Too many transcription requests. Please try again later.",
  );
  if (limited) return limited;

  try {
    const formData = await request.formData();
    const file = formData.get("audio") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No audio file provided. Use the 'audio' form field." },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("audio/")) {
      return NextResponse.json(
        { error: `Expected audio file, got: ${file.type}` },
        { status: 400 },
      );
    }

    const maxSize = 25 * 1024 * 1024; // 25 MB Whisper limit
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Audio file too large. Max size is 25 MB." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await transcribeAudio(buffer, file.name, file.type);

    return NextResponse.json({
      success: true,
      transcription: result,
    });
  } catch (error) {
    console.error("Discovery voice transcription failed:", error);
    return NextResponse.json(
      {
        error: "Transcription failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
