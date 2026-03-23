#!/usr/bin/env npx tsx
/**
 * V1 Subscriber Migration Script
 * ================================
 * Migrates existing v1.0 subscribers to the 3-tier pricing model:
 *
 *   - $49/mo subscribers  -> Pro tier (monthly)
 *   - $99 one-time buyers -> Grandfathered access (no subscription change,
 *                            but their orders gain a `grandfathered` flag)
 *
 * This script is idempotent — safe to run multiple times.
 *
 * Prerequisites:
 *   - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=eyJ... npx tsx scripts/migrate-v1-subscribers.ts
 *   Add --dry-run to preview changes without writing
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log(`=== V1 Subscriber Migration ${dryRun ? "(DRY RUN)" : ""} ===\n`);

  // ── 1. Migrate existing $49/mo subscriptions to Pro tier ────────────
  console.log("--- Step 1: Migrate active subscriptions to Pro tier ---");

  const { data: subs, error: subsErr } = await supabase
    .from("subscriptions")
    .select("id, user_id, stripe_subscription_id, status, tier, billing_period")
    .in("status", ["active", "canceling"])
    .or("tier.is.null,tier.eq.pro");

  if (subsErr) {
    console.error("Error fetching subscriptions:", subsErr);
    process.exit(1);
  }

  let subsMigrated = 0;
  for (const sub of subs ?? []) {
    // Only touch subs that don't already have a tier or have the legacy default
    const needsUpdate =
      !sub.tier ||
      sub.tier === "pro" && !sub.billing_period;

    if (!needsUpdate) {
      console.log(`  [SKIP] Subscription ${sub.id} already has tier=${sub.tier}, billing_period=${sub.billing_period}`);
      continue;
    }

    if (dryRun) {
      console.log(`  [DRY-RUN] Would update subscription ${sub.id} -> tier=pro, billing_period=monthly`);
    } else {
      const { error } = await supabase
        .from("subscriptions")
        .update({
          tier: "pro",
          billing_period: "monthly",
          tokens_allocated: 500,
          // Don't reset token_balance — let them keep what they have
        })
        .eq("id", sub.id);

      if (error) {
        console.error(`  [ERROR] Subscription ${sub.id}:`, error.message);
      } else {
        console.log(`  [MIGRATED] Subscription ${sub.id} -> Pro/monthly`);
        subsMigrated++;
      }
    }
  }
  console.log(`  Subscriptions migrated: ${subsMigrated}\n`);

  // ── 2. Grandfather one-time $99 deck purchasers ─────────────────────
  console.log("--- Step 2: Grandfather one-time deck purchasers ---");

  const { data: orders, error: ordersErr } = await supabase
    .from("orders")
    .select("id, user_id, deck_id, status, amount_cents")
    .eq("status", "paid");

  if (ordersErr) {
    console.error("Error fetching orders:", ordersErr);
    process.exit(1);
  }

  let ordersGrandfathered = 0;
  const grandfatheredUserIds = new Set<string>();

  for (const order of orders ?? []) {
    grandfatheredUserIds.add(order.user_id);

    // Mark the deck as grandfathered (update status field)
    if (dryRun) {
      console.log(`  [DRY-RUN] Would mark deck ${order.deck_id} as grandfathered for user ${order.user_id}`);
    } else {
      const { error } = await supabase
        .from("decks")
        .update({ status: "grandfathered" })
        .eq("id", order.deck_id)
        .eq("status", "paid");

      if (error) {
        console.error(`  [ERROR] Deck ${order.deck_id}:`, error.message);
      } else {
        console.log(`  [GRANDFATHERED] Deck ${order.deck_id} for user ${order.user_id}`);
        ordersGrandfathered++;
      }
    }
  }

  console.log(`  Decks grandfathered: ${ordersGrandfathered}`);
  console.log(`  Unique users with grandfathered access: ${grandfatheredUserIds.size}`);

  // ── Summary ─────────────────────────────────────────────────────────
  console.log("\n=== Migration Summary ===");
  console.log(`  Active subscriptions migrated to Pro: ${subsMigrated}`);
  console.log(`  One-time purchase decks grandfathered: ${ordersGrandfathered}`);
  console.log(`  Unique grandfathered users: ${grandfatheredUserIds.size}`);
  if (dryRun) {
    console.log("\n  This was a DRY RUN. No changes were made.");
    console.log("  Run without --dry-run to apply changes.");
  }
  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
