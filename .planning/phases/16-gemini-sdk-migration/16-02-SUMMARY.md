---
phase: 16-gemini-sdk-migration
plan: "02"
subsystem: api
tags: [gemini, google-genai, structured-output, zod, pitch-coach, json-schema]

dependency-graph:
  requires:
    - phase: 16-01
      provides: "zod-to-json-schema installed, @google/genai SDK as project standard"
  provides:
    - "pitch-coach feedback route using gemini-2.5-pro (stable, no preview suffix)"
    - "PitchFeedbackSchema Zod schema for validated feedback shape"
    - "responseJsonSchema structured output eliminating regex JSON extraction"
  affects:
    - "16-03 (same structured output pattern for any remaining preview model routes)"

tech-stack:
  added: []
  patterns:
    - "responseJsonSchema + zodToJsonSchema(Schema) in generateContent config for structured Gemini output"
    - "Zod safeParse on result.text after structured output — no regex jsonMatch"
    - "Simplified prompt body when structured output handles response format"

key-files:
  created: []
  modified:
    - "src/app/api/pitch-coach/feedback/route.ts"

key-decisions:
  - "Used result.text (not result.parsed) for JSON.parse — GenerateContentResponse has no .parsed property in @google/genai SDK"
  - "Dynamic GoogleGenAI import inside function body preserved — intentional pattern for Next.js API routes to avoid Edge runtime bundling issues"

patterns-established:
  - "Structured output pattern: config.responseMimeType + config.responseJsonSchema + zodToJsonSchema(Schema)"
  - "Validation pattern: Zod safeParse on JSON.parse(result.text) with fallback on failure"

metrics:
  duration: ~8min
  completed: 2026-03-23
---

# Phase 16 Plan 02: Gemini SDK Migration — pitch-coach feedback Summary

**Replaced gemini-2.5-pro-preview model and regex JSON extraction with gemini-2.5-pro + responseJsonSchema structured output and Zod safeParse validation in pitch-coach feedback route.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-23T00:00:00Z
- **Completed:** 2026-03-23T00:08:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Upgraded pitch-coach feedback route from `gemini-2.5-pro-preview-06-05` to stable `gemini-2.5-pro`
- Added `PitchFeedbackSchema` Zod schema (overallScore, clarity, confidence, pacing, contentCoverage, suggestions, strongPoints)
- Configured `responseJsonSchema: zodToJsonSchema(PitchFeedbackSchema)` + `responseMimeType: "application/json"` for structured output
- Replaced fragile regex `jsonMatch` extraction and manual type-checking block with `Zod safeParse` on `JSON.parse(result.text)`
- Simplified prompt by removing inline JSON schema specification — structured output config handles format enforcement

## Task Commits

1. **Task 1: Add PitchFeedbackSchema and migrate to structured output** - `d78555d` (feat)

**Plan metadata:** (included in task commit — single-task plan)

## Files Created/Modified

- `src/app/api/pitch-coach/feedback/route.ts` - Migrated to gemini-2.5-pro with responseJsonSchema structured output and Zod validation

## Decisions Made

- Used `JSON.parse(result.text ?? "{}")` instead of `result.parsed` — the `GenerateContentResponse` type from `@google/genai` does not expose a `.parsed` property; only `.text` is available. The plan spec included `result.parsed ??` as a preferred path but this was corrected as a Rule 1 bug fix to ensure TypeScript compiles clean.
- Preserved dynamic `import("@google/genai")` inside `analyzePitchWithGemini()` function body per plan spec — this is intentional for Next.js API routes to avoid Edge runtime bundling issues.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed non-existent result.parsed property access**

- **Found during:** Task 1 (structured output migration)
- **Issue:** Plan spec included `result.parsed ?? JSON.parse(result.text ?? "{}")` but `GenerateContentResponse` from `@google/genai` has no `.parsed` property — TypeScript error TS2339 confirmed this
- **Fix:** Changed to `JSON.parse(result.text ?? "{}")` since structured output guarantees valid JSON in `result.text` when `responseMimeType: "application/json"` is set
- **Files modified:** `src/app/api/pitch-coach/feedback/route.ts`
- **Verification:** `npx tsc --noEmit` returned 0 errors for this file
- **Committed in:** `d78555d` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug — non-existent SDK property)
**Impact on plan:** Fix was necessary for TypeScript correctness; functional behavior identical since structured output writes parsed JSON to `result.text` when `responseMimeType: "application/json"` is configured.

## Issues Encountered

None beyond the `result.parsed` type issue documented above as a deviation.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Plan 16-03 can use the same structured output pattern established here: `responseJsonSchema + zodToJsonSchema(Schema)` in config, `Zod safeParse` on `JSON.parse(result.text)` for validation
- All preview model references removed from pitch-coach feedback route
- TypeScript compiles clean for this file

---
*Phase: 16-gemini-sdk-migration*
*Completed: 2026-03-23*
