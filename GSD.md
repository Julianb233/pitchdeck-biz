# GSD (Get Shit Done) — Usage for this Repo

This repo is meant to be driven by spec-first, verification-first agent workflows.

## Quick start (Claude Code)
1) Install/Update GSD commands:

```bash
npx get-shit-done-cc@latest
```

2) In Claude Code, run:
- `/gsd:help`

## Agent workflow (recommended)
For any task/issue:
- Start from a spec (Linear issue + acceptance criteria)
- Make a short plan
- Implement small diffs
- Provide verification evidence (tests + screenshots if UI)

## Local dev
```bash
npm install
npm run dev
```

## Deployment
Deploy via Vercel. Use preview deployments for verification before merging to main.
