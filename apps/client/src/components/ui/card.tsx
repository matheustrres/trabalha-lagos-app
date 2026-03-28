import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn.utils'

interface CardProps {
  className?: string
  children: ReactNode
}

export const Card = ({ className, children }: CardProps) => (
  <div className={cn('rounded-2xl border border-border bg-white p-4 shadow-sm', className)}>
    {children}
  </div>
)
