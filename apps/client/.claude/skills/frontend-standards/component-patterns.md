# Component Patterns — TrabalhaLagos

## Button (`src/components/ui/button.tsx`)

Inclui variante `whatsapp` específica do produto.

```tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils/cn.utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'whatsapp'
  size?: 'sm' | 'md' | 'lg'
}

const VARIANT_STYLES: Record<string, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
  secondary: 'border border-border text-gray-600 hover:bg-gray-50 focus:ring-gray-400',
  danger: 'bg-error text-white hover:bg-error/90 focus:ring-error',
  ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-400',
  whatsapp: 'bg-[#25D366] text-white hover:bg-[#20BD5A] focus:ring-[#25D366]',
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
        'rounded-xl font-semibold shadow-sm transition-colors',
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

---

## Input (`src/components/ui/input.tsx`)

`forwardRef` obrigatório — necessário para `register()` do react-hook-form.

```tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils/cn.utils'

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
          'rounded-xl border px-3 py-2.5 text-sm shadow-sm transition-colors',
          'focus:ring-2 focus:ring-offset-1 focus:outline-none',
          error
            ? 'border-error focus:ring-error'
            : 'border-border focus:ring-primary',
          className,
        )}
        {...rest}
      />
      {error && (
        <p role="alert" className="text-error text-sm">{error}</p>
      )}
    </div>
  ),
)
Input.displayName = 'Input'
```

---

## Badge (`src/components/ui/badge.tsx`)

Usado para tags de tipo de contrato nas vagas.

```tsx
import { cn } from '@/lib/utils/cn.utils'

interface BadgeProps {
  label: string
  color: string
  className?: string
}

export const Badge = ({ label, color, className }: BadgeProps) => (
  <span className={cn(
    'inline-flex rounded-md px-2 py-0.5 text-xs font-semibold',
    className,
  )} style={{ background: `${color}18`, color }}>
    {label}
  </span>
)

// Uso com contract types
const CONTRACT_BADGE: Record<string, { label: string; color: string }> = {
  CLT: { label: 'CLT', color: '#0ea5e9' },
  PJ: { label: 'PJ', color: '#8b5cf6' },
  FREELANCER: { label: 'Freelancer', color: '#f59e0b' },
  TEMPORARY: { label: 'Temporário', color: '#ef4444' },
  INTERNSHIP: { label: 'Estágio', color: '#10b981' },
}
```

---

## Form com react-hook-form + zod

### Schema (colocated com a rota)

```ts
// app/vaga/[slug]/schemas/create-interest.schema.ts
import { z } from 'zod'

export const createInterestSchema = z.object({
  name: z.string().min(1, 'Campo obrigatório'),
  phone: z.string().min(10, 'WhatsApp inválido'),
  city: z.string().min(1, 'Selecione uma cidade'),
})

export type CreateInterestData = z.infer<typeof createInterestSchema>
```

### Componente (Client Component)

```tsx
// app/vaga/[slug]/components/interest-form.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createInterestSchema, type CreateInterestData } from '../schemas/create-interest.schema'

interface InterestFormProps {
  jobId: string
  companyName: string
  onSuccess: () => void
}

export const InterestForm = ({ jobId, companyName, onSuccess }: InterestFormProps) => {
  const { t } = useTranslation()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateInterestData>({
    resolver: zodResolver(createInterestSchema),
  })

  const onSubmit = async (data: CreateInterestData) => {
    setServerError(null)
    try {
      await fetch(`/api/jobs/${jobId}/interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      onSuccess()
    } catch {
      setServerError(t('interest.errors.generic'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <p className="text-sm text-gray-500">
        {t('interest.description', { company: companyName })}
      </p>

      <Input
        id="interest-name"
        label={t('common.fullName')}
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        id="interest-phone"
        label={t('common.whatsapp')}
        placeholder="(22) 99999-9999"
        error={errors.phone?.message}
        {...register('phone')}
      />

      {serverError && (
        <p role="alert" className="rounded-lg bg-error/10 px-4 py-2 text-sm text-error">
          {serverError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {t('interest.submit')}
      </Button>
    </form>
  )
}
```

---

## Skeleton Loading

```tsx
// src/components/skeletons/job-card-skeleton.tsx
export const JobCardSkeleton = () => (
  <div className="animate-pulse rounded-2xl border border-border bg-white p-4">
    <div className="flex gap-3">
      <div className="h-11 w-11 shrink-0 rounded-xl bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-3 w-1/2 rounded bg-gray-200" />
        <div className="h-3 w-1/3 rounded bg-gray-200" />
      </div>
    </div>
  </div>
)

export const JobListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <JobCardSkeleton key={i} />
    ))}
  </div>
)
```

---

## Custom Hook — Geolocalização

```tsx
// src/hooks/use-geolocation.hook.ts
'use client'

import { useState, useCallback } from 'react'
import { LAGOS_CITIES } from '@/lib/constants/cities.constants'

interface GeoPosition {
  lat: number
  lng: number
  source: 'browser' | 'manual' | 'default'
}

export const useGeolocation = () => {
  const defaultCity = LAGOS_CITIES.find((c) => c.slug === 'sao-pedro-da-aldeia')!
  const [position, setPosition] = useState<GeoPosition>({
    lat: defaultCity.lat,
    lng: defaultCity.lng,
    source: 'default',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestBrowserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada')
      return
    }
    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude, source: 'browser' })
        setIsLoading(false)
      },
      () => {
        setError('Permissão negada')
        setIsLoading(false)
      },
    )
  }, [])

  const setManualCity = useCallback((slug: string) => {
    const city = LAGOS_CITIES.find((c) => c.slug === slug)
    if (city) setPosition({ lat: city.lat, lng: city.lng, source: 'manual' })
  }, [])

  return { position, isLoading, error, requestBrowserLocation, setManualCity }
}
```

---

## i18n — Estrutura de Traduções

```json
{
  "common": {
    "fullName": "Nome completo",
    "whatsapp": "WhatsApp",
    "search": "Buscar",
    "noResults": "Nenhum resultado encontrado",
    "shareOnWhatsapp": "Compartilhar no WhatsApp",
    "allCities": "Toda a Região dos Lagos"
  },
  "home": {
    "hero": {
      "title": "Encontre trabalho perto de você",
      "subtitle": "Vagas na Região dos Lagos — de bico a CLT, tudo em um lugar só."
    }
  },
  "jobs": {
    "radius": "Raio",
    "filters": "Filtros",
    "found": "{{count}} vagas encontradas",
    "featured": "Em destaque",
    "urgent": "Contratação Imediata",
    "salary": { "negotiable": "A combinar" }
  },
  "interest": {
    "title": "Demonstrar interesse",
    "description": "Seus dados serão enviados para {{company}}",
    "submit": "Enviar interesse",
    "sent": "Interesse enviado"
  }
}
```

Toda string visível DEVE usar `t('namespace.key')`.