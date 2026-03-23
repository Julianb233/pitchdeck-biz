# pitchdeck.biz Design System

> Synthesized from the live codebase (`src/app/globals.css`, `src/app/layout.tsx`) and Stitch-generated screen designs.
> Stitch Project: `4882024256054424284`
> Last updated: 2026-03-23 (Phase 19 — full design system audit)

---

## Brand Identity

**Product:** AI-powered pitch deck and funding launch platform
**Personality:** Bold, colorful, energetic. Startup energy meets enterprise quality.
**Mode:** Dark-first (deep purple-black backgrounds). Light mode supported but secondary.
**Font:** Inter Tight (primary), Geist Mono (code/monospace)
**Theme Color (meta):** `#7c3aed`

---

## Color Palette

### Brand Colors (CSS custom properties on `:root`)

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--brand-primary` | `#7c3aed` | `124, 58, 237` | Electric Violet — Primary actions, CTAs, active states, rings |
| `--brand-primary-light` | `#a78bfa` | `167, 139, 250` | Hover states, secondary highlights |
| `--brand-primary-dark` | `#5b21b6` | `91, 33, 182` | Pressed states, deep borders |
| `--brand-secondary` | `#f97316` | `249, 115, 22` | Energetic Orange — Accents, badges, Starter tier |
| `--brand-secondary-light` | `#fdba74` | `253, 186, 116` | Subtle warm highlights |
| `--brand-secondary-dark` | `#c2410c` | `194, 65, 12` | Dark warm accents |
| `--brand-success` | `#10b981` | `16, 185, 129` | Fresh Green — Success states, completed steps, "ready" badges |
| `--brand-success-light` | `#6ee7b7` | `110, 231, 183` | Success highlights |
| `--brand-success-dark` | `#047857` | `4, 120, 87` | Deep success |
| `--brand-accent` | `#ec4899` | `236, 72, 153` | Hot Pink — Eye-catching accents, gradient endpoints, CTA glow |
| `--brand-accent-light` | `#f9a8d4` | `249, 168, 212` | Soft pink accents |
| `--brand-accent-dark` | `#be185d` | `190, 24, 93` | Deep pink |
| `--brand-blue` | `#3b82f6` | `59, 130, 246` | Electric Blue — Links, info states, shared status |
| `--brand-blue-light` | `#93c5fd` | `147, 197, 253` | Light info |
| `--brand-blue-dark` | `#1d4ed8` | `29, 78, 216` | Deep info |
| `--brand-cyan` | `#06b6d4` | `6, 182, 212` | Cyan — Charts, tertiary accent |

### Semantic Colors (oklch, shadcn/ui CSS variables)

**Dark Mode (default — `.dark` class):**

| Token | oklch Value | Approx Hex | Usage |
|-------|------------|------------|-------|
| `--background` | `oklch(0.07 0.01 280)` | `#0a0a14` | Deep purple-black page bg |
| `--foreground` | `oklch(0.985 0 0)` | `#fafafa` | Near-white text |
| `--card` | `oklch(0.1 0.015 280)` | `#111118` | Card surfaces |
| `--card-foreground` | `oklch(0.985 0 0)` | `#fafafa` | Card text |
| `--popover` | `oklch(0.1 0.015 280)` | `#111118` | Popover bg |
| `--primary` | `oklch(0.65 0.25 293)` | `#7c3aed` | Primary interactive (violet) |
| `--primary-foreground` | `oklch(1 0 0)` | `#ffffff` | Text on primary |
| `--secondary` | `oklch(0.15 0.02 280)` | `#1a1a24` | Secondary surfaces |
| `--secondary-foreground` | `oklch(0.985 0 0)` | `#fafafa` | Text on secondary |
| `--muted` | `oklch(0.15 0.01 280)` | `#1a1a22` | Muted backgrounds |
| `--muted-foreground` | `oklch(0.68 0 0)` | `#999999` | Subdued text |
| `--accent` | `oklch(0.7 0.2 350)` | `#ec4899` | Hot pink accent |
| `--accent-foreground` | `oklch(1 0 0)` | `#ffffff` | Text on accent |
| `--border` | `oklch(0.22 0.02 280)` | `#2a2a38` | Subtle purple-tinted borders |
| `--input` | `oklch(0.22 0.02 280)` | `#2a2a38` | Input borders |
| `--ring` | `oklch(0.65 0.25 293)` | `#7c3aed` | Focus ring |
| `--destructive` | `oklch(0.396 0.141 25.723)` | `#7f1d1d` | Error bg |
| `--destructive-foreground` | `oklch(0.637 0.237 25.331)` | `#dc2626` | Error text |
| `--sidebar` | `oklch(0.1 0.015 280)` | `#111118` | Sidebar bg |
| `--sidebar-primary` | `oklch(0.65 0.25 293)` | `#7c3aed` | Sidebar active |
| `--sidebar-accent` | `oklch(0.2 0.03 280)` | `#22222f` | Sidebar hover |
| `--sidebar-border` | `oklch(0.22 0.02 280)` | `#2a2a38` | Sidebar dividers |

