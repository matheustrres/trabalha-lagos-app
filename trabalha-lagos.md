# TrabalhaLagos — Arquitetura Técnica

**Versão:** 2.0
**Data:** 30/03/2026
**Referência:** TrabalhaLagos PRD v1.0

---

## 1. Visão Geral

Monorepo com duas aplicações independentes que se comunicam via API REST.

```
root/
├── apps/api/        # Backend — NestJS monolito modular
├── apps/client/     # Frontend — Next.js 15 App Router
└── docs/            # Documentação detalhada por domínio
```

```
┌─────────────────────────────┐
│     Client (Next.js 15)     │
│   SSR/SSG + PWA + SEO       │
└──────────┬──────────────────┘
           │ HTTPS / REST
           ▼
┌─────────────────────────────┐
│     API (NestJS)            │
│   Monolito Modular          │
└───┬──────────┬──────────┬───┘
    ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌──────┐
│ PG +   │ │ Redis  │ │ S3   │
│ PostGIS│ │        │ │ / R2 │
└────────┘ └────────┘ └──────┘
```

---

## 2. Decisões Arquiteturais

| Decisão | Escolha | Alternativa descartada | Motivo |
|---|---|---|---|
| Arquitetura backend | Monolito modular | Microserviços | MVP regional, baixo tráfego. Modularidade do NestJS permite extrair depois |
| ORM | Drizzle | Prisma, TypeORM | Suporte nativo a PostGIS `geometry`, queries composíveis, type-safe, leve |
| Frontend framework | Next.js 15 (App Router) | TanStack Router + Vite | SEO é canal principal de aquisição. SSG/ISR nativo, metadata API, JSON-LD |
| Geoespacial | PostGIS (`ST_DWithin`, `ST_Distance`) | Haversine no app | Índice GiST, precisão, performance com volume |
| IDs | UUID v7 (negócio) + serial (referência) | CUID2, UUID v4 | Tipo nativo `uuid` 16 bytes, time-sortable, sem fragmentação B-tree |
| Autenticação | JWT (access 15min + refresh 7d) | Sessions, OAuth | Stateless, frontend SPA-like, sem server-side sessions |
| Pagamento | Asaas | Stripe | API brasileira, Pix nativo, taxas competitivas, documentação PT-BR |
| Cache | Redis | In-memory | Compartilhável entre instâncias, rate limiting, filas BullMQ |
| Estado frontend | React Query + useState + URL params | Zustand, Redux | Sem estado global necessário no MVP. URL params para filtros compartilháveis |

---

## 3. Stack

### Backend (apps/api/)

| Camada | Tecnologia |
|---|---|
| Framework | NestJS (TypeScript strict) |
| ORM | Drizzle ORM |
| Banco | PostgreSQL 16 + PostGIS |
| Cache / Filas | Redis + BullMQ |
| Auth | JWT (access + refresh) via Passport.js |
| Validação | class-validator + class-transformer (DTOs) |
| Pagamentos | Asaas (v1.5) |

### Frontend (apps/client/)

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19 + Tailwind CSS v4 |
| Forms | react-hook-form + Zod |
| Data fetching | React Query (TanStack Query) |
| Mapas | Leaflet / react-leaflet |
| Ícones | Lucide React |
| PWA | manifest.json + meta tags |

### Infra (MVP)

| Componente | Opção | Custo |
|---|---|---|
| Backend | Railway ou Render | $0-7/mês |
| Frontend | Vercel | $0 |
| Banco | Neon (PostgreSQL + PostGIS) | $0-19/mês |
| Redis | Upstash | $0 |
| Storage | Cloudflare R2 | $0 |

---

## 4. Backend — Módulos

```
src/modules/
├── auth/            # JWT, login, registro, refresh
├── users/           # CRUD candidatos
├── companies/       # CRUD empregadores (1:1 com user)
├── jobs/            # CRUD vagas + busca PostGIS por raio
├── interests/       # "Tenho interesse" candidato→vaga
├── categories/      # Lista de categorias (seeded)
├── geo/             # Geocoding, validação de coordenadas
├── payments/        # Asaas (v1.5)
├── notifications/   # Email, push (v1.5)
└── admin/           # Moderação (v2)
```

Padrão por módulo: `controller → service → repository`.
Detalhes de implementação em `/trabalha-lagos/docs/api.md`, `/trabalha-lagos/docs/auth.md`, `/trabalha-lagos/docs/database.md`.

---

## 5. Frontend — Rotas

```
src/app/
├── page.tsx                    # Home (hero, categorias, cidades, destaques)
├── vagas/
│   ├── page.tsx                # Busca com filtros (client-side)
│   └── [cidade]/page.tsx       # Landing page SSG + ISR (SEO)
├── vaga/[slug]/page.tsx        # Detalhe da vaga (SSR + JSON-LD)
├── (auth)/
│   ├── login/page.tsx
│   └── cadastro/page.tsx
├── painel/                     # Protegido (empregador)
│   ├── page.tsx                # Dashboard
│   ├── nova-vaga/page.tsx      # Publicar vaga
│   ├── vagas/page.tsx          # Minhas vagas
│   └── interesses/page.tsx     # Interesses recebidos
├── sitemap.ts
└── robots.ts
```

Server Components por default. `'use client'` apenas para interatividade (forms, filtros, mapa, geolocalização).

---

## 6. Banco de Dados

### Entidades

```
users ──1:1──> companies ──1:N──> jobs ──N:1──> categories
                                   │
                              interests <──N:1── users
```

### Estratégia de IDs

| Entidade | Tipo | Bytes por PK |
|---|---|---|
| users, companies, jobs, interests | UUID v7 | 16 |
| categories | serial | 4 |

### PostGIS

A tabela `jobs` tem coluna `geometry(Point, 4326)` com índice GiST. Busca por raio via `ST_DWithin` + ordenação por `ST_Distance`.

Cidades são constantes no código, não tabela.

Detalhes em `/trabalha-lagos/docs/database.md`.

---

## 7. SEO

| Página | Estratégia | Revalidação |
|---|---|---|
| Landing por cidade (`/vagas/[cidade]`) | SSG + ISR | 10 min |
| Detalhe de vaga (`/vaga/[slug]`) | SSR | Real-time |
| Home | SSG + ISR | 10 min |

Cada vaga tem JSON-LD `JobPosting` (schema.org) para indexação no Google Jobs.
Sitemap dinâmico gerado via `src/app/sitemap.ts`.

---

## 8. Documentação Detalhada

Cada domínio tem documentação dedicada em `docs/`. Consultar antes de implementar.

| Arquivo | Conteúdo |
|---|---|
| `database.md` | Schema Drizzle, PostGIS, queries, IDs, migrations |
| `api.md` | Endpoints, DTOs, validação, paginação |
| `auth.md` | JWT, guards, regras de acesso |
| `business-rules.md` | Planos, limites, expiração, moderação |
| `payments.md` | Asaas, webhooks, planos |
| `caching.md` | Redis keys, TTLs, invalidação |
| `queues.md` | BullMQ, processors, crons |
| `geo.md` | Cidades, coordenadas, raios, geocoding |
| `testing.md` | Convenções, fixtures, testcontainers |
| `infrastructure.md` | Docker, deploy, env vars, CI/CD |