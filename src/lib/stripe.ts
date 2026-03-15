import Stripe from 'stripe';

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

// Real Stripe price IDs (test mode) — created via API
const DEFAULT_PRICE_DECK = 'price_1TAOrDE8iqjFMOfSsnqdaKx9';
const DEFAULT_PRICE_SUBSCRIPTION = 'price_1TAOrME8iqjFMOfS8HPpsTTQ';

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

export async function createSubscriptionCheckoutSession(userId?: string) {
  const priceId = process.env.STRIPE_PRICE_SUBSCRIPTION || DEFAULT_PRICE_SUBSCRIPTION;

  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
    price: priceId,
    quantity: 1,
  };

  const metadata: Record<string, string> = {};
  if (userId) metadata.userId = userId;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [lineItem],
    metadata,
    subscription_data: userId ? { metadata: { userId } } : undefined,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
  });
  return session;
}

export function verifyWebhookSignature(body: string, signature: string) {
  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}

export default stripe;
