import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  validateApiKey,
  validateFile,
  extractTextFromFile,
  imageToBase64,
  logger,
} from "@/lib/analysis";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // Auth check
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided. Use the 'files' form field." },
        { status: 400 }
      );
    }

    logger.info("File upload request", { fileCount: files.length });

    const results = [];

    for (const file of files) {
      const validation = validateFile(file.size, file.type);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error, fileName: file.name },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const fileId = uuidv4();

      let extractedText: string | undefined;
      let imageData: string | undefined;

      if (file.type.startsWith("image/")) {
        imageData = imageToBase64(buffer, file.type);
      } else if (!file.type.startsWith("audio/")) {
        extractedText = await extractTextFromFile(buffer, file.type, file.name);
      }

      results.push({
        fileId,
        fileName: file.name,
        fileType: file.type,
        sizeBytes: file.size,
        extractedText,
        imageData,
        isAudio: file.type.startsWith("audio/"),
      });
    }

    logger.info("File upload complete", { processed: results.length });

    return NextResponse.json({
      success: true,
      files: results.map(({ imageData: _, ...rest }) => rest),
      _internal: results, // Full data including imageData for pipeline use
    });
  } catch (error) {
    logger.error("File upload failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        error: "File upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
