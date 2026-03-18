// =============================================================================
// Feature Gating — Check tier-based access and enforce usage limits
// =============================================================================

import { createAdminClient } from '@/lib/supabase/admin';
import { PLANS, type PlanId } from '@/lib/pricing';

type Feature =
  | 'unlimited_decks'
  | 'promotional_materials'
  | 'business_documents'
  | 'google_slides_export'
  | 'revision_cycles'
  | 'full_business_plan'
  | 'financial_model'
  | 'cap_table'
  | 'term_sheet_guide'
  | 'due_diligence_checklist'
  | 'investor_outreach'
  | 'data_room_guide'
  | 'unlimited_images'
  | 'unlimited_revisions'
  | 'priority_queue'
  | 'pitch_coaching';

const FEATURE_TIER_MAP: Record<Feature, PlanId[]> = {
  unlimited_decks: ['pro', 'founder_suite'],
  promotional_materials: ['pro', 'founder_suite'],
  business_documents: ['pro', 'founder_suite'],
  google_slides_export: ['pro', 'founder_suite'],
  revision_cycles: ['pro', 'founder_suite'],
  full_business_plan: ['founder_suite'],
  financial_model: ['founder_suite'],
  cap_table: ['founder_suite'],
  term_sheet_guide: ['founder_suite'],
  due_diligence_checklist: ['founder_suite'],
  investor_outreach: ['founder_suite'],
  data_room_guide: ['founder_suite'],
  unlimited_images: ['founder_suite'],
  unlimited_revisions: ['founder_suite'],
  priority_queue: ['founder_suite'],
  pitch_coaching: ['founder_suite'],
};

/**
 * Check whether a user's tier grants access to a feature.
 */
export function canAccess(userTier: PlanId | 'free', feature: Feature): boolean {
  if (userTier === 'free') return false;
  const allowedTiers = FEATURE_TIER_MAP[feature];
  return allowedTiers ? allowedTiers.includes(userTier) : false;
}

/**
 * Get how many decks a user can still create this billing period.
 * Returns -1 for unlimited.
 */
export async function getRemainingDecks(userId: string): Promise<number> {
  const supabase = createAdminClient();
  if (!supabase) return 0;

  // Get user's subscription
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('tier, current_period_start, current_period_end')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!sub) return 0;

  const tier = (sub.tier as PlanId) || 'starter';
  const plan = PLANS[tier];
  if (!plan) return 0;

  // Unlimited
  if (plan.limits.decksPerMonth === -1) return -1;

  // Count decks created this period
  const { count } = await supabase
    .from('decks')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', sub.current_period_start)
    .lte('created_at', sub.current_period_end);

  const used = count ?? 0;
  return Math.max(0, plan.limits.decksPerMonth - used);
}

/**
 * Get remaining AI image credits for this billing period.
 * Returns -1 for unlimited.
 */
export async function getRemainingCredits(userId: string): Promise<number> {
  const supabase = createAdminClient();
  if (!supabase) return 0;

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('tier, image_credits_used')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!sub) return 0;

  const tier = (sub.tier as PlanId) || 'starter';
  const plan = PLANS[tier];
  if (!plan) return 0;

  if (plan.limits.imageCredits === -1) return -1;

  const used = (sub.image_credits_used as number) ?? 0;
  return Math.max(0, plan.limits.imageCredits - used);
}

/**
 * Get user's current tier from their active subscription.
 */
export async function getUserTier(userId: string): Promise<PlanId | 'free'> {
  const supabase = createAdminClient();
  if (!supabase) return 'free';

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('tier')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!sub) return 'free';
  return (sub.tier as PlanId) || 'free';
}
