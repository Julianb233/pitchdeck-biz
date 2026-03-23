/**
 * Feature gating utility for tiered access control.
 *
 * Tiers (aligned with pricing.ts PlanId and subscriptions.tier column):
 *   - "starter"       — Starter plan ($29/mo): 1 deck/mo, basic exports
 *   - "pro"           — Pro plan ($79/mo): unlimited decks, promo materials, business docs
 *   - "founder_suite" — Founder Suite ($199/mo): everything + infrastructure docs, unlimited credits
 *
 * Users without an active subscription are treated as having no tier (null).
 */

import { createClient } from "@/lib/supabase/server";
import { type PlanId, PLANS } from "@/lib/pricing";

export type UserTier = PlanId; // "starter" | "pro" | "founder_suite"

export interface TierInfo {
  tier: UserTier;
  userId: string;
  deckCountThisPeriod: number;
  imageCreditsUsed: number;
}

const TIER_RANK: Record<UserTier, number> = {
  starter: 0,
  pro: 1,
  founder_suite: 2,
};

/**
 * Determine the user's tier from their active subscription.
 * If userId is provided, queries directly; otherwise reads from Supabase auth session.
 * Returns null if no authenticated user or no active subscription.
 */
export async function getUserTier(userId?: string): Promise<TierInfo | null> {
  const supabase = await createClient();

  let uid = userId;
  if (!uid) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    uid = user.id;
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("tier, deck_count_this_period, image_credits_used")
    .eq("user_id", uid)
    .in("status", ["active", "canceling"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!sub) return null;

  const tier = (sub.tier as UserTier) || "pro"; // legacy fallback

  return {
    tier,
    userId: uid,
    deckCountThisPeriod: sub.deck_count_this_period ?? 0,
    imageCreditsUsed: sub.image_credits_used ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Gated features
// ---------------------------------------------------------------------------

type GatedFeature =
  | "promotional-materials"
  | "business_documents"
  | "investor-tailored-decks"
  | "discovery-session"
  | "advanced-analytics"
  | "google-slides-export"
  | "infrastructure_docs"
  | "unlimited_revisions"
  | "unlimited_images"
  | "priority_queue"
  | "video-deck"
  | "pitch-coach";

const FEATURE_MIN_TIER: Record<GatedFeature, UserTier> = {
  "promotional-materials": "pro",
  "business_documents": "pro",
  "investor-tailored-decks": "pro",
  "discovery-session": "pro",
  "advanced-analytics": "founder_suite",
  "google-slides-export": "pro",
  "infrastructure_docs": "founder_suite",
  "unlimited_revisions": "founder_suite",
  "unlimited_images": "founder_suite",
  "priority_queue": "founder_suite",
  "video-deck": "starter", // Available to all tiers as a paid add-on
  "pitch-coach": "starter", // Available to all tiers as add-on (Founder gets 1 free/month)
};

/**
 * Check whether a user's tier has access to a feature.
 * Exported as both `hasAccess` and `canAccess` for compatibility.
 */
export function hasAccess(userTier: UserTier, feature: GatedFeature): boolean {
  const minTier = FEATURE_MIN_TIER[feature];
  if (!minTier) return false;
  return TIER_RANK[userTier] >= TIER_RANK[minTier];
}

/** Alias for hasAccess — used by document generation routes */
export const canAccess = hasAccess;

/**
 * Check whether a tier meets a minimum requirement.
 */
export function meetsMinimumTier(
  userTier: UserTier,
  minimumTier: UserTier,
): boolean {
  return TIER_RANK[userTier] >= TIER_RANK[minimumTier];
}

// ---------------------------------------------------------------------------
// Usage limit checks
// ---------------------------------------------------------------------------

/**
 * Check if a user can generate another deck this period.
 * Starter = 1/mo, Pro & Founder Suite = unlimited.
 */
export function canGenerateDeck(tierInfo: TierInfo): boolean {
  const limits = PLANS[tierInfo.tier]?.limits;
  if (!limits) return false;
  if (limits.decksPerMonth === -1) return true; // unlimited
  return tierInfo.deckCountThisPeriod < limits.decksPerMonth;
}

/**
 * Check if a user has image credits remaining this period.
 * Founder Suite = unlimited, Pro = 50, Starter = 3.
 */
export function canUseImageCredit(
  tierInfo: TierInfo,
  count: number = 1,
): boolean {
  const limits = PLANS[tierInfo.tier]?.limits;
  if (!limits) return false;
  if (limits.imageCredits === -1) return true; // unlimited
  return tierInfo.imageCreditsUsed + count <= limits.imageCredits;
}

/**
 * Get remaining deck generations for this period.
 * Returns -1 for unlimited.
 */
export function remainingDecks(tierInfo: TierInfo): number {
  const limits = PLANS[tierInfo.tier]?.limits;
  if (!limits) return 0;
  if (limits.decksPerMonth === -1) return -1;
  return Math.max(0, limits.decksPerMonth - tierInfo.deckCountThisPeriod);
}

/**
 * Get remaining image credits for this period.
 * Returns -1 for unlimited.
 */
export function remainingImageCredits(tierInfo: TierInfo): number {
  const limits = PLANS[tierInfo.tier]?.limits;
  if (!limits) return 0;
  if (limits.imageCredits === -1) return -1;
  return Math.max(0, limits.imageCredits - tierInfo.imageCreditsUsed);
}
