import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { buttonVariants } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { useLocaleStore } from '@/stores'

export function NotFoundPage() {
  const t = useLocaleStore((s) => s.dictionary)

  return (
    <EmptyState
      icon={Compass}
      title={t.notFound.title}
      description={t.notFound.description}
      action={
        <Link to="/" className={cn(buttonVariants({ variant: 'outline' }))}>
          {t.common.backToTodaysWord}
        </Link>
      }
    />
  )
}
