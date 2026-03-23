import { NextRequest, NextResponse } from "next/server";
import type { BusinessDiscoverySummary } from "@/types/discovery";
import type { BusinessAnalysis } from "@/lib/types";
import { analysisLimiter, getClientIp, applyRateLimit } from "@/lib/rate-limit";
import type { InvestorType } from "@/lib/deck/investor-profiles";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

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
 * Map free-text investor type and funding source from discovery session
 * to the InvestorType enum used by the deck generator.
 */
function resolveInvestorType(
  investorType?: string,
  fundingSource?: string,
): InvestorType {
  const text = (investorType || "").toLowerCase();
  const source = (fundingSource || "").toLowerCase();

  // Check funding source first — bank/SBA is a distinct profile
  if (source.includes("bank") || source.includes("sba") || source.includes("loan")) {
    return "bank_sba";
  }
  if (source.includes("crowdfund") || source.includes("kickstarter") || source.includes("indiegogo")) {
    return "crowdfunding";
  }

  // Map investor type text to enum
  if (text.includes("venture") || text.includes("vc") || text.includes("series")) {
    return "vc";
  }
  if (text.includes("angel")) {
    return "angel";
  }
  if (text.includes("family office") || text.includes("family-office")) {
    return "family_office";
  }
  if (text.includes("crowd") || text.includes("kickstarter")) {
    return "crowdfunding";
  }

  return "general";
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
    const investorType = resolveInvestorType(
      summary.investorType,
      summary.fundingSource,
    );

    // Persist analysis to Supabase (if authenticated)
    let analysisId: string | null = null;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: row } = await supabase
          .from("analyses")
          .insert({
            user_id: user.id,
            status: "complete",
            confidence: summary.confidence,
            summary: analysis.summary,
            business_model: analysis.businessModel as unknown as Json,
            value_proposition: analysis.valueProposition as unknown as Json,
            market: analysis.market as unknown as Json,
            team: analysis.team as unknown as Json,
            financials: analysis.financials as unknown as Json,
            brand_essence: analysis.brandEssence as unknown as Json,
            raw_input_summary: analysis.rawInputSummary,
          })
          .select("id")
          .single();
        if (row) analysisId = row.id;
      }
    } catch {
      // Non-fatal — analysis save is best-effort
    }

    return NextResponse.json({
      success: true,
      analysis,
      analysisId,
      investorType,
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
