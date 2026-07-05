import type { ComponentType, ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface EmptyStateProps {
  icon?: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  title: string
  description?: string
  /** Optional call to action, e.g. a Button. */
  action?: ReactNode
  className?: string
}

/**
 * Calm empty screen — informative, never guilt-inducing (no streaks, no
 * "you haven't written in N days").
 */
function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3 px-6 py-16 text-center', className)}>
      {Icon && <Icon aria-hidden className="size-8 text-muted-foreground/60" />}
      <h2 className="text-lg font-medium text-foreground">{title}</h2>
      {description && <p className="max-w-sm text-base text-muted-foreground">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}

export { EmptyState, type EmptyStateProps }
