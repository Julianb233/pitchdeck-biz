import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analysisLimiter, getClientIp, applyRateLimit } from "@/lib/rate-limit";
import { generateDiscoverySummary } from "@/lib/ai/discovery-engine";
import type { BusinessDiscoverySummary } from "@/types/discovery";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/discovery/complete
 *
 * Finalize a discovery session: generate the AI summary from all step
 * responses, persist it, and return the summary for user review.
 *
 * Body: {
 *   sessionId: string,
 *   responses: Record<string, { text?, transcript?, files?, aiExtraction? }>
 * }
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = applyRateLimit(
    analysisLimiter,
    ip,
    "Too many requests. Please try again later.",
  );
  if (limited) return limited;

  try {
    const body = await request.json();
    const { sessionId, responses } = body as {
      sessionId: string;
      responses?: Record<
        string,
        {
          text?: string;
          transcript?: string;
          files?: Array<{ name: string; extractedText: string }>;
          aiExtraction?: Record<string, string>;
        }
      >;
    };

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 },
      );
    }

    // Load responses from Supabase if not provided in body
    let allResponses = responses;
    if (!allResponses) {
      try {
        const supabase = await createClient();
        const { data: session } = await supabase
          .from("discovery_sessions")
          .select("responses")
          .eq("id", sessionId)
          .single();

        if (session?.responses) {
          allResponses = session.responses as typeof allResponses;
        }
      } catch {
        // Fall through
      }
    }

    if (!allResponses || Object.keys(allResponses).length === 0) {
      return NextResponse.json(
        { error: "No step responses found for this session" },
        { status: 400 },
      );
    }

    // Update session status to summarizing
    try {
      const supabase = await createClient();
      await supabase
        .from("discovery_sessions")
        .update({ status: "summarizing" })
        .eq("id", sessionId);
    } catch {
      // Non-fatal
    }

    // Generate summary with Gemini
    const summaryData = await generateDiscoverySummary(allResponses);

    // Cast and validate summary shape
    const summary: BusinessDiscoverySummary = {
      businessDescription: (summaryData.businessDescription as string) || "Not specified",
      businessModel: (summaryData.businessModel as string) || "Not specified",
      product: (summaryData.product as string) || "Not specified",
      market: (summaryData.market as string) || "Not specified",
      uniqueValue: (summaryData.uniqueValue as string) || "Not specified",
      goals: (summaryData.goals as string[]) || [],
      primaryGoal: (summaryData.primaryGoal as string) || "Raise funding",
      investorType: (summaryData.investorType as string) || "Not specified",
      investorDetails: (summaryData.investorDetails as string) || "Not specified",
      fundingAmount: (summaryData.fundingAmount as string) || "Not specified",
      timeline: (summaryData.timeline as string) || "Not specified",
      useOfFunds: (summaryData.useOfFunds as string[]) || [],
      fundingSource: (summaryData.fundingSource as string) || "Not specified",
      platform: (summaryData.platform as string) || undefined,
      geography: (summaryData.geography as string) || undefined,
      stage: (summaryData.stage as string) || "Not specified",
      teamSize: (summaryData.teamSize as string) || "Not specified",
      traction: (summaryData.traction as string[]) || [],
      existingInvestors: (summaryData.existingInvestors as string) || undefined,
      confidence: (summaryData.confidence as number) || 0.5,
    };

    // Persist summary to Supabase
    try {
      const supabase = await createClient();
      await supabase
        .from("discovery_sessions")
        .update({
          summary: summaryData,
          status: "confirmed",
          current_step: 7,
        })
        .eq("id", sessionId);
    } catch {
      // Non-fatal
    }

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("Discovery complete failed:", error);
    return NextResponse.json(
      {
        error: "Summary generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
