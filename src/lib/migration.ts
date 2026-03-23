/**
 * V1 Subscriber Migration
 *
 * Handles migration of pre-tier subscribers to the new 3-tier system.
 *
 * Grandfathering rules:
 *   - V1 subscribers are mapped to Pro tier (closest to old single-tier plan)
 *   - They keep their current Stripe price for 12 months (grandfathered)
 *   - They immediately get full Pro-tier limits (50 image credits, unlimited decks, etc.)
 *   - After grandfathering expires, they continue at Pro tier at the current Pro price
 *   - Subscribers can voluntarily upgrade to Founder Suite or downgrade to Starter at any time
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { PLANS, type PlanId } from '@/lib/pricing';

export interface MigrationResult {
  success: boolean;
  migrated: number;
  skipped: number;
  errors: string[];
  details: MigratedSubscriber[];
}

export interface MigratedSubscriber {
  subscriptionId: string;
  userId: string;
  previousTier: string | null;
  newTier: PlanId;
  grandfatheredUntil: string;
  stripeSubscriptionId: string;
}

export interface GrandfatherStatus {
  isGrandfathered: boolean;
  grandfatheredUntil: string | null;
  originalTier: string | null;
  daysRemaining: number;
}

/**
 * Run the V1 subscriber migration.
 * Identifies pre-tier subscribers and maps them to Pro tier with grandfathering.
 */
export async function migrateV1Subscribers(): Promise<MigrationResult> {
  const supabase = createAdminClient();
  const errors: string[] = [];
  const details: MigratedSubscriber[] = [];

  if (!supabase) {
    return { success: false, migrated: 0, skipped: 0, errors: ['Supabase admin client not configured'], details: [] };
  }

  // 1. Find all active V1 subscribers (not yet migrated)
  // Migration 008 columns not in generated types — use any cast
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: v1Subs, error: fetchError } = await (supabase
    .from('subscriptions') as any)
    .select('id, user_id, tier, stripe_subscription_id, stripe_customer_id, token_balance, tokens_allocated, created_at')
    .eq('status', 'active')
    .eq('migrated_from_v1', false)
    .is('v1_migrated_at', null) as { data: Array<{ id: string; user_id: string; tier: string; stripe_subscription_id: string; stripe_customer_id: string; token_balance: number; tokens_allocated: number; created_at: string }> | null; error: { message: string } | null };

  if (fetchError) {
    return { success: false, migrated: 0, skipped: 0, errors: [`Failed to fetch V1 subscribers: ${fetchError.message}`], details: [] };
  }

  if (!v1Subs || v1Subs.length === 0) {
    return { success: true, migrated: 0, skipped: 0, errors: [], details: [] };
  }

  const now = new Date();
  const grandfatheredUntil = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  const proLimits = PLANS.pro.limits;

  let migrated = 0;
  let skipped = 0;

  for (const sub of v1Subs) {
    // Determine the target tier based on what they're paying
    const targetTier: PlanId = 'pro';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase
      .from('subscriptions') as any)
      .update({
        migrated_from_v1: true,
        v1_migrated_at: now.toISOString(),
        v1_assigned_tier: targetTier,
        tier: targetTier,
        grandfathered_until: grandfatheredUntil.toISOString(),
        tokens_allocated: proLimits.brandingTokens,
        token_balance: Math.max(sub.token_balance, proLimits.brandingTokens),
      })
      .eq('id', sub.id) as { error: { message: string } | null };

    if (updateError) {
      errors.push(`Failed to migrate subscription ${sub.id}: ${updateError.message}`);
      skipped++;
      continue;
    }

    migrated++;
    details.push({
      subscriptionId: sub.id,
      userId: sub.user_id,
      previousTier: sub.tier,
      newTier: targetTier,
      grandfatheredUntil: grandfatheredUntil.toISOString(),
      stripeSubscriptionId: sub.stripe_subscription_id,
    });
  }

  return {
    success: errors.length === 0,
    migrated,
    skipped,
    errors,
    details,
  };
}

/**
 * Check grandfathering status for a specific user.
 */
export async function getGrandfatherStatus(userId: string): Promise<GrandfatherStatus> {
  const supabase = createAdminClient();

  if (!supabase) {
    return { isGrandfathered: false, grandfatheredUntil: null, originalTier: null, daysRemaining: 0 };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = (await (supabase
    .from('subscriptions') as any)
    .select('grandfathered_until, v1_assigned_tier, migrated_from_v1')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()) as { data: { grandfathered_until: string | null; v1_assigned_tier: string | null; migrated_from_v1: boolean } | null; error: { message: string } | null };

  if (error || !data) {
    return { isGrandfathered: false, grandfatheredUntil: null, originalTier: null, daysRemaining: 0 };
  }

  const now = new Date();
  const gfUntil = data.grandfathered_until ? new Date(data.grandfathered_until) : null;
  const isGrandfathered = gfUntil !== null && gfUntil > now;
  const daysRemaining = isGrandfathered
    ? Math.max(0, Math.ceil((gfUntil!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  return {
    isGrandfathered,
    grandfatheredUntil: data.grandfathered_until,
    originalTier: data.v1_assigned_tier,
    daysRemaining,
  };
}

/**
 * Get migration statistics (admin dashboard).
 */
export async function getMigrationStats(): Promise<{
  totalV1Migrated: number;
  totalGrandfathered: number;
  totalActive: number;
  tierBreakdown: Record<string, number>;
}> {
  const supabase = createAdminClient();

  if (!supabase) {
    return { totalV1Migrated: 0, totalGrandfathered: 0, totalActive: 0, tierBreakdown: {} };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sub = supabase.from('subscriptions') as any;
  const [migratedResult, grandfatheredResult, activeResult] = await Promise.all([
    sub
      .select('id', { count: 'exact', head: true })
      .eq('migrated_from_v1', true) as Promise<{ count: number | null }>,
    (supabase.from('subscriptions') as any)
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .not('grandfathered_until', 'is', null)
      .gt('grandfathered_until', new Date().toISOString()) as Promise<{ count: number | null }>,
    (supabase.from('subscriptions') as any)
      .select('tier')
      .eq('status', 'active') as Promise<{ data: Array<{ tier: string }> | null }>,
  ]);

  const tierBreakdown: Record<string, number> = {};
  if (activeResult.data) {
    for (const row of activeResult.data) {
      const tier = row.tier || 'unknown';
      tierBreakdown[tier] = (tierBreakdown[tier] || 0) + 1;
    }
  }

  return {
    totalV1Migrated: migratedResult.count ?? 0,
    totalGrandfathered: grandfatheredResult.count ?? 0,
    totalActive: activeResult.data?.length ?? 0,
    tierBreakdown,
  };
}
