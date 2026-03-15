import { NextRequest, NextResponse } from 'next/server';
import { createSubscriptionCheckoutSession } from '@/lib/stripe';
import { checkoutLimiter, getClientIp, applyRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // Rate limiting — 5 req/min per IP
  const ip = getClientIp(request);
  const limited = applyRateLimit(checkoutLimiter, ip, "Too many checkout requests. Please try again later.");
  if (limited) return limited;

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
