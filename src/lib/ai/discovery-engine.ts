/**
 * Gemini Conversational Discovery Engine
 *
 * Stateful multi-turn conversation engine using Gemini 2.5 Pro that guides
 * users through the 6-step discovery session. Adapts follow-up questions
 * based on prior answers and uploaded documents.
 */

import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY ?? "";

// ── Step Definitions ─────────────────────────────────────────────────────────

export const STEP_CONFIGS = [
  {
    id: 1,
    title: "Business Overview",
    systemGoal:
      "Understand the user's business: what they do, who they serve, and their core value proposition.",
    openingQuestion:
      "Tell me about your business. What do you do, and what problem do you solve?",
    extractionFields: [
      "businessName",
      "industry",
      "product",
      "targetCustomers",
      "businessModel",
      "uniqueValue",
    ],
  },
  {
    id: 2,
    title: "Problem & Solution",
    systemGoal:
      "Deeply understand the problem being solved, the solution offered, and why it matters.",
    openingQuestion:
      "What specific problem does your business solve, and why is your solution better than what already exists?",
    extractionFields: [
      "problemStatement",
      "solutionDescription",
      "competitiveAdvantage",
      "alternativeSolutions",
    ],
  },
  {
    id: 3,
    title: "Market & Competition",
    systemGoal:
      "Understand the market size, target audience, competitive landscape, and positioning.",
    openingQuestion:
      "Who are your target customers, how big is the market, and who are your main competitors?",
    extractionFields: [
      "targetMarket",
      "marketSize",
      "competitors",
      "positioning",
      "marketTrends",
    ],
  },
  {
    id: 4,
    title: "Business Model",
    systemGoal:
      "Understand how the business makes money, pricing, unit economics, and growth strategy.",
    openingQuestion:
      "How does your business make money? What's your pricing model and growth strategy?",
    extractionFields: [
      "revenueModel",
      "pricing",
      "unitEconomics",
      "growthStrategy",
      "salesChannels",
    ],
  },
  {
    id: 5,
    title: "Traction & Team",
    systemGoal:
      "Understand current traction, key metrics, team composition, and business stage.",
    openingQuestion:
      "What traction do you have so far? Tell me about your team and where you are as a business.",
    extractionFields: [
      "stage",
      "traction",
      "keyMetrics",
      "teamSize",
      "teamHighlights",
      "existingInvestors",
    ],
  },
  {
    id: 6,
    title: "Funding Ask",
    systemGoal:
      "Understand fundraising goals: how much, from whom, timeline, and use of funds.",
    openingQuestion:
      "How much funding are you looking to raise, who are your target investors, and what will you use the funds for?",
    extractionFields: [
      "fundingAmount",
      "investorType",
      "timeline",
      "useOfFunds",
      "fundingSource",
      "geography",
    ],
  },
] as const;

// ── Types ────────────────────────────────────────────────────────────────────

export interface StepAIResponse {
  /** AI's acknowledgment/analysis of the user's input */
  acknowledgment: string;
  /** Extracted structured data from this step */
  extractedData: Record<string, string>;
  /** Follow-up questions the AI wants to ask */
  followUpQuestions: string[];
  /** Confidence score for this step's data completeness */
  stepConfidence: number;
  /** Whether the AI has enough info to proceed to next step */
  readyToAdvance: boolean;
}

export interface ConversationMessage {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

// ── System Prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(stepId: number, priorContext: string): string {
  const step = STEP_CONFIGS[stepId - 1];
  if (!step) throw new Error(`Invalid step ID: ${stepId}`);

