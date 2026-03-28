# CLAUDE.md — TrabalhaLagos Client

Frontend da plataforma TrabalhaLagos. PWA mobile-first com SEO forte para landing pages por cidade e vagas indexáveis no Google Jobs.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 · React Query · react-hook-form + Zod

## Comandos

```bash
pnpm dev                           # Next.js dev server
pnpm build                         # Build de produção (zero erros TS)
pnpm lint                          # ESLint
pnpm lint:fix                      # ESLint + autofix
```

## Arquitetura

Next.js App Router com **Server Components por default**. `'use client'` só quando necessário (forms, mapa, filtros interativos, geolocalização).

```
src/
├── app/                              # Rotas (App Router file-based)
│   ├── layout.tsx                    # Root layout (providers, fonts, metadata)
│   ├── page.tsx                      # Home
│   ├── vagas/
│   │   ├── page.tsx                  # /vagas — busca com filtros
│   │   └── [cidade]/page.tsx         # /vagas/cabo-frio — SSG + ISR (SEO)
│   ├── vaga/[slug]/page.tsx          # Detalhe da vaga — SSR + JSON-LD
│   ├── (auth)/                       # Login, cadastro (route group)
│   ├── painel/                       # Painel empregador (protegido)
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── ui/                           # Primitivos: button, input, card, badge, modal
│   ├── layout/                       # Header, footer, mobile-nav
│   └── skeletons/                    # Loading states
├── lib/
│   ├── api.ts                        # Fetch wrapper (base URL, auth headers)
│   ├── utils/                        # cn, format-salary, slugify
│   └── constants/                    # LAGOS_CITIES, CATEGORIES, RADIUS_OPTIONS
├── hooks/                            # Hooks globais (use-geolocation, use-debounce)
├── types/                            # Tipos globais (job, company)
├── styles/globals.css                # Tailwind + @theme
└── locales/pt/translation.json       # i18n PT-BR
```

Componentes de feature são **colocated** com a rota: `app/vagas/components/`, `app/vaga/[slug]/hooks/`, etc.

## Skill de Referência

Antes de implementar, leia os docs em `.claude/skills/frontend-standards/`:

```
.claude/skills/frontend-standards/
├── SKILL.md                # Stack, convenções, estrutura, regras de código
├── component-patterns.md   # Button, Input, Badge, Form, Skeleton, hooks, i18n
├── routing-patterns.md     # App Router: layouts, SSG/ISR, metadata, sitemap, navegação
└── tailwind-patterns.md    # Tema TrabalhaLagos, classes v4, responsividade, referência visual
```

## Regras Inegociáveis

1. **Server Components por default**: só adicionar `'use client'` se o componente usa hooks, eventos ou APIs de browser.
2. **SEO em toda página pública**: `generateMetadata` em cada `page.tsx`. JSON-LD `JobPosting` no detalhe de vaga.
3. **SSG + ISR nas landing pages**: `generateStaticParams` + `revalidate = 600` em `/vagas/[cidade]`.
4. **Formulários**: react-hook-form + Zod sempre. Schemas colocated em `app/<rota>/schemas/`.
5. **i18n**: todo texto visível via `t('namespace.key')`. Nunca hardcode.
6. **Nomenclatura**: `kebab-case` em todos os arquivos. `use-geolocation.hook.ts`, não `useGeolocation.ts`.
7. **Primitivos UI**: usar `Button`, `Input`, `Card` de `components/ui/`. Nunca HTML bruto.
8. **Nunca tocar no backend**: este CLAUDE.md cobre apenas `apps/client/`.

## Convenções Rápidas

- Componentes: arrow functions, props via `interface`, sem `any`
- Ícones: Lucide React + `aria-label` se sem texto
- Classes Tailwind: usar v4 (`bg-linear-to-br`, `shrink-0`) — nunca sintaxe v3
- Cores do tema: `primary`, `primary-dark`, `primary-light`, `surface`, `border`, `error`, `success`
- `border-radius` padrão: `rounded-xl` (botões/inputs), `rounded-2xl` (cards)
- Mobile-first: largura máxima `max-w-lg` no container principal