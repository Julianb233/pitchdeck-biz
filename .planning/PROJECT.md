# pitchdeck.biz

**DEPLOYED:** https://pitchdeck.biz (v1.0 — 2026-03-12)

> Full-service AI pitch deck consultation platform — from business analysis through investor-ready deliverables — powered by Gemini 2.5 Pro, Nano Banana Pro, Imagen 4, Veo, and Claude. Includes AI strategy sessions, market research, investor readiness scoring, pitch coaching, and premium Stitch-designed UI/UX.

## Core Value

Transform any business idea into investor-ready materials through an AI-powered full-service consultation experience — not just a generator tool, but a strategic partner.

## Current Milestone: v2.0 — Full-Service Consultation Platform + Gemini API Overhaul

**Goal:** Evolve from a deck generation tool into a full-service AI consultation platform with modern Gemini APIs, premium Stitch-designed UI/UX, and consultation features that justify $500-2000 pricing.

**Target features:**
- Gemini 2.5 Flash/Pro replacing deprecated 2.0 Flash (mandatory — 2.0 dies June 1, 2026)
- Nano Banana Pro for consistent branded slide visuals with text accuracy
- Imagen 4 Ultra for hero/stock imagery
- Native Gemini document understanding replacing pdf-parse/mammoth
- Consultation intake questionnaire + AI strategy session
- Market research reports + investor readiness scoring
- Veo 2/3 animated video deck export (premium)
- Gemini Live API voice coach for pitch practice (premium)
- Google Slides export format
- Revision workflow with client feedback loop
- Stitch-designed pages: landing, create flow, dashboard, preview/editor
- Client portal with deliverables hub
- Portfolio / case studies pages
- Booking/scheduling for human consultation calls

## Problem

Businesses need professional pitch decks to raise capital, sell their business, and make strong first impressions. Most options are:
- **Expensive**: Hiring a designer costs $2,000–$10,000+ per deck
- **Slow**: Weeks of back-and-forth with designers or agencies
- **Generic**: Templates don't capture what makes a business unique
- **Ongoing pain**: Marketing assets are needed constantly, not just once
- **No strategy**: Tools generate decks but don't help you understand what investors want

## Solution

**pitchdeck.biz** — a full-service AI consultation platform with three revenue streams:

### 1. Pay-Per-Deck: AI Pitch Deck Generator (Core Product)
Users provide business information via **file upload** or **voice recording**, and AI generates:
- **Investor Pitch Deck** (10-15 slides): Problem, solution, market, team, financials, ask
- **Business Sell Sheet** (1-2 pages): Summary for partners, buyers, lenders
- **One-Pager / Executive Summary**: Quick pitch for intros and networking
- **Branding Kit**: Logo concepts, color palette, typography, brand guidelines

### 2. Subscription: Branding Asset Generation (Upsell)
Monthly subscription providing a token allocation for ongoing AI-generated assets:
- Social media graphics, product mockups, marketing collateral, brand identity

### 3. Consultation Package (NEW in v2.0)
Full-service AI-powered consultation including:
- **Discovery intake** — guided questionnaire extracting business DNA
- **AI strategy session** — business positioning, messaging, narrative arc
- **Market research report** — competitive landscape, market sizing, trends
- **Investor readiness score** — gap analysis + actionable recommendations
- **Pitch coaching** — real-time voice practice with AI feedback (Gemini Live)
- **Revision workflow** — client feedback loop with AI re-generation
- **Video deck** — animated slide export via Veo (premium add-on)

## Target Users

1. **Startup founders** — Raising seed/Series A, need investor-ready decks
2. **Small business owners** — Selling their business, seeking loans, pitching partners
3. **Entrepreneurs** — Need professional branding without designer budgets
4. **Consultants/Agencies** — Offering deck services to their clients (future)

## Tech Stack

### Current (v1.0)
- **Framework**: Next.js 15.5.12 (App Router) with React 19
- **Styling**: Tailwind CSS 4 + shadcn/ui (50+ components)
- **Database**: Supabase (11 tables, RLS, RPC functions)
- **Payments**: Stripe (pay-per-deck + subscription, full webhook handler)
- **AI — Text**: Anthropic Claude Sonnet 4 (analysis + deck gen)
- **AI — Images**: Gemini 2.0 Flash (DEPRECATED June 1, 2026) + SVG fallback
- **AI — Audio**: OpenAI Whisper (transcription)
- **Export**: pptxgenjs (PPTX), jspdf (PDF), jszip (bundle)
- **Deployment**: Vercel

### v2.0 Upgrades
- **AI — Text**: Gemini 2.5 Pro (strategy, research, analysis) + Claude (deck gen)
- **AI — Fast**: Gemini 2.5 Flash (chat assistant, quick edits, routing)
- **AI — Slide Images**: Nano Banana Pro (consistent branded visuals, 14 ref images)
- **AI — Hero/Stock**: Imagen 4 Ultra ($0.06/image)
- **AI — Video**: Veo 2/3 (animated deck export, $0.10-0.35/sec)
- **AI — Voice**: Gemini Live API (real-time pitch coaching)
- **AI — Docs**: Gemini Files API + 2.5 Pro (native doc understanding)
- **AI — Output**: Structured Output mode (Zod schemas → guaranteed JSON)
- **Export**: Google Slides API (native GSlides format)
- **UI/UX**: Stitch-designed pages (review before implementation)
- **Scheduling**: Cal.com or Calendly integration

## Requirements

### Validated (v1.0 — shipped 2026-03-12)

