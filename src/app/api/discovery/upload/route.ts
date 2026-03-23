import { NextRequest, NextResponse } from "next/server";
import { processDocumentWithGemini, formatStructuredExtraction } from "@/lib/ai/document-processor";
import { analysisLimiter, getClientIp, applyRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const SUPPORTED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
  "text/csv",
  "text/markdown",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

/**
 * POST /api/discovery/upload
 *
 * Upload and process documents for a discovery step using Gemini Files API.
 * Returns extracted text and structured data per file.
 *
 * Body: FormData with "files" field(s)
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = applyRateLimit(
    analysisLimiter,
    ip,
    "Too many upload requests. Please try again later.",
  );
  if (limited) return limited;

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided. Use the 'files' form field." },
        { status: 400 },
      );
    }

    if (files.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 files per upload." },
        { status: 400 },
      );
    }

    const results = [];

    for (const file of files) {
      // Validate mime type
      if (!SUPPORTED_MIME_TYPES.has(file.type)) {
        return NextResponse.json(
          {
            error: `Unsupported file type: ${file.type}. Supported: PDF, DOCX, TXT, CSV, MD, PNG, JPG, WEBP, GIF`,
            fileName: file.name,
          },
          { status: 400 },
        );
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `File too large: ${file.name}. Max size is 50 MB.`,
            fileName: file.name,
          },
          { status: 400 },
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      try {
        const extraction = await processDocumentWithGemini(
          buffer,
          file.type,
          file.name,
        );

        const formattedText = formatStructuredExtraction(extraction);

        results.push({
          fileName: file.name,
          mimeType: file.type,
          extractedText: formattedText,
          structuredData: extraction.structuredData,
          success: true,
        });
      } catch (fileError) {
        console.error(`Failed to process ${file.name}:`, fileError);
        results.push({
          fileName: file.name,
          mimeType: file.type,
          extractedText: "",
          error:
            fileError instanceof Error
              ? fileError.message
              : "Processing failed",
          success: false,
        });
      }
    }

    return NextResponse.json({
      success: true,
      files: results,
    });
  } catch (error) {
    console.error("Discovery upload failed:", error);
    return NextResponse.json(
      {
        error: "Upload processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
