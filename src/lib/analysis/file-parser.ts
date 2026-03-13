import { logger } from "./logger";

/**
 * Extract text content from various file types.
 */
export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<string> {
  logger.info("Extracting text from file", { fileName, mimeType });

  if (mimeType === "application/pdf") {
    return extractFromPdf(buffer);
  }

  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword" ||
    fileName.endsWith(".docx") ||
    fileName.endsWith(".doc")
  ) {
    return extractFromDocx(buffer);
  }

  if (mimeType.startsWith("text/")) {
    return buffer.toString("utf-8");
  }

  if (mimeType.startsWith("image/")) {
    // Images are handled separately via Claude vision — return empty
    return "";
  }

  logger.warn("Unsupported file type, attempting text decode", { mimeType });
  return buffer.toString("utf-8");
}

async function extractFromPdf(buffer: Buffer): Promise<string> {
  try {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await parser.getText();
    return result.text;
  } catch (error) {
    logger.error("Failed to parse PDF", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error("Failed to parse PDF file");
  }
}

async function extractFromDocx(buffer: Buffer): Promise<string> {
  try {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    logger.error("Failed to parse DOCX", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error("Failed to parse DOCX file");
  }
}

/**
 * Convert an image buffer to a base64 data URI for Claude vision.
 */
export function imageToBase64(buffer: Buffer, mimeType: string): string {
  const base64 = buffer.toString("base64");
  return `data:${mimeType};base64,${base64}`;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "text/markdown",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/webm",
  "audio/ogg",
]);

export function validateFile(
  size: number,
  mimeType: string
): { valid: true } | { valid: false; error: string } {
  if (size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large. Max size is 25 MB.` };
  }
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return {
      valid: false,
      error: `Unsupported file type: ${mimeType}. Allowed: PDF, DOCX, DOC, TXT, CSV, MD, PNG, JPEG, WebP, GIF, MP3, M4A, WAV, WebM, OGG.`,
    };
  }
  return { valid: true };
}
