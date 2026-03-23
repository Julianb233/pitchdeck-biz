# Roadmap: pitchdeck.biz

## Milestones

- ✅ **v1.0 — Full Product Launch** — Phases 01-15 (shipped 2026-03-12)
- 🚧 **v2.0 — Funding Launch Platform + Gemini API Overhaul** — Phases 16-28 (in progress)

## Phases

<details>
<summary>✅ v1.0 Full Product Launch (Phases 01-15) — SHIPPED 2026-03-12</summary>

- [x] Phase 01: Project scaffolding and Next.js setup
- [x] Phase 02: Supabase database schema and migrations
- [x] Phase 03: Authentication (custom JWT + session)
- [x] Phase 04: Stripe payment integration (pay-per-deck + subscription)
- [x] Phase 05: AI business analysis pipeline (Anthropic Claude)
- [x] Phase 06: Pitch deck generation engine
- [x] Phase 07: Deck preview and rendering UI
- [x] Phase 08: Export functionality (PDF, PPTX, bundle)
- [x] Phase 09: Dashboard (overview, deck history)
- [x] Phase 10: AI deck content generation API
- [x] Phase 11: Branding asset generator
- [x] Phase 12: Branding asset subscription dashboard
- [x] Phase 13: Asset history and management
- [x] Phase 14: Voice/file upload analysis pipeline
- [x] Phase 15: Branding asset generator with Gemini Imagen

</details>

### 🚧 v2.0 — Funding Launch Platform (In Progress)

**Milestone Goal:** Evolve from a deck generation tool into a full-service AI funding launch platform with 3-tier pricing, AI-guided discovery session, promotional materials, business documents, launch infrastructure, and premium add-ons — all with Stitch-designed UI/UX.

