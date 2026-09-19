import type { Metadata } from 'next'
import { CloudOff, Wifi } from 'lucide-react'
import { RetryButton } from './retry-button'

export const metadata: Metadata = {
  title: 'Sem conexão',
  description: 'O TrabalhaLagos está temporariamente sem conexão.',
  robots: { index: false, follow: false },
}

const OfflinePage = () => (
  <section className="flex min-h-[calc(100dvh-9rem)] flex-col items-center justify-center px-6 py-12 text-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
      <CloudOff size={30} aria-hidden />
    </div>
    <h1 className="mt-6 font-display text-3xl font-bold text-gray-900">
      Você está sem conexão
    </h1>
    <p className="mt-3 max-w-sm text-base leading-6 text-gray-600">
      As páginas públicas que você já visitou continuam disponíveis. Para uma
      nova busca, conecte-se à internet e tente novamente.
    </p>
    <div className="mt-6">
      <RetryButton />
    </div>
    <div className="mt-10 flex max-w-sm items-start gap-3 rounded-2xl bg-surface p-4 text-left text-sm leading-5 text-gray-600">
      <Wifi size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden />
      <p>Login, perfil e painel do empregador sempre precisam de conexão.</p>
    </div>
  </section>
)

export default OfflinePage
