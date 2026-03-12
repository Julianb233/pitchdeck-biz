import OpenAI from "openai";
import { logger } from "./logger";
import type { TranscriptionResult } from "./schema";

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required for transcription");
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

/**
 * Transcribe audio using OpenAI Whisper API.
 */
export async function transcribeAudio(
  audioBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<TranscriptionResult> {
  logger.info("Starting audio transcription", { fileName, mimeType });

  const openai = getOpenAI();

  // Whisper accepts File objects — create one from a Uint8Array
  const file = new File([new Uint8Array(audioBuffer)], fileName, { type: mimeType });

  try {
    const response = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file,
      response_format: "verbose_json",
    });

    logger.info("Transcription complete", {
      fileName,
      durationSeconds: response.duration,
      language: response.language,
    });

    return {
      text: response.text,
      durationSeconds: response.duration,
      language: response.language,
    };
  } catch (error) {
    logger.error("Transcription failed", {
      fileName,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error(
      `Transcription failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
