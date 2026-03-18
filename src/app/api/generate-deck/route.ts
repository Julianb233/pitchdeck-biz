import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { BusinessAnalysis, DeckContent } from "@/lib/types";
import { attachImagesToSlides } from "@/lib/ai/slide-image-generator";
import { createClient } from "@/lib/supabase/server";
import { updateDeckContent, updateDeckStatus } from "@/lib/supabase/decks";
import type { Json } from "@/lib/supabase/types";
import { generationLimiter, getClientIp, applyRateLimit } from "@/lib/rate-limit";
import { getInvestorProfile, type InvestorProfile } from "@/lib/deck/investor-profiles";

export const runtime = "nodejs";
export const maxDuration = 60;

const BASE_SYSTEM_PROMPT = `You are an expert pitch deck strategist and copywriter. Given a business analysis, generate compelling pitch deck content.

You MUST return valid JSON matching the exact schema below. Do NOT include any text outside the JSON object.

Schema:
{
  "slides": [
    {
      "slideNumber": number,
      "type": string,
      "title": string,
      "subtitle": string (optional),
      "bulletPoints": string[] (optional, 3-5 items),
      "notes": string (optional, speaker notes),
      "imagePrompt": string (optional, image generation prompt)
    }
  ],
  "sellSheet": {
    "headline": string,
    "subheadline": string,
    "sections": [{ "title": string, "content": string }]
  },
  "onePager": {
    "headline": string,
    "sections": [{ "title": string, "content": string }]
  },
  "brandKit": {
    "colorRationale": string,
    "fontPairing": { "heading": string, "body": string },
    "brandVoice": string,
    "logoDirection": string
  }
}

Guidelines:
- Use specific numbers and metrics from the analysis wherever possible
- Sell sheet should have 4-5 sections summarizing the business for prospects
- One-pager should have 4-5 sections for an executive audience
- Brand kit should suggest fonts, colors, voice, and logo direction that match the brand essence
- Speaker notes should give actionable presentation tips`;

function buildSystemPrompt(profile: InvestorProfile): string {
  const slideTypes = profile.slideOrder.map((t) => `"${t}"`).join(" | ");

  return `${BASE_SYSTEM_PROMPT}

INVESTOR AUDIENCE: ${profile.label}
${profile.systemPromptAddition}

TONE: ${profile.toneGuide}

FINANCIAL FRAMING: ${profile.financialFraming}

KEY METRICS TO HIGHLIGHT: ${profile.keyMetrics.join(", ")}

SLIDE ORDER AND TYPES:
Generate exactly ${profile.slideOrder.length} slides in this order using these slide types: ${slideTypes}
Each slide's "type" field MUST be one of: ${slideTypes}

Write copy that resonates with ${profile.label.toLowerCase()} audiences. Avoid generic language — tailor every slide to what this investor type cares about most.`;
}

function buildUserPrompt(analysis: BusinessAnalysis): string {
  return `Generate a complete pitch deck content package for the following business:

BUSINESS ANALYSIS:
${JSON.stringify(analysis, null, 2)}

Return ONLY the JSON object matching the schema. No markdown, no code fences, no explanation.`;
}

export async function POST(request: NextRequest) {
  // Rate limiting — 10 requests per minute per IP
  const ip = getClientIp(request);
  const limited = applyRateLimit(generationLimiter, ip, "Too many deck generation requests. Please try again later.");
  if (limited) return limited;

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const analysis = body.analysis as BusinessAnalysis;
    const analysisId = (body.analysis_id as string) || null;
    const existingDeckId = (body.deckId as string) || null;
    const investorType = (body.investorType as string) || null;

    if (!analysis || !analysis.summary) {
      return NextResponse.json(
        { error: "Valid business analysis is required" },
        { status: 400 }
      );
    }

    // Resolve investor profile (defaults to "general" for unknown/missing types)
    const investorProfile = getInvestorProfile(investorType);
    const systemPrompt = buildSystemPrompt(investorProfile);

    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: buildUserPrompt(analysis),
        },
      ],
      system: systemPrompt,
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "No text response from AI" },
        { status: 500 }
      );
    }

    let rawText = textBlock.text.trim();
    // Strip markdown code fences if present
    if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }

    const deckContent: DeckContent = JSON.parse(rawText);

    // Basic validation
    if (!deckContent.slides || !Array.isArray(deckContent.slides) || deckContent.slides.length === 0) {
      return NextResponse.json(
        { error: "AI returned invalid deck content: no slides" },
        { status: 500 }
      );
    }

    // Attach generated chart/brand images to each slide
    const industry = analysis.market?.targetAudience ?? analysis.businessModel?.type ?? "technology";
    const description = analysis.summary ?? analysis.brandEssence?.mission ?? "innovative business";
    deckContent.slides = attachImagesToSlides(deckContent.slides, industry, description);

    // ── Persist to Supabase (if authenticated) ──────────────────────
    let savedDeckId: string | null = existingDeckId;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const contentPayload = {
          slides: deckContent.slides as unknown as Json,
          sell_sheet: deckContent.sellSheet as unknown as Json,
          one_pager: deckContent.onePager as unknown as Json,
          brand_kit: deckContent.brandKit as unknown as Json,
        };

        if (existingDeckId) {
          // Update existing deck record created during analysis
          const updated = await updateDeckContent(existingDeckId, contentPayload);
          if (updated) {
            await updateDeckStatus(existingDeckId, "content_generated");
          } else {
            console.error("Failed to update existing deck:", existingDeckId);
          }
        } else {
          // No existing deck — create a new one
          const title =
            deckContent.slides[0]?.title ||
            analysis.valueProposition?.headline ||
            "Untitled Deck";

          const { data: savedRow, error: insertError } = await supabase
            .from("decks")
            .insert({
              user_id: user.id,
              analysis_id: analysisId,
              title,
              ...contentPayload,
              status: "content_generated",
            })
            .select("id")
            .single();

          if (insertError) {
            console.error("Failed to save deck to Supabase:", insertError.message);
          } else {
            savedDeckId = savedRow.id;
          }
        }
      }
    } catch (saveErr) {
      console.error("Supabase deck save error (non-fatal):", saveErr);
    }

    return NextResponse.json({
      success: true,
      deckContent,
      deckId: savedDeckId,
      investorType: investorProfile.type,
      investorLabel: investorProfile.label,
    });
  } catch (error) {
    console.error("Generate deck failed:", error);
    return NextResponse.json(
      {
        error: "Deck generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
