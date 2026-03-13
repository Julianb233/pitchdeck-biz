import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/stripe';
import { resetMonthlyTokens, MONTHLY_TOKEN_ALLOCATION } from '@/lib/tokens';
import { createAdminClient } from '@/lib/supabase/admin';
import type Stripe from 'stripe';



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
        // One-time deck purchase
        const deckId = session.metadata.deckId;
        const userId = session.metadata?.userId;

        if (supabase && userId) {
          const { error } = await supabase.from('orders').insert({
            user_id: userId,
            deck_id: deckId,
            stripe_session_id: session.id,
            amount_cents: session.amount_total ?? 0,
            status: 'paid',
          });

          if (error) {
            console.error('Error inserting order into Supabase:', error);
          } else {
            await supabase
              .from('decks')
              .update({ status: 'paid' })
              .eq('id', deckId);
            console.log(`Deck ${deckId} payment persisted to Supabase`);
          }
        }
        console.log(`Deck ${deckId} marked as paid`);
      } else if (session.mode === 'subscription' && session.metadata?.userId) {
        // Subscription checkout - insert subscription record
        const userId = session.metadata.userId;
        const subscriptionId = typeof session.subscription === 'string'
          ? session.subscription
          : (session.subscription as Stripe.Subscription | null)?.id;
        const customerId = typeof session.customer === 'string'
          ? session.customer
          : (session.customer as Stripe.Customer | Stripe.DeletedCustomer | null)?.id;

        if (supabase && subscriptionId && customerId) {
          const now = new Date();
          const periodStart = now.toISOString();
          const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString();

          const { error } = await supabase.from('subscriptions').insert({
            user_id: userId,
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: customerId,
            status: 'active',
            token_balance: MONTHLY_TOKEN_ALLOCATION,
            tokens_allocated: MONTHLY_TOKEN_ALLOCATION,
            current_period_start: periodStart,
            current_period_end: periodEnd,
          });

          if (error) {
            console.error('Error inserting subscription from checkout:', error);
          } else {
            console.log(`Subscription ${subscriptionId} created from checkout for user ${userId}`);
          }
        }
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
          // In Stripe Clover API, period dates are on SubscriptionItem
          const item = subscription.items?.data?.[0];
          const periodStart = item?.current_period_start
            ? new Date(item.current_period_start * 1000).toISOString()
            : new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
          const periodEnd = item?.current_period_end
            ? new Date(item.current_period_end * 1000).toISOString()
            : new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

          // Use upsert to avoid conflicts if checkout.session.completed already inserted
          const { error } = await supabase.from('subscriptions').upsert({
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
            console.error('Error upserting subscription into Supabase:', error);
          } else {
            console.log(`Subscription persisted to Supabase for customer ${customerId}`);
          }
        }
      }
      console.log(`Subscription created for customer ${customerId}`);
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;

      if (supabase) {
        const item = subscription.items?.data?.[0];
        const updateData: Record<string, unknown> = {
          status: subscription.status,
        };
        if (item?.current_period_start) {
          updateData.current_period_start = new Date(item.current_period_start * 1000).toISOString();
        }
        if (item?.current_period_end) {
          updateData.current_period_end = new Date(item.current_period_end * 1000).toISOString();
        }

        const { error } = await supabase
          .from('subscriptions')
          .update(updateData)
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error updating subscription in Supabase:', error);
        } else {
          console.log(`Subscription ${subscription.id} updated`);
        }
      }
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
          // Find active subscription by stripe_customer_id
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('id, user_id, tokens_allocated')
            .eq('stripe_customer_id', customerId)
            .eq('status', 'active')
            .limit(1)
            .maybeSingle();

          if (sub) {
            // Reset token balance and update period dates from invoice
            const periodStart = invoice.period_start
              ? new Date(invoice.period_start * 1000).toISOString()
              : new Date().toISOString();
            const periodEnd = invoice.period_end
              ? new Date(invoice.period_end * 1000).toISOString()
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

            const { error } = await supabase
              .from('subscriptions')
              .update({
                token_balance: sub.tokens_allocated,
                current_period_start: periodStart,
                current_period_end: periodEnd,
              })
              .eq('id', sub.id);

            if (error) {
              console.error('Error resetting tokens in Supabase:', error);
            } else {
              console.log(`Tokens reset to ${sub.tokens_allocated} for user ${sub.user_id}`);
            }
          }
        } else {
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
