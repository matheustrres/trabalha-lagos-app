import { cn } from '@/lib/utils/cn.utils'

interface BadgeProps {
  label: string
  color: string
  className?: string
}

export const Badge = ({ label, color, className }: BadgeProps) => (
  <span
    className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', className)}
    style={{ backgroundColor: `${color}18`, color }}
  >
    {label}
  </span>
)

export const CONTRACT_BADGE: Record<string, { label: string; color: string }> = {
  CLT: { label: 'CLT', color: '#0ea5e9' },
  PJ: { label: 'PJ', color: '#8b5cf6' },
  Freelancer: { label: 'Freelancer', color: '#f59e0b' },
  Temporário: { label: 'Temporário', color: '#ef4444' },
  Estágio: { label: 'Estágio', color: '#10b981' },
}
