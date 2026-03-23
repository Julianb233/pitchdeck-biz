# Phase 16: Gemini SDK Migration - Research

**Researched:** 2026-03-23
**Domain:** Google AI SDK migration (@google/generative-ai → @google/genai), Gemini 2.5 models, structured output
**Confidence:** HIGH

## Summary

The pitchdeck.biz codebase is in a partially migrated state. The package.json already declares `@google/genai@1.46.0` and the old `@google/generative-ai` is NOT installed. Most files already use the new SDK correctly. However, `src/lib/ai/image-service.ts` still contains two dynamic `import("@google/generative-ai")` calls that will fail silently at runtime because the package is absent.

The migration work is surgical: fix two functions in one file, update one model constant, and add Zod-based structured output across files that currently parse JSON manually. No new SDK installation is needed — it's already in package.json.

**Primary recommendation:** Fix the two broken dynamic imports in `image-service.ts` first (active runtime bug), then standardize model IDs and add structured output schemas to the five AI call sites.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@google/genai` | 1.46.0 (already installed) | Gemini API client | New unified Google AI SDK, replaces `@google/generative-ai` |
| `zod` | 3.25.76 (already installed) | Schema definition | Already in project; pairs with `responseJsonSchema` for structured output |
| `zod-to-json-schema` | needs install | Convert Zod schemas to JSON Schema | Required bridge between Zod and Gemini's `responseJsonSchema` config |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@google/genai` `Type` enum | built-in | Native schema type constants | For simple schemas without Zod (already used in `gemini-image.ts`) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `zod-to-json-schema` | Native `Type` enum | Native is zero-dependency but verbose; Zod is DRY and already in the project |
| `responseJsonSchema` with Zod | `responseMimeType: "application/json"` + manual parse | Manual parse has no validation; structured output gives `response.parsed` auto-parse |

**Installation:**
```bash
npm install zod-to-json-schema
```

---

## Architecture Patterns

### The Two SDK Patterns in This Codebase

#### Pattern A: New SDK (correct) — used in most files
```typescript
// Source: @google/genai SDK, already used in gemini-image.ts, document-processor.ts
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: API_KEY });

const result = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: prompt,             // string or parts array
  config: {
    temperature: 0.8,
    responseMimeType: "application/json",   // structured output
    responseSchema: schemaObject,            // native Type schema
    // OR:
    responseJsonSchema: zodToJsonSchema(myZodSchema),  // Zod schema
  },
});

const text = result.text ?? "";           // text response
const parsed = result.parsed;             // auto-parsed JSON when using responseJsonSchema
```

#### Pattern B: Old SDK (broken) — only in image-service.ts lines 306 and 705
```typescript
// THIS IS BROKEN — @google/generative-ai is NOT installed
const { GoogleGenerativeAI } = await import("@google/generative-ai");
const client = new GoogleGenerativeAI(API_KEY);
const model = client.getGenerativeModel({ model: SLIDE_IMAGE_MODEL });

const result = await model.generateContent({
  contents: [{ role: "user", parts: contentParts }],
  generationConfig: { responseMimeType: "text/plain", temperature: 0.8 },
});

const text = result.response.text();  // OLD: response wrapper
```

### API Differences: Old vs New SDK

| Aspect | Old `@google/generative-ai` | New `@google/genai` |
|--------|----------------------------|---------------------|
| Initialization | `new GoogleGenerativeAI(apiKey)` | `new GoogleGenAI({ apiKey })` |
| Model selection | `client.getGenerativeModel({ model })` | Model passed per-call in `generateContent()` |
| Generate call | `model.generateContent({ contents, generationConfig })` | `ai.models.generateContent({ model, contents, config })` |
| Config key | `generationConfig` | `config` |
| Response text | `result.response.text()` (method call) | `result.text` (property, string or undefined) |
| Structured output | `generationConfig.responseMimeType` | `config.responseMimeType` + `config.responseSchema` or `config.responseJsonSchema` |
| File upload | `new GoogleAIFileManager(key)` | `ai.files.upload()` |
| Chat | `model.startChat()` | `ai.chats.create()` |