**Phase Numbering:**
- Integer phases (16, 17, 18...): Planned milestone work
- Decimal phases (17.1, 17.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 16: Gemini SDK Migration** — Replace deprecated 2.0 Flash with 2.5 Flash/Pro + structured output
- [x] **Phase 17: Nano Banana Pro + Imagen 4** — Branded slide visuals + hero/stock imagery
- [ ] **Phase 18: Native Document Understanding** — Replace pdf-parse/mammoth with Gemini Files API
- [ ] **Phase 19: Stitch Design System + Page Designs** — DESIGN.md synthesis + all page designs for review
- [ ] **Phase 20: AI Discovery Session** — 6-step voice/text guided onboarding replacing current create flow
- [ ] **Phase 21: Investor-Tailored Deck Generation** — Deck framing per investor type (VC/angel/bank/crowdfund)
- [ ] **Phase 22: 3-Tier Pricing + Stripe Overhaul** — Starter/Pro/Founder Suite + annual billing + add-ons
- [ ] **Phase 23: Promotional Materials Generator** — Social kit, email templates, ad creatives, press kit
- [ ] **Phase 24: Business Documents Generator** — Executive summary, investor updates, board deck, revision workflow
- [ ] **Phase 25: Launch Infrastructure Generator** — Business plan, financial model, cap table, DD checklist, data room
- [ ] **Phase 26: Premium Add-ons** — Veo video decks, Gemini Live pitch coach, Google Slides export
- [ ] **Phase 27: Stitch UI Implementation** — Implement approved Stitch designs across all pages
- [ ] **Phase 28: Client Portal + Full-Service Layer** — Deliverables hub, portfolio, booking calendar

## Phase Details

### Phase 16: Gemini SDK Migration
**Goal**: Replace all Gemini 2.0 Flash calls with 2.5 Flash/Pro before June 1 deprecation. Add structured output mode.
**Depends on**: Nothing (first v2.0 phase, URGENT)
**Requirements**: Tier 1 — SDK migration, 2.5 Flash, 2.5 Pro, structured output, Zod schemas
**Research**: Likely — Gemini 2.5 SDK differences, @google/genai migration path, structured output API
**Success Criteria** (what must be TRUE):
  1. All Gemini API calls use @google/genai SDK (not @google/generative-ai)
  2. All fast operations (image gen, quick analysis) use gemini-2.5-flash model
  3. Deep analysis calls use gemini-2.5-pro model
  4. All AI responses use structured output mode with Zod schemas
  5. Existing functionality (image gen, analysis) works identically with new models
**Plans**: TBD

### Phase 17: Nano Banana Pro + Imagen 4
**Goal**: Upgrade slide image generation to Nano Banana Pro for consistent branded visuals + Imagen 4 Ultra for hero/stock imagery.
**Depends on**: Phase 16 (needs 2.5 SDK)
**Requirements**: Tier 1 — Nano Banana Pro integration, Imagen 4 Ultra, branded visuals, text accuracy
**Research**: Likely — Nano Banana Pro API (reference images, text rendering), Imagen 4 Ultra endpoint
**Success Criteria** (what must be TRUE):
  1. Slide images use Nano Banana Pro with brand colors and reference images for consistency
  2. Text rendered on slide graphics is accurate and legible
  3. Hero/marketing images use Imagen 4 Ultra for photorealistic quality
  4. Image generation respects brand palette extracted from discovery session
**Plans**: TBD

### Phase 18: Native Document Understanding
**Goal**: Replace pdf-parse + mammoth with Gemini Files API for richer document analysis.
**Depends on**: Phase 16 (needs 2.5 SDK)
**Requirements**: Tier 1 — Gemini Files API, native doc understanding, replace pdf-parse/mammoth
**Research**: Unlikely — standard Gemini Files API usage
**Success Criteria** (what must be TRUE):
  1. PDF uploads are analyzed using Gemini 2.5 Pro vision (not pdf-parse)
  2. DOCX uploads are analyzed using Gemini 2.5 Pro (not mammoth)
  3. Document analysis extracts charts, tables, and visual elements (not just text)
  4. Upload flow works seamlessly with new processing pipeline
**Plans**: TBD

### Phase 19: Stitch Design System + Page Designs
**Goal**: Synthesize DESIGN.md from current brand and generate all page designs in Stitch for user review BEFORE implementation.
**Depends on**: Nothing (can run parallel with Phases 16-18)
**Requirements**: Tier 8 — DESIGN.md synthesis, landing page, create flow, dashboard, preview/editor designs
**Research**: Unlikely — Stitch tooling already available
**Success Criteria** (what must be TRUE):
  1. DESIGN.md captures pitchdeck.biz brand system (colors, typography, spacing, components)
  2. Stitch screens generated for: landing page with 3-tier pricing
  3. Stitch screens generated for: 6-step AI discovery wizard
  4. Stitch screens generated for: dashboard/client portal
  5. Stitch screens generated for: deck preview/editor
  6. User has reviewed and approved all designs before Phase 27 implementation
**Plans**: TBD

### Phase 20: AI Discovery Session
**Goal**: Build the 6-step AI-guided onboarding experience with voice/text/upload at each step. This is the core product experience.
**Depends on**: Phase 16 (needs Gemini 2.5 for AI conversation), Phase 18 (needs doc understanding)
**Requirements**: Tier 2 — all 6 discovery steps, AI summary/confirmation, voice + text + upload per step
**Research**: Likely — real-time audio transcription with Gemini, conversational step flow UX patterns
**Success Criteria** (what must be TRUE):
  1. User can speak, type, or upload documents at each of the 6 discovery steps
  2. AI asks intelligent follow-up questions based on previous answers
  3. After step 6, AI presents a complete summary of extracted business information
  4. User can confirm, correct, or add to the summary before proceeding
  5. Discovery session data feeds directly into deck generation pipeline
**Plans**: TBD

### Phase 21: Investor-Tailored Deck Generation
**Goal**: Generate pitch decks with framing, language, and emphasis tailored to the specific investor type.
**Depends on**: Phase 20 (needs discovery session data including investor type)
**Requirements**: Tier 2 — investor-type-tailored deck framing, different slides/language per investor type
**Research**: Likely — what investors of each type (VC/angel/bank/SBA) look for in pitch decks
**Success Criteria** (what must be TRUE):
  1. VC-targeted decks emphasize market size, TAM/SAM/SOM, growth metrics, and competitive moat
  2. Angel-targeted decks emphasize founder story, vision, early traction, and personal investment thesis
  3. Bank/SBA-targeted decks emphasize cash flow, collateral, repayment ability, and business stability
  4. Crowdfunding-targeted decks emphasize community, social proof, reward tiers, and viral potential
  5. Slide order, copy tone, and financial framing adjust per investor type
**Plans**: TBD

### Phase 22: 3-Tier Pricing + Stripe Overhaul
**Goal**: Replace current flat pricing with research-backed Good-Better-Best tiers ($29/$79/$199) + annual billing + premium add-on checkout.
**Depends on**: Nothing (Stripe infra changes are independent)
**Requirements**: Tier 3 — 3-tier pricing, annual billing, feature-gating, Stripe Products/Prices, upgrade/downgrade, add-on checkout
**Research**: Unlikely — Stripe pricing already well-understood from v1.0
**Success Criteria** (what must be TRUE):
  1. Pricing page shows 3 tiers with monthly/annual toggle (Pro tier visually prominent)
  2. Stripe checkout works for all 6 plans (3 monthly + 3 annual)
  3. Feature-gating enforced: Starter = 1 deck/mo, Pro = unlimited + materials, Founder = full suite
  4. Users can upgrade/downgrade tiers from dashboard
  5. Premium add-ons (Pitch Coach, Video Deck, Monthly Branding) purchasable from any tier
  6. Existing v1.0 subscribers migrated or grandfathered cleanly
**Plans**: TBD

### Phase 23: Promotional Materials Generator
**Goal**: Generate marketing/promotional assets for Pro and Founder Suite tiers.
**Depends on**: Phase 17 (needs Nano Banana Pro + Imagen 4 for visuals), Phase 22 (needs tier gating)
**Requirements**: Tier 4 — social media kit, email templates, ad creatives, press kit, website one-pager, trade show materials
**Research**: Likely — optimal formats/dimensions for each platform, email template best practices
**Success Criteria** (what must be TRUE):
  1. User can generate a social media kit (profile images, banners, post templates for major platforms)
  2. User can generate investor outreach email templates (sequence of 3-5 emails)
  3. User can generate ad creatives sized for Facebook, LinkedIn, and Google Display
  4. User can generate a press kit (fact sheet, founder bio, logo pack, boilerplate)
  5. User can generate a branded website one-pager (HTML/PDF)
  6. All materials use brand identity from discovery session
**Plans**: TBD

### Phase 24: Business Documents Generator
**Goal**: Generate professional business documents for Pro and Founder Suite tiers with revision workflow.
**Depends on**: Phase 20 (needs discovery session data), Phase 22 (needs tier gating)
**Requirements**: Tier 5 — executive summary, investor update template, board deck, company overview, revision workflow
**Research**: Unlikely — document generation patterns established in v1.0
**Success Criteria** (what must be TRUE):
  1. User can generate a 2-page executive summary from discovery data
  2. User can generate investor update templates (monthly/quarterly format)
  3. User can generate a board deck template (reporting format)
  4. User can generate a company overview document
  5. Revision workflow allows user to leave feedback on any document and trigger AI re-generation
  6. All documents exportable as PDF and DOCX
**Plans**: TBD

### Phase 25: Launch Infrastructure Generator
**Goal**: Generate comprehensive launch/fundraising infrastructure documents for Founder Suite tier.
**Depends on**: Phase 20 (needs discovery data), Phase 22 (needs Founder Suite gating)
**Requirements**: Tier 6 — business plan, financial model, cap table, term sheet guide, DD checklist, investor outreach sequences, data room guide
**Research**: Likely — business plan structure best practices, financial model templates, standard DD checklists
**Success Criteria** (what must be TRUE):
  1. User can generate a full 20-30 page business plan from discovery session data
  2. User can generate a financial model template with revenue projections and unit economics
  3. User can generate a cap table template showing ownership structure
  4. User receives a term sheet guide with negotiation framework
  5. User receives a due diligence checklist of everything investors will request
  6. User can generate investor outreach email sequences (CRM-ready)
  7. User receives a data room setup guide with document organization recommendations
**Plans**: TBD

### Phase 26: Premium Add-ons
**Goal**: Build premium features available as add-on purchases: video decks, pitch coaching, Google Slides export.
**Depends on**: Phase 16 (Gemini 2.5), Phase 17 (Nano Banana Pro for video source images), Phase 22 (add-on checkout)
**Requirements**: Tier 7 — Veo video decks, Gemini Live voice coach, Google Slides export
**Research**: Likely — Veo 2/3 API, Gemini Live API for real-time voice, Google Slides API
**Success Criteria** (what must be TRUE):
  1. User can purchase and generate a video deck with animated slides and motion backgrounds (Veo)
  2. User can purchase and start a pitch coaching session with real-time AI voice feedback (Gemini Live)
  3. AI coach provides scoring on clarity, confidence, pacing, and content coverage
  4. User can export any deck as a native Google Slides document
**Plans**: TBD

### Phase 27: Stitch UI Implementation
**Goal**: Implement all Stitch-approved designs across the application.
**Depends on**: Phase 19 (designs must be approved), Phase 20 (discovery flow built), Phase 22 (pricing tiers built)
**Requirements**: Tier 8 — implement all approved Stitch designs
**Research**: Unlikely — implementing approved designs
**Success Criteria** (what must be TRUE):
  1. Landing page matches Stitch-approved design with 3-tier pricing section
  2. Create flow uses Stitch-approved 6-step discovery wizard design
  3. Dashboard matches Stitch-approved client portal design
  4. Deck preview/editor matches Stitch-approved design
  5. All pages are responsive (mobile, tablet, desktop)
  6. Visual consistency across all pages matches DESIGN.md system
**Plans**: TBD

### Phase 28: Client Portal + Full-Service Layer
**Goal**: Tie everything together with a client portal, portfolio page, and booking calendar.
**Depends on**: Phase 24 (revision workflow), Phase 27 (Stitch UI)
**Requirements**: Tier 9 — client portal, portfolio/case studies, booking calendar
**Research**: Likely — Cal.com embed/API, portfolio page patterns
**Success Criteria** (what must be TRUE):
  1. Client portal shows all deliverables (decks, documents, materials) with download/revision status
  2. Portfolio page showcases anonymized past deck examples as social proof
  3. Users can book human consultation calls via embedded calendar
  4. All deliverables accessible from a single hub with clear status indicators
**Plans**: TBD

## Dependencies

```
Phase 16 (SDK Migration) ──┬──▶ Phase 17 (Nano Banana + Imagen)
                           ├──▶ Phase 18 (Doc Understanding)
                           ├──▶ Phase 20 (Discovery Session, also needs 18)
                           └──▶ Phase 26 (Premium Add-ons, also needs 17, 22)

Phase 19 (Stitch Designs) ────▶ Phase 27 (Stitch Implementation, also needs 20, 22)

Phase 20 (Discovery) ─────┬──▶ Phase 21 (Investor-Tailored Decks)
                           ├──▶ Phase 23 (Promo Materials, also needs 17, 22)
                           ├──▶ Phase 24 (Business Docs, also needs 22)
                           └──▶ Phase 25 (Launch Infrastructure, also needs 22)

Phase 22 (Pricing/Stripe) ┬──▶ Phase 23, 24, 25 (tier-gated generators)
                           └──▶ Phase 26 (add-on checkout)

Phase 24 (Business Docs) ─┬──▶ Phase 28 (Client Portal, also needs 27)
Phase 27 (Stitch UI) ─────┘
```

### Parallel Execution Waves

| Wave | Phases | Description |
|------|--------|-------------|
| Wave 1 | 16, 19 | SDK migration + Stitch designs (parallel, independent) |
| Wave 2 | 17, 18, 22 | Image upgrades + doc understanding + Stripe (parallel after 16) |
| Wave 3 | 20 | AI Discovery Session (needs 16 + 18) |
| Wave 4 | 21, 23, 24, 25 | Generators (parallel after 20 + 22) |
| Wave 5 | 26, 27 | Premium add-ons + Stitch implementation (parallel) |
| Wave 6 | 28 | Client portal (final integration) |

## Progress

**Execution Order:**
Phases execute in numeric order within waves: 16 → 17/18/19 → 20/22 → 21/23/24/25 → 26/27 → 28

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 16. Gemini SDK Migration | 0/TBD | Not started | - |
| 17. Nano Banana Pro + Imagen 4 | 0/TBD | Not started | - |
| 18. Native Doc Understanding | 0/TBD | Not started | - |
| 19. Stitch Design System | 0/TBD | Not started | - |
| 20. AI Discovery Session | 0/TBD | Not started | - |
| 21. Investor-Tailored Decks | 0/TBD | Not started | - |
| 22. 3-Tier Pricing + Stripe | 0/TBD | Not started | - |
| 23. Promotional Materials | 0/TBD | Not started | - |
| 24. Business Documents | 0/TBD | Not started | - |
| 25. Launch Infrastructure | 0/TBD | Not started | - |
| 26. Premium Add-ons | 0/TBD | Not started | - |
| 27. Stitch UI Implementation | 0/TBD | Not started | - |
| 28. Client Portal | 0/TBD | Not started | - |

---
*Last updated: 2026-03-17 after v2.0 roadmap creation*
