# Routing Patterns (TanStack Router — File-based)

Referência: https://tanstack.com/router/latest/docs/framework/react/overview

O projeto usa TanStack Router v1 com **file-based routing**. Arquivos em `src/routes/` geram rotas automaticamente via plugin Vite.

---

## Estrutura de Rotas

```
src/routes/
├── __root.tsx              # Root layout (obrigatório)
├── _app.tsx                # Layout protegido (aplicação)
│   └── index.tsx           # Home/Dashboard (/)
└── (auth)/                 # Route group (autenticação)
    ├── route.tsx           # Auth layout
    ├── login.tsx           # /login
    ├── register.tsx        # /register
    ├── forgot-password.tsx # /forgot-password
    └── reset-password.tsx  # /reset-password
```

### Convenções de Nomenclatura

| Prefixo/Padrão | Significado                     | Exemplo                                      |
| :------------- | :------------------------------ | :------------------------------------------- |
| `__root.tsx`   | Layout raiz da aplicação        | Obrigatório, único                           |
| `_nome.tsx`    | Layout route (sem segmento URL) | `_app.tsx` → layout sem `/app` na URL        |
| `(nome)/`      | Route group (agrupamento)       | `(auth)/` → agrupa sem afetar URL            |
| `index.tsx`    | Index route                     | Renderiza na URL do pai                      |
| `route.tsx`    | Layout de route group           | `(auth)/route.tsx`                           |
| `$param.tsx`   | Dynamic segment                 | `$employeeId.tsx` → `/employees/:employeeId` |

---

## Root Layout (`src/routes/__root.tsx`)

```tsx
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <Outlet />
      {import.meta.env.DEV && (
        <TanStackRouterDevtools position="bottom-right" />
      )}
    </>
  )
}
```

---

## Layout Protegido (`src/routes/_app.tsx`)

```tsx
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export const Route = createFileRoute('/_app')({
  beforeLoad: async () => {
    // Verificar autenticação antes de carregar
    const isAuthenticated = /* verificar token */;
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

---

## Home/Dashboard (`src/routes/_app/index.tsx`)

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/components/dashboard/Dashboard'

export const Route = createFileRoute('/_app/')({
  component: Dashboard,
})
```

---

## Auth Layout (`src/routes/(auth)/route.tsx`)

```tsx
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(auth)')({
  beforeLoad: async () => {
    // Redirecionar se já autenticado
    const isAuthenticated = /* verificar token */;
    if (isAuthenticated) {
      throw redirect({ to: '/' });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-primary/10 via-white to-secondary/10 px-4 py-10">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}
```

---

## Página de Login (`src/routes/(auth)/login.tsx`)

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { LoginForm } from '@/components/Auth/LoginForm'

export const Route = createFileRoute('/(auth)/login')({
  component: LoginPage,
})

function LoginPage() {
  return <LoginForm />
}
```

---

## Router Setup (`src/router.tsx`)

```tsx
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function createTanStackRouter() {
  return createRouter({
    routeTree,
    defaultPreload: 'intent',
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createTanStackRouter>
  }
}
```

---

## Navegação

### Declarativa (`Link`)

```tsx
import { Link } from '@tanstack/react-router';

// Link simples
<Link to="/login" className="text-primary hover:text-primary-dark">
  {t('auth.login.title')}
</Link>

// Link com params
<Link to="/employees/$employeeId" params={{ employeeId: '123' }}>
  Ver detalhes
</Link>

// Link com activeProps
<Link
  to="/"
  activeProps={{ className: 'font-bold text-primary' }}
  inactiveProps={{ className: 'text-gray-600' }}
>
  Home
</Link>
```

### Programática (`useNavigate`)

```tsx
import { useNavigate } from '@tanstack/react-router'

const navigate = useNavigate()

// Após login bem-sucedido
const handleLogin = async (data: LoginFormData) => {
  await login(data)
  navigate({ to: '/' })
}

// Com replace (sem adicionar ao histórico)
navigate({ to: '/dashboard', replace: true })
```

### Query Params (`useSearch`)

```tsx
import { useSearch } from '@tanstack/react-router'

// Definir na rota
export const Route = createFileRoute('/employees')({
  validateSearch: (search) => ({
    status: (search.status as string) || 'all',
    page: Number(search.page) || 1,
  }),
  component: EmployeesPage,
})

// Usar no componente
function EmployeesPage() {
  const { status, page } = useSearch({ from: '/employees' })
  // ...
}
```

---

## Dynamic Segments

```tsx
// src/routes/_app/employees/$employeeId.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/employees/$employeeId')({
  component: EmployeeDetail,
})

function EmployeeDetail() {
  const { employeeId } = Route.useParams()
  // ...
}
```

---

## Adicionando Novas Rotas

### Rota protegida (dentro de `_app`)

1. Criar arquivo em `src/routes/_app/<nome>.tsx`
2. Exportar `Route` com `createFileRoute`
3. O arquivo `routeTree.gen.ts` será atualizado automaticamente

```tsx
// src/routes/_app/prescriptions.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/prescriptions')({
  component: PrescriptionsPage,
})

function PrescriptionsPage() {
  return <div>Prescrições</div>
}
```

### Rota pública (dentro de `(auth)`)

1. Criar arquivo em `src/routes/(auth)/<nome>.tsx`
2. Seguir mesmo padrão

---

## Regras Importantes

- **NUNCA editar** `routeTree.gen.ts` — arquivo auto-gerado pelo plugin
- Imports sempre de `@tanstack/react-router`
- Use `beforeLoad` para guards de autenticação
- Use `redirect` de `@tanstack/react-router` para redirecionamentos
- Componentes de rota devem ser functions (não arrow functions exportadas como default)
