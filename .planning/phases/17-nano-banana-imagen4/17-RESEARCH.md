# Phase 17: Nano Banana Pro + Imagen 4 — Research

**Researched:** 2026-03-23
**Domain:** Google AI image generation — Gemini native image gen (Nano Banana family) + Imagen 4 Ultra
**Confidence:** HIGH (primary claims verified against official Google AI docs and SDK reference)

---

## Summary

"Nano Banana" is the marketing name for Gemini's native image generation family. There are three models in this family with distinct API model IDs. **Nano Banana Pro specifically maps to `gemini-3-pro-image-preview`**, which is Google's highest-quality native image model as of November 2025. It uses `generateContent` with `responseModalities: ["TEXT", "IMAGE"]` — the same API pattern as the current codebase — but with a different model ID.

The current codebase uses `SLIDE_IMAGE_MODEL ?? "gemini-2.5-flash"` as the default. This is **incorrect for native image generation** — `gemini-2.5-flash` is a text/multimodal model that does not support `responseModalities: IMAGE`. The dedicated image generation models are `gemini-2.5-flash-image`, `gemini-3-pro-image-preview`, and `gemini-3.1-flash-image-preview`.

For Imagen 4 Ultra, the correct GA model ID is `imagen-4.0-ultra-generate-001`. The current codebase default (`imagen-3.0-generate-002`) is two major versions behind. The API call pattern (`client.models.generateImages()`) remains unchanged — only the model ID and new `imageSize` config key need updating.

