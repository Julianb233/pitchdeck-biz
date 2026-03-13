import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
      .select("id, status, token_balance, tokens_allocated, current_period_start, current_period_end")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (subscription) {
      return NextResponse.json({
        success: true,
        subscription: {
          plan: "pro",
          status: subscription.status,
          tokenBalance: subscription.token_balance,
          tokensAllocated: subscription.tokens_allocated,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
        },
      });
    }

    return NextResponse.json({
      success: true,
      subscription: {
        plan: "free",
        status: "inactive",
        tokenBalance: 0,
        tokensAllocated: 0,
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
