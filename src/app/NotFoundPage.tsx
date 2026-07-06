import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { buttonVariants } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'

export function NotFoundPage() {
  return (
    <EmptyState
      icon={Compass}
      title="There's no page here"
      description="The address may be mistyped, or it may point to a page that doesn't exist yet."
      action={
        <Link to="/" className={cn(buttonVariants({ variant: 'outline' }))}>
          Back to today's word
        </Link>
      }
    />
  )
}
