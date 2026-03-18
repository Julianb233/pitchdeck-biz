# pitchdeck.biz — State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-17)

**Core value:** Transform any business idea into investor-ready materials through an AI-powered full-service consultation experience
**Current focus:** v2.0 milestone initialization — awaiting roadmap creation

## Current Position

Milestone: v2.0 — Full-Service Consultation Platform + Gemini API Overhaul
Phase: Not started (run /gsd:create-roadmap)
Plan: —
Status: Defining requirements
Last activity: 2026-03-17 — Milestone v2.0 started

## v1.0 Deployment (Reference)

- Production URL: https://pitchdeck.biz
- Vercel Project: pitchdeck-biz (ai-acrobatics org)
- Vercel Project ID: prj_1iNSBJ3eAhTOFAr9OJtgie4I8IUi
- Deployed: 2026-03-12
- Build: Next.js 15.5.12 (37 pages, 28 API routes)

## Infrastructure

- Hosting: Vercel (production)
- Database: Supabase (11 tables, RLS, RPC functions)
- Payments: Stripe (test mode)
  - Stripe Webhook: we_1TAOvTE8iqjFMOfSU9wSXpHZ
- Auth: Custom JWT + session tokens
- AI: Anthropic Claude Sonnet 4, OpenAI Whisper, Gemini 2.0 Flash (DEPRECATED)

## Pending Migrations

- Gemini 2.0 Flash → 2.5 Flash (deadline: June 1, 2026)
- @google/generative-ai → @google/genai SDK
