#!/usr/bin/env bash
# =============================================================================
# pitchdeck.biz — Create Stripe Products + Prices (3-tier + add-ons)
# =============================================================================
# Creates 3 subscription products (Starter, Pro, Founder Suite) with
# monthly + annual prices, plus 3 add-on products.
# Outputs env vars to paste into .env.local
# =============================================================================
set -euo pipefail

STRIPE_KEY="${STRIPE_SECRET_KEY:?Set STRIPE_SECRET_KEY}"

stripe_api() {
  local method="$1" endpoint="$2"
  shift 2
  curl -s -X "$method" "https://api.stripe.com/v1/$endpoint" \
    -u "$STRIPE_KEY:" \
    "$@"
}

create_product() {
  local name="$1" description="$2"
  stripe_api POST products \
    -d "name=$name" \
    -d "description=$description" \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])"
}

create_price() {
  local product="$1" amount="$2" interval="$3" nickname="$4"
  local args=(-d "product=$product" -d "unit_amount=$amount" -d "currency=usd" -d "nickname=$nickname")
  if [ "$interval" = "one_time" ]; then
    args+=(-d "type=one_time")  # not adding recurring for one_time
    # Actually for one_time we just omit recurring
    stripe_api POST prices \
      -d "product=$product" -d "unit_amount=$amount" -d "currency=usd" \
      -d "nickname=$nickname" \
      | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])"
    return
  fi
  stripe_api POST prices \
    -d "product=$product" -d "unit_amount=$amount" -d "currency=usd" \
    -d "recurring[interval]=$interval" -d "nickname=$nickname" \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])"
}

echo "=== Creating Stripe Products + Prices for pitchdeck.biz ==="
echo ""

# --- Starter ---
echo "Creating Starter product..."
STARTER_PROD=$(create_product "Starter Plan" "Everything you need to pitch your business professionally. 1 deck/mo, sell sheet, one-pager, brand kit, 3 AI images.")
echo "  Product: $STARTER_PROD"

echo "  Creating Starter Monthly ($29/mo)..."
STARTER_MONTHLY=$(create_price "$STARTER_PROD" 2900 month "Starter Monthly")
echo "  Price: $STARTER_MONTHLY"

echo "  Creating Starter Annual ($19/mo = $228/yr)..."
STARTER_ANNUAL=$(create_price "$STARTER_PROD" 22800 year "Starter Annual")
echo "  Price: $STARTER_ANNUAL"

# --- Pro ---
echo "Creating Pro product..."
PRO_PROD=$(create_product "Pro Plan" "Unlimited decks with premium deliverables for growing startups. Promo materials, business docs, Imagen 4 imagery, 50 AI credits/mo.")
echo "  Product: $PRO_PROD"

echo "  Creating Pro Monthly ($79/mo)..."
PRO_MONTHLY=$(create_price "$PRO_PROD" 7900 month "Pro Monthly")
echo "  Price: $PRO_MONTHLY"

echo "  Creating Pro Annual ($59/mo = $708/yr)..."
PRO_ANNUAL=$(create_price "$PRO_PROD" 70800 year "Pro Annual")
echo "  Price: $PRO_ANNUAL"

# --- Founder Suite ---
echo "Creating Founder Suite product..."
FOUNDER_PROD=$(create_product "Founder Suite" "The complete fundraising toolkit. Business plan, financial model, cap table, term sheets, investor outreach, unlimited everything.")
echo "  Product: $FOUNDER_PROD"

echo "  Creating Founder Monthly ($199/mo)..."
FOUNDER_MONTHLY=$(create_price "$FOUNDER_PROD" 19900 month "Founder Suite Monthly")
echo "  Price: $FOUNDER_MONTHLY"

echo "  Creating Founder Annual ($149/mo = $1788/yr)..."
FOUNDER_ANNUAL=$(create_price "$FOUNDER_PROD" 178800 year "Founder Suite Annual")
echo "  Price: $FOUNDER_ANNUAL"

# --- Add-ons ---
echo ""
echo "=== Creating Add-on Products ==="

echo "Creating Pitch Coach add-on..."
COACH_PROD=$(create_product "Pitch Coach" "Live AI pitch coaching session with feedback")
echo "  Product: $COACH_PROD"
COACH_PRICE=$(create_price "$COACH_PROD" 4900 one_time "Pitch Coach One-Time")
echo "  Price: $COACH_PRICE"

echo "Creating Video Deck add-on..."
VIDEO_PROD=$(create_product "Video Deck" "Animated video version of your pitch deck")
echo "  Product: $VIDEO_PROD"
VIDEO_PRICE=$(create_price "$VIDEO_PROD" 14900 one_time "Video Deck One-Time")
echo "  Price: $VIDEO_PRICE"

echo "Creating Monthly Branding add-on..."
BRANDING_PROD=$(create_product "Monthly Branding" "500 branding asset tokens per month")
echo "  Product: $BRANDING_PROD"
BRANDING_PRICE=$(create_price "$BRANDING_PROD" 4900 month "Monthly Branding Recurring")
echo "  Price: $BRANDING_PRICE"

echo ""
echo "=== Done! Add these to .env.local ==="
echo ""
echo "# 3-Tier Subscription Price IDs"
echo "STRIPE_PRICE_STARTER_MONTHLY=$STARTER_MONTHLY"
echo "STRIPE_PRICE_STARTER_ANNUAL=$STARTER_ANNUAL"
echo "STRIPE_PRICE_PRO_MONTHLY=$PRO_MONTHLY"
echo "STRIPE_PRICE_PRO_ANNUAL=$PRO_ANNUAL"
echo "STRIPE_PRICE_FOUNDER_MONTHLY=$FOUNDER_MONTHLY"
echo "STRIPE_PRICE_FOUNDER_ANNUAL=$FOUNDER_ANNUAL"
echo ""
echo "# Add-on Price IDs"
echo "STRIPE_PRICE_ADDON_PITCH_COACH=$COACH_PRICE"
echo "STRIPE_PRICE_ADDON_VIDEO_DECK=$VIDEO_PRICE"
echo "STRIPE_PRICE_ADDON_MONTHLY_BRANDING=$BRANDING_PRICE"
