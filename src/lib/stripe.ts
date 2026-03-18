import Stripe from 'stripe';
import { type PlanId, type BillingPeriod, type AddonId, getStripePriceId, ADDONS } from '@/lib/pricing';

function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-02-25.clover',
  });
}

const stripe = new Proxy({} as Stripe, {
  get(_, prop: string | symbol) {
    const client = getStripeClient();
    return client[prop as keyof typeof client];
  },
});

// ---------------------------------------------------------------------------
// Legacy — one-time deck purchase (kept for backwards compatibility)
// ---------------------------------------------------------------------------

const DEFAULT_PRICE_DECK = 'price_1TAOrDE8iqjFMOfSsnqdaKx9';

export async function createDeckCheckoutSession(deckId: string, userId?: string, orderId?: string) {
  const priceId = process.env.STRIPE_PRICE_DECK || DEFAULT_PRICE_DECK;

  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
    price: priceId,
    quantity: 1,
  };

  const metadata: Record<string, string> = { deckId };
  if (userId) metadata.userId = userId;
  if (orderId) metadata.orderId = orderId;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [lineItem],
    metadata,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
  });
  return session;
}

// ---------------------------------------------------------------------------
// New 3-tier subscription checkout
// ---------------------------------------------------------------------------

export async function createSubscriptionCheckoutSession(
  planId: PlanId,
  billingPeriod: BillingPeriod,
  userId?: string,
) {
  const priceId = getStripePriceId(planId, billingPeriod);

  if (!priceId) {
    throw new Error(
      `Stripe Price ID not configured for ${planId}/${billingPeriod}. ` +
      `Set the corresponding environment variable.`
    );
  }

  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
    price: priceId,
    quantity: 1,
  };

  const metadata: Record<string, string> = {
    planId,
    billingPeriod,
  };
  if (userId) metadata.userId = userId;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [lineItem],
    metadata,
    subscription_data: {
      metadata: {
        planId,
        billingPeriod,
        ...(userId ? { userId } : {}),
      },
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
  });
  return session;
}

// ---------------------------------------------------------------------------
// Add-on purchases
// ---------------------------------------------------------------------------

export async function createAddonCheckoutSession(
  addonId: AddonId,
  userId?: string,
) {
  const addon = ADDONS[addonId];
  if (!addon) throw new Error(`Unknown addon: ${addonId}`);

  const priceId = process.env[addon.stripePriceEnvKey];
  if (!priceId) {
    throw new Error(
      `Stripe Price ID not configured for addon ${addonId}. ` +
      `Set ${addon.stripePriceEnvKey} in environment variables.`
    );
  }

  const mode = addon.type === 'recurring' ? 'subscription' : 'payment';

  const metadata: Record<string, string> = {
    addonId,
    type: 'addon',
  };
  if (userId) metadata.userId = userId;

  const session = await stripe.checkout.sessions.create({
    mode,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata,
    ...(mode === 'subscription' && userId
      ? { subscription_data: { metadata: { userId, addonId } } }
      : {}),
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
  });
  return session;
}

// ---------------------------------------------------------------------------
// Subscription management (upgrade/downgrade)
// ---------------------------------------------------------------------------

export async function updateSubscriptionPlan(
  stripeSubscriptionId: string,
  newPlanId: PlanId,
  newBillingPeriod: BillingPeriod,
) {
  const newPriceId = getStripePriceId(newPlanId, newBillingPeriod);
  if (!newPriceId) {
    throw new Error(`Stripe Price ID not configured for ${newPlanId}/${newBillingPeriod}`);
  }

  // Get the current subscription to find the item ID
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  const currentItemId = subscription.items.data[0]?.id;

  if (!currentItemId) {
    throw new Error('No subscription item found');
  }

  // Update the subscription — prorate by default
  const updated = await stripe.subscriptions.update(stripeSubscriptionId, {
    items: [
      {
        id: currentItemId,
        price: newPriceId,
      },
    ],
    metadata: {
      planId: newPlanId,
      billingPeriod: newBillingPeriod,
    },
    proration_behavior: 'create_prorations',
  });

  return updated;
}

// ---------------------------------------------------------------------------
// Webhook verification
// ---------------------------------------------------------------------------

export function verifyWebhookSignature(body: string, signature: string) {
  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}

export default stripe;