**Primary recommendation:** Update `SLIDE_IMAGE_MODEL` default to `gemini-3-pro-image-preview` (Nano Banana Pro) and `IMAGEN_MODEL` default to `imagen-4.0-ultra-generate-001`. The API call patterns in `image-service.ts` are correct; only model ID strings need to change.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@google/genai` | `^1.46.0` (already in package.json) | Unified Google AI SDK for both Gemini + Imagen | GA since May 2025, replaces deprecated `@google/generative-ai` |

### Supporting
No new packages needed. The existing dynamic import pattern in `image-service.ts` is intentional for Edge runtime compatibility and should be preserved.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `gemini-3-pro-image-preview` | `gemini-2.5-flash-image` | 2.5-flash-image is cheaper ($0.039/img vs token billing) but lower quality than Pro; Pro is better for branded slide graphics |
| `imagen-4.0-ultra-generate-001` | `imagen-4.0-generate-001` | Standard is cheaper; Ultra adds 2K resolution and better photorealism for hero images |
| `imagen-4.0-ultra-generate-001` | `imagen-4.0-fast-generate-001` | Fast is cheapest, lowest quality; not suitable for hero/marketing images |

**Installation:** No new packages. Already on `@google/genai@^1.46.0`.

---

## Architecture Patterns

### Nano Banana Model Family — API Pattern

All three Nano Banana models use identical `generateContent` with `responseModalities` — same pattern the codebase already uses in `generateWithGeminiNativeImage()`. Only the model ID string changes.

```typescript
// Source: https://ai.google.dev/gemini-api/docs/image-generation
const response = await client.models.generateContent({
  model: "gemini-3-pro-image-preview",  // Nano Banana Pro
  contents: [{ parts }],
  config: {
    responseModalities: ["TEXT", "IMAGE"],
    imageConfig: {
      aspectRatio: "16:9",   // supported: 1:1, 3:4, 4:3, 9:16, 16:9, 2:3, 3:2, 21:9
      imageSize: "2K",       // supported: "1K", "2K", "4K"
    },
  },
});
```

**Critical fix:** The current codebase passes `responseModalities: ["IMAGE", "TEXT"]` (IMAGE first). The official docs and Firebase examples show `["TEXT", "IMAGE"]`. Reverse the order to match official examples.

### Imagen 4 Ultra — API Pattern

The `generateImages` call pattern is unchanged from Imagen 3. Only the model ID and optional `imageSize` change:

```typescript
// Source: https://ai.google.dev/gemini-api/docs/imagen
const response = await client.models.generateImages({
  model: "imagen-4.0-ultra-generate-001",  // was "imagen-3.0-generate-002"
  prompt,
  config: {
    numberOfImages: 1,
    aspectRatio: "16:9",  // "1:1" | "3:4" | "4:3" | "9:16" | "16:9"
    imageSize: "2K",      // Ultra supports "1K" and "2K" — note uppercase K
  },
});
```

### Reference Images for Brand Consistency

Nano Banana Pro supports up to 5 reference images passed as `inlineData` parts in the content array. The existing pattern in `image-service.ts` is correct — pass reference images as `inlineData` parts alongside the text prompt part. Nano Banana Pro supports identity preservation across up to 5 subjects and 14 objects.

```typescript
// Source: https://firebase.google.com/docs/ai-logic/generate-images-gemini
const parts = [
  { text: "Generate a branded slide matching this visual style." },
  { inlineData: { mimeType: "image/png", data: base64Data } },  // reference image
  { inlineData: { mimeType: "image/png", data: base64Data2 } }, // second reference
];
```

### Anti-Patterns to Avoid

- **Using `gemini-2.5-flash` with `responseModalities: IMAGE`** — `gemini-2.5-flash` is a text model. It does not support native image output. This will either error or return only text. The dedicated model is `gemini-2.5-flash-image`.
- **Using lowercase `imageSize: "2k"`** — Must be uppercase `"2K"`. Lowercase is rejected by the API.
- **Passing only `responseModalities: ["IMAGE"]`** — Nano Banana models always return both text and images together. Use `["TEXT", "IMAGE"]`. Image-only responses require the `imageConfig` approach.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Brand color consistency across slides | Custom color extraction + templating | Nano Banana Pro reference images | The model handles style matching via multi-image context; up to 5 reference images per call |
| Text in graphics | Custom SVG text rendering | Nano Banana Pro native text rendering | Pro model has industry-leading text rendering including multilingual layouts and long passages |
| High-res output | Client-side upscaling | `imageSize: "2K"` on Imagen 4 Ultra | Native 2K output from API; 4K also available |
| Aspect ratio variants | Canvas resizing | Built-in `aspectRatio` param | Both Imagen 4 and Nano Banana support aspect ratios natively |

**Key insight:** The SVG fallback path in the current codebase is the right design — use it when API quota is exhausted or model unavailable, not as primary path.

---

## Common Pitfalls

### Pitfall 1: Wrong Model ID for Native Image Generation

**What goes wrong:** `gemini-2.5-flash` set as `SLIDE_IMAGE_MODEL` default causes silent failure — the model ignores `responseModalities: IMAGE` and returns text only (or errors). The `generateWithGeminiNativeImage()` function returns `null`, and the codebase falls through to SVG generation instead.

**Why it happens:** The model config uses `process.env.SLIDE_IMAGE_MODEL ?? "gemini-2.5-flash"`. The env var may not be set in production.

**How to avoid:** Change the default to `"gemini-2.5-flash-image"` (minimum viable) or `"gemini-3-pro-image-preview"` (Nano Banana Pro, higher quality).

**Warning signs:** All slide images are SVGs instead of PNGs; `[image-service] Gemini native image gen error` logs with `"responseModalities"` errors.

### Pitfall 2: Imagen 3 Model ID Still Hardcoded in gemini-image.ts

**What goes wrong:** `gemini-image.ts` still hardcodes `"imagen-3.0-generate-002"`. Routes that import `generateDeckGraphic` or `generateBrandAsset` from `gemini-image.ts` (not from `image-service.ts`) will use Imagen 3.

**Why it happens:** Two parallel image service files exist. `gemini-image.ts` is the old service and needs to be updated or fully deprecated.

**How to avoid:** Either update `gemini-image.ts` to use `process.env.IMAGEN_MODEL ?? "imagen-4.0-ultra-generate-001"`, or migrate all routes to `image-service.ts` and remove `gemini-image.ts`.

### Pitfall 3: imageSize "2K" Bug with Reference Images

**What goes wrong:** When `imageSize: "2K"` is combined with reference images in image-to-image workflows, the `imageSize` parameter is ignored in some SDK versions (reported in @google/genai up to 1.34.0). Output returns at default 1K.

**Why it happens:** Known bug reported in the Google AI Developer Forum (March 2026). The SDK serializes `imageConfig` incorrectly when `inlineData` parts are present alongside it in certain configurations.

**How to avoid:** Test `imageSize` behavior after implementation. If 2K is critical for hero images and reference images are not needed (Imagen 4 Ultra hero path doesn't use reference images), the combination isn't needed. For slide graphics via Nano Banana Pro, `imageSize` can be omitted to avoid the bug.

**Warning signs:** Images consistently return at 1024×1024 even with `imageSize: "2K"` set.

### Pitfall 4: Nano Banana Pro is Preview (Not GA)

**What goes wrong:** `gemini-3-pro-image-preview` was released November 2025 as a "paid preview." It requires billing to be enabled and may have lower rate limits than stable models. Using it without verifying API access will cause auth/quota errors.

**Why it happens:** The "-preview" suffix indicates paid preview status. It requires the Gemini API paid tier.

**How to avoid:** Implement fallback in `generateWithGeminiNativeImage()` — if Pro model fails, fall back to `gemini-2.5-flash-image` before the SVG path. Keep `SLIDE_IMAGE_MODEL` as an env var so it can be switched.

### Pitfall 5: responseModalities Order

**What goes wrong:** Current code uses `["IMAGE", "TEXT"]`. Official docs consistently show `["TEXT", "IMAGE"]`. While the API may accept either order, the mismatch could cause unexpected behavior in future SDK versions.

**Why it happens:** Minor discrepancy introduced when the pattern was first written.

**How to avoid:** Update to `["TEXT", "IMAGE"]` to match official examples.

---

## Code Examples

### Nano Banana Pro — Slide Graphic with Brand Colors + Reference Images

```typescript
// Source: https://ai.google.dev/gemini-api/docs/image-generation
// Source: https://firebase.google.com/docs/ai-logic/generate-images-gemini

