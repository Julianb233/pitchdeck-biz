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

// In-memory store structured to match the subscriptions table schema
const tokenStore = new Map<string, TokenRecord>()

function getOrCreateRecord(userId: string): TokenRecord {
  const existing = tokenStore.get(userId)
  if (existing) return existing

  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()

  const record: TokenRecord = {
    id: crypto.randomUUID(),
    user_id: userId,
    stripe_subscription_id: "demo",
    status: "active",
    current_period_start: periodStart,
    current_period_end: periodEnd,
    token_balance: MONTHLY_TOKEN_ALLOCATION,
    tokens_used: 0,
  }

  tokenStore.set(userId, record)
  return record
}

/**
 * Get the current token balance for a user.
 * Returns data shaped like the subscriptions table row.
 */
export function getTokenBalance(userId: string): {
  token_balance: number
  tokens_used: number
  current_period_end: string
} {
  const record = getOrCreateRecord(userId)
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
export function deductTokens(
  userId: string,
  cost: number,
): { token_balance: number; tokens_used: number } | null {
  const record = getOrCreateRecord(userId)

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
export function resetMonthlyTokens(userId: string): TokenRecord {
  const record = getOrCreateRecord(userId)
  const now = new Date()

  record.token_balance = MONTHLY_TOKEN_ALLOCATION
  record.tokens_used = 0
  record.current_period_start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  record.current_period_end = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()

  tokenStore.set(userId, record)
  return record
}
