import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSubscriptionCheckoutSession } from '@/lib/stripe';
import { getSessionFromRequest } from '@/lib/auth';
import { checkoutLimiter, getClientIp, applyRateLimit } from '@/lib/rate-limit';

const subscribeSchema = z.object({
  planId: z.enum(['starter', 'pro', 'founder_suite']).default('pro'),
  billingPeriod: z.enum(['monthly', 'annual']).default('monthly'),
}).partial();

export async function POST(request: NextRequest) {
  // Rate limiting — 5 req/min per IP
  const ip = getClientIp(request);
  const limited = applyRateLimit(checkoutLimiter, ip, "Too many checkout requests. Please try again later.");
  if (limited) return limited;

  try {
    let planId: 'starter' | 'pro' | 'founder_suite' = 'pro';
    let billingPeriod: 'monthly' | 'annual' = 'monthly';

    try {
      const body = await request.json();
      const parsed = subscribeSchema.safeParse(body);
      if (parsed.success) {
        planId = parsed.data.planId ?? 'pro';
        billingPeriod = parsed.data.billingPeriod ?? 'monthly';
      }
    } catch {
      // No body or invalid JSON — use defaults (backwards compat)
    }

    const user = await getSessionFromRequest(request);
    const userId = user?.id;

    const session = await createSubscriptionCheckoutSession(planId, billingPeriod, userId);
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
