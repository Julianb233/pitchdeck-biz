import { createAdminClient } from '@/lib/supabase/admin';

export type AssetType = "social-media" | "product-mockup" | "marketing-collateral" | "brand-identity"

export const ASSET_TOKEN_COSTS: Record<AssetType, number> = {
  "social-media": 5,
  "product-mockup": 10,
  "marketing-collateral": 8,
  "brand-identity": 15,
}

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  "social-media": "Social Media",
  "product-mockup": "Product Mockup",
  "marketing-collateral": "Marketing Collateral",
  "brand-identity": "Brand Identity",
}

export const MONTHLY_TOKEN_ALLOCATION = 500

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Get the current token balance for a user from the subscriptions table.
 * Returns default values (500 balance, 0 used) if no subscription exists.
 */
export async function getTokenBalance(userId: string): Promise<{
  token_balance: number
  tokens_used: number
  current_period_end: string
}> {
  const supabase = createAdminClient();

  if (supabase) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('token_balance, tokens_allocated, current_period_end')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      return {
        token_balance: data.token_balance,
        tokens_used: data.tokens_allocated - data.token_balance,
        current_period_end: data.current_period_end,
      };
    }

    if (error) {
      console.error('Error fetching token balance:', error);
    }
  }

  // No subscription found — return defaults
  const now = new Date();
  return {
    token_balance: MONTHLY_TOKEN_ALLOCATION,
    tokens_used: 0,
    current_period_end: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
  };
}

/**
 * Deduct tokens from a user's balance in the subscriptions table.
 * Returns the updated balance or null if insufficient tokens.
 */
export async function deductTokens(
  userId: string,
  cost: number,
): Promise<{ token_balance: number; tokens_used: number } | null> {
  const supabase = createAdminClient();

  if (supabase) {
    const { data: sub, error: fetchError } = await supabase
      .from('subscriptions')
      .select('id, token_balance, tokens_allocated')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching subscription for deduction:', fetchError);
      // No subscription — allow with default balance for free-tier users
      if (MONTHLY_TOKEN_ALLOCATION < cost) return null;
      return {
        token_balance: MONTHLY_TOKEN_ALLOCATION - cost,
        tokens_used: cost,
      };
    }

    if (!sub) {
      // No subscription — allow with default balance for free-tier users
      if (MONTHLY_TOKEN_ALLOCATION < cost) return null;
      return {
        token_balance: MONTHLY_TOKEN_ALLOCATION - cost,
        tokens_used: cost,
      };
    }

    if (sub.token_balance < cost) {
      return null;
    }

    const newBalance = sub.token_balance - cost;
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ token_balance: newBalance })
      .eq('id', sub.id);

    if (updateError) {
      console.error('Error updating token balance:', updateError);
      return null;
    }

    // Log token usage
    await supabase.from('token_usage').insert({
      user_id: userId,
      subscription_id: sub.id,
      tokens_used: cost,
      action: 'asset_generation',
    });

    return {
      token_balance: newBalance,
      tokens_used: sub.tokens_allocated - newBalance,
    };
  }

  // Supabase not configured — allow with default balance
  if (MONTHLY_TOKEN_ALLOCATION < cost) return null;
  return {
    token_balance: MONTHLY_TOKEN_ALLOCATION - cost,
    tokens_used: cost,
  };
}

/**
 * Reset a user's monthly token allocation.
 * Called at the start of a new billing period.
 */
export async function resetMonthlyTokens(userId: string): Promise<void> {
  const supabase = createAdminClient();
  if (!supabase) return;

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

  const { error } = await supabase
    .from('subscriptions')
    .update({
      token_balance: MONTHLY_TOKEN_ALLOCATION,
      tokens_allocated: MONTHLY_TOKEN_ALLOCATION,
      current_period_start: periodStart,
      current_period_end: periodEnd,
    })
    .eq('user_id', userId)
    .eq('status', 'active');

  if (error) {
    console.error('Error resetting monthly tokens:', error);
  }
}
