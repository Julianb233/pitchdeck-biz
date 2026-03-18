import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import type { StepResponse, BusinessDiscoverySummary } from "@/types/discovery";
import { analysisLimiter, getClientIp, applyRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const API_KEY = process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY ?? "";

const SUMMARIZE_PROMPT = `You are an expert business analyst and pitch deck strategist. A user has completed a 6-step discovery session about their business. Analyze all their responses and create a comprehensive structured summary.

You MUST return valid JSON matching this exact schema — no markdown, no code fences, no extra text:

{
  "businessDescription": "2-3 sentence description of the business",
  "businessModel": "How they make money (SaaS, marketplace, services, etc.)",
  "product": "What they sell or offer",
  "market": "Who their customers are and the market they serve",
  "uniqueValue": "What makes them different from competitors",
  "goals": ["goal1", "goal2"],
  "primaryGoal": "Their most important goal (raise capital, sell business, find partners, etc.)",
  "investorType": "Type of investor they're targeting (angel, VC, bank, crowdfunding, etc.)",
  "investorDetails": "More detail about their target investors",
  "fundingAmount": "How much they want to raise (e.g. '$500K', '$2M', 'TBD')",
  "timeline": "When they want to close (e.g. '3 months', 'Q2 2026', 'ASAP')",
  "useOfFunds": ["use1", "use2"],
  "fundingSource": "Where they plan to raise (platform, network, geography)",
  "platform": "Specific platform if mentioned (AngelList, Republic, etc.)",
  "geography": "Geographic focus if mentioned",
  "stage": "Business stage (Idea, MVP, Revenue, Growth, Profitable)",
  "teamSize": "Team size or description",
  "traction": ["traction metric 1", "traction metric 2"],
  "existingInvestors": "Existing investors if mentioned",
  "confidence": 0.85
}

Rules:
- Extract ALL relevant information from the user's responses
- If information wasn't provided, use reasonable defaults or "Not specified"
- The confidence score (0-1) should reflect how complete and clear the inputs were
- Be specific with numbers when the user provided them
- Infer the business model and stage from context clues if not explicitly stated
- For goals, always include at least one goal based on the context`;

function buildStepContent(steps: StepResponse[]): string {
  const stepLabels = [
    "About Their Business",
    "Their Goals",
    "Target Investors",
    "Ideal Outcome",
    "Fundraising Source",
    "Business Stage & Traction",
  ];

  return steps
    .map((step) => {
      const label = stepLabels[step.stepId - 1] || `Step ${step.stepId}`;
      const parts: string[] = [];

      if (step.textInput) {
        parts.push(`Text response: ${step.textInput}`);
      }
      if (step.audioTranscription) {
        parts.push(`Voice response: ${step.audioTranscription}`);
      }
      if (step.uploadedFiles && step.uploadedFiles.length > 0) {
        const fileTexts = step.uploadedFiles
          .map((f) => `[File: ${f.name}] ${f.extractedText}`)
          .join("\n");
        parts.push(`Uploaded documents:\n${fileTexts}`);
      }

      return `## ${label}\n${parts.join("\n") || "(No response provided)"}`;
    })
    .join("\n\n");
}

/**
 * POST /api/discovery/summarize
 *
 * Takes all 6 step responses and uses Gemini 2.5 Pro to produce
 * a structured BusinessDiscoverySummary.
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
    const { steps } = body as { steps: StepResponse[] };

    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      return NextResponse.json(
        { error: "At least one step response is required" },
        { status: 400 }
      );
    }

    const userContent = buildStepContent(steps);

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro-preview-06-05",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${SUMMARIZE_PROMPT}\n\nHere are the user's discovery session responses:\n\n${userContent}\n\nReturn ONLY the JSON object.`,
            },
          ],
        },
      ],
      config: {
        temperature: 0.3,
        maxOutputTokens: 4096,
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

    // Parse — strip code fences if present
    let jsonText = rawText;
    if (jsonText.startsWith("```")) {
      jsonText = jsonText
        .replace(/^```(?:json)?\s*\n?/, "")
        .replace(/\n?```\s*$/, "");
    }

    const summary: BusinessDiscoverySummary = JSON.parse(jsonText);

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error("Discovery summarize failed:", error);
    return NextResponse.json(
      {
        error: "Summarization failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
