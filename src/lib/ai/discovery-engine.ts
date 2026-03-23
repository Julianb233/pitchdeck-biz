/**
 * Discovery Engine — Step configurations and AI helpers for the 6-step
 * guided onboarding flow.
 */

import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY ?? "";

export interface StepConfig {
  id: number;
  title: string;
  openingQuestion: string;
  systemPrompt: string;
  extractionKeys: string[];
}

export const STEP_CONFIGS: StepConfig[] = [
  {
    id: 1,
    title: "Business Overview",
    openingQuestion: "Tell me about your business",
    systemPrompt: `You are an expert pitch deck consultant conducting a discovery session. The user is describing their business overview. Extract key information about what they do, the problem they solve, and what makes them different. Be encouraging and conversational.`,
    extractionKeys: [
      "businessName",
      "industry",
      "description",
      "problemSolved",
      "differentiator",
    ],
  },
  {
    id: 2,
    title: "Problem & Solution",
    openingQuestion: "What problem do you solve?",
    systemPrompt: `You are an expert pitch deck consultant. The user is describing the problem their business solves and their unique solution. Extract the core pain point, how people currently deal with it, and why this solution is superior.`,
    extractionKeys: [
      "coreProblem",
      "currentAlternatives",
      "solutionDescription",
      "uniqueApproach",
    ],
  },
  {
    id: 3,
    title: "Market & Competition",
    openingQuestion: "Who are your customers and competitors?",
    systemPrompt: `You are an expert pitch deck consultant. The user is describing their target market and competitive landscape. Extract information about customer segments, market size, top competitors, and competitive advantages.`,
    extractionKeys: [
      "targetCustomer",
      "marketSize",
      "topCompetitors",
      "competitiveAdvantage",
    ],
  },
  {
    id: 4,
    title: "Business Model",
    openingQuestion: "How do you make money?",
    systemPrompt: `You are an expert pitch deck consultant. The user is describing how their business generates revenue. Extract the revenue model, pricing strategy, unit economics, and customer acquisition approach.`,
    extractionKeys: [
      "revenueModel",
      "pricing",
      "unitEconomics",
      "customerAcquisition",
    ],
  },
  {
    id: 5,
    title: "Traction & Team",
    openingQuestion: "What traction do you have?",
    systemPrompt: `You are an expert pitch deck consultant. The user is sharing their traction metrics, milestones, and team composition. Extract key metrics, notable achievements, business stage, and team details.`,
    extractionKeys: [
      "keyMetrics",
      "milestones",
      "businessStage",
      "teamDescription",
    ],
  },
  {
    id: 6,
    title: "Funding Ask",
    openingQuestion: "What are you raising?",
    systemPrompt: `You are an expert pitch deck consultant. The user is describing their fundraising goals. Extract funding amount, investor type, timeline, planned use of funds, and any existing investors.`,
    extractionKeys: [
      "fundingAmount",
      "investorType",
      "timeline",
      "useOfFunds",
      "existingInvestors",
    ],
  },
];

/**
 * Process a single discovery step using Gemini.
 * Returns an acknowledgment, extracted data, follow-up questions, and confidence.
 */
export async function processStep(
  stepId: number,
  userInput: {
    text?: string;
    transcript?: string;
    fileExtractions?: Array<{ name: string; extractedText: string }>;
  },
): Promise<{
  acknowledgment: string;
  extractedData: Record<string, string>;
  followUpQuestions: string[];
  stepConfidence: number;
  readyToAdvance: boolean;
}> {
  const config = STEP_CONFIGS.find((s) => s.id === stepId);
  if (!config) throw new Error(`Invalid step ID: ${stepId}`);

  if (!API_KEY) {
    // Fallback when no API key is configured
    return {
      acknowledgment: "Thank you for sharing that information! I've captured your response.",
      extractedData: {},
      followUpQuestions: [],
      stepConfidence: 0.5,
      readyToAdvance: true,
    };
  }

  const inputParts: string[] = [];
  if (userInput.text) inputParts.push(`Text input: ${userInput.text}`);
  if (userInput.transcript)
    inputParts.push(`Voice transcript: ${userInput.transcript}`);
  if (userInput.fileExtractions?.length) {
    const fileText = userInput.fileExtractions
      .map((f) => `[${f.name}]: ${f.extractedText}`)
      .join("\n");
    inputParts.push(`Uploaded documents:\n${fileText}`);
  }

  const userContent = inputParts.join("\n\n");

  const prompt = `${config.systemPrompt}

Analyze the user's response and return a JSON object with exactly these fields:
- "acknowledgment": A brief, encouraging 1-2 sentence acknowledgment of what they shared
- "extractedData": An object with keys [${config.extractionKeys.map((k) => `"${k}"`).join(", ")}] and string values extracted from the input. Use "" for missing fields.
- "followUpQuestions": An array of 0-2 follow-up questions if important information is missing
- "stepConfidence": A number 0-1 indicating how complete the information is for this step
- "readyToAdvance": true if enough info was gathered, false if critical data is missing

User's response:
${userContent}`;

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      temperature: 0.4,
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
    },
  });

  const rawText = response.text?.trim() ?? "";

  try {
    const parsed = JSON.parse(rawText);
    return {
      acknowledgment: parsed.acknowledgment ?? "Thanks for sharing!",
      extractedData: parsed.extractedData ?? {},
      followUpQuestions: parsed.followUpQuestions ?? [],
      stepConfidence: typeof parsed.stepConfidence === "number" ? parsed.stepConfidence : 0.5,
      readyToAdvance: parsed.readyToAdvance !== false,
    };
  } catch {
    return {
      acknowledgment: "Thank you for sharing that information!",
      extractedData: {},
      followUpQuestions: [],
      stepConfidence: 0.5,
      readyToAdvance: true,
    };
  }
}
