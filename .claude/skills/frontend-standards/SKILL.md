---
name: frontend-standards
description: >
  React 19 + TypeScript + Tailwind CSS v4 + TanStack Router patterns. Use when implementing components, pages, layouts, routing, forms, or any frontend code. Use when the user mentions React components, UI, styling, Tailwind, responsive design, routing, protected routes, frontend conventions.
---

# Frontend Standards

## Stack

- React 19.x (arrow functions para componentes)
- TypeScript 5.7.x (strict mode)
- Tailwind CSS v4 (via `@tailwindcss/vite` — zero-runtime)
- TanStack Router v1 (file-based routing com `@tanstack/react-router`)
- TanStack React Start (SSR)
- TanStack Query / React Query (estado de servidor — `useQuery`, `useMutation`)
- Zustand (estado global de cliente — `store/`)
- react-hook-form + zod + @hookform/resolvers (formulários — obrigatório)
- i18next + react-i18next (PT-BR em `src/locales/pt/translation.json`)
- @phosphor-icons/react (ícones)
- Vitest + Testing Library (testes)
- Vite + Nx (build tooling)

---

## Convenções de Nomenclatura

Todos os arquivos (exceto componentes React e arquivos gerados automaticamente) seguem o padrão:

**`kebab-case.tipodearquivo.extensão`**

| Tipo de Artefato        | Padrão de Nome                     | Exemplo                              |
| :---------------------- | :--------------------------------- | :----------------------------------- |
| Componente React        | `kebab-case.tsx`                   | `register-form.tsx`, `user-card.tsx` |
| Hook customizado        | `use-nome.hook.ts`                 | `use-responsibles.hook.ts`           |
| Serviço (Axios)         | `nome.service.ts`                  | `register-user.service.ts`           |
| Store Zustand           | `nome.store.ts`                    | `ui.store.ts`, `session.store.ts`    |
| Schema de validação Zod | `nome.schema.ts`                   | `register-user.schema.ts`            |
| Tipo / Interface TS     | `nome.types.ts`                    | `responsible.types.ts`               |
| Utilitário              | `nome.utils.ts`                    | `format-currency.utils.ts`           |
| Constante               | `nome.constants.ts`                | `routes.constants.ts`                |
| Contexto React          | `nome.context.tsx`                 | `auth.context.tsx`                   |
| Arquivo de rota         | `kebab-case.tsx` (TanStack Router) | `_app.tsx`, `__root.tsx`             |

**Regras adicionais:**

- Interface de props: `PascalCase + Props` → `ResponsibleCardProps`
- Export de hook: `camelCase` → `export const useResponsibles`
- Export de store: `camelCase` → `export const useUIStore`
- Constantes de valor: `UPPER_CASE` → `BASE_URL`, `APP_NAME`
- **Nunca** usar `camelCase` nem `PascalCase` em nomes de arquivo

---

## Estrutura de Diretórios

### Raiz global (`frontend/web/src/`)

| Pasta             | Descrição                                                                                                                                                                                             |
| :---------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`routes/`**     | Rotas do TanStack Router. Cada rota é uma pasta auto-contida com seus próprios contextos isolados.                                                                                                    |
| **`components/`** | Componentes de UI genéricos (botões, inputs, modais) compartilhados por toda a aplicação.                                                                                                             |
| **`services/`**   | Camada de comunicação externa (Axios, chamadas ao backend NestJS).                                                                                                                                    |
| **`hooks/`**      | Hooks customizados globais e do React Query (`useQuery`, `useMutation`) compartilhados.                                                                                                               |
| **`contexts/`**   | Provedores de estado globais (ex: Autenticação, Tema).                                                                                                                                                |
| **`store/`**      | Estado global síncrono de cliente gerenciado com Zustand. Cobre tudo que não é estado de servidor (React Query) nem estado local (`useState`). Ex: UI global, sessão enriquecida, fluxos multi-etapa. |
| **`utils/`**      | Funções utilitárias globais (formatação de moeda, máscaras, conversão de datas).                                                                                                                      |
| **`types/`**      | Definições de interfaces TS globais.                                                                                                                                                                  |
| **`config/`**     | Arquivos de configuração global (ex: setup do Axios, React Query).                                                                                                                                    |
| **`constants/`**  | Variáveis de ambiente, feature flags e constantes globais.                                                                                                                                            |
| **`assets/`**     | Imagens e ícones estáticos.                                                                                                                                                                           |
| **`styles/`**     | Estilos globais (Tailwind).                                                                                                                                                                           |

