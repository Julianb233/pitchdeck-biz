import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/stripe';
import { resetMonthlyTokens, MONTHLY_TOKEN_ALLOCATION } from '@/lib/tokens';
import { createAdminClient } from '@/lib/supabase/admin';
import type Stripe from 'stripe';

// In-memory fallback stores — used when Supabase is not configured
const paidDecksMemory = new Map<string, { paidAt: string; sessionId: string }>();
const subscriptionsMemory = new Map<
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

  const supabase = createAdminClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === 'payment' && session.metadata?.deckId) {
        const deckId = session.metadata.deckId;

        if (supabase) {
          // Persist payment to Supabase orders table
          const userId = session.metadata?.userId;
          if (userId) {
            const { error } = await supabase.from('orders').insert({
              user_id: userId,
              deck_id: deckId,
              stripe_session_id: session.id,
              amount_cents: session.amount_total ?? 0,
              status: 'paid',
            });

            if (error) {
              console.error('Error inserting order into Supabase:', error);
              // Fall through to in-memory
              paidDecksMemory.set(deckId, {
                paidAt: new Date().toISOString(),
                sessionId: session.id,
              });
            } else {
              // Also update deck status to paid
              await supabase
                .from('decks')
                .update({ status: 'paid' })
                .eq('id', deckId);
              console.log(`Deck ${deckId} payment persisted to Supabase`);
            }
          } else {
            // No userId in metadata, use in-memory fallback
            paidDecksMemory.set(deckId, {
              paidAt: new Date().toISOString(),
              sessionId: session.id,
            });
          }
        } else {
          // In-memory fallback
          paidDecksMemory.set(deckId, {
            paidAt: new Date().toISOString(),
            sessionId: session.id,
          });
        }
        console.log(`Deck ${deckId} marked as paid`);
      }
      break;
    }

    case 'customer.subscription.created': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id;

      if (supabase) {
        // Look up user by stripe_customer_id, or use metadata
        const userId = subscription.metadata?.userId;

        if (userId) {
          const now = new Date();
          const periodStart = subscription.current_period_start
            ? new Date(subscription.current_period_start * 1000).toISOString()
            : new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
          const periodEnd = subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

          const { error } = await supabase.from('subscriptions').insert({
            user_id: userId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: customerId,
            status: subscription.status,
            token_balance: MONTHLY_TOKEN_ALLOCATION,
            tokens_allocated: MONTHLY_TOKEN_ALLOCATION,
            current_period_start: periodStart,
            current_period_end: periodEnd,
          });

          if (error) {
            console.error('Error inserting subscription into Supabase:', error);
            subscriptionsMemory.set(customerId, {
              status: subscription.status,
              subscriptionId: subscription.id,
              customerId,
            });
          } else {
            console.log(`Subscription persisted to Supabase for customer ${customerId}`);
          }
        } else {
          subscriptionsMemory.set(customerId, {
            status: subscription.status,
            subscriptionId: subscription.id,
            customerId,
          });
        }
      } else {
        subscriptionsMemory.set(customerId, {
          status: subscription.status,
          subscriptionId: subscription.id,
          customerId,
        });
        // Allocate initial token balance for new subscriber (in-memory)
        await resetMonthlyTokens(customerId);
      }
      console.log(`Subscription created for customer ${customerId}`);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id;

      if (supabase) {
        const { error } = await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error updating subscription status in Supabase:', error);
        }
      }

      // Always clean up in-memory too
      subscriptionsMemory.delete(customerId);
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
        if (supabase) {
          // Find user by stripe_customer_id via subscriptions table
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', customerId)
            .eq('status', 'active')
            .limit(1)
            .maybeSingle();

          if (sub) {
            await resetMonthlyTokens(sub.user_id);
            console.log(`Tokens reset in Supabase for user ${sub.user_id}`);
          }
        } else {
          // In-memory fallback
          await resetMonthlyTokens(customerId);
        }
        console.log(`Invoice payment succeeded for customer ${customerId}`);
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