const client = new GoogleGenAI({ apiKey: API_KEY });

const parts = [
  { text: `Generate a professional slide graphic: ${prompt}. Brand colors: ${brandColors.join(", ")}. Style: clean, modern pitch deck.` },
  // Up to 5 reference images for brand consistency
  ...referenceImages.slice(0, 5).map(uri => {
    const mimeMatch = uri.match(/^data:(image\/[^;]+);base64,/);
    return mimeMatch ? {
      inlineData: { mimeType: mimeMatch[1], data: uri.slice(uri.indexOf(",") + 1) }
    } : null;
  }).filter(Boolean)
];

const response = await client.models.generateContent({
  model: "gemini-3-pro-image-preview",  // Nano Banana Pro
  contents: [{ parts }],
  config: {
    responseModalities: ["TEXT", "IMAGE"],  // TEXT first per official docs
    imageConfig: {
      aspectRatio: "16:9",
    },
  },
});

// Extract image from response
const candidate = response.candidates?.[0];
for (const part of candidate?.content?.parts ?? []) {
  if (part.inlineData?.data) {
    return {
      imageData: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
      mimeType: part.inlineData.mimeType,
      model: "gemini-3-pro-image-preview",
    };
  }
}
```

### Imagen 4 Ultra — Hero Image

```typescript
// Source: https://ai.google.dev/gemini-api/docs/imagen

const client = new GoogleGenAI({ apiKey: IMAGEN_API_KEY });

const response = await client.models.generateImages({
  model: "imagen-4.0-ultra-generate-001",
  prompt,
  config: {
    numberOfImages: 1,
    aspectRatio: "16:9",  // "1:1" | "3:4" | "4:3" | "9:16" | "16:9"
    imageSize: "2K",      // "1K" (default) | "2K" — uppercase only
  },
});

const image = response.generatedImages?.[0];
if (image?.image?.imageBytes) {
  return {
    imageData: `data:image/png;base64,${image.image.imageBytes}`,
    mimeType: "image/png",
    model: "imagen-4.0-ultra-generate-001",
  };
}
```

### Prompt Engineering — Slide Graphics vs Hero Images

**For slide graphics (Nano Banana Pro):**
```
"A minimalist composition for a [topic] pitch deck slide. [Description of visual concept].
Background: clean [color] canvas with significant negative space for text overlay.
Brand colors: [hex values]. Style: modern, geometric, professional.
NO text in the image — pure visual graphic only."
```

**For hero images (Imagen 4 Ultra):**
```
"Professional, photorealistic hero image for a [industry] business.
[Specific scene description with lighting, perspective, mood].
Cinematic lighting, sharp details, high production quality.
[Brand colors as accent elements if applicable]."
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `imagen-3.0-generate-002` | `imagen-4.0-ultra-generate-001` | ~June 2025 GA | 2K native resolution, better photorealism, 5x improved text in images |
| `gemini-2.0-flash-preview-image-generation` | `gemini-2.5-flash-image` or `gemini-3-pro-image-preview` | Preview retired Oct 31, 2025 | Preview models are now gone; use stable model IDs |
| `gemini-2.5-flash` with responseModalities IMAGE | `gemini-2.5-flash-image` dedicated model | Aug 2025 | The base flash model does not support image generation output |
| `["IMAGE", "TEXT"]` modality order | `["TEXT", "IMAGE"]` | Consistent in all official 2025 docs | Minor but should match official convention |

