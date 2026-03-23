import { NextRequest, NextResponse } from "next/server";
import {
  processDocumentWithGemini,
  formatStructuredExtraction,
} from "@/lib/ai/document-processor";
import { analysisLimiter, getClientIp, applyRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const MIME_MAP: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain",
  csv: "text/csv",
  md: "text/markdown",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
};

function getMimeType(fileName: string, fileType: string): string {
  if (fileType && fileType !== "application/octet-stream") return fileType;
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return MIME_MAP[ext] ?? "application/octet-stream";
}

/**
 * POST /api/discovery/upload
 *
 * Accepts one or more files via multipart form data.
 * Extracts text content from each file using Gemini document processor.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = applyRateLimit(
    analysisLimiter,
    ip,
    "Too many requests. Please try again later.",
  );
  if (limited) return limited;

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 },
      );
    }

    const results = await Promise.all(
      files.map(async (file) => {
        try {
          if (file.size > MAX_FILE_SIZE) {
            return {
              fileName: file.name,
              success: false,
              error: `File exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
            };
          }

          const buffer = Buffer.from(await file.arrayBuffer());
          const mimeType = getMimeType(file.name, file.type);

          // For plain text files, skip Gemini and just read directly
          if (
            mimeType === "text/plain" ||
            mimeType === "text/csv" ||
            mimeType === "text/markdown"
          ) {
            const text = buffer.toString("utf-8");
            return {
              fileName: file.name,
              success: true,
              extractedText: text,
            };
          }

          const result = await processDocumentWithGemini(
            buffer,
            mimeType,
            file.name,
          );
          const extractedText = formatStructuredExtraction(result);

          return {
            fileName: file.name,
            success: true,
            extractedText,
          };
        } catch (err) {
          console.error(`Failed to process file ${file.name}:`, err);
          return {
            fileName: file.name,
            success: false,
            error:
              err instanceof Error ? err.message : "File processing failed",
          };
        }
      }),
    );

    return NextResponse.json({ success: true, files: results });
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