### Structured Output Modes

**Mode 1: Native Type schema (already used in gemini-image.ts)**
```typescript
import { Type } from "@google/genai";

const schema = {
  type: Type.OBJECT,
  properties: {
    primary: { type: Type.STRING },
    secondary: { type: Type.STRING },
  },
  required: ["primary", "secondary"],
};

const result = await ai.models.generateContent({
  model: "gemini-2.5-pro",
  contents: prompt,
  config: {
    responseMimeType: "application/json",
    responseSchema: schema,
  },
});
const parsed = JSON.parse(result.text ?? "{}");
```

**Mode 2: Zod schema with responseJsonSchema (recommended for new schemas)**
```typescript
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const PitchFeedbackSchema = z.object({
  overallScore: z.number().min(1).max(100),
  clarity: z.object({
    score: z.number(),
    feedback: z.string(),
  }),
  // ...
});

const result = await ai.models.generateContent({
  model: "gemini-2.5-pro",
  contents: prompt,
  config: {
    responseMimeType: "application/json",
    responseJsonSchema: zodToJsonSchema(PitchFeedbackSchema),
  },
});
// result.parsed is auto-parsed when using responseJsonSchema
const feedback = PitchFeedbackSchema.parse(result.parsed ?? JSON.parse(result.text ?? "{}"));
```

### Model IDs

| Use Case | Model ID | Notes |
|----------|----------|-------|
| Fast operations, SVG gen, image gen | `gemini-2.5-flash` | Stable ID, GA |
| Deep analysis, structured JSON, pitch coach | `gemini-2.5-pro` | Stable ID, GA |
| Old broken model | `gemini-2.0-flash-exp` | In `SLIDE_IMAGE_MODEL` env default — must change |
| Old preview used in pitch-coach | `gemini-2.5-pro-preview-06-05` | Preview — switch to stable `gemini-2.5-pro` |
| Old preview in discovery | `gemini-2.5-pro-preview-06-05` | Preview — switch to stable `gemini-2.5-pro` |

---

## Files Requiring Changes

### 1. `src/lib/ai/image-service.ts` — BROKEN (critical)

**Problem:** Two functions use `await import("@google/generative-ai")` which will throw at runtime since the package is not installed.

- `generateWithGeminiSvg()` (line ~306): Old SDK dynamic import + `getGenerativeModel` pattern
- `generateColorScheme()` (line ~705): Old SDK dynamic import + `getGenerativeModel` pattern + `result.response.text()` call

**Fix:** Replace both functions with the Pattern A new SDK approach, using `GoogleGenAI` from `@google/genai` (already installed). Also update `SLIDE_IMAGE_MODEL` default from `"gemini-2.0-flash-exp"` to `"gemini-2.5-flash"`.

**Note:** The `generateWithGeminiNativeImage()` function in this same file already uses Pattern A correctly (dynamic import of `@google/genai`). Use it as the template.

### 2. `src/app/api/pitch-coach/feedback/route.ts` — preview model, no structured output

**Problem:** Uses `gemini-2.5-pro-preview-06-05` (preview ID). Parses JSON manually with `text.match(/\{[\s\S]*\}/)`.

**Fix:** Switch to `gemini-2.5-pro`. Add Zod schema for `PitchFeedback` and use `responseJsonSchema` + `responseMimeType: "application/json"` to get structured output instead of regex JSON extraction.

### 3. `src/app/api/discovery/summarize/route.ts` — preview model, no structured output

**Problem:** Uses `gemini-2.5-pro-preview-06-05` (preview ID). Manually strips markdown fences from JSON response.

**Fix:** Switch to `gemini-2.5-pro`. Add Zod schema for `BusinessDiscoverySummary` and use `responseJsonSchema`. The fence-stripping code can be removed.

### 4. `src/lib/ai/document-processor.ts` — no Zod schema, manual parse

**Problem:** Uses correct model (`gemini-2.5-pro`) and SDK, but parses JSON manually. No `responseSchema` on the `generateContent` call.

