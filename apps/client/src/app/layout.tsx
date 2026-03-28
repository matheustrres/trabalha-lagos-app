import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'TrabalhaLagos',
  description: 'Plataforma de vagas de emprego na Região dos Lagos, RJ',
}

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <html lang="pt-BR">
    <body>{children}</body>
  </html>
)

export default RootLayout