**Light Mode (`:root` defaults):**

| Token | oklch Value | Approx Hex | Usage |
|-------|------------|------------|-------|
| `--background` | `oklch(1 0 0)` | `#ffffff` | White bg |
| `--foreground` | `oklch(0.13 0 0)` | `#1a1a1a` | Near-black text |
| `--card` | `oklch(1 0 0)` | `#ffffff` | Card surfaces |
| `--primary` | `oklch(0.488 0.243 293)` | `#6d28d9` | Deeper violet for contrast |
| `--secondary` | `oklch(0.97 0.005 293)` | `#f5f3ff` | Light violet wash |
| `--muted` | `oklch(0.97 0 0)` | `#f5f5f5` | Light muted |
| `--muted-foreground` | `oklch(0.45 0 0)` | `#666666` | Subdued text |
| `--border` | `oklch(0.9 0.01 293)` | `#e5e0f0` | Light violet-tinted border |

### Chart Colors (oklch)

| Token | Value | Purpose |
|-------|-------|---------|
| `--chart-1` | Violet (293 hue) | Primary data series |
| `--chart-2` | Orange (45 hue) | Secondary data series |
| `--chart-3` | Pink (350 hue) | Tertiary data series |
| `--chart-4` | Green (162 hue) | Quaternary data series |
| `--chart-5` | Blue (250 hue) | Quinary data series |

---

## Gradients

| Token | Definition | Usage |
|-------|-----------|-------|
| `--brand-gradient-primary` | `135deg, #7c3aed 0%, #ec4899 50%, #f97316 100%` | Primary CTA glow effect, hero elements |
| `--brand-gradient-hero` | `135deg, #7c3aed → #3b82f6 → #06b6d4 → #10b981 → #f97316` | Hero backgrounds, full-spectrum wow |
| `--brand-gradient-cta` | `135deg, #7c3aed 0%, #ec4899 100%` | CTA buttons, gradient-primary in Stitch |
| `--brand-gradient-accent` | `135deg, #f97316 → #ec4899 → #7c3aed` | Reverse accent gradient |
| `--brand-gradient-bar` | `90deg, #ec4899 → #7c3aed → #3b82f6 → #06b6d4 → #10b981 → #f97316 → #ec4899` | Animated top gradient bar (1px) |

**Glass morphism gradient** (from Stitch prototypes):
```css
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08-0.1);
}
```

---

## Typography

### Font Stack

| Priority | Font | Variable | Usage |
|----------|------|----------|-------|
| 1 | Inter Tight | `--font-inter-tight` | Primary — headings, body, UI |
| 2 | Inter | fallback | Close match fallback |
| 3 | Geist | fallback | System fallback |
| 4 | Geist Mono | `--font-mono` | Code blocks, monospace data |

### Type Scale

