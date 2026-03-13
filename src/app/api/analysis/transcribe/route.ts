import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, transcribeAudio, logger } from "@/lib/analysis";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // Auth check
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get("audio") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No audio file provided. Use the 'audio' form field." },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("audio/")) {
      return NextResponse.json(
        { error: `Expected audio file, got: ${file.type}` },
        { status: 400 }
      );
    }

    const maxSize = 25 * 1024 * 1024; // 25 MB (Whisper limit)
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Audio file too large. Max size is 25 MB." },
        { status: 400 }
      );
    }

    logger.info("Transcription request", {
      fileName: file.name,
      fileType: file.type,
      sizeBytes: file.size,
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await transcribeAudio(buffer, file.name, file.type);

    return NextResponse.json({
      success: true,
      transcription: result,
    });
  } catch (error) {
    logger.error("Transcription endpoint failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        error: "Transcription failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
