---
phase: 17-nano-banana-imagen4
plan: 01
subsystem: image-generation
tags: [gemini, imagen, image-generation, model-upgrade, nano-banana]
completed: 2026-03-23
duration: ~15min

dependency-graph:
  requires:
    - 16-gemini-sdk-migration  # SDK migration that established @google/genai usage
  provides:
    - Nano Banana Pro as primary slide image model
    - Imagen 4 Ultra as primary hero image model
    - Inner fallback chain: gemini-3-pro-image-preview -> gemini-2.5-flash-image -> SVG
  affects:
    - Any future phase touching image generation routing

tech-stack:
  added: []
  patterns:
    - Try/catch fallback chain within generateWithGeminiNativeImage() for model resilience

key-files:
  created: []
  modified:
    - src/lib/ai/image-service.ts
    - src/lib/ai/gemini-image.ts
    - .env.example

decisions:
  - "gemini-3-pro-image-preview (Nano Banana Pro) as SLIDE_IMAGE_MODEL default — native PNG output for branded slide graphics"
  - "gemini-2.5-flash-image as SLIDE_IMAGE_FALLBACK_MODEL — stable fallback when preview quota exhausted"
  - "imagen-4.0-ultra-generate-001 as IMAGEN_MODEL default — Imagen 4 Ultra for photorealistic hero images"
  - "imageSize: '2K' added to Imagen config for native 2K resolution output"
  - "responseModalities order fixed to ['TEXT', 'IMAGE'] matching official Google AI docs"
  - "gemini-image.ts kept as dead code with deprecation header rather than deleted"
---

# Phase 17 Plan 01: Nano Banana Pro + Imagen 4 Ultra Summary

**One-liner:** Upgraded slide images to Nano Banana Pro (gemini-3-pro-image-preview) with gemini-2.5-flash-image fallback, and hero images to Imagen 4 Ultra (imagen-4.0-ultra-generate-001) at 2K resolution, fixing the silent production failure where gemini-2.5-flash (text-only) caused all slide image calls to fall through to SVG.

## What Was Done

### Root Problem Fixed

The previous `SLIDE_IMAGE_MODEL` default was `gemini-2.5-flash`, a text-only model that does not support native image output (`responseModalities: IMAGE`). Every slide image call silently failed and fell through to the SVG path. This is now fixed.

### Task 1: image-service.ts (3 files changed)

**Model ID updates:**
- `IMAGEN_MODEL` default: `imagen-3.0-generate-002` → `imagen-4.0-ultra-generate-001`
- `SLIDE_IMAGE_MODEL` default: `gemini-2.5-flash` → `gemini-3-pro-image-preview`
- New constant: `SLIDE_IMAGE_FALLBACK_MODEL = "gemini-2.5-flash-image"`

**Imagen config:**
- Added `imageSize: "2K"` to `generateWithImagen()` config for native 2K resolution
- Updated inline TypeScript type to include `imageSize?: string`

**responseModalities fix:**
- Changed from `["IMAGE", "TEXT"]` to `["TEXT", "IMAGE"]` to match Google AI SDK docs

**Inner fallback chain in `generateWithGeminiNativeImage()`:**
- Primary attempt: `SLIDE_IMAGE_MODEL` (gemini-3-pro-image-preview)
- On failure: logs warning, retries with `SLIDE_IMAGE_FALLBACK_MODEL` (gemini-2.5-flash-image)
- Both fail: logs error, returns null (falls through to Gemini SVG path as before)

### Task 2: gemini-image.ts

- Added deprecation header at top of file confirming zero active importers
- Updated hardcoded model from `imagen-3.0-generate-002` → `imagen-4.0-ultra-generate-001`
- File preserved as dead code reference (not deleted)

### Task 3: .env.example

- Replaced `imagen-3.0-generate-002` and `gemini-2.0-flash-exp` with current correct values
- Added explanatory comments including pricing and alternatives for each model

## Model IDs Now in Use

| Purpose | Model | Notes |
|---------|-------|-------|
| Slide graphics (primary) | `gemini-3-pro-image-preview` | Nano Banana Pro — branded, text-accurate |
| Slide graphics (fallback) | `gemini-2.5-flash-image` | Stable, $0.039/img |
| Hero/stock images | `imagen-4.0-ultra-generate-001` | Imagen 4 Ultra, 2K resolution |
| SVG generation | `gemini-2.5-flash` | Text model, unchanged — intentional |
| Color schemes | `gemini-2.5-pro` | Text model, unchanged — intentional |

## Fallback Chain (Slide Graphics)

```
generateWithGeminiNativeImage()
  → try gemini-3-pro-image-preview
    → success: return PNG
    → fail: warn + try gemini-2.5-flash-image
      → success: return PNG
      → fail: return null
  → null -> generateWithGeminiSvg() (AI SVG via gemini-2.5-flash text)
    → null -> placeholderGradientSvg() (static gradient)
```

## Verification Results

```bash
# No errors in image-service.ts or gemini-image.ts
npx tsc --noEmit 2>&1 | grep "image-service\|gemini-image"
# (no output — clean)

# New model IDs present
grep -n "gemini-3-pro-image-preview\|imagen-4.0-ultra\|gemini-2.5-flash-image\|TEXT.*IMAGE" src/lib/ai/image-service.ts
# 49:  process.env.IMAGEN_MODEL ?? "imagen-4.0-ultra-generate-001";
# 51:  process.env.SLIDE_IMAGE_MODEL ?? "gemini-3-pro-image-preview";
# 54: const SLIDE_IMAGE_FALLBACK_MODEL = "gemini-2.5-flash-image";
# 274:          responseModalities: ["TEXT", "IMAGE"],
# 286:              responseModalities: ["TEXT", "IMAGE"],

# Old model IDs gone from image-service.ts
grep -n "imagen-3.0\|gemini-2.5-flash\"\|IMAGE.*TEXT" src/lib/ai/image-service.ts
# gemini-2.5-flash at 368, 747 = SVG text model (intentional, not image model)

# gemini-image.ts updated
grep -n "DEPRECATED\|imagen-4.0" src/lib/ai/gemini-image.ts
# 5: // DEPRECATED: This file is no longer imported by any route.
# 41:       model: "imagen-4.0-ultra-generate-001",

# No route imports gemini-image.ts
grep -r "from.*gemini-image" src/app/
# (no output — confirmed)

# .env.example correct
grep -n "IMAGEN_MODEL\|SLIDE_IMAGE_MODEL" .env.example
# 37: SLIDE_IMAGE_MODEL=gemini-3-pro-image-preview
# 42: IMAGEN_MODEL=imagen-4.0-ultra-generate-001
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Inline TypeScript type missing imageSize field**

- **Found during:** Task 1 — TypeScript compilation check
- **Issue:** The dynamic import in `generateWithImagen()` has a manually-written inline type. The `config` type was `{ numberOfImages: number; aspectRatio?: string }` — no `imageSize` field, so adding `imageSize: "2K"` caused a TS2353 error.
- **Fix:** Added `imageSize?: string` to the inline config type definition
- **Files modified:** `src/lib/ai/image-service.ts` (line ~147)
- **Commit:** 03e1bc5

## Next Phase Readiness

- Image generation now uses correct models and will actually produce native PNG output for slide graphics
- Fallback chain is resilient to preview model quota/access issues
- No blockers for future phases
