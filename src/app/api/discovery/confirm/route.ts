import { NextRequest, NextResponse } from "next/server";
import type { BusinessDiscoverySummary } from "@/types/discovery";
import type { BusinessAnalysis } from "@/lib/types";
import { analysisLimiter, getClientIp, applyRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Transform a BusinessDiscoverySummary into the BusinessAnalysis shape
 * expected by the /api/generate-deck route.
 */
function summaryToAnalysis(summary: BusinessDiscoverySummary): BusinessAnalysis {
  return {
    id: `discovery-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "complete",
    confidence: summary.confidence,
    summary: summary.businessDescription,
    businessModel: {
      type: summary.businessModel,
      revenueStreams: [summary.product],
    },
    valueProposition: {
      headline: summary.uniqueValue,
      description: summary.businessDescription,
      painPoints: [],
      solutions: [summary.product],
      uniqueDifferentiators: [summary.uniqueValue],
    },
    market: {
      targetAudience: summary.market,
      positioning: summary.uniqueValue,
    },
    team: {
      members: summary.teamSize
        ? [{ name: "Founding Team", role: summary.teamSize }]
        : [],
    },
    financials: {
      stage: summary.stage,
      currentAsk: summary.fundingAmount,
      fundingHistory: summary.existingInvestors
        ? [summary.existingInvestors]
        : undefined,
      keyMetrics: summary.traction.map((t) => ({
        label: "Traction",
        value: t,
      })),
    },
    brandEssence: {
      mission: summary.businessDescription,
      tone: "professional",
    },
    rawInputSummary: `Discovery session: ${summary.primaryGoal}. Targeting ${summary.investorType}. Raising ${summary.fundingAmount} in ${summary.timeline}. Funds for: ${summary.useOfFunds.join(", ")}.`,
  };
}

/**
 * POST /api/discovery/confirm
 *
 * User confirms the summary. Transforms it into a BusinessAnalysis
 * and returns the payload ready for /api/generate-deck.
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
    const body = await request.json();
    const { summary } = body as { summary: BusinessDiscoverySummary };

    if (!summary || !summary.businessDescription) {
      return NextResponse.json(
        { error: "A valid BusinessDiscoverySummary is required" },
        { status: 400 }
      );
    }

    const analysis = summaryToAnalysis(summary);

    return NextResponse.json({
      success: true,
      analysis,
      investorType: summary.investorType,
      fundingSource: summary.fundingSource,
    });
  } catch (error) {
    console.error("Discovery confirm failed:", error);
    return NextResponse.json(
      {
        error: "Confirmation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
