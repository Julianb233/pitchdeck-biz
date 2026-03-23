import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserTier, meetsMinimumTier } from "@/lib/feature-gate";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const tierInfo = await getUserTier();
    if (!tierInfo) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check access: Founder Suite includes 1 session/month, others need purchase
    const hasFounderAccess = meetsMinimumTier(tierInfo.tier, "founder_suite");

    if (!hasFounderAccess) {
      // Check if user has purchased a pitch coach add-on
      const supabase = await createClient();
      const { data: purchase } = await supabase
        .from("addon_purchases")
        .select("id, used")
        .eq("user_id", tierInfo.userId)
        .eq("addon_id", "pitch_coach")
        .eq("used", false)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!purchase) {
        return NextResponse.json(
          {
            error: "Pitch coaching requires a Founder Suite subscription or a purchased session.",
            requiresPurchase: true,
            addonId: "pitch_coach",
            price: 49,
          },
          { status: 403 }
        );
      }

      // Mark the session as used
      await supabase
        .from("addon_purchases")
        .update({ used: true, used_at: new Date().toISOString() })
        .eq("id", purchase.id);
    }

    // Parse deck slides from request body
    const body = await request.json().catch(() => ({}));
    const slides = body.slides ?? [];

    // Generate session ID
    const sessionId = `pc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    return NextResponse.json({
      success: true,
      sessionId,
      userId: tierInfo.userId,
      tier: tierInfo.tier,
      slidesCount: slides.length,
      config: {
        maxSlidesPerSession: 20,
        feedbackModel: "gemini-2.5-pro",
        scoringCategories: [
          "clarity",
          "confidence",
          "pacing",
          "contentCoverage",
        ],
      },
    });
  } catch (error) {
    console.error("[pitch-coach/start] Session init failed:", error);
    return NextResponse.json(
      { error: "Failed to initialize coaching session" },
      { status: 500 }
    );
  }
}