- ✓ Next.js app with 37 pages, 28 API routes — v1.0
- ✓ Full auth system (signup, login, email verification, password reset) — v1.0
- ✓ File upload + text extraction (PDF, DOCX, TXT, images) — v1.0
- ✓ Audio recording + Whisper transcription — v1.0
- ✓ Claude-powered business analysis pipeline — v1.0
- ✓ AI pitch deck content generation (10-12 slides) — v1.0
- ✓ Gemini 2.0 Flash image generation + SVG fallback — v1.0
- ✓ PowerPoint export (pptxgenjs) — v1.0
- ✓ PDF export (sell sheet, one-pager, brand kit) — v1.0
- ✓ ZIP bundle export — v1.0
- ✓ Stripe checkout (pay-per-deck $99) — v1.0
- ✓ Stripe subscription ($49/mo, 500 tokens) — v1.0
- ✓ Full webhook handler (6 event types, idempotent) — v1.0
- ✓ Token-based usage tracking with atomic deductions — v1.0
- ✓ User dashboard (decks, analyses, assets, token balance) — v1.0
- ✓ Branding asset generation interface — v1.0
- ✓ Rate limiting on all endpoints — v1.0
- ✓ Supabase schema (11 tables, RLS, RPC functions) — v1.0
- ✓ Landing page with all marketing sections — v1.0
- ✓ 3-step create flow (upload/voice → processing → review) — v1.0
- ✓ Deck preview with slide navigation — v1.0

### Active (v2.0)

**Tier 1: Gemini API Upgrades (URGENT — 2.0 Flash deprecated June 1)**
- [ ] Migrate from Gemini 2.0 Flash to Gemini 2.5 Flash for all fast operations
- [ ] Add Gemini 2.5 Pro for deep business analysis and strategy reports
- [ ] Integrate Nano Banana Pro for consistent branded slide visuals (text accuracy, 14 ref images)
- [ ] Add Imagen 4 Ultra for hero/stock imagery
- [ ] Replace pdf-parse + mammoth with Gemini native document understanding (Files API)
- [ ] Implement structured output mode (Zod schemas) on all Gemini calls
- [ ] Update @google/generative-ai SDK to latest (@google/genai)

**Tier 2: Consultation Service Layer**
- [ ] Consultation intake questionnaire (multi-step discovery form)
- [ ] AI strategy session module (business positioning, narrative arc)
- [ ] Market research report generation (competitive landscape, sizing, trends)
- [ ] Investor readiness score (gap analysis + recommendations)
- [ ] Revision workflow (client feedback comments → AI re-generation)
- [ ] Booking/scheduling integration (Cal.com or Calendly)

**Tier 3: Premium Features**
- [ ] Veo 2/3 video deck export (animated slides, motion backgrounds)
- [ ] Gemini Live API voice coach (real-time pitch practice with AI feedback)
- [ ] Google Slides export format (native GSlides via API)
- [ ] Portfolio / case studies page (showcase anonymized past decks)

**Tier 4: Stitch UI/UX Overhaul**
- [ ] Synthesize DESIGN.md from current brand
- [ ] Stitch: Landing page redesign (bold, conversion-optimized)
- [ ] Stitch: Create flow redesign (guided consultation wizard UX)
- [ ] Stitch: Dashboard redesign (client portal feel)
- [ ] Stitch: Preview/editor redesign (interactive slide viewer + editing)
- [ ] User reviews all Stitch designs before implementation

**Tier 5: Full-Service Layer**
- [ ] Client portal (deliverables hub + revision tracking)
- [ ] Consultation package pricing tier ($500-2000 range)
- [ ] Booking calendar integration for human consultation calls

### Out of Scope

- White-label / agency features — future v3 consideration
- Team collaboration / multi-user editing — deferred, not needed for consultation model
- Custom domain per user — not relevant to service model
- CRM integrations — not relevant yet
- Mobile app — web-first, mobile-responsive sufficient
- Real-time collaborative editing — single-user consultation model
- AI-generated pitch videos with voiceover narration — Veo for animated slides only, not full video production

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Pay-per-deck + subscription model | Two revenue streams: one-time deck + recurring branding assets | ✓ Good |
| Both upload and guided onboarding paths | Different users have different preferences; maximize conversion | ✓ Good |
| All 4 deliverable types in v1 | Pitch deck, sell sheet, one-pager, branding kit — comprehensive offering | ✓ Good |
| Single subscription tier | Keep it simple, generous tokens, easy decision for users | ✓ Good |
| Bold & colorful design direction | Energetic, stands out from enterprise gray SaaS tools | ✓ Good |
| Gemini APIs for image generation | Nano Banana Pro / Imagen — best quality for branding assets | ✓ Good |
| Full product in v1 | Marketing site + working generator together, not phased | ✓ Good |
| Gemini 2.5 for v2.0 | 2.0 Flash deprecated June 1 — mandatory migration + capability upgrade | — Pending |
| Stitch for UI/UX design | Design-first approach — review before implementation, premium look | — Pending |
| Consultation tier pricing $500-2000 | Full-service justifies premium over $99 self-serve | — Pending |
| Gemini Live API for pitch coaching | Real-time voice interaction, unique differentiator | — Pending |
| Veo for video decks | Premium add-on, emerging trend in investor presentations | — Pending |
| Keep Claude for deck generation | Claude excels at structured content; Gemini for research + images | — Pending |

## Constraints

- **Deadline**: Gemini 2.0 Flash shutdown June 1, 2026 — Tier 1 migration is non-negotiable
- **Design review**: All Stitch designs must be reviewed by user before code implementation
- **API costs**: Veo at $0.10-0.35/sec and Nano Banana Pro at $0.13/image need cost controls
- **Backwards compatibility**: Existing v1.0 users and Stripe subscriptions must continue working

---
*Last updated: 2026-03-17 after v2.0 milestone initialization*
