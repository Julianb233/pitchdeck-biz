import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import stripe from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * GET /api/subscription
 * Returns the current user's subscription status and details.
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
        token_balance: 0,
        tokens_allocated: 0,
      });
    }

    return NextResponse.json({
      status: sub.status,
      plan: sub.status === "active" ? "pro" : "free",
      stripe_subscription_id: sub.stripe_subscription_id,
      token_balance: sub.token_balance,
      tokens_allocated: sub.tokens_allocated,
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

    // Cancel at period end so user keeps access until their billing period ends
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

    // Update local record
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
