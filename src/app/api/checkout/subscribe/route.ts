import { NextResponse } from 'next/server';
import { createSubscriptionCheckoutSession } from '@/lib/stripe';

export async function POST() {
  try {
    const session = await createSubscriptionCheckoutSession();
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Subscription checkout failed:', error);
    return NextResponse.json(
      {
        error: 'Failed to create subscription checkout',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
