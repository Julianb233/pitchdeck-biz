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

// ── Types matching Supabase subscriptions table schema ──────────────────────

interface TokenRecord {
  id: string
  user_id: string
  stripe_subscription_id: string
  status: string
  current_period_start: string
  current_period_end: string
  token_balance: number
  tokens_used: number
}

// ── In-memory fallback store ────────────────────────────────────────────────

const tokenStore = new Map<string, TokenRecord>()

function createDefaultRecord(userId: string): TokenRecord {
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()

  return {
    id: crypto.randomUUID(),
    user_id: userId,
    stripe_subscription_id: "demo",
    status: "active",
    current_period_start: periodStart,
    current_period_end: periodEnd,
    token_balance: MONTHLY_TOKEN_ALLOCATION,
    tokens_used: 0,
  }
}

function getOrCreateRecordInMemory(userId: string): TokenRecord {
  const existing = tokenStore.get(userId)
  if (existing) return existing

  const record = createDefaultRecord(userId)
  tokenStore.set(userId, record)
  return record
}

// ── Supabase helpers ────────────────────────────────────────────────────────

function isSupabaseConfigured(): boolean {
  return createAdminClient() !== null;
}

async function getSubscriptionFromDb(userId: string): Promise<TokenRecord | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('subscriptions')
    .select('id, user_id, stripe_subscription_id, status, current_period_start, current_period_end, token_balance, tokens_allocated')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching subscription from Supabase:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    user_id: data.user_id,
    stripe_subscription_id: data.stripe_subscription_id,
    status: data.status,
    current_period_start: data.current_period_start,
    current_period_end: data.current_period_end,
    token_balance: data.token_balance,
    tokens_used: data.tokens_allocated - data.token_balance,
  };
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Get the current token balance for a user.
 * Tries Supabase first, falls back to in-memory store.
 */
export async function getTokenBalance(userId: string): Promise<{
  token_balance: number
  tokens_used: number
  current_period_end: string
}> {
  if (isSupabaseConfigured()) {
    const dbRecord = await getSubscriptionFromDb(userId);
    if (dbRecord) {
      return {
        token_balance: dbRecord.token_balance,
        tokens_used: dbRecord.tokens_used,
        current_period_end: dbRecord.current_period_end,
      };
    }
  }

  // Fallback to in-memory
  const record = getOrCreateRecordInMemory(userId)
  return {
    token_balance: record.token_balance,
    tokens_used: record.tokens_used,
    current_period_end: record.current_period_end,
  }
}

/**
 * Synchronous version for backward compatibility where await isn't possible.
 * Uses in-memory store only.
 */
export function getTokenBalanceSync(userId: string): {
  token_balance: number
  tokens_used: number
  current_period_end: string
} {
  const record = getOrCreateRecordInMemory(userId)
  return {
    token_balance: record.token_balance,
    tokens_used: record.tokens_used,
    current_period_end: record.current_period_end,
  }
}

/**
 * Deduct tokens from a user's balance.
 * Returns the updated balance or null if insufficient tokens.
 */
export async function deductTokens(
  userId: string,
  cost: number,
): Promise<{ token_balance: number; tokens_used: number } | null> {
  const supabase = createAdminClient();

  if (supabase) {
    // Try Supabase first
    const { data: sub, error: fetchError } = await supabase
      .from('subscriptions')
      .select('id, token_balance, tokens_allocated')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!fetchError && sub) {
      if (sub.token_balance < cost) {
        return null;
      }

      const newBalance = sub.token_balance - cost;
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ token_balance: newBalance })
        .eq('id', sub.id);

      if (updateError) {
        console.error('Error updating token balance in Supabase:', updateError);
        // Fall through to in-memory
      } else {
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
    }
  }

  // Fallback to in-memory
  const record = getOrCreateRecordInMemory(userId)
  if (record.token_balance < cost) {
    return null
  }

  record.token_balance -= cost
  record.tokens_used += cost
  tokenStore.set(userId, record)

  return {
    token_balance: record.token_balance,
    tokens_used: record.tokens_used,
  }
}

/**
 * Reset a user's monthly token allocation.
 * Called at the start of a new billing period.
 */
export async function resetMonthlyTokens(userId: string): Promise<TokenRecord> {
  const supabase = createAdminClient();

  if (supabase) {
    const now = new Date()
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()

    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        token_balance: MONTHLY_TOKEN_ALLOCATION,
        tokens_allocated: MONTHLY_TOKEN_ALLOCATION,
        current_period_start: periodStart,
        current_period_end: periodEnd,
      })
      .eq('user_id', userId)
      .eq('status', 'active')
      .select()
      .maybeSingle();

    if (!error && data) {
      return {
        id: data.id,
        user_id: data.user_id,
        stripe_subscription_id: data.stripe_subscription_id,
        status: data.status,
        current_period_start: data.current_period_start,
        current_period_end: data.current_period_end,
        token_balance: data.token_balance,
        tokens_used: 0,
      };
    }

    if (error) {
      console.error('Error resetting tokens in Supabase:', error);
    }
  }

  // Fallback to in-memory
  const record = getOrCreateRecordInMemory(userId)
  const now = new Date()

  record.token_balance = MONTHLY_TOKEN_ALLOCATION
  record.tokens_used = 0
  record.current_period_start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  record.current_period_end = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()

  tokenStore.set(userId, record)
  return record
}
