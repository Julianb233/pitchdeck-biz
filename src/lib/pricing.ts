// =============================================================================
// pitchdeck.biz — 3-Tier Pricing Configuration
// =============================================================================
// All Stripe Price IDs are sourced from environment variables.
// Create the corresponding prices in your Stripe Dashboard and set env vars.
// =============================================================================

export type PlanId = 'starter' | 'pro' | 'founder_suite';
export type BillingPeriod = 'monthly' | 'annual';
export type AddonId = 'pitch_coach' | 'video_deck' | 'monthly_branding';

export interface PlanLimits {
  /** Decks per month. -1 = unlimited */
  decksPerMonth: number;
  /** AI image credits per month. -1 = unlimited */
  imageCredits: number;
  /** Revision cycles per deck. -1 = unlimited, 0 = none */
  revisionCycles: number;
  /** Branding asset tokens per month */
  brandingTokens: number;
}

export interface Plan {
  id: PlanId;
  name: string;
  monthlyPrice: number;
  annualPrice: number; // per month when billed annually
  annualTotal: number; // total billed annually
  description: string;
  features: string[];
  limits: PlanLimits;
  recommended?: boolean;
  /** Env var keys for Stripe Price IDs */
  stripePriceEnvKeys: {
    monthly: string;
    annual: string;
  };
}

export interface Addon {
  id: AddonId;
  name: string;
  price: number;
  type: 'one-time' | 'recurring';
  description: string;
  stripePriceEnvKey: string;
}

// ---------------------------------------------------------------------------
// Plans
// ---------------------------------------------------------------------------

export const PLANS: Record<PlanId, Plan> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 29,
    annualPrice: 19,
    annualTotal: 228,
    description: 'Everything you need to pitch your business professionally',
    features: [
      '1 pitch deck per month (10-15 slides)',
      'Sell sheet + one-pager + brand kit per deck',
      'PPTX + PDF export',
      '3 AI image generations per deck',
    ],
    limits: {
      decksPerMonth: 1,
      imageCredits: 3,
      revisionCycles: 0,
      brandingTokens: 0,
    },
    stripePriceEnvKeys: {
      monthly: 'STRIPE_PRICE_STARTER_MONTHLY',
      annual: 'STRIPE_PRICE_STARTER_ANNUAL',
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 79,
    annualPrice: 59,
    annualTotal: 708,
    description: 'Unlimited decks with premium deliverables for growing startups',
    recommended: true,
    features: [
      'Everything in Starter',
      'Unlimited decks per month',
      'Promotional materials (social kit, email templates, ad creatives, press kit)',
      'Business documents (executive summary, investor update, board deck)',
      'Nano Banana Pro branded visuals',
      'Imagen 4 hero/stock imagery',
      'Google Slides export',
      '2 revision cycles per deck',
      '50 AI image credits/month',
    ],
    limits: {
      decksPerMonth: -1,
      imageCredits: 50,
      revisionCycles: 2,
      brandingTokens: 500,
    },
    stripePriceEnvKeys: {
      monthly: 'STRIPE_PRICE_PRO_MONTHLY',
      annual: 'STRIPE_PRICE_PRO_ANNUAL',
    },
  },
  founder_suite: {
    id: 'founder_suite',
    name: 'Founder Suite',
    monthlyPrice: 199,
    annualPrice: 149,
    annualTotal: 1788,
    description: 'The complete fundraising toolkit for serious founders',
    features: [
      'Everything in Pro',
      'Full business plan (20-30 pages)',
      'Financial model template',
      'Cap table template',
      'Term sheet guide + negotiation framework',
      'Due diligence checklist',
      'Investor outreach email sequences',
      'Data room setup guide',
      'Unlimited AI image credits',
      'Unlimited revision cycles',
      'Priority generation queue',
      '1 AI pitch coaching session/month',
    ],
    limits: {
      decksPerMonth: -1,
      imageCredits: -1,
      revisionCycles: -1,
      brandingTokens: 500,
    },
    stripePriceEnvKeys: {
      monthly: 'STRIPE_PRICE_FOUNDER_MONTHLY',
      annual: 'STRIPE_PRICE_FOUNDER_ANNUAL',
    },
  },
} as const;

export const PLAN_LIST: Plan[] = [PLANS.starter, PLANS.pro, PLANS.founder_suite];

// ---------------------------------------------------------------------------
// Add-ons
// ---------------------------------------------------------------------------

export const ADDONS: Record<AddonId, Addon> = {
  pitch_coach: {
    id: 'pitch_coach',
    name: 'Pitch Coach',
    price: 49,
    type: 'one-time',
    description: 'Live AI pitch coaching session with feedback',
    stripePriceEnvKey: 'STRIPE_PRICE_ADDON_PITCH_COACH',
  },
  video_deck: {
    id: 'video_deck',
    name: 'Video Deck',
    price: 149,
    type: 'one-time',
    description: 'Animated video version of your pitch deck',
    stripePriceEnvKey: 'STRIPE_PRICE_ADDON_VIDEO_DECK',
  },
  monthly_branding: {
    id: 'monthly_branding',
    name: 'Monthly Branding',
    price: 49,
    type: 'recurring',
    description: '500 branding asset tokens per month',
    stripePriceEnvKey: 'STRIPE_PRICE_ADDON_MONTHLY_BRANDING',
  },
} as const;

export const ADDON_LIST: Addon[] = [
  ADDONS.pitch_coach,
  ADDONS.video_deck,
  ADDONS.monthly_branding,
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a Stripe Price ID to our internal plan + billing period */
export function getPlanFromPriceId(
  priceId: string
): { plan: PlanId; billingPeriod: BillingPeriod } | null {
  for (const plan of PLAN_LIST) {
    const monthlyEnv = process.env[plan.stripePriceEnvKeys.monthly];
    const annualEnv = process.env[plan.stripePriceEnvKeys.annual];
    if (monthlyEnv === priceId) return { plan: plan.id, billingPeriod: 'monthly' };
    if (annualEnv === priceId) return { plan: plan.id, billingPeriod: 'annual' };
  }
  return null;
}

/** Get Stripe Price ID for a plan + period */
export function getStripePriceId(planId: PlanId, billingPeriod: BillingPeriod): string | undefined {
  const plan = PLANS[planId];
  if (!plan) return undefined;
  const envKey = billingPeriod === 'annual'
    ? plan.stripePriceEnvKeys.annual
    : plan.stripePriceEnvKeys.monthly;
  return process.env[envKey];
}

/** Get token/credit allocation for a tier */
export function getTokenAllocation(tier: PlanId): number {
  return PLANS[tier]?.limits.brandingTokens ?? 0;
}

/** Get the image credit limit for a tier */
export function getImageCreditLimit(tier: PlanId): number {
  return PLANS[tier]?.limits.imageCredits ?? 0;
}

/** Annual savings percentage for display */
export function getAnnualSavingsPercent(planId: PlanId): number {
  const plan = PLANS[planId];
  if (!plan) return 0;
  return Math.round(((plan.monthlyPrice - plan.annualPrice) / plan.monthlyPrice) * 100);
}
