import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  /** Optional right-aligned slot, e.g. an action Button. */
  action?: ReactNode
  className?: string
}

function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <header className={cn('mb-8 flex items-start justify-between gap-4', className)}>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-base text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}

export { PageHeader, type PageHeaderProps }
