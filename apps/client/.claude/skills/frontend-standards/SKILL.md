---
name: frontend-standards
description: >
  Next.js 15 App Router + React 19 + TypeScript + Tailwind CSS v4 patterns. Use when implementing components, pages, layouts, routing, forms, SEO, or any frontend code. Use when the user mentions React components, UI, styling, Tailwind, responsive design, routing, protected routes, frontend conventions.
---

# Frontend Standards — TrabalhaLagos

## Stack

- Next.js 15.x (App Router, Server Components por default)
- React 19.x (arrow functions para componentes)
- TypeScript 5.x (strict mode)
- Tailwind CSS v4 (via `@tailwindcss/postcss`)
- React Query / TanStack Query (estado de servidor — `useQuery`, `useMutation`)
- react-hook-form + zod + @hookform/resolvers (formulários — obrigatório)
- i18next + react-i18next (PT-BR em `src/locales/pt/translation.json`)
- Lucide React (ícones)
- Leaflet / react-leaflet (mapa de vagas)
- next-pwa (PWA — service worker, offline)

---

## Convenções de Nomenclatura

Todos os arquivos seguem **kebab-case** com sufixo de tipo:

| Tipo de Artefato        | Padrão de Nome            | Exemplo                         |
| :---------------------- | :------------------------ | :------------------------------ |
| Componente React        | `kebab-case.tsx`          | `job-card.tsx`, `search-bar.tsx`|
| Hook customizado        | `use-nome.hook.ts`        | `use-geolocation.hook.ts`       |
| Schema de validação Zod | `nome.schema.ts`          | `create-interest.schema.ts`     |
| Tipo / Interface TS     | `nome.types.ts`           | `job.types.ts`                  |
| Utilitário              | `nome.utils.ts`           | `format-salary.utils.ts`        |
| Constante               | `nome.constants.ts`       | `cities.constants.ts`           |
| Serviço (fetch)         | `nome.service.ts`         | `jobs.service.ts`               |
| Página Next.js          | `page.tsx`                | Convenção App Router            |
| Layout Next.js          | `layout.tsx`              | Convenção App Router            |

**Regras:**
- Interface de props: `PascalCase + Props` → `JobCardProps`
- Export de hook: `camelCase` → `export const useGeolocation`
- Constantes de valor: `UPPER_CASE` → `LAGOS_CITIES`, `RADIUS_OPTIONS`
- **Nunca** usar camelCase nem PascalCase em nomes de arquivo

---

## Estrutura de Diretórios

```
frontend/src/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout (providers, fonts, metadata global)
│   ├── page.tsx                      # Home — hero, categorias, cidades, destaques
│   ├── vagas/
│   │   ├── page.tsx                  # /vagas — busca com filtros
│   │   ├── [cidade]/
│   │   │   ├── page.tsx              # /vagas/cabo-frio — landing page SSG (SEO)
│   │   │   └── [categoria]/
│   │   │       └── page.tsx          # /vagas/cabo-frio/turismo
│   │   └── components/              # Componentes colocated (job-list, filters)
│   ├── vaga/
│   │   └── [slug]/
│   │       ├── page.tsx              # /vaga/garcom-restaurante-mar-aberto (SSR)
│   │       └── components/           # Componentes colocated (job-detail, interest-modal)
│   ├── empresas/
│   │   ├── page.tsx                  # /empresas — diretório
│   │   └── [slug]/
│   │       └── page.tsx              # /empresa/restaurante-mar-aberto
│   ├── (auth)/
│   │   ├── layout.tsx                # Layout de autenticação (centralizado)
│   │   ├── login/page.tsx
│   │   └── cadastro/page.tsx
│   ├── painel/                       # Painel do empregador (protegido)
│   │   ├── layout.tsx                # Layout com sidebar + auth guard
│   │   ├── page.tsx                  # Dashboard
│   │   ├── vagas/page.tsx            # Minhas vagas
│   │   ├── nova-vaga/page.tsx        # Publicar vaga
│   │   └── interesses/page.tsx       # Interesses recebidos
│   ├── sitemap.ts                    # Sitemap dinâmico
│   └── robots.ts                     # Robots.txt
├── components/
│   ├── ui/                           # Primitivos: button, input, card, modal, badge
│   ├── layout/                       # Header, footer, mobile-nav
│   ├── skeletons/                    # Loading states
│   └── seo/                          # JsonLd, MetaTags helpers
├── lib/
│   ├── api.ts                        # Fetch wrapper (API base URL, auth headers)
│   ├── utils/
│   │   ├── cn.utils.ts               # clsx + twMerge
│   │   ├── format-salary.utils.ts
│   │   └── slugify.utils.ts
│   └── constants/
│       ├── cities.constants.ts       # LAGOS_CITIES com coordenadas
│       └── categories.constants.ts   # CATEGORIES
├── hooks/                            # Hooks globais compartilhados
│   ├── use-geolocation.hook.ts
│   └── use-debounce.hook.ts
├── types/                            # Tipos globais
│   ├── job.types.ts
│   └── company.types.ts
├── styles/
│   └── globals.css                   # Tailwind + @theme
├── locales/
│   └── pt/
│       └── translation.json
└── public/
    ├── manifest.json                 # PWA manifest
    └── icons/                        # PWA icons
```

