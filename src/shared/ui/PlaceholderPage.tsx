import { EmptyState } from './empty-state'

interface PlaceholderPageProps {
  title: string
  description?: string
}

export function PlaceholderPage({
  title,
  description = 'Coming in a future epic.',
}: PlaceholderPageProps) {
  return <EmptyState title={title} description={description} className="py-24" />
}
