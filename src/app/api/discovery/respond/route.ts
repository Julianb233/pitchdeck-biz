import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import type { StepResponse } from "@/types/discovery";
import { analysisLimiter, getClientIp, applyRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

const API_KEY = process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY ?? "";

const STEP_LABELS = [
  "About Their Business",
  "Their Goals",
  "Target Investors",
  "Ideal Outcome",
  "Fundraising Source",
  "Business Stage & Traction",
];

const RESPOND_PROMPT = `You are a friendly AI pitch deck strategist conducting a discovery session. The user just answered a question about their business. Give a brief, encouraging 1-2 sentence acknowledgment that shows you understood what they said, and extract 2-4 key takeaways as short bullet points.

Rules:
- Be warm and conversational, like a great advisor
- Show you understood their specific details (reference names, numbers, specifics)
- Keep the acknowledgment to 1-2 sentences max
- Extract 2-4 concrete takeaways as bullet points (each under 10 words)
- If they gave thin/vague input, be encouraging but note you'll work with what you have
- RESPOND IN VALID JSON with this exact shape: {"acknowledgment": "string", "takeaways": ["string", "string"]}`;

function getInputText(step: StepResponse): string {
  const parts: string[] = [];
  if (step.textInput) parts.push(step.textInput);
  if (step.audioTranscription) parts.push(step.audioTranscription);
  if (step.uploadedFiles?.length) {
    parts.push(
      step.uploadedFiles.map((f) => `[${f.name}]: ${f.extractedText}`).join("\n")
    );
  }
  return parts.join("\n\n");
}

/**
 * POST /api/discovery/respond
 *
 * Takes a single step response and returns a brief AI acknowledgment + key takeaways.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = applyRateLimit(
    analysisLimiter,
    ip,
    "Too many requests. Please try again later."
  );
  if (limited) return limited;

  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: "GOOGLE_API_KEY or GEMINI_API_KEY not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { stepResponse } = body as { stepResponse: StepResponse };

    if (!stepResponse?.stepId) {
      return NextResponse.json(
        { error: "stepResponse with stepId is required" },
        { status: 400 }
      );
    }

    const inputText = getInputText(stepResponse);
    if (!inputText.trim()) {
      return NextResponse.json(
        { error: "No input text to analyze" },
        { status: 400 }
      );
    }

    const label = STEP_LABELS[stepResponse.stepId - 1] || `Step ${stepResponse.stepId}`;

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${RESPOND_PROMPT}\n\nStep: ${label}\nUser's response:\n${inputText}`,
            },
          ],
        },
      ],
      config: {
        temperature: 0.7,
        maxOutputTokens: 512,
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text?.trim() ?? "";
    if (!rawText) {
      return NextResponse.json(
        { error: "Empty response from AI" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(rawText) as {
      acknowledgment: string;
      takeaways: string[];
    };

    return NextResponse.json({
      success: true,
      acknowledgment: parsed.acknowledgment || "Got it!",
      takeaways: parsed.takeaways || [],
    });
  } catch (error) {
    console.error("Discovery respond failed:", error);
    return NextResponse.json(
      {
        error: "AI response failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
