# Napkin Runbook

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Execution & Validation (Highest Priority)
1. **[2026-03-28] Always read app-specific CLAUDE.md before working on apps/api/ or apps/client/**
   Do instead: run `Read apps/<target>/CLAUDE.md` before any task in that app.

## Shell & Command Reliability
1. **[2026-03-28] pnpm is the package manager for this monorepo**
   Do instead: use `pnpm` instead of `npm` or `yarn` for all install/run commands.

## Domain Behavior Guardrails
1. **[2026-03-28] apps/api and apps/client never import from each other**
   Do instead: communicate exclusively via REST API. No cross-app imports.

2. **[2026-03-28] All filenames must be kebab-case**
   Do instead: rename any file not in kebab-case before committing.

## User Directives
1. **[2026-03-28] TypeScript strict mode is mandatory in both apps**
   Do instead: ensure `"strict": true` in tsconfig.json; no implicit `any`.

2. **[2026-03-28] User-visible content must be in Portuguese, code in English**
   Do instead: write variable/function/type names in English; UI strings in pt-BR.
