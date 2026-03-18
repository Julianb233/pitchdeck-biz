# pitchdeck.biz Design System

> Synthesized from the live codebase (`src/app/globals.css`) and Stitch-generated screen designs.
> Stitch Project: `4882024256054424284`

---

## Brand Identity

**Personality:** Bold, colorful, energetic. Startup energy meets enterprise quality.
**Mode:** Dark-first (deep purple-black backgrounds). Light mode supported but secondary.
**Font:** Inter Tight (primary), Geist Mono (code/monospace)

---

## Color Palette

### Brand Colors (CSS custom properties)

| Token | Hex | Usage |
|-------|-----|-------|
| `--brand-primary` | `#7c3aed` | Electric Violet - Primary actions, CTAs, active states |
| `--brand-primary-light` | `#a78bfa` | Hover states, secondary highlights |
| `--brand-primary-dark` | `#5b21b6` | Pressed states, borders |
| `--brand-secondary` | `#f97316` | Energetic Coral/Orange - Accents, badges |
| `--brand-secondary-light` | `#fdba74` | Subtle highlights |
| `--brand-secondary-dark` | `#c2410c` | Dark accents |
| `--brand-success` | `#10b981` | Fresh Green - Success states, completed steps |
| `--brand-success-light` | `#6ee7b7` | Success highlights |
| `--brand-accent` | `#ec4899` | Hot Pink - Eye-catching accents, gradient endpoints |
| `--brand-accent-light` | `#f9a8d4` | Soft accents |
| `--brand-blue` | `#3b82f6` | Electric Blue - Links, info states |
| `--brand-cyan` | `#06b6d4` | Cyan - Charts, tertiary accent |

### Semantic Colors (oklch, CSS variables)

**Dark Mode (default):**
| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `oklch(0.07 0.01 280)` | Deep purple-black page bg |
| `--foreground` | `oklch(0.985 0 0)` | Near-white text |
| `--card` | `oklch(0.1 0.015 280)` | Card surfaces |
| `--primary` | `oklch(0.65 0.25 293)` | Primary interactive |
| `--secondary` | `oklch(0.15 0.02 280)` | Secondary surfaces |
| `--muted` | `oklch(0.15 0.01 280)` | Muted backgrounds |
| `--muted-foreground` | `oklch(0.68 0 0)` | Subdued text |
| `--border` | `oklch(0.22 0.02 280)` | Subtle purple-tinted borders |
| `--accent` | `oklch(0.7 0.2 350)` | Hot pink accent |

---

## Gradients

| Token | Definition | Usage |
|-------|-----------|-------|
| `--brand-gradient-primary` | `135deg, #7c3aed 0%, #ec4899 50%, #f97316 100%` | Primary CTA buttons, hero elements |
| `--brand-gradient-hero` | `135deg, #7c3aed → #3b82f6 → #06b6d4 → #10b981 → #f97316` | Hero backgrounds, full-spectrum wow |
| `--brand-gradient-cta` | `135deg, #7c3aed 0%, #ec4899 100%` | CTA buttons, action items |
| `--brand-gradient-accent` | `135deg, #f97316 → #ec4899 → #7c3aed` | Reverse accent gradient |
| `--brand-gradient-bar` | `90deg, full rainbow cycle` | Animated top gradient bar |

---

## Typography

| Element | Style |
|---------|-------|
| Font family | `Inter Tight`, fallback to `Inter`, `Geist`, sans-serif |
| Headings | `font-semibold tracking-tight`, `line-height: 1` |
| Body | Standard weight, `antialiased` |
| Hero title | Word-by-word blur reveal animation with gradient-to-foreground transition |
| Section titles | Scroll-triggered blur reveal with gradient flash |
| Gradient text | `.analysis-word-gradient` - animated background-clip text |

---

## Component Patterns

### Buttons
- **Primary CTA:** Gradient background (`--brand-gradient-cta`), white text, `rounded-xl`, glow effect on hover (`.brand-gradient-glow`)
- **Secondary:** Outlined with `border-border`, hover fills with `--secondary`
- **Ghost:** Transparent bg, text color only

### Cards
- Dark surface (`--card` / `oklch(0.1 0.015 280)`)
- Subtle purple-tinted border (`--border`)
- `rounded-xl` (radius: 1.25rem base)
- Glass-morphism effect on feature cards (backdrop-blur)
- Hover: subtle border glow in brand violet

### Badges
- Small pill shape, `rounded-full`
- Tier badges: Violet for Pro, Orange for Starter, Pink for Founder Suite
- Status badges: Green for Published, Yellow for Draft, Blue for Shared
- "Most Popular" badge: Gradient background with white text

### Pricing Cards
- **3-tier Good-Better-Best layout** with decoy pricing effect
- **Starter ($29/mo):** Standard card, no highlight
- **Pro ($79/mo):** Visually prominent - violet gradient border, "Most Popular" badge, slightly elevated/scaled, recommended tier
- **Founder Suite ($199/mo):** Premium anchor tier, subtle gold/orange accent
- Annual toggle with 25% savings callout
- Value anchor: "Agency-quality pitch decks start at $5,000"
- Feature lists with checkmark icons, muted items for unavailable features

### Navigation
- **Header:** Fixed top, dark bg with blur, logo left, nav center, CTA right
- **Sidebar (dashboard):** Dark narrow panel, icon + label nav items, violet left-border for active state
- **Gradient bar:** 1px animated gradient line below header

### Progress Indicators
- Horizontal step bar with numbered circles
- Connected by lines
- Current: Violet fill, future: muted gray, completed: green with check

---

## Animation System

| Animation | Class | Duration | Usage |
|-----------|-------|----------|-------|
| Word blur reveal | `.hero-word` | 1s per word (staggered) | Hero title entrance |
| Section title reveal | `.section-title-animate` | 1s on scroll | Section headings |
| Gradient text cycle | `.analysis-word-gradient` | 2s infinite | Key highlighted words |
| Gradient bar flow | `.bottom-gradient-bar` | 2s infinite | Top accent bar |
| Orb rotation | `.animate-orb-rotate` | 20s infinite | Background orbs |
| Floating cards | `.hero-float-main/1/2` | 6-8s infinite | Hero card previews |
| Marquee | `.animate-marquee` | 30s infinite | Logo carousel |
| Scroll carousel | `.animate-scroll-left/right` | 25s infinite | Testimonials |

All animations respect `prefers-reduced-motion: reduce`.

---

## Design Tokens Summary

```css
--radius: 1.25rem          /* Base border radius (xl feel) */
--radius-sm: 0.75rem       /* Small elements */
--radius-md: 1rem          /* Medium elements */
--radius-lg: 1.25rem       /* Cards, modals */
--radius-xl: 1.5rem        /* Large containers */
```

### Spacing (Tailwind defaults)
- Section padding: `py-16` to `py-24`
- Container max-width: `max-w-7xl` with `px-4 sm:px-6 lg:px-8`
- Card padding: `p-6` to `p-8`
- Element gaps: `gap-4` to `gap-8`

### Shadows
- Cards: `shadow-lg` with purple tint in dark mode
- Elevated elements: `shadow-xl`
- Glow effect: `filter: blur(20px)` on gradient pseudo-element

---

## Page Designs (Stitch)

See `.planning/phases/19-stitch-design-system/STITCH-SCREENS.md` for all generated screen designs and their IDs.
