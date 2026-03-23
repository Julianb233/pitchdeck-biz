import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { StepResponse, BusinessDiscoverySummary } from "@/types/discovery";
import { analysisLimiter, getClientIp, applyRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const API_KEY = process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY ?? "";

const BusinessDiscoverySummarySchema = z.object({
  businessDescription: z.string(),
  businessModel: z.string(),
  product: z.string(),
  market: z.string(),
  uniqueValue: z.string(),
  goals: z.array(z.string()),
  primaryGoal: z.string(),
  investorType: z.string(),
  investorDetails: z.string(),
  fundingAmount: z.string(),
  timeline: z.string(),
  useOfFunds: z.array(z.string()),
  fundingSource: z.string(),
  platform: z.string(),
  geography: z.string(),
  stage: z.string(),
  teamSize: z.string(),
  traction: z.array(z.string()),
  existingInvestors: z.string(),
  confidence: z.number().min(0).max(1),
});

const SUMMARIZE_PROMPT = `You are an expert business analyst and pitch deck strategist. A user has completed a 6-step discovery session about their business. Analyze all their responses and create a comprehensive structured summary.

Extract the following information from the user's responses:
- businessDescription: 2-3 sentence description of the business
- businessModel: How they make money (SaaS, marketplace, services, etc.)
- product: What they sell or offer
- market: Who their customers are and the market they serve
- uniqueValue: What makes them different from competitors
- goals: Array of their stated goals
- primaryGoal: Their most important goal (raise capital, sell business, find partners, etc.)
- investorType: Type of investor they're targeting (angel, VC, bank, crowdfunding, etc.)
- investorDetails: More detail about their target investors
- fundingAmount: How much they want to raise (e.g. "$500K", "$2M", "TBD")
- timeline: When they want to close (e.g. "3 months", "Q2 2026", "ASAP")
- useOfFunds: Array of how they plan to use the funds
- fundingSource: Where they plan to raise (platform, network, geography)
- platform: Specific platform if mentioned (AngelList, Republic, etc.)
- geography: Geographic focus if mentioned
- stage: Business stage (Idea, MVP, Revenue, Growth, Profitable)
- teamSize: Team size or description
- traction: Array of traction metrics
- existingInvestors: Existing investors if mentioned
- confidence: Score (0-1) reflecting how complete and clear the inputs were

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
      model: "gemini-2.5-pro",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${SUMMARIZE_PROMPT}\n\nHere are the user's discovery session responses:\n\n${userContent}`,
            },
          ],
        },
      ],
      config: {
        temperature: 0.3,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
        responseJsonSchema: zodToJsonSchema(BusinessDiscoverySummarySchema),
      },
    });

    const rawText = response.text?.trim() ?? "";

    if (!rawText) {
      return NextResponse.json(
        { error: "Empty response from AI" },
        { status: 500 }
      );
    }

    const parseResult = BusinessDiscoverySummarySchema.safeParse(
      JSON.parse(rawText)
    );
    if (!parseResult.success) {
      console.error("Discovery summarize: invalid schema from Gemini:", parseResult.error);
      return NextResponse.json(
        { error: "AI returned unexpected summary format", details: parseResult.error.message },
        { status: 500 }
      );
    }
    const summary = parseResult.data as BusinessDiscoverySummary;
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