---

## Estrutura Interna de Cada Rota

Cada rota pode ter subpastas **colocated**. O `page.tsx` é obrigatório; o resto é opcional.

```
app/vagas/
├── page.tsx                          # Server Component (metadata + dados iniciais)
├── components/
│   ├── job-list.tsx                  # 'use client' — filtros interativos
│   ├── job-card.tsx
│   ├── radius-selector.tsx
│   └── job-map.tsx                   # Leaflet (client-only)
├── hooks/
│   └── use-job-search.hook.ts        # React Query + filtros
├── schemas/
│   └── search-filters.schema.ts     # Zod schema dos filtros
└── types/
    └── filters.types.ts
```

---

## Server Components vs Client Components

**Server Component (default)** — Não precisa de diretiva:
- Páginas de listagem e detalhe (fetch de dados no servidor)
- Landing pages por cidade (SSG)
- Qualquer componente sem interatividade, estado ou hooks de browser

**Client Component** — Requer `'use client'` no topo:
- Formulários (react-hook-form usa hooks)
- Mapa (Leaflet precisa de `window`)
- Filtros interativos (useState, useEffect)
- Componentes com onClick, onChange, etc.
- Geolocalização (navigator.geolocation)

**Regra:** o page.tsx pode ser Server Component que importa Client Components. Manter o máximo possível no servidor.

---

## Estado — Decisão por Camada

| Camada | Ferramenta | Quando usar |
| :--- | :--- | :--- |
| **Estado de servidor** | React Query (`useQuery`/`useMutation`) | Dados da API (vagas, empresas, categorias) |
| **Estado local** | `useState` / `useReducer` | Estado de um componente (filtros abertos, modal, form) |
| **URL state** | `useSearchParams` + `useRouter` | Filtros de busca, paginação (compartilhável via URL) |

Não usar Zustand, Redux, MobX ou Context para estado no MVP. React Query + useState + URL params cobrem todos os casos.

---

## Componente Canônico

```tsx
// src/components/ui/card.tsx
import { cn } from '@/lib/utils/cn.utils'

interface CardProps {
  title: string
  description?: string
  className?: string
  children?: React.ReactNode
}

export const Card = ({ title, description, className, children }: CardProps) => (
  <div className={cn(
    'rounded-2xl border border-border bg-white p-4 shadow-sm transition-shadow hover:shadow-md',
    className,
  )}>
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    {children}
  </div>
)
```

---

## Regras de Código

- Arrow functions para componentes — sempre, sem exceção
- Semicolons: não. Quotes: single. JSX quotes: double. Indent: 2 espaços
- Todo texto visível via `t('namespace.key')` — nunca hardcode
- Props tipadas via `interface` (não `type` para props de componentes)
- Sem `any` — use `unknown` + type guard se necessário
- Use componentes primitivos (`Button`, `Input`) em vez de HTML bruto
- Imports com alias `@/` para `src/`