| Element | Weight | Tracking | Line Height | Additional |
|---------|--------|----------|-------------|------------|
| Hero title (h1) | `font-black` (800-900) | `tracking-tight` | `1` | Word blur-reveal animation, gradient-to-foreground |
| Page title (h1) | `font-bold` (700) | `tracking-tight` | `1` | `text-3xl` to `text-4xl` |
| Section title (h2) | `font-extrabold` (800) | `tracking-tight` | `1` | `text-3xl sm:text-4xl`, scroll-triggered blur reveal |
| Card title (h3/h4) | `font-bold` (700) | default | default | `text-xl` or `text-lg` |
| Body | `font-normal` (400) | default | default | `antialiased` |
| Small/label | `font-medium` to `font-bold` | `tracking-wider` to `tracking-widest` | default | `text-xs`, `text-[10px]`, `uppercase` |
| Gradient text | — | — | — | `.analysis-word-gradient` — animated `background-clip: text` |

### Heading base styles (globals.css `@layer base`)
```css
h1, h2, h3, h4, h5, h6 {
  font-weight: 600; /* font-semibold */
  letter-spacing: -0.025em; /* tracking-tight */
  line-height: 1;
}
```

---

## Spacing System

Uses Tailwind 4 default spacing scale (1 unit = 0.25rem = 4px).

| Context | Values | Notes |
|---------|--------|-------|
| Section padding | `py-16` to `py-24` (64-96px) | Vertical section rhythm |
| Container max-width | `max-w-7xl` (80rem = 1280px) | With `px-4 sm:px-6 lg:px-8` side padding |
| Card padding | `p-6` to `p-8` (24-32px) | Internal card spacing |
| Element gaps | `gap-4` to `gap-8` (16-32px) | Between grid/flex children |
| Component gaps | `gap-2` to `gap-3` (8-12px) | Between icons and text, small groups |
| Dashboard main padding | `p-10` (40px) | Main content area in dashboard layout |

---

## Border Radius

| Token | Value | Computed | Usage |
|-------|-------|----------|-------|
| `--radius` | `1.25rem` | 20px | Base (cards, modals) |
| `--radius-sm` | `calc(--radius - 8px)` | 12px | Small elements, inputs |
| `--radius-md` | `calc(--radius - 4px)` | 16px | Medium elements |
| `--radius-lg` | `var(--radius)` | 20px | Cards, modals (= base) |
| `--radius-xl` | `calc(--radius + 4px)` | 24px | Large containers, hero CTA sections |
| `rounded-full` | `9999px` | pill | Badges, avatars, step circles |

**Stitch prototypes use:**
- Cards: `rounded-xl` (12px in Stitch Tailwind config) or `rounded-theme-card` (12px)
- Buttons: `rounded-lg` (8px) or `rounded-theme-btn` (8px)
- Inputs: `rounded-xl` or `rounded-lg`

---

## Shadows

| Context | Value | Notes |
|---------|-------|-------|
| Cards (dark mode) | `shadow-lg` with purple tint | Via `box-shadow: 0 8px 32px rgba(0,0,0,0.37)` |
| Elevated elements | `shadow-xl` | Standard Tailwind |
| Purple glow | `box-shadow: 0 0 25-40px rgba(124, 58, 237, 0.3-0.4)` | Highlighted cards, Pro pricing |
| CTA glow | `.brand-gradient-glow::after` — `filter: blur(20px)` | Hover glow on gradient buttons |
| Status glow | `shadow-[0_0_8px_rgba(16,185,129,0.5)]` | Green "saved" indicator dots |
| Slide canvas | `shadow-[0_32px_64px_rgba(0,0,0,0.5)]` | Editor main canvas |

---

## Component Patterns

### Buttons

| Type | Styles | Usage |
|------|--------|-------|
| **Primary CTA** | `bg-gradient-primary` (violet→pink), white text, `rounded-lg/xl`, `.brand-gradient-glow` hover | Main actions: "Create Deck", "Get Started" |
| **Secondary** | `border border-white/20`, transparent bg, `hover:bg-white/5` | Secondary actions: "See How It Works", "Back" |
| **Ghost** | No border, text only, `hover:text-white` | Tertiary: "Skip for now", "Log In" |
| **Danger** | `bg-destructive` bg | Delete, cancel |
| **Icon button** | `glass-card p-2.5`, icon only | Notifications, settings toggles |

