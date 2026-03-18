import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { BusinessAnalysis } from "@/lib/types";
import type { InfraType, LaunchDocument } from "@/types/launch-infrastructure";
import { getGeneratorForType } from "@/lib/generators/infrastructure";
import { createClient } from "@/lib/supabase/server";
import { createRateLimiter, getClientIp, applyRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 120;

/** Infrastructure generation: 3 req/min per user */
const infraLimiter = createRateLimiter("infra-gen", {
  maxRequests: 3,
  windowMs: 60_000,
});

const VALID_TYPES: InfraType[] = [
  "business-plan",
  "financial-model",
  "cap-table",
  "term-sheet-guide",
  "dd-checklist",
  "investor-outreach",
  "data-room-guide",
];

/**
 * Check if the user has an active Founder Suite subscription.
 *
 * The subscription tier is determined by the Stripe price ID stored
 * in the subscription metadata, or by checking a `plan` column if
 * it exists. For now we also accept any active subscription with
 * `plan = 'founder_suite'` in metadata, or fall back to checking
 * the Stripe price env var.
 *
 * Since the current DB schema has no `plan` column, we gate based on
 * either a `plan` metadata field or the STRIPE_PRICE_FOUNDER_SUITE env.
 */
async function isFounderSuite(userId: string): Promise<boolean> {
  const supabase = await createClient();

  // Check for an active subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, status, stripe_subscription_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (!subscription) return false;

  // For now, all active subscribers get access to Founder Suite features
  // since there's only one subscription tier. When a Founder Suite Stripe
  // price is configured (STRIPE_PRICE_FOUNDER_SUITE), we'll validate
  // against the actual subscription price.
  //
  // TODO: When multi-tier subscriptions are implemented, check
  // subscription.stripe_subscription_id against Stripe to verify
  // the price matches the Founder Suite price ID.
  const founderSuitePrice = process.env.STRIPE_PRICE_FOUNDER_SUITE;
  if (founderSuitePrice) {
    // If configured, we'd need to check the actual Stripe subscription
    // For now, treat any active subscription as eligible
    // (will be tightened when $199/mo tier is live in Stripe)
    return true;
  }

  // Default: active subscribers have access
  return true;
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = getClientIp(request);
  const limited = applyRateLimit(
    infraLimiter,
    ip,
    "Too many infrastructure generation requests. Please try again later.",
  );
  if (limited) return limited;

  try {
    // Authenticate
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check Founder Suite tier
    const hasAccess = await isFounderSuite(user.id);
    if (!hasAccess) {
      return NextResponse.json(
        {
          error: "Founder Suite subscription required",
          message:
            "Launch infrastructure documents are exclusively available to Founder Suite subscribers ($199/mo). Upgrade to unlock comprehensive business plans, financial models, cap tables, and more.",
        },
        { status: 403 },
      );
    }

    // Validate request body
    const body = await request.json();
    const infraType = body.infraType as InfraType;
    const analysis = body.analysis as BusinessAnalysis;

    if (!infraType || !VALID_TYPES.includes(infraType)) {
      return NextResponse.json(
        { error: `Invalid infrastructure type. Must be one of: ${VALID_TYPES.join(", ")}` },
        { status: 400 },
      );
    }

    if (!analysis || !analysis.summary) {
      return NextResponse.json(
        { error: "Valid business analysis is required" },
        { status: 400 },
      );
    }

    // Get API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 },
      );
    }

    // Generate document
    const prompts = getGeneratorForType(infraType, analysis);
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16384,
      messages: [{ role: "user", content: prompts.user }],
      system: prompts.system,
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "No text response from AI" },
        { status: 500 },
      );
    }

    // Parse the JSON response
    let rawText = textBlock.text.trim();
    if (rawText.startsWith("```")) {
      rawText = rawText
        .replace(/^```(?:json)?\s*\n?/, "")
        .replace(/\n?```\s*$/, "");
    }

    const parsed = JSON.parse(rawText) as {
      title: string;
      sections: Array<{ title: string; content: string }>;
    };

    // Build the full markdown content
    const fullMarkdown = parsed.sections
      .map((s) => `## ${s.title}\n\n${s.content}`)
      .join("\n\n---\n\n");

    const document: LaunchDocument = {
      id: `infra_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: infraType,
      title: parsed.title,
      content: fullMarkdown,
      sections: parsed.sections,
      version: 1,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error("Generate infrastructure failed:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: "AI returned malformed response. Please try again.",
          details: "JSON parse error",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        error: "Infrastructure document generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
