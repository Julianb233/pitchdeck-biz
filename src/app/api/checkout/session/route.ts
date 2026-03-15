import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createDeckCheckoutSession,
  createSubscriptionCheckoutSession,
} from '@/lib/stripe';
import { getSessionFromRequest } from '@/lib/auth';
import { createOrder } from '@/lib/supabase/orders';
import { checkoutLimiter, getClientIp, applyRateLimit } from '@/lib/rate-limit';

const checkoutSchema = z.union([
  // Legacy deck + deckId format
  z.object({ type: z.literal('deck'), deckId: z.string().min(1) }),
  // priceType format from pricing page
  z.object({ priceType: z.literal('one-time') }),
  z.object({ priceType: z.literal('subscription') }),
  // Subscription without deckId
  z.object({ type: z.literal('subscription') }),
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

    if (
      ('type' in data && data.type === 'deck') ||
      ('priceType' in data && data.priceType === 'one-time')
    ) {
      const deckId = 'deckId' in data ? data.deckId : 'pending';

      // Create a pending order in Supabase if user is authenticated
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

    const session = await createSubscriptionCheckoutSession(userId);
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
