# Napkin Runbook

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Execution & Validation (Highest Priority)
1. **[2026-03-28] Always read app-specific CLAUDE.md before working on apps/api/ or apps/client/**
   Do instead: run `Read apps/<target>/CLAUDE.md` before any task in that app.

2. **[2026-04-03] APP_GUARD com `ThrottlerGuard` quebra testes com `useMocker` (Reflector não resolvido)**
   Do instead: usar um guard wrapper (`GlobalThrottlerGuard`) que instancia `ThrottlerGuard` com `new Reflector()` e delega `canActivate`.

## Shell & Command Reliability
1. **[2026-03-28] pnpm is the package manager for this monorepo**
   Do instead: use `pnpm` instead of `npm` or `yarn` for all install/run commands.

2. **[2026-04-02] zsh interpreta `[]` em paths dinâmicos do Next.js como glob**
   Do instead: sempre envolver paths com `[slug]`, `[id]`, etc. entre aspas em comandos git/bash.

3. **[2026-04-03] Pacote `@nestjs/throttler-storage-redis` não existe no npm**
   Do instead: instalar `@nest-lab/throttler-storage-redis` junto com `@nestjs/throttler`.

## Next.js / React-Hook-Form / Zod Gotchas
1. **[2026-03-29] Zod v4: `errorMap` renamed to `error`, enums need `as const`**
   Do instead: use `error: () => ({ message: '...' })` and `z.enum([...] as const, {...})`.

2. **[2026-03-29] `z.coerce.number()` causes Resolver type mismatch with react-hook-form**
   Do instead: use `z.number().optional()` + `register('field', { valueAsNumber: true })`.

3. **[2026-03-29] `z.boolean().default()` / `z.enum().default()` cause Resolver type mismatch**
   Do instead: remove `.default()` from schema; set defaults in `useForm({ defaultValues: {...} })`.

4. **[2026-04-01] SSG/ISR quebra build quando API está offline durante prerender**
   Do instead: em Server Components com `fetch`, usar fallback com `try/catch` e retornar payload seguro (sem lançar erro).

## Database & Drizzle
1. **[2026-03-30] docker-compose.yml must use `postgis/postgis:16-3.4` not `postgres:alpine`**
   Do instead: verify image in docker-compose.yml before running PostGIS migrations; update if it's plain postgres.

2. **[2026-03-30] drizzle-kit migrate fails silently if DB doesn't exist yet**
   Do instead: create the database manually first (`CREATE DATABASE trabalha_lagos_db`) before running drizzle-kit migrate.

3. **[2026-03-30] drizzle-kit doesn't track manually created SQL files — only those in `_journal.json`**
   Do instead: prepend manual SQL (e.g. `CREATE EXTENSION IF NOT EXISTS postgis`) to the first generated migration file.

4. **[2026-03-30] Run drizzle-kit with `DATABASE_URL` env var since dotenv-cli syntax differs**
   Do instead: use `DATABASE_URL="..." pnpm drizzle-kit migrate` directly (not `dotenv -e .env.dev -- pnpm drizzle-kit`).

## Domain Behavior Guardrails
1. **[2026-03-28] apps/api and apps/client never import from each other**
   Do instead: communicate exclusively via REST API. No cross-app imports.

2. **[2026-03-28] All filenames must be kebab-case**
   Do instead: rename any file not in kebab-case before committing.

## User Directives
1. **[2026-04-02] Para explorar o codebase, usar smart-explorer primeiro**
   Do instead: iniciar com `explore_overview` e só depois usar `explore_search/codemap/peek`.

2. **[2026-03-28] TypeScript strict mode is mandatory in both apps**
   Do instead: ensure `"strict": true` in tsconfig.json; no implicit `any`.

3. **[2026-03-28] User-visible content must be in Portuguese, code in English**
   Do instead: write variable/function/type names in English; UI strings in pt-BR.
