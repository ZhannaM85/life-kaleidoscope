import { PlaceholderPage } from '@/shared/ui/PlaceholderPage'
import { useLocaleStore } from '@/stores'

export function GraphPage() {
  const t = useLocaleStore((s) => s.dictionary)
  return <PlaceholderPage title={t.graphPage.title} description={t.placeholder.comingSoon} />
}
