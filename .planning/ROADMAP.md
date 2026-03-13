# pitchdeck.biz — v1.0 Roadmap

> AI Pitch Deck Generator + Branding Asset Subscription

## Milestone: v1.0 — Full Product Launch

### Phase 01: Design System & Brand Foundation
**Goal**: Replace the generic portfolio theme with pitchdeck.biz's bold & colorful brand identity.
- New color palette, typography scale, gradient system
- Update Tailwind config and CSS variables
- Create reusable brand components (buttons, cards, badges, gradients)
- Generate brand assets (favicon, OG images, logo)

### Phase 02: Hero & Navigation Repositioning
**Goal**: Transform the hero section and header into a pitch-deck-focused conversion machine.
- Rewrite header nav (How It Works, Deliverables, Pricing, FAQ)
- New hero: bold value prop, "Create Your Pitch Deck" CTA
- AI-generated hero graphic (Gemini) showing deck transformation
- Mobile-responsive hero with clear above-fold conversion

### Phase 03: How It Works Section
**Goal**: Visual 3-step process showing the user journey.
- Step 1: Upload docs/PDF or record audio about your business
- Step 2: AI analyzes, designs color scheme, creates layout
- Step 3: Download your pitch deck, sell sheet, branding kit
- Animated/interactive step flow with AI-generated illustrations

### Phase 04: Deliverables Showcase Section
**Goal**: Show the 4 output types with stunning visual examples.
- Investor Pitch Deck preview (slide carousel)
- Business Sell Sheet preview
- One-Pager / Executive Summary preview
- Branding Kit preview (logo, colors, typography)
- AI-generated mockup images for each deliverable

### Phase 05: Benefits & ROI Section
**Goal**: Convince visitors WHY they need a pitch deck — stats, outcomes, investor expectations.
- Key statistics (% of funded startups with pro decks, avg raise amounts)
- Pain points addressed (cost, time, quality)
- "What investors look for" breakdown
- Before/After transformation examples

### Phase 06: Subscription Upsell Section
**Goal**: Present the monthly branding asset service as a natural next step.
- Token-based monthly allocation explained simply
- Asset type gallery (social media, mockups, collateral, brand identity)
- "Never hire a graphic designer again" messaging
- Visual examples of generated assets

### Phase 07: Pricing Section
**Goal**: Clear, conversion-optimized pricing for both revenue streams.
- Pay-per-deck pricing card with feature list
- Subscription pricing card with token allocation
- Comparison/value highlights
- Stripe checkout integration (client-side)

### Phase 08: Testimonials & Social Proof
**Goal**: Replace fake designer testimonials with pitch-deck-relevant social proof.
- Business owner success stories (raised capital, closed deals)
- Key metrics (decks generated, money raised, time saved)
- Trust badges and partner logos
- Keep the marquee scroll animation

### Phase 09: FAQ & Final CTA
**Goal**: Handle objections and drive conversion at page bottom.
- 8-10 FAQs addressing common concerns
- Final CTA: "Create Your Pitch Deck Now" with urgency
- Footer with pitchdeck.biz branding, legal links, newsletter

### Phase 10: AI Business Analysis Pipeline
**Goal**: Backend that ingests business info and produces structured analysis.
- File upload API (accept docs, PDFs, images)
- Audio recording + transcription (Whisper/Gemini)
- AI business understanding pipeline (Claude/Gemini)
- Extract: business model, value prop, market, team, financials, brand essence
- Output structured JSON for deck generation

### Phase 11: AI Pitch Deck Content Generation
**Goal**: Generate slide content, copy, and structure from business analysis.
- Slide template system (10-15 slide investor deck)
- AI copy generation per slide (headlines, body, talking points)
- Sell sheet content generation
- One-pager content generation
- Branding kit content (color rationale, font pairing, brand voice)

### Phase 12: AI Image & Graphic Generation
**Goal**: Generate custom visuals for decks using Gemini APIs.
- Gemini/Imagen integration for deck graphics
- Color scheme generation from brand analysis
- Chart/data visualization generation
- Background and accent graphics per slide
- Product mockup generation for sell sheets

### Phase 13: Export & Download System
**Goal**: Generate downloadable files from AI output.
- PowerPoint export (pptxgenjs) with full styling
- PDF export for sell sheets and one-pagers
- Branding kit PDF with assets
- Image asset ZIP download
- Preview before download

### Phase 14: Payments & User System
**Goal**: Stripe integration, user accounts, and order management.
- Stripe Checkout for pay-per-deck
- Stripe Subscription for branding asset tier
- User account creation (email/password or OAuth)
- Dashboard: view past decks, download history
- Token usage tracking for subscribers

### Phase 15: Subscription Branding Asset Generator
**Goal**: Build the monthly branding asset generation interface for subscribers.
- Asset generation dashboard
- Upload product images / brand materials
- Select asset type (social, mockup, collateral, identity)
- AI generates assets using token allocation
- Download generated assets
- Token balance display and usage history

---

## Phase Dependencies

```
Phase 01 ──→ Phase 02 ──→ Phase 03 ──→ Phase 04 ──→ Phase 05
                                                        ↓
Phase 06 ←── Phase 05                              Phase 06 ──→ Phase 07
                                                        ↓
Phase 08 ──→ Phase 09 (marketing site complete)

Phase 10 ──→ Phase 11 ──→ Phase 12 ──→ Phase 13
                                           ↓
Phase 14 (can run parallel with 10-13)  Phase 15 (after 12 + 14)
```

### Parallel Execution Waves

| Wave | Phases | Description |
|------|--------|-------------|
| Wave 1 | 01 | Design system foundation |
| Wave 2 | 02, 03, 04, 05 | Marketing sections (parallel after design system) |
| Wave 3 | 06, 07, 08, 09 | More marketing + pricing (parallel) |
| Wave 4 | 10, 14 | AI pipeline + payments (parallel, independent) |
| Wave 5 | 11 | Content generation (needs phase 10) |
| Wave 6 | 12 | Image generation (needs phase 11) |
| Wave 7 | 13, 15 | Export + subscription UI (needs 12 + 14) |

---
*Last updated: 2026-03-12 after initialization*
