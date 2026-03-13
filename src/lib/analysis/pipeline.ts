import Anthropic from "@anthropic-ai/sdk";
import { v4 as uuidv4 } from "uuid";
import { BusinessAnalysisSchema, type BusinessAnalysis } from "./schema";
import { logger } from "./logger";

let anthropicClient: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY environment variable is required for business analysis"
      );
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

const SYSTEM_PROMPT = `You are a senior business analyst specializing in startup and company analysis for pitch deck creation. Your job is to extract structured business insights from the provided information.

Analyze the input carefully and extract:
1. **Business Model** — Revenue model type, revenue streams, cost structure, key partners, key activities
2. **Value Proposition** — One-liner, expanded description, pain points addressed, solutions offered, unique differentiators
3. **Market Analysis** — Target audience, market size (TAM/SAM/SOM if available), competitors, trends, positioning
4. **Team** — Team members with roles and backgrounds, team strengths, advisors
5. **Financials** — Stage, funding history, current ask, key metrics, projections
6. **Brand Essence** — Mission, vision, tone, core values, tagline

If certain information is not available in the input, make reasonable inferences where possible and mark them. For completely unknown fields, use sensible defaults and add a warning.

Respond ONLY with valid JSON matching the required schema. Do not include any other text.`;

interface PipelineInput {
  textContent?: string;
  imageBase64?: string[];
  transcription?: string;
  additionalContext?: string;
}

/**
 * Run the full AI business analysis pipeline.
 */
export async function analyzeBusinessInfo(
  input: PipelineInput
): Promise<BusinessAnalysis> {
  logger.info("Starting business analysis pipeline");

  const anthropic = getAnthropic();

  // Build message content
  const contentParts: Anthropic.ContentBlockParam[] = [];

  // Add text content
  const textSections: string[] = [];
  if (input.textContent) {
    textSections.push(`## Extracted Document Content\n${input.textContent}`);
  }
  if (input.transcription) {
    textSections.push(`## Audio Transcription\n${input.transcription}`);
  }
  if (input.additionalContext) {
    textSections.push(`## Additional Context\n${input.additionalContext}`);
  }

  if (textSections.length > 0) {
    contentParts.push({
      type: "text",
      text: textSections.join("\n\n---\n\n"),
    });
  }

  // Add images for vision analysis
  if (input.imageBase64 && input.imageBase64.length > 0) {
    for (const img of input.imageBase64) {
      const [header, data] = img.split(",");
      const mediaType = header
        .replace("data:", "")
        .replace(";base64", "") as Anthropic.Base64ImageSource["media_type"];
      contentParts.push({
        type: "image",
        source: {
          type: "base64",
          media_type: mediaType,
          data,
        },
      });
    }
    contentParts.push({
      type: "text",
      text: "The above images are part of the business materials. Please analyze them along with any text content provided.",
    });
  }

  if (contentParts.length === 0) {
    throw new Error("No input content provided for analysis");
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: contentParts,
        },
      ],
    });

    // Extract JSON from response
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude");
    }

    const rawJson = textBlock.text.trim();
    // Handle potential markdown code blocks
    const jsonStr = rawJson.startsWith("```")
      ? rawJson.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
      : rawJson;

    const parsed = JSON.parse(jsonStr);

    // Augment with metadata
    const result: BusinessAnalysis = BusinessAnalysisSchema.parse({
      ...parsed,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      status: parsed.confidence >= 0.5 ? "complete" : "partial",
      rawInputSummary: buildInputSummary(input),
    });

    logger.info("Business analysis complete", {
      id: result.id,
      status: result.status,
      confidence: result.confidence,
    });

    return result;
  } catch (error) {
    logger.error("Business analysis pipeline failed", {
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof Error && error.message.includes("parse")) {
      throw new Error("Failed to parse AI response into valid analysis schema");
    }
    throw error;
  }
}

function buildInputSummary(input: PipelineInput): string {
  const parts: string[] = [];
  if (input.textContent) {
    parts.push(`Document text: ${input.textContent.length} chars`);
  }
  if (input.imageBase64?.length) {
    parts.push(`Images: ${input.imageBase64.length}`);
  }
  if (input.transcription) {
    parts.push(`Transcription: ${input.transcription.length} chars`);
  }
  if (input.additionalContext) {
    parts.push(`Additional context provided`);
  }
  return parts.join(", ");
}