  return `You are a world-class pitch deck strategist conducting a discovery session with a business founder. You are warm, encouraging, and insightful.

CURRENT STEP: ${step.id}/6 — ${step.title}
GOAL: ${step.systemGoal}

${priorContext ? `CONTEXT FROM PRIOR STEPS:\n${priorContext}\n` : ""}

INSTRUCTIONS:
1. Analyze the user's response (which may include typed text, voice transcription, and/or document extractions)
2. Extract the key business information relevant to this step
3. Provide a brief, encouraging acknowledgment that shows you understood
4. If critical information is missing, ask 1-2 targeted follow-up questions
5. Rate your confidence in the completeness of this step's data

EXTRACTION FIELDS for this step: ${step.extractionFields.join(", ")}

Return a JSON response with these exact fields:
- acknowledgment: 2-3 sentences showing you understood and highlighting key insights
- extractedData: object with string values for each extracted field (use "Not specified" if not mentioned)
- followUpQuestions: array of 0-2 follow-up questions (empty if info is complete)
- stepConfidence: number 0-1 rating how complete the step's information is
- readyToAdvance: boolean — true if enough info to move on, false if critical info missing`;
}

// ── Build prior context from stored responses ────────────────────────────────

export function buildPriorContext(
  responses: Record<string, {
    text?: string;
    transcript?: string;
    files?: Array<{ name: string; extractedText: string }>;
    aiExtraction?: Record<string, string>;
  }>,
): string {
  const parts: string[] = [];

  for (const [stepIdStr, response] of Object.entries(responses)) {
    const stepId = parseInt(stepIdStr, 10);
    const step = STEP_CONFIGS[stepId - 1];
    if (!step) continue;

    const contentParts: string[] = [];
    if (response.text) contentParts.push(`Text: ${response.text}`);
    if (response.transcript) contentParts.push(`Voice: ${response.transcript}`);
    if (response.files?.length) {
      contentParts.push(
        `Documents: ${response.files.map((f) => `[${f.name}] ${f.extractedText.slice(0, 500)}`).join("\n")}`,
      );
    }
    if (response.aiExtraction) {
      contentParts.push(
        `Extracted: ${JSON.stringify(response.aiExtraction)}`,
      );
    }

    if (contentParts.length > 0) {
      parts.push(`Step ${stepId} (${step.title}):\n${contentParts.join("\n")}`);
    }
  }

  return parts.join("\n\n");
}

// ── Process a step with Gemini ───────────────────────────────────────────────

/**
 * Process a user's response at a given discovery step using Gemini 2.5 Pro.
 * Returns structured AI analysis with extracted data and follow-ups.
 */
export async function processDiscoveryStep(
  stepId: number,
  userInput: {
    text?: string;
    transcript?: string;
    fileExtractions?: Array<{ name: string; extractedText: string }>;
  },
  priorResponses: Record<string, {
    text?: string;
    transcript?: string;
    files?: Array<{ name: string; extractedText: string }>;
    aiExtraction?: Record<string, string>;
  }>,
): Promise<StepAIResponse> {
  if (!API_KEY) {
    throw new Error("No Google API key configured");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const priorContext = buildPriorContext(priorResponses);
  const systemPrompt = buildSystemPrompt(stepId, priorContext);

  // Build user message from all input sources
  const userParts: string[] = [];
  if (userInput.text) {
    userParts.push(`[Typed response]\n${userInput.text}`);
  }
  if (userInput.transcript) {
    userParts.push(`[Voice transcription]\n${userInput.transcript}`);
  }
  if (userInput.fileExtractions?.length) {
    for (const file of userInput.fileExtractions) {
      userParts.push(`[Uploaded: ${file.name}]\n${file.extractedText}`);
    }
  }

  const userMessage =
    userParts.length > 0
      ? userParts.join("\n\n")
      : "(No response provided for this step)";

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\n---\n\nUser's response:\n${userMessage}` }],
      },
    ],
    config: {
      temperature: 0.4,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          acknowledgment: { type: Type.STRING },
          extractedData: {
            type: Type.OBJECT,
            properties: Object.fromEntries(
              STEP_CONFIGS[stepId - 1].extractionFields.map((f) => [
                f,
                { type: Type.STRING },
              ]),
            ),
          },
          followUpQuestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          stepConfidence: { type: Type.NUMBER },
          readyToAdvance: { type: Type.BOOLEAN },
        },
        required: [
          "acknowledgment",
          "extractedData",
          "followUpQuestions",
          "stepConfidence",
          "readyToAdvance",
        ],
      },
    },
  });

  const rawText = response.text?.trim() ?? "";

  try {
    const parsed = JSON.parse(rawText) as StepAIResponse;
    return {
      acknowledgment: parsed.acknowledgment || "Thank you for sharing.",
      extractedData: parsed.extractedData || {},
      followUpQuestions: parsed.followUpQuestions || [],
      stepConfidence: Math.max(0, Math.min(1, parsed.stepConfidence || 0.5)),
      readyToAdvance: parsed.readyToAdvance ?? true,
    };
  } catch {
    // Fallback if JSON parsing fails
    return {
      acknowledgment:
        "Thank you for sharing that information. I've noted your response.",
      extractedData: {},
      followUpQuestions: [],
      stepConfidence: 0.3,
      readyToAdvance: true,
    };
  }
}

