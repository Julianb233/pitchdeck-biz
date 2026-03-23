#!/usr/bin/env npx tsx
/**
 * Stripe Product + Price Setup Script
 * ====================================
 * Creates all 3-tier subscription products/prices and add-on products/prices
 * in your Stripe account. Run once per environment (test + live).
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/stripe-setup-prices.ts
 *
 * The script is idempotent: it checks for existing products by metadata
 * before creating new ones.
 *
 * After running, copy the printed Price IDs into your .env.local / Vercel env vars.
 */

import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error("ERROR: Set STRIPE_SECRET_KEY environment variable");
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2026-02-25.clover" });

// ---------------------------------------------------------------------------
// Product + Price definitions
// ---------------------------------------------------------------------------

interface PriceDef {
  envKey: string;
  unitAmount: number; // cents
  interval: "month" | "year";
}

interface ProductDef {
  internalId: string;
  name: string;
  description: string;
  prices: PriceDef[];
}

const PRODUCTS: ProductDef[] = [
  // ── Subscription tiers ──────────────────────────────────────────────
  {
    internalId: "starter",
    name: "Starter",
    description:
      "1 pitch deck/month, sell sheet + one-pager + brand kit, PPTX + PDF export, 3 AI image credits",
    prices: [
      { envKey: "STRIPE_PRICE_STARTER_MONTHLY", unitAmount: 2900, interval: "month" },
      { envKey: "STRIPE_PRICE_STARTER_ANNUAL", unitAmount: 26100, interval: "year" },
    ],
  },
  {
    internalId: "pro",
    name: "Pro",
    description:
      "Unlimited decks, all exports, promo materials, business docs, 50 AI image credits/month, 2 revision cycles",
    prices: [
      { envKey: "STRIPE_PRICE_PRO_MONTHLY", unitAmount: 7900, interval: "month" },
      { envKey: "STRIPE_PRICE_PRO_ANNUAL", unitAmount: 71100, interval: "year" },
    ],
  },
  {
    internalId: "founder_suite",
    name: "Founder Suite",
    description:
      "Everything in Pro + business plan, financial model, cap table, DD checklist, unlimited credits, priority queue",
    prices: [
      { envKey: "STRIPE_PRICE_FOUNDER_MONTHLY", unitAmount: 19900, interval: "month" },
      { envKey: "STRIPE_PRICE_FOUNDER_ANNUAL", unitAmount: 179100, interval: "year" },
    ],
  },

  // ── Add-ons ─────────────────────────────────────────────────────────
  {
    internalId: "addon_pitch_coach",
    name: "Pitch Coach (Add-on)",
    description: "Live AI pitch coaching session with scoring and feedback",
    prices: [
      { envKey: "STRIPE_PRICE_ADDON_PITCH_COACH", unitAmount: 4900, interval: "month" },
    ],
  },
  {
    internalId: "addon_video_deck",
    name: "Video Deck (Add-on)",
    description: "Animated video version of your pitch deck (Veo)",
    prices: [
      { envKey: "STRIPE_PRICE_ADDON_VIDEO_DECK", unitAmount: 14900, interval: "month" },
    ],
  },
  {
    internalId: "addon_monthly_branding",
    name: "Monthly Branding (Add-on)",
    description: "500 branding asset tokens per month",
    prices: [
      { envKey: "STRIPE_PRICE_ADDON_MONTHLY_BRANDING", unitAmount: 4900, interval: "month" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function findExistingProduct(internalId: string): Promise<Stripe.Product | null> {
  const products = await stripe.products.search({
    query: `metadata["internal_id"]:"${internalId}"`,
  });
  return products.data[0] ?? null;
}

async function findExistingPrice(
  productId: string,
  interval: "month" | "year",
  unitAmount: number
): Promise<Stripe.Price | null> {
  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    limit: 20,
  });
  return (
    prices.data.find(
      (p) =>
        p.recurring?.interval === interval &&
        p.unit_amount === unitAmount
    ) ?? null
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== Stripe Product & Price Setup ===\n");

  const envOutput: Record<string, string> = {};

  for (const def of PRODUCTS) {
    // Find or create product
    let product = await findExistingProduct(def.internalId);
    if (product) {
      console.log(`[EXISTING] Product "${def.name}" → ${product.id}`);
    } else {
      product = await stripe.products.create({
        name: def.name,
        description: def.description,
        metadata: { internal_id: def.internalId, app: "pitchdeck_biz" },
      });
      console.log(`[CREATED]  Product "${def.name}" → ${product.id}`);
    }

    // Find or create each price
    for (const priceDef of def.prices) {
      let price = await findExistingPrice(
        product.id,
        priceDef.interval,
        priceDef.unitAmount
      );

      if (price) {
        console.log(
          `  [EXISTING] ${priceDef.envKey} → ${price.id} ($${(priceDef.unitAmount / 100).toFixed(2)}/${priceDef.interval})`
        );
      } else {
        price = await stripe.prices.create({
          product: product.id,
          currency: "usd",
          unit_amount: priceDef.unitAmount,
          recurring: { interval: priceDef.interval },
          metadata: { env_key: priceDef.envKey, app: "pitchdeck_biz" },
        });
        console.log(
          `  [CREATED]  ${priceDef.envKey} → ${price.id} ($${(priceDef.unitAmount / 100).toFixed(2)}/${priceDef.interval})`
        );
      }

      envOutput[priceDef.envKey] = price.id;
    }

    console.log();
  }

  // Print copy-paste .env block
  console.log("=== Copy these into .env.local ===\n");
  for (const [key, value] of Object.entries(envOutput)) {
    console.log(`${key}=${value}`);
  }
  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
