import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PLANS, type PlanId } from "@/lib/pricing";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Look up active subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("id, status, tier, billing_period, token_balance, tokens_allocated, image_credits_used, deck_count_this_period, current_period_start, current_period_end")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (subscription) {
      const tier = (subscription.tier as PlanId) || "pro";
      const planConfig = PLANS[tier];

      return NextResponse.json({
        success: true,
        subscription: {
          plan: tier,
          tier,
          billingPeriod: subscription.billing_period || "monthly",
          status: subscription.status,
          tokenBalance: subscription.token_balance,
          tokensAllocated: subscription.tokens_allocated,
          imageCreditsUsed: subscription.image_credits_used ?? 0,
          imageCreditsLimit: planConfig?.limits.imageCredits ?? 0,
          deckCountThisPeriod: subscription.deck_count_this_period ?? 0,
          decksPerMonth: planConfig?.limits.decksPerMonth ?? 0,
          revisionCycles: planConfig?.limits.revisionCycles ?? 0,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
        },
      });
    }

    return NextResponse.json({
      success: true,
      subscription: {
        plan: "free",
        tier: "free",
        billingPeriod: null,
        status: "inactive",
        tokenBalance: 0,
        tokensAllocated: 0,
        imageCreditsUsed: 0,
        imageCreditsLimit: 0,
        deckCountThisPeriod: 0,
        decksPerMonth: 0,
        revisionCycles: 0,
        currentPeriodStart: null,
        currentPeriodEnd: null,
      },
    });
  } catch (error) {
    console.error("[api/user/subscription] error:", error);
    return NextResponse.json(
      { error: "Failed to load subscription" },
      { status: 500 }
    );
  }
}
