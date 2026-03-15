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
 * Returns free-tier defaults if no active subscription exists in the database.
 */
export async function getTokenBalance(userId: string): Promise<{
  token_balance: number
  tokens_used: number
  current_period_end: string
}> {
  const supabase = createAdminClient();

  if (!supabase) {
    console.warn('[tokens] Supabase admin client not configured — returning default token balance');
    return freeTierDefaults();
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .select('token_balance, tokens_allocated, current_period_end')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[tokens] Error fetching token balance:', error);
  }

  if (data) {
    return {
      token_balance: data.token_balance,
      tokens_used: data.tokens_allocated - data.token_balance,
      current_period_end: data.current_period_end,
    };
  }

  // No active subscription found — return free-tier defaults
  return freeTierDefaults();
}

/**
 * Deduct tokens from a user's active subscription balance.
 * Reads the subscription, checks balance, updates, and logs usage.
 * Returns the updated balance or null if insufficient tokens or no subscription.
 */
export async function deductTokens(
  userId: string,
  cost: number,
): Promise<{ token_balance: number; tokens_used: number } | null> {
  const supabase = createAdminClient();

  if (!supabase) {
    console.warn('[tokens] Supabase admin client not configured — cannot deduct tokens');
    return null;
  }

  const { data: sub, error: fetchError } = await supabase
    .from('subscriptions')
    .select('id, token_balance, tokens_allocated')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    console.error('[tokens] Error fetching subscription for deduction:', fetchError);
    return null;
  }

  if (!sub) {
    // No active subscription — cannot deduct tokens
    return null;
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
    console.error('[tokens] Error updating token balance:', updateError);
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

/**
 * Reset a user's monthly token allocation.
 * Called at the start of a new billing period.
 */
export async function resetMonthlyTokens(userId: string): Promise<void> {
  const supabase = createAdminClient();
  if (!supabase) {
    console.warn('[tokens] Supabase admin client not configured — cannot reset tokens');
    return;
  }

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
    console.error('[tokens] Error resetting monthly tokens:', error);
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function freeTierDefaults() {
  const now = new Date();
  return {
    token_balance: MONTHLY_TOKEN_ALLOCATION,
    tokens_used: 0,
    current_period_end: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
  };
}