**Fix:** Add `responseMimeType: "application/json"` to the config. Optionally add Zod schema for the extraction result. This is lower priority since the current JSON parse has a catch handler.

### 5. `src/lib/ai/gemini-image.ts` — already mostly correct

**Status:** Uses `@google/genai` correctly with new SDK patterns. `generateColorScheme()` already uses native `Type` schema and `responseSchema`. No changes needed unless we want to standardize on Zod.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSON schema from TypeScript types | Manual schema objects | `zod-to-json-schema` | Already have Zod in project; `zodToJsonSchema()` handles all edge cases |
| JSON response parsing | `text.match(/\{[\s\S]*\}/)` + manual parse | `responseJsonSchema` + `result.parsed` | SDK auto-parses; no regex extraction needed |
| Response validation | Manual property checks | `ZodSchema.parse()` or `ZodSchema.safeParse()` | Validates structure AND types in one call |

---

## Common Pitfalls

### Pitfall 1: `result.response.text()` vs `result.text`
**What goes wrong:** Old SDK used `result.response.text()` (method call on a wrapper). New SDK uses `result.text` (direct string property, may be undefined).
**Why it happens:** Different response shapes between SDKs.
**How to avoid:** Always use `result.text ?? ""` in new SDK. Never call `.text()` as a function.
**Warning signs:** TypeScript error `result.response is undefined` or `result.text is not a function`.

### Pitfall 2: `generationConfig` vs `config`
**What goes wrong:** Passing old-style `generationConfig` to new SDK's `generateContent` — it silently ignores it.
**Why it happens:** Config key renamed in new SDK.
**How to avoid:** The new key is `config`, not `generationConfig`.
**Warning signs:** Temperature/responseMimeType settings appear to have no effect.

### Pitfall 3: `gemini-2.0-flash-exp` default model
**What goes wrong:** `SLIDE_IMAGE_MODEL` in `image-service.ts` defaults to `"gemini-2.0-flash-exp"`. This model is deprecated June 1 (the stated urgency).
**Why it happens:** Stale default value — not updated when other models were migrated.
**How to avoid:** Change default to `"gemini-2.5-flash"`.
**Warning signs:** API calls return a deprecation error after June 1.

### Pitfall 4: Preview model strings will break
**What goes wrong:** `gemini-2.5-pro-preview-06-05` will be deprecated with 2 weeks notice (no guarantee of timeline).
**Why it happens:** Two route files hardcode a preview model string.
**How to avoid:** Switch to stable `gemini-2.5-pro`.

### Pitfall 5: `responseJsonSchema` requires `responseMimeType`
**What goes wrong:** Setting `responseJsonSchema` without `responseMimeType: "application/json"` may not enforce structured output.
**Why it happens:** Both config options must be set together.
**How to avoid:** Always pair them: `responseMimeType: "application/json"` + `responseJsonSchema: zodToJsonSchema(schema)`.

---

## Code Examples

### Migration pattern for the two broken functions in image-service.ts

```typescript
// Source: verified against @google/genai v1.46.0 installed in project
// BEFORE (broken):
async function generateWithGeminiSvg(...) {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");  // NOT INSTALLED
  const client = new GoogleGenerativeAI(API_KEY);
  const model = client.getGenerativeModel({ model: SLIDE_IMAGE_MODEL });
  const result = await model.generateContent({
    contents: [{ role: "user", parts: contentParts }],
    generationConfig: { responseMimeType: "text/plain", temperature: 0.8 },
  });
  const text = result.response.text();  // OLD pattern
}

// AFTER (correct):
import { GoogleGenAI } from "@google/genai";

async function generateWithGeminiSvg(...) {
  const client = new GoogleGenAI({ apiKey: API_KEY });
  const result = await client.models.generateContent({
    model: "gemini-2.5-flash",           // updated model
    contents: contentParts,               // same parts array
    config: {                             // "config" not "generationConfig"
      temperature: 0.8,
    },
  });
  const text = result.text ?? "";         // property, not method
}
```

### Adding structured output with Zod to pitch-coach feedback

