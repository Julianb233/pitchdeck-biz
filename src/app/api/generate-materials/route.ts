import { NextRequest, NextResponse } from "next/server";
import type { BusinessAnalysis } from "@/lib/types";
import type { MaterialType } from "@/types/promotional";
import { MATERIAL_TYPE_META } from "@/types/promotional";
import { getUserTier, meetsMinimumTier } from "@/lib/feature-gate";
import { deductTokens, getTokenBalance } from "@/lib/tokens";
import {
  createRateLimiter,
  getClientIp,
  applyRateLimit,
} from "@/lib/rate-limit";
import {
  generateSocialMediaKit,
  generateEmailTemplates,
  generateAdCreatives,
  generatePressKit,
  generateWebsiteOnePager,
  generateTradeShowMaterials,
} from "@/lib/generators/promotional";

export const runtime = "nodejs";
export const maxDuration = 120;

const materialsLimiter = createRateLimiter("materials", {
  maxRequests: 3,
  windowMs: 60_000,
});

const VALID_TYPES = new Set<string>(Object.keys(MATERIAL_TYPE_META));

export async function POST(request: NextRequest) {
  // Rate limit
  const ip = getClientIp(request);
  const limited = applyRateLimit(
    materialsLimiter,
    ip,
    "Too many material generation requests. Please try again later.",
  );
  if (limited) return limited;

  try {
    // Authenticate and check tier
    const tierInfo = await getUserTier();
    if (!tierInfo) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    if (!meetsMinimumTier(tierInfo.tier, "pro")) {
      return NextResponse.json(
        {
          error:
            "Promotional materials require a Pro or Founder Suite subscription.",
          requiredTier: "pro",
          currentTier: tierInfo.tier,
        },
        { status: 403 },
      );
    }

    // Parse body
    const body = await request.json();
    const {
      materialType,
      analysis,
      brandColors,
    } = body as {
      materialType?: string;
      analysis?: BusinessAnalysis;
      brandColors?: string[];
    };

    // Validate material type
    if (!materialType || !VALID_TYPES.has(materialType)) {
      return NextResponse.json(
        {
          error: `Invalid material type. Must be one of: ${[...VALID_TYPES].join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Validate analysis
    if (!analysis || !analysis.summary) {
      return NextResponse.json(
        { error: "Valid business analysis is required" },
        { status: 400 },
      );
    }

    const validatedType = materialType as MaterialType;
    const meta = MATERIAL_TYPE_META[validatedType];

    // Validate brand colors
    const validatedColors = Array.isArray(brandColors)
      ? brandColors
          .filter(
            (c): c is string =>
              typeof c === "string" && /^#[0-9a-fA-F]{6}$/.test(c),
          )
          .slice(0, 6)
      : undefined;

    // Deduct tokens
    const deductResult = await deductTokens(tierInfo.userId, meta.tokenCost);
    if (!deductResult) {
      const balance = await getTokenBalance(tierInfo.userId);
      return NextResponse.json(
        {
          error: `Insufficient tokens. Need ${meta.tokenCost}, have ${balance.token_balance}.`,
        },
        { status: 402 },
      );
    }

    // Generate material based on type
    let content: Record<string, unknown>;

    switch (validatedType) {
      case "social-media-kit": {
        const kit = await generateSocialMediaKit(analysis, validatedColors);
        content = kit as unknown as Record<string, unknown>;
        break;
      }
      case "email-templates": {
        const emails = await generateEmailTemplates(analysis);
        content = emails as unknown as Record<string, unknown>;
        break;
      }
      case "ad-creatives": {
        const ads = await generateAdCreatives(analysis, validatedColors);
        content = ads as unknown as Record<string, unknown>;
        break;
      }
      case "press-kit": {
        const press = await generatePressKit(analysis);
        content = press as unknown as Record<string, unknown>;
        break;
      }
      case "website-one-pager": {
        const onePager = await generateWebsiteOnePager(
          analysis,
          validatedColors,
        );
        content = onePager as unknown as Record<string, unknown>;
        break;
      }
      case "trade-show": {
        const tradeShow = await generateTradeShowMaterials(
          analysis,
          validatedColors,
        );
        content = tradeShow as unknown as Record<string, unknown>;
        break;
      }
      default:
        return NextResponse.json(
          { error: "Unsupported material type" },
          { status: 400 },
        );
    }

    return NextResponse.json({
      success: true,
      material: {
        type: validatedType,
        title: meta.label,
        content,
        exportFormats: meta.exportFormats,
      },
      tokensUsed: meta.tokenCost,
      tokensRemaining: deductResult.token_balance,
    });
  } catch (error) {
    console.error("Generate materials failed:", error);
    return NextResponse.json(
      {
        error: "Material generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
