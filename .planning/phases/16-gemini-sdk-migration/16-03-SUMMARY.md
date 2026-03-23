---
phase: 16-gemini-sdk-migration
plan: "03"
subsystem: ai-discovery-service
tags: [gemini, google-genai, zod, structured-output, sdk-migration, discovery, document-processor]

dependency-graph:
  requires:
    - phase: 16-01
      provides: "zod-to-json-schema installed; @google/generative-ai fully removed from src/"
  provides:
    - "discovery/summarize route using gemini-2.5-pro (no preview suffix)"
    - "BusinessDiscoverySummarySchema (Zod) with zodToJsonSchema for responseJsonSchema enforcement"
    - "Markdown fence-stripping defensive code removed from discovery/summarize"
    - "document-processor.ts using responseSchema with Type.OBJECT for JSON enforcement"
  affects:
    - "16-04 and subsequent plans (pattern: use zodToJsonSchema for responseJsonSchema in discovery routes)"

tech-stack:
  added: []
  patterns:
    - "BusinessDiscoverySummarySchema.safeParse(JSON.parse(rawText)) — Zod validation on structured output response"
    - "responseJsonSchema: zodToJsonSchema(Schema) — Zod-to-JSON-Schema bridge for Gemini structured output"
    - "responseSchema with Type.OBJECT — native Gemini schema enforcement for document extraction"

key-files:
  created: []
  modified:
    - "src/app/api/discovery/summarize/route.ts"
    - "src/lib/ai/document-processor.ts"

key-decisions:
  - "Drop response.parsed fallback — not a property on GenerateContentResponse in @google/genai SDK; use JSON.parse(rawText) directly"
  - "Simplify SUMMARIZE_PROMPT — remove inline JSON schema block since responseJsonSchema handles format enforcement"

patterns-established:
  - "Structured output pattern: responseMimeType + responseJsonSchema(zodToJsonSchema) + Zod safeParse validation"
  - "Pre-existing TypeScript errors in unrelated files (document-processor Blob, rate-limit, export) are not regressions"

metrics:
  duration: ~8min
  completed: 2026-03-23
---

# Phase 16 Plan 03: Gemini SDK Migration — discovery/summarize + document-processor Summary

**Migrated discovery/summarize from preview model + manual fence-stripping to gemini-2.5-pro with Zod-validated structured output; added responseSchema to document-processor.ts for explicit JSON enforcement.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-23T00:00:00Z
- **Completed:** 2026-03-23T00:08:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- discovery/summarize now uses `gemini-2.5-pro` (no preview suffix) with `responseJsonSchema: zodToJsonSchema(BusinessDiscoverySummarySchema)` — eliminating the fence-stripping defensive code
- `BusinessDiscoverySummarySchema` (Zod) defined with all 20 fields matching `BusinessDiscoverySummary` interface; response validated with `safeParse` before returning
- document-processor.ts imports `Type` from `@google/genai` and uses `responseSchema` with `Type.OBJECT` covering all 6 fields of the extraction response shape

## Task Commits

1. **Tasks 1 + 2: Migrate discovery/summarize + add responseSchema to document-processor** - `e7d15c2` (feat)

## Files Created/Modified

- `src/app/api/discovery/summarize/route.ts` — Added `z`, `zodToJsonSchema` imports; added `BusinessDiscoverySummarySchema` constant; updated model to `gemini-2.5-pro`; added `responseJsonSchema` to config; replaced fence-stripping + `JSON.parse` with `safeParse` validation; simplified `SUMMARIZE_PROMPT` (removed inline JSON schema block)
- `src/lib/ai/document-processor.ts` — Added `Type` to `@google/genai` import; added `responseSchema` with `Type.OBJECT` matching `DocumentExtractionResult.structuredData` shape

## Decisions Made

- **Dropped `response.parsed` fallback** — `response.parsed` does not exist on `GenerateContentResponse` in the `@google/genai` SDK (TypeScript error TS2339). Used `JSON.parse(rawText)` directly. Structured output with `responseMimeType: "application/json"` ensures rawText is already valid JSON.
- **Simplified SUMMARIZE_PROMPT** — Removed the inline JSON schema block from the prompt body since `responseJsonSchema` in the config now enforces the format. Kept the field-by-field extraction instructions and rules list.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed non-existent `response.parsed` property**

- **Found during:** Task 1 (TypeScript compilation check)
- **Issue:** Plan spec included `response.parsed ?? JSON.parse(rawText)` but `parsed` is not a property on `GenerateContentResponse` in `@google/genai` SDK — caused TS2339 error
- **Fix:** Changed to `JSON.parse(rawText)` only; structured output guarantees rawText is valid JSON
- **Files modified:** `src/app/api/discovery/summarize/route.ts`
- **Verification:** `npx tsc --noEmit` — no errors for this file after fix
- **Committed in:** e7d15c2 (task commit)

---

**Total deviations:** 1 auto-fixed (1 bug — non-existent SDK property)
**Impact on plan:** Auto-fix necessary for TypeScript correctness. Behavior unchanged — JSON.parse(rawText) is the correct path since structured output guarantees JSON.

## Issues Encountered

Pre-existing TypeScript errors in other files (not regressions from this plan):
- `src/lib/ai/document-processor.ts:87` — `Buffer` not assignable to `BlobPart` (pre-existing; `new Blob([file])` type mismatch)
- `src/app/api/decks/[id]/export/route.ts` — Json type cast issue (pre-existing)
- `src/app/api/generate-document/revise/route.ts` — `canAccess` export missing (pre-existing)
- `src/lib/export/video-generator.ts` — `generatedVideos` property missing (pre-existing)
- `src/lib/rate-limit.ts` — Supabase type issues (pre-existing)

These were present before Plan 16-03 and are documented in Plan 16-01 SUMMARY as pre-existing.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Both files now use structured output mode — pattern established for remaining migration plans
- `zodToJsonSchema` pattern available for any remaining routes that need Zod-validated structured output
- All `preview-06-05` model strings removed from `src/`; all `gemini-2.0-flash` strings removed from `src/`
- No blockers for Phase 16 continuation

---
*Phase: 16-gemini-sdk-migration*
*Completed: 2026-03-23*