### Cards

| Type | Styles | Notes |
|------|--------|-------|
| **Glass card** | `rgba(255,255,255,0.03)`, `backdrop-filter: blur(12px)`, `border: 1px solid rgba(255,255,255,0.08-0.1)` | Primary card style across all prototypes |
| **Hover effect** | `hover:border-primary/50`, `hover-glow` (translateY -4px + purple shadow) | Interactive cards |
| **Feature card** | Glass + icon left + text right | How-it-works, deliverables |
| **Deck card** | Glass + gradient cover image + metadata below | Dashboard deck grid |
| **Stat card** | Glass + usage progress bar or upgrade CTA | Dashboard stats row |

### Badges

| Type | Style | Usage |
|------|-------|-------|
| **Plan badge** | `bg-primary/20 text-primary border border-primary/30`, `text-[10px] uppercase tracking-wider` | "PRO PLAN", "STARTER" |
| **Most Popular** | `bg-orange-500 text-white`, `text-[10px] font-bold`, `rounded-full`, absolute positioned | Pro pricing tier |
| **Status: Ready** | Green dot + `text-slate-400` label | Deck "Ready for pitch" |
| **Status: Drafting** | Yellow dot + label | Deck in progress |
| **Status: Review** | Blue dot + label | Deck awaiting review |
| **AI indicator** | `bg-primary/10 border border-primary/20`, sparkle icon + uppercase label | "AI Scribe", "AI Live Preview" |

### Pricing Cards (3-tier Good-Better-Best)

| Tier | Price | Visual Treatment |
|------|-------|-----------------|
| **Starter** | $29/one-time | Standard glass card, no highlight, `border-white/5` |
| **Pro** | $79/one-time | Gradient border (violet→pink `::before`), purple glow, `scale-105`, "Most Popular" badge |
| **Founder Suite** | $199/one-time | Standard glass card, premium positioning |

- Annual toggle with 25% savings callout (v2.0 will add subscription billing)
- Value anchor: "Agency-quality pitch decks start at $5,000"
- Checkmark icons colored: violet (Starter/Founder), pink (Pro)

### Navigation

| Element | Style |
|---------|-------|
| **Header (public)** | `sticky top-0`, dark bg + `backdrop-blur-md`, `border-b border-white/10`, logo left, nav center, CTA right |
| **Header (editor)** | `h-16`, dark bg, logo + save status left, export/share/avatar right |
| **Sidebar (dashboard)** | `w-[240px]`, `fixed h-full`, `bg-[#0d0d14]`, `border-r border-white/5` |
| **Sidebar nav items** | Icon + label, `text-slate-400`, `hover:text-white hover:bg-white/5` |
| **Sidebar active** | `text-white`, `border-l-2 border-primary`, gradient fill `sidebar-active-gradient` |
| **Gradient bar** | `1px` animated gradient line below header (`bottom-gradient-bar`), `fixed top-80px` |

### Progress Indicators

| Type | Style |
|------|-------|
| **Step bar (discovery)** | Numbered circles (`w-6 h-6 rounded-full`), connected by lines (`w-12 h-[1px] bg-white/20`) |
| **Current step** | `bg-electric-violet`, bold label in violet |
| **Future step** | `border border-white/40`, `opacity-40` |
| **Completed step** | Green bg with check icon |
| **Usage bar** | `bg-white/5 h-2 rounded-full` track, `bg-primary rounded-full shadow-purple-glow` fill |

### Forms / Inputs

| Element | Style |
|---------|-------|
| **Text input** | `bg-white/5 border border-white/10 rounded-lg/xl`, `focus:ring-2 focus:ring-primary focus:border-transparent` |
| **Textarea** | Same as input, `resize-none`, `placeholder-white/20` |
| **Labels** | `text-[10px] font-bold text-slate-500 tracking-wider uppercase` |
| **File upload** | `border-2 border-dashed border-primary/40`, `bg-primary/5`, `hover:bg-primary/10` |
| **Range slider** | `bg-white/10 h-1 rounded-full accent-primary` |

