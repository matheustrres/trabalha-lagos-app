# Component Patterns

## Button (`src/components/ui/Button/index.tsx`)

```tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const VARIANT_STYLES: Record<string, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
  secondary:
    'border border-gray-200 text-gray-600 hover:bg-gray-50 focus:ring-gray-400',
  danger: 'bg-error text-white hover:bg-error/90 focus:ring-error',
  ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-400',
}

const SIZE_STYLES: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(
        'rounded-lg font-semibold shadow-sm transition-colors',
        'focus:ring-2 focus:ring-offset-1 focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        className,
      )}
      {...rest}
    />
  ),
)
Button.displayName = 'Button'
```

## Input (`src/components/ui/Input/index.tsx`)

Usa `forwardRef` — obrigatório para `register()` do react-hook-form.

```tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className, ...rest }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          'rounded-lg border px-3 py-2.5 text-sm shadow-sm transition-colors',
          'focus:ring-2 focus:ring-offset-1 focus:outline-none',
          error
            ? 'border-error focus:ring-error'
            : 'focus:ring-primary border-gray-300',
          className,
        )}
        {...rest}
      />
      {error && (
        <p role="alert" className="text-error text-sm">
          {error}
        </p>
      )}
    </div>
  ),
)
Input.displayName = 'Input'
```

---

## Form com react-hook-form + zod

### Schema (`src/lib/validations/auth.ts`)

```ts
import { z } from 'zod'
import { tZod } from '@/lib/utils/i18nZod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, tZod('common.validation.required'))
    .email(tZod('common.validation.invalidEmail')),
  password: z.string().min(8, tZod('common.validation.minLength', { min: 8 })),
  rememberMe: z.boolean().optional(),
})

export const registerSchema = z
  .object({
    name: z.string().min(1, tZod('common.validation.required')),
    email: z.string().email(tZod('common.validation.invalidEmail')),
    password: z
      .string()
      .min(8, tZod('common.validation.minLength', { min: 8 })),
    confirmPassword: z.string().min(1, tZod('common.validation.required')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: tZod('common.validation.passwordsMismatch'),
    path: ['confirmPassword'],
  })

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
```

### Componente (`src/components/Auth/LoginForm.tsx`)

```tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from '@tanstack/react-router'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'

export const LoginForm = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null)
    try {
      // await authService.login(data);
      navigate({ to: '/' })
    } catch {
      setServerError(t('login.errors.invalidCredentials'))
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <Input
        id="login-email"
        label={t('common.email')}
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        id="login-password"
        label={t('common.password')}
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />

      {serverError && (
        <p
          role="alert"
          className="bg-error/10 text-error rounded-lg px-4 py-2 text-sm"
        >
          {serverError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {t('login.submit')}
      </Button>

      <p className="text-center text-sm text-gray-500">
        {t('login.noAccount')}{' '}
        <Link
          to="/register"
          className="text-primary hover:text-primary-dark font-medium"
        >
          {t('login.createAccount')}
        </Link>
      </p>
    </form>
  )
}
```

---

## Skeleton Loading (`src/components/skeletons/`)

```tsx
// src/components/skeletons/TableSkeleton.tsx
interface TableSkeletonProps {
  rows?: number
}

export const TableSkeleton = ({ rows = 5 }: TableSkeletonProps) => (
  <div className="animate-pulse space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-12 rounded bg-gray-200" />
    ))}
  </div>
)
```

## Tabela com Loading State

```tsx
import { useTranslation } from 'react-i18next'
import { TableSkeleton } from '@/components/skeletons/TableSkeleton'

interface DataTableProps<T> {
  data: T[]
  isLoading: boolean
  columns: { key: keyof T; label: string }[]
  onRowClick?: (item: T) => void
  emptyMessage?: string
}

export const DataTable = <T extends { id: string }>({
  data,
  isLoading,
  columns,
  onRowClick,
  emptyMessage,
}: DataTableProps<T>) => {
  const { t } = useTranslation()

  if (isLoading) return <TableSkeleton />

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-gray-500">
        {emptyMessage || t('common.noData')}
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((item) => (
            <tr
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={
                onRowClick
                  ? 'cursor-pointer transition-colors hover:bg-gray-50'
                  : ''
              }
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className="px-4 py-3 text-sm whitespace-nowrap text-gray-900"
                >
                  {String(item[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

## Custom Hook (`src/hooks/useCountdown.ts`)

```tsx
import { useState, useEffect, useCallback } from 'react'

interface UseCountdownOptions {
  initialSeconds: number
  onComplete?: () => void
}

export const useCountdown = ({
  initialSeconds,
  onComplete,
}: UseCountdownOptions) => {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)

  const start = useCallback(() => {
    setSeconds(initialSeconds)
    setIsRunning(true)
  }, [initialSeconds])

  const stop = useCallback(() => {
    setIsRunning(false)
  }, [])

  useEffect(() => {
    if (!isRunning || seconds <= 0) return

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false)
          onComplete?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning, seconds, onComplete])

  return { seconds, isRunning, start, stop }
}
```

---

## i18n — Estrutura de Traduções

```
src/locales/
└── pt/
    └── translation.json
```

**Estrutura de chaves:**

```json
{
  "common": {
    "email": "E-mail",
    "password": "Senha",
    "validation": {
      "required": "Campo obrigatório",
      "invalidEmail": "E-mail inválido",
      "minLength": "Mínimo {{min}} caracteres"
    }
  },
  "login": {
    "title": "Bem-vindo!",
    "submit": "Entrar",
    "noAccount": "Não tem conta?",
    "createAccount": "Criar conta"
  },
  "register": {
    "steps": {
      "profile": { "title": "Perfil", "description": "..." }
    }
  }
}
```

**Uso:**

```tsx
import { useTranslation } from 'react-i18next'

const { t } = useTranslation()

// Simples
t('common.email') // "E-mail"

// Com interpolação
t('common.validation.minLength', { min: 8 }) // "Mínimo 8 caracteres"
```

**Helper para Zod (`src/lib/utils/i18nZod.ts`):**

```ts
import i18n from '@/i18n'

export const tZod = (key: string, params?: Record<string, unknown>) => {
  return i18n.t(key, params)
}
```

Toda string visível ao usuário DEVE usar `t('namespace.key')`.