```
frontend/web/src/
├── routes/
│   ├── __root.tsx                    # Root layout (gerado pelo TanStack Router)
│   ├── _app.tsx                      # Layout protegido
│   └── _app/
│       ├── dashboard/
│       │   ├── index.tsx             # Página principal da rota
│       │   ├── components/           # Componentes exclusivos desta rota
│       │   ├── hooks/                # Hooks específicos desta rota
│       │   ├── schemas/              # Schemas Zod locais
│       │   ├── types/                # Tipagens exclusivas desta rota
│       │   └── utils/                # Helpers usados apenas aqui
│       ├── responsibles/
│       │   └── ...                   # Mesma estrutura
│       └── (auth)/
│           ├── route.tsx             # Auth layout
│           ├── login.tsx
│           └── register.tsx
├── components/
│   ├── ui/                           # Button, Input, Card, Modal, etc.
│   ├── layout/                       # Header, Sidebar
│   └── skeletons/                    # Loading states
├── services/                         # Arquivos *.service.ts (Axios)
├── hooks/                            # Hooks globais compartilhados (*.hook.ts)
├── store/                            # Stores Zustand (*.store.ts)
│   ├── ui.store.ts
│   ├── session.store.ts
│   ├── wizard.store.ts
│   └── index.ts                      # Re-exports centralizados
├── contexts/                         # Providers React (*.context.tsx)
├── utils/                            # Utilitários globais (*.utils.ts)
├── types/                            # Interfaces TS globais (*.types.ts)
├── constants/                        # Constantes globais (*.constants.ts)
├── config/                           # Setup Axios, React Query, i18n
├── assets/                           # Imagens e ícones estáticos
├── styles/                           # Estilos globais
│   └── global.css                    # Tailwind + @theme
├── locales/
│   └── pt/
│       └── translation.json
├── router.tsx
└── routeTree.gen.ts                  # Auto-gerado — NUNCA editar
```

---

## Estrutura Interna de Cada Rota

Cada rota é uma pasta **auto-contida**. O `index.tsx` é obrigatório; as subpastas são opcionais e devem existir apenas quando necessário.

```
routes/_app/responsibles/
├── index.tsx                         # Página: renderização + lógica principal
├── components/
│   ├── responsible-card.tsx
│   └── responsible-filter.tsx
├── hooks/
│   └── use-responsibles.hook.ts
├── schemas/
│   └── register-responsible.schema.ts
├── types/
│   └── responsible.types.ts
└── utils/
    └── format-responsible.utils.ts
```

**Responsabilidade do `index.tsx`:**

- É o componente de página
- Consome hooks do React Query para dados do servidor
- Pode consumir stores do Zustand para estado global de cliente
- Monta os componentes locais da pasta `components/`
- Permanece focado — não deve ultrapassar ~200 linhas

---

## Estado — Decisão por Camada

Antes de escolher onde guardar um estado, use a tabela abaixo:

| Camada                     | Ferramenta                             | Quando usar                                                     |
| :------------------------- | :------------------------------------- | :-------------------------------------------------------------- |
| **Estado de servidor**     | React Query (`useQuery`/`useMutation`) | Dados que vêm da API (fetch, cache, revalidação)                |
| **Estado global cliente**  | Zustand (`store/`)                     | Estado que precisa cruzar rotas (UI global, sessão, wizards)    |
| **Estado local**           | `useState` / `useReducer`              | Estado que vive e morre dentro de uma única rota/componente     |
| **Injeção de dependência** | React Context (`contexts/`)            | Auth provider, tema, i18n — coisas que envolvem providers React |

> **Regra de ouro**: antes de colocar algo no `store/` global, pergunte se ele realmente precisa cruzar rotas. Se não, `useState` local é suficiente.

### Zustand — Exemplo de Store

```typescript
// store/ui.store.ts
import { create } from 'zustand'

interface UIStore {
  isSidebarOpen: boolean
  toggleSidebar: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}))
```

---

## Componente Canônico

```tsx
// src/components/ui/card.tsx
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn.utils'

interface CardProps {
  title: string
  description?: string
  className?: string
  children?: React.ReactNode
}

const Card = ({ title, description, className, children }: CardProps) => {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
    >
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
      {children}
    </div>
  )
}

export default Card
```

---

## Regras de Código

- Arrow functions para componentes (`const X = () => {}`, não `function X()`)
- Semicolons: sim. Quotes: single. JSX quotes: double. Indent: 2 espaços. Max line: 100
- Todo texto visível via `t('namespace.key')` — nunca hardcode
- Props tipadas via `interface` (não `type` para props de componentes)
- Sem `any` — use `unknown` + type guard se necessário
- Use componentes primitivos (`Button`, `FormField`) em vez de `<button>` ou `<input>` HTML bruto
- Adicione `// eslint-disable-next-line react-refresh/only-export-components` antes de `createContext` quando Provider está no mesmo arquivo

