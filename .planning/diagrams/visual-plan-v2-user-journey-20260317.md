# pitchdeck.biz v2.0 — User Journey & Upsell Architecture

> Generated: 2026-03-17
> Status: AWAITING REVIEW

## Vision

Not just a pitch deck generator — a **funding launch platform**. Users self-sign-up, pay, go through an AI-guided audio discovery session, and get a complete funding toolkit from pitch deck to business plan to data room setup.

## 3-Tier Pricing Model

| Tier | Price | What They Get |
|---|---|---|
| **Starter** | $99 | 1 AI pitch deck (10-15 slides) + sell sheet + one-pager + brand kit |
| **Pro** | $299 | Everything in Starter + promotional materials (social kit, email templates, ad creatives, press kit) + business docs (executive summary, investor update template, board deck) |
| **Launch Ready** | $999+ | Everything in Pro + full business plan, financial model template, cap table template, term sheet guide, due diligence checklist, investor CRM template, data room setup guide |

## Premium Add-ons (any tier)

| Add-on | Price | Description |
|---|---|---|
| **Pitch Coach** | $49/session | Gemini Live API real-time pitch practice with AI scoring |
| **Video Deck** | $149 | Veo 2/3 animated slide export with motion backgrounds |
| **Monthly Branding** | $49/mo | 500 tokens/mo for ongoing social graphics, mockups, collateral |

## AI Discovery Session Flow (Core Experience)

```
Step 1: "Tell me about your business"
  → Voice recording / text / file upload
  → AI extracts: business model, product, market, stage

Step 2: "What are your goals?"
  → Raise money? Sell business? Find partners? Get a loan?
  → AI tailors entire deck narrative to goal

Step 3: "Who are your investors?"
  → Angel / VC / Bank / Crowdfund / SBA / Family Office / Other
  → AI adjusts language, metrics, and framing per investor type

Step 4: "What's your ideal outcome?"
  → How much raising? What timeline? What will funds be used for?
  → AI builds the "ask" slide and use-of-funds breakdown

Step 5: "Where are you raising from?"
  → Platform (AngelList, Republic, etc.), network, geography
  → AI includes relevant market/geographic context

Step 6: "What stage are you at?"
  → Idea / MVP / Revenue / Growth
  → Team size, traction metrics, existing investors
  → AI calibrates expectations and social proof

[AI summarizes everything back, confirms understanding]
[User confirms or corrects → regenerate]
```

## Upsell Matrix

### Promotional Materials (Pro + Launch Ready)
- Website one-pager (branded landing page content)
- Social media kit (profile images, banners, post templates)
- Email templates (investor outreach, follow-up, update)
- Ad creatives (Facebook, LinkedIn, Google display)
- Press kit (company fact sheet, founder bios, logos, photos)
- Trade show / event materials (booth graphics, handouts)

### Business Documents (Pro + Launch Ready)
- Executive summary (2-page investor brief)
- Sell sheet (1-page business overview)
- Investor update template (monthly/quarterly)
- Board deck template (reporting format)
- Company overview document

### Launch Infrastructure (Launch Ready only)
- Full business plan document (20-30 pages)
- Financial model template (revenue projections, unit economics)
- Cap table template (ownership structure)
- Term sheet guide (what to expect, what to negotiate)
- Due diligence checklist (what investors will ask for)
- Investor CRM template (track outreach, follow-ups, commitments)
- Data room setup guide (what documents to prepare, how to organize)

## Architecture

```
Landing Page → Sign Up → Choose Plan → Stripe Checkout
                                           │
                                           ▼
                              AI Discovery Session (6 steps)
                              Voice + Text + Upload
                                           │
                                           ▼
                              Gemini 2.5 Pro: Business Analysis
                              Claude: Slide Content Generation
                              Nano Banana Pro: Branded Visuals
                                           │
                                           ▼
                              Preview & Edit Deck
                                           │
                              ┌────────────┼────────────┐
                              ▼            ▼            ▼
                          Export        Upsells      Add-ons
                        PPTX/PDF/     Materials/    Coach/
                        GSlides/      Docs/Launch   Video/
                        Video         Infrastructure Branding
```
