import { NextRequest, NextResponse } from "next/server";
import { getUserTier } from "@/lib/feature-gate";
import type { PitchFeedback } from "@/lib/pitch-coach/session";

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

Analyze the pitch delivery and provide a JSON response with this exact structure:
{
  "overallScore": <number 1-100>,
  "clarity": {
    "score": <number 1-100>,
    "feedback": "<specific feedback on clarity of message, jargon usage, and audience comprehension>"
  },
  "confidence": {
    "score": <number 1-100>,
    "feedback": "<feedback on confidence level, hedging language, authority, and conviction>"
  },
  "pacing": {
    "score": <number 1-100>,
    "feedback": "<feedback on pacing — too rushed, too slow, good rhythm, use of pauses>"
  },
  "contentCoverage": {
    "score": <number 1-100>,
    "feedback": "<feedback on how well they covered the slide's key points and added value beyond what's written>"
  },
  "suggestions": ["<actionable improvement 1>", "<actionable improvement 2>", "<actionable improvement 3>"],
  "strongPoints": ["<strength 1>", "<strength 2>"]
}

Be encouraging but honest. Provide specific examples from their transcript. Focus on what would make an investor say yes.
Return ONLY the JSON object, no markdown or explanation.`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-pro-preview-06-05",
      contents: prompt,
    });

    const text = result.text ?? "";
    // Extract JSON from response (handle potential markdown wrapping)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[pitch-coach] No JSON found in Gemini response:", text);
      return generateFallbackFeedback(transcript);
    }

    const parsed = JSON.parse(jsonMatch[0]) as PitchFeedback;

    // Validate the structure
    if (
      typeof parsed.overallScore !== "number" ||
      !parsed.clarity ||
      !parsed.confidence ||
      !parsed.pacing ||
      !parsed.contentCoverage
    ) {
      console.error("[pitch-coach] Invalid feedback structure from Gemini");
      return generateFallbackFeedback(transcript);
    }

    return parsed;
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
