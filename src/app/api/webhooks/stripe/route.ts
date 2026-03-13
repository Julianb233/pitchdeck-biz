import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/stripe';
import type Stripe from 'stripe';

// In-memory stores — replace with a database in production
const paidDecks = new Map<string, { paidAt: string; sessionId: string }>();
const subscriptions = new Map<
  string,
  { status: string; subscriptionId: string; customerId: string }
>();

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = verifyWebhookSignature(body, signature);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === 'payment' && session.metadata?.deckId) {
        paidDecks.set(session.metadata.deckId, {
          paidAt: new Date().toISOString(),
          sessionId: session.id,
        });
        console.log(`Deck ${session.metadata.deckId} marked as paid`);
      }
      break;
    }

    case 'customer.subscription.created': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id;
      subscriptions.set(customerId, {
        status: subscription.status,
        subscriptionId: subscription.id,
        customerId,
      });
      console.log(`Subscription created for customer ${customerId}`);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id;
      subscriptions.delete(customerId);
      console.log(`Subscription deleted for customer ${customerId}`);
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId =
        typeof invoice.customer === 'string'
          ? invoice.customer
          : invoice.customer?.id;
      if (customerId) {
        console.log(`Invoice payment succeeded for customer ${customerId}`);
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
