# pitchdeck.biz

> AI-powered pitch deck generator and branding asset subscription platform that helps startups and established businesses create professional pitch decks, sell sheets, branding kits, and ongoing marketing assets — without hiring designers.

## Problem

Businesses need professional pitch decks to raise capital, sell their business, and make strong first impressions. Most options are:
- **Expensive**: Hiring a designer costs $2,000–$10,000+ per deck
- **Slow**: Weeks of back-and-forth with designers or agencies
- **Generic**: Templates don't capture what makes a business unique
- **Ongoing pain**: Marketing assets are needed constantly, not just once

## Solution

**pitchdeck.biz** — an AI-powered platform with two revenue streams:

### 1. Pay-Per-Deck: AI Pitch Deck Generator (Core Product)
Users provide business information via **file upload** or **voice recording**, and AI generates:
- **Investor Pitch Deck** (10-15 slides): Problem, solution, market, team, financials, ask
- **Business Sell Sheet** (1-2 pages): Summary for partners, buyers, lenders
- **One-Pager / Executive Summary**: Quick pitch for intros and networking
- **Branding Kit**: Logo concepts, color palette, typography, brand guidelines

AI handles everything: understanding the business, designing color scheme/layout, generating graphics, and exporting production-ready files (PowerPoint, PDF).

### 2. Subscription: Branding Asset Generation (Upsell)
Monthly subscription providing a token allocation for ongoing AI-generated assets:
- **Social media graphics**: Instagram posts, stories, LinkedIn banners, Facebook ads
- **Product mockups**: Product on backgrounds, lifestyle shots, packaging concepts
- **Marketing collateral**: Flyers, brochures, email headers, banner ads
- **Brand identity**: Logo variations, color palettes, typography, style guides

Users send product images and branding materials; AI generates campaign-ready assets consistently. Replaces the need for graphic designers. Single tier with generous token allocation.

**Powered by**: Gemini APIs (Imagen / Nano Banana Pro 2) for image generation.

## Target Users

1. **Startup founders** — Raising seed/Series A, need investor-ready decks
2. **Small business owners** — Selling their business, seeking loans, pitching partners
3. **Entrepreneurs** — Need professional branding without designer budgets

## Marketing Site Requirements

The landing page must:
- Explicitly convey **WHY** a business needs a pitch deck (raise money, sell business, best foot forward)
- Show **HOW** the service delivers results — what's in it for them
- Feature **stunning AI-generated graphics** (bold & colorful style)
- Have a clear, linear flow that builds desire and converts

### Site Sections (Repositioned from Template)
| Section | Purpose |
|---------|---------|
| Hero | Bold value prop — "Your business story, professionally told" + clear CTA |
| How It Works | 3-step process: Upload/Speak → AI Designs → Download |
| Deliverables | Showcase the 4 output types with visual examples |
| Benefits/ROI | Why you need a pitch deck — stats, outcomes, investor expectations |
| Before/After | Transformation examples — raw info → polished deck |
| Subscription Upsell | Monthly branding assets — never hire a designer again |
| Testimonials | Business owner success stories |
| Pricing | Pay-per-deck + subscription tier |
| FAQ | Common objections answered |
| CTA | "Create Your Pitch Deck Now" — conversion |

## Onboarding Flow

Two paths, user chooses:
1. **Quick Upload**: Upload a doc/PDF/pitch notes → AI generates deck immediately
2. **Guided Interview**: Step-by-step questions or voice recording that builds the deck progressively

Both paths result in the same AI processing pipeline.

## Tech Stack (Existing)

- **Framework**: Next.js 16 (App Router) with React 19
- **Styling**: Tailwind CSS 4 + shadcn/ui components (already installed)
- **Font**: Inter Tight
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics (already configured)

## Tech Stack (To Add)

- **AI Image Generation**: Gemini APIs (Imagen / Nano Banana Pro 2)
- **AI Text/Understanding**: Claude or Gemini for business analysis
- **Audio Transcription**: Whisper API or Gemini for voice-to-text
- **Payments**: Stripe (pay-per-deck + subscription)
- **File Generation**: pptxgenjs (PowerPoint), @react-pdf/renderer (PDF)
- **File Upload**: uploadthing or similar
- **Database**: Supabase or similar for user accounts, orders, subscriptions

## Design Direction

- **Style**: Bold & colorful — vibrant colors, dynamic shapes, energetic
- **Depart from**: Current dark/minimal template aesthetic
- **Graphics**: AI-generated using Gemini/Imagen throughout the marketing site
- **Brand feel**: Professional but approachable, startup energy meets enterprise quality

## Requirements

### Validated

- ✓ Next.js 16 app structure — existing
- ✓ shadcn/ui component library — existing (50+ components)
- ✓ Tailwind CSS 4 styling — existing
- ✓ Responsive layout system — existing
- ✓ Vercel Analytics — existing
- ✓ Section-based page architecture — existing

### Active

- [ ] Reposition all marketing content for pitch deck value proposition
- [ ] Bold & colorful design system replacing current minimal theme
- [ ] AI-generated hero and section graphics (Gemini/Imagen)
- [ ] "How It Works" section with 3-step visual flow
- [ ] Deliverables showcase (4 output types with examples)
- [ ] Benefits/ROI section with stats and outcomes
- [ ] Before/After transformation examples
- [ ] Subscription upsell section for branding assets
- [ ] Pricing section (pay-per-deck + subscription)
- [ ] FAQ section addressing common objections
- [ ] Dual onboarding flow (upload OR guided interview)
- [ ] File upload system (docs, PDFs, images)
- [ ] Voice/audio recording and transcription
- [ ] AI business analysis pipeline (understand business from input)
- [ ] AI pitch deck content generation (slides, copy, structure)
- [ ] AI image/graphic generation for decks (Gemini APIs)
- [ ] Color scheme and branding extraction/generation
- [ ] PowerPoint export (pptxgenjs)
- [ ] PDF export (sell sheets, one-pagers)
- [ ] Branding kit generation (logo concepts, palette, typography)
- [ ] Stripe integration (pay-per-deck checkout)
- [ ] Stripe subscription (monthly branding asset tier)
- [ ] Token-based usage tracking for subscription
- [ ] User accounts and dashboard
- [ ] Branding asset generation interface (subscription feature)
- [ ] Social media graphic templates + AI generation
- [ ] Product mockup generation
- [ ] Marketing collateral generation

### Out of Scope

- White-label / agency features — future consideration
- Team collaboration / multi-user editing — v2
- Custom domain per user — not needed
- Video pitch generation — too complex for v1
- CRM integrations — not relevant yet

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Pay-per-deck + subscription model | Two revenue streams: one-time deck + recurring branding assets | Confirmed |
| Both upload and guided onboarding paths | Different users have different preferences; maximize conversion | Confirmed |
| All 4 deliverable types in v1 | Pitch deck, sell sheet, one-pager, branding kit — comprehensive offering | Confirmed |
| Single subscription tier | Keep it simple, generous tokens, easy decision for users | Confirmed |
| Bold & colorful design direction | Energetic, stands out from enterprise gray SaaS tools | Confirmed |
| Gemini APIs for image generation | Nano Banana Pro 2 / Imagen — best quality for branding assets | Confirmed |
| Full product in v1 | Marketing site + working generator together, not phased | Confirmed |

---
*Last updated: 2026-03-12 after initialization*
