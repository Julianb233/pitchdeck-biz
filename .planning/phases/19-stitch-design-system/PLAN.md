# Phase 19: Stitch Design System + Page Designs — PLAN

**Phase Goal:** Synthesize DESIGN.md from current brand and generate all page designs in Stitch for user review BEFORE implementation.

**Status:** COMPLETE (2026-03-23)

---

## What Was Done

### 1. Design System Audit & DESIGN.md Synthesis

Performed a comprehensive audit of the live codebase design tokens and synthesized them into a complete design system document at `.stitch/DESIGN.md`.

**Sources audited:**
- `src/app/globals.css` — All CSS custom properties (brand colors, oklch semantic tokens, gradients, animations)
- `src/app/layout.tsx` — Font loading (Inter Tight), theme color meta tag
- `.stitch/designs/*.html` — 4 Stitch-generated HTML prototypes

**DESIGN.md now covers:**
- Brand identity and personality
- Complete color palette with hex, RGB, and usage notes (16 brand colors + full oklch semantic set for both dark and light modes)
- 5 named gradient definitions with usage contexts
- Glass-morphism card recipe (the unifying surface treatment)
- Typography system: font stack, type scale, heading base styles
- Spacing system mapped to Tailwind defaults
- Border radius tokens with computed values
- Shadow system (cards, glow, CTA, status, canvas)
- 15+ component patterns documented (buttons, cards, badges, pricing, nav, progress, forms)
- 12 animation classes with duration, easing, and usage
- 4 layout patterns (landing, discovery, dashboard, editor)
- Responsive breakpoints and mobile adaptation notes
- Dark mode implementation details
- Design token summary for quick reference
- Implementation notes for Phase 27

### 2. Design Token Alignment Verification

Verified alignment between:
- **Codebase tokens** (`globals.css` `:root` and `.dark` blocks)
- **Stitch prototype tokens** (inline Tailwind configs in each HTML file)
- **DESIGN.md documentation**

**Discrepancies identified and documented:**
- Stitch prototypes use Inter (CDN) vs codebase Inter Tight (next/font) — documented, implementation will use Inter Tight
- Deck editor prototype uses Public Sans — documented, will normalize to Inter Tight
- Stitch border-radius (12px/8px) differs from codebase (20px base) — documented, codebase values are source of truth
- All color values are consistent across all sources

### 3. Stitch Page Designs (4 screens)

All 4 required page designs were already generated in Stitch and exist as HTML prototypes:

| Screen | File | Key Features |
|--------|------|-------------|
| **Landing Page** | `01-landing-page.html` | Hero with gradient text, 3-step "How It Works", 2x2 deliverables grid, 3-tier pricing (Starter/Pro/Founder Suite), 6-item FAQ accordion, final CTA banner, footer |
| **Discovery Session** | `02-discovery-session.html` | 6-step progress bar, voice input with waveform visualization, text input area, file upload drop zone, AI Live Preview sidebar with slide thumbnails |
| **Dashboard** | `03-dashboard.html` | Fixed sidebar with active-state gradient, usage stats with progress bar, upgrade CTA card, 3-column recent decks grid with status badges, 6-category deliverables hub |
| **Deck Editor** | `04-deck-editor.html` | 3-panel layout (slides/canvas/editor), AI Scribe suggestions panel, layout template picker, BG color picker, font size slider, slide pagination footer |

### 4. Preview Deployment

Stitch preview with all 4 designs linked from `.stitch/preview/index.html` for browser review.

---

## Success Criteria Verification

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | DESIGN.md captures brand system (colors, typography, spacing, components) | PASS | Complete DESIGN.md with 16 brand colors, oklch semantic tokens, typography scale, spacing system, 15+ component patterns |
| 2 | Stitch screens: landing page with 3-tier pricing | PASS | `01-landing-page.html` — Starter $29 / Pro $79 (Most Popular) / Founder Suite $199 |
| 3 | Stitch screens: 6-step AI discovery wizard | PASS | `02-discovery-session.html` — 6-step progress (Business/Goals/Investors/Outcome/Location/Stage) with voice/text/upload |
| 4 | Stitch screens: dashboard/client portal | PASS | `03-dashboard.html` — Sidebar nav, stats, recent decks, deliverables hub with 6 categories |
| 5 | Stitch screens: deck preview/editor | PASS | `04-deck-editor.html` — 3-panel editor with canvas, AI Scribe, layout controls |
| 6 | User has reviewed and approved before Phase 27 | PENDING | Designs ready for review — user approval required before Phase 27 implementation |

---

## Files Modified

- `.stitch/DESIGN.md` — Comprehensive design system (rewritten with full audit)
- `.planning/phases/19-stitch-design-system/PLAN.md` — This plan document
- `.planning/phases/19-stitch-design-system/VERIFICATION.md` — Verification checklist

## Files Referenced (unchanged)

- `.stitch/designs/01-landing-page.html` — Landing page prototype
- `.stitch/designs/02-discovery-session.html` — Discovery session prototype
- `.stitch/designs/03-dashboard.html` — Dashboard prototype
- `.stitch/designs/04-deck-editor.html` — Deck editor prototype
- `.stitch/preview/index.html` — Preview hub
- `src/app/globals.css` — Design token source of truth
- `src/app/layout.tsx` — Font and theme configuration

## Next Steps

1. **User review** — Julian reviews all 4 Stitch designs via preview links
2. **Feedback iteration** — Any design revisions before Phase 27
3. **Mobile designs** — Generate responsive/mobile variants in Stitch (noted as gap)
4. **Phase 27** — Implement approved designs in React/Next.js