---

## Animation System

| Animation | Class | Duration | Easing | Usage |
|-----------|-------|----------|--------|-------|
| Word blur reveal | `.hero-word` | 1s per word (staggered) | ease-out | Hero title entrance with gradient→foreground color |
| Section title reveal | `.section-title-animate` | 1s on scroll | ease-out | Section headings blur-in with gradient flash |
| Gradient text cycle | `.analysis-word-gradient` | 2s infinite | ease | Key highlighted words, shimmer effect |
| Gradient bar flow | `.bottom-gradient-bar` | 0.3s slide + 2s flow infinite | ease-out, linear | Top accent bar below header |
| Orb rotation | `.animate-orb-rotate` | 20s infinite | linear | Background decorative orbs with hue-rotate |
| Floating cards | `.hero-float-main/1/2` | 6-8s infinite | ease-in-out | Hero card preview gentle float |
| Marquee | `.animate-marquee` | 30s infinite | linear | Logo carousel |
| Scroll carousel | `.animate-scroll-left/right` | 25s infinite | linear | Testimonial rows |
| Button glow | `.brand-gradient-glow` | 0.3s on hover | ease | Gradient pseudo-element fade-in |
| Hover lift | `.hover-glow` | 0.3s on hover | ease | Card translateY(-4px) + purple shadow |
| Waveform bars | `.waveform-bar` | 1.2s infinite (staggered) | ease-in-out | Voice input active indicator |
| Status pulse | `.status-pulse` | 2s infinite | — | Green "building" indicator |

**All animations respect `prefers-reduced-motion: reduce`** — animations are disabled, elements show in final state.

---

## Layout Patterns

### Landing Page
- Full-width sections alternating bg (dark / `bg-white/5` / dark)
- `max-w-7xl` container with responsive padding
- Hero: 2-column grid (text left, visual right) on `lg:`, stacked on mobile
- How It Works: 3-column grid on `md:`
- Deliverables: 2-column grid on `sm:`
- Pricing: 3-column grid on `lg:`, Pro card elevated
- FAQ: Single column, `max-w-3xl`, accordion `<details>` elements
- Final CTA: Full-width gradient banner with `rounded-3xl`
- Footer: Logo left, nav center, social right on `md:`

### Discovery Session (Create Flow)
- Full viewport height, 3-zone layout:
  - **Top:** Sticky header with step progress bar
  - **Center:** 65/35 split — input area (left) + AI preview sidebar (right)
  - **Bottom:** Fixed footer with step count + back/next navigation
- Voice input: Large gradient button centered in glass card
- "OR TYPE MANUALLY" divider between voice and text
- File upload: Dashed border drop zone

### Dashboard
- Fixed sidebar (240px) + scrollable main content
- Main content: `ml-[240px] p-10`
- Stats row: 2-column grid (usage + upgrade CTA)
- Recent decks: 3-column grid of deck cards with gradient cover images
- Deliverables hub: 3-column grid of category cards with icons and item counts

### Deck Editor
- Full viewport, no scroll on outer frame (`overflow-hidden h-screen flex flex-col`)
- 3-panel layout:
  - **Left:** Slide thumbnails (200px), vertical scroll
  - **Center:** Slide canvas with aspect-video, centered, `bg-[#121218]`
  - **Right:** Slide editor panel (280px) with form controls + AI Scribe
- Top toolbar: Logo + save status + export/share
- Bottom bar: Slide pagination + present button

---

## Responsive Breakpoints

Uses Tailwind 4 defaults:

| Breakpoint | Width | Notes |
|------------|-------|-------|
| `sm` | 640px | 2-col grids start |
| `md` | 768px | 3-col grids, horizontal nav |
| `lg` | 1024px | Full layout, hero 2-col |
| `xl` | 1280px | max-w-7xl matches |