## Ordem de Imports

```tsx
// 1. React e hooks
import { useState } from 'react'
// 2. Next.js
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
// 3. Libs externas
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
// 4. Componentes do projeto (globais)
import { Button } from '@/components/ui/button'
// 5. Hooks, utils, types globais
import { useGeolocation } from '@/hooks/use-geolocation.hook'
import { cn } from '@/lib/utils/cn.utils'
// 6. Componentes, hooks, types locais (colocated)
import { JobCard } from './components/job-card'
import type { JobFilters } from './types/filters.types'
```

---

## Formulários (react-hook-form + zod)

Todo formulário com validação **obrigatoriamente** usa `react-hook-form` + `zod`.
Nunca `useState` para campos. Nunca validação manual.

- Schema Zod **colocated** com a rota: `app/<rota>/schemas/<nome>.schema.ts`
- Mensagens de erro como chaves i18n
- Exporte tipos inferidos: `export type CreateInterestData = z.infer<typeof createInterestSchema>`
- Componentes Input usam `forwardRef` (necessário para `register()`)
- `disabled={isSubmitting}` no botão submit

---

## SEO

### Metadata (em cada page.tsx)

```tsx
// app/vagas/[cidade]/page.tsx
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ cidade: string }>
}

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { cidade } = await params
  const cityName = getCityName(cidade) // lookup de slug → nome

  return {
    title: `Vagas em ${cityName} — TrabalhaLagos`,
    description: `Encontre vagas de emprego em ${cityName}, Região dos Lagos. CLT, PJ, freelancer e temporário.`,
    openGraph: {
      title: `Vagas em ${cityName} — TrabalhaLagos`,
      description: `Vagas de emprego na Região dos Lagos`,
      url: `https://trabalhalagos.com.br/vagas/${cidade}`,
    },
  }
}
```

### JSON-LD JobPosting (detalhe da vaga)

```tsx
// app/vaga/[slug]/page.tsx
const jsonLd = {
  '@context': 'https://schema.org/',
  '@type': 'JobPosting',
  title: job.title,
  description: job.description,
  datePosted: job.createdAt,
  validThrough: job.expiresAt,
  employmentType: mapContractType(job.contractType),
  hiringOrganization: {
    '@type': 'Organization',
    name: job.company.name,
  },
  jobLocation: {
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      addressLocality: job.city,
      addressRegion: 'RJ',
      addressCountry: 'BR',
    },
  },
}

// No JSX:
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
```

### SSG com ISR (landing pages por cidade)

```tsx
// app/vagas/[cidade]/page.tsx
import { LAGOS_CITIES } from '@/lib/constants/cities.constants'

export const generateStaticParams = () =>
  LAGOS_CITIES.map((city) => ({ cidade: city.slug }))

export const revalidate = 600 // ISR: revalida a cada 10 min
```

---

## Ícones (Lucide React)

```tsx
import { MapPin, Briefcase, Clock } from 'lucide-react'

// Com texto → ícone é decorativo
<span className="flex items-center gap-1.5">
  <MapPin size={14} aria-hidden />
  Cabo Frio • 3.2 km
</span>

// Sem texto → aria-label obrigatório
<button aria-label="Compartilhar vaga">
  <Share2 size={16} />
</button>
```

---

## Componentes UI (`src/components/ui/`)

Primitivos reutilizáveis — usar em vez de HTML bruto:

- `button.tsx` — variantes: `primary`, `secondary`, `danger`, `ghost`, `whatsapp`
- `input.tsx` — `forwardRef`, suporta label + error
- `card.tsx` — container padronizado
- `badge.tsx` — tags de contrato (CLT, PJ, Freelancer, etc.)
- `modal.tsx` — bottom sheet mobile + dialog desktop
- `skeleton.tsx` — loading states

Detalhes de implementação em `component-patterns.md`.