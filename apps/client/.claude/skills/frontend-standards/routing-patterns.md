# Routing Patterns — Next.js App Router

Referência: https://nextjs.org/docs/app/building-your-application/routing

O projeto usa Next.js 15 com **App Router** (file-based routing em `src/app/`).

---

## Estrutura de Rotas

```
src/app/
├── layout.tsx                    # Root layout (providers, fonts, metadata)
├── page.tsx                      # / — Home
├── not-found.tsx                 # 404
├── vagas/
│   ├── page.tsx                  # /vagas — busca com filtros
│   ├── [cidade]/
│   │   ├── page.tsx              # /vagas/cabo-frio (SSG + ISR)
│   │   └── [categoria]/
│   │       └── page.tsx          # /vagas/cabo-frio/turismo
│   └── components/               # Colocated com a rota
├── vaga/
│   └── [slug]/
│       └── page.tsx              # /vaga/garcom-restaurante-mar-aberto (SSR)
├── empresas/
│   └── page.tsx                  # /empresas — diretório
├── empresa/
│   └── [slug]/
│       └── page.tsx              # /empresa/restaurante-mar-aberto
├── (auth)/
│   ├── layout.tsx                # Auth layout (centralizado, fundo decorativo)
│   ├── login/page.tsx
│   └── cadastro/page.tsx
├── painel/
│   ├── layout.tsx                # Painel layout (sidebar + auth guard)
│   ├── page.tsx                  # /painel — dashboard
│   ├── vagas/page.tsx            # /painel/vagas
│   ├── nova-vaga/page.tsx        # /painel/nova-vaga
│   └── interesses/page.tsx       # /painel/interesses
├── sitemap.ts                    # Sitemap dinâmico
└── robots.ts                     # Robots.txt
```

### Convenções App Router

| Arquivo | Função |
| :--- | :--- |
| `layout.tsx` | Layout compartilhado (persiste entre navegações) |
| `page.tsx` | UI da rota (o que o usuário vê) |
| `loading.tsx` | Loading UI automático (Suspense boundary) |
| `error.tsx` | Error boundary da rota |
| `not-found.tsx` | 404 da rota |

| Padrão de pasta | Significado |
| :--- | :--- |
| `[param]/` | Dynamic segment → `/vaga/[slug]` |
| `(group)/` | Route group (agrupamento sem afetar URL) |
| pasta sem `page.tsx` | Não gera rota (só organização) |

---

## Root Layout (`src/app/layout.tsx`)

```tsx
import type { Metadata } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import '@/styles/globals.css'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-display' })

export const metadata: Metadata = {
  title: {
    default: 'TrabalhaLagos — Vagas de emprego na Região dos Lagos',
    template: '%s — TrabalhaLagos',
  },
  description: 'Encontre trabalho perto de você na Região dos Lagos. Vagas CLT, PJ, freelancer e temporário em Cabo Frio, Búzios, Arraial do Cabo e região.',
  metadataBase: new URL('https://trabalhalagos.com.br'),
}

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="pt-BR" className={`${dmSans.variable} ${playfair.variable}`}>
    <body className="font-sans bg-surface text-gray-900 antialiased">
      {children}
    </body>
  </html>
)

export default RootLayout
```

---

## Landing Page por Cidade — SSG + ISR (`src/app/vagas/[cidade]/page.tsx`)

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LAGOS_CITIES } from '@/lib/constants/cities.constants'

interface Props {
  params: Promise<{ cidade: string }>
}

// Gerar páginas estáticas para todas as cidades
export const generateStaticParams = () =>
  LAGOS_CITIES.map((city) => ({ cidade: city.slug }))

// Revalidar a cada 10 minutos
export const revalidate = 600

