# Tailwind CSS v4 Patterns — TrabalhaLagos

## Setup (Next.js 15)

```bash
pnpm install tailwindcss @tailwindcss/postcss
```

```ts
// postcss.config.ts
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

```css
/* src/styles/globals.css */
@import 'tailwindcss';

@theme {
  /* Paleta TrabalhaLagos — verde costeiro */
  --color-primary: #0c7a5a;
  --color-primary-dark: #085a42;
  --color-primary-light: #7ddcb8;

  /* Feedback */
  --color-error: #ef4444;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-info: #0ea5e9;

  /* Superfície */
  --color-surface: #f8f6f2;
  --color-border: #e8e4de;

  /* Tipografia */
  --font-sans: 'DM Sans', system-ui, sans-serif;
  --font-display: 'Playfair Display', serif;
}
```

---

## Tailwind v4 vs v3 — Classes Renomeadas

**Sempre use a versão v4.**

| Tailwind v3 (obsoleta) | Tailwind v4 (correta) |
| :--------------------- | :-------------------- |
| `bg-gradient-to-br`    | `bg-linear-to-br`     |
| `bg-gradient-to-r`     | `bg-linear-to-r`      |
| `flex-shrink-0`        | `shrink-0`            |
| `flex-grow`            | `grow`                |
| `break-words`          | `wrap-break-word`     |
| `overflow-ellipsis`    | `text-ellipsis`       |
| `decoration-clone`     | `box-decoration-clone`|

**Regra:** se encontrar qualquer classe da coluna esquerda, substituir pela v4.

---

## Responsividade

Mobile-first. O TrabalhaLagos é usado primariamente no celular.

| Breakpoint | Min-width | Uso              |
| :--------- | :-------- | :--------------- |
| (default)  | 0px       | Mobile           |
| `sm`       | 640px     | Mobile landscape |
| `md`       | 768px     | Tablet           |
| `lg`       | 1024px    | Desktop          |

Limitar largura máxima a `max-w-lg` (512px) para manter proporção mobile em telas grandes — o layout é mobile-first, a versão desktop é secundária no MVP.

```tsx
// Container principal da aplicação
<div className="mx-auto max-w-lg">
  {children}
</div>
```

---

## Referência de Classes — Elementos Comuns

### Hero (Home)

| Elemento | Classes |
| :--- | :--- |
| Container | `bg-linear-to-br from-primary via-primary-dark to-primary-dark/90 px-6 py-12` |
| Título | `font-display text-3xl font-extrabold text-white leading-tight` |
| Subtítulo | `text-sm text-white/75 leading-relaxed` |
| Stat number | `text-xl font-bold text-white` |
| Stat label | `text-xs text-white/60` |

### Cards de Vaga

| Elemento | Classes |
| :--- | :--- |
| Card normal | `rounded-2xl border border-border bg-white p-4 shadow-sm` |
| Card featured | `rounded-2xl border-2 border-primary bg-white p-4 shadow-primary/10 shadow-md` |
| Título da vaga | `text-sm font-semibold text-gray-900` |
| Nome da empresa | `text-sm text-gray-500` |
| Badge destaque | `rounded-md bg-primary px-2 py-0.5 text-[10px] font-semibold text-white` |
| Badge urgente | `rounded-md bg-error/10 px-2 py-0.5 text-xs font-semibold text-error` |
| Distância | `text-xs text-gray-400` |
| Salário | `text-sm font-semibold text-primary` |

### Bottom Navigation

| Elemento | Classes |
| :--- | :--- |
| Container | `fixed bottom-0 left-0 right-0 border-t border-border bg-white` |
| Tab ativo | `text-primary font-semibold` |
| Tab inativo | `text-gray-400` |

### Filtros

| Elemento | Classes |
| :--- | :--- |
| Pill ativo | `rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white` |
| Pill inativo | `rounded-lg bg-surface px-3 py-1.5 text-xs font-medium text-gray-500` |

### Auth (Login/Cadastro)

| Elemento | Classes |
| :--- | :--- |
| Fundo | `flex min-h-screen items-center justify-center bg-linear-to-br from-primary/10 via-white to-surface px-4 py-10` |
| Card | `overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-border` |
| Padding | `px-8 py-8` |
| Título | `font-display text-2xl font-bold text-gray-900` |
| Form | `flex flex-col gap-4` |
| Erro inline | `rounded-lg bg-error/10 px-4 py-2 text-sm text-error` |
| Link | `font-medium text-primary hover:text-primary-dark` |

### CTA do Empregador

| Elemento | Classes |
| :--- | :--- |
| Container | `bg-linear-to-br from-gray-900 to-gray-800 rounded-2xl p-6` |
| Título | `text-lg font-bold text-white` |
| Descrição | `text-sm text-white/60` |
| Botão | `bg-primary text-white rounded-xl px-5 py-3 text-sm font-semibold` |

---

## Padrões de Classes

- Ordem: layout → spacing → sizing → typography → colors → effects → states
- Exemplo: `flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-xl shadow-sm hover:bg-primary-dark`
- Use `cn()` para merge condicional de classes
- Extraia classes repetitivas para componentes React, não para `@apply`
- `border-radius` padrão do projeto: `rounded-xl` (botões, inputs) e `rounded-2xl` (cards)

## Utilitário cn()

```ts
// src/lib/utils/cn.utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))
```