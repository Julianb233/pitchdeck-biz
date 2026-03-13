import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createDeckCheckoutSession,
  createSubscriptionCheckoutSession,
} from '@/lib/stripe';

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
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (
      ('type' in data && data.type === 'deck') ||
      ('priceType' in data && data.priceType === 'one-time')
    ) {
      const deckId = 'deckId' in data ? data.deckId : 'pending';
      const session = await createDeckCheckoutSession(deckId);
      return NextResponse.json({ url: session.url });
    }

    const session = await createSubscriptionCheckoutSession();
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