// Metadata dinâmica para SEO
export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { cidade } = await params
  const city = LAGOS_CITIES.find((c) => c.slug === cidade)
  if (!city) return {}

  return {
    title: `Vagas em ${city.name}`,
    description: `Vagas de emprego em ${city.name}, Região dos Lagos. CLT, PJ, freelancer e temporário.`,
    openGraph: {
      title: `Vagas em ${city.name} — TrabalhaLagos`,
      url: `https://trabalhalagos.com.br/vagas/${cidade}`,
    },
  }
}

const CityJobsPage = async ({ params }: Props) => {
  const { cidade } = await params
  const city = LAGOS_CITIES.find((c) => c.slug === cidade)
  if (!city) notFound()

  // Fetch vagas no servidor
  const jobs = await fetch(`${process.env.API_URL}/api/v1/jobs?city=${cidade}`, {
    next: { revalidate: 600 },
  }).then((r) => r.json())

  return (
    <>
      <h1 className="font-display text-3xl font-bold">
        Vagas em {city.name}
      </h1>
      {/* Client Component com filtros interativos */}
      {/* <JobList initialJobs={jobs} city={city} /> */}
    </>
  )
}

export default CityJobsPage
```

---

## Auth Layout (`src/app/(auth)/layout.tsx`)

```tsx
const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-primary/10 via-white to-surface px-4 py-10">
    <div className="w-full max-w-md">
      {children}
    </div>
  </div>
)

export default AuthLayout
```

---

## Painel do Empregador — Layout Protegido (`src/app/painel/layout.tsx`)

```tsx
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

const PainelLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getSession()
  if (!session || session.role !== 'EMPLOYER') redirect('/login')

  return (
    <div className="flex min-h-screen">
      {/* <Sidebar /> */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}

export default PainelLayout
```

---

## Navegação

### Declarativa (`Link`)

```tsx
import Link from 'next/link'

// Link simples
<Link href="/vagas/cabo-frio" className="text-primary hover:text-primary-dark">
  Vagas em Cabo Frio
</Link>

// Link para vaga específica
<Link href={`/vaga/${job.slug}`}>
  {job.title}
</Link>
```

### Programática (`useRouter`)

```tsx
'use client'

import { useRouter } from 'next/navigation'

const router = useRouter()

// Após demonstrar interesse
const handleSuccess = () => {
  router.push('/vagas')
}

// Sem adicionar ao histórico
router.replace('/painel')
```

### Compartilhamento WhatsApp

```tsx
// Gerar link de compartilhamento
const shareUrl = `https://wa.me/?text=${encodeURIComponent(
  `Vaga: ${job.title} em ${job.city} — ${window.location.href}`
)}`

<a href={shareUrl} target="_blank" rel="noopener noreferrer">
  <Button variant="whatsapp">Compartilhar</Button>
</a>
```

---

## Sitemap Dinâmico (`src/app/sitemap.ts`)

```tsx
import type { MetadataRoute } from 'next'
import { LAGOS_CITIES } from '@/lib/constants/cities.constants'

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  // Landing pages por cidade (estáticas)
  const cityPages = LAGOS_CITIES.map((city) => ({
    url: `https://trabalhalagos.com.br/vagas/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // Vagas ativas (dinâmicas)
  const jobs = await fetch(`${process.env.API_URL}/api/v1/jobs?status=ACTIVE`)
    .then((r) => r.json())

  const jobPages = jobs.map((job: { slug: string; updatedAt: string }) => ({
    url: `https://trabalhalagos.com.br/vaga/${job.slug}`,
    lastModified: new Date(job.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [
    { url: 'https://trabalhalagos.com.br', lastModified: new Date(), priority: 1 },
    ...cityPages,
    ...jobPages,
  ]
}

export default sitemap
```

---

## Regras Importantes

- **Server Components por default** — não adicionar `'use client'` sem necessidade
- Use `generateStaticParams` + `revalidate` para SSG com ISR nas landing pages
- Use `generateMetadata` para SEO dinâmico em cada página
- Layouts persistem entre navegações — não refetch dados desnecessariamente
- Fetch de dados no servidor quando possível (menos JavaScript no client)
- `loading.tsx` para loading states automáticos