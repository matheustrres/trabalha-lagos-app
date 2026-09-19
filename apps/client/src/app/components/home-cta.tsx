'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth.hook'

interface HomeCtaContent {
  title: string
  description: string
  action: string
  href: string
}

const GUEST_CONTENT: HomeCtaContent = {
  title: 'Precisa contratar?',
  description:
    'Publique vagas gratuitamente e encontre candidatos na Região dos Lagos.',
  action: 'Publicar vaga grátis',
  href: '/cadastro',
}

const CANDIDATE_CONTENT: HomeCtaContent = {
  title: 'Destaque-se nas próximas vagas',
  description:
    'Mantenha sua cidade e WhatsApp atualizados para que as empresas consigam falar com você.',
  action: 'Revisar meu perfil',
  href: '/perfil',
}

const EMPLOYER_CONTENT: HomeCtaContent = {
  title: 'Encontre a pessoa certa',
  description:
    'Publique uma nova vaga e encontre candidatos na Região dos Lagos.',
  action: 'Publicar nova vaga',
  href: '/painel/nova-vaga',
}

const HomeCtaSkeleton = () => (
  <section
    aria-label="Carregando recomendação"
    aria-busy="true"
    className="min-h-44 overflow-hidden rounded-2xl bg-linear-to-br from-gray-900 to-gray-800 p-6"
  >
    <Skeleton className="h-6 w-56 bg-white/15" />
    <div className="mt-2 space-y-2">
      <Skeleton className="h-4 w-full bg-white/10" />
      <Skeleton className="h-4 w-4/5 bg-white/10" />
    </div>
    <Skeleton className="mt-4 h-10 w-44 rounded-xl bg-white/15" />
  </section>
)

export const HomeCta = () => {
  const { session, isLoading } = useAuth()

  if (isLoading) return <HomeCtaSkeleton />

  const content =
    session?.user.role === 'CANDIDATE'
      ? CANDIDATE_CONTENT
      : session?.user.role === 'EMPLOYER'
        ? EMPLOYER_CONTENT
        : GUEST_CONTENT

  return (
    <section className="relative min-h-44 overflow-hidden rounded-2xl bg-linear-to-br from-gray-900 to-gray-800 p-6">
      <div
        aria-hidden
        className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/5"
      />

      <div className="relative">
        <h2 className="text-lg font-bold text-white">{content.title}</h2>
        <p className="mt-1.5 max-w-md text-sm text-white/70">
          {content.description}
        </p>
        <Link
          href={content.href}
          className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-dark focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:outline-none"
        >
          {content.action}
          <ArrowRight aria-hidden size={16} />
        </Link>
      </div>
    </section>
  )
}
