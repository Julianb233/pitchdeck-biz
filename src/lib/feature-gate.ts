/**
 * Feature gating utility for tiered access control.
 *
 * Tiers:
 *   - "free"    — Starter (no active subscription)
 *   - "pro"     — Pro plan (active subscription)
 *   - "founder" — Founder Suite (active subscription with founder plan)
 *
 * The subscription table's `plan_type` column distinguishes pro vs founder.
 * When no `plan_type` column exists, any active subscription is treated as "pro".
 */

import { createClient } from "@/lib/supabase/server";

export type UserTier = "free" | "pro" | "founder";

export interface TierInfo {
  tier: UserTier;
  userId: string;
}

/**
 * Determine the user's tier from their Supabase session.
 * Returns null if no authenticated user is found.
 */
export async function getUserTier(): Promise<TierInfo | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status, plan_type")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!sub) {
    return { tier: "free", userId: user.id };
  }

  // If plan_type is "founder", grant founder tier; otherwise pro
  const planType =
    sub && typeof sub === "object" && "plan_type" in sub
      ? (sub as Record<string, unknown>).plan_type
      : null;
  const tier: UserTier = planType === "founder" ? "founder" : "pro";

  return { tier, userId: user.id };
}

/** Features that require a minimum tier */
type GatedFeature =
  | "promotional-materials"
  | "investor-tailored-decks"
  | "discovery-session"
  | "advanced-analytics";

const FEATURE_MIN_TIER: Record<GatedFeature, UserTier> = {
  "promotional-materials": "pro",
  "investor-tailored-decks": "pro",
  "discovery-session": "pro",
  "advanced-analytics": "founder",
};

const TIER_RANK: Record<UserTier, number> = {
  free: 0,
  pro: 1,
  founder: 2,
};

/**
 * Check whether a user's tier has access to a feature.
 */
export function hasAccess(userTier: UserTier, feature: GatedFeature): boolean {
  const minTier = FEATURE_MIN_TIER[feature];
  return TIER_RANK[userTier] >= TIER_RANK[minTier];
}

/**
 * Check whether a tier meets a minimum requirement.
 */
export function meetsMinimumTier(
  userTier: UserTier,
  minimumTier: UserTier,
): boolean {
  return TIER_RANK[userTier] >= TIER_RANK[minimumTier];
}
