import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { analysisLimiter, getClientIp, applyRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

const API_KEY = process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY ?? "";

/**
 * POST /api/discovery/voice
 *
 * Accepts an audio blob (multipart form), sends it to Gemini for
 * transcription, and returns the text.
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
    if (!API_KEY) {
      return NextResponse.json(
        { error: "No API key configured for audio transcription" },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const base64Audio = buffer.toString("base64");

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: audioFile.type || "audio/webm",
                data: base64Audio,
              },
            },
            {
              text: "Transcribe this audio recording accurately. Return ONLY the transcribed text, nothing else. If the audio is unclear or silent, return an empty string.",
            },
          ],
        },
      ],
      config: {
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
    });

    const transcription = response.text?.trim() ?? "";

    return NextResponse.json({
      success: true,
      transcription: { text: transcription },
    });
  } catch (error) {
    console.error("Voice transcription failed:", error);
    return NextResponse.json(
      {
        error: "Transcription failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