```typescript
// Source: ai.google.dev/gemini-api/docs/structured-output + zod docs
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const PitchFeedbackSchema = z.object({
  overallScore: z.number().min(1).max(100),
  clarity: z.object({ score: z.number(), feedback: z.string() }),
  confidence: z.object({ score: z.number(), feedback: z.string() }),
  pacing: z.object({ score: z.number(), feedback: z.string() }),
  contentCoverage: z.object({ score: z.number(), feedback: z.string() }),
  suggestions: z.array(z.string()),
  strongPoints: z.array(z.string()),
});

const result = await ai.models.generateContent({
  model: "gemini-2.5-pro",
  contents: prompt,
  config: {
    temperature: 0.3,
    responseMimeType: "application/json",
    responseJsonSchema: zodToJsonSchema(PitchFeedbackSchema),
  },
});

// No regex extraction needed — use result.parsed or parse result.text
const feedback = PitchFeedbackSchema.parse(
  result.parsed ?? JSON.parse(result.text ?? "{}")
);
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@google/generative-ai` package | `@google/genai` package | 2024, GA 2025 | New unified SDK with cleaner API |
| `model.generateContent()` | `ai.models.generateContent({ model, ... })` | SDK v1.0 | Model specified per-call, not at construction |
| `result.response.text()` | `result.text` | SDK v1.0 | Direct property instead of wrapper method |
| `generationConfig` | `config` | SDK v1.0 | Config key renamed |
| `gemini-2.0-flash-exp` | `gemini-2.5-flash` | June 1 deadline | Deprecated, will stop working |
| `gemini-2.5-pro-preview-06-05` | `gemini-2.5-pro` | GA June 2025 | Stable model available |
| Manual JSON regex extraction | `responseJsonSchema` + `result.parsed` | GA 2025 | Auto-parsed, type-safe |

---

## Open Questions

1. **`result.parsed` availability in v1.46.0**
   - What we know: Official docs mention `result.parsed` for `responseJsonSchema` mode
   - What's unclear: Whether v1.46.0 specifically exposes `result.parsed` in TypeScript types
   - Recommendation: Use `result.parsed ?? JSON.parse(result.text ?? "{}")` as safe fallback during migration

2. **`gemini-2.0-flash-exp` for native image generation**
   - What we know: `generateWithGeminiNativeImage()` in `image-service.ts` uses `SLIDE_IMAGE_MODEL` which defaults to `gemini-2.0-flash-exp`; Gemini 2.5 Flash supports `responseModalities: ["IMAGE", "TEXT"]`
   - What's unclear: Whether `gemini-2.5-flash` supports native image output (responseModalities IMAGE) or if a specific model variant is needed
   - Recommendation: Test `gemini-2.5-flash` with `responseModalities: ["IMAGE"]` — if unsupported, use `gemini-2.0-flash-preview-image-generation` as an interim model

---

## Sources

### Primary (HIGH confidence)
- `@google/genai` v1.46.0 installed at `/opt/agency-workspace/pitchdeck.biz/node_modules/@google/genai/` — verified exports
- Codebase direct inspection — all 7 affected source files read in full
- [Gemini API: Migrate to Google GenAI SDK](https://ai.google.dev/gemini-api/docs/migrate) — API diff table

### Secondary (MEDIUM confidence)
- [Gemini API: Structured Output docs](https://ai.google.dev/gemini-api/docs/structured-output) — `responseJsonSchema` and `result.parsed` patterns
- [Gemini API: Models](https://ai.google.dev/gemini-api/docs/models) — stable model IDs `gemini-2.5-flash` and `gemini-2.5-pro`

### Tertiary (LOW confidence)
- WebSearch results on Gemini 2.5 model GA status — corroborates stable IDs

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — `@google/genai` already installed, old SDK confirmed absent
- Architecture: HIGH — all source files read directly, exact broken lines identified
- Pitfalls: HIGH — API differences confirmed via official migration docs
- Structured output: MEDIUM — docs clear on pattern, `result.parsed` availability in v1.46.0 type signatures needs verification

**Research date:** 2026-03-23
**Valid until:** 2026-04-23 (model IDs stable; SDK API stable)
