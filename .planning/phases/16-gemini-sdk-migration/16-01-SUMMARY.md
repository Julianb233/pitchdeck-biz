---
phase: 16-gemini-sdk-migration
plan: "01"
subsystem: ai-image-service
tags: [gemini, google-genai, sdk-migration, image-generation, color-scheme]

dependency-graph:
  requires: []
  provides:
    - "image-service.ts using @google/genai SDK exclusively (no @google/generative-ai)"
    - "zod-to-json-schema installed for use by plans 02 and 03"
    - "SLIDE_IMAGE_MODEL defaulting to gemini-2.5-flash"
  affects:
    - "16-02 and 16-03 plans (can now use zod-to-json-schema for structured output)"

tech-stack:
  added:
    - "zod-to-json-schema@^3.25.1"
  patterns:
    - "Top-level import of GoogleGenAI + Type from @google/genai (replacing dynamic import pattern)"
    - "responseSchema with Type.OBJECT for structured JSON output in generateColorScheme()"

key-files:
  created: []
  modified:
    - "src/lib/ai/image-service.ts"
    - "package.json"
    - "package-lock.json"

decisions:
  - id: d1
    decision: "Hardcode gemini-2.5-flash in generateWithGeminiSvg() and generateColorScheme() instead of using SLIDE_IMAGE_MODEL constant"
    rationale: "Plan spec explicitly called for hardcoding 'gemini-2.5-flash' in the new SDK calls for these two functions; SLIDE_IMAGE_MODEL constant still used in generateWithGeminiNativeImage"
    alternatives: ["Use SLIDE_IMAGE_MODEL constant throughout"]
  - id: d2
    decision: "Keep defensive jsonMatch regex parsing in generateColorScheme() alongside new responseSchema"
    rationale: "Plan explicitly stated to keep defensive parsing for safety during migration, not rewrite"
    alternatives: ["Remove jsonMatch now that structured output guarantees shape"]

metrics:
  duration: "~5 minutes"
  completed: "2026-03-23"
---

# Phase 16 Plan 01: Gemini SDK Migration — image-service.ts Summary

**One-liner:** Migrated two broken `@google/generative-ai` dynamic imports to `GoogleGenAI` from `@google/genai` with structured output for color scheme; installed zod-to-json-schema bridge; updated model default to gemini-2.5-flash.

## What Was Done

Both `generateWithGeminiSvg()` and `generateColorScheme()` in `src/lib/ai/image-service.ts` contained `await import("@google/generative-ai")` dynamic imports. The `@google/generative-ai` package is not installed in this project — only `@google/genai` is. Both functions were silently failing at runtime.

### Task 1: Install zod-to-json-schema

Installed `zod-to-json-schema@^3.25.1` via `npm install zod-to-json-schema`. This bridge package is required by plans 02 and 03 to convert Zod schemas to the JSON Schema format Gemini's `responseJsonSchema` config field accepts.

### Task 2: Fix generateWithGeminiSvg()

- Added top-level `import { GoogleGenAI, Type } from "@google/genai"` at file top
- Removed `const { GoogleGenerativeAI } = await import("@google/generative-ai")` dynamic import
- Replaced `new GoogleGenerativeAI(API_KEY)` + `client.getGenerativeModel()` with `new GoogleGenAI({ apiKey: API_KEY })`
- Replaced `model.generateContent({ contents: [...], generationConfig: {...} })` with `client.models.generateContent({ model: "gemini-2.5-flash", contents: contentParts, config: { temperature: 0.8 } })`
- Replaced `result.response.text()` (method call) with `result.text ?? ""` (property access)
- Updated `SLIDE_IMAGE_MODEL` default from `"gemini-2.0-flash-exp"` to `"gemini-2.5-flash"` (implicitly migrates `generateWithGeminiNativeImage` which uses the constant)

### Task 3: Fix generateColorScheme()

- Removed `const { GoogleGenerativeAI } = await import("@google/generative-ai")` dynamic import
- Replaced old SDK instantiation with `new GoogleGenAI({ apiKey: API_KEY })`
- Replaced `model.generateContent(prompt)` with `client.models.generateContent()` using structured output:
  - `responseMimeType: "application/json"`
  - `responseSchema` with `Type.OBJECT` defining the four required color fields
- Replaced `result.response.text().trim()` with `(result.text ?? "").trim()`
- Kept defensive `jsonMatch` regex and shape validation intact per plan spec

## Verification Results

- `grep -rn "generative-ai" src/` — 0 matches (old SDK fully removed from src/)
- `npx tsc --noEmit` — 0 errors in `image-service.ts` (pre-existing errors in other files unrelated to this migration)
- `node -e "require('zod-to-json-schema')"` — no error
- `grep "SLIDE_IMAGE_MODEL" src/lib/ai/image-service.ts` — shows `"gemini-2.5-flash"` as default
- `generateWithGeminiNativeImage` — confirmed compiles cleanly with updated constant

## Deviations from Plan

None — plan executed exactly as written.

## Known Issues / Technical Debt

### generateColorScheme() Duplication

A `generateColorScheme` function also exists in `src/lib/ai/gemini-image.ts` (already using the correct `@google/genai` SDK). After this migration, two implementations of `generateColorScheme` exist in the codebase. Deduplication is **out of scope for this phase** and should be addressed in a future cleanup phase.

## Next Phase Readiness

- Plan 16-02 and 16-03 can now use `zod-to-json-schema` (installed)
- All `@google/generative-ai` references removed from `src/`; codebase is fully on `@google/genai`
- No blockers for subsequent migration plans
