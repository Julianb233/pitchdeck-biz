import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import stripe from "@/lib/stripe";
import { updateSubscriptionPlan } from "@/lib/stripe";
import { PLANS, type PlanId } from "@/lib/pricing";

export const runtime = "nodejs";

/**
 * GET /api/subscription
 * Returns the current user's subscription status, tier, and limits.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({
        status: "free",
        plan: "free",
        tier: "free",
        message: "Database not configured",
      });
    }

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!sub) {
      return NextResponse.json({
        status: "free",
        plan: "free",
        tier: "free",
        token_balance: 0,
        tokens_allocated: 0,
        image_credits_used: 0,
        deck_count_this_period: 0,
      });
    }

    const tier = (sub.tier as PlanId) || "pro";
    const planConfig = PLANS[tier];

    return NextResponse.json({
      status: sub.status,
      plan: sub.status === "active" ? tier : "free",
      tier,
      billing_period: sub.billing_period || "monthly",
      stripe_subscription_id: sub.stripe_subscription_id,
      token_balance: sub.token_balance,
      tokens_allocated: sub.tokens_allocated,
      image_credits_used: sub.image_credits_used ?? 0,
      image_credits_limit: planConfig?.limits.imageCredits ?? 0,
      deck_count_this_period: sub.deck_count_this_period ?? 0,
      decks_per_month: planConfig?.limits.decksPerMonth ?? 0,
      revision_cycles: planConfig?.limits.revisionCycles ?? 0,
      current_period_start: sub.current_period_start,
      current_period_end: sub.current_period_end,
    });
  } catch (error) {
    console.error("[subscription] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/subscription
 * Upgrade or downgrade the user's subscription tier.
 */
const upgradeSchema = z.object({
  planId: z.enum(["starter", "pro", "founder_suite"]),
  billingPeriod: z.enum(["monthly", "annual"]),
});

export async function PATCH(request: NextRequest) {
  try {
    const user = await getSessionFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = upgradeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { planId, billingPeriod } = parsed.data;

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 },
      );
    }

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id, tier, billing_period")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (!sub?.stripe_subscription_id) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 },
      );
    }

    // Update via Stripe (webhook will sync tier to DB)
    await updateSubscriptionPlan(sub.stripe_subscription_id, planId, billingPeriod);

    return NextResponse.json({
      success: true,
      message: `Subscription updated to ${planId} (${billingPeriod})`,
    });
  } catch (error) {
    console.error("[subscription] PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/subscription
 * Cancels the user's active subscription at period end.
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 },
      );
    }

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (!sub?.stripe_subscription_id) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 },
      );
    }

    try {
      await stripe.subscriptions.update(sub.stripe_subscription_id, {
        cancel_at_period_end: true,
      });
    } catch (stripeError) {
      console.error("[subscription] Stripe cancel error:", stripeError);
      return NextResponse.json(
        { error: "Failed to cancel subscription with payment provider" },
        { status: 500 },
      );
    }

    await supabase
      .from("subscriptions")
      .update({ status: "canceling" })
      .eq("stripe_subscription_id", sub.stripe_subscription_id);

    return NextResponse.json({
      success: true,
      message: "Subscription will be canceled at the end of the current billing period",
    });
  } catch (error) {
    console.error("[subscription] DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 },
    );
  }
}
