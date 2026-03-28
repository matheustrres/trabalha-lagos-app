# Tailwind CSS v4 Patterns

## Setup (Vite + Nx)

```bash
pnpm add tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'

export default defineConfig({
  plugins: [tanstackStart(), react(), tailwindcss()],
  resolve: {
    alias: { '@': '/src' },
  },
})
```

```css
/* src/styles.css */
@import 'tailwindcss';

@theme {
  /* Paleta do projeto Formula Animal */
  --color-primary: #7566a0;
  --color-primary-dark: #5a4d7a;
  --color-secondary: #f9cdea;
  --color-accent: #ffc15e;

  /* Feedback */
  --color-error: #e36c57;
  --color-success: #49c68a;
  --color-warning: #ed9d45;
  --color-info: #3da1e7;

  /* Superfície */
  --color-surface: #f8fafc;
  --color-border: #e2e8f0;

  --font-sans: 'Roboto', system-ui, sans-serif;
}
```

---

## Tailwind v4 vs v3 — Classes Renomeadas

O Tailwind CSS v4 renomeou várias classes utilitárias. **Sempre use a versão v4.**

| Tailwind v3 (obsoleta) | Tailwind v4 (correta)  | Notas                          |
| :--------------------- | :--------------------- | :----------------------------- |
| `bg-gradient-to-br`    | `bg-linear-to-br`      | Prefixo `gradient` → `linear`  |
| `bg-gradient-to-r`     | `bg-linear-to-r`       | Idem para todas as direções    |
| `bg-gradient-to-t`     | `bg-linear-to-t`       | Idem                           |
| `bg-gradient-to-b`     | `bg-linear-to-b`       | Idem                           |
| `bg-gradient-to-l`     | `bg-linear-to-l`       | Idem                           |
| `bg-gradient-to-tr`    | `bg-linear-to-tr`      | Idem                           |
| `bg-gradient-to-tl`    | `bg-linear-to-tl`      | Idem                           |
| `bg-gradient-to-bl`    | `bg-linear-to-bl`      | Idem                           |
| `flex-shrink-0`        | `shrink-0`             | Prefixo `flex-` removido       |
| `flex-shrink`          | `shrink`               | Idem                           |
| `flex-grow-0`          | `grow-0`               | Prefixo `flex-` removido       |
| `flex-grow`            | `grow`                 | Idem                           |
| `break-words`          | `wrap-break-word`      | Alinhado com CSS property name |
| `overflow-ellipsis`    | `text-ellipsis`        | Renomeado para clareza         |
| `decoration-clone`     | `box-decoration-clone` | Prefixo `box-` adicionado      |
| `decoration-slice`     | `box-decoration-slice` | Idem                           |

**Regra:** se encontrar qualquer classe da coluna esquerda no código existente, substitua
pela versão da coluna direita.

---

## Responsividade

Mobile-first. Breakpoints Tailwind v4 padrão:

| Breakpoint | Min-width | Uso              |
| :--------- | :-------- | :--------------- |
| `sm`       | 640px     | Mobile landscape |
| `md`       | 768px     | Tablet           |
| `lg`       | 1024px    | Desktop          |
| `xl`       | 1280px    | Desktop wide     |

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {tasks.map((task) => (
    <TaskCard key={task.id} {...task} />
  ))}
</div>
```

---

## Classes de Referência — Card de Autenticação

Tabela de referência para manter consistência visual nas páginas de login e registro.
Para implementação completa do form, veja [component-patterns.md](component-patterns.md).

| Elemento              | Classes                                                                                                              |
| :-------------------- | :------------------------------------------------------------------------------------------------------------------- |
| Fundo (no AuthLayout) | `flex min-h-screen items-center justify-center bg-linear-to-br from-primary/10 via-white to-secondary/10 px-4 py-10` |
| Wrapper de largura    | `w-full max-w-md`                                                                                                    |
| Card                  | `overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-100`                                                |
| Padding interno       | `px-8 py-8`                                                                                                          |
| Título do app         | `text-3xl font-extrabold tracking-tight text-gray-900`                                                               |
| Subtítulo             | `mt-1 text-sm text-gray-500`                                                                                         |
| Form                  | `flex flex-col gap-4`                                                                                                |
| Erro inline           | `rounded-lg bg-error/10 px-4 py-2 text-sm text-error`                                                                |
| Link primário         | `font-medium text-primary hover:text-primary-dark`                                                                   |

---

## Componentes Utilitários Comuns

### Badge de Status (usando cores do tema)

```tsx
const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-warning/20 text-warning',
  completed: 'bg-success/20 text-success',
  error: 'bg-error/20 text-error',
  info: 'bg-info/20 text-info',
}

const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-800'}`}
  >
    {status}
  </span>
)
```

### Layout de Página Padrão

```tsx
interface PageLayoutProps {
  title: string
  actions?: React.ReactNode
  children: React.ReactNode
}

const PageLayout = ({ title, actions, children }: PageLayoutProps) => (
  <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
    {children}
  </div>
)
```

### Modal (`src/components/ui/Modal/`)

O projeto já possui um componente Modal em `src/components/ui/Modal/`.

```tsx
import { Modal } from '@/components/ui/Modal'

// Uso
;<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title={t('modal.title')}
>
  <p>{t('modal.content')}</p>
</Modal>
```

---

## Padrões de Classes

- Ordem: layout → spacing → sizing → typography → colors → effects → states
- Exemplo: `flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md shadow-sm hover:bg-primary-dark focus:ring-2`
- Use `cn()` de `@/lib/utils/cn` para merge condicional de classes
- Extraia classes repetitivas para componentes React, não para `@apply`
- Use `@apply` apenas em `styles.css` para reset global ou base typography

## Utilitário cn()

```ts
// src/lib/utils/cn.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))
```

```tsx
// Uso
import { cn } from '@/lib/utils/cn'
;<div
  className={cn(
    'rounded-lg p-4',
    isActive && 'bg-primary text-white',
    className,
  )}
/>
```
