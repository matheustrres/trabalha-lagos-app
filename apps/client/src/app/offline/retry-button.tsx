'use client'

import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const RetryButton = () => (
  <Button type="button" size="lg" onClick={() => window.location.reload()}>
    <RefreshCw size={18} aria-hidden />
    Tentar novamente
  </Button>
)