// ── Generate final summary from all steps ────────────────────────────────────

export async function generateDiscoverySummary(
  responses: Record<string, {
    text?: string;
    transcript?: string;
    files?: Array<{ name: string; extractedText: string }>;
    aiExtraction?: Record<string, string>;
  }>,
): Promise<Record<string, unknown>> {
  if (!API_KEY) {
    throw new Error("No Google API key configured");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const allContext = buildPriorContext(responses);

  const prompt = `You are an expert business analyst. A founder has completed a 6-step discovery session. Analyze ALL their responses below and produce a comprehensive structured summary.

DISCOVERY SESSION RESPONSES:
${allContext}

Extract and synthesize this into a complete business profile. Be specific with numbers when provided. Infer the business model and stage from context clues if not explicitly stated. For any field not covered, use "Not specified".`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: [
      { role: "user", parts: [{ text: prompt }] },
    ],
    config: {
      temperature: 0.3,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          businessDescription: { type: Type.STRING },
          businessModel: { type: Type.STRING },
          product: { type: Type.STRING },
          market: { type: Type.STRING },
          uniqueValue: { type: Type.STRING },
          goals: { type: Type.ARRAY, items: { type: Type.STRING } },
          primaryGoal: { type: Type.STRING },
          investorType: { type: Type.STRING },
          investorDetails: { type: Type.STRING },
          fundingAmount: { type: Type.STRING },
          timeline: { type: Type.STRING },
          useOfFunds: { type: Type.ARRAY, items: { type: Type.STRING } },
          fundingSource: { type: Type.STRING },
          platform: { type: Type.STRING },
          geography: { type: Type.STRING },
          stage: { type: Type.STRING },
          teamSize: { type: Type.STRING },
          traction: { type: Type.ARRAY, items: { type: Type.STRING } },
          existingInvestors: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          // New rich fields from discovery engine
          problemStatement: { type: Type.STRING },
          solutionDescription: { type: Type.STRING },
          competitiveAdvantage: { type: Type.STRING },
          competitors: { type: Type.ARRAY, items: { type: Type.STRING } },
          marketSize: { type: Type.STRING },
          revenueModel: { type: Type.STRING },
          pricing: { type: Type.STRING },
          growthStrategy: { type: Type.STRING },
          keyMetrics: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: [
          "businessDescription",
          "businessModel",
          "product",
          "market",
          "uniqueValue",
          "goals",
          "primaryGoal",
          "investorType",
          "investorDetails",
          "fundingAmount",
          "timeline",
          "useOfFunds",
          "fundingSource",
          "stage",
          "teamSize",
          "traction",
          "confidence",
        ],
      },
    },
  });

  const rawText = response.text?.trim() ?? "";
  return JSON.parse(rawText);
}