## Ordem de Imports

```tsx
// 1. React e hooks do React
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
// 2. TanStack Router
import { Link, useNavigate } from '@tanstack/react-router'
// 3. Hooks do projeto (globais)
import { useCountdown } from '@/hooks/use-countdown.hook'
// 4. Stores Zustand
import { useUIStore } from '@/store/ui.store'
// 5. Serviços e utils
import { cn } from '@/utils/cn.utils'
// 6. Componentes do projeto
import { Button } from '@/components/ui/button'
// 7. Hooks locais da rota
import { useResponsibles } from './hooks/use-responsibles.hook'
// 8. Types locais
import type { ResponsibleFormData } from './schemas/register-responsible.schema'
```

---

## Formulários (react-hook-form + zod)

Todo formulário com validação **obrigatoriamente** usa `react-hook-form` + `zod`.
Nunca `useState` para campos de formulário. Nunca validação manual imperativa.

**Regras:**

- Schema Zod **local** à rota: `routes/<rota>/schemas/<nome>.schema.ts` — nunca inline no componente
- Mensagens de erro como chaves i18n: `z.string().min(1, t('common.validation.required'))`
- Exporte tipos inferidos: `export type RegisterResponsibleData = z.infer<typeof registerResponsibleSchema>`
- Erros de campo via `errors.field?.message`
- Erros de servidor: um único `useState<string | null>`
- Componentes Input usam `forwardRef` (necessário para `register()` do hook-form)
- `disabled={isSubmitting}` no botão submit (previne double-submit)

```typescript
// routes/_app/responsibles/schemas/register-responsible.schema.ts
import { z } from 'zod'

export const registerResponsibleSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

export type RegisterResponsibleData = z.infer<typeof registerResponsibleSchema>
```

---

## Roteamento (TanStack Router — File-based)

- **File-based routing**: arquivos em `src/routes/` geram rotas automaticamente
- **Layout groups**: prefixo `_` (ex: `_app.tsx` → layout sem segmento URL)
- **Route groups**: parênteses (ex: `(auth)/` → agrupamento sem afetar URL)
- **Root layout**: `__root.tsx` — layout raiz da aplicação
- **Auto-gerado**: `routeTree.gen.ts` — **NUNCA editar manualmente**
- Use `<Link>` de `@tanstack/react-router` para navegação declarativa
- Use `useNavigate()` para navegação programática
- Use `useSearch()` para query params

---

## Componentes UI (`src/components/ui/`)

Componentes reutilizáveis que devem ser usados em vez de tags HTML brutas.

- **Button** (`button.tsx`): variantes (`primary`, `secondary`, `danger`, `ghost`) + sizes (`sm`, `md`, `lg`)
- **Input** (`input.tsx`): `forwardRef` para hook-form, suporta label + error
- **Card** (`card.tsx`): container com estilos padronizados
- **Modal** (`modal.tsx`): diálogo acessível
- **Checkbox, Select, Radio**: controles de formulário
- **Tooltip** (`tooltip.tsx`): dicas contextuais

---

## Icons (@phosphor-icons/react)

- Sempre use sufixo `Icon`: `TrashIcon`, nunca `Trash`
- Ícone sem texto visível → `aria-label` obrigatório no elemento clicável pai
- Ícone decorativo (acompanha texto) → `aria-hidden` no ícone
- Use `weight="fill"` para estados ativos/selecionados
- Use prop `color` ou herde via `currentColor` (não `className` para cor)

```tsx
import { TrashIcon, InfoIcon } from '@phosphor-icons/react'

// Botão com ícone (sem texto → aria-label obrigatório)
<button aria-label={t('common.delete')} onClick={handleDelete}>
  <TrashIcon size={16} />
</button>

// Ícone decorativo ao lado de texto
<span className="flex items-center gap-1.5">
  <InfoIcon size={14} aria-hidden />
  {t('tasks.info_message')}
</span>
```

---

## Acessibilidade

- Todo `<button>` sem texto visível precisa de `aria-label`
- Todo `<input>` precisa de `<label>` associado via `htmlFor`
- Modais usam `<dialog>` nativo (trap focus automático)
- Cores de contraste mínimo: 4.5:1 (texto normal), 3:1 (texto grande)
- Focus visível: `focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`
