import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createDeckCheckoutSession,
  createSubscriptionCheckoutSession,
  createAddonCheckoutSession,
} from '@/lib/stripe';
import { getSessionFromRequest } from '@/lib/auth';
import { createOrder } from '@/lib/supabase/orders';
import { checkoutLimiter, getClientIp, applyRateLimit } from '@/lib/rate-limit';

const checkoutSchema = z.union([
  // Legacy deck + deckId format (backwards compat)
  z.object({ type: z.literal('deck'), deckId: z.string().min(1) }),
  // Legacy priceType format
  z.object({ priceType: z.literal('one-time') }),
  // New 3-tier subscription checkout
  z.object({
    type: z.literal('subscription'),
    planId: z.enum(['starter', 'pro', 'founder_suite']),
    billingPeriod: z.enum(['monthly', 'annual']),
  }),
  // Legacy subscription without plan (maps to pro/monthly for backwards compat)
  z.object({ type: z.literal('subscription') }),
  z.object({ priceType: z.literal('subscription') }),
  // Add-on purchase
  z.object({
    type: z.literal('addon'),
    addonId: z.enum(['pitch_coach', 'video_deck', 'monthly_branding']),
  }),
]);

export async function POST(request: NextRequest) {
  // Rate limiting — 5 req/min per IP
  const ip = getClientIp(request);
  const limited = applyRateLimit(checkoutLimiter, ip, "Too many checkout requests. Please try again later.");
  if (limited) return limited;

  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Get authenticated user to include in Stripe metadata
    const user = await getSessionFromRequest(request);
    const userId = user?.id;

    const data = parsed.data;

    // One-time deck purchase (legacy)
    if (
      ('type' in data && data.type === 'deck') ||
      ('priceType' in data && data.priceType === 'one-time')
    ) {
      const deckId = 'deckId' in data ? data.deckId : 'pending';

      let orderId: string | undefined;
      if (userId) {
        const order = await createOrder(userId, deckId, 9900);
        if (order) {
          orderId = order.id;
        }
      }

      const session = await createDeckCheckoutSession(deckId, userId, orderId);
      return NextResponse.json({ url: session.url });
    }

    // Add-on purchase
    if ('type' in data && data.type === 'addon') {
      const session = await createAddonCheckoutSession(data.addonId, userId);
      return NextResponse.json({ url: session.url });
    }

    // Subscription checkout — new 3-tier flow
    const planId = ('planId' in data && data.planId) ? data.planId : 'pro';
    const billingPeriod = ('billingPeriod' in data && data.billingPeriod) ? data.billingPeriod : 'monthly';

    const session = await createSubscriptionCheckoutSession(planId, billingPeriod, userId);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session creation failed:', error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