### Mobile Adaptations
- Nav: Hamburger menu (not yet prototyped in Stitch)
- Pricing: Stacked single-column
- Discovery: Full-width input, sidebar collapses below
- Dashboard: Sidebar becomes bottom tab bar or drawer
- Editor: Slide list becomes horizontal strip, right panel becomes bottom sheet

---

## Dark Mode Implementation

- **CSS approach:** `.dark` class on `<html>` or parent
- **Tailwind variant:** `@custom-variant dark (&:is(.dark *));`
- **Default state:** App renders in dark mode (most users, primary brand expression)
- **Light mode:** Full token set defined in `:root`, functional but secondary priority
- **Theme bridging:** `@theme inline` block maps CSS vars to Tailwind `--color-*` tokens

---

## Design Tokens Summary

```css
/* Border Radius */
--radius: 1.25rem          /* 20px — Base */
--radius-sm: 0.45rem       /* 7.2px — Small (computed: radius - 8px) */
--radius-md: 0.85rem       /* 13.6px — Medium (computed: radius - 4px) */
--radius-lg: 1.25rem       /* 20px — Large = base */
--radius-xl: 1.65rem       /* 26.4px — Extra large (computed: radius + 4px) */

/* Font */
--font-sans: var(--font-inter-tight), "Inter Tight", "Inter", "Geist", sans-serif
--font-mono: "Geist Mono", monospace

/* Background reference */
Dark bg:   #0a0a0f → oklch(0.07 0.01 280)
Card bg:   #111118 → oklch(0.1 0.015 280)
Sidebar bg: #0d0d14 (slightly lighter than page bg)
```

---

## Page Designs (Stitch)

### Generated Screens

| # | Page | File | Sections | Status |
|---|------|------|----------|--------|
| 1 | Landing Page | `.stitch/designs/01-landing-page.html` | Hero, How It Works (3-step), Deliverables (2x2 grid), 3-Tier Pricing, FAQ (6 items), Final CTA, Footer | Complete |
| 2 | Discovery Session | `.stitch/designs/02-discovery-session.html` | 6-step progress bar, Voice input, Text input, File upload, AI Live Preview sidebar | Complete |
| 3 | Dashboard | `.stitch/designs/03-dashboard.html` | Sidebar nav, Usage stats, Upgrade CTA, Recent Decks (3-card grid), Deliverables Hub (6-category grid) | Complete |
| 4 | Deck Editor | `.stitch/designs/04-deck-editor.html` | Slide thumbnails, Canvas view, Slide Editor panel, AI Scribe, Layout templates, BG/font controls, Bottom pagination | Complete |

### Preview Deployment

Stitch preview index at `.stitch/preview/index.html` links to all 4 HTML prototypes for browser review.

### Design Alignment Notes

- All 4 prototypes use consistent: `#0a0a0f` dark bg, `#7c3aed` primary violet, `#ec4899` hot pink, glass-card pattern
- Glass card effect is the unifying surface treatment across all pages
- Purple glow (`box-shadow`) is the consistent hover/focus emphasis
- The Stitch prototypes use Inter (not Inter Tight) due to CDN availability — implementation will use Inter Tight per `layout.tsx`
- Deck editor prototype uses Public Sans — implementation will normalize to Inter Tight
- Stitch border-radius values (12px cards, 8px buttons) are slightly different from codebase (`--radius: 1.25rem = 20px`) — implementation should use the codebase values for shadcn/ui consistency

---

## Implementation Notes for Phase 27

1. **Token source of truth:** `src/app/globals.css` CSS custom properties
2. **Component library:** shadcn/ui components with custom theme overrides
3. **Glass cards:** Create a reusable `<GlassCard>` component wrapping the glass-morphism styles
4. **Gradient buttons:** Create `<GradientButton>` variant in Button component
5. **Animations:** All custom animations already exist in `globals.css` — reuse, don't duplicate
6. **Sidebar:** Use shadcn/ui Sidebar component with custom sidebar tokens already defined
7. **Dark mode:** Already the default; ensure all new pages work in both modes
8. **Responsive:** Mobile designs need to be finalized in Stitch before Phase 27 implementation