**Deprecated/outdated:**
- `imagen-3.0-generate-002`: Still functional but 2 generations behind. Imagen 4 GA since ~June 2025.
- `gemini-2.0-flash-preview-image-generation`: Retired October 31, 2025. Will throw errors if called.
- `gemini-2.5-flash-image-preview`: Preview version; stable GA version is `gemini-2.5-flash-image`.
- `imagen-4.0-generate-preview-06-06` / `imagen-4.0-ultra-generate-preview-06-06`: Preview IDs removed November 30, 2025.
- `@google/generative-ai` (old SDK): Deprecated November 30, 2025. Migration to `@google/genai` completed in Phase 16.

---

## Open Questions

1. **Nano Banana Pro rate limits in paid preview**
   - What we know: Model released Nov 2025 as "paid preview." Pricing is $2/M input + $12/M output tokens (token-based, not per-image).
   - What's unclear: Specific RPM/TPM limits for the preview tier. May be lower than stable models.
   - Recommendation: Implement model fallback chain: `gemini-3-pro-image-preview` → `gemini-2.5-flash-image` → SVG. This is already the pattern in `image-service.ts` via the `null` return and cascade.

2. **imageSize: "2K" bug severity with current SDK version**
   - What we know: Bug reported up to SDK 1.34.0. Project is on `^1.46.0`.
   - What's unclear: Whether this specific bug is fixed in 1.46.0. Forum thread was from March 2026 (current).
   - Recommendation: Test `imageSize: "2K"` after implementation. If broken, omit it (defaults to 1K) rather than blocking the phase.

3. **gemini-image.ts deprecation scope**
   - What we know: Two files exist (`image-service.ts` preferred, `gemini-image.ts` old). Phase 17 needs to update both or migrate all routes to the new service.
   - What's unclear: Which API routes still import from `gemini-image.ts` directly.
   - Recommendation: Audit imports at planning time; include a task to migrate any remaining `gemini-image.ts` consumers to `image-service.ts`.

---

## Sources

### Primary (HIGH confidence)
- `https://ai.google.dev/gemini-api/docs/image-generation` — Nano Banana model IDs, responseModalities API pattern, aspect ratios
- `https://ai.google.dev/gemini-api/docs/imagen` — Imagen 4 model IDs, generateImages syntax, supported config
- `https://ai.google.dev/gemini-api/docs/models/gemini-3-pro-image-preview` — Nano Banana Pro capabilities, model ID confirmed
- `https://googleapis.github.io/js-genai/release_docs/interfaces/types.ImageConfig.html` — Official SDK type reference for ImageConfig properties
- `https://firebase.google.com/docs/ai-logic/generate-images-gemini` — Reference image pattern for brand consistency
- `https://firebase.google.com/docs/ai-logic/generate-images-imagen` — Imagen 4 Ultra model IDs confirmed

### Secondary (MEDIUM confidence)
- `https://openrouter.ai/google/gemini-3-pro-image-preview` — Nano Banana Pro pricing ($2/$12 per M tokens), context window (65K), release Nov 2025
- `https://deepmind.google/models/gemini-image/pro/` — Identity preservation: up to 5 subjects, 14 objects; 4K support
- `https://developers.googleblog.com/gemini-2-5-flash-image-now-ready-for-production-with-new-aspect-ratios/` — Gemini 2.5 Flash Image production GA, 10 aspect ratios, $0.039/image

### Tertiary (LOW confidence)
- `https://discuss.ai.google.dev/t/gemini-3-pro-image-api-completely-ignores-imagesize-2k-parameter-node-js-sdk/110458` — imageSize bug report (community forum, March 2026)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — `@google/genai@^1.46.0` already installed; no new deps needed
- Model IDs: HIGH — verified against official Google AI docs for all three Nano Banana models and Imagen 4 Ultra GA
- Architecture: HIGH — API call patterns verified against official docs and SDK type reference
- Pitfalls: MEDIUM — model ID bug is certain; imageSize "2K" bug from community forum (LOW for that specific issue)
- Prompt engineering: MEDIUM — guidelines from official docs, specific values from community best practices

**Research date:** 2026-03-23
**Valid until:** 2026-04-23 (30 days) — models in this space update frequently; verify model IDs against `https://ai.google.dev/gemini-api/docs/models` before implementation
