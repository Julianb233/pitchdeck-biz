import { NextRequest, NextResponse } from "next/server";
import { getUserTier } from "@/lib/feature-gate";
import type { PitchFeedback } from "@/lib/pitch-coach/session";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const PitchFeedbackSchema = z.object({
  overallScore: z.number().min(1).max(100),
  clarity: z.object({ score: z.number(), feedback: z.string() }),
  confidence: z.object({ score: z.number(), feedback: z.string() }),
  pacing: z.object({ score: z.number(), feedback: z.string() }),
  contentCoverage: z.object({ score: z.number(), feedback: z.string() }),
  suggestions: z.array(z.string()),
  strongPoints: z.array(z.string()),
});

interface FeedbackRequestBody {
  sessionId: string;
  slideNumber: number;
  slideTitle: string;
  slideType: string;
  slideBulletPoints?: string[];
  userTranscript: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const tierInfo = await getUserTier();
    if (!tierInfo) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as FeedbackRequestBody;
    const {
      sessionId,
      slideNumber,
      slideTitle,
      slideType,
      slideBulletPoints,
      userTranscript,
    } = body;

    if (!sessionId || !userTranscript || slideNumber === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: sessionId, slideNumber, userTranscript" },
        { status: 400 }
      );
    }

    if (userTranscript.length < 10) {
      return NextResponse.json(
        { error: "Transcript is too short. Please provide a more detailed pitch." },
        { status: 400 }
      );
    }

    // Build the slide context for analysis
    const slideContext = [
      `Slide ${slideNumber}: "${slideTitle}" (${slideType})`,
      slideBulletPoints?.length
        ? `Key points the slide covers:\n${slideBulletPoints.map((bp) => `- ${bp}`).join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    // Call Gemini for pitch analysis
    const feedback = await analyzePitchWithGemini(
      userTranscript,
      slideContext
    );

    return NextResponse.json({
      success: true,
      sessionId,
      slideNumber,
      feedback,
    });
  } catch (error) {
    console.error("[pitch-coach/feedback] Analysis failed:", error);
    return NextResponse.json(
      { error: "Failed to analyze pitch. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * Analyze a pitch transcript using Gemini 2.5 Pro.
 */
async function analyzePitchWithGemini(
  transcript: string,
  slideContext: string
): Promise<PitchFeedback> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    // Return a structured mock response when API is unavailable
    return generateFallbackFeedback(transcript);
  }

  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert pitch coach who has helped hundreds of startups raise funding. Analyze the following pitch transcript for a specific slide and provide detailed, actionable feedback.

SLIDE CONTEXT:
${slideContext}

SPEAKER'S PITCH TRANSCRIPT:
"${transcript}"

Analyze the pitch delivery for overallScore, clarity, confidence, pacing, contentCoverage, suggestions, and strongPoints. Be encouraging but honest. Provide specific examples from their transcript. Focus on what would make an investor say yes.`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        temperature: 0.3,
        responseMimeType: "application/json",
        responseJsonSchema: zodToJsonSchema(PitchFeedbackSchema),
      },
    });

    const parseResult = PitchFeedbackSchema.safeParse(
      JSON.parse(result.text ?? "{}")
    );
    if (!parseResult.success) {
      console.error("[pitch-coach] Invalid feedback structure from Gemini:", parseResult.error);
      return generateFallbackFeedback(transcript);
    }
    return parseResult.data;
  } catch (error) {
    console.error("[pitch-coach] Gemini analysis failed:", error);
    return generateFallbackFeedback(transcript);
  }
}

/**
 * Generate basic feedback when the AI is unavailable.
 * Uses simple heuristics as a fallback.
 */
function generateFallbackFeedback(transcript: string): PitchFeedback {
  const wordCount = transcript.split(/\s+/).length;
  const sentenceCount = transcript.split(/[.!?]+/).filter(Boolean).length;
  const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);

  // Basic heuristic scores
  const clarityScore = Math.min(
    85,
    Math.max(40, avgWordsPerSentence < 25 ? 70 : 50)
  );
  const pacingScore = Math.min(
    85,
    Math.max(40, wordCount > 30 && wordCount < 200 ? 72 : 55)
  );
  const confidenceScore = Math.min(
    80,
    Math.max(
      40,
      transcript.includes("maybe") || transcript.includes("I think")
        ? 50
        : 68
    )
  );
  const coverageScore = Math.min(
    80,
    Math.max(40, wordCount > 50 ? 65 : 45)
  );

  const overallScore = Math.round(
    (clarityScore + pacingScore + confidenceScore + coverageScore) / 4
  );

  return {
    overallScore,
    clarity: {
      score: clarityScore,
      feedback:
        "Focus on leading with your key message. Make sure your main point is clear within the first sentence.",
    },
    confidence: {
      score: confidenceScore,
      feedback:
        "Use definitive statements rather than qualifiers like 'I think' or 'maybe'. Speak with conviction about your value proposition.",
    },
    pacing: {
      score: pacingScore,
      feedback:
        wordCount < 30
          ? "Your pitch is quite short. Expand on the key points to give investors a fuller picture."
          : "Good length. Practice pausing after key statistics to let them land.",
    },
    contentCoverage: {
      score: coverageScore,
      feedback:
        "Make sure you address each bullet point on the slide, but add your own insights and stories beyond what's written.",
    },
    suggestions: [
      "Start with a hook — a surprising statistic or bold claim that captures attention.",
      "Add a specific customer story or data point to make your pitch more memorable.",
      "End each slide's pitch with a clear transition to what comes next.",
    ],
    strongPoints: [
      "You addressed the slide topic directly.",
      "Keep practicing — consistency builds confident delivery.",
    ],
  };
}
